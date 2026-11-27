// Occupancy sensing and fusion (SP-MATH-003).
//
// Three detectors per bay in the proof of concept: a ceiling ultrasonic
// ranger, an infrared reflective sensor on the wheel stop, and the row
// camera's per-bay occupancy classifier (edge analytics). Each node debounces
// its own raw samples (N consecutive agreeing samples, with a distance
// hysteresis band) and publishes a state; the gateway fuses the states as
// independent binary detectors with stated detection and false-alarm rates
// (naive-Bayes log-odds), then applies hysteresis on the posterior. When the
// sensors disagree, or the posterior stays between the thresholds, the bay is
// reported as uncertain, never silently assigned. This is a probabilistic
// rule with declared rates, not a trained model.
import type { Rng } from "../math";
import type { SourceMode } from "./types";

export type SensorKind = "ultrasonic" | "infrared" | "camera" | "magnetic" | "radar" | "tof" | "loop";

/** Detection probability and false-alarm probability of a debounced detector state (declared, to be measured on the POC). */
export const DETECTOR_RATES: Record<SensorKind, { pd: number; pfa: number; label: string; poc: boolean }> = {
  ultrasonic: { pd: 0.985, pfa: 0.01, label: "Ultrasonic ranger (ceiling)", poc: true },
  infrared: { pd: 0.96, pfa: 0.03, label: "Infrared reflective (wheel stop)", poc: true },
  camera: { pd: 0.975, pfa: 0.015, label: "Camera occupancy classifier (edge)", poc: true },
  magnetic: { pd: 0.97, pfa: 0.02, label: "Magnetometer (surface)", poc: false },
  radar: { pd: 0.99, pfa: 0.01, label: "mmWave radar", poc: false },
  tof: { pd: 0.98, pfa: 0.015, label: "Time-of-flight", poc: false },
  loop: { pd: 0.99, pfa: 0.005, label: "Inductive loop (adapter)", poc: false },
};

export type FusionStrategy = "bayes" | "majority" | "priority" | "ultrasonic-only";

export interface FusionParams {
  strategy: FusionStrategy;
  /** Posterior to declare occupied / vacant (hysteresis). */
  enter: number;
  exit: number;
  /** Prior probability that a bay is occupied. */
  prior: number;
  /** Uncertain for longer than this → status "unknown", s. */
  uncertainAfter: number;
  /** A sensor state older than this is ignored (STALE), s. */
  freshness: number;
  /** Priority order for the "priority" strategy. */
  priority: SensorKind[];
  /** Any disagreement between fresh sensors makes the decision uncertain (the conservative default). */
  strict: boolean;
}

export const DEFAULT_FUSION: FusionParams = { strategy: "bayes", enter: 0.95, exit: 0.05, prior: 0.5, uncertainAfter: 8, freshness: 12, priority: ["camera", "ultrasonic", "infrared"], strict: true };

export type SensorFault = "none" | "stuck-occupied" | "stuck-vacant" | "disconnected" | "noisy";

export interface RawReading {
  /** Raw measurement in the sensor's own unit (distance m, reflectance 0–1, classifier score 0–1). */
  raw: number;
  unit: string;
  valid: boolean;
}

/** The ceiling ultrasonic ranger: distance to the vehicle roof or the floor. */
export function ultrasonicSample(occupied: boolean, roof: number, mount: number, r: Rng, fault: SensorFault): RawReading {
  if (fault === "disconnected") return { raw: Number.NaN, unit: "m", valid: false };
  if (fault === "stuck-occupied") return { raw: mount - roof, unit: "m", valid: true };
  if (fault === "stuck-vacant") return { raw: mount, unit: "m", valid: true };
  // A missed echo (soft or angled surface) reads as out of range.
  if (r.next() < 0.02) return { raw: 4.5, unit: "m", valid: true };
  const d = occupied ? mount - roof : mount;
  const sigma = (fault === "noisy" ? 0.12 : 0.015) + 0.01 * d;
  return { raw: Math.max(0.25, d + sigma * r.normal()), unit: "m", valid: true };
}

/** The infrared reflective sensor: reflectance of whatever is in front of it; sunlight raises the false-alarm rate. */
export function infraredSample(occupied: boolean, irradiance: number, r: Rng, fault: SensorFault): RawReading {
  if (fault === "disconnected") return { raw: Number.NaN, unit: "1", valid: false };
  if (fault === "stuck-occupied") return { raw: 0.9, unit: "1", valid: true };
  if (fault === "stuck-vacant") return { raw: 0.02, unit: "1", valid: true };
  const sun = Math.min(0.25, irradiance / 4000);
  const base = occupied ? 0.72 : 0.06 + sun;
  return { raw: Math.min(1, Math.max(0, base + (fault === "noisy" ? 0.3 : 0.08) * r.normal())), unit: "1", valid: true };
}

/** The camera classifier's score for a bay: lower margin in low light. */
export function cameraSample(occupied: boolean, lux: number, r: Rng, fault: SensorFault): RawReading {
  if (fault === "disconnected") return { raw: Number.NaN, unit: "1", valid: false };
  if (fault === "stuck-occupied") return { raw: 0.95, unit: "1", valid: true };
  if (fault === "stuck-vacant") return { raw: 0.03, unit: "1", valid: true };
  const margin = lux < 30 ? 0.22 : 0.38;
  return { raw: Math.min(1, Math.max(0, 0.5 + (occupied ? margin : -margin) + 0.1 * r.normal())), unit: "1", valid: true };
}

/** Node-side debounce: the published state changes only after N consecutive raw decisions agree (with a hysteresis band on the raw value). */
export interface NodeState {
  kind: SensorKind;
  state: boolean | null;
  pending: boolean | null;
  count: number;
  last: RawReading | null;
  changedAt: number;
}

export const DEBOUNCE_SAMPLES = 3;

export function nodeDecision(kind: SensorKind, raw: RawReading, prev: boolean | null, mount = 2.9): boolean | null {
  if (!raw.valid) return null;
  if (kind === "ultrasonic") {
    // Occupied when the echo is at least 0.7 m above the floor; 0.15 m hysteresis.
    const th = mount - 0.7 + (prev ? 0.15 : -0.15) * 0.5;
    return raw.raw < th;
  }
  const th = 0.5 + (prev ? -0.08 : 0.08);
  return raw.raw > th;
}

export function debounce(n: NodeState, decision: boolean | null, t: number): boolean {
  if (decision === null) {
    const changed = n.state !== null;
    n.state = null;
    n.pending = null;
    n.count = 0;
    if (changed) n.changedAt = t;
    return changed;
  }
  if (decision === n.state) {
    n.pending = null;
    n.count = 0;
    return false;
  }
  if (decision === n.pending) n.count += 1;
  else {
    n.pending = decision;
    n.count = 1;
  }
  if (n.count >= DEBOUNCE_SAMPLES || n.state === null) {
    n.state = decision;
    n.pending = null;
    n.count = 0;
    n.changedAt = t;
    return true;
  }
  return false;
}

export interface SensorVote {
  kind: SensorKind;
  state: boolean | null;
  /** Time the state was received, s. */
  at: number;
  mode: SourceMode;
}

export interface FusionResult {
  /** Posterior probability that the bay is occupied. */
  p: number;
  decision: "occupied" | "vacant" | "uncertain";
  /** Healthy, fresh sensors that disagree with each other. */
  disagreement: boolean;
  used: SensorKind[];
  stale: SensorKind[];
}

const logit = (p: number) => Math.log(p / (1 - p));

/** Fuses the latest fresh state of each sensor into a posterior and a decision. */
export function fuse(votes: SensorVote[], now: number, prevOccupied: boolean | null, params: FusionParams = DEFAULT_FUSION): FusionResult {
  const fresh = votes.filter((v) => v.state !== null && now - v.at <= params.freshness);
  const stale = votes.filter((v) => v.state !== null && now - v.at > params.freshness).map((v) => v.kind);
  const usable = params.strategy === "ultrasonic-only" ? fresh.filter((v) => v.kind === "ultrasonic") : fresh;
  const states = usable.map((v) => v.state);
  const disagreement = states.length > 1 && states.some((s) => s !== states[0]);
  let p = params.prior;
  if (params.strategy === "bayes" || params.strategy === "ultrasonic-only") {
    let L = logit(params.prior);
    for (const v of usable) {
      const { pd, pfa } = DETECTOR_RATES[v.kind];
      L += v.state ? Math.log(pd / pfa) : Math.log((1 - pd) / (1 - pfa));
    }
    p = 1 / (1 + Math.exp(-L));
  } else if (params.strategy === "majority") {
    const yes = states.filter(Boolean).length;
    p = states.length ? (yes * 2 > states.length ? 0.99 : yes * 2 < states.length ? 0.01 : 0.5) : params.prior;
  } else {
    const top = params.priority.map((k) => usable.find((v) => v.kind === k)).find(Boolean);
    p = top ? (top.state ? 0.99 : 0.01) : params.prior;
  }
  let decision: FusionResult["decision"];
  if (!usable.length || (disagreement && params.strict && params.strategy !== "ultrasonic-only")) decision = "uncertain";
  else if (p >= params.enter) decision = "occupied";
  else if (p <= params.exit) decision = "vacant";
  // Between the thresholds the previous decision holds (hysteresis); with none, it is uncertain.
  else decision = prevOccupied === true ? "occupied" : prevOccupied === false ? "vacant" : "uncertain";
  return { p, decision, disagreement, used: usable.map((v) => v.kind), stale };
}
