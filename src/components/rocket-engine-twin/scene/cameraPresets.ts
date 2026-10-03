// Composed views of the engine. Every preset is a spherical pose around a
// target, so a view is deterministic: the same preset always frames the same
// thing the same way.
import { BEARING_AT, CONTROLLER_AT, PUMPS } from "../engine/layout";
import type { CameraPresetId } from "../types";

export interface CameraPreset {
  target: readonly [number, number, number];
  /** 0° looks from +Z, 90° from +X. The cut-aways open toward 45°. */
  azimuthDeg: number;
  /** 0° looks straight down, 90° level with the target. */
  polarDeg: number;
  distance: number;
  minDistance: number;
  maxDistance: number;
}

const view = (target: readonly [number, number, number], azimuthDeg: number, polarDeg: number, distance: number, minDistance = distance * 0.45, maxDistance = 16): CameraPreset => ({
  target,
  azimuthDeg,
  polarDeg,
  distance,
  minDistance,
  maxDistance,
});

const FUEL_PUMP: readonly [number, number, number] = [PUMPS.fuel.base[0], PUMPS.fuel.base[1] + 0.45, PUMPS.fuel.base[2]];

export const CAMERA_PRESETS: Record<CameraPresetId, CameraPreset> = {
  hero: view([0, 0.2, 0], 38, 80, 10.2, 6, 14),
  engine_overview: view([0, 0.2, 0], 32, 78, 9.2, 3.2),
  open_engine: view([0, 0.25, 0], 44, 74, 11.6, 4),
  feed_overview: view([0, 0.75, 0], 24, 72, 7.2),
  turbomachinery: view([0.42, 0.75, -0.04], 52, 76, 4.6),
  pump_close: view(FUEL_PUMP, 47, 78, 2.9, 1.3),
  shaft_close: view(FUEL_PUMP, 45, 82, 2.3, 1.1),
  bearing_close: view(BEARING_AT, 45, 80, 1.9, 0.9),
  chamber: view([0, 0.45, 0], 40, 78, 4.4),
  chamber_cutaway: view([0, 0.38, 0], 45, 76, 3.4, 1.4),
  cooling_channel: view([0.1, 0.02, 0.1], 45, 80, 3.6, 1.1),
  injector_region: view([0, 0.85, 0], 45, 66, 2.8, 1.2),
  nozzle: view([0, -0.8, 0], 45, 88, 5.6),
  controller: view(CONTROLLER_AT, -12, 72, 2.6, 1.1),
  sensor_network: view([0.1, 0.8, 0], 18, 74, 6.2),
  test_stand: view([0, -1.55, 0], 30, 83, 14.2, 5, 20),
  health: view([0, 0.3, 0], 34, 78, 9, 3.2),
  digital_twin: view([0.12, 0.12, 0], 42, 78, 9.6, 2.4),
  architecture: view([0, 0.2, 0], 20, 80, 11.4, 5, 18),
};

/** Longer moves take longer, within 700–1800 ms. */
export function transitionMs(from: CameraPreset, to: CameraPreset): number {
  const travel = Math.hypot(to.target[0] - from.target[0], to.target[1] - from.target[1], to.target[2] - from.target[2]) + Math.abs(to.distance - from.distance) * 0.5;
  return Math.round(Math.min(1800, Math.max(700, 700 + travel * 260)));
}

/** Entering the digital twin is the one move that is deliberately slow. */
export const ENTER_MS = 1600;
