// Evidence-based diagnosis for a real vehicle: root-cause candidates with their
// supporting, conflicting and missing evidence; an evidence gate before any
// repair is recommended; the repair decision; post-repair verification; and
// the before / after comparison.
//
// A complaint can suggest where to look, but it never raises confidence on its
// own: confidence counts measured or observed evidence only. Thresholds are the
// toolkit's illustrative references, stated next to each conclusion.
import { MEASUREMENTS, OBSERVATIONS, VERIFICATION_CHECKS } from "@/data/ev-battery-toolkit/fields";
import { formatNumber, round } from "./provenance";
import type {
  CheckResult,
  Confidence,
  DiagnosticMeasurement,
  DiagnosticObservation,
  JobCard,
  MeasurementKey,
  ObservationKey,
  RepairDecision,
  RepairDepth,
  RepairStatus,
  RootCauseCandidate,
  Trend,
  VerificationOutcome,
} from "./types";

type Measurements = Partial<Record<MeasurementKey, DiagnosticMeasurement>>;
type Observations = Partial<Record<ObservationKey, DiagnosticObservation>>;

// SIMULATED counts as recorded so the guided simulation can use the same engine.
// A real job card never holds a SIMULATED value: the real workflow offers no
// such state and refuses simulation imports (see canMergeIntoRealJob).
const RECORDED = new Set(["MEASURED", "USER_ENTERED", "SIMULATED"]);

/** A recorded number, or null when it is not measured, unknown or not a finite number. */
export function numberOf(set: Measurements, key: MeasurementKey): number | null {
  const m = set[key];
  if (!m || !RECORDED.has(m.provenance)) return null;
  return typeof m.value === "number" && Number.isFinite(m.value) ? m.value : null;
}

export function textOf(set: Observations, key: ObservationKey): string | null {
  const o = set[key];
  if (!o || !RECORDED.has(o.provenance)) return null;
  const v = o.value?.trim();
  return v ? v : null;
}

/** Cell delta in mV: recorded, or derived from the recorded minimum and maximum. */
export function deltaOf(set: Measurements): { value: number | null; derived: boolean } {
  const direct = numberOf(set, "cellDelta");
  if (direct !== null) return { value: direct, derived: false };
  const min = numberOf(set, "cellMin");
  const max = numberOf(set, "cellMax");
  if (min === null || max === null) return { value: null, derived: false };
  return { value: round((max - min) * 1000, 0), derived: true };
}

export function spreadOf(set: Measurements): number | null {
  const direct = numberOf(set, "tempSpread");
  if (direct !== null) return direct;
  const min = numberOf(set, "tempMin");
  const max = numberOf(set, "tempMax");
  return min === null || max === null ? null : round(max - min, 1);
}

// ── Evidence ──

interface Evidence {
  m: Measurements;
  o: Observations;
  complaint: string;
  delta: number | null;
  spread: number | null;
}

type FieldRef = { m: MeasurementKey } | { o: ObservationKey } | { delta: true };

const labelOf = (ref: FieldRef) => ("m" in ref ? MEASUREMENTS[ref.m].label : "o" in ref ? OBSERVATIONS[ref.o].label : "Cell delta (or min and max)");
const hasRef = (ev: Evidence, ref: FieldRef) => ("m" in ref ? numberOf(ev.m, ref.m) !== null : "o" in ref ? textOf(ev.o, ref.o) !== null : ev.delta !== null);

interface Finding {
  supporting: string[];
  conflicting: string[];
  /** Strong evidence counts double towards confidence. */
  strong: number;
}

interface Hypothesis {
  id: string;
  name: string;
  /** Complaints this hypothesis is a natural suspect for. */
  complaints: string[];
  /** The evidence gate: all must be recorded before a repair can follow. */
  required: FieldRef[];
  /** Evidence that strengthens the case if recorded. Missing items are listed. */
  helpful: FieldRef[];
  evaluate: (ev: Evidence) => Finding;
  next: string;
  decide: (ev: Evidence) => { status: RepairStatus; depth: RepairDepth | null; verify: string[] };
}

const V = (n: number, d = 1) => formatNumber(n, "V", d);

const HYPOTHESES: Hypothesis[] = [
  {
    id: "imbalance",
    name: "Cell-group imbalance",
    complaints: ["shutdown-load", "reduced-range", "stops-early", "soc-drop", "warning"],
    required: [{ m: "packVoltage" }, { m: "cellMin" }, { m: "cellMax" }, { o: "bmsStatus" }],
    helpful: [{ o: "capacityTest" }, { o: "internalResistanceTest" }, { o: "loadBehaviour" }],
    evaluate: ({ m, o, delta }) => {
      const f: Finding = { supporting: [], conflicting: [], strong: 0 };
      const min = numberOf(m, "cellMin");
      const max = numberOf(m, "cellMax");
      if (delta !== null) {
        const detail = `Delta: ${formatNumber(delta, "mV")}${min !== null && max !== null ? ` (max ${V(max, 3)}, min ${V(min, 3)})` : ""}`;
        if (delta >= 100) {
          f.supporting.push(detail);
          f.strong++;
        } else if (delta >= 50) f.supporting.push(detail);
        else if (delta < 30) f.conflicting.push(`${detail} — within the 30 mV reference`);
      }
      const load = textOf(o, "loadBehaviour");
      if (load && load !== "Stable under load") f.supporting.push(`Load behaviour: ${load}`);
      if (textOf(o, "capacityTest") && textOf(o, "capacityTest") !== "Within expectation") f.supporting.push(`Capacity test: ${textOf(o, "capacityTest")}`);
      return f;
    },
    next: "Capacity test and internal-resistance comparison on the lowest group.",
    decide: ({ delta }) =>
      delta !== null && delta >= 150
        ? { status: "ADVANCED_CELL_REPAIR", depth: "advanced", verify: ["Cell delta after a full balance charge", "Load test logging group voltages", "Fault rescan"] }
        : { status: "BMS_SERVICE", depth: "expert", verify: ["Balancing function check", "Cell delta after a full charge", "Fault rescan"] },
  },
  {
    id: "weak-group",
    name: "Weak cell group / high internal resistance",
    complaints: ["shutdown-load", "reduced-range", "soc-drop"],
    required: [{ m: "cellMin" }, { m: "cellMax" }, { o: "loadBehaviour" }],
    helpful: [{ o: "internalResistanceTest" }, { o: "capacityTest" }, { m: "tempMax" }],
    evaluate: ({ o, delta }) => {
      const f: Finding = { supporting: [], conflicting: [], strong: 0 };
      const load = textOf(o, "loadBehaviour");
      if (load === "Shuts down under load") {
        f.supporting.push("Shutdown occurs under load");
        f.strong++;
      } else if (load === "Voltage sag under load") f.supporting.push("Voltage sags under load");
      else if (load === "Stable under load") f.conflicting.push("Stable under load");
      if (delta !== null && delta >= 50) f.supporting.push(`Delta: ${formatNumber(delta, "mV")}`);
      if (delta !== null && delta < 30) f.conflicting.push(`Delta ${formatNumber(delta, "mV")} at rest`);
      const ir = textOf(o, "internalResistanceTest");
      if (ir === "One group high") {
        f.supporting.push("Internal resistance: one group high");
        f.strong++;
      } else if (ir === "Uniform") f.conflicting.push("Internal resistance uniform");
      return f;
    },
    next: "Load test while logging each group's voltage; compare internal resistance.",
    decide: () => ({ status: "MODULE_REPAIR", depth: "advanced", verify: ["Load test logging group voltages", "Cell delta under load", "Thermal check after load"] }),
  },
  {
    id: "charger",
    name: "Charger or charging-path fault",
    complaints: ["not-charging", "slow-charging", "stops-early"],
    required: [{ m: "chargerVoltage" }, { m: "packVoltage" }, { m: "voltageDuringCharge" }, { o: "chargeEnable" }],
    helpful: [{ m: "chargerCurrent" }, { o: "connectorCondition" }],
    evaluate: ({ m, o }) => {
      const f: Finding = { supporting: [], conflicting: [], strong: 0 };
      const charger = numberOf(m, "chargerVoltage");
      const pack = numberOf(m, "packVoltage");
      const during = numberOf(m, "voltageDuringCharge");
      const current = numberOf(m, "chargerCurrent");
      const enable = textOf(o, "chargeEnable");
      if (charger !== null && pack !== null) {
        if (charger <= pack) {
          f.supporting.push(`Charger output ${V(charger)} is not above pack voltage ${V(pack)}`);
          f.strong++;
        } else if (charger > pack * 1.3) {
          f.supporting.push(`Charger output ${V(charger)} far above pack ${V(pack)} — possible mismatch`);
          f.strong++;
        } else f.conflicting.push(`Charger output ${V(charger)} is plausible for pack ${V(pack)}`);
      }
      if (during !== null && pack !== null && Math.abs(during - pack) < 0.3) f.supporting.push(`Pack voltage does not rise during charge (${V(during)})`);
      if (current !== null && current < 0.3 && enable === "Enabled") {
        f.supporting.push("Charge enabled but no charge current");
        f.strong++;
      }
      if (current !== null && current >= 1) f.conflicting.push(`Charge current flows (${formatNumber(current, "A", 1)})`);
      if (enable === "Disabled") f.conflicting.push("BMS has disabled charging — look at the BMS first");
      return f;
    },
    next: "Measure charger output open-circuit and under load, then pack voltage during charge.",
    decide: () => ({ status: "SERVICEABLE", depth: "basic", verify: ["Charge test with a verified matching charger", "Charge current at expected level"] }),
  },
  {
    id: "bms",
    name: "BMS protection or BMS fault",
    complaints: ["not-charging", "warning", "shutdown-load", "storage"],
    required: [{ o: "bmsStatus" }, { o: "chargeEnable" }, { o: "dischargeEnable" }, { m: "cellMin" }, { m: "cellMax" }],
    helpful: [{ o: "bmsFaultCodes" }, { o: "commStatus" }],
    evaluate: ({ m, o }) => {
      const f: Finding = { supporting: [], conflicting: [], strong: 0 };
      const status = textOf(o, "bmsStatus");
      const ch = textOf(o, "chargeEnable");
      const dis = textOf(o, "dischargeEnable");
      const min = numberOf(m, "cellMin");
      const max = numberOf(m, "cellMax");
      if (status === "Protection" || status === "Offline / no data") {
        f.supporting.push(`BMS status: ${status}`);
        f.strong++;
      } else if (status === "Warning") f.supporting.push("BMS status: Warning");
      if (ch === "Disabled" || dis === "Disabled") f.supporting.push(`${[ch === "Disabled" && "Charge", dis === "Disabled" && "Discharge"].filter(Boolean).join(" and ")} disabled by the BMS`);
      const codes = textOf(o, "bmsFaultCodes");
      if (codes) f.supporting.push(`Fault codes: ${codes}`);
      // Groups inside a normal window with a path blocked points at the BMS itself.
      if (min !== null && max !== null && min > 3.0 && max < 4.2 && (ch === "Disabled" || dis === "Disabled")) {
        f.supporting.push(`Groups within a normal window (${V(min, 3)}–${V(max, 3)}) yet a path is blocked`);
        f.strong++;
      }
      if (status === "Normal" && ch === "Enabled" && dis === "Enabled") f.conflicting.push("BMS normal with both paths enabled");
      return f;
    },
    next: "Read the BMS fault log and compare its group voltages with a direct meter reading.",
    decide: () => ({ status: "BMS_SERVICE", depth: "expert", verify: ["BMS status NORMAL after service", "Charge and discharge enable", "Communication check", "Fault rescan"] }),
  },
  {
    id: "connector",
    name: "Connector or high-resistance joint",
    complaints: ["shutdown-load", "overheating", "not-charging", "warning"],
    required: [{ o: "connectorCondition" }, { o: "hotspotLocation" }],
    helpful: [{ o: "loadBehaviour" }, { o: "smellOrHeat" }],
    evaluate: ({ o }) => {
      const f: Finding = { supporting: [], conflicting: [], strong: 0 };
      const c = textOf(o, "connectorCondition");
      if (c && c !== "Good") {
        f.supporting.push(`Connector: ${c}`);
        f.strong++;
      } else if (c === "Good") f.conflicting.push("Connector condition good");
      const hot = textOf(o, "hotspotLocation");
      if (hot === "Connector" || hot === "Busbar / joint") {
        f.supporting.push(`Hot spot at ${hot.toLowerCase()}`);
        f.strong++;
      } else if (hot === "None found") f.conflicting.push("No hot spot found");
      const smell = textOf(o, "smellOrHeat");
      if (smell === "Burning smell") f.supporting.push("Burning smell reported");
      return f;
    },
    next: "Thermal inspection after a controlled load run; voltage drop across the connector.",
    decide: () => ({ status: "COMPONENT_REPAIR", depth: "expert", verify: ["Connector engagement and lock", "Thermal check after load", "Voltage drop across the joint"] }),
  },
  {
    id: "fuse",
    name: "Open fuse / main current path",
    complaints: ["shutdown-load", "warning", "other"],
    required: [{ m: "packVoltage" }, { o: "fuseStatus" }],
    helpful: [{ m: "cellMin" }],
    evaluate: ({ m, o }) => {
      const f: Finding = { supporting: [], conflicting: [], strong: 0 };
      const fuse = textOf(o, "fuseStatus");
      if (fuse === "Open") {
        f.supporting.push("Fuse open");
        f.strong++;
      } else if (fuse === "Intact") f.conflicting.push("Fuse intact");
      const pack = numberOf(m, "packVoltage");
      if (pack !== null && pack < 1) f.supporting.push(`No voltage at the pack output (${V(pack)})`);
      return f;
    },
    next: "With the pack isolated, check fuse continuity; then find what made it open.",
    decide: () => ({ status: "COMPONENT_REPAIR", depth: "expert", verify: ["Cause of the fuse opening found and fixed", "Correct fuse rating fitted", "Insulation check", "Load test"] }),
  },
  {
    id: "temp-sensor",
    name: "Temperature sensor fault",
    complaints: ["not-charging", "warning", "overheating"],
    required: [{ m: "tempMin" }, { m: "tempMax" }, { m: "ambientTemp" }],
    helpful: [{ o: "hotspotLocation" }],
    evaluate: ({ m, o }) => {
      const f: Finding = { supporting: [], conflicting: [], strong: 0 };
      const min = numberOf(m, "tempMin");
      const max = numberOf(m, "tempMax");
      const amb = numberOf(m, "ambientTemp");
      if (min !== null && min <= -30) {
        f.supporting.push(`Minimum temperature ${formatNumber(min, "°C", 1)} is implausible${amb !== null ? ` at ${formatNumber(amb, "°C", 1)} ambient` : ""}`);
        f.strong++;
      }
      if (max !== null && max >= 100 && textOf(o, "hotspotLocation") === "None found") {
        f.supporting.push(`Maximum ${formatNumber(max, "°C", 1)} with no hot spot on the thermal camera`);
        f.strong++;
      }
      if (min !== null && max !== null && min > -10 && max < 70) f.conflicting.push("All temperatures plausible");
      return f;
    },
    next: "Compare each BMS temperature channel with a thermal camera reading at the same point.",
    decide: () => ({ status: "BMS_SERVICE", depth: "expert", verify: ["Every channel plausible against ambient", "Charge enable restored"] }),
  },
  {
    id: "thermal",
    name: "Thermal issue / overheating",
    complaints: ["overheating", "warning"],
    required: [{ m: "tempMax" }, { m: "ambientTemp" }, { o: "hotspotLocation" }, { o: "enclosureDamage" }, { o: "bmsStatus" }],
    helpful: [{ m: "tempMin" }, { o: "smellOrHeat" }],
    evaluate: ({ m, o, spread }) => {
      const f: Finding = { supporting: [], conflicting: [], strong: 0 };
      const max = numberOf(m, "tempMax");
      const amb = numberOf(m, "ambientTemp");
      if (max !== null && max >= 55) {
        f.supporting.push(`Maximum temperature ${formatNumber(max, "°C", 1)} (reference: service ≥ 55 °C)`);
        f.strong++;
      } else if (max !== null && max >= 45) f.supporting.push(`Maximum temperature ${formatNumber(max, "°C", 1)}`);
      else if (max !== null && max < 40) f.conflicting.push(`Maximum temperature ${formatNumber(max, "°C", 1)}`);
      if (max !== null && amb !== null && max - amb >= 20) f.supporting.push(`${formatNumber(max - amb, "°C", 1)} above ambient`);
      if (spread !== null && spread >= 10) f.supporting.push(`Spread ${formatNumber(spread, "°C", 1)}`);
      const hot = textOf(o, "hotspotLocation");
      if (hot && hot !== "None found") f.supporting.push(`Hot spot: ${hot}`);
      return f;
    },
    next: "Thermal camera scan after a controlled load; log temperature against time and ambient.",
    decide: ({ o }) =>
      textOf(o, "hotspotLocation") === "Connector"
        ? { status: "COMPONENT_REPAIR", depth: "expert", verify: ["Connector temperature after load", "Temperature spread"] }
        : { status: "MODULE_REPAIR", depth: "advanced", verify: ["Temperature spread after load", "Thermal-interface contact", "Fault rescan"] },
  },
  {
    id: "water",
    name: "Water ingress / corrosion",
    complaints: ["water", "warning", "soc-drop"],
    required: [{ o: "waterIngress" }, { o: "corrosion" }],
    helpful: [{ m: "insulationResistance" }, { o: "enclosureDamage" }],
    evaluate: ({ m, o }) => {
      const f: Finding = { supporting: [], conflicting: [], strong: 0 };
      const water = textOf(o, "waterIngress");
      if (water && water !== "None") {
        f.supporting.push(`Water: ${water}`);
        f.strong++;
      } else if (water === "None") f.conflicting.push("No water evidence");
      const corr = textOf(o, "corrosion");
      if (corr && corr !== "None") f.supporting.push(`Corrosion: ${corr}`);
      else if (corr === "None") f.conflicting.push("No corrosion");
      const iso = numberOf(m, "insulationResistance");
      if (iso !== null && iso < 1) {
        f.supporting.push(`Insulation resistance ${formatNumber(iso, "MΩ", 1)} (below the 1 MΩ reference)`);
        f.strong++;
      }
      return f;
    },
    next: "Insulation resistance test with suitable equipment; inspect seals and connectors.",
    decide: ({ o }) =>
      textOf(o, "waterIngress") === "Water inside / flood exposure" || textOf(o, "corrosion") === "Severe"
        ? { status: "UNSAFE_QUARANTINE", depth: null, verify: ["Escalate to the manufacturer or a specialist facility"] }
        : { status: "COMPONENT_REPAIR", depth: "expert", verify: ["Seal and connector replacement verified", "Insulation resistance", "Fault rescan"] },
  },
  {
    id: "degradation",
    name: "Capacity degradation / ageing",
    complaints: ["reduced-range", "soc-drop"],
    required: [{ m: "soh" }, { o: "capacityTest" }],
    helpful: [{ m: "cellMin" }, { m: "cellMax" }],
    evaluate: ({ m, o }) => {
      const f: Finding = { supporting: [], conflicting: [], strong: 0 };
      const soh = numberOf(m, "soh");
      if (soh !== null && soh < 70) {
        f.supporting.push(`SOH ${formatNumber(soh, "%")} (reference: service < 70 %)`);
        f.strong++;
      } else if (soh !== null && soh < 80) f.supporting.push(`SOH ${formatNumber(soh, "%")}`);
      else if (soh !== null && soh >= 90) f.conflicting.push(`SOH ${formatNumber(soh, "%")}`);
      const cap = textOf(o, "capacityTest");
      if (cap === "Severely low") {
        f.supporting.push("Capacity test severely low");
        f.strong++;
      } else if (cap === "Below expectation") f.supporting.push("Capacity test below expectation");
      else if (cap === "Within expectation") f.conflicting.push("Capacity test within expectation");
      return f;
    },
    next: "Full capacity test (charge, rest, controlled discharge) against rated capacity.",
    decide: ({ m }) => {
      const soh = numberOf(m, "soh");
      return soh !== null && soh < 65
        ? { status: "PACK_REPLACEMENT_RECOMMENDED", depth: null, verify: ["Capacity test documented", "Customer informed of measured capacity"] }
        : { status: "SERVICEABLE", depth: "basic", verify: ["Customer informed of measured capacity", "Re-test interval agreed"] };
    },
  },
  {
    id: "comms",
    name: "Communication fault",
    complaints: ["warning", "shutdown-load"],
    required: [{ o: "commStatus" }, { o: "bmsStatus" }],
    helpful: [{ o: "connectorCondition" }],
    evaluate: ({ o }) => {
      const f: Finding = { supporting: [], conflicting: [], strong: 0 };
      const c = textOf(o, "commStatus");
      if (c === "Offline") {
        f.supporting.push("Communication offline");
        f.strong++;
      } else if (c === "Intermittent") f.supporting.push("Communication intermittent");
      else if (c === "Online") f.conflicting.push("Communication online");
      return f;
    },
    next: "Check the communication harness, termination and the BMS node on a second interface.",
    decide: () => ({ status: "BMS_SERVICE", depth: "expert", verify: ["Communication ONLINE on every interface", "Dashboard data restored"] }),
  },
  {
    id: "deep-discharge",
    name: "Deep discharge",
    complaints: ["storage", "not-charging"],
    required: [{ m: "packVoltage" }, { m: "cellMin" }],
    helpful: [{ o: "bmsStatus" }],
    evaluate: ({ m }) => {
      const f: Finding = { supporting: [], conflicting: [], strong: 0 };
      const min = numberOf(m, "cellMin");
      if (min !== null && min < 2.5) {
        f.supporting.push(`Minimum group ${V(min, 3)}`);
        f.strong++;
      } else if (min !== null && min < 3.0) f.supporting.push(`Minimum group ${V(min, 3)}`);
      else if (min !== null && min >= 3.2) f.conflicting.push(`Minimum group ${V(min, 3)}`);
      return f;
    },
    next: "Record every group voltage; do not charge until a specialist has assessed recovery.",
    decide: ({ m }) => {
      const min = numberOf(m, "cellMin");
      return min !== null && min < 2.0
        ? { status: "UNSAFE_QUARANTINE", depth: null, verify: ["Do not charge", "Escalate for specialist assessment"] }
        : { status: "ADVANCED_CELL_REPAIR", depth: "advanced", verify: ["Specialist recovery assessment", "Capacity test", "Self-discharge check after rest"] };
    },
  },
];

const CONFIDENCE_RANK: Record<Confidence, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };

/**
 * HIGH: gate met, nothing conflicting, at least one strong item among two or
 * more supporting ones (e.g. a 340 mV delta and a shutdown under load).
 * MEDIUM: gate met and the evidence outweighs any conflict. Otherwise LOW.
 */
function confidenceOf(finding: Finding, gate: boolean): Confidence {
  if (!gate) return "LOW";
  const score = finding.supporting.length + finding.strong - 2 * finding.conflicting.length;
  if (finding.strong >= 1 && finding.supporting.length >= 2 && finding.conflicting.length === 0) return "HIGH";
  if (score >= 2 && (finding.supporting.length >= 2 || finding.strong >= 1)) return "MEDIUM";
  return "LOW";
}

function evidenceOf(job: Pick<JobCard, "before" | "observations" | "complaintCategory">): Evidence {
  const delta = deltaOf(job.before).value;
  return { m: job.before, o: job.observations, complaint: job.complaintCategory, delta, spread: spreadOf(job.before) };
}

export const INSUFFICIENT = "INSUFFICIENT EVIDENCE — PERFORM NEXT TEST";

/** Every candidate the complaint or the evidence points at, strongest first. */
export function rootCauseCandidates(job: Pick<JobCard, "before" | "observations" | "complaintCategory">): RootCauseCandidate[] {
  const ev = evidenceOf(job);
  const out: (RootCauseCandidate & { score: number })[] = [];
  for (const h of HYPOTHESES) {
    const finding = h.evaluate(ev);
    const suggested = h.complaints.includes(ev.complaint);
    if (!suggested && finding.supporting.length === 0) continue;
    const missingRequired = h.required.filter((r) => !hasRef(ev, r)).map(labelOf);
    const missingHelpful = h.helpful.filter((r) => !hasRef(ev, r)).map((r) => `${labelOf(r)} not recorded`);
    const gate = missingRequired.length === 0;
    const confidence = confidenceOf(finding, gate);
    out.push({
      id: h.id,
      name: h.name,
      supporting: finding.supporting,
      conflicting: finding.conflicting,
      missing: [...missingRequired.map((l) => `${l} — required`), ...missingHelpful],
      nextMeasurement: gate ? h.next : `Record ${missingRequired[0]}. ${h.next}`,
      confidence,
      gate: gate ? "MET" : "INSUFFICIENT",
      score: (gate ? 100 : 0) + CONFIDENCE_RANK[confidence] * 10 + finding.supporting.length + finding.strong - finding.conflicting.length,
    });
  }
  return out.sort((a, b) => b.score - a.score).map((c) => {
    const { score, ...candidate } = c;
    void score;
    return candidate;
  });
}

// ── Repair decision ──

export const REPAIR_STATUS_LABEL: Record<RepairStatus, string> = {
  NO_REPAIR_REQUIRED: "NO REPAIR REQUIRED",
  SERVICEABLE: "SERVICEABLE",
  COMPONENT_REPAIR: "COMPONENT REPAIR",
  BMS_SERVICE: "BMS SERVICE",
  MODULE_REPAIR: "MODULE REPAIR",
  ADVANCED_CELL_REPAIR: "ADVANCED CELL REPAIR",
  PACK_REPLACEMENT_RECOMMENDED: "PACK REPLACEMENT RECOMMENDED",
  UNSAFE_QUARANTINE: "UNSAFE — QUARANTINE / ESCALATE",
  INSUFFICIENT_EVIDENCE: INSUFFICIENT,
};

/** Observations that are safety conditions in their own right. */
export function safetyObservations(o: Observations): string[] {
  const out: string[] = [];
  const swelling = textOf(o, "swelling");
  if (swelling && swelling !== "None") out.push(`Swelling: ${swelling}`);
  const smell = textOf(o, "smellOrHeat");
  if (smell === "Smoke" || smell === "Burning smell") out.push(smell);
  if (textOf(o, "enclosureDamage") === "Crack / breach") out.push("Enclosure breach");
  if (textOf(o, "waterIngress") === "Water inside / flood exposure") out.push("Water inside / flood exposure");
  return out;
}

const CORE_SET: FieldRef[] = [{ m: "packVoltage" }, { m: "cellMin" }, { m: "cellMax" }, { m: "tempMax" }, { o: "bmsStatus" }];

export function repairDecision(job: JobCard, candidates: RootCauseCandidate[] = rootCauseCandidates(job)): RepairDecision {
  const ev = evidenceOf(job);
  const hazards = [...job.safetyFlags, ...safetyObservations(job.observations)];
  if (hazards.length > 0) {
    return {
      status: "UNSAFE_QUARANTINE",
      reason: "A safety condition is present. Stop diagnosis, do not charge, do not continue disassembly; isolate, quarantine and escalate.",
      evidence: hazards,
      repairDepth: null,
      verificationRequired: ["Quarantine location recorded", "Escalation to the manufacturer or a specialist facility"],
    };
  }
  const best = candidates.find((c) => c.gate === "MET" && c.confidence !== "LOW");
  if (best) {
    const h = HYPOTHESES.find((x) => x.id === best.id)!;
    const d = h.decide(ev);
    return {
      status: d.status,
      reason: `${best.name} — ${best.confidence} confidence, evidence gate met.`,
      evidence: best.supporting,
      repairDepth: d.depth,
      verificationRequired: d.verify,
    };
  }
  const coreMissing = CORE_SET.filter((r) => !hasRef(ev, r)).map(labelOf);
  const anySupport = candidates.some((c) => c.supporting.length > 0);
  if (coreMissing.length === 0 && !anySupport) {
    return {
      status: "NO_REPAIR_REQUIRED",
      reason: "Core measurements are recorded and none points at a fault.",
      evidence: CORE_SET.map((r) => `${labelOf(r)} recorded`),
      repairDepth: null,
      verificationRequired: ["Explain the findings to the customer", "Re-test if the complaint returns"],
    };
  }
  const nextTest = candidates[0]?.nextMeasurement ?? `Record ${coreMissing[0] ?? "the core measurements"}.`;
  return {
    status: "INSUFFICIENT_EVIDENCE",
    reason: `${INSUFFICIENT}. ${nextTest}`,
    evidence: candidates.flatMap((c) => c.supporting).slice(0, 6),
    repairDepth: null,
    verificationRequired: coreMissing.map((l) => `Record ${l}`),
  };
}

// ── Post-repair verification ──

export const VERIFICATION_LABEL: Record<VerificationOutcome, string> = {
  PASS: "PASS",
  CONDITIONAL_PASS: "CONDITIONAL PASS",
  FURTHER_DIAGNOSIS_REQUIRED: "FURTHER DIAGNOSIS REQUIRED",
  UNSAFE_DO_NOT_RETURN: "UNSAFE — DO NOT RETURN TO CUSTOMER",
};

export interface VerificationResult {
  outcome: VerificationOutcome;
  reasons: string[];
}

/**
 * "Fault cleared" is not "repair successful": every critical check must pass,
 * the after-repair delta must be acceptable, and the technician must confirm.
 */
export function verifyRepair(job: JobCard): VerificationResult {
  const reasons: string[] = [];
  const hazards = [...job.safetyFlags, ...safetyObservations(job.afterObservations)];
  if (hazards.length > 0 || job.verification.safetyCheck === "fail") {
    return { outcome: "UNSAFE_DO_NOT_RETURN", reasons: hazards.length ? hazards : ["Safety check failed"] };
  }
  const failed = VERIFICATION_CHECKS.filter((c) => job.verification[c.id] === "fail");
  const criticalPending = VERIFICATION_CHECKS.filter((c) => c.critical && (job.verification[c.id] ?? "not-done") === "not-done");
  const otherPending = VERIFICATION_CHECKS.filter((c) => !c.critical && (job.verification[c.id] ?? "not-done") === "not-done");
  for (const c of failed) reasons.push(`${c.label} failed`);
  for (const c of criticalPending) reasons.push(`${c.label} not completed`);
  const afterDelta = deltaOf(job.after).value;
  if (afterDelta !== null && afterDelta >= 50) reasons.push(`Cell delta after repair ${formatNumber(afterDelta, "mV")} (reference < 50 mV)`);
  const afterTemp = numberOf(job.after, "tempMax");
  if (afterTemp !== null && afterTemp >= 45) reasons.push(`Maximum temperature after repair ${formatNumber(afterTemp, "°C", 1)}`);
  const afterBms = textOf(job.afterObservations, "bmsStatus");
  if (afterBms && afterBms !== "Normal") reasons.push(`BMS status after repair: ${afterBms}`);
  if (!job.technicianConfirmed) reasons.push("Technician confirmation missing");
  if (reasons.length > 0) return { outcome: "FURTHER_DIAGNOSIS_REQUIRED", reasons };
  if (otherPending.length > 0) return { outcome: "CONDITIONAL_PASS", reasons: otherPending.map((c) => `${c.label} pending: ${c.criterion}`) };
  return { outcome: "PASS", reasons: ["All checks passed and confirmed by the technician"] };
}

// ── Before / after ──

export interface ComparisonRow {
  key: string;
  label: string;
  before: string;
  after: string;
  trend: Trend;
}

const BMS_RANK: Record<string, number> = { Normal: 0, Warning: 1, Protection: 2, "Offline / no data": 3 };

function numericTrend(before: number | null, after: number | null, better: "lower" | "higher" | "none", tolerance: number): Trend {
  if (before === null || after === null) return "not-comparable";
  const d = after - before;
  if (Math.abs(d) <= tolerance) return "unchanged";
  if (better === "none") return "changed";
  return (better === "lower" ? d < 0 : d > 0) ? "improved" : "worsened";
}

export function compareBeforeAfter(job: JobCard): ComparisonRow[] {
  const rows: ComparisonRow[] = [];
  const num = (key: MeasurementKey, better: "lower" | "higher" | "none", tolerance: number) => {
    const f = MEASUREMENTS[key];
    const b = key === "cellDelta" ? deltaOf(job.before).value : numberOf(job.before, key);
    const a = key === "cellDelta" ? deltaOf(job.after).value : numberOf(job.after, key);
    rows.push({ key, label: f.label, before: formatNumber(b, f.unit, f.digits, "NOT MEASURED"), after: formatNumber(a, f.unit, f.digits, "NOT MEASURED"), trend: numericTrend(b, a, better, tolerance) });
  };
  num("packVoltage", "none", 0.5);
  num("soc", "none", 2);
  num("soh", "higher", 1);
  num("cellDelta", "lower", 5);
  num("tempMax", "lower", 1);
  const obs = (key: ObservationKey, rank: (v: string) => number | null) => {
    const b = textOf(job.observations, key);
    const a = textOf(job.afterObservations, key);
    const rb = b === null ? null : rank(b);
    const ra = a === null ? null : rank(a);
    rows.push({ key, label: OBSERVATIONS[key].label, before: b ?? "NOT MEASURED", after: a ?? "NOT MEASURED", trend: numericTrend(rb, ra, "lower", 0) });
  };
  obs("bmsStatus", (v) => BMS_RANK[v] ?? null);
  obs("bmsFaultCodes", (v) => (/^(none|-|0)$/i.test(v) ? 0 : v.split(/[,;\s]+/).filter(Boolean).length));
  obs("chargeEnable", (v) => (v === "Enabled" ? 0 : 1));
  obs("dischargeEnable", (v) => (v === "Enabled" ? 0 : 1));
  return rows;
}

// ── Job card ──

export function emptyCheckSet(): Record<string, CheckResult> {
  return Object.fromEntries(VERIFICATION_CHECKS.map((c) => [c.id, "not-done" as CheckResult]));
}

export function newJobCard(now: Date, sequence = 1): JobCard {
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return {
    jobId: `EVB-${date.replace(/-/g, "")}-${String(sequence).padStart(3, "0")}`,
    date,
    technician: "",
    complaint: "",
    complaintCategory: "",
    vehicleId: null,
    variantId: null,
    modelYear: null,
    odometerKm: null,
    batteryId: "",
    batterySerial: "",
    architecture: null,
    safetyFlags: [],
    safetyAcknowledged: false,
    before: {},
    observations: {},
    groupVoltages: [],
    repairPerformed: "",
    partsReplaced: "",
    after: {},
    afterObservations: {},
    verification: emptyCheckSet(),
    technicianConfirmed: false,
    notes: "",
  };
}
