// Per-frame render state shared by scene components. The simulation driver
// writes it once per frame; everything else only reads. It is deliberately a
// plain mutable object (not React state) so 60 fps updates never re-render.
import { Vector3 } from "three";
import type { ComponentId, EnvironmentId, HealthState } from "../types";
import { FLOW_IDS } from "../aircraft/routes";
import { PREFLIGHT_SNAPSHOT } from "../state/uflightStore";
import type { PartPresentation, SensorVisibility, ViewFlags } from "../state/selectors";
import type { HealthSnapshot } from "../simulation/hums";
import { type FlightState, groundState } from "../simulation/mission";
import type { LoadPathId } from "../simulation/structures";

export const frame = {
  /** Seconds on the performance clock. */
  now: 0,
  dt: 0,

  /** Where the aircraft's ground-contact origin is in the scene. */
  position: new Vector3(),
  /** Nose-up pitch, radians. */
  pitch: 0,
  /** Extra height while exploded, so assemblies can separate downward. */
  lift: 0,
  /** Tilt-unit angle, degrees: 90 = thrust up, 0 = thrust forward. */
  tiltDeg: 90,
  /** Smoothed speed of each propulsion unit, rpm. */
  rpm: new Float32Array(8),
  /** Accumulated visual rotation of each rotor, radians. */
  rotorAngle: new Float32Array(8),
  /** Control-surface deflections, radians. */
  surfaces: { flaperonLeft: 0, flaperonRight: 0, elevator: 0, rudder: 0 },
  /** Wing-tip deflection for the structural view, signed, −1 to 1. */
  wingBend: 0,
  /** Distance to the destination pad along +X. */
  routeLength: 0,

  /** Smoothed copies of interaction state. */
  exploded: 0,
  /** 0 before the aircraft is powered on, 1 after. */
  power: 0,
  environment: { studio: 1, vertiport: 0, flight: 0, twin: 0 } as Record<EnvironmentId, number>,

  flight: groundState() as FlightState,
  snapshot: PREFLIGHT_SNAPSHOT as HealthSnapshot,
  /** Bearing fault severity driving the vibration overlay, 0–1. */
  severity: 0,

  /** What every part should look like in the current view. */
  presentation: new Map<ComponentId, PartPresentation>(),
  /** Level 2 targets: whether each part's sub-assembly displacement applies. */
  subOpen: new Map<ComponentId, boolean>(),
  /** Level 3: smoothed amount by which each part's internals separate, written by the part. */
  deep: new Map<ComponentId, number>(),
  deepOpen: new Map<ComponentId, boolean>(),
  /** Current opacity of each part, written by the part, for effects that follow it. */
  opacity: new Map<ComponentId, number>(),
  /** Some of the skin is see-through (or was a moment ago), so enclosed parts have to be drawn. */
  revealed: false,
  /** Components whose health is not nominal. */
  health: {} as Partial<Record<ComponentId, HealthState>>,
  /** Heat level per heat source, 0–1. */
  thermal: {} as Partial<Record<ComponentId, number>>,
  loads: {} as Record<LoadPathId, number>,

  /** Activation per flow route, 0–1, smoothed. */
  flows: Object.fromEntries(FLOW_IDS.map((id) => [id, 0])) as Record<string, number>,
  flags: {
    thermal: false,
    loads: false,
    healthTint: false,
    healthLabels: false,
    ghost: false,
    vibration: false,
    redundancy: false,
    navigation: false,
    dependencies: false,
  } as ViewFlags,
  sensors: { category: null, ids: [] } as SensorVisibility,
  /** 0–1 visibility of the twin's reference overlay, and how far it has settled onto the aircraft. */
  ghost: 0,
  ghostAlign: 0,
};

export type FrameState = typeof frame;

/**
 * Back to the state a fresh page load starts from. The frame outlives any one
 * canvas, so a host that drives it (the homepage preview) calls this when it
 * unmounts, and the full application then opens dark and assembled as usual.
 */
export function resetFrameState() {
  frame.position.set(0, 0, 0);
  frame.pitch = 0;
  frame.lift = 0;
  frame.tiltDeg = 90;
  frame.rpm.fill(0);
  frame.exploded = 0;
  frame.power = 0;
  frame.environment = { studio: 1, vertiport: 0, flight: 0, twin: 0 };
  frame.flight = groundState();
  frame.snapshot = PREFLIGHT_SNAPSHOT;
  frame.severity = 0;
  frame.presentation.clear();
  frame.subOpen.clear();
  frame.deep.clear();
  frame.deepOpen.clear();
  frame.opacity.clear();
  frame.revealed = false;
  frame.health = {};
  for (const id of FLOW_IDS) frame.flows[id] = 0;
  frame.ghost = 0;
  frame.ghostAlign = 0;
}
