// Values that change every frame. The simulation driver writes them once per
// frame; everything that draws only reads them. They never pass through React
// state, so nothing re-renders at frame rate.
import type { HealthState, PartId } from "../types";
import { COLD, type OperatingPoint } from "../simulation/engineSim";

/** How one part should look right now. Parts ease toward this; they do not jump. */
export interface PartLook {
  /** 0 untouched – 1 fully receded. */
  dim: number;
  opacity: number;
  /** Emissive tint and its strength (0–1). */
  tint: string | null;
  strength: number;
  selectable: boolean;
}

export const DEFAULT_LOOK: PartLook = { dim: 0, opacity: 1, tint: null, strength: 0, selectable: true };

export const frame = {
  /** Seconds since the scene started. */
  now: 0,
  /** Smoothed operating point of the engine. */
  engine: { ...COLD } as OperatingPoint,
  /** Turbopump rotation angle, radians. Its speed is scaled for the eye, not literal. */
  rotorAngle: 0,
  /** Exploded amount, eased toward the store's value. */
  exploded: 0,
  /** Milliseconds into the current test phase. */
  phaseElapsed: 0,
  /** Bearing fault severity, 0–1. */
  severity: 0,
  /** Wall heat load multiplier: 1 cooled, rising briefly in the uncooled comparison. */
  wallHeat: 1,
  /** Strength of each flow, 0–1. */
  flow: { propellant: 0, cooling: 0, hot_gas: 0, data: 0 },
  /** Pressure colouring of the fluid network, 0–1. */
  pressure: 0,
  /** Weight of each environment, 0–1. */
  environment: { studio: 1, test: 0, twin: 0 },
  /** 0 before the engine is entered (dark hero), 1 after. */
  power: 0,
  /** Twin overlays. */
  ghost: 0,
  residual: 0,
  /** Step of the turbomachinery energy-transfer walk, 0–4, or -1. */
  energyStep: -1,
  looks: new Map<PartId, PartLook>(),
  health: new Map<PartId, HealthState>(),
};

export type Frame = typeof frame;

export function resetFrame(): void {
  frame.now = 0;
  frame.engine = { ...COLD };
  frame.rotorAngle = 0;
  frame.exploded = 0;
  frame.phaseElapsed = 0;
  frame.severity = 0;
  frame.wallHeat = 1;
  frame.flow = { propellant: 0, cooling: 0, hot_gas: 0, data: 0 };
  frame.pressure = 0;
  frame.environment = { studio: 1, test: 0, twin: 0 };
  frame.power = 0;
  frame.ghost = 0;
  frame.residual = 0;
  frame.energyStep = -1;
  frame.looks.clear();
  frame.health.clear();
}

/** Exponential approach: frame-rate independent easing toward a target. */
export const damp = (current: number, target: number, rate: number, dt: number) => current + (target - current) * (1 - Math.exp(-rate * dt));
