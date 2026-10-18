// The real-vehicle diagnosis: what a technician records, in which stage, and
// the safety screen that comes before everything else.
import type { MeasurementKey, ObservationKey } from "@/lib/ev-battery-toolkit/types";

export interface MeasurementField {
  key: MeasurementKey;
  label: string;
  unit: string;
  digits: number;
  hint?: string;
}

export interface ObservationField {
  key: ObservationKey;
  label: string;
  options: string[];
  /** Options that mean a problem was found. */
  abnormal: string[];
}

export const MEASUREMENTS: Record<MeasurementKey, MeasurementField> = {
  packVoltage: { key: "packVoltage", label: "Measured pack voltage", unit: "V", digits: 1, hint: "At the pack terminals, with a meter rated for the pack voltage." },
  chargerVoltage: { key: "chargerVoltage", label: "Charger output voltage", unit: "V", digits: 1, hint: "Open-circuit charger output." },
  chargerCurrent: { key: "chargerCurrent", label: "Charger current", unit: "A", digits: 1 },
  packCurrent: { key: "packCurrent", label: "Pack current", unit: "A", digits: 1, hint: "BMS reading or clamp meter. Positive = discharge." },
  soc: { key: "soc", label: "SOC", unit: "%", digits: 0 },
  soh: { key: "soh", label: "SOH", unit: "%", digits: 0, hint: "As reported by the BMS or a diagnostic tester." },
  cellMin: { key: "cellMin", label: "Minimum cell-group voltage", unit: "V", digits: 3 },
  cellMax: { key: "cellMax", label: "Maximum cell-group voltage", unit: "V", digits: 3 },
  cellDelta: { key: "cellDelta", label: "Cell delta", unit: "mV", digits: 0, hint: "Leave empty to derive it from the minimum and maximum." },
  tempMin: { key: "tempMin", label: "Minimum temperature", unit: "°C", digits: 1 },
  tempMax: { key: "tempMax", label: "Maximum temperature", unit: "°C", digits: 1 },
  tempSpread: { key: "tempSpread", label: "Temperature spread", unit: "°C", digits: 1, hint: "Leave empty to derive it." },
  ambientTemp: { key: "ambientTemp", label: "Ambient temperature", unit: "°C", digits: 1 },
  voltageDuringCharge: { key: "voltageDuringCharge", label: "Pack voltage during charge", unit: "V", digits: 1 },
  insulationResistance: { key: "insulationResistance", label: "Insulation resistance", unit: "MΩ", digits: 1, hint: "Only with suitable equipment and training." },
};

export const OBSERVATIONS: Record<ObservationKey, ObservationField> = {
  bmsStatus: { key: "bmsStatus", label: "BMS status", options: ["Normal", "Warning", "Protection", "Offline / no data"], abnormal: ["Warning", "Protection", "Offline / no data"] },
  bmsFaultCodes: { key: "bmsFaultCodes", label: "BMS fault codes", options: [], abnormal: [] },
  chargeEnable: { key: "chargeEnable", label: "Charge enable state", options: ["Enabled", "Disabled"], abnormal: ["Disabled"] },
  dischargeEnable: { key: "dischargeEnable", label: "Discharge enable state", options: ["Enabled", "Disabled"], abnormal: ["Disabled"] },
  commStatus: { key: "commStatus", label: "Communication status", options: ["Online", "Intermittent", "Offline"], abnormal: ["Intermittent", "Offline"] },
  fuseStatus: { key: "fuseStatus", label: "Fuse status", options: ["Intact", "Open"], abnormal: ["Open"] },
  connectorCondition: { key: "connectorCondition", label: "Connector condition", options: ["Good", "Loose", "Corroded", "Burnt / heat-damaged"], abnormal: ["Loose", "Corroded", "Burnt / heat-damaged"] },
  corrosion: { key: "corrosion", label: "Corrosion", options: ["None", "Light", "Severe"], abnormal: ["Light", "Severe"] },
  waterIngress: { key: "waterIngress", label: "Water ingress evidence", options: ["None", "Signs of moisture", "Water inside / flood exposure"], abnormal: ["Signs of moisture", "Water inside / flood exposure"] },
  swelling: { key: "swelling", label: "Swelling", options: ["None", "Suspected", "Visible"], abnormal: ["Suspected", "Visible"] },
  enclosureDamage: { key: "enclosureDamage", label: "Enclosure damage", options: ["None", "Minor scuffs", "Crack / breach"], abnormal: ["Crack / breach"] },
  smellOrHeat: { key: "smellOrHeat", label: "Unusual smell / heat", options: ["None", "Warm to touch", "Burning smell", "Smoke"], abnormal: ["Burning smell", "Smoke"] },
  hotspotLocation: { key: "hotspotLocation", label: "Hot-spot location", options: ["None found", "Connector", "Cell area", "BMS area", "Busbar / joint"], abnormal: ["Connector", "Cell area", "BMS area", "Busbar / joint"] },
  loadBehaviour: { key: "loadBehaviour", label: "Load behaviour", options: ["Stable under load", "Voltage sag under load", "Shuts down under load"], abnormal: ["Voltage sag under load", "Shuts down under load"] },
  capacityTest: { key: "capacityTest", label: "Capacity test", options: ["Within expectation", "Below expectation", "Severely low"], abnormal: ["Below expectation", "Severely low"] },
  internalResistanceTest: { key: "internalResistanceTest", label: "Internal resistance comparison", options: ["Uniform", "One group high"], abnormal: ["One group high"] },
};

/** Conditions that stop the diagnosis until the technician acknowledges them. */
export const SAFETY_HAZARDS: { id: string; label: string }[] = [
  { id: "swelling", label: "Swelling" },
  { id: "puncture", label: "Puncture" },
  { id: "leakage", label: "Electrolyte leakage" },
  { id: "overheating", label: "Severe overheating" },
  { id: "smoke", label: "Smoke" },
  { id: "burnt-connector", label: "Burnt connector" },
  { id: "flood", label: "Flood damage" },
  { id: "breach", label: "Enclosure breach" },
  { id: "internal-short", label: "Suspected internal short" },
];

export const COMPLAINTS: { id: string; label: string }[] = [
  { id: "shutdown-load", label: "Shows charge but shuts down during acceleration" },
  { id: "reduced-range", label: "Reduced range" },
  { id: "not-charging", label: "Battery not charging" },
  { id: "stops-early", label: "Charging stops early" },
  { id: "slow-charging", label: "Slow charging" },
  { id: "soc-drop", label: "Sudden SOC drop" },
  { id: "overheating", label: "Overheating" },
  { id: "water", label: "Water exposure" },
  { id: "warning", label: "Dashboard battery warning" },
  { id: "storage", label: "Long-term storage / will not wake" },
  { id: "other", label: "Other" },
];

export const REAL_STAGES: { id: string; title: string; purpose: string }[] = [
  { id: "complaint", title: "Customer Complaint", purpose: "Record what the customer reports, in their words." },
  { id: "safety", title: "Safety Screen", purpose: "Check for hazards before anyone touches the pack." },
  { id: "identify", title: "Vehicle & Battery Identification", purpose: "Vehicle, variant, year, odometer and battery ID." },
  { id: "visual", title: "Visual Inspection", purpose: "Enclosure, connectors, corrosion, water and swelling." },
  { id: "electrical", title: "Electrical Measurements", purpose: "Pack voltage, charger output and current." },
  { id: "bms", title: "BMS / Diagnostic Data", purpose: "SOC, SOH, status, fault codes and enable states." },
  { id: "cells", title: "Cell / Module Comparison", purpose: "Group minimum, maximum, delta and load behaviour." },
  { id: "thermal", title: "Thermal Inspection", purpose: "Temperatures, spread and hot-spot location." },
  { id: "analysis", title: "Root-Cause Analysis", purpose: "Candidates with their evidence and the evidence gate." },
  { id: "decision", title: "Repair Decision", purpose: "Decision, reason, evidence and repair depth." },
  { id: "repair", title: "Repair Action", purpose: "What was done and which parts were replaced." },
  { id: "post", title: "Post-Repair Test", purpose: "After-repair measurements, checks and comparison." },
  { id: "report", title: "Customer Report", purpose: "Job card and diagnostic report." },
];

/** Which fields each measurement stage records. */
export const STAGE_FIELDS: Record<string, { measurements: MeasurementKey[]; observations: ObservationKey[] }> = {
  visual: { measurements: [], observations: ["enclosureDamage", "connectorCondition", "corrosion", "waterIngress", "swelling", "smellOrHeat", "fuseStatus"] },
  electrical: { measurements: ["packVoltage", "chargerVoltage", "chargerCurrent", "voltageDuringCharge", "packCurrent", "insulationResistance"], observations: [] },
  bms: { measurements: ["soc", "soh"], observations: ["bmsStatus", "bmsFaultCodes", "chargeEnable", "dischargeEnable", "commStatus"] },
  cells: { measurements: ["cellMin", "cellMax", "cellDelta"], observations: ["loadBehaviour", "capacityTest", "internalResistanceTest"] },
  thermal: { measurements: ["tempMin", "tempMax", "tempSpread", "ambientTemp"], observations: ["hotspotLocation"] },
};

/** The after-repair fields: a subset of the before fields, compared side by side. */
export const AFTER_MEASUREMENTS: MeasurementKey[] = ["packVoltage", "soc", "soh", "cellMin", "cellMax", "cellDelta", "tempMax"];
export const AFTER_OBSERVATIONS: ObservationKey[] = ["bmsStatus", "bmsFaultCodes", "chargeEnable", "dischargeEnable"];

export const VERIFICATION_CHECKS: { id: string; label: string; critical: boolean; criterion: string }[] = [
  { id: "visual", label: "Visual Inspection", critical: true, criterion: "No damage, swelling, leakage or loose parts" },
  { id: "connector", label: "Connector Inspection", critical: true, criterion: "Repaired connector or component verified, fully engaged and locked" },
  { id: "packVoltage", label: "Pack Voltage", critical: true, criterion: "Stable and consistent with SOC" },
  { id: "cellDelta", label: "Cell Delta", critical: true, criterion: "Acceptable cell-group balance (reference < 50 mV at rest)" },
  { id: "temperature", label: "Temperature", critical: true, criterion: "No abnormal thermal condition" },
  { id: "bmsStatus", label: "BMS Status", critical: true, criterion: "BMS NORMAL and communication normal" },
  { id: "chargeTest", label: "Charge Test", critical: false, criterion: "Charge path working at expected current" },
  { id: "dischargeTest", label: "Discharge Test", critical: false, criterion: "Discharge path working under a road or load test" },
  { id: "faultRescan", label: "Fault Rescan", critical: true, criterion: "Rescan completed with no active faults" },
  { id: "safetyCheck", label: "Safety Check", critical: true, criterion: "No critical safety fault present" },
];
