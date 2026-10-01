// Prognostics: where a degradation trend is heading, with its uncertainty.
// Severity (0 = as new, 1 = failed) is assumed to grow exponentially at a rate
// known only within a range, so every projection is a band, not a number.
// Simple, coherent equations for an educational demonstrator; all values are simulated.
import type { PredictionState, Trend } from "../types";
import { clamp01, roundTo } from "../lib/math";

/** Severity at which the health index reaches zero. */
export const SEVERITY_LIMIT = 0.9;
/** Health index at which maintenance is required. */
export const MAINTENANCE_THRESHOLD = 0.25;
/** Below this a component is treated as healthy: no trend is projected. */
export const TREND_FLOOR = 0.03;

/** Growth rate of severity per flight cycle: slow, expected and fast. */
export const GROWTH_PER_CYCLE = { low: 0.006, mean: 0.008, high: 0.011 } as const;

/** How far the time control reaches, in flight cycles either side of now. */
export const HORIZON_CYCLES = 100;

export const healthIndex = (severity: number) => clamp01(1 - severity / SEVERITY_LIMIT);

const SEVERITY_AT_THRESHOLD = SEVERITY_LIMIT * (1 - MAINTENANCE_THRESHOLD);

/** Severity `cycles` from now for a given growth rate. Negative cycles look back along the same curve. */
export const severityAt = (severityNow: number, cycles: number, rate: number) => (severityNow < TREND_FLOOR ? severityNow : severityNow * Math.exp(rate * cycles));

export interface TrajectoryPoint {
  cycles: number;
  mean: number;
  low: number;
  high: number;
}

/**
 * Health index along the horizon. History is known closely (a narrow band from
 * measurement noise); the future spreads with the uncertainty in growth rate.
 */
export function healthTrajectory(severityNow: number, step = 5): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  for (let cycles = -HORIZON_CYCLES; cycles <= HORIZON_CYCLES; cycles += step) points.push(trajectoryAt(severityNow, cycles));
  return points;
}

export function trajectoryAt(severityNow: number, cycles: number): TrajectoryPoint {
  const mean = healthIndex(severityAt(severityNow, cycles, GROWTH_PER_CYCLE.mean));
  if (cycles <= 0) {
    const noise = 0.012;
    return { cycles, mean, low: clamp01(mean - noise), high: clamp01(mean + noise) };
  }
  return {
    cycles,
    mean,
    low: clamp01(healthIndex(severityAt(severityNow, cycles, GROWTH_PER_CYCLE.high)) - 0.012),
    high: clamp01(healthIndex(severityAt(severityNow, cycles, GROWTH_PER_CYCLE.low)) + 0.012),
  };
}

/** Cycles until severity reaches the maintenance threshold at a given rate; 0 if it already has. */
const cyclesToThreshold = (severityNow: number, rate: number) => Math.max(0, Math.log(SEVERITY_AT_THRESHOLD / severityNow) / rate);

/**
 * The suggested maintenance window: between the fast and slow projections
 * crossing the threshold, rounded to five cycles so it never reads as more
 * precise than it is. Null when no trend has been established.
 */
export function maintenanceWindow(severityNow: number): { fromCycles: number; toCycles: number } | null {
  if (severityNow < TREND_FLOOR) return null;
  const fromCycles = Math.max(0, roundTo(cyclesToThreshold(severityNow, GROWTH_PER_CYCLE.high), 5));
  const toCycles = Math.max(fromCycles + 5, roundTo(cyclesToThreshold(severityNow, GROWTH_PER_CYCLE.low), 5));
  return { fromCycles, toCycles };
}

export const trendOf = (severityNow: number): Trend => (severityNow < TREND_FLOOR ? "STABLE" : "INCREASING");

export function describeWindow(window: { fromCycles: number; toCycles: number } | null): string {
  if (!window) return "No maintenance action predicted within the horizon";
  if (window.fromCycles <= 0) return `Within next ${window.toCycles} flight cycles`;
  return `Within next ${window.fromCycles}–${window.toCycles} flight cycles`;
}

/** The prediction at one point on the time control. `offsetCycles` is negative for history. */
export function predictionAt(severityNow: number, offsetCycles: number, established: boolean): PredictionState {
  const point = trajectoryAt(severityNow, offsetCycles);
  const window = established ? maintenanceWindow(severityNow) : null;
  return {
    offsetCycles,
    mean: point.mean,
    low: point.low,
    high: point.high,
    trend: trendOf(severityNow),
    maintenanceWindow: window,
    recommendation: window ? "MAINTENANCE ACTION RECOMMENDED" : "CONTINUE MONITORING",
  };
}
