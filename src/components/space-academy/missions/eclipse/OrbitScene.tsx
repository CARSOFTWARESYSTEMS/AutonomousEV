"use client";
// Earth, the Sun's direction, Earth's shadow and the CubeSat on its orbit.
// Scale: 1 unit = 637.1 km, so Earth's radius is 10 units. Low-poly spheres,
// flat colours, no textures.
import { useRef } from "react";
import { DoubleSide, type Group } from "three";
import Stage3D from "../../viewer/Stage3D";
import type { SceneState } from "../../viewer/controller";
import { useLabelAnchor } from "../../viewer/labels";
import { EARTH_RADIUS_KM } from "./model";
import { orbitAngle } from "./geometry";

export interface OrbitSceneProps {
  altitudeKm: number;
  /** Position in the current orbit, 0–1. */
  phase: number;
  sunlit: boolean;
  safe: boolean;
}

const K = 10 / EARTH_RADIUS_KM;

function Anchor({ id, at }: { id: string; at: [number, number, number] }) {
  const ref = useRef<Group>(null);
  useLabelAnchor(id, ref, [0, 0, 0]);
  return <group ref={ref} position={at} />;
}

export default function OrbitScene(props: OrbitSceneProps & SceneState) {
  const r = (EARTH_RADIUS_KM + props.altitudeKm) * K;
  const a = orbitAngle(props.phase, props.altitudeKm);
  const sat: [number, number, number] = [r * Math.cos(a), 0, r * Math.sin(a)];
  const labels = props.labels
    ? [
        { id: "sat", text: props.safe ? "CubeSat · safe mode" : props.sunlit ? "CubeSat · sunlight" : "CubeSat · in shadow", active: true },
        ...(props.compact ? [] : [{ id: "sun", text: "To the Sun" }, { id: "shadow", text: "Earth's shadow" }, { id: "earth", text: "Earth" }]),
      ]
    : [];
  return (
    <Stage3D
      controller={props.controller}
      reducedMotion={props.reducedMotion}
      compact={props.compact}
      onContextLost={props.onContextLost}
      cameraPosition={[4, 36, 44]}
      minDistance={18}
      maxDistance={90}
      labels={labels}
    >
      <mesh>
        <sphereGeometry args={[10, 48, 32]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.8} metalness={0} emissive="#0b1d4a" emissiveIntensity={0.3} />
      </mesh>
      {/* Night side tint: a slightly larger dark hemisphere facing away from the Sun. */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[10.05, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.55} side={DoubleSide} depthWrite={false} />
      </mesh>
      {/* Shadow cylinder behind Earth. */}
      <mesh position={[-14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[10, 10, 28, 40, 1, true]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} side={DoubleSide} depthWrite={false} />
      </mesh>
      {/* Orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.06, 6, 128]} />
        <meshBasicMaterial color="#a78bfa" />
      </mesh>
      {/* Sun direction */}
      <mesh position={[30, 0, 0]}>
        <sphereGeometry args={[1.6, 20, 16]} />
        <meshBasicMaterial color="#fcd34d" />
      </mesh>
      <mesh position={[22, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.7, 2, 16]} />
        <meshBasicMaterial color="#fcd34d" />
      </mesh>
      {/* The CubeSat */}
      <group position={sat}>
        <mesh>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshStandardMaterial color={props.sunlit ? "#e5e7eb" : "#64748b"} emissive={props.safe ? "#f59e0b" : props.sunlit ? "#3b82f6" : "#000000"} emissiveIntensity={props.safe ? 0.8 : 0.25} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, a, 0]}>
          <boxGeometry args={[3.2, 0.05, 1]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
      <Anchor id="sat" at={[sat[0], 1.8, sat[2]]} />
      <Anchor id="sun" at={[30, 2.6, 0]} />
      <Anchor id="shadow" at={[-24, 0, 0]} />
      <Anchor id="earth" at={[0, 11.5, 0]} />
    </Stage3D>
  );
}
