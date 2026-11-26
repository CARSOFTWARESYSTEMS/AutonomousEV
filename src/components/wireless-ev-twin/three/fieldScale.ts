// The flux-density colour scale shared by the 3D and 2D field views (log), T.
export const fieldScale = { min: 1e-6, max: 1e-2 };

/** Field magnitude scale (dark → violet → cyan → white), for the flux-density map. */
export function fieldColor(t01: number): [number, number, number] {
  const stops: [number, number, number][] = [
    [0.02, 0.03, 0.08],
    [0.24, 0.12, 0.5],
    [0.1, 0.55, 0.85],
    [0.55, 0.92, 0.95],
    [1, 1, 0.92],
  ];
  const x = Math.min(0.9999, Math.max(0, t01)) * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  return [0, 1, 2].map((k) => stops[i][k] + (stops[i + 1][k] - stops[i][k]) * f) as [number, number, number];
}
