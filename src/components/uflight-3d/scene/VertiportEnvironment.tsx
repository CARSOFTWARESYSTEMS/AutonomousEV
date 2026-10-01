// VERTIPORT: a pad for preflight, charging, maintenance and post-flight. A
// quiet apron at dusk — a marked touchdown area, perimeter lights and a
// charging post. No terminal, no skyline. The same pad stands at both ends
// of the route.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group, type Material, type Mesh } from "three";
import type { Vec3 } from "../types";
import { EQUIPMENT, fuselagePoint } from "../aircraft/layout";
import { Cable } from "../aircraft/materials";
import { useUFlightStore } from "../state/uflightStore";
import { frame } from "./frameState";

const PAD_RADIUS = 12;
const LIGHTS = 20;
/** Centre of the pad relative to the aircraft's origin, so the aircraft sits in the middle of it. */
const PAD_OFFSET_X = -0.9;

function Pad({ charging }: { charging: boolean }) {
  const port = EQUIPMENT["charging-interface"];
  const socket = fuselagePoint(port[0], (-100 * Math.PI) / 180);
  const lead = useMemo((): Vec3[] => [[port[0] - 0.25, 1.05, -3.4], [port[0] - 0.2, 0.5, -2.4], [port[0] - 0.05, 0.62, -1.5], [socket[0], socket[1], socket[2] - 0.06]], [port, socket]);
  return (
    <group>
      <group position={[PAD_OFFSET_X, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
          <circleGeometry args={[PAD_RADIUS, 72]} />
          <meshStandardMaterial color="#23262b" roughness={0.9} metalness={0.02} transparent />
        </mesh>
        {/* Touchdown markings: an outer ring, an inner aiming circle and a heading bar. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[PAD_RADIUS - 1.1, PAD_RADIUS - 0.8, 96]} />
          <meshStandardMaterial color="#c9ccd1" roughness={0.8} transparent />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[3.3, 3.52, 72]} />
          <meshStandardMaterial color="#c9ccd1" roughness={0.8} transparent />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.4, 0.02, 0]}>
          <planeGeometry args={[2.6, 0.24]} />
          <meshStandardMaterial color="#c9ccd1" roughness={0.8} transparent />
        </mesh>
        {Array.from({ length: LIGHTS }, (_, i) => {
          const angle = (i / LIGHTS) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * (PAD_RADIUS - 0.3), 0.07, Math.sin(angle) * (PAD_RADIUS - 0.3)]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshBasicMaterial color="#b9ffd9" transparent toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      {/* Charging post on the port side, by the charging interface. */}
      <group position={[port[0] - 0.25, 0, -3.4]}>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 1.2, 0.3]} />
          <meshStandardMaterial color="#30343a" roughness={0.6} metalness={0.5} transparent />
        </mesh>
        <mesh position={[0, 0.98, 0.152]}>
          <planeGeometry args={[0.26, 0.12]} />
          <meshBasicMaterial color="#8fd8e6" transparent toneMapped={false} />
        </mesh>
      </group>
      {charging && <Cable points={lead} radius={0.03} mat="rubber" cornerRadius={0.3} />}
    </group>
  );
}

export default function VertiportEnvironment() {
  const root = useRef<Group>(null);
  const destination = useRef<Group>(null);
  const charging = useUFlightStore((s) => s.mode === "mission" && (s.missionStage === "IDLE" || s.missionStage === "PREFLIGHT"));

  useFrame(() => {
    const group = root.current;
    if (!group) return;
    const w = Math.max(frame.environment.vertiport, frame.environment.flight);
    group.visible = w > 0.01;
    if (!group.visible) return;
    if (destination.current) destination.current.position.x = Math.max(frame.routeLength, 60);
    group.traverse((object) => {
      const material = (object as Mesh).material as Material | undefined;
      if (material && !Array.isArray(material)) material.opacity = w;
    });
  });

  return (
    <group ref={root} name="VertiportEnvironment" visible={false}>
      <Pad charging={charging} />
      <group ref={destination}>
        <Pad charging={false} />
      </group>
    </group>
  );
}
