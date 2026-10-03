// Small geometry kit for the procedural engine: bodies of revolution (with a
// real cut-away variant), pipes along a path, and placed primitives, merged
// into one geometry per part so a part is a single draw call.
import { BoxGeometry, type BufferGeometry, CatmullRomCurve3, CylinderGeometry, LatheGeometry, Matrix4, Quaternion, Shape, ShapeGeometry, SphereGeometry, TorusGeometry, TubeGeometry, Vector2, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type V3 = readonly [number, number, number];
/** A point on a profile: [radius, height]. */
export type RY = readonly [number, number];

/** The cut-away removes the quarter between +Z and +X, which is the side the cut views look from. */
const CUT_START = Math.PI / 2;
const CUT_LENGTH = Math.PI * 1.5;

const UP = new Vector3(0, 1, 0);
const v = (p: V3) => new Vector3(p[0], p[1], p[2]);

export function merge(parts: readonly BufferGeometry[]): BufferGeometry {
  // Primitives disagree about indices; merged geometry must not.
  const merged = mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)));
  parts.forEach((g) => g.dispose());
  return merged;
}

export function at(geometry: BufferGeometry, position: V3): BufferGeometry {
  return geometry.translate(position[0], position[1], position[2]);
}

/**
 * Body of revolution about the Y axis from a closed profile (outer wall down,
 * inner wall up). `cut` leaves a quarter out and closes the two cut faces with
 * the profile's own cross-section, so the wall reads as solid material.
 */
export function revolve(profile: readonly RY[], options: { cut?: boolean; segments?: number; centre?: V3 } = {}): BufferGeometry {
  const { cut = false, segments = 56, centre = [0, 0, 0] } = options;
  const points = [...profile, profile[0]].map(([r, y]) => new Vector2(Math.max(0.0005, r), y));
  const body = cut ? new LatheGeometry(points, Math.round(segments * 0.75), CUT_START, CUT_LENGTH) : new LatheGeometry(points, segments);
  if (!cut) return at(body, centre);
  const section = new Shape(profile.map(([r, y]) => new Vector2(r, y)));
  // One face lies in the XY plane (the +X side of the cut), the other in the YZ plane.
  const faceX = new ShapeGeometry(section);
  const faceZ = new ShapeGeometry(section).rotateY(-Math.PI / 2);
  return at(merge([body, faceX, faceZ]), centre);
}

/**
 * Closed profile of a wall of constant thickness that follows `inner`, the
 * gas-side contour from top to bottom. Outside runs upward and inside downward,
 * which is the order that makes both surfaces face away from the material.
 */
export function wall(inner: readonly RY[], offset: number, thickness: number): RY[] {
  const inside = inner.map(([r, y]) => [r + offset, y] as RY);
  const outside = inner.map(([r, y]) => [r + offset + thickness, y] as RY).reverse();
  return [...outside, ...inside];
}

/** Closed profile of a hollow body, given its outside from bottom to top. */
export function shell(outside: readonly RY[], thickness: number): RY[] {
  const inside = outside.map(([r, y]) => [Math.max(0.001, r - thickness), y] as RY).reverse();
  return [...outside, ...inside];
}

export function curve(points: readonly V3[], tension = 0.35): CatmullRomCurve3 {
  return new CatmullRomCurve3(points.map(v), false, "catmullrom", tension);
}

/** A pipe along a smooth path through `points`. */
export function pipe(points: readonly V3[], radius: number, options: { radial?: number; tension?: number } = {}): BufferGeometry {
  const path = curve(points, options.tension);
  return new TubeGeometry(path, Math.max(12, Math.round(path.getLength() * 44)), radius, options.radial ?? 14, false);
}

/** Cylinder (or cone, with `topRadius`) between two points. */
export function rod(from: V3, to: V3, radius: number, options: { topRadius?: number; radial?: number } = {}): BufferGeometry {
  const a = v(from);
  const b = v(to);
  const direction = b.clone().sub(a);
  const geometry = new CylinderGeometry(options.topRadius ?? radius, radius, direction.length(), options.radial ?? 16);
  const matrix = new Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new Quaternion().setFromUnitVectors(UP, direction.normalize()), new Vector3(1, 1, 1));
  return geometry.applyMatrix4(matrix);
}

/** Vertical cylinder centred on `centre`. */
export function drum(radius: number, height: number, centre: V3, options: { topRadius?: number; radial?: number } = {}): BufferGeometry {
  return at(new CylinderGeometry(options.topRadius ?? radius, radius, height, options.radial ?? 28), centre);
}

/** Ring lying flat around the Y axis. `cut` leaves out the same quarter the cut-away bodies do. */
export function ring(radius: number, tube: number, centre: V3, cut = false): BufferGeometry {
  const geometry = cut ? new TorusGeometry(radius, tube, 10, 34, Math.PI * 1.5).rotateX(Math.PI / 2).rotateY(-Math.PI / 2) : new TorusGeometry(radius, tube, 10, 44).rotateX(Math.PI / 2);
  return at(geometry, centre);
}

export function block(size: V3, centre: V3, yaw = 0): BufferGeometry {
  const geometry = new BoxGeometry(size[0], size[1], size[2]);
  if (yaw) geometry.rotateY(yaw);
  return at(geometry, centre);
}

export function ball(radius: number, centre: V3, scale: V3 = [1, 1, 1]): BufferGeometry {
  return at(new SphereGeometry(radius, 22, 16).scale(scale[0], scale[1], scale[2]), centre);
}

/** A flange at a point along a pipe's direction. */
export function flange(centre: V3, toward: V3, radius: number, thickness = 0.022): BufferGeometry {
  const a = v(centre);
  const direction = v(toward).sub(a).normalize().multiplyScalar(thickness / 2);
  const start = a.clone().sub(direction);
  const end = a.clone().add(direction);
  return rod([start.x, start.y, start.z], [end.x, end.y, end.z], radius, { radial: 24 });
}

/** `count` copies of what `make` builds, spaced evenly around the Y axis through `centre`. */
export function around(count: number, centre: V3, make: (angle: number) => BufferGeometry): BufferGeometry[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return at(make(angle).rotateY(angle), centre);
  });
}

/** Points along a pipe path, for whatever needs to travel along it. */
export function samplePath(points: readonly V3[], count: number, tension?: number): Vector3[] {
  return curve(points, tension).getSpacedPoints(count);
}
