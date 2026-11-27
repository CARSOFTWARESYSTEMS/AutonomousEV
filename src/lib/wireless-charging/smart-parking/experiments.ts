// Research experiments (SP-RES-001). Each experiment is reproducible (seeded),
// states its method, and returns rows and notes. Policy and demand studies use
// an event-level simulation built from the same allocation engine, vehicle
// generator and reservation rules as the facility — without vehicle motion,
// so a whole day runs in milliseconds. Charging time in the event-level runs
// comes from a declared surrogate (constant battery-side power, the Station's
// rated 11 kW) that check SP-B09 compares with full Station sessions.
import { createRng } from "../math";
import { runStationSession, DEFAULT_STATION_INPUTS } from "../station";
import { allocate, type AllocationPolicy, type BayView, DEFAULT_WEIGHTS } from "./allocation";
import { chargingBill, parkingBill, TARIFFS, type Tariff } from "./billing";
import { DEFAULT_ENERGY, dispatch, newLedger, newStorage, pvPower, type EnergyInputs } from "./energy";
import { DEFAULT_ENV, newEnv, stepEnv } from "./environment";
import { DEFAULT_RECOGNITION, recognise } from "./identification";
import { buildLayout, DEFAULT_LAYOUT, type LayoutInputs, SPEED, TURN_RADIUS } from "./layout";
import { cameraSample, debounce, DEFAULT_FUSION, fuse, type FusionStrategy, infraredSample, nodeDecision, type NodeState, type SensorKind, ultrasonicSample } from "./occupancy";
import { arrivals, mmck, runDes } from "./queueing";
import { Broker, DEFAULT_LAN, ingest, newIngest, percentile, SCHEMA, topic } from "./telemetry";
import type { BayStatus, Region } from "./types";
import type { RecordedSession } from "./adapters";
import { DEFAULT_FUSION as FUSION } from "./occupancy";
import { DEFAULT_MIX, type Mix, syntheticVehicle } from "./vehicles";

export const SURROGATE_POWER = 11000;

export type Baseline = AllocationPolicy | "manual";

export interface EventRunInputs {
  layout: LayoutInputs;
  policy: Baseline;
  arrivalsPerHour: number;
  hours: number;
  mix: Mix;
  queue: number;
  patience: number;
  overflowToWireless: boolean;
  region: Region;
  seed: number;
}

export const DEFAULT_EVENT_RUN: EventRunInputs = { layout: DEFAULT_LAYOUT, policy: "multi-objective", arrivalsPerHour: 7, hours: 10, mix: DEFAULT_MIX, queue: 4, patience: 480, overflowToWireless: false, region: "IN", seed: 4242 };

export interface EventRunResult {
  policy: Baseline;
  arrived: number;
  parked: number;
  balked: number;
  abandoned: number;
  utilisation: number;
  meanWait: number;
  /** Mean time from the gate to a stop in the bay, s (guidance: direct; manual: cruising). */
  meanSearch: number;
  /** EVs that asked to charge and got a wireless bay, of those that asked. */
  chargingServed: number;
  chargingAsked: number;
  /** Share of wireless-bay hours used by charging EVs. */
  wirelessUtilisation: number;
  energyKWh: number;
  meanWalk: number;
}

/**
 * Event-level run of one policy. "manual" is the conventional baseline: no
 * guidance and no reservation of wireless bays — drivers take the first free
 * bay they pass (any bay), cruising the aisle and round the loop when none is
 * free.
 */
export function runEventLevel(i: EventRunInputs): EventRunResult {
  const layout = buildLayout(i.layout);
  const r = createRng(i.seed);
  const vr = createRng(i.seed + 1);
  const horizon = i.hours * 3600;
  const times = arrivals(i.arrivalsPerHour / 3600, 0, horizon, "commuter", 7, r);
  type Occ = { until: number; charging: boolean; chargeUntil: number };
  const occ: (Occ | null)[] = layout.bays.map(() => null);
  const queue: { t: number; v: ReturnType<typeof syntheticVehicle>; patience: number }[] = [];
  let parked = 0;
  let balked = 0;
  let abandoned = 0;
  let waitSum = 0;
  let searchSum = 0;
  let walkSum = 0;
  let busy = 0;
  let wirelessCharging = 0;
  let asked = 0;
  let served = 0;
  let energy = 0;
  let last = 0;
  const wireless = layout.bays.filter((b) => b.type === "wireless").length;
  const views = (): BayView[] =>
    layout.bays.map((bay, k) => ({ bay, status: (occ[k] ? "occupied" : "available") as BayStatus, version: 0, heldFor: null, chargerOk: true, chargerPower: SURROGATE_POWER, congestion: 0, energyPrice: 850 }));
  const tryPark = (t: number, v: ReturnType<typeof syntheticVehicle>): boolean => {
    let k = -1;
    let search = 0;
    if (i.policy === "manual") {
      // Drive past the bays in order; take the first free one the driver may use (accessible bays respected, wireless bays not protected).
      const order = [...layout.bays].sort((a, b) => a.drive - b.drive);
      const free = order.find((b) => !occ[b.index] && (b.type !== "accessible" || v.accessiblePermit));
      if (!free) return false;
      k = free.index;
      // Cruising: drivers look at each bay as they pass; one loop of the aisle in four when the first pass misses (declared).
      search = (free.drive + (r.next() < 0.25 ? 2 * (layout.aisle.xEast - layout.aisle.xWest) : 0)) / (SPEED.aisle * 0.7) + 6;
    } else {
      const res = allocate(views(), { vehicle: v, reservation: null, facilityBlocked: null, overflowToWireless: i.overflowToWireless, upcoming: new Set() }, i.policy, DEFAULT_WEIGHTS);
      if (!res.bayId) return false;
      k = layout.bays.findIndex((b) => b.id === res.bayId);
      search = layout.bays[k].drive / SPEED.aisle + (Math.PI / 2) * TURN_RADIUS / SPEED.turn;
    }
    const bay = layout.bays[k];
    const wants = v.wirelessCompatible && v.wantsCharging;
    const charging = wants && bay.type === "wireless";
    const need = charging ? Math.max(0, v.targetSoc - v.soc) * v.capacityKWh : 0;
    const chargeTime = (need * 3.6e6) / SURROGATE_POWER;
    occ[k] = { until: t + v.stay, charging, chargeUntil: t + Math.min(v.stay, chargeTime) };
    if (charging) energy += Math.min(need, (v.stay * SURROGATE_POWER) / 3.6e6);
    parked += 1;
    searchSum += search;
    walkSum += bay.walk;
    if (wants) served += charging ? 1 : 0;
    return true;
  };
  const events = times.map((t) => ({ t, v: syntheticVehicle(i.region, vr, i.mix, {}, 0) }));
  let e = 0;
  for (let t = 0; t <= horizon; t += 5) {
    // Integrals.
    const dt = t - last;
    busy += occ.filter(Boolean).length * dt;
    wirelessCharging += layout.bays.filter((b, k) => b.type === "wireless" && occ[k]?.charging && t < (occ[k]?.chargeUntil ?? 0)).length * dt;
    last = t;
    for (let k = 0; k < occ.length; k++) if (occ[k] && occ[k]!.until <= t) occ[k] = null;
    for (let q = queue.length - 1; q >= 0; q--)
      if (t - queue[q].t > queue[q].patience) {
        queue.splice(q, 1);
        abandoned += 1;
      }
    while (queue.length && tryPark(t, queue[0].v)) {
      waitSum += t - queue[0].t;
      queue.shift();
    }
    while (e < events.length && events[e].t <= t) {
      const { v } = events[e++];
      if (v.wirelessCompatible && v.wantsCharging) asked += 1;
      if (v.denied) continue;
      if (!queue.length && tryPark(t, v)) continue;
      if (queue.length < i.queue) queue.push({ t, v, patience: -Math.log(1 - r.next()) * i.patience });
      else balked += 1;
    }
  }
  return {
    policy: i.policy,
    arrived: events.length,
    parked,
    balked,
    abandoned,
    utilisation: busy / (horizon * layout.bays.length),
    meanWait: parked ? waitSum / parked : 0,
    meanSearch: parked ? searchSum / parked : 0,
    chargingServed: served,
    chargingAsked: asked,
    wirelessUtilisation: wireless ? wirelessCharging / (horizon * wireless) : 0,
    energyKWh: energy,
    meanWalk: parked ? walkSum / parked : 0,
  };
}

/** Allocation policies against the manual baseline, same arrivals and vehicles (common random numbers). */
export function comparePolicies(base: Partial<EventRunInputs> = {}): EventRunResult[] {
  const policies: Baseline[] = ["manual", "first-available", "nearest", "reservation-priority", "charging-aware", "multi-objective"];
  return policies.map((policy) => runEventLevel({ ...DEFAULT_EVENT_RUN, ...base, policy }));
}

/** Compatible-EV share sweep: charging demand against wireless bay supply. */
export function chargingDemandSweep(shares: number[] = [0.1, 0.25, 0.4, 0.6, 0.8], base: Partial<EventRunInputs> = {}) {
  return shares.map((s) => {
    const r = runEventLevel({ ...DEFAULT_EVENT_RUN, ...base, policy: "multi-objective", mix: { ...DEFAULT_MIX, evShare: s / DEFAULT_MIX.wirelessShare > 1 ? 1 : s / DEFAULT_MIX.wirelessShare } });
    return { compatibleShare: s, ...r };
  });
}

// ── Capacity and congestion: DES against M/M/c/K ─────────────────────────

export function capacityStudy(bays = 12, queue = 4, meanStayH = 2, rates = [2, 4, 5, 6, 7, 8, 10], seed = 99) {
  return rates.map((perHour) => {
    const lambda = perHour / 3600;
    const mu = 1 / (meanStayH * 3600);
    const a = mmck(lambda, mu, bays, bays + queue);
    const exp = runDes({ bays, queue, rate: lambda, meanStay: meanStayH * 3600, stay: "exponential", profile: "constant", startHour: 0, patience: 0, gate: 0, horizon: 400 * 3600, warmup: 20 * 3600, seed });
    const logn = runDes({ bays, queue, rate: lambda, meanStay: meanStayH * 3600, stay: "lognormal", profile: "constant", startHour: 0, patience: 0, gate: 0, horizon: 400 * 3600, warmup: 20 * 3600, seed });
    return { perHour, offered: lambda / mu, analytic: a, desExponential: exp, desLognormal: logn };
  });
}

// ── Sensor fusion evaluation ─────────────────────────────────────────────

export interface FusionEval {
  strategy: FusionStrategy;
  accuracy: number;
  uncertain: number;
  falseOccupied: number;
  falseVacant: number;
  samples: number;
}

/**
 * Monte Carlo of bay states (occupied with probability 0.6, held for 30–300 s)
 * through the three sensor models, node debounce and fusion, with an optional
 * faulty sensor. Accuracy counts decided samples only; uncertain is reported
 * separately (it is never counted as right).
 */
export function evaluateFusion(fault: { kind: SensorKind; mode: "none" | "stuck-occupied" | "stuck-vacant" | "noisy" | "disconnected" } = { kind: "infrared", mode: "none" }, seconds = 3 * 3600, seed = 5): FusionEval[] {
  return (["bayes", "majority", "priority", "ultrasonic-only"] as FusionStrategy[]).map((strategy) => {
    const r = createRng(seed);
    const params = { ...DEFAULT_FUSION, strategy };
    const nodes: Record<string, NodeState> = Object.fromEntries((["ultrasonic", "infrared", "camera"] as const).map((k) => [k, { kind: k, state: null, pending: null, count: 0, last: null, changedAt: 0 }]));
    let occupied = false;
    let next = 0;
    let changed = 0;
    let prev: boolean | null = null;
    let right = 0;
    let unsure = 0;
    let fo = 0;
    let fv = 0;
    let n = 0;
    for (let t = 0; t < seconds; t += 0.5) {
      if (t >= next) {
        const was: boolean = occupied;
        occupied = r.next() < 0.6;
        if (occupied !== was) changed = t;
        next = t + 30 + r.next() * 270;
      }
      const f = (k: SensorKind) => (fault.kind === k ? fault.mode : "none");
      const raws = { ultrasonic: ultrasonicSample(occupied, 1.5, 2.9, r, f("ultrasonic")), infrared: infraredSample(occupied, 600, r, f("infrared")), camera: cameraSample(occupied, 400, r, f("camera")) };
      for (const k of ["ultrasonic", "infrared", "camera"] as const) debounce(nodes[k], nodeDecision(k, raws[k], nodes[k].state), t);
      const votes = (["ultrasonic", "infrared", "camera"] as const).map((k) => ({ kind: k as SensorKind, state: nodes[k].state, at: t, mode: "SIMULATED" as const }));
      const res = fuse(votes, t, prev, params);
      // Judge from 3 s after a change (the debounce latency is part of the design).
      if (t - changed < 3) continue;
      n += 1;
      if (res.decision === "uncertain") unsure += 1;
      else {
        const said = res.decision === "occupied";
        prev = said;
        if (said === occupied) right += 1;
        else if (said) fo += 1;
        else fv += 1;
      }
    }
    const decided = Math.max(1, n - unsure);
    return { strategy, accuracy: right / decided, uncertain: unsure / Math.max(1, n), falseOccupied: fo / decided, falseVacant: fv / decided, samples: n };
  });
}

// ── Recognition performance ──────────────────────────────────────────────

export function recognitionStudy(thresholds = [0.7, 0.8, 0.85, 0.9, 0.95], n = 4000, seed = 13) {
  const conditions = [
    { label: "Daylight, clean plate", lux: 5000, rain: false, obstructed: false },
    { label: "Night (lit), clean plate", lux: 40, rain: false, obstructed: false },
    { label: "Rain, daylight", lux: 3000, rain: true, obstructed: false },
    { label: "Partly obstructed plate", lux: 5000, rain: false, obstructed: true },
  ];
  return conditions.map((c) => {
    const rows = thresholds.map((th) => {
      const r = createRng(seed);
      let acceptRight = 0;
      let acceptWrong = 0;
      let fallback = 0;
      for (let k = 0; k < n; k++) {
        const v = syntheticVehicle("IN", r, { ...DEFAULT_MIX, obstructedShare: 0 }, { plateObstructed: c.obstructed }, k);
        const rec = recognise(v, "IN", { lux: c.lux, rain: c.rain, cameraFault: false }, r, { ...DEFAULT_RECOGNITION, acceptThreshold: th });
        if (rec.outcome === "recognised") {
          if (rec.correct) acceptRight += 1;
          else acceptWrong += 1;
        } else fallback += 1;
      }
      return { threshold: th, autoAccepted: acceptRight / n, falseAccept: acceptWrong / n, fallback: fallback / n };
    });
    return { condition: c.label, rows };
  });
}

// ── IoT reliability ──────────────────────────────────────────────────────

export function iotReliability(cases = [{ loss: 0.002, latency: 0.012 }, { loss: 0.02, latency: 0.05 }, { loss: 0.1, latency: 0.2 }, { loss: 0.3, latency: 0.5 }], seed = 21) {
  return cases.map((c) => {
    const broker = new Broker(seed, { ...DEFAULT_LAN, loss: c.loss, latency: c.latency, jitter: c.latency / 2, duplicate: 0.02 });
    const st = newIngest();
    const site = "EVE-LAB";
    broker.connect({ id: "US-N01", publish: [topic("occupancy", site, "N01"), topic("telemetry", site, "US-N01")], subscribe: [], tls: true, lastWill: null });
    let seq = 0;
    let sent = 0;
    const lat: number[] = [];
    for (let t = 0; t < 600; t += 0.5) {
      seq += 1;
      sent += 1;
      broker.publish("US-N01", topic("occupancy", site, "N01"), { schema: SCHEMA, eventId: `US-N01-${seq}`, siteId: site, deviceId: "US-N01", sensorId: "ultrasonic", ts: t * 1000, seq, measurement: { raw: 1.4, value: true }, unit: "m", quality: "good", mode: "SIMULATED" }, t);
      for (const e of broker.deliver(t)) {
        ingest(st, e, t * 1000, 3000);
        lat.push(e.arriveAt - e.sentAt);
      }
    }
    return { ...c, sent, accepted: st.counts.accepted, duplicatesSuppressed: st.counts.duplicate, outOfOrder: st.counts.outOfOrder, stale: st.counts.stale, deliveredShare: st.counts.accepted / sent, p95Latency: percentile(lat, 0.95) };
  });
}

// ── Energy optimisation over a day ───────────────────────────────────────

export function energyStudy(chargingKWhPerDay = 120, energy: EnergyInputs = DEFAULT_ENERGY, cloud = 0.25) {
  const env = { ...DEFAULT_ENV, cloud };
  const modes = [
    { label: "Grid only", pv: false, bess: false },
    { label: "Solar-assisted", pv: true, bess: false },
    { label: "Solar + storage", pv: true, bess: true },
  ];
  return modes.map((m) => {
    const e: EnergyInputs = { ...energy, pvArea: m.pv ? energy.pvArea : 0, bessKWh: m.bess ? energy.bessKWh : 0, bessKW: m.bess ? energy.bessKW : 0 };
    const store = newStorage(e);
    const ledger = newLedger();
    const st = newEnv(env, 0);
    let peak = 0;
    let cost = 0;
    const dt = 60;
    for (let t = 0; t < 86400; t += dt) {
      const hour = t / 3600;
      stepEnv(st, env, { equipment: 300, movingCombustion: 0, smokeSource: false, gasSource: false, fanFailure: false, activity: hour > 7 && hour < 21, sensorFailure: false }, hour, dt, createRng(1));
      // Charging demand follows a commuter day (declared shape), scaled to the daily energy.
      const shape = Math.exp(-((hour - 10) ** 2) / 6) + 0.6 * Math.exp(-((hour - 15) ** 2) / 5);
      const charging = Math.min(4 * energy.chargerPower, ((chargingKWhPerDay * 3.6e6) / (86400 * 0.34)) * shape);
      const pv = m.pv ? pvPower(e, st.irradiance, st.ambient).power : 0;
      const price = hour >= 18 && hour < 22 ? e.price.peak : hour >= 22 || hour < 6 ? e.price.offPeak : e.price.standard;
      const before = ledger.gridCost;
      const step = dispatch(e, store, { essential: 400, comfort: 960 * st.lighting + 300 * st.fanDuty }, charging, pv, true, price, dt, ledger);
      cost += ledger.gridCost - before;
      peak = Math.max(peak, step.grid);
    }
    return { mode: m.label, gridKWh: ledger.grid / 3.6e6, pvKWh: ledger.pv / 3.6e6, curtailedKWh: ledger.curtailed / 3.6e6, peakKW: peak / 1000, cost, unmetKWh: ledger.unmet / 3.6e6, maxResidual: ledger.maxResidual };
  });
}

// ── Environmental safety ─────────────────────────────────────────────────

export function environmentalStudy() {
  const scenarios = [
    { label: "Simulated smoke source", smoke: true, gas: false, fanFailure: false },
    { label: "Simulated gas release", smoke: false, gas: true, fanFailure: false },
    { label: "Smoke with failed fans", smoke: true, gas: false, fanFailure: true },
  ];
  return scenarios.map((sc) => {
    const st = newEnv(DEFAULT_ENV, 13);
    let alarmAt: number | null = null;
    let peak = 0;
    for (let t = 0; t < 900; t += 1) {
      stepEnv(st, DEFAULT_ENV, { equipment: 2000, movingCombustion: 0, smokeSource: sc.smoke && t < 300, gasSource: sc.gas && t < 300, fanFailure: sc.fanFailure, activity: true, sensorFailure: false }, 13 + t / 3600, 1, createRng(1));
      if (st.alarm !== "none" && alarmAt === null) alarmAt = t;
      peak = Math.max(peak, sc.gas ? st.gas : st.smoke);
    }
    return { scenario: sc.label, alarmAfter: alarmAt, peak, unit: sc.gas ? "%LEL" : "%/m", fanAtAlarm: sc.fanFailure ? 0 : 1, residual: sc.gas ? st.gas : st.smoke };
  });
}

// ── Pricing (no behavioural prediction) ──────────────────────────────────

export function pricingStudy(region: Region = "IN", variants: { label: string; patch: Partial<Tariff> }[] = [], seed = 3) {
  const base = TARIFFS[region];
  const list = [{ label: "Configured tariff", patch: {} }, { label: "Shorter blocks (15 min)", patch: { blockMin: 15, block: Math.round(base.block / 2) } }, { label: "No grace period", patch: { graceMin: 0 } }, ...variants];
  const r = createRng(seed);
  const stays = Array.from({ length: 2000 }, () => Math.exp(Math.log(2.5 * 3600) - 0.25 + 0.7 * r.normal()));
  return list.map((v) => {
    const t = { ...base, ...v.patch };
    const bills = stays.map((s) => parkingBill(t, s, { reservation: false, member: false, accessible: false }));
    const hours = stays.reduce((a, b) => a + b, 0) / 3600;
    const revenue = bills.reduce((a, b) => a + b.total, 0);
    const charge = chargingBill(t, 30 * 3.6e6 * 1.067, 30 * 3.6e6);
    return { tariff: v.label, meanBill: revenue / bills.length, perBayHour: revenue / hours, capped: bills.filter((b) => b.capped).length / bills.length, charging30kWh: charge.total };
  });
}

// ── Scalability (measured on this device) ─────────────────────────────────

export function scalabilityStudy(sizes = [12, 50, 100, 500, 1000]) {
  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
  return sizes.map((n) => {
    const layout = buildLayout({ ...DEFAULT_LAYOUT, bays: n, wireless: Math.round(n / 3), accessible: Math.max(1, Math.round(n / 25)) });
    const r = createRng(1);
    const v = syntheticVehicle("IN", r, DEFAULT_MIX, { powertrain: "electric", wirelessCompatible: true, wantsCharging: true }, 1);
    const views: BayView[] = layout.bays.map((bay, k) => ({ bay, status: k % 3 ? "occupied" : "available", version: 0, heldFor: null, chargerOk: true, chargerPower: 11000, congestion: 0, energyPrice: 850 }));
    let t0 = now();
    const reps = n > 200 ? 20 : 100;
    for (let k = 0; k < reps; k++) allocate(views, { vehicle: v, reservation: null, facilityBlocked: null, overflowToWireless: false, upcoming: new Set() }, "multi-objective");
    const allocMs = (now() - t0) / reps;
    t0 = now();
    const des = runDes({ bays: n, queue: 10, rate: (n * 0.45) / 3600, meanStay: 7200, stay: "lognormal", profile: "commuter", startHour: 0, patience: 600, gate: 0, horizon: 86400, warmup: 3600, seed: 2 });
    const desMs = now() - t0;
    // Gateway ingestion throughput: every bay's three sensors reporting once.
    const st = newIngest();
    const broker = new Broker(3, { ...DEFAULT_LAN, loss: 0, duplicate: 0, latency: 0, jitter: 0 });
    for (let b = 0; b < n; b++) broker.connect({ id: `N-${b}`, publish: [topic("occupancy", "S", `B${b}`)], subscribe: [], tls: true, lastWill: null });
    t0 = now();
    let msgs = 0;
    for (let k = 0; k < 3; k++)
      for (let b = 0; b < n; b++) {
        broker.publish(`N-${b}`, topic("occupancy", "S", `B${b}`), { schema: SCHEMA, eventId: `N-${b}-${k}`, siteId: "S", deviceId: `N-${b}`, sensorId: `s${k}`, ts: 0, seq: k + 1, measurement: { raw: 1, value: true }, unit: "m", quality: "good", mode: "SIMULATED" }, 0);
        msgs += 1;
      }
    for (const e of broker.deliver(1)) ingest(st, e, 0, 5000);
    const ingestMs = now() - t0;
    return { bays: n, allocationMs: allocMs, desDayMs: desMs, desVehicles: des.arrived, messages: msgs, ingestMs, messagesPerSecond: msgs / Math.max(1e-6, ingestMs / 1000) };
  });
}

/** Station-model charging time for a session, against the event-level surrogate (check SP-A09). */
export function surrogateCheck(capacityKWh = 60, soc0 = 0.3, target = 0.8) {
  const { sim, record } = runStationSession({ ...DEFAULT_STATION_INPUTS, capacityKWh, initialSoc: soc0, targetSoc: target }, { dt: 5, sampleEvery: 600 });
  const station = record ? record.ended - record.started : sim.state.t;
  const surrogate = ((target - soc0) * capacityKWh * 3.6e6) / SURROGATE_POWER;
  return { station, surrogate, relative: Math.abs(surrogate - station) / station };
}

// ── Recorded replay ──────────────────────────────────────────────────────

export interface ReplayResult {
  messages: number;
  accepted: number;
  rejected: number;
  /** Bay states reconstructed from the recording alone, with their data mode. */
  bays: { bayId: string; decision: string; p: number; changes: number; mode: "RECORDED" }[];
}

/**
 * Replays a recording through the gateway's own ingestion and fusion. Every
 * value is labelled RECORDED; replay never drives an actuator.
 */
export function replayRecording(rec: RecordedSession): ReplayResult {
  const st = newIngest();
  const votes = new Map<string, Map<string, { kind: SensorKind; state: boolean; at: number; mode: "RECORDED" }>>();
  const prev = new Map<string, boolean | null>();
  const changes = new Map<string, number>();
  let rejected = 0;
  const tagless = (topicName: string, payload: unknown) => ({ topic: topicName, qos: 1 as const, retain: false, payload: payload as never, client: "replay", sentAt: 0, arriveAt: 0, tag: "" });
  for (const m of rec.messages) {
    const parts = m.topic.split("/");
    if (parts[4] !== "bays") continue;
    const payload = { ...(m.payload as Record<string, unknown>), mode: "RECORDED" } as { sensorId: string; measurement: { value: unknown }; mode: string };
    // The recording is trusted as captured: integrity was checked when it was recorded; ordering and duplicates are checked again.
    const env = tagless(m.topic, payload);
    const res = ingestTrusted(st, env, rec.startedAt + m.at * 1000);
    if (res !== "accepted") {
      rejected += 1;
      continue;
    }
    const bay = parts[5];
    const kind = payload.sensorId as SensorKind;
    const value = payload.measurement.value;
    if (typeof value !== "boolean") continue;
    if (!votes.has(bay)) votes.set(bay, new Map());
    votes.get(bay)!.set(kind, { kind, state: value, at: m.at, mode: "RECORDED" });
    const f = fuse([...votes.get(bay)!.values()], m.at, prev.get(bay) ?? null, FUSION);
    const now = f.decision === "uncertain" ? (prev.get(bay) ?? null) : f.decision === "occupied";
    if (now !== (prev.get(bay) ?? null)) changes.set(bay, (changes.get(bay) ?? 0) + 1);
    prev.set(bay, now);
  }
  const last = rec.messages.at(-1)?.at ?? 0;
  const bays = [...votes.keys()].sort().map((bayId) => {
    const f = fuse([...votes.get(bayId)!.values()], last, prev.get(bayId) ?? null, { ...FUSION, freshness: Number.POSITIVE_INFINITY });
    return { bayId, decision: f.decision, p: f.p, changes: changes.get(bayId) ?? 0, mode: "RECORDED" as const };
  });
  return { messages: rec.messages.length, accepted: st.counts.accepted, rejected, bays };
}

/** Ingestion of a recorded envelope: the integrity tag was verified at capture, the other checks run again. */
function ingestTrusted(st: ReturnType<typeof newIngest>, env: { topic: string; payload: unknown }, nowMs: number): string {
  const m = env.payload as { eventId: string; deviceId: string; sensorId: string; seq: number; ts: number; schema: string };
  if (m.schema !== SCHEMA) return "invalid";
  if (st.seenEvents.has(m.eventId)) return "duplicate";
  st.seenEvents.add(m.eventId);
  const key = `${m.deviceId}|${m.sensorId}|${env.topic}`;
  if (m.seq <= (st.lastSeq.get(key) ?? -1)) return "out-of-order";
  st.lastSeq.set(key, m.seq);
  st.counts.accepted += 1;
  void nowMs;
  return "accepted";
}
