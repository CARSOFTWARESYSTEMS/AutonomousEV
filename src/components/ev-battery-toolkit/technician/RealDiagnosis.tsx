"use client";
// Real Vehicle Diagnosis — the primary technician workflow. Thirteen stages
// from the customer complaint to the report. Nothing is pre-filled: an empty
// field is NOT MEASURED, a safety screen comes before everything else, and a
// repair is recommended only when the evidence gate is met.
//
// Everything typed here stays in this browser tab. No job-card value is ever
// sent to analytics (see lib/ev-battery-toolkit/analytics.ts).
import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lock, RotateCcw, Upload } from "lucide-react";
import { ARCHITECTURES, ARCHITECTURE_ORDER } from "@/data/ev-battery-toolkit/architectures";
import { AFTER_MEASUREMENTS, AFTER_OBSERVATIONS, COMPLAINTS, MEASUREMENTS, REAL_STAGES, SAFETY_HAZARDS, STAGE_FIELDS, VERIFICATION_CHECKS } from "@/data/ev-battery-toolkit/fields";
import { MANUFACTURERS, VEHICLES, selectableYears, vehicleLabel } from "@/data/ev-battery-toolkit/vehicles";
import { toId, trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import { canMergeIntoRealJob, parseDiagnosticFile } from "@/lib/ev-battery-toolkit/dataSources";
import { INSUFFICIENT, REPAIR_STATUS_LABEL, VERIFICATION_LABEL, compareBeforeAfter, deltaOf, newJobCard, repairDecision, rootCauseCandidates, verifyRepair } from "@/lib/ev-battery-toolkit/diagnosis";
import { formatNumber, round } from "@/lib/ev-battery-toolkit/provenance";
import { buildRealReport } from "@/lib/ev-battery-toolkit/report";
import type { ArchitectureId, CheckResult, DiagnosticMeasurement, DiagnosticObservation, JobCard, MeasurementKey, ObservationKey, Report } from "@/lib/ev-battery-toolkit/types";
import { ContextBanner, Pill, SAFETY_STOP_ACTIONS, SafetyBanner } from "../ui/Badges";
import { ReportDialog, printReport } from "../report/ReportDocument";
import { MeasurementInput, ObservationInput } from "./FieldInputs";
import css from "../diagnosis.module.css";

const CONFIDENCE_FAMILY = { LOW: "neutral", MEDIUM: "warning", HIGH: "ok" } as const;
const TREND_FAMILY = { improved: "ok", unchanged: "neutral", worsened: "critical", changed: "info", "not-comparable": "neutral" } as const;
const OUTCOME_FAMILY = { PASS: "ok", CONDITIONAL_PASS: "warning", FURTHER_DIAGNOSIS_REQUIRED: "service", UNSAFE_DO_NOT_RETURN: "critical" } as const;

export default function RealDiagnosis() {
  const [job, setJob] = useState<JobCard | null>(null);
  const [stage, setStage] = useState(0);
  const [screened, setScreened] = useState(false);
  const [importNote, setImportNote] = useState<string | null>(null);
  const [groupText, setGroupText] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const tracked = useRef({ decision: "", repairStarted: false, completed: "" });
  const years = useMemo(() => selectableYears(new Date()), []);

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
            <p>Nothing is pre-filled. Every field starts as NOT MEASURED until you record it, and each value keeps its origin: MEASURED, USER ENTERED, NOT MEASURED, NOT AVAILABLE or UNKNOWN.</p>
            <p>No customer personal details are needed. Everything you enter stays in this browser tab.</p>
            <button
              type="button"
              className={css.primary}
              onClick={() => {
                setJob(newJobCard(new Date()));
                setStage(0);
                setScreened(false);
                trackToolkit("diagnosis_started", { context: "real" });
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
  const setBefore = (m: DiagnosticMeasurement) => setJob((j) => (j ? { ...j, before: { ...j.before, [m.key]: m } } : j));
  const setObs = (o: DiagnosticObservation) => setJob((j) => (j ? { ...j, observations: { ...j.observations, [o.key]: o } } : j));
  const setAfter = (m: DiagnosticMeasurement) => setJob((j) => (j ? { ...j, after: { ...j.after, [m.key]: m } } : j));
  const setAfterObs = (o: DiagnosticObservation) => setJob((j) => (j ? { ...j, afterObservations: { ...j.afterObservations, [o.key]: o } } : j));
  const current = REAL_STAGES[stage];
  const locked = (i: number) => i >= 2 && !unlocked;

  /** `unlockedNow` covers the click that completes the safety screen, before its state update lands. */
  const go = (i: number, unlockedNow = false) => {
    if (locked(i) && !unlockedNow) return;
    setStage(i);
    const id = REAL_STAGES[i].id;
    if (id === "decision" && decision && decision.status !== "INSUFFICIENT_EVIDENCE" && tracked.current.decision !== decision.status) {
      tracked.current.decision = decision.status;
      trackToolkit("diagnosis_completed", { context: "real", status: toId(decision.status) });
    }
    if (id === "repair" && !tracked.current.repairStarted) {
      tracked.current.repairStarted = true;
      trackToolkit("repair_workflow_started");
    }
  };

  const vehicle = VEHICLES.find((v) => v.id === job.vehicleId);
  const manufacturer = vehicle?.manufacturer ?? "";

  const onImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = parseDiagnosticFile(text, file.name);
      if (!canMergeIntoRealJob(data)) {
        setImportNote("This file is simulation data and cannot enter a real diagnosis.");
        return;
      }
      setJob((j) => (j ? { ...j, before: { ...j.before, ...data.measurements }, observations: { ...j.observations, ...data.observations }, groupVoltages: data.groupVoltages.length ? data.groupVoltages : j.groupVoltages } : j));
      const n = Object.keys(data.measurements).length + Object.keys(data.observations).length;
      setImportNote(`${n} field${n === 1 ? "" : "s"} imported as MEASURED${data.groupVoltages.length ? `, ${data.groupVoltages.length} group voltages` : ""}.${data.ignored.length ? ` Not recognised: ${data.ignored.slice(0, 6).join(", ")}.` : ""}`);
    } catch (e) {
      setImportNote(e instanceof Error ? e.message : "The file could not be read.");
    }
  };

  const fieldStage = STAGE_FIELDS[current.id];

  return (
    <div className={css.real}>
      <ContextBanner context="real" detail={`Job ${job.jobId} · ${job.date}`} />
      {hazards.length > 0 ? (
        <SafetyBanner level="stop" title="SAFETY CONDITION RECORDED">
          <p className={css.safetyText}>{hazards.join(" · ")}. {job.safetyAcknowledged ? "Acknowledged: documentation only — quarantine and escalate." : "Acknowledge the safety state in the Safety Screen before continuing."}</p>
        </SafetyBanner>
      ) : null}
      <div className={css.workflow}>
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
              <p className={css.note}>A complaint suggests where to look. It is never enough on its own to name a root cause.</p>
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
                  <SafetyBanner level="stop" />
                  <label className={css.ack}>
                    <input type="checkbox" checked={job.safetyAcknowledged} onChange={(e) => update({ safetyAcknowledged: e.target.checked })} />
                    I acknowledge the safety state. The pack is isolated and will be quarantined and escalated. I will continue only to document it.
                  </label>
                </>
              ) : (
                <button
                  type="button"
                  className={css.primary}
                  onClick={() => {
                    setScreened(true);
                    go(2, true);
                  }}
                >
                  <Check size={16} aria-hidden="true" /> No hazards present — continue
                </button>
              )}
              {!unlocked ? <p className={css.note}>Later stages stay locked until the safety screen is complete.</p> : null}
            </div>
          ) : null}

          {current.id === "identify" ? (
            <div className={css.fields}>
              <div className={css.fieldGrid}>
                <div className={css.fieldRow}>
                  <label htmlFor="id-make" className={css.fieldLabel}>
                    Manufacturer
                  </label>
                  <select id="id-make" value={manufacturer} onChange={(e) => update({ vehicleId: VEHICLES.find((v) => v.manufacturer === e.target.value)?.id ?? null, variantId: null })}>
                    <option value="">Select</option>
                    {MANUFACTURERS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={css.fieldRow}>
                  <label htmlFor="id-variant" className={css.fieldLabel}>
                    Model / variant
                  </label>
                  <select id="id-variant" value={job.variantId ?? ""} disabled={!vehicle} onChange={(e) => update({ variantId: e.target.value || null })}>
                    <option value="">Select</option>
                    {vehicle?.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={css.fieldRow}>
                  <label htmlFor="id-year" className={css.fieldLabel}>
                    Model year
                  </label>
                  <select id="id-year" value={job.modelYear ?? ""} onChange={(e) => update({ modelYear: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">Not recorded</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={css.fieldRow}>
                  <label htmlFor="id-odo" className={css.fieldLabel}>
                    Odometer (km)
                  </label>
                  <input id="id-odo" type="number" min={0} value={job.odometerKm ?? ""} onChange={(e) => update({ odometerKm: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) })} />
                </div>
                <div className={css.fieldRow}>
                  <label htmlFor="id-battery" className={css.fieldLabel}>
                    Battery ID (optional)
                  </label>
                  <input id="id-battery" type="text" maxLength={60} value={job.batteryId} onChange={(e) => update({ batteryId: e.target.value })} />
                </div>
                <div className={css.fieldRow}>
                  <label htmlFor="id-serial" className={css.fieldLabel}>
                    Battery serial (optional)
                  </label>
                  <input id="id-serial" type="text" maxLength={60} value={job.batterySerial} onChange={(e) => update({ batterySerial: e.target.value })} />
                </div>
                <div className={css.fieldRow}>
                  <label htmlFor="id-arch" className={css.fieldLabel}>
                    Battery architecture (as seen)
                  </label>
                  <select id="id-arch" value={job.architecture ?? ""} onChange={(e) => update({ architecture: (e.target.value || null) as ArchitectureId | null })}>
                    <option value="">Not recorded</option>
                    {ARCHITECTURE_ORDER.map((id) => (
                      <option key={id} value={id}>
                        {ARCHITECTURES[id].name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={css.fieldRow}>
                  <label htmlFor="id-tech" className={css.fieldLabel}>
                    Technician
                  </label>
                  <input id="id-tech" type="text" maxLength={60} value={job.technician} onChange={(e) => update({ technician: e.target.value })} />
                </div>
              </div>
              <p className={css.note}>Battery specification for the selected platform: Technical specification not verified. Record what you read on the pack label as observations.</p>
            </div>
          ) : null}

          {fieldStage ? (
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
              {fieldStage.measurements.map((k) => (
                <MeasurementInput key={k} name={k} value={job.before[k]} onChange={setBefore} />
              ))}
              {fieldStage.observations.map((k) => (
                <ObservationInput key={k} name={k} value={job.observations[k]} onChange={setObs} />
              ))}
              {current.id === "cells" ? (
                <div className={css.groupEntry}>
                  <label htmlFor="group-values" className={css.fieldLabel}>
                    Individual cell-group values (V), separated by commas or spaces
                  </label>
                  <textarea id="group-values" rows={2} value={groupText} onChange={(e) => setGroupText(e.target.value)} placeholder="e.g. 4.06, 4.07, 3.74, 4.08" />
                  <button
                    type="button"
                    className={css.secondary}
                    onClick={() => {
                      const values = groupText
                        .split(/[\s,;]+/)
                        .map(Number)
                        .filter((v) => Number.isFinite(v) && v > 0 && v < 6);
                      if (!values.length) return;
                      setJob((j) =>
                        j
                          ? {
                              ...j,
                              groupVoltages: values,
                              before: {
                                ...j.before,
                                cellMin: { key: "cellMin", value: round(Math.min(...values), 3), provenance: "MEASURED" },
                                cellMax: { key: "cellMax", value: round(Math.max(...values), 3), provenance: "MEASURED" },
                              },
                            }
                          : j,
                      );
                    }}
                  >
                    Use these values for minimum and maximum
                  </button>
                  {job.groupVoltages.length ? (
                    <p className={css.note}>
                      {job.groupVoltages.length} group values recorded · derived delta {formatNumber(deltaOf(job.before).value, "mV", 0, "NOT MEASURED")}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {current.id === "analysis" ? (
            <div className={css.candidates}>
              {candidates.length === 0 ? <p className={css.note}>No candidates yet. Record the complaint and measurements first.</p> : null}
              {candidates.map((c) => (
                <article key={c.id} className={css.candidate} aria-label={c.name}>
                  <header>
                    <h4>{c.name}</h4>
                    <Pill family={CONFIDENCE_FAMILY[c.confidence]}>{c.confidence} confidence</Pill>
                    {c.gate === "MET" ? <Pill family="info">Evidence gate met</Pill> : <Pill family="warning">{INSUFFICIENT}</Pill>}
                  </header>
                  <div className={css.evidenceGrid}>
                    <div>
                      <p className={css.evLabel}>Supporting evidence</p>
                      <ul>{c.supporting.length ? c.supporting.map((x) => <li key={x}>{x}</li>) : <li className={css.none}>None recorded</li>}</ul>
                    </div>
                    <div>
                      <p className={css.evLabel}>Conflicting evidence</p>
                      <ul>{c.conflicting.length ? c.conflicting.map((x) => <li key={x}>{x}</li>) : <li className={css.none}>None recorded</li>}</ul>
                    </div>
                    <div>
                      <p className={css.evLabel}>Missing evidence</p>
                      <ul>{c.missing.length ? c.missing.map((x) => <li key={x}>{x}</li>) : <li className={css.none}>None</li>}</ul>
                    </div>
                  </div>
                  <p className={css.next}>
                    <span>Recommended next measurement</span> {c.nextMeasurement}
                  </p>
                </article>
              ))}
              <p className={css.note}>Confidence counts measured and observed evidence only. Thresholds are illustrative toolkit references, not manufacturer limits.</p>
            </div>
          ) : null}

          {current.id === "decision" && decision ? (
            <div className={css.decision} data-status={decision.status}>
              {decision.status === "UNSAFE_QUARANTINE" ? (
                <SafetyBanner level="stop" title="UNSAFE — QUARANTINE / ESCALATE" />
              ) : null}
              <p className={css.decisionStatus}>{REPAIR_STATUS_LABEL[decision.status]}</p>
              <dl className={css.decisionList}>
                <div>
                  <dt>Reason</dt>
                  <dd>{decision.reason}</dd>
                </div>
                <div>
                  <dt>Evidence</dt>
                  <dd>
                    <ul>{decision.evidence.length ? decision.evidence.map((e) => <li key={e}>{e}</li>) : <li>None recorded</li>}</ul>
                  </dd>
                </div>
                <div>
                  <dt>Required repair depth</dt>
                  <dd>{decision.repairDepth ? { basic: "Basic Diagnostic", expert: "Expert Service", advanced: "Advanced Battery Repair" }[decision.repairDepth] : "—"}</dd>
                </div>
                <div>
                  <dt>Verification required</dt>
                  <dd>
                    <ul>
                      {decision.verificationRequired.map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
              <p className={css.note}>Vehicle-specific repair procedures must follow verified manufacturer service information.</p>
            </div>
          ) : null}

          {current.id === "repair" ? (
            <div className={css.fields}>
              {decision?.status === "UNSAFE_QUARANTINE" ? (
                <SafetyBanner level="stop" title="NORMAL REPAIR WORKFLOW SUSPENDED">
                  <p className={css.safetyText}>Record the quarantine location and the escalation only.</p>
                </SafetyBanner>
              ) : decision?.status === "INSUFFICIENT_EVIDENCE" ? (
                <p className={css.warnNote}>{INSUFFICIENT}. Complete the next test before repairing.</p>
              ) : null}
              <div className={css.fieldRow}>
                <label htmlFor="repair-done" className={css.fieldLabel}>
                  {decision?.status === "UNSAFE_QUARANTINE" ? "Action taken (isolation, quarantine, escalation)" : "Repair performed"}
                </label>
                <textarea id="repair-done" rows={3} maxLength={600} value={job.repairPerformed} onChange={(e) => update({ repairPerformed: e.target.value })} />
              </div>
              <div className={css.fieldRow}>
                <label htmlFor="repair-parts" className={css.fieldLabel}>
                  Parts replaced
                </label>
                <input id="repair-parts" type="text" maxLength={200} value={job.partsReplaced} onChange={(e) => update({ partsReplaced: e.target.value })} />
              </div>
            </div>
          ) : null}

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
                        trackToolkit("repair_workflow_completed", { outcome: toId(outcome) });
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
                        <Pill family={TREND_FAMILY[r.trend]}>{r.trend.replace("-", " ")}</Pill>
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
                  <dd>{Object.values(job.before).filter((m) => m && m.value !== null).length} of {Object.keys(MEASUREMENTS).length} recorded</dd>
                </div>
                <div>
                  <dt>Diagnosis</dt>
                  <dd>{candidates.find((c) => c.gate === "MET" && c.confidence !== "LOW")?.name ?? INSUFFICIENT}</dd>
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
                    trackToolkit("report_preview_opened", { context: "real" });
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
                      tracked.current = { decision: "", repairStarted: false, completed: "" };
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
            trackToolkit("report_generated", { context: "real" });
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
