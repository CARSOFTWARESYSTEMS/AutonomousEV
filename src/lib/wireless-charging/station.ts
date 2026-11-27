// Smart Wireless EV Charging Station simulation (WPT-SIM-001).
//
// A deterministic, fixed-step simulation of one parking bay: vehicle arrival,
// the charging state machine with safety precedence, the quasi-static
// grid-to-battery power chain, battery and thermal dynamics, sensors and the
// messages that pass between BMS, vehicle, station, backend and cloud. It
// knows nothing about rendering; the 3D scene and the interface only read it.
//
// Multirate: the state machine, control and power flow run every step (dt,
// default 50 ms); messages and sensors on their own schedules; thermal and
// battery states are integrated exactly over each step, so a coarse step
// (used by headless "run to completion" experiments) stays stable.
import { DEFAULT_BATTERY, type BatteryParams, type BatteryState, chargeAcceptance, currentForPower, packCapacityAh, packOcv, stepBattery } from "./battery";
import { bridgeAngle, resonantCapacitance } from "./circuits";
import { type ChainLimit, type ChainParams, type ChainPoint, type ChainSetup, DEFAULT_CHAIN, maxFeasible, solveChain, transientCurrents } from "./chain";
import { type CouplerResult, computeCoupler, computeFieldSection, DEFAULT_RX_PAD, DEFAULT_TX_PAD, type PadGeometry } from "./coils";
import { stepThermal, type ThermalNode } from "./losses";
import { cabs, clamp, createRng, goldenMin, type Rng } from "./math";
import { Bus, type Delivered, DEFAULT_LINKS, type LinkConfig, type LinkId } from "./network";
import { NORMAL_SEQUENCE, PHASES, type PhaseId, safetyTransition, type SafetyInputs } from "./stateMachine";
import { SensorBank, STATION_SENSORS } from "./sensors";

export const STATION_MODEL_VERSION = "WPT-SIM-001 v1.0.0";

export interface StationInputs {
  /** Receiver offset from the pad centre when parked, m. */
  lateral: number;
  longitudinal: number;
  airGap: number;
  /** Rotation of the receiver about the vertical axis, degrees. No effect on circular pads (rotationally symmetric). */
  rotation: number;
  /** Operating frequency, Hz (adaptive resonance may move it within the band). */
  frequency: number;
  adaptiveResonance: boolean;
  /** Station rating at the battery terminals, W. */
  stationPower: number;
  txTurns: number;
  rxTurns: number;
  /** Compensation capacitor trim against the design value, fraction (0 = tuned). */
  c1Trim: number;
  c2Trim: number;
  capacityKWh: number;
  initialSoc: number;
  targetSoc: number;
  batteryTemperature: number;
  ambientTemperature: number;
  /** Electricity tariff, currency units per kWh. */
  tariff: number;
  /** Power available from the grid connection, W. */
  gridLimit: number;
  /** W/s. */
  rampRate: number;
  alignmentToleranceLateral: number;
  alignmentToleranceLongitudinal: number;
  /** Minimum coupling coefficient to start or keep charging. */
  kMin: number;
  /** Authorise from the station's local list when the backend is unreachable. */
  offlineAuthorization: boolean;
  /** Start the next session automatically when the bay is free. */
  autoCycle: boolean;
  /**
   * Smart Parking adapter only: hold "completed" until the vehicle is told to
   * depart (the parking session decides when it leaves). Absent or false keeps
   * the station's own behaviour (departure 3 s after completion).
   */
  holdAfterComplete?: boolean;
}

export const DEFAULT_STATION_INPUTS: StationInputs = {
  lateral: 0.04,
  longitudinal: -0.03,
  airGap: 0.15,
  rotation: 0,
  frequency: 85000,
  adaptiveResonance: true,
  stationPower: 11000,
  txTurns: DEFAULT_TX_PAD.turns,
  rxTurns: DEFAULT_RX_PAD.turns,
  c1Trim: 0,
  c2Trim: 0,
  capacityKWh: 60,
  initialSoc: 0.3,
  targetSoc: 0.8,
  batteryTemperature: 24,
  ambientTemperature: 27,
  tariff: 8.5,
  gridLimit: 22000,
  rampRate: 2500,
  alignmentToleranceLateral: 0.1,
  alignmentToleranceLongitudinal: 0.1,
  kMin: 0.08,
  offlineAuthorization: true,
  autoCycle: false,
};

/** Faults and events a user can inject. All are simulated. */
export interface StationFaults {
  foreignObject: boolean;
  livingObject: boolean;
  emergencyStop: boolean;
  isolationFault: boolean;
  controllerFailure: boolean;
  stationUnavailable: boolean;
  unauthorizedVehicle: boolean;
  /** Forces a current-sensor overcurrent trip (e.g. a shoot-through event). */
  overcurrentEvent: boolean;
  /** Disables foreign-object detection, to show what it protects against. Simulation only. */
  fodDisabled: boolean;
  /** Per-link degradations. */
  links: Partial<Record<LinkId, Partial<LinkConfig>>>;
  /** Sensors that stop reporting. */
  disconnectedSensors: string[];
}

export const NO_FAULTS: StationFaults = {
  foreignObject: false,
  livingObject: false,
  emergencyStop: false,
  isolationFault: false,
  controllerFailure: false,
  stationUnavailable: false,
  unauthorizedVehicle: false,
  overcurrentEvent: false,
  fodDisabled: false,
  links: {},
  disconnectedSensors: [],
};

/**
 * "arrive-parked" and "stop" serve the Smart Parking session adapter: the
 * parking environment has already driven the vehicle into the bay, and asks
 * the station to stop safely before departure. The station's own sequence,
 * safety checks and interlocks run unchanged after either command.
 */
export type StationCommand = "arrive" | "depart" | "reset" | "arrive-parked" | "stop";

export interface StationParams {
  chain: ChainParams;
  battery: BatteryParams;
  tx: PadGeometry;
  rx: PadGeometry;
  thermal: { txCoil: ThermalNode; rxCoil: ThermalNode; inverter: ThermalNode; object: ThermalNode };
  limits: { coilTemperature: number; inverterTemperature: number; batteryTemperature: number; hysteresis: number; i1Trip: number; i2Trip: number };
  commTimeout: number;
  /** Power used in low-power initialisation, W. */
  initPower: number;
  /** Ground controller response time constant (includes communication), s. */
  controllerTau: number;
  /** Receiver pad ahead of the vehicle's centre, m. */
  receiverOffset: number;
  /** Heating of a small steel object per (µT RMS)² (illustrative, uncalibrated), W/µT². */
  objectHeating: number;
  /** Frequency band for adaptive resonance, Hz. */
  band: [number, number];
}

export const DEFAULT_STATION_PARAMS: StationParams = {
  chain: DEFAULT_CHAIN,
  battery: DEFAULT_BATTERY,
  tx: DEFAULT_TX_PAD,
  rx: DEFAULT_RX_PAD,
  thermal: {
    txCoil: { capacitance: 3200, resistance: 0.32 },
    rxCoil: { capacitance: 2400, resistance: 0.36 },
    inverter: { capacitance: 2600, resistance: 0.11 },
    object: { capacitance: 6, resistance: 45 },
  },
  limits: { coilTemperature: 110, inverterTemperature: 90, batteryTemperature: 55, hysteresis: 8, i1Trip: 66, i2Trip: 66 },
  commTimeout: 1.0,
  initPower: 400,
  controllerTau: 0.25,
  receiverOffset: 0.6,
  objectHeating: 3.2e-6,
  band: [79000, 90000],
};

export interface StageEnergy {
  grid: number;
  transformer: number;
  pfc: number;
  inverter: number;
  txCoil: number;
  rxCoil: number;
  rectifier: number;
  dcdc: number;
  batteryTerminals: number;
  batteryLoss: number;
  batteryStored: number;
}

export interface SessionRecord {
  started: number;
  ended: number;
  energyToBattery: number;
  gridEnergy: number;
  cost: number;
  socStart: number;
  socEnd: number;
  peakPower: number;
  outcome: string;
}

export interface StationEvent {
  t: number;
  from: PhaseId;
  to: PhaseId;
  reason: string;
  safety: boolean;
}

export interface StationState {
  t: number;
  steps: number;
  phase: PhaseId;
  phaseTime: number;
  /** Vehicle centre in the bay frame (x forward along the bay, y left), m, and speed. */
  vehicle: { x: number; y: number; v: number; present: boolean; parked: boolean };
  coupler: CouplerResult;
  /** Compensation designed for the nominal (aligned, nominal-gap) inductances at the nominal frequency. */
  design: { C1: number; C2: number; f0: number };
  frequency: number;
  pCmd: number;
  pTarget: number;
  limitedBy: ChainLimit | "battery" | "station" | "off";
  acceptanceLimit: string;
  point: ChainPoint;
  /** Inverter conduction angle actually applied (lags the controller), rad. */
  alphaApplied: number;
  rlApplied: number;
  transient: { i1: number; i2: number };
  /** Mutual inductance at the previous step, to detect sudden coupling changes, H. */
  prevM: number;
  battery: BatteryState;
  batteryCurrent: number;
  batteryVoltage: number;
  temperatures: { txCoil: number; rxCoil: number; inverter: number; object: number };
  /** RMS flux density per ampere of each coil at the gap centre, and the present value, T. */
  fieldCentre: number;
  fieldEdge: number;
  energy: StageEnergy;
  cost: number;
  authorized: boolean;
  lastHeartbeat: number;
  backendReply: "none" | "accepted" | "rejected" | "offline";
  fodTimer: number;
  clearTimer: number;
  latched: boolean;
  session: SessionRecord | null;
  sessions: SessionRecord[];
  events: StationEvent[];
  measuredK: number;
  warnings: string[];
}

export interface StationSim {
  readonly params: StationParams;
  readonly seed: number;
  state: StationState;
  bus: Bus;
  sensors: SensorBank;
  rng: Rng;
  inputs: StationInputs;
  /** Cache key of the geometry the coupler and design were computed for. */
  geometryKey: string;
  commands: StationCommand[];
  /** Time each periodic message is next due. */
  timers: Record<string, number>;
  feasibleCache: { key: string; power: number; limitedBy: ChainLimit; until: number } | null;
}

const ZERO_ENERGY: StageEnergy = { grid: 0, transformer: 0, pfc: 0, inverter: 0, txCoil: 0, rxCoil: 0, rectifier: 0, dcdc: 0, batteryTerminals: 0, batteryLoss: 0, batteryStored: 0 };

function pads(params: StationParams, inputs: StationInputs) {
  return { tx: { ...params.tx, turns: inputs.txTurns }, rx: { ...params.rx, turns: inputs.rxTurns } };
}

const couplerKey = (inputs: StationInputs) => [inputs.txTurns, inputs.rxTurns, inputs.airGap.toFixed(4), inputs.lateral.toFixed(4), inputs.longitudinal.toFixed(4)].join("|");

function couplerFor(params: StationParams, inputs: StationInputs, aligned = false): CouplerResult {
  const { tx, rx } = pads(params, inputs);
  return computeCoupler({ tx, rx, airGap: inputs.airGap, lateral: aligned ? 0 : inputs.lateral, longitudinal: aligned ? 0 : inputs.longitudinal });
}

/** Resonant capacitances designed at the nominal frequency for the aligned coupler at the nominal 150 mm gap. */
function designFor(params: StationParams, inputs: StationInputs) {
  const { tx, rx } = pads(params, inputs);
  const nominal = computeCoupler({ tx, rx, airGap: 0.15, lateral: 0, longitudinal: 0 });
  const f0 = 85000;
  return { C1: resonantCapacitance(nominal.L1, f0) * (1 + inputs.c1Trim), C2: resonantCapacitance(nominal.L2, f0) * (1 + inputs.c2Trim), f0 };
}

export function createStation(inputs: StationInputs = DEFAULT_STATION_INPUTS, seed = 20261125, params: StationParams = DEFAULT_STATION_PARAMS): StationSim {
  const coupler = couplerFor(params, inputs);
  const design = designFor(params, inputs);
  const battery: BatteryState = { soc: inputs.initialSoc, v1: 0, temperature: inputs.batteryTemperature };
  const state: StationState = {
    t: 0,
    steps: 0,
    phase: "available",
    phaseTime: 0,
    vehicle: { x: -10, y: inputs.lateral, v: 0, present: false, parked: false },
    coupler,
    design,
    frequency: inputs.frequency,
    pCmd: 0,
    pTarget: 0,
    limitedBy: "off",
    acceptanceLimit: "none",
    point: solveChain(params.chain, chainSetup(params, inputs, coupler, design, inputs.frequency, idleTemps(inputs), inputs.gridLimit), 0),
    alphaApplied: 0,
    rlApplied: 0,
    transient: { i1: 0, i2: 0 },
    prevM: coupler.M,
    battery,
    batteryCurrent: 0,
    batteryVoltage: packOcv({ ...params.battery, capacityKWh: inputs.capacityKWh }, inputs.initialSoc),
    temperatures: idleTemps(inputs),
    fieldCentre: 0,
    fieldEdge: 0,
    energy: { ...ZERO_ENERGY },
    cost: 0,
    authorized: false,
    lastHeartbeat: -1e9,
    backendReply: "none",
    fodTimer: 0,
    clearTimer: 0,
    latched: false,
    session: null,
    sessions: [],
    events: [],
    measuredK: 0,
    warnings: [],
  };
  return {
    params,
    seed,
    state,
    bus: new Bus(seed, DEFAULT_LINKS),
    sensors: new SensorBank(STATION_SENSORS, seed),
    rng: createRng(seed),
    inputs: { ...inputs },
    geometryKey: couplerKey(inputs),
    commands: ["arrive"],
    timers: { heartbeat: 0, can: 0, cloud: 0, meter: 0 },
    feasibleCache: null,
  };
}

function idleTemps(inputs: StationInputs) {
  return { txCoil: inputs.ambientTemperature, rxCoil: inputs.ambientTemperature, inverter: inputs.ambientTemperature, object: inputs.ambientTemperature };
}

function chainSetup(params: StationParams, inputs: StationInputs, coupler: CouplerResult, design: { C1: number; C2: number }, frequency: number, temps: { txCoil: number; rxCoil: number; inverter: number }, gridLimit: number): ChainSetup {
  const { tx, rx } = pads(params, inputs);
  return {
    tx,
    rx,
    L1: coupler.L1,
    L2: coupler.L2,
    M: coupler.M,
    C1: design.C1,
    C2: design.C2,
    frequency,
    txTemperature: temps.txCoil,
    rxTemperature: temps.rxCoil,
    inverterTemperature: temps.inverter,
    gridLimit,
  };
}

/** Battery parameters with the configured capacity. */
export const batteryFor = (params: StationParams, inputs: StationInputs): BatteryParams => ({ ...params.battery, capacityKWh: inputs.capacityKWh });

/** Applies new inputs: geometry changes recompute the coupler (and, if turns or trim changed, the compensation design). */
export function setStationInputs(sim: StationSim, inputs: StationInputs): void {
  const prev = sim.inputs;
  sim.inputs = { ...inputs };
  const key = couplerKey(inputs);
  if (key !== sim.geometryKey) {
    sim.state.coupler = couplerFor(sim.params, inputs);
    sim.geometryKey = key;
    sim.feasibleCache = null;
  }
  if (prev.txTurns !== inputs.txTurns || prev.rxTurns !== inputs.rxTurns || prev.c1Trim !== inputs.c1Trim || prev.c2Trim !== inputs.c2Trim) {
    sim.state.design = designFor(sim.params, inputs);
    sim.feasibleCache = null;
  }
  if (!inputs.adaptiveResonance) sim.state.frequency = inputs.frequency;
  if (prev.frequency !== inputs.frequency || prev.gridLimit !== inputs.gridLimit || prev.stationPower !== inputs.stationPower) sim.feasibleCache = null;
  if (sim.state.phase === "available" || sim.state.phase === "approaching") {
    sim.state.battery.soc = inputs.initialSoc;
    sim.state.battery.temperature = inputs.batteryTemperature;
  }
}

export function stationCommand(sim: StationSim, command: StationCommand): void {
  sim.commands.push(command);
}

function enter(sim: StationSim, to: PhaseId, reason: string, safety = false) {
  const s = sim.state;
  if (s.phase === to) return;
  s.events.push({ t: s.t, from: s.phase, to, reason, safety });
  if (s.events.length > 300) s.events.splice(0, s.events.length - 300);
  s.phase = to;
  s.phaseTime = 0;
  if (!PHASES[to].energised) s.pCmd = 0;
  // Close the session record when charging completes, or when the vehicle leaves without completing.
  if (s.session && s.session.outcome === "in progress" && (to === "completed" || to === "departure" || to === "available")) {
    s.session.outcome = to === "completed" ? "completed" : `ended in ${PHASES[s.events.at(-1)?.from ?? to].label.toLowerCase()}`;
    s.sessions.push({ ...s.session });
  }
}

function applyLinkFaults(sim: StationSim, faults: StationFaults) {
  for (const id of Object.keys(DEFAULT_LINKS) as LinkId[]) {
    sim.bus.links[id] = { ...DEFAULT_LINKS[id], ...(faults.links[id] ?? {}) };
  }
}

/** Advances the simulation by dt seconds. */
export function stepStation(sim: StationSim, faults: StationFaults, dt: number): void {
  const s = sim.state;
  const p = sim.params;
  const inputs = sim.inputs;
  const bp = batteryFor(p, inputs);
  applyLinkFaults(sim, faults);
  s.t += dt;
  s.steps += 1;
  s.phaseTime += dt;
  s.warnings = [];

  // ── Commands ──
  const commands = sim.commands.splice(0);
  for (const c of commands) {
    if (c === "arrive" && s.phase === "available" && !faults.stationUnavailable) {
      s.vehicle = { x: inputs.longitudinal - p.receiverOffset - 10, y: inputs.lateral, v: 3.3, present: true, parked: false };
      s.battery = { soc: inputs.initialSoc, v1: 0, temperature: inputs.batteryTemperature };
      s.authorized = false;
      s.backendReply = "none";
      s.session = { started: s.t, ended: s.t, energyToBattery: 0, gridEnergy: 0, cost: 0, socStart: inputs.initialSoc, socEnd: inputs.initialSoc, peakPower: 0, outcome: "in progress" };
      enter(sim, "approaching", "Vehicle entered the bay");
    }
    if (c === "arrive-parked" && s.phase === "available" && !faults.stationUnavailable) {
      // Already over the pad (driven in by the parking environment): no approach run.
      s.vehicle = { x: inputs.longitudinal - p.receiverOffset, y: inputs.lateral, v: 0, present: true, parked: false };
      s.battery = { soc: inputs.initialSoc, v1: 0, temperature: inputs.batteryTemperature };
      s.authorized = false;
      s.backendReply = "none";
      s.session = { started: s.t, ended: s.t, energyToBattery: 0, gridEnergy: 0, cost: 0, socStart: inputs.initialSoc, socEnd: inputs.initialSoc, peakPower: 0, outcome: "in progress" };
      enter(sim, "approaching", "Vehicle parked over the pad (Smart Parking hand-over)");
    }
    if (c === "stop" && s.vehicle.present) {
      // A safe stop before departure: an energised pad ramps down; before energising, the session simply ends.
      if (PHASES[s.phase].energised) {
        if (s.phase !== "ramp-down") enter(sim, "ramp-down", "Stop requested before departure");
      } else if (s.phase !== "available" && s.phase !== "completed" && s.phase !== "departure") enter(sim, "completed", "Stopped before energising");
    }
    if (c === "depart" && s.vehicle.present && !PHASES[s.phase].energised) enter(sim, "departure", "Vehicle asked to leave");
    if (c === "reset") s.latched = false;
  }

  // ── Vehicle motion (arrival and departure) ──
  const v = s.vehicle;
  if (s.phase === "approaching") {
    const goal = sim.inputs.longitudinal - p.receiverOffset;
    const remaining = goal - v.x;
    v.v = remaining > 0.005 ? Math.min(3.3, Math.sqrt(2 * 0.55 * remaining) + 0.05) : 0;
    v.x = Math.min(goal, v.x + v.v * dt);
    v.y = sim.inputs.lateral;
    if (goal - v.x < 0.005) {
      v.x = goal;
      v.v = 0;
      v.parked = true;
    }
  } else if (s.phase === "departure") {
    v.parked = false;
    v.v = Math.min(3, v.v + 1.2 * dt);
    v.x -= v.v * dt;
  } else if (v.parked) {
    v.x = sim.inputs.longitudinal - p.receiverOffset;
    v.y = sim.inputs.lateral;
  }

  // ── Sensing and communication ──
  const objectOnPad = faults.foreignObject && v.parked;
  s.fodTimer = objectOnPad && !faults.fodDisabled ? s.fodTimer + dt : 0;
  const fodDetected = s.fodTimer >= 0.25;
  const lodDetected = faults.livingObject;

  exchangeMessages(sim, faults, bp);

  // The timeout can never be shorter than the step allows a heartbeat to arrive in (coarse headless steps).
  const linkAlive = s.t - s.lastHeartbeat <= Math.max(p.commTimeout, 2.5 * dt);

  // Coupling the station measures during low-power initialisation (V_oc / I1 → M, with sensor noise).
  if (s.phase === "low-power-init" && s.point.ss) s.measuredK = s.coupler.k * (1 + 0.01 * sim.rng.normal());

  // ── Temperatures and limits ──
  const T = s.temperatures;
  const L = p.limits;
  const overTemp = T.txCoil > L.coilTemperature || T.rxCoil > L.coilTemperature || T.inverter > L.inverterTemperature || s.battery.temperature > L.batteryTemperature;
  const coolEnough = T.txCoil < L.coilTemperature - L.hysteresis && T.rxCoil < L.coilTemperature - L.hysteresis && T.inverter < L.inverterTemperature - L.hysteresis && s.battery.temperature < L.batteryTemperature - L.hysteresis;
  const i1 = s.point.ss ? cabs(s.point.ss.i1) : 0;
  const i2 = s.point.ss ? cabs(s.point.ss.i2) : 0;
  const overcurrent = faults.overcurrentEvent || Math.max(i1, s.transient.i1) > L.i1Trip || Math.max(i2, s.transient.i2) > L.i2Trip;

  // ── Safety first ──
  const safety: SafetyInputs = {
    emergencyStop: faults.emergencyStop,
    controllerFailure: faults.controllerFailure,
    stationUnavailable: faults.stationUnavailable && (s.phase === "available" || !v.present),
    livingObjectDetected: lodDetected,
    isolationFault: faults.isolationFault,
    overcurrent,
    foreignObjectDetected: fodDetected,
    overTemperature: overTemp,
    vehicleLinkAlive: linkAlive,
    vehicleParked: v.parked,
  };
  const trip = safetyTransition(s.phase, safety);
  if (trip) {
    enter(sim, trip, PHASES[trip].label, true);
    if (trip === "overcurrent" || trip === "isolation-fault" || trip === "emergency-stop" || trip === "controller-failure") s.latched = true;
    s.pCmd = 0;
    s.alphaApplied = 0;
    s.clearTimer = 0;
  } else {
    normalTransitions(sim, faults, bp, { linkAlive, fodDetected, lodDetected, coolEnough, overTemp });
  }

  // ── Power set-point ──
  const energised = PHASES[s.phase].energised;
  const temps = { txCoil: T.txCoil, rxCoil: T.rxCoil, inverter: T.inverter };
  const acceptance = chargeAcceptance(bp, s.battery, inputs.targetSoc, dt);
  s.acceptanceLimit = acceptance.limitedBy;
  const gridLimit = inputs.gridLimit;
  const setup = chainSetup(p, sim.inputs, s.coupler, s.design, s.frequency, temps, gridLimit);
  if (energised) {
    const request = Math.min(inputs.stationPower, acceptance.power);
    const key = `${sim.geometryKey}|${s.frequency}|${Math.round(request / 50)}`;
    if (!sim.feasibleCache || sim.feasibleCache.key !== key || s.t > sim.feasibleCache.until) {
      const f = maxFeasible(p.chain, setup, request);
      sim.feasibleCache = { key, power: f.power, limitedBy: f.limitedBy, until: s.t + 1 };
    }
    let target = sim.feasibleCache.power;
    s.limitedBy = sim.feasibleCache.limitedBy === "request" ? (acceptance.power < inputs.stationPower ? "battery" : "station") : sim.feasibleCache.limitedBy;
    if (s.phase === "low-power-init" || s.phase === "resonance-check") target = Math.min(target, p.initPower);
    if (s.phase === "target-reached" || s.phase === "ramp-down") target = 0;
    s.pTarget = target;
    const rate = inputs.rampRate * dt;
    s.pCmd = s.pCmd < target ? Math.min(target, s.pCmd + rate) : Math.max(target, s.pCmd - (s.phase === "ramp-down" ? rate : Math.max(rate, (s.pCmd - target) * 0.5)));
  } else {
    s.pTarget = 0;
    s.pCmd = 0;
    s.limitedBy = "off";
  }

  // ── Power flow ──
  s.point = solveChain(p.chain, setup, s.pCmd);
  if (s.pCmd > 0 && !s.point.feasible) {
    // Limits moved since the cache was built: fall back to the largest feasible power now.
    const f = maxFeasible(p.chain, setup, s.pCmd);
    s.pCmd = f.power;
    s.point = solveChain(p.chain, setup, s.pCmd);
    sim.feasibleCache = null;
  }
  // A sudden change of coupling (the receiver moved, the gap changed) meets the
  // inverter angle and receiver load the controllers last set: the protection
  // check sees those currents before the controllers respond. Set-point changes
  // themselves are coordinated, so they do not produce this transient.
  const alphaTarget = s.pCmd > 0 ? s.point.alpha : 0;
  const k = 1 - Math.exp(-dt / p.controllerTau);
  const couplingJump = s.prevM > 0 && Math.abs(s.coupler.M - s.prevM) / s.prevM > 0.01;
  s.transient = s.pCmd > 0 && s.alphaApplied > 0 && couplingJump ? transientCurrents(p.chain, setup, s.alphaApplied, s.rlApplied) : { i1: 0, i2: 0 };
  s.alphaApplied = s.pCmd > 0 ? (s.alphaApplied > 0 ? s.alphaApplied + (alphaTarget - s.alphaApplied) * k : alphaTarget) : 0;
  s.rlApplied = s.point.rl;
  s.prevM = s.coupler.M;

  // ── Battery ──
  const pBat = s.point.pBattery;
  const I = pBat > 0 ? currentForPower(bp, s.battery, pBat) : 0;
  const step = stepBattery(bp, s.battery, I, inputs.ambientTemperature, dt);
  s.batteryCurrent = I;
  s.batteryVoltage = step.terminalVoltage;

  // ── Thermal ──
  const lo = s.point.losses;
  T.txCoil = stepThermal(p.thermal.txCoil, T.txCoil, lo.txCopper + lo.txCore + lo.txCapacitor * 0.2, inputs.ambientTemperature, dt);
  T.rxCoil = stepThermal(p.thermal.rxCoil, T.rxCoil, lo.rxCopper + lo.rxCore + lo.rxCapacitor * 0.2, inputs.ambientTemperature, dt);
  T.inverter = stepThermal(p.thermal.inverter, T.inverter, lo.inverter, inputs.ambientTemperature, dt);
  // Field at the gap centre and at the probe beyond the pad edge, from the field model (recomputed when geometry or current changes a lot).
  updateField(sim);
  const objectPower = objectOnPad ? p.objectHeating * (s.fieldCentre * 1e6) ** 2 : 0;
  T.object = stepThermal(p.thermal.object, T.object, objectPower, inputs.ambientTemperature, dt);

  // ── Energy ledger ──
  const e = s.energy;
  const pt = s.point;
  e.grid += pt.pGrid * dt;
  e.transformer += lo.transformer * dt;
  e.pfc += lo.pfc * dt;
  e.inverter += lo.inverter * dt;
  e.txCoil += (lo.txCopper + lo.txCapacitor + lo.txCore) * dt;
  e.rxCoil += (lo.rxCopper + lo.rxCapacitor + lo.rxCore) * dt;
  e.rectifier += lo.rectifier * dt;
  e.dcdc += lo.dcdc * dt;
  e.batteryTerminals += pBat * dt;
  e.batteryStored += step.storedPower * dt;
  e.batteryLoss += (pBat - step.storedPower) * dt;
  const costStep = (pt.pGrid * dt * inputs.tariff) / 3.6e6;
  s.cost += costStep;
  if (s.session && s.session.outcome === "in progress") {
    s.session.energyToBattery += pBat * dt;
    s.session.gridEnergy += pt.pGrid * dt;
    s.session.cost += costStep;
    s.session.peakPower = Math.max(s.session.peakPower, pBat);
    s.session.socEnd = s.battery.soc;
    s.session.ended = s.t;
  }

  // ── Sensors ──
  sim.sensors.sample(
    s.t,
    {
      "grid.power": pt.pGrid / 1000,
      "dc.link": p.chain.vdcLink,
      "tx.current": i1,
      "tx.temp": T.txCoil,
      "inv.temp": T.inverter,
      "field.edge": s.fieldEdge * 1e6,
      "align.lat": v.parked ? sim.inputs.lateral * 1000 : 480 + 10,
      "align.long": v.parked ? sim.inputs.longitudinal * 1000 : 480 + 10,
      "rx.current": i2,
      "bat.voltage": s.batteryVoltage,
      "bat.current": I,
      "bat.soc": s.battery.soc * 100,
      "bat.temp": s.battery.temperature,
    },
    new Set(faults.disconnectedSensors),
  );

  if (energised && !s.point.ss?.i1) s.warnings.push("Energised with no power flowing.");
  if (s.point.ss && s.point.ss.phaseIn <= 0) s.warnings.push("Capacitive input phase: no zero-voltage switching.");
  if (inputs.rotation !== 0) s.warnings.push("Circular pads are rotationally symmetric: rotation does not change the coupling in this model.");
}

/** Recomputes the field at the gap centre and the probe point from the field model (cheap: a coarse section). */
function updateField(sim: StationSim) {
  const s = sim.state;
  const ss = s.point.ss;
  if (!ss || s.pCmd <= 0) {
    s.fieldCentre = 0;
    s.fieldEdge = 0;
    return;
  }
  // Field scales linearly with current: compute per-amp values once per geometry, then scale.
  const key = `${sim.geometryKey}|field`;
  const cache = fieldCache.get(sim) ?? { key: "", centre1: 0, centre2: 0, centreDot: 0, edge1: 0, edge2: 0, edgeDot: 0 };
  if (cache.key !== key) {
    const { tx, rx } = pads(sim.params, sim.inputs);
    const config = { tx, rx, airGap: sim.inputs.airGap, lateral: sim.inputs.lateral, longitudinal: sim.inputs.longitudinal };
    const per = (i1: number, i2: number) => computeFieldSection(config, { i1: { re: i1, im: 0 }, i2: { re: i2, im: 0 } }, { nx: 3, nz: 3, halfWidth: tx.outerRadius + 0.2 });
    const a = per(1, 0);
    const b = per(0, 1);
    const both = per(1, 1);
    // The 3×3 grid's left cell of the middle row is the probe point beyond the pad edge.
    const edge = (f: typeof a) => f.brms[1 * 3 + 0] || 0;
    cache.centre1 = a.centre;
    cache.centre2 = b.centre;
    cache.centreDot = (both.centre ** 2 - a.centre ** 2 - b.centre ** 2) / 2;
    cache.edge1 = edge(a);
    cache.edge2 = edge(b);
    cache.edgeDot = (edge(both) ** 2 - edge(a) ** 2 - edge(b) ** 2) / 2;
    cache.key = key;
    fieldCache.set(sim, cache);
  }
  // |B|² = |I1|²|b1|² + |I2|²|b2|² + 2(b1·b2)·Re(I1·conj(I2)), with b1, b2 the per-ampere field vectors.
  const i1 = cabs(ss.i1);
  const i2 = cabs(ss.i2);
  const cross = ss.i1.re * ss.i2.re + ss.i1.im * ss.i2.im;
  s.fieldCentre = Math.sqrt(Math.max(0, (cache.centre1 * i1) ** 2 + (cache.centre2 * i2) ** 2 + 2 * cache.centreDot * cross));
  s.fieldEdge = Math.sqrt(Math.max(0, (cache.edge1 * i1) ** 2 + (cache.edge2 * i2) ** 2 + 2 * cache.edgeDot * cross));
}
const fieldCache = new WeakMap<StationSim, { key: string; centre1: number; centre2: number; centreDot: number; edge1: number; edge2: number; edgeDot: number }>();

function normalTransitions(sim: StationSim, faults: StationFaults, bp: BatteryParams, c: { linkAlive: boolean; fodDetected: boolean; lodDetected: boolean; coolEnough: boolean; overTemp: boolean }) {
  const s = sim.state;
  const inputs = sim.inputs;
  const p = sim.params;
  const t = s.phaseTime;
  const aligned = Math.abs(inputs.lateral) <= inputs.alignmentToleranceLateral && Math.abs(inputs.longitudinal) <= inputs.alignmentToleranceLongitudinal;
  const acceptance = chargeAcceptance(bp, s.battery, inputs.targetSoc, 1);
  switch (s.phase) {
    case "available":
      if (inputs.autoCycle && t > 3) stationCommand(sim, "arrive");
      break;
    case "approaching":
      if (s.vehicle.parked) enter(sim, "detected", "Presence sensors triggered");
      break;
    case "detected":
      if (t > 0.6) enter(sim, "identification", "Vehicle stationary over the bay");
      break;
    case "identification":
      if (t > 1.0) enter(sim, faults.unauthorizedVehicle ? "unauthorized" : "communication", faults.unauthorizedVehicle ? "Identity not recognised" : "Identity received", faults.unauthorizedVehicle);
      break;
    case "communication":
      if (c.linkAlive && t > 0.8) enter(sim, s.authorized ? "alignment" : "authorization", "BMS heartbeat received");
      else if (t > 6) enter(sim, "comm-timeout", "No heartbeat from the vehicle");
      break;
    case "authorization":
      if (s.backendReply === "accepted" || (s.backendReply === "offline" && inputs.offlineAuthorization)) {
        s.authorized = true;
        enter(sim, "alignment", s.backendReply === "accepted" ? "Backend authorised the session" : "Authorised from the offline list");
      } else if (s.backendReply === "rejected") enter(sim, "unauthorized", "Backend rejected the session");
      else if (t > 6) enter(sim, s.backendReply === "offline" ? "unauthorized" : "comm-timeout", "No authorisation response");
      break;
    case "alignment":
      if (t > 1.0) enter(sim, aligned ? "battery-check" : "misalignment", aligned ? "Offset within tolerance" : "Offset outside tolerance");
      break;
    case "battery-check":
      if (t > 0.8) {
        if (s.battery.soc >= inputs.targetSoc) enter(sim, "completed", "SOC already at or above target");
        else if (acceptance.current <= 0) enter(sim, "battery-limit", "BMS accepts no charge");
        else enter(sim, "safety-checks", "BMS limits received");
      }
      break;
    case "safety-checks":
      if (t > 1.0) enter(sim, "low-power-init", "Objects, insulation and temperatures OK");
      break;
    case "low-power-init":
      if (t > 1.5) {
        if (s.coupler.k < inputs.kMin) enter(sim, "misalignment", `Coupling ${s.coupler.k.toFixed(3)} below minimum`);
        else enter(sim, "resonance-check", "Coupling measured");
      }
      break;
    case "resonance-check":
      if (t > 0.4 && t < 0.45 && inputs.adaptiveResonance) tuneFrequency(sim);
      if (t > 1.0) enter(sim, "ramp-up", s.point.ss && s.point.ss.phaseIn > 0 ? "Inductive input phase (ZVS)" : "Detuned: continuing without ZVS");
      break;
    case "ramp-up":
      lastLimit.set(sim, s.limitedBy);
      if (s.pCmd >= s.pTarget - 1 && t > 0.5) enter(sim, "charging", "Set-point reached");
      if (s.battery.soc >= inputs.targetSoc) enter(sim, "target-reached", "Target SOC reached");
      break;
    case "charging":
    case "grid-limited": {
      if (s.battery.soc >= inputs.targetSoc) enter(sim, "target-reached", "Target SOC reached");
      else if (s.coupler.k < inputs.kMin) enter(sim, "misalignment", "Coupling fell below minimum");
      else if (acceptance.current <= 0) enter(sim, "battery-limit", "BMS stopped accepting charge");
      else if (s.limitedBy === "grid" && s.phase !== "grid-limited") enter(sim, "grid-limited", "Grid availability is the binding limit");
      else if (s.limitedBy !== "grid" && s.phase === "grid-limited") enter(sim, "optimizing", "Grid availability restored");
      else if (s.phase === "charging" && lastLimit.get(sim) !== s.limitedBy) enter(sim, "optimizing", `Binding limit is now ${s.limitedBy}`);
      lastLimit.set(sim, s.limitedBy);
      break;
    }
    case "optimizing":
      if (t > 0.3 && t < 0.35 && inputs.adaptiveResonance) tuneFrequency(sim);
      if (t > 1.5) enter(sim, "charging", "Re-optimised");
      lastLimit.set(sim, s.limitedBy);
      break;
    case "target-reached":
      if (t > 0.5) enter(sim, "ramp-down", "Ramping down");
      break;
    case "ramp-down":
      if (s.pCmd <= 0) {
        enter(sim, "completed", "Power at zero; pad de-energised");
      }
      break;
    case "completed":
      if (t > 3 && !inputs.holdAfterComplete) enter(sim, "departure", "Session closed");
      break;
    case "departure":
      if (s.vehicle.x < sim.inputs.longitudinal - p.receiverOffset - 9) {
        s.vehicle = { ...s.vehicle, present: false, parked: false, v: 0 };
        s.authorized = false;
        enter(sim, "available", "Bay clear");
      }
      break;
    // ── Abnormal states and their recovery ──
    case "misalignment":
      if (aligned && s.coupler.k >= inputs.kMin && t > 1) enter(sim, "alignment", "Re-parked");
      break;
    case "unauthorized":
      if (!faults.unauthorizedVehicle && t > 1) {
        s.backendReply = "none";
        enter(sim, "authorization", "Retry: identity cause cleared");
      }
      break;
    case "comm-timeout":
      if (c.linkAlive && t > 1) enter(sim, "communication", "Link restored");
      break;
    case "foreign-object":
      s.clearTimer = c.fodDetected ? 0 : s.clearTimer + 0.05;
      if (!faults.foreignObject && t > 2) enter(sim, "safety-checks", "Object removed");
      break;
    case "living-object":
      if (!c.lodDetected && t > 3) enter(sim, "safety-checks", "Protected zone clear");
      break;
    case "over-temperature":
      if (c.coolEnough) enter(sim, "safety-checks", "Cooled below limit");
      break;
    case "overcurrent":
    case "isolation-fault":
    case "emergency-stop":
    case "controller-failure": {
      const cleared = (s.phase !== "isolation-fault" || !faults.isolationFault) && (s.phase !== "emergency-stop" || !faults.emergencyStop) && (s.phase !== "controller-failure" || !faults.controllerFailure) && (s.phase !== "overcurrent" || !faults.overcurrentEvent);
      if (cleared && !s.latched) enter(sim, s.vehicle.parked ? "safety-checks" : "available", "Reset by operator");
      break;
    }
    case "battery-limit":
      if (s.battery.soc >= inputs.targetSoc) enter(sim, "completed", "Target SOC reached");
      else if (acceptance.current > 0 && t > 2) enter(sim, "safety-checks", "BMS accepts charge again");
      break;
    case "station-unavailable":
      if (!faults.stationUnavailable) enter(sim, s.vehicle.parked ? "safety-checks" : "available", "Returned to service");
      break;
  }
}
const lastLimit = new WeakMap<StationSim, string>();

/** Adaptive resonance: picks the frequency in the band that maximises link efficiency while keeping an inductive input phase. */
export function tuneFrequency(sim: StationSim): void {
  const s = sim.state;
  const p = sim.params;
  const [lo, hi] = p.band;
  const power = Math.max(p.initPower, s.pCmd);
  const temps = { txCoil: s.temperatures.txCoil, rxCoil: s.temperatures.rxCoil, inverter: s.temperatures.inverter };
  const cost = (f: number) => {
    const pt = solveChain(p.chain, chainSetup(p, sim.inputs, s.coupler, s.design, f, temps, sim.inputs.gridLimit), power);
    if (!pt.ss) return 1e9;
    const phasePenalty = pt.ss.phaseIn < 0.05 ? 10 * (0.05 - pt.ss.phaseIn) : 0;
    return pt.totalLoss / power + phasePenalty;
  };
  s.frequency = goldenMin(cost, lo, hi, 20);
  sim.feasibleCache = null;
}

function exchangeMessages(sim: StationSim, faults: StationFaults, bp: BatteryParams) {
  const s = sim.state;
  const bus = sim.bus;
  const t = s.t;
  const tm = sim.timers;
  const vehiclePaired = s.vehicle.present && s.phase !== "approaching" && s.phase !== "detected" && s.phase !== "identification" && s.phase !== "departure";
  // BMS → VCU on CAN, 10 Hz.
  if (s.vehicle.present && t >= tm.can) {
    tm.can = t + 0.1;
    bus.send(t, "can", "BMS", "VCU", "BMS_STATUS", { soc: +(s.battery.soc * 100).toFixed(1), packV: +s.batteryVoltage.toFixed(1), packA: +s.batteryCurrent.toFixed(1), maxT: +s.battery.temperature.toFixed(1) });
  }
  // VCU → station heartbeat with BMS limits, 4 Hz, once paired.
  if (vehiclePaired && t >= tm.heartbeat) {
    tm.heartbeat = t + 0.25;
    const acc = chargeAcceptance(bp, s.battery, sim.inputs.targetSoc, 1);
    bus.send(t, "vehicle", "VCU", "Station", "BMS_HEARTBEAT", { soc: +(s.battery.soc * 100).toFixed(2), acceptW: Math.round(acc.power), packV: +s.batteryVoltage.toFixed(1), tMax: +s.battery.temperature.toFixed(1), ready: true });
  }
  // Station → VCU power set-point, on change.
  if (vehiclePaired && PHASES[s.phase].energised && Math.abs(s.pCmd - (tm.lastSetpoint ?? -1)) > 250) {
    tm.lastSetpoint = s.pCmd;
    bus.send(t, "vehicle", "Station", "VCU", "POWER_SETPOINT", { watts: Math.round(s.pCmd), freqHz: Math.round(s.frequency), kEst: +s.coupler.k.toFixed(3) });
  }
  // Phase-entry messages.
  const entered = tm.lastPhase !== phaseIndex(s.phase);
  if (entered) {
    tm.lastPhase = phaseIndex(s.phase);
    if (s.phase === "identification") bus.send(t, "vehicle", "VCU", "Station", "IDENTIFY", { vehicleId: "EVSIM042", wptClass: "WPT2", zClass: "Z2", capable: true });
    if (s.phase === "communication") bus.send(t, "vehicle", "Station", "VCU", "PAIRING_ACK", { session: Math.round(t * 10), ok: true });
    if (s.phase === "authorization") {
      const sent = bus.send(t, "backend", "Station", "Backend", "Authorize", { idToken: faults.unauthorizedVehicle ? "UNKNOWN" : "EVSIM042", evse: 1 });
      tm.authSentAt = t;
      if (!sent || !bus.links.backend.up) s.backendReply = "offline";
    }
    if (s.phase === "ramp-up") bus.send(t, "backend", "Station", "Backend", "TransactionEvent", { eventType: "Started", evse: 1, meterWh: Math.round(s.energy.grid / 3600) });
    if (s.phase === "completed") bus.send(t, "backend", "Station", "Backend", "TransactionEvent", { eventType: "Ended", evse: 1, meterWh: Math.round(s.energy.grid / 3600), cost: +s.cost.toFixed(2) });
    if (PHASES[s.phase].kind === "fault") bus.send(t, "cloud", "Gateway", "Cloud", "ALARM", { state: s.phase.slice(0, 4), t: +t.toFixed(2) });
  }
  // Gateway → cloud telemetry, 0.5 Hz; backend meter values, every 10 s while energised.
  if (t >= tm.cloud) {
    tm.cloud = t + 2;
    bus.send(t, "cloud", "Gateway", "Cloud", "TELEMETRY", { pGridW: Math.round(s.point.pGrid), pBatW: Math.round(s.point.pBattery), eff: +(s.point.efficiency * 100).toFixed(1), tTx: +s.temperatures.txCoil.toFixed(1), soc: +(s.battery.soc * 100).toFixed(1) });
  }
  if (PHASES[s.phase].energised && t >= tm.meter) {
    tm.meter = t + 10;
    bus.send(t, "backend", "Station", "Backend", "MeterValues", { evse: 1, powerW: Math.round(s.point.pGrid), energyWh: Math.round(s.energy.grid / 3600) });
  }
  // Backend reply to an authorisation request: it answers after its own latency (simulated backend).
  for (const m of bus.deliver(t)) handle(sim, m, faults);
  if (s.phase === "authorization" && s.backendReply === "none" && !bus.links.backend.up) s.backendReply = "offline";
}

function handle(sim: StationSim, m: Delivered, faults: StationFaults) {
  const s = sim.state;
  if (m.status === "auth-failed" || m.status === "duplicate") return;
  if (m.type === "BMS_HEARTBEAT" && m.status !== "stale") s.lastHeartbeat = m.receivedAt;
  if (m.type === "Authorize" && m.dst === "Backend") {
    const accepted = !faults.unauthorizedVehicle && m.payload.idToken !== "UNKNOWN";
    sim.bus.send(m.receivedAt, "backend", "Backend", "Station", "AuthorizeResponse", { status: accepted ? "Accepted" : "Invalid", evse: 1 });
  }
  if (m.type === "AuthorizeResponse") s.backendReply = m.payload.status === "Accepted" ? "accepted" : "rejected";
}

const phaseIndex = (id: PhaseId) => Object.keys(PHASES).indexOf(id);

/** Index of the phase in the normal sequence (0-based), or -1 for an abnormal state. */
export const sequenceIndex = (id: PhaseId) => NORMAL_SEQUENCE.indexOf(id);

/** Energy conservation residual of the ledger: grid − (battery terminals + every stage's loss), J. */
export function ledgerResidual(e: StageEnergy): number {
  return e.grid - (e.batteryTerminals + e.transformer + e.pfc + e.inverter + e.txCoil + e.rxCoil + e.rectifier + e.dcdc);
}

/**
 * Runs a session headless with a fixed step until it completes (or `maxTime`),
 * returning samples for plotting. Deterministic for the same inputs and seed.
 */
export function runStationSession(inputs: StationInputs, opts: { dt?: number; maxTime?: number; seed?: number; sampleEvery?: number; faults?: StationFaults } = {}) {
  const dt = opts.dt ?? 1;
  const sim = createStation({ ...inputs, autoCycle: false }, opts.seed ?? 20261125);
  const faults = opts.faults ?? NO_FAULTS;
  const samples: { t: number; soc: number; pBattery: number; pGrid: number; efficiency: number; tTx: number; tBat: number; phase: PhaseId }[] = [];
  const every = opts.sampleEvery ?? 30;
  let next = 0;
  const maxTime = opts.maxTime ?? 12 * 3600;
  // Arrival and the pre-charge sequence need short steps; charging can use dt.
  while (sim.state.t < maxTime) {
    const h = PHASES[sim.state.phase].energised && sim.state.phase !== "low-power-init" && sim.state.phase !== "resonance-check" && sim.state.phase !== "ramp-up" ? dt : 0.05;
    stepStation(sim, faults, h);
    if (sim.state.t >= next) {
      next += every;
      samples.push({ t: sim.state.t, soc: sim.state.battery.soc, pBattery: sim.state.point.pBattery, pGrid: sim.state.point.pGrid, efficiency: sim.state.point.efficiency, tTx: sim.state.temperatures.txCoil, tBat: sim.state.battery.temperature, phase: sim.state.phase });
    }
    if (sim.state.phase === "completed" || (PHASES[sim.state.phase].kind === "fault" && sim.state.phaseTime > 60)) break;
  }
  return { sim, samples, record: sim.state.sessions.at(-1) ?? sim.state.session, residual: ledgerResidual(sim.state.energy) };
}

/** A quick estimate of time to target at the present power (instantaneous, not simulated), s. */
export function chargingTimeEstimate(sim: StationSim): number {
  const bp = batteryFor(sim.params, sim.inputs);
  const remainingAh = Math.max(0, sim.inputs.targetSoc - sim.state.battery.soc) * packCapacityAh(bp);
  const I = sim.state.batteryCurrent;
  return I > 0.1 ? (remainingAh * 3600) / I : Number.POSITIVE_INFINITY;
}

/** Inverter conduction angle needed for the present point, degrees (NaN if out of range). */
export const conductionAngleDeg = (sim: StationSim) => {
  const ss = sim.state.point.ss;
  return ss ? (bridgeAngle(sim.params.chain.vdcLink, cabs(ss.v1)) * 180) / Math.PI : 0;
};

export { clamp };
