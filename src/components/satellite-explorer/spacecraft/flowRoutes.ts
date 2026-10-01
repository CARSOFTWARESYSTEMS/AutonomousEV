// Routes that power, data and RF take inside the bus, as polylines in body
// coordinates. Each follows a harness trunk the way real wiring does, so the
// animated pulses read as "this goes there" rather than as decoration.
import type { Vec3 } from "../types";
import type { FlowKind } from "../data/satelliteReference";
import { BUS, HALF, MOUNT } from "./layout";

export const FLOW_IDS = [
  "array-left",
  "array-right",
  "battery",
  "load-obc",
  "load-adcs",
  "load-payload",
  "load-comms",
  "load-heaters",
  "sense-startracker",
  "sense-sun",
  "sense-mag",
  "sense-gnss",
  "housekeeping",
  "cmd-wheels",
  "cmd-torquers",
  "cmd-payload",
  "payload-raw",
  "payload-store",
  "obc-sband",
  "store-xband",
  "rf-sband-nadir",
  "rf-sband-zenith",
  "rf-xband",
] as const;

export type FlowId = (typeof FLOW_IDS)[number];

export interface FlowRoute {
  id: FlowId;
  kind: FlowKind;
  /** Polyline from source to sink. A negative activation runs it backwards. */
  points: readonly Vec3[];
  /** Number of pulses travelling the route at once. */
  pulses: number;
}

const B = BUS.columnX;
/** Power trunk: up the cold wall, between the two columns. */
const PX = 0.07;
const PZ = -0.455;
/** Data trunk: the stack connector column on the Sun-face side of column B. */
const DX = 1.05;
const DZ = 0.37;
/** Coax run along the cold wall. */
const RX = 0.99;

const Y = { xband: -1.6, sband: -1.25, wheels: -0.66, torquers: -0.18, obc: 0.05, storage: 0.28, pcdu: 0.52, battery: 1.1, gnss: 1.64 } as const;

const pcduPort: Vec3 = [0.24, Y.pcdu, PZ + 0.02];
const powerTrunk = (y: number): Vec3 => [PX, y, PZ];
const powerLoad = (y: number, x = 0.26): Vec3[] => [pcduPort, powerTrunk(Y.pcdu), powerTrunk(y), [x, y, PZ + 0.02]];

const obcPort: Vec3 = [0.92, Y.obc, 0.3];
const dataTrunk = (y: number): Vec3 => [DX, y, DZ];
const toObc = (from: Vec3[], y: number): Vec3[] => [...from, dataTrunk(y), dataTrunk(Y.obc), obcPort];
const fromObc = (y: number): Vec3[] => [obcPort, dataTrunk(Y.obc), dataTrunk(y), [0.92, y, 0.3]];

const route = (id: FlowId, kind: FlowKind, points: Vec3[], pulses: number): FlowRoute => ({ id, kind, points, pulses });

export const FLOW_ROUTES: readonly FlowRoute[] = [
  // Power
  route("array-left", "power", [[-HALF.x, Y.pcdu, HALF.z], [-HALF.x + 0.05, Y.pcdu, PZ], powerTrunk(Y.pcdu), pcduPort], 5),
  route("array-right", "power", [[HALF.x, Y.pcdu, HALF.z], [HALF.x - 0.05, Y.pcdu, PZ - 0.01], [0.5, Y.pcdu, PZ - 0.01], pcduPort], 5),
  route("battery", "power", [pcduPort, [0.24, 0.72, PZ + 0.02], [0.4, 0.86, PZ + 0.02], [B, 0.86, -0.3]], 3),
  route("load-obc", "power", powerLoad(Y.obc), 3),
  route("load-adcs", "power", powerLoad(Y.wheels), 4),
  route("load-comms", "power", powerLoad(Y.sband), 5),
  route("load-payload", "power", [pcduPort, powerTrunk(Y.pcdu), [PX, 0.62, PZ], [-0.2, 0.62, PZ + 0.02]], 3),
  route("load-heaters", "power", [pcduPort, powerTrunk(Y.pcdu), powerTrunk(1.3), [0.3, 1.3, PZ + 0.01]], 3),

  // Data
  route("sense-startracker", "data", toObc([[-B, 1.52, 0.2], [0, 1.76, DZ]], 1.76), 5),
  route("sense-sun", "data", toObc([MOUNT.sunSensorZenith, [0.12, 1.76, DZ]], 1.76), 5),
  route("sense-mag", "data", toObc([MOUNT.magnetometer, [-0.82, 1.76, DZ], [0, 1.76, DZ]], 1.76), 6),
  route("sense-gnss", "data", toObc([[0.92, Y.gnss, 0.3]], Y.gnss), 4),
  route("housekeeping", "data", toObc([[0.92, Y.pcdu, 0.3]], Y.pcdu), 2),
  route("cmd-wheels", "data", fromObc(Y.wheels), 3),
  route("cmd-torquers", "data", fromObc(Y.torquers), 2),
  route("cmd-payload", "data", [[0.2, Y.obc, 0.4], [0.03, Y.obc, 0.46], [0.03, 0.6, 0.46], [-0.2, 0.6, 0.4]], 3),
  route("payload-raw", "data", [[-B, 0.36, 0.3], [-0.16, 0.5, 0.4], [-0.16, 1.03, 0.4]], 3),
  route("payload-store", "data", [[-0.16, 1.03, 0.4], [0.03, 1.03, 0.46], [0.03, Y.storage, 0.46], [0.26, Y.storage, 0.4]], 4),
  route("obc-sband", "data", fromObc(Y.sband), 4),
  route("store-xband", "data", [[0.92, Y.storage, 0.3], dataTrunk(Y.storage), dataTrunk(Y.xband), [0.92, Y.xband, 0.3]], 6),

  // RF
  route("rf-sband-nadir", "rf", [[0.9, Y.sband, PZ + 0.03], [RX, Y.sband, PZ], [RX, -HALF.y + 0.06, PZ], [MOUNT.sbandNadir[0], -HALF.y + 0.02, MOUNT.sbandNadir[2]]], 3),
  route("rf-sband-zenith", "rf", [[0.9, Y.sband, PZ + 0.03], [RX, Y.sband, PZ], [RX, HALF.y - 0.06, PZ], [MOUNT.sbandZenith[0], HALF.y - 0.02, MOUNT.sbandZenith[2]]], 8),
  route("rf-xband", "rf", [[B, Y.xband, 0.3], [B, -HALF.y + 0.1, 0.3], [MOUNT.xbandArray[0], -HALF.y + 0.02, MOUNT.xbandArray[2]]], 3),
];

export const FLOW_ROUTE_BY_ID = Object.fromEntries(FLOW_ROUTES.map((r) => [r.id, r])) as Record<FlowId, FlowRoute>;

/** Length of a polyline. */
export function routeLength(points: readonly Vec3[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1], points[i][2] - points[i - 1][2]);
  }
  return total;
}
