"use client";
// The equipment yard at the north-east corner, beside the wireless bays (short
// cable runs): the edge gateway and network cabinet, the distribution and
// metering cabinet, the battery storage cabinet and the solar inverter, under
// a service roof, all front-access for maintenance. Status lamps read the
// simulation (gateway up, storage charging or discharging).
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, type BufferGeometry, Color, MeshStandardMaterial } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Layout } from "@/lib/wireless-charging/smart-parking/layout";
import { facilityIfBuilt } from "../../state/runtime";
import { setAnchor } from "../labels";
import { setEmissive } from "../mutate";
import { pick } from "../pick";

const box = (w: number, h: number, d: number, x: number, y: number, z: number) => new BoxGeometry(w, h, d).toNonIndexed().translate(x, y, z);

function useDispose(items: { dispose(): void }[]) {
  useEffect(() => () => items.forEach((x) => x.dispose()), [items]);
}

/** Yard position (facility frame): east of the last north bay, north of the aisle. */
export function yard(layout: Layout) {
  const x = -layout.x0 + 1.0;
  const y = layout.aisle.half + 1.2;
  return { x0: x, x1: layout.aisle.xEast + 0.2, y0: y, y1: layout.aisle.half + layout.inputs.bayDepth };
}

export function Equipment({ layout }: { layout: Layout }) {
  const yd = yard(layout);
  const cx = (yd.x0 + yd.x1) / 2;
  const back = yd.y1 - 0.45;
  const g = useMemo(() => {
    const louvres: BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) louvres.push(box(0.6, 0.02, 0.02, 0, 0.6 + i * 0.09, 0));
    const roof: BufferGeometry[] = [box(yd.x1 - yd.x0 + 0.6, 0.06, yd.y1 - yd.y0 + 0.8, cx, 2.75, -(yd.y0 + yd.y1) / 2)];
    for (const [x, y] of [[yd.x0 - 0.2, yd.y0 - 0.3], [yd.x1 + 0.2, yd.y0 - 0.3], [yd.x0 - 0.2, yd.y1 + 0.3], [yd.x1 + 0.2, yd.y1 + 0.3]]) roof.push(box(0.1, 2.72, 0.1, x, 1.36, -y));
    return { louvres: mergeGeometries(louvres)!, roof: mergeGeometries(roof)! };
  }, [yd.x0, yd.x1, yd.y0, yd.y1, cx]);
  const m = useMemo(
    () => ({
      cabinet: new MeshStandardMaterial({ color: "#d5d9dd", metalness: 0.5, roughness: 0.42 }),
      bess: new MeshStandardMaterial({ color: "#8b958f", metalness: 0.45, roughness: 0.5 }),
      dark: new MeshStandardMaterial({ color: "#2a3038", metalness: 0.55, roughness: 0.4 }),
      roof: new MeshStandardMaterial({ color: "#5f666e", metalness: 0.7, roughness: 0.4 }),
      gwLamp: new MeshStandardMaterial({ color: "#111", emissive: new Color("#3fb950"), emissiveIntensity: 2 }),
      bessLamp: new MeshStandardMaterial({ color: "#111", emissive: new Color("#39c5cf"), emissiveIntensity: 1.5 }),
      pad: new MeshStandardMaterial({ color: "#a3a7ab", roughness: 0.9 }),
    }),
    [],
  );
  useDispose(useMemo(() => [g.louvres, g.roof, ...Object.values(m)], [g, m]));
  const span = yd.x1 - yd.x0;
  const xs = [yd.x0 + span * 0.14, yd.x0 + span * 0.38, yd.x0 + span * 0.64, yd.x0 + span * 0.9];
  useFrame(() => {
    const sim = facilityIfBuilt();
    if (!sim) return;
    setEmissive(m.gwLamp, sim.gatewayUp ? "#3fb950" : "#e5534b", 2);
    const e = sim.lastEnergy;
    setEmissive(m.bessLamp, e && e.bessDischarge > 1 ? "#d9a441" : e && e.bessCharge > 1 ? "#39c5cf" : "#3a4048", 1.6);
    setAnchor("eq-gateway", xs[0], 2.1, -back);
    setAnchor("eq-distribution", xs[1], 2.15, -back);
    setAnchor("eq-bess", xs[2], 2.25, -back);
    setAnchor("eq-pv", xs[3], 1.9, -back);
  });
  return (
    <group>
      <mesh position={[cx, 0.05, -(yd.y0 + yd.y1) / 2]} material={m.pad} receiveShadow>
        <boxGeometry args={[span + 0.6, 0.1, yd.y1 - yd.y0 + 0.8]} />
      </mesh>
      <mesh geometry={g.roof} material={m.roof} castShadow receiveShadow {...pick("sp-equipment-enclosure")} />
      {/* Edge gateway and network (front doors face the aisle, south). */}
      <group position={[xs[0], 0.1, -back]} {...pick("sp-edge-gateway")}>
        <mesh material={m.cabinet} position={[0, 0.95, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 1.9, 0.6]} />
        </mesh>
        <mesh geometry={g.louvres} material={m.dark} position={[0, 0, 0.305]} />
        <mesh material={m.gwLamp} position={[0.28, 1.7, 0.305]}>
          <boxGeometry args={[0.06, 0.03, 0.01]} />
        </mesh>
      </group>
      <group position={[xs[1], 0.1, -back]} {...pick("sp-power-cabinet")}>
        <mesh material={m.cabinet} position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 2.0, 0.5]} />
        </mesh>
        <mesh material={m.dark} position={[-0.2, 1.4, 0.255]}>
          <boxGeometry args={[0.28, 0.2, 0.01]} />
        </mesh>
      </group>
      <group position={[xs[2], 0.1, -back]} {...pick("bess")}>
        <mesh material={m.bess} position={[0, 1.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 2.1, 0.9]} />
        </mesh>
        <mesh material={m.bessLamp} position={[-0.4, 1.9, 0.455]}>
          <boxGeometry args={[0.3, 0.03, 0.01]} />
        </mesh>
      </group>
      <group position={[xs[3], 0.1, -back]} {...pick("solar")}>
        <mesh material={m.cabinet} position={[0, 1.2, 0.1]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.22]} />
        </mesh>
        <mesh material={m.dark} position={[0, 0.5, 0.1]}>
          <boxGeometry args={[0.08, 0.6, 0.08]} />
        </mesh>
      </group>
    </group>
  );
}
