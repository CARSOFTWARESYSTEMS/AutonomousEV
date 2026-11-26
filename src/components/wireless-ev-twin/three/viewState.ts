// Per-frame view values. The scene eases them toward the store's
// visualisation mode once per frame; parts only read them. They never pass
// through React state, so nothing re-renders at frame rate.
import type { ViewModeId } from "@/lib/wireless-charging/content";

export const view = {
  /** 0–1: charging-pad layers separated (away from the true air gap). */
  exploded: 0,
  /** 0–1: the vehicle's assembly separated (body lifted, units apart). */
  assembly: 0,
  /** 0–1: vehicle body transparent. */
  xray: 0,
  /** 0–1: vehicle body removed (chassis only). */
  chassis: 0,
  /** 0–1: pad covers cut away and the ground drawn translucent. */
  reveal: 0,
  /** 0–1: a quarter section cut out of the pad enclosures (Cutaway). */
  cut: 0,
  /** 0–1: ground drawn almost clear for the inspection view from below. */
  underbody: 0,
  /** 0–1: battery isolated (everything else ghosted, lid lifted). */
  battery: 0,
  /** 0–1: receiver assembly isolated. */
  receiver: 0,
  /** 0–1: power-electronics cabinet open. */
  power: 0,
  field: 0,
  /** 0–1: the road's magnetic-field section (Dynamic). */
  roadField: 0,
  energy: 0,
  thermal: 0,
  iot: 0,
  /** 0–1: alignment overlay (offsets and air gap dimensioned on the pads). */
  alignment: 0,
  /** 0–1: road segments show their controller state; interlock zone and request window drawn (Dynamic). */
  segments: 0,
  /** 0–1: the coupling-profile chart beside the lane (Dynamic). */
  coupling: 0,
  /** 0–1: inspection backdrop — the city, sky and canopy fade into a dark studio around the subject. */
  studio: 0,
  /** 0–1: a vehicle stands over the ground pad (smoothed from the simulation). */
  occupied: 0,
};

export type ViewChannels = Omit<typeof view, "occupied">;

export function targets(mode: ViewModeId, env = "station"): ViewChannels {
  const station = env === "station";
  const road = env === "dynamic";
  return {
    exploded: station && mode === "exploded" ? 1 : 0,
    assembly: mode === "assembly" ? 1 : 0,
    // On the road the car stays solid in the cutaway: the road opens, not the car. From above, the segment view sees through it.
    // On the road the energy view keeps a trace of the body (selective transparency), so the car still reads as a car.
    xray: mode === "xray" || (station && (mode === "energy" || mode === "thermal" || mode === "field" || mode === "cutaway")) || (road && (mode === "segments" || mode === "field")) ? 1 : road && mode === "energy" ? 0.78 : 0,
    chassis: mode === "chassis" || (station && mode === "exploded") ? 1 : 0,
    reveal: station && (mode === "cutaway" || mode === "exploded" || mode === "field" || mode === "thermal" || mode === "engineering") ? 1 : 0,
    cut: mode === "cutaway" || (road && (mode === "receiver" || mode === "field")) ? 1 : 0,
    underbody: mode === "underbody" ? 1 : 0,
    battery: mode === "battery" ? 1 : 0,
    // Ghosts everything on the vehicle except the receiver (from above on the road, so the pads under it show).
    receiver: (station && (mode === "receiver" || mode === "exploded" || mode === "engineering" || mode === "field" || mode === "cutaway")) || (road && (mode === "segments" || mode === "field")) ? 1 : 0,
    power: mode === "power" ? 1 : 0,
    field: station && mode === "field" ? 1 : 0,
    roadField: road && mode === "field" ? 1 : 0,
    energy: mode === "energy" ? 1 : 0,
    thermal: mode === "thermal" ? 1 : 0,
    iot: mode === "iot" ? 1 : 0,
    alignment: mode === "engineering" ? 1 : 0,
    segments: road && (mode === "segments" || mode === "coupling" || mode === "cutaway" || mode === "receiver" || mode === "field") ? 1 : 0,
    coupling: road && mode === "coupling" ? 1 : 0,
    studio: station && ["receiver", "battery", "exploded", "assembly", "chassis", "underbody", "cutaway", "power", "field", "xray", "engineering", "thermal"].includes(mode) ? 1 : 0,
  };
}

/** Eases every channel toward its target; `instant` (reduced motion) jumps. */
export function easeView(mode: ViewModeId, dt: number, env = "station", occupied = false, instant = false) {
  const t = targets(mode, env);
  const k = instant ? 1 : 1 - Math.exp(-4.2 * dt);
  for (const key of Object.keys(t) as (keyof ViewChannels)[]) view[key] += (t[key] - view[key]) * k;
  view.occupied += ((occupied ? 1 : 0) - view.occupied) * (instant ? 1 : 1 - Math.exp(-3 * dt));
}

/** Vehicle layer opacities derived from the channels (hero vehicle only). */
export function vehicleLayers() {
  const iso = Math.max(view.battery, view.receiver);
  const body = Math.max(0, (1 - 0.9 * view.xray) * (1 - view.chassis) * (1 - 0.94 * iso));
  return {
    body,
    glass: Math.min(body, 0.9) * (1 - 0.85 * view.xray),
    chassis: 1 - 0.94 * iso,
    battery: 1 - 0.92 * view.receiver,
    power: 1 - 0.9 * view.battery - 0.72 * view.receiver,
  };
}
