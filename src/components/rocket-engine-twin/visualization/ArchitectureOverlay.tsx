// Architecture, laid around the engine it describes: sensor points on the
// hardware, data paths leaving it, and the digital layers as nodes beside it.
// A layer can be picked from the scene or from the list; either way the
// physical parts it concerns light up.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei/web/Html";
import type { Mesh, ShaderMaterial } from "three";
import { ARCHITECTURE_LAYERS } from "../data/twinContent";
import { type V3, pipe } from "../engine/geometry";
import { CONTROLLER_AT, SENSOR_AT } from "../engine/layout";
import { frame } from "../scene/frameState";
import { useRocketTwinStore } from "../state/twinStore";
import type { ArchitectureLayer, SensorId } from "../types";
import { FLOW_COLOR, flowMaterial } from "./shaders";
import ui from "../twin3d.module.css";

const NODES = ARCHITECTURE_LAYERS.filter((layer) => layer.node) as (typeof ARCHITECTURE_LAYERS[number] & { node: V3 })[];
const node = (id: ArchitectureLayer) => NODES.find((n) => n.id === id)!.node;

/** A path that bows outward between two points, so the links read as paths and not as struts. */
const link = (from: V3, to: V3, lift = 0.16): V3[] => [from, [(from[0] + to[0]) / 2 + Math.sign(from[0] + to[0]) * lift, (from[1] + to[1]) / 2 + lift, (from[2] + to[2]) / 2 + lift], to];

const LINKS: readonly V3[][] = [
  // Every sensor reports to acquisition.
  ...(Object.keys(SENSOR_AT) as SensorId[]).map((id) => link(SENSOR_AT[id].at, node("acquisition"), 0.1)),
  link(node("acquisition"), node("control")),
  link(node("control"), CONTROLLER_AT, 0.05),
  // Up over the engine to the models, then down the digital side.
  [node("acquisition"), [-0.6, 2.35, 0.5], [0.7, 2.35, 0.5], node("models")],
  link(node("models"), node("fdir")),
  link(node("fdir"), node("twin")),
  link(node("twin"), node("evidence")),
];

export default function ArchitectureOverlay() {
  const active = useRocketTwinStore((s) => s.mode === "architecture");
  const layer = useRocketTwinStore((s) => s.layer);
  const selectLayer = useRocketTwinStore((s) => s.selectLayer);
  const first = useRef<Mesh>(null);
  const geometries = useMemo(() => LINKS.map((points) => pipe(points, 0.008, { radial: 5 })), []);
  const material = useMemo(() => flowMaterial(FLOW_COLOR.data, 7, 0.8), []);

  useEffect(
    () => () => {
      geometries.forEach((geometry) => geometry.dispose());
      material.dispose();
    },
    [geometries, material],
  );

  useFrame(() => {
    // Every link shares one material, so the first mesh is enough to reach it.
    const uniforms = (first.current?.material as ShaderMaterial | undefined)?.uniforms;
    if (!uniforms) return;
    uniforms.uTime.value = frame.now;
    uniforms.uStrength.value = 0.85;
  });

  if (!active) return null;
  return (
    <group name="Architecture">
      {geometries.map((geometry, i) => (
        <mesh key={i} ref={i === 0 ? first : undefined} geometry={geometry} material={material} renderOrder={8} />
      ))}
      {NODES.map((n) => (
        <Html key={n.id} position={n.node as [number, number, number]} center zIndexRange={[20, 10]}>
          <button type="button" className={ui.node} aria-pressed={layer === n.id} aria-label={`Architecture layer: ${n.name}`} onClick={() => selectLayer(n.id)}>
            {n.name}
          </button>
        </Html>
      ))}
    </group>
  );
}
