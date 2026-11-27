// Arrivals and queues (SP-MATH-001, SP-MATH-002).
//
// Analytical baselines, used only inside their assumptions:
//  · Erlang B, B(c, a): blocking of a loss system with c bays and offered load
//    a = λ/μ. Insensitive to the stay distribution (M/G/c/c), so it holds for
//    realistic, skewed stays as long as arrivals are Poisson.
//  · M/M/c/K: c bays and K − c waiting places, exponential stays. Gives the
//    stationary distribution, blocking, mean queue and (Little's law) waits.
// A discrete-event simulation (DES) of the same finite-capacity facility
// checks them and goes beyond them: time-varying arrivals by thinning,
// imported arrival profiles, lognormal stays and queue abandonment. Real car
// park arrivals are not assumed to be Poisson; that is a baseline.
import { createRng, type Rng } from "../math";

/** Erlang B by the stable recurrence B(0) = 1, B(k) = a·B(k−1) / (k + a·B(k−1)). */
export function erlangB(c: number, a: number): number {
  let b = 1;
  for (let k = 1; k <= c; k++) b = (a * b) / (k + a * b);
  return b;
}

export interface MMcK {
  /** Stationary probabilities p0 … pK. */
  p: number[];
  blocking: number;
  /** Mean number in the system and waiting. */
  L: number;
  Lq: number;
  /** Mean time in the system and waiting (admitted arrivals), s. */
  W: number;
  Wq: number;
  /** Mean occupied bays / c. */
  utilisation: number;
  throughput: number;
}

/** M/M/c/K with arrival rate λ (1/s), mean stay 1/μ (s), c bays and K in the system at most. */
export function mmck(lambda: number, mu: number, c: number, K: number): MMcK {
  const a = lambda / mu;
  const w: number[] = [1];
  for (let n = 1; n <= K; n++) w.push(w[n - 1] * (n <= c ? a / n : a / c));
  const sum = w.reduce((x, y) => x + y, 0);
  const p = w.map((x) => x / sum);
  const blocking = p[K];
  let L = 0;
  let Lq = 0;
  let busy = 0;
  for (let n = 0; n <= K; n++) {
    L += n * p[n];
    Lq += Math.max(0, n - c) * p[n];
    busy += Math.min(n, c) * p[n];
  }
  const throughput = lambda * (1 - blocking);
  return { p, blocking, L, Lq, W: L / throughput, Wq: Lq / throughput, utilisation: busy / c, throughput };
}

// ── Arrival processes ─────────────────────────────────────────────────────

export type ArrivalProfile = "constant" | "commuter" | "retail" | "imported";

/** Relative arrival intensity by hour of day (mean 1 over the day for the built-in profiles). */
export function profileShape(profile: ArrivalProfile, hour: number, imported?: readonly number[]): number {
  const h = ((hour % 24) + 24) % 24;
  if (profile === "constant") return 1;
  if (profile === "imported" && imported && imported.length === 24) {
    const mean = imported.reduce((a, b) => a + b, 0) / 24 || 1;
    return imported[Math.floor(h)] / mean;
  }
  if (profile === "retail") return 0.15 + 1.6 * Math.exp(-((h - 13) ** 2) / 8) + 1.1 * Math.exp(-((h - 18.5) ** 2) / 4);
  // Commuter: a morning peak, a lunch shoulder and a small evening peak.
  return 0.12 + 2.6 * Math.exp(-((h - 8.75) ** 2) / 1.2) + 0.7 * Math.exp(-((h - 13) ** 2) / 2) + 0.9 * Math.exp(-((h - 18) ** 2) / 1.5);
}

const shapeMax = (profile: ArrivalProfile, imported?: readonly number[]) => {
  let m = 0;
  for (let h = 0; h < 24; h += 0.05) m = Math.max(m, profileShape(profile, h, imported));
  return m;
};

/**
 * Arrival times in [t0, t1) s for a mean rate (1/s) scaled by the profile,
 * by thinning a homogeneous Poisson process (Lewis–Shedler). `startHour` is
 * the local hour at t = 0.
 */
export function arrivals(rate: number, t0: number, t1: number, profile: ArrivalProfile, startHour: number, r: Rng, imported?: readonly number[]): number[] {
  if (rate <= 0) return [];
  const peak = shapeMax(profile, imported);
  const lmax = rate * peak;
  const out: number[] = [];
  let t = t0;
  for (;;) {
    t += -Math.log(1 - r.next()) / lmax;
    if (t >= t1) break;
    if (r.next() * peak < profileShape(profile, startHour + t / 3600, imported)) out.push(t);
  }
  return out;
}

// ── Discrete-event simulation ─────────────────────────────────────────────

export interface DesInputs {
  bays: number;
  /** Waiting places (the entry queue), so K = bays + queue. */
  queue: number;
  /** Mean arrival rate, 1/s. */
  rate: number;
  meanStay: number;
  stay: "exponential" | "lognormal" | "deterministic";
  profile: ArrivalProfile;
  startHour: number;
  /** Mean patience in the queue before leaving, s (0: never abandons). */
  patience: number;
  /** Gate service time per vehicle, s (barrier cycle). */
  gate: number;
  horizon: number;
  warmup: number;
  seed: number;
  imported?: number[];
}

export interface DesResult {
  arrived: number;
  admitted: number;
  blocked: number;
  abandoned: number;
  blocking: number;
  meanOccupied: number;
  utilisation: number;
  meanQueue: number;
  meanWait: number;
  p95Wait: number;
  throughputPerHour: number;
  /** Occupied bays sampled every 5 min after warm-up. */
  series: { t: number; occupied: number; queue: number }[];
}

function stayOf(r: Rng, mean: number, kind: DesInputs["stay"]) {
  if (kind === "deterministic") return mean;
  if (kind === "exponential") return -Math.log(1 - r.next()) * mean;
  const cv = 0.8;
  const s2 = Math.log(1 + cv * cv);
  return Math.exp(Math.log(mean) - s2 / 2 + Math.sqrt(s2) * r.normal());
}

/** Event-driven simulation of the finite-capacity facility. Deterministic for a seed. */
export function runDes(i: DesInputs): DesResult {
  const r = createRng(i.seed);
  const times = arrivals(i.rate, 0, i.horizon, i.profile, i.startHour, r, i.imported);
  type Ev = { t: number; kind: "arrive" | "depart" | "abandon"; id: number };
  const events: Ev[] = times.map((t, id) => ({ t, kind: "arrive", id }));
  const pushEvent = (e: Ev) => {
    // Insert keeping time order (lists are small enough for linear insertion).
    let lo = 0;
    let hi = events.length;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (events[m].t <= e.t) lo = m + 1;
      else hi = m;
    }
    events.splice(lo, 0, e);
  };
  let busy = 0;
  const queue: { id: number; since: number }[] = [];
  const waits: number[] = [];
  let arrived = 0;
  let admitted = 0;
  let blocked = 0;
  let abandoned = 0;
  let areaBusy = 0;
  let areaQueue = 0;
  let last = 0;
  let gateFree = 0;
  const series: DesResult["series"] = [];
  let nextSample = i.warmup;
  const admit = (id: number, t: number, since: number) => {
    busy += 1;
    if (t >= i.warmup) waits.push(t - since);
    const start = Math.max(t, gateFree);
    gateFree = start + i.gate;
    pushEvent({ t: start + i.gate + stayOf(r, i.meanStay, i.stay), kind: "depart", id });
  };
  while (events.length) {
    const e = events.shift()!;
    while (nextSample <= e.t && nextSample < i.horizon) {
      series.push({ t: nextSample, occupied: busy, queue: queue.length });
      nextSample += 300;
    }
    if (e.t > i.warmup) {
      const from = Math.max(last, i.warmup);
      areaBusy += busy * (e.t - from);
      areaQueue += queue.length * (e.t - from);
    }
    last = e.t;
    if (e.kind === "arrive") {
      if (e.t >= i.warmup) arrived += 1;
      if (busy < i.bays) {
        if (e.t >= i.warmup) admitted += 1;
        admit(e.id, e.t, e.t);
      } else if (queue.length < i.queue) {
        queue.push({ id: e.id, since: e.t });
        if (i.patience > 0) pushEvent({ t: e.t - Math.log(1 - r.next()) * i.patience, kind: "abandon", id: e.id });
      } else if (e.t >= i.warmup) blocked += 1;
    } else if (e.kind === "depart") {
      busy -= 1;
      const next = queue.shift();
      if (next) {
        if (next.since >= i.warmup) admitted += 1;
        admit(next.id, e.t, next.since);
      }
    } else {
      const k = queue.findIndex((q) => q.id === e.id);
      if (k >= 0) {
        queue.splice(k, 1);
        if (e.t >= i.warmup) abandoned += 1;
      }
    }
    if (e.t > i.horizon) break;
  }
  const span = Math.max(1, i.horizon - i.warmup);
  const sorted = [...waits].sort((a, b) => a - b);
  return {
    arrived,
    admitted,
    blocked,
    abandoned,
    blocking: arrived ? blocked / arrived : 0,
    meanOccupied: areaBusy / span,
    utilisation: areaBusy / span / i.bays,
    meanQueue: areaQueue / span,
    meanWait: waits.length ? waits.reduce((a, b) => a + b, 0) / waits.length : 0,
    p95Wait: sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(0.95 * sorted.length))] : 0,
    throughputPerHour: (admitted / span) * 3600,
    series,
  };
}
