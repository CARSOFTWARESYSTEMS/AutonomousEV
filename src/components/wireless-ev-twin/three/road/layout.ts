// Layout of the electrified highway. The road is drawn in the hero vehicle's
// frame: the car stays at x = 0 and everything along the road is placed at
// (road-frame x − the vehicle's simulated x). Repeating items wrap with
// periods that divide the 1000 m route, so nothing jumps when the route laps.
// No three.js here: the interface may import these constants.

/** Centre line of the hero vehicle's lane (lane 0), m. */
export const ROAD_Z = 26;
export const LANE_WIDTH = 3.6;
/** Lane centres: 0 and 1 travel in +x, 2 and 3 in −x. */
export const laneZ = (lane: number) => ROAD_Z + lane * LANE_WIDTH;
/** Median barrier between lanes 1 and 2. */
export const MEDIAN_Z = ROAD_Z + 1.5 * LANE_WIDTH;
/** Paved width: near shoulder edge to far shoulder edge. */
export const PAVED = { z0: ROAD_Z - 3.0, z1: ROAD_Z + 3.5 * LANE_WIDTH + 1.2 };
/** Guardrails on the verge, outside both shoulders. */
export const GUARDRAIL_Z = [ROAD_Z - 3.35, PAVED.z1 + 0.35];
/** Roadside segment-controller cabinets. */
export const CABINET_Z = ROAD_Z - 4.4;
/** Road windings 30 mm under the surface. */
export const ROAD_WINDING_Y = -0.03;
/** Visible stretch of road around the vehicle, m (a period that divides the route). */
export const WINDOW = 500;

/**
 * The cutaway: a window of the wearing course removed over the hero lane, from
 * behind the car to ahead of it, and a deeper utility trench along the near
 * shoulder that exposes the road's layers and the duct bank.
 */
export const CUT = { x0: -7, x1: 23, laneZ0: ROAD_Z - 2.0, laneZ1: ROAD_Z + 1.8, trenchZ0: ROAD_Z - 2.6 };
/** Road construction layers, top down: name, depth of the bottom face (m below the surface). */
export const LAYERS = [
  { id: "wearing", name: "Wearing course (asphalt)", bottom: 0.04, color: "#2b2d31" },
  { id: "binder", name: "Binder course", bottom: 0.16, color: "#46484d" },
  { id: "base", name: "Granular base", bottom: 0.46, color: "#7c7a73" },
  { id: "subgrade", name: "Subgrade", bottom: 0.62, color: "#6b5a46" },
] as const;

/** Position in [lo, lo + period) of a road-frame x seen from a vehicle at x0. */
export function wrapRel(worldX: number, x0: number, period: number, lo: number): number {
  const r = (worldX - x0 - lo) % period;
  return (r < 0 ? r + period : r) + lo;
}

/** Deterministic pseudo-random number in [0, 1). */
export const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
