// Wheel assembly geometry: a 245/45 R19 tyre with tread grooves, an aero
// twin-spoke rim, a ventilated brake disc and a caliper. Axle along z, outer
// face toward +z. Representative geometry, no brand or lettering.
import { BufferGeometry, CanvasTexture, CylinderGeometry, ExtrudeGeometry, LatheGeometry, Path, RepeatWrapping, Shape, TorusGeometry, Vector2 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { WHEEL_RADIUS } from "./body";

const TYRE_PROFILE: [number, number][] = [
  [0.244, -0.098],
  [0.268, -0.111],
  [0.305, -0.12],
  [0.332, -0.118],
  [0.346, -0.106],
  [WHEEL_RADIUS - 0.001, -0.088],
  [WHEEL_RADIUS, -0.05],
  [WHEEL_RADIUS, 0.05],
  [WHEEL_RADIUS - 0.001, 0.088],
  [0.346, 0.106],
  [0.332, 0.118],
  [0.305, 0.12],
  [0.268, 0.111],
  [0.244, 0.098],
];
/** Profile indices of the tread's edges (for the tread texture's v range). */
const TREAD = [5, 8];

export function tyreGeometry(): BufferGeometry {
  const g = new LatheGeometry(
    TYRE_PROFILE.map(([r, y]) => new Vector2(r, y)),
    72,
  );
  g.rotateX(Math.PI / 2);
  return g;
}

/** Bump map: four circumferential grooves and angled sipes on the tread, plain sidewalls. */
export function treadTexture(): CanvasTexture {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, w, h);
  const n = TYRE_PROFILE.length - 1;
  // Canvas y runs top-down; texture v runs bottom-up.
  const vy = (v: number) => (1 - v) * h;
  const v0 = TREAD[0] / n;
  const v1 = TREAD[1] / n;
  ctx.fillStyle = "#303030";
  for (const f of [0.17, 0.39, 0.61, 0.83]) {
    const y = vy(v0 + (v1 - v0) * f);
    ctx.fillRect(0, y - 2.2, w, 4.4);
  }
  ctx.strokeStyle = "#4a4a4a";
  ctx.lineWidth = 2;
  for (let i = 0; i < 96; i++) {
    const x = (i / 96) * w;
    ctx.beginPath();
    ctx.moveTo(x, vy(v0));
    ctx.lineTo(x + 6, vy(v0 + (v1 - v0) * 0.15));
    ctx.moveTo(x + 3, vy(v0 + (v1 - v0) * 0.85));
    ctx.lineTo(x + 9, vy(v1));
    ctx.stroke();
  }
  const t = new CanvasTexture(canvas);
  t.wrapS = RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/** Rim face: ten windows between five twin spokes, with a centre cap and five wheel nuts. */
export function rimFaceGeometry(): BufferGeometry {
  const R = 0.236;
  const shape = new Shape();
  shape.absarc(0, 0, R, 0, Math.PI * 2, false);
  const rIn = 0.082;
  const rOut = 0.2;
  for (let k = 0; k < 10; k++) {
    // Twin spokes: alternate narrow and wide gaps between windows.
    const base = (k * Math.PI * 2) / 10 + (k % 2 ? 0.035 : -0.035);
    const half = 0.2;
    const hole = new Path();
    hole.absarc(0, 0, rOut, base - half, base + half, false);
    hole.absarc(0, 0, rIn + 0.02, base + half * 0.55, base - half * 0.55, true);
    shape.holes.push(hole);
  }
  const face = new ExtrudeGeometry(shape, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 3, curveSegments: 48 });
  face.translate(0, 0, 0.055);
  const cap = new CylinderGeometry(0.058, 0.064, 0.03, 32);
  cap.rotateX(Math.PI / 2);
  cap.translate(0, 0, 0.088);
  const nuts: BufferGeometry[] = [];
  for (let k = 0; k < 5; k++) {
    const a = (k * Math.PI * 2) / 5 + Math.PI / 10;
    const nut = new CylinderGeometry(0.011, 0.011, 0.02, 6);
    nut.rotateX(Math.PI / 2);
    nut.translate(Math.cos(a) * 0.072, Math.sin(a) * 0.072, 0.088);
    nuts.push(nut.toNonIndexed());
  }
  const lip = new TorusGeometry(R - 0.004, 0.006, 8, 64);
  lip.translate(0, 0, 0.074);
  return mergeGeometries([face.toNonIndexed(), cap.toNonIndexed(), lip.toNonIndexed(), ...nuts])!;
}

/** Rim barrel (open cylinder inside the tyre). */
export function rimBarrelGeometry(): BufferGeometry {
  const g = new CylinderGeometry(0.236, 0.236, 0.205, 56, 1, true);
  g.rotateX(Math.PI / 2);
  return g;
}

/** Ventilated brake disc with its hat. */
export function brakeDiscGeometry(): BufferGeometry {
  const disc = new CylinderGeometry(0.172, 0.172, 0.028, 56);
  disc.rotateX(Math.PI / 2);
  const hat = new CylinderGeometry(0.09, 0.09, 0.05, 32);
  hat.rotateX(Math.PI / 2);
  hat.translate(0, 0, 0.03);
  return mergeGeometries([disc.toNonIndexed(), hat.toNonIndexed()])!;
}

/** Two-piston caliper body straddling the disc (fixed to the knuckle: it steers but does not spin). */
export function caliperGeometry(): BufferGeometry {
  const s = new Shape();
  s.absarc(0, 0, 0.19, 1.95, 2.85, false);
  s.absarc(0, 0, 0.125, 2.85, 1.95, true);
  const g = new ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 16 });
  g.translate(0, 0, -0.035);
  return g;
}
