// Camera choreography data. A preset is a spherical pose around a target,
// expressed in one of four moving reference frames. The rig (CameraRig.tsx)
// tweens between presets; nothing here depends on three.js.
import type { Vec3 } from "../types";

/**
 * - `body`    — follows the spacecraft and turns with it (inspection views).
 * - `nadir`   — the attitude the spacecraft holds when simply nadir pointing: the same
 *               composition as `body`, but slews and tracking are seen as the body turning.
 * - `lvlh`    — follows the spacecraft, X along the velocity, Earth "down".
 * - `earth`   — Earth-centred inertial (orbit views).
 * - `station` — sits at the ground station, local vertical up.
 */
export type CameraFrame = "body" | "nadir" | "lvlh" | "earth" | "station";

export interface CameraPreset {
  frame: CameraFrame;
  /** Look-at point in frame coordinates (scene units). */
  target: Vec3;
  /** Azimuth about the frame's up axis, degrees (0 = +Z, 90 = +X). */
  azimuthDeg: number;
  /** Angle from the frame's up axis, degrees. */
  polarDeg: number;
  distance: number;
  minDistance: number;
  maxDistance: number;
  /** Where the target sits on screen, as a fraction of the viewport from centre (+x right, +y up). */
  screenOffset?: readonly [number, number];
  /** Travel time in ms; chosen automatically from the distance travelled when omitted. */
  durationMs?: number;
}

/** Scene units per kilometre: Earth is drawn with a 2,000-unit radius. */
export const EARTH_RADIUS_UNITS = 2000;

const local = (p: Omit<CameraPreset, "minDistance" | "maxDistance"> & Partial<Pick<CameraPreset, "minDistance" | "maxDistance">>): CameraPreset => ({
  minDistance: 3.2,
  maxDistance: 70,
  ...p,
});

export const CAMERA_PRESETS = {
  hero: local({ frame: "body", target: [0, 0, 0], azimuthDeg: 34, polarDeg: 75, distance: 16, screenOffset: [0.17, 0.07], durationMs: 1800 }),
  overview: local({ frame: "body", target: [0, 0, 0], azimuthDeg: 38, polarDeg: 68, distance: 15.5, screenOffset: [0, 0.045] }),
  exploded: local({ frame: "body", target: [0, 0, 0], azimuthDeg: 42, polarDeg: 62, distance: 21 }),
  xray: local({ frame: "body", target: [0, 0, 0], azimuthDeg: 28, polarDeg: 70, distance: 10.5 }),
  build: local({ frame: "body", target: [0, 0, 0], azimuthDeg: 36, polarDeg: 64, distance: 15 }),

  // Systems
  power: local({ frame: "body", target: [0, 0, 0], azimuthDeg: 22, polarDeg: 60, distance: 14.5 }),
  adcs: local({ frame: "nadir", target: [0, 0, 0], azimuthDeg: 34, polarDeg: 64, distance: 15.5 }),
  payload: local({ frame: "lvlh", target: [0, 0, 0], azimuthDeg: 215, polarDeg: 13, distance: 27, screenOffset: [0.02, 0.13] }),
  communications: local({ frame: "lvlh", target: [0, -2.5, 0], azimuthDeg: 212, polarDeg: 58, distance: 23, screenOffset: [0, 0.06] }),
  thermal: local({ frame: "body", target: [0, 0, 0], azimuthDeg: 58, polarDeg: 66, distance: 13.5 }),
  avionics: local({ frame: "body", target: [0.4, 0.1, 0], azimuthDeg: 58, polarDeg: 70, distance: 12 }),
  structure: local({ frame: "body", target: [0, 0, 0], azimuthDeg: 36, polarDeg: 64, distance: 13.5 }),

  // Signals
  signals: local({ frame: "lvlh", target: [0, -2.5, 0], azimuthDeg: 212, polarDeg: 60, distance: 24, screenOffset: [0, 0.06] }),
  groundStation: { frame: "station", target: [0, 14, 0], azimuthDeg: 150, polarDeg: 80, distance: 62, minDistance: 22, maxDistance: 180 },

  // Mission stages. LVLH azimuths: 0 = west of the ground track, 90 = ahead,
  // 180 = east (the sunlit side on the reference pass), 270 = behind.
  missionBoot: local({ frame: "body", target: [0.56, 0.55, 0], azimuthDeg: 64, polarDeg: 70, distance: 7.2 }),
  missionPower: local({ frame: "body", target: [0, 0, 0], azimuthDeg: 26, polarDeg: 66, distance: 15 }),
  missionAttitude: local({ frame: "nadir", target: [0, 0, 0], azimuthDeg: 34, polarDeg: 62, distance: 17 }),
  missionTarget: local({ frame: "lvlh", target: [16, -10, 0], azimuthDeg: 252, polarDeg: 62, distance: 62, maxDistance: 180, screenOffset: [0, 0.08] }),
  missionCapture: local({ frame: "lvlh", target: [0, 0, 0], azimuthDeg: 215, polarDeg: 13, distance: 27, screenOffset: [0.02, 0.13] }),
  missionStore: local({ frame: "body", target: [0.56, 0.3, 0], azimuthDeg: 64, polarDeg: 68, distance: 6.4 }),
  missionGroundPass: local({ frame: "lvlh", target: [22, -14, -8], azimuthDeg: 236, polarDeg: 62, distance: 72, maxDistance: 200, screenOffset: [0, 0.08] }),
  missionUplink: local({ frame: "lvlh", target: [0, -3, 0], azimuthDeg: 216, polarDeg: 56, distance: 27, screenOffset: [0, 0.08] }),
  missionTelemetry: local({ frame: "lvlh", target: [0, -3, 0], azimuthDeg: 204, polarDeg: 60, distance: 25, screenOffset: [0, 0.08] }),
  missionDownlink: local({ frame: "lvlh", target: [0, -4, 0], azimuthDeg: 150, polarDeg: 56, distance: 30, screenOffset: [0, 0.08] }),
  missionComplete: local({ frame: "lvlh", target: [0, -10, 0], azimuthDeg: 140, polarDeg: 52, distance: 96, maxDistance: 240, screenOffset: [0, 0.06] }),

  // Orbit
  orbit: {
    frame: "earth",
    target: [0, 0, 0],
    // Off to one side of the Sun, so the day–night boundary and Earth's shadow are in view.
    azimuthDeg: 30,
    polarDeg: 62,
    distance: EARTH_RADIUS_UNITS * 3.5,
    minDistance: EARTH_RADIUS_UNITS * 1.7,
    maxDistance: EARTH_RADIUS_UNITS * 6,
    durationMs: 1800,
  },
} as const satisfies Record<string, CameraPreset>;

export type CameraPresetId = keyof typeof CAMERA_PRESETS;

export const cameraPreset = (id: CameraPresetId): CameraPreset => CAMERA_PRESETS[id];

/** Travel time for a move: longer for bigger moves, always within 700–1800 ms. */
export function transitionDurationMs(travel: number, preset?: CameraPreset): number {
  if (preset?.durationMs) return preset.durationMs;
  return Math.round(Math.min(1800, Math.max(700, 700 + travel * 55)));
}
