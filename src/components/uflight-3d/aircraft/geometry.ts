// Procedural geometry for the reference aircraft: a lofted fuselage split into
// skin, glazing and doors; airfoil lofts for wing, tail and blades; bodies of
// revolution for nacelles and booms; box lofts for spars and beams.
// Everything is built once and cached. Dimensions come from layout.ts.
import { BufferAttribute, BufferGeometry, Float32BufferAttribute, LatheGeometry, Vector2, Vector3 } from "three";
import type { Vec3 } from "../types";
import { FUSELAGE, OPENINGS, fuselagePoint } from "./layout";

const cache = new Map<string, BufferGeometry | Record<string, BufferGeometry>>();

/** Build a geometry (or a named set) once per key. */
export function cached<T extends BufferGeometry | Record<string, BufferGeometry>>(key: string, build: () => T): T {
  const hit = cache.get(key);
  if (hit) return hit as T;
  const made = build();
  cache.set(key, made);
  return made;
}

export function disposeGeometryCache() {
  for (const entry of cache.values()) {
    if (entry instanceof BufferGeometry) entry.dispose();
    else Object.values(entry).forEach((g) => g.dispose());
  }
  cache.clear();
}

// ── Fuselage ──

export type FuselageRegion = "shell" | "belly" | "glass" | "door-left" | "door-left-belly" | "door-left-glass" | "door-right" | "door-right-belly" | "door-right-glass";

const X_STEP = 0.05;
const ANGLE_STEP_DEG = 5;
const within = (v: number, range: readonly [number, number]) => v > range[0] && v < range[1];

/** Which part of the fuselage surface a cell belongs to, from its centre. */
export function fuselageRegion(x: number, angleDeg: number): FuselageRegion {
  const a = Math.abs(angleDeg);
  const side = angleDeg < 0 ? "left" : "right";
  const inDoor = within(x, OPENINGS.door.x) && within(a, OPENINGS.door.angle);
  const inPane = OPENINGS.sideWindows.some((pane) => within(x, pane.x) && within(a, pane.angle));
  if (inDoor) {
    if (inPane) return `door-${side}-glass`;
    return a > OPENINGS.graphiteFromDeg ? `door-${side}-belly` : `door-${side}`;
  }
  if (inPane || (within(x, OPENINGS.windscreen.x) && a < OPENINGS.windscreen.angle[1])) return "glass";
  return a > OPENINGS.graphiteFromDeg ? "belly" : "shell";
}

/**
 * The fuselage surface as one grid of vertices shared by nine index sets, so
 * the skin, the glazing and the doors meet without a seam and shade as one body.
 */
export function fuselageGeometries(): Record<FuselageRegion, BufferGeometry> {
  return cached("fuselage", () => {
    const nx = Math.round((FUSELAGE.noseX - FUSELAGE.tailX) / X_STEP);
    const na = 360 / ANGLE_STEP_DEG;
    const cols = na + 1;
    const positions = new Float32Array((nx + 1) * cols * 3);
    const normals = new Float32Array((nx + 1) * cols * 3);
    const uvs = new Float32Array((nx + 1) * cols * 2);
    const at = (i: number, j: number) => i * cols + j;
    const xOf = (i: number) => FUSELAGE.noseX - i * X_STEP;
    const angleOf = (j: number) => -180 + j * ANGLE_STEP_DEG;

    for (let i = 0; i <= nx; i++) {
      for (let j = 0; j <= na; j++) {
        const p = fuselagePoint(xOf(i), (angleOf(j) * Math.PI) / 180);
        positions.set(p, at(i, j) * 3);
        uvs.set([i / nx, j / na], at(i, j) * 2);
      }
    }

    // Normals from the surface's own tangents (central differences, wrapping around the section).
    const p = (i: number, j: number, out: Vector3) => out.fromArray(positions, at(Math.min(nx, Math.max(0, i)), ((j % na) + na) % na) * 3);
    const a = new Vector3();
    const b = new Vector3();
    const along = new Vector3();
    const around = new Vector3();
    const normal = new Vector3();
    for (let i = 0; i <= nx; i++) {
      for (let j = 0; j <= na; j++) {
        along.subVectors(p(i + 1, j, a), p(i - 1, j, b));
        around.subVectors(p(i, j + 1, a), p(i, j - 1, b));
        normal.crossVectors(along, around);
        if (normal.lengthSq() < 1e-12) normal.set(i < nx / 2 ? 1 : -1, 0, 0);
        normals.set(normal.normalize().toArray(), at(i, j) * 3);
      }
    }

    const indices: Record<FuselageRegion, number[]> = {
      shell: [],
      belly: [],
      glass: [],
      "door-left": [],
      "door-left-belly": [],
      "door-left-glass": [],
      "door-right": [],
      "door-right-belly": [],
      "door-right-glass": [],
    };
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < na; j++) {
        const region = fuselageRegion(xOf(i) - X_STEP / 2, angleOf(j) + ANGLE_STEP_DEG / 2);
        const v00 = at(i, j);
        const v10 = at(i + 1, j);
        const v11 = at(i + 1, j + 1);
        const v01 = at(i, j + 1);
        indices[region].push(v00, v10, v01, v10, v11, v01);
      }
    }

    const position = new BufferAttribute(positions, 3);
    const normalAttribute = new BufferAttribute(normals, 3);
    const uv = new BufferAttribute(uvs, 2);
    const out = {} as Record<FuselageRegion, BufferGeometry>;
    (Object.keys(indices) as FuselageRegion[]).forEach((region) => {
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", position);
      geometry.setAttribute("normal", normalAttribute);
      geometry.setAttribute("uv", uv);
      geometry.setIndex(indices[region]);
      geometry.computeBoundingSphere();
      out[region] = geometry;
    });
    return out;
  });
}

/** A ring frame following the fuselage section at station `x`: the band between two insets from the skin. */
export function frameGeometry(x: number, outerInset = 0.02, depth = 0.11, thickness = 0.035, fromDeg = -180, toDeg = 180): BufferGeometry {
  const segments = Math.round((toDeg - fromDeg) / 6);
  const positions: number[] = [];
  const index: number[] = [];
  // Four surfaces: outer and inner walls, front and rear faces. Each keeps its own vertices for crisp edges.
  const corners = [
    [outerInset, thickness / 2],
    [outerInset, -thickness / 2],
    [outerInset + depth, -thickness / 2],
    [outerInset + depth, thickness / 2],
  ] as const;
  for (let face = 0; face < 4; face++) {
    const start = positions.length / 3;
    const [insetA, dxA] = corners[face];
    const [insetB, dxB] = corners[(face + 1) % 4];
    for (let s = 0; s <= segments; s++) {
      const angle = ((fromDeg + ((toDeg - fromDeg) * s) / segments) * Math.PI) / 180;
      const pa = fuselagePoint(x, angle, insetA);
      const pb = fuselagePoint(x, angle, insetB);
      positions.push(pa[0] + dxA, pa[1], pa[2], pb[0] + dxB, pb[1], pb[2]);
    }
    for (let s = 0; s < segments; s++) {
      const k = start + s * 2;
      index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

// ── Airfoil lofts ──

export interface AirfoilSection {
  /** Leading-edge point. */
  le: Vec3;
  chord: number;
  /** Maximum thickness as a fraction of chord. */
  thickness: number;
  /** Maximum camber as a fraction of chord, at 40% chord. */
  camber?: number;
  /** Unit vector from leading edge toward trailing edge. */
  chordDir: Vec3;
  /** Unit vector toward the upper surface. */
  thickDir: Vec3;
}

export interface LoftOptions {
  /** Chord fractions the loft covers: 0–1 is the whole section. */
  from?: number;
  to?: number;
  chordPoints?: number;
  capStart?: boolean;
  capEnd?: boolean;
}

const CAMBER_AT = 0.4;

/** Half-thickness of a NACA four-digit section (closed trailing edge) at chord fraction `x`, per unit chord. */
const halfThickness = (x: number, t: number) => 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x * x * x - 0.1036 * x * x * x * x);
const camberLine = (x: number, m: number) => (m === 0 ? 0 : x < CAMBER_AT ? (m / (CAMBER_AT * CAMBER_AT)) * (2 * CAMBER_AT * x - x * x) : (m / ((1 - CAMBER_AT) * (1 - CAMBER_AT))) * (1 - 2 * CAMBER_AT + 2 * CAMBER_AT * x - x * x));

type ProfilePoint = readonly [number, number];

/** The section outline as runs of points; each run is shaded smoothly and runs meet at a crease. */
function profileRuns(section: AirfoilSection, from: number, to: number, n: number): ProfilePoint[][] {
  const xs: number[] = [];
  for (let i = 0; i <= n; i++) {
    // Cosine spacing from a true leading edge puts the points where the curvature is.
    const u = i / n;
    xs.push(from === 0 ? to * (1 - Math.cos((u * Math.PI) / 2)) : from + (to - from) * u);
  }
  const m = section.camber ?? 0;
  const upper = xs.map((x): ProfilePoint => [x, camberLine(x, m) + halfThickness(x, section.thickness)]);
  const lower = xs.map((x): ProfilePoint => [x, camberLine(x, m) - halfThickness(x, section.thickness)]);
  const rear: ProfilePoint[] = [lower[n], upper[n]];
  if (from === 0) return [[...[...upper].reverse(), ...lower.slice(1)], rear];
  return [[...upper].reverse(), [upper[0], lower[0]], lower, rear];
}

const place = (section: AirfoilSection, [x, y]: ProfilePoint): Vec3 => [
  section.le[0] + section.chordDir[0] * x * section.chord + section.thickDir[0] * y * section.chord,
  section.le[1] + section.chordDir[1] * x * section.chord + section.thickDir[1] * y * section.chord,
  section.le[2] + section.chordDir[2] * x * section.chord + section.thickDir[2] * y * section.chord,
];

/** Loft an airfoil surface through a series of sections. */
export function airfoilLoft(sections: readonly AirfoilSection[], options: LoftOptions = {}): BufferGeometry {
  const { from = 0, to = 1, chordPoints = 14, capStart = false, capEnd = false } = options;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  const runs = sections.map((s) => profileRuns(s, from, to, chordPoints));
  const runCount = runs[0].length;

  for (let r = 0; r < runCount; r++) {
    const start = positions.length / 3;
    const width = runs[0][r].length;
    sections.forEach((section, k) => {
      runs[k][r].forEach((point, j) => {
        positions.push(...place(section, point));
        uvs.push(j / (width - 1), k / Math.max(1, sections.length - 1));
      });
    });
    for (let k = 0; k < sections.length - 1; k++) {
      for (let j = 0; j < width - 1; j++) {
        const v = start + k * width + j;
        index.push(v, v + width, v + 1, v + 1, v + width, v + width + 1);
      }
    }
  }

  const cap = (k: number, flip: boolean) => {
    const section = sections[k];
    const m = section.camber ?? 0;
    const start = positions.length / 3;
    for (let i = 0; i <= chordPoints; i++) {
      const u = i / chordPoints;
      const x = from === 0 ? to * (1 - Math.cos((u * Math.PI) / 2)) : from + (to - from) * u;
      const t = halfThickness(x, section.thickness);
      positions.push(...place(section, [x, camberLine(x, m) + t]), ...place(section, [x, camberLine(x, m) - t]));
      uvs.push(u, 0, u, 1);
    }
    for (let i = 0; i < chordPoints; i++) {
      const v = start + i * 2;
      if (flip) index.push(v, v + 2, v + 1, v + 1, v + 2, v + 3);
      else index.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
    }
  };
  const loftEnd = index.length;
  if (capStart) cap(0, false);
  if (capEnd) cap(sections.length - 1, true);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  orientOutward(positions, index, 0, loftEnd);
  orientOutward(positions, index, loftEnd, index.length);
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Make a range of triangles face away from the centre of their own vertices,
 * so a loft is wound correctly whichever way its sections were listed.
 */
function orientOutward(positions: number[], index: number[], from: number, to: number) {
  if (to <= from) return;
  const centre = new Vector3();
  const seen = new Set<number>();
  for (let i = from; i < to; i++) seen.add(index[i]);
  for (const v of seen) centre.add(new Vector3().fromArray(positions, v * 3));
  centre.divideScalar(seen.size);
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  let outward = 0;
  for (let i = from; i < to; i += 3) {
    a.fromArray(positions, index[i] * 3);
    b.fromArray(positions, index[i + 1] * 3);
    c.fromArray(positions, index[i + 2] * 3);
    const normal = b.clone().sub(a).cross(c.clone().sub(a));
    outward += normal.dot(a.add(b).add(c).divideScalar(3).sub(centre));
  }
  if (outward >= 0) return;
  for (let i = from; i < to; i += 3) [index[i + 1], index[i + 2]] = [index[i + 2], index[i + 1]];
}

/** A rotor blade along +Y, turning about +X: tapered and twisted, the 30%-chord line on the span axis. */
export function bladeGeometry(radius: number, hubRadius: number, rootChord: number, tipChord: number, rootPitchDeg: number, tipPitchDeg: number): BufferGeometry {
  return cached(`blade-${radius}-${hubRadius}-${rootChord}-${tipChord}-${rootPitchDeg}-${tipPitchDeg}`, () => {
    const stations = 9;
    const sections: AirfoilSection[] = [];
    for (let i = 0; i <= stations; i++) {
      const u = i / stations;
      const r = hubRadius + (radius - hubRadius) * u;
      // The chord swells just outboard of the root and narrows to a rounded tip.
      const chord = (rootChord + (tipChord - rootChord) * u) * (0.62 + 0.38 * Math.sin(Math.min(1, u * 3.2 + 0.25) * Math.PI * 0.5)) * (u > 0.93 ? 1 - ((u - 0.93) / 0.07) * 0.55 : 1);
      const pitch = ((rootPitchDeg + (tipPitchDeg - rootPitchDeg) * Math.pow(u, 0.8)) * Math.PI) / 180;
      const chordDir: Vec3 = [Math.sin(pitch), 0, Math.cos(pitch)];
      const thickDir: Vec3 = [Math.cos(pitch), 0, -Math.sin(pitch)];
      sections.push({
        le: [-chordDir[0] * chord * 0.3, r, -chordDir[2] * chord * 0.3],
        chord,
        thickness: 0.2 - 0.11 * u,
        camber: 0.03,
        chordDir,
        thickDir,
      });
    }
    return airfoilLoft(sections, { chordPoints: 8, capStart: true, capEnd: true });
  });
}

// ── Bodies of revolution ──

/** Revolve a profile of [x, radius] points about the X axis. */
export function revolveX(profile: readonly (readonly [number, number])[], segments = 40): BufferGeometry {
  // LatheGeometry revolves about Y; turn it so the axis lies along +X.
  const geometry = new LatheGeometry(
    profile.map(([x, r]) => new Vector2(Math.max(r, 0.0001), x)),
    segments,
  );
  geometry.rotateZ(-Math.PI / 2);
  return geometry;
}

/** A smooth curve through profile control points, for nacelles and spinners. */
export function smoothProfile(points: readonly (readonly [number, number])[], samples = 28): [number, number][] {
  const out: [number, number][] = [];
  const n = points.length - 1;
  for (let s = 0; s <= samples; s++) {
    const f = (s / samples) * n;
    const i = Math.min(n - 1, Math.floor(f));
    const t = f - i;
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n, i + 2)];
    const h = (k: 0 | 1) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t);
    out.push([h(0), Math.max(0, h(1))]);
  }
  return out;
}

// ── Box lofts ──

export interface BoxStation {
  centre: Vec3;
  /** Half-width vector. */
  right: Vec3;
  /** Half-height vector. */
  up: Vec3;
}

/** A rectangular-section member through a series of stations: spars, keel, pylons, struts. */
export function boxLoft(stations: readonly BoxStation[]): BufferGeometry {
  const positions: number[] = [];
  const index: number[] = [];
  const corner = (s: BoxStation, sr: number, su: number): Vec3 => [
    s.centre[0] + s.right[0] * sr + s.up[0] * su,
    s.centre[1] + s.right[1] * sr + s.up[1] * su,
    s.centre[2] + s.right[2] * sr + s.up[2] * su,
  ];
  const signs = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ] as const;
  for (let face = 0; face < 4; face++) {
    const start = positions.length / 3;
    const [a, b] = [signs[face], signs[(face + 1) % 4]];
    stations.forEach((s) => positions.push(...corner(s, a[0], a[1]), ...corner(s, b[0], b[1])));
    for (let k = 0; k < stations.length - 1; k++) {
      const v = start + k * 2;
      index.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
    }
  }
  const sideEnd = index.length;
  for (const s of [stations[0], stations[stations.length - 1]]) {
    const start = positions.length / 3;
    signs.forEach(([sr, su]) => positions.push(...corner(s, sr, su)));
    index.push(start, start + 1, start + 2, start, start + 2, start + 3);
  }
  orientOutward(positions, index, 0, sideEnd);
  orientOutward(positions, index, sideEnd, sideEnd + 6);
  orientOutward(positions, index, sideEnd + 6, index.length);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/** A straight box member between two points, with a width across `side` and a height along `up`. */
export function strut(from: Vec3, to: Vec3, width: number, height: number, up: Vec3 = [0, 1, 0]): BufferGeometry {
  const axis = new Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize();
  const upVector = new Vector3(...up);
  const side = new Vector3().crossVectors(axis, upVector);
  if (side.lengthSq() < 1e-6) side.set(0, 0, 1);
  side.normalize();
  const top = new Vector3().crossVectors(side, axis).normalize();
  const right = side.multiplyScalar(width / 2).toArray() as unknown as Vec3;
  const upHalf = top.multiplyScalar(height / 2).toArray() as unknown as Vec3;
  return boxLoft([
    { centre: from, right, up: upHalf },
    { centre: to, right, up: upHalf },
  ]);
}
