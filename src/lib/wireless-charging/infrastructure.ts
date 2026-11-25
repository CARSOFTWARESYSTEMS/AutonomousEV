// Smart charging infrastructure and energy intelligence (WPT-GRID-001).
//
// One day of a district at 5-minute resolution: a grid connection with an
// import limit, rooftop and canopy solar PV, a battery energy storage system
// (BESS), a building base load, a car park of wireless bays, an overnight
// fleet depot and a dynamic-charging road. Vehicles arrive (a seeded
// time-varying Poisson process), wait if every bay is full, charge under the
// chosen allocation policy and leave at their departure time. Energy is
// accounted at every step: supply (PV used + grid import + BESS discharge)
// equals demand served (base load + road + chargers' input + BESS charging).
// Requested and served demand are kept apart; unmet demand and curtailed PV
// are reported as quantities, never drawn as flowing power.
import { clamp, createRng } from "./math";

export const GRID_MODEL_VERSION = "WPT-GRID-001 v1.0.0";

export type Policy = "uncoordinated" | "equal-share" | "least-laxity" | "cost-aware" | "solar-following";

export const POLICIES: readonly { id: Policy; name: string; text: string }[] = [
  { id: "uncoordinated", name: "Uncoordinated (baseline)", text: "Every connected vehicle charges at full bay power; the import limit is only monitored, so violations are counted." },
  { id: "equal-share", name: "Equal share", text: "Power within the limit is shared equally between connected vehicles." },
  { id: "least-laxity", name: "Least laxity first", text: "Vehicles with the least slack before departure are served first." },
  { id: "cost-aware", name: "Tariff-aware", text: "Flexible vehicles defer charging out of the peak tariff window; storage shaves the peak." },
  { id: "solar-following", name: "Solar-following", text: "Charging follows PV surplus; the grid serves only vehicles that would otherwise miss their departure." },
];

export interface GridInputs {
  /** Installed PV, kWp. */
  pvCapacity: number;
  /** 0 clear – 1 overcast. */
  cloudiness: number;
  bessCapacity: number;
  bessPower: number;
  bessInitialSoc: number;
  bessEfficiency: number;
  /** Grid import limit (transformer / contract), kW. */
  gridLimit: number;
  baseLoadPeak: number;
  bays: number;
  bayPower: number;
  /** Wireless charger efficiency, grid-to-battery (from the station model). */
  chargerEfficiency: number;
  arrivalsPerDay: number;
  fleetVehicles: number;
  /** Peak power drawn by the electrified road at rush hour, kW. */
  roadPeak: number;
  policy: Policy;
  tariff: { offPeak: number; standard: number; peak: number };
  /** Grid outage window, hours, or null. */
  outage: { start: number; hours: number } | null;
  seed: number;
}

export const DEFAULT_GRID_INPUTS: GridInputs = {
  pvCapacity: 180,
  cloudiness: 0.25,
  bessCapacity: 300,
  bessPower: 100,
  bessInitialSoc: 0.5,
  bessEfficiency: 0.9,
  gridLimit: 200,
  baseLoadPeak: 90,
  bays: 20,
  bayPower: 11,
  chargerEfficiency: 0.93,
  arrivalsPerDay: 90,
  fleetVehicles: 8,
  roadPeak: 60,
  policy: "least-laxity",
  tariff: { offPeak: 5.5, standard: 8.5, peak: 12.5 },
  outage: null,
  seed: 3,
};

export const STEP_HOURS = 5 / 60;
export const STEPS = 288;

export type TariffBand = "off-peak" | "standard" | "peak";
export function tariffBand(hour: number): TariffBand {
  if (hour < 6 || hour >= 22) return "off-peak";
  if ((hour >= 9 && hour < 12) || (hour >= 18 && hour < 22)) return "peak";
  return "standard";
}
export const tariffAt = (i: GridInputs, hour: number) => ({ "off-peak": i.tariff.offPeak, standard: i.tariff.standard, peak: i.tariff.peak })[tariffBand(hour)];

/** Clear-sky PV shape (sine between 06:15 and 18:30), kW per kWp. */
export const pvShape = (hour: number) => (hour <= 6.25 || hour >= 18.5 ? 0 : Math.sin((Math.PI * (hour - 6.25)) / 12.25) ** 1.3 * 0.82);
const baseShape = (h: number) => 0.45 + 0.35 * Math.exp(-(((h - 10) / 3) ** 2)) + 0.4 * Math.exp(-(((h - 19.5) / 2.5) ** 2));
const trafficShape = (h: number) => 0.08 + Math.exp(-(((h - 8.75) / 1.4) ** 2)) + 0.9 * Math.exp(-(((h - 18) / 1.6) ** 2));
const arrivalShape = (h: number) => 0.15 + Math.exp(-(((h - 9) / 1.5) ** 2)) + 0.7 * Math.exp(-(((h - 14) / 2) ** 2)) + 0.8 * Math.exp(-(((h - 19) / 1.6) ** 2));

export interface Vehicle {
  id: number;
  arrive: number;
  depart: number;
  need: number;
  delivered: number;
  fleet: boolean;
  bay: number | null;
  waited: number;
}

export interface GridStep {
  hour: number;
  pvAvailable: number;
  pvUsed: number;
  curtailed: number;
  gridImport: number;
  bessCharge: number;
  bessDischarge: number;
  bessSoc: number;
  baseLoad: number;
  roadRequested: number;
  roadServed: number;
  evRequested: number;
  evServedInput: number;
  connected: number;
  queued: number;
  tariff: number;
  limitExceeded: boolean;
  residual: number;
}

export interface GridTotals {
  generation: number;
  demandServed: number;
  gridImport: number;
  solar: number;
  pvUsed: number;
  curtailed: number;
  bessCharged: number;
  bessDischarged: number;
  losses: number;
  evRequested: number;
  evDelivered: number;
  evUnserved: number;
  roadRequested: number;
  roadServed: number;
  peakImport: number;
  limitViolationHours: number;
  cost: number;
  costPerKWh: number;
  renewableShare: number;
  meanWaitMinutes: number;
  utilisation: number;
  maxResidual: number;
}

/** Simulates one day. Deterministic for the inputs (including the seed). */
export function simulateDay(i: GridInputs): { steps: GridStep[]; totals: GridTotals; vehicles: Vehicle[] } {
  const rng = createRng(i.seed);
  // Arrivals by thinning a Poisson process.
  // rate(t) = arrivalsPerDay · shape(t) / ∫shape over 00:00–23:00; thinning accepts with shape(t)/max(shape).
  const vehicles: Vehicle[] = [];
  let integral = 0;
  let peak = 0;
  for (let h = 0; h < 23; h += 0.01) {
    integral += arrivalShape(h) * 0.01;
    peak = Math.max(peak, arrivalShape(h));
  }
  const maxRate = (i.arrivalsPerDay * peak) / integral;
  let t = 0;
  let id = 1;
  for (;;) {
    t += -Math.log(1 - rng.next()) / maxRate;
    if (t >= 23) break;
    if (rng.next() < arrivalShape(t) / peak) {
      const dwell = 0.75 + rng.next() * 6;
      vehicles.push({ id: id++, arrive: t, depart: Math.min(24, t + dwell), need: 4 + rng.next() * 28, delivered: 0, fleet: false, bay: null, waited: 0 });
    }
  }
  for (let f = 0; f < i.fleetVehicles; f++) vehicles.push({ id: id++, arrive: 0, depart: 6 + rng.next() * 0.5, need: 35 + rng.next() * 25, delivered: 0, fleet: true, bay: null, waited: 0 });

  const steps: GridStep[] = [];
  let soc = i.bessInitialSoc * i.bessCapacity;
  const bays: (Vehicle | null)[] = new Array(i.bays).fill(null);
  const queue: Vehicle[] = [];
  let occupiedHours = 0;
  const cloud = createRng(i.seed + 101);
  let cloudState = i.cloudiness;
  for (let n = 0; n < STEPS; n++) {
    const hour = n * STEP_HOURS;
    // Departures, arrivals, queue.
    for (let b = 0; b < bays.length; b++) if (bays[b] && bays[b]!.depart <= hour) bays[b] = null;
    for (const v of vehicles) if (v.arrive <= hour && v.arrive > hour - STEP_HOURS && !v.fleet) queue.push(v);
    if (n === 0) for (const v of vehicles) if (v.fleet) queue.push(v);
    for (let q = queue.length - 1; q >= 0; q--) if (queue[q].depart <= hour) queue.splice(q, 1);
    for (let b = 0; b < bays.length && queue.length; b++) if (!bays[b]) bays[b] = Object.assign(queue.shift()!, { bay: b });
    for (const v of queue) v.waited += STEP_HOURS;
    const connected = bays.filter((v): v is Vehicle => v !== null);
    occupiedHours += connected.length * STEP_HOURS;

    const out = i.outage && hour >= i.outage.start && hour < i.outage.start + i.outage.hours;
    const limit = out ? 0 : i.gridLimit;
    cloudState = clamp(cloudState + 0.06 * (cloud.next() - 0.5) + 0.05 * (i.cloudiness - cloudState), 0, 1);
    const pvAvailable = i.pvCapacity * pvShape(hour) * (1 - 0.75 * cloudState);
    const baseLoad = i.baseLoadPeak * baseShape(hour);
    const roadRequested = i.roadPeak * trafficShape(hour) / 1.08;
    const tariff = tariffAt(i, hour);
    const band = tariffBand(hour);

    // Requested EV input power at the grid side: full bay power while energy is still needed.
    const wants = connected.map((v) => ({ v, max: v.need - v.delivered > 0.01 ? Math.min(i.bayPower, (v.need - v.delivered) / STEP_HOURS) / i.chargerEfficiency : 0 }));
    const evRequested = wants.reduce((s, w) => s + w.max, 0);

    // BESS capability this step.
    const dischargeCap = Math.min(i.bessPower, (soc / STEP_HOURS) * Math.sqrt(i.bessEfficiency));
    const chargeCap = Math.min(i.bessPower, ((i.bessCapacity * 0.95 - soc) / STEP_HOURS) / Math.sqrt(i.bessEfficiency));

    // Must-serve loads first (the outage case may leave even these short).
    const firm = limit + pvAvailable + (i.policy === "uncoordinated" ? 0 : dischargeCap);
    const baseServed = Math.min(baseLoad, firm);
    const roadServed = Math.min(roadRequested, Math.max(0, firm - baseServed));
    let evBudget = Math.max(0, firm - baseServed - roadServed);
    if (i.policy === "uncoordinated") evBudget = out ? Math.max(0, pvAvailable - baseServed - roadServed) : Infinity;
    if (i.policy === "solar-following") evBudget = Math.max(0, pvAvailable + dischargeCap - baseServed - roadServed);

    // Allocate EV power.
    const alloc = new Map<Vehicle, number>();
    const laxity = (v: Vehicle) => v.depart - hour - (v.need - v.delivered) / i.bayPower;
    const order = [...wants];
    if (i.policy === "least-laxity" || i.policy === "cost-aware" || i.policy === "solar-following") order.sort((a, b) => laxity(a.v) - laxity(b.v));
    if (i.policy === "equal-share") {
      let remaining = evBudget;
      let open = order.filter((w) => w.max > 0);
      while (open.length && remaining > 1e-6) {
        const share = remaining / open.length;
        const next: typeof open = [];
        for (const w of open) {
          const give = Math.min(share, w.max - (alloc.get(w.v) ?? 0));
          alloc.set(w.v, (alloc.get(w.v) ?? 0) + give);
          remaining -= give;
          if ((alloc.get(w.v) ?? 0) < w.max - 1e-6) next.push(w);
        }
        if (next.length === open.length && share < 1e-6) break;
        open = next;
      }
    } else {
      let remaining = evBudget;
      for (const w of order) {
        let give = Math.min(w.max, remaining);
        if (i.policy === "cost-aware" && band === "peak" && laxity(w.v) > 1) give = 0;
        if (i.policy === "solar-following" && laxity(w.v) < 0.75) give = w.max;
        alloc.set(w.v, give);
        if (Number.isFinite(remaining)) remaining = Math.max(0, remaining - give);
      }
    }
    if (i.policy === "solar-following") {
      // Urgent vehicles above the PV budget are served from the grid, within the limit.
      let total = [...alloc.values()].reduce((s, x) => s + x, 0);
      const cap = limit + pvAvailable + dischargeCap - baseServed - roadServed;
      if (total > cap) for (const w of [...order].reverse()) {
        if (total <= cap) break;
        const cut = Math.min(alloc.get(w.v) ?? 0, total - cap);
        alloc.set(w.v, (alloc.get(w.v) ?? 0) - cut);
        total -= cut;
      }
    }
    let evServedInput = 0;
    for (const [v, p] of alloc) {
      evServedInput += p;
      v.delivered += p * STEP_HOURS * i.chargerEfficiency;
    }

    // Supply dispatch: PV first, then BESS (by policy), then grid; surplus PV charges the BESS, then is curtailed.
    const load = baseServed + roadServed + evServedInput;
    let pvUsed = Math.min(pvAvailable, load);
    let deficit = load - pvUsed;
    let bessDischarge = 0;
    let bessCharge = 0;
    const shave = i.policy !== "uncoordinated" && (band === "peak" || deficit > limit || out);
    if (shave) {
      bessDischarge = Math.min(dischargeCap, deficit, band === "peak" || out ? deficit : deficit - limit);
      deficit -= bessDischarge;
    }
    const gridImport = deficit;
    let surplus = pvAvailable - pvUsed;
    if (surplus > 0 && i.policy !== "uncoordinated") {
      bessCharge = Math.min(chargeCap, surplus);
      surplus -= bessCharge;
      pvUsed += bessCharge;
    }
    // Off-peak top-up of storage from the grid, within the limit.
    let gridForBess = 0;
    if (i.policy !== "uncoordinated" && band === "off-peak" && soc < 0.6 * i.bessCapacity && !out) {
      gridForBess = Math.min(chargeCap - bessCharge, Math.max(0, limit - gridImport));
      bessCharge += gridForBess;
    }
    soc += (bessCharge * Math.sqrt(i.bessEfficiency) - bessDischarge / Math.sqrt(i.bessEfficiency)) * STEP_HOURS;
    const curtailed = Math.max(0, surplus);
    const totalImport = gridImport + gridForBess;
    const supply = pvUsed + totalImport + bessDischarge;
    const served = baseServed + roadServed + evServedInput + bessCharge;
    steps.push({
      hour,
      pvAvailable,
      pvUsed,
      curtailed,
      gridImport: totalImport,
      bessCharge,
      bessDischarge,
      bessSoc: soc / i.bessCapacity,
      baseLoad,
      roadRequested,
      roadServed,
      evRequested,
      evServedInput,
      connected: connected.length,
      queued: queue.length,
      tariff,
      limitExceeded: totalImport > limit + 1e-6,
      residual: supply - served,
    });
  }

  const sum = (f: (s: GridStep) => number) => steps.reduce((a, s) => a + f(s), 0) * STEP_HOURS;
  const evRequestedEnergy = vehicles.filter((v) => v.arrive < 24).reduce((a, v) => a + v.need, 0);
  const evDelivered = vehicles.reduce((a, v) => a + v.delivered, 0);
  const evInput = sum((s) => s.evServedInput);
  const bessIn = sum((s) => s.bessCharge);
  const bessOut = sum((s) => s.bessDischarge);
  const importE = sum((s) => s.gridImport);
  const pvUsedE = sum((s) => s.pvUsed);
  const cost = steps.reduce((a, s) => a + s.gridImport * s.tariff * STEP_HOURS, 0);
  const startSoc = i.bessInitialSoc * i.bessCapacity;
  const endSoc = steps.length ? steps[steps.length - 1].bessSoc * i.bessCapacity : startSoc;
  const waits = vehicles.filter((v) => !v.fleet);
  return {
    steps,
    vehicles,
    totals: {
      generation: sum((s) => s.pvAvailable),
      demandServed: sum((s) => s.baseLoad) + sum((s) => s.roadServed) + evDelivered,
      gridImport: importE,
      solar: sum((s) => s.pvAvailable),
      pvUsed: pvUsedE,
      curtailed: sum((s) => s.curtailed),
      bessCharged: bessIn,
      bessDischarged: bessOut,
      // Charger losses plus storage round-trip losses (input − output − change in stored energy).
      losses: evInput - evDelivered + (bessIn - bessOut - (endSoc - startSoc)),
      evRequested: evRequestedEnergy,
      evDelivered,
      evUnserved: Math.max(0, evRequestedEnergy - evDelivered),
      roadRequested: sum((s) => s.roadRequested),
      roadServed: sum((s) => s.roadServed),
      peakImport: Math.max(...steps.map((s) => s.gridImport)),
      limitViolationHours: steps.filter((s) => s.limitExceeded).length * STEP_HOURS,
      cost,
      costPerKWh: evDelivered > 0 ? cost / (importE > 0 ? importE : 1) : 0,
      renewableShare: pvUsedE / Math.max(1e-9, pvUsedE + importE),
      meanWaitMinutes: waits.length ? (waits.reduce((a, v) => a + v.waited, 0) / waits.length) * 60 : 0,
      utilisation: occupiedHours / (i.bays * 24),
      maxResidual: Math.max(...steps.map((s) => Math.abs(s.residual))),
    },
  };
}
