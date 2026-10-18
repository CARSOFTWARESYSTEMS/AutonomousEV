"use client";
// Stages of the real workflow that hold more than a list of fields: vehicle
// identification, cell comparison with the configuration assistant, root-cause
// analysis, the repair decision and the repair action. Plus the guided flow
// panel for the selected complaint.
import { useId, useState } from "react";
import { Check, Circle, ShieldAlert } from "lucide-react";
import { ARCHITECTURES, ARCHITECTURE_ORDER } from "@/data/ev-battery-toolkit/architectures";
import { ADVANCED_REPAIR_ACKS, COMPLAINT_FLOWS, STAGE_FIELDS, type FlowNeed } from "@/data/ev-battery-toolkit/fields";
import { MANUFACTURERS, VEHICLES, selectableYears } from "@/data/ev-battery-toolkit/vehicles";
import {
  ADVANCED_STATUSES,
  CALCULATED_FROM_CONFIG,
  INSUFFICIENT,
  REFERENCE_LOGIC_NOTICE,
  REFERENCE_ONLY,
  REPAIR_STATUS_LABEL,
  deltaOf,
  groupAnalysis,
  numberOf,
  packExpectations,
  textOf,
} from "@/lib/ev-battery-toolkit/diagnosis";
import { formatNumber, round } from "@/lib/ev-battery-toolkit/provenance";
import type { CellConfiguration, DiagnosticMeasurement, DiagnosticObservation, JobCard, RepairDecision, RootCauseCandidate, ArchitectureId } from "@/lib/ev-battery-toolkit/types";
import { Pill, ProvenanceBadge, SafetyBanner } from "../ui/Badges";
import { MeasurementInput, ObservationInput } from "./FieldInputs";
import PublishedSpec from "./PublishedSpec";
import css from "../diagnosis.module.css";

const CONFIDENCE_FAMILY = { LOW: "neutral", MEDIUM: "warning", HIGH: "ok" } as const;

export interface StageProps {
  job: JobCard;
  update: (patch: Partial<JobCard>) => void;
  setBefore: (m: DiagnosticMeasurement) => void;
  setObs: (o: DiagnosticObservation) => void;
}

// ── Guided flow ──

export function flowProgress(job: JobCard, screened: boolean) {
  const flow = COMPLAINT_FLOWS[job.complaintCategory];
  if (!flow) return null;
  const has = (n: FlowNeed) => ("safety" in n ? screened || job.safetyAcknowledged : "m" in n ? numberOf(job.before, n.m) !== null : textOf(job.observations, n.o) !== null);
  const steps = flow.steps.map((s) => ({ ...s, done: s.any ? s.needs.some(has) : s.needs.every(has) }));
  return { title: flow.title, steps, next: steps.find((s) => !s.done) ?? null };
}

export function FlowPanel({ job, screened }: { job: JobCard; screened: boolean }) {
  const p = flowProgress(job, screened);
  if (!p) return <p className={css.flowEmpty}>Choose a complaint category to see its diagnostic flow.</p>;
  return (
    <section className={css.flow} aria-label={p.title}>
      <p className={css.evLabel}>{p.title}</p>
      <ol>
        {p.steps.map((s) => (
          <li key={s.label} data-done={s.done ? "" : undefined}>
            {s.done ? <Check size={13} aria-label="Done" /> : <Circle size={11} aria-label="Pending" />}
            <span>{s.label}</span>
          </li>
        ))}
      </ol>
      <p className={css.flowNext}>
        <span>Next test</span> {p.next ? p.next.label : "Flow complete — review the root-cause analysis."}
      </p>
    </section>
  );
}

// ── Identification ──

export function IdentifyStage({ job, update, setBefore, lockManufacturer }: StageProps & { lockManufacturer?: string }) {
  const years = selectableYears(new Date());
  const vehicle = VEHICLES.find((v) => v.id === job.vehicleId);
  const [make, setMake] = useState(lockManufacturer ?? vehicle?.manufacturer ?? "");
  const manufacturer = lockManufacturer ?? make;
  const models = VEHICLES.filter((v) => v.manufacturer === manufacturer);
  const variant = vehicle?.variants.find((v) => v.id === job.variantId);
  const spec = (variant ?? vehicle?.variants[0])?.battery;
  const usePublished = (key: "batteryNominalVoltage" | "ratedCapacityAh", item: { value: number | null; provenance: DiagnosticMeasurement["provenance"]; conflict?: boolean }) =>
    item.value !== null && !item.conflict && (item.provenance === "MANUFACTURER_VERIFIED" || item.provenance === "THIRD_PARTY_DOCUMENTED") ? () => setBefore({ key, value: item.value, provenance: item.provenance }) : null;
  const pubV = spec ? usePublished("batteryNominalVoltage", spec.nominalVoltage) : null;
  const pubAh = spec ? usePublished("ratedCapacityAh", spec.capacityAh) : null;

  return (
    <div className={css.fields}>
      <div className={css.fieldGrid}>
        <div className={css.fieldRow}>
          <label htmlFor="id-make" className={css.fieldLabel}>
            Manufacturer
          </label>
          <select
            id="id-make"
            value={manufacturer}
            disabled={Boolean(lockManufacturer)}
            onChange={(e) => {
              setMake(e.target.value);
              const options = VEHICLES.filter((v) => v.manufacturer === e.target.value);
              const only = options.length === 1 ? options[0] : null;
              update({ vehicleId: only?.id ?? null, variantId: only && only.variants.length === 1 ? only.variants[0].id : null });
            }}
          >
            <option value="">Select</option>
            {(lockManufacturer ? [lockManufacturer] : MANUFACTURERS).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className={css.fieldRow}>
          <label htmlFor="id-model" className={css.fieldLabel}>
            Model
          </label>
          <select
            id="id-model"
            value={job.vehicleId ?? ""}
            disabled={!manufacturer}
            onChange={(e) => {
              const next = VEHICLES.find((v) => v.id === e.target.value);
              update({ vehicleId: next?.id ?? null, variantId: next && next.variants.length === 1 ? next.variants[0].id : null });
            }}
          >
            <option value="">Select</option>
            {models.map((v) => (
              <option key={v.id} value={v.id}>
                {v.model}
              </option>
            ))}
          </select>
        </div>
        <div className={css.fieldRow}>
          <label htmlFor="id-variant" className={css.fieldLabel}>
            Variant
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

      {spec ? <PublishedSpec spec={spec} title={`Published specification · ${vehicle?.manufacturer} ${vehicle?.model}`} /> : null}

      <h4 className={css.subhead}>Battery rating (from the pack label or documentation)</h4>
      {STAGE_FIELDS.identify.measurements.map((k) => (
        <MeasurementInput key={k} name={k} value={job.before[k]} onChange={setBefore} />
      ))}
      <div className={css.actions}>
        {pubV ? (
          <button type="button" className={css.secondary} onClick={pubV}>
            Use published nominal voltage
          </button>
        ) : null}
        {pubAh ? (
          <button type="button" className={css.secondary} onClick={pubAh}>
            Use published rated capacity
          </button>
        ) : null}
      </div>
      {spec?.capacityAh.conflict ? <p className={css.warnNote}>Published capacity sources disagree. Read the rated capacity from the pack label and record it as USER ENTERED.</p> : null}
      <p className={css.note}>Battery specification values that are not published with a source stay UNKNOWN. Record what you read on the pack label.</p>
    </div>
  );
}

// ── Cells ──

const CONFIG_NUMBERS: { key: keyof CellConfiguration; label: string; unit: string; step: string }[] = [
  { key: "series", label: "Series count", unit: "", step: "1" },
  { key: "parallel", label: "Parallel count", unit: "", step: "1" },
  { key: "modules", label: "Module count", unit: "", step: "1" },
  { key: "cellNominalV", label: "Cell nominal voltage", unit: "V", step: "any" },
  { key: "cellMaxV", label: "Cell maximum voltage", unit: "V", step: "any" },
  { key: "cellMinV", label: "Cell minimum voltage", unit: "V", step: "any" },
];

export function CellsStage({ job, update, setBefore, setObs, groupText, setGroupText }: StageProps & { groupText: string; setGroupText: (v: string) => void }) {
  const idBase = useId();
  const expect = packExpectations(job.cellConfig);
  const analysis = groupAnalysis(job.groupVoltages);
  const nominal = numberOf(job.before, "batteryNominalVoltage");
  const setConfig = (patch: Partial<CellConfiguration>) => update({ cellConfig: { ...job.cellConfig, ...patch } });

  return (
    <div className={css.fields}>
      <p className={css.note}>Cell-group values come from the BMS or a diagnostic tester. Do not open the pack before the external safety checks are complete.</p>
      {STAGE_FIELDS.cells.measurements.map((k) => (
        <MeasurementInput key={k} name={k} value={job.before[k]} onChange={setBefore} />
      ))}
      {STAGE_FIELDS.cells.observations.map((k) => (
        <ObservationInput key={k} name={k} value={job.observations[k]} onChange={setObs} />
      ))}

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
            update({
              groupVoltages: values,
              before: {
                ...job.before,
                cellMin: { key: "cellMin", value: round(Math.min(...values), 3), provenance: "MEASURED" },
                cellMax: { key: "cellMax", value: round(Math.max(...values), 3), provenance: "MEASURED" },
              },
            });
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

      {analysis ? (
        <div className={css.groupTableWrap}>
          <p className={css.evLabel}>Cell-group comparison · {REFERENCE_ONLY}</p>
          <table className={css.compare}>
            <thead>
              <tr>
                <th scope="col">Cell group</th>
                <th scope="col">Voltage</th>
                <th scope="col">Delta from average</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {analysis.rows.map((r) => (
                <tr key={r.group} data-flag={r.status.length ? "" : undefined}>
                  <th scope="row">{r.group}</th>
                  <td>
                    {formatNumber(r.voltage, "V", 3)} <ProvenanceBadge provenance="MEASURED" />
                  </td>
                  <td>{formatNumber(r.deltaFromAverageMv, "mV")}</td>
                  <td>{r.status.join(" · ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={css.note}>
            Average {formatNumber(analysis.average, "V", 3)} · delta {formatNumber(analysis.deltaMv, "mV")}. No universal imbalance limit is applied as a vehicle fact.
          </p>
        </div>
      ) : null}

      <details className={css.configAssistant}>
        <summary>Confirm internal pack configuration (optional)</summary>
        <p className={css.note}>
          Nominal system voltage {nominal !== null ? formatNumber(nominal, "V", 1) : "as published"}. Exact fully charged and discharge-cutoff voltages depend on cell chemistry and series configuration. Confirm against battery/BMS data before applying thresholds. Never guess the series count.
        </p>
        <div className={css.fieldGrid}>
          <div className={css.fieldRow}>
            <label htmlFor={`${idBase}-chem`} className={css.fieldLabel}>
              Chemistry
            </label>
            <select id={`${idBase}-chem`} value={job.cellConfig.chemistry} onChange={(e) => setConfig({ chemistry: e.target.value as CellConfiguration["chemistry"] })}>
              {(["Unknown", "NMC", "LFP", "Other"] as const).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className={css.fieldRow}>
            <label htmlFor={`${idBase}-fmt`} className={css.fieldLabel}>
              Cell format
            </label>
            <select id={`${idBase}-fmt`} value={job.cellConfig.format} onChange={(e) => setConfig({ format: e.target.value as CellConfiguration["format"] })}>
              {(["Unknown", "Cylindrical", "Prismatic", "Pouch"] as const).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {CONFIG_NUMBERS.map((f) => (
            <div key={f.key} className={css.fieldRow}>
              <label htmlFor={`${idBase}-${f.key}`} className={css.fieldLabel}>
                {f.label} {f.unit ? <span className={css.unit}>({f.unit})</span> : null}
              </label>
              <input
                id={`${idBase}-${f.key}`}
                type="number"
                step={f.step}
                min={0}
                placeholder="Unknown"
                value={(job.cellConfig[f.key] as number | null) ?? ""}
                onChange={(e) => setConfig({ [f.key]: e.target.value === "" ? null : Number(e.target.value) } as Partial<CellConfiguration>)}
              />
            </div>
          ))}
        </div>
        <dl className={css.expectations}>
          {(
            [
              ["Expected nominal pack voltage", expect.nominal],
              ["Expected full-charge pack voltage", expect.full],
              ["Expected lower operating limit", expect.lower],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                {value === null ? (
                  "Not calculated — enter the series count and cell voltages"
                ) : (
                  <>
                    {formatNumber(value, "V", 1)} <ProvenanceBadge provenance="CALCULATED" />
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className={css.note}>{CALCULATED_FROM_CONFIG}. Every configuration value here is USER ENTERED.</p>
      </details>
    </div>
  );
}

// ── Analysis ──

export function AnalysisStage({ candidates, onOpen }: { candidates: RootCauseCandidate[]; onOpen: (id: string) => void }) {
  return (
    <div className={css.candidates}>
      {candidates.length === 0 ? <p className={css.note}>No candidates yet. Record the complaint and measurements first.</p> : null}
      {candidates.map((c, i) => (
        <article key={c.id} className={css.candidate} aria-label={c.name}>
          <details open={i === 0} onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && onOpen(c.id)}>
            <summary>
              <h4>{c.name}</h4>
              <Pill family={CONFIDENCE_FAMILY[c.confidence]}>{c.confidence} confidence</Pill>
              {c.gate === "MET" ? <Pill family="info">Evidence gate met</Pill> : <Pill family="warning">{INSUFFICIENT}</Pill>}
            </summary>
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
              <span>Next recommended test</span> {c.nextMeasurement}
            </p>
          </details>
        </article>
      ))}
      <p className={css.note}>Confidence counts MEASURED and USER ENTERED evidence only.</p>
      <p className={css.referenceNotice}>{REFERENCE_LOGIC_NOTICE}</p>
    </div>
  );
}

// ── Decision ──

const DEPTH_LABEL = { basic: "Basic Diagnostic", expert: "Expert Service", advanced: "Advanced Battery Repair" } as const;

export function DecisionStage({ job, candidates, decision, onSelect }: { job: JobCard; candidates: RootCauseCandidate[]; decision: RepairDecision; onSelect: (id: string | null) => void }) {
  return (
    <div className={css.decision} data-status={decision.status}>
      {candidates.length ? (
        <fieldset className={css.rootSelect}>
          <legend>Root cause</legend>
          <label className={css.check}>
            <input type="radio" name="root-cause" checked={job.selectedRootCause === null} onChange={() => onSelect(null)} />
            Follow the evidence ranking
          </label>
          {candidates.map((c) => (
            <label key={c.id} className={css.check}>
              <input type="radio" name="root-cause" checked={job.selectedRootCause === c.id} onChange={() => onSelect(c.id)} />
              {c.name} <Pill family={CONFIDENCE_FAMILY[c.confidence]}>{c.confidence}</Pill>
              {c.gate !== "MET" ? <span className={css.gateNote}>gate not met</span> : null}
            </label>
          ))}
        </fieldset>
      ) : null}
      {decision.status === "UNSAFE_QUARANTINE" ? <SafetyBanner level="stop" title="UNSAFE — QUARANTINE / ESCALATE" /> : null}
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
          <dt>Missing evidence</dt>
          <dd>
            <ul>{decision.missingEvidence.length ? decision.missingEvidence.map((e) => <li key={e}>{e}</li>) : <li>None</li>}</ul>
          </dd>
        </div>
        <div>
          <dt>Risk</dt>
          <dd>{decision.risk}</dd>
        </div>
        <div>
          <dt>Next action</dt>
          <dd>{decision.nextAction}</dd>
        </div>
        <div>
          <dt>Required repair depth</dt>
          <dd>{decision.repairDepth ? DEPTH_LABEL[decision.repairDepth] : "—"}</dd>
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
      <p className={css.referenceNotice}>{REFERENCE_LOGIC_NOTICE}</p>
      <p className={css.note}>Vehicle-specific repair procedures must follow verified manufacturer service information.</p>
    </div>
  );
}

// ── Repair action ──

const ADVANCED_CONCEPTS = [
  "Confirm the faulty group or module from BMS data and a direct measurement before any work.",
  "Work only on an isolated pack with insulated tools; disconnect the module from the rest of the pack first.",
  "Replace cells or modules only with matched parts: same chemistry, format, capacity and internal resistance, at matched voltage.",
  "Restore interconnects to the pack's original design. Never solder directly to cylindrical cells.",
  "Re-balance, then verify cell delta, insulation and temperature before closing the pack.",
  "Exact disassembly steps for this vehicle are not verified here: follow authorised manufacturer service documentation.",
];

export function RepairStage({ job, update, decision }: { job: JobCard; update: (patch: Partial<JobCard>) => void; decision: RepairDecision }) {
  const advanced = ADVANCED_STATUSES.has(decision.status);
  const acked = ADVANCED_REPAIR_ACKS.every((a) => job.advancedAck.includes(a.id));
  return (
    <div className={css.fields}>
      {decision.status === "UNSAFE_QUARANTINE" ? (
        <SafetyBanner level="stop" title="NORMAL REPAIR WORKFLOW SUSPENDED">
          <p className={css.safetyText}>Record the quarantine location and the escalation only.</p>
        </SafetyBanner>
      ) : decision.status === "INSUFFICIENT_EVIDENCE" ? (
        <p className={css.warnNote}>{INSUFFICIENT}. Complete the next test before repairing.</p>
      ) : decision.status === "SPECIALIST_EVALUATION_REQUIRED" ? (
        <p className={css.warnNote}>SPECIALIST EVALUATION REQUIRED. Do not attempt blind recovery charging.</p>
      ) : null}

      {advanced ? (
        <fieldset className={css.advancedGate}>
          <legend>
            <ShieldAlert size={15} aria-hidden="true" /> ADVANCED BATTERY REPAIR
          </legend>
          <p className={css.note}>Before internal repair concepts are shown, confirm each of these:</p>
          {ADVANCED_REPAIR_ACKS.map((a) => (
            <label key={a.id} className={css.check}>
              <input
                type="checkbox"
                checked={job.advancedAck.includes(a.id)}
                onChange={(e) => update({ advancedAck: e.target.checked ? [...job.advancedAck, a.id] : job.advancedAck.filter((x) => x !== a.id) })}
              />
              {a.label}
            </label>
          ))}
          {acked ? (
            <div className={css.concepts}>
              <p className={css.evLabel}>Advanced repair concepts — generic, not OEM-specific</p>
              <ol>
                {ADVANCED_CONCEPTS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ol>
            </div>
          ) : (
            <p className={css.note}>Internal repair concepts stay hidden until every item is confirmed.</p>
          )}
        </fieldset>
      ) : null}

      <div className={css.fieldRow}>
        <label htmlFor="repair-done" className={css.fieldLabel}>
          {decision.status === "UNSAFE_QUARANTINE" ? "Action taken (isolation, quarantine, escalation)" : "Repair performed"}
        </label>
        <textarea id="repair-done" rows={3} maxLength={600} disabled={advanced && !acked} value={job.repairPerformed} onChange={(e) => update({ repairPerformed: e.target.value })} />
      </div>
      <div className={css.fieldRow}>
        <label htmlFor="repair-parts" className={css.fieldLabel}>
          Parts replaced
        </label>
        <input id="repair-parts" type="text" maxLength={200} disabled={advanced && !acked} value={job.partsReplaced} onChange={(e) => update({ partsReplaced: e.target.value })} />
      </div>
      <div className={css.fieldRow}>
        <label htmlFor="repair-notes" className={css.fieldLabel}>
          Technician notes
        </label>
        <textarea id="repair-notes" rows={3} maxLength={1000} value={job.notes} onChange={(e) => update({ notes: e.target.value })} />
      </div>
    </div>
  );
}
