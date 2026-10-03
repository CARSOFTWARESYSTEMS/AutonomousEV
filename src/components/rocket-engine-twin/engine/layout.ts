// Where everything on the reference engine is, and what each part is made of.
// One table of parts, addressed by semantic id; the scene, the camera, the
// flows and the sensors all read positions from here.
//
// The proportions are those of a teaching layout. Nothing here is a dimension,
// a tolerance or a contour taken from, or usable for, a real engine.
import type { BufferGeometry } from "three";
import type { ComponentId, CutawaySystem, PartId, SensorId, SystemId } from "../types";
import { type RY, type V3, around, ball, block, drum, flange, merge, pipe, revolve, ring, rod, shell, wall } from "./geometry";

// ── Gas-side contour: chamber, throat, bell ─────────────────────────────────

export const THROAT_RADIUS = 0.15;
export const CHAMBER_RADIUS = 0.29;
export const EXIT_RADIUS = 0.78;
export const INJECTOR_Y = 0.78;
const CONVERGE_Y = 0.24;
/** Below this the nozzle is a single uncooled wall. */
export const REGEN_END_Y = -0.62;
export const EXIT_Y = -1.6;

/** Radius of the gas path at height `y`. */
export function gasRadius(y: number): number {
  if (y >= CONVERGE_Y) return CHAMBER_RADIUS;
  if (y >= 0) return THROAT_RADIUS + ((CHAMBER_RADIUS - THROAT_RADIUS) * (1 - Math.cos((Math.PI * y) / CONVERGE_Y))) / 2;
  // Bell: a curve that leaves the throat steeply and flattens toward the exit.
  const u = Math.min(1, -1.1 + Math.sqrt(1.21 - 2 * y));
  return THROAT_RADIUS * (1 - u) * (1 - u) + 1.12 * u * (1 - u) + EXIT_RADIUS * u * u;
}

/** The contour from `top` down to `bottom`, as profile points. */
export function contour(top: number, bottom: number, steps = 36): RY[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const y = top + ((bottom - top) * i) / steps;
    return [gasRadius(y), y] as RY;
  });
}

const LINER = 0.012;
const CHANNELS = 0.022;
const JACKET = 0.014;
/** Outside radius of the cooled wall at height `y`. */
export const wallRadius = (y: number) => gasRadius(y) + LINER + CHANNELS + JACKET;

// ── Turbopumps ──────────────────────────────────────────────────────────────

export interface PumpPlacement {
  /** Foot of the pump's axis. */
  base: V3;
  scale: number;
}
export const PUMPS: Record<"fuel" | "oxidiser", PumpPlacement> = {
  fuel: { base: [0.72, 0.3, -0.08], scale: 1 },
  oxidiser: { base: [-0.7, 0.36, 0.1], scale: 0.86 },
};

/** Heights along a pump's own axis, before scaling: turbine at the foot, pump inlet at the top. */
const PUMP = { turbine: 0.18, manifold: 0.2, bearings: [0.44, 0.5] as const, impeller: 0.64, volute: 0.66, inducer: 0.79, top: 0.9 };

const PUMP_OUTSIDE: RY[] = [
  [0.02, 0],
  [0.12, 0.012],
  [0.172, 0.05],
  [0.19, 0.1],
  [0.19, 0.26],
  [0.17, 0.3],
  [0.122, 0.34],
  [0.122, 0.42],
  [0.138, 0.44],
  [0.138, 0.5],
  [0.122, 0.52],
  [0.172, 0.56],
  [0.212, 0.6],
  [0.232, 0.66],
  [0.212, 0.73],
  [0.152, 0.78],
  [0.106, 0.84],
  [0.1, PUMP.top],
];

/** A point on a pump, given in the pump's own frame. */
export function pumpPoint(which: "fuel" | "oxidiser", local: V3): V3 {
  const { base, scale } = PUMPS[which];
  return [base[0] + local[0] * scale, base[1] + local[1] * scale, base[2] + local[2] * scale];
}

function placed(which: "fuel" | "oxidiser", geometry: BufferGeometry): BufferGeometry {
  const { base, scale } = PUMPS[which];
  return geometry.scale(scale, scale, scale).translate(base[0], base[1], base[2]);
}

function pumpHousing(which: "fuel" | "oxidiser", cut: boolean): BufferGeometry {
  return placed(
    which,
    merge([
      revolve(shell(PUMP_OUTSIDE, 0.018), { cut, segments: 44 }),
      ring(0.214, 0.052, [0, PUMP.volute, 0], cut),
      ring(0.196, 0.044, [0, PUMP.manifold, 0], cut),
      ring(0.112, 0.016, [0, PUMP.top, 0], cut),
      ring(0.134, 0.012, [0, 0.47, 0], cut),
    ]),
  );
}

/** Rotor in the pump's frame, on its own axis: it is placed, and spun, by the part that draws it. */
function pumpRotor(): BufferGeometry {
  return merge([
    drum(0.022, 0.72, [0, 0.46, 0], { radial: 14 }),
    // Turbine wheel and its blades.
    drum(0.148, 0.034, [0, PUMP.turbine, 0]),
    drum(0.06, 0.07, [0, PUMP.turbine, 0]),
    ...around(26, [0, PUMP.turbine, 0], () => block([0.012, 0.05, 0.026], [0, 0, 0.155], 0.5)),
    // Pump impeller and its vanes.
    drum(0.17, 0.07, [0, PUMP.impeller, 0], { topRadius: 0.07 }),
    ...around(8, [0, PUMP.impeller + 0.012, 0], () => block([0.011, 0.062, 0.11], [0.02, 0, 0.1], 0.45)),
    // Inducer at the inlet.
    drum(0.056, 0.12, [0, PUMP.inducer, 0], { topRadius: 0.03 }),
    ...around(3, [0, PUMP.inducer, 0], () => block([0.01, 0.1, 0.05], [0, 0, 0.05], 0.9)),
  ]);
}

function pumpBearings(): BufferGeometry {
  return merge(PUMP.bearings.flatMap((y) => [ring(0.043, 0.017, [0, y, 0]), drum(0.062, 0.022, [0, y, 0], { radial: 20 }), drum(0.03, 0.03, [0, y, 0], { radial: 16 })]));
}

// ── Pipe runs ───────────────────────────────────────────────────────────────

export interface PipeRun {
  points: readonly V3[];
  radius: number;
}

export const PIPES = {
  feed_oxidiser: { points: [[-0.56, 2.02, 0.22], [-0.63, 1.7, 0.16], [-0.7, 1.4, 0.1], pumpPoint("oxidiser", [0, PUMP.top, 0])], radius: 0.088 },
  feed_fuel: { points: [[0.6, 2.06, -0.2], [0.66, 1.74, -0.14], [0.72, 1.46, -0.08], pumpPoint("fuel", [0, PUMP.top, 0])], radius: 0.078 },
  line_oxidiser_discharge: { points: [pumpPoint("oxidiser", [0.09, PUMP.volute, 0.22]), [-0.5, 1.0, 0.42], [-0.36, 1.07, 0.4], [-0.2, 1.11, 0.26], [-0.07, 1.09, 0.1]], radius: 0.052 },
  line_fuel_discharge: { points: [pumpPoint("fuel", [-0.1, PUMP.volute, -0.21]), [0.56, 0.7, -0.42], [0.52, 0.36, -0.44], [0.48, -0.1, -0.42], [0.45, -0.44, -0.37], [0.441, -0.62, -0.361]], radius: 0.05 },
  line_fuel_preburner: { points: [[0.2, 0.74, -0.31], [0.3, 0.92, -0.46], [0.24, 1.06, -0.56], [0.12, 1.12, -0.58]], radius: 0.038 },
  line_oxidiser_preburner: { points: [[-0.36, 1.07, 0.4], [-0.38, 1.27, 0.2], [-0.3, 1.36, -0.2], [-0.12, 1.33, -0.5], [0, 1.27, -0.58]], radius: 0.026 },
  hot_gas_fuel: { points: [[0.1, 1.08, -0.58], [0.4, 1.0, -0.53], [0.66, 0.8, -0.38], pumpPoint("fuel", [0.02, PUMP.manifold, -0.2])], radius: 0.062 },
  hot_gas_oxidiser: { points: [[-0.1, 1.08, -0.58], [-0.42, 0.98, -0.46], [-0.68, 0.78, -0.2], pumpPoint("oxidiser", [0, PUMP.manifold, -0.2])], radius: 0.055 },
  exhaust_fuel: { points: [pumpPoint("fuel", [-0.18, 0.08, 0.02]), [0.44, 0.56, -0.04], [0.37, 0.78, -0.02], [0.335, 0.88, -0.02]], radius: 0.07 },
  exhaust_oxidiser: { points: [pumpPoint("oxidiser", [0.18, 0.08, 0]), [-0.45, 0.6, 0.08], [-0.37, 0.78, 0.05], [-0.335, 0.88, 0.03]], radius: 0.062 },
} satisfies Record<string, PipeRun>;

export type PipeId = keyof typeof PIPES;

const run = (id: PipeId) => pipe(PIPES[id].points, PIPES[id].radius);
const ends = (id: PipeId, growth = 1.34): BufferGeometry[] => {
  const { points, radius } = PIPES[id];
  const last = points.length - 1;
  return [flange(points[0], points[1], radius * growth), flange(points[last], points[last - 1], radius * growth)];
};

/** A valve on a line: a body in the line, an actuator standing off it. */
function valve(centre: V3, size: number, stem: V3): BufferGeometry[] {
  const top: V3 = [centre[0] + stem[0] * size * 2.6, centre[1] + stem[1] * size * 2.6, centre[2] + stem[2] * size * 2.6];
  const mid: V3 = [centre[0] + stem[0] * size * 1.1, centre[1] + stem[1] * size * 1.1, centre[2] + stem[2] * size * 1.1];
  return [ball(size, centre), rod(centre, mid, size * 0.42), rod(mid, top, size * 0.74, { radial: 20 }), ball(size * 0.74, top, [1, 0.5, 1])];
}

// ── Sensors, controller and where the harness runs ──────────────────────────

/** Where each sensor sits, and the direction it stands off the part it is on. */
export const SENSOR_AT: Record<SensorId, { at: V3; out: V3; host: PartId }> = {
  chamber_pressure: { at: [0, 0.56, wallRadius(0.56)], out: [0, 0, 1], host: "cooling_jacket" },
  pump_discharge_pressure: { at: [0.6, 0.84, -0.4], out: [0.5, 0, -0.86], host: "line_fuel_discharge" },
  turbine_inlet_temperature: { at: [0.56, 0.9, -0.46], out: [0.3, 0.8, -0.5], host: "hot_gas_fuel" },
  shaft_speed: { at: pumpPoint("fuel", [0.116, 0.38, -0.036]), out: [1, 0, -0.3], host: "turbopump_fuel" },
  pump_vibration: { at: pumpPoint("fuel", [0.132, 0.47, -0.04]), out: [1, 0, -0.3], host: "turbopump_fuel" },
  bearing_temperature: { at: pumpPoint("fuel", [-0.04, 0.5, 0.132]), out: [-0.3, 0, 1], host: "turbopump_fuel" },
  coolant_outlet_temperature: { at: [-0.27, 0.72, 0.29], out: [-0.68, 0.2, 0.73], host: "manifold_outlet" },
  valve_position: { at: [-0.36, 1.23, 0.4], out: [0, 1, 0], host: "valve_main_oxidiser" },
  thrust_mount_strain: { at: [0.06, 1.2, 0.25], out: [0.2, 0.1, 1], host: "gimbal_mount" },
};

export const CONTROLLER_AT: V3 = [-0.2, 1.44, 0.52];
/** Where every signal lead meets the controller. */
export const CONTROLLER_PORT: V3 = [-0.2, 1.33, 0.52];

/** The harness trunk: a ring above the injector that every lead joins on its way to the controller. */
const TRUNK = { radius: 0.47, y: 1.0 };

/** A lead from a sensor to the controller: out from the sensor, up to the trunk, round it, and in. */
export function harnessPath(id: SensorId): V3[] {
  const { at: from, out } = SENSOR_AT[id];
  const length = Math.hypot(out[0], out[1], out[2]);
  const stand: V3 = [from[0] + (out[0] / length) * 0.07, from[1] + (out[1] / length) * 0.07, from[2] + (out[2] / length) * 0.07];
  const start = Math.atan2(stand[0], stand[2]);
  const finish = Math.atan2(CONTROLLER_PORT[0], CONTROLLER_PORT[2]);
  let sweep = finish - start;
  if (sweep > Math.PI) sweep -= Math.PI * 2;
  if (sweep < -Math.PI) sweep += Math.PI * 2;
  const steps = Math.max(1, Math.round(Math.abs(sweep) / 0.5));
  const around: V3[] = Array.from({ length: steps + 1 }, (_, i) => {
    const angle = start + (sweep * i) / steps;
    return [Math.sin(angle) * TRUNK.radius, TRUNK.y, Math.cos(angle) * TRUNK.radius];
  });
  // A sensor above the trunk comes down to it; one below goes up the outside of the engine.
  const reach = Math.max(TRUNK.radius, Math.hypot(stand[0], stand[2]) + 0.03);
  const riser: V3 = [Math.sin(start) * reach, (stand[1] + TRUNK.y) / 2, Math.cos(start) * reach];
  return [from, stand, riser, ...around, CONTROLLER_PORT];
}

// ── Parts ───────────────────────────────────────────────────────────────────

export type MaterialFamily = "machined" | "rotor" | "hot" | "copper" | "channel" | "jacket" | "insulation" | "valve" | "electrical" | "harness" | "nozzle" | "structure" | "sensor";

export interface PartDef {
  system: SystemId | null;
  /** What a click on the part selects. */
  component: ComponentId | null;
  material: MaterialFamily;
  /** Where the part goes as assemblies separate (first half of the exploded view). */
  explode: V3;
  /** Its further move as an assembly comes apart (second half). */
  explode2?: V3;
  /** Cut-aways that open this part. */
  cutBy?: readonly CutawaySystem[];
  /** Spins with a turbopump. The geometry is built on the pump's axis and placed by the scene. */
  rotor?: "fuel" | "oxidiser";
  /** Has no place once the engine is taken apart, so it fades out. */
  assembledOnly?: boolean;
  build: (cut: boolean) => BufferGeometry;
}

/** Ribs on the cooled nozzle wall, below the throat. A cue for the passages under the jacket: not their geometry. */
const RIBS = 72;
const RIB_HEIGHTS = [-0.11, -0.2, -0.3, -0.4, -0.5, -0.6];

const WALL_CUT: readonly CutawaySystem[] = ["combustion", "regenerative_cooling", "nozzle"];
const FUEL_OUT: V3 = [0.72, 0.05, -0.1];
const OXIDISER_OUT: V3 = [-0.72, 0.05, 0.1];
const bellows = (points: readonly V3[], radius: number) => [0.3, 0.36, 0.42, 0.48, 0.54].map((t) => ring(radius * 1.16, radius * 0.16, [points[0][0] + (points[2][0] - points[0][0]) * t, points[0][1] + (points[2][1] - points[0][1]) * t, points[0][2] + (points[2][2] - points[0][2]) * t]));

export const PARTS: Record<PartId, PartDef> = {
  feed_oxidiser: { system: "propellant_feed", component: "oxidiser_inlet", material: "insulation", explode: [-0.28, 0.55, 0.12], build: () => merge([run("feed_oxidiser"), ...ends("feed_oxidiser", 1.26), ...bellows(PIPES.feed_oxidiser.points, PIPES.feed_oxidiser.radius)]) },
  feed_fuel: { system: "propellant_feed", component: "fuel_inlet", material: "insulation", explode: [0.28, 0.55, -0.12], build: () => merge([run("feed_fuel"), ...ends("feed_fuel", 1.26), ...bellows(PIPES.feed_fuel.points, PIPES.feed_fuel.radius)]) },
  line_oxidiser_discharge: { system: "propellant_feed", component: "oxidiser_inlet", material: "machined", explode: [-0.32, 0.26, 0.36], build: () => merge([run("line_oxidiser_discharge"), ...ends("line_oxidiser_discharge")]) },
  line_fuel_discharge: { system: "propellant_feed", component: "fuel_inlet", material: "machined", explode: [0.36, 0, -0.36], build: () => merge([run("line_fuel_discharge"), ...ends("line_fuel_discharge")]) },
  line_fuel_preburner: { system: "propellant_feed", component: "fuel_inlet", material: "machined", explode: [0.16, 0.3, -0.46], build: () => merge([run("line_fuel_preburner"), ...ends("line_fuel_preburner")]) },
  line_oxidiser_preburner: { system: "propellant_feed", component: "oxidiser_inlet", material: "machined", explode: [-0.2, 0.5, -0.2], build: () => merge([run("line_oxidiser_preburner"), ...ends("line_oxidiser_preburner")]) },

  turbopump_oxidiser: { system: "turbomachinery", component: "oxidiser_turbopump", material: "machined", explode: OXIDISER_OUT, cutBy: ["turbomachinery"], build: (cut) => pumpHousing("oxidiser", cut) },
  rotor_oxidiser: { system: "turbomachinery", component: "oxidiser_turbopump", material: "rotor", explode: OXIDISER_OUT, explode2: [0, -0.74, 0], rotor: "oxidiser", build: pumpRotor },
  bearing_oxidiser: { system: "turbomachinery", component: "bearing_region", material: "valve", explode: OXIDISER_OUT, explode2: [0, -0.3, 0], build: () => placed("oxidiser", pumpBearings()) },
  turbopump_fuel: { system: "turbomachinery", component: "fuel_turbopump", material: "machined", explode: FUEL_OUT, cutBy: ["turbomachinery"], build: (cut) => pumpHousing("fuel", cut) },
  rotor_fuel: { system: "turbomachinery", component: "fuel_turbopump", material: "rotor", explode: FUEL_OUT, explode2: [0, -0.86, 0], rotor: "fuel", build: pumpRotor },
  bearing_fuel: { system: "turbomachinery", component: "bearing_region", material: "valve", explode: FUEL_OUT, explode2: [0, -0.35, 0], build: () => placed("fuel", pumpBearings()) },
  preburner: {
    system: "turbomachinery",
    component: "preburner",
    material: "hot",
    explode: [0, 0.46, -0.56],
    build: () => merge([drum(0.12, 0.24, [0, 1.12, -0.58]), ball(0.12, [0, 1.24, -0.58], [1, 0.55, 1]), ball(0.12, [0, 1.0, -0.58], [1, 0.4, 1]), ring(0.128, 0.016, [0, 1.2, -0.58]), ring(0.128, 0.016, [0, 1.04, -0.58])]),
  },
  hot_gas_fuel: { system: "turbomachinery", component: "preburner", material: "hot", explode: [0.32, 0.3, -0.46], build: () => merge([run("hot_gas_fuel"), ...ends("hot_gas_fuel", 1.26)]) },
  hot_gas_oxidiser: { system: "turbomachinery", component: "preburner", material: "hot", explode: [-0.32, 0.3, -0.46], build: () => merge([run("hot_gas_oxidiser"), ...ends("hot_gas_oxidiser", 1.26)]) },
  exhaust_fuel: { system: "turbomachinery", component: "fuel_turbopump", material: "hot", explode: [0.38, 0.02, -0.04], build: () => merge([run("exhaust_fuel"), ...ends("exhaust_fuel", 1.22)]) },
  exhaust_oxidiser: { system: "turbomachinery", component: "oxidiser_turbopump", material: "hot", explode: [-0.38, 0.02, 0.04], build: () => merge([run("exhaust_oxidiser"), ...ends("exhaust_oxidiser", 1.22)]) },

  injector_head: {
    system: "combustion",
    component: "injector",
    material: "structure",
    explode: [0, 0.34, 0],
    cutBy: ["combustion"],
    build: (cut) =>
      merge([
        revolve(
          shell(
            [
              [0.372, 0.76],
              [0.372, 0.81],
              [0.33, 0.82],
              [0.33, 0.94],
              [0.3, 1.0],
              [0.22, 1.055],
              [0.11, 1.085],
              [0.11, 1.13],
            ],
            0.028,
          ),
          { cut },
        ),
        ring(0.335, 0.058, [0, 0.88, 0], cut),
        // Injector face: a plate and two ridges. Conceptual, with no element geometry.
        drum(0.288, 0.016, [0, 0.79, 0], { radial: 40 }),
        ring(0.1, 0.008, [0, 0.782, 0]),
        ring(0.2, 0.008, [0, 0.782, 0]),
      ]),
  },
  chamber_liner: { system: "combustion", component: "combustion_chamber", material: "copper", explode: [0, 0, 0], cutBy: WALL_CUT, build: (cut) => revolve(wall(contour(INJECTOR_Y, REGEN_END_Y), 0, LINER), { cut, segments: 64 }) },
  igniter: { system: "combustion", component: "igniter", material: "valve", explode: [0.22, 0.12, 0.32], build: () => merge([rod([0.2, 0.69, 0.27], [0.3, 0.77, 0.4], 0.024), ball(0.034, [0.3, 0.77, 0.4]), pipe([[0.3, 0.77, 0.4], [0.3, 0.98, 0.46], [0.1, 1.2, 0.5], CONTROLLER_PORT], 0.009, { radial: 8 })]) },

  cooling_channels: { system: "regenerative_cooling", component: "cooling_channels", material: "channel", explode: [0, 0, 0], cutBy: WALL_CUT, build: (cut) => revolve(wall(contour(INJECTOR_Y, REGEN_END_Y), LINER, CHANNELS), { cut, segments: 64 }) },
  cooling_jacket: {
    system: "regenerative_cooling",
    component: "cooling_channels",
    material: "jacket",
    explode: [0, 0, 0],
    cutBy: WALL_CUT,
    build: (cut) =>
      merge([
        revolve(wall(contour(INJECTOR_Y, REGEN_END_Y), LINER + CHANNELS, JACKET), { cut, segments: 64 }),
        ...[0.62, 0.46, 0.3, -0.22, -0.36, -0.5].map((y) => ring(wallRadius(y) + 0.004, 0.011, [0, y, 0], cut)),
        ...Array.from({ length: RIBS }, (_, i) => (i / RIBS) * Math.PI * 2)
          // Angle 0 is +Z and a quarter turn is +X: the quarter between them is the one a cut-away removes.
          .filter((angle) => !cut || (angle > Math.PI / 2 + 0.03 && angle < Math.PI * 2 - 0.03))
          .map((angle) => pipe(RIB_HEIGHTS.map((y) => [Math.sin(angle) * wallRadius(y), y, Math.cos(angle) * wallRadius(y)] as V3), 0.0075, { radial: 4, tension: 0.5 })),
      ]),
  },
  manifold_inlet: {
    system: "regenerative_cooling",
    component: "coolant_manifold",
    material: "machined",
    explode: [0, -0.14, 0],
    cutBy: ["regenerative_cooling", "nozzle"],
    build: (cut) => ring(wallRadius(REGEN_END_Y) + 0.03, 0.05, [0, REGEN_END_Y, 0], cut),
  },
  manifold_outlet: { system: "regenerative_cooling", component: "coolant_manifold", material: "machined", explode: [0, 0.1, 0], cutBy: ["regenerative_cooling", "combustion"], build: (cut) => ring(wallRadius(0.72) + 0.02, 0.036, [0, 0.72, 0], cut) },

  throat_ring: {
    system: "nozzle",
    component: "throat",
    material: "hot",
    explode: [0, 0, 0],
    cutBy: WALL_CUT,
    build: (cut) => merge([revolve(wall(contour(0.1, -0.1, 12), LINER + CHANNELS + JACKET, 0.026), { cut }), ring(wallRadius(0.1) + 0.03, 0.014, [0, 0.1, 0], cut), ring(wallRadius(-0.1) + 0.03, 0.014, [0, -0.1, 0], cut)]),
  },
  nozzle_extension: {
    system: "nozzle",
    component: "nozzle_extension",
    material: "nozzle",
    explode: [0, -0.56, 0],
    cutBy: ["nozzle"],
    build: (cut) => merge([revolve(wall(contour(REGEN_END_Y, EXIT_Y, 30), 0, 0.014), { cut, segments: 72 }), ...[-0.8, -1.0, -1.2, -1.4].map((y) => ring(gasRadius(y) + 0.022, 0.013, [0, y, 0], cut)), ring(EXIT_RADIUS + 0.02, 0.02, [0, EXIT_Y, 0], cut)]),
  },

  valve_main_oxidiser: { system: "valves_actuation", component: "main_valves", material: "valve", explode: [-0.32, 0.26, 0.36], build: () => merge(valve([-0.36, 1.07, 0.4], 0.072, [0, 1, 0])) },
  valve_main_fuel: { system: "valves_actuation", component: "main_valves", material: "valve", explode: [0.36, 0, -0.36], build: () => merge(valve([0.52, 0.36, -0.44], 0.07, [0.74, 0, -0.67])) },
  valve_throttle: { system: "valves_actuation", component: "throttle_valve", material: "valve", explode: [0.16, 0.3, -0.46], build: () => merge(valve([0.24, 1.06, -0.56], 0.052, [0.6, 0.5, -0.62])) },
  gimbal_mount: {
    system: "valves_actuation",
    component: "gimbal_actuator",
    material: "structure",
    explode: [0, 0.62, 0],
    build: () =>
      merge([
        ...around(6, [0, 0, 0], () => rod([0, 0.9, 0.345], [0, 1.44, 0.13], 0.02, { radial: 10 })),
        ring(0.13, 0.03, [0, 1.44, 0]),
        ball(0.095, [0, 1.52, 0]),
        rod([-0.17, 1.52, 0], [0.17, 1.52, 0], 0.028),
        rod([0, 1.52, -0.17], [0, 1.52, 0.17], 0.028),
        drum(0.2, 0.04, [0, 1.62, 0], { radial: 6 }),
      ]),
  },
  gimbal_actuators: {
    system: "valves_actuation",
    component: "gimbal_actuator",
    material: "valve",
    explode: [0, 0.26, -0.5],
    build: () =>
      merge(
        ([1, -1] as const).flatMap((side) => {
          const top: V3 = [0.44 * side, 1.56, -0.46];
          const mid: V3 = [0.36 * side, 1.02, -0.38];
          const lug: V3 = [0.27 * side, 0.46, -0.28];
          return [rod(top, mid, 0.04), rod(mid, lug, 0.02), ball(0.045, top), ball(0.036, lug), rod(top, [0.12 * side, 1.6, -0.1], 0.016, { radial: 8 })];
        }),
      ),
  },

  engine_controller: {
    system: "engine_control",
    component: "engine_controller",
    material: "electrical",
    explode: [-0.36, 0.46, 0.56],
    build: () =>
      merge([
        block([0.3, 0.2, 0.1], CONTROLLER_AT, -0.3),
        // Cooling fins on the face, connectors underneath.
        ...[-0.1, -0.05, 0, 0.05, 0.1].map((dx) => block([0.012, 0.17, 0.018], [CONTROLLER_AT[0] + dx * 0.955 + 0.016, CONTROLLER_AT[1], CONTROLLER_AT[2] + 0.056 + dx * 0.295], -0.3)),
        ...[-0.09, -0.03, 0.03, 0.09].map((dx) => drum(0.02, 0.05, [CONTROLLER_AT[0] + dx, CONTROLLER_AT[1] - 0.12, CONTROLLER_AT[2] + dx * 0.3], { radial: 10 })),
        rod([-0.12, 1.47, 0.44], [-0.05, 1.45, 0.11], 0.012, { radial: 8 }),
        rod([-0.3, 1.4, 0.5], [-0.11, 1.44, 0.07], 0.012, { radial: 8 }),
      ]),
  },
  harness: { system: "instrumentation", component: "engine_controller", material: "harness", explode: [0, 0, 0], assembledOnly: true, build: () => merge((Object.keys(SENSOR_AT) as SensorId[]).map((id) => pipe(harnessPath(id), 0.0065, { radial: 6, tension: 0.3 }))) },
  sensor_bodies: {
    system: "instrumentation",
    component: "pressure_sensors",
    material: "sensor",
    explode: [0, 0, 0],
    assembledOnly: true,
    build: () =>
      merge(
        (Object.keys(SENSOR_AT) as SensorId[]).flatMap((id) => {
          const { at: from, out } = SENSOR_AT[id];
          const length = Math.hypot(out[0], out[1], out[2]);
          const tip: V3 = [from[0] + (out[0] / length) * 0.075, from[1] + (out[1] / length) * 0.075, from[2] + (out[2] / length) * 0.075];
          const neck: V3 = [from[0] + (out[0] / length) * 0.03, from[1] + (out[1] / length) * 0.03, from[2] + (out[2] / length) * 0.03];
          return [rod(from, neck, 0.026, { radial: 6 }), rod(neck, tip, 0.017, { radial: 12 })];
        }),
      ),
  },
  structure: {
    system: null,
    component: null,
    material: "structure",
    explode: [0, 0, 0],
    assembledOnly: true,
    build: () =>
      merge([
        rod([0.56, 0.9, -0.08], [0.36, 0.84, -0.04], 0.02, { radial: 8 }),
        rod([0.56, 0.52, -0.08], [0.34, 0.52, -0.04], 0.02, { radial: 8 }),
        rod([0.56, 0.9, -0.08], [0.34, 0.52, -0.04], 0.014, { radial: 8 }),
        rod([-0.56, 0.9, 0.1], [-0.36, 0.84, 0.04], 0.02, { radial: 8 }),
        rod([-0.56, 0.56, 0.1], [-0.34, 0.54, 0.04], 0.02, { radial: 8 }),
        rod([-0.56, 0.9, 0.1], [-0.34, 0.54, 0.04], 0.014, { radial: 8 }),
        rod([0, 1.0, -0.5], [0, 0.94, -0.32], 0.02, { radial: 8 }),
        rod([0.1, 1.2, -0.52], [0.1, 1.36, -0.16], 0.014, { radial: 8 }),
        rod([-0.1, 1.2, -0.52], [-0.1, 1.36, -0.16], 0.014, { radial: 8 }),
      ]),
  },
};

export const PART_IDS = Object.keys(PARTS) as PartId[];

/** Which pump a part belongs to, for the parts that shake or spin with it. */
export const PUMP_OF: Partial<Record<PartId, "fuel" | "oxidiser">> = {
  turbopump_fuel: "fuel",
  rotor_fuel: "fuel",
  bearing_fuel: "fuel",
  turbopump_oxidiser: "oxidiser",
  rotor_oxidiser: "oxidiser",
  bearing_oxidiser: "oxidiser",
};

/** Whether `cutaway` opens a part. */
export function isCut(part: PartDef, cutaway: CutawaySystem | "all" | null): boolean {
  if (!cutaway || !part.cutBy) return false;
  return cutaway === "all" || part.cutBy.includes(cutaway);
}

/** A part's displacement at exploded amount `amount` (0–1): assemblies first, then their components. */
export function explodedOffset(part: PartDef, amount: number, out: [number, number, number]): [number, number, number] {
  const first = Math.min(1, amount * 2);
  const second = Math.max(0, amount * 2 - 1);
  const e2 = part.explode2;
  out[0] = part.explode[0] * first + (e2 ? e2[0] * second : 0);
  out[1] = part.explode[1] * first + (e2 ? e2[1] * second : 0);
  out[2] = part.explode[2] * first + (e2 ? e2[2] * second : 0);
  return out;
}

/** Centre of the engine, for the camera and the lights. */
export const ENGINE_CENTRE: V3 = [0, 0.1, 0];
export const BEARING_AT: V3 = pumpPoint("fuel", [0, 0.47, 0]);
