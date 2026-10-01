// Routes that power, data, commands and coolant follow inside the aircraft,
// as polylines in aircraft coordinates. The flow overlay draws a faint line
// and travelling pulses along the routes a view switches on. Pure data.
import type { FlowKind, NetworkFilter, UnitNo, Vec3 } from "../types";
import type { NavSourceId } from "../data/healthDefinitions";
import { BATTERY, BOOM, EQUIPMENT, FUSELAGE, TAIL, UNIT_MOUNTS, WING, wingPoint, wingY, type UnitMount } from "./layout";

export type FlowGroup =
  | "hv-pack"
  | "hv-unit"
  | "lv"
  | "nav"
  | "nav-fcc"
  | "inceptor"
  | "command"
  | "surface"
  | "motor-command"
  | "acquisition"
  | "node-uplink"
  | "battery-sense"
  | "hums-core"
  | "maintenance"
  | "ground-link"
  | "network"
  | "coolant";

export interface FlowRoute {
  id: string;
  kind: FlowKind;
  group: FlowGroup;
  points: readonly Vec3[];
  /** Number of pulses travelling the route at once. */
  pulses: number;
  /** Which data network the route belongs to, for the architecture filters. */
  network?: Exclude<NetworkFilter, "all">;
  unit?: UnitNo;
  channel?: "fcc-a" | "fcc-b" | "fcc-c";
  source?: NavSourceId;
}

const E = EQUIPMENT;
/** Wing centre box, where distribution leaves the fuselage. */
const CENTRE: Vec3 = [WING.sparX, WING.y - 0.04, 0];
const CONTACTORS = E["hv-contactors"];
const VOTER = E["actuator-controllers"];
const NAV = E["nav-processor"];
const GATEWAY = E["sensor-gateway"];

/** A point on the main spar at span station `z`, a little below the chord line; `dx` offsets it along the chord. */
const spar = (z: number, dx = 0, dy = -0.03): Vec3 => [WING.sparX + dx, wingY(z) + dy, z];

/** Half the gap between the two pylon arms that carry a tilt unit. */
export const PYLON_ARM = 0.3;

/** From the wing centre box out to a propulsion unit: along the spar, then the pylon or the boom. */
function toUnit(mount: UnitMount, dx: number, dy: number): Vec3[] {
  const z = mount.pivot[2];
  if (mount.kind === "tilt") {
    // Out along the spar, then forward inside the inboard pylon arm and in through the trunnion.
    const arm = z - mount.side * PYLON_ARM;
    return [spar(0, dx, dy), spar(z * 0.5, dx, dy), spar(arm, dx, dy), [mount.pivot[0], mount.pivot[1] + dy * 0.3, arm], [mount.pivot[0], mount.pivot[1], z - mount.side * 0.16]];
  }
  const boomZ = mount.side * BOOM.z;
  return [spar(0, dx, dy), spar(boomZ, dx, dy), [WING.sparX + dx, BOOM.y, boomZ], [mount.pivot[0], BOOM.y, boomZ]];
}

/** Up the rear wing frame from the equipment bay floor to the wing centre box. */
const riser = (from: Vec3, side: number, dx = 0): Vec3[] => [from, [-1.02, 0.95, side * 0.74], [-0.66, 1.72, side * 0.76], [-0.3 + dx, 2.0, side * 0.5], [CENTRE[0] + dx, CENTRE[1], 0]];

const packCentre = (side: number): Vec3 => [(BATTERY.fromX + BATTERY.toX) / 2, BATTERY.topY, side * BATTERY.packZ];
const keel = (x: number, z = 0): Vec3 => [x, FUSELAGE.floorY - 0.06, z];

const power: FlowRoute[] = [
  { id: "hv-pack-left", kind: "power", group: "hv-pack", points: [packCentre(-1), [BATTERY.fromX, 0.62, -BATTERY.packZ], [CONTACTORS[0], CONTACTORS[1], -0.12]], pulses: 3 },
  { id: "hv-pack-right", kind: "power", group: "hv-pack", points: [packCentre(1), [BATTERY.fromX, 0.62, BATTERY.packZ], [CONTACTORS[0], CONTACTORS[1], 0.12]], pulses: 3 },
  { id: "hv-riser", kind: "power", group: "hv-pack", points: riser(CONTACTORS, 1), pulses: 4 },
  ...UNIT_MOUNTS.map(
    (mount): FlowRoute => ({ id: `hv-unit-${mount.no}`, kind: "power", group: "hv-unit", points: toUnit(mount, 0, -0.03), pulses: mount.kind === "tilt" ? 5 : 4, unit: mount.no }),
  ),
  { id: "lv-dcdc", kind: "power", group: "lv", points: [CONTACTORS, [-1.3, 0.62, 0.2], E["dcdc-converter"]], pulses: 2 },
  { id: "lv-bus", kind: "power", group: "lv", points: [E["dcdc-converter"], [-1.42, 0.62, 0], E["lvdc-bus"]], pulses: 2 },
  { id: "lv-rear", kind: "power", group: "lv", points: [E["lvdc-bus"], [-1.5, 0.8, -0.3], [-1.55, 1.0, -0.1], E["avionics-rack"]], pulses: 2 },
  { id: "lv-forward", kind: "power", group: "lv", points: [E["lvdc-bus"], keel(-1.0, -0.08), keel(2.2, -0.08), E["fcc-a"]], pulses: 5 },
];

const navRoute = (source: NavSourceId, via: Vec3[] = []): FlowRoute => ({
  id: `nav-${source}`,
  kind: "data",
  group: "nav",
  points: [E[source], ...via, NAV],
  pulses: 3,
  network: "flight-critical",
  source,
});

const crown: Vec3 = [-1.1, 1.9, 0];
const forwardRun: Vec3[] = [keel(2.0, 0.1), keel(-1.0, 0.1), [-1.3, 1.0, 0.08]];

const control: FlowRoute[] = [
  navRoute("gnss", [[0.3, 1.98, 0], crown]),
  navRoute("imu-a", forwardRun),
  navRoute("imu-b"),
  navRoute("magnetometer", [[-2.4, 1.45, 0]]),
  navRoute("radar-altimeter", [keel(1.9, 0.1), keel(-1.0, 0.1), [-1.3, 1.0, 0.08]]),
  navRoute("air-data", forwardRun),
  navRoute("vision-sensors", forwardRun),
  { id: "nav-fcc-a", kind: "control", group: "nav-fcc", points: [NAV, [-1.3, 1.0, -0.06], keel(-1.0, -0.14), keel(2.3, -0.14), E["fcc-a"]], pulses: 5, network: "flight-critical", channel: "fcc-a" },
  { id: "nav-fcc-b", kind: "control", group: "nav-fcc", points: [NAV, [-1.4, 1.2, -0.2], E["fcc-b"]], pulses: 2, network: "flight-critical", channel: "fcc-b" },
  { id: "nav-fcc-c", kind: "control", group: "nav-fcc", points: [NAV, [-1.4, 1.2, 0.2], E["fcc-c"]], pulses: 2, network: "flight-critical", channel: "fcc-c" },
  { id: "inceptor", kind: "control", group: "inceptor", points: [E["pilot-controls"], [1.85, 0.72, -0.5], keel(1.8, -0.2), keel(2.4, -0.2), E["fcc-a"]], pulses: 2, network: "flight-critical" },
  { id: "command-a", kind: "control", group: "command", points: [E["fcc-a"], keel(2.3, -0.26), keel(-1.0, -0.26), [-1.7, 0.86, -0.3], VOTER], pulses: 5, network: "flight-critical", channel: "fcc-a" },
  { id: "command-b", kind: "control", group: "command", points: [E["fcc-b"], [-1.6, 1.02, -0.4], VOTER], pulses: 2, network: "flight-critical", channel: "fcc-b" },
  { id: "command-c", kind: "control", group: "command", points: [E["fcc-c"], [-1.6, 0.9, 0.3], [-1.75, 0.9, -0.2], VOTER], pulses: 2, network: "flight-critical", channel: "fcc-c" },
  ...([-1, 1] as const).map(
    (side): FlowRoute => ({
      id: `surface-flaperon-${side < 0 ? "left" : "right"}`,
      kind: "control",
      group: "surface",
      points: [...riser(VOTER, side, -0.4), spar(side * 2.4, -0.62), wingPoint(side * 4.6, WING.hingeFraction - 0.03)],
      pulses: 5,
      network: "flight-critical",
    }),
  ),
  {
    id: "surface-tail",
    kind: "control",
    group: "surface",
    points: [...riser(VOTER, 1, -0.4), spar(BOOM.z, -0.62), [-0.6, BOOM.y, BOOM.z], [TAIL.fin.rootLeX - 0.4, BOOM.y, BOOM.z], [TAIL.horizontal.leX - 0.5, TAIL.horizontal.y - 0.06, BOOM.z], [TAIL.horizontal.leX - 0.55, TAIL.horizontal.y, 0]],
    pulses: 7,
    network: "flight-critical",
  },
  ...UNIT_MOUNTS.map(
    (mount): FlowRoute => ({
      id: `motor-command-${mount.no}`,
      kind: "control",
      group: "motor-command",
      points: [...riser(VOTER, mount.side, -0.12).slice(0, -1), ...toUnit(mount, -0.12, 0.02)],
      pulses: 6,
      network: "flight-critical",
      unit: mount.no,
    }),
  ),
];

/** Acquisition node serving each unit: the wing nodes for the forward units, the tail node for the aft lift units. */
const nodeOf = (mount: UnitMount): keyof typeof EQUIPMENT =>
  mount.pivot[0] < -1 ? "acquisition-node-tail" : mount.side < 0 ? "acquisition-node-wing-left" : "acquisition-node-wing-right";

function unitToNode(mount: UnitMount): Vec3[] {
  const node = E[nodeOf(mount)];
  const z = mount.pivot[2];
  if (mount.kind === "tilt") {
    const arm = z + mount.side * PYLON_ARM;
    return [[mount.pivot[0], mount.pivot[1], z + mount.side * 0.16], [mount.pivot[0], mount.pivot[1] + 0.01, arm], spar(arm, 0.1, 0.03), node];
  }
  if (mount.pivot[0] < -1) return [[mount.pivot[0], BOOM.y, z], [-3.4, BOOM.y, z], ...(mount.side < 0 ? [[-5.4, BOOM.y + 0.1, z] as Vec3, [-5.5, TAIL.horizontal.y - 0.05, z] as Vec3, [-5.5, TAIL.horizontal.y - 0.05, BOOM.z] as Vec3] : []), node];
  return [[mount.pivot[0], BOOM.y, z], [WING.sparX + 0.1, BOOM.y, z], spar(z, 0.1, 0.03), node];
}

const health: FlowRoute[] = [
  ...UNIT_MOUNTS.map(
    (mount): FlowRoute => ({ id: `acquisition-${mount.no}`, kind: "health", group: "acquisition", points: unitToNode(mount), pulses: 3, network: "health", unit: mount.no }),
  ),
  { id: "uplink-wing-left", kind: "health", group: "node-uplink", points: [E["acquisition-node-wing-left"], spar(-0.6, 0.1, 0.03), ...riser(GATEWAY, -1, 0.1).reverse().slice(1)], pulses: 5, network: "health" },
  { id: "uplink-wing-right", kind: "health", group: "node-uplink", points: [E["acquisition-node-wing-right"], spar(0.6, 0.1, 0.03), ...riser(GATEWAY, 1, 0.1).reverse().slice(1)], pulses: 5, network: "health" },
  { id: "uplink-tail", kind: "health", group: "node-uplink", points: [E["acquisition-node-tail"], [-0.6, BOOM.y, BOOM.z], spar(BOOM.z, 0.1, 0.03), spar(0.6, 0.1, 0.03), ...riser(GATEWAY, 1, 0.1).reverse().slice(1)], pulses: 7, network: "health" },
  { id: "uplink-fuselage", kind: "health", group: "node-uplink", points: [E["acquisition-node-fuselage"], keel(-1.0, 0.2), [-1.7, 0.9, -0.2], GATEWAY], pulses: 3, network: "health" },
  { id: "battery-sense-left", kind: "health", group: "battery-sense", points: [packCentre(-1), [0.3, FUSELAGE.floorY - 0.03, -0.2], E["acquisition-node-fuselage"]], pulses: 2, network: "health" },
  { id: "battery-sense-right", kind: "health", group: "battery-sense", points: [packCentre(1), [0.3, FUSELAGE.floorY - 0.03, 0.2], E["acquisition-node-fuselage"]], pulses: 2, network: "health" },
  { id: "hums-edge", kind: "health", group: "hums-core", points: [GATEWAY, [-1.82, 1.36, 0], E["edge-processor"]], pulses: 2, network: "health" },
  { id: "hums-computer", kind: "health", group: "hums-core", points: [E["edge-processor"], E["hums-computer"]], pulses: 2, network: "health" },
  { id: "hums-maintenance", kind: "health", group: "maintenance", points: [E["hums-computer"], [-2.0, 1.02, 0.3], E["maintenance-gateway"]], pulses: 2, network: "maintenance" },
  { id: "link-maintenance", kind: "data", group: "ground-link", points: [E["maintenance-gateway"], E["maintenance-link"], [-1.6, 1.8, 0.1], E.antennas, [-0.9, 3.6, 0.3], [-0.6, 6.2, 1.4]], pulses: 6, network: "ground" },
  { id: "link-operations", kind: "data", group: "ground-link", points: [E["secure-gateway"], E["ground-link"], [-1.6, 1.8, -0.1], E.antennas, [-0.9, 3.6, -0.3], [-0.6, 6.2, -1.4]], pulses: 6, network: "ground" },
];

const network: FlowRoute[] = [
  { id: "network-a", kind: "data", group: "network", points: [E["network-switch-a"], [-1.3, 1.1, -0.5], keel(-1.0, -0.34), keel(2.2, -0.34), [2.3, 1.0, -0.3], E["flight-displays"]], pulses: 6 },
  { id: "network-b", kind: "data", group: "network", points: [E["network-switch-b"], [-1.3, 1.1, 0.5], keel(-1.0, 0.34), keel(2.2, 0.34), [2.3, 1.0, 0.3], E["flight-displays"]], pulses: 6 },
  { id: "network-health", kind: "data", group: "network", points: [E["network-switch-b"], [-1.6, 1.3, 0.36], E["hums-computer"]], pulses: 2 },
  { id: "network-gateway", kind: "data", group: "network", points: [E["network-switch-a"], [-1.8, 1.3, -0.36], E["secure-gateway"]], pulses: 2 },
];

const PLATE_Y = BATTERY.bottomY - 0.03;
const coolant: FlowRoute[] = [
  { id: "coolant-supply", kind: "thermal", group: "coolant", points: [E["heat-exchanger"], [-1.9, 0.62, 0.2], E["coolant-pumps"], [-1.5, 0.56, 0.3], E["cooling-manifold"]], pulses: 3 },
  { id: "coolant-battery-left", kind: "thermal", group: "coolant", points: [E["cooling-manifold"], [BATTERY.fromX, PLATE_Y, -BATTERY.packZ], [BATTERY.toX, PLATE_Y, -BATTERY.packZ], [BATTERY.toX, PLATE_Y, -0.08], [BATTERY.fromX - 0.2, PLATE_Y, -0.08], [-1.7, 0.52, -0.1], E["heat-exchanger"]], pulses: 9 },
  { id: "coolant-battery-right", kind: "thermal", group: "coolant", points: [E["cooling-manifold"], [BATTERY.fromX, PLATE_Y, BATTERY.packZ], [BATTERY.toX, PLATE_Y, BATTERY.packZ], [BATTERY.toX, PLATE_Y, 0.08], [BATTERY.fromX - 0.2, PLATE_Y, 0.08], [-1.7, 0.52, 0.1], E["heat-exchanger"]], pulses: 9 },
  { id: "coolant-avionics", kind: "thermal", group: "coolant", points: [E["cooling-manifold"], [-1.3, 0.78, 0.2], E["avionics-cooling"], [-1.86, 0.78, -0.1], E["heat-exchanger"]], pulses: 3 },
  { id: "ram-air", kind: "thermal", group: "coolant", points: [[-1.3, 0.36, 0], [-1.7, 0.46, 0], E["heat-exchanger"], [-2.4, 0.5, 0], [-2.9, 0.42, 0]], pulses: 4 },
];

export const FLOW_ROUTES: readonly FlowRoute[] = [...power, ...control, ...health, ...network, ...coolant];

export const FLOW_IDS = FLOW_ROUTES.map((r) => r.id);

export const routesOfGroup = (group: FlowGroup) => FLOW_ROUTES.filter((r) => r.group === group);
