// The real-vehicle diagnosis: what a technician records, in which stage, the
// safety screen that comes before everything else, and the guided flow for
// each complaint. No field has a default value: everything starts NOT MEASURED.
import type { MeasurementKey, ObservationKey } from "@/lib/ev-battery-toolkit/types";

export interface MeasurementField {
  key: MeasurementKey;
  label: string;
  unit: string;
  digits: number;
  hint?: string;
  /** Specification fields can also come from documentation (manufacturer / third party). */
  spec?: boolean;
}

export interface ObservationField {
  key: ObservationKey;
  label: string;
  options: string[];
  /** Options that mean a problem was found. */
  abnormal: string[];
}

export const MEASUREMENTS: Record<MeasurementKey, MeasurementField> = {
  batteryNominalVoltage: { key: "batteryNominalVoltage", label: "Battery nominal voltage", unit: "V", digits: 1, hint: "From the pack label or documentation.", spec: true },
  ratedCapacityAh: { key: "ratedCapacityAh", label: "Battery rated capacity", unit: "Ah", digits: 1, hint: "From the pack label or documentation.", spec: true },
  packVoltage: { key: "packVoltage", label: "Measured pack voltage (open circuit)", unit: "V", digits: 1, hint: "At the pack terminals at rest, with a meter rated for the pack voltage." },
  loadedPackVoltage: { key: "loadedPackVoltage", label: "Loaded pack voltage", unit: "V", digits: 1, hint: "Only if it can be read safely during a controlled load, e.g. from the BMS or a tester." },
  chargerVoltage: { key: "chargerVoltage", label: "Charger output voltage", unit: "V", digits: 1, hint: "Open-circuit charger output." },
  voltageDuringCharge: { key: "voltageDuringCharge", label: "Pack voltage during charge", unit: "V", digits: 1 },
  chargerCurrent: { key: "chargerCurrent", label: "Charging current", unit: "A", digits: 1 },
  packCurrent: { key: "packCurrent", label: "Pack current", unit: "A", digits: 1, hint: "BMS reading or clamp meter. Positive = discharge." },
  connectorVoltageDrop: { key: "connectorVoltageDrop", label: "Voltage drop across connector under load", unit: "mV", digits: 0, hint: "If a safe measurement is possible." },
  soc: { key: "soc", label: "SOC", unit: "%", digits: 0 },
  soh: { key: "soh", label: "SOH", unit: "%", digits: 0, hint: "As reported by the BMS or a diagnostic tester." },
  cellMin: { key: "cellMin", label: "Minimum cell-group voltage", unit: "V", digits: 3 },
  cellMax: { key: "cellMax", label: "Maximum cell-group voltage", unit: "V", digits: 3 },
  cellDelta: { key: "cellDelta", label: "Cell delta", unit: "mV", digits: 0, hint: "Leave empty to derive it from the minimum and maximum." },
  tempMin: { key: "tempMin", label: "Minimum temperature", unit: "°C", digits: 1 },
  tempMax: { key: "tempMax", label: "Maximum temperature", unit: "°C", digits: 1 },
  tempSpread: { key: "tempSpread", label: "Temperature spread", unit: "°C", digits: 1, hint: "Leave empty to derive it." },
  tempSensorCount: { key: "tempSensorCount", label: "Temperature sensor count", unit: "", digits: 0, hint: "Channels the BMS or tester reports." },
  ambientTemp: { key: "ambientTemp", label: "Ambient temperature", unit: "°C", digits: 1 },
  insulationResistance: { key: "insulationResistance", label: "Insulation resistance", unit: "MΩ", digits: 1, hint: "Only with suitable equipment and training." },
};

export const OBSERVATIONS: Record<ObservationKey, ObservationField> = {
  bmsStatus: { key: "bmsStatus", label: "BMS status", options: ["Normal", "Warning", "Protection", "Offline / no data"], abnormal: ["Warning", "Protection", "Offline / no data"] },
  bmsFaultCodes: { key: "bmsFaultCodes", label: "BMS fault codes", options: [], abnormal: [] },
  chargeEnable: { key: "chargeEnable", label: "Charge enable state", options: ["Enabled", "Disabled"], abnormal: ["Disabled"] },
  dischargeEnable: { key: "dischargeEnable", label: "Discharge enable state", options: ["Enabled", "Disabled"], abnormal: ["Disabled"] },
  commStatus: { key: "commStatus", label: "Communication status", options: ["Online", "Intermittent", "Offline"], abnormal: ["Intermittent", "Offline"] },
  bmsProtocol: { key: "bmsProtocol", label: "BMS communication protocol (as physically confirmed)", options: ["CAN", "UART", "BLE", "Other", "Unknown"], abnormal: [] },
  currentProtection: { key: "currentProtection", label: "Current protection status", options: ["No event recorded", "Overcurrent event recorded"], abnormal: ["Overcurrent event recorded"] },
  fuseStatus: { key: "fuseStatus", label: "Fuse status", options: ["Intact", "Open"], abnormal: ["Open"] },
  connectorCondition: { key: "connectorCondition", label: "Connector condition", options: ["Good", "Loose", "Corroded", "Burnt / heat-damaged"], abnormal: ["Loose", "Corroded", "Burnt / heat-damaged"] },
  corrosion: { key: "corrosion", label: "Corrosion", options: ["None", "Light", "Severe"], abnormal: ["Light", "Severe"] },
  waterIngress: { key: "waterIngress", label: "Water ingress evidence", options: ["None", "Signs of moisture", "Water inside / flood exposure"], abnormal: ["Signs of moisture", "Water inside / flood exposure"] },
  swelling: { key: "swelling", label: "Swelling", options: ["None", "Suspected", "Visible"], abnormal: ["Suspected", "Visible"] },
  enclosureDamage: { key: "enclosureDamage", label: "Enclosure damage", options: ["None", "Minor scuffs", "Crack / breach"], abnormal: ["Crack / breach"] },
  abnormalSmell: { key: "abnormalSmell", label: "Abnormal smell", options: ["None", "Burning smell", "Strong chemical smell"], abnormal: ["Burning smell", "Strong chemical smell"] },
  abnormalHeat: { key: "abnormalHeat", label: "Abnormal heat", options: ["None", "Warm to touch", "Hot to touch", "Smoke"], abnormal: ["Hot to touch", "Smoke"] },
  hotspotLocation: { key: "hotspotLocation", label: "Hot-spot location", options: ["None found", "Connector", "Cell area", "BMS area", "Busbar / joint"], abnormal: ["Connector", "Cell area", "BMS area", "Busbar / joint"] },
  loadBehaviour: { key: "loadBehaviour", label: "Load behaviour", options: ["Stable under load", "Voltage sag under load", "Shuts down under load"], abnormal: ["Voltage sag under load", "Shuts down under load"] },
  chargeResponse: { key: "chargeResponse", label: "Charge response", options: ["Charges normally", "Charges slowly", "Starts then stops", "No response"], abnormal: ["Charges slowly", "Starts then stops", "No response"] },
  dischargeResponse: { key: "dischargeResponse", label: "Discharge response", options: ["Normal output", "Intermittent output", "Cuts out under load", "No output"], abnormal: ["Intermittent output", "Cuts out under load", "No output"] },
  chargerLed: { key: "chargerLed", label: "Charger indication", options: ["Normal", "Abnormal", "No indication"], abnormal: ["Abnormal", "No indication"] },
  storageHistory: { key: "storageHistory", label: "Storage history", options: ["In regular use", "Stored under 1 month", "Stored 1–3 months", "Stored over 3 months"], abnormal: ["Stored 1–3 months", "Stored over 3 months"] },
  capacityTest: { key: "capacityTest", label: "Capacity test", options: ["Within expectation", "Below expectation", "Severely low"], abnormal: ["Below expectation", "Severely low"] },
  internalResistanceTest: { key: "internalResistanceTest", label: "Internal resistance comparison", options: ["Uniform", "One group high"], abnormal: ["One group high"] },
};

/** Conditions that stop the diagnosis until the technician acknowledges them. */
export const SAFETY_HAZARDS: { id: string; label: string }[] = [
  { id: "swelling", label: "Swelling" },
  { id: "smoke", label: "Smoke" },
  { id: "overheating", label: "Severe overheating / severe heat" },
  { id: "leakage", label: "Electrolyte leakage" },
  { id: "burnt-connector", label: "Burnt connector" },
  { id: "puncture", label: "Puncture" },
  { id: "flood", label: "Flood damage / submersion history" },
  { id: "breach", label: "Enclosure breach" },
  { id: "chemical-smell", label: "Strong chemical smell" },
  { id: "internal-short", label: "Suspected internal short" },
  { id: "thermal-runaway", label: "Thermal runaway indicators (venting, hissing, rapidly rising temperature)" },
];

export const COMPLAINTS: { id: string; label: string }[] = [
  { id: "reduced-range", label: "Reduced range" },
  { id: "not-charging", label: "Battery not charging" },
  { id: "slow-charging", label: "Slow charging" },
  { id: "stops-early", label: "Charging stops early" },
  { id: "no-start", label: "Vehicle does not start" },
  { id: "shutdown-load", label: "Vehicle shuts down under load" },
  { id: "soc-drop", label: "SOC drops suddenly" },
  { id: "low-range-full", label: "Low range after full charge" },
  { id: "overheating", label: "Battery overheating" },
  { id: "connector-heating", label: "Connector heating" },
  { id: "after-rain", label: "Problem after rain" },
  { id: "storage", label: "Problem after long storage" },
  { id: "charger-led", label: "Charger LED abnormal" },
  { id: "no-output", label: "No battery output" },
  { id: "intermittent-output", label: "Intermittent battery output" },
  { id: "bms-comm", label: "BMS communication unavailable" },
  { id: "other", label: "Other" },
];

export const REAL_STAGES: { id: string; title: string; purpose: string }[] = [
  { id: "complaint", title: "Customer Complaint", purpose: "Record what the customer reports, in their words. A complaint is a starting point, never a diagnosis." },
  { id: "safety", title: "Safety Screen", purpose: "Check for hazards before anyone touches the pack." },
  { id: "identify", title: "Vehicle & Battery Identification", purpose: "Vehicle, model, year, odometer, battery ID and the pack's rated values." },
  { id: "visual", title: "Visual Inspection", purpose: "External checks only: enclosure, connectors, water, corrosion, swelling, smell and heat." },
  { id: "electrical", title: "Electrical Measurements", purpose: "Pack voltage, charger output, charge and discharge response." },
  { id: "bms", title: "BMS / Diagnostic Data", purpose: "SOC, SOH, status, fault codes, enable states and communication." },
  { id: "cells", title: "Cell / Module Comparison", purpose: "Group minimum, maximum, delta, load behaviour and confirmed pack configuration." },
  { id: "thermal", title: "Thermal Inspection", purpose: "Temperatures, spread, sensor count and hot-spot location." },
  { id: "analysis", title: "Root-Cause Analysis", purpose: "Candidates with their evidence and the evidence gate." },
  { id: "decision", title: "Repair Decision", purpose: "Decision, reason, evidence, missing evidence, risk and the next action." },
  { id: "repair", title: "Repair Action", purpose: "What was done and which parts were replaced." },
  { id: "post", title: "Post-Repair Test", purpose: "After-repair measurements, checks and comparison." },
  { id: "report", title: "Customer Report", purpose: "Job card and diagnostic report." },
];

/** Which fields each stage records. */
export const STAGE_FIELDS: Record<string, { measurements: MeasurementKey[]; observations: ObservationKey[] }> = {
  complaint: { measurements: [], observations: ["storageHistory"] },
  identify: { measurements: ["batteryNominalVoltage", "ratedCapacityAh"], observations: [] },
  visual: { measurements: [], observations: ["enclosureDamage", "connectorCondition", "corrosion", "waterIngress", "swelling", "abnormalSmell", "abnormalHeat", "fuseStatus"] },
  electrical: { measurements: ["packVoltage", "loadedPackVoltage", "chargerVoltage", "voltageDuringCharge", "chargerCurrent", "packCurrent", "connectorVoltageDrop", "insulationResistance"], observations: ["chargeResponse", "chargerLed", "dischargeResponse"] },
  bms: { measurements: ["soc", "soh"], observations: ["bmsStatus", "bmsFaultCodes", "chargeEnable", "dischargeEnable", "commStatus", "bmsProtocol", "currentProtection"] },
  cells: { measurements: ["cellMin", "cellMax", "cellDelta"], observations: ["loadBehaviour", "capacityTest", "internalResistanceTest"] },
  thermal: { measurements: ["tempMin", "tempMax", "tempSpread", "tempSensorCount", "ambientTemp"], observations: ["hotspotLocation"] },
};

/** The after-repair fields: a subset of the before fields, compared side by side. */
export const AFTER_MEASUREMENTS: MeasurementKey[] = ["packVoltage", "soc", "soh", "cellMin", "cellMax", "cellDelta", "tempMax"];
export const AFTER_OBSERVATIONS: ObservationKey[] = ["bmsStatus", "bmsFaultCodes", "chargeEnable", "dischargeEnable"];

export const VERIFICATION_CHECKS: { id: string; label: string; critical: boolean; criterion: string }[] = [
  { id: "visual", label: "Visual Inspection", critical: true, criterion: "No damage, swelling, leakage or loose parts" },
  { id: "connector", label: "Connector Inspection", critical: true, criterion: "Repaired connector or component verified, fully engaged and locked" },
  { id: "packVoltage", label: "Pack Voltage", critical: true, criterion: "Stable and consistent with SOC" },
  { id: "cellDelta", label: "Cell-Group Comparison", critical: true, criterion: "Acceptable cell-group balance where data are available (reference < 50 mV at rest)" },
  { id: "temperature", label: "Temperature", critical: true, criterion: "No abnormal thermal condition" },
  { id: "bmsStatus", label: "BMS Status & Communication", critical: true, criterion: "BMS NORMAL and communication normal" },
  { id: "chargeTest", label: "Charge Test", critical: false, criterion: "Charge path working at expected current" },
  { id: "dischargeTest", label: "Discharge Test", critical: false, criterion: "Discharge path working under a road or load test" },
  { id: "faultRescan", label: "Fault Rescan", critical: true, criterion: "Rescan completed with no active faults" },
  { id: "safetyCheck", label: "Safety Check", critical: true, criterion: "No critical safety fault present" },
];

/** Acknowledgements required before advanced (internal) repair concepts are shown. */
export const ADVANCED_REPAIR_ACKS: { id: string; label: string }[] = [
  { id: "config-verified", label: "The battery configuration has been physically verified." },
  { id: "isolated", label: "The pack is isolated." },
  { id: "chemistry-known", label: "The cell chemistry is known." },
  { id: "ppe", label: "Appropriate PPE is available." },
  { id: "trained", label: "I am trained for lithium battery work." },
];

// ── Guided flow per complaint ──

export type FlowNeed = { m: MeasurementKey } | { o: ObservationKey } | { safety: true };

export interface FlowStep {
  label: string;
  /** Recorded fields that complete the step. With `any`, one of them is enough. */
  needs: FlowNeed[];
  any?: boolean;
}

const CHARGING_FLOW: FlowStep[] = [
  { label: "Visual and safety check", needs: [{ safety: true }, { o: "connectorCondition" }] },
  { label: "Measure battery open-circuit voltage", needs: [{ m: "packVoltage" }] },
  { label: "Measure charger output voltage", needs: [{ m: "chargerVoltage" }] },
  { label: "Connect the charger safely and observe the indication", needs: [{ o: "chargeResponse" }, { o: "chargerLed" }], any: true },
  { label: "Measure pack voltage during charging", needs: [{ m: "voltageDuringCharge" }] },
  { label: "Check charging current if available", needs: [{ m: "chargerCurrent" }] },
  { label: "Check the BMS charge-enable state", needs: [{ o: "chargeEnable" }] },
  { label: "Inspect connector condition", needs: [{ o: "connectorCondition" }] },
  { label: "Inspect temperature", needs: [{ m: "tempMax" }] },
  { label: "Inspect BMS fault codes", needs: [{ o: "bmsFaultCodes" }] },
];

const RANGE_FLOW: FlowStep[] = [
  { label: "Confirm full-charge state", needs: [{ m: "soc" }] },
  { label: "Record SOC", needs: [{ m: "soc" }] },
  { label: "Record SOH if available", needs: [{ m: "soh" }] },
  { label: "Measure pack voltage", needs: [{ m: "packVoltage" }] },
  { label: "Record maximum and minimum cell-group voltage", needs: [{ m: "cellMax" }, { m: "cellMin" }] },
  { label: "Record cell delta", needs: [{ m: "cellMin" }, { m: "cellMax" }] },
  { label: "Check temperature spread", needs: [{ m: "tempMax" }, { m: "tempMin" }] },
  { label: "Inspect discharge behaviour under load", needs: [{ o: "loadBehaviour" }] },
  { label: "Check voltage sag", needs: [{ m: "loadedPackVoltage" }] },
  { label: "Check capacity-test evidence if available", needs: [{ o: "capacityTest" }] },
];

const SHUTDOWN_FLOW: FlowStep[] = [
  { label: "Record SOC at the event", needs: [{ m: "soc" }] },
  { label: "Measure resting pack voltage", needs: [{ m: "packVoltage" }] },
  { label: "Measure loaded voltage if safe and available", needs: [{ m: "loadedPackVoltage" }] },
  { label: "Record the BMS event or fault", needs: [{ o: "bmsFaultCodes" }] },
  { label: "Compare minimum and maximum cell group", needs: [{ m: "cellMin" }, { m: "cellMax" }] },
  { label: "Inspect connector temperature", needs: [{ o: "hotspotLocation" }, { o: "abnormalHeat" }], any: true },
  { label: "Inspect current-protection status", needs: [{ o: "currentProtection" }] },
  { label: "Inspect pack temperature", needs: [{ m: "tempMax" }] },
  { label: "Determine whether voltage sag is present", needs: [{ o: "loadBehaviour" }] },
];

const STORAGE_FLOW: FlowStep[] = [
  { label: "Safety inspection", needs: [{ safety: true }] },
  { label: "Measure pack voltage", needs: [{ m: "packVoltage" }] },
  { label: "Check BMS communication", needs: [{ o: "commStatus" }] },
  { label: "Check charge-input response", needs: [{ o: "chargeResponse" }] },
  { label: "Check charger output", needs: [{ m: "chargerVoltage" }] },
  { label: "Inspect cell-group minimum if safely available", needs: [{ m: "cellMin" }] },
];

const THERMAL_FLOW: FlowStep[] = [
  { label: "Record minimum and maximum temperature", needs: [{ m: "tempMin" }, { m: "tempMax" }] },
  { label: "Record temperature sensor count", needs: [{ m: "tempSensorCount" }] },
  { label: "Locate the hot region", needs: [{ o: "hotspotLocation" }] },
  { label: "Record ambient temperature", needs: [{ m: "ambientTemp" }] },
  { label: "Inspect connector condition", needs: [{ o: "connectorCondition" }] },
  { label: "Record abnormal heat or smell", needs: [{ o: "abnormalHeat" }, { o: "abnormalSmell" }], any: true },
];

const WATER_FLOW: FlowStep[] = [
  { label: "Inspect for water ingress", needs: [{ o: "waterIngress" }] },
  { label: "Inspect for corrosion", needs: [{ o: "corrosion" }] },
  { label: "Inspect connectors", needs: [{ o: "connectorCondition" }] },
  { label: "Insulation resistance (suitable equipment only)", needs: [{ m: "insulationResistance" }] },
  { label: "Check BMS status", needs: [{ o: "bmsStatus" }] },
];

const BMS_FLOW: FlowStep[] = [
  { label: "Check communication status", needs: [{ o: "commStatus" }] },
  { label: "Record the protocol you physically confirmed", needs: [{ o: "bmsProtocol" }] },
  { label: "Record BMS status or fault codes", needs: [{ o: "bmsStatus" }, { o: "bmsFaultCodes" }], any: true },
  { label: "Measure pack voltage", needs: [{ m: "packVoltage" }] },
  { label: "Inspect connectors and harness", needs: [{ o: "connectorCondition" }] },
];

const SOC_FLOW: FlowStep[] = [
  { label: "Record SOC", needs: [{ m: "soc" }] },
  { label: "Measure pack voltage", needs: [{ m: "packVoltage" }] },
  { label: "Record minimum and maximum cell group", needs: [{ m: "cellMin" }, { m: "cellMax" }] },
  { label: "Read pack current at rest", needs: [{ m: "packCurrent" }] },
  { label: "Record BMS fault codes", needs: [{ o: "bmsFaultCodes" }] },
];

export const COMPLAINT_FLOWS: Record<string, { title: string; steps: FlowStep[] }> = {
  "not-charging": { title: "Charging diagnostic flow", steps: CHARGING_FLOW },
  "slow-charging": { title: "Charging diagnostic flow", steps: CHARGING_FLOW },
  "stops-early": { title: "Charging diagnostic flow", steps: CHARGING_FLOW },
  "charger-led": { title: "Charging diagnostic flow", steps: CHARGING_FLOW },
  "reduced-range": { title: "Range-loss diagnostic flow", steps: RANGE_FLOW },
  "low-range-full": { title: "Range-loss diagnostic flow", steps: RANGE_FLOW },
  "shutdown-load": { title: "Shutdown-under-load flow", steps: SHUTDOWN_FLOW },
  "intermittent-output": { title: "Shutdown-under-load flow", steps: SHUTDOWN_FLOW },
  "no-start": { title: "Deep-discharge flow", steps: STORAGE_FLOW },
  "no-output": { title: "Deep-discharge flow", steps: STORAGE_FLOW },
  storage: { title: "Deep-discharge flow", steps: STORAGE_FLOW },
  overheating: { title: "Thermal diagnostic flow", steps: THERMAL_FLOW },
  "connector-heating": { title: "Thermal diagnostic flow", steps: THERMAL_FLOW },
  "after-rain": { title: "Water and corrosion flow", steps: WATER_FLOW },
  "bms-comm": { title: "BMS communication flow", steps: BMS_FLOW },
  "soc-drop": { title: "SOC-drop flow", steps: SOC_FLOW },
};
