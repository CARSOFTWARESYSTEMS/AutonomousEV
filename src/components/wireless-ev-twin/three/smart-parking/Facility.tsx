"use client";
// Environment 01 — the Smart Parking facility. Pavement, markings, bay
// furniture and landscape are built from the facility's own layout (so any
// number of bays draws correctly); the shelter, gates, equipment, vehicles
// and overlays are their own modules. Everything moving reads the facility
// simulation; nothing is animated on its own. World frame: x = facility x,
// z = −facility y. Dimensions are representative.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, type BufferGeometry, Color, DoubleSide, type Group, type Material, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, type Texture } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { DEFAULT_TX_PAD } from "@/lib/wireless-charging/coils";
import type { Layout } from "@/lib/wireless-charging/smart-parking/layout";
import { facility, facilityIfBuilt } from "../../state/runtime";
import { useTwin } from "../../state/store";
import { Forest, type Plant } from "../env/Forest";
import { rng, type Species } from "../env/foliage";
import { antiTile, asphaltTexture, concreteTexture } from "../materials";
import { setVisible } from "../mutate";
import { pick } from "../pick";
import { GroundPad } from "../station/Pad";
import { heatOf } from "../station/Site";
import { Equipment } from "./Equipment";
import { Gates } from "./Gates";
import { ParkingOverlays } from "./Overlays";
import { Shelter } from "./Shelter";
import { ParkingVehicles } from "./Vehicles";
import { accessibleTexture, arrowTexture, stencilTexture, wirelessMarkTexture, wordTexture } from "./textures";

const box = (w: number, h: number, d: number, x: number, y: number, z: number) => new BoxGeometry(w, h, d).toNonIndexed().translate(x, y, z);
/** A flat strip on the ground from (x0, y0) to (x1, y1) in facility coordinates. */
const strip = (x0: number, x1: number, y0: number, y1: number, h = 0.004, lift = 0.0) => box(Math.abs(x1 - x0), h, Math.abs(y1 - y0), (x0 + x1) / 2, h / 2 + lift, -(y0 + y1) / 2);

function useDispose(items: { dispose(): void }[]) {
  useEffect(() => () => items.forEach((x) => x.dispose()), [items]);
}

/** The facility's layout, rebuilt on reset. */
export function useLayout(): Layout | null {
  const env = useTwin((s) => s.environment);
  const revision = useTwin((s) => s.revision);
  return useMemo(() => {
    void revision;
    return env === "parking" ? facility().layout : (facilityIfBuilt()?.layout ?? null);
  }, [env, revision]);
}

function Pavement({ layout }: { layout: Layout }) {
  const tex = useMemo(() => {
    const a = asphaltTexture();
    a.repeat.set(30, 3);
    const c = concreteTexture(true);
    c.repeat.set(6, 3);
    return { a, c };
  }, []);
  const m = useMemo(
    () => ({
      asphalt: antiTile(new MeshStandardMaterial({ map: tex.a, color: "#8e9296", roughness: 0.93, metalness: 0 }), [1.02, 1.02, 1.04], [0.94, 0.95, 0.97]),
      slab: new MeshStandardMaterial({ map: tex.c, color: "#b5b9bd", roughness: 0.8, metalness: 0.02 }),
      kerb: new MeshStandardMaterial({ color: "#a9adb1", roughness: 0.85 }),
      island: new MeshStandardMaterial({ color: "#8f9499", roughness: 0.9 }),
      hazard: new MeshStandardMaterial({ color: "#d7a92a", roughness: 0.7 }),
      lawn: new MeshStandardMaterial({ color: "#5f7a3c", roughness: 1 }),
    }),
    [tex],
  );
  const g = useMemo(() => {
    const { entry, exit, aisle } = layout;
    const half = aisle.half;
    const depth = layout.inputs.bayDepth;
    const west = entry.spawnX - 12;
    const east = exit.despawnX + 12;
    const asphalt: BufferGeometry[] = [strip(west, east, -3, 3, 0.012)];
    // Turnaround loop and the return road north of the entry lane.
    asphalt.push(strip(entry.barrierX - 13.5, entry.barrierX + 2.4, 3, 12.2, 0.012), strip(west, entry.barrierX - 13.5, 7.4, 11.6, 0.012));
    const slabs: BufferGeometry[] = [];
    // Bay slabs under the canopies (both rows) and the equipment yard.
    slabs.push(strip(layout.x0 - 0.6, -layout.x0 + 0.6, half, half + depth + 0.25, 0.016), strip(layout.x0 - 0.6, -layout.x0 + 0.6, -half - depth - 0.25, -half, 0.016));
    slabs.push(strip(-layout.x0 + 0.6, aisle.xEast + 0.4, half, half + depth + 0.25, 0.016));
    // Pedestrian walkway from the north-west corner.
    slabs.push(strip(layout.pedestrian.x - 1.2, layout.pedestrian.x + 1.2, half + depth + 0.25, half + depth + 6, 0.02));
    // Gate islands (raised kerbs) with hazard noses.
    const islands: BufferGeometry[] = [];
    const hazard: BufferGeometry[] = [];
    for (const x of [entry.barrierX, exit.barrierX]) {
      islands.push(strip(x - 6.2, x + 3.2, -3.6, -1.95, 0.15));
      islands.push(strip(x + 1.6, x + 3.2, 1.95, 3.1, 0.15));
      hazard.push(strip(x - 6.4, x - 6.2, -3.6, -1.95, 0.155), strip(x + 1.4, x + 1.6, 1.95, 3.1, 0.155));
    }
    // Kerbs along the lane edges where no bay opens onto it.
    const kerbs: BufferGeometry[] = [strip(west, layout.x0 - 0.6, -3.15, -3.0, 0.12), strip(-layout.x0 + 0.6, east, -3.15, -3.0, 0.12), strip(aisle.xEast + 0.4, east, 3.0, 3.15, 0.12), strip(entry.barrierX + 3.2, layout.x0 - 0.6, 3.0, 3.15, 0.12)];
    const lawn: BufferGeometry[] = [strip(west, east, -14, -3.6, 0.008, -0.004), strip(entry.barrierX + 2.4, east, half + depth + 0.25, 16, 0.008, -0.004)];
    return { asphalt: mergeGeometries(asphalt)!, slabs: mergeGeometries(slabs)!, islands: mergeGeometries(islands)!, hazard: mergeGeometries(hazard)!, kerbs: mergeGeometries(kerbs)!, lawn: mergeGeometries(lawn)! };
  }, [layout]);
  useDispose(useMemo(() => [tex.a, tex.c, ...Object.values(m), ...Object.values(g)], [tex, m, g]));
  return (
    <group>
      <mesh geometry={g.lawn} material={m.lawn} receiveShadow />
      <mesh geometry={g.asphalt} material={m.asphalt} receiveShadow />
      <mesh geometry={g.slabs} material={m.slab} receiveShadow />
      <mesh geometry={g.islands} material={m.island} castShadow receiveShadow />
      <mesh geometry={g.hazard} material={m.hazard} />
      <mesh geometry={g.kerbs} material={m.kerb} castShadow receiveShadow />
    </group>
  );
}

/** Line markings, stencils and pavement symbols. */
function Markings({ layout }: { layout: Layout }) {
  const half = layout.aisle.half;
  const depth = layout.inputs.bayDepth;
  const w = layout.inputs.bayWidth;
  const lines = useMemo(() => {
    const parts: BufferGeometry[] = [];
    for (const sign of [1, -1]) {
      const y0 = sign * half;
      const y1 = sign * (half + depth);
      for (let j = 0; j <= layout.perSide; j++) {
        const x = layout.x0 + j * w;
        parts.push(strip(x - 0.05, x + 0.05, Math.min(y0, y1), Math.max(y0, y1), 0.004, 0.017));
      }
    }
    // Lane centre dashes on the approach and exit roads, stop lines at both gates.
    for (let x = layout.entry.spawnX - 10; x < layout.entry.barrierX - 7; x += 6) parts.push(strip(x, x + 3, -0.06, 0.06, 0.004, 0.012));
    for (let x = layout.exit.barrierX + 4; x < layout.exit.despawnX + 10; x += 6) parts.push(strip(x, x + 3, -0.06, 0.06, 0.004, 0.012));
    parts.push(strip(layout.entry.stopX - 0.15, layout.entry.stopX + 0.05, -1.8, 1.8, 0.004, 0.012), strip(layout.exit.stopX - 0.15, layout.exit.stopX + 0.05, -1.8, 1.8, 0.004, 0.012));
    // Pedestrian crossing at the west end of the aisle.
    for (let k = 0; k < 6; k++) {
      const y = -half + 0.4 + k * ((2 * half - 0.8) / 5);
      parts.push(strip(layout.x0 - 2.2, layout.x0 - 0.8, y - 0.22, y + 0.22, 0.004, 0.012));
    }
    return mergeGeometries(parts)!;
  }, [layout, half, depth, w]);
  const loops = useMemo(() => {
    const parts: BufferGeometry[] = [];
    for (const x of [layout.entry.loopX, layout.exit.loopX]) for (const [a, b, c, d] of [[x - 1, x + 1, 0.85, 0.9], [x - 1, x + 1, -0.9, -0.85], [x - 1, x - 0.95, -0.9, 0.9], [x + 0.95, x + 1, -0.9, 0.9]]) parts.push(strip(a, b, c, d, 0.003, 0.012));
    return mergeGeometries(parts)!;
  }, [layout]);
  const decals = useMemo(() => {
    const out: { tex: Texture; x: number; y: number; w: number; h: number; rot: number; color?: string }[] = [];
    for (const b of layout.bays) {
      const sign = b.row === "N" ? 1 : -1;
      out.push({ tex: stencilTexture(b.id), x: b.x, y: sign * (half + 0.55), w: 1.2, h: 0.6, rot: b.row === "N" ? Math.PI : 0 });
      if (b.type === "accessible") out.push({ tex: accessibleTexture(), x: b.x, y: b.y, w: 1.3, h: 1.3, rot: b.row === "N" ? Math.PI : 0 });
      if (b.type === "wireless" && b.pad) out.push({ tex: wirelessMarkTexture(), x: b.x, y: sign * (half + 1.45), w: 0.9, h: 0.9, rot: 0 });
    }
    const arrow = arrowTexture();
    for (let j = 0; j < layout.perSide; j += 2) out.push({ tex: arrow, x: layout.x0 + (j + 1) * w, y: 0, w: 2.2, h: 1.1, rot: 0 });
    out.push({ tex: wordTexture("IN"), x: layout.entry.barrierX - 9, y: 0, w: 2, h: 1, rot: -Math.PI / 2 }, { tex: wordTexture("OUT"), x: layout.exit.barrierX + 6, y: 0, w: 2.2, h: 1.1, rot: -Math.PI / 2 });
    return out;
  }, [layout, half, w]);
  const m = useMemo(() => ({ line: new MeshStandardMaterial({ color: "#e8eaec", roughness: 0.6, emissive: new Color("#9aa3ad"), emissiveIntensity: 0.06 }), loop: new MeshStandardMaterial({ color: "#202326", roughness: 0.95 }), decals: decals.map((d) => new MeshStandardMaterial({ map: d.tex, transparent: true, depthWrite: false, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2 })) }), [decals]);
  const plane = useMemo(() => new PlaneGeometry(1, 1), []);
  useDispose(useMemo(() => [lines, loops, plane, m.line, m.loop, ...m.decals, ...new Set(decals.map((d) => d.tex))], [lines, loops, plane, m, decals]));
  return (
    <group>
      <mesh geometry={lines} material={m.line} receiveShadow />
      <mesh geometry={loops} material={m.loop} />
      {decals.map((d, i) => (
        <mesh key={i} geometry={plane} material={m.decals[i]} position={[d.x, 0.02 + (i % 3) * 0.0004, -d.y]} rotation={[-Math.PI / 2, 0, d.rot]} scale={[d.w, d.h, 1]} receiveShadow />
      ))}
    </group>
  );
}

/** Wheel stops, the infrared sensors on their posts and the wireless ground pads. */
function BayFurniture({ layout }: { layout: Layout }) {
  const half = layout.aisle.half;
  const depth = layout.inputs.bayDepth;
  const turns = useTwin((s) => s.station.txTurns);
  const g = useMemo(() => {
    const stops: BufferGeometry[] = [];
    const posts: BufferGeometry[] = [];
    const ir: BufferGeometry[] = [];
    for (const b of layout.bays) {
      const sign = b.row === "N" ? 1 : -1;
      const yEnd = sign * (half + depth - 0.32);
      stops.push(box(1.6, 0.1, 0.16, b.x, 0.05, -yEnd));
      // Infrared sensor post at the head of the bay (the sensor looks 1.6 m into it).
      const yPost = sign * (half + depth + 0.05);
      posts.push(box(0.07, 0.62, 0.07, b.x + 0.95, 0.31, -yPost));
      ir.push(box(0.1, 0.07, 0.06, b.x + 0.95, 0.56, -(yPost - sign * 0.05)));
    }
    return { stops: mergeGeometries(stops)!, posts: mergeGeometries(posts)!, ir: mergeGeometries(ir)! };
  }, [layout, half, depth]);
  const m = useMemo(() => ({ stop: new MeshStandardMaterial({ color: "#b7bbbf", roughness: 0.85 }), post: new MeshStandardMaterial({ color: "#3a4048", metalness: 0.6, roughness: 0.4 }), ir: new MeshStandardMaterial({ color: "#151a20", roughness: 0.3, emissive: new Color("#7a1010"), emissiveIntensity: 0.6 }) }), []);
  useDispose(useMemo(() => [...Object.values(g), ...Object.values(m)], [g, m]));
  const wireless = layout.bays.filter((b) => b.pad);
  return (
    <group>
      <mesh geometry={g.stops} material={m.stop} castShadow receiveShadow />
      <mesh geometry={g.posts} material={m.post} castShadow />
      <mesh geometry={g.ir} material={m.ir} {...pick("sp-ir-sensor")} />
      {wireless.map((b) => (
        <group key={b.id} position={[b.pad!.x, 0.016, -b.pad!.y]}>
          <GroundPad
            turns={turns}
            inner={DEFAULT_TX_PAD.innerRadius}
            outer={DEFAULT_TX_PAD.outerRadius}
            glow={() => {
              const ch = facilityIfBuilt()?.chargers.get(b.id);
              const ss = ch?.sim.state.point.ss;
              return ss ? Math.min(1, Math.hypot(ss.i1.re, ss.i1.im) / 40) : 0;
            }}
            heat={() => {
              const ch = facilityIfBuilt()?.chargers.get(b.id);
              return ch ? heatOf(ch.sim.state.temperatures.txCoil, 25, 110) : null;
            }}
          />
        </group>
      ))}
    </group>
  );
}

/** Trees and hedges framing the facility (none over the lanes, the bays or the turnaround). */
function Landscape({ layout }: { layout: Layout }) {
  const plants = useMemo(() => {
    const out: Plant[] = [];
    const r = rng(1101 + layout.bays.length);
    const add = (x: number, y: number, species: Species, scale: number) => out.push({ x, z: -y, species, scale, rot: r() * Math.PI * 2, seed: out.length * 13 + 5 });
    const outer = layout.aisle.half + layout.inputs.bayDepth;
    // Low clipped hedges behind both rows (nothing tall between the bays and the cameras).
    for (let x = layout.x0; x < -layout.x0 + 0.5; x += 1.25) {
      add(x + (r() - 0.5) * 0.2, outer + 1.9, "shrub", 0.7 + r() * 0.2);
      add(x + (r() - 0.5) * 0.2, -(outer + 1.9), "shrub", 0.7 + r() * 0.2);
    }
    // Trees north of the return road, and along the far ends of the approach and exit roads.
    for (let x = layout.entry.spawnX; x < -layout.x0 + 6; x += 5.2 + r() * 2) add(x, 16 + r() * 3, (["broadleaf", "spreading", "columnar"] as Species[])[out.length % 3], 0.9 + r() * 0.3);
    for (let x = layout.entry.spawnX - 6; x < layout.entry.spawnX + 12; x += 6 + r() * 3) add(x, -6 - r() * 2, out.length % 2 ? "young" : "broadleaf", 0.85 + r() * 0.3);
    for (let x = layout.exit.despawnX - 10; x < layout.exit.despawnX + 8; x += 6 + r() * 3) add(x, -6 - r() * 2, out.length % 2 ? "columnar" : "broadleaf", 0.85 + r() * 0.3);
    for (let k = 0; k < 9; k++) add(layout.x0 - 4 - r() * 3, 13 + k * 1.1, "shrub", 1 + r() * 0.4);
    // A distant ring, clear of the highway band and of the camera foreground to the south-east.
    for (let k = 0; k < 40 && out.length < 120; k++) {
      const a = r() * Math.PI * 2;
      const d = 48 + r() * 42;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (z > 14 && z < 46) continue;
      add(x, -z, (["broadleaf", "spreading", "columnar", "young"] as Species[])[k % 4], 0.9 + r() * 0.5);
    }
    return out;
  }, [layout]);
  const near = useMemo(() => plants.filter((p) => Math.hypot(p.x, p.z) < 34), [plants]);
  const far = useMemo(() => plants.filter((p) => Math.hypot(p.x, p.z) >= 34), [plants]);
  return (
    <group>
      <Forest plants={near} />
      <Forest plants={far} far shadows={false} />
    </group>
  );
}

export function ParkingFacility() {
  const env = useTwin((s) => s.environment);
  const layout = useLayout();
  const root = useRef<Group>(null);
  useFrame(() => setVisible(root.current, useTwin.getState().environment === "parking"));
  if (!layout) return null;
  return (
    <group ref={root} visible={env === "parking"}>
      <Pavement layout={layout} />
      <Markings layout={layout} />
      <BayFurniture layout={layout} />
      <Shelter layout={layout} />
      <Gates layout={layout} />
      <Equipment layout={layout} />
      <ParkingVehicles />
      <ParkingOverlays layout={layout} />
      {env === "parking" && <Landscape layout={layout} />}
    </group>
  );
}

export type { Material };
export { DoubleSide, MeshBasicMaterial };
