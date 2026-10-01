// Fault models and the fault state machine. Each model is a deterministic
// function from operating conditions and a severity to what the sensors would
// show and what health monitoring would conclude. Equations are deliberately
// simple but coherent with each other. Every value is simulated.
import type { ActiveFaultScenarioId, Confidence, ExpectedRange, FaultStage, HealthState } from "../types";
import { FAULT_STAGES } from "../data/faultScenarios";
import { clamp01, round } from "../lib/math";
import { ANOMALY_SEVERITY } from "./mission";
import { describeWindow, healthIndex, maintenanceWindow } from "./prognostics";

// ── State machine ──

export interface FaultMachine {
  scenario: ActiveFaultScenarioId | null;
  stage: FaultStage;
  /** Stages advance on their own while playing. */
  playing: boolean;
  /** Seconds spent in the current stage. */
  stageTimeS: number;
}

export const INITIAL_FAULT: FaultMachine = { scenario: null, stage: "HEALTHY", playing: false, stageTimeS: 0 };

export type FaultEvent =
  | { type: "START"; scenario: ActiveFaultScenarioId; autoplay?: boolean }
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "GOTO"; stage: FaultStage }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TICK"; dt: number }
  | { type: "CLEAR" };

/** Seconds each stage is held when the demo plays on its own. */
export const STAGE_DWELL_S = 8;

export const stageIndex = (stage: FaultStage) => FAULT_STAGES.indexOf(stage);
export const isLastStage = (stage: FaultStage) => stageIndex(stage) === FAULT_STAGES.length - 1;
/** True once the scenario has reached `stage`. */
export const reached = (current: FaultStage, stage: FaultStage) => stageIndex(current) >= stageIndex(stage);

export function faultReducer(machine: FaultMachine, event: FaultEvent): FaultMachine {
  switch (event.type) {
    case "START":
      return { scenario: event.scenario, stage: "HEALTHY", playing: event.autoplay ?? false, stageTimeS: 0 };
    case "CLEAR":
      return INITIAL_FAULT;
    case "NEXT": {
      if (!machine.scenario || isLastStage(machine.stage)) return { ...machine, playing: false };
      return { ...machine, stage: FAULT_STAGES[stageIndex(machine.stage) + 1], stageTimeS: 0 };
    }
    case "PREVIOUS": {
      if (!machine.scenario || machine.stage === "HEALTHY") return machine;
      return { ...machine, stage: FAULT_STAGES[stageIndex(machine.stage) - 1], stageTimeS: 0 };
    }
    case "GOTO":
      if (!machine.scenario) return machine;
      return { ...machine, stage: event.stage, stageTimeS: 0 };
    case "PLAY":
      if (!machine.scenario) return machine;
      // Playing from the end starts the scenario again.
      return isLastStage(machine.stage) ? { ...machine, stage: "HEALTHY", playing: true, stageTimeS: 0 } : { ...machine, playing: true };
    case "PAUSE":
      return { ...machine, playing: false };
    case "TICK": {
      if (!machine.scenario) return machine;
      const stageTimeS = machine.stageTimeS + Math.max(0, event.dt);
      if (!machine.playing || stageTimeS < STAGE_DWELL_S) return { ...machine, stageTimeS };
      if (isLastStage(machine.stage)) return { ...machine, playing: false, stageTimeS };
      return { ...machine, stage: FAULT_STAGES[stageIndex(machine.stage) + 1], stageTimeS: 0 };
    }
  }
}

/** Severity each stage settles at. The detection threshold lies between EARLY_CHANGE and ANOMALOUS. */
export const STAGE_SEVERITY: Record<FaultStage, number> = {
  HEALTHY: 0,
  EARLY_CHANGE: 0.2,
  ANOMALOUS: 0.42,
  DIAGNOSED: 0.5,
  DEGRADING: 0.54,
  ACTION_REQUIRED: 0.58,
  MAINTENANCE: 0.58,
};

export interface Evidence {
  label: string;
  present: boolean;
}

const confidenceFrom = (evidence: readonly Evidence[]): Confidence | null => {
  const count = evidence.filter((e) => e.present).length;
  if (count === 0) return null;
  return count >= 3 ? "HIGH" : count === 2 ? "MEDIUM" : "LOW";
};

// ── Motor bearing degradation ──

export interface BearingInputs {
  /** Seconds; only adds a small repeatable ripple so the reading is not frozen. */
  missionTime: number;
  rpm: number;
  /** Fraction of maximum continuous load, 0–1. */
  load: number;
  /** 0 = healthy, 1 = failed. */
  faultSeverity: number;
}

export interface BearingOutputs {
  /** Vibration level at the front-bearing sensor, simulated units. */
  vibrationRms: number;
  expectedVibration: ExpectedRange;
  /** Amplitude at the bearing defect frequency, as a multiple of the healthy vibration level. */
  spectralFeature: number;
  /** Upper bound of the baseline model for the feature. */
  featureLimit: number;
  bearingTemp: number;
  expectedBearingTemp: ExpectedRange;
  /** The feature has left the baseline model. */
  anomaly: boolean;
  healthState: HealthState;
  /** 1 = as new, 0 = at the limit. */
  healthIndex: number;
  diagnosis: string | null;
  evidence: Evidence[];
  confidence: Confidence | null;
  prognosisBand: { fromCycles: number; toCycles: number } | null;
  maintenanceRecommendation: string;
}

/** Shaft order of the bearing defect frequency (outer race), a non-integer multiple of shaft speed. */
export const BEARING_ORDER = 3.58;
const REFERENCE_RPM = 800;

/**
 * How the overall vibration level grows with severity. Slow at first: the
 * level only reaches the top of its expected range at the detection
 * threshold, which is why the frequency feature — not the level — detects early.
 */
export const vibrationMultiplier = (severity: number) => 1 + 10.23 * Math.pow(severity, 3.765);

/** RMS of the bearing's contribution, as a multiple of the healthy level: what must be added for the total to follow the multiplier. */
export const faultAmplitude = (severity: number) => Math.sqrt(Math.max(0, vibrationMultiplier(severity) ** 2 - 1));

/**
 * The bearing's contribution has a fixed shape: a tone at the defect frequency
 * (with a second harmonic) plus, after each ball pass, a short ring of the
 * structure. These weights and the resulting RMS are shared with the signal
 * synthesis so the spectrum's bearing line equals the feature reported here.
 */
export const BEARING_SHAPE = { secondHarmonic: 0.45, ring: 1.6, ringDecay: 5.5 } as const;
const TONE_RMS = Math.sqrt((1 + BEARING_SHAPE.secondHarmonic ** 2) / 2);
const RING_RMS = Math.sqrt((1 - Math.exp(-2 * BEARING_SHAPE.ringDecay)) / (4 * BEARING_SHAPE.ringDecay));
export const BEARING_SHAPE_RMS = Math.hypot(TONE_RMS, BEARING_SHAPE.ring * RING_RMS);

const FEATURE_FLOOR = 0.03;
/** Amplitude at the bearing frequency as a multiple of the healthy vibration level. */
const featureAt = (severity: number) => FEATURE_FLOOR + faultAmplitude(severity) / BEARING_SHAPE_RMS;
const FEATURE_LIMIT = featureAt(ANOMALY_SEVERITY);

/** Vibration of a healthy unit: rises with speed and with load. */
export const baselineVibration = (rpm: number, load: number) => (rpm <= 0 ? 0 : 0.25 + 0.42 * (rpm / REFERENCE_RPM) + 0.31 * load);
const baselineBearingTemp = (rpm: number, load: number) => 34 + 9 * (rpm / 1250) + 30 * load;

export function bearingDegradation({ missionTime, rpm, load, faultSeverity }: BearingInputs): BearingOutputs {
  const severity = clamp01(faultSeverity);
  const base = baselineVibration(rpm, load);
  const running = rpm > 1;
  const ripple = 1 + 0.008 * Math.sin(missionTime * 1.7) + 0.004 * Math.sin(missionTime * 4.3);
  const vibrationRms = base * vibrationMultiplier(severity) * ripple;
  const expectedVibration = { min: base * 0.89, max: base * 1.11 };

  const spectralFeature = running ? featureAt(severity) : 0;
  const nominalTemp = baselineBearingTemp(rpm, load);
  const bearingTemp = nominalTemp + 16 * Math.pow(severity, 1.2);
  const expectedBearingTemp = { min: nominalTemp - 4, max: nominalTemp + 4 };

  // Detection is on severity, which is what the feature encodes; a stopped rotor keeps the last conclusion.
  const anomaly = severity > ANOMALY_SEVERITY;
  const evidence: Evidence[] = [
    { label: "Vibration trend", present: anomaly && (!running || vibrationRms > expectedVibration.max) },
    { label: "Frequency feature", present: anomaly },
    { label: "Temperature trend", present: anomaly && bearingTemp > expectedBearingTemp.max },
  ];
  const window = anomaly ? maintenanceWindow(severity) : null;

  return {
    vibrationRms,
    expectedVibration,
    spectralFeature,
    featureLimit: FEATURE_LIMIT,
    bearingTemp,
    expectedBearingTemp,
    anomaly,
    healthState: anomaly ? "DEGRADED" : "NOMINAL",
    healthIndex: healthIndex(severity),
    diagnosis: anomaly ? "POSSIBLE BEARING DEGRADATION" : null,
    evidence,
    confidence: confidenceFrom(evidence),
    prognosisBand: window,
    maintenanceRecommendation: anomaly ? `Inspect propulsion unit 04 bearing assembly. ${describeWindow(window)}.` : "No action. Continue monitoring.",
  };
}

// ── Battery module imbalance ──

export interface BatteryFaultInputs {
  /** Pack current as a fraction of maximum, 0–1: spread shows under load. */
  load: number;
  faultSeverity: number;
}

export interface BatteryFaultOutputs {
  /** Spread between cell groups of module 03, mV. */
  voltageSpreadMv: number;
  expectedVoltageSpreadMv: ExpectedRange;
  /** Module 03 temperature above the pack mean, °C. */
  temperatureSpreadC: number;
  expectedTemperatureSpreadC: ExpectedRange;
  /** Internal resistance estimate of module 03 relative to new, 1 = as new. */
  resistanceRatio: number;
  anomaly: boolean;
  healthState: HealthState;
  healthIndex: number;
  /** Available power as a fraction of nominal. */
  powerFactor: number;
  /** Power capability has been reduced to protect the weaker cell group. */
  derated: boolean;
  diagnosis: string | null;
  evidence: Evidence[];
  confidence: Confidence | null;
  prognosisBand: { fromCycles: number; toCycles: number } | null;
  maintenanceRecommendation: string;
}

/** Fractional loss of available power beyond which the energy system is LIMITED rather than DEGRADED. */
export const DERATE_LIMIT = 0.1;

export function batteryImbalance({ load, faultSeverity }: BatteryFaultInputs): BatteryFaultOutputs {
  const severity = clamp01(faultSeverity);
  const loading = 0.35 + 0.65 * clamp01(load);
  const voltageSpreadMv = 9 + 4 * loading + 150 * Math.pow(severity, 2.2) * loading;
  const expectedVoltageSpreadMv = { min: 4, max: 22 };
  const temperatureSpreadC = 1.6 + 22.7 * Math.pow(severity, 2) * loading;
  const expectedTemperatureSpreadC = { min: 0, max: 3.5 };
  const resistanceRatio = 1 + 0.62 * severity;

  const anomaly = severity > ANOMALY_SEVERITY;
  // Power is held back in proportion to how far the weak group has drifted past detection.
  const powerFactor = round(1 - 0.3 * clamp01((severity - ANOMALY_SEVERITY) / 0.3), 3);
  const derated = 1 - powerFactor > 0.02;
  const evidence: Evidence[] = [
    { label: "Voltage spread", present: anomaly && voltageSpreadMv > expectedVoltageSpreadMv.max },
    { label: "Temperature spread", present: anomaly && temperatureSpreadC > expectedTemperatureSpreadC.max },
    { label: "Resistance estimate", present: anomaly && resistanceRatio > 1.15 },
  ];
  const window = anomaly ? maintenanceWindow(severity) : null;

  return {
    voltageSpreadMv,
    expectedVoltageSpreadMv,
    temperatureSpreadC,
    expectedTemperatureSpreadC,
    resistanceRatio,
    anomaly,
    healthState: anomaly ? "DEGRADED" : "NOMINAL",
    healthIndex: healthIndex(severity),
    powerFactor,
    derated,
    diagnosis: anomaly ? "MODULE 03 CELL-GROUP IMBALANCE" : null,
    evidence,
    confidence: confidenceFrom(evidence),
    prognosisBand: window,
    maintenanceRecommendation: anomaly ? `Inspect battery module 03. ${describeWindow(window)}.` : "No action. Continue monitoring.",
  };
}
