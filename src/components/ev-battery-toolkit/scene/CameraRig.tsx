"use client";
// Moves the camera for the on-screen controls (rotate, zoom, reset, focus), so
// the scene never depends on a mouse. Moves ease over a few frames unless the
// visitor prefers reduced motion; then they are instant.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useToolkit, type CameraChannel } from "../state/store";

type Vec3 = [number, number, number];

interface OrbitLike {
  target: Vector3;
  update: () => void;
}

export interface CameraRigProps {
  channel: CameraChannel;
  home: { position: Vec3; target: Vec3 };
  focus?: { position: Vec3; target: Vec3 };
  minDistance: number;
  maxDistance: number;
  reducedMotion: boolean;
  /** Changing this re-frames the camera on `home` (e.g. pack ↔ scooter), without resetting on every other change. */
  homeKey?: string;
}

export default function CameraRig({ channel, home, focus, minDistance, maxDistance, reducedMotion, homeKey }: CameraRigProps) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitLike | null;
  const invalidate = useThree((s) => s.invalidate);
  const goal = useRef<{ position: Vector3; target: Vector3 } | null>(null);
  const command = useToolkit((s) => (s.camera?.channel === channel ? s.camera : null));
  const handled = useRef(0);
  const framed = useRef(homeKey);

  useEffect(() => {
    if (framed.current === homeKey || !controls) return;
    framed.current = homeKey;
    const position = new Vector3(...home.position);
    const target = new Vector3(...home.target);
    if (reducedMotion) {
      camera.position.copy(position);
      controls.target.copy(target);
      controls.update();
    } else {
      goal.current = { position, target };
    }
    invalidate();
  }, [homeKey, home, controls, camera, reducedMotion, invalidate]);

  useEffect(() => {
    if (!command || command.nonce === handled.current || !controls) return;
    handled.current = command.nonce;
    const target = controls.target.clone();
    const offset = camera.position.clone().sub(target);
    let nextPos: Vector3;
    let nextTarget = target;
    switch (command.command) {
      case "rotate-left":
      case "rotate-right":
        nextPos = target.clone().add(offset.applyAxisAngle(new Vector3(0, 1, 0), command.command === "rotate-left" ? -Math.PI / 6 : Math.PI / 6));
        break;
      case "zoom-in":
      case "zoom-out": {
        const length = Math.min(maxDistance, Math.max(minDistance, offset.length() * (command.command === "zoom-in" ? 0.78 : 1.28)));
        nextPos = target.clone().add(offset.setLength(length));
        break;
      }
      case "focus-battery":
        nextPos = new Vector3(...(focus ?? home).position);
        nextTarget = new Vector3(...(focus ?? home).target);
        break;
      default:
        nextPos = new Vector3(...home.position);
        nextTarget = new Vector3(...home.target);
    }
    if (reducedMotion) {
      camera.position.copy(nextPos);
      controls.target.copy(nextTarget);
      controls.update();
      invalidate();
      return;
    }
    goal.current = { position: nextPos, target: nextTarget };
    invalidate();
  }, [command, camera, controls, home, focus, minDistance, maxDistance, reducedMotion, invalidate]);

  useFrame((_, delta) => {
    const g = goal.current;
    if (!g || !controls) return;
    const k = Math.min(1, delta * 7);
    camera.position.lerp(g.position, k);
    controls.target.lerp(g.target, k);
    controls.update();
    if (camera.position.distanceTo(g.position) < 0.01 && controls.target.distanceTo(g.target) < 0.01) {
      camera.position.copy(g.position);
      controls.target.copy(g.target);
      goal.current = null;
    }
    invalidate();
  });

  return null;
}

/** Eases the explode amount towards its target, outside React. */
export function ExplodeDriver({ amountRef, target, reducedMotion }: { amountRef: { current: number }; target: number; reducedMotion: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (reducedMotion) amountRef.current = target;
    invalidate();
  }, [target, reducedMotion, amountRef, invalidate]);
  useFrame((_, delta) => {
    const d = target - amountRef.current;
    if (Math.abs(d) < 0.001) {
      amountRef.current = target;
      return;
    }
    amountRef.current += d * Math.min(1, delta * 6);
    invalidate();
  });
  return null;
}
