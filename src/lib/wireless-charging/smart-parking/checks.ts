// Smart Parking verification checks, run by the same suite as the rest of the
// twin (Engineering Assurance and the unit tests). SP-A: analytical
// verification of the models. SP-B: the brief's acceptance scenarios, each a
// scripted run of the facility simulation. Every check is deterministic.
import type { Check } from "../benchmarks";
import { fnv1a } from "../network";
import { PHASES } from "../stateMachine";
import { allocate, type BayView, commitReservation } from "./allocation";
import { commandBarrier, newBarrier, stepBarrier } from "./barrier";
import { chargingBill, parkingBill, roundMinor, TARIFFS } from "./billing";
import { evaluateEligibility } from "./charging";
import { DEFAULT_ENERGY, pvPower } from "./energy";
import { DEFAULT_ENV, newEnv, stepEnv, THERMAL } from "./environment";
import { surrogateCheck } from "./experiments";
import { arrive, bayById, createFacility, DEFAULT_FACILITY, type FacilityInputs, type FacilitySim, NO_FACILITY_FAULTS, operatorCommand, requestDeparture, runFacility, sessionOf, stepFacility, vehicleById } from "./facility";
import { decideAccess, recognise } from "./identification";
import { buildLayout } from "./layout";
import { reachedState } from "./lifecycle";
import { debounce, DEFAULT_FUSION, fuse, nodeDecision, type NodeState } from "./occupancy";
import { erlangB, mmck, runDes } from "./queueing";
import { ReservationBook } from "./reservations";
import { Broker, checkCommand, DEFAULT_LAN, ingest, newIngest, SCHEMA, signCommand, topic } from "./telemetry";
import { syntheticVehicle } from "./vehicles";
import { createRng } from "../math";
import { evaluateForecasts, type History, median, robustZ } from "./forecast";
import { kOfN, kOfNMonteCarlo, posteriorUncertainty } from "./reliability";

const fmt = (x: number, d = 3) => (Math.abs(x) < 1e-3 && x !== 0 ? x.toExponential(2) : x.toFixed(d));

/** An empty facility with no background arrivals, coarse station steps (headless). */
export function quiet(over: Partial<FacilityInputs> = {}): FacilitySim {
  const sim = createFacility({ ...DEFAULT_FACILITY, scenario: "empty", arrivalsPerHour: 0, ...over }, { ...NO_FACILITY_FAULTS });
  sim.stationStep = 0.25;
  return sim;
}

const EV = { powertrain: "electric" as const, wirelessCompatible: true, wantsCharging: true, cls: "sedan" as const, member: true, plateObstructed: false, denied: false, soc: 0.62, targetSoc: 0.8, stay: 1800 };
const CAR = { powertrain: "conventional" as const, wirelessCompatible: false, wantsCharging: false, cls: "sedan" as const, member: true, plateObstructed: false, denied: false, stay: 1800 };

/** Runs until `done` or `max` seconds. */
function until(sim: FacilitySim, done: () => boolean, max: number) {
  const n = Math.round(max / 0.1);
  for (let i = 0; i < n && !done(); i++) stepFacility(sim);
  return done();
}

const stateOf = (sim: FacilitySim, vehicleId: string) => sessionOf(sim, vehicleId)?.lc.state ?? "none";

const views = (n = 12): BayView[] => buildLayout({ bays: n, wireless: 4, accessible: 1, bayWidth: 2.7, bayDepth: 5.6, aisleWidth: 6 }).bays.map((bay) => ({ bay, status: "available", version: 0, heldFor: null, chargerOk: true, chargerPower: 11000, congestion: 0, energyPrice: 850 }));

export const PARKING_CHECKS: readonly Check[] = [
  {
    id: "SP-A01",
    kind: "analytical",
    title: "Erlang B recurrence against the closed form",
    expected: "B(c, a) from the recurrence equals (aᶜ/c!) / Σ aᵏ/k! to 1e-12 for c = 1…20, a = 0.5…30",
    models: ["SP-MATH-002"],
    run: () => {
      let worst = 0;
      for (let c = 1; c <= 20; c++)
        for (const a of [0.5, 2, 8, 15, 30]) {
          let term = 1;
          let sum = 1;
          for (let k = 1; k <= c; k++) {
            term *= a / k;
            sum += term;
          }
          worst = Math.max(worst, Math.abs(erlangB(c, a) - term / sum) / (term / sum));
        }
      return { passed: worst < 1e-12, measured: `largest relative difference ${worst.toExponential(1)}` };
    },
  },
  {
    id: "SP-A02",
    kind: "analytical",
    title: "M/M/c/K: normalisation, Little's law and the loss-system limit",
    expected: "Σpₙ = 1; L = λ(1 − P_K)·W; with K = c the blocking equals Erlang B",
    models: ["SP-MATH-002"],
    run: () => {
      const q = mmck(6 / 3600, 1 / 7200, 12, 16);
      const sum = q.p.reduce((a, b) => a + b, 0);
      const little = Math.abs(q.L - q.throughput * q.W) / q.L;
      const loss = mmck(6 / 3600, 1 / 7200, 12, 12);
      const b = erlangB(12, 12);
      const ok = Math.abs(sum - 1) < 1e-12 && little < 1e-12 && Math.abs(loss.blocking - b) < 1e-12;
      return { passed: ok, measured: `Σp − 1 = ${(sum - 1).toExponential(1)}; Little ${little.toExponential(1)}; P_K(K=c) ${fmt(loss.blocking, 5)} vs Erlang B ${fmt(b, 5)}` };
    },
  },
  {
    id: "SP-A03",
    kind: "numerical",
    title: "Discrete-event simulation against M/M/c/K",
    expected: "Exponential stays, Poisson arrivals, 400 h: |Δ blocking| < 0.02 and mean occupied bays within 3 %",
    models: ["SP-MATH-002", "SP-MATH-001"],
    run: () => {
      const lambda = 6 / 3600;
      const mu = 1 / 7200;
      const a = mmck(lambda, mu, 12, 16);
      const d = runDes({ bays: 12, queue: 4, rate: lambda, meanStay: 7200, stay: "exponential", profile: "constant", startHour: 0, patience: 0, gate: 0, horizon: 400 * 3600, warmup: 20 * 3600, seed: 5 });
      const busy = a.utilisation * 12;
      const ok = Math.abs(d.blocking - a.blocking) < 0.02 && Math.abs(d.meanOccupied - busy) / busy < 0.03;
      return { passed: ok, measured: `blocking DES ${fmt(d.blocking)} / analytic ${fmt(a.blocking)}; occupied ${fmt(d.meanOccupied, 2)} / ${fmt(busy, 2)}` };
    },
  },
  {
    id: "SP-A04",
    kind: "analytical",
    title: "Shelter thermal node: exact step against the analytical solution",
    expected: "Constant inputs: T after 1 h from 60 one-minute steps and from 3600 one-second steps both equal T∞ + (T₀ − T∞)e^(−t/τ) to 1e-9 K",
    models: ["SP-MATH-007"],
    run: () => {
      const env = { ...DEFAULT_ENV, ambientSwing: 0, cloud: 0, fanOnTemperature: 99 };
      const drive = { equipment: 1500, movingCombustion: 0, smokeSource: false, gasSource: false, fanFailure: false, activity: false, sensorFailure: false };
      const run = (dt: number) => {
        const e = newEnv(env, 12);
        e.temperature = 20;
        for (let t = 0; t < 3600; t += dt) stepEnv(e, env, drive, 12, dt, createRng(1));
        return e;
      };
      const a = run(60);
      const b = run(1);
      const e0 = newEnv(env, 12);
      const k = THERMAL.UA + THERMAL.rhoCp * env.naturalFlow;
      const tInf = e0.ambient + (THERMAL.solarGain * e0.irradiance * env.roofArea + 1500) / k;
      const exact = tInf + (20 - tInf) * Math.exp(-3600 / (THERMAL.C / k));
      const err = Math.max(Math.abs(a.temperature - exact), Math.abs(b.temperature - exact));
      return { passed: err < 1e-9, measured: `T(1 h) ${fmt(a.temperature, 4)} °C; worst error ${err.toExponential(1)} K` };
    },
  },
  {
    id: "SP-A05",
    kind: "analytical",
    title: "Solar power formula and temperature derating",
    expected: "P = G·A·η·(1 − γ(T_cell − 25))·derating with T_cell = T_amb + (NOCT − 20)/800·G, to 1e-9 W",
    models: ["SP-MATH-008"],
    run: () => {
      const e = DEFAULT_ENERGY;
      const p = pvPower(e, 850, 31);
      const cell = 31 + ((e.noct - 20) / 800) * 850;
      const hand = 850 * e.pvArea * e.pvEfficiency * (1 - e.pvGamma * (cell - 25)) * e.pvDerating;
      return { passed: Math.abs(p.power - hand) < 1e-9 && p.cellTemperature === cell, measured: `${fmt(p.power / 1000, 3)} kW at T_cell ${fmt(cell, 1)} °C` };
    },
  },
  {
    id: "SP-A06",
    kind: "benchmark",
    title: "Facility energy balance closes at every step",
    expected: "grid + PV used + storage discharge − served − storage charging = 0 (|residual| < 1e-6 W) over 30 min with chargers running; unmet demand is accounted separately",
    models: ["SP-MATH-009"],
    run: () => {
      const sim = quiet({ scenario: "tour" });
      runFacility(sim, 1800);
      const e = sim.energy;
      return { passed: e.maxResidual < 1e-6, measured: `largest residual ${e.maxResidual.toExponential(1)} W; charging ${fmt(e.charging / 3.6e6, 2)} kWh, grid ${fmt(e.grid / 3.6e6, 2)} kWh, PV ${fmt(e.pv / 3.6e6, 2)} kWh, unmet ${fmt(e.unmet / 3.6e6, 3)} kWh` };
    },
  },
  {
    id: "SP-A07",
    kind: "analytical",
    title: "Billing in integer minor units",
    expected: "Grace, first block, started blocks, daily cap, discounts, tax and rounding give the hand-computed totals; charging = Wh × price / 1000 rounded half-up",
    models: ["SP-MATH-010"],
    run: () => {
      const t = TARIFFS.IN;
      const a = parkingBill(t, 9 * 60, { reservation: false, member: false, accessible: false }).total; // grace
      const b = parkingBill(t, 61 * 60, { reservation: false, member: false, accessible: false }); // 30 + 15 = 45 → +18 % = 53.10 → ₹53
      const c = parkingBill(t, 30 * 3600, { reservation: false, member: false, accessible: false }); // cap 2 days
      const d = chargingBill(t, 12.3456 * 3.6e6, 11.5 * 3.6e6); // 12 346 Wh × 1800 / 1000 = 22 222.8 → 22 223; +18 % = 26 223.14 → 26 223 → ₹262.23 → round to ₹262
      const ok = a === 0 && b.base === 4500 && b.total === 5300 && c.capped && c.base === 2 * t.dailyCap && d.meteredWh === 12346 && d.energyCost === 22223 && d.total === 26200 && roundMinor(250, 100, "half-up") === 300 && roundMinor(249, 100, "half-up") === 200;
      return { passed: ok, measured: `9 min ${a}; 61 min ${b.total}; 30 h capped ${c.capped} (${c.base}); charging ${d.meteredWh} Wh → ${d.energyCost} + tax → ${d.total} (paise)` };
    },
  },
  {
    id: "SP-A08",
    kind: "analytical",
    title: "Node debounce and fusion hysteresis do not chatter",
    expected: "Isolated single-sample flips never change a node's state; three agreeing samples do",
    models: ["SP-MATH-003"],
    run: () => {
      const n: NodeState = { kind: "ultrasonic", state: false, pending: null, count: 0, last: null, changedAt: 0 };
      let changes = 0;
      const seq = [false, true, false, false, true, false, true, false, true, true, true, true];
      seq.forEach((occ, i) => {
        if (debounce(n, nodeDecision("ultrasonic", { raw: occ ? 1.4 : 2.9, unit: "m", valid: true }, n.state), i)) changes += 1;
      });
      return { passed: changes === 1 && n.state === true, measured: `${changes} change(s) over ${seq.length} samples with 4 isolated flips; final state ${n.state}` };
    },
  },
  {
    id: "SP-A09",
    kind: "numerical",
    title: "Event-level charging surrogate against the Station model",
    expected: "30 → 80 % of 60 kWh: constant 11 kW surrogate within 15 % of the full Station session time (CC–CV taper, ramp and checks included)",
    models: ["SP-RES-001", "WPT-SIM-001"],
    run: () => {
      const r = surrogateCheck();
      return { passed: r.relative < 0.15, measured: `Station ${fmt(r.station / 60, 1)} min, surrogate ${fmt(r.surrogate / 60, 1)} min (${fmt(r.relative * 100, 1)} %)` };
    },
  },
  {
    id: "SP-A10",
    kind: "analytical",
    title: "Forecast baselines on a known periodic history",
    expected: "Every weekday identical and every weekend day identical: seasonal naïve and moving average forecast with zero error; exponential smoothing converges to the profile",
    models: ["SP-MATH-006"],
    run: () => {
      const wd = Array.from({ length: 24 }, (_, h) => Math.round(6 + 5 * Math.sin((h / 24) * 2 * Math.PI)));
      const we = wd.map((x) => Math.max(0, x - 2));
      const days = 28;
      const weekend = Array.from({ length: days }, (_, d) => d % 7 >= 5);
      const h: History = { occupancy: weekend.map((w) => [...(w ? we : wd)]), charging: weekend.map(() => new Array(24).fill(1)), weekend };
      const s = evaluateForecasts(h, 12, 7);
      const ok = s[0].mae === 0 && s[1].mae === 0 && s[2].mae < 1e-6;
      return { passed: ok, measured: s.map((x) => `${x.method} MAE ${x.mae.toExponential(1)}`).join("; ") };
    },
  },
  {
    id: "SP-A11",
    kind: "numerical",
    title: "k-out-of-n sensor availability and uncertainty propagation",
    expected: "Closed form equals Monte Carlo within 0.003 (2-of-3, 1-of-3); limits A₁/₁ = A and Aₙ/ₙ = Aⁿ; the posterior's 1σ from ±20 % rate uncertainty stays below 0.01 when three sensors agree",
    models: ["SP-MATH-012"],
    run: () => {
      const a = 0.98;
      const mc2 = kOfNMonteCarlo(2, 3, a, 200000, 3);
      const mc1 = kOfNMonteCarlo(1, 3, 0.9, 200000, 4);
      const u = posteriorUncertainty({ ultrasonic: true, infrared: true, camera: true });
      const ok = Math.abs(kOfN(2, 3, a) - mc2) < 0.003 && Math.abs(kOfN(1, 3, 0.9) - mc1) < 0.003 && Math.abs(kOfN(1, 1, a) - a) < 1e-15 && Math.abs(kOfN(3, 3, a) - a ** 3) < 1e-15 && u.sigma < 0.01;
      return { passed: ok, measured: `2-of-3: ${fmt(kOfN(2, 3, a), 5)} vs MC ${fmt(mc2, 5)}; 1-of-3 (A = 0.9): ${fmt(kOfN(1, 3, 0.9), 5)} vs ${fmt(mc1, 5)}; posterior ${fmt(u.p, 6)} ± ${u.sigma.toExponential(1)}` };
    },
  },
  {
    id: "SP-A12",
    kind: "analytical",
    title: "Robust anomaly statistic",
    expected: "For a normal sample the scaled MAD estimates σ within 5 %; a value 6σ away scores |z| > 5 while a 1σ value scores < 1.5",
    models: ["SP-AI-003"],
    run: () => {
      const r = createRng(17);
      const xs = Array.from({ length: 4000 }, () => 100 + 10 * r.normal());
      const m = median(xs);
      const mad = median(xs.map((x) => Math.abs(x - m))) * 1.4826;
      const far = robustZ(160, xs);
      const near = robustZ(110, xs);
      return { passed: Math.abs(mad - 10) / 10 < 0.05 && far > 5 && near < 1.5, measured: `scaled MAD ${fmt(mad, 2)} (σ = 10); z(+6σ) ${fmt(far, 2)}; z(+1σ) ${fmt(near, 2)}` };
    },
  },
  {
    id: "SP-B01",
    kind: "benchmark",
    title: "A vehicle is detected and opens exactly one session",
    expected: "Crossing the presence loop moves the session to Detected once; identification follows",
    models: ["SP-CTRL-001"],
    run: () => {
      const sim = quiet();
      const id = arrive(sim, CAR, 0);
      until(sim, () => reachedState(sessionOf(sim, id)?.lc ?? { state: "approaching", since: 0, history: [], refused: [] }, "identifying"), 40);
      const sessions = [...sim.sessions.values()].filter((s) => s.vehicleId === id);
      const ok = sessions.length === 1 && reachedState(sessions[0].lc, "detected");
      return { passed: ok, measured: `${sessions.length} session(s); state ${sessions[0]?.lc.state}` };
    },
  },
  {
    id: "SP-B02",
    kind: "benchmark",
    title: "An uncertain or unknown identity is never authorised automatically",
    expected: "Low-confidence plate reads are not authorised without RFID, QR, a visitor ticket or an operator; with none and no visitors allowed, the vehicle is turned away",
    models: ["SP-AI-001"],
    run: () => {
      const r = createRng(9);
      let autoAuth = 0;
      for (let k = 0; k < 400; k++) {
        const v = syntheticVehicle("IN", r, undefined, { plateObstructed: true, rfid: null, qr: null }, k);
        const rec = recognise(v, "IN", { lux: 20, rain: true, cameraFault: false }, r);
        if (rec.outcome === "recognised") continue;
        const d = decideAccess(v, rec, { rfid: false, qr: false, visitorTicket: false, operatorApproved: false }, { plates: new Set([v.plate]), tags: new Set(), tokens: new Set() });
        if (d.authorised) autoAuth += 1;
      }
      const sim = quiet({ visitorEntry: false });
      const id = arrive(sim, { ...CAR, member: false, rfid: null, qr: null, plateObstructed: true }, 0);
      sim.faults.cameraFault = true;
      until(sim, () => ["manual-verification", "rejected"].includes(stateOf(sim, id)), 120);
      const s = sessionOf(sim, id)!;
      const ok = autoAuth === 0 && !reachedState(s.lc, "authorized");
      return { passed: ok, measured: `${autoAuth} automatic authorisations of uncertain reads; facility run ends in ${s.lc.state}` };
    },
  },
  {
    id: "SP-B03",
    kind: "benchmark",
    title: "Allocation respects every hard constraint",
    expected: "Conventional cars and incompatible EVs never get a wireless bay (no overflow), accessible bays need a permit, the chosen bay is eligible, ties break on the bay index",
    models: ["SP-MATH-004"],
    run: () => {
      const r = createRng(4);
      let violations = 0;
      for (let k = 0; k < 300; k++) {
        const v = syntheticVehicle("IN", r, undefined, {}, k);
        const vs = views();
        vs.forEach((x, i) => (x.status = r.next() < 0.4 ? "occupied" : i % 7 === 0 ? "maintenance" : "available"));
        for (const policy of ["first-available", "nearest", "reservation-priority", "charging-aware", "multi-objective"] as const) {
          const res = allocate(vs, { vehicle: v, reservation: null, facilityBlocked: null, overflowToWireless: false, upcoming: new Set() }, policy);
          if (!res.bayId) continue;
          const b = vs.find((x) => x.bay.id === res.bayId)!;
          if (b.status !== "available") violations += 1;
          if (b.bay.type === "wireless" && !(v.wirelessCompatible && v.wantsCharging)) violations += 1;
          if (b.bay.type === "accessible" && !v.accessiblePermit) violations += 1;
        }
      }
      const a = allocate(views(), { vehicle: syntheticVehicle("IN", createRng(1), undefined, { powertrain: "conventional" }, 1), reservation: null, facilityBlocked: null, overflowToWireless: false, upcoming: new Set() }, "first-available");
      return { passed: violations === 0 && a.bayId === "S01", measured: `${violations} constraint violations in 1 500 allocations; first available for a car: ${a.bayId}` };
    },
  },
  {
    id: "SP-B04",
    kind: "benchmark",
    title: "A reserved bay is never offered to another vehicle",
    expected: "A bay held for reservation R is ineligible for every request that does not hold R, under every policy",
    models: ["SP-MATH-004"],
    run: () => {
      const vs = views();
      vs.forEach((x) => (x.heldFor = x.bay.id === "N06" ? "R-0001" : null));
      const v = syntheticVehicle("IN", createRng(2), undefined, { powertrain: "electric", wirelessCompatible: true, wantsCharging: true }, 3);
      const offered = (["first-available", "nearest", "reservation-priority", "charging-aware", "multi-objective"] as const).map((p) => allocate(vs, { vehicle: v, reservation: null, facilityBlocked: null, overflowToWireless: false, upcoming: new Set(["N06"]) }, p).bayId);
      const holder = allocate(vs, { vehicle: v, reservation: { id: "R-0001", bayId: "N06", type: "wireless" }, facilityBlocked: null, overflowToWireless: false, upcoming: new Set() }, "nearest").bayId;
      return { passed: !offered.includes("N06") && holder === "N06", measured: `others offered ${offered.join(", ")}; the holder got ${holder}` };
    },
  },
  {
    id: "SP-B05",
    kind: "benchmark",
    title: "No double occupancy and no double booking",
    expected: "Two commits on the same bay version: only the first succeeds; overlapping bookings of one bay or beyond a class's capacity are refused",
    models: ["SP-MATH-004"],
    run: () => {
      const bay = { status: "available" as const, version: 3, session: null as string | null };
      const view = { ...bay };
      const first = commitReservation(view, 3, "PS-1");
      const second = commitReservation(view, 3, "PS-2");
      const book = new ReservationBook();
      const cap = { wireless: 1, conventional: 7, accessible: 1 };
      const a = book.book({ vehicleId: "V-1", type: "wireless", bayId: "N06", start: 3600, end: 7200, token: "a" }, cap, 0);
      const b = book.book({ vehicleId: "V-2", type: "wireless", bayId: "N06", start: 5400, end: 9000, token: "b" }, cap, 0);
      const c = book.book({ vehicleId: "V-3", type: "wireless", bayId: null, start: 6000, end: 6500, token: "c" }, cap, 0);
      return { passed: first && !second && a.ok && !b.ok && !c.ok, measured: `commits ${first}/${second}; bookings ${a.ok}/${b.ok}/${c.ok} (${b.reason}; ${c.reason})` };
    },
  },
  {
    id: "SP-B06",
    kind: "benchmark",
    title: "Occupancy uncertainty is visible and never assigned",
    expected: "A stuck sensor that disagrees with the others makes the bay Unknown within the uncertainty time, and allocation does not offer it",
    models: ["SP-MATH-003", "SP-MATH-004"],
    run: () => {
      const sim = quiet();
      sim.faults.sensor = { bayId: "N03", kind: "infrared", mode: "stuck-occupied" };
      runFacility(sim, 30);
      const b = bayById(sim, "N03")!;
      const offered = allocate(
        sim.bays.map((x) => ({ bay: x.bay, status: x.status, version: x.version, heldFor: null, chargerOk: true, chargerPower: 11000, congestion: 0, energyPrice: 0 })),
        { vehicle: syntheticVehicle("IN", createRng(3), undefined, { powertrain: "conventional", accessiblePermit: false }, 1), reservation: null, facilityBlocked: null, overflowToWireless: false, upcoming: new Set() },
        "first-available",
      ).candidates.find((c) => c.bayId === "N03");
      return { passed: b.status === "unknown" && b.fusion.disagreement && offered?.eligible === false, measured: `bay N03 ${b.status}, p = ${fmt(b.fusion.p, 3)}, disagreement ${b.fusion.disagreement}; offered ${offered?.eligible}` };
    },
  },
  {
    id: "SP-B07",
    kind: "benchmark",
    title: "The barrier never closes on an obstruction",
    expected: "A close command from any source is refused while obstructed; a boom already closing reverses when an obstruction appears",
    models: ["SP-CTRL-002"],
    run: () => {
      const b = newBarrier("T");
      commandBarrier(b, "open", "test", 0);
      for (let i = 0; i < 40; i++) stepBarrier(b, 0.1, { obstructed: false, clear: true, egress: false });
      stepBarrier(b, 0.1, { obstructed: true, clear: false, egress: false });
      const refused = !commandBarrier(b, "close", "operator", 4);
      stepBarrier(b, 0.1, { obstructed: false, clear: true, egress: false });
      commandBarrier(b, "close", "operator", 5);
      for (let i = 0; i < 5; i++) stepBarrier(b, 0.1, { obstructed: false, clear: true, egress: false });
      const mid = b.angle;
      stepBarrier(b, 0.1, { obstructed: true, clear: false, egress: false });
      for (let i = 0; i < 20; i++) stepBarrier(b, 0.1, { obstructed: true, clear: false, egress: false });
      const sim = quiet();
      sim.faults.obstruction = "entry";
      operatorCommand(sim, "barrier.open", "entry", "operator");
      runFacility(sim, 3);
      const op = operatorCommand(sim, "barrier.close", "entry", "supervisor");
      return { passed: refused && b.angle >= 89.9 && mid < 90 && !op.ok, measured: `close refused: ${refused}; reversed from ${fmt(mid, 0)}° to ${fmt(b.angle, 0)}°; supervisor close in the facility: ${op.reason}` };
    },
  },
  {
    id: "SP-B08",
    kind: "benchmark",
    title: "Unauthorised commands are rejected",
    expected: "A viewer's command, an expired command, a tampered command, a replay and any command in connected read-only mode are all refused and audited",
    models: ["SP-IOT-001"],
    run: () => {
      const sim = quiet();
      const viewer = operatorCommand(sim, "barrier.open", "entry", "viewer");
      const expired = operatorCommand(sim, "barrier.open", "entry", "operator", {}, { expiresIn: -1 });
      const tampered = operatorCommand(sim, "bay.block", "N02", "operator", {}, { tamper: true });
      const once = operatorCommand(sim, "lighting.set", "all", "operator", { level: 0.5 }, { id: "CMD-X" });
      const replay = operatorCommand(sim, "lighting.set", "all", "operator", { level: 0.5 }, { id: "CMD-X" });
      const c = signCommand({ commandId: "Z", action: "barrier.open", target: "entry", params: {}, issuedBy: "x", role: "operator", issuedAt: 0, expiresAt: 10 });
      const ro = checkCommand(c, 1, new Set(), "connected-read-only");
      const ok = !viewer.ok && !expired.ok && !tampered.ok && once.ok && !replay.ok && !ro.ok && sim.audit.filter((a) => a.result === "rejected").length >= 4;
      return { passed: ok, measured: `viewer: ${viewer.reason}; expired: ${expired.reason}; tampered: ${tampered.reason}; replay: ${replay.reason}; read-only: ${ro.reason}` };
    },
  },
  {
    id: "SP-B09",
    kind: "benchmark",
    title: "Cloud and gateway failure never bypass local safety",
    expected: "With cloud and gateway down: the barrier interlock still refuses to close on an obstruction, the exit opens for egress, and a smoke alarm still stops charging and runs the fans",
    models: ["SP-CTRL-002", "SP-MATH-007", "WPT-CTRL-001"],
    run: () => {
      const sim = quiet({ scenario: "tour" });
      runFacility(sim, 5);
      sim.faults.cloudDown = true;
      sim.faults.gatewayDown = true;
      sim.faults.obstruction = "entry";
      operatorCommand(sim, "barrier.open", "entry", "operator");
      runFacility(sim, 3);
      const closeRefused = !operatorCommand(sim, "barrier.close", "entry", "operator").ok;
      sim.faults.smoke = true;
      until(sim, () => sim.env.alarm !== "none", 180);
      runFacility(sim, 2);
      const energised = [...sim.chargers.values()].some((c) => PHASES[c.sim.state.phase].energised);
      const ok = closeRefused && sim.gates.exit.barrier.egress && sim.env.alarm === "smoke" && sim.env.fanDuty === 1 && !energised;
      return { passed: ok, measured: `close refused ${closeRefused}; exit egress ${sim.gates.exit.barrier.egress}; alarm ${sim.env.alarm}; fans ${fmt(sim.env.fanDuty, 2)}; any charger energised ${energised}` };
    },
  },
  {
    id: "SP-B10",
    kind: "benchmark",
    title: "Environmental alarms trigger the expected simulated responses",
    expected: "Simulated gas: alarm, fans to 100 %, lighting to full, entry suspended (new arrival waits), all chargers de-energised; acknowledged after clearing, normal operation resumes",
    models: ["SP-MATH-007"],
    run: () => {
      const sim = quiet({ scenario: "tour" });
      runFacility(sim, 10);
      sim.faults.gas = true;
      until(sim, () => sim.env.alarm === "gas", 200);
      const id = arrive(sim, CAR);
      runFacility(sim, 40);
      const st = stateOf(sim, id);
      const energised = [...sim.chargers.values()].some((c) => PHASES[c.sim.state.phase].energised);
      const fans = sim.env.fanDuty;
      const response = fans === 1 && sim.env.lighting === 1 && !energised && !reachedState(sessionOf(sim, id)!.lc, "entering");
      sim.faults.gas = false;
      until(sim, () => sim.env.gas < DEFAULT_ENV.gasAlarm * 0.4, 1200);
      const ack = operatorCommand(sim, "alarm.acknowledge", "shelter", "operator");
      runFacility(sim, 5);
      return { passed: response && ack.ok && sim.env.alarm === "none", measured: `during alarm: fans ${fmt(fans * 100, 0)} %, arrival held in ${st}, chargers energised ${energised}; after acknowledgement alarm ${sim.env.alarm}` };
    },
  },
  {
    id: "SP-B11",
    kind: "benchmark",
    title: "An incompatible vehicle cannot start wireless charging",
    expected: "A conventional car or an EV without a compatible receiver fails the compatibility check, even in a wireless bay; no charging session is created",
    models: ["SP-INT-001"],
    run: () => {
      const ctx = { occupancyConfirmed: true, bayIsWireless: true, transmitterAvailable: true, chargingAuthorised: true, alignment: { lateral: 0, longitudinal: 0 }, tolerance: { lateral: 0.1, longitudinal: 0.1 }, facilitySafe: true, safetyDetail: "" };
      const r = createRng(1);
      const car = evaluateEligibility(syntheticVehicle("IN", r, undefined, { powertrain: "conventional" }, 1), ctx);
      const ev = evaluateEligibility(syntheticVehicle("IN", r, undefined, { powertrain: "electric", wirelessCompatible: false, wantsCharging: true, soc: 0.3 }, 2), ctx);
      const sim = quiet({ overflowToWireless: true, layout: { ...DEFAULT_FACILITY.layout, bays: 4, wireless: 4, accessible: 0 } });
      const id = arrive(sim, { ...EV, wirelessCompatible: false }, 0);
      until(sim, () => ["parked"].includes(stateOf(sim, id)) && reachedState(sessionOf(sim, id)!.lc, "eligibility"), 120);
      const s = sessionOf(sim, id)!;
      const ok = !car.eligible && !ev.eligible && !ev.checks.find((c) => c.id === "compatibility")!.passed && s.chargingId === null && [...sim.chargers.values()].every((c) => !c.session);
      return { passed: ok, measured: `car eligible ${car.eligible}; incompatible EV eligible ${ev.eligible}; in a wireless bay (overflow): ${s.bayId}, charging session ${s.chargingId ?? "none"}` };
    },
  },
  {
    id: "SP-B12",
    kind: "benchmark",
    title: "Charging begins only after the Station's own safety checks",
    expected: "For a compatible EV the Station passes identification, authorisation, alignment, battery and safety checks before any energised phase",
    models: ["SP-INT-001", "WPT-CTRL-001"],
    run: () => {
      const sim = quiet();
      const id = arrive(sim, EV, 0);
      until(sim, () => stateOf(sim, id) === "charging" && [...sim.chargers.values()].some((c) => c.session?.vehicleId === id && PHASES[c.sim.state.phase].energised), 200);
      const ch = [...sim.chargers.values()].find((c) => c.session?.vehicleId === id);
      const seq = ch ? ch.sim.state.events.map((e) => e.to) : [];
      const firstEnergised = seq.findIndex((p) => PHASES[p].energised);
      const checks = ["identification", "authorization", "alignment", "battery-check", "safety-checks"].map((p) => seq.indexOf(p as never));
      const ok = !!ch && firstEnergised > 0 && checks.every((i) => i >= 0 && i < firstEnergised);
      return { passed: ok, measured: ch ? `${seq.slice(0, firstEnergised + 1).join(" → ")}` : "no charging session" };
    },
  },
  {
    id: "SP-B13",
    kind: "benchmark",
    title: "Parking and charging sessions keep one identity chain",
    expected: "Site → bay → vehicle → parking session → charging session: the charger's session names the same bay, vehicle and parking session the parking record holds",
    models: ["SP-INT-001"],
    run: () => {
      const sim = quiet();
      const id = arrive(sim, EV, 0);
      until(sim, () => stateOf(sim, id) === "charging", 200);
      const s = sessionOf(sim, id)!;
      const ch = sim.chargers.get(s.bayId ?? "");
      const cs = ch?.session;
      const ok = !!cs && cs.vehicleId === id && cs.parkingSessionId === s.id && cs.bayId === s.bayId && cs.id === s.chargingId;
      return { passed: ok, measured: `${sim.inputs.siteId} → ${s.bayId} → ${id} → ${s.id} → ${cs?.id ?? "—"}` };
    },
  },
  {
    id: "SP-B14",
    kind: "benchmark",
    title: "Battery energy is never counted twice",
    expected: "Only the Station integrates the battery while attached; the parking record takes the final SOC once; energy into the battery from the ledger matches the SOC rise",
    models: ["SP-INT-001", "WPT-BAT-001"],
    run: () => {
      const sim = quiet();
      const id = arrive(sim, { ...EV, soc: 0.7, stay: 600 }, 0);
      const v = () => vehicleById(sim, id)!;
      until(sim, () => stateOf(sim, id) === "charging", 200);
      const socAtAttach = v().profile.soc;
      runFacility(sim, 240);
      const socDuring = v().profile.soc;
      until(sim, () => (sessionOf(sim, id)?.chargingBill ?? null) !== null, 900);
      const s = sessionOf(sim, id)!;
      const ch = sim.chargers.get(s.bayId!)!;
      const cs = ch.history.at(-1)!;
      const stored = (cs.socEnd! - cs.socStart) * v().profile.capacityKWh;
      const intoBattery = cs.vehicleJ / 3.6e6;
      const ok = socDuring === socAtAttach && s.socOut === cs.socEnd && v().profile.soc === cs.socEnd && intoBattery >= stored && intoBattery < stored * 1.1 + 0.05;
      return { passed: ok, measured: `parking-side SOC unchanged while attached (${fmt(socAtAttach, 3)}); taken once at hand-back ${fmt(s.socOut ?? 0, 3)}; ΔSOC × capacity ${fmt(stored, 3)} kWh vs ${fmt(intoBattery, 3)} kWh at the battery terminals` };
    },
  },
  {
    id: "SP-B15",
    kind: "benchmark",
    title: "Charging stops safely before departure",
    expected: "On departure the Station ramps down and de-energises before the vehicle moves; billing waits for it",
    models: ["SP-INT-001", "WPT-CTRL-001"],
    run: () => {
      const sim = quiet();
      const id = arrive(sim, { ...EV, soc: 0.4, stay: 99999 }, 0);
      until(sim, () => stateOf(sim, id) === "charging" && [...sim.chargers.values()].some((c) => c.session?.vehicleId === id && c.sim.state.phase === "charging"), 300);
      const s = sessionOf(sim, id)!;
      const ch = sim.chargers.get(s.bayId!)!;
      requestDeparture(sim, s.id);
      let movedWhileEnergised = false;
      until(sim, () => {
        const v = vehicleById(sim, id)!;
        if (v.v > 0 && PHASES[ch.sim.state.phase].energised) movedWhileEnergised = true;
        return reachedState(s.lc, "exiting") && v.s > 1;
      }, 300);
      const seq = s.lc.history.map((h) => h.to);
      const ok = !movedWhileEnergised && seq.indexOf("charging-stopping") >= 0 && seq.indexOf("charging-stopping") < seq.indexOf("billing") && ch.history.at(-1)?.outcome === "completed";
      return { passed: ok, measured: `moved while energised ${movedWhileEnergised}; ${seq.slice(seq.indexOf("departure-requested")).join(" → ")}; station record ${ch.history.at(-1)?.outcome}` };
    },
  },
  {
    id: "SP-B16",
    kind: "benchmark",
    title: "Parking duration is calculated correctly",
    expected: "Billed duration = payment time − entry time (barrier passage), to the 0.1 s step; billable minutes round each started minute up",
    models: ["SP-MATH-010"],
    run: () => {
      const sim = quiet();
      const id = arrive(sim, { ...CAR, stay: 1500 }, 0);
      until(sim, () => (sessionOf(sim, id)?.parkingBill ?? null) !== null, 2000);
      const s = sessionOf(sim, id)!;
      const d = s.billedAt! - s.entryAt!;
      const ok = Math.abs(s.parkingBill!.durationS - d) < 1e-9 && s.parkingBill!.billableMin === Math.ceil(d / 60 - 1e-9);
      return { passed: ok, measured: `entry ${fmt(s.entryAt!, 1)} s, payment ${fmt(s.billedAt!, 1)} s → ${fmt(d / 60, 2)} min billed as ${s.parkingBill!.billableMin} min` };
    },
  },
  {
    id: "SP-B17",
    kind: "benchmark",
    title: "Charging cost and parking fees stay separate",
    expected: "Changing the energy tariff changes only the charging ledger; changing the parking tariff changes only the parking ledger",
    models: ["SP-MATH-010"],
    run: () => {
      const t = TARIFFS.IN;
      const p1 = parkingBill(t, 5000, { reservation: false, member: false, accessible: false }).total;
      const p2 = parkingBill({ ...t, energyPerKWh: t.energyPerKWh * 2 }, 5000, { reservation: false, member: false, accessible: false }).total;
      const c1 = chargingBill(t, 20 * 3.6e6, 18.6 * 3.6e6).total;
      const c2 = chargingBill({ ...t, block: t.block * 3, firstBlock: 1 }, 20 * 3.6e6, 18.6 * 3.6e6).total;
      const c3 = chargingBill({ ...t, energyPerKWh: t.energyPerKWh * 2 }, 20 * 3.6e6, 18.6 * 3.6e6).total;
      const ok = p1 === p2 && c1 === c2 && c3 !== c1;
      return { passed: ok, measured: `parking ${p1} = ${p2} under a doubled energy tariff; charging ${c1} = ${c2} under a new parking tariff, ${c3} with the energy tariff doubled` };
    },
  },
  {
    id: "SP-B18",
    kind: "benchmark",
    title: "A bay becomes available only after verified departure",
    expected: "The bay stays reserved while the vehicle leaves; it is released only when the fused sensors read vacant",
    models: ["SP-MATH-003", "SP-CTRL-001"],
    run: () => {
      const sim = quiet();
      const id = arrive(sim, { ...CAR, stay: 120 }, 0);
      until(sim, () => stateOf(sim, id) === "exiting", 600);
      const s = sessionOf(sim, id)!;
      const b = bayById(sim, s.bayId!)!;
      let early = false;
      until(sim, () => {
        if (b.session === null && b.fused !== false) early = true;
        return b.session === null;
      }, 120);
      const ok = !early && b.session === null && b.fused === false && b.status === "available";
      return { passed: ok, measured: `released early ${early}; bay ${b.bay.id} ${b.status}, fused ${b.fused}` };
    },
  },
  {
    id: "SP-B19",
    kind: "benchmark",
    title: "Duplicate IoT messages never create duplicate sessions",
    expected: "A duplicated event id is dropped by the gateway (idempotent ingestion); one presence detection opens one session",
    models: ["SP-IOT-001"],
    run: () => {
      const b = new Broker(1, { ...DEFAULT_LAN, loss: 0, duplicate: 1 });
      b.connect({ id: "US-N01", publish: [topic("occupancy", "S", "N01")], subscribe: [], tls: true, lastWill: null });
      const msg = { schema: SCHEMA, eventId: "US-N01-1", siteId: "S", deviceId: "US-N01", sensorId: "ultrasonic", ts: 0, seq: 1, measurement: { raw: 1.4, value: true }, unit: "m", quality: "good" as const, mode: "SIMULATED" as const };
      b.publish("US-N01", topic("occupancy", "S", "N01"), msg, 0);
      const st = newIngest();
      const verdicts = b.deliver(5).map((e) => ingest(st, e, 100, 5000).verdict);
      const sim = quiet();
      const id = arrive(sim, CAR, 0);
      runFacility(sim, 40);
      const sessions = [...sim.sessions.values()].filter((s) => s.vehicleId === id).length;
      return { passed: verdicts.includes("accepted") && verdicts.includes("duplicate") && st.counts.accepted === 1 && sessions === 1, measured: `${verdicts.join(", ")}; sessions for one arrival: ${sessions}` };
    },
  },
  {
    id: "SP-B20",
    kind: "benchmark",
    title: "Stale data is never treated as fresh",
    expected: "A message older than the freshness limit is marked STALE; a stale sensor state is excluded from fusion",
    models: ["SP-IOT-001", "SP-MATH-003"],
    run: () => {
      const b = new Broker(2, { ...DEFAULT_LAN, loss: 0, duplicate: 0 });
      b.connect({ id: "IR-N01", publish: [topic("occupancy", "S", "N01")], subscribe: [], tls: true, lastWill: null });
      b.publish("IR-N01", topic("occupancy", "S", "N01"), { schema: SCHEMA, eventId: "IR-N01-9", siteId: "S", deviceId: "IR-N01", sensorId: "infrared", ts: 0, seq: 9, measurement: { raw: 0.8, value: true }, unit: "1", quality: "good", mode: "SIMULATED" }, 0);
      const st = newIngest();
      const res = b.deliver(1).map((e) => ingest(st, e, 60000, 12000));
      const f = fuse([{ kind: "infrared", state: true, at: 0, mode: "SIMULATED" }, { kind: "ultrasonic", state: false, at: 50, mode: "SIMULATED" }], 60, null, DEFAULT_FUSION);
      return { passed: res[0]?.mode === "STALE" && f.stale.includes("infrared") && !f.used.includes("infrared"), measured: `ingested as ${res[0]?.mode}; fusion used ${f.used.join(", ")}, ignored stale ${f.stale.join(", ")}` };
    },
  },
  {
    id: "SP-B21",
    kind: "benchmark",
    title: "Results do not depend on how the clock is driven",
    expected: "The same facility advanced in single steps or in bursts (as at any frame rate or time scale) reaches an identical state",
    models: ["SP-SIM-001"],
    run: () => {
      const a = quiet({ scenario: "tour", arrivalsPerHour: 20 });
      const b = quiet({ scenario: "tour", arrivalsPerHour: 20 });
      for (let i = 0; i < 1200; i++) stepFacility(a);
      for (let k = 0; k < 40; k++) runFacility(b, 3);
      const h = (s: FacilitySim) => fnv1a(JSON.stringify([s.t.toFixed(6), [...s.sessions.values()].map((x) => [x.id, x.lc.state, x.bayId]), s.vehicles.map((v) => [v.pose.x.toFixed(6), v.pose.y.toFixed(6)]), s.energy.grid.toFixed(3)]));
      return { passed: h(a) === h(b), measured: `${h(a)} vs ${h(b)}` };
    },
  },
  {
    id: "SP-B22",
    kind: "benchmark",
    title: "Scenario replay is reproducible",
    expected: "Two runs with the same seed give the same event log; a different seed gives a different one",
    models: ["SP-SIM-001"],
    run: () => {
      const log = (seed: number) => {
        const s = quiet({ scenario: "tour", arrivalsPerHour: 25, seed });
        runFacility(s, 600);
        return fnv1a(JSON.stringify(s.events.map((e) => [e.t.toFixed(1), e.kind, e.text])));
      };
      const a = log(7);
      const b = log(7);
      const c = log(8);
      return { passed: a === b && a !== c, measured: `seed 7: ${a} / ${b}; seed 8: ${c}` };
    },
  },
  {
    id: "SP-B23",
    kind: "benchmark",
    title: "Congestion: no double allocation and no two vehicles in one lane zone",
    expected: "Thirty minutes at 20 arrivals/h: zero failed or double reservations, lane zones held by at most one vehicle, vehicle centres never closer than 2.4 m",
    models: ["SP-SIM-001", "SP-MATH-005"],
    run: () => {
      const sim = quiet({ scenario: "tour", arrivalsPerHour: 20 });
      let minD = Number.POSITIVE_INFINITY;
      let shared = 0;
      for (let i = 0; i < 18000; i += 1) {
        stepFacility(sim);
        if (i % 10) continue;
        const live = sim.vehicles.filter((v) => v.spawned && !v.gone);
        const seen = new Map<number, string>();
        for (const v of live)
          for (const z of v.zones) {
            if (seen.has(z) && seen.get(z) !== v.profile.id) shared += 1;
            seen.set(z, v.profile.id);
          }
        for (let a = 0; a < live.length; a++)
          for (let c = a + 1; c < live.length; c++) {
            const A = live[a];
            const B = live[c];
            const d = Math.hypot(A.pose.x + Math.cos(A.pose.heading) * A.fp.wheelbase / 2 - (B.pose.x + Math.cos(B.pose.heading) * B.fp.wheelbase / 2), A.pose.y + Math.sin(A.pose.heading) * A.fp.wheelbase / 2 - (B.pose.y + Math.sin(B.pose.heading) * B.fp.wheelbase / 2));
            minD = Math.min(minD, d);
          }
      }
      const owners = new Set(sim.bays.map((b) => b.session).filter(Boolean));
      const ok = sim.stats.doubleAllocation === 0 && shared === 0 && minD > 2.4 && owners.size === sim.bays.filter((b) => b.session).length;
      return { passed: ok, measured: `failed commits ${sim.stats.doubleAllocation}; shared lane zones ${shared}; closest centres ${fmt(minD, 2)} m; ${sim.stats.entered} entered, ${sim.stats.exited} left, ${sim.stats.balked} balked` };
    },
  },
  {
    id: "SP-B24",
    kind: "benchmark",
    title: "Safe egress when the gateway is down",
    expected: "With the edge gateway down a departing vehicle leaves through the exit (local fail-safe), while new arrivals wait",
    models: ["SP-CTRL-002"],
    run: () => {
      const sim = quiet();
      const id = arrive(sim, { ...CAR, stay: 90 }, 0);
      until(sim, () => stateOf(sim, id) === "parked", 300);
      sim.faults.gatewayDown = true;
      sim.faults.paymentDown = true;
      const late = arrive(sim, CAR);
      until(sim, () => stateOf(sim, id) === "released", 600);
      const ok = stateOf(sim, id) === "released" && !reachedState(sessionOf(sim, late)!.lc, "entering");
      return { passed: ok, measured: `departing vehicle ${stateOf(sim, id)}; new arrival ${stateOf(sim, late)}; payment ${sessionOf(sim, id)?.payment?.status}` };
    },
  },
  {
    id: "SP-B25",
    kind: "benchmark",
    title: "Tailgating is detected and referred to an operator",
    expected: "A vehicle following through on another's authorisation is flagged, counted and held for an operator decision",
    models: ["SP-CTRL-001", "SP-CTRL-002"],
    run: () => {
      const sim = quiet();
      arrive(sim, CAR, 0);
      const t = arrive(sim, { ...CAR, member: false, tailgates: true }, 2.2);
      until(sim, () => stateOf(sim, t) === "operator-intervention", 300);
      const s = sessionOf(sim, t)!;
      const ok = s.tailgater && s.lc.state === "operator-intervention" && sim.events.some((e) => e.kind === "tailgating");
      const approve = operatorCommand(sim, "session.approve", s.id, "operator");
      return { passed: ok && approve.ok, measured: `${s.lc.history.map((h) => h.to).join(" → ")}; operator: ${approve.reason}` };
    },
  },
  {
    id: "SP-B26",
    kind: "benchmark",
    title: "A vehicle in the wrong bay is reassigned or referred",
    expected: "A driver who ignores guidance and stops in another free conventional bay is reassigned to it; the allocated bay is released",
    models: ["SP-CTRL-001", "SP-MATH-004"],
    run: () => {
      const sim = quiet();
      const id = arrive(sim, { ...CAR, ignoresGuidance: true }, 0);
      until(sim, () => stateOf(sim, id) === "parked", 300);
      const s = sessionOf(sim, id)!;
      const ok = reachedState(s.lc, "wrong-bay") && s.lc.state === "parked" && bayById(sim, s.bayId!)!.session === s.id && s.allocation?.bayId !== s.bayId;
      return { passed: ok, measured: `allocated ${s.allocation?.bayId}, parked in ${s.bayId}; ${s.lc.history.slice(-3).map((h) => h.to).join(" → ")}` };
    },
  },
];
