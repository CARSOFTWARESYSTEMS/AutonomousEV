// Fault Lab content: the scenario catalogue and the stage-by-stage narrative
// of the two scenarios simulated in this release. The numbers behind each
// stage come from simulation/faultModels.ts; nothing here computes.
import type { ActiveFaultScenarioId, ComponentId, FaultCategory, FaultScenarioId, FaultStage } from "../types";

export interface FaultScenario {
  id: FaultScenarioId;
  title: string;
  category: FaultCategory;
  /** The component the scenario is about. */
  subject: ComponentId;
  subjectLabel: string;
  summary: string;
  /** False for scenarios listed for a later release. */
  available: boolean;
}

export const FAULT_CATEGORIES: readonly { id: FaultCategory; label: string }[] = [
  { id: "propulsion", label: "PROPULSION" },
  { id: "energy", label: "ENERGY" },
  { id: "structures", label: "STRUCTURES" },
  { id: "flightControl", label: "FLIGHT CONTROL" },
  { id: "thermal", label: "THERMAL" },
  { id: "avionics", label: "AVIONICS" },
];

export const FAULT_SCENARIOS: readonly FaultScenario[] = [
  {
    id: "bearing-degradation",
    title: "MOTOR BEARING DEGRADATION",
    category: "propulsion",
    subject: "propulsion-unit-04",
    subjectLabel: "PROPULSION UNIT 04",
    summary: "A motor bearing begins to wear. Follow the vibration signal from first change to maintenance action.",
    available: true,
  },
  {
    id: "battery-imbalance",
    title: "BATTERY MODULE IMBALANCE",
    category: "energy",
    subject: "battery-module-03",
    subjectLabel: "BATTERY MODULE 03",
    summary: "One cell group drifts from its neighbours. See how spread in voltage, temperature and resistance limits available power.",
    available: true,
  },
  { id: "rotor-imbalance", title: "ROTOR IMBALANCE", category: "propulsion", subject: "propulsion-unit-02", subjectLabel: "PROPULSION UNIT 02", summary: "Vibration at shaft speed from an out-of-balance rotor.", available: false },
  { id: "inverter-overtemperature", title: "INVERTER OVERTEMPERATURE", category: "thermal", subject: "pu03-inverter", subjectLabel: "INVERTER, UNIT 03", summary: "Inverter temperature rising against its cooling.", available: false },
  { id: "coolant-flow-reduction", title: "COOLANT FLOW REDUCTION", category: "thermal", subject: "coolant-pumps", subjectLabel: "COOLANT PUMPS", summary: "Reduced flow in the battery cooling loop.", available: false },
  { id: "actuator-degradation", title: "ACTUATOR DEGRADATION", category: "flightControl", subject: "wing-actuators", subjectLabel: "WING ACTUATORS", summary: "An actuator following its command more slowly.", available: false },
  { id: "compute-channel-loss", title: "COMPUTE CHANNEL LOSS", category: "avionics", subject: "fcc-b", subjectLabel: "FLIGHT COMPUTER B", summary: "Loss of one flight-compute channel. Shown in ARCHITECTURE as the redundancy reference.", available: false },
  { id: "structural-fatigue", title: "STRUCTURAL FATIGUE TREND", category: "structures", subject: "wing-structure-right", subjectLabel: "WING STRUCTURE", summary: "Fatigue exposure accumulating at a spar root.", available: false },
];

export const getScenario = (id: FaultScenarioId): FaultScenario => FAULT_SCENARIOS.find((s) => s.id === id)!;

export const ACTIVE_SCENARIOS: readonly ActiveFaultScenarioId[] = ["bearing-degradation", "battery-imbalance"];
export const isActiveScenario = (id: FaultScenarioId): id is ActiveFaultScenarioId => (ACTIVE_SCENARIOS as readonly string[]).includes(id);

/** Scenario stages, in order. The machine in simulation/faultModels.ts walks this list. */
export const FAULT_STAGES: readonly FaultStage[] = ["HEALTHY", "EARLY_CHANGE", "ANOMALOUS", "DIAGNOSED", "DEGRADING", "ACTION_REQUIRED", "MAINTENANCE"];

export interface StageNarrative {
  /** Stage name shown in the demo timeline. */
  label: string;
  /** Headline for the stage. */
  headline: string;
  /** One or two sentences. */
  text: string;
}

export const BEARING_NARRATIVE: Record<FaultStage, StageNarrative> = {
  HEALTHY: {
    label: "HEALTHY",
    headline: "Motor 04 is running normally",
    text: "The aircraft is in cruise. Vibration on the front bearing of propulsion unit 04 sits inside its expected range.",
  },
  EARLY_CHANGE: {
    label: "EARLY CHANGE",
    headline: "A small change appears",
    text: "The waveform changes slightly and a frequency feature begins to rise. It is still inside the baseline model, so nothing is announced.",
  },
  ANOMALOUS: {
    label: "ANOMALY",
    headline: "ANOMALY DETECTED",
    text: "The frequency feature has left the baseline model. Motor 04 is flagged. The aircraft remains stable.",
  },
  DIAGNOSED: {
    label: "DIAGNOSIS",
    headline: "POSSIBLE BEARING DEGRADATION",
    text: "Independent evidence points at the front bearing: the vibration trend, the frequency feature and a small rise in bearing temperature.",
  },
  DEGRADING: {
    label: "PROGNOSIS",
    headline: "HEALTH TRAJECTORY",
    text: "The trend is projected forward. The band shows the uncertainty; where it meets the maintenance threshold gives the maintenance window.",
  },
  ACTION_REQUIRED: {
    label: "MISSION DECISION",
    headline: "Continue to destination",
    text: "No immediate safety impact. The propulsion unit stays available. An inspection is required after landing.",
  },
  MAINTENANCE: {
    label: "MAINTENANCE ACTION",
    headline: "MAINTENANCE ACTION",
    text: "On the ground, the condition is handed to maintenance with its evidence.",
  },
};

export const BATTERY_NARRATIVE: Record<FaultStage, StageNarrative> = {
  HEALTHY: {
    label: "HEALTHY",
    headline: "Module 03 is normal",
    text: "Cell-group voltages and temperatures in module 03 match the rest of the pack.",
  },
  EARLY_CHANGE: {
    label: "EARLY CHANGE",
    headline: "One cell group begins to drift",
    text: "Voltage spread grows slightly under load. Still inside the baseline model.",
  },
  ANOMALOUS: {
    label: "ANOMALY",
    headline: "ANOMALY DETECTED",
    text: "Voltage spread, temperature spread and the resistance estimate have all risen in module 03.",
  },
  DIAGNOSED: {
    label: "DIAGNOSIS",
    headline: "MODULE 03 DEGRADED",
    text: "The evidence isolates a representative cell group in module 03 with higher internal resistance.",
  },
  DEGRADING: {
    label: "PROGNOSIS",
    headline: "HEALTH TRAJECTORY",
    text: "The resistance trend is projected forward with its uncertainty to give a maintenance window.",
  },
  ACTION_REQUIRED: {
    label: "MISSION DECISION",
    headline: "POWER CAPABILITY DERATED",
    text: "Available power is reduced to protect the weaker cell group. The mission continues with a limitation.",
  },
  MAINTENANCE: {
    label: "MAINTENANCE ACTION",
    headline: "MAINTENANCE ACTION",
    text: "On the ground, the module is handed to maintenance with its evidence.",
  },
};

export const NARRATIVE: Record<ActiveFaultScenarioId, Record<FaultStage, StageNarrative>> = {
  "bearing-degradation": BEARING_NARRATIVE,
  "battery-imbalance": BATTERY_NARRATIVE,
};

export const BEARING_MAINTENANCE_ACTIONS: readonly string[] = [
  "Inspect propulsion unit 04 bearing assembly.",
  "Review vibration trend.",
  "Review thermal trend.",
  "Verify rotor balance.",
  "Close condition only after inspection.",
];

export const BATTERY_MAINTENANCE_ACTIONS: readonly string[] = [
  "Inspect battery module 03 and its cell-group connections.",
  "Review voltage-spread and temperature-spread trends.",
  "Verify cooling performance under module 03.",
  "Rebalance or replace the module as found.",
  "Close condition only after inspection.",
];

export const MAINTENANCE_ACTIONS: Record<ActiveFaultScenarioId, readonly string[]> = {
  "bearing-degradation": BEARING_MAINTENANCE_ACTIONS,
  "battery-imbalance": BATTERY_MAINTENANCE_ACTIONS,
};

export const SCENARIO_NOTE = "This is a reference educational scenario. All values are simulated.";
