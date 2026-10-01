// Geometry configuration for the UFlight™ Reference eVTOL: principal
// dimensions, where each assembly sits and how it separates in the exploded
// view. Pure numbers — no three.js — so data, simulation, camera and tests can
// all read it. Swapping in an authored model means supplying another layout.
//
// Aircraft frame, 1 unit = 1 m: +X forward (nose), +Y up, +Z starboard.
// The ground is y = 0 with the aircraft resting on its landing gear.
//
// Configuration (a reference concept, not a certified design):
//   · pod fuselage, 1 pilot + 5 passengers in three rows, battery under the floor
//   · high wing carrying four tilting propulsion units ahead of the leading edge
//   · two booms under the wing, each carrying a fore and an aft lift unit
//   · the booms continue aft to twin fins joined by a high horizontal tail
import type { ComponentId, ModuleNo, PropulsionPart, PropulsionUnitId, UnitNo, Vec3 } from "../types";

// ── Fuselage ──

export const FUSELAGE = {
  noseX: 3.6,
  tailX: -3.45,
  halfWidth: 0.86,
  bellyY: 0.42,
  floorY: 0.74,
  ceilingY: 1.96,
  topY: 2.06,
  /** Rear cabin bulkhead; the equipment bay lies behind it. */
  bulkheadX: -1.05,
} as const;

/**
 * Cross-section control stations, nose to tail:
 * [x, half-width, top, bottom, upper exponent, lower exponent].
 * The lower half is squarer through the cabin: a flat belly, so the battery
 * packs fit under the floor inside the section.
 */
const STATIONS: readonly (readonly [number, number, number, number, number, number])[] = [
  [3.6, 0.02, 1.03, 0.99, 2.0, 2.0],
  [3.52, 0.17, 1.15, 0.86, 2.0, 2.0],
  [3.32, 0.34, 1.31, 0.72, 2.05, 2.2],
  [3.0, 0.52, 1.53, 0.59, 2.2, 2.7],
  [2.55, 0.69, 1.77, 0.49, 2.4, 3.5],
  [2.05, 0.81, 1.94, 0.44, 2.6, 4.7],
  [1.45, 0.86, 2.04, 0.42, 2.7, 5.5],
  [0.6, 0.86, 2.06, 0.42, 2.75, 5.5],
  [-0.6, 0.86, 2.06, 0.42, 2.75, 5.5],
  [-1.35, 0.81, 2.03, 0.47, 2.6, 4.6],
  [-2.15, 0.63, 1.93, 0.68, 2.35, 3.2],
  [-2.85, 0.39, 1.75, 0.98, 2.15, 2.4],
  [-3.28, 0.17, 1.57, 1.25, 2.0, 2.0],
  [-3.45, 0.02, 1.43, 1.39, 2.0, 2.0],
];

/** Monotone cubic (Fritsch–Carlson) interpolation: smooth, and never overshoots the stations. */
function monotone(xs: number[], ys: number[]): (x: number) => number {
  const n = xs.length;
  const d: number[] = [];
  const m: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
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
    const c = Math.min(xs[n - 1], Math.max(xs[0], x));
    let i = 0;
    while (i < n - 2 && c > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (c - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

// Stations are listed nose to tail; the interpolators need ascending x.
const ASC = [...STATIONS].reverse();
const SX = ASC.map((s) => s[0]);
const widthAt = monotone(SX, ASC.map((s) => s[1]));
const topAt = monotone(SX, ASC.map((s) => s[2]));
const bottomAt = monotone(SX, ASC.map((s) => s[3]));
const exponentAt = monotone(SX, ASC.map((s) => s[4]));
const lowerExponentAt = monotone(SX, ASC.map((s) => s[5]));

export interface FuselageSection {
  halfWidth: number;
  top: number;
  bottom: number;
  /** Superellipse exponent of the upper half: 2 is an ellipse, higher is squarer. */
  exponent: number;
  /** Exponent of the lower half. */
  lowerExponent: number;
}

export function fuselageSection(x: number): FuselageSection {
  return { halfWidth: widthAt(x), top: topAt(x), bottom: bottomAt(x), exponent: exponentAt(x), lowerExponent: lowerExponentAt(x) };
}

/**
 * Point on the fuselage surface at station `x`. `angle` is measured from the
 * top centreline, positive toward starboard: 0 = crown, ±π = keel.
 */
export function fuselagePoint(x: number, angle: number, inset = 0): Vec3 {
  const s = fuselageSection(x);
  const cy = (s.top + s.bottom) / 2;
  const ry = Math.max(0.001, (s.top - s.bottom) / 2 - inset);
  const rz = Math.max(0.001, s.halfWidth - inset);
  const c = Math.cos(angle);
  const sn = Math.sin(angle);
  const e = 2 / (c >= 0 ? s.exponent : s.lowerExponent);
  return [x, cy + ry * Math.sign(c) * Math.pow(Math.abs(c), e), rz * Math.sign(sn) * Math.pow(Math.abs(sn), e)];
}

/** Half-width of the fuselage interior at station `x` and height `y`, a little inside the skin. */
export function fuselageHalfWidthAt(x: number, y: number, inset = 0.03): number {
  const s = fuselageSection(x);
  const cy = (s.top + s.bottom) / 2;
  const ry = Math.max(0.001, (s.top - s.bottom) / 2 - inset);
  const rz = Math.max(0.001, s.halfWidth - inset);
  const n = y >= cy ? s.exponent : s.lowerExponent;
  const v = Math.min(1, Math.abs(y - cy) / ry);
  return rz * Math.pow(Math.max(0, 1 - Math.pow(v, n)), 1 / n);
}

/** Glazing and door regions on the fuselage surface, as [x from, x to] and [angle from, angle to] in degrees. */
export const OPENINGS = {
  windscreen: { x: [1.6, 3.05] as const, angle: [0, 80] as const },
  /** Side panes, front to rear. The first two sit in the cabin door; the pillars between panes carry the frames. */
  sideWindows: [
    { x: [0.75, 1.35] as const, angle: [40, 85] as const },
    { x: [0.15, 0.65] as const, angle: [40, 85] as const },
    { x: [-0.6, -0.1] as const, angle: [40, 85] as const },
  ],
  /** The door sits between the forward frame and the main wing frame. */
  door: { x: [0.1, 1.4] as const, angle: [35, 105] as const },
  /** Below this angle from the crown the skin is ceramic white; beyond it, graphite. */
  graphiteFromDeg: 112,
} as const;

/** Ring-frame stations. The third and fourth carry the main and rear wing spars; the fifth is the cabin bulkhead. */
export const FRAME_STATIONS = [2.3, 1.45, 0.0, -0.65, FUSELAGE.bulkheadX, -1.9] as const;

// ── Cabin ──

export const CABIN = {
  rowX: [1.55, 0.5, -0.5] as const,
  seatZ: 0.39,
  seatBaseY: FUSELAGE.floorY,
  panelX: 2.28,
} as const;

// ── Wing ──

export const WING = {
  semiSpan: 7.25,
  rootChord: 1.7,
  tipChord: 1.0,
  /** Height of the chord line on the centreline. */
  y: 2.14,
  /** Rise per metre of span (about 1.5° of dihedral). */
  dihedral: 0.026,
  /** The main spar sits at 30% chord and is straight in plan, on the main wing frame. */
  sparX: 0.0,
  mainSparFraction: 0.3,
  rearSparFraction: 0.68,
  /** The control surfaces occupy the chord aft of this fraction. */
  hingeFraction: 0.72,
  rootThickness: 0.15,
  tipThickness: 0.12,
  /** Where the wing box meets the fuselage side. */
  rootZ: 0.6,
  flaperon: { from: 2.55, to: 6.6 },
} as const;

export const wingChord = (z: number) => WING.rootChord + (WING.tipChord - WING.rootChord) * (Math.abs(z) / WING.semiSpan);
export const wingLeadingEdge = (z: number) => WING.sparX + WING.mainSparFraction * wingChord(z);
export const wingY = (z: number) => WING.y + WING.dihedral * Math.abs(z);
export const wingThickness = (z: number) => WING.rootThickness + (WING.tipThickness - WING.rootThickness) * (Math.abs(z) / WING.semiSpan);
/** Point on the chord line at `fraction` of chord behind the leading edge. */
export const wingPoint = (z: number, fraction: number): Vec3 => [wingLeadingEdge(z) - fraction * wingChord(z), wingY(z), z];

// ── Booms and tail ──

export const BOOM = {
  z: 2.3,
  y: 1.98,
  radius: 0.15,
  noseX: 3.32,
  tailX: -5.95,
} as const;

export const TAIL = {
  fin: { rootLeX: -4.9, rootChord: 1.05, tipLeX: -5.22, tipChord: 0.78, rootY: BOOM.y + 0.06, tipY: 3.46, thickness: 0.1 },
  horizontal: { leX: -5.2, chord: 0.86, y: 3.46, halfSpan: 2.72, thickness: 0.1 },
  elevator: { hingeFraction: 0.68, halfSpan: 2.18 },
  rudder: { hingeFraction: 0.64, fromY: 2.3, toY: 3.3 },
} as const;

// ── Landing gear ──

export const GEAR = {
  nose: { mount: [2.32, 0.52, 0] as Vec3, axle: [2.42, 0.19, 0] as Vec3, wheelRadius: 0.19 },
  main: { mountX: -0.62, mountY: 0.56, mountZ: 0.72, axleX: -0.72, axleY: 0.21, axleZ: 1.12, wheelRadius: 0.21 },
} as const;

// ── Propulsion ──

export const ROTOR = {
  tiltRadius: 1.25,
  liftRadius: 1.1,
  tiltBlades: 5,
  liftBlades: 2,
} as const;

/** Span stations of the tilt units. Spacing leaves clear air between neighbouring discs. */
export const TILT_Z = { inboard: 4.2, outboard: 6.85 } as const;

export type UnitKind = "tilt" | "lift";

export interface UnitMount {
  no: UnitNo;
  id: PropulsionUnitId;
  kind: UnitKind;
  /** Tilt pivot (tilt units) or the boom centre under the rotor (lift units). */
  pivot: Vec3;
  /** −1 port, +1 starboard. */
  side: -1 | 1;
  /** Rotation sense, alternated so torque cancels across the aircraft. */
  spin: -1 | 1;
  label: string;
}

/** The pivot is carried ahead of the leading edge so the rotor wake in hover mostly misses the wing. */
const TILT_PIVOT_X = WING.sparX + 0.98;
const tiltPivot = (z: number): Vec3 => [TILT_PIVOT_X, wingY(z) - 0.02, z];

export const UNIT_MOUNTS: readonly UnitMount[] = [
  { no: "01", id: "propulsion-unit-01", kind: "tilt", pivot: tiltPivot(-TILT_Z.outboard), side: -1, spin: 1, label: "Port outboard tilt" },
  { no: "02", id: "propulsion-unit-02", kind: "tilt", pivot: tiltPivot(-TILT_Z.inboard), side: -1, spin: -1, label: "Port inboard tilt" },
  { no: "03", id: "propulsion-unit-03", kind: "tilt", pivot: tiltPivot(TILT_Z.inboard), side: 1, spin: 1, label: "Starboard inboard tilt" },
  { no: "04", id: "propulsion-unit-04", kind: "tilt", pivot: tiltPivot(TILT_Z.outboard), side: 1, spin: -1, label: "Starboard outboard tilt" },
  { no: "05", id: "propulsion-unit-05", kind: "lift", pivot: [2.7, BOOM.y, -BOOM.z], side: -1, spin: -1, label: "Port forward lift" },
  { no: "06", id: "propulsion-unit-06", kind: "lift", pivot: [2.7, BOOM.y, BOOM.z], side: 1, spin: 1, label: "Starboard forward lift" },
  { no: "07", id: "propulsion-unit-07", kind: "lift", pivot: [-2.8, BOOM.y, -BOOM.z], side: -1, spin: 1, label: "Port aft lift" },
  { no: "08", id: "propulsion-unit-08", kind: "lift", pivot: [-2.8, BOOM.y, BOOM.z], side: 1, spin: -1, label: "Starboard aft lift" },
];

export const UNIT_NUMBERS = UNIT_MOUNTS.map((u) => u.no);
export const unitMount = (no: UnitNo): UnitMount => UNIT_MOUNTS[Number(no) - 1];
export const unitIndex = (no: UnitNo) => Number(no) - 1;

/**
 * Stations along a unit's thrust axis (local +X, origin at the pivot). Lift
 * units are shorter: a pancake motor on a mast above the boom, with the
 * electronics inside the boom behind it (local +Y is aft for a lift unit).
 */
export interface UnitStations {
  hub: number;
  bearingFront: number;
  motor: number;
  motorLength: number;
  motorRadius: number;
  bearingRear: number;
  resolver: number;
  inverter: Vec3;
  inverterSize: Vec3;
  controller: Vec3;
  controllerSize: Vec3;
  /** Local radius of the housing around the drive line. */
  shellRadius: number;
}

export const UNIT_STATIONS: Record<UnitKind, UnitStations> = {
  tilt: {
    hub: 0.95,
    bearingFront: 0.74,
    motor: 0.5,
    motorLength: 0.3,
    motorRadius: 0.17,
    bearingRear: 0.27,
    resolver: 0.19,
    inverter: [-0.1, -0.02, 0],
    inverterSize: [0.34, 0.2, 0.26],
    controller: [-0.36, 0, 0],
    controllerSize: [0.15, 0.12, 0.16],
    shellRadius: 0.22,
  },
  lift: {
    hub: 0.46,
    bearingFront: 0.36,
    motor: 0.23,
    motorLength: 0.16,
    motorRadius: 0.19,
    bearingRear: 0.11,
    resolver: 0.05,
    inverter: [-0.01, 0.4, 0],
    inverterSize: [0.17, 0.3, 0.19],
    controller: [-0.01, 0.72, 0],
    controllerSize: [0.15, 0.2, 0.17],
    shellRadius: 0.215,
  },
};

/** World position of a point given in a unit's local frame, for a tilt angle in degrees (90 = thrust axis up). */
export function unitPoint(mount: UnitMount, local: Vec3, tiltDeg = 90): Vec3 {
  const a = ((mount.kind === "lift" ? 90 : tiltDeg) * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [mount.pivot[0] + local[0] * c - local[1] * s, mount.pivot[1] + local[0] * s + local[1] * c, mount.pivot[2] + local[2]];
}

// ── Energy ──

export const BATTERY = {
  /** Centre of each pack either side of the keel. */
  packZ: 0.35,
  packWidth: 0.56,
  fromX: -0.92,
  toX: 1.72,
  bottomY: 0.47,
  topY: 0.7,
  modulesPerPack: 4,
} as const;

const MODULE_LENGTH = (BATTERY.toX - BATTERY.fromX) / BATTERY.modulesPerPack;

/** Module 01–04 fill the port pack front to rear; 05–08 the starboard pack. */
export function moduleCentre(no: ModuleNo): Vec3 {
  const index = Number(no) - 1;
  const slot = index % BATTERY.modulesPerPack;
  const side = index < BATTERY.modulesPerPack ? -1 : 1;
  return [BATTERY.toX - MODULE_LENGTH * (slot + 0.5), (BATTERY.bottomY + BATTERY.topY) / 2, side * BATTERY.packZ];
}
export const MODULE_SIZE: Vec3 = [MODULE_LENGTH - 0.05, BATTERY.topY - BATTERY.bottomY - 0.05, BATTERY.packWidth - 0.07];
export const MODULE_NUMBERS: readonly ModuleNo[] = ["01", "02", "03", "04", "05", "06", "07", "08"];

// ── Equipment positions (centres) ──

const BAY_Y = 1.02;

export const EQUIPMENT = {
  // Forward bay, under the flight deck floor and in the nose.
  "fcc-a": [2.62, 0.84, 0] as Vec3,
  "imu-a": [2.36, 0.83, 0.26] as Vec3,
  "vision-sensors": [3.42, 1.0, 0] as Vec3,
  "air-data": [3.12, 1.0, 0] as Vec3,
  "radar-altimeter": [1.98, 0.47, 0] as Vec3,
  "flight-displays": [CABIN.panelX, 1.3, 0] as Vec3,
  "pilot-controls": [1.82, 1.02, -0.62] as Vec3,
  // Rear equipment bay, behind the cabin bulkhead.
  "fcc-b": [-1.4, BAY_Y, -0.4] as Vec3,
  "fcc-c": [-1.4, BAY_Y, 0.4] as Vec3,
  "nav-processor": [-1.4, BAY_Y + 0.26, 0] as Vec3,
  "imu-b": [-1.42, BAY_Y - 0.04, 0] as Vec3,
  "actuator-controllers": [-1.82, BAY_Y, -0.3] as Vec3,
  "network-switch-a": [-1.4, BAY_Y + 0.26, -0.4] as Vec3,
  "network-switch-b": [-1.4, BAY_Y + 0.26, 0.4] as Vec3,
  "avionics-rack": [-1.55, BAY_Y + 0.08, 0] as Vec3,
  "hums-computer": [-1.82, BAY_Y, 0.3] as Vec3,
  "edge-processor": [-1.82, BAY_Y + 0.26, 0.3] as Vec3,
  "sensor-gateway": [-1.82, BAY_Y + 0.26, -0.3] as Vec3,
  "maintenance-gateway": [-2.2, BAY_Y + 0.14, 0.24] as Vec3,
  "secure-gateway": [-2.2, BAY_Y + 0.14, -0.24] as Vec3,
  "ground-link": [-2.2, BAY_Y + 0.42, -0.2] as Vec3,
  "maintenance-link": [-2.2, BAY_Y + 0.42, 0.2] as Vec3,
  "dcdc-converter": [-1.52, 0.68, 0.34] as Vec3,
  "lvdc-bus": [-1.52, 0.68, -0.3] as Vec3,
  "hv-contactors": [-1.26, 0.6, 0] as Vec3,
  "bms-primary": [-1.08, 0.6, -0.37] as Vec3,
  "bms-secondary": [-1.08, 0.6, 0.37] as Vec3,
  "charging-interface": [-1.52, 0.92, -0.78] as Vec3,
  // Thermal, low in the rear fuselage with the ram-air exchanger on the belly.
  "coolant-pumps": [-1.82, 0.64, 0.24] as Vec3,
  "cooling-manifold": [-1.22, 0.5, 0.52] as Vec3,
  "heat-exchanger": [-2.02, 0.6, 0] as Vec3,
  "avionics-cooling": [-1.6, 0.82, 0] as Vec3,
  // On the airframe.
  gnss: [0.9, FUSELAGE.topY + 0.03, 0] as Vec3,
  magnetometer: [-3.1, 1.52, 0] as Vec3,
  antennas: [-0.9, FUSELAGE.topY + 0.05, 0] as Vec3,
  "acquisition-node-wing-left": [WING.sparX + 0.06, wingY(-3.4), -3.4] as Vec3,
  "acquisition-node-wing-right": [WING.sparX + 0.06, wingY(3.4), 3.4] as Vec3,
  "acquisition-node-fuselage": [0.3, 0.8, 0.02] as Vec3,
  "acquisition-node-tail": [-4.6, BOOM.y, BOOM.z] as Vec3,
} as const;

// ── Placement: anchors and exploded-view displacement for every component ──

export interface Placement {
  /** Label, camera and flow anchor, aircraft coordinates. */
  anchor: Vec3;
  /** Approximate radius, for framing the camera. */
  radius: number;
  /** Level 1: displacement of the major assembly at 100% exploded. */
  explode: Vec3;
  /** Level 2: additional displacement of the part within its assembly, in the part's parent frame. */
  explode2: Vec3;
  /** Preferred viewing direction for the focus camera: [azimuth°, polar°]. */
  view?: readonly [number, number];
}

const place = (anchor: Vec3, radius: number, explode: Vec3 = [0, 0, 0], explode2: Vec3 = [0, 0, 0], view?: readonly [number, number]): Placement => ({
  anchor,
  radius,
  explode,
  explode2,
  view,
});

/** The whole aircraft rises this far at 100% exploded, so assemblies can separate downward clear of the floor. */
export const EXPLODED_LIFT = 1.7;

// Logical assembly axes: the wing lifts off the fuselage, the booms drop from
// the wing and the tail slides aft off the booms, propulsion units leave along
// their mounts, the battery and landing gear drop from the keel, equipment
// slides out of its bay along the fuselage axis.
const WING_UP: Vec3 = [0, 1.75, 0];
const BOOM_OUT: Vec3 = [0, 0.95, 0];
const TAIL_OUT: Vec3 = [-1.5, 0.95, 0];
const BATTERY_DOWN: Vec3 = [0, -1.0, 0];
const BAY_AFT: Vec3 = [-2.7, 0.25, 0];
const NOSE_FWD: Vec3 = [1.5, 0, 0];
const THERMAL_OUT: Vec3 = [-1.5, -0.95, 0];

const equipment = (id: keyof typeof EQUIPMENT, radius: number, explode: Vec3, explode2: Vec3 = [0, 0, 0], view?: readonly [number, number]) =>
  place(EQUIPMENT[id], radius, explode, explode2, view);

/** Level 2 spread of a propulsion unit's sub-assemblies, local to the unit (X is the thrust axis). */
const UNIT_EXPLODE2: Record<UnitKind, Record<PropulsionPart, Vec3>> = {
  tilt: {
    rotor: [1.25, 0, 0],
    "bearing-front": [0.86, 0, 0],
    shaft: [0.52, 0, 0],
    motor: [0.14, 0, 0],
    "bearing-rear": [-0.26, 0, 0],
    resolver: [-0.52, 0, 0],
    inverter: [-0.86, -0.34, 0],
    "motor-controller": [-1.12, 0.3, 0],
    "cooling-interface": [0.14, -0.62, 0],
    sensors: [0.3, 0.62, 0],
    "tilt-actuator": [0, 0, 0],
    nacelle: [0, 0, 0],
  },
  lift: {
    rotor: [0.9, 0, 0],
    "bearing-front": [0.62, 0, 0],
    shaft: [0.4, 0, 0],
    motor: [0.14, 0, 0],
    "bearing-rear": [-0.2, 0, 0],
    resolver: [-0.42, 0, 0],
    inverter: [-0.62, 0.3, 0],
    "motor-controller": [-0.62, 0.72, 0],
    "cooling-interface": [0.14, -0.55, 0],
    sensors: [0.3, 0, 0.5],
    "tilt-actuator": [0, 0, 0],
    nacelle: [0, 0, 0],
  },
};

export const PROPULSION_PARTS: readonly PropulsionPart[] = [
  "nacelle",
  "rotor",
  "shaft",
  "bearing-front",
  "bearing-rear",
  "motor",
  "resolver",
  "inverter",
  "motor-controller",
  "tilt-actuator",
  "cooling-interface",
  "sensors",
];

/** Local position of a sub-assembly inside its unit. */
export function unitPartLocal(kind: UnitKind, part: PropulsionPart): Vec3 {
  const s = UNIT_STATIONS[kind];
  switch (part) {
    case "rotor":
      return [s.hub, 0, 0];
    case "shaft":
      return [(s.hub + s.bearingRear) / 2, 0, 0];
    case "bearing-front":
      return [s.bearingFront, 0, 0];
    case "bearing-rear":
      return [s.bearingRear, 0, 0];
    case "motor":
      return [s.motor, 0, 0];
    case "resolver":
      return [s.resolver, 0, 0];
    case "inverter":
      return s.inverter;
    case "motor-controller":
      return s.controller;
    case "cooling-interface":
      return [s.motor, -s.motorRadius - 0.03, 0];
    case "sensors":
      return [s.bearingFront, s.shellRadius - 0.1, 0];
    case "tilt-actuator":
      return [0, 0, 0];
    case "nacelle":
      return [s.motor, 0, 0];
  }
}

const PART_RADIUS: Record<PropulsionPart, number> = {
  nacelle: 0.9,
  rotor: 1.15,
  shaft: 0.36,
  "bearing-front": 0.16,
  "bearing-rear": 0.16,
  motor: 0.3,
  resolver: 0.14,
  inverter: 0.3,
  "motor-controller": 0.24,
  "tilt-actuator": 0.3,
  "cooling-interface": 0.3,
  sensors: 0.3,
};

function propulsionPlacements(): Partial<Record<ComponentId, Placement>> {
  const out: Partial<Record<ComponentId, Placement>> = {};
  for (const mount of UNIT_MOUNTS) {
    const tilt = mount.kind === "tilt";
    // Tilt units leave forward along their pylons; lift units rise off the booms.
    const explode: Vec3 = tilt ? [1.55, WING_UP[1], mount.side * 0.35] : [0, BOOM_OUT[1] + 1.05, 0];
    const hub = unitPoint(mount, [UNIT_STATIONS[mount.kind].hub * 0.55, 0, 0]);
    out[mount.id] = place(hub, tilt ? 1.35 : 1.25, explode, [0, 0, 0], [mount.side > 0 ? 62 : 118, 66]);
    for (const part of PROPULSION_PARTS) {
      if (part === "tilt-actuator" && !tilt) continue;
      out[`pu${mount.no}-${part}`] = place(unitPoint(mount, unitPartLocal(mount.kind, part)), PART_RADIUS[part], explode, UNIT_EXPLODE2[mount.kind][part], [
        mount.side > 0 ? 62 : 118,
        62,
      ]);
    }
  }
  return out;
}

function modulePlacements(): Partial<Record<ComponentId, Placement>> {
  const out: Partial<Record<ComponentId, Placement>> = {};
  MODULE_NUMBERS.forEach((no, index) => {
    const slot = index % BATTERY.modulesPerPack;
    // Modules lift out of the tray and fan along the pack.
    out[`battery-module-${no}`] = place(moduleCentre(no), 0.42, BATTERY_DOWN, [(1.5 - slot) * 0.2, 0.42, 0], [index < 4 ? 118 : 62, 58]);
  });
  return out;
}

const FIXED_PLACEMENT: Partial<Record<ComponentId, Placement>> = {
  // Structures
  "fuselage-shell": place([0.2, 1.25, 0], 3.6),
  glazing: place([2.3, 1.72, 0], 1.4, [0, 0, 0], [0.55, 0.75, 0], [70, 62]),
  "door-left": place([0.6, 1.1, -FUSELAGE.halfWidth], 1.1, [0, 0, -1.1], [0, 0, -0.5], [150, 76]),
  "door-right": place([0.6, 1.1, FUSELAGE.halfWidth], 1.1, [0, 0, 1.1], [0, 0, 0.5], [30, 76]),
  "fuselage-frames": place([0, 1.25, 0], 3.2, [0, 0, 0], [0, 0, 0], [56, 64]),
  "floor-structure": place([0.4, FUSELAGE.floorY, 0], 1.9, [0, 0, 0], [0, 0, 0], [50, 50]),
  "wing-skin-left": place([-0.2, wingY(-3.5), -3.5], 3.8, WING_UP, [0, 0.75, 0], [150, 48]),
  "wing-skin-right": place([-0.2, wingY(3.5), 3.5], 3.8, WING_UP, [0, 0.75, 0], [30, 48]),
  "wing-structure-left": place([-0.2, wingY(-3.5), -3.5], 3.6, WING_UP, [0, 0, 0], [150, 48]),
  "wing-structure-right": place([-0.2, wingY(3.5), 3.5], 3.6, WING_UP, [0, 0, 0], [30, 48]),
  "boom-left": place([-1.4, BOOM.y, -BOOM.z], 4.2, BOOM_OUT, [0, 0, 0], [140, 66]),
  "boom-right": place([-1.4, BOOM.y, BOOM.z], 4.2, BOOM_OUT, [0, 0, 0], [40, 66]),
  "horizontal-tail": place([-5.6, TAIL.horizontal.y, 0], 2.6, [TAIL_OUT[0], TAIL_OUT[1] + 0.8, 0], [0, 0, 0], [200, 60]),
  "vertical-tail-left": place([-5.5, 2.7, -BOOM.z], 1.2, TAIL_OUT, [0, 0, 0], [160, 74]),
  "vertical-tail-right": place([-5.5, 2.7, BOOM.z], 1.2, TAIL_OUT, [0, 0, 0], [20, 74]),
  "nose-gear": place([2.4, 0.3, 0], 0.5, [0.2, -0.95, 0], [0, 0, 0], [60, 84]),
  "main-gear-left": place([-0.7, 0.3, -1.05], 0.55, [0, -0.95, -0.4], [0, 0, 0], [140, 84]),
  "main-gear-right": place([-0.7, 0.3, 1.05], 0.55, [0, -0.95, 0.4], [0, 0, 0], [40, 84]),
  "cabin-seats": place([0.5, 1.15, 0], 1.6, [0, 0, 0], [0, 0.55, 0], [48, 52]),
  "cabin-interior": place([1.4, 1.2, 0], 1.6, [0, 0, 0], [0, 0, 0], [48, 52]),

  // Energy
  "battery-pack-left": place([0.4, 0.58, -BATTERY.packZ], 1.5, BATTERY_DOWN, [0, -0.3, 0], [118, 62]),
  "battery-pack-right": place([0.4, 0.58, BATTERY.packZ], 1.5, BATTERY_DOWN, [0, -0.3, 0], [62, 62]),
  "bms-primary": equipment("bms-primary", 0.22, BATTERY_DOWN, [-0.4, 0.3, 0]),
  "bms-secondary": equipment("bms-secondary", 0.22, BATTERY_DOWN, [-0.4, 0.3, 0]),
  "hv-contactors": equipment("hv-contactors", 0.3, BATTERY_DOWN, [-0.75, 0, 0]),
  "hvdc-bus": place([WING.sparX, WING.y - 0.06, 0], 3.0, [0, 0, 0], [0, 0, 0], [50, 50]),
  "lvdc-bus": equipment("lvdc-bus", 0.26, BAY_AFT),
  "dcdc-converter": equipment("dcdc-converter", 0.26, BAY_AFT),
  "charging-interface": equipment("charging-interface", 0.24, [0, 0, -0.9], [0, 0, 0], [150, 80]),

  // Flight controls
  "fcc-a": equipment("fcc-a", 0.26, NOSE_FWD, [0, 0, 0], [60, 60]),
  "fcc-b": equipment("fcc-b", 0.26, BAY_AFT, [0, 0, -0.35]),
  "fcc-c": equipment("fcc-c", 0.26, BAY_AFT, [0, 0, 0.35]),
  "actuator-controllers": equipment("actuator-controllers", 0.26, BAY_AFT, [-0.3, 0, -0.35]),
  "wing-actuators": place([wingPoint(4.6, 0.7)[0], wingY(4.6), 0], 4.8, WING_UP, [0, -0.35, 0], [50, 40]),
  "tail-actuators": place([-5.75, 3.2, 0], 2.6, TAIL_OUT, [0, -0.3, 0], [200, 60]),
  "flaperon-left": place([wingPoint(-4.6, 0.86)[0], wingY(-4.6), -4.6], 2.2, WING_UP, [-0.7, 0, 0], [170, 46]),
  "flaperon-right": place([wingPoint(4.6, 0.86)[0], wingY(4.6), 4.6], 2.2, WING_UP, [-0.7, 0, 0], [10, 46]),
  elevator: place([-5.95, TAIL.horizontal.y, 0], 2.3, [TAIL_OUT[0], TAIL_OUT[1] + 0.8, 0], [-0.6, 0, 0], [200, 56]),
  "rudder-left": place([-5.78, 2.8, -BOOM.z], 0.7, TAIL_OUT, [-0.55, 0, 0], [170, 74]),
  "rudder-right": place([-5.78, 2.8, BOOM.z], 0.7, TAIL_OUT, [-0.55, 0, 0], [10, 74]),
  "pilot-controls": equipment("pilot-controls", 0.3, [0, 0, 0], [0, 0.4, 0], [120, 56]),

  // Navigation
  gnss: equipment("gnss", 0.2, [0, 0.7, 0], [0, 0, 0], [50, 40]),
  "imu-a": equipment("imu-a", 0.18, NOSE_FWD),
  "imu-b": equipment("imu-b", 0.18, BAY_AFT, [0, -0.3, 0]),
  magnetometer: equipment("magnetometer", 0.18, [-1.0, 0, 0], [0, 0, 0], [200, 70]),
  "radar-altimeter": equipment("radar-altimeter", 0.22, [0, -0.7, 0], [0, 0, 0], [60, 110]),
  "air-data": equipment("air-data", 0.3, NOSE_FWD, [0.3, 0, 0], [60, 70]),
  "vision-sensors": equipment("vision-sensors", 0.26, NOSE_FWD, [0.5, 0, 0], [80, 74]),
  "nav-processor": equipment("nav-processor", 0.26, BAY_AFT, [0, 0.35, 0]),

  // Communications
  "ground-link": equipment("ground-link", 0.24, BAY_AFT, [-0.3, 0.3, -0.2]),
  "maintenance-link": equipment("maintenance-link", 0.24, BAY_AFT, [-0.3, 0.3, 0.2]),
  antennas: equipment("antennas", 0.3, [0, 0.7, 0], [0, 0, 0], [50, 40]),
  "secure-gateway": equipment("secure-gateway", 0.24, BAY_AFT, [-0.6, 0, -0.3]),

  // Avionics
  "network-switch-a": equipment("network-switch-a", 0.22, BAY_AFT, [0, 0.35, -0.35]),
  "network-switch-b": equipment("network-switch-b", 0.22, BAY_AFT, [0, 0.35, 0.35]),
  "flight-displays": equipment("flight-displays", 0.5, [0, 0, 0], [0.3, 0.3, 0], [110, 62]),
  "avionics-rack": equipment("avionics-rack", 0.6, BAY_AFT),
  "data-harness": place([-0.2, 0.86, 0], 2.6, [0, 0, 0], [0, 0, 0], [56, 56]),

  // Thermal
  "battery-cooling": place([0.4, BATTERY.bottomY - 0.02, 0], 1.5, BATTERY_DOWN, [0, -0.6, 0], [60, 110]),
  "avionics-cooling": equipment("avionics-cooling", 0.3, BAY_AFT, [0, -0.3, 0]),
  "heat-exchanger": equipment("heat-exchanger", 0.42, THERMAL_OUT, [-0.3, 0, 0], [200, 100]),
  "coolant-pumps": equipment("coolant-pumps", 0.24, THERMAL_OUT, [0, 0, 0.4]),
  "cooling-manifold": equipment("cooling-manifold", 0.3, THERMAL_OUT, [0.45, 0, 0]),

  // HUMS
  "hums-computer": equipment("hums-computer", 0.26, BAY_AFT, [-0.3, 0, 0.35]),
  "edge-processor": equipment("edge-processor", 0.24, BAY_AFT, [-0.3, 0.35, 0.35]),
  "acquisition-node-wing-left": equipment("acquisition-node-wing-left", 0.18, WING_UP, [0, -0.3, 0], [150, 40]),
  "acquisition-node-wing-right": equipment("acquisition-node-wing-right", 0.18, WING_UP, [0, -0.3, 0], [30, 40]),
  "acquisition-node-fuselage": equipment("acquisition-node-fuselage", 0.18, [0, 0, 0], [0, 0.3, 0]),
  "acquisition-node-tail": equipment("acquisition-node-tail", 0.18, BOOM_OUT, [0, -0.3, 0], [40, 70]),
  "sensor-gateway": equipment("sensor-gateway", 0.24, BAY_AFT, [-0.3, 0.35, -0.35]),
  "maintenance-gateway": equipment("maintenance-gateway", 0.24, BAY_AFT, [-0.6, 0, 0.3]),
};

export const PLACEMENT = { ...FIXED_PLACEMENT, ...propulsionPlacements(), ...modulePlacements() } as Record<ComponentId, Placement>;

/** Position of a part's anchor for an exploded amount (0–1). Level 2 displacement is ignored: it is local to the assembly. */
export function anchorAt(id: ComponentId, exploded: number): Vec3 {
  const { anchor, explode } = PLACEMENT[id];
  return [anchor[0] + explode[0] * exploded, anchor[1] + explode[1] * exploded + EXPLODED_LIFT * exploded, anchor[2] + explode[2] * exploded];
}

/** Centre of the airframe, for whole-aircraft camera views. */
export const AIRCRAFT_CENTRE: Vec3 = [-0.6, 1.55, 0];

/** Enclosure size of each box-shaped unit: [length along X, height, width]. */
export const EQUIPMENT_SIZE = {
  "fcc-a": [0.24, 0.13, 0.26],
  "fcc-b": [0.22, 0.15, 0.26],
  "fcc-c": [0.22, 0.15, 0.26],
  "nav-processor": [0.2, 0.1, 0.22],
  "imu-a": [0.1, 0.085, 0.1],
  "imu-b": [0.1, 0.085, 0.1],
  "actuator-controllers": [0.24, 0.15, 0.26],
  "network-switch-a": [0.2, 0.085, 0.2],
  "network-switch-b": [0.2, 0.085, 0.2],
  "hums-computer": [0.24, 0.15, 0.26],
  "edge-processor": [0.2, 0.1, 0.24],
  "sensor-gateway": [0.2, 0.1, 0.22],
  "maintenance-gateway": [0.16, 0.11, 0.18],
  "secure-gateway": [0.16, 0.11, 0.18],
  "ground-link": [0.15, 0.08, 0.16],
  "maintenance-link": [0.15, 0.08, 0.16],
  "dcdc-converter": [0.24, 0.11, 0.2],
  "lvdc-bus": [0.2, 0.1, 0.18],
  "hv-contactors": [0.26, 0.16, 0.32],
  "bms-primary": [0.1, 0.13, 0.3],
  "bms-secondary": [0.1, 0.13, 0.3],
  "acquisition-node-wing-left": [0.12, 0.05, 0.1],
  "acquisition-node-wing-right": [0.12, 0.05, 0.1],
  "acquisition-node-fuselage": [0.12, 0.05, 0.1],
  "acquisition-node-tail": [0.12, 0.05, 0.1],
} as const satisfies Partial<Record<keyof typeof EQUIPMENT, Vec3>>;

export type BoxedEquipment = keyof typeof EQUIPMENT_SIZE;
