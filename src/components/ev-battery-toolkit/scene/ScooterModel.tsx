"use client";
// A generic procedural electric scooter. It is deliberately not any
// manufacturer's vehicle and the interface labels it so. It exists to show
// where battery architectures sit, not what a particular model looks like.
import { RoundedBox, Edges } from "@react-three/drei";
import { Mesh } from "three";
import type { BatteryLocation } from "@/lib/ev-battery-toolkit/types";
import { COLOR } from "./palette";

type Vec3 = [number, number, number];

/** Where each battery location sits in the scooter (1 unit ≈ 100 mm, ground at y = 0, front towards +X). */
export const BATTERY_MOUNT: Record<BatteryLocation, Vec3> = {
  floor: [0.4, 1.95, 0],
  "under-seat": [-3.7, 4.65, 0],
  "under-floor-boot": [0.2, 1.9, 0],
};

const noRaycast = () => null;

function Shell({ xray }: { xray: boolean }) {
  return <meshStandardMaterial key={xray ? "xray" : "solid"} color={COLOR.scooter} metalness={0.18} roughness={0.5} transparent={xray} opacity={xray ? 0.16 : 1} depthWrite={!xray} />;
}

function Wheel({ x }: { x: number }) {
  return (
    <group position={[x, 2.2, 0]}>
      {/* A torus already lies in the XY plane, which is the wheel's plane; only the hub cylinder needs turning onto Z. */}
      <mesh raycast={noRaycast}>
        <torusGeometry args={[1.75, 0.5, 14, 40]} />
        <meshStandardMaterial color={COLOR.tyre} roughness={0.9} />
      </mesh>
      <mesh raycast={noRaycast} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.5, 28]} />
        <meshStandardMaterial color="#4a5675" metalness={0.3} roughness={0.45} />
      </mesh>
    </group>
  );
}

export default function ScooterModel({ xray, edges }: { xray: boolean; edges: boolean }) {
  const lines = edges || xray ? <Edges color={xray ? "#8ea8e0" : "#4b5b85"} /> : null;
  return (
    <group>
      <Wheel x={6.3} />
      <Wheel x={-6.1} />
      {/* Floorboard */}
      <RoundedBox args={[5.6, 0.32, 3.4]} radius={0.12} position={[0.4, 2.75, 0]} raycast={noRaycast}>
        <Shell xray={xray} />
        {lines}
      </RoundedBox>
      {/* Rear body and seat bay */}
      <RoundedBox args={[5.2, 3.3, 3.0]} radius={0.5} position={[-4.1, 4.55, 0]} raycast={noRaycast}>
        <Shell xray={xray} />
        {lines}
      </RoundedBox>
      {/* Seat */}
      <RoundedBox args={[4.4, 0.6, 2.4]} radius={0.25} position={[-3.6, 6.5, 0]} raycast={noRaycast}>
        <meshStandardMaterial key={xray ? "xray" : "solid"} color={COLOR.scooterTrim} roughness={0.8} transparent={xray} opacity={xray ? 0.1 : 1} depthWrite={!xray} />
      </RoundedBox>
      {/* Leg shield and front apron */}
      <RoundedBox args={[0.7, 4.8, 3.2]} radius={0.3} position={[3.4, 5.1, 0]} rotation={[0, 0, -0.18]} raycast={noRaycast}>
        <Shell xray={xray} />
        {lines}
      </RoundedBox>
      {/* Steering column and fork */}
      <mesh position={[5.0, 5.6, 0]} rotation={[0, 0, -0.33]} raycast={noRaycast}>
        <cylinderGeometry args={[0.2, 0.2, 7.4, 14]} />
        <meshStandardMaterial key={xray ? "xray" : "solid"} color="#3a4563" metalness={0.3} roughness={0.5} transparent={xray} opacity={xray ? 0.2 : 1} />
      </mesh>
      {/* Handlebar and headlamp */}
      <mesh position={[3.95, 9.15, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
        <cylinderGeometry args={[0.13, 0.13, 6.2, 12]} />
        <meshStandardMaterial key={xray ? "xray" : "solid"} color="#1b2236" metalness={0.5} roughness={0.5} transparent={xray} opacity={xray ? 0.2 : 1} />
      </mesh>
      <mesh position={[4.35, 8.4, 0]} raycast={noRaycast}>
        <boxGeometry args={[0.5, 0.7, 1.4]} />
        <meshStandardMaterial key={xray ? "xray" : "solid"} color="#c7d2fe" emissive="#93c5fd" emissiveIntensity={0.3} transparent={xray} opacity={xray ? 0.2 : 1} />
      </mesh>
      {/* Rear mudguard */}
      <mesh position={[-6.1, 3.5, 0]} rotation={[0, 0, 0.2]} raycast={noRaycast}>
        <boxGeometry args={[2.4, 0.18, 1.2]} />
        <meshStandardMaterial key={xray ? "xray" : "solid"} color={COLOR.scooterTrim} transparent={xray} opacity={xray ? 0.12 : 1} />
      </mesh>
    </group>
  );
}

/** A simple battery block for the locator, glowing once located. */
export function LocatorBattery({ size, position, located }: { size: Vec3; position: Vec3; located: boolean }) {
  return (
    <mesh position={position} raycast={Mesh.prototype.raycast} userData={{ componentId: "enclosure" }}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={located ? "#2563eb" : COLOR.enclosure} emissive={located ? "#3b82f6" : "#000000"} emissiveIntensity={located ? 0.6 : 0} metalness={0.4} roughness={0.5} />
      <Edges color={located ? "#bfdbfe" : "#51608a"} />
    </mesh>
  );
}
