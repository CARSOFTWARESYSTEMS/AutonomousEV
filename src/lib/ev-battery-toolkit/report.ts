// Builds the Battery Diagnostic Report from a job card (real vehicle) or from
// the simulation (sample). Every row carries its provenance, and the Data
// Quality Summary counts them, so a reader can see what was measured, what was
// entered, what came from documentation, what is unknown — and that nothing
// simulated is passed off as real.
import { ARCHITECTURES } from "@/data/ev-battery-toolkit/architectures";
import { COMPLAINTS, MEASUREMENTS, OBSERVATIONS, VERIFICATION_CHECKS } from "@/data/ev-battery-toolkit/fields";
import { TOOLKIT } from "@/data/ev-battery-toolkit/content";
import { VEHICLE_BY_ID, vehicleLabel } from "@/data/ev-battery-toolkit/vehicles";
import {
  CALCULATED_FROM_CONFIG,
  REFERENCE_LOGIC_NOTICE,
  REPAIR_STATUS_LABEL,
  VERIFICATION_LABEL,
  TREND_LABEL,
  compareBeforeAfter,
  deltaOf,
  forContext,
  packExpectations,
  repairDecision,
  rootCauseCandidates,
  spreadOf,
  verifyRepair,
} from "./diagnosis";
import { assessHealth } from "./health";
import { NOT_MEASURED, PROVENANCE, SOURCE_CONFLICT, formatNumber, formatSourced, round } from "./provenance";
import { packLabel } from "./pack";
import type { BatteryPack, DataQualitySummary, FaultDefinition, JobCard, MeasurementKey, ObservationKey, Provenance, Report, ReportRow, ReportSection, Sourced } from "./types";
import type { SimulationResult } from "./simulation";

export const REPORT_TITLE = "Battery Diagnostic Report";
export const REPORT_FOOTER = `Generated using ${TOOLKIT.name}`;

export function qualityOf(rows: ReportRow[]): DataQualitySummary {
  const q: DataQualitySummary = { measured: 0, userEntered: 0, manufacturerVerified: 0, thirdPartyDocumented: 0, calculated: 0, simulated: 0, estimated: 0, unknown: 0, notMeasured: 0 };
  for (const r of rows) {
    switch (r.provenance) {
      case "MEASURED":
        q.measured++;
        break;
      case "USER_ENTERED":
        q.userEntered++;
        break;
      case "MANUFACTURER_VERIFIED":
        q.manufacturerVerified++;
        break;
      case "THIRD_PARTY_DOCUMENTED":
        q.thirdPartyDocumented++;
        break;
      case "CALCULATED":
        q.calculated++;
        break;
      case "SIMULATED":
        q.simulated++;
        break;
      case "ESTIMATED":
        q.estimated++;
        break;
      case "NOT_MEASURED":
        q.notMeasured++;
        break;
      default:
        q.unknown++;
    }
  }
  return q;
}

const row = (label: string, value: string, provenance: Provenance): ReportRow => ({ label, value: value.trim() ? value : "Not available.", provenance });

/** Only MEASURED and USER ENTERED readings are printed in a real report; every other origin prints its state. */
const SHOWN = new Set<Provenance>(["MEASURED", "USER_ENTERED"]);
/** Specification fields may also print documentation-sourced values. */
const SPEC_SHOWN = new Set<Provenance>(["MEASURED", "USER_ENTERED", "MANUFACTURER_VERIFIED", "THIRD_PARTY_DOCUMENTED"]);
const emptyState = (provenance: Provenance | undefined): [string, Provenance] =>
  provenance === "NOT_AVAILABLE" ? ["Not available.", "NOT_AVAILABLE"] : provenance === "UNKNOWN" ? ["Unknown.", "UNKNOWN"] : [NOT_MEASURED, "NOT_MEASURED"];

function measurementRow(set: JobCard["before"], key: MeasurementKey, label = MEASUREMENTS[key].label): ReportRow {
  const f = MEASUREMENTS[key];
  const m = set[key];
  const allowed = f.spec ? SPEC_SHOWN : SHOWN;
  if (!m || !allowed.has(m.provenance) || m.value === null || !Number.isFinite(m.value)) return row(label, ...emptyState(m?.provenance));
  return row(label, formatNumber(m.value, f.unit, f.digits), m.provenance);
}

function observationRow(set: JobCard["observations"], key: ObservationKey, label = OBSERVATIONS[key].label): ReportRow {
  const o = set[key];
  if (!o || !SHOWN.has(o.provenance) || !o.value?.trim()) return row(label, ...emptyState(o?.provenance));
  return row(label, o.value, o.provenance);
}

function sourcedRow(label: string, item: Sourced<unknown>, digits = 0): ReportRow {
  if (item.conflict) return row(label, `${SOURCE_CONFLICT} ${(item.claims ?? []).map((c) => c.value).join(" / ")}`, "UNKNOWN");
  return row(label, formatSourced(item, digits), item.provenance);
}

/** A rated value: what the technician recorded (from the label), else the published specification. */
function ratedRow(job: JobCard, key: "batteryNominalVoltage" | "ratedCapacityAh", label: string, spec: Sourced<number> | undefined, digits: number): ReportRow {
  const recorded = job.before[key];
  if (recorded && SPEC_SHOWN.has(recorded.provenance) && recorded.value !== null) return measurementRow(job.before, key, label);
  if (spec) return sourcedRow(label, spec, digits);
  return row(label, "Technical specification not verified.", "UNKNOWN");
}

const recordedNumber = (job: JobCard, key: "batteryNominalVoltage" | "ratedCapacityAh"): number | null => {
  const m = job.before[key];
  return m && SPEC_SHOWN.has(m.provenance) && typeof m.value === "number" && Number.isFinite(m.value) ? m.value : null;
};

/** The report for a real job. Nothing simulated can enter it: the job card is scoped to the real context first. */
export function buildRealReport(input: JobCard, generatedAt: Date): Report {
  // Real context only: a SIMULATED value can never reach a real report.
  const job = forContext(input, "real");
  const vehicle = job.vehicleId ? VEHICLE_BY_ID[job.vehicleId] : undefined;
  const variant = vehicle?.variants.find((v) => v.id === job.variantId) ?? (vehicle?.variants.length === 1 ? vehicle.variants[0] : undefined);
  const spec = variant?.battery;
  const entered = (label: string, value: string | null | undefined): ReportRow => (value && value.trim() ? row(label, value, "USER_ENTERED") : row(label, "Not recorded.", "UNKNOWN"));

  // Nominal energy: calculated only from values recorded or published for this vehicle.
  const v = recordedNumber(job, "batteryNominalVoltage") ?? (spec && !spec.nominalVoltage.conflict ? spec.nominalVoltage.value : null);
  const ah = recordedNumber(job, "ratedCapacityAh") ?? (spec && !spec.capacityAh.conflict ? spec.capacityAh.value : null);
  const energyRow =
    typeof v === "number" && typeof ah === "number"
      ? row("Calculated Nominal Energy", `${formatNumber(round((v * ah) / 1000, 3), "kWh", 3)} (${v} V × ${ah} Ah; nominal, not measured usable energy)`, "CALCULATED")
      : spec
        ? sourcedRow("Calculated Nominal Energy", spec.energyKWh, 3)
        : row("Calculated Nominal Energy", "Technical specification not verified.", "UNKNOWN");

  const expect = packExpectations(job.cellConfig);
  const config = job.cellConfig;
  const chemistry =
    config && config.chemistry !== "Unknown"
      ? row("Cell Chemistry", `${config.chemistry} (confirmed by technician)`, "USER_ENTERED")
      : spec
        ? sourcedRow("Cell Chemistry", spec.chemistry)
        : row("Cell Chemistry", "Technical specification not verified.", "UNKNOWN");
  const architecture = job.architecture
    ? row("Architecture", `${ARCHITECTURES[job.architecture].name} (as seen)`, "USER_ENTERED")
    : spec?.batteryArchitecture.value
      ? row("Architecture", `${ARCHITECTURES[spec.batteryArchitecture.value].name} (published)`, spec.batteryArchitecture.provenance)
      : row("Architecture", "Technical specification not verified.", "UNKNOWN");
  const safetyResult = job.safetyFlags.length ? `Hazards recorded: ${job.safetyFlags.join(", ")}${job.safetyAcknowledged ? " (acknowledged)" : ""}` : "No hazard recorded at the safety screen";

  const header: ReportRow[] = [
    entered("Vehicle", vehicle ? vehicleLabel(vehicle, variant) : ""),
    entered("Manufacturer", vehicle?.manufacturer),
    entered("Model", vehicle?.model),
    entered("Variant", variant?.name),
    entered("Model Year", job.modelYear ? String(job.modelYear) : ""),
    entered("Odometer", job.odometerKm !== null && Number.isFinite(job.odometerKm) ? `${job.odometerKm} km` : ""),
    entered("Battery ID", job.batteryId),
    entered("Battery Serial", job.batterySerial),
    architecture,
    spec ? sourcedRow("Battery Type", spec.batteryType) : row("Battery Type", "Technical specification not verified.", "UNKNOWN"),
    chemistry,
    ratedRow(job, "batteryNominalVoltage", "Battery Nominal Voltage", spec?.nominalVoltage, 0),
    ratedRow(job, "ratedCapacityAh", "Rated Capacity", spec?.capacityAh, 0),
    energyRow,
    entered("Technician", job.technician),
    row("Safety Screening Result", safetyResult, "USER_ENTERED"),
  ];

  const delta = deltaOf(job.before);
  const spread = spreadOf(job.before);
  const deltaProvenance: Provenance = delta.value === null ? "NOT_MEASURED" : delta.derived ? (job.before.cellMin?.provenance ?? "MEASURED") : (job.before.cellDelta?.provenance ?? "MEASURED");
  const spreadProvenance: Provenance = spread === null ? "NOT_MEASURED" : (job.before.tempSpread?.provenance ?? job.before.tempMax?.provenance ?? "MEASURED");

  const before: ReportRow[] = [
    measurementRow(job.before, "packVoltage", "Measured Pack Voltage"),
    measurementRow(job.before, "loadedPackVoltage", "Loaded Pack Voltage"),
    measurementRow(job.before, "chargerVoltage", "Charger Output Voltage"),
    measurementRow(job.before, "chargerCurrent", "Charge Current"),
    measurementRow(job.before, "soc"),
    measurementRow(job.before, "soh"),
    measurementRow(job.before, "cellMax", "Cell Maximum"),
    measurementRow(job.before, "cellMin", "Cell Minimum"),
    row("Cell Delta", delta.value === null ? NOT_MEASURED : `${formatNumber(delta.value, "mV")}${delta.derived ? " (derived from min / max)" : ""}`, deltaProvenance),
    measurementRow(job.before, "tempMax", "Maximum Temperature"),
    measurementRow(job.before, "tempMin", "Minimum Temperature"),
    row("Temperature Spread", spread === null ? NOT_MEASURED : formatNumber(spread, "°C", 1), spreadProvenance),
    observationRow(job.observations, "bmsStatus", "BMS Status"),
    observationRow(job.observations, "commStatus", "BMS Communication"),
    observationRow(job.observations, "bmsProtocol", "BMS Protocol (as confirmed)"),
    observationRow(job.observations, "bmsFaultCodes", "BMS Fault Codes"),
    observationRow(job.observations, "chargeEnable", "Charge Enable"),
    observationRow(job.observations, "dischargeEnable", "Discharge Enable"),
    observationRow(job.observations, "enclosureDamage", "Visual Inspection — enclosure"),
    observationRow(job.observations, "swelling", "Visual Inspection — swelling"),
    observationRow(job.observations, "connectorCondition", "Connector Condition"),
    observationRow(job.observations, "waterIngress", "Water Inspection"),
    observationRow(job.observations, "corrosion", "Corrosion Inspection"),
  ];
  if (expect.nominal !== null || expect.full !== null || expect.lower !== null) {
    before.push(
      row("Expected Nominal Pack Voltage", formatNumber(expect.nominal, "V", 1, "Not calculated"), expect.nominal === null ? "UNKNOWN" : "CALCULATED"),
      row("Expected Full-Charge Pack Voltage", formatNumber(expect.full, "V", 1, "Not calculated"), expect.full === null ? "UNKNOWN" : "CALCULATED"),
      row("Expected Lower Operating Limit", formatNumber(expect.lower, "V", 1, "Not calculated"), expect.lower === null ? "UNKNOWN" : "CALCULATED"),
    );
  }

  const candidates = rootCauseCandidates(job);
  const decision = repairDecision(job, candidates);
  const verification = verifyRepair(job);
  const complaint = COMPLAINTS.find((c) => c.id === job.complaintCategory)?.label;
  const root = decision.candidateId ? candidates.find((c) => c.id === decision.candidateId) : undefined;
  const confirmed = root && root.gate === "MET" && root.confidence !== "LOW" ? root : undefined;

  const sections: ReportSection[] = [
    { id: "before", title: "BEFORE REPAIR", rows: before },
    {
      id: "diagnosis",
      title: "DIAGNOSIS",
      rows: [entered("Customer Complaint", job.complaint || complaint), ...candidates.slice(0, 4).map((c) => row(c.name, `${c.confidence} confidence · evidence gate ${c.gate === "MET" ? "met" : "not met"}`, "USER_ENTERED"))],
    },
    {
      id: "root-cause",
      title: "ROOT CAUSE",
      rows: confirmed ? [row("Root Cause", confirmed.name, "USER_ENTERED"), row("Confidence", confirmed.confidence, "USER_ENTERED")] : [],
      text: [confirmed ? `${confirmed.name} (${confirmed.confidence} confidence)${decision.technicianSelected ? ", selected by the technician" : ", ranked first by the evidence"}.` : "No root cause confirmed: evidence gate not met."],
    },
    {
      id: "repair",
      title: "REPAIR ACTION",
      rows: [
        row("Repair Decision", REPAIR_STATUS_LABEL[decision.status], "USER_ENTERED"),
        row("Required Repair Depth", decision.repairDepth ? { basic: "Basic Diagnostic", expert: "Expert Service", advanced: "Advanced Battery Repair" }[decision.repairDepth] : "—", "USER_ENTERED"),
        row("Risk", decision.risk, "USER_ENTERED"),
        entered("Repair Performed", job.repairPerformed),
        entered("Parts Replaced", job.partsReplaced),
      ],
      text: [decision.reason, ...(decision.missingEvidence.length ? [`Missing evidence: ${decision.missingEvidence.join("; ")}.`] : [])],
    },
    {
      id: "after",
      title: "AFTER REPAIR",
      rows: [
        measurementRow(job.after, "packVoltage", "Measured Pack Voltage"),
        measurementRow(job.after, "cellMax", "Cell Maximum"),
        measurementRow(job.after, "cellMin", "Cell Minimum"),
        measurementRow(job.after, "cellDelta", "Cell Delta"),
        measurementRow(job.after, "tempMax", "Maximum Temperature"),
        observationRow(job.afterObservations, "bmsStatus", "BMS Status"),
      ],
    },
    {
      id: "verification",
      title: "FINAL VERIFICATION",
      rows: VERIFICATION_CHECKS.map((c) => row(c.label, ({ pass: "Pass", fail: "Fail", "not-done": "Not done", "not-applicable": "Not applicable" } as const)[job.verification[c.id] ?? "not-done"], "USER_ENTERED")),
      text: [`Result: ${VERIFICATION_LABEL[verification.outcome]}.`, ...verification.reasons],
    },
    { id: "recommendation", title: "RECOMMENDATION", rows: [], text: [decision.nextAction, ...decision.verificationRequired, REFERENCE_LOGIC_NOTICE, TOOLKIT.positioning] },
    {
      id: "evidence",
      title: "EVIDENCE",
      rows: compareBeforeAfter(job).map((c) => row(c.label, `${c.before} → ${c.after} (${TREND_LABEL[c.trend]})`, "USER_ENTERED")),
      text: [...(decision.evidence.length ? decision.evidence : ["No supporting evidence recorded."]), ...(expect.nominal !== null ? [`Expected pack voltages: ${CALCULATED_FROM_CONFIG}.`] : [])],
    },
  ];

  const dataRows = [...header.slice(0, 14), ...before, ...sections[4].rows];
  const safety = decision.status === "UNSAFE_QUARANTINE" || verification.outcome === "UNSAFE_DO_NOT_RETURN" ? "UNSAFE — QUARANTINE / ESCALATE" : job.safetyFlags.length ? "Safety condition acknowledged" : "No safety condition recorded";
  const title = vehicle?.manufacturer === "EVeium" ? `EVeium ${REPORT_TITLE}` : REPORT_TITLE;

  return {
    context: "real",
    title,
    brand: TOOLKIT.name,
    jobId: job.jobId,
    generatedAt: generatedAt.toISOString(),
    header,
    sections,
    quality: qualityOf(dataRows),
    finalHealth: VERIFICATION_LABEL[verification.outcome],
    safetyStatus: safety,
    footer: REPORT_FOOTER,
  };
}

/** The sample report: every value SIMULATED, labelled as training data throughout. */
export function buildSimulationReport(pack: BatteryPack, sim: SimulationResult, fault: FaultDefinition | null, generatedAt: Date): Report {
  const s = sim.snapshot;
  const health = assessHealth(s, fault?.safety ?? "none", sim.limits);
  const header: ReportRow[] = [
    row("Vehicle", "Generic procedural scooter (simulation)", "SIMULATED"),
    row("Architecture", ARCHITECTURES[pack.config.architecture].name, "SIMULATED"),
    row("Chemistry", pack.config.chemistry, "SIMULATED"),
    row("Nominal Voltage", formatNumber(pack.nominalV, "V", 1), "ESTIMATED"),
    row("Rated Capacity", formatNumber(pack.capacityAh, "Ah", 1), "ESTIMATED"),
    row("Configuration", packLabel(pack), "ESTIMATED"),
    row("Technician", "Training session", "SIMULATED"),
  ];
  const before: ReportRow[] = [
    sourcedRow("Measured Pack Voltage", s.packVoltage, 1),
    sourcedRow("SOC", s.soc),
    sourcedRow("SOH", s.soh),
    sourcedRow("Maximum Cell Voltage", s.maxCellV, 3),
    sourcedRow("Minimum Cell Voltage", s.minCellV, 3),
    sourcedRow("Cell Delta", s.cellDeltaMv),
    sourcedRow("Maximum Temperature", s.maxTemp, 1),
    sourcedRow("Temperature Spread", s.tempSpread, 1),
    sourcedRow("BMS Status", s.bmsState),
    row("Communication Status", Object.entries(s.comms).map(([k, val]) => `${k} ${val}`).join(" · "), "SIMULATED"),
    sourcedRow("Detected Faults", s.faultCodes),
  ];
  const sections: ReportSection[] = [
    { id: "before", title: "BEFORE REPAIR", rows: before },
    { id: "diagnosis", title: "DIAGNOSIS", rows: health.factors.map((f) => row(f.label, `${f.value} — ${f.status}`, "SIMULATED")) },
    { id: "root-cause", title: "ROOT CAUSE", rows: [], text: [fault ? `Simulated fault: ${fault.name}. ${fault.diagnosticArea}.` : "No fault injected: the simulated pack is normal."] },
    { id: "repair", title: "REPAIR ACTION", rows: [], text: ["Sample report: no repair is performed in a simulation."] },
    { id: "after", title: "AFTER REPAIR", rows: [], text: ["Not applicable to the sample."] },
    { id: "verification", title: "FINAL VERIFICATION", rows: [], text: ["Not applicable to the sample."] },
    { id: "recommendation", title: "RECOMMENDATION", rows: [], text: [fault ? `Confirm with: ${fault.confirmWith.join(", ")}.` : "No action.", TOOLKIT.positioning] },
    { id: "evidence", title: "EVIDENCE", rows: [], text: ["All values on this report are SIMULATED training data."] },
  ];
  return {
    context: "simulation",
    title: `${REPORT_TITLE} — SIMULATION / TRAINING DATA`,
    brand: TOOLKIT.name,
    jobId: "SAMPLE",
    generatedAt: generatedAt.toISOString(),
    header,
    sections,
    quality: qualityOf([...header, ...before]),
    finalHealth: health.status,
    safetyStatus: fault?.safety === "stop" ? "CRITICAL — STOP SERVICE PROCEDURE" : fault?.safety === "early-warning" ? "EARLY WARNING" : "No safety condition",
    footer: REPORT_FOOTER,
  };
}

export const QUALITY_LABELS: { key: keyof DataQualitySummary; label: string }[] = [
  { key: "measured", label: `${PROVENANCE.MEASURED.label} fields` },
  { key: "userEntered", label: `${PROVENANCE.USER_ENTERED.label} fields` },
  { key: "manufacturerVerified", label: `${PROVENANCE.MANUFACTURER_VERIFIED.label} fields` },
  { key: "thirdPartyDocumented", label: `${PROVENANCE.THIRD_PARTY_DOCUMENTED.label} fields` },
  { key: "calculated", label: `${PROVENANCE.CALCULATED.label} fields` },
  { key: "estimated", label: `${PROVENANCE.ESTIMATED.label} fields` },
  { key: "simulated", label: `${PROVENANCE.SIMULATED.label} fields` },
  { key: "notMeasured", label: `${PROVENANCE.NOT_MEASURED.label} fields` },
  { key: "unknown", label: `${PROVENANCE.UNKNOWN.label} fields` },
];
