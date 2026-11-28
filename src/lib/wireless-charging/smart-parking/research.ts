// Replicated research comparisons (SP-RES-002). Policies are compared on
// identical infrastructure, identical arrivals and identical vehicles (common
// random numbers), over many seeds, under normal demand, peak demand, a
// charging-constrained site and three fault scenarios, and summarised with
// means, standard deviations, percentiles and confidence intervals.
//
// Fairness rules, applied to every policy alike:
//  · the same bays (8 conventional including 1 accessible, 4 wireless), the
//    same 11 kW battery-side charger in each wireless bay, the same site grid
//    import limit, the same canopy PV and the same tariff;
//  · any vehicle may park in any bay except the accessible bay (which needs a
//    permit); no policy loses bays because another protects them;
//  · any compatible EV that asked to charge charges whenever it is parked in a
//    working wireless bay, whatever placed it there;
//  · the manual baseline is a declared behavioural assumption (drivers take
//    the first free bay they pass, one pass in four misses and loops the
//    aisle), not an observation.
//
// Event-level model, as SP-RES-001: no vehicle motion, a 5 s step, charging
// at constant battery-side power through a declared grid-to-battery
// efficiency, and a well-mixed queue at the entry. Every number it produces is
// a property of these assumptions on synthetic demand, never a measurement of
// a real facility.
import { createRng, type Rng } from "../math";
import { chargingBill, parkingBill, TARIFFS } from "./billing";
import { DEFAULT_ENERGY, pvPower } from "./energy";
import { ambientAt, DEFAULT_ENV, irradianceAt } from "./environment";
import { type Bay, buildLayout, DEFAULT_LAYOUT, type LayoutInputs, SPEED, TURN_RADIUS } from "./layout";
import { arrivals, type ArrivalProfile } from "./queueing";
import { DEFAULT_MIX, type Mix, syntheticVehicle } from "./vehicles";
import type { VehicleProfile } from "./types";

export const RESEARCH_MODEL = "SP-RES-002";
export const RESEARCH_VERSION = "1.0.0 (27 Nov 2026)";

export type ResearchPolicy = "manual" | "first-available" | "nearest" | "charging-compatible" | "soc-aware" | "energy-aware";

export const RESEARCH_POLICIES: readonly { id: ResearchPolicy; name: string; text: string }[] = [
  { id: "manual", name: "Manual parking (baseline)", text: "No guidance: drivers take the first free bay they pass (any type, the accessible bay only with a permit); one pass in four misses and loops the aisle." },
  { id: "first-available", name: "First available bay", text: "Guided to the lowest-numbered free bay (N01…N06, then S01…S06), any type." },
  { id: "nearest", name: "Nearest available bay", text: "Guided to the free bay with the shortest driving distance from the entry, any type." },
  { id: "charging-compatible", name: "Charging-compatible allocation", text: "Compatible EVs that asked to charge go to the nearest working wireless bay; every other vehicle to the nearest conventional bay, and to a wireless bay only when no conventional bay is free." },
  { id: "soc-aware", name: "SOC-aware allocation", text: "As charging-compatible, but the last free wireless bay is kept for a vehicle whose energy need (from its SOC and target) is at least 8 kWh." },
  { id: "energy-aware", name: "Energy-aware allocation", text: "Charging-compatible allocation plus charging power scheduled by least laxity under a grid import target of 15 kW above the PV available; a session that would otherwise miss its target by departure gets full power." },
];

export type ScenarioId = "normal" | "peak" | "charging-constrained" | "sensor-faults" | "communication-loss" | "charger-outage";

export interface Scenario {
  id: ScenarioId;
  name: string;
  text: string;
  arrivalsPerHour: number;
  profile: ArrivalProfile;
  mix: Partial<Mix>;
  gridLimitW: number;
  /** Two bays (one conventional, one wireless) read uncertain and are not offered by guided policies (drivers still see them). */
  sensorFault?: { from: number; to: number };
  /** Guidance and charger scheduling unavailable: arrivals park as in the manual baseline; chargers run unmanaged. */
  guidanceLoss?: { from: number; to: number };
  /** Two wireless chargers out of service (charging-aware policies know; the others do not). */
  chargerOutage?: { from: number; to: number };
}

/** Site day: 07:00–19:00 local time (12 h); fault windows in hours after 07:00. */
export const START_HOUR = 7;
export const HOURS = 12;

export const SCENARIOS: readonly Scenario[] = [
  { id: "normal", name: "Normal demand", text: "4 arrivals/h on a commuter profile (offered load ≈ 10 Erlang on 12 bays with 2.5 h stays), the default vehicle mix.", arrivalsPerHour: 4, profile: "commuter", mix: {}, gridLimitW: DEFAULT_ENERGY.gridLimit },
  { id: "peak", name: "Peak demand", text: "7 arrivals/h on a commuter profile (offered load ≈ 17.5 Erlang): demand above the facility's capacity.", arrivalsPerHour: 7, profile: "commuter", mix: {}, gridLimitW: DEFAULT_ENERGY.gridLimit },
  { id: "charging-constrained", name: "Charging-constrained", text: "Normal demand, but 70 % EVs, 80 % of them with a receiver, and a 20 kW grid limit: wireless bays and power are scarce.", arrivalsPerHour: 4, profile: "commuter", mix: { evShare: 0.7, wirelessShare: 0.8 }, gridLimitW: 20000 },
  { id: "sensor-faults", name: "Sensor faults", text: "Normal demand; one conventional and one wireless bay read uncertain from 09:00 to 12:00.", arrivalsPerHour: 4, profile: "commuter", mix: {}, gridLimitW: DEFAULT_ENERGY.gridLimit, sensorFault: { from: 2, to: 5 } },
  { id: "communication-loss", name: "Communication loss", text: "Normal demand; guidance and charger scheduling lost from 10:00 to 12:00 (local barrier and charger protection unaffected).", arrivalsPerHour: 4, profile: "commuter", mix: {}, gridLimitW: DEFAULT_ENERGY.gridLimit, guidanceLoss: { from: 3, to: 5 } },
  { id: "charger-outage", name: "Charger outage", text: "Normal demand; two of the four wireless chargers out of service from 09:00 to 13:00.", arrivalsPerHour: 4, profile: "commuter", mix: {}, gridLimitW: DEFAULT_ENERGY.gridLimit, chargerOutage: { from: 2, to: 6 } },
];

/** Declared constants of the model. */
export const RESEARCH_ASSUMPTIONS = {
  stepS: 5,
  chargerKW: 11,
  gridToBattery: 0.937,
  baseLoadW: 1200,
  energyAwareGridTargetW: 15000,
  socAwareMinNeedKWh: 8,
  queueCapacity: 4,
  meanPatienceS: 480,
  cruisingMissShare: 0.25,
  peakAveragingS: 900,
  region: "IN" as const,
};

const A = RESEARCH_ASSUMPTIONS;

export interface RunMetrics {
  arrived: number;
  parked: number;
  throughputPerHour: number;
  meanSearchS: number;
  meanWaitS: number;
  p95WaitS: number;
  utilisation: number;
  chargingAsked: number;
  chargingServed: number;
  /** Share of charging requests that got a working wireless bay. */
  requestFulfilment: number;
  energyRequestedKWh: number;
  energyDeliveredKWh: number;
  /** Delivered / requested battery energy over every charging request. */
  energyFulfilment: number;
  /** Largest 15-minute average grid import, kW. */
  peakGridKW: number;
  pvAvailableKWh: number;
  pvUsedKWh: number;
  /** PV used / PV available. */
  solarUtilisation: number;
  /** Jain's index of per-request energy fulfilment (1 = equal); null when no request was served. */
  fairness: number | null;
  balked: number;
  abandoned: number;
  /** INR, the configured IN tariff (parking and charging bills including tax). */
  revenueParkingINR: number;
  revenueChargingINR: number;
  /** Queue length each minute (for fault recovery). */
  queue: number[];
}

interface Parked {
  v: VehicleProfile;
  bay: Bay;
  until: number;
  need: number; // battery-side J still wanted
  asked: number; // battery-side J requested at arrival
  gridJ: number;
  vehJ: number;
  charging: boolean;
  departs: number;
}

const inWindow = (w: { from: number; to: number } | undefined, t: number) => !!w && t >= w.from * 3600 && t < w.to * 3600;

/** One day of one policy under one scenario and seed. Deterministic. */
export function runResearch(policy: ResearchPolicy, scenario: Scenario, seed: number, layoutInputs: LayoutInputs = DEFAULT_LAYOUT): RunMetrics {
  const layout = buildLayout(layoutInputs);
  const bays = layout.bays;
  const byNumber = [...bays].sort((a, b) => a.id.localeCompare(b.id));
  const byDrive = [...bays].sort((a, b) => a.drive - b.drive || a.index - b.index);
  const horizon = HOURS * 3600;
  const mix: Mix = { ...DEFAULT_MIX, ...scenario.mix };
  // Independent streams: the same arrivals, vehicles and patience for every policy; policy-specific draws (cruising) apart.
  const times = arrivals(scenario.arrivalsPerHour / 3600, 0, horizon, scenario.profile, START_HOUR, createRng(seed));
  const vr = createRng(seed + 1);
  const pr = createRng(seed + 2);
  const cruise: Rng = createRng(seed + 3);
  const queueRng = { patience: times.map(() => -Math.log(1 - pr.next()) * A.meanPatienceS) };
  const events = times.map((t, k) => ({ t, k, v: syntheticVehicle(A.region, vr, mix, {}, k + 1) }));
  // Two bays affected by the sensor fault, two chargers by the outage (fixed choices, the same for every policy).
  const wireless = bays.filter((b) => b.type === "wireless");
  const conventional = bays.filter((b) => b.type === "conventional");
  const faultBays = new Set([conventional[Math.floor(conventional.length / 2)]?.id, wireless[0]?.id].filter(Boolean) as string[]);
  const outBays = new Set(wireless.slice(0, 2).map((b) => b.id));

  const occ = new Map<string, Parked>();
  const queue: { t: number; k: number; v: VehicleProfile }[] = [];
  const tariff = TARIFFS[A.region];
  let parked = 0;
  let balked = 0;
  let abandoned = 0;
  let searchSum = 0;
  const waits: number[] = [];
  let busy = 0;
  let asked = 0;
  let served = 0;
  let requestedJ = 0;
  let deliveredJ = 0;
  const ratios: number[] = [];
  let pvAvail = 0;
  let pvUsed = 0;
  let revenueParking = 0;
  let revenueCharging = 0;
  const queueSeries: number[] = [];
  let window15 = 0;
  let windowT = 0;
  let peak = 0;

  const wantsCharge = (v: VehicleProfile) => v.wirelessCompatible && v.wantsCharging;
  const needJ = (v: VehicleProfile) => (wantsCharge(v) ? Math.max(0, v.targetSoc - v.soc) * v.capacityKWh * 3.6e6 : 0);
  const chargerUp = (b: Bay, t: number) => b.type === "wireless" && !(outBays.has(b.id) && inWindow(scenario.chargerOutage, t));
  const may = (v: VehicleProfile, b: Bay) => !occ.has(b.id) && (b.type !== "accessible" || v.accessiblePermit);
  const guidedSees = (b: Bay, t: number) => !(faultBays.has(b.id) && inWindow(scenario.sensorFault, t));
  const awareOfChargers = policy === "charging-compatible" || policy === "soc-aware" || policy === "energy-aware";

  const choose = (v: VehicleProfile, t: number): { bay: Bay; search: number } | null => {
    const manual = policy === "manual" || inWindow(scenario.guidanceLoss, t);
    if (manual) {
      const free = byDrive.find((b) => may(v, b));
      if (!free) return null;
      const loop = cruise.next() < A.cruisingMissShare ? 2 * (layout.aisle.xEast - layout.aisle.xWest) : 0;
      return { bay: free, search: (free.drive + loop) / (SPEED.aisle * 0.7) + 6 };
    }
    const open = (b: Bay) => may(v, b) && guidedSees(b, t);
    const usableWireless = (b: Bay) => b.type === "wireless" && (!awareOfChargers || chargerUp(b, t));
    let bay: Bay | undefined;
    if (policy === "first-available") bay = byNumber.find(open);
    else if (policy === "nearest") bay = byDrive.find(open);
    else {
      const charger = wantsCharge(v);
      const freeWireless = byDrive.filter((b) => open(b) && usableWireless(b));
      const freeOther = byDrive.filter((b) => open(b) && !usableWireless(b));
      const priority = charger && needJ(v) / 3.6e6 >= A.socAwareMinNeedKWh;
      if (charger && (policy !== "soc-aware" || priority || freeWireless.length > 1)) bay = freeWireless[0] ?? freeOther[0];
      else if (policy === "soc-aware") bay = freeOther[0] ?? (freeWireless.length > 1 ? freeWireless[0] : undefined);
      else bay = freeOther[0] ?? freeWireless[0];
    }
    if (!bay) return null;
    return { bay, search: bay.drive / SPEED.aisle + ((Math.PI / 2) * TURN_RADIUS) / SPEED.turn };
  };

  const park = (v: VehicleProfile, t: number) => {
    const c = choose(v, t);
    if (!c) return false;
    const need = needJ(v);
    if (wantsCharge(v)) {
      asked += 1;
      requestedJ += need;
      if (c.bay.type === "wireless" && chargerUp(c.bay, t)) served += 1;
    }
    occ.set(c.bay.id, { v, bay: c.bay, until: t + v.stay, need, asked: need, gridJ: 0, vehJ: 0, charging: wantsCharge(v) && c.bay.type === "wireless", departs: t + v.stay });
    parked += 1;
    searchSum += c.search;
    return true;
  };

  const leave = (p: Parked) => {
    occ.delete(p.bay.id);
    revenueParking += parkingBill(tariff, p.v.stay, { reservation: false, member: p.v.member, accessible: p.bay.type === "accessible" && p.v.accessiblePermit }).total;
    if (p.vehJ > 0) revenueCharging += chargingBill(tariff, p.gridJ, p.vehJ).total;
    if (p.asked > 0) {
      deliveredJ += p.vehJ;
      ratios.push(Math.min(1, p.vehJ / p.asked));
    }
  };

  const dt = A.stepS;
  let e = 0;
  for (let t = 0; t < horizon; t += dt) {
    const hour = START_HOUR + t / 3600;
    // Departures.
    for (const p of [...occ.values()]) if (p.until <= t) leave(p);
    // Patience.
    for (let q = queue.length - 1; q >= 0; q--)
      if (t - queue[q].t > queueRng.patience[queue[q].k]) {
        if (wantsCharge(queue[q].v)) {
          asked += 1;
          requestedJ += needJ(queue[q].v);
          ratios.push(0);
        }
        queue.splice(q, 1);
        abandoned += 1;
      }
    // The queue is served first, in order.
    while (queue.length && park(queue[0].v, t)) {
      waits.push(t - queue[0].t);
      queue.shift();
    }
    while (e < events.length && events[e].t <= t) {
      const { v, k } = events[e++];
      if (v.denied) continue;
      if (!queue.length && park(v, t)) {
        waits.push(0);
        continue;
      }
      if (queue.length < A.queueCapacity) queue.push({ t, k, v });
      else {
        balked += 1;
        if (wantsCharge(v)) {
          asked += 1;
          requestedJ += needJ(v);
          ratios.push(0);
        }
      }
    }
    // Power: PV, base load, charging under the site's import limit.
    const irr = irradianceAt(DEFAULT_ENV, hour);
    const pv = pvPower(DEFAULT_ENERGY, irr, ambientAt(DEFAULT_ENV, hour)).power;
    const active = [...occ.values()].filter((p) => p.charging && p.need > 0 && chargerUp(p.bay, t));
    const maxW = A.chargerKW * 1000;
    const want = active.map((p) => Math.min(maxW, p.need / dt));
    let alloc = want.slice();
    const unmanaged = policy !== "energy-aware" || inWindow(scenario.guidanceLoss, t);
    if (!unmanaged) {
      // Least laxity first under the import target; sessions with no slack get full power.
      const budget = Math.max(0, pv - A.baseLoadW + A.energyAwareGridTargetW) * A.gridToBattery;
      const order = active.map((p, i) => ({ i, lax: p.departs - t - p.need / maxW })).sort((a, b) => a.lax - b.lax);
      alloc = active.map(() => 0);
      let left = budget;
      for (const { i, lax } of order) {
        const give = lax <= dt ? want[i] : Math.min(want[i], left);
        alloc[i] = give;
        left = Math.max(0, left - give);
      }
    }
    // Hardware limit, the same for every policy: the import limit caps total demand; chargers share it proportionally.
    const chargingGrid = alloc.reduce((a, w) => a + w, 0) / A.gridToBattery;
    const cap = Math.max(0, scenario.gridLimitW + pv - A.baseLoadW);
    const scale = chargingGrid > cap && chargingGrid > 0 ? cap / chargingGrid : 1;
    let gridSideCharging = 0;
    active.forEach((p, i) => {
      const w = alloc[i] * scale;
      const j = Math.min(p.need, w * dt);
      p.need -= j;
      p.vehJ += j;
      p.gridJ += j / A.gridToBattery;
      gridSideCharging += j / A.gridToBattery / dt;
    });
    const load = A.baseLoadW + gridSideCharging;
    const used = Math.min(pv, load);
    pvAvail += pv * dt;
    pvUsed += used * dt;
    const gridW = load - used;
    window15 += gridW * dt;
    windowT += dt;
    if (windowT >= A.peakAveragingS) {
      peak = Math.max(peak, window15 / windowT);
      window15 = 0;
      windowT = 0;
    }
    busy += occ.size * dt;
    if (t % 60 === 0) queueSeries.push(queue.length);
  }
  // Close the day: vehicles still parked are billed for their planned stay; the queue left counts as abandoned.
  for (const p of [...occ.values()]) leave(p);
  for (const q of queue) {
    abandoned += 1;
    if (wantsCharge(q.v)) {
      asked += 1;
      requestedJ += needJ(q.v);
      ratios.push(0);
    }
  }
  const sorted = waits.slice().sort((a, b) => a - b);
  const sumR = ratios.reduce((a, b) => a + b, 0);
  const sumR2 = ratios.reduce((a, b) => a + b * b, 0);
  return {
    arrived: events.length,
    parked,
    throughputPerHour: parked / HOURS,
    meanSearchS: parked ? searchSum / parked : 0,
    meanWaitS: waits.length ? waits.reduce((a, b) => a + b, 0) / waits.length : 0,
    p95WaitS: sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(0.95 * sorted.length))] : 0,
    utilisation: busy / (horizon * bays.length),
    chargingAsked: asked,
    chargingServed: served,
    requestFulfilment: asked ? served / asked : 0,
    energyRequestedKWh: requestedJ / 3.6e6,
    energyDeliveredKWh: deliveredJ / 3.6e6,
    energyFulfilment: requestedJ > 0 ? deliveredJ / requestedJ : 0,
    peakGridKW: peak / 1000,
    pvAvailableKWh: pvAvail / 3.6e6,
    pvUsedKWh: pvUsed / 3.6e6,
    solarUtilisation: pvAvail > 0 ? pvUsed / pvAvail : 0,
    fairness: sumR2 > 0 ? (sumR * sumR) / (ratios.length * sumR2) : null,
    balked,
    abandoned,
    revenueParkingINR: revenueParking / tariff.minor,
    revenueChargingINR: revenueCharging / tariff.minor,
    queue: queueSeries,
  };
}

// ── Statistics ───────────────────────────────────────────────────────────

/** Two-sided 97.5 % quantile of Student's t (Cornish–Fisher expansion; within 0.2 % for df ≥ 3). */
export function t975(df: number): number {
  const z = 1.959963985;
  if (df <= 0) return Number.NaN;
  const z3 = z ** 3;
  const z5 = z ** 5;
  const z7 = z ** 7;
  return z + (z3 + z) / (4 * df) + (5 * z5 + 16 * z3 + 3 * z) / (96 * df * df) + (3 * z7 + 19 * z5 + 17 * z3 - 15 * z) / (384 * df ** 3);
}

export interface Summary {
  n: number;
  mean: number;
  sd: number;
  p5: number;
  p50: number;
  p95: number;
  /** 95 % confidence interval of the mean (t-distribution). */
  ciLow: number;
  ciHigh: number;
}

export function summarise(xs: readonly number[]): Summary {
  const v = xs.filter((x) => Number.isFinite(x));
  const n = v.length;
  if (!n) return { n: 0, mean: Number.NaN, sd: Number.NaN, p5: Number.NaN, p50: Number.NaN, p95: Number.NaN, ciLow: Number.NaN, ciHigh: Number.NaN };
  const mean = v.reduce((a, b) => a + b, 0) / n;
  const sd = n > 1 ? Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) : 0;
  const s = v.slice().sort((a, b) => a - b);
  const q = (p: number) => {
    const i = p * (n - 1);
    const lo = Math.floor(i);
    return s[lo] + (s[Math.min(n - 1, lo + 1)] - s[lo]) * (i - lo);
  };
  const half = n > 1 ? (t975(n - 1) * sd) / Math.sqrt(n) : 0;
  return { n, mean, sd, p5: q(0.05), p50: q(0.5), p95: q(0.95), ciLow: mean - half, ciHigh: mean + half };
}

export type MetricKey = Exclude<keyof RunMetrics, "queue">;

export const METRIC_INFO: readonly { key: MetricKey; name: string; unit: string; better: "higher" | "lower" | "neither" }[] = [
  { key: "throughputPerHour", name: "Parking throughput", unit: "vehicles/h", better: "higher" },
  { key: "meanSearchS", name: "Search time (gate to bay)", unit: "s", better: "lower" },
  { key: "meanWaitS", name: "Queue waiting time (mean)", unit: "s", better: "lower" },
  { key: "p95WaitS", name: "Queue waiting time (95th percentile)", unit: "s", better: "lower" },
  { key: "utilisation", name: "Bay utilisation", unit: "fraction", better: "higher" },
  { key: "requestFulfilment", name: "Charging requests given a working wireless bay", unit: "fraction", better: "higher" },
  { key: "energyFulfilment", name: "Requested charging energy delivered", unit: "fraction", better: "higher" },
  { key: "energyDeliveredKWh", name: "Energy delivered to batteries", unit: "kWh", better: "higher" },
  { key: "peakGridKW", name: "Peak grid import (15-min average)", unit: "kW", better: "lower" },
  { key: "solarUtilisation", name: "Solar utilisation (PV used / available)", unit: "fraction", better: "higher" },
  { key: "fairness", name: "Fairness of energy fulfilment (Jain's index)", unit: "0–1", better: "higher" },
  { key: "abandoned", name: "Vehicles that abandoned the queue", unit: "vehicles", better: "lower" },
  { key: "balked", name: "Vehicles turned away by a full queue", unit: "vehicles", better: "lower" },
  { key: "revenueParkingINR", name: "Parking revenue (IN tariff, incl. tax)", unit: "INR", better: "neither" },
  { key: "revenueChargingINR", name: "Charging revenue (IN tariff, incl. tax)", unit: "INR", better: "neither" },
];

export interface FaultRecovery {
  /** Extra queued vehicle-minutes against the same seed without the fault. */
  extraQueueVehMin: number;
  /** Minutes after the fault ends until the queue matches the fault-free run for 10 consecutive minutes. */
  recoveryMin: number;
}

/** Recovery from a fault window, by comparing the queue with the same seed's fault-free day (paired). */
export function faultRecovery(faulted: number[], nominal: number[], windowEndMin: number): FaultRecovery {
  let extra = 0;
  for (let i = 0; i < Math.min(faulted.length, nominal.length); i++) extra += Math.max(0, faulted[i] - nominal[i]);
  let run = 0;
  let recovered = Math.max(0, faulted.length - windowEndMin);
  for (let i = windowEndMin; i < faulted.length; i++) {
    run = faulted[i] <= nominal[i] ? run + 1 : 0;
    if (run >= 10) {
      recovered = i - 9 - windowEndMin;
      break;
    }
  }
  return { extraQueueVehMin: extra, recoveryMin: Math.max(0, recovered) };
}

export interface PolicyResult {
  policy: ResearchPolicy;
  metrics: Record<MetricKey, Summary>;
  /** Paired difference against the manual baseline (policy − manual), per metric. */
  vsManual: Record<MetricKey, Summary>;
  recovery: { extraQueueVehMin: Summary; recoveryMin: Summary } | null;
}

export interface ExperimentResult {
  format: "evengineer.parking.research/1";
  model: string;
  version: string;
  dataMode: "SIMULATED";
  scenario: Scenario;
  seeds: number[];
  assumptions: typeof RESEARCH_ASSUMPTIONS;
  layout: LayoutInputs;
  policies: PolicyResult[];
}

export const BASE_SEED = 20261127;
export const seedList = (n: number, base = BASE_SEED) => Array.from({ length: n }, (_, k) => base + 101 * k);

/** Every policy over the same seeds under one scenario; fault scenarios also run the fault-free day for recovery. */
export function runExperiment(scenarioId: ScenarioId, replications = 30, policies: readonly ResearchPolicy[] = RESEARCH_POLICIES.map((p) => p.id)): ExperimentResult {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const seeds = seedList(replications);
  const fault = scenario.sensorFault ?? scenario.guidanceLoss ?? scenario.chargerOutage;
  const nominal = fault ? { ...scenario, sensorFault: undefined, guidanceLoss: undefined, chargerOutage: undefined } : null;
  const runs = new Map<ResearchPolicy, RunMetrics[]>();
  const recov = new Map<ResearchPolicy, FaultRecovery[]>();
  for (const p of new Set<ResearchPolicy>(["manual", ...policies])) {
    runs.set(p, seeds.map((s) => runResearch(p, scenario, s)));
    if (nominal && fault) recov.set(p, seeds.map((s, i) => faultRecovery(runs.get(p)![i].queue, runResearch(p, nominal, s).queue, fault.to * 60)));
  }
  const keys = METRIC_INFO.map((m) => m.key);
  const base = runs.get("manual")!;
  return {
    format: "evengineer.parking.research/1",
    model: RESEARCH_MODEL,
    version: RESEARCH_VERSION,
    dataMode: "SIMULATED",
    scenario,
    seeds,
    assumptions: RESEARCH_ASSUMPTIONS,
    layout: DEFAULT_LAYOUT,
    policies: policies.map((p) => {
      const r = runs.get(p)!;
      const metrics = Object.fromEntries(keys.map((k) => [k, summarise(r.map((m) => (m[k] ?? Number.NaN) as number))])) as Record<MetricKey, Summary>;
      const vsManual = Object.fromEntries(keys.map((k) => [k, summarise(r.map((m, i) => ((m[k] ?? Number.NaN) as number) - ((base[i][k] ?? Number.NaN) as number)))])) as Record<MetricKey, Summary>;
      const rc = recov.get(p);
      return { policy: p, metrics, vsManual, recovery: rc ? { extraQueueVehMin: summarise(rc.map((x) => x.extraQueueVehMin)), recoveryMin: summarise(rc.map((x) => x.recoveryMin)) } : null };
    }),
  };
}

/** Replications needed for a 95 % confidence half-width of `relative` × mean, from a pilot sample's mean and SD. */
export const replicationsFor = (mean: number, sd: number, relative = 0.05) => (mean !== 0 && Number.isFinite(sd) ? Math.ceil(((1.96 * sd) / (relative * Math.abs(mean))) ** 2) : Number.NaN);
