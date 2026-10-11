// What each injectable fault does, to the physical system or to the data path.
// Severity runs from 0 (absent) to 1 (the full illustrative magnitude). The
// magnitudes are chosen so that every fault is clearly visible in the lesson;
// they are not failure data from any engine.
import type { DaqNode } from "./channels";
import type { FaultId } from "./isolation";
import type { PlantParams } from "./plant";

export interface FaultDef {
  id: FaultId;
  /** Seconds a progressive fault takes to grow from nothing to full severity; 0 for a fault that is simply present or absent. */
  rampSeconds: number;
  /** A fault that only shows while the engine is changing state: the lab steps the throttle to reveal it. */
  needsTransient: boolean;
}

export const FAULT_DEFS: Record<FaultId, FaultDef> = {
  pump_degradation: { id: "pump_degradation", rampSeconds: 24, needsTransient: false },
  valve_restriction: { id: "valve_restriction", rampSeconds: 14, needsTransient: false },
  cooling_restriction: { id: "cooling_restriction", rampSeconds: 24, needsTransient: false },
  feed_pressure_reduction: { id: "feed_pressure_reduction", rampSeconds: 30, needsTransient: false },
  injector_restriction: { id: "injector_restriction", rampSeconds: 24, needsTransient: false },
  combustion_loss: { id: "combustion_loss", rampSeconds: 18, needsTransient: false },
  pc_sensor_drift: { id: "pc_sensor_drift", rampSeconds: 24, needsTransient: false },
  sensor_noise: { id: "sensor_noise", rampSeconds: 0, needsTransient: false },
  packet_delay: { id: "packet_delay", rampSeconds: 0, needsTransient: true },
  timestamp_error: { id: "timestamp_error", rampSeconds: 0, needsTransient: true },
  telemetry_replay: { id: "telemetry_replay", rampSeconds: 0, needsTransient: true },
};

export type Severities = Partial<Record<FaultId, number>>;

const sev = (s: Severities, id: FaultId) => s[id] ?? 0;

/** The physical system's parameters with the active physical faults applied. */
export function applyPhysicalFaults(base: PlantParams, s: Severities): PlantParams {
  return {
    ...base,
    headOx: base.headOx * (1 - 0.14 * sev(s, "pump_degradation")),
    valveFu: base.valveFu * (1 - 0.42 * sev(s, "valve_restriction")),
    kCool: base.kCool * (1 + 0.6 * sev(s, "cooling_restriction")),
    pTankOx: base.pTankOx - 3.4 * sev(s, "feed_pressure_reduction"),
    kInjOx: base.kInjOx * (1 + 1.4 * sev(s, "injector_restriction")),
    etaC: base.etaC * (1 - 0.07 * sev(s, "combustion_loss")),
  };
}

/** Bias on chamber pressure sensor A, in % of reference chamber pressure. */
export const driftBias = (s: Severities) => -9 * sev(s, "pc_sensor_drift");
/** Multiplier on the noise of the oxidiser pump discharge pressure sensor. */
export const noiseMultiplier = (s: Severities) => 1 + 8 * sev(s, "sensor_noise");
/** Whole-stream transport delay, in simulation steps. */
export const transportDelaySteps = (s: Severities) => Math.round(16 * sev(s, "packet_delay"));
/** Clock offset of one acquisition node, in simulation steps. */
export const SKEWED_NODE: DaqNode = "turbo";
export const clockSkewSteps = (s: Severities) => Math.round(10 * sev(s, "timestamp_error"));
export const replayActive = (s: Severities) => sev(s, "telemetry_replay") > 0;
