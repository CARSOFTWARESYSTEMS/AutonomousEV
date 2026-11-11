"use client";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import type { Spin } from "./spin";

/** Eases a group's yaw toward the learner's turn, plus a slow drift while playing. */
export default function Turntable({ spin, playing, reducedMotion, rate = 0.12, children }: { spin: Spin; playing: boolean; reducedMotion: boolean; rate?: number; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  const drift = useRef(0);
  const epoch = useRef(spin.epoch);
  const { invalidate } = useThree();
  useEffect(() => spin.setFrameRequester(invalidate), [spin, invalidate]);
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    if (epoch.current !== spin.epoch) {
      epoch.current = spin.epoch;
      drift.current = 0;
    }
    if (playing) drift.current += rate * dt;
    const goal = drift.current + spin.target;
    const diff = goal - g.rotation.y;
    if (Math.abs(diff) < 0.0005) {
      g.rotation.y = goal;
      return;
    }
    g.rotation.y = reducedMotion ? goal : g.rotation.y + diff * (1 - Math.exp(-8 * dt));
    if (!playing) invalidate();
  });
  return <group ref={ref}>{children}</group>;
}

