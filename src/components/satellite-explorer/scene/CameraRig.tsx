// Camera choreography. The camera is always "a spherical pose around a target
// in a reference frame"; presets and component focus change that pose through
// eased, interruptible moves, and the pointer adjusts it within limits. This
// replaces free OrbitControls so every view stays composed and Earth stays
// "down" where that helps the learner.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Matrix4, type PerspectiveCamera, Quaternion, Vector3 } from "three";
import type { ComponentId } from "../types";
import { DEG, clamp, easeInOutCubic } from "../lib/math";
import { useExplorerStore } from "../state/explorerStore";
import { LAYOUT, anchorAt } from "../spacecraft/layout";
import { CAMERA_PRESETS, type CameraFrame, type CameraPreset, transitionDurationMs } from "./cameraPresets";
import { SCALE_DISTANCE, frame } from "./frameState";

interface Pose {
  target: Vector3;
  /** Radians. */
  azimuth: number;
  polar: number;
  distance: number;
  offsetX: number;
  offsetY: number;
}

const POLAR_MIN = 4 * DEG;
const POLAR_MAX = 176 * DEG;
/** How far right-drag may move the look-at point from where the view put it, in scene units. */
const PAN_LIMIT = 3.5;
/** Shift the scene left while the side panel is open so it never covers the spacecraft. */
const PANEL_SHIFT = -0.105;

const ONE = new Vector3(1, 1, 1);
const WORLD_UP = new Vector3(0, 1, 0);
const IDENTITY = new Quaternion();
const ORIGIN = new Vector3();
const matrix = new Matrix4();
const inverse = new Matrix4();
const position = new Vector3();
const lookAt = new Vector3();
const upVector = new Vector3();
const local = new Vector3();
const panRight = new Vector3();
const panUp = new Vector3();
const startWorld = new Vector3();
const endWorld = new Vector3();
const swing = new Quaternion();
const swingStep = new Quaternion();

/** A look-at point travelling further than this (scene units) is a move between orbit scale and spacecraft scale. */
const GEOCENTRIC_TRAVEL = 200;

/** World transform of a camera reference frame for this frame's simulation state. */
function frameMatrix(kind: CameraFrame, out: Matrix4): Matrix4 {
  switch (kind) {
    case "body":
      return out.compose(frame.satPos, frame.attitude, ONE);
    case "nadir":
      return out.compose(frame.satPos, frame.nadirQuat, ONE);
    case "lvlh":
      return out.compose(frame.satPos, frame.lvlhQuat, ONE);
    case "station":
      return out.compose(frame.stationPos, frame.stationQuat, ONE);
    case "earth":
      return out.compose(ORIGIN, IDENTITY, ONE);
  }
}

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

/** Pose that frames one component: closer for small parts, from the side it faces. */
function poseForComponent(id: ComponentId, isolated: boolean, exploded: number, current: Pose): { pose: Pose; preset: CameraPreset } {
  const placement = LAYOUT[id];
  const anchor = anchorAt(id, exploded);
  const distance = clamp(placement.radius * (isolated ? 3.4 : 4.6) + 1.6, 3.4, 13);
  const view = placement.view;
  const preset: CameraPreset = {
    frame: "body",
    target: anchor,
    azimuthDeg: view ? view[0] : current.azimuth / DEG,
    polarDeg: view ? view[1] : clamp(current.polar / DEG, 50, 80),
    distance,
    minDistance: Math.max(1.6, placement.radius * 1.8),
    maxDistance: 60,
  };
  return { pose: poseFromPreset(preset), preset };
}

export default function CameraRig() {
  const gl = useThree((state) => state.gl);
  const rig = useRef({
    frame: "body" as CameraFrame,
    pose: poseFromPreset(CAMERA_PRESETS.hero),
    /** Where the current view placed the target; panning is limited around it. */
    home: new Vector3(),
    min: CAMERA_PRESETS.hero.minDistance as number,
    max: CAMERA_PRESETS.hero.maxDistance as number,
    tween: null as null | { from: Pose; to: Pose; fromUp: Vector3; start: number; duration: number; geocentric: boolean },
    initialised: false,
    panelShift: 0,
    up: new Vector3(0, 1, 0),
    drag: null as null | { id: number; mode: "rotate" | "pan"; x: number; y: number },
    pointers: new Map<number, { x: number; y: number }>(),
    pinch: 0,
  });

  /** Begin a move to `to` in `toFrame`, starting from wherever the camera is now. */
  const moveTo = (toFrame: CameraFrame, to: Pose, preset: CameraPreset, camera: PerspectiveCamera) => {
    const r = rig.current;
    const reduced = useExplorerStore.getState().reducedMotion;
    r.min = preset.minDistance;
    r.max = preset.maxDistance;
    r.home.copy(to.target);

    if (!r.initialised) {
      r.initialised = true;
      r.frame = toFrame;
      r.pose = to;
      r.tween = null;
      return;
    }

    // Express the current camera pose in the destination frame, then interpolate there.
    const current = r.pose;
    frameMatrix(r.frame, matrix);
    const worldTarget = lookAt.copy(current.target).applyMatrix4(matrix);
    const worldPosition = position.copy(camera.position);
    inverse.copy(frameMatrix(toFrame, matrix)).invert();
    const from: Pose = {
      target: worldTarget.clone().applyMatrix4(inverse),
      azimuth: 0,
      polar: 0,
      distance: 1,
      offsetX: current.offsetX,
      offsetY: current.offsetY,
    };
    local.copy(worldPosition).applyMatrix4(inverse).sub(from.target);
    from.distance = Math.max(local.length(), 0.001);
    from.polar = Math.acos(clamp(local.y / from.distance, -1, 1));
    from.azimuth = Math.atan2(local.x, local.z);

    const goal: Pose = { ...to, target: to.target.clone(), azimuth: shortestAngle(from.azimuth, to.azimuth) };
    const travel = from.target.distanceTo(goal.target) + Math.abs(goal.distance - from.distance) * 0.5 + Math.abs(goal.azimuth - from.azimuth) * 4;
    const duration = reduced ? 0 : transitionDurationMs(Math.min(travel, 40), preset) / 1000;

    r.frame = toFrame;
    r.pose = { ...from, target: from.target.clone() };
    r.tween = { from, to: goal, fromUp: r.up.clone(), start: frame.now, duration, geocentric: from.target.distanceTo(goal.target) > GEOCENTRIC_TRAVEL };
  };

  // Presets and component focus both arrive as store changes.
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  useEffect(() => {
    const apply = () => {
      const s = useExplorerStore.getState();
      const focus = s.isolatedComponent ?? s.selectedComponent;
      if (focus) {
        const { pose, preset } = poseForComponent(focus, Boolean(s.isolatedComponent), s.explodedAmount, rig.current.pose);
        moveTo("body", pose, preset, camera);
      } else {
        const preset: CameraPreset = CAMERA_PRESETS[s.cameraPreset];
        moveTo(preset.frame, poseFromPreset(preset), preset, camera);
      }
    };
    apply();
    let nonce = useExplorerStore.getState().cameraNonce;
    return useExplorerStore.subscribe((s) => {
      if (s.cameraNonce === nonce) return;
      nonce = s.cameraNonce;
      apply();
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
      if (!useExplorerStore.getState().started) return;
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
        const scale = (r.pose.distance * 0.0016) / Math.max(1, frame.satScale);
        panRight.set(Math.cos(r.pose.azimuth), 0, -Math.sin(r.pose.azimuth));
        panUp.set(-Math.cos(r.pose.polar) * Math.sin(r.pose.azimuth), Math.sin(r.pose.polar), -Math.cos(r.pose.polar) * Math.cos(r.pose.azimuth));
        r.pose.target.addScaledVector(panRight, -dx * scale).addScaledVector(panUp, dy * scale);
        const limit = r.frame === "earth" ? 0 : PAN_LIMIT;
        local.copy(r.pose.target).sub(r.home).clampLength(0, limit);
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
      if (!useExplorerStore.getState().started) return;
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
    const s = useExplorerStore.getState();
    const dt = Math.min(delta, 0.1);

    // ── Transition ──
    let upBlend = 1;
    if (r.tween) {
      const { from, to, start, duration } = r.tween;
      const p = duration <= 0 ? 1 : clamp((frame.now - start) / duration, 0, 1);
      const e = easeInOutCubic(p);
      r.pose.target.lerpVectors(from.target, to.target, e);
      if (r.tween.geocentric && p < 1) {
        // Between the spacecraft and the whole-orbit view the look-at point crosses Earth, and a
        // pose-by-pose blend would take the camera through the planet. Swing the camera around
        // Earth's centre instead, changing only its height, so it always stays outside.
        frameMatrix(r.frame, matrix);
        sphericalOffset(from, startWorld).add(from.target).applyMatrix4(matrix);
        sphericalOffset(to, endWorld).add(to.target).applyMatrix4(matrix);
        const r0 = startWorld.length();
        const r1 = endWorld.length();
        startWorld.divideScalar(r0);
        endWorld.divideScalar(r1);
        swing.setFromUnitVectors(startWorld, endWorld);
        position.copy(startWorld).applyQuaternion(swingStep.identity().slerp(swing, e)).multiplyScalar(r0 * Math.pow(r1 / r0, e));
        // Back to a pose in the rig's frame, so an interrupted move leaves a consistent state.
        local.copy(position).applyMatrix4(inverse.copy(matrix).invert()).sub(r.pose.target);
        r.pose.distance = Math.max(local.length(), 0.001);
        r.pose.polar = Math.acos(clamp(local.y / r.pose.distance, -1, 1));
        r.pose.azimuth = Math.atan2(local.x, local.z);
      } else {
        r.pose.azimuth = from.azimuth + (to.azimuth - from.azimuth) * e;
        r.pose.polar = from.polar + (to.polar - from.polar) * e;
        // Interpolating distance geometrically keeps long pull-backs feeling even.
        r.pose.distance = from.distance * Math.pow(to.distance / from.distance, e);
      }
      r.pose.offsetX = from.offsetX + (to.offsetX - from.offsetX) * e;
      r.pose.offsetY = from.offsetY + (to.offsetY - from.offsetY) * e;
      upBlend = e;
      if (p >= 1) r.tween = null;
    } else if (!s.started && !s.reducedMotion) {
      // Hero: a very slow drift around the spacecraft.
      r.pose.azimuth += dt * 0.012;
    }

    // ── Pose → world ──
    frameMatrix(r.frame, matrix);
    sphericalOffset(r.pose, local).add(r.pose.target);
    cam.position.copy(local).applyMatrix4(matrix);
    lookAt.copy(r.pose.target).applyMatrix4(matrix);
    upVector.copy(WORLD_UP).transformDirection(matrix);
    if (r.tween && upBlend < 1) upVector.lerpVectors(r.tween.fromUp, upVector, upBlend).normalize();
    r.up.copy(upVector);
    cam.up.copy(upVector);
    cam.lookAt(lookAt);

    // ── Projection: composition offset, panel clearance and clip planes ──
    const panelOpen = s.started && (Boolean(s.selectedComponent) || s.mode === "systems" || s.mode === "signals" || (s.mode === "mission" && s.missionStage !== "IDLE"));
    r.panelShift += ((panelOpen ? PANEL_SHIFT : 0) - r.panelShift) * (1 - Math.exp(-5 * dt));
    const { width, height } = state.size;
    const offsetX = r.pose.offsetX + r.panelShift;
    if (Math.abs(offsetX) > 0.0005 || Math.abs(r.pose.offsetY) > 0.0005) {
      cam.setViewOffset(width, height, -offsetX * width, r.pose.offsetY * height, width, height);
    } else if (cam.view?.enabled) {
      cam.clearViewOffset();
    }

    const toSat = cam.position.distanceTo(frame.satPos);
    const toStation = cam.position.distanceTo(frame.stationPos);
    cam.near = clamp(Math.min(toSat, toStation) * 0.03, 0.05, 60);
    cam.far = 90000;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();

    // Far away, the spacecraft is drawn enlarged so it stays visible against Earth.
    frame.satScale = Math.max(1, toSat / SCALE_DISTANCE);
  }, -50);

  return null;
}
