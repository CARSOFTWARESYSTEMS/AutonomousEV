// Per-frame render state shared by scene components. The simulation driver
// writes it once per frame; everything else only reads. It is deliberately a
// plain mutable object (not React state) so 60 fps updates never re-render.
import { Quaternion, Vector3 } from "three";
import type { LinkSample } from "../simulation/communications";
import { captureSequenceAt, type CaptureSample } from "../simulation/payload";
import type { CommandPhase } from "../simulation/mission";
import type { ViewFlags } from "../state/selectors";
import { EARTH_RADIUS_KM } from "../simulation/orbit";
import { EARTH_RADIUS_UNITS } from "./cameraPresets";
import { FLOW_IDS, type FlowId } from "../spacecraft/flowRoutes";

/** Scene units per kilometre. */
export const UNITS_PER_KM = EARTH_RADIUS_UNITS / EARTH_RADIUS_KM;

/** The spacecraft is drawn larger once the camera is farther than this, so it never vanishes against Earth. */
export const SCALE_DISTANCE = 150;

/** Direction of the studio key light in Build Mode, body coordinates: upper left, in front. */
export const STUDIO_KEY_DIRECTION = new Vector3(-0.62, 0.66, 0.42).normalize();

export const frame = {
  /** Seconds on the performance clock. */
  now: 0,
  dt: 0,
  orbitTimeS: 0,

  satPos: new Vector3(0, EARTH_RADIUS_UNITS * 1.08, 0),
  velocityDir: new Vector3(1, 0, 0),
  zenith: new Vector3(0, 1, 0),
  /** Local-vertical frame: X along velocity, Y to zenith. */
  lvlhQuat: new Quaternion(),
  /** Body-to-world attitude. */
  attitude: new Quaternion(),
  /** The attitude the spacecraft would hold if it were simply nadir pointing. */
  nadirQuat: new Quaternion(),
  /** Visual scale of the spacecraft model (≥ 1). */
  satScale: 1,

  sunDir: new Vector3(1, 0, 0),
  /** 0 in Earth's shadow, 1 in sunlight. */
  sunFraction: 1,
  /** How brightly lit the ground directly beneath the spacecraft is, 0–1. */
  dayBelow: 1,
  earthRotation: 0,

  stationPos: new Vector3(),
  stationQuat: new Quaternion(),
  targetPos: new Vector3(),
  /** Point on the ground the payload boresight meets, when it meets it. */
  footprintPos: new Vector3(),
  footprintValid: false,

  /** Smoothed copies of interaction state. */
  exploded: 0,
  studio: 0,
  xray: 0,

  link: { state: "NO_LINK", visible: false, elevationDeg: 0, rangeKm: 0 } as LinkSample,
  /** 0–1 smoothed link visibility, for fading the RF beam. */
  linkStrength: 0,
  generationW: 0,
  loadW: 12.1,
  batterySoc: 78,
  batteryW: 0,
  wheelRpm: [1200, -900, 1500, 0] as [number, number, number, number],
  /** Accumulated visual rotation of each wheel, radians. */
  wheelAngle: [0, 0, 0, 0] as [number, number, number, number],
  capture: captureSequenceAt(-1) as CaptureSample,
  command: { phase: "NONE" as CommandPhase, progress: 0 },
  /** Which RF traffic is flowing: 0 = none, otherwise intensity 0–1. */
  uplink: 0,
  telemetry: 0,
  payloadDownlink: 0,
  downlinkProgress: 0,
  /** 0–1: flight computer running. */
  bootProgress: 1,

  /** Signed activation per internal flow: sign is direction, magnitude is strength. */
  flows: Object.fromEntries(FLOW_IDS.map((id) => [id, 0])) as Record<FlowId, number>,
  /** 0–1 visibility of the Sun-to-array rays. */
  sunRays: 0,

  flags: {
    studio: false,
    thermal: false,
    bodyAxes: false,
    footprint: false,
    orbitPath: false,
    groundTrack: false,
    groundSegment: false,
    notToScale: false,
  } as ViewFlags,
};

export type FrameState = typeof frame;
