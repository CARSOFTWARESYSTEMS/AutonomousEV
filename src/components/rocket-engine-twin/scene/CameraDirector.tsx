// Camera choreography. The camera is always a spherical pose around a target.
// Presets change that pose through eased moves; the pointer adjusts it within
// limits and takes over the moment it is used, so a move can always be
// interrupted. There are no free orbit controls: every view stays composed.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { type PerspectiveCamera, Vector3 } from "three";
import { sceneShift } from "../state/selectors";
import { useRocketTwinStore } from "../state/twinStore";
import { CAMERA_PRESETS, type CameraPreset, ENTER_MS, transitionMs } from "./cameraPresets";
import { damp } from "./frameState";

const DEG = Math.PI / 180;
const POLAR_MIN = 12 * DEG;
const POLAR_MAX = 158 * DEG;

interface Pose {
  target: Vector3;
  azimuth: number;
  polar: number;
  distance: number;
}

const poseOf = (preset: CameraPreset): Pose => ({ target: new Vector3(...preset.target), azimuth: preset.azimuthDeg * DEG, polar: preset.polarDeg * DEG, distance: preset.distance });
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** The short way round from one azimuth to another. */
const nearest = (from: number, to: number) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return from + d;
};

const position = new Vector3();

export default function CameraDirector() {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);
  const rig = useRef({
    pose: poseOf(CAMERA_PRESETS.hero),
    preset: CAMERA_PRESETS.hero,
    tween: null as null | { from: Pose; to: Pose; start: number; duration: number },
    shift: 0.17,
    drag: null as null | { id: number; x: number; y: number },
    nonce: -1,
  });

  // A change of preset in the store starts a move from wherever the camera is now.
  useEffect(() => {
    const go = (state: ReturnType<typeof useRocketTwinStore.getState>) => {
      const r = rig.current;
      if (state.cameraNonce === r.nonce) return;
      const first = r.nonce === -1;
      r.nonce = state.cameraNonce;
      const preset = CAMERA_PRESETS[state.cameraPreset];
      const to = poseOf(preset);
      to.azimuth = nearest(r.pose.azimuth, to.azimuth);
      const entering = r.preset === CAMERA_PRESETS.hero && preset !== CAMERA_PRESETS.hero;
      const duration = first || state.reducedMotion ? 0 : entering ? ENTER_MS : transitionMs(r.preset, preset);
      r.preset = preset;
      if (duration === 0) {
        r.pose = to;
        r.tween = null;
        return;
      }
      r.tween = { from: { ...r.pose, target: r.pose.target.clone() }, to, start: performance.now(), duration };
    };
    go(useRocketTwinStore.getState());
    return useRocketTwinStore.subscribe(go);
  }, []);

  // Pointer: drag to turn, wheel to move in and out. Either one ends a move in progress.
  useEffect(() => {
    const element = gl.domElement;
    const r = rig.current;
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      r.drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
      element.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!r.drag || r.drag.id !== event.pointerId) return;
      const dx = event.clientX - r.drag.x;
      const dy = event.clientY - r.drag.y;
      if (Math.abs(dx) + Math.abs(dy) < 2 && r.tween) return;
      r.drag.x = event.clientX;
      r.drag.y = event.clientY;
      r.tween = null;
      r.pose.azimuth -= dx * 0.0052;
      r.pose.polar = Math.min(POLAR_MAX, Math.max(POLAR_MIN, r.pose.polar - dy * 0.0052));
    };
    const up = (event: PointerEvent) => {
      if (r.drag?.id === event.pointerId) r.drag = null;
    };
    const wheel = (event: WheelEvent) => {
      // Before the twin is entered the wheel scrolls the page, as it would anywhere else.
      if (!useRocketTwinStore.getState().entered) return;
      event.preventDefault();
      r.tween = null;
      r.pose.distance = Math.min(r.preset.maxDistance, Math.max(r.preset.minDistance, r.pose.distance * Math.exp(event.deltaY * 0.0011)));
    };
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      element.removeEventListener("wheel", wheel);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const r = rig.current;
    const state = useRocketTwinStore.getState();
    const dt = Math.min(delta, 0.1);

    if (r.tween) {
      const t = Math.min(1, (performance.now() - r.tween.start) / r.tween.duration);
      const k = ease(t);
      const { from, to } = r.tween;
      r.pose.target.lerpVectors(from.target, to.target, k);
      r.pose.azimuth = from.azimuth + (to.azimuth - from.azimuth) * k;
      r.pose.polar = from.polar + (to.polar - from.polar) * k;
      r.pose.distance = from.distance + (to.distance - from.distance) * k;
      if (t >= 1) r.tween = null;
    } else if (!state.entered && !r.drag && !state.reducedMotion) {
      // The opening: the engine turns almost imperceptibly.
      r.pose.azimuth += dt * 0.035;
    }

    const sin = Math.sin(r.pose.polar);
    position.set(sin * Math.sin(r.pose.azimuth), Math.cos(r.pose.polar), sin * Math.cos(r.pose.azimuth)).multiplyScalar(r.pose.distance).add(r.pose.target);
    camera.position.copy(position);
    camera.lookAt(r.pose.target);

    // The engine sits to one side when there is something beside it.
    r.shift = state.reducedMotion ? sceneShift(state) : damp(r.shift, sceneShift(state), 3.2, dt);
    camera.setViewOffset(size.width, size.height, -r.shift * size.width, 0, size.width, size.height);
  });

  return null;
}
