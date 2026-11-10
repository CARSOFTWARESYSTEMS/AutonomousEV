"use client";
// The 1U CubeSat in 3D. Procedural, low-poly geometry (1 unit = 1 cm); no
// textures to download. Loaded lazily with the rest of the 3D chunk.
import { createContext, useContext, useRef, useState } from "react";
import type { Group } from "three";
import Stage3D, { useEasedPosition } from "../../viewer/Stage3D";
import type { SceneState } from "../../viewer/controller";
import { PARTS, type PartId, type SolarId } from "./model";
import { LAYOUT } from "./layout";
import { useLabelAnchor } from "../../viewer/labels";

export interface CubeSatSceneProps {
  installed: PartId[];
  ghost: PartId | null;
  selected: PartId | null;
  onSelect?: (id: PartId) => void;
  solar: SolarId;
}

type V3 = [number, number, number];

const PartCtx = createContext<{ highlight: boolean; ghost: boolean }>({ highlight: false, ghost: false });

function Mat({ color, metalness = 0.3, roughness = 0.55, emissive }: { color: string; metalness?: number; roughness?: number; emissive?: string }) {
  const { highlight, ghost } = useContext(PartCtx);
  if (ghost) return <meshStandardMaterial color="#93c5fd" transparent opacity={0.22} depthWrite={false} emissive="#3b82f6" emissiveIntensity={0.6} />;
  return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} emissive={highlight ? "#f59e0b" : emissive ?? "#000000"} emissiveIntensity={highlight ? 0.45 : emissive ? 0.25 : 0} />;
}

function Box({ size, at = [0, 0, 0], color, metalness, roughness, emissive }: { size: V3; at?: V3; color: string; metalness?: number; roughness?: number; emissive?: string }) {
  return (
    <mesh position={at}>
      <boxGeometry args={size} />
      <Mat color={color} metalness={metalness} roughness={roughness} emissive={emissive} />
    </mesh>
  );
}

function Cylinder({ r, h, at = [0, 0, 0], rot = [0, 0, 0], color, metalness, roughness }: { r: number; h: number; at?: V3; rot?: V3; color: string; metalness?: number; roughness?: number }) {
  return (
    <mesh position={at} rotation={rot}>
      <cylinderGeometry args={[r, r, h, 20]} />
      <Mat color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );
}

function Board({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <Box size={[8.6, 0.16, 8.6]} color="#17603f" metalness={0.15} roughness={0.7} />
      {[-3.9, 3.9].flatMap((x) => [-3.9, 3.9].map((z) => <Cylinder key={`${x}${z}`} r={0.18} h={1.1} at={[x, 0, z]} color="#d4c58a" metalness={0.8} roughness={0.35} />))}
      {children}
    </>
  );
}

function SolarPanel({ at, rot, cells = true }: { at: V3; rot: V3; cells?: boolean }) {
  return (
    <group position={at} rotation={rot}>
      <Box size={[9, 9, 0.2]} color="#1f2533" metalness={0.4} roughness={0.5} />
      {cells && [-2.2, 2.2].map((x) => <Box key={x} size={[4.1, 8.4, 0.06]} at={[x, 0, 0.13]} color="#1e3a8a" metalness={0.6} roughness={0.28} emissive="#1d4ed8" />)}
    </group>
  );
}

function PartGeometry({ id, solar, exploded }: { id: PartId; solar: SolarId; exploded: boolean }) {
  switch (id) {
    case "frame":
      return (
        <>
          {[-4.6, 4.6].flatMap((x) => [-4.6, 4.6].map((z) => <Box key={`${x}${z}`} size={[0.8, 10, 0.8]} at={[x, 0, z]} color="#b6bcc6" metalness={0.85} roughness={0.35} />))}
          {[-4.75, 4.75].flatMap((y) => [
            <Box key={`x${y}a`} size={[10, 0.5, 0.6]} at={[0, y, 4.7]} color="#b6bcc6" metalness={0.85} roughness={0.35} />,
            <Box key={`x${y}b`} size={[10, 0.5, 0.6]} at={[0, y, -4.7]} color="#b6bcc6" metalness={0.85} roughness={0.35} />,
            <Box key={`z${y}a`} size={[0.6, 0.5, 10]} at={[4.7, y, 0]} color="#b6bcc6" metalness={0.85} roughness={0.35} />,
            <Box key={`z${y}b`} size={[0.6, 0.5, 10]} at={[-4.7, y, 0]} color="#b6bcc6" metalness={0.85} roughness={0.35} />,
          ])}
        </>
      );
    case "payload":
      return (
        <Board>
          <Box size={[3.6, 1.6, 3.6]} at={[0, -0.9, 0]} color="#16181d" metalness={0.5} roughness={0.45} />
          <Cylinder r={1.1} h={1.0} at={[0, -2.15, 0]} color="#0f172a" metalness={0.7} roughness={0.2} />
          <Cylinder r={0.75} h={0.1} at={[0, -2.68, 0]} color="#2563eb" metalness={0.9} roughness={0.1} />
        </Board>
      );
    case "battery":
      return (
        <Board>
          {[-2.7, -0.9, 0.9, 2.7].map((z) => (
            <Cylinder key={z} r={0.85} h={7} at={[0, 0.95, z]} rot={[0, 0, Math.PI / 2]} color="#3b4252" metalness={0.6} roughness={0.4} />
          ))}
        </Board>
      );
    case "eps":
      return (
        <Board>
          <Box size={[1.6, 0.5, 1.6]} at={[-2, 0.33, 1.5]} color="#1b1d22" />
          <Box size={[1.2, 0.35, 1.2]} at={[1.8, 0.25, -1.6]} color="#1b1d22" />
          <Cylinder r={0.55} h={0.6} at={[2.2, 0.38, 2]} color="#7c6f57" />
        </Board>
      );
    case "obc":
      return (
        <Board>
          <Box size={[2.2, 0.3, 2.2]} at={[0, 0.23, 0]} color="#101114" metalness={0.4} />
          <Box size={[1, 0.25, 2.6]} at={[2.6, 0.2, 0]} color="#1b1d22" />
        </Board>
      );
    case "radio":
      return (
        <Board>
          <Box size={[5, 0.5, 4]} at={[-0.6, 0.33, 0]} color="#a3a9b3" metalness={0.9} roughness={0.3} />
          <Cylinder r={0.25} h={0.7} at={[3.3, 0.4, 3.1]} color="#d4af37" metalness={1} roughness={0.3} />
        </Board>
      );
    case "adcs":
      return (
        <Board>
          <Cylinder r={0.35} h={6} at={[0, 0.45, -2.2]} rot={[0, 0, Math.PI / 2]} color="#b87740" metalness={0.9} roughness={0.35} />
          <Cylinder r={0.35} h={6} at={[-2.2, 0.45, 0]} rot={[Math.PI / 2, 0, 0]} color="#b87740" metalness={0.9} roughness={0.35} />
          <mesh position={[1.4, 0.25, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.6, 0.16, 10, 36]} />
            <Mat color="#b87740" metalness={0.9} roughness={0.35} />
          </mesh>
        </Board>
      );
    case "panels": {
      const out = exploded ? 4.5 : 0;
      return (
        <>
          <SolarPanel at={[0, 0, 5.15 + out]} rot={[0, 0, 0]} />
          <SolarPanel at={[0, 0, -5.15 - out]} rot={[0, Math.PI, 0]} />
          <SolarPanel at={[5.15 + out, 0, 0]} rot={[0, Math.PI / 2, 0]} />
          <SolarPanel at={[-5.15 - out, 0, 0]} rot={[0, -Math.PI / 2, 0]} />
          {solar === "wings" && (
            <>
              <SolarPanel at={[9.4 + out * 1.6, 0, 5.15 + out]} rot={[0, 0, 0]} />
              <SolarPanel at={[-9.4 - out * 1.6, 0, 5.15 + out]} rot={[0, 0, 0]} />
              <Box size={[0.4, 8, 0.3]} at={[4.75 + out * 0.8, 0, 5.15 + out]} color="#9aa1ab" metalness={0.8} />
              <Box size={[0.4, 8, 0.3]} at={[-4.75 - out * 0.8, 0, 5.15 + out]} color="#9aa1ab" metalness={0.8} />
            </>
          )}
        </>
      );
    }
    case "antenna":
      return (
        <>
          <Box size={[8.6, 0.35, 8.6]} color="#2b2f3a" metalness={0.5} />
          <Box size={[15, 0.04, 0.4]} at={[11.8, 0.22, 0]} color="#e5e7eb" metalness={0.9} roughness={0.25} />
          <Box size={[15, 0.04, 0.4]} at={[-11.8, 0.22, 0]} color="#e5e7eb" metalness={0.9} roughness={0.25} />
        </>
      );
  }
}

function Part({ id, state, props, ghost }: { id: PartId; state: SceneState; props: CubeSatSceneProps; ghost: boolean }) {
  const ref = useRef<Group>(null);
  const layout = LAYOUT[id];
  const to = state.exploded && id !== "panels" ? layout.exploded : layout.pos;
  // A part flies in from the front when it is installed; the frame and ghosts start in place.
  const [from] = useState<V3 | undefined>(() => (id === "frame" || ghost ? undefined : [to[0], to[1] + 3, to[2] + 16]));
  useEasedPosition(ref, to, state.reducedMotion, from);
  const highlight = props.selected === id;
  useLabelAnchor(ghost ? `ghost-${id}` : id, ref, layout.label);
  return (
    <group
      ref={ref}
      onClick={(e) => {
        if (ghost || !props.onSelect) return;
        e.stopPropagation();
        props.onSelect(id);
      }}
      onPointerOver={(e) => {
        if (ghost || !props.onSelect) return;
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <PartCtx.Provider value={{ highlight, ghost }}>
        <PartGeometry id={id} solar={props.solar} exploded={state.exploded} />
      </PartCtx.Provider>
    </group>
  );
}

export default function CubeSatScene(props: CubeSatSceneProps & SceneState) {
  const visible: PartId[] = ["frame", ...props.installed.filter((id) => id !== "frame")];
  const ghost = props.ghost && !visible.includes(props.ghost) ? props.ghost : null;
  // On a phone only the selected part and the ghost are labelled, so labels never cover the model.
  const labels = props.labels
    ? [
        ...visible.filter((id) => !props.compact || props.selected === id).map((id) => ({ id, text: PARTS[id].name, active: props.selected === id })),
        ...(ghost ? [{ id: `ghost-${ghost}`, text: `Next: ${PARTS[ghost].name}?`, active: true }] : []),
      ]
    : [];
  return (
    <Stage3D
      controller={props.controller}
      reducedMotion={props.reducedMotion}
      compact={props.compact}
      onContextLost={props.onContextLost}
      cameraPosition={[31, 19, 37]}
      minDistance={14}
      maxDistance={80}
      labels={labels}
    >
      {visible.map((id) => (
        <Part key={id} id={id} state={props} props={props} ghost={false} />
      ))}
      {ghost && <Part key={`ghost-${ghost}`} id={ghost} state={props} props={props} ghost />}
    </Stage3D>
  );
}
