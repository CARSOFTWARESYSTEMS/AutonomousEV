// Procedural geometry for the twin. Original, built here, no external assets
// (see docs/wireless-ev-charging-digital-twin/ASSET_LICENSES.md). Coil
// windings follow the simulated turn count and radii, so the picture is the
// model's geometry, not decoration.
import { BufferGeometry, CatmullRomCurve3, CylinderGeometry, ExtrudeGeometry, Float32BufferAttribute, LatheGeometry, Shape, TubeGeometry, Vector2, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Planar Archimedean spiral of `turns` between rIn and rOut, as a tube of conductor diameter d, lying in the XZ plane at height y. */
export function spiralCoil(rIn: number, rOut: number, turns: number, d: number, y = 0): TubeGeometry {
  const n = Math.max(1, Math.round(turns));
  const pitch = (rOut - rIn) / n;
  const pts: Vector3[] = [];
  const perTurn = 72;
  const total = n * perTurn;
  for (let i = 0; i <= total; i++) {
    const a = (i / perTurn) * Math.PI * 2;
    const r = rIn + pitch * 0.5 + (pitch * i) / perTurn;
    pts.push(new Vector3(r * Math.cos(a), y, r * Math.sin(a)));
  }
  // Lead-out to the edge.
  const last = pts[pts.length - 1];
  pts.push(new Vector3(last.x + 0.03, y, last.z), new Vector3(rOut + 0.04, y, last.z));
  return new TubeGeometry(new CatmullRomCurve3(pts, false, "catmullrom", 0.2), total + 8, d / 2, 8, false);
}

/** Radial ferrite bars under a winding. */
export function ferriteBars(rIn: number, rOut: number, count: number, thickness: number, width: number, y: number): BufferGeometry {
  const parts: BufferGeometry[] = [];
  const len = rOut - rIn * 0.6;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const g = new CylinderGeometry(1, 1, 1, 4, 1).toNonIndexed();
    g.rotateY(Math.PI / 4);
    g.scale(width / Math.SQRT2, thickness, len / Math.SQRT2);
    g.translate(0, y, rIn * 0.6 + len / 2);
    g.rotateY(a);
    parts.push(g);
  }
  return mergeGeometries(parts)!;
}

/** A rounded puck: the housing of a pad. Lathe profile with chamfered edges. */
export function padHousing(radius: number, height: number, chamfer = 0.015): LatheGeometry {
  const p = [
    new Vector2(0, 0),
    new Vector2(radius - chamfer * 2, 0),
    new Vector2(radius, chamfer),
    new Vector2(radius, height - chamfer * 1.5),
    new Vector2(radius - chamfer * 2.5, height),
    new Vector2(0, height),
  ];
  return new LatheGeometry(p, 72);
}

// ── Vehicle body ───────────────────────────────────────────────────────────

const WHEEL_X = 1.45;
export const WHEEL_RADIUS = 0.355;
const ARCH = 0.405;

/** Side silhouette of the lower body (x along the car, y up), wheel arches cut out. */
function lowerBodyShape(): Shape {
  const s = new Shape();
  const bottom = 0.2;
  // Chin, nose and a low hood that rises to the cowl; a short, crisp tail.
  s.moveTo(2.24, bottom);
  s.lineTo(2.39, 0.33);
  s.quadraticCurveTo(2.46, 0.47, 2.43, 0.56);
  s.quadraticCurveTo(2.39, 0.64, 2.25, 0.67);
  s.bezierCurveTo(1.8, 0.74, 1.3, 0.82, 0.92, 0.9);
  s.lineTo(-1.6, 0.97);
  s.quadraticCurveTo(-2.12, 0.97, -2.33, 0.9);
  s.lineTo(-2.4, 0.74);
  s.lineTo(-2.4, 0.42);
  s.quadraticCurveTo(-2.38, 0.24, -2.18, bottom);
  // Rear arch.
  s.lineTo(-WHEEL_X - ARCH - 0.02, bottom);
  s.absarc(-WHEEL_X, bottom + 0.06, ARCH, Math.PI + 0.15, -0.15, true);
  s.lineTo(WHEEL_X - ARCH - 0.02, bottom);
  // Front arch.
  s.absarc(WHEEL_X, bottom + 0.06, ARCH, Math.PI + 0.15, -0.15, true);
  s.lineTo(2.24, bottom);
  return s;
}

/** Side silhouette of the glass greenhouse: raked windscreen, long roof, fastback. */
function greenhouseShape(): Shape {
  const s = new Shape();
  s.moveTo(0.95, 0.88);
  s.bezierCurveTo(0.62, 1.08, 0.3, 1.34, -0.02, 1.41);
  s.bezierCurveTo(-0.45, 1.46, -0.9, 1.45, -1.2, 1.38);
  s.bezierCurveTo(-1.55, 1.27, -1.8, 1.1, -1.98, 0.96);
  s.lineTo(0.95, 0.88);
  return s;
}

/**
 * Extrudes a side silhouette across the width and tapers it in plan view
 * (rounded nose and tail) and in section (tumblehome above the belt line).
 */
function extrudeBody(shape: Shape, width: number, bevel: number, taper: (x: number, y: number) => number): BufferGeometry {
  const g = new ExtrudeGeometry(shape, { depth: width - bevel * 2, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel * 1.2, bevelSegments: 6, curveSegments: 36 });
  g.translate(0, 0, -(width - bevel * 2) / 2);
  const pos = g.attributes.position as Float32BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, pos.getZ(i) * taper(x, y));
  }
  g.computeVertexNormals();
  return g;
}

export function vehicleGeometry() {
  const lower = extrudeBody(lowerBodyShape(), 1.92, 0.045, (x, y) => {
    const ax = Math.abs(x);
    let f = 1;
    if (ax > 1.75) f *= 1 - 0.1 * ((ax - 1.75) / 0.7) ** 2;
    if (y > 0.7) f *= 1 - 0.06 * Math.min(1, (y - 0.7) / 0.27);
    if (y < 0.3) f *= 1 - 0.03 * (1 - y / 0.3);
    return f;
  });
  const glass = extrudeBody(greenhouseShape(), 1.66, 0.07, (x, y) => {
    let f = 1 - 0.18 * Math.max(0, (y - 0.92) / 0.5);
    if (x < -1.3) f *= 1 - 0.05 * ((-1.3 - x) / 0.68);
    return f;
  });
  return { lower, glass };
}

/** Tyre: a rounded rectangular section revolved about the axle (lathe around Y, rotated later). */
export function tyreGeometry(): LatheGeometry {
  const r = WHEEL_RADIUS;
  const w = 0.125;
  const pts: Vector2[] = [];
  const inner = 0.25;
  for (let i = 0; i <= 16; i++) {
    const t = (i / 16) * Math.PI;
    pts.push(new Vector2(r - 0.055 + 0.055 * Math.sin(t), -w * Math.cos(t)));
  }
  pts.unshift(new Vector2(inner, -w * 0.92));
  pts.push(new Vector2(inner, w * 0.92));
  return new LatheGeometry(pts, 48);
}

/** A five twin-spoke rim. */
export function rimGeometry(): BufferGeometry {
  const parts: BufferGeometry[] = [];
  const barrel = new CylinderGeometry(0.255, 0.255, 0.2, 40, 1, true).toNonIndexed();
  parts.push(barrel);
  const hub = new CylinderGeometry(0.06, 0.07, 0.06, 20).toNonIndexed();
  hub.translate(0, 0.085, 0);
  parts.push(hub);
  for (let i = 0; i < 10; i++) {
    const spoke = new CylinderGeometry(0.012, 0.018, 0.2, 6).toNonIndexed();
    spoke.rotateZ(Math.PI / 2);
    spoke.translate(0.13, 0.08, 0);
    spoke.rotateY((Math.floor(i / 2) * Math.PI * 2) / 5 + (i % 2 ? 0.11 : -0.11));
    parts.push(spoke);
  }
  return mergeGeometries(parts)!;
}

export { WHEEL_X };
