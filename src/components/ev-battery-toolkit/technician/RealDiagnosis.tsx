"use client";
// Real Vehicle Diagnosis — the primary technician workflow. Thirteen stages
// from the customer complaint to the report. Nothing is pre-filled: an empty
// field is NOT MEASURED, a safety screen comes before everything else, and a
// repair is recommended only when the evidence gate is met.
//
// Everything typed here stays in this browser tab. Analytics receive only event
// names and fixed ids (stage, field or candidate ids) through `track`; no value
// a technician types or measures is ever passed to it.
import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lock, RotateCcw, Upload } from "lucide-react";
import { AFTER_MEASUREMENTS, AFTER_OBSERVATIONS, COMPLAINTS, MEASUREMENTS, REAL_STAGES, SAFETY_HAZARDS, STAGE_FIELDS, VERIFICATION_CHECKS } from "@/data/ev-battery-toolkit/fields";
import { ARCHITECTURES } from "@/data/ev-battery-toolkit/architectures";
import { VEHICLES, vehicleLabel } from "@/data/ev-battery-toolkit/vehicles";
import { toId, trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import { canMergeIntoRealJob, parseDiagnosticFile } from "@/lib/ev-battery-toolkit/dataSources";
import {
  INSUFFICIENT,
  REFERENCE_LOGIC_NOTICE,
  REPAIR_STATUS_LABEL,
  TREND_LABEL,
  VERIFICATION_LABEL,
  compareBeforeAfter,
  deltaOf,
  newJobCard,
  repairDecision,
  rootCauseCandidates,
  verifyRepair,
} from "@/lib/ev-battery-toolkit/diagnosis";
import { formatNumber } from "@/lib/ev-battery-toolkit/provenance";
import { buildRealReport } from "@/lib/ev-battery-toolkit/report";
import type { CheckResult, DiagnosticMeasurement, DiagnosticObservation, JobCard, MeasurementKey, ObservationKey, Report } from "@/lib/ev-battery-toolkit/types";
import { ContextBanner, Pill, SAFETY_STOP_ACTIONS, SafetyBanner } from "../ui/Badges";
import { ReportDialog, printReport } from "../report/ReportDocument";
import { MeasurementInput, ObservationInput } from "./FieldInputs";
import { AnalysisStage, CellsStage, DecisionStage, FlowPanel, IdentifyStage, RepairStage } from "./stages";
import css from "../diagnosis.module.css";

const TREND_FAMILY = { improved: "ok", unchanged: "neutral", worsened: "critical", changed: "info", "not-comparable": "neutral" } as const;
const OUTCOME_FAMILY = { PASS: "ok", CONDITIONAL_PASS: "warning", FURTHER_DIAGNOSIS_REQUIRED: "service", UNSAFE_DO_NOT_RETURN: "critical" } as const;

export type RealEvent =
  | "started"
  | "safety_completed"
  | "measurement_entered"
  | "bms_entered"
  | "candidate_opened"
  | "gate_failed"
  | "root_cause_selected"
  | "decision_completed"
  | "repair_started"
  | "repair_completed"
  | "report_preview"
  | "report_generated";

/** Receives an event and, at most, a fixed id (never a typed or measured value). */
export type RealTracker = (event: RealEvent, id?: string) => void;

/** The main toolkit's mapping onto its declared events. */
export const toolkitTracker: RealTracker = (event, id) => {
  switch (event) {
    case "started":
      return trackToolkit("diagnosis_started", { context: "real" });
    case "decision_completed":
      return trackToolkit("diagnosis_completed", { context: "real", status: toId(id ?? "") });
    case "repair_started":
      return trackToolkit("repair_workflow_started");
    case "repair_completed":
      return trackToolkit("repair_workflow_completed", { outcome: toId(id ?? "") });
    case "report_preview":
      return trackToolkit("report_preview_opened", { context: "real" });
    case "report_generated":
      return trackToolkit("report_generated", { context: "real" });
  }
};

const RECORDED = new Set(["MEASURED", "USER_ENTERED", "MANUFACTURER_VERIFIED", "THIRD_PARTY_DOCUMENTED"]);
const BMS_FIELDS = new Set<string>([...STAGE_FIELDS.bms.measurements, ...STAGE_FIELDS.bms.observations]);

export default function RealDiagnosis({ lockManufacturer, presetVehicleId, track = toolkitTracker, intro }: { lockManufacturer?: string; presetVehicleId?: string | null; track?: RealTracker; intro?: React.ReactNode }) {
  const [job, setJob] = useState<JobCard | null>(null);
  const [stage, setStage] = useState(0);
  const [screened, setScreened] = useState(false);
  const [importNote, setImportNote] = useState<string | null>(null);
  const [groupText, setGroupText] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const tracked = useRef({ decision: "", repairStarted: false, completed: "", fields: new Set<string>() });

  const candidates = useMemo(() => (job ? rootCauseCandidates(job) : []), [job]);
  const decision = useMemo(() => (job ? repairDecision(job, candidates) : null), [job, candidates]);
  const verification = useMemo(() => (job ? verifyRepair(job) : null), [job]);
  const closeReport = useCallback(() => setReport(null), []);

  if (!job) {
    return (
      <div className={css.real}>
        <ContextBanner context="real" detail="Structure and document the diagnosis of a physical scooter." />
        <div className={css.intro}>
          <ol className={css.stageOverview} aria-label="Real vehicle diagnosis stages">
            {REAL_STAGES.map((s, i) => (
              <li key={s.id}>
                <span className={css.stageNum}>{i + 1}</span>
                <span>
                  <strong>{s.title}</strong> {s.purpose}
                </span>
              </li>
            ))}
          </ol>
          <div className={css.introSide}>
            {intro}
            <p>Nothing is pre-filled. Every field starts as NOT MEASURED until you record it, and each value keeps its origin: MEASURED, USER ENTERED, NOT MEASURED, NOT AVAILABLE or UNKNOWN — and, for rated values, MANUFACTURER VERIFIED or THIRD-PARTY DOCUMENTED.</p>
            <p>No customer personal details are needed. Everything you enter stays in this browser tab.</p>
            <p className={css.referenceNotice}>{REFERENCE_LOGIC_NOTICE}</p>
            <button
              type="button"
              className={css.primary}
              onClick={() => {
                const fresh = newJobCard(new Date());
                const preset = presetVehicleId ? VEHICLES.find((v) => v.id === presetVehicleId) : undefined;
                if (preset) {
                  fresh.vehicleId = preset.id;
                  fresh.variantId = preset.variants.length === 1 ? preset.variants[0].id : null;
                }
                setJob(fresh);
                setStage(0);
                setScreened(false);
                tracked.current = { decision: "", repairStarted: false, completed: "", fields: new Set() };
                track("started");
              }}
            >
              Start real vehicle diagnosis
            </button>
          </div>
        </div>
      </div>
    );
  }

  const unlocked = screened || job.safetyAcknowledged;
  const hazards = job.safetyFlags;
  const update = (patch: Partial<JobCard>) => setJob((j) => (j ? { ...j, ...patch } : j));
  /** Reports a field the first time it holds a recorded value: its id only, never the value. */
  const noteField = (key: string, recorded: boolean) => {
    if (!recorded || tracked.current.fields.has(key)) return;
    tracked.current.fields.add(key);
    track(BMS_FIELDS.has(key) ? "bms_entered" : "measurement_entered", toId(key));
  };
  const setBefore = (m: DiagnosticMeasurement) => {
    noteField(m.key, m.value !== null && RECORDED.has(m.provenance));
    setJob((j) => (j ? { ...j, before: { ...j.before, [m.key]: m } } : j));
  };
  const setObs = (o: DiagnosticObservation) => {
    noteField(o.key, Boolean(o.value) && RECORDED.has(o.provenance));
    setJob((j) => (j ? { ...j, observations: { ...j.observations, [o.key]: o } } : j));
  };
  const setAfter = (m: DiagnosticMeasurement) => setJob((j) => (j ? { ...j, after: { ...j.after, [m.key]: m } } : j));
  const setAfterObs = (o: DiagnosticObservation) => setJob((j) => (j ? { ...j, afterObservations: { ...j.afterObservations, [o.key]: o } } : j));
  const current = REAL_STAGES[stage];
  const locked = (i: number) => i >= 2 && !unlocked;

  /** `unlockedNow` covers the click that completes the safety screen, before its state update lands. */
  const go = (i: number, unlockedNow = false) => {
    if (locked(i) && !unlockedNow) return;
    setStage(i);
    const id = REAL_STAGES[i].id;
    if (id === "decision" && decision) {
      if (decision.status === "INSUFFICIENT_EVIDENCE") track("gate_failed", decision.candidateId ?? "none");
      else if (tracked.current.decision !== decision.status) {
        tracked.current.decision = decision.status;
        track("decision_completed", decision.status);
      }
    }
    if (id === "repair" && !tracked.current.repairStarted) {
      tracked.current.repairStarted = true;
      track("repair_started");
    }
  };

  const vehicle = VEHICLES.find((v) => v.id === job.vehicleId);

  const onImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = parseDiagnosticFile(text, file.name);
      if (!canMergeIntoRealJob(data)) {
        setImportNote("This file is simulation data and cannot enter a real diagnosis.");
        return;
      }
      for (const key of [...Object.keys(data.measurements), ...Object.keys(data.observations)]) noteField(key, true);
      setJob((j) => (j ? { ...j, before: { ...j.before, ...data.measurements }, observations: { ...j.observations, ...data.observations }, groupVoltages: data.groupVoltages.length ? data.groupVoltages : j.groupVoltages } : j));
      const n = Object.keys(data.measurements).length + Object.keys(data.observations).length;
      setImportNote(`${n} field${n === 1 ? "" : "s"} imported as MEASURED${data.groupVoltages.length ? `, ${data.groupVoltages.length} group voltages` : ""}.${data.ignored.length ? ` Not recognised: ${data.ignored.slice(0, 6).join(", ")}.` : ""}`);
    } catch (e) {
      setImportNote(e instanceof Error ? e.message : "The file could not be read.");
    }
  };

  const genericStage = ["visual", "electrical", "bms", "thermal"].includes(current.id) ? STAGE_FIELDS[current.id] : null;

  return (
    <div className={css.real}>
      <ContextBanner context="real" detail={`Job ${job.jobId} · ${job.date}`} />
      {hazards.length > 0 ? (
        <SafetyBanner level="stop" title="SAFETY CONDITION RECORDED">
          <p className={css.safetyText}>
            {hazards.join(" · ")}. {job.safetyAcknowledged ? "Acknowledged: documentation only — quarantine and escalate." : "Acknowledge the safety state in the Safety Screen before continuing."}
          </p>
        </SafetyBanner>
      ) : null}
      <div className={css.workflow}>
        <div className={css.sideColumn}>
          <nav className={css.stageNav} aria-label="Diagnosis stages">
            <ol>
              {REAL_STAGES.map((s, i) => (
                <li key={s.id}>
                  <button type="button" className={css.stageButton} aria-current={i === stage ? "step" : undefined} disabled={locked(i)} onClick={() => go(i)}>
                    <span className={css.stageNum}>{locked(i) ? <Lock size={12} aria-label="Locked until the safety screen is complete" /> : i < stage ? <Check size={12} aria-hidden="true" /> : i + 1}</span>
                    {s.title}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <FlowPanel job={job} screened={screened} />
        </div>

        <div className={css.stagePanel}>
          <p className={css.stageEyebrow}>
            Stage {stage + 1} of {REAL_STAGES.length}
          </p>
          <h3 className={css.stageTitle}>{current.title}</h3>
          <p className={css.stagePurpose}>{current.purpose}</p>

          {current.id === "complaint" ? (
            <div className={css.fields}>
              <div className={css.fieldRow}>
                <label htmlFor="complaint-cat" className={css.fieldLabel}>
                  Complaint category
                </label>
                <select id="complaint-cat" value={job.complaintCategory} onChange={(e) => update({ complaintCategory: e.target.value })}>
                  <option value="">Select</option>
                  {COMPLAINTS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={css.fieldRow}>
                <label htmlFor="complaint-text" className={css.fieldLabel}>
                  Customer complaint (their words)
                </label>
                <textarea id="complaint-text" rows={3} maxLength={500} value={job.complaint} onChange={(e) => update({ complaint: e.target.value })} placeholder="e.g. Battery shows 60%, but scooter shuts down during acceleration." />
              </div>
              {STAGE_FIELDS.complaint.observations.map((k) => (
                <ObservationInput key={k} name={k} value={job.observations[k]} onChange={setObs} />
              ))}
              <p className={css.note}>A complaint suggests where to look. It never creates a repair decision on its own.</p>
            </div>
          ) : null}

          {current.id === "safety" ? (
            <div className={css.fields}>
              <fieldset className={css.hazards}>
                <legend>Before touching the pack, check for:</legend>
                {SAFETY_HAZARDS.map((h) => (
                  <label key={h.id} className={css.check}>
                    <input
                      type="checkbox"
                      checked={hazards.includes(h.label)}
                      onChange={(e) => {
                        const flags = e.target.checked ? [...hazards, h.label] : hazards.filter((x) => x !== h.label);
                        update({ safetyFlags: flags, safetyAcknowledged: flags.length ? job.safetyAcknowledged : false });
                        if (flags.length) setScreened(false);
                      }}
                    />
                    {h.label}
                  </label>
                ))}
              </fieldset>
              {hazards.length ? (
                <>
                  <SafetyBanner level="stop" title="UNSAFE — QUARANTINE / ESCALATE" />
                  <label className={css.ack}>
                    <input
                      type="checkbox"
                      checked={job.safetyAcknowledged}
                      onChange={(e) => {
                        update({ safetyAcknowledged: e.target.checked });
                        if (e.target.checked) track("safety_completed", "hazard");
                      }}
                    />
                    I acknowledge the safety state. The pack is isolated and will be quarantined and escalated. I will continue only to document it.
                  </label>
                </>
              ) : (
                <button
                  type="button"
                  className={css.primary}
                  onClick={() => {
                    setScreened(true);
                    track("safety_completed", "clear");
                    go(2, true);
                  }}
                >
                  <Check size={16} aria-hidden="true" /> No hazards present — continue
                </button>
              )}
              {!unlocked ? <p className={css.note}>Later stages stay locked until the safety screen is complete.</p> : null}
            </div>
          ) : null}

          {current.id === "identify" ? <IdentifyStage job={job} update={update} setBefore={setBefore} setObs={setObs} lockManufacturer={lockManufacturer} /> : null}

          {genericStage ? (
            <div className={css.fields}>
              {current.id === "electrical" ? (
                <div className={css.importRow}>
                  <label className={css.importButton}>
                    <Upload size={15} aria-hidden="true" /> Import tester / BMS export (CSV or JSON)
                    <input type="file" accept=".csv,.json,.txt,text/csv,application/json,text/plain" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
                  </label>
                  {importNote ? (
                    <p className={css.note} role="status">
                      {importNote}
                    </p>
                  ) : (
                    <p className={css.note}>Field names follow the toolkit&apos;s keys, e.g. packVoltage, cellMin, cellMax, tempMax, bmsStatus.</p>
                  )}
                </div>
              ) : null}
              {current.id === "bms" ? <p className={css.note}>BMS communication protocol for this vehicle: UNKNOWN / NOT VERIFIED unless you confirm it physically below. Values read here are MEASURED or USER ENTERED — never manufacturer data.</p> : null}
              {genericStage.measurements.map((k) => (
                <MeasurementInput key={k} name={k} value={job.before[k]} onChange={setBefore} />
              ))}
              {genericStage.observations.map((k) => (
                <ObservationInput key={k} name={k} value={job.observations[k]} onChange={setObs} />
              ))}
            </div>
          ) : null}

          {current.id === "cells" ? <CellsStage job={job} update={update} setBefore={setBefore} setObs={setObs} groupText={groupText} setGroupText={setGroupText} /> : null}

          {current.id === "analysis" ? <AnalysisStage candidates={candidates} onOpen={(id) => track("candidate_opened", id)} /> : null}

          {current.id === "decision" && decision ? (
            <DecisionStage
              job={job}
              candidates={candidates}
              decision={decision}
              onSelect={(id) => {
                update({ selectedRootCause: id });
                track("root_cause_selected", id ?? "ranking");
              }}
            />
          ) : null}

          {current.id === "repair" && decision ? <RepairStage job={job} update={update} decision={decision} /> : null}

          {current.id === "post" && verification ? (
            <div className={css.fields}>
              <h4 className={css.subhead}>After-repair measurements</h4>
              {AFTER_MEASUREMENTS.map((k: MeasurementKey) => (
                <MeasurementInput key={k} name={k} value={job.after[k]} onChange={setAfter} />
              ))}
              {AFTER_OBSERVATIONS.map((k: ObservationKey) => (
                <ObservationInput key={k} name={k} value={job.afterObservations[k]} onChange={setAfterObs} />
              ))}
              <h4 className={css.subhead}>Verification checks</h4>
              <table className={css.checks}>
                <thead>
                  <tr>
                    <th scope="col">Check</th>
                    <th scope="col">Criterion</th>
                    <th scope="col">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {VERIFICATION_CHECKS.map((c) => (
                    <tr key={c.id}>
                      <th scope="row">
                        {c.label}
                        {c.critical ? <span className={css.critical}> · critical</span> : null}
                      </th>
                      <td>{c.criterion}</td>
                      <td>
                        <select aria-label={`${c.label} result`} value={job.verification[c.id] ?? "not-done"} onChange={(e) => update({ verification: { ...job.verification, [c.id]: e.target.value as CheckResult } })}>
                          <option value="not-done">Not done</option>
                          <option value="pass">Pass</option>
                          <option value="fail">Fail</option>
                          <option value="not-applicable">Not applicable</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <label className={css.ack}>
                <input
                  type="checkbox"
                  checked={job.technicianConfirmed}
                  onChange={(e) => {
                    update({ technicianConfirmed: e.target.checked });
                    if (e.target.checked) {
                      const outcome = verifyRepair({ ...job, technicianConfirmed: true }).outcome;
                      if (tracked.current.completed !== outcome) {
                        tracked.current.completed = outcome;
                        track("repair_completed", outcome);
                      }
                    }
                  }}
                />
                I confirm these checks were performed on the vehicle.
              </label>
              <div className={css.outcome} data-outcome={verification.outcome}>
                <Pill family={OUTCOME_FAMILY[verification.outcome]}>{VERIFICATION_LABEL[verification.outcome]}</Pill>
                <ul>
                  {verification.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <p className={css.note}>A cleared fault code is not a successful repair: every critical check must pass.</p>
              </div>
              <h4 className={css.subhead}>Before / after comparison</h4>
              <table className={css.compare}>
                <thead>
                  <tr>
                    <th scope="col">Field</th>
                    <th scope="col">Before repair</th>
                    <th scope="col">After repair</th>
                    <th scope="col">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {compareBeforeAfter(job).map((r) => (
                    <tr key={r.key}>
                      <th scope="row">{r.label}</th>
                      <td>{r.before}</td>
                      <td>{r.after}</td>
                      <td>
                        <Pill family={TREND_FAMILY[r.trend]}>{TREND_LABEL[r.trend]}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {current.id === "report" && decision && verification ? (
            <div className={css.fields}>
              <h4 className={css.subhead}>Job card</h4>
              <dl className={css.jobCard}>
                <div>
                  <dt>Job ID</dt>
                  <dd>{job.jobId}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{job.date}</dd>
                </div>
                <div>
                  <dt>Technician</dt>
                  <dd>{job.technician || "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Customer complaint</dt>
                  <dd>{job.complaint || COMPLAINTS.find((c) => c.id === job.complaintCategory)?.label || "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Vehicle</dt>
                  <dd>{vehicle ? vehicleLabel(vehicle, vehicle.variants.find((v) => v.id === job.variantId)) : "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Battery</dt>
                  <dd>{[job.architecture ? ARCHITECTURES[job.architecture].name : null, job.batteryId ? `ID ${job.batteryId}` : null].filter(Boolean).join(" · ") || "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Initial condition</dt>
                  <dd>
                    BMS {job.observations.bmsStatus?.value ?? "not recorded"} · pack {formatNumber(job.before.packVoltage?.value, "V", 1, "not measured")} · delta {formatNumber(deltaOf(job.before).value, "mV", 0, "not measured")}
                  </dd>
                </div>
                <div>
                  <dt>Measurements</dt>
                  <dd>
                    {Object.values(job.before).filter((m) => m && m.value !== null).length} of {Object.keys(MEASUREMENTS).length} recorded
                  </dd>
                </div>
                <div>
                  <dt>Diagnosis</dt>
                  <dd>{(decision.candidateId && candidates.find((c) => c.id === decision.candidateId && c.gate === "MET" && c.confidence !== "LOW")?.name) || INSUFFICIENT}</dd>
                </div>
                <div>
                  <dt>Repair performed</dt>
                  <dd>{job.repairPerformed || "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Parts replaced</dt>
                  <dd>{job.partsReplaced || "None recorded"}</dd>
                </div>
                <div>
                  <dt>Post-repair result</dt>
                  <dd>{VERIFICATION_LABEL[verification.outcome]}</dd>
                </div>
                <div>
                  <dt>Final recommendation</dt>
                  <dd>{REPAIR_STATUS_LABEL[decision.status]}</dd>
                </div>
              </dl>
              <div className={css.actions}>
                <button
                  type="button"
                  className={css.primary}
                  onClick={() => {
                    setReport(buildRealReport(job, new Date()));
                    track("report_preview");
                  }}
                >
                  Preview diagnostic report
                </button>
                <button
                  type="button"
                  className={css.secondary}
                  onClick={() => {
                    if (window.confirm("Start a new job? The current job card will be cleared from this tab.")) {
                      setJob(null);
                      setGroupText("");
                      setImportNote(null);
                    }
                  }}
                >
                  <RotateCcw size={15} aria-hidden="true" /> New job
                </button>
              </div>
            </div>
          ) : null}

          <div className={css.stageNavButtons}>
            <button type="button" className={css.secondary} disabled={stage === 0} onClick={() => go(stage - 1)}>
              <ArrowLeft size={15} aria-hidden="true" /> Previous
            </button>
            <button type="button" className={css.secondary} disabled={stage === REAL_STAGES.length - 1 || locked(stage + 1)} onClick={() => go(stage + 1)}>
              Next <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      {report ? (
        <ReportDialog
          report={report}
          onClose={closeReport}
          onPrint={() => {
            track("report_generated");
            printReport();
          }}
        />
      ) : null}
      <p className={css.srOnly} aria-live="polite">
        {hazards.length ? SAFETY_STOP_ACTIONS.join(". ") : ""}
      </p>
    </div>
  );
}
