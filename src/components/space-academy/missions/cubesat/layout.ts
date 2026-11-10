// Where each part sits in the 1U CubeSat (1 unit = 1 cm, +y up), assembled
// and exploded, and where its 3D label goes relative to the part. Shared by
// the 3D model and the 2D drawing so the two always agree.
import type { PartId } from "./model";

type V3 = [number, number, number];

export const LAYOUT: Record<PartId, { pos: V3; exploded: V3; label: V3 }> = {
  frame: { pos: [0, 0, 0], exploded: [0, 0, 0], label: [-5.6, -5.4, -4.8] },
  payload: { pos: [0, -2.8, 0], exploded: [0, -10.5, 0], label: [5.2, -1, 0] },
  battery: { pos: [0, -2.0, 0], exploded: [0, -6.4, 0], label: [5.2, 1, 0] },
  eps: { pos: [0, 0.1, 0], exploded: [0, -2.4, 0], label: [5.2, 0.2, 0] },
  obc: { pos: [0, 1.2, 0], exploded: [0, 1.4, 0], label: [5.2, 0.2, 0] },
  radio: { pos: [0, 2.3, 0], exploded: [0, 5.2, 0], label: [5.2, 0.4, 0] },
  adcs: { pos: [0, 3.4, 0], exploded: [0, 9.0, 0], label: [5.2, 0.5, 0] },
  panels: { pos: [0, 0, 0], exploded: [0, 0, 0], label: [0, -3.5, 5.6] },
  antenna: { pos: [0, 5.0, 0], exploded: [0, 14.5, 0], label: [0, 0.8, 0] },
};

