// Prognostics: from "something is wrong" to "how is it evolving". A trend is
// fitted to an estimated health parameter, projected forward, and turned into
// a probability of crossing a limit. The projection carries an uncertainty
// that widens with the horizon; it is never a single line.
import { normalCdf } from "./channels";

export interface Trend {
  slope: number;
  /** Fitted value at the last sample. */
  level: number;
  /** Standard error of the slope. */
  slopeError: number;
  /** Scatter of the samples about the fitted line. */
  scatter: number;
}

/** Least-squares line through samples taken at times `t`. */
export function fitTrend(t: readonly number[], y: readonly number[]): Trend {
  const n = Math.min(t.length, y.length);
  if (n < 3) return { slope: 0, level: n ? y[n - 1] : 0, slopeError: 0, scatter: 0 };
  let meanT = 0;
  let meanY = 0;
  for (let i = 0; i < n; i++) {
    meanT += t[i];
    meanY += y[i];
  }
  meanT /= n;
  meanY /= n;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (t[i] - meanT) ** 2;
    sxy += (t[i] - meanT) * (y[i] - meanY);
  }
  if (sxx < 1e-12) return { slope: 0, level: meanY, slopeError: 0, scatter: 0 };
  const slope = sxy / sxx;
  let sse = 0;
  for (let i = 0; i < n; i++) sse += (y[i] - (meanY + slope * (t[i] - meanT))) ** 2;
  const scatter = Math.sqrt(sse / (n - 2));
  return { slope, level: meanY + slope * (t[n - 1] - meanT), slopeError: scatter / Math.sqrt(sxx), scatter };
}

export interface ProjectionPoint {
  /** Seconds ahead of now. */
  horizon: number;
  mean: number;
  /** One standard deviation. */
  sigma: number;
}

export interface ThresholdOutlook {
  /** Probability that the quantity is beyond the limit at the end of the horizon. */
  probability: number;
  /** Seconds until the central projection reaches the limit; null if it does not within the horizon. */
  timeToLimit: number | null;
  /** The same for the pessimistic and optimistic edges of the one-sigma band. */
  earliest: number | null;
  latest: number | null;
}

function crossing(points: readonly ProjectionPoint[], limit: number, below: boolean, offset: number): number | null {
  const value = (p: ProjectionPoint) => p.mean + offset * p.sigma;
  const beyond = (v: number) => (below ? v <= limit : v >= limit);
  if (beyond(value(points[0]))) return 0;
  for (let i = 1; i < points.length; i++) {
    const a = value(points[i - 1]);
    const b = value(points[i]);
    if (beyond(b)) return points[i - 1].horizon + ((limit - a) / (b - a)) * (points[i].horizon - points[i - 1].horizon);
  }
  return null;
}

/** How a projection stands against a limit that lies below (`below`) or above the healthy value. */
export function thresholdOutlook(points: readonly ProjectionPoint[], limit: number, below = true): ThresholdOutlook {
  const last = points[points.length - 1];
  const z = (limit - last.mean) / Math.max(last.sigma, 1e-9);
  return {
    probability: below ? normalCdf(z) : 1 - normalCdf(z),
    timeToLimit: crossing(points, limit, below, 0),
    earliest: crossing(points, limit, below, below ? -1 : 1),
    latest: crossing(points, limit, below, below ? 1 : -1),
  };
}
