// Camera choreography. The camera is always a spherical pose around a target
// in the aircraft's frame; presets and component focus change that pose
// through eased, interruptible moves, and the pointer adjusts it within
// limits. This replaces free OrbitControls so every view stays composed.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { type PerspectiveCamera, Vector3 } from "three";
import type { ComponentId, Vec3 } from "../types";
import { COMPONENTS, unitNumberOf } from "../data/componentDefinitions";
import { getSensor, sensorPosition } from "../data/sensorDefinitions";
import { EXPLODED_LIFT, PLACEMENT, PROPULSION_PARTS, UNIT_STATIONS, anchorAt, unitMount, unitPartLocal, unitPoint } from "../aircraft/layout";
import { DEG, clamp, easeInOutCubic } from "../lib/math";
import { sceneShift } from "../state/selectors";
import { useUFlightStore } from "../state/uflightStore";
import { CAMERA_PRESETS, type CameraPreset, transitionDurationMs, viewportFit } from "./cameraPresets";
import { frame } from "./frameState";

interface Pose {
  target: Vector3;
  /** Radians. */
  azimuth: number;
  polar: number;
  distance: number;
  offsetX: number;
  offsetY: number;
}

const POLAR_MIN = 6 * DEG;
const POLAR_MAX = 150 * DEG;
/** How far right-drag may move the look-at point from where the view put it, in metres. */
const PAN_LIMIT = 4;
/** The camera never goes below this height above the ground. */
const FLOOR_CLEARANCE = 0.3;

const position = new Vector3();
const lookAt = new Vector3();
const local = new Vector3();
const panRight = new Vector3();
const panUp = new Vector3();

function sphericalOffset(pose: Pose, out: Vector3): Vector3 {
  const sin = Math.sin(pose.polar);
  return out.set(sin * Math.sin(pose.azimuth), Math.cos(pose.polar), sin * Math.cos(pose.azimuth)).multiplyScalar(pose.distance);
}

const shortestAngle = (from: number, to: number) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return from + d;
};

function poseFromPreset(preset: CameraPreset): Pose {
  return {
    target: new Vector3(preset.target[0], preset.target[1], preset.target[2]),
    azimuth: preset.azimuthDeg * DEG,
    polar: preset.polarDeg * DEG,
    distance: preset.distance,
    offsetX: preset.screenOffset?.[0] ?? 0,
    offsetY: preset.screenOffset?.[1] ?? 0,
  };
}

/** Where a component is now: tilt units move with the tilt angle, and everything moves in the exploded view. */
function focusAnchor(id: ComponentId, exploded: number): Vec3 {
  const unit = unitNumberOf(id);
  if (!unit) return anchorAt(id, exploded);
  const mount = unitMount(unit);
  const part = PROPULSION_PARTS.find((p) => id === `pu${unit}-${p}`);
  const localPoint = part ? unitPartLocal(mount.kind, part) : ([UNIT_STATIONS[mount.kind].hub * 0.55, 0, 0] as Vec3);
  const p = part === "tilt-actuator" ? mount.pivot : unitPoint(mount, localPoint, frame.tiltDeg);
  const { explode } = PLACEMENT[id];
  return [p[0] + explode[0] * exploded, p[1] + (explode[1] + EXPLODED_LIFT) * exploded, p[2] + explode[2] * exploded];
}

/** Pose that frames one component: closer for small parts, from the side it faces. */
function poseForComponent(id: ComponentId, isolated: boolean, exploded: number, current: Pose): { pose: Pose; preset: CameraPreset } {
  const placement = PLACEMENT[id];
  const assembly = !COMPONENTS[id].parent && unitNumberOf(id) !== null;
  const distance = clamp(placement.radius * (isolated ? 3.2 : 4.2) + (assembly ? 2.2 : 0.9), 1.5, 22);
  const view = placement.view;
  const preset: CameraPreset = {
    target: focusAnchor(id, exploded),
    azimuthDeg: view ? view[0] : current.azimuth / DEG,
    polarDeg: view ? view[1] : clamp(current.polar / DEG, 50, 80),
    distance,
    minDistance: Math.max(0.5, placement.radius * 1.3),
    maxDistance: 60,
  };
  return { pose: poseFromPreset(preset), preset };
}

function poseForSensor(sensorId: string, current: Pose): { pose: Pose; preset: CameraPreset } | null {
  const sensor = getSensor(sensorId);
  if (!sensor) return null;
  const preset: CameraPreset = {
    target: sensorPosition(sensor, frame.tiltDeg),
    azimuthDeg: current.azimuth / DEG,
    polarDeg: clamp(current.polar / DEG, 50, 78),
    distance: sensor.unit ? 3.4 : 5,
    minDistance: 0.6,
    maxDistance: 60,
  };
  return { pose: poseFromPreset(preset), preset };
}

/** Pose for a signal trace: wide enough to follow the signal from its sensor to the health computer. */
function poseForTrace(sensorId: string, current: Pose): { pose: Pose; preset: CameraPreset } | null {
  const sensor = getSensor(sensorId);
  if (!sensor) return null;
  const from = sensorPosition(sensor, frame.tiltDeg);
  const to = PLACEMENT["hums-computer"].anchor;
  const span = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const preset: CameraPreset = {
    target: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2],
    azimuthDeg: current.azimuth / DEG,
    polarDeg: clamp(current.polar / DEG, 48, 66),
    distance: clamp(span * 1.6 + 4, 8, 26),
    minDistance: 0.6,
    maxDistance: 60,
  };
  return { pose: poseFromPreset(preset), preset };
}

export default function CameraRig() {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const rig = useRef({
    pose: poseFromPreset(CAMERA_PRESETS.hero),
    /** Where the current view placed the target; panning is limited around it. */
    home: new Vector3(),
    min: CAMERA_PRESETS.hero.minDistance as number,
    max: CAMERA_PRESETS.hero.maxDistance as number,
    tween: null as null | { from: Pose; to: Pose; start: number; duration: number },
    initialised: false,
    shift: 0,
    drag: null as null | { id: number; mode: "rotate" | "pan"; x: number; y: number },
    pointers: new Map<number, { x: number; y: number }>(),
    pinch: 0,
  });

  // Presets and focus both arrive as store changes.
  useEffect(() => {
    /** Begin a move to `to`, starting from wherever the camera is now. */
    const moveTo = (to: Pose, preset: CameraPreset) => {
      const r = rig.current;
      r.min = preset.minDistance;
      r.max = preset.maxDistance;
      r.home.copy(to.target);
      if (!r.initialised) {
        r.initialised = true;
        r.pose = to;
        r.tween = null;
        return;
      }
      const from: Pose = { ...r.pose, target: r.pose.target.clone() };
      const goal: Pose = { ...to, target: to.target.clone(), azimuth: shortestAngle(from.azimuth, to.azimuth) };
      const travel = from.target.distanceTo(goal.target) + Math.abs(goal.distance - from.distance) * 0.5 + Math.abs(goal.azimuth - from.azimuth) * 4;
      const duration = useUFlightStore.getState().reducedMotion ? 0 : transitionDurationMs(Math.min(travel, 40), preset) / 1000;
      r.tween = { from, to: goal, start: frame.now, duration };
    };

    const apply = () => {
      const s = useUFlightStore.getState();
      const focus = s.isolatedComponent ?? s.selectedComponent;
      if (focus) {
        const { pose, preset } = poseForComponent(focus, Boolean(s.isolatedComponent), s.explodedAmount, rig.current.pose);
        moveTo(pose, preset);
        return;
      }
      const preset: CameraPreset = CAMERA_PRESETS[s.cameraPreset];
      moveTo(poseFromPreset(preset), preset);
    };
    apply();

    let nonce = useUFlightStore.getState().cameraNonce;
    let sensor = useUFlightStore.getState().selectedSensor;
    let tracing = Boolean(useUFlightStore.getState().trace);
    return useUFlightStore.subscribe((s) => {
      const nowTracing = Boolean(s.trace);
      if (s.cameraNonce !== nonce) {
        nonce = s.cameraNonce;
        sensor = s.selectedSensor;
        tracing = nowTracing;
        apply();
      } else if (s.selectedSensor !== sensor || nowTracing !== tracing) {
        // Selecting a sensor brings it into view, and tracing it steps back to show the whole
        // route, without changing the mode's own camera.
        sensor = s.selectedSensor;
        tracing = nowTracing;
        const move = sensor ? (tracing ? poseForTrace(sensor, rig.current.pose) : poseForSensor(sensor, rig.current.pose)) : null;
        if (move) moveTo(move.pose, move.preset);
        else apply();
      }
    });
  }, [camera]);

  // Pointer input: left-drag rotates, right-drag (or shift-drag) pans a little, wheel and pinch zoom.
  useEffect(() => {
    const el = gl.domElement;
    const r = rig.current;
    const interrupt = () => {
      r.tween = null;
    };
    const down = (e: PointerEvent) => {
      if (!useUFlightStore.getState().started) return;
      r.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      el.setPointerCapture(e.pointerId);
      if (r.pointers.size === 2) {
        const [a, b] = [...r.pointers.values()];
        r.pinch = Math.hypot(a.x - b.x, a.y - b.y);
        r.drag = null;
      } else {
        r.drag = { id: e.pointerId, mode: e.button === 2 || e.shiftKey ? "pan" : "rotate", x: e.clientX, y: e.clientY };
      }
      interrupt();
    };
    const move = (e: PointerEvent) => {
      const tracked = r.pointers.get(e.pointerId);
      if (!tracked) return;
      tracked.x = e.clientX;
      tracked.y = e.clientY;
      if (r.pointers.size === 2) {
        const [a, b] = [...r.pointers.values()];
        const spread = Math.hypot(a.x - b.x, a.y - b.y);
        if (r.pinch > 0 && spread > 0) r.pose.distance = clamp(r.pose.distance * (r.pinch / spread), r.min, r.max);
        r.pinch = spread;
        return;
      }
      const drag = r.drag;
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      if (drag.mode === "rotate") {
        r.pose.azimuth -= dx * 0.0052;
        r.pose.polar = clamp(r.pose.polar - dy * 0.0052, POLAR_MIN, POLAR_MAX);
      } else {
        // Pan in the view plane, limited to a small region around the view's target.
        const scale = r.pose.distance * 0.0016;
        panRight.set(Math.cos(r.pose.azimuth), 0, -Math.sin(r.pose.azimuth));
        panUp.set(-Math.cos(r.pose.polar) * Math.sin(r.pose.azimuth), Math.sin(r.pose.polar), -Math.cos(r.pose.polar) * Math.cos(r.pose.azimuth));
        r.pose.target.addScaledVector(panRight, -dx * scale).addScaledVector(panUp, dy * scale);
        local.copy(r.pose.target).sub(r.home).clampLength(0, PAN_LIMIT);
        r.pose.target.copy(r.home).add(local);
      }
    };
    const end = (e: PointerEvent) => {
      r.pointers.delete(e.pointerId);
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (r.drag?.id === e.pointerId) r.drag = null;
      r.pinch = 0;
    };
    const wheel = (e: WheelEvent) => {
      if (!useUFlightStore.getState().started) return;
      e.preventDefault();
      interrupt();
      const step = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      r.pose.distance = clamp(r.pose.distance * Math.exp(clamp(step, -120, 120) * 0.0014), r.min, r.max);
    };
    const context = (e: Event) => e.preventDefault();

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("contextmenu", context);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("contextmenu", context);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const cam = state.camera as PerspectiveCamera;
    const r = rig.current;
    const s = useUFlightStore.getState();
    const dt = Math.min(delta, 0.1);

    // ── Transition ──
    if (r.tween) {
      const { from, to, start, duration } = r.tween;
      const p = duration <= 0 ? 1 : clamp((frame.now - start) / duration, 0, 1);
      const e = easeInOutCubic(p);
      r.pose.target.lerpVectors(from.target, to.target, e);
      r.pose.azimuth = from.azimuth + (to.azimuth - from.azimuth) * e;
      r.pose.polar = from.polar + (to.polar - from.polar) * e;
      // Interpolating distance geometrically keeps long pull-backs feeling even.
      r.pose.distance = from.distance * Math.pow(to.distance / from.distance, e);
      r.pose.offsetX = from.offsetX + (to.offsetX - from.offsetX) * e;
      r.pose.offsetY = from.offsetY + (to.offsetY - from.offsetY) * e;
      if (p >= 1) r.tween = null;
    } else if (!s.started && !s.reducedMotion) {
      // Opening: a very slow drift around the aircraft.
      r.pose.azimuth += dt * 0.014;
    }

    // ── Pose → world: the frame travels with the aircraft but stays level ──
    const { width, height } = state.size;
    sphericalOffset(r.pose, local).multiplyScalar(viewportFit(width, height)).add(r.pose.target);
    cam.position.copy(local).add(frame.position);
    cam.position.y = Math.max(cam.position.y, FLOOR_CLEARANCE);
    lookAt.copy(r.pose.target).add(frame.position);
    cam.up.set(0, 1, 0);
    cam.lookAt(lookAt);

    // ── Projection: composition offset and panel clearance ──
    r.shift += (sceneShift(s) - r.shift) * (1 - Math.exp(-5 * dt));
    const offsetX = r.pose.offsetX + r.shift;
    if (Math.abs(offsetX) > 0.0005 || Math.abs(r.pose.offsetY) > 0.0005) {
      cam.setViewOffset(width, height, -offsetX * width, r.pose.offsetY * height, width, height);
    } else if (cam.view?.enabled) {
      cam.clearViewOffset();
    }

    position.copy(cam.position).sub(lookAt);
    cam.near = clamp(position.length() * 0.02, 0.05, 2);
    cam.far = 9000;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
  }, -50);

  return null;
}
