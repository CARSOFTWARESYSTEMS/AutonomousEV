// Scalar helpers for the simulation and scene layers. The generic ones are
// shared with the Satellite Explorer rather than duplicated.
export { clamp, clamp01, lerp, smoothstep, easeInOutCubic, easeOutCubic, damp, mulberry32, DEG } from "../../satellite-explorer/lib/math";

/** Smoothstep on 0–1 and its integral, used where a quantity and its running total must agree. */
export const ease = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};
export const easeIntegral = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * c - (c * c * c * c) / 2;
};

/** Round to a number of decimal places. */
export const round = (value: number, places = 0) => {
  const f = Math.pow(10, places);
  return Math.round(value * f) / f;
};

/** Round to the nearest multiple of `step`. */
export const roundTo = (value: number, step: number) => Math.round(value / step) * step;
