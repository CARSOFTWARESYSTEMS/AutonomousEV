// The flux-density colour scale shared by the 3D and 2D field views, T.
// A perceptual cool-to-warm map (navy → blue → teal → amber → orange-red),
// on a logarithmic scale by default or a linear one on request.
export const fieldScale = { min: 1e-6, max: 1e-2 };

export type FieldScaleMode = "log" | "linear";

/** Position 0–1 of a flux density on the scale; `full` is the linear scale's top, T. */
export function fieldT(b: number, mode: FieldScaleMode = "log", full = fieldScale.max): number {
  if (!(b > 0)) return 0;
  if (mode === "linear") return Math.min(1, b / full);
  const lo = Math.log10(fieldScale.min);
  return Math.min(1, Math.max(0, (Math.log10(b) - lo) / (Math.log10(fieldScale.max) - lo)));
}

/** A round number at or above x (1, 2 or 5 × 10ⁿ), for the linear scale's top. */
export function niceCeil(x: number): number {
  if (!(x > 0)) return 1e-6;
  const e = Math.floor(Math.log10(x));
  const m = x / 10 ** e;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * 10 ** e;
}

const STOPS: [number, number, number][] = [
  [0.03, 0.05, 0.13],
  [0.09, 0.22, 0.55],
  [0.06, 0.56, 0.7],
  [0.55, 0.82, 0.5],
  [0.98, 0.8, 0.32],
  [0.98, 0.42, 0.18],
];

/** Field magnitude colour (cool to warm), linear RGB 0–1. */
export function fieldColor(t01: number): [number, number, number] {
  const x = Math.min(0.9999, Math.max(0, t01)) * (STOPS.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  return [0, 1, 2].map((k) => STOPS[i][k] + (STOPS[i + 1][k] - STOPS[i][k]) * f) as [number, number, number];
}

/** CSS gradient of the same scale, for legends. */
export const FIELD_GRADIENT = `linear-gradient(90deg, ${STOPS.map((c, i) => `rgb(${c.map((v) => Math.round(v * 255)).join(",")}) ${Math.round((i / (STOPS.length - 1)) * 100)}%`).join(", ")})`;

/**
 * Paints RMS flux densities into RGBA texels (transparent where invalid);
 * with `contours`, thin light lines mark each decade (log) or each tenth of
 * full scale (linear).
 */
export function paintFieldTexels(data: Uint8Array, values: Float32Array, mode: FieldScaleMode, full: number, contours: boolean, alpha = 215) {
  for (let k = 0; k < values.length; k++) {
    const v = values[k];
    const o = k * 4;
    if (!Number.isFinite(v) || v <= 0) {
      data[o + 3] = 0;
      continue;
    }
    const t = fieldT(v, mode, full);
    let [r, g, b] = fieldColor(t);
    if (contours) {
      const q = mode === "log" ? Math.log10(v) : (v / full) * 10;
      const d = Math.abs(q - Math.round(q));
      if (d < (mode === "log" ? 0.035 : 0.06)) {
        r = r * 0.35 + 0.65;
        g = g * 0.35 + 0.65;
        b = b * 0.35 + 0.65;
      }
    }
    data[o] = r * 255;
    data[o + 1] = g * 255;
    data[o + 2] = b * 255;
    data[o + 3] = alpha;
  }
}
