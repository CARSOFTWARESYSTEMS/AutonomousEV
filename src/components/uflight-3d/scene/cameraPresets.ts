// Camera choreography data. A preset is a spherical pose around a target in
// the aircraft's frame (which travels with the aircraft but stays level). The
// rig (CameraRig.tsx) tweens between presets; nothing here depends on three.js.
import type { Vec3 } from "../types";
import { AIRCRAFT_CENTRE, unitMount, unitPoint } from "../aircraft/layout";
import { clamp } from "../lib/math";

export interface CameraPreset {
  /** Look-at point, aircraft coordinates. */
  target: Vec3;
  /** Azimuth about the vertical, degrees: 90 looks at the nose head-on, 0 at the starboard side. */
  azimuthDeg: number;
  /** Angle from the vertical, degrees: 90 is level with the target, above 90 looks up at it. */
  polarDeg: number;
  distance: number;
  minDistance: number;
  maxDistance: number;
  /** Where the target sits on screen, as a fraction of the viewport from centre (+x right, +y up). */
  screenOffset?: readonly [number, number];
  /** Travel time in ms; chosen from the distance travelled when omitted. */
  durationMs?: number;
}

const preset = (p: Omit<CameraPreset, "minDistance" | "maxDistance"> & Partial<Pick<CameraPreset, "minDistance" | "maxDistance">>): CameraPreset => ({
  minDistance: 2.2,
  maxDistance: 60,
  ...p,
});

const unit04 = unitMount("04");
/** Motor 04 with its thrust axis forward (cruise) and up (hover). */
const MOTOR_04_CRUISE = unitPoint(unit04, [0.45, 0, 0], 0);
const MOTOR_04_HOVER = unitPoint(unit04, [0.45, 0, 0], 90);

export const CAMERA_PRESETS = {
  hero: preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 50, polarDeg: 80, distance: 24, screenOffset: [0.23, 0.02], durationMs: 1800 }),
  "aircraft-overview": preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 44, polarDeg: 77, distance: 19.5, screenOffset: [0, 0.03] }),
  exploded: preset({ target: [-0.8, 3.4, 0], azimuthDeg: 40, polarDeg: 68, distance: 31 }),
  nose: preset({ target: [2.5, 1.25, 0], azimuthDeg: 66, polarDeg: 78, distance: 7.5 }),
  cabin: preset({ target: [0.6, 1.2, 0], azimuthDeg: 26, polarDeg: 56, distance: 8.6 }),
  wing: preset({ target: [0.2, 2.2, 3.4], azimuthDeg: 22, polarDeg: 52, distance: 12 }),
  "battery-bay": preset({ target: [0.4, 0.7, 0], azimuthDeg: 30, polarDeg: 64, distance: 9.5 }),
  "propulsion-overview": preset({ target: [0, 2.2, 0], azimuthDeg: 60, polarDeg: 58, distance: 23 }),
  "propulsion-unit": preset({ target: MOTOR_04_HOVER, azimuthDeg: 60, polarDeg: 68, distance: 6 }),
  "flight-controls": preset({ target: [-1.6, 1.9, 0], azimuthDeg: -34, polarDeg: 58, distance: 21 }),
  avionics: preset({ target: [-1.6, 1.1, 0], azimuthDeg: -28, polarDeg: 64, distance: 7.2 }),
  // The whole fuselage from ahead and above, so the channel in the nose and the two aft are seen apart.
  redundancy: preset({ target: [0.3, 1.2, 0], azimuthDeg: 48, polarDeg: 58, distance: 11.5 }),
  navigation: preset({ target: [0.2, 1.3, 0], azimuthDeg: 44, polarDeg: 60, distance: 15 }),
  communications: preset({ target: [-1.6, 1.5, 0], azimuthDeg: -22, polarDeg: 56, distance: 9 }),
  hums: preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 28, polarDeg: 52, distance: 27 }),
  structures: preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 34, polarDeg: 62, distance: 22 }),
  thermal: preset({ target: [-0.3, 1.1, 0], azimuthDeg: 28, polarDeg: 62, distance: 20 }),
  health: preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 44, polarDeg: 64, distance: 30, screenOffset: [-0.012, 0.02] }),
  // From outboard and a little behind, so the motor is seen through the nacelle and the rotor disc is edge-on.
  fault: preset({ target: MOTOR_04_CRUISE, azimuthDeg: -8, polarDeg: 70, distance: 5.2, screenOffset: [0, 0.03] }),
  "fault-overview": preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 46, polarDeg: 70, distance: 23 }),
  "digital-twin": preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 38, polarDeg: 68, distance: 28 }),
  architecture: preset({ target: [-0.4, 1.4, 0], azimuthDeg: 30, polarDeg: 52, distance: 25 }),

  // Mission: one view per part of the flight.
  "mission-preflight": preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 50, polarDeg: 78, distance: 24, durationMs: 1800 }),
  "mission-takeoff": preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 62, polarDeg: 97, distance: 25, durationMs: 1800 }),
  "mission-transition": preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 18, polarDeg: 82, distance: 27, durationMs: 1800 }),
  "mission-cruise": preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 56, polarDeg: 74, distance: 30, durationMs: 1800 }),
  "mission-event": preset({ target: MOTOR_04_CRUISE, azimuthDeg: 18, polarDeg: 70, distance: 9.5, durationMs: 1800 }),
  "mission-approach": preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 24, polarDeg: 78, distance: 27, durationMs: 1800 }),
  "mission-landing": preset({ target: AIRCRAFT_CENTRE, azimuthDeg: 44, polarDeg: 66, distance: 27, durationMs: 1800 }),
  // Unit 04 left of centre, so the aircraft behind it stays clear of the assessment panel on the right.
  "mission-postflight": preset({ target: MOTOR_04_HOVER, azimuthDeg: 62, polarDeg: 76, distance: 17, screenOffset: [-0.2, -0.02], durationMs: 1800 }),
} as const satisfies Record<string, CameraPreset>;

export type CameraPresetId = keyof typeof CAMERA_PRESETS;

export const CAMERA_PRESET_IDS = Object.keys(CAMERA_PRESETS) as CameraPresetId[];

export const cameraPreset = (id: CameraPresetId): CameraPreset => CAMERA_PRESETS[id];

/** Travel time for a move: longer for bigger moves, always within 700–1800 ms. */
export function transitionDurationMs(travel: number, target?: CameraPreset): number {
  if (target?.durationMs) return target.durationMs;
  return Math.round(Math.min(1800, Math.max(700, 700 + travel * 55)));
}

/** The window the presets are composed for, and the clear width it leaves between the side panels. */
const REFERENCE = { height: 900, free: 704 };

/**
 * How much further back the camera stands in a window that leaves less room
 * between the side panels than the reference one, so a view composed at
 * 1440 × 900 still fits at 1024 × 768. Never closer than composed.
 */
export function viewportFit(width: number, height: number): number {
  // Mirrors --panel-width and the panels' inset in uflight.module.css.
  const panel = clamp(0.27 * width, 268, 348);
  const free = Math.max(width - 2 * (panel + 20), 240);
  return clamp((REFERENCE.free / REFERENCE.height) * (height / free), 1, 1.6);
}
