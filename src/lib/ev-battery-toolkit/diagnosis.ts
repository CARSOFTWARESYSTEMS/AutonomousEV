// Evidence-based diagnosis for a real vehicle: root-cause candidates with their
// supporting, conflicting and missing evidence; an evidence gate before any
// repair is recommended; the repair decision; post-repair verification; and
// the before / after comparison.
//
// A complaint can suggest where to look, but it never raises confidence on its
// own: confidence counts measured or observed evidence only.
//
// Evaluation is scoped to a context. In the real context (the default for every
// public function here) only MEASURED and USER ENTERED values are evidence; a
// SIMULATED value is ignored even if one were put into a job card. In the
// simulation context (the guided case only) only SIMULATED values count.
//
// Every threshold in this file is REFERENCE / ILLUSTRATIVE — none is VERIFIED
// against a manufacturer limit and none is user-configured. Where a technician
// has confirmed the pack configuration (cell limits, series count), those
// user-entered values are used in preference to the references. The interface
// says so where diagnosis begins and where repair decisions are made
// (REFERENCE_LOGIC_NOTICE).
import { MEASUREMENTS, OBSERVATIONS, VERIFICATION_CHECKS } from "@/data/ev-battery-toolkit/fields";
import { formatNumber, round } from "./provenance";
import type {
  CellConfiguration,
  CheckResult,
  Confidence,
  DiagnosticMeasurement,
  DiagnosticObservation,
  JobCard,
  MeasurementKey,
  ObservationKey,
  Provenance,
  RepairDecision,
  RepairDepth,
  RepairStatus,
  RootCauseCandidate,
  Trend,
  VerificationOutcome,
} from "./types";

type Measurements = Partial<Record<MeasurementKey, DiagnosticMeasurement>>;
type Observations = Partial<Record<ObservationKey, DiagnosticObservation>>;

export type EvaluationContext = "real" | "simulation";

export const REFERENCE_LOGIC_NOTICE =
  "Reference diagnostic logic. Validate limits against the selected battery, BMS and manufacturer service information before making a real repair decision.";

export const REFERENCE_ONLY = "REFERENCE ONLY — VALIDATE AGAINST BMS/OEM LIMITS";

/** Which data origins count as evidence in each context. They never overlap. */
const EVIDENCE: Record<EvaluationContext, ReadonlySet<Provenance>> = {
  real: new Set<Provenance>(["MEASURED", "USER_ENTERED"]),
  simulation: new Set<Provenance>(["SIMULATED"]),
};

/** Internal: a value is "recorded" once its set has been scoped to one context. */
const RECORDED = new Set<Provenance>(["MEASURED", "USER_ENTERED", "SIMULATED"]);

/** Drops every entry whose origin does not count as evidence in this context. */
function scoped<T extends { provenance: Provenance }>(set: Partial<Record<string, T>>, context: EvaluationContext): Partial<Record<string, T>> {
  const out: Partial<Record<string, T>> = {};
  for (const [key, entry] of Object.entries(set)) {
    if (entry && (EVIDENCE[context].has(entry.provenance) || !RECORDED.has(entry.provenance))) out[key] = entry;
  }
  return out;
}

/**
 * A copy of the job card holding only what counts as evidence in `context`.
 * In the real context, any SIMULATED value is removed, so it can never reach a
 * candidate, a decision, a verification or a real report.
 */
export function forContext<J extends Pick<JobCard, "before" | "observations"> & Partial<Pick<JobCard, "after" | "afterObservations">>>(job: J, context: EvaluationContext): J {
  return {
    ...job,
    before: scoped(job.before, context) as Measurements,
    observations: scoped(job.observations, context) as Observations,
    ...(job.after ? { after: scoped(job.after, context) as Measurements } : {}),
    ...(job.afterObservations ? { afterObservations: scoped(job.afterObservations, context) as Observations } : {}),
  };
}

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

// ── Pack configuration ──

export const EMPTY_CELL_CONFIG: CellConfiguration = { chemistry: "Unknown", format: "Unknown", series: null, parallel: null, modules: null, cellNominalV: null, cellMaxV: null, cellMinV: null };

export const CALCULATED_FROM_CONFIG = "CALCULATED FROM USER-CONFIRMED CELL CONFIGURATION";

export interface PackExpectations {
  nominal: number | null;
  full: number | null;
  lower: number | null;
}

const positive = (n: number | null): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;

/** Expected pack voltages, only from a configuration the technician has confirmed. The series count is never guessed. */
export function packExpectations(c: CellConfiguration | undefined): PackExpectations {
  if (!c || !positive(c.series) || !Number.isInteger(c.series)) return { nominal: null, full: null, lower: null };
  const times = (v: number | null) => (positive(v) ? round(c.series! * v, 2) : null);
  return { nominal: times(c.cellNominalV), full: times(c.cellMaxV), lower: times(c.cellMinV) };
}

// ── Cell-group analysis ──

export interface GroupRow {
  group: number;
  voltage: number;
  deltaFromAverageMv: number;
  status: ("Highest" | "Lowest" | "Largest deviation")[];
}

export function groupAnalysis(values: (number | null)[]): { rows: GroupRow[]; average: number; deltaMv: number } | null {
  const list = values.map((v, i) => ({ v, i })).filter((x): x is { v: number; i: number } => typeof x.v === "number" && Number.isFinite(x.v));
  if (list.length < 2) return null;
  const average = list.reduce((a, b) => a + b.v, 0) / list.length;
  const max = Math.max(...list.map((x) => x.v));
  const min = Math.min(...list.map((x) => x.v));
  const deviation = Math.max(...list.map((x) => Math.abs(x.v - average)));
  const rows = list.map(({ v, i }) => {
    const status: GroupRow["status"] = [];
    if (v === max) status.push("Highest");
    if (v === min) status.push("Lowest");
    if (Math.abs(v - average) === deviation) status.push("Largest deviation");
    return { group: i + 1, voltage: v, deltaFromAverageMv: round((v - average) * 1000, 0), status };
  });
  return { rows, average: round(average, 3), deltaMv: round((max - min) * 1000, 0) };
}

// ── Evidence ──

interface Evidence {
  m: Measurements;
  o: Observations;
  complaint: string;
  delta: number | null;
  spread: number | null;
  expect: PackExpectations;
  config: CellConfiguration;
}

type FieldRef = { m: MeasurementKey } | { o: ObservationKey } | { delta: true } | { config: true } | { any: FieldRef[]; label: string };

function labelOf(ref: FieldRef): string {
  if ("m" in ref) return MEASUREMENTS[ref.m].label;
  if ("o" in ref) return OBSERVATIONS[ref.o].label;
  if ("delta" in ref) return "Cell delta (or minimum and maximum)";
  if ("config" in ref) return "Confirmed pack configuration (series count and cell voltages)";
  return ref.label;
}

function hasRef(ev: Evidence, ref: FieldRef): boolean {
  if ("m" in ref) return numberOf(ev.m, ref.m) !== null;
  if ("o" in ref) return textOf(ev.o, ref.o) !== null;
  if ("delta" in ref) return ev.delta !== null;
  if ("config" in ref) return ev.expect.nominal !== null;
  return ref.any.some((r) => hasRef(ev, r));
}

interface Finding {
  supporting: string[];
  conflicting: string[];
  /** Strong evidence counts double towards confidence. */
  strong: number;
}

interface Decided {
  status: RepairStatus;
  depth: RepairDepth | null;
  verify: string[];
}

interface Hypothesis {
  id: string;
  name: string;
  /** Complaints this hypothesis is a natural suspect for. A complaint alone never raises confidence. */
  complaints: string[];
  /** The evidence gate: all must be recorded before a repair can follow. */
  required: FieldRef[];
  /** Evidence that strengthens the case if recorded. Missing items are listed. */
  helpful: FieldRef[];
  evaluate: (ev: Evidence) => Finding;
  next: string;
  decide: (ev: Evidence) => Decided;
}

const V = (n: number, d = 1) => formatNumber(n, "V", d);
const C = (n: number) => formatNumber(n, "°C", 1);
const finding = (): Finding => ({ supporting: [], conflicting: [], strong: 0 });
const strong = (f: Finding, text: string) => {
  f.supporting.push(text);
  f.strong++;
};
const isNone = (v: string | null) => v === null || /^(none|no|-|0|nil)$/i.test(v);

/** Cell window: the technician's confirmed limits, else a broad reference window. */
const cellWindow = (ev: Evidence) => ({
  min: positive(ev.config.cellMinV) ? ev.config.cellMinV : 3.0,
  max: positive(ev.config.cellMaxV) ? ev.config.cellMaxV : 4.2,
  confirmed: positive(ev.config.cellMinV) && positive(ev.config.cellMaxV),
});

const CHARGING = ["not-charging", "slow-charging", "stops-early", "charger-led"];
const RANGE = ["reduced-range", "low-range-full"];
const SHUTDOWN = ["shutdown-load", "intermittent-output"];
const NO_POWER = ["no-start", "no-output"];

const HYPOTHESES: Hypothesis[] = [
  {
    id: "imbalance",
    name: "Cell imbalance",
    complaints: [...SHUTDOWN, ...RANGE, "stops-early", "soc-drop", "not-charging"],
    required: [{ m: "cellMin" }, { m: "cellMax" }, { delta: true }, { any: [{ m: "soc" }, { o: "loadBehaviour" }], label: "SOC or load context" }],
    helpful: [{ o: "bmsStatus" }, { o: "capacityTest" }, { o: "internalResistanceTest" }],
    evaluate: ({ m, o, delta }) => {
      const f = finding();
      const min = numberOf(m, "cellMin");
      const max = numberOf(m, "cellMax");
      if (delta !== null) {
        const detail = `Delta: ${formatNumber(delta, "mV")}${min !== null && max !== null ? ` (max ${V(max, 3)}, min ${V(min, 3)})` : ""}`;
        if (delta >= 100) strong(f, detail);
        else if (delta >= 50) f.supporting.push(detail);
        else if (delta < 30) f.conflicting.push(`${detail} — within the 30 mV reference`);
      }
      const load = textOf(o, "loadBehaviour");
      if (load && load !== "Stable under load") f.supporting.push(`Load behaviour: ${load}`);
      const cap = textOf(o, "capacityTest");
      if (cap && cap !== "Within expectation") f.supporting.push(`Capacity test: ${cap}`);
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
    complaints: [...SHUTDOWN, ...RANGE, "soc-drop"],
    required: [{ m: "cellMin" }, { m: "cellMax" }, { any: [{ o: "loadBehaviour" }, { m: "loadedPackVoltage" }], label: "Load behaviour or loaded pack voltage" }],
    helpful: [{ o: "internalResistanceTest" }, { o: "capacityTest" }, { m: "tempMax" }],
    evaluate: ({ m, o, delta }) => {
      const f = finding();
      const load = textOf(o, "loadBehaviour");
      if (load === "Shuts down under load") strong(f, "Shutdown occurs under load");
      else if (load === "Voltage sag under load") f.supporting.push("Voltage sags under load");
      else if (load === "Stable under load") f.conflicting.push("Stable under load");
      const rest = numberOf(m, "packVoltage");
      const loaded = numberOf(m, "loadedPackVoltage");
      if (rest !== null && loaded !== null && rest > 0) {
        const sag = (rest - loaded) / rest;
        if (sag >= 0.1) strong(f, `Loaded voltage drops ${V(rest - loaded)} (${round(sag * 100, 0)} %) from ${V(rest)}`);
        else if (sag < 0.04) f.conflicting.push(`Loaded voltage drops only ${round(sag * 100, 0)} %`);
      }
      if (delta !== null && delta >= 50) f.supporting.push(`Delta: ${formatNumber(delta, "mV")}`);
      if (delta !== null && delta < 30) f.conflicting.push(`Delta ${formatNumber(delta, "mV")} at rest`);
      const ir = textOf(o, "internalResistanceTest");
      if (ir === "One group high") strong(f, "Internal resistance: one group high");
      else if (ir === "Uniform") f.conflicting.push("Internal resistance uniform");
      const tMax = numberOf(m, "tempMax");
      if (tMax !== null && tMax < 40) f.conflicting.push(`No abnormal temperature (${C(tMax)})`);
      return f;
    },
    next: "Load test while logging each group's voltage; compare internal resistance.",
    decide: () => ({ status: "MODULE_REPAIR", depth: "advanced", verify: ["Load test logging group voltages", "Cell delta under load", "Thermal check after load"] }),
  },
  {
    id: "charger",
    name: "Charger suspected",
    complaints: [...CHARGING, "storage"],
    required: [{ m: "chargerVoltage" }, { m: "packVoltage" }, { o: "chargeResponse" }],
    helpful: [{ m: "voltageDuringCharge" }, { m: "chargerCurrent" }, { o: "chargeEnable" }, { o: "chargerLed" }],
    evaluate: ({ m, o, expect }) => {
      const f = finding();
      const charger = numberOf(m, "chargerVoltage");
      const pack = numberOf(m, "packVoltage");
      const during = numberOf(m, "voltageDuringCharge");
      const current = numberOf(m, "chargerCurrent");
      const enable = textOf(o, "chargeEnable");
      if (charger !== null && pack !== null) {
        if (charger <= pack) strong(f, `Charger output ${V(charger)} is not above pack voltage ${V(pack)}`);
        else if (charger > pack * 1.3) strong(f, `Charger output ${V(charger)} far above pack ${V(pack)} — possible mismatch`);
        else f.conflicting.push(`Charger output ${V(charger)} is plausible for pack ${V(pack)}`);
      }
      if (charger !== null && expect.full !== null) {
        if (charger > expect.full * 1.05) strong(f, `Charger output ${V(charger)} above the confirmed full-charge ${V(expect.full)} — mismatch`);
        else if (charger < expect.full * 0.95) f.supporting.push(`Charger output ${V(charger)} below the confirmed full-charge ${V(expect.full)}`);
      }
      if (during !== null && pack !== null && Math.abs(during - pack) < 0.3) f.supporting.push(`Pack voltage does not rise during charge (${V(during)})`);
      if (current !== null && current < 0.3 && enable === "Enabled") strong(f, "Charge enabled but no charge current");
      if (current !== null && current >= 1) f.conflicting.push(`Charge current flows (${formatNumber(current, "A", 1)})`);
      const led = textOf(o, "chargerLed");
      if (led && led !== "Normal") f.supporting.push(`Charger indication: ${led}`);
      if (enable === "Disabled") f.conflicting.push("BMS has disabled charging — see BMS charge protection");
      return f;
    },
    next: "Measure charger output open-circuit and under load, then pack voltage during charge.",
    decide: () => ({ status: "SERVICEABLE", depth: "basic", verify: ["Charge test with a verified matching charger", "Charge current at expected level"] }),
  },
  {
    id: "connector",
    name: "Connector / wiring resistance",
    complaints: ["connector-heating", ...SHUTDOWN, "overheating", ...NO_POWER, "not-charging", "after-rain"],
    required: [{ o: "connectorCondition" }, { any: [{ o: "hotspotLocation" }, { o: "abnormalHeat" }], label: "Thermal evidence (hot-spot location or abnormal heat)" }],
    helpful: [{ m: "connectorVoltageDrop" }],
    evaluate: ({ m, o }) => {
      const f = finding();
      const c = textOf(o, "connectorCondition");
      if (c && c !== "Good") strong(f, `Connector: ${c}`);
      else if (c === "Good") f.conflicting.push("Connector condition good");
      const hot = textOf(o, "hotspotLocation");
      if (hot === "Connector" || hot === "Busbar / joint") strong(f, `Hot spot at ${hot.toLowerCase()}`);
      else if (hot === "None found") f.conflicting.push("No hot spot found");
      const heat = textOf(o, "abnormalHeat");
      if (heat === "Hot to touch") f.supporting.push("Hot to touch");
      const drop = numberOf(m, "connectorVoltageDrop");
      if (drop !== null && drop >= 100) strong(f, `Voltage drop across connector ${formatNumber(drop, "mV")} under load (reference ≥ 100 mV)`);
      else if (drop !== null && drop < 30) f.conflicting.push(`Connector voltage drop ${formatNumber(drop, "mV")}`);
      if (textOf(o, "abnormalSmell") === "Burning smell") f.supporting.push("Burning smell reported");
      return f;
    },
    next: "Thermal inspection after a controlled load run; voltage drop across the connector.",
    decide: () => ({ status: "CONNECTOR_WIRING_SERVICE", depth: "expert", verify: ["Connector engagement and lock", "Thermal check after load", "Voltage drop across the joint"] }),
  },
  {
    id: "bms",
    name: "BMS fault",
    complaints: ["bms-comm", ...NO_POWER, "intermittent-output", "not-charging"],
    required: [{ o: "commStatus" }, { any: [{ o: "bmsFaultCodes" }, { o: "bmsStatus" }], label: "Fault code or protection-state evidence" }],
    helpful: [{ o: "chargeEnable" }, { o: "dischargeEnable" }, { o: "bmsProtocol" }, { m: "cellMin" }, { m: "cellMax" }],
    evaluate: (ev) => {
      const { m, o } = ev;
      const f = finding();
      const comm = textOf(o, "commStatus");
      if (comm === "Offline") strong(f, "Communication offline");
      else if (comm === "Intermittent") f.supporting.push("Communication intermittent");
      const status = textOf(o, "bmsStatus");
      if (status === "Protection" || status === "Offline / no data") strong(f, `BMS status: ${status}`);
      else if (status === "Warning") f.supporting.push("BMS status: Warning");
      const codes = textOf(o, "bmsFaultCodes");
      if (!isNone(codes)) f.supporting.push(`Fault codes: ${codes}`);
      const ch = textOf(o, "chargeEnable");
      const dis = textOf(o, "dischargeEnable");
      const min = numberOf(m, "cellMin");
      const max = numberOf(m, "cellMax");
      const w = cellWindow(ev);
      if (min !== null && max !== null && min > w.min && max < w.max && (ch === "Disabled" || dis === "Disabled")) {
        strong(f, `Groups inside the ${w.confirmed ? "confirmed" : "reference"} window (${V(min, 3)}–${V(max, 3)}) yet a path is blocked`);
      }
      if (comm === "Online" && status === "Normal" && isNone(codes)) f.conflicting.push("BMS online and normal with no fault codes");
      return f;
    },
    next: "Read the BMS fault log and compare its group voltages with a direct meter reading.",
    decide: () => ({ status: "BMS_SERVICE", depth: "expert", verify: ["BMS status NORMAL after service", "Charge and discharge enable", "Communication check", "Fault rescan"] }),
  },
  {
    id: "bms-charge-protection",
    name: "BMS charge protection",
    complaints: CHARGING,
    required: [{ o: "chargeEnable" }, { any: [{ o: "bmsStatus" }, { o: "bmsFaultCodes" }], label: "BMS status or fault codes" }],
    helpful: [{ m: "cellMax" }, { m: "tempMax" }, { m: "tempMin" }],
    evaluate: (ev) => {
      const { m, o } = ev;
      const f = finding();
      const enable = textOf(o, "chargeEnable");
      if (enable === "Disabled") strong(f, "BMS has disabled charging");
      else if (enable === "Enabled") f.conflicting.push("Charge enabled");
      if (textOf(o, "bmsStatus") === "Protection") f.supporting.push("BMS in protection");
      const max = numberOf(m, "cellMax");
      if (max !== null && positive(ev.config.cellMaxV) && max >= ev.config.cellMaxV) strong(f, `Highest group ${V(max, 3)} at or above the confirmed cell maximum ${V(ev.config.cellMaxV, 3)}`);
      return f;
    },
    next: "Find the condition behind the protection (over-voltage, temperature, imbalance). Never bypass BMS protection.",
    decide: () => ({ status: "BMS_SERVICE", depth: "expert", verify: ["Protection cause found and resolved", "Charge enable restored without bypass", "Fault rescan"] }),
  },
  {
    id: "temperature-protection",
    name: "Temperature protection",
    complaints: [...CHARGING, "overheating", "no-start"],
    required: [{ m: "tempMin" }, { m: "tempMax" }, { any: [{ o: "chargeEnable" }, { o: "dischargeEnable" }], label: "Charge or discharge enable state" }],
    helpful: [{ m: "ambientTemp" }],
    evaluate: ({ m, o }) => {
      const f = finding();
      const min = numberOf(m, "tempMin");
      const max = numberOf(m, "tempMax");
      const blocked = textOf(o, "chargeEnable") === "Disabled" || textOf(o, "dischargeEnable") === "Disabled";
      if (max !== null && max >= 45 && blocked) strong(f, `Pack at ${C(max)} with a path blocked (reference charging upper limit 45 °C)`);
      if (min !== null && min <= 0 && blocked) strong(f, `Pack at ${C(min)} with a path blocked (reference charging lower limit 0 °C)`);
      if (min !== null && max !== null && min > 10 && max < 40) f.conflicting.push("Temperatures inside a normal window");
      if (!blocked && textOf(o, "chargeEnable") === "Enabled") f.conflicting.push("Charge enabled");
      return f;
    },
    next: "Bring the pack to a normal temperature, re-test, and find any heat source.",
    decide: () => ({ status: "SERVICEABLE", depth: "basic", verify: ["Re-test inside the operating temperature window", "Charge and discharge enable restored"] }),
  },
  {
    id: "deep-discharge",
    name: "Deep discharge",
    complaints: ["storage", ...NO_POWER, "not-charging"],
    required: [{ m: "packVoltage" }, { o: "commStatus" }, { o: "chargeResponse" }],
    helpful: [{ m: "cellMin" }, { m: "chargerVoltage" }, { o: "storageHistory" }, { config: true }],
    evaluate: (ev) => {
      const { m, o, expect } = ev;
      const f = finding();
      const storage = textOf(o, "storageHistory");
      if (storage === "Stored over 3 months" || storage === "Stored 1–3 months") f.supporting.push(`Storage: ${storage}`);
      const min = numberOf(m, "cellMin");
      if (min !== null && positive(ev.config.cellMinV) && min < ev.config.cellMinV) strong(f, `Lowest group ${V(min, 3)} below the confirmed cell minimum ${V(ev.config.cellMinV, 3)}`);
      else if (min !== null && min < 2.5) strong(f, `Lowest group ${V(min, 3)} (reference < 2.5 V)`);
      else if (min !== null && min < 3.0) f.supporting.push(`Lowest group ${V(min, 3)}`);
      else if (min !== null && min >= 3.2) f.conflicting.push(`Lowest group ${V(min, 3)}`);
      const pack = numberOf(m, "packVoltage");
      if (pack !== null && expect.lower !== null && pack < expect.lower) strong(f, `Pack ${V(pack)} below the calculated lower limit ${V(expect.lower)} (${CALCULATED_FROM_CONFIG})`);
      if (pack !== null && expect.nominal !== null && pack >= expect.nominal) f.conflicting.push(`Pack ${V(pack)} at or above the calculated nominal ${V(expect.nominal)}`);
      if (textOf(o, "chargeResponse") === "No response") f.supporting.push("No charge response");
      if (textOf(o, "commStatus") === "Offline") f.supporting.push("BMS not communicating (may be asleep or locked out)");
      return f;
    },
    next: "Record every group voltage if it can be read safely. Do not attempt blind recovery charging.",
    decide: ({ m }) => {
      const min = numberOf(m, "cellMin");
      if (min === null) return { status: "SPECIALIST_EVALUATION_REQUIRED", depth: null, verify: ["Specialist evaluation of pack and cell condition", "No blind recovery charging"] };
      if (min < 2.0) return { status: "UNSAFE_QUARANTINE", depth: null, verify: ["Do not charge", "Escalate for specialist assessment"] };
      return { status: "SPECIALIST_EVALUATION_REQUIRED", depth: "advanced", verify: ["Specialist recovery assessment before any charge", "Capacity test", "Self-discharge check after rest"] };
    },
  },
  {
    id: "pack-internal",
    name: "Pack internal fault",
    complaints: [...NO_POWER, "intermittent-output"],
    required: [{ m: "packVoltage" }, { o: "dischargeResponse" }, { o: "fuseStatus" }],
    helpful: [{ o: "dischargeEnable" }, { o: "bmsStatus" }],
    evaluate: ({ m, o }) => {
      const f = finding();
      const out = textOf(o, "dischargeResponse");
      const fuse = textOf(o, "fuseStatus");
      const enabled = textOf(o, "dischargeEnable") === "Enabled";
      if (out === "No output" && fuse === "Intact" && enabled) strong(f, "No output with the fuse intact and discharge enabled");
      else if (out === "No output" && fuse === "Intact") f.supporting.push("No output with the fuse intact");
      const pack = numberOf(m, "packVoltage");
      if (pack !== null && pack < 1 && fuse === "Intact") f.supporting.push(`No voltage at the pack output (${V(pack)}) with the fuse intact`);
      if (out === "Normal output") f.conflicting.push("Normal output");
      if (fuse === "Open") f.conflicting.push("Fuse open — see open fuse");
      return f;
    },
    next: "Specialist inspection of the main current path inside the pack, after isolation.",
    decide: () => ({ status: "MODULE_REPAIR", depth: "advanced", verify: ["Internal current path verified", "Load test", "Fault rescan"] }),
  },
  {
    id: "fuse",
    name: "Open fuse / main current path",
    complaints: NO_POWER,
    required: [{ m: "packVoltage" }, { o: "fuseStatus" }],
    helpful: [{ m: "cellMin" }, { o: "currentProtection" }],
    evaluate: ({ m, o }) => {
      const f = finding();
      const fuse = textOf(o, "fuseStatus");
      if (fuse === "Open") strong(f, "Fuse open");
      else if (fuse === "Intact") f.conflicting.push("Fuse intact");
      const pack = numberOf(m, "packVoltage");
      if (pack !== null && pack < 1) f.supporting.push(`No voltage at the pack output (${V(pack)})`);
      return f;
    },
    next: "With the pack isolated, check fuse continuity; then find what made it open.",
    decide: () => ({ status: "CONNECTOR_WIRING_SERVICE", depth: "expert", verify: ["Cause of the fuse opening found and fixed", "Correct fuse rating fitted", "Insulation check", "Load test"] }),
  },
  {
    id: "ageing",
    name: "Battery ageing / low usable capacity",
    complaints: [...RANGE, "soc-drop"],
    required: [{ m: "soh" }, { o: "capacityTest" }],
    helpful: [{ m: "cellMin" }, { m: "cellMax" }],
    evaluate: ({ m, o }) => {
      const f = finding();
      const soh = numberOf(m, "soh");
      if (soh !== null && soh < 70) strong(f, `SOH ${formatNumber(soh, "%")} (reference: service < 70 %)`);
      else if (soh !== null && soh < 80) f.supporting.push(`SOH ${formatNumber(soh, "%")}`);
      else if (soh !== null && soh >= 90) f.conflicting.push(`SOH ${formatNumber(soh, "%")}`);
      const cap = textOf(o, "capacityTest");
      if (cap === "Severely low") strong(f, "Capacity test severely low");
      else if (cap === "Below expectation") f.supporting.push("Capacity test below expectation");
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
    id: "soc-estimation",
    name: "SOC estimation error",
    complaints: ["soc-drop", ...RANGE],
    required: [{ m: "soc" }, { m: "packVoltage" }, { config: true }],
    helpful: [{ m: "packCurrent" }],
    evaluate: ({ m, expect }) => {
      const f = finding();
      const soc = numberOf(m, "soc");
      const pack = numberOf(m, "packVoltage");
      if (soc !== null && pack !== null && expect.nominal !== null) {
        if (soc >= 50 && pack < expect.nominal) strong(f, `SOC ${formatNumber(soc, "%")} but pack ${V(pack)} below the calculated nominal ${V(expect.nominal)}`);
        else if (soc <= 30 && pack > expect.nominal * 1.05) strong(f, `SOC ${formatNumber(soc, "%")} but pack ${V(pack)} well above the calculated nominal ${V(expect.nominal)}`);
        else f.conflicting.push("Pack voltage consistent with SOC");
      }
      const current = numberOf(m, "packCurrent");
      if (current !== null && Math.abs(current) > 1) f.supporting.push(`Pack current ${formatNumber(current, "A", 1)} reported — check it is at rest (current-sensor offset)`);
      return f;
    },
    next: "Full charge and rest, then compare BMS SOC with the confirmed configuration; check current offset at rest.",
    decide: () => ({ status: "BMS_SERVICE", depth: "expert", verify: ["SOC re-calibrated after a full charge", "Current offset at rest checked against a clamp meter"] }),
  },
  {
    id: "overcurrent",
    name: "BMS overcurrent protection / current sensor",
    complaints: SHUTDOWN,
    required: [{ o: "currentProtection" }, { any: [{ o: "bmsFaultCodes" }, { o: "bmsStatus" }], label: "BMS status or fault codes" }],
    helpful: [{ m: "packCurrent" }, { o: "loadBehaviour" }],
    evaluate: ({ o }) => {
      const f = finding();
      const event = textOf(o, "currentProtection");
      if (event === "Overcurrent event recorded") strong(f, "Overcurrent event recorded by the BMS");
      else if (event === "No event recorded") f.conflicting.push("No current-protection event");
      const codes = textOf(o, "bmsFaultCodes");
      if (!isNone(codes)) f.supporting.push(`Fault codes: ${codes}`);
      if (textOf(o, "loadBehaviour") === "Shuts down under load") f.supporting.push("Shutdown under load");
      return f;
    },
    next: "Compare BMS current with a clamp meter under load; check the controller's current limit. Never raise protection limits.",
    decide: () => ({ status: "BMS_SERVICE", depth: "expert", verify: ["Current sensor checked against a clamp meter", "Load test without protection event"] }),
  },
  {
    id: "thermal",
    name: "Thermal issue / overheating",
    complaints: ["overheating", "connector-heating", ...CHARGING],
    required: [{ m: "tempMax" }, { m: "ambientTemp" }, { o: "hotspotLocation" }],
    helpful: [{ m: "tempMin" }, { m: "tempSensorCount" }, { o: "abnormalHeat" }],
    evaluate: ({ m, o, spread }) => {
      const f = finding();
      const max = numberOf(m, "tempMax");
      const amb = numberOf(m, "ambientTemp");
      if (max !== null && max >= 55) strong(f, `Maximum temperature ${C(max)} (reference: service ≥ 55 °C)`);
      else if (max !== null && max >= 45) f.supporting.push(`Maximum temperature ${C(max)}`);
      else if (max !== null && max < 40) f.conflicting.push(`Maximum temperature ${C(max)}`);
      if (max !== null && amb !== null && max - amb >= 20) f.supporting.push(`${C(max - amb)} above ambient`);
      if (max !== null && amb !== null && amb >= 40 && max - amb < 10) f.conflicting.push(`Ambient ${C(amb)} explains most of the heat (external heat source)`);
      if (spread !== null && spread >= 10) f.supporting.push(`Spread ${C(spread)}`);
      const hot = textOf(o, "hotspotLocation");
      if (hot && hot !== "None found") f.supporting.push(`Hot spot: ${hot}`);
      const sensors = numberOf(m, "tempSensorCount");
      if (sensors !== null && sensors <= 2) f.supporting.push(`Only ${sensors} temperature sensor${sensors === 1 ? "" : "s"}: a local hot spot can be missed`);
      return f;
    },
    next: "Thermal camera after a controlled load; check connections, weak groups, charging, current and the thermal path; rule out an external heat source.",
    decide: ({ o }) =>
      textOf(o, "hotspotLocation") === "Connector"
        ? { status: "CONNECTOR_WIRING_SERVICE", depth: "expert", verify: ["Connector temperature after load", "Temperature spread"] }
        : { status: "MODULE_REPAIR", depth: "advanced", verify: ["Temperature spread after load", "Thermal-interface contact", "Fault rescan"] },
  },
  {
    id: "temp-sensor",
    name: "Temperature sensor fault",
    complaints: [...CHARGING, "overheating", "no-start"],
    required: [{ m: "tempMin" }, { m: "tempMax" }, { m: "ambientTemp" }],
    helpful: [{ o: "hotspotLocation" }, { m: "tempSensorCount" }],
    evaluate: ({ m, o }) => {
      const f = finding();
      const min = numberOf(m, "tempMin");
      const max = numberOf(m, "tempMax");
      const amb = numberOf(m, "ambientTemp");
      if (min !== null && min <= -30) strong(f, `Minimum temperature ${C(min)} is implausible${amb !== null ? ` at ${C(amb)} ambient` : ""}`);
      if (max !== null && max >= 100 && textOf(o, "hotspotLocation") === "None found") strong(f, `Maximum ${C(max)} with no hot spot on the thermal camera`);
      if (min !== null && max !== null && min > -10 && max < 70) f.conflicting.push("All temperatures plausible");
      return f;
    },
    next: "Compare each BMS temperature channel with a thermal camera reading at the same point.",
    decide: () => ({ status: "BMS_SERVICE", depth: "expert", verify: ["Every channel plausible against ambient", "Charge enable restored"] }),
  },
  {
    id: "water",
    name: "Water ingress / corrosion",
    complaints: ["after-rain", "intermittent-output", "bms-comm"],
    required: [{ o: "waterIngress" }, { o: "corrosion" }],
    helpful: [{ m: "insulationResistance" }, { o: "connectorCondition" }],
    evaluate: ({ m, o }) => {
      const f = finding();
      const water = textOf(o, "waterIngress");
      if (water && water !== "None") strong(f, `Water: ${water}`);
      else if (water === "None") f.conflicting.push("No water evidence");
      const corr = textOf(o, "corrosion");
      if (corr && corr !== "None") f.supporting.push(`Corrosion: ${corr}`);
      else if (corr === "None") f.conflicting.push("No corrosion");
      const iso = numberOf(m, "insulationResistance");
      if (iso !== null && iso < 1) strong(f, `Insulation resistance ${formatNumber(iso, "MΩ", 1)} (below the 1 MΩ reference)`);
      return f;
    },
    next: "Insulation resistance test with suitable equipment; inspect seals and connectors.",
    decide: ({ o }) => {
      if (textOf(o, "waterIngress") === "Water inside / flood exposure" || textOf(o, "corrosion") === "Severe") return { status: "UNSAFE_QUARANTINE", depth: null, verify: ["Escalate to the manufacturer or a specialist facility"] };
      const connector = textOf(o, "connectorCondition");
      return connector && connector !== "Good"
        ? { status: "CONNECTOR_WIRING_SERVICE", depth: "expert", verify: ["Connector replacement verified", "Insulation resistance", "Fault rescan"] }
        : { status: "COMPONENT_REPAIR", depth: "expert", verify: ["Seal replacement verified", "Insulation resistance", "Fault rescan"] };
    },
  },
];

export const CANDIDATE_IDS = HYPOTHESES.map((h) => h.id);

const CONFIDENCE_RANK: Record<Confidence, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };

/**
 * HIGH: gate met, at least one strong item among two or more supporting ones,
 * and conflicts outnumbered — e.g. a sharp loaded-voltage drop, the lowest
 * group identified and a rising delta outweigh "no abnormal temperature".
 * MEDIUM: gate met and the evidence outweighs any conflict. Otherwise LOW.
 */
function confidenceOf(f: Finding, gate: boolean): Confidence {
  if (!gate) return "LOW";
  const score = f.supporting.length + f.strong - f.conflicting.length;
  if (f.strong >= 1 && f.supporting.length >= 2 && f.conflicting.length <= Math.max(0, f.supporting.length - 2)) return "HIGH";
  if (score >= 2 && (f.supporting.length >= 2 || f.strong >= 1)) return "MEDIUM";
  return "LOW";
}

function evidenceOf(input: Pick<JobCard, "before" | "observations" | "complaintCategory"> & Partial<Pick<JobCard, "cellConfig">>, context: EvaluationContext): Evidence {
  const job = forContext(input, context);
  const config = input.cellConfig ?? EMPTY_CELL_CONFIG;
  return { m: job.before, o: job.observations, complaint: input.complaintCategory, delta: deltaOf(job.before).value, spread: spreadOf(job.before), expect: packExpectations(config), config };
}

export const INSUFFICIENT = "INSUFFICIENT EVIDENCE — PERFORM NEXT TEST";

type CandidateInput = Pick<JobCard, "before" | "observations" | "complaintCategory"> & Partial<Pick<JobCard, "cellConfig">>;

/** Every candidate the complaint or the evidence points at, strongest first. */
export function rootCauseCandidates(job: CandidateInput, context: EvaluationContext = "real"): RootCauseCandidate[] {
  const ev = evidenceOf(job, context);
  const out: (RootCauseCandidate & { score: number })[] = [];
  for (const h of HYPOTHESES) {
    const f = h.evaluate(ev);
    const suggested = h.complaints.includes(ev.complaint);
    if (!suggested && f.supporting.length === 0) continue;
    const missingRequired = h.required.filter((r) => !hasRef(ev, r)).map(labelOf);
    const missingHelpful = h.helpful.filter((r) => !hasRef(ev, r)).map((r) => `${labelOf(r)} not recorded`);
    const gate = missingRequired.length === 0;
    const confidence = confidenceOf(f, gate);
    out.push({
      id: h.id,
      name: h.name,
      supporting: f.supporting,
      conflicting: f.conflicting,
      missing: [...missingRequired.map((l) => `${l} — required`), ...missingHelpful],
      nextMeasurement: gate ? h.next : `Record ${missingRequired[0]}. ${h.next}`,
      confidence,
      gate: gate ? "MET" : "INSUFFICIENT",
      // Strong evidence weighs double in the ranking.
      score: (gate ? 100 : 0) + CONFIDENCE_RANK[confidence] * 10 + f.supporting.length + 2 * f.strong - f.conflicting.length,
    });
  }
  return out.sort((a, b) => b.score - a.score).map((c) => {
    const { score, ...candidate } = c;
    void score;
    return candidate;
  });
}

// ── Safety ──

/** Reference level at which a recorded temperature is treated as severe overheating (a stop condition). */
export const SEVERE_OVERHEAT_C = 60;

/** Recorded observations and measurements that are safety conditions in their own right. */
export function safetyObservations(o: Observations, m: Measurements = {}): string[] {
  const out: string[] = [];
  const tMax = numberOf(m, "tempMax");
  if (tMax !== null && tMax >= SEVERE_OVERHEAT_C) out.push(`Severe overheating: ${formatNumber(tMax, "°C", 1)} recorded (reference stop level ${SEVERE_OVERHEAT_C} °C)`);
  const swelling = textOf(o, "swelling");
  if (swelling && swelling !== "None") out.push(`Swelling: ${swelling}`);
  const smell = textOf(o, "abnormalSmell");
  if (smell === "Burning smell" || smell === "Strong chemical smell") out.push(smell);
  if (textOf(o, "abnormalHeat") === "Smoke") out.push("Smoke");
  if (textOf(o, "enclosureDamage") === "Crack / breach") out.push("Enclosure breach");
  if (textOf(o, "waterIngress") === "Water inside / flood exposure") out.push("Water inside / flood exposure");
  return out;
}

// ── Repair decision ──

export const REPAIR_STATUS_LABEL: Record<RepairStatus, string> = {
  NO_REPAIR_REQUIRED: "NO REPAIR REQUIRED",
  SERVICEABLE: "SERVICEABLE",
  CONNECTOR_WIRING_SERVICE: "CONNECTOR / WIRING SERVICE",
  COMPONENT_REPAIR: "COMPONENT REPAIR",
  BMS_SERVICE: "BMS SERVICE",
  MODULE_REPAIR: "MODULE REPAIR",
  ADVANCED_CELL_REPAIR: "ADVANCED CELL REPAIR",
  PACK_REPLACEMENT_RECOMMENDED: "PACK REPLACEMENT RECOMMENDED",
  UNSAFE_QUARANTINE: "UNSAFE — QUARANTINE / ESCALATE",
  SPECIALIST_EVALUATION_REQUIRED: "SPECIALIST EVALUATION REQUIRED",
  INSUFFICIENT_EVIDENCE: INSUFFICIENT,
};

export const REPAIR_RISK: Record<RepairStatus, string> = {
  NO_REPAIR_REQUIRED: "Low — the complaint may recur; re-test if it does.",
  SERVICEABLE: "Low to moderate — the recorded evidence shows no fault in the battery itself.",
  CONNECTOR_WIRING_SERVICE: "Moderate — high-resistance joints heat up and can damage connectors and the pack.",
  COMPONENT_REPAIR: "Moderate — work near live high-voltage parts.",
  BMS_SERVICE: "Moderate — never bypass or disable BMS protection.",
  MODULE_REPAIR: "High — internal pack work on a high-voltage lithium battery.",
  ADVANCED_CELL_REPAIR: "High — cell-level work needs matched cells, isolation and lithium-battery training.",
  PACK_REPLACEMENT_RECOMMENDED: "Moderate — usable capacity is low; replacement must follow manufacturer guidance.",
  UNSAFE_QUARANTINE: "Critical — fire and toxic-gas risk.",
  SPECIALIST_EVALUATION_REQUIRED: "High — a deeply discharged lithium pack can be unsafe to charge; no blind recovery charging.",
  INSUFFICIENT_EVIDENCE: "Unknown — the evidence does not yet support any repair.",
};

/** Statuses whose repair concepts sit behind the advanced-repair acknowledgement. */
export const ADVANCED_STATUSES: ReadonlySet<RepairStatus> = new Set<RepairStatus>(["MODULE_REPAIR", "ADVANCED_CELL_REPAIR"]);

const CORE_SET: FieldRef[] = [{ m: "packVoltage" }, { m: "cellMin" }, { m: "cellMax" }, { m: "tempMax" }, { o: "bmsStatus" }];

const decision = (d: Omit<RepairDecision, "technicianSelected" | "candidateId"> & Partial<Pick<RepairDecision, "technicianSelected" | "candidateId">>): RepairDecision => ({
  technicianSelected: false,
  candidateId: null,
  ...d,
});

export function repairDecision(job: JobCard, candidates?: RootCauseCandidate[], context: EvaluationContext = "real"): RepairDecision {
  const ev = evidenceOf(job, context);
  candidates ??= rootCauseCandidates(job, context);
  const hazards = [...job.safetyFlags, ...safetyObservations(ev.o, ev.m)];
  if (hazards.length > 0) {
    return decision({
      status: "UNSAFE_QUARANTINE",
      reason: "A safety condition is present. Stop diagnosis, do not charge, do not continue disassembly; isolate from combustible materials, quarantine and escalate.",
      evidence: hazards,
      missingEvidence: [],
      risk: REPAIR_RISK.UNSAFE_QUARANTINE,
      nextAction: "Follow the approved battery safety procedure: isolate, quarantine and escalate.",
      repairDepth: null,
      verificationRequired: ["Quarantine location recorded", "Escalation to the manufacturer or a specialist facility"],
    });
  }

  const chosenId = job.selectedRootCause;
  const chosen = chosenId ? candidates.find((c) => c.id === chosenId) : undefined;
  if (chosen && (chosen.gate !== "MET" || chosen.confidence === "LOW")) {
    return decision({
      status: "INSUFFICIENT_EVIDENCE",
      reason: `${INSUFFICIENT}. The selected root cause (${chosen.name}) ${chosen.gate !== "MET" ? "does not meet its evidence gate" : "has LOW confidence"}.`,
      evidence: chosen.supporting,
      missingEvidence: chosen.missing,
      risk: REPAIR_RISK.INSUFFICIENT_EVIDENCE,
      nextAction: chosen.nextMeasurement,
      repairDepth: null,
      verificationRequired: chosen.missing.filter((x) => x.endsWith("required")).map((x) => `Record ${x.replace(/ — required$/, "")}`),
      candidateId: chosen.id,
      technicianSelected: true,
    });
  }

  const best = chosen ?? candidates.find((c) => c.gate === "MET" && c.confidence !== "LOW");
  if (best) {
    const h = HYPOTHESES.find((x) => x.id === best.id)!;
    const d = h.decide(ev);
    return decision({
      status: d.status,
      reason: `${best.name} — ${best.confidence} confidence, evidence gate met${chosen ? ", selected by the technician" : ""}.`,
      evidence: best.supporting,
      missingEvidence: best.missing,
      risk: REPAIR_RISK[d.status],
      nextAction: best.missing.length ? best.nextMeasurement : "Proceed at the stated repair depth, then verify.",
      repairDepth: d.depth,
      verificationRequired: d.verify,
      candidateId: best.id,
      technicianSelected: Boolean(chosen),
    });
  }

  const coreMissing = CORE_SET.filter((r) => !hasRef(ev, r)).map(labelOf);
  const anySupport = candidates.some((c) => c.supporting.length > 0);
  if (coreMissing.length === 0 && !anySupport) {
    return decision({
      status: "NO_REPAIR_REQUIRED",
      reason: "Core measurements are recorded and none points at a fault.",
      evidence: CORE_SET.map((r) => `${labelOf(r)} recorded`),
      missingEvidence: [],
      risk: REPAIR_RISK.NO_REPAIR_REQUIRED,
      nextAction: "Explain the findings to the customer.",
      repairDepth: null,
      verificationRequired: ["Explain the findings to the customer", "Re-test if the complaint returns"],
    });
  }
  const nextTest = candidates[0]?.nextMeasurement ?? `Record ${coreMissing[0] ?? "the core measurements"}.`;
  return decision({
    status: "INSUFFICIENT_EVIDENCE",
    reason: `${INSUFFICIENT}. ${nextTest}`,
    evidence: candidates.flatMap((c) => c.supporting).slice(0, 6),
    missingEvidence: [...new Set([...coreMissing.map((l) => `${l} — core`), ...(candidates[0]?.missing ?? [])])],
    risk: REPAIR_RISK.INSUFFICIENT_EVIDENCE,
    nextAction: nextTest,
    repairDepth: null,
    verificationRequired: coreMissing.map((l) => `Record ${l}`),
  });
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
export function verifyRepair(input: JobCard): VerificationResult {
  const job = forContext(input, "real");
  const reasons: string[] = [];
  const hazards = [...job.safetyFlags, ...safetyObservations(job.afterObservations, job.after)];
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

/** Display words for each trend; "not-comparable" means at least one side was not measured. */
export const TREND_LABEL: Record<Trend, string> = { improved: "Improved", unchanged: "Unchanged", worsened: "Worsened", changed: "Changed", "not-comparable": "Not measured" };

const BMS_RANK: Record<string, number> = { Normal: 0, Warning: 1, Protection: 2, "Offline / no data": 3 };

function numericTrend(before: number | null, after: number | null, better: "lower" | "higher" | "none", tolerance: number): Trend {
  if (before === null || after === null) return "not-comparable";
  const d = after - before;
  if (Math.abs(d) <= tolerance) return "unchanged";
  if (better === "none") return "changed";
  return (better === "lower" ? d < 0 : d > 0) ? "improved" : "worsened";
}

export function compareBeforeAfter(input: JobCard): ComparisonRow[] {
  const job = forContext(input, "real");
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
  obs("bmsFaultCodes", (v) => (isNone(v) ? 0 : v.split(/[,;\s]+/).filter(Boolean).length));
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
    cellConfig: { ...EMPTY_CELL_CONFIG },
    selectedRootCause: null,
    advancedAck: [],
  };
}
