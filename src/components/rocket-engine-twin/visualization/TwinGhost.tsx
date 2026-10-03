// The digital twin's EXPECTED state: the reference model's engine, drawn as a
// pale outline exactly where the model says the engine should be. The solid
// engine is what is OBSERVED. Where the two agree they coincide; where the
// observed turbopump is shaking with a worn bearing, it visibly leaves the outline.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, ShaderMaterial } from "three";
import { merge } from "../engine/geometry";
import { PARTS } from "../engine/layout";
import { frame } from "../scene/frameState";
import type { PartId } from "../types";
import { ghostMaterial } from "./shaders";

/** The parts that make the engine's silhouette. Internals and small fittings are left out of the outline. */
const OUTLINE: readonly PartId[] = [
  "cooling_jacket",
  "nozzle_extension",
  "injector_head",
  "turbopump_fuel",
  "turbopump_oxidiser",
  "feed_fuel",
  "feed_oxidiser",
  "line_fuel_discharge",
  "line_oxidiser_discharge",
  "preburner",
  "hot_gas_fuel",
  "hot_gas_oxidiser",
  "exhaust_fuel",
  "exhaust_oxidiser",
  "manifold_inlet",
  "gimbal_mount",
];

export default function TwinGhost() {
  const mesh = useRef<Mesh>(null);
  const geometry = useMemo(() => merge(OUTLINE.map((id) => PARTS[id].build(false))), []);
  const material = useMemo(() => ghostMaterial(), []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(() => {
    const node = mesh.current;
    if (!node) return;
    (node.material as ShaderMaterial).uniforms.uGhost.value = frame.ghost;
    node.visible = frame.ghost > 0.01;
  });

  return <mesh ref={mesh} name="TwinGhost" geometry={geometry} material={material} visible={false} renderOrder={9} />;
}
