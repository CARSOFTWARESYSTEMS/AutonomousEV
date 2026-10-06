// The synthetic bracket AQ-1042 as geometry, in millimetres. X runs along its
// length, Y from the front face to the rear, Z up. One definition feeds three
// drawings of the same part: the WebGL scene, the isometric fallback and the 2D
// sheet, so a balloon always points at the same feature in all of them.
//
// Nothing here imports three.js. The fallback and the server render use this
// file, and they must not pull the 3D library into the page's first load.
import type { TwinMode } from "../../data/twin";

export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];

export const PART = {
  length: 120,
  depth: 80,
  flange: 10,
  height: 60,
  /** The upright web runs from here back to the rear face. */
  webFront: 68,
  pocketFloor: 72,
  /** Where the web's top strip begins. The rear chamfer is cut from this strip. */
  capBase: 58,
  chamfer: 2,
  hole12: { x: 95, y: 28, r: 5 },
  hole13: { x: 25, y: 28, r: 5 },
  /** A slot with full-radius ends: two centres `half` either side of x. */
  slot: { x: 60, y: 28, half: 11, r: 6 },
  hole17: { x: 22, z: 35, r: 3 },
  pocket: { x0: 40, x1: 80, z0: 24, z1: 46 },
  /** Section A-A is cut through balloon 12, looking towards the left end. */
  sectionX: 95,
} as const;

export const CENTRE: Vec3 = [PART.length / 2, PART.depth / 2, PART.height / 2];

// ── Planes: a 2D outline is placed in space as origin + a·u + b·v ──

export interface Plane {
  origin: Vec3;
  u: Vec3;
  v: Vec3;
}

const S = Math.SQRT1_2;

export const PLANES = {
  /** Flange top, in (x, y). Faces up. */
  top: { origin: [0, 0, PART.flange], u: [1, 0, 0], v: [0, 1, 0] },
  /** The web's front face, in (x, z). Faces the front. */
  webFront: { origin: [0, PART.webFront, 0], u: [1, 0, 0], v: [0, 0, 1] },
  /** The flange's front face, in (x, z). */
  front: { origin: [0, 0, 0], u: [1, 0, 0], v: [0, 0, 1] },
  /** The right end, in (y, z). Faces +X. */
  rightEnd: { origin: [PART.length, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
  /** The left end, in (z, y). Faces −X. */
  leftEnd: { origin: [0, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  /** The web's top face, in (x, y). */
  webTop: { origin: [0, 0, PART.height], u: [1, 0, 0], v: [0, 1, 0] },
  /** The rear chamfer's face: along x, then down the 45° slope. */
  chamfer: { origin: [0, PART.depth - PART.chamfer, PART.height], u: [1, 0, 0], v: [0, S, -S] },
  /** The cut face of Section A-A, in (y, z). Faces +X. */
  section: { origin: [PART.sectionX, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
} as const satisfies Record<string, Plane>;

export type PlaneId = keyof typeof PLANES;

export const at = (plane: Plane, [a, b]: Vec2): Vec3 => [plane.origin[0] + a * plane.u[0] + b * plane.v[0], plane.origin[1] + a * plane.u[1] + b * plane.v[1], plane.origin[2] + a * plane.u[2] + b * plane.v[2]];

const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** The way a plane faces. */
export const normalOf = (plane: Plane): Vec3 => cross(plane.u, plane.v);

// ── Outlines ──

export function circle(cx: number, cy: number, r: number, segments = 28): Vec2[] {
  return Array.from({ length: segments }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  });
}

/** A slot outline: two half-circles of radius r, centred `half` either side of cx. */
export function stadium(cx: number, cy: number, half: number, r: number, segments = 12): Vec2[] {
  const points: Vec2[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const angle = -Math.PI / 2 + (i / segments) * Math.PI;
    points.push([cx + half + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  for (let i = 0; i <= segments; i += 1) {
    const angle = Math.PI / 2 + (i / segments) * Math.PI;
    points.push([cx - half + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return points;
}

export const rect = (a0: number, b0: number, a1: number, b1: number): Vec2[] => [
  [a0, b0],
  [a1, b0],
  [a1, b1],
  [a0, b1],
];

/** The bracket's L-shaped end, in (y, z). Approved CAD carries the rear chamfer; a reconstruction leaves the edge sharp. */
export function endProfile(mode: TwinMode): Vec2[] {
  const { depth, height, flange, webFront, chamfer } = PART;
  const rear: Vec2[] =
    mode === "cad"
      ? [
          [depth, height - chamfer],
          [depth - chamfer, height],
        ]
      : [[depth, height]];
  return [[0, 0], [depth, 0], ...rear, [webFront, height], [webFront, flange], [0, flange]];
}

// ── What each ballooned feature is, in space ──

/** A flat patch laid on a face to mark a feature: an outline, with an optional opening. */
export interface Mark {
  plane: PlaneId;
  outer: Vec2[];
  inner?: Vec2[];
}

export interface CameraView {
  /** Degrees round the vertical axis; −90 looks at the front face. */
  yaw: number;
  /** Degrees above the horizon. */
  pitch: number;
  /** 1 fits the whole part. */
  zoom: number;
}

export interface Placement {
  /** The point on the part the leader runs to. */
  anchor: Vec3;
  /** Where the balloon floats. */
  balloon: Vec3;
  /** The view the camera takes when the feature is selected. */
  view: CameraView;
  marks: (mode: TwinMode) => Mark[];
}

const { hole12, hole13, slot, hole17, pocket } = PART;
const ring = (plane: PlaneId, cx: number, cy: number, r: number): Mark => ({ plane, outer: circle(cx, cy, r + 3.5), inner: circle(cx, cy, r) });
const fixed = (marks: Mark[]) => () => marks;
const mirrored = (profile: Vec2[]): Vec2[] => profile.map(([y, z]) => [z, y] as const);

export const PLACEMENT: Record<string, Placement> = {
  b7: {
    anchor: [PART.length, 30, 5],
    balloon: [137, 12, 16],
    view: { yaw: -28, pitch: 20, zoom: 1.2 },
    // A length is measured between the two end faces.
    marks: (mode) => [
      { plane: "rightEnd", outer: endProfile(mode) },
      { plane: "leftEnd", outer: mirrored(endProfile(mode)) },
    ],
  },
  b9: {
    anchor: [42, 0, 5],
    balloon: [30, -16, -6],
    view: { yaw: -84, pitch: 10, zoom: 1.3 },
    // A thickness is one dimension of the flange: a band of its front face is enough to say which.
    marks: fixed([{ plane: "front", outer: rect(30, 0, 54, PART.flange) }]),
  },
  b12: {
    anchor: [hole12.x, hole12.y, PART.flange],
    balloon: [106, 6, 34],
    view: { yaw: -58, pitch: 42, zoom: 1.7 },
    marks: fixed([ring("top", hole12.x, hole12.y, hole12.r)]),
  },
  b13: {
    anchor: [hole13.x, hole13.y, PART.flange],
    balloon: [10, 8, 34],
    view: { yaw: -122, pitch: 42, zoom: 1.7 },
    marks: fixed([ring("top", hole13.x, hole13.y, hole13.r)]),
  },
  b18: {
    anchor: [slot.x, slot.y, PART.flange],
    balloon: [58, 2, 30],
    view: { yaw: -90, pitch: 52, zoom: 1.6 },
    marks: fixed([{ plane: "top", outer: stadium(slot.x, slot.y, slot.half, slot.r + 3.5), inner: stadium(slot.x, slot.y, slot.half, slot.r) }]),
  },
  b17: {
    anchor: [hole17.x, PART.webFront, hole17.z],
    balloon: [6, 58, 56],
    view: { yaw: -116, pitch: 18, zoom: 1.7 },
    marks: fixed([ring("webFront", hole17.x, hole17.z, hole17.r)]),
  },
  b25: {
    anchor: [60, PART.pocketFloor, 35],
    balloon: [50, 58, 64],
    view: { yaw: -98, pitch: 16, zoom: 1.6 },
    marks: fixed([{ plane: "webFront", outer: rect(pocket.x0 - 3.5, pocket.z0 - 3.5, pocket.x1 + 3.5, pocket.z1 + 3.5), inner: rect(pocket.x0, pocket.z0, pocket.x1, pocket.z1) }]),
  },
  b21: {
    anchor: [64, PART.depth - 1, PART.height - 1],
    balloon: [74, 92, 76],
    view: { yaw: 74, pitch: 32, zoom: 1.5 },
    // Approved CAD has the chamfer face. A reconstruction only knows a chamfer is wanted somewhere along the rear.
    marks: (mode) => (mode === "cad" ? [{ plane: "chamfer", outer: rect(0, 0, PART.length, PART.chamfer * Math.SQRT2) }] : [{ plane: "webTop", outer: rect(0, PART.depth - 5, PART.length, PART.depth) }]),
  },
};

/** The edge a reconstruction cannot place the chamfer on, drawn as a question rather than as geometry. */
export const UNRESOLVED_EDGE: readonly [Vec3, Vec3] = [
  [0, PART.depth, PART.height],
  [PART.length, PART.depth, PART.height],
];

export const STANDARD_VIEWS = {
  iso: { yaw: -60, pitch: 28, zoom: 1 },
  front: { yaw: -90, pitch: 0, zoom: 1 },
  top: { yaw: -90, pitch: 89, zoom: 1 },
  side: { yaw: 0, pitch: 0, zoom: 1 },
  /** The view that faces the cut of Section A-A. */
  section: { yaw: -30, pitch: 20, zoom: 1.15 },
} as const satisfies Record<string, CameraView>;

export type StandardView = keyof typeof STANDARD_VIEWS;

// ── The true edges of the solid, for the line work ──

const loop3 = (plane: Plane, outline: Vec2[]): [Vec3, Vec3][] => outline.map((point, i) => [at(plane, point), at(plane, outline[(i + 1) % outline.length])]);
const shifted = (plane: Plane, by: Vec3): Plane => ({ ...plane, origin: [plane.origin[0] + by[0], plane.origin[1] + by[1], plane.origin[2] + by[2]] });

/** Every edge of the part as a pair of points. Seams between the pieces it is built from are not edges, so they are not here. */
export function modelEdges(mode: TwinMode, segments = 28): [Vec3, Vec3][] {
  const profile = endProfile(mode);
  const bottom = shifted(PLANES.top, [0, 0, -PART.flange]);
  const rear = shifted(PLANES.webFront, [0, PART.depth - PART.webFront, 0]);
  const floor = shifted(PLANES.webFront, [0, PART.pocketFloor - PART.webFront, 0]);
  const pocketRim = rect(pocket.x0, pocket.z0, pocket.x1, pocket.z1);
  const slotRim = stadium(slot.x, slot.y, slot.half, slot.r, Math.round(segments / 2));
  return [
    ...loop3(PLANES.rightEnd, profile),
    ...loop3(shifted(PLANES.rightEnd, [-PART.length, 0, 0]), profile),
    ...profile.map(([y, z]): [Vec3, Vec3] => [
      [0, y, z],
      [PART.length, y, z],
    ]),
    ...[hole12, hole13].flatMap((hole) => [...loop3(PLANES.top, circle(hole.x, hole.y, hole.r, segments)), ...loop3(bottom, circle(hole.x, hole.y, hole.r, segments))]),
    ...loop3(PLANES.top, slotRim),
    ...loop3(bottom, slotRim),
    ...loop3(PLANES.webFront, circle(hole17.x, hole17.z, hole17.r, segments)),
    ...loop3(rear, circle(hole17.x, hole17.z, hole17.r, segments)),
    ...loop3(PLANES.webFront, pocketRim),
    ...loop3(floor, pocketRim),
    ...pocketRim.map((point): [Vec3, Vec3] => [at(PLANES.webFront, point), at(floor, point)]),
  ];
}

// ── The fixed isometric view: the fallback, and the first paint ──

const DEG = Math.PI / 180;

/** The camera's axes for a yaw and pitch: towards the viewer, screen-right and screen-up. */
export function viewBasis(yaw: number, pitch: number) {
  const cy = Math.cos(yaw * DEG);
  const sy = Math.sin(yaw * DEG);
  const cp = Math.cos(pitch * DEG);
  const sp = Math.sin(pitch * DEG);
  return { toViewer: [cp * cy, cp * sy, sp] as Vec3, right: [-sy, cy, 0] as Vec3, up: [-sp * cy, -sp * sy, cp] as Vec3 };
}

/** The drawing the fallback is made in. The WebGL camera starts on exactly this framing. */
export const ISO = { width: 400, height: 300, scale: 1.8 } as const;

const ISO_BASIS = viewBasis(STANDARD_VIEWS.iso.yaw, STANDARD_VIEWS.iso.pitch);
// Two decimals: the last digits of sin and cos differ between JavaScript engines, and the server's markup has to match the browser's.
const round = (value: number) => Math.round(value * 100) / 100;

export function isoProject(point: Vec3): Vec2 {
  const rel: Vec3 = [point[0] - CENTRE[0], point[1] - CENTRE[1], point[2] - CENTRE[2]];
  return [round(ISO.width / 2 + ISO.scale * dot(rel, ISO_BASIS.right)), round(ISO.height / 2 - ISO.scale * dot(rel, ISO_BASIS.up))];
}

const pathOf = (plane: Plane, outline: Vec2[]) => `M${outline.map((point) => isoProject(at(plane, point)).join(" ")).join(" L")} Z`;
const facesViewer = (plane: Plane) => dot(normalOf(plane), ISO_BASIS.toViewer) > 0;

/**
 * What can be seen of a recess through its opening: its floor, `depth` behind
 * the face, moved to where the view puts it and clipped to the rim. What is
 * left over is the recess's walls.
 */
function seenFloor(plane: Plane, [a0, b0, a1, b1]: readonly [number, number, number, number], depth: number): Vec2[] {
  const inward: Vec3 = [-normalOf(plane)[0] * depth, -normalOf(plane)[1] * depth, -normalOf(plane)[2] * depth];
  // Slide the floor back along the line of sight until it lies in the face's plane.
  const t = dot(inward, normalOf(plane)) / dot(ISO_BASIS.toViewer, normalOf(plane));
  const slip: Vec3 = [inward[0] - t * ISO_BASIS.toViewer[0], inward[1] - t * ISO_BASIS.toViewer[1], inward[2] - t * ISO_BASIS.toViewer[2]];
  const da = dot(slip, plane.u);
  const db = dot(slip, plane.v);
  return rect(Math.max(a0, a0 + da), Math.max(b0, b0 + db), Math.min(a1, a1 + da), Math.min(b1, b1 + db));
}

export interface IsoScene {
  faces: { id: string; d: string }[];
  /** Through openings: the holes and the slot, each showing its dark bore. */
  voids: string[];
  /** The pocket's opening, which is all wall until its floor is drawn over it. */
  pocketWalls: string;
  pocketFloor: string;
  /** The marks that are on a face this view can see, by feature. */
  marks: Record<string, string>;
  /** The reconstruction's unresolved edge, when there is one. */
  unresolved: string | null;
}

function buildIso(mode: TwinMode): IsoScene {
  const { length, flange, webFront, depth, height } = PART;
  const marks: Record<string, string> = {};
  for (const [id, placement] of Object.entries(PLACEMENT)) {
    const seen = placement.marks(mode).filter((mark) => facesViewer(PLANES[mark.plane]));
    if (seen.length) marks[id] = seen.map((mark) => pathOf(PLANES[mark.plane], mark.outer) + (mark.inner ? ` ${pathOf(PLANES[mark.plane], mark.inner)}` : "")).join(" ");
  }
  const [from, to] = UNRESOLVED_EDGE.map(isoProject);
  return {
    faces: [
      { id: "end", d: pathOf(PLANES.rightEnd, endProfile(mode)) },
      { id: "front", d: pathOf(PLANES.front, rect(0, 0, length, flange)) },
      { id: "top", d: pathOf(PLANES.top, rect(0, 0, length, webFront)) },
      { id: "front", d: pathOf(PLANES.webFront, rect(0, flange, length, height)) },
      { id: "top", d: pathOf(PLANES.webTop, rect(0, webFront, length, mode === "cad" ? depth - PART.chamfer : depth)) },
    ],
    voids: [
      pathOf(PLANES.top, circle(hole12.x, hole12.y, hole12.r)),
      pathOf(PLANES.top, circle(hole13.x, hole13.y, hole13.r)),
      pathOf(PLANES.top, stadium(slot.x, slot.y, slot.half, slot.r)),
      pathOf(PLANES.webFront, circle(hole17.x, hole17.z, hole17.r)),
    ],
    pocketWalls: pathOf(PLANES.webFront, rect(pocket.x0, pocket.z0, pocket.x1, pocket.z1)),
    pocketFloor: pathOf(PLANES.webFront, seenFloor(PLANES.webFront, [pocket.x0, pocket.z0, pocket.x1, pocket.z1], PART.pocketFloor - webFront)),
    marks,
    unresolved: mode === "reconstruction" ? `M${from.join(" ")} L${to.join(" ")}` : null,
  };
}

export const ISO_SCENES: Record<TwinMode, IsoScene> = { cad: buildIso("cad"), reconstruction: buildIso("reconstruction") };

/** Where each balloon and the end of its leader sit in the fixed view, as percentages of the viewport. */
export const ISO_BALLOONS: Record<string, { left: number; top: number; leader: string }> = Object.fromEntries(
  Object.entries(PLACEMENT).map(([id, placement]) => {
    const [x, y] = isoProject(placement.balloon);
    const [ax, ay] = isoProject(placement.anchor);
    return [id, { left: round((x / ISO.width) * 100), top: round((y / ISO.height) * 100), leader: `M${ax} ${ay} L${x} ${y}` }];
  }),
);
