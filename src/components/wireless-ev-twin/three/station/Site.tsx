"use client";
// The charging site: a four-bay solar shelter with the wireless charging bay
// at z = 0. Slab and markings, a cantilevered PV canopy on two portal
// columns, LED luminaires, bay occupancy indicators, the identification
// camera and positioning anchors, the field probe, the cable trench to the
// power cabinet, the pad-mounted transformer and the storage container.
// Neighbouring bays hold parked vehicles on their own pads.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BoxGeometry, type BufferGeometry, Color, CylinderGeometry, type Group, type InstancedMesh, Matrix4, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, SphereGeometry, type Texture } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { DEFAULT_TX_PAD } from "@/lib/wireless-charging/coils";
import { PHASES } from "@/lib/wireless-charging/stateMachine";
import { runtime } from "../../state/runtime";
import { useTwin } from "../../state/store";
import { concreteTexture, moduleTexture } from "../materials";
import { setEmissive, setOpacity, setVisible } from "../mutate";
import { pick } from "../pick";
import { Vehicle } from "../vehicle/Vehicle";
import { view } from "../viewState";
import { anchorCabinetLabels, Cabinet } from "./Cabinet";
import { GroundPad } from "./Pad";
import { Surroundings } from "./Surroundings";

export const BAY_PITCH = 2.7;
/** Power cabinet at the head of the charging bay, door facing the vehicle. */
export const CABINET = { x: 3.3, z: 1.0 };
const NEIGHBOURS = [
  { z: -BAY_PITCH, paint: "#2c333c" },
  { z: -BAY_PITCH * 2, paint: "#7d1a22" },
  { z: BAY_PITCH, paint: "#1b3550" },
];
const ROOF = { x0: -3.55, x1: 4.25, z0: -7.0, z1: 4.3, yLow: 3.02, yHigh: 3.32 };
const COLUMNS_Z = [-4.4, 1.95];
const COLUMN_X = 3.95;
const roofY = (x: number) => ROOF.yLow + ((ROOF.x1 - x) / (ROOF.x1 - ROOF.x0)) * (ROOF.yHigh - ROOF.yLow);

/** True when the segment from the camera to its target crosses the canopy roof. */
function roofBlocks(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): boolean {
  const y = (ROOF.yLow + ROOF.yHigh) / 2;
  if ((a.y - y) * (b.y - y) > 0) return false;
  const t = (y - a.y) / (b.y - a.y);
  const x = a.x + (b.x - a.x) * t;
  const z = a.z + (b.z - a.z) * t;
  return x > ROOF.x0 - 0.3 && x < ROOF.x1 + 0.3 && z > ROOF.z0 - 0.3 && z < ROOF.z1 + 0.3;
}

const box = (w: number, h: number, d: number, x: number, y: number, z: number, rz = 0) => {
  const g = new BoxGeometry(w, h, d).toNonIndexed();
  if (rz) g.rotateZ(rz);
  g.translate(x, y, z);
  return g;
};

/** Thermal-view tint for a temperature on a scale, or null outside the thermal view. */
export function heatOf(T: number, lo: number, hi: number): Color | null {
  if (view.thermal < 0.5) return null;
  return thermalScale((T - lo) / (hi - lo));
}
const tmp = new Color();
const stops = ["#1d4ed8", "#0ea5a4", "#84cc16", "#f59e0b", "#dc2626"].map((c) => new Color(c));
function thermalScale(t: number): Color {
  const x = Math.min(0.9999, Math.max(0, t)) * (stops.length - 1);
  const i = Math.floor(x);
  return tmp.copy(stops[i]).lerp(stops[i + 1], x - i);
}

function useDispose(items: { dispose(): void }[]) {
  useEffect(() => () => items.forEach((x) => x.dispose()), [items]);
}

function structure() {
  const tilt = Math.atan2(ROOF.yHigh - ROOF.yLow, ROOF.x1 - ROOF.x0);
  const steel: BufferGeometry[] = [];
  for (const z of COLUMNS_Z) {
    steel.push(box(0.24, roofY(COLUMN_X) - 0.12, 0.24, COLUMN_X, (roofY(COLUMN_X) - 0.12) / 2, z));
    // Tapered cantilever beam (two boxes) and a back-stay.
    steel.push(box(ROOF.x1 - ROOF.x0, 0.2, 0.16, (ROOF.x0 + ROOF.x1) / 2, roofY((ROOF.x0 + ROOF.x1) / 2) - 0.18, z, tilt));
    steel.push(box(2.4, 0.34, 0.16, COLUMN_X - 0.6, roofY(COLUMN_X - 0.6) - 0.3, z, tilt));
  }
  // Purlins across the beams.
  for (let i = 0; i < 7; i++) {
    const x = ROOF.x0 + 0.25 + i * ((ROOF.x1 - ROOF.x0 - 0.5) / 6);
    steel.push(box(0.08, 0.1, ROOF.z1 - ROOF.z0, x, roofY(x) - 0.06, (ROOF.z0 + ROOF.z1) / 2));
  }
  // Edge fascia and gutter.
  steel.push(box(0.12, 0.16, ROOF.z1 - ROOF.z0 + 0.1, ROOF.x0 - 0.04, roofY(ROOF.x0) - 0.02, (ROOF.z0 + ROOF.z1) / 2));
  steel.push(box(0.16, 0.12, ROOF.z1 - ROOF.z0 + 0.1, ROOF.x1 + 0.05, roofY(ROOF.x1) - 0.04, (ROOF.z0 + ROOF.z1) / 2));
  const lights: BufferGeometry[] = [];
  for (const x of [-2.2, 0.15, 2.4]) lights.push(box(0.09, 0.025, ROOF.z1 - ROOF.z0 - 0.6, x, roofY(x) - 0.13, (ROOF.z0 + ROOF.z1) / 2));
  return { steel: mergeGeometries(steel)!, lights: mergeGeometries(lights)!, tilt };
}

/** Bay lines, the bay-end line and the outline of the charging position. */
function markings() {
  const lines: BufferGeometry[] = [];
  for (const z of [-6.75, -4.05, -1.35, 1.35, 4.05]) lines.push(box(5.5, 0.004, 0.1, -0.4, 0.003, z));
  lines.push(box(0.1, 0.004, 10.9, 2.38, 0.003, -1.35));
  // The charging position: a thin square around the pad and a short guide line.
  const r = DEFAULT_TX_PAD.outerRadius + 0.12;
  lines.push(box(2 * r, 0.004, 0.035, 0, 0.004, r), box(2 * r, 0.004, 0.035, 0, 0.004, -r), box(0.035, 0.004, 2 * r, r, 0.004, 0), box(0.035, 0.004, 2 * r, -r, 0.004, 0));
  lines.push(box(1.6, 0.004, 0.035, -1.6, 0.004, 0));
  return mergeGeometries(lines)!;
}

function devices() {
  // Identification camera on the aisle end of the canopy, positioning anchors on the columns, field probe beside the pad.
  const cam = mergeGeometries([box(0.2, 0.09, 0.1, ROOF.x0 + 0.25, roofY(ROOF.x0) - 0.32, 0.4), box(0.24, 0.02, 0.12, ROOF.x0 + 0.24, roofY(ROOF.x0) - 0.27, 0.4), box(0.03, 0.18, 0.03, ROOF.x0 + 0.3, roofY(ROOF.x0) - 0.2, 0.4)])!;
  const anchors = mergeGeometries(COLUMNS_Z.map((z) => box(0.06, 0.12, 0.08, COLUMN_X - 0.15, 2.4, z)))!;
  const probe = mergeGeometries([new CylinderGeometry(0.035, 0.04, 0.03, 20).translate(1.95, 0.015, 1.18).toNonIndexed(), new CylinderGeometry(0.008, 0.008, 0.32, 8).translate(1.95, 0.18, 1.18).toNonIndexed(), new SphereGeometry(0.03, 14, 10).translate(1.95, 0.35, 1.18).toNonIndexed()])!;
  // Cable trench cover from the cabinet to the pad's terminal box, and the grid feeder trench.
  const trench = mergeGeometries([box(2.35, 0.012, 0.22, 1.82, 0.006, 0.42, 0)])!;
  trench.rotateY(0);
  const feeder = box(7.6, 0.012, 0.3, 6.4, 0.006, 4.0);
  return { cam, anchors, probe, trench, feeder };
}

export function Site() {
  const turns = useTwin((s) => s.station.txTurns);
  const slabTex = useMemo(() => {
    const t = concreteTexture(true);
    t.repeat.set(5, 5);
    return t;
  }, []);
  const pvTex = useMemo(() => moduleTexture(), []);
  const g = useMemo(() => ({ ...structure(), marks: markings(), ...devices() }), []);
  const m = useMemo(
    () => ({
      slab: new MeshStandardMaterial({ map: slabTex, color: "#b9bdc1", roughness: 0.78, metalness: 0.02 }),
      line: new MeshStandardMaterial({ color: "#e6e9ec", roughness: 0.6, emissive: new Color("#9aa3ad"), emissiveIntensity: 0.08 }),
      steel: new MeshPhysicalMaterial({ color: "#3b4149", metalness: 0.75, roughness: 0.38, clearcoat: 0.3 }),
      light: new MeshStandardMaterial({ color: "#ffffff", emissive: new Color("#fff3e3"), emissiveIntensity: 2.6 }),
      pv: new MeshPhysicalMaterial({ map: pvTex, metalness: 0.15, roughness: 0.32, clearcoat: 0.35, clearcoatRoughness: 0.2, envMapIntensity: 0.55 }),
      device: new MeshStandardMaterial({ color: "#20252b", metalness: 0.5, roughness: 0.4 }),
      probe: new MeshStandardMaterial({ color: "#cfd4d9", metalness: 0.6, roughness: 0.35 }),
      trench: new MeshStandardMaterial({ color: "#7c8188", metalness: 0.8, roughness: 0.5 }),
      stop: new MeshStandardMaterial({ color: "#a7acb1", roughness: 0.9 }),
      indicator: new MeshStandardMaterial({ color: "#111", emissive: new Color("#3fb950"), emissiveIntensity: 2.2 }),
      neighbourIndicator: new MeshStandardMaterial({ color: "#111", emissive: new Color("#d9a441"), emissiveIntensity: 1.4 }),
      object: new MeshStandardMaterial({ color: "#d6dade", metalness: 0.55, roughness: 0.28 }),
      zone: new MeshBasicMaterial({ color: "#ffb84d", transparent: true, opacity: 0.12, depthWrite: false }),
    }),
    [slabTex, pvTex],
  );
  useDispose(useMemo(() => [slabTex, pvTex, ...Object.values(g), ...Object.values(m)].filter((x): x is BufferGeometry | Texture | MeshStandardMaterial => typeof (x as { dispose?: unknown }).dispose === "function"), [slabTex, pvTex, g, m]));

  const pv = useRef<InstancedMesh>(null);
  const roof = useRef<Group>(null);
  const site = useRef<Group>(null);
  const controls = useThree((st) => st.controls) as unknown as { target: { x: number; y: number; z: number } } | null;
  const neighbours = useRef<Group>(null);
  const object = useRef<Group>(null);
  const zone = useRef<Group>(null);
  const cols = 6;
  const rows = 6;
  useEffect(() => {
    const mesh = pv.current;
    if (!mesh) return;
    const mx = new Matrix4();
    const rot = new Matrix4().makeRotationZ(g.tilt);
    const w = (ROOF.x1 - ROOF.x0 - 0.12) / cols;
    const d = (ROOF.z1 - ROOF.z0 - 0.12) / rows;
    let i = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = ROOF.x0 + 0.06 + w * (c + 0.5);
        const z = ROOF.z0 + 0.06 + d * (r + 0.5);
        mx.makeTranslation(x, roofY(x) + 0.02, z).multiply(rot).multiply(new Matrix4().makeScale(w - 0.025, 1, d - 0.025));
        mesh.setMatrixAt(i++, mx);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [g.tilt]);

  useFrame(({ camera }, dt) => {
    const st = runtime.station.state;
    const s = useTwin.getState();
    const station = s.environment === "station";
    // On the electrified road the car is elsewhere: the site is not part of that scene.
    setVisible(site.current, s.environment !== "dynamic");
    // Inspection views set the neighbouring bays aside; the exterior, energy and IoT views keep them.
    setVisible(neighbours.current, !station || s.view === "cinematic" || s.view === "energy" || s.view === "iot");
    // The canopy fades whenever it stands between the camera and what it is looking at.
    const target = controls?.target ?? { x: 0, y: 0.5, z: 0 };
    // Close shots only: in wide establishing views the canopy is part of the picture.
    const near = Math.hypot(camera.position.x - target.x, camera.position.y - target.y, camera.position.z - target.z) < 10;
    const blocked = near && roofBlocks(camera.position, target);
    const want = blocked || view.studio > 0.5 ? 0 : 1;
    setOpacity(m.pv, m.pv.opacity + (want - m.pv.opacity) * Math.min(1, dt * 6), 0.6);
    setOpacity(m.steel, m.pv.opacity, 0.6);
    setOpacity(m.light, m.pv.opacity, 0.6);
    setVisible(pv.current, m.pv.opacity > 0.03);
    setVisible(roof.current, m.pv.opacity > 0.03);
    const info = PHASES[st.phase];
    setEmissive(m.indicator, info.kind === "fault" ? "#ff9f1a" : info.energised ? "#5ad1ff" : st.vehicle.present ? "#d9a441" : "#3fb950", 2.2);
    setOpacity(m.slab, Math.max(0.08, 1 - 0.6 * view.reveal * (station ? 1 : 0) - 0.9 * view.underbody), 0.9);
    setVisible(object.current, s.faults.foreignObject && st.vehicle.present);
    const hot = Math.min(1, Math.max(0, (st.temperatures.object - 40) / 80));
    setEmissive(m.object, "#ff6a1a", 2.5 * hot);
    setVisible(zone.current, PHASES[st.phase].id === "living-object" || s.faults.livingObject);
    if (s.view === "power") anchorCabinetLabels(CABINET);
  });

  return (
    <group ref={site}>
      {/* Polished concrete slab under the shelter. */}
      <mesh position={[-0.6, -0.01, -1.35]} receiveShadow material={m.slab}>
        <boxGeometry args={[11.2, 0.02, 13]} />
      </mesh>
      <mesh geometry={g.marks} material={m.line} receiveShadow />
      {[-3, -2, 1].map((k) => (
        <mesh key={k} material={m.stop} position={[2.05, 0.06, k * BAY_PITCH]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.11, 1.5]} />
        </mesh>
      ))}
      {/* Canopy: steel, PV modules, luminaires, and an occupancy indicator over each bay. */}
      <group ref={roof}>
        <mesh geometry={g.steel} material={m.steel} castShadow receiveShadow {...pick("solar")} />
        <mesh geometry={g.lights} material={m.light} />
        <mesh position={[1.1, roofY(1.1) - 0.22, 0]} material={m.indicator} {...pick("station-controller")}>
          <cylinderGeometry args={[0.06, 0.06, 0.05, 24]} />
        </mesh>
        {NEIGHBOURS.map((n) => (
          <mesh key={n.z} position={[1.1, roofY(1.1) - 0.22, n.z]} material={m.neighbourIndicator}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 24]} />
          </mesh>
        ))}
        <mesh geometry={g.cam} material={m.device} {...pick("id-camera")} />
        <mesh geometry={g.anchors} material={m.device} {...pick("alignment-sensor")} />
      </group>
      <instancedMesh ref={pv} args={[undefined, undefined, cols * rows]} material={m.pv} castShadow receiveShadow {...pick("solar")}>
        <boxGeometry args={[1, 0.04, 1]} />
      </instancedMesh>
      <mesh geometry={g.probe} material={m.probe} {...pick("field-sensor")} />
      <mesh geometry={g.trench} material={m.trench} receiveShadow {...pick("tx-base")} />
      <mesh geometry={g.feeder} material={m.trench} receiveShadow {...pick("grid")} />
      {/* Neighbouring bays: parked vehicles over their own pads. */}
      <group ref={neighbours}>
        {NEIGHBOURS.map((n) => (
          <group key={n.z}>
            <group position={[0, 0, n.z]}>
              <GroundPad turns={turns} inner={DEFAULT_TX_PAD.innerRadius} outer={DEFAULT_TX_PAD.outerRadius} />
            </group>
            <Vehicle pose={() => ({ x: -0.6, z: n.z, heading: 0, spin: 0 })} paint={n.paint} />
          </group>
        ))}
      </group>
      {/* The charging bay's ground pad. */}
      <GroundPad
        turns={turns}
        inner={DEFAULT_TX_PAD.innerRadius}
        outer={DEFAULT_TX_PAD.outerRadius}
        glow={() => Math.min(1, (runtime.station.state.point.ss ? Math.hypot(runtime.station.state.point.ss.i1.re, runtime.station.state.point.ss.i1.im) : 0) / 40)}
        heat={() => heatOf(runtime.station.state.temperatures.txCoil, 25, 110)}
      />
      {/* A steel can on the pad when foreign-object detection is tested; it glows as the field heats it. */}
      <group ref={object} position={[0.14, 0.098, -0.1]} rotation={[0, 0.6, Math.PI / 2]} visible={false}>
        <mesh material={m.object} castShadow {...pick("fod-sensor")}>
          <cylinderGeometry args={[0.033, 0.033, 0.12, 24]} />
        </mesh>
      </group>
      {/* The living-object protected zone, shown while a living object is detected. */}
      <group ref={zone} visible={false}>
        <mesh material={m.zone} position={[0, 0, 0]}>
          <sphereGeometry args={[1.25, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      </group>
      <group position={[CABINET.x, 0, CABINET.z]} rotation={[0, -Math.PI / 2, 0]}>
        <Cabinet heat={() => heatOf(runtime.station.state.temperatures.inverter, 25, 90)} />
      </group>
      <Transformer />
      <Storage />
      <Surroundings />
    </group>
  );
}

/** Pad-mounted distribution transformer with radiator fins and HV bushings. */
function Transformer() {
  const g = useMemo(() => {
    const parts: BufferGeometry[] = [box(1.9, 1.5, 1.4, 0, 0.85, 0), box(2.1, 0.1, 1.6, 0, 0.05, 0)];
    for (let i = 0; i < 9; i++) for (const s of [-1, 1]) parts.push(box(0.03, 1.1, 0.36, -0.8 + i * 0.2, 0.8, s * 0.88));
    return mergeGeometries(parts)!;
  }, []);
  const bushings = useMemo(() => mergeGeometries([-0.55, 0, 0.55].map((x) => new CylinderGeometry(0.05, 0.08, 0.36, 14).translate(x, 1.78, 0).toNonIndexed()))!, []);
  const m = useMemo(() => ({ body: new MeshStandardMaterial({ color: "#5c6b63", metalness: 0.45, roughness: 0.55 }), bush: new MeshStandardMaterial({ color: "#8a5a3c", roughness: 0.35 }) }), []);
  useDispose(useMemo(() => [g, bushings, m.body, m.bush], [g, bushings, m]));
  return (
    <group position={[9, 0, 7]} {...pick("transformer")}>
      <mesh geometry={g} material={m.body} castShadow receiveShadow />
      <mesh geometry={bushings} material={m.bush} castShadow />
    </group>
  );
}

/** Battery energy storage container: corrugated sides, door seams on every face, louvres and its HVAC unit. */
function Storage() {
  const g = useMemo(() => {
    const parts: BufferGeometry[] = [box(6, 2.6, 2.4, 0, 1.3, 0), box(6.1, 0.12, 2.5, 0, 2.62, 0)];
    // Corrugation on the long sides, door seams and hinges on both long faces, seams on the ends.
    for (const z of [1.2, -1.2]) {
      for (let i = 0; i < 40; i++) parts.push(box(0.05, 2.3, 0.025, -2.92 + i * 0.15, 1.3, z + Math.sign(z) * 0.012));
      for (let i = 0; i < 4; i++) parts.push(box(0.025, 2.32, 0.05, -1.8 + i * 1.2, 1.3, z + Math.sign(z) * 0.03));
    }
    for (const x of [3.0, -3.0]) {
      parts.push(box(0.05, 2.32, 0.025, x + Math.sign(x) * 0.02, 1.3, 0), box(0.04, 0.04, 2.3, x + Math.sign(x) * 0.02, 0.2, 0));
      for (let i = 0; i < 8; i++) parts.push(box(0.04, 0.025, 0.9, x + Math.sign(x) * 0.025, 1.7 + i * 0.07, -0.6));
    }
    parts.push(box(1.0, 0.7, 0.35, 2.2, 1.9, 1.38));
    for (let i = 0; i < 8; i++) parts.push(box(0.9, 0.02, 0.04, 2.2, 1.6 + i * 0.075, 1.56));
    return mergeGeometries(parts)!;
  }, []);
  const m = useMemo(() => ({ body: new MeshStandardMaterial({ color: "#7d8784", metalness: 0.45, roughness: 0.55 }), led: new MeshStandardMaterial({ color: "#0c2a10", emissive: new Color("#4ca930"), emissiveIntensity: 2 }) }), []);
  useDispose(useMemo(() => [g, m.body, m.led], [g, m]));
  return (
    <group position={[-9, 0, 9]} {...pick("bess")}>
      <mesh geometry={g} material={m.body} castShadow receiveShadow />
      <mesh material={m.led} position={[-2.2, 2.2, 1.25]}>
        <boxGeometry args={[0.5, 0.04, 0.01]} />
      </mesh>
    </group>
  );
}
