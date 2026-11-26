// Chassis, underbody and powertrain of the vehicle: battery enclosure with
// modules, busbars, cooling plate, BMS and junction box; subframes,
// suspension and steering; the rear drive unit and half-shafts; the front
// power-electronics unit that receives wireless power; radiator; HV cabling.
// Representative engineering geometry, merged per part and material.
import { BoxGeometry, type BufferGeometry, CatmullRomCurve3, CylinderGeometry, ExtrudeGeometry, Quaternion, Shape, TubeGeometry, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { FLOOR_Y, WHEEL_RADIUS, WHEEL_X } from "./body";

export type ChassisMaterial = "lid" | "aluminium" | "castAluminium" | "steel" | "darkSteel" | "rubber" | "module" | "copper" | "pcb" | "hvCable" | "coolant" | "radiator";
/** Which layer a part belongs to, for the X-ray, chassis, battery and receiver views. */
export type ChassisLayer = "chassis" | "battery" | "power";

export interface ChassisPart {
  key: string;
  /** Registry component id, or undefined for structure that is not a modelled component. */
  component?: string;
  layer: ChassisLayer;
  material: ChassisMaterial;
  geometry: BufferGeometry;
  /** Offset in the exploded vehicle assembly, m. */
  explode: [number, number, number];
}

const BATTERY = { x0: -1.12, x1: 1.08, half: 0.74, y0: FLOOR_Y, h: 0.118 };
export const BATTERY_TOP = BATTERY.y0 + BATTERY.h;
/** Receiver electronics and the HV junction box, in the vehicle frame (used by the energy-flow overlay). */
export const POWER_POINTS = {
  receiver: [0.6, FLOOR_Y - 0.02, 0] as [number, number, number],
  compensation: [1.02, FLOOR_Y - 0.03, 0.02] as [number, number, number],
  rectifier: [1.56, 0.5, 0.22] as [number, number, number],
  dcdc: [1.56, 0.5, -0.2] as [number, number, number],
  junction: [0.98, BATTERY_TOP + 0.045, -0.32] as [number, number, number],
  battery: [-0.02, BATTERY_TOP - 0.03, 0] as [number, number, number],
  bms: [0.98, BATTERY_TOP + 0.02, 0.36] as [number, number, number],
  vcu: [1.02, 0.84, 0.1] as [number, number, number],
  motor: [-1.3, 0.42, -0.06] as [number, number, number],
};

const box = (w: number, h: number, d: number, x: number, y: number, z: number) => {
  const g = new BoxGeometry(w, h, d).toNonIndexed();
  g.translate(x, y, z);
  return g;
};

/** A cylinder between two points. */
function rod(a: [number, number, number], b: [number, number, number], r: number, seg = 10): BufferGeometry {
  const va = new Vector3(...a);
  const vb = new Vector3(...b);
  const len = va.distanceTo(vb);
  const g = new CylinderGeometry(r, r, len, seg).toNonIndexed();
  // Rotate the cylinder's +y axis onto the segment direction.
  g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), vb.clone().sub(va).normalize()));
  g.translate((va.x + vb.x) / 2, (va.y + vb.y) / 2, (va.z + vb.z) / 2);
  return g;
}

const cyl = (r: number, h: number, x: number, y: number, z: number, axis: "x" | "y" | "z" = "y", seg = 20) => {
  const g = new CylinderGeometry(r, r, h, seg).toNonIndexed();
  if (axis === "z") g.rotateX(Math.PI / 2);
  if (axis === "x") g.rotateZ(Math.PI / 2);
  g.translate(x, y, z);
  return g;
};

/** A coil spring between two heights, as a helix tube. */
function spring(x: number, z: number, y0: number, y1: number, r: number, turns: number, wire: number): BufferGeometry {
  const pts: Vector3[] = [];
  const n = turns * 24;
  for (let i = 0; i <= n; i++) {
    const a = (i / 24) * Math.PI * 2;
    pts.push(new Vector3(x + Math.cos(a) * r, y0 + ((y1 - y0) * i) / n, z + Math.sin(a) * r));
  }
  return new TubeGeometry(new CatmullRomCurve3(pts), n, wire, 6, false).toNonIndexed();
}

function cable(points: [number, number, number][], r = 0.013): BufferGeometry {
  return new TubeGeometry(new CatmullRomCurve3(points.map((p) => new Vector3(...p)), false, "catmullrom", 0.3), 64, r, 8, false).toNonIndexed();
}

/** Rounded-rectangle plate in the x–z plane, `t` thick, top at y. */
function plate(x0: number, x1: number, half: number, y: number, t: number, radius: number): BufferGeometry {
  const s = new Shape();
  const w = x1 - x0;
  const r = Math.min(radius, w / 2, half);
  s.moveTo(x0 + r, -half);
  s.lineTo(x1 - r, -half);
  s.quadraticCurveTo(x1, -half, x1, -half + r);
  s.lineTo(x1, half - r);
  s.quadraticCurveTo(x1, half, x1 - r, half);
  s.lineTo(x0 + r, half);
  s.quadraticCurveTo(x0, half, x0, half - r);
  s.lineTo(x0, -half + r);
  s.quadraticCurveTo(x0, -half, x0 + r, -half);
  const g = new ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 6 });
  // Shape is drawn in x–y; lay it flat (y → z) with thickness downward from y.
  g.rotateX(Math.PI / 2);
  g.translate(0, y, 0);
  return g.toNonIndexed();
}

const merge = (gs: BufferGeometry[]) => mergeGeometries(gs.map((g) => (g.index ? g.toNonIndexed() : g)))!;

/** Every chassis part of the detailed vehicle. */
export function buildChassis(): ChassisPart[] {
  const parts: ChassisPart[] = [];
  const add = (p: ChassisPart) => parts.push(p);
  const B = BATTERY;

  // ── Battery enclosure (its floor is the car's underbody) ──
  const walls: BufferGeometry[] = [plate(B.x0, B.x1, B.half, B.y0 + 0.008, 0.008, 0.1)];
  for (const z of [-B.half + 0.006, B.half - 0.006]) walls.push(box(B.x1 - B.x0 - 0.12, B.h - 0.012, 0.012, (B.x0 + B.x1) / 2, B.y0 + B.h / 2 + 0.002, z));
  for (const x of [B.x0 + 0.006, B.x1 - 0.006]) walls.push(box(0.012, B.h - 0.012, 2 * B.half - 0.12, x, B.y0 + B.h / 2 + 0.002, 0));
  // Stiffening ribs under the floor (crash and stone protection).
  for (let i = 0; i < 7; i++) walls.push(box(0.03, 0.006, 2 * B.half - 0.2, B.x0 + 0.22 + i * 0.31, B.y0 - 0.002, 0));
  // Side sills (the enclosure's crash frame).
  for (const z of [-1, 1]) walls.push(box(B.x1 - B.x0, 0.05, 0.05, (B.x0 + B.x1) / 2, B.y0 + B.h - 0.03, z * (B.half + 0.02)));
  add({ key: "tray", component: "battery-pack", layer: "battery", material: "aluminium", geometry: merge(walls), explode: [0, 0.3, 0] });
  add({ key: "lid", component: "battery-pack", layer: "battery", material: "lid", geometry: plate(B.x0 + 0.01, B.x1 - 0.01, B.half - 0.01, B.y0 + B.h, 0.004, 0.09), explode: [0, 0.82, 0] });

  // Cooling plate with its serpentine channel and manifold.
  const coolPlate: BufferGeometry[] = [plate(B.x0 + 0.06, B.x1 - 0.06, B.half - 0.06, B.y0 + 0.02, 0.008, 0.04)];
  for (let i = 0; i < 6; i++) coolPlate.push(box(1.98, 0.004, 0.018, (B.x0 + B.x1) / 2, B.y0 + 0.022, -0.55 + i * 0.22));
  add({ key: "cooling-plate", component: "cooling", layer: "battery", material: "aluminium", geometry: merge(coolPlate), explode: [0, 0.38, 0] });
  add({ key: "coolant", component: "cooling", layer: "battery", material: "coolant", geometry: merge([cyl(0.014, 1.3, B.x1 - 0.035, B.y0 + 0.04, 0, "z", 12), cable([[B.x1 - 0.035, B.y0 + 0.04, 0.62], [B.x1 + 0.2, 0.35, 0.6], [1.8, 0.42, 0.55], [2.1, 0.42, 0.45]], 0.013)]), explode: [0, 0.38, 0] });

  // Twelve modules in two rows, each a stack of prismatic cells.
  const modules: BufferGeometry[] = [];
  const terminals: BufferGeometry[] = [];
  const xs = [-0.9, -0.55, -0.2, 0.15, 0.5, 0.85];
  for (const x of xs) {
    for (const z of [-0.34, 0.34]) {
      modules.push(box(0.32, 0.075, 0.6, x, B.y0 + 0.068, z));
      // Cell divisions on the module's top cover.
      for (let c = 1; c < 8; c++) modules.push(box(0.003, 0.004, 0.58, x - 0.16 + c * 0.04, B.y0 + 0.107, z));
      terminals.push(box(0.05, 0.012, 0.03, x - 0.11, B.y0 + 0.112, z + (z > 0 ? -0.26 : 0.26)), box(0.05, 0.012, 0.03, x + 0.11, B.y0 + 0.112, z + (z > 0 ? -0.26 : 0.26)));
    }
  }
  add({ key: "modules", component: "battery-pack", layer: "battery", material: "module", geometry: merge(modules), explode: [0, 0.52, 0] });
  // Busbars: series links along each row and the cross-link at the rear.
  const bars: BufferGeometry[] = [...terminals];
  for (const z of [-0.08, 0.08]) for (let i = 0; i < xs.length - 1; i++) bars.push(box(0.26, 0.006, 0.026, (xs[i] + xs[i + 1]) / 2, B.y0 + 0.118, z));
  bars.push(box(0.03, 0.006, 0.2, xs[0] - 0.11, B.y0 + 0.118, 0));
  add({ key: "busbars", component: "battery-pack", layer: "battery", material: "copper", geometry: merge(bars), explode: [0, 0.6, 0] });
  add({ key: "bms", component: "bms", layer: "battery", material: "pcb", geometry: merge([box(0.16, 0.012, 0.22, ...POWER_POINTS.bms), box(0.03, 0.02, 0.04, POWER_POINTS.bms[0] - 0.04, POWER_POINTS.bms[1] + 0.012, POWER_POINTS.bms[2] - 0.05)]), explode: [0, 0.62, 0] });
  add({ key: "junction", component: "hv-junction", layer: "battery", material: "castAluminium", geometry: merge([box(0.2, 0.08, 0.24, ...POWER_POINTS.junction), cyl(0.022, 0.05, POWER_POINTS.junction[0] + 0.11, POWER_POINTS.junction[1], POWER_POINTS.junction[2] - 0.06, "x", 12), cyl(0.022, 0.05, POWER_POINTS.junction[0] + 0.11, POWER_POINTS.junction[1], POWER_POINTS.junction[2] + 0.06, "x", 12)]), explode: [0, 0.64, 0] });

  // ── Front: subframe, MacPherson struts, steering rack ──
  const sub: BufferGeometry[] = [];
  for (const z of [-0.46, 0.46]) sub.push(rod([1.18, 0.3, z], [1.82, 0.31, z * 0.92], 0.028));
  sub.push(rod([1.2, 0.3, -0.46], [1.2, 0.3, 0.46], 0.028), rod([1.78, 0.31, -0.42], [1.78, 0.31, 0.42], 0.028));
  // Rear subframe.
  for (const z of [-0.5, 0.5]) sub.push(rod([-1.12, 0.3, z], [-1.8, 0.31, z * 0.9], 0.028));
  sub.push(rod([-1.16, 0.3, -0.5], [-1.16, 0.3, 0.5], 0.028), rod([-1.76, 0.31, -0.45], [-1.76, 0.31, 0.45], 0.028));
  add({ key: "subframes", layer: "chassis", material: "darkSteel", geometry: merge(sub), explode: [0, 0.14, 0] });

  const arms: BufferGeometry[] = [];
  const springs: BufferGeometry[] = [];
  const dampers: BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    const hub = side * 0.64;
    // Front lower control arm (A-arm) to the ball joint, and the knuckle.
    arms.push(rod([1.24, 0.29, side * 0.46], [WHEEL_X, 0.21, side * 0.68], 0.018), rod([1.66, 0.3, side * 0.43], [WHEEL_X, 0.21, side * 0.68], 0.018));
    arms.push(box(0.07, 0.24, 0.05, WHEEL_X, WHEEL_RADIUS, hub));
    // Strut: damper body from the knuckle to the top mount, spring around it.
    dampers.push(rod([WHEEL_X - 0.02, 0.42, side * 0.62], [WHEEL_X - 0.05, 0.86, side * 0.57], 0.026), cyl(0.07, 0.015, WHEEL_X - 0.05, 0.87, side * 0.57, "y", 20));
    springs.push(spring(WHEEL_X - 0.035, side * 0.595, 0.54, 0.83, 0.066, 6, 0.009));
    // Rear multi-link: three links to the hub carrier, coil spring and damper.
    arms.push(rod([-1.22, 0.3, side * 0.5], [-WHEEL_X, 0.24, side * 0.66], 0.016), rod([-1.72, 0.31, side * 0.45], [-WHEEL_X, 0.25, side * 0.66], 0.016), rod([-1.6, 0.44, side * 0.42], [-WHEEL_X, 0.47, side * 0.64], 0.014));
    arms.push(box(0.08, 0.26, 0.05, -WHEEL_X, WHEEL_RADIUS, hub));
    springs.push(spring(-1.62, side * 0.56, 0.3, 0.6, 0.07, 6, 0.0095));
    dampers.push(rod([-1.28, 0.3, side * 0.6], [-1.24, 0.72, side * 0.58], 0.022));
  }
  arms.push(cyl(0.02, 0.92, 1.66, 0.36, 0, "z", 12), cyl(0.032, 0.32, 1.66, 0.36, 0, "z", 14));
  for (const side of [-1, 1]) arms.push(rod([1.66, 0.36, side * 0.46], [1.62, 0.37, side * 0.62], 0.01));
  add({ key: "suspension", layer: "chassis", material: "darkSteel", geometry: merge(arms), explode: [0, 0.14, 0] });
  add({ key: "springs", layer: "chassis", material: "steel", geometry: merge(springs), explode: [0, 0.14, 0] });
  add({ key: "dampers", layer: "chassis", material: "castAluminium", geometry: merge(dampers), explode: [0, 0.14, 0] });

  // ── Rear drive unit: permanent-magnet motor, reduction gear and inverter ──
  const M = POWER_POINTS.motor;
  const drive: BufferGeometry[] = [cyl(0.128, 0.34, M[0], M[1], M[2], "z", 36)];
  for (let i = 0; i < 9; i++) drive.push(cyl(0.136, 0.008, M[0], M[1], M[2] - 0.14 + i * 0.035, "z", 36));
  drive.push(box(0.3, 0.27, 0.2, -WHEEL_X, WHEEL_RADIUS + 0.02, 0.15), box(0.34, 0.1, 0.3, M[0] - 0.02, M[1] + 0.18, M[2] - 0.02));
  add({ key: "drive", component: "traction", layer: "power", material: "castAluminium", geometry: merge(drive), explode: [-0.32, 0.42, 0] });
  const shafts: BufferGeometry[] = [];
  const boots: BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    shafts.push(rod([-WHEEL_X, WHEEL_RADIUS, side * 0.24], [-WHEEL_X, WHEEL_RADIUS, side * 0.6], 0.02));
    boots.push(cyl(0.04, 0.07, -WHEEL_X, WHEEL_RADIUS, side * 0.28, "z", 14), cyl(0.04, 0.07, -WHEEL_X, WHEEL_RADIUS, side * 0.57, "z", 14));
  }
  add({ key: "shafts", component: "traction", layer: "power", material: "steel", geometry: merge(shafts), explode: [-0.32, 0.42, 0] });
  add({ key: "boots", component: "traction", layer: "power", material: "rubber", geometry: merge(boots), explode: [-0.32, 0.42, 0] });

  // ── Front power-electronics unit: rectifier and DC–DC converter on the subframe ──
  const R = POWER_POINTS.rectifier;
  const rect: BufferGeometry[] = [box(0.26, 0.09, 0.22, R[0], R[1], R[2])];
  for (let i = 0; i < 9; i++) rect.push(box(0.24, 0.04, 0.006, R[0], R[1] + 0.065, R[2] - 0.1 + i * 0.025));
  add({ key: "rectifier", component: "rectifier", layer: "power", material: "castAluminium", geometry: merge(rect), explode: [0.25, 0.55, 0] });
  const D = POWER_POINTS.dcdc;
  add({ key: "dcdc", component: "dcdc", layer: "power", material: "castAluminium", geometry: merge([box(0.28, 0.13, 0.3, D[0], D[1], D[2]), box(0.18, 0.02, 0.2, D[0], D[1] + 0.075, D[2])]), explode: [0.25, 0.55, 0] });
  const C = POWER_POINTS.compensation;
  const comp: BufferGeometry[] = [box(0.16, 0.05, 0.3, C[0], C[1], C[2])];
  for (let i = 0; i < 4; i++) comp.push(box(0.03, 0.012, 0.05, C[0] - 0.045 + i * 0.03, C[1] - 0.031, C[2] + 0.08));
  add({ key: "rx-comp", component: "rx-compensation", layer: "power", material: "module", geometry: merge(comp), explode: [0.2, 0.12, 0] });
  add({ key: "vcu", component: "vcu", layer: "power", material: "castAluminium", geometry: box(0.16, 0.04, 0.12, ...POWER_POINTS.vcu), explode: [0, 1.0, 0] });
  // Radiator behind the lower front opening.
  const rad: BufferGeometry[] = [box(0.035, 0.3, 1.08, 2.08, 0.44, 0)];
  for (let i = 0; i < 14; i++) rad.push(box(0.04, 0.004, 1.06, 2.08, 0.3 + i * 0.021, 0));
  add({ key: "radiator", component: "cooling", layer: "chassis", material: "radiator", geometry: merge(rad), explode: [0.45, 0.3, 0] });

  // ── High-voltage cables (orange) ──
  const P = POWER_POINTS;
  const hv = merge([
    cable([[P.receiver[0] + 0.26, FLOOR_Y - 0.035, 0.12], [0.94, FLOOR_Y - 0.04, 0.1], [C[0] - 0.08, C[1], C[2] + 0.08]]),
    cable([[C[0] + 0.08, C[1], C[2] + 0.06], [1.24, 0.27, 0.16], [1.4, 0.42, 0.22], [R[0] - 0.13, R[1], R[2]]]),
    cable([[R[0] - 0.1, R[1] - 0.02, R[2] - 0.08], [1.45, 0.46, 0.02], [D[0] - 0.14, D[1], D[2] + 0.06]]),
    cable([[D[0] - 0.14, D[1] - 0.03, D[2] - 0.08], [1.3, 0.42, -0.32], [1.12, 0.37, -0.34], [P.junction[0] + 0.1, P.junction[1], P.junction[2] - 0.06]]),
    cable([[P.junction[0] - 0.1, P.junction[1], P.junction[2]], [0.2, BATTERY_TOP + 0.03, -0.62], [-1.0, BATTERY_TOP + 0.03, -0.64], [-1.2, 0.5, -0.3], [M[0] + 0.05, M[1] + 0.2, M[2] - 0.1]]),
  ]);
  add({ key: "hv-cables", component: "hv-junction", layer: "power", material: "hvCable", geometry: hv, explode: [0, 0.35, 0] });
  return parts;
}
