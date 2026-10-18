// Builds the Battery Diagnostic Report from a job card (real vehicle) or from
// the simulation (sample). Every row carries its provenance, and the Data
// Quality Summary counts them, so a reader can see what was measured, what was
// entered, what is unknown — and that nothing simulated is passed off as real.
import { ARCHITECTURES } from "@/data/ev-battery-toolkit/architectures";
import { COMPLAINTS, MEASUREMENTS, OBSERVATIONS, VERIFICATION_CHECKS } from "@/data/ev-battery-toolkit/fields";
import { TOOLKIT } from "@/data/ev-battery-toolkit/content";
import { VEHICLE_BY_ID, vehicleLabel } from "@/data/ev-battery-toolkit/vehicles";
import { REPAIR_STATUS_LABEL, VERIFICATION_LABEL, compareBeforeAfter, deltaOf, repairDecision, rootCauseCandidates, spreadOf, verifyRepair } from "./diagnosis";
import { assessHealth } from "./health";
import { NOT_MEASURED, PROVENANCE, formatNumber, formatSourced } from "./provenance";
import { packLabel } from "./pack";
import type { BatteryPack, DataQualitySummary, FaultDefinition, JobCard, MeasurementKey, ObservationKey, Provenance, Report, ReportRow, ReportSection, Sourced } from "./types";
import type { SimulationResult } from "./simulation";

export const REPORT_TITLE = "Battery Diagnostic Report";
export const REPORT_FOOTER = `Generated using ${TOOLKIT.name}`;

export function qualityOf(rows: ReportRow[]): DataQualitySummary {
  const q: DataQualitySummary = { measured: 0, userEntered: 0, manufacturerVerified: 0, simulated: 0, estimated: 0, unknown: 0, notMeasured: 0 };
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

function measurementRow(set: JobCard["before"], key: MeasurementKey, label = MEASUREMENTS[key].label): ReportRow {
  const f = MEASUREMENTS[key];
  const m = set[key];
  if (!m || m.value === null || !Number.isFinite(m.value)) return row(label, m?.provenance === "NOT_AVAILABLE" ? "Not available." : m?.provenance === "UNKNOWN" ? "Unknown." : NOT_MEASURED, m?.provenance && m.provenance !== "MEASURED" && m.provenance !== "USER_ENTERED" ? m.provenance : "NOT_MEASURED");
  return row(label, formatNumber(m.value, f.unit, f.digits), m.provenance);
}

function observationRow(set: JobCard["observations"], key: ObservationKey, label = OBSERVATIONS[key].label): ReportRow {
  const o = set[key];
  if (!o || !o.value?.trim()) return row(label, o?.provenance === "NOT_AVAILABLE" ? "Not available." : o?.provenance === "UNKNOWN" ? "Unknown." : NOT_MEASURED, o?.provenance && o.provenance !== "MEASURED" && o.provenance !== "USER_ENTERED" ? o.provenance : "NOT_MEASURED");
  return row(label, o.value, o.provenance);
}

function sourcedRow(label: string, item: Sourced<unknown>, digits = 0): ReportRow {
  return row(label, formatSourced(item, digits), item.provenance);
}

/** The report for a real job. Nothing simulated can enter it: the job card only holds technician-recorded values. */
export function buildRealReport(job: JobCard, generatedAt: Date): Report {
  const vehicle = job.vehicleId ? VEHICLE_BY_ID[job.vehicleId] : undefined;
  const variant = vehicle?.variants.find((v) => v.id === job.variantId);
  const spec = variant?.battery;
  const entered = (label: string, value: string | null | undefined): ReportRow => (value && value.trim() ? row(label, value, "USER_ENTERED") : row(label, "Not recorded.", "UNKNOWN"));

  const header: ReportRow[] = [
    entered("Vehicle", vehicle ? vehicleLabel(vehicle, variant) : ""),
    entered("Manufacturer", vehicle?.manufacturer),
    entered("Model", vehicle?.model),
    entered("Variant", variant?.name),
    entered("Model Year", job.modelYear ? String(job.modelYear) : ""),
    entered("Odometer", job.odometerKm !== null && Number.isFinite(job.odometerKm) ? `${job.odometerKm} km` : ""),
    entered("Battery ID", job.batteryId),
    entered("Battery Serial", job.batterySerial),
    entered("Architecture", job.architecture ? ARCHITECTURES[job.architecture].name : ""),
    spec ? sourcedRow("Chemistry", spec.chemistry) : row("Chemistry", "Technical specification not verified.", "UNKNOWN"),
    spec ? sourcedRow("Nominal Voltage", spec.nominalVoltage) : row("Nominal Voltage", "Technical specification not verified.", "UNKNOWN"),
    spec ? sourcedRow("Rated Capacity", spec.capacityAh) : row("Rated Capacity", "Technical specification not verified.", "UNKNOWN"),
    entered("Technician", job.technician),
  ];

  const delta = deltaOf(job.before);
  const spread = spreadOf(job.before);
  const deltaProvenance: Provenance = delta.value === null ? "NOT_MEASURED" : delta.derived ? (job.before.cellMin?.provenance ?? "MEASURED") : (job.before.cellDelta?.provenance ?? "MEASURED");
  const spreadProvenance: Provenance = spread === null ? "NOT_MEASURED" : (job.before.tempSpread?.provenance ?? job.before.tempMax?.provenance ?? "MEASURED");

  const before: ReportRow[] = [
    measurementRow(job.before, "packVoltage"),
    measurementRow(job.before, "soc"),
    measurementRow(job.before, "soh"),
    measurementRow(job.before, "cellMax", "Maximum Cell Voltage"),
    measurementRow(job.before, "cellMin", "Minimum Cell Voltage"),
    row("Cell Delta", delta.value === null ? NOT_MEASURED : `${formatNumber(delta.value, "mV")}${delta.derived ? " (derived from min / max)" : ""}`, deltaProvenance),
    measurementRow(job.before, "tempMax", "Maximum Temperature"),
    row("Temperature Spread", spread === null ? NOT_MEASURED : formatNumber(spread, "°C", 1), spreadProvenance),
    observationRow(job.observations, "bmsStatus", "BMS Status"),
    observationRow(job.observations, "commStatus", "Communication Status"),
    observationRow(job.observations, "bmsFaultCodes", "Detected Faults"),
    observationRow(job.observations, "enclosureDamage", "Visual Inspection — enclosure"),
    observationRow(job.observations, "connectorCondition", "Visual Inspection — connectors"),
    observationRow(job.observations, "swelling", "Visual Inspection — swelling"),
    observationRow(job.observations, "waterIngress", "Water Inspection"),
    observationRow(job.observations, "corrosion", "Corrosion Inspection"),
  ];

  const candidates = rootCauseCandidates(job);
  const decision = repairDecision(job, candidates);
  const verification = verifyRepair(job);
  const complaint = COMPLAINTS.find((c) => c.id === job.complaintCategory)?.label;
  const best = candidates.find((c) => c.gate === "MET" && c.confidence !== "LOW");

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
      rows: [],
      text: [best ? `${best.name} (${best.confidence} confidence).` : "No root cause confirmed: evidence gate not met."],
    },
    {
      id: "repair",
      title: "REPAIR ACTION",
      rows: [
        row("Repair Decision", REPAIR_STATUS_LABEL[decision.status], "USER_ENTERED"),
        row("Required Repair Depth", decision.repairDepth ? { basic: "Basic Diagnostic", expert: "Expert Service", advanced: "Advanced Battery Repair" }[decision.repairDepth] : "—", "USER_ENTERED"),
        entered("Repair Performed", job.repairPerformed),
        entered("Parts Replaced", job.partsReplaced),
      ],
      text: [decision.reason],
    },
    {
      id: "after",
      title: "AFTER REPAIR",
      rows: [measurementRow(job.after, "packVoltage"), measurementRow(job.after, "cellMax", "Maximum Cell Voltage"), measurementRow(job.after, "cellMin", "Minimum Cell Voltage"), measurementRow(job.after, "cellDelta", "Cell Delta"), measurementRow(job.after, "tempMax", "Maximum Temperature"), observationRow(job.afterObservations, "bmsStatus", "BMS Status")],
    },
    {
      id: "verification",
      title: "FINAL VERIFICATION",
      rows: VERIFICATION_CHECKS.map((c) => row(c.label, ({ pass: "Pass", fail: "Fail", "not-done": "Not done", "not-applicable": "Not applicable" } as const)[job.verification[c.id] ?? "not-done"], "USER_ENTERED")),
      text: [`Result: ${VERIFICATION_LABEL[verification.outcome]}.`, ...verification.reasons],
    },
    { id: "recommendation", title: "RECOMMENDATION", rows: [], text: [...decision.verificationRequired, TOOLKIT.positioning] },
    {
      id: "evidence",
      title: "EVIDENCE",
      rows: compareBeforeAfter(job).map((c) => row(c.label, `${c.before} → ${c.after} (${c.trend})`, "USER_ENTERED")),
      text: decision.evidence.length ? decision.evidence : ["No supporting evidence recorded."],
    },
  ];

  const dataRows = [...header.slice(0, 12), ...before, ...sections[4].rows];
  const safety = decision.status === "UNSAFE_QUARANTINE" || verification.outcome === "UNSAFE_DO_NOT_RETURN" ? "UNSAFE — QUARANTINE / ESCALATE" : job.safetyFlags.length ? "Safety condition acknowledged" : "No safety condition recorded";

  return {
    context: "real",
    title: REPORT_TITLE,
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
    row("Communication Status", Object.entries(s.comms).map(([k, v]) => `${k} ${v}`).join(" · "), "SIMULATED"),
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
  { key: "estimated", label: `${PROVENANCE.ESTIMATED.label} fields` },
  { key: "simulated", label: `${PROVENANCE.SIMULATED.label} fields` },
  { key: "notMeasured", label: `${PROVENANCE.NOT_MEASURED.label} fields` },
  { key: "unknown", label: `${PROVENANCE.UNKNOWN.label} fields` },
];
