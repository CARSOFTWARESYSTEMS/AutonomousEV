// Facility layout and vehicle paths (SP-MATH-005, geometry part).
//
// A double-loaded car park: one one-way aisle running west → east, a row of
// perpendicular bays on each side, the entry gate at the west end and the
// exit gate at the east end. The number of bays, how many are wireless
// charging bays and how many are accessible bays are inputs: twelve bays
// (eight conventional, four wireless) is the demonstration default, six bays
// (four + two) the physical proof of concept; nothing below assumes either.
//
// Frame: x east, y north, heading anticlockwise from +x (the 3D scene draws
// z = −y). Paths are for the rear-axle reference point of a kinematic
// bicycle; a vehicle's centre is half a wheelbase ahead of it. Dimensions are
// representative, not taken from an engineering drawing.
import type { BayType, Pose2 } from "./types";

export interface LayoutInputs {
  bays: number;
  wireless: number;
  accessible: number;
  bayWidth: number;
  bayDepth: number;
  aisleWidth: number;
}

export const DEFAULT_LAYOUT: LayoutInputs = { bays: 12, wireless: 4, accessible: 1, bayWidth: 2.7, bayDepth: 5.6, aisleWidth: 6 };
/** The six-bay physical proof of concept: same logical architecture, fewer bays. */
export const POC_LAYOUT: LayoutInputs = { bays: 6, wireless: 2, accessible: 0, bayWidth: 2.7, bayDepth: 5.6, aisleWidth: 6 };

export interface Bay {
  id: string;
  index: number;
  row: "N" | "S";
  slot: number;
  type: BayType;
  /** Bay centre, m. */
  x: number;
  y: number;
  /** Heading of a vehicle parked nose-in, rad. */
  heading: number;
  width: number;
  depth: number;
  /** Centre of the wireless ground pad (wireless bays), m. */
  pad: { x: number; y: number } | null;
  /** Driving distance from the entry stop line, m. */
  drive: number;
  /** Walking distance to the pedestrian exit, m. */
  walk: number;
}

export interface Zone {
  id: number;
  name: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface Layout {
  inputs: LayoutInputs;
  bays: Bay[];
  perSide: number;
  /** West end of the first bay column, m. */
  x0: number;
  aisle: { xWest: number; xEast: number; half: number };
  entry: { barrierX: number; stopX: number; spawnX: number; beamX: number; loopX: number };
  exit: { barrierX: number; stopX: number; despawnX: number; beamX: number; loopX: number };
  pedestrian: { x: number; y: number };
  zones: Zone[];
  /** Zones of the aisle columns, by slot, for congestion estimates. */
  aisleZone: number[];
  /** Roof extent of each canopy row, m. */
  canopy: { x0: number; x1: number; yInner: number; yOuter: number };
}

/** Lane-band half width: the lane, the gates and the aisle. */
const LANE = 3;
export const TURN_RADIUS = 4.3;
export const REAR_TO_PAD = 2.05; // receiver ahead of the rear axle for the reference vehicle (0.6 m ahead of the centre)

export function buildLayout(inputs: LayoutInputs = DEFAULT_LAYOUT): Layout {
  const n = Math.max(1, Math.round(inputs.bays));
  const perSide = Math.ceil(n / 2);
  const w = inputs.bayWidth;
  const x0 = (-perSide * w) / 2;
  const half = inputs.aisleWidth / 2;
  const xWest = x0 - 4.6;
  const xEast = -x0 + 4.6;
  const entryBarrier = xWest - 2.4;
  const exitBarrier = xEast + 2.4;
  const pedestrian = { x: x0 - 1.4, y: half + inputs.bayDepth + 1.4 };
  // Slots in order: N0, S0, N1, S1 … ; wireless bays from the east end (next to the power cabinet), accessible from the west (next to the pedestrian exit).
  const slots: { row: "N" | "S"; slot: number }[] = [];
  for (let j = 0; j < perSide; j++) {
    slots.push({ row: "N", slot: j });
    if (slots.length < n) slots.push({ row: "S", slot: j });
  }
  const byEast = [...slots].sort((a, b) => b.slot - a.slot || (a.row === "N" ? -1 : 1));
  const wirelessSet = new Set(byEast.slice(0, Math.min(n, Math.max(0, Math.round(inputs.wireless)))).map((s) => `${s.row}${s.slot}`));
  const accessibleSet = new Set(slots.filter((s) => !wirelessSet.has(`${s.row}${s.slot}`)).slice(0, Math.max(0, Math.round(inputs.accessible))).map((s) => `${s.row}${s.slot}`));
  const stopX = entryBarrier - 0.9;
  const bays: Bay[] = slots.map((s, index) => {
    const sign = s.row === "N" ? 1 : -1;
    const x = x0 + (s.slot + 0.5) * w;
    const y = sign * (half + inputs.bayDepth / 2);
    const key = `${s.row}${s.slot}`;
    const type: BayType = wirelessSet.has(key) ? "wireless" : accessibleSet.has(key) ? "accessible" : "conventional";
    const padY = sign * (TURN_RADIUS + REAR_TO_PAD);
    return {
      id: `${s.row}${String(s.slot + 1).padStart(2, "0")}`,
      index,
      row: s.row,
      slot: s.slot,
      type,
      x,
      y,
      heading: (sign * Math.PI) / 2,
      width: w,
      depth: inputs.bayDepth,
      pad: type === "wireless" ? { x, y: padY } : null,
      drive: x - TURN_RADIUS - stopX + (Math.PI / 2) * TURN_RADIUS,
      walk: Math.abs(x - pedestrian.x) + Math.abs(y - pedestrian.y),
    };
  });
  const zones: Zone[] = [];
  const add = (name: string, xa: number, xb: number, ya: number, yb: number) => {
    zones.push({ id: zones.length, name, x0: xa, x1: xb, y0: ya, y1: yb });
    return zones.length - 1;
  };
  // Lane zones only. A bay is held by its atomic reservation, not by a zone: a vehicle drives only into the bay reserved for it.
  const spawnX = entryBarrier - 36;
  for (let x = spawnX - 6; x < entryBarrier - 4; x += 5) add("entry road", x, Math.min(x + 5, entryBarrier - 4), -LANE, LANE);
  add("entry gate", entryBarrier - 4, xWest, -LANE, LANE);
  add("aisle west", xWest, x0, -half, half);
  const aisleZone: number[] = [];
  for (let j = 0; j < perSide; j++) aisleZone.push(add(`aisle ${j + 1}`, x0 + j * w, x0 + (j + 1) * w, -half, half));
  add("aisle east", -x0, xEast, -half, half);
  add("exit gate", xEast, exitBarrier + 4, -LANE, LANE);
  const despawnX = exitBarrier + 36;
  for (let x = exitBarrier + 4; x < despawnX + 6; x += 5) add("exit road", x, x + 5, -LANE, LANE);
  add("turnaround", entryBarrier - 17, entryBarrier + 2.2, LANE, LANE + 11);
  add("return road", spawnX - 8, entryBarrier - 17, LANE, LANE + 11);
  return {
    inputs: { ...inputs, bays: n },
    bays,
    perSide,
    x0,
    aisle: { xWest, xEast, half },
    entry: { barrierX: entryBarrier, stopX, spawnX, beamX: entryBarrier + 1.6, loopX: entryBarrier - 3.2 },
    exit: { barrierX: exitBarrier, stopX: exitBarrier - 0.9, despawnX, beamX: exitBarrier + 1.6, loopX: exitBarrier - 3.2 },
    pedestrian,
    zones,
    aisleZone,
    canopy: { x0: x0 - 0.9, x1: -x0 + 0.9, yInner: half - 1.2, yOuter: half + inputs.bayDepth + 0.7 },
  };
}

/** The lane zone containing a point, or −1. */
export function zoneAt(layout: Layout, x: number, y: number): number {
  for (const z of layout.zones) if (x >= z.x0 && x < z.x1 && y >= z.y0 && y < z.y1) return z.id;
  return -1;
}

// ── Paths ─────────────────────────────────────────────────────────────────

export interface PathSample extends Pose2 {
  /** Arc length from the path start, m. */
  s: number;
  /** +1 driving forward, −1 reversing. */
  dir: 1 | -1;
  /** Front-wheel angle for this geometry, rad (positive turns left). */
  steer: number;
  /** Speed limit here, m/s. */
  vmax: number;
  /** Zones the vehicle's footprint covers here. */
  zones: number[];
}

export interface Path {
  samples: PathSample[];
  length: number;
  /** Arc length of a named stop point (gate stop lines), m. */
  stops: Record<string, number>;
}

export interface Footprint {
  length: number;
  width: number;
  wheelbase: number;
}

const DS = 0.1;

type Segment = { kind: "line"; length: number; dir: 1 | -1; vmax: number } | { kind: "arc"; radius: number; angle: number; dir: 1 | -1; vmax: number };

/** Samples a sequence of straight and circular segments from a start pose. Arc angle > 0 turns left (anticlockwise heading change when driving forward). */
function trace(start: Pose2, segments: Segment[], fp: Footprint, layout: Layout): PathSample[] {
  const out: PathSample[] = [];
  let { x, y, heading } = start;
  let s = 0;
  const push = (dir: 1 | -1, steer: number, vmax: number) => out.push({ x, y, heading, s, dir, steer, vmax, zones: footprintZones(layout, x, y, heading, fp) });
  for (const seg of segments) {
    if (seg.kind === "line") {
      const n = Math.max(1, Math.round(seg.length / DS));
      const h = seg.length / n;
      for (let i = 0; i < n; i++) {
        push(seg.dir, 0, seg.vmax);
        x += Math.cos(heading) * h * seg.dir;
        y += Math.sin(heading) * h * seg.dir;
        s += h;
      }
    } else {
      const len = Math.abs(seg.angle) * seg.radius;
      const n = Math.max(1, Math.round(len / DS));
      const h = len / n;
      const turn = Math.sign(seg.angle);
      // Retracing an arc in reverse uses the same wheel angle as driving it forward.
      const steer = turn * Math.atan(fp.wheelbase / seg.radius);
      for (let i = 0; i < n; i++) {
        push(seg.dir, steer, seg.vmax);
        // Exact step along the circle: chord at the mid-heading.
        const dpsi = (turn * h) / seg.radius;
        const mid = heading + (seg.dir === 1 ? dpsi / 2 : -dpsi / 2);
        const chord = 2 * seg.radius * Math.sin(h / (2 * seg.radius));
        x += Math.cos(mid) * chord * seg.dir;
        y += Math.sin(mid) * chord * seg.dir;
        heading += seg.dir === 1 ? dpsi : -dpsi;
        s += h;
      }
    }
  }
  out.push({ x, y, heading, s, dir: out.at(-1)?.dir ?? 1, steer: 0, vmax: 0, zones: footprintZones(layout, x, y, heading, fp) });
  return out;
}

/** Lane zones under a vehicle's footprint (a 5 × 3 grid of points over its plan rectangle, with a margin). Parts of the body inside a bay hold no zone. */
export function footprintZones(layout: Layout, x: number, y: number, heading: number, fp: Footprint): number[] {
  const cx = x + Math.cos(heading) * (fp.wheelbase / 2);
  const cy = y + Math.sin(heading) * (fp.wheelbase / 2);
  const c = Math.cos(heading);
  const s = Math.sin(heading);
  const L = fp.length / 2 + 0.3;
  const W = fp.width / 2 + 0.2;
  const set = new Set<number>();
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 3; j++) {
      const u = -L + (2 * L * i) / 4;
      const v = -W + (2 * W * j) / 2;
      const z = zoneAt(layout, cx + c * u - s * v, cy + s * u + c * v);
      if (z >= 0) set.add(z);
    }
  return [...set].sort((a, b) => a - b);
}

export const SPEED = { road: 5.5, aisle: 2.5, turn: 1.2, reverse: 0.8 } as const;

/** Rear-axle y of a vehicle parked nose-in with its receiver over the pad (or at the reference depth in other bays). */
export function parkedRear(bay: Bay, fp: Footprint, padOffset: number, errLong = 0): number {
  const sign = bay.row === "N" ? 1 : -1;
  // The wheel stop: the front of the vehicle stays 0.15 m inside the bay end.
  const end = Math.abs(bay.y) + bay.depth / 2 - 0.15;
  const ref = bay.pad ? Math.abs(bay.pad.y) - (fp.wheelbase / 2 + padOffset) : TURN_RADIUS;
  return sign * Math.min(end - fp.wheelbase / 2 - fp.length / 2, ref + errLong);
}

/** From the spawn point on the entry road, through the gate and the aisle, into the bay (nose-in), stopping at the entry stop line. */
export function entryPath(layout: Layout, bay: Bay, fp: Footprint, final: { rearY: number; lateral: number }): Path {
  const sign = bay.row === "N" ? 1 : -1;
  const R = Math.min(4.8, Math.max(4.15, Math.abs(final.rearY)));
  const bx = bay.x + final.lateral;
  const startX = layout.entry.spawnX;
  const turnX = bx - R;
  const rearStop = layout.entry.stopX - (fp.length / 2 + fp.wheelbase / 2);
  const segs: Segment[] = [
    { kind: "line", length: rearStop - startX, dir: 1, vmax: SPEED.road },
    { kind: "line", length: layout.aisle.xWest - rearStop, dir: 1, vmax: SPEED.aisle * 0.8 },
    { kind: "line", length: turnX - layout.aisle.xWest, dir: 1, vmax: SPEED.aisle },
    { kind: "arc", radius: R, angle: (sign * Math.PI) / 2, dir: 1, vmax: SPEED.turn },
  ];
  const rest = Math.abs(final.rearY) - R;
  if (rest > 0.02) segs.push({ kind: "line", length: rest, dir: 1, vmax: 0.6 });
  const samples = trace({ x: startX, y: 0, heading: 0 }, segs, fp, layout);
  return { samples, length: samples.at(-1)!.s, stops: { entry: rearStop - startX } };
}

/** Out of the bay in reverse (retracing the entry arc), then forward along the aisle to the exit gate and away. */
export function exitPaths(layout: Layout, bay: Bay, fp: Footprint, from: Pose2): [Path, Path] {
  const sign = bay.row === "N" ? 1 : -1;
  const R = Math.min(4.8, Math.max(4.15, Math.abs(from.y)));
  const rest = Math.abs(from.y) - R;
  const back: Segment[] = [];
  if (rest > 0.02) back.push({ kind: "line", length: rest, dir: -1, vmax: 0.5 });
  back.push({ kind: "arc", radius: R, angle: (sign * Math.PI) / 2, dir: -1, vmax: SPEED.reverse });
  const a = trace(from, back, fp, layout);
  const end = a.at(-1)!;
  const rearStop = layout.exit.stopX - (fp.length / 2 + fp.wheelbase / 2);
  const fwd: Segment[] = [
    { kind: "line", length: Math.max(0.2, rearStop - end.x), dir: 1, vmax: SPEED.aisle },
    { kind: "line", length: layout.exit.despawnX - rearStop, dir: 1, vmax: SPEED.road },
  ];
  const b = trace({ x: end.x, y: 0, heading: 0 }, fwd, fp, layout);
  const stopS = Math.max(0.2, rearStop - end.x);
  return [
    { samples: a, length: a.at(-1)!.s, stops: {} },
    { samples: b, length: b.at(-1)!.s, stops: { exit: stopS } },
  ];
}

/**
 * A vehicle refused entry first backs 3 m away from the barrier (still inside
 * the lane zone it holds), then turns round in the loop north of the lane and
 * leaves westward — so its sweep never reaches the closed boom.
 */
export function rejectPaths(layout: Layout, fp: Footprint, from: Pose2): [Path, Path] {
  const back = trace(from, [{ kind: "line", length: 3, dir: -1, vmax: 0.7 }], fp, layout);
  const end = back.at(-1)!;
  const turn = trace({ x: end.x, y: end.y, heading: end.heading }, [
    { kind: "arc", radius: TURN_RADIUS + 0.4, angle: Math.PI, dir: 1, vmax: SPEED.turn },
    { kind: "line", length: Math.max(1, end.x - layout.entry.spawnX), dir: 1, vmax: SPEED.road },
  ], fp, layout);
  return [
    { samples: back, length: back.at(-1)!.s, stops: {} },
    { samples: turn, length: turn.at(-1)!.s, stops: {} },
  ];
}

/** Pose and steering at arc length s (linear interpolation between samples). */
export function sampleAt(path: Path, s: number): PathSample {
  const list = path.samples;
  if (s <= 0) return list[0];
  if (s >= path.length) return list[list.length - 1];
  const i = Math.min(list.length - 2, Math.floor(s / DS));
  let k = i;
  while (k > 0 && list[k].s > s) k--;
  while (k < list.length - 2 && list[k + 1].s < s) k++;
  const a = list[k];
  const b = list[k + 1];
  const t = (s - a.s) / Math.max(1e-9, b.s - a.s);
  let dh = b.heading - a.heading;
  if (dh > Math.PI) dh -= 2 * Math.PI;
  if (dh < -Math.PI) dh += 2 * Math.PI;
  return { ...a, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, heading: a.heading + dh * t, s };
}

export const indexAt = (path: Path, s: number) => Math.max(0, Math.min(path.samples.length - 1, Math.round(s / DS)));
export const PATH_STEP = DS;
