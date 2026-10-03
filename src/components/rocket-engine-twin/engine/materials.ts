// Material families. The engine is deliberately not one generic metal: each
// family is a different alloy, finish or covering, so the eye can tell a
// machined housing from a hot-gas duct from an insulated cryogenic line.
// Restrained throughout: no chrome, no mirror finish, nothing that reads as plastic.
import { DoubleSide, MeshStandardMaterial } from "three";
import type { MaterialFamily } from "./layout";

interface Finish {
  color: string;
  metalness: number;
  roughness: number;
}

export const FINISH: Record<MaterialFamily, Finish> = {
  // Machined aluminium and steel housings: restrained reflection, medium roughness.
  machined: { color: "#9ea4ab", metalness: 0.86, roughness: 0.4 },
  // Rotating assembly: a little brighter, so it reads inside an opened housing.
  rotor: { color: "#c3c8ce", metalness: 0.92, roughness: 0.3 },
  // Hot-section alloy: darker, with the look of metal that has been hot.
  hot: { color: "#5b5148", metalness: 0.8, roughness: 0.52 },
  // Chamber liner: a copper cue, kept dull.
  copper: { color: "#a8663f", metalness: 0.88, roughness: 0.46 },
  // The cooling passages between liner and jacket.
  channel: { color: "#3d4046", metalness: 0.6, roughness: 0.62 },
  // Structural jacket over the cooled wall.
  jacket: { color: "#7f8389", metalness: 0.84, roughness: 0.46 },
  // Insulated cryogenic lines: a covering, not bare metal.
  insulation: { color: "#9fa3a8", metalness: 0.16, roughness: 0.8 },
  // Valves and actuators: finely machined assemblies.
  valve: { color: "#b3b8be", metalness: 0.94, roughness: 0.28 },
  // Electronics enclosures.
  electrical: { color: "#16181c", metalness: 0.35, roughness: 0.58 },
  harness: { color: "#101114", metalness: 0.1, roughness: 0.8 },
  // Uncooled nozzle extension: dark, high-temperature metal.
  nozzle: { color: "#3b3733", metalness: 0.72, roughness: 0.6 },
  structure: { color: "#666b72", metalness: 0.8, roughness: 0.5 },
  sensor: { color: "#d7dade", metalness: 0.9, roughness: 0.3 },
};

/** A part's own material, so it can be dimmed, tinted or faded without touching its neighbours. */
export function createMaterial(family: MaterialFamily): MeshStandardMaterial {
  const finish = FINISH[family];
  // Double-sided: a cut-away shows the inside of every wall it opens.
  return new MeshStandardMaterial({ color: finish.color, metalness: finish.metalness, roughness: finish.roughness, side: DoubleSide });
}
