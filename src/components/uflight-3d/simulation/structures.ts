// Structural load model: how hard each part of the load path is working in a
// flight condition. An engineering visualisation of where loads go — relative
// intensities, not stress analysis. Simulated values.
import type { FlightConfig } from "../types";
import { clamp01 } from "../lib/math";
import type { FlightState } from "./mission";

export type LoadPathId =
  | "rotor-mount-tilt"
  | "rotor-mount-lift"
  | "boom"
  | "main-spar"
  | "wing-root"
  | "fuselage-frame"
  | "keel"
  | "landing-gear"
  | "battery-enclosure";

export const LOAD_PATH_LABEL: Record<LoadPathId, string> = {
  "rotor-mount-tilt": "Rotor mount (tilt units)",
  "rotor-mount-lift": "Rotor mount (lift units)",
  boom: "Boom",
  "main-spar": "Main spar",
  "wing-root": "Wing root",
  "fuselage-frame": "Fuselage structure",
  keel: "Keel",
  "landing-gear": "Landing gear",
  "battery-enclosure": "Battery enclosure",
};

export const LOAD_PATH_ORDER: readonly LoadPathId[] = ["rotor-mount-tilt", "rotor-mount-lift", "boom", "main-spar", "wing-root", "fuselage-frame", "keel", "landing-gear", "battery-enclosure"];

export interface StructuralState {
  /** Relative load in each element, 0–1. */
  loads: Record<LoadPathId, number>;
  /** Strain observations, µε. */
  wingRootStrain: number;
  rotorMountStrain: number;
  boomStrain: number;
  gearLoad: number;
  airframeVibration: number;
  /** Accumulated fatigue exposure as a fraction of the reference life, 0–1. */
  fatigueIndex: number;
  /** Tip deflection as a fraction of the largest shown, signed: up in flight, down on the ground. */
  wingBend: number;
}

/** Fatigue exposure at the start of the mission, and what one mission adds. */
const FATIGUE_BASE = 0.184;

export function structuralState(flight: FlightState): StructuralState {
  const airborne = flight.onGround ? 0 : 1;
  const rotor = flight.rotorLiftShare * airborne;
  const wing = flight.wingLiftShare * airborne;
  const ground = 1 - airborne;
  // On the ground with rotors turning, some weight is already carried by thrust.
  const spool = clamp01(flight.tiltRpm / 1250) * ground;

  const tiltMount = clamp01(0.92 * rotor + 0.34 * wing + 0.3 * spool);
  const liftMount = clamp01(0.92 * clamp01(flight.liftRpm / 1250) * (airborne + 0.3 * ground));
  // Bending at the root is highest when lift is concentrated at the outboard rotors, and lower when it is spread along the wing.
  const root = clamp01(0.88 * rotor + 0.64 * wing + 0.2 * spool);
  const loads: Record<LoadPathId, number> = {
    "rotor-mount-tilt": tiltMount,
    "rotor-mount-lift": liftMount,
    boom: clamp01(0.82 * liftMount + 0.22 * wing),
    "main-spar": clamp01(0.9 * root),
    "wing-root": root,
    "fuselage-frame": clamp01(0.74 * root + 0.3 * ground),
    keel: clamp01(0.3 * airborne + 0.86 * ground),
    "landing-gear": clamp01(0.94 * ground * (1 - 0.6 * spool)),
    "battery-enclosure": clamp01(0.42 * airborne + 0.5 * ground),
  };

  return {
    loads,
    wingRootStrain: 180 + 1420 * root,
    rotorMountStrain: 90 + 980 * tiltMount,
    boomStrain: 60 + 760 * loads.boom,
    gearLoad: 1180 * loads["landing-gear"],
    airframeVibration: 0.08 + 0.34 * rotor + 0.12 * wing + 0.1 * spool,
    fatigueIndex: FATIGUE_BASE,
    wingBend: airborne * (0.55 + 0.45 * rotor) - ground * 0.25 * (1 - spool),
  };
}

/** Which elements a load case is about, for the captions. */
export const LOAD_CASE_FOCUS: Record<FlightConfig, readonly LoadPathId[]> = {
  hover: ["rotor-mount-tilt", "rotor-mount-lift", "boom", "main-spar", "wing-root"],
  transition: ["rotor-mount-tilt", "main-spar", "wing-root", "fuselage-frame"],
  cruise: ["main-spar", "wing-root", "fuselage-frame"],
  ground: ["landing-gear", "keel", "fuselage-frame", "battery-enclosure"],
};
