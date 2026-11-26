// The vehicle body: a lofted surface, built here from a side profile, a plan
// profile and a cross-section at every station along the car. Representative
// engineering geometry of a neutral, unbranded mid-size electric car (4.70 m
// long, 1.88 m wide, 1.47 m tall, 2.90 m wheelbase) — not a production model.
//
// Frame: x forward (front at +x), y up, z to the vehicle's left. The car's
// centre is midway between the axles; y = 0 is the ground at nominal ride
// height. The receiver pad hangs under the floor 0.6 m ahead of the centre
// (StationParams.receiverOffset).
import { BoxGeometry, BufferGeometry, Float32BufferAttribute, TorusGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const WHEELBASE = 2.9;
export const WHEEL_X = WHEELBASE / 2;
export const WHEEL_RADIUS = 0.355;
export const TRACK = 1.62;
/** Underside of the floor (battery enclosure) at nominal ride height, m. */
export const FLOOR_Y = 0.228;
export const BODY_FRONT = 2.33;
export const BODY_REAR = -2.37;
export const HALF_WIDTH = 0.94;
/** Wheel-arch opening radius (tyre plus suspension travel clearance). */
export const ARCH_RADIUS = 0.43;
/** Body regions, in the order of the geometry's material groups. */
export const BODY_GROUPS = ["paint", "glass", "trim", "lampFront", "lampRear", "seam"] as const;
export type BodyGroup = (typeof BODY_GROUPS)[number];

type P = [number, number];

/** Monotone piecewise-cubic interpolation through (x, y) knots (Fritsch–Carlson), so profiles never overshoot. */
export function profile(knots: P[]): (x: number) => number {
  const n = knots.length;
  const xs = knots.map((k) => k[0]);
  const ys = knots.map((k) => k[1]);
  const d: number[] = [];
  const m: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Centre-line roof, hood and deck (side view). */
export const topLine = profile([
  [BODY_REAR, 0.94],
  [-2.3, 0.995],
  [-2.08, 1.03],
  [-1.78, 1.115],
  [-1.3, 1.335],
  [-0.85, 1.44],
  [-0.3, 1.472],
  [0.12, 1.452],
  [0.55, 1.255],
  [0.96, 0.995],
  [1.35, 0.93],
  [1.85, 0.86],
  [2.16, 0.79],
  [2.29, 0.71],
  [BODY_FRONT, 0.62],
]);

/** Underside (side view): flat floor, rising to the front splitter and the rear diffuser. */
export const bottomLine = profile([
  [BODY_REAR, 0.44],
  [-2.26, 0.35],
  [-2.02, 0.285],
  [-1.72, FLOOR_Y + 0.004],
  [-1.2, FLOOR_Y],
  [1.55, FLOOR_Y],
  [1.95, 0.245],
  [2.2, 0.29],
  [BODY_FRONT, 0.39],
]);

/** Shoulder (widest line) height. */
const shoulderLine = profile([
  [BODY_REAR, 0.8],
  [-1.7, 0.86],
  [-0.6, 0.79],
  [0.9, 0.745],
  [1.8, 0.7],
  [BODY_FRONT, 0.6],
]);

/** Beltline (top of the doors) inside the cabin. */
const beltLine = profile([
  [-1.9, 1.03],
  [-1.2, 1.02],
  [0.0, 0.99],
  [0.96, 0.975],
]);

/** Where the glasshouse starts and ends along the car. */
export const COWL_X = 0.96;
export const DECK_X = -1.8;
/** Side windows: front quarter-light to C-pillar, with a B-pillar at -0.17 m. */
const SIDE_GLASS: [number, number] = [-1.36, 0.82];
const B_PILLAR: [number, number] = [-0.24, -0.1];
/** Door shut lines (front door leading edge, B-pillar, rear door trailing edge). */
export const SEAMS = [0.9, -0.17, -1.3];
const SEAM_HALF = 0.0035;

/** 0 outside the glasshouse, 1 inside, with short blends at the cowl and deck. */
export const cabin = (x: number) => smooth(DECK_X - 0.02, DECK_X + 0.16, x) * (1 - smooth(COWL_X - 0.12, COWL_X + 0.02, x));

/** Plan-view half-width: a superellipse, slightly narrower at the front. */
export function halfWidth(x: number): number {
  const xc = (BODY_FRONT + BODY_REAR) / 2;
  const half = (BODY_FRONT - BODY_REAR) / 2;
  const u = Math.min(1, Math.abs((x - xc) / half));
  const p = x > xc ? 4.2 : 5.2;
  const w = HALF_WIDTH * Math.pow(Math.max(0, 1 - Math.pow(u, p)), 1 / p);
  return w * (1 - 0.025 * smooth(0, BODY_FRONT, x));
}

/** Control points of the right half-section at station x, from the floor centre to the roof centre. */
function sectionKnots(x: number): P[] {
  const W = halfWidth(x);
  const yB = bottomLine(x);
  const yT = topLine(x);
  const c = cabin(x);
  const h = yT - yB;
  const yS = Math.min(shoulderLine(x), yB + 0.62 * h);
  const belt = c > 0 ? beltLine(Math.min(COWL_X, Math.max(-1.9, x))) : yT;
  const yBelt = Math.min(c * belt + (1 - c) * (yT - 0.035), yT - 0.025);
  const roofW = c * 0.68 + (1 - c) * W * 0.86;
  return [
    [0, yB],
    [W * 0.72, yB],
    [W * 0.93, yB + Math.min(0.045, 0.2 * h)],
    [W * 0.985, yB + Math.min(0.17, 0.42 * (yS - yB))],
    [W, yS],
    [W * 0.968, Math.max(yS + 0.01, yBelt)],
    [c * W * 0.9 + (1 - c) * W * 0.93, yBelt + c * 0.13 + (1 - c) * 0.012],
    [roofW, yT - 0.012 - c * 0.032],
    [roofW * 0.55, yT - 0.004 - c * 0.002],
    [0, yT],
  ];
}

/** Rows per segment of the half-section (denser where it curves). */
const ROWS = [5, 3, 3, 4, 3, 4, 4, 3, 4];

/** Centripetal Catmull–Rom point between k1 and k2. */
function catmull(k0: P, k1: P, k2: P, k3: P, t: number): P {
  const alpha = 0.5;
  const tj = (a: P, b: P, ti: number) => ti + Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]) + 1e-9, alpha);
  const t0 = 0;
  const t1 = tj(k0, k1, t0);
  const t2 = tj(k1, k2, t1);
  const t3 = tj(k2, k3, t2);
  const u = t1 + (t2 - t1) * t;
  const lerp = (a: P, b: P, ta: number, tb: number): P => {
    const w = (tb - u) / (tb - ta);
    return [a[0] * w + b[0] * (1 - w), a[1] * w + b[1] * (1 - w)];
  };
  const a1 = lerp(k0, k1, t0, t1);
  const a2 = lerp(k1, k2, t1, t2);
  const a3 = lerp(k2, k3, t2, t3);
  const b1 = lerp(a1, a2, t0, t2);
  const b2 = lerp(a2, a3, t1, t3);
  return lerp(b1, b2, t1, t2);
}

/** The right half-section sampled at fixed rows, so every station has the same topology. Row 0 is the floor centre. */
export function halfSection(x: number): P[] {
  const k = sectionKnots(x);
  const ext: P[] = [[k[0][0] - (k[1][0] - k[0][0]), k[0][1]], ...k, [k[k.length - 1][0] - 0.05, k[k.length - 1][1] + 0.01]];
  const out: P[] = [];
  for (let s = 0; s < k.length - 1; s++) {
    for (let r = 0; r < ROWS[s]; r++) out.push(catmull(ext[s], ext[s + 1], ext[s + 2], ext[s + 3], r / ROWS[s]));
  }
  out.push(k[k.length - 1]);
  return out;
}

/** Index of the section row at each control knot. */
const KNOT_ROW = ROWS.reduce<number[]>((acc, n, i) => [...acc, acc[i] + n], [0]);
/** The roof-rail row (knot 7): the line between the side glass and the roof, kept black like the pillars. */
const ROOF_RAIL = KNOT_ROW[7];
const BELT_ROW = KNOT_ROW[5];

/** Body surface half-width at height y on the side of station x (for placing mirrors, handles, cladding). */
export function surfaceZ(x: number, y: number): number {
  const s = halfSection(x);
  let best = s[KNOT_ROW[4]][0];
  for (let i = 1; i <= ROOF_RAIL; i++) {
    const [z0, y0] = s[i - 1];
    const [z1, y1] = s[i];
    if ((y - y0) * (y - y1) <= 0 && y1 !== y0) {
      best = z0 + ((z1 - z0) * (y - y0)) / (y1 - y0);
      if (i > 2) break;
    }
  }
  return best;
}

/** Stations along the car: denser at the ends, with pairs at each door seam. */
function stations(): number[] {
  const xs = new Set<number>();
  const n = 92;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // Cosine spacing: fine at the nose and tail, coarser along the doors.
    xs.add(+(BODY_REAR + (BODY_FRONT - BODY_REAR) * (0.5 - 0.5 * Math.cos(Math.PI * t))).toFixed(5));
  }
  for (let i = 0; i <= 40; i++) xs.add(+(-1.7 + (3.3 * i) / 40).toFixed(5));
  for (const s of SEAMS) {
    xs.add(+(s - SEAM_HALF).toFixed(5));
    xs.add(+(s + SEAM_HALF).toFixed(5));
  }
  for (const x of [COWL_X, DECK_X, SIDE_GLASS[0], SIDE_GLASS[1], B_PILLAR[0], B_PILLAR[1]]) xs.add(+x.toFixed(5));
  return [...xs].sort((a, b) => a - b);
}

export interface BodyGeometry {
  geometry: BufferGeometry;
  /** Wheel-arch cladding and liners (one geometry, trim material). */
  arches: BufferGeometry;
  liners: BufferGeometry;
}

const inArch = (x: number, y: number, z: number) => {
  if (Math.abs(z) < 0.58) return false;
  for (const wx of [WHEEL_X, -WHEEL_X]) if (Math.hypot(x - wx, y - WHEEL_RADIUS) < ARCH_RADIUS) return true;
  return false;
};

/** Builds the lofted body with material groups (see BODY_GROUPS). */
export function buildBody(): BodyGeometry {
  const xs = stations();
  const half = halfSection(0).length;
  const ring = half * 2 - 1;
  const pos = new Float32Array(xs.length * ring * 3);
  const sections: P[][] = xs.map((x) => halfSection(x));
  xs.forEach((x, i) => {
    const s = sections[i];
    for (let j = 0; j < ring; j++) {
      // Right side (−z) from floor centre to roof centre, then the left side (+z) back down.
      const k = j < half ? j : ring - 1 - j;
      const side = j < half ? -1 : 1;
      const o = (i * ring + j) * 3;
      pos[o] = x;
      pos[o + 1] = s[k][1];
      pos[o + 2] = side * s[k][0];
    }
  });

  const groups: number[][] = BODY_GROUPS.map(() => []);
  const id = (i: number, j: number) => i * ring + j;
  for (let i = 0; i < xs.length - 1; i++) {
    const xm = (xs[i] + xs[i + 1]) / 2;
    const c = cabin(xm);
    const yT = topLine(xm);
    for (let j = 0; j < ring - 1; j++) {
      const a = id(i, j);
      const b = id(i + 1, j);
      const cc = id(i + 1, j + 1);
      const d = id(i, j + 1);
      const cy = (pos[a * 3 + 1] + pos[b * 3 + 1] + pos[cc * 3 + 1] + pos[d * 3 + 1]) / 4;
      const cz = (pos[a * 3 + 2] + pos[b * 3 + 2] + pos[cc * 3 + 2] + pos[d * 3 + 2]) / 4;
      if (inArch(xm, cy, cz)) continue;
      const row = j < half - 1 ? j : ring - 2 - j;
      let g: BodyGroup = "paint";
      const side = row >= BELT_ROW && row < ROOF_RAIL;
      const top = row > ROOF_RAIL;
      if (c > 0.5 && (row === ROOF_RAIL || row === ROOF_RAIL - 1)) g = "trim";
      else if (c > 0.5 && side) {
        const glass = xm > SIDE_GLASS[0] && xm < SIDE_GLASS[1] && !(xm > B_PILLAR[0] && xm < B_PILLAR[1]) && row > BELT_ROW;
        g = glass ? "glass" : row > BELT_ROW ? "trim" : "paint";
      } else if (top && xm > DECK_X + 0.04 && xm < COWL_X - 0.03) g = "glass";
      else if (xm > 2.1 && cy > yT - 0.085 && cy < yT - 0.045 && row > KNOT_ROW[3]) g = "lampFront";
      else if (xm < -2.28 && cy > yT - 0.13 && cy < yT - 0.1 && row > KNOT_ROW[3]) g = "lampRear";
      else if (SEAMS.some((s) => Math.abs(xm - s) < SEAM_HALF + 1e-4) && row >= KNOT_ROW[2] && row <= BELT_ROW && Math.abs(cz) > 0.5) g = "seam";
      else if (row <= KNOT_ROW[2] + 1 && Math.abs(cz) > 0.62) g = "trim";
      // Outward winding: the right side runs floor→roof, so (a, d, b) faces out.
      groups[BODY_GROUPS.indexOf(g)].push(a, d, b, b, d, cc);
    }
  }
  const index: number[] = [];
  const geometry = new BufferGeometry();
  let start = 0;
  groups.forEach((g, i) => {
    index.push(...g);
    geometry.addGroup(start, g.length, i);
    start += g.length;
  });
  geometry.setAttribute("position", new Float32BufferAttribute(pos, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return { geometry, arches: archCladding(), liners: archLiners() };
}

/** Black cladding around each wheel arch: an outer band on the body side and a return into the arch. */
function archCladding(): BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  const width = 0.045;
  const steps = 28;
  for (const wx of [WHEEL_X, -WHEEL_X]) {
    for (const side of [1, -1]) {
      const a0 = Math.asin(Math.min(1, (FLOOR_Y + 0.06 - WHEEL_RADIUS) / ARCH_RADIUS));
      const start = pos.length / 3;
      for (let s = 0; s <= steps; s++) {
        // From the rear foot of the arch over the top to the front foot.
        const a = Math.PI - a0 - ((Math.PI - 2 * a0) * s) / steps;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const xi = wx + ca * ARCH_RADIUS;
        const yi = WHEEL_RADIUS + sa * ARCH_RADIUS;
        const xo = wx + ca * (ARCH_RADIUS + width);
        const yo = WHEEL_RADIUS + sa * (ARCH_RADIUS + width);
        const zi = side * (surfaceZ(xi, Math.max(FLOOR_Y + 0.03, yi)) + 0.006);
        const zo = side * (surfaceZ(xo, Math.max(FLOOR_Y + 0.03, yo)) + 0.006);
        // Outer band (two vertices) and the inner return (one vertex, inboard).
        pos.push(xo, yo, zo, xi, yi, zi, xi, yi, zi - side * 0.07);
      }
      for (let s = 0; s < steps; s++) {
        const o = start + s * 3;
        const n = o + 3;
        if (side > 0) idx.push(o, n, o + 1, o + 1, n, n + 1, o + 1, n + 1, o + 2, o + 2, n + 1, n + 2);
        else idx.push(o, o + 1, n, o + 1, n + 1, n, o + 1, o + 2, n + 1, o + 2, n + 2, n + 1);
      }
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Wheel-well liners: dark half-shells inside each arch, so the arch never shows the inside of the body. */
function archLiners(): BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  const steps = 20;
  const r = ARCH_RADIUS - 0.004;
  for (const wx of [WHEEL_X, -WHEEL_X]) {
    for (const side of [1, -1]) {
      const start = pos.length / 3;
      const a0 = Math.asin(Math.min(1, (FLOOR_Y - WHEEL_RADIUS) / r));
      for (let s = 0; s <= steps; s++) {
        const a = Math.PI - a0 - ((Math.PI - 2 * a0) * s) / steps;
        const x = wx + Math.cos(a) * r;
        const y = WHEEL_RADIUS + Math.sin(a) * r;
        pos.push(x, y, side * 0.5, x, y, side * 0.93);
      }
      for (let s = 0; s < steps; s++) {
        const o = start + s * 2;
        idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
      }
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * A simple cabin interior, so the glass shows seats and a dashboard rather
 * than an empty shell: floor, two front seats, a rear bench, dashboard,
 * centre display (returned separately, it glows faintly) and a steering
 * wheel on the right (Indian right-hand drive).
 */
export function buildInterior(): { cabin: BufferGeometry; display: BufferGeometry } {
  const parts: BufferGeometry[] = [];
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, rz = 0) => {
    const g = new BoxGeometry(w, h, d).toNonIndexed();
    if (rz) g.rotateZ(rz);
    g.translate(x, y, z);
    parts.push(g);
  };
  box(2.5, 0.04, 1.46, -0.25, FLOOR_Y + 0.2, 0);
  for (const z of [-0.37, 0.37]) {
    box(0.5, 0.11, 0.5, 0.02, 0.56, z);
    box(0.11, 0.58, 0.48, -0.25, 0.86, z, 0.22);
    box(0.08, 0.16, 0.26, -0.33, 1.2, z, 0.22);
  }
  box(0.5, 0.11, 1.32, -0.98, 0.56, 0);
  box(0.11, 0.52, 1.32, -1.24, 0.84, 0, 0.28);
  box(0.34, 0.16, 1.5, 0.74, 0.86, 0);
  box(0.62, 0.1, 0.22, 0.3, 0.62, 0);
  const wheel = new TorusGeometry(0.17, 0.017, 10, 32).toNonIndexed();
  wheel.rotateY(Math.PI / 2);
  wheel.rotateZ(-0.4);
  wheel.translate(0.5, 0.96, -0.37);
  parts.push(wheel);
  const display = new BoxGeometry(0.02, 0.17, 0.3).toNonIndexed();
  display.rotateZ(-0.25);
  display.translate(0.62, 1.03, 0.02);
  return { cabin: mergeGeometries(parts)!, display };
}
