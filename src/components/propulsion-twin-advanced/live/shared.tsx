"use client";
// Pieces the live instruments share: charts bound to the twin's history, the
// ranked diagnosis with its evidence, and the fault picker.
import { useState } from "react";
import type { ReactNode } from "react";
import { FlaskConical, RotateCcw } from "lucide-react";
import { trackAdvancedTwinOnce } from "../analytics";
import { PRESSURE_UNIT } from "../data/pressure";
import { CHANNEL_BY_ID, type ChannelId } from "../simulation/channels";
import { FAULT_DEFS } from "../simulation/faults";
import { DIAGNOSES, DIAGNOSIS_BY_ID, type EvidenceLine, FAULT_IDS, type FaultClass, type FaultId } from "../simulation/isolation";
import type { FaultOnset, Recognition, TwinSnapshot } from "../simulation/twinTypes";
import { useLabStore } from "../state/labStore";
import { type Line, ShareBar, TraceChart, signed } from "../ui/charts";
import css from "../advancedTwin.module.css";

const CLASS_LABEL: Record<FaultClass, string> = { physical: "Physical faults", sensor: "Sensor faults", data: "Data-path faults", cyber: "Cyber-induced data faults" };

/** What an instrument shows until the twin is ready, or when it could not be fetched at all. */
export function TwinPending({ children = "Calibrating the twin…" }: { children?: ReactNode }) {
  const failed = useLabStore((s) => s.bootFailed);
  const boot = useLabStore((s) => s.boot);
  if (failed) {
    return (
      <div className={css.failure}>
        <div role="alert">
          <p>
            <strong>The simulation could not be loaded.</strong> The text and diagrams of the tutorial do not depend on it. Check the connection and try again; if that does not help, reload the page.
          </p>
        </div>
        <button type="button" className={css.ghost} onClick={() => void boot()}>
          <RotateCcw size={13} aria-hidden="true" /> Try again
        </button>
      </div>
    );
  }
  return (
    <p className={css.loading} role="status">
      {children}
    </p>
  );
}

/** The recent history of one channel, in the twin states asked for. Redraws whenever the simulation advances. */
export function ChannelChart({ channel, title, all = true, minRange, limit }: { channel: ChannelId; title?: string; all?: boolean; minRange?: number; limit?: { value: number; label: string } }) {
  const engine = useLabStore((s) => s.engine);
  const snapshot = useLabStore((s) => s.snapshot);
  useLabStore((s) => s.tick);
  if (!engine || !snapshot) return null;
  const def = CHANNEL_BY_ID[channel];
  const lines: Line[] = [{ kind: "observed", label: "Observed", values: engine.series("observed", channel) }];
  if (all) lines.push({ kind: "estimated", label: "Estimated", values: engine.series("estimated", channel) });
  lines.push({ kind: "expected", label: "Expected", values: engine.series("expected", channel) });
  const reading = snapshot.channels[channel];
  return (
    <TraceChart title={title ?? def.label} unit={def.unit} lines={lines} span={engine.historyLength * engine.historyStep} minRange={minRange ?? Math.max(2, Math.abs(reading.expected) * 0.04)} limit={limit}>
      <p className={css.readout}>
        Residual {signed(reading.residual)} ({signed(reading.z, 1)} σ)
      </p>
    </TraceChart>
  );
}

/** A pressure difference across a component, computed sample by sample from two channels. */
export function DeltaChart({ high, low, title, all = true }: { high: ChannelId; low: ChannelId; title: string; all?: boolean }) {
  const engine = useLabStore((s) => s.engine);
  const snapshot = useLabStore((s) => s.snapshot);
  useLabStore((s) => s.tick);
  if (!engine || !snapshot) return null;
  const diff = (kind: "observed" | "estimated" | "expected") => {
    const a = engine.series(kind, high);
    const b = engine.series(kind, low);
    return a.map((v, i) => v - b[i]);
  };
  const lines: Line[] = [{ kind: "observed", label: "Observed", values: diff("observed") }];
  if (all) lines.push({ kind: "estimated", label: "Estimated", values: diff("estimated") });
  lines.push({ kind: "expected", label: "Expected", values: diff("expected") });
  const expected = snapshot.channels[high].expected - snapshot.channels[low].expected;
  const residual = snapshot.channels[high].estimated - snapshot.channels[low].estimated - expected;
  return (
    <TraceChart title={title} unit={CHANNEL_BY_ID[high].unit} lines={lines} span={engine.historyLength * engine.historyStep} minRange={Math.max(1.5, Math.abs(expected) * 0.08)}>
      <p className={css.readout}>
        Residual {signed(residual)} ({expected ? signed((100 * residual) / expected, 1) : "0"} % of expected)
      </p>
    </TraceChart>
  );
}

/** Chamber pressure in all four twin states: observed, estimated with its band, expected, and predicted ahead of now. */
export function ChamberChart({ all }: { all: boolean }) {
  const engine = useLabStore((s) => s.engine);
  const snapshot = useLabStore((s) => s.snapshot);
  useLabStore((s) => s.tick);
  if (!engine || !snapshot) return null;
  const fused = engine.chamberSeries();
  const lines: Line[] = [
    { kind: "observed", label: "Observed (A)", values: engine.series("observed", "pcA") },
    { kind: "estimated", label: "Estimated", values: fused.estimated },
    { kind: "expected", label: "Expected", values: engine.series("expected", "pcA") },
  ];
  const p = snapshot.prognosis.chamber;
  const residual = snapshot.chamber.estimated - snapshot.chamber.expected;
  return (
    <TraceChart
      title="Chamber Pressure"
      unit={PRESSURE_UNIT}
      lines={all ? lines : [lines[0], lines[2]]}
      band={all ? fused.sigma : undefined}
      future={snapshot.monitoring ? { horizon: p.map((x) => x.horizon), mean: p.map((x) => x.mean), sigma: p.map((x) => x.sigma) } : undefined}
      limit={snapshot.monitoring ? { value: 0.95 * snapshot.chamber.expected, label: "lower limit" } : undefined}
      span={engine.historyLength * engine.historyStep}
      minRange={8}
    >
      <p className={css.readout}>
        Residual {signed(residual)} · sensor A {snapshot.chamber.sensorA} · sensor B {snapshot.chamber.sensorB} · band ±2σ
      </p>
    </TraceChart>
  );
}

/** Shown wherever a diagnosis percentage is: what the number is, and what it is not. */
export const SCORE_NOTE = "SIMULATED. The percentages are scores from models built and checked on simulated data only. They rank the faults this twin has a model of; they are not calibrated probabilities of a real engine's condition.";

const EFFECT_LABEL = { supports: "Supports", contradicts: "Contradicts", unexplained: "Unexplained" } as const;

export function EvidenceList({ lines, label, limit = 8 }: { lines: readonly EvidenceLine[]; label: string; limit?: number }) {
  if (!lines.length) return <p className={css.hint}>Every measurement is inside its healthy scatter. There is no evidence of a fault.</p>;
  return (
    <ul className={css.evidenceList} aria-label={label}>
      {lines.slice(0, limit).map((line) => (
        <li key={line.symptom} data-effect={line.effect}>
          <span className={css.evidenceMark}>{EFFECT_LABEL[line.effect]}</span>
          {line.text}
        </li>
      ))}
    </ul>
  );
}

/** What the consistency check found, in a sentence. */
function recognitionText(r: Recognition): string | null {
  const leftover = r.score >= 10 ? "more than ten times" : `${r.score.toFixed(1)} times`;
  const channel = r.channel ? CHANNEL_BY_ID[r.channel].label.toLowerCase() : "";
  switch (r.status) {
    case "explained":
      return `Consistency check passed: ${DIAGNOSIS_BY_ID[r.fault!].name.toLowerCase()} at about ${Math.round(Math.min(1, r.severity) * 100)} % severity accounts for the residuals. The largest left over is ${Math.round(r.score * 100)} % of the alarm level.`;
    case "unexplained":
      return `Consistency check not passed: no modelled fault accounts for the residuals at this moment. The largest left over, on ${channel}, is ${leftover} the alarm level. No cause is declared until one does.`;
    case "unrecognised":
      return `No modelled fault accounts for the residuals: the largest left over, on ${channel}, is ${leftover} the alarm level. The cause is outside the faults this twin has a model of. The ranking below is the nearest look-alike, not a diagnosis.`;
    case "held":
      return "Consistency check held: it needs good data and a steady engine.";
    default:
      return null;
  }
}

/** The ranked causes, how physics-based and learned reasoning each see the leader, and the evidence behind it. */
export function Diagnosis({ snapshot, count = 4 }: { snapshot: TwinSnapshot; count?: number }) {
  const top = snapshot.ranking[0];
  const def = DIAGNOSIS_BY_ID[top.id];
  const [why, setWhy] = useState(true);
  const toggle = () => {
    setWhy((w) => !w);
    trackAdvancedTwinOnce("diagnosis_opened", { fault: top.id });
  };
  const unrecognised = snapshot.recognition.status === "unrecognised" && top.physics !== null;
  const check = top.physics !== null ? recognitionText(snapshot.recognition) : null;
  return (
    <div className={css.diagnosis} data-recognition={snapshot.recognition.status}>
      {/* Only the conclusion is announced. The percentage moves several times a second, and is read on demand. */}
      <p className={css.verdict}>
        <span role="status">{unrecognised ? "Unrecognised fault pattern" : top.id === "nominal" ? "Nominal" : `Probable ${def.name}`}</span> <span>— {unrecognised ? "nearest look-alike " : ""}{Math.round(top.p * 100)} %</span>
      </p>
      <p className={css.note}>
        Confidence {snapshot.confidence} · {unrecognised ? `Nearest look-alike: ${def.name}` : def.location}
        {top.physics !== null && top.ml !== null ? ` · physics-based ${Math.round(top.physics * 100)} %, learned classifier ${Math.round(top.ml * 100)} %` : top.physics !== null ? " · physics-based reasoning only: the classifier could not score this input" : " · established by a direct check on the data"}
      </p>
      {check && (
        <p className={css.recognition} data-status={snapshot.recognition.status}>
          {check}
        </p>
      )}
      <div className={css.shares}>
        {snapshot.ranking.slice(0, count).map((r) => (
          <ShareBar key={r.id} label={DIAGNOSIS_BY_ID[r.id].name} value={r.p} strong={r.id === top.id} />
        ))}
      </div>
      <p className={css.hint}>{SCORE_NOTE}</p>
      <button type="button" className={css.ghost} aria-expanded={why} onClick={toggle}>
        Why this diagnosis?
      </button>
      {why && (
        <div className={css.why}>
          {top.physics === null ? (
            <ul className={css.evidenceList} aria-label="Data-quality findings">
              {snapshot.quality.notes.map((note) => (
                <li key={note} data-effect="supports">
                  <span className={css.evidenceMark}>Measured</span>
                  {note}
                </li>
              ))}
            </ul>
          ) : (
            <EvidenceList lines={snapshot.evidence} label={`Evidence for and against ${DIAGNOSIS_BY_ID[snapshot.explained].name}`} />
          )}
          {top.id !== "nominal" && (
            <p>
              <span className={css.groupLabel}>Recommended engineering investigation</span> {unrecognised ? snapshot.chain.find((stage) => stage.id === "investigation")?.text : def.investigation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Choose a fault and its severity, and inject it into the simulated system. */
export function FaultPicker() {
  const inject = useLabStore((s) => s.inject);
  const clearFaults = useLabStore((s) => s.clearFaults);
  const active = useLabStore((s) => s.snapshot?.faults ?? []);
  const [fault, setFault] = useState<FaultId>("pump_degradation");
  const [severity, setSeverity] = useState(80);
  const [onset, setOnset] = useState<FaultOnset>("gradual");
  const def = DIAGNOSIS_BY_ID[fault];
  const ramp = FAULT_DEFS[fault].rampSeconds;
  const classes = [...new Set(DIAGNOSES.filter((d) => d.cls !== "none").map((d) => d.cls as FaultClass))];
  return (
    <div className={css.picker2}>
      <label className={css.field}>
        <span className={css.groupLabel}>Fault to inject</span>
        <select value={fault} onChange={(e) => setFault(e.target.value as FaultId)} className={css.select}>
          {classes.map((cls) => (
            <optgroup key={cls} label={CLASS_LABEL[cls]}>
              {FAULT_IDS.filter((id) => DIAGNOSIS_BY_ID[id].cls === cls).map((id) => (
                <option key={id} value={id}>
                  {DIAGNOSIS_BY_ID[id].name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <label className={css.field}>
        <span className={css.groupLabel}>Severity · {severity} %</span>
        <input type="range" min={20} max={100} step={10} value={severity} onChange={(e) => setSeverity(Number(e.target.value))} className={css.range} aria-valuetext={`${severity} percent of the illustrative full magnitude`} />
      </label>
      <div className={css.field}>
        <span className={css.groupLabel} id="fault-onset-label">
          Onset
        </span>
        <span className={css.segment} role="group" aria-labelledby="fault-onset-label">
          <button type="button" aria-pressed={ramp > 0 && onset === "gradual"} disabled={ramp === 0} onClick={() => setOnset("gradual")}>
            Gradual{ramp > 0 ? ` · ${ramp} s` : ""}
          </button>
          <button type="button" aria-pressed={ramp === 0 || onset === "abrupt"} onClick={() => setOnset("abrupt")}>
            Abrupt
          </button>
        </span>
      </div>
      <p className={css.hint}>
        {def.effect} {ramp === 0 ? "A data-path fault is simply present or absent." : onset === "abrupt" ? "Abrupt: the full severity arrives between one sample and the next. This is the case the rate-of-change detector exists for; it fires when the step moves chamber pressure enough." : `Gradual: the fault grows to its severity over ${ramp} s. The rate-of-change detector is expected to stay silent; the cumulative and residual detectors catch it.`}
      </p>
      <div className={css.options}>
        <button type="button" className={css.primary} onClick={() => inject(fault, severity / 100, ramp === 0 ? "abrupt" : onset)}>
          <FlaskConical size={14} aria-hidden="true" /> Inject fault
        </button>
        <button type="button" className={css.ghost} onClick={clearFaults} disabled={active.length === 0}>
          <RotateCcw size={13} aria-hidden="true" /> Remove {active.length > 1 ? "faults" : "fault"}
        </button>
      </div>
      <p className={css.hint}>One fault at a time: injecting replaces the active fault and, if the twin is not at its healthy baseline, restarts the run from it at the present throttle. Evidence from the last fault is never credited to the next.</p>
      {active.length > 0 && (
        <ul className={css.activeFaults} aria-label="Active faults">
          {active.map((f) => (
            <li key={f.id}>
              <span className={css.tag}>INJECTED</span> {DIAGNOSIS_BY_ID[f.id].name} · {f.onset} onset · severity {Math.round(f.severity * 100)} % of {Math.round(f.target * 100)} %
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
