// Geometry configuration for the reference 6U spacecraft: where each
// assembly sits, how it separates in the exploded view and where it waits
// before installation. Rendering components read this; swapping in a GLB or a
// different form factor means supplying another SpacecraftLayout.
//
// Body frame, 1 unit = 10 cm: +Y is the zenith end, −Y the Earth-facing end
// (payload aperture, X-band array), +Z the Sun face (solar-cell normal),
// −Z the cold face (radiator, star tracker). Column A (x < 0) holds the
// payload; column B (x > 0) holds the avionics stack.
import type { ComponentId, Vec3 } from "../types";

export const BUS = {
  /** X: two units wide. */
  width: 2.263,
  /** Y: three units long. */
  length: 3.66,
  /** Z: one unit deep. */
  depth: 1.0,
  rail: 0.085,
  columnX: 0.5658,
  /** Footprint of a board or unit in the stack (X × Z). */
  unit: [0.9, 0.86] as const,
} as const;

export const HALF = { x: BUS.width / 2, y: BUS.length / 2, z: BUS.depth / 2 } as const;

export const ARRAY = {
  panelWidth: 1.0,
  panelLength: 3.4,
  thickness: 0.035,
  hingeGap: 0.07,
} as const;

/** Fixed points on the outside of the bus, in body coordinates. */
export const MOUNT = {
  aperture: [-BUS.columnX, -HALF.y, 0] as Vec3,
  xbandArray: [BUS.columnX, -HALF.y - 0.03, 0.15] as Vec3,
  sbandNadir: [BUS.columnX, -HALF.y - 0.03, -0.33] as Vec3,
  sbandZenith: [0.78, HALF.y + 0.03, -0.3] as Vec3,
  gnssPatch: [0.5, HALF.y + 0.03, 0.14] as Vec3,
  sunSensorZenith: [0.12, HALF.y + 0.03, -0.26] as Vec3,
  sunSensorFace: [-BUS.columnX, 1.52, HALF.z + 0.03] as Vec3,
  magnetometer: [-0.82, HALF.y + 0.16, 0.28] as Vec3,
  starTrackerBaffle: [-BUS.columnX, 1.52, -HALF.z] as Vec3,
} as const;

export type ThermalClass = "warm" | "nominal" | "cool";

export interface PartPlacement {
  /** Label, camera and flow anchor in body coordinates. */
  anchor: Vec3;
  /** Approximate radius, for framing the camera. */
  radius: number;
  /** Displacement at 100% exploded. */
  explode: Vec3;
  /** Where the part waits before it is installed, relative to its mounted position. */
  staging: Vec3;
  /** Installation order within its Build Mode step. */
  order: number;
  thermal: ThermalClass;
  /** Preferred viewing direction for the focus camera: [azimuth°, polar°]. */
  view?: readonly [number, number];
}

const B = BUS.columnX;
/** Units in the stack slide out of the Sun face and spread along the stack axis. */
const stackExplode = (y: number): Vec3 => [0, y * 0.62, 1.75];

const place = (p: Partial<PartPlacement> & Pick<PartPlacement, "anchor" | "radius">): PartPlacement => ({
  explode: [0, 0, 0],
  staging: [0, 0, 3.2],
  order: 0,
  thermal: "nominal",
  ...p,
});

export const SIX_U_LAYOUT: Record<ComponentId, PartPlacement> = {
  // Structure
  "primary-frame": place({ anchor: [0, 0, 0], radius: 2.3, staging: [0, 0, 0], order: 0 }),
  "end-plates": place({ anchor: [0, -HALF.y, 0], radius: 1.4, staging: [0, 0, 0], order: 3 }),
  "side-panels": place({ anchor: [0, 0, HALF.z], radius: 2.3, staging: [0, 0, 0], order: 0 }),
  "payload-deck": place({ anchor: [-B, -0.7, -0.42], radius: 1.4, staging: [-2.6, 0, 0], order: 1 }),
  "avionics-deck": place({ anchor: [B, 0, 0], radius: 1.9, staging: [2.6, 0, 0], order: 2 }),
  "deployer-interface": place({ anchor: [HALF.x, -HALF.y, HALF.z], radius: 0.6, staging: [0, 0, 0], order: 4, view: [40, 110] }),

  // Power
  "solar-array-left": place({ anchor: [-HALF.x - 1.1, 0, HALF.z], radius: 2.2, explode: [-2.3, 0, 0], staging: [-3, 0, 0], order: 2, thermal: "warm", view: [-22, 66] }),
  "solar-array-right": place({ anchor: [HALF.x + 1.1, 0, HALF.z], radius: 2.2, explode: [2.3, 0, 0], staging: [3, 0, 0], order: 3, thermal: "warm", view: [22, 66] }),
  battery: place({ anchor: [B, 1.1, 0], radius: 0.72, explode: stackExplode(1.1), order: 0, thermal: "nominal" }),
  pcdu: place({ anchor: [B, 0.52, 0], radius: 0.6, explode: stackExplode(0.52), order: 1, thermal: "warm" }),
  "power-harness": place({ anchor: [0.07, 0.3, -0.46], radius: 1.5, staging: [0, 0, -2.6], order: 4, view: [150, 70] }),

  // Avionics
  obc: place({ anchor: [B, 0.05, 0], radius: 0.6, explode: stackExplode(0.05), order: 0, thermal: "warm" }),
  "data-storage": place({ anchor: [B, 0.28, 0], radius: 0.6, explode: stackExplode(0.28), order: 1 }),
  "data-bus": place({ anchor: [1.05, 0, 0.36], radius: 1.6, staging: [2.6, 0, 0], order: 2 }),

  // ADCS
  "reaction-wheel-x": place({ anchor: [0.86, -0.62, 0.02], radius: 0.36, explode: [0.55, -0.62 * 0.62, 1.75], order: 0 }),
  "reaction-wheel-y": place({ anchor: [0.46, -0.92, -0.14], radius: 0.36, explode: [0, -0.92 * 0.62 - 0.35, 1.75], order: 1 }),
  "reaction-wheel-z": place({ anchor: [0.42, -0.5, 0.24], radius: 0.36, explode: [-0.1, -0.5 * 0.62 + 0.3, 2.35], order: 2 }),
  "reaction-wheel-r": place({ anchor: [0.44, -0.42, -0.2], radius: 0.36, explode: [-0.45, -0.42 * 0.62 + 0.75, 1.5], order: 3 }),
  magnetorquers: place({ anchor: [B, -0.16, -0.36], radius: 0.6, explode: [0, -0.1, -1.6], staging: [0, 0, -2.6], order: 4, view: [150, 70] }),
  magnetometer: place({ anchor: MOUNT.magnetometer, radius: 0.28, explode: [0, 2.5, 0], staging: [0, 2.2, 0], order: 6, view: [30, 40] }),
  "sun-sensors": place({ anchor: MOUNT.sunSensorZenith, radius: 0.3, explode: [0, 2.3, 0], staging: [0, 2.2, 0], order: 5, view: [30, 40] }),
  "star-tracker": place({ anchor: [-B, 1.52, -0.12], radius: 0.5, explode: [0, 0.6, -1.9], staging: [0, 0, -2.6], order: 7, thermal: "cool", view: [160, 66] }),
  "gnss-receiver": place({ anchor: [B, 1.64, 0], radius: 0.55, explode: stackExplode(1.64), order: 8 }),

  // Payload
  "optical-payload": place({ anchor: [-B, -0.72, 0], radius: 1.25, explode: [0, -1.7, 0], staging: [0, -3.4, 0], order: 0, view: [-34, 78] }),
  "payload-electronics": place({ anchor: [-B, 0.6, 0], radius: 0.6, explode: [0, 0.6 * 0.62, 1.75], order: 1, thermal: "warm" }),
  "payload-processor": place({ anchor: [-B, 1.03, 0], radius: 0.6, explode: [0, 1.03 * 0.62, 1.75], order: 2, thermal: "warm" }),

  // Communications
  "sband-radio": place({ anchor: [B, -1.25, 0], radius: 0.6, explode: stackExplode(-1.25), order: 0, thermal: "warm" }),
  "sband-antenna": place({ anchor: MOUNT.sbandZenith, radius: 0.3, explode: [0, 0, 0], staging: [0, 0, 0], order: 1, view: [30, 40] }),
  "xband-transmitter": place({ anchor: [B, -1.6, 0], radius: 0.6, explode: stackExplode(-1.6), order: 2, thermal: "warm" }),
  "xband-antenna": place({ anchor: MOUNT.xbandArray, radius: 0.42, explode: [0, -3.7, 0], staging: [0, -2.6, 0], order: 3, view: [40, 128] }),
  "rf-harness": place({ anchor: [0.98, 0.2, -0.46], radius: 1.7, staging: [0, 0, -2.6], order: 4, view: [150, 70] }),

  // Thermal
  "mli-blanket": place({ anchor: [0, 0.2, HALF.z + 0.03], radius: 2.3, staging: [0, 0, 0], order: 1 }),
  radiator: place({ anchor: [0, 0, -HALF.z - 0.03], radius: 2.0, explode: [0, 0, -3.1], staging: [0, 0, -3.2], order: 2, thermal: "cool", view: [160, 66] }),
  heaters: place({ anchor: [B, 1.1, -0.44], radius: 0.6, staging: [0, 0, 0], order: 0, thermal: "warm", view: [150, 70] }),
};

/** Sub-assembly displacements for parts whose pieces separate in different directions. */
export const SUB_EXPLODE = {
  zenithPlate: [0, 1.9, 0] as Vec3,
  nadirPlate: [0, -3.2, 0] as Vec3,
  panelSun: [0, 0, 2.7] as Vec3,
  panelCold: [0, 0, -2.5] as Vec3,
  panelLeft: [-1.25, 0, 0] as Vec3,
  panelRight: [1.25, 0, 0] as Vec3,
  mliSun: [0, 0, 3.3] as Vec3,
  mliLeft: [-1.7, 0, 0] as Vec3,
  mliRight: [1.7, 0, 0] as Vec3,
} as const;

export const LAYOUT = SIX_U_LAYOUT;

/** Position of a part's anchor for a given exploded amount (0–1), body coordinates. */
export function anchorAt(id: ComponentId, exploded: number): Vec3 {
  const { anchor, explode } = LAYOUT[id];
  return [anchor[0] + explode[0] * exploded, anchor[1] + explode[1] * exploded, anchor[2] + explode[2] * exploded];
}
