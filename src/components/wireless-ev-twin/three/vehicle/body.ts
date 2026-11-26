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
  const p = x > xc ? 5.4 : 7.5;
  const w = HALF_WIDTH * Math.pow(Math.max(0, 1 - Math.pow(u, p)), 1 / p);
  return w * (1 - 0.025 * smooth(0, BODY_FRONT, x));
}

/**
 * Control points of the right half-section at station x, from the floor
 * centre to the roof centre: floor, rocker, door, shoulder crease, the
 * shoulder's top surface to the beltline, the window seal, the side glass
 * (with tumblehome), the roof seal and the roof. Outside the glasshouse the
 * upper knots collapse onto the bonnet or boot lid.
 */
function sectionKnots(x: number): P[] {
  const W = halfWidth(x);
  const yB = bottomLine(x);
  const yT = topLine(x);
  const c = cabin(x);
  const h = yT - yB;
  const yS = Math.min(shoulderLine(x), yB + 0.62 * h);
  const belt = c > 0 ? beltLine(Math.min(COWL_X, Math.max(-1.9, x))) : yT;
  const yBelt = Math.max(yS + 0.02, Math.min(c * belt + (1 - c) * (yT - 0.045), yT - 0.03));
  const roofW = c * 0.655 + (1 - c) * W * 0.76;
  const yRail = yT - 0.05 * c - 0.012 * (1 - c);
  const zBelt = W * (0.952 * c + 0.93 * (1 - c));
  const rock = Math.min(0.1, 0.3 * (yS - yB));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const zGlass0 = zBelt - 0.014 * c - (1 - c) * W * 0.03;
  const zGlass1 = roofW + 0.012 * c + (1 - c) * W * 0.04;
  return [
    [0, yB],
    [W * 0.78, yB],
    [W * 0.925, yB + Math.min(0.03, 0.2 * h)],
    [W * 0.972, yB + rock],
    [W * 0.99, yB + rock + 0.5 * (yS - yB - rock)],
    [W, yS],
    [zBelt, yBelt],
    [zGlass0, yBelt + 0.016 * c + 0.008 * (1 - c)],
    [lerp(zGlass0, zGlass1, 0.52) + 0.012 * c, lerp(yBelt, yRail, 0.52)],
    [zGlass1, yRail - 0.018 * c - 0.004 * (1 - c)],
    [roofW, yRail],
    [roofW * 0.55, yT - 0.005 - 0.002 * c],
    [0, yT],
  ];
}

/** Bands of the section between creases (knot index ranges); each band is smooth, the edges between bands are sharp. */
const BANDS: [number, number][] = [
  [0, 2],
  [2, 3],
  [3, 5],
  [5, 6],
  [6, 7],
  [7, 9],
  [9, 10],
  [10, 12],
];
export const BAND = { floor: 0, rocker: 1, door: 2, shoulder: 3, beltSeal: 4, glass: 5, roofSeal: 6, roof: 7 } as const;
/** Rows per segment between consecutive knots. */
const SEG_ROWS = [4, 2, 2, 3, 3, 3, 1, 3, 3, 1, 3, 3];

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

/** Band of every section row; a row that starts a band repeats the last row of the previous one (a hard edge). */
export const ROW_BAND: number[] = (() => {
  const out: number[] = [];
  BANDS.forEach(([k0, k1], b) => {
    for (let k = k0; k < k1; k++) for (let r = 0; r < SEG_ROWS[k]; r++) out.push(b);
    out.push(b);
  });
  return out;
})();
/** Rows that duplicate the previous row (no faces are built between the two). */
const DUPLICATE = ROW_BAND.map((b, i) => i > 0 && ROW_BAND[i - 1] !== b);

/** The right half-section sampled at fixed rows, so every station has the same topology. Row 0 is the floor centre. */
export function halfSection(x: number): P[] {
  const k = sectionKnots(x);
  const out: P[] = [];
  for (const [k0, k1] of BANDS) {
    // Spline only through the band's own knots, extended by reflection at its ends, so creases stay sharp.
    const at = (i: number): P => {
      if (i < k0) return [2 * k[k0][0] - k[k0 + 1][0], 2 * k[k0][1] - k[k0 + 1][1]];
      if (i > k1) return [2 * k[k1][0] - k[k1 - 1][0], 2 * k[k1][1] - k[k1 - 1][1]];
      return k[i];
    };
    for (let s = k0; s < k1; s++) for (let r = 0; r < SEG_ROWS[s]; r++) out.push(r === 0 ? k[s] : catmull(at(s - 1), at(s), at(s + 1), at(s + 2), r / SEG_ROWS[s]));
    out.push(k[k1]);
  }
  return out;
}

/** First row of a band. */
const bandStart = (b: number) => ROW_BAND.indexOf(b);

/** Body surface half-width at height y on the side of station x (for placing mirrors, handles, cladding). */
export function surfaceZ(x: number, y: number): number {
  const s = halfSection(x);
  const last = bandStart(BAND.roofSeal);
  let best = s[bandStart(BAND.shoulder)][0];
  for (let i = bandStart(BAND.rocker); i <= last; i++) {
    const [z0, y0] = s[i - 1];
    const [z1, y1] = s[i];
    if ((y - y0) * (y - y1) <= 0 && y1 !== y0) {
      best = z0 + ((z1 - z0) * (y - y0)) / (y1 - y0);
      break;
    }
  }
  return best;
}

/** Stations along the car: denser at the ends, with pairs at each door seam. */
function stations(): number[] {
  const xs = new Set<number>();
  const n = 96;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // Cosine spacing: fine at the nose and tail, coarser along the doors.
    xs.add(+(BODY_REAR + (BODY_FRONT - BODY_REAR) * (0.5 - 0.5 * Math.cos(Math.PI * t))).toFixed(5));
  }
  for (let i = 0; i <= 44; i++) xs.add(+(-1.7 + (3.3 * i) / 44).toFixed(5));
  for (const s of SEAMS) {
    xs.add(+(s - SEAM_HALF).toFixed(5));
    xs.add(+(s + SEAM_HALF).toFixed(5));
  }
  for (const x of [COWL_X, DECK_X, SIDE_GLASS[0], SIDE_GLASS[1], B_PILLAR[0], B_PILLAR[1], LAMP_FRONT_X, LAMP_REAR_X]) xs.add(+x.toFixed(5));
  return [...xs].sort((a, b) => a - b);
}

/** Front and rear light bars: the shoulder band across the nose and the top of it across the tail. */
const LAMP_FRONT_X = 2.17;
const LAMP_REAR_X = -2.12;

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
    for (let j = 0; j < ring - 1; j++) {
      // Rows j and j+1 (mirrored on the left side); skip the zero-width step at a crease.
      const rowA = j < half ? j : ring - 1 - j;
      const rowB = j + 1 < half ? j + 1 : ring - 2 - j;
      const upper = Math.max(rowA, rowB);
      if (rowA === rowB || DUPLICATE[upper]) continue;
      const band = ROW_BAND[upper];
      const a = id(i, j);
      const b = id(i + 1, j);
      const cc = id(i + 1, j + 1);
      const d = id(i, j + 1);
      const cy = (pos[a * 3 + 1] + pos[b * 3 + 1] + pos[cc * 3 + 1] + pos[d * 3 + 1]) / 4;
      const cz = (pos[a * 3 + 2] + pos[b * 3 + 2] + pos[cc * 3 + 2] + pos[d * 3 + 2]) / 4;
      if (inArch(xm, cy, cz)) continue;
      let g: BodyGroup = "paint";
      const inCabin = c > 0.5;
      const sideGlass = xm > SIDE_GLASS[0] && xm < SIDE_GLASS[1] && !(xm > B_PILLAR[0] && xm < B_PILLAR[1]);
      if (band === BAND.floor || band === BAND.rocker) g = "trim";
      else if (band === BAND.beltSeal || band === BAND.roofSeal) g = inCabin ? "trim" : "paint";
      else if (band === BAND.glass) g = inCabin ? (sideGlass ? "glass" : "trim") : "paint";
      else if (band === BAND.roof) g = inCabin || (xm > DECK_X + 0.04 && xm < COWL_X - 0.03) ? "glass" : "paint";
      else if (band === BAND.shoulder && xm > LAMP_FRONT_X) g = "lampFront";
      else if (band === BAND.shoulder && xm < LAMP_REAR_X && cy > topLine(xm) - 0.1 && cy < topLine(xm) - 0.045) g = "lampRear";
      else if (SEAMS.some((s) => Math.abs(xm - s) < SEAM_HALF + 1e-4) && (band === BAND.door || band === BAND.shoulder) && Math.abs(cz) > 0.5) g = "seam";
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
