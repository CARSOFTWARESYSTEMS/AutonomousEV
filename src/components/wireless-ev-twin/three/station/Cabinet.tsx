"use client";
// The station's power cabinet. Its door opens in the Power Electronics view
// to show what the chain model accounts for: AC protection, the PFC stage,
// the DC-link bank and laminated busbar, two SiC half-bridge modules on a
// liquid cold plate with their gate drivers, the primary resonant capacitor
// bank, the station and safety controllers, the IoT gateway and the cooling
// unit. Representative engineering layout, not a product's.
//
// Local frame: the door faces +z, width along x, y up from the slab.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, type BufferGeometry, type Color, CylinderGeometry, type Group, MeshPhysicalMaterial, MeshStandardMaterial, TorusGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { PHASES } from "@/lib/wireless-charging/stateMachine";
import { runtime } from "../../state/runtime";
import { setAnchor } from "../labels";
import { setEmissive, setOpacity } from "../mutate";
import { pick } from "../pick";
import { view } from "../viewState";

const W = 0.72;
const D = 0.46;
const H0 = 0.12;
const H1 = 1.74;

const box = (w: number, h: number, d: number, x: number, y: number, z: number) => {
  const g = new BoxGeometry(w, h, d).toNonIndexed();
  g.translate(x, y, z);
  return g;
};
const cylZ = (r: number, len: number, x: number, y: number, z: number, seg = 18) => {
  const g = new CylinderGeometry(r, r, len, seg).toNonIndexed();
  g.rotateX(Math.PI / 2);
  g.translate(x, y, z);
  return g;
};
const merge = (gs: BufferGeometry[]) => mergeGeometries(gs)!;

function buildCabinet() {
  const shell = merge([box(W, H1 - H0, 0.02, 0, (H0 + H1) / 2, -D / 2 + 0.01), box(0.02, H1 - H0, D, -W / 2 + 0.01, (H0 + H1) / 2, 0), box(0.02, H1 - H0, D, W / 2 - 0.01, (H0 + H1) / 2, 0), box(W, 0.02, D, 0, H0 + 0.01, 0)]);
  const cap = new BoxGeometry(W + 0.04, 0.05, D + 0.04);
  cap.translate(0, H1 + 0.02, 0);
  const plinth = box(W + 0.16, H0, D + 0.16, 0, H0 / 2, 0);
  const plate = box(W - 0.06, H1 - H0 - 0.1, 0.012, 0, (H0 + H1) / 2, -D / 2 + 0.028);
  const zf = -D / 2 + 0.034;
  // AC input protection: DIN rail with breakers, RCD and surge arrester, and a contactor.
  const prot: BufferGeometry[] = [box(0.6, 0.012, 0.012, 0, 1.56, zf + 0.006)];
  for (let i = 0; i < 7; i++) prot.push(box(0.036, 0.09, 0.07, -0.2 + i * 0.06, 1.56, zf + 0.04), box(0.012, 0.018, 0.012, -0.2 + i * 0.06, 1.585, zf + 0.08));
  prot.push(box(0.09, 0.1, 0.09, 0.22, 1.42, zf + 0.045));
  // PFC: board with two toroidal boost inductors and bulk capacitors.
  const pfcBoard = box(0.5, 0.24, 0.004, 0, 1.22, zf + 0.004);
  const pfcParts: BufferGeometry[] = [];
  for (const x of [-0.15, 0.0]) {
    const t = new TorusGeometry(0.038, 0.017, 10, 24).toNonIndexed();
    t.translate(x, 1.24, zf + 0.025);
    pfcParts.push(t);
  }
  for (let i = 0; i < 4; i++) pfcParts.push(cylZ(0.021, 0.06, 0.1 + (i % 2) * 0.05, 1.18 + Math.floor(i / 2) * 0.07, zf + 0.034));
  // DC link: capacitor bank and the laminated busbar in front of it.
  const dcCaps: BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) dcCaps.push(cylZ(0.028, 0.1, -0.2 + i * 0.08, 0.99, zf + 0.054, 24));
  const busbar = merge([box(0.5, 0.05, 0.006, 0, 0.99, zf + 0.108), box(0.05, 0.16, 0.006, -0.12, 0.89, zf + 0.108), box(0.05, 0.16, 0.006, 0.12, 0.89, zf + 0.108)]);
  // Inverter: SiC half-bridge modules with screw terminals on a liquid cold plate.
  const coldPlate = merge([box(0.44, 0.22, 0.03, 0, 0.76, zf + 0.015), cylZ(0.01, 0.06, -0.24, 0.7, zf + 0.02), cylZ(0.01, 0.06, 0.24, 0.7, zf + 0.02)]);
  const modules: BufferGeometry[] = [];
  const terminals: BufferGeometry[] = [];
  for (const x of [-0.11, 0.11]) {
    modules.push(box(0.15, 0.08, 0.026, x, 0.76, zf + 0.043));
    for (const dx of [-0.045, 0, 0.045]) terminals.push(cylZ(0.008, 0.014, x + dx, 0.78, zf + 0.062, 8));
  }
  const drivers: BufferGeometry[] = [];
  for (const x of [-0.11, 0.11]) {
    drivers.push(box(0.13, 0.06, 0.003, x, 0.755, zf + 0.078));
    for (let i = 0; i < 5; i++) drivers.push(box(0.012, 0.01, 0.005, x - 0.04 + i * 0.02, 0.74, zf + 0.082));
  }
  // Primary resonant capacitor bank (C1): film capacitors on a copper bus.
  const caps: BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) caps.push(box(0.065, 0.05, 0.07, -0.16 + (i % 3) * 0.16, 0.55 + Math.floor(i / 3) * 0.065, zf + 0.04));
  const capBus = box(0.44, 0.014, 0.006, 0, 0.6, zf + 0.078);
  // Controllers and gateway.
  const ctrl = merge([box(0.2, 0.14, 0.004, -0.17, 0.37, zf + 0.004), box(0.03, 0.03, 0.006, -0.17, 0.37, zf + 0.01), box(0.05, 0.02, 0.01, -0.22, 0.42, zf + 0.012)]);
  const safety = merge([box(0.12, 0.14, 0.004, 0.06, 0.37, zf + 0.004), box(0.025, 0.025, 0.006, 0.06, 0.37, zf + 0.01)]);
  const gateway = merge([box(0.09, 0.11, 0.05, 0.24, 0.37, zf + 0.03), new CylinderGeometry(0.005, 0.005, 1.3, 6).translate(0.29, 1.08, zf + 0.04).toNonIndexed()]);
  // Cooling unit: radiator core and fan.
  const cool = merge([box(0.5, 0.12, 0.08, 0, 0.21, zf + 0.06), new TorusGeometry(0.05, 0.008, 8, 24).translate(0.1, 0.21, zf + 0.104).toNonIndexed(), cylZ(0.012, 0.12, -0.2, 0.47, zf + 0.06)]);
  // Door: frame, dark glass upper panel, louvres below, status bar.
  const door = merge([box(W, H1 - H0, 0.022, W / 2, (H0 + H1) / 2, 0)]);
  const louvres: BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) louvres.push(box(W - 0.12, 0.012, 0.016, W / 2, 0.24 + i * 0.045, 0.016));
  const glass = box(W - 0.1, 0.62, 0.006, W / 2, 1.3, 0.013);
  const status = box(W - 0.2, 0.012, 0.004, W / 2, 1.66, 0.016);
  const display = box(0.22, 0.12, 0.004, W / 2, 1.36, 0.017);
  // Living-object radar on the plinth, facing the bay.
  const radar = box(0.1, 0.06, 0.03, 0, 0.18, D / 2 + 0.095);
  const cable = cylZ(0.02, 0.2, 0, 0.06, -D / 2 - 0.02);
  return { shell, cap, plinth, plate, prot: merge(prot), pfcBoard, pfcParts: merge(pfcParts), dcCaps: merge(dcCaps), busbar, coldPlate, modules: merge(modules), terminals: merge(terminals), drivers: merge(drivers), caps: merge(caps), capBus, ctrl, safety, gateway, cool, door, louvres: merge(louvres), glass, status, display, radar, cable };
}

const STATUS = { available: "#3fb950", charging: "#5ad1ff", idle: "#d8dde3", fault: "#ff9f1a" };

/** Label anchors beside each unit, in the cabinet's local frame (y, and x along its width). */
const UNITS: [string, number][] = [
  ["cab-prot", 1.56],
  ["cab-pfc", 1.22],
  ["cab-dc", 0.99],
  ["cab-inv", 0.76],
  ["cab-c1", 0.58],
  ["cab-ctrl", 0.37],
];

/** Places the unit labels; the cabinet stands at `at`, rotated −90° about the vertical (door toward −x). */
export function anchorCabinetLabels(at: { x: number; z: number }) {
  for (const [id, y] of UNITS) setAnchor(id, at.x - 0.05, y + 0.03, at.z + W / 2 + 0.06);
}

export function Cabinet({ heat }: { heat?: () => Color | null }) {
  const g = useMemo(() => buildCabinet(), []);
  const m = useMemo(
    () => ({
      shell: new MeshPhysicalMaterial({ color: "#cfd3d7", metalness: 0.35, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
      top: new MeshStandardMaterial({ color: "#2a2e34", metalness: 0.5, roughness: 0.35 }),
      plinth: new MeshStandardMaterial({ color: "#8f959b", roughness: 0.9 }),
      plate: new MeshStandardMaterial({ color: "#5d636b", metalness: 0.6, roughness: 0.5 }),
      device: new MeshStandardMaterial({ color: "#e2e4e6", roughness: 0.55 }),
      pcb: new MeshStandardMaterial({ color: "#0f3d2a", roughness: 0.6, metalness: 0.15 }),
      ferrite: new MeshStandardMaterial({ color: "#3a3b3f", roughness: 0.5, metalness: 0.2 }),
      cap: new MeshStandardMaterial({ color: "#2f4f7a", roughness: 0.45, metalness: 0.3 }),
      film: new MeshStandardMaterial({ color: "#c9ced6", roughness: 0.5, metalness: 0.1 }),
      copper: new MeshStandardMaterial({ color: "#c27a4a", metalness: 1, roughness: 0.28 }),
      cold: new MeshStandardMaterial({ color: "#b4b9c0", metalness: 0.9, roughness: 0.35 }),
      module: new MeshStandardMaterial({ color: "#2b2d31", roughness: 0.5, metalness: 0.1 }),
      gateway: new MeshStandardMaterial({ color: "#1f2833", roughness: 0.5, metalness: 0.4 }),
      door: new MeshPhysicalMaterial({ color: "#c9cdd2", metalness: 0.35, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.25 }),
      glass: new MeshPhysicalMaterial({ color: "#0b1016", metalness: 0.2, roughness: 0.05, clearcoat: 1 }),
      status: new MeshStandardMaterial({ color: "#111", emissive: STATUS.available, emissiveIntensity: 2 }),
      display: new MeshStandardMaterial({ color: "#05101a", emissive: "#0d2a40", emissiveIntensity: 1.2 }),
      radar: new MeshStandardMaterial({ color: "#16181c", roughness: 0.4 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(g).forEach((x) => x.dispose());
      Object.values(m).forEach((x) => x.dispose());
    },
    [g, m],
  );
  const door = useRef<Group>(null);
  useFrame(() => {
    const st = runtime.station.state;
    const info = PHASES[st.phase];
    setEmissive(m.status, info.kind === "fault" ? STATUS.fault : info.energised ? STATUS.charging : st.vehicle.present ? STATUS.idle : STATUS.available, 2);
    if (door.current) door.current.rotation.y = -1.9 * view.power;
    const h = heat?.() ?? null;
    setEmissive(m.cold, h ?? "#000000", h ? 0.9 : 0);
    setEmissive(m.module, h ?? "#000000", h ? 0.6 : 0);
    // The shell turns translucent in the X-ray and cutaway views, so the internals show from any side.
    setOpacity(m.shell, 1 - 0.75 * Math.max(view.xray * (1 - view.power), view.reveal * (1 - view.power)), 0.6);
  });
  return (
    <group>
      <mesh geometry={g.plinth} material={m.plinth} receiveShadow castShadow />
      <mesh geometry={g.shell} material={m.shell} castShadow receiveShadow {...pick("power-cabinet")} />
      <mesh geometry={g.cap} material={m.top} castShadow {...pick("power-cabinet")} />
      <mesh geometry={g.plate} material={m.plate} />
      <mesh geometry={g.prot} material={m.device} {...pick("protection")} />
      <mesh geometry={g.pfcBoard} material={m.pcb} {...pick("pfc")} />
      <mesh geometry={g.pfcParts} material={m.ferrite} {...pick("pfc")} />
      <mesh geometry={g.dcCaps} material={m.cap} {...pick("dc-link")} />
      <mesh geometry={g.busbar} material={m.copper} {...pick("dc-link")} />
      <mesh geometry={g.coldPlate} material={m.cold} {...pick("cooling")} />
      <mesh geometry={g.modules} material={m.module} {...pick("inverter")} />
      <mesh geometry={g.terminals} material={m.copper} {...pick("inverter")} />
      <mesh geometry={g.drivers} material={m.pcb} {...pick("gate-driver")} />
      <mesh geometry={g.caps} material={m.film} {...pick("tx-compensation")} />
      <mesh geometry={g.capBus} material={m.copper} {...pick("tx-compensation")} />
      <mesh geometry={g.ctrl} material={m.pcb} {...pick("station-controller")} />
      <mesh geometry={g.safety} material={m.pcb} {...pick("safety-controller")} />
      <mesh geometry={g.gateway} material={m.gateway} {...pick("iot-gateway")} />
      <mesh geometry={g.cool} material={m.plate} {...pick("cooling")} />
      <mesh geometry={g.radar} material={m.radar} {...pick("lod-sensor")} />
      <mesh geometry={g.cable} material={m.cap} />
      {/* The door, hinged on its left edge. */}
      <group ref={door} position={[-W / 2, 0, D / 2]}>
        <mesh geometry={g.door} material={m.door} castShadow {...pick("power-cabinet")} />
        <mesh geometry={g.louvres} material={m.module} />
        <mesh geometry={g.glass} material={m.glass} />
        <mesh geometry={g.status} material={m.status} />
        <mesh geometry={g.display} material={m.display} />
      </group>
    </group>
  );
}
