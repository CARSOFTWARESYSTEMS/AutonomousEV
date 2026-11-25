// Per-frame view values. The scene's director eases them toward the store's
// visualisation mode once per frame; parts only read them. They never pass
// through React state, so nothing re-renders at frame rate.
import type { ViewModeId } from "@/lib/wireless-charging/content";

export const view = {
  /** 0–1: layers separated. */
  exploded: 0,
  /** 0–1: vehicle body transparent. */
  xray: 0,
  /** 0–1: pad covers, cabinet shell and ground cut away. */
  reveal: 0,
  field: 0,
  energy: 0,
  thermal: 0,
  iot: 0,
};

export function targets(mode: ViewModeId, env = "station") {
  return {
    exploded: mode === "exploded" ? 1 : 0,
    // On the road the car stays solid in the cutaway: the road opens, not the car.
    xray: mode === "xray" || mode === "energy" || mode === "thermal" || mode === "field" || mode === "exploded" || (mode === "cutaway" && env === "station") ? 1 : 0,
    reveal: mode === "cutaway" || mode === "exploded" || mode === "field" || mode === "thermal" || mode === "engineering" ? 1 : 0,
    field: mode === "field" ? 1 : 0,
    energy: mode === "energy" ? 1 : 0,
    thermal: mode === "thermal" ? 1 : 0,
    iot: mode === "iot" ? 1 : 0,
  };
}

export function easeView(mode: ViewModeId, dt: number, env = "station") {
  const t = targets(mode, env);
  const k = 1 - Math.exp(-5 * dt);
  for (const key of Object.keys(t) as (keyof typeof t)[]) view[key] += (t[key] - view[key]) * k;
}
