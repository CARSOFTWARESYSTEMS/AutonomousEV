// Reference operating point of the engine through a Simulated Engine Test.
// Pure functions of test phase, progress through the phase and throttle, so the
// scene, the telemetry and the tests always agree. Every quantity is normalised
// (0–1 of the reference value): a prescribed educational sequence, not a solved
// transient and not engine data.
import type { TestPhaseId, Throttle } from "../types";

export interface OperatingPoint {
  /** Propellant lines being chilled before start. */
  conditioning: number;
  /** Main valve opening. */
  valves: number;
  /** Propellant flow through the feed system. */
  flow: number;
  /** Turbopump rotation. Drawn at a scaled visual speed. */
  rotor: number;
  /** Combustion in the chamber. */
  chamber: number;
  /** Exhaust plume. */
  plume: number;
  /** Heat load on the chamber wall. */
  thermal: number;
  /** Thrust. */
  thrust: number;
}

export const COLD: OperatingPoint = { conditioning: 0, valves: 0, flow: 0, rotor: 0, chamber: 0, plume: 0, thermal: 0, thrust: 0 };

/** How long the test stays in each phase, in milliseconds. Compressed for teaching: not real timings. */
export const PHASE_MS: Record<TestPhaseId, number> = {
  system_check: 3200,
  conditioning: 4200,
  ready: 2200,
  start: 6500,
  mainstage: 6000,
  throttle: 9000,
  shutdown: 5500,
  review: 3000,
};

export const THROTTLE_LEVELS: readonly Throttle[] = [40, 60, 80, 100];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Smooth 0→1 as `p` runs from `a` to `b`. */
export const ramp = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** The throttle the demonstration steps through on its own, as a fraction, when the user has not chosen a level. */
export function scriptedThrottle(progress: number): number {
  const steps: readonly [number, number][] = [
    [0, 1],
    [0.12, 0.8],
    [0.32, 0.6],
    [0.52, 0.4],
    [0.72, 0.8],
    [0.88, 1],
  ];
  let level = 1;
  for (const [at, value] of steps) if (progress >= at) level = value;
  return level;
}

function running(level: number): OperatingPoint {
  return { conditioning: 1, valves: 1, flow: level, rotor: 0.35 + 0.65 * level, chamber: level, plume: level, thermal: level, thrust: level };
}

/**
 * Where the engine is at `progress` (0–1) through `phase`, at `throttle` (0.4–1).
 * Start is ordered: valves, flow, rotation, combustion, plume. Shutdown reverses it.
 */
export function operatingPoint(phase: TestPhaseId, progress: number, throttle = 1): OperatingPoint {
  const p = clamp01(progress);
  switch (phase) {
    case "system_check":
      return COLD;
    case "conditioning":
      return { ...COLD, conditioning: ramp(p, 0, 0.85), flow: 0.06 * ramp(p, 0.1, 0.6) };
    case "ready":
      return { ...COLD, conditioning: 1 };
    case "start": {
      const chamber = ramp(p, 0.42, 0.82);
      const plume = ramp(p, 0.55, 1);
      return { conditioning: 1, valves: ramp(p, 0, 0.2), flow: ramp(p, 0.08, 0.45), rotor: ramp(p, 0.18, 0.72), chamber, plume, thermal: ramp(p, 0.5, 1), thrust: chamber * plume };
    }
    case "mainstage":
      return running(1);
    case "throttle":
      return running(clamp01(throttle));
    case "shutdown": {
      const chamber = 1 - ramp(p, 0.05, 0.35);
      const plume = 1 - ramp(p, 0.1, 0.5);
      return { conditioning: 1 - ramp(p, 0.6, 1), valves: 1 - ramp(p, 0, 0.3), flow: 1 - ramp(p, 0, 0.4), rotor: 1 - ramp(p, 0.2, 0.92), chamber, plume, thermal: 1 - 0.9 * ramp(p, 0.3, 1), thrust: chamber * plume };
    }
    case "review":
      return { ...COLD, thermal: 0.1 * (1 - p) };
  }
}

/** A steady reference point for views that show the engine running outside a test (flow, cooling, twin). */
export const REFERENCE_RUNNING: OperatingPoint = running(1);

/** Phases in which the system-check items read as ready. */
export const SYSTEM_CHECK_ITEMS = [
  { label: "INSTRUMENTATION", value: "READY" },
  { label: "CONTROL", value: "READY" },
  { label: "DIGITAL TWIN", value: "SYNCHRONIZED" },
  { label: "ENGINE", value: "READY FOR SIMULATION" },
] as const;
