// Dynamic wireless charging on an electrified road (WPT-SIM-002).
//
// A vehicle drives over a line of embedded transmitter pads ("segments"). The
// receiver's mutual inductance with each segment follows from the same
// filament coupler model as the parking pad, tabulated against horizontal
// offset. Each segment is driven at a regulated RMS current when energised.
// A segment controller decides which segments to energise from an ESTIMATED
// vehicle position (delayed and noisy); an independent safety interlock lets a
// segment energise only when the vehicle body covers it, the vehicle is
// authorised and the segment and supply are healthy. The vehicle side picks
// its rectifier load to take the power it can use (traction plus what the
// battery accepts). Traction demand comes from the road-load model; the
// battery's energy changes by received power minus traction demand minus
// losses — so wireless charging does not always raise the SOC.
//
// Quasi-static FHA at each 1 ms step: the 85 kHz carrier is not simulated
// cycle by cycle. Validity check reported every step: the motional EMF
// v·dM/dx is negligible against the transformer EMF ωM.
import { DEFAULT_BATTERY, type BatteryParams, type BatteryState, chargeAcceptance, currentForPower, stepBattery } from "./battery";
import { DEFAULT_CHAIN } from "./chain";
import { DEFAULT_RX_PAD, DEFAULT_TX_PAD, mutualTable, type PadGeometry } from "./coils";
import { converterInput, converterLoss, inverterLoss, rectifierLoss, windingResistance } from "./losses";
import { clamp, createRng, interp1, type Rng } from "./math";
import { DEFAULT_VEHICLE, roadLoad, type VehicleParams } from "./vehicle";

export const DYNAMIC_MODEL_VERSION = "WPT-SIM-002 v1.0.0";

export type SpeedProfile = "constant" | "urban" | "stop-and-go" | "accelerate";
export type HandoverStrategy = "reactive" | "predictive" | "make-before-break";

export interface RoadInputs {
  /** Set speed, m/s. */
  speed: number;
  profile: SpeedProfile;
  mass: number;
  /** Road gradient, degrees (positive uphill). */
  gradeDeg: number;
  dragCoefficient: number;
  rollingResistance: number;
  /** Peak acceleration of the profile, m/s². */
  acceleration: number;
  /** Outer diameter of each road pad, m. */
  segmentDiameter: number;
  segmentTurns: number;
  /** Gap between neighbouring pads, m. */
  segmentSpacing: number;
  /** Fraction of the route that is electrified (in zones). */
  coverage: number;
  airGap: number;
  lateral: number;
  /** RMS current in an energised segment, A. */
  primaryCurrent: number;
  frequency: number;
  handover: HandoverStrategy;
  /** Delay from position measurement to segment switching, s. */
  controllerLatency: number;
  /** 1σ error of the position estimate, m. */
  positionNoise: number;
  capacityKWh: number;
  initialSoc: number;
  drivetrainEfficiency: number;
  /** Receiver-side power rating, W. */
  receiverRating: number;
  authorized: boolean;
  /** Index of a segment whose controller has failed, or -1. */
  failedSegment: number;
  /** The road's supply drops out for 2 s in every 10 s. */
  intermittentSupply: boolean;
}

export const DEFAULT_ROAD_INPUTS: RoadInputs = {
  speed: 22.2,
  profile: "constant",
  mass: 1950,
  gradeDeg: 0,
  dragCoefficient: 0.26,
  rollingResistance: 0.009,
  acceleration: 1.2,
  segmentDiameter: 0.8,
  segmentTurns: 10,
  segmentSpacing: 0.2,
  coverage: 0.6,
  airGap: 0.15,
  lateral: 0.05,
  primaryCurrent: 45,
  frequency: 85000,
  handover: "predictive",
  controllerLatency: 0.02,
  positionNoise: 0.03,
  capacityKWh: 60,
  initialSoc: 0.5,
  drivetrainEfficiency: 0.88,
  receiverRating: 30000,
  authorized: true,
  failedSegment: -1,
  intermittentSupply: false,
};

export const ROUTE_LENGTH = 1000;
/** Electrified zones repeat every this many metres; each is `coverage` of it long. */
export const ZONE_PERIOD = 200;

export type SegmentState = "off" | "on" | "blocked" | "failed";

export interface Segment {
  index: number;
  /** Centre position along the road, m. */
  x: number;
  state: SegmentState;
  /** Energisation level 0–1 (soft start and stop). */
  level: number;
  requested: boolean;
  /** Energy drawn from this segment's supply, J. */
  energy: number;
}

export interface RoadSample {
  t: number;
  x: number;
  v: number;
  pReceived: number;
  pTraction: number;
  pBattery: number;
  mTotal: number;
  k: number;
  soc: number;
  active: number;
}

export interface RoadState {
  t: number;
  x: number;
  v: number;
  a: number;
  battery: BatteryState;
  segments: Segment[];
  mTotal: number;
  kDynamic: number;
  pReceived: number;
  pTraction: number;
  pBattery: number;
  pDemand: number;
  pGrid: number;
  pTxLoss: number;
  rl: number;
  i2: number;
  /** Motional EMF over transformer EMF (validity of the quasi-static model). */
  motionalRatio: number;
  /** Cycle-averaged electromechanical force on the receiver, N (zero at resonance in FHA). */
  force: number;
  energy: {
    grid: number;
    segments: number;
    received: number;
    traction: number;
    battery: number;
    unmet: number;
    supplyLoss: number;
    padLoss: number;
    receiverLoss: number;
    idleEnergised: number;
  };
  counters: { handovers: number; blocked: number; exposure: number };
  samples: RoadSample[];
  lap: number;
}

export interface RoadSim {
  inputs: RoadInputs;
  state: RoadState;
  table: { offsets: number[]; M: number[]; L1: number; L2: number };
  key: string;
  rng: Rng;
  history: { t: number; x: number; v: number }[];
  vehicle: VehicleParams;
  battery: BatteryParams;
  tx: PadGeometry;
  rx: PadGeometry;
  r2: number;
  r1: number;
  sampleEvery: number;
  nextSample: number;
}

/** A road pad of the given diameter and turns, scaled from the parking ground pad. */
export function roadPad(diameter: number, turns: number): PadGeometry {
  const outer = diameter / 2;
  return { ...DEFAULT_TX_PAD, outerRadius: outer, innerRadius: Math.max(0.05, outer * 0.33), turns };
}

export function segmentPositions(inputs: Pick<RoadInputs, "segmentDiameter" | "segmentSpacing" | "coverage">): number[] {
  const pitch = inputs.segmentDiameter + inputs.segmentSpacing;
  const zone = clamp(inputs.coverage, 0, 1) * ZONE_PERIOD;
  const out: number[] = [];
  for (let start = 40; start < ROUTE_LENGTH; start += ZONE_PERIOD) {
    for (let x = start + pitch / 2; x <= start + zone - pitch / 2 + 1e-6; x += pitch) out.push(x);
  }
  return out;
}

const tableKey = (i: RoadInputs) => [i.segmentDiameter, i.segmentTurns, i.airGap].join("|");

function buildTable(inputs: RoadInputs) {
  const tx = roadPad(inputs.segmentDiameter, inputs.segmentTurns);
  const rx = DEFAULT_RX_PAD;
  const maxOffset = tx.outerRadius + rx.outerRadius + 0.6;
  return { tx, rx, table: mutualTable({ tx, rx, airGap: inputs.airGap, lateral: 0, longitudinal: 0 }, maxOffset, 64) };
}

export function createRoad(inputs: RoadInputs = DEFAULT_ROAD_INPUTS, seed = 7): RoadSim {
  const { tx, rx, table } = buildTable(inputs);
  const battery = { ...DEFAULT_BATTERY, capacityKWh: inputs.capacityKWh };
  const segments = segmentPositions(inputs).map((x, index) => ({ index, x, state: "off" as SegmentState, level: 0, requested: false, energy: 0 }));
  const sim: RoadSim = {
    inputs: { ...inputs },
    state: {
      t: 0,
      x: 0,
      v: inputs.profile === "accelerate" ? inputs.speed * 0.3 : inputs.speed,
      a: 0,
      battery: { soc: inputs.initialSoc, v1: 0, temperature: 25 },
      segments,
      mTotal: 0,
      kDynamic: 0,
      pReceived: 0,
      pTraction: 0,
      pBattery: 0,
      pDemand: 0,
      pGrid: 0,
      pTxLoss: 0,
      rl: 0,
      i2: 0,
      motionalRatio: 0,
      force: 0,
      energy: { grid: 0, segments: 0, received: 0, traction: 0, battery: 0, unmet: 0, supplyLoss: 0, padLoss: 0, receiverLoss: 0, idleEnergised: 0 },
      counters: { handovers: 0, blocked: 0, exposure: 0 },
      samples: [],
      lap: 0,
    },
    table,
    key: tableKey(inputs),
    rng: createRng(seed),
    history: [],
    vehicle: vehicleFor(inputs),
    battery,
    tx,
    rx,
    r1: windingResistance(tx, inputs.frequency, 40, DEFAULT_CHAIN.acFactorTx).rac + DEFAULT_CHAIN.coreResistanceTx,
    r2: windingResistance(rx, inputs.frequency, 40, DEFAULT_CHAIN.acFactorRx).rac + DEFAULT_CHAIN.coreResistanceRx,
    sampleEvery: 0.01,
    nextSample: 0,
  };
  return sim;
}

const vehicleFor = (i: RoadInputs): VehicleParams => ({ ...DEFAULT_VEHICLE, mass: i.mass, dragCoefficient: i.dragCoefficient, rollingResistance: i.rollingResistance, drivetrainEfficiency: i.drivetrainEfficiency });

export function setRoadInputs(sim: RoadSim, inputs: RoadInputs): void {
  const prev = sim.inputs;
  sim.inputs = { ...inputs };
  sim.vehicle = vehicleFor(inputs);
  sim.battery = { ...sim.battery, capacityKWh: inputs.capacityKWh };
  if (tableKey(inputs) !== sim.key) {
    const built = buildTable(inputs);
    sim.table = built.table;
    sim.tx = built.tx;
    sim.key = tableKey(inputs);
  }
  if (prev.segmentDiameter !== inputs.segmentDiameter || prev.segmentSpacing !== inputs.segmentSpacing || prev.coverage !== inputs.coverage) {
    sim.state.segments = segmentPositions(inputs).map((x, index) => ({ index, x, state: "off", level: 0, requested: false, energy: 0 }));
  }
  sim.r1 = windingResistance(sim.tx, inputs.frequency, 40, DEFAULT_CHAIN.acFactorTx).rac + DEFAULT_CHAIN.coreResistanceTx;
}

/** Speed and acceleration of the profile at time t. */
export function speedProfile(i: RoadInputs, t: number, v: number, dt: number): { v: number; a: number } {
  const vs = i.speed;
  switch (i.profile) {
    case "constant":
      return { v: vs, a: 0 };
    case "urban": {
      const target = vs * (0.7 + 0.3 * Math.sin((2 * Math.PI * t) / 30));
      const a = clamp((target - v) / Math.max(dt, 0.5), -i.acceleration, i.acceleration);
      return { v: Math.max(0, v + a * dt), a };
    }
    case "stop-and-go": {
      const c = t % 30;
      const target = c < 9 ? vs : c < 15 ? vs * 0.5 : c < 22 ? 0 : vs;
      const a = clamp((target - v) * 0.8, -i.acceleration * 1.5, i.acceleration);
      return { v: Math.max(0, v + a * dt), a: v <= 0 && a < 0 ? 0 : a };
    }
    case "accelerate": {
      const c = t % 40;
      const a = c < 20 ? (v < vs ? i.acceleration * 0.5 : 0) : v > vs * 0.3 ? -i.acceleration * 0.5 : 0;
      return { v: Math.max(0, v + a * dt), a };
    }
  }
}

/** Mutual inductance between the receiver and a segment at horizontal offset rho, H. */
export const segmentM = (sim: RoadSim, rho: number) => (rho > sim.table.offsets[sim.table.offsets.length - 1] ? 0 : interp1(sim.table.offsets, sim.table.M, rho));

/** Advances the road simulation by dt (default 1 ms). */
export function stepRoad(sim: RoadSim, dt = 0.001): void {
  const s = sim.state;
  const i = sim.inputs;
  const veh = sim.vehicle;
  s.t += dt;

  // ── Vehicle motion ──
  const sp = speedProfile(i, s.t, s.v, dt);
  s.v = sp.v;
  s.a = sp.a;
  s.x += s.v * dt;
  if (s.x > ROUTE_LENGTH) {
    s.x -= ROUTE_LENGTH;
    s.lap += 1;
    sim.history = [];
  }
  const xRx = s.x + veh.receiverOffset;
  sim.history.push({ t: s.t, x: xRx, v: s.v });
  while (sim.history.length > 2 && sim.history[1].t < s.t - i.controllerLatency - 0.01) sim.history.shift();

  // ── Position estimate the segment controller sees ──
  const delayed = sim.history.find((h) => h.t >= s.t - i.controllerLatency) ?? sim.history[0];
  let xEst = delayed.x + i.positionNoise * sim.rng.normal();
  if (i.handover === "predictive") xEst += delayed.v * i.controllerLatency;

  // ── Segment control and the independent safety interlock ──
  const supplyUp = !i.intermittentSupply || s.t % 10 < 8;
  const half = i.segmentDiameter / 2;
  const window = half + (i.handover === "make-before-break" ? 0.25 : 0.05);
  const cover = veh.length / 2 - half - 0.1;
  const tauOn = 0.003;
  const tauOff = 0.002;
  let active = 0;
  let mTotal = 0;
  let mSlopeTotal = 0;
  for (const seg of s.segments) {
    if (Math.abs(seg.x - xRx) > 6 && seg.level === 0 && !seg.requested) continue;
    const wasOn = seg.state === "on";
    // Hysteresis: a requested segment stays requested until the estimate is 5 cm past the window, so noise cannot make it chatter.
    seg.requested = Math.abs(seg.x - xEst) < window + (seg.requested ? 0.05 : 0);
    const covered = Math.abs(seg.x - s.x) <= cover;
    const permitted = covered && i.authorized && supplyUp && seg.index !== i.failedSegment;
    if (seg.index === i.failedSegment) seg.state = "failed";
    else if (seg.requested && permitted) seg.state = "on";
    else if (seg.requested && !permitted) {
      if (seg.state !== "blocked") s.counters.blocked += 1;
      seg.state = "blocked";
    } else seg.state = "off";
    if (!wasOn && seg.state === "on") s.counters.handovers += 1;
    const target = seg.state === "on" ? 1 : 0;
    seg.level += (target - seg.level) * (1 - Math.exp(-dt / (target > seg.level ? tauOn : tauOff)));
    if (seg.level < 1e-4) seg.level = 0;
    if (seg.level > 0) {
      active += 1;
      if (!covered) s.counters.exposure += dt;
      const dx = xRx - seg.x;
      const rho = Math.hypot(dx, i.lateral);
      const m = segmentM(sim, rho);
      mTotal += m * seg.level;
      const h = 0.005;
      const slope = (segmentM(sim, Math.hypot(dx + h, i.lateral)) - segmentM(sim, Math.hypot(dx - h, i.lateral))) / (2 * h);
      mSlopeTotal += slope * seg.level;
    }
  }

  // ── Receiver power ──
  const w = 2 * Math.PI * i.frequency;
  const I1 = i.primaryCurrent;
  const voc = w * mTotal * I1;
  const R2 = sim.r2;
  const grade = (i.gradeDeg * Math.PI) / 180;
  const load = roadLoad(veh, s.v, s.a, grade);
  const accept = chargeAcceptance(sim.battery, s.battery, 1, dt);
  const onElectrified = s.segments.some((seg) => Math.abs(seg.x - xRx) < 6);
  // What the vehicle can use: traction (when motoring) plus what the battery accepts, within the receiver rating.
  const demand = clamp(Math.max(0, load.electricalPower) + accept.power, 0, i.receiverRating);
  const pMax = (voc * voc) / (4 * R2);
  let rl = 0;
  let pLoad = 0;
  if (voc > 0 && demand > 0) {
    // Ask for a little more at the rectifier input to cover its losses.
    const want = Math.min(demand * 1.012 + 20, pMax);
    if (want >= pMax * 0.9999) rl = R2;
    else {
      const b = voc * voc - 2 * want * R2;
      rl = (b + Math.sqrt(Math.max(0, b * b - 4 * want * want * R2 * R2))) / (2 * want);
    }
    const i2 = voc / (R2 + rl);
    pLoad = i2 * i2 * rl;
    s.i2 = i2;
  } else s.i2 = 0;
  const idc = pLoad > 0 ? (2 * Math.SQRT2 * s.i2) / Math.PI : 0;
  const rect = rectifierLoss(DEFAULT_CHAIN.rectifier.vf, DEFAULT_CHAIN.rectifier.rf, idc, s.i2);
  const pDc = Math.max(0, pLoad - rect);
  // DC–DC output for input pDc: invert P + p0 + aP + bP² = pDc.
  const m = DEFAULT_CHAIN.dcdc;
  const pRx = pDc > m.p0 ? (-(1 + m.a) + Math.sqrt((1 + m.a) ** 2 - 4 * m.b * (m.p0 - pDc))) / (2 * m.b) : 0;

  // ── Transmitter side ──
  let pSegments = 0;
  let padLoss = 0;
  let idle = 0;
  let inverter = 0;
  for (const seg of s.segments) {
    if (seg.level <= 0) continue;
    const mj = segmentM(sim, Math.hypot(xRx - seg.x, i.lateral));
    const ij = I1 * seg.level;
    const copper = ij * ij * sim.r1;
    const transferred = rl > 0 ? (w * w * mj * ij * mTotal * I1) / (R2 + rl) : 0;
    const inv = inverterLoss(DEFAULT_CHAIN.inverter, DEFAULT_CHAIN.vdcLink, ij, 0.15, i.frequency, 50).total;
    const p = copper + transferred + inv;
    seg.energy += p * dt;
    pSegments += copper + transferred;
    padLoss += copper;
    inverter += inv;
    if (mj < 1e-7) idle += copper + inv;
  }
  const supplyIn = pSegments + inverter;
  const pGrid = supplyIn > 0 ? converterInput(DEFAULT_CHAIN.transformer, converterInput(DEFAULT_CHAIN.pfc, supplyIn)) : 0;

  // ── Battery ──
  const pBat = pRx - load.electricalPower;
  const I = currentForPower(sim.battery, s.battery, pBat);
  stepBattery(sim.battery, s.battery, I, 25, dt);

  // ── Bookkeeping ──
  s.mTotal = mTotal;
  s.kDynamic = mTotal / Math.sqrt(sim.table.L1 * sim.table.L2);
  s.pReceived = pRx;
  s.pTraction = load.electricalPower;
  s.pBattery = pBat;
  s.pDemand = onElectrified ? demand : 0;
  s.pGrid = pGrid;
  s.pTxLoss = padLoss + inverter;
  s.rl = rl;
  s.motionalRatio = mTotal > 0 ? (s.v * Math.abs(mSlopeTotal)) / (w * mTotal) : 0;
  // ⟨F⟩ = Re(I1·conj(I2))·dM/dx; at resonance I2 is in quadrature with I1, so it vanishes in this model.
  s.force = 0;
  const e = s.energy;
  e.grid += pGrid * dt;
  e.segments += pSegments * dt;
  e.received += pRx * dt;
  e.traction += load.electricalPower * dt;
  e.battery += pBat * dt;
  e.unmet += Math.max(0, s.pDemand - pRx) * dt;
  e.supplyLoss += (pGrid - supplyIn) * dt + inverter * dt;
  e.padLoss += padLoss * dt;
  e.receiverLoss += (pSegments - padLoss - pRx) * dt;
  e.idleEnergised += idle * dt;

  if (s.t >= sim.nextSample) {
    sim.nextSample = s.t + sim.sampleEvery;
    s.samples.push({ t: s.t, x: s.x, v: s.v, pReceived: pRx, pTraction: load.electricalPower, pBattery: pBat, mTotal, k: s.kDynamic, soc: s.battery.soc, active });
    if (s.samples.length > 3000) s.samples.splice(0, s.samples.length - 3000);
  }
}

export type EnergyRegime = "charging" | "energy-neutral" | "discharging";

/** Classifies a window of samples by mean battery power: within ±tolerance W is energy-neutral. */
export function regime(samples: readonly RoadSample[], tolerance = 500): EnergyRegime {
  if (!samples.length) return "energy-neutral";
  const mean = samples.reduce((acc, x) => acc + x.pBattery, 0) / samples.length;
  return mean > tolerance ? "charging" : mean < -tolerance ? "discharging" : "energy-neutral";
}

/**
 * Mean battery power over the last `distance` metres travelled (one repeat of
 * the electrified zones by default), so the reading covers whole zones rather
 * than a slice of one. Null until the vehicle has driven that far within the
 * stored samples. An analysis of the samples; it changes nothing in the model.
 */
export function recentBatteryPower(samples: readonly RoadSample[], distance = ZONE_PERIOD, tolerance = 500): { mean: number; seconds: number; regime: EnergyRegime } | null {
  if (samples.length < 2) return null;
  let travelled = 0;
  let sum = 0;
  let n = 0;
  for (let i = samples.length - 1; i > 0; i--) {
    let dx = samples[i].x - samples[i - 1].x;
    if (dx < -ROUTE_LENGTH / 2) dx += ROUTE_LENGTH;
    travelled += Math.max(0, dx);
    sum += samples[i].pBattery;
    n += 1;
    if (travelled >= distance) {
      const mean = sum / n;
      return { mean, seconds: samples[samples.length - 1].t - samples[i - 1].t, regime: mean > tolerance ? "charging" : mean < -tolerance ? "discharging" : "energy-neutral" };
    }
  }
  return null;
}

export interface DriveSummary {
  distance: number;
  time: number;
  energyPerKm: number;
  meanReceived: number;
  peakReceived: number;
  ripple: number;
  socStart: number;
  socEnd: number;
  regime: EnergyRegime;
  gridEnergy: number;
  efficiency: number;
  unmet: number;
  handovers: number;
  blocked: number;
  exposure: number;
}

/** Drives `distance` metres headless and summarises it. Deterministic for a seed. */
export function runDrive(inputs: RoadInputs, distance = 1000, opts: { dt?: number; seed?: number } = {}): { sim: RoadSim; summary: DriveSummary } {
  const dt = opts.dt ?? 0.001;
  const sim = createRoad(inputs, opts.seed ?? 7);
  const socStart = sim.state.battery.soc;
  let travelled = 0;
  let last = sim.state.x;
  const limit = 3600 / dt;
  for (let n = 0; travelled < distance && n < limit; n++) {
    stepRoad(sim, dt);
    const d = sim.state.x - last;
    travelled += d < 0 ? d + ROUTE_LENGTH : d;
    last = sim.state.x;
  }
  const s = sim.state;
  const onRoad = s.samples.filter((x) => x.pReceived > 0);
  const mean = s.t > 0 ? s.energy.received / s.t : 0;
  const peak = s.samples.reduce((acc, x) => Math.max(acc, x.pReceived), 0);
  const window = s.samples;
  const pr = onRoad.map((x) => x.pReceived);
  const ripple = pr.length ? (Math.max(...pr) - Math.min(...pr)) / Math.max(1, pr.reduce((a, b) => a + b, 0) / pr.length) : 0;
  return {
    sim,
    summary: {
      distance: travelled,
      time: s.t,
      energyPerKm: s.energy.received / (travelled / 1000),
      meanReceived: mean,
      peakReceived: peak,
      ripple,
      socStart,
      socEnd: s.battery.soc,
      regime: regime(window),
      gridEnergy: s.energy.grid,
      efficiency: s.energy.grid > 0 ? s.energy.received / s.energy.grid : 0,
      unmet: s.energy.unmet,
      handovers: s.counters.handovers,
      blocked: s.counters.blocked,
      exposure: s.counters.exposure,
    },
  };
}

export const roadConverterLoss = (p: number) => converterLoss(DEFAULT_CHAIN.pfc, p);
