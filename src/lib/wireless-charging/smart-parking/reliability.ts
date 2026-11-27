// Reliability and uncertainty (SP-MATH-012).
//
// Steady-state availability of a repairable device, A = MTBF / (MTBF + MTTR);
// k-out-of-n availability of a redundant sensor set,
//   A_k/n = Σ_{j=k}^{n} C(n, j) A^j (1 − A)^(n−j)
// (independent, identical devices); and the propagation of uncertainty in
// the declared detection and false-alarm rates into the fused posterior, by
// central finite differences (first-order, independent errors). The device
// figures are planning assumptions for the POC, not measured reliability.
import { createRng } from "../math";
import { DETECTOR_RATES, type SensorKind } from "./occupancy";

export const availability = (mtbfH: number, mttrH: number) => mtbfH / (mtbfH + mttrH);

function choose(n: number, k: number): number {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

export function kOfN(k: number, n: number, a: number): number {
  let s = 0;
  for (let j = k; j <= n; j++) s += choose(n, j) * a ** j * (1 - a) ** (n - j);
  return s;
}

/** Monte Carlo estimate of k-of-n availability (verification of the closed form). */
export function kOfNMonteCarlo(k: number, n: number, a: number, trials: number, seed = 1): number {
  const r = createRng(seed);
  let up = 0;
  for (let t = 0; t < trials; t++) {
    let working = 0;
    for (let i = 0; i < n; i++) if (r.next() < a) working += 1;
    if (working >= k) up += 1;
  }
  return up / trials;
}

/** Planning reliability of POC devices (assumptions to be replaced by field data). */
export const DEVICE_RELIABILITY: Record<string, { mtbfH: number; mttrH: number; note: string }> = {
  ultrasonic: { mtbfH: 20000, mttrH: 4, note: "Outdoor-rated ranger under a canopy" },
  infrared: { mtbfH: 15000, mttrH: 4, note: "Reflective sensor exposed to dust" },
  camera: { mtbfH: 30000, mttrH: 8, note: "Row camera; lens cleaning in maintenance" },
  barrier: { mtbfH: 8000, mttrH: 6, note: "Miniature geared motor and boom" },
  gateway: { mtbfH: 40000, mttrH: 2, note: "Edge computer with a spare SD image" },
};

/** Posterior of a fused "all three say occupied" decision and its 1σ from rate uncertainty (relative σ on each rate). */
export function posteriorUncertainty(states: Partial<Record<SensorKind, boolean>>, relSigma = 0.2, prior = 0.5): { p: number; sigma: number } {
  const kinds = Object.keys(states) as SensorKind[];
  const post = (rates: Record<string, { pd: number; pfa: number }>) => {
    let L = Math.log(prior / (1 - prior));
    for (const k of kinds) {
      const { pd, pfa } = rates[k];
      L += states[k] ? Math.log(pd / pfa) : Math.log((1 - pd) / (1 - pfa));
    }
    return 1 / (1 + Math.exp(-L));
  };
  const base = Object.fromEntries(kinds.map((k) => [k, { pd: DETECTOR_RATES[k].pd, pfa: DETECTOR_RATES[k].pfa }]));
  const p = post(base);
  let v = 0;
  for (const k of kinds) {
    for (const field of ["pd", "pfa"] as const) {
      const x = base[k][field];
      // Rates are bounded in (0, 1): perturb the miss rate for pd and the false-alarm rate for pfa.
      const h = field === "pd" ? (1 - x) * relSigma : x * relSigma;
      const up = { ...base, [k]: { ...base[k], [field]: field === "pd" ? Math.min(1 - 1e-9, x + h) : x + h } };
      const dn = { ...base, [k]: { ...base[k], [field]: field === "pd" ? x - h : Math.max(1e-9, x - h) } };
      const d = (post(up) - post(dn)) / 2;
      v += d * d;
    }
  }
  return { p, sigma: Math.sqrt(v) };
}
