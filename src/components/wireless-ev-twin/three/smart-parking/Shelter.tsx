"use client";
// The shelter: a cantilevered mono-pitch canopy over each row of bays, on rear
// columns, falling 5° to a rear gutter; purlins, a metal deck and PV modules
// above; under it the luminaires, the cable tray, a ceiling ultrasonic sensor
// and a state indicator for every bay, the row camera, jet fans, the
// environmental node, smoke and gas sensors, ESP32 nodes and alarm beacons.
// Light levels, fan speeds, indicator faces and beacons read the facility
// simulation. Dimensions are representative, not a certified design.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, type BufferGeometry, Color, CylinderGeometry, type Group, type InstancedMesh, Matrix4, MeshPhysicalMaterial, MeshStandardMaterial, Quaternion, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Layout } from "@/lib/wireless-charging/smart-parking/layout";
import type { BayStatus } from "@/lib/wireless-charging/smart-parking/types";
import { facilityIfBuilt } from "../../state/runtime";
import { useTwin } from "../../state/store";
import { setAnchor } from "../labels";
import { moduleTexture } from "../materials";
import { setEmissive, setMap, setOpacity, setRotation, setVisible } from "../mutate";
import { pick } from "../pick";
import { view } from "../viewState";
import { STATUS_LOOK, statusTexture } from "./textures";

const FRONT_H = 3.62;
const FALL = 0.62;
const box = (w: number, h: number, d: number, x: number, y: number, z: number) => new BoxGeometry(w, h, d).toNonIndexed().translate(x, y, z);

/** Roof underside height at facility |y|. */
export function roofHeight(layout: Layout, yAbs: number) {
  const { yInner, yOuter } = layout.canopy;
  return FRONT_H - ((yAbs - yInner) / (yOuter - yInner)) * FALL;
}

export const SENSOR_HEIGHT = 2.9;

function useDispose(items: { dispose(): void }[]) {
  useEffect(() => () => items.forEach((x) => x.dispose()), [items]);
}

function build(layout: Layout) {
  const { x0, x1, yInner, yOuter } = layout.canopy;
  const half = layout.aisle.half;
  const depth = layout.inputs.bayDepth;
  const slope = Math.atan2(FALL, yOuter - yInner);
  const span = yOuter - yInner;
  const yColumn = half + depth + 0.35;
  const steel: BufferGeometry[] = [];
  const deck: BufferGeometry[] = [];
  const lights: BufferGeometry[] = [];
  const tray: BufferGeometry[] = [];
  const gutter: BufferGeometry[] = [];
  const sensors: BufferGeometry[] = [];
  const brackets: BufferGeometry[] = [];
  const nodes: BufferGeometry[] = [];
  const columnsX: number[] = [];
  for (let k = 0; k <= layout.perSide; k += 2) columnsX.push(layout.x0 + k * layout.inputs.bayWidth);
  if (columnsX.at(-1)! < -layout.x0 - 0.01) columnsX.push(-layout.x0);
  for (const sign of [1, -1]) {
    const z = (y: number) => -sign * y;
    for (const x of columnsX) {
      const top = roofHeight(layout, yColumn) - 0.12;
      steel.push(box(0.26, top, 0.26, x, top / 2, z(yColumn)));
      // Tapered cantilever: a deep beam at the column, a shallow one at the tip.
      const beamMid = (yInner + yOuter) / 2;
      const b1 = box(0.16, 0.34, span * 0.55, x, 0, 0);
      b1.rotateX(-sign * slope);
      b1.translate(0, roofHeight(layout, yOuter - span * 0.275) - 0.28, z(yOuter - span * 0.275));
      const b2 = box(0.14, 0.2, span * 0.5, x, 0, 0);
      b2.rotateX(-sign * slope);
      b2.translate(0, roofHeight(layout, yInner + span * 0.25) - 0.2, z(yInner + span * 0.25));
      steel.push(b1, b2);
      void beamMid;
      // ESP32 node on the column, facing the aisle; downpipe on its back.
      nodes.push(box(0.16, 0.22, 0.08, x + 0.16, 1.6, z(yColumn - 0.17)));
      gutter.push(box(0.09, roofHeight(layout, yColumn) - 0.1, 0.09, x - 0.18, (roofHeight(layout, yColumn) - 0.1) / 2, z(yColumn + 0.17)));
    }
    // Purlins along the facility.
    for (let i = 0; i < 6; i++) {
      const y = yInner + 0.25 + (i * (span - 0.5)) / 5;
      steel.push(box(x1 - x0, 0.12, 0.09, (x0 + x1) / 2, roofHeight(layout, y) - 0.08, z(y)));
    }
    // Deck (one sloped sheet) and the fascia.
    const d = box(x1 - x0, 0.035, span / Math.cos(slope), 0, 0, 0);
    d.rotateX(-sign * slope);
    d.translate((x0 + x1) / 2, roofHeight(layout, (yInner + yOuter) / 2) + 0.02, z((yInner + yOuter) / 2));
    deck.push(d);
    steel.push(box(x1 - x0 + 0.1, 0.22, 0.06, (x0 + x1) / 2, FRONT_H - 0.04, z(yInner - 0.02)));
    // Rear box gutter.
    gutter.push(box(x1 - x0 + 0.1, 0.16, 0.2, (x0 + x1) / 2, roofHeight(layout, yOuter) - 0.05, z(yOuter + 0.08)));
    // Cable tray under the beams, toward the rear.
    tray.push(box(x1 - x0, 0.06, 0.24, (x0 + x1) / 2, roofHeight(layout, half + depth - 0.6) - 0.42, z(half + depth - 0.6)));
    for (const b of layout.bays.filter((b) => (b.row === "N" ? 1 : -1) === sign)) {
      // A linear luminaire over each bay, toward the aisle.
      const yl = half + 1.3;
      lights.push(box(0.09, 0.03, 1.9, b.x, roofHeight(layout, yl) - 0.16, z(yl)));
      // Ceiling ultrasonic sensor over the bay centre on a drop bracket.
      const yc = Math.abs(b.y);
      const roof = roofHeight(layout, yc);
      brackets.push(box(0.025, roof - SENSOR_HEIGHT - 0.04, 0.025, b.x, (roof + SENSOR_HEIGHT) / 2, z(yc)));
      sensors.push(new CylinderGeometry(0.045, 0.05, 0.07, 18).toNonIndexed().translate(b.x, SENSOR_HEIGHT, z(yc)));
    }
    // Aisle-edge luminaires.
    for (let x = x0 + 1.4; x < x1 - 1; x += 2.8) lights.push(box(0.09, 0.03, 1.2, x, FRONT_H - 0.18, z(yInner + 0.35)));
  }
  return { steel: mergeGeometries(steel)!, deck: mergeGeometries(deck)!, lights: mergeGeometries(lights)!, tray: mergeGeometries(tray)!, gutter: mergeGeometries(gutter)!, sensors: mergeGeometries(sensors)!, brackets: mergeGeometries(brackets)!, nodes: mergeGeometries(nodes)!, slope, columnsX, yColumn };
}

/** Per-bay indicator faces (one material each, its map swapped with the bay's state). */
function Indicators({ layout }: { layout: Layout }) {
  const textures = useMemo(() => Object.fromEntries((Object.keys(STATUS_LOOK) as BayStatus[]).map((k) => [k, statusTexture(k)])) as Record<BayStatus, ReturnType<typeof statusTexture>>, []);
  const mats = useMemo(() => layout.bays.map(() => new MeshStandardMaterial({ color: "#000000", map: textures.available, emissiveMap: textures.available, emissive: new Color("#ffffff"), emissiveIntensity: 1.3, roughness: 0.3 })), [layout, textures]);
  const housing = useMemo(() => new MeshStandardMaterial({ color: "#1a1f25", metalness: 0.5, roughness: 0.4 }), []);
  useDispose(useMemo(() => [...Object.values(textures), ...mats, housing], [textures, mats, housing]));
  const last = useRef<string[]>([]);
  useFrame(() => {
    const sim = facilityIfBuilt();
    if (!sim) return;
    sim.bays.forEach((b, i) => {
      if (last.current[i] === b.status || !mats[i]) return;
      last.current[i] = b.status;
      setMap(mats[i], textures[b.status], true);
    });
  });
  const half = layout.aisle.half;
  return (
    <group>
      {layout.bays.map((b, i) => {
        const sign = b.row === "N" ? 1 : -1;
        const y = sign * (half + 0.35);
        const h = roofHeight(layout, half + 0.35) - 0.38;
        return (
          <group key={b.id} position={[b.x, h, -y]} rotation={[0, sign > 0 ? 0 : Math.PI, 0]} {...pick(`sp-bay:${b.id}`)}>
            <mesh material={housing}>
              <boxGeometry args={[0.46, 0.3, 0.08]} />
            </mesh>
            <mesh material={mats[i]} position={[0, 0, 0.042]}>
              <planeGeometry args={[0.42, 0.26]} />
            </mesh>
            <mesh material={housing} position={[0, 0.25, 0]}>
              <boxGeometry args={[0.02, 0.2, 0.02]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Jet fans: rotors turn with the controller's duty (a failed fan stops). */
function Fans({ layout }: { layout: Layout }) {
  const spots = useMemo(() => {
    const out: { x: number; y: number }[] = [];
    const n = Math.max(1, Math.round(layout.perSide / 3));
    for (const sign of [1, -1]) for (let k = 0; k < n; k++) out.push({ x: layout.x0 + ((k + 0.5) / n) * (-2 * layout.x0), y: sign * (layout.aisle.half + 2.6) });
    return out;
  }, [layout]);
  const m = useMemo(() => ({ body: new MeshStandardMaterial({ color: "#c9cdd2", metalness: 0.7, roughness: 0.35 }), blade: new MeshStandardMaterial({ color: "#3a4048", metalness: 0.4, roughness: 0.5 }) }), []);
  const blades = useMemo(() => mergeGeometries([0, 1, 2, 3, 4].map((k) => box(0.03, 0.2, 0.02, 0, 0.1, 0).rotateZ((k * 2 * Math.PI) / 5)))!, []);
  useDispose(useMemo(() => [m.body, m.blade, blades], [m, blades]));
  const rotors = useRef<(Group | null)[]>([]);
  const angle = useRef(0);
  useFrame((_, dt) => {
    const sim = facilityIfBuilt();
    const s = useTwin.getState();
    if (!sim) return;
    if (s.playing) angle.current += dt * 2 * Math.PI * 9 * sim.env.fanDuty * Math.min(4, s.speed);
    rotors.current.forEach((r) => setRotation(r, "z", angle.current));
  });
  return (
    <group>
      {spots.map((p, i) => (
        <group key={i} position={[p.x, roofHeight(layout, Math.abs(p.y)) - 0.42, -p.y]} rotation={[0, Math.PI / 2, 0]} {...pick("sp-fan")}>
          <mesh material={m.body} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.9, 28, 1, true]} />
          </mesh>
          <group
            ref={(el) => {
              rotors.current[i] = el;
            }}
            position={[0, 0, 0.3]}
          >
            <mesh geometry={blades} material={m.blade} />
          </group>
          <mesh material={m.body} position={[0, 0.3, 0]}>
            <boxGeometry args={[0.06, 0.2, 0.06]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Shelter({ layout }: { layout: Layout }) {
  const g = useMemo(() => build(layout), [layout]);
  const pvTex = useMemo(() => moduleTexture(), []);
  const m = useMemo(
    () => ({
      steel: new MeshPhysicalMaterial({ color: "#3d434b", metalness: 0.75, roughness: 0.36, clearcoat: 0.3, transparent: true, opacity: 1 }),
      deck: new MeshStandardMaterial({ color: "#d4d8dc", metalness: 0.6, roughness: 0.45, transparent: true, opacity: 1 }),
      pv: new MeshPhysicalMaterial({ map: pvTex, metalness: 0.15, roughness: 0.3, clearcoat: 0.35, clearcoatRoughness: 0.2, envMapIntensity: 0.6, transparent: true, opacity: 1 }),
      light: new MeshStandardMaterial({ color: "#ffffff", emissive: new Color("#fff3e3"), emissiveIntensity: 0.2 }),
      tray: new MeshStandardMaterial({ color: "#8c939b", metalness: 0.85, roughness: 0.5 }),
      gutter: new MeshStandardMaterial({ color: "#6b737c", metalness: 0.6, roughness: 0.5 }),
      sensor: new MeshStandardMaterial({ color: "#e9edf0", metalness: 0.2, roughness: 0.4 }),
      node: new MeshStandardMaterial({ color: "#2b3038", metalness: 0.4, roughness: 0.45, emissive: new Color("#1f6feb"), emissiveIntensity: 0.15 }),
      device: new MeshStandardMaterial({ color: "#20252b", metalness: 0.5, roughness: 0.4 }),
      beacon: new MeshStandardMaterial({ color: "#3a0b0b", emissive: new Color("#ff3b30"), emissiveIntensity: 0, transparent: true, opacity: 0.92 }),
      env: new MeshStandardMaterial({ color: "#eef1f3", roughness: 0.6 }),
    }),
    [pvTex],
  );
  useDispose(useMemo(() => [pvTex, ...Object.values(m), g.steel, g.deck, g.lights, g.tray, g.gutter, g.sensors, g.brackets, g.nodes], [pvTex, m, g]));
  const pv = useRef<InstancedMesh>(null);
  const modules = useMemo(() => {
    const out: Matrix4[] = [];
    const { x0, x1, yInner, yOuter } = layout.canopy;
    const cols = Math.max(1, Math.floor((x1 - x0 - 0.2) / 1.05));
    const rows = Math.max(1, Math.floor((yOuter - yInner - 0.3) / 1.75));
    const q = new Quaternion();
    for (const sign of [1, -1]) {
      q.setFromAxisAngle(new Vector3(1, 0, 0), -sign * g.slope);
      for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++) {
          const x = x0 + 0.1 + (c + 0.5) * ((x1 - x0 - 0.2) / cols);
          const y = yInner + 0.15 + (r + 0.5) * ((yOuter - yInner - 0.3) / rows);
          out.push(new Matrix4().compose(new Vector3(x, roofHeight(layout, y) + 0.07, -sign * y), q, new Vector3((x1 - x0 - 0.2) / cols - 0.05, 1, (yOuter - yInner - 0.3) / rows - 0.05)));
        }
    }
    return out;
  }, [layout, g.slope]);
  useEffect(() => {
    const mesh = pv.current;
    if (!mesh) return;
    modules.forEach((mx, i) => mesh.setMatrixAt(i, mx));
    mesh.instanceMatrix.needsUpdate = true;
  }, [modules]);
  const t = useRef(0);
  const beacons = useRef<Group>(null);
  useFrame((_, dt) => {
    const sim = facilityIfBuilt();
    if (!sim) return;
    t.current += dt;
    // Shelter view: the roof turns translucent over the structure.
    const v = useTwin.getState().view;
    const open = Math.max(view.shelter, v === "occupancy" || v === "top" ? 1 : 0);
    setOpacity(m.pv, 1 - 0.72 * open, 0.6);
    setOpacity(m.deck, 1 - 0.8 * open, 0.6);
    setEmissive(m.light, "#fff3e3", 0.15 + 2.6 * sim.env.lighting);
    const alarm = sim.env.alarm !== "none";
    setEmissive(m.beacon, "#ff3b30", alarm ? (Math.sin(t.current * 9) > 0 ? 3.2 : 0.3) : 0);
    setVisible(beacons.current, true);
    // Dimension anchors for the shelter view.
    // Dimension labels in the middle of the facility, spread along it, so none sits at the scene's edge.
    const { yInner, yOuter } = layout.canopy;
    const north = layout.bays.filter((b) => b.row === "N");
    const bx = (k: number) => north[Math.min(north.length - 1, Math.max(0, Math.round(k * (north.length - 1))))].x;
    setAnchor("dim-bay", bx(0.5), 0.05, -(layout.aisle.half + layout.inputs.bayDepth / 2));
    setAnchor("dim-aisle", bx(0.2), 0.05, 0);
    setAnchor("dim-sensor", bx(0.35), SENSOR_HEIGHT - 0.12, -Math.abs(north[0].y));
    setAnchor("dim-roof", bx(0.15), roofHeight(layout, yOuter) + 0.3, -(yOuter - 0.4));
    setAnchor("dim-front", bx(0.6), FRONT_H + 0.25, -yInner);
    setAnchor("dim-gutter", bx(0.45), roofHeight(layout, yOuter) - 0.2, -(yOuter + 0.2));
    setAnchor("dim-tray", bx(0.8), roofHeight(layout, layout.aisle.half + layout.inputs.bayDepth - 0.6) - 0.5, -(layout.aisle.half + layout.inputs.bayDepth - 0.6));
  });
  const half = layout.aisle.half;
  const depth = layout.inputs.bayDepth;
  return (
    <group>
      <mesh geometry={g.steel} material={m.steel} castShadow receiveShadow {...pick("sp-structure")} />
      <mesh geometry={g.deck} material={m.deck} castShadow receiveShadow {...pick("sp-roof")} />
      <instancedMesh ref={pv} args={[undefined, undefined, modules.length]} material={m.pv} castShadow {...pick("solar")}>
        <boxGeometry args={[1, 0.04, 1]} />
      </instancedMesh>
      <mesh geometry={g.lights} material={m.light} {...pick("sp-light")} />
      <mesh geometry={g.tray} material={m.tray} {...pick("sp-cable-tray")} />
      <mesh geometry={g.gutter} material={m.gutter} castShadow {...pick("sp-gutter")} />
      <mesh geometry={g.brackets} material={m.tray} />
      <mesh geometry={g.sensors} material={m.sensor} {...pick("sp-occupancy-sensor")} />
      <mesh geometry={g.nodes} material={m.node} {...pick("sp-esp32-node")} />
      <Indicators layout={layout} />
      <Fans layout={layout} />
      {/* Row cameras on the canopy fronts, looking down the bays. */}
      {[1, -1].map((sign) => (
        <group key={sign} position={[0, FRONT_H - 0.3, -sign * (layout.canopy.yInner + 0.25)]} rotation={[sign * 0.55, sign > 0 ? Math.PI : 0, 0]} {...pick("sp-row-camera")}>
          <mesh material={m.device}>
            <boxGeometry args={[0.16, 0.12, 0.3]} />
          </mesh>
          <mesh material={m.sensor} position={[0, 0, 0.16]}>
            <cylinderGeometry args={[0.045, 0.045, 0.02, 18]} />
          </mesh>
        </group>
      ))}
      {/* Environmental nodes (temperature, humidity, CO), smoke detectors under the deck, gas sensors low on a column. */}
      {[1, -1].map((sign) => (
        <group key={`env${sign}`}>
          <mesh material={m.env} position={[g.columnsX[1] ?? 0, 2.3, -sign * (g.yColumn - 0.2)]} {...pick("sp-env-sensor")}>
            <cylinderGeometry args={[0.07, 0.07, 0.22, 10]} />
          </mesh>
          <mesh material={m.env} position={[-layout.x0 * 0.35, roofHeight(layout, half + depth * 0.5) - 0.12, -sign * (half + depth * 0.5)]} {...pick("sp-smoke")}>
            <cylinderGeometry args={[0.09, 0.09, 0.05, 24]} />
          </mesh>
          <mesh material={m.device} position={[g.columnsX[1] ?? 0, 0.42, -sign * (g.yColumn - 0.18)]} {...pick("sp-gas")}>
            <boxGeometry args={[0.12, 0.16, 0.07]} />
          </mesh>
        </group>
      ))}
      <group ref={beacons}>
        {[1, -1].map((sign) => (
          <mesh key={sign} material={m.beacon} position={[g.columnsX[0], 2.95, -sign * (g.yColumn - 0.2)]}>
            <cylinderGeometry args={[0.06, 0.07, 0.12, 16]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
