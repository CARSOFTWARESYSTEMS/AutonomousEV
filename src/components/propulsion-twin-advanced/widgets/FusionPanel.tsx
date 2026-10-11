"use client";
// The diagnostic reasoning panel: set what each measurement shows, by hand, and
// watch the ranking of probable causes change. It runs the same physics-based
// pattern matching as the live twin, with nothing simulated behind it, to make
// one point: a single measurement does not determine system health.
import { useState } from "react";
import { trackAdvancedTwinOnce } from "../analytics";
import { PANEL_EVIDENCE } from "../data/fdir";
import { FUSION_EXAMPLE } from "../data/twin";
import { DIAGNOSIS_BY_ID, PHYSICAL_DIAGNOSES, type SymptomId, type Symptoms, explain, physicsProbabilities, zeroSymptoms } from "../simulation/isolation";
import { ShareBar } from "../ui/charts";
import css from "../advancedTwin.module.css";

/** What a measurement shows. A measurement that has not been checked has no setting: it is neither for nor against anything. */
type Setting = -1 | 0 | 1;
const GRADE = 0.9;

const PRESETS: readonly { id: string; label: string; set: Partial<Record<SymptomId, Setting>> }[] = [
  { id: "alone", label: "Low chamber pressure, nothing else known", set: { pc: -1, thrust: -1 } },
  { id: "valve", label: "…plus normal pump discharge, abnormal valve position, reduced flow", set: { pc: -1, thrust: -1, p_out_ox: 0, head_ox: 0, valve_pos: -1, m_fu: -1 } },
  { id: "pump", label: "…plus low pump discharge, normal valve position and inlet pressure", set: { pc: -1, thrust: -1, p_out_ox: -1, head_ox: -1, m_ox: -1, valve_pos: 0, p_in_ox: 0, vib: 0 } },
  { id: "sensor", label: "Sensors A and B disagree, thrust unchanged", set: { pc_ab: -1, thrust: 0 } },
];

export default function FusionPanel() {
  const [settings, setSettings] = useState<Partial<Record<SymptomId, Setting>>>(PRESETS[0].set);

  const symptoms: Symptoms = zeroSymptoms();
  for (const [id, value] of Object.entries(settings) as [SymptomId, Setting][]) symptoms[id] = value * GRADE;
  const known = new Set(Object.keys(settings) as SymptomId[]);
  const probabilities = physicsProbabilities(symptoms, known);
  const ranked = PHYSICAL_DIAGNOSES.map((id) => ({ id, p: probabilities[id] })).sort((a, b) => b.p - a.p);
  const top = ranked[0];
  const lines = explain(top.id, symptoms, known);

  /** Sets what a measurement shows; choosing the same setting again returns it to not checked. */
  const set = (id: SymptomId, value: Setting) => {
    setSettings((s) => {
      const next = { ...s };
      if (next[id] === value) delete next[id];
      else next[id] = value;
      return next;
    });
    trackAdvancedTwinOnce("diagnosis_opened", { fault: "manual_panel" });
  };

  return (
    <div className={css.fusion}>
      <div className={css.fusionInputs}>
        <p className={css.lead}>{FUSION_EXAMPLE}</p>
        <div className={css.group}>
          <p className={css.groupLabel}>Start from</p>
          <div className={css.options}>
            {PRESETS.map((preset) => (
              <button key={preset.id} type="button" className={css.option} onClick={() => setSettings(preset.set)}>
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        <ul className={css.evidenceInputs} aria-label="Evidence">
          {PANEL_EVIDENCE.map((item) => {
            const value = settings[item.symptom];
            return (
              <li key={item.symptom} data-known={value !== undefined || undefined}>
                <span className={css.evidenceName}>
                  {item.label}
                  {value === undefined && <span className={css.muted}> · not checked</span>}
                </span>
                <span className={css.segment} role="group" aria-label={item.label}>
                  {item.low && (
                    <button type="button" aria-pressed={value === -1} onClick={() => set(item.symptom, -1)}>
                      {item.low}
                    </button>
                  )}
                  <button type="button" aria-pressed={value === 0} onClick={() => set(item.symptom, 0)}>
                    Normal
                  </button>
                  {item.high && (
                    <button type="button" aria-pressed={value === 1} onClick={() => set(item.symptom, 1)}>
                      {item.high}
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={css.fusionOutput} role="status" aria-label="Ranked probable causes">
        <p className={css.groupLabel}>Probable cause, from {known.size} of {PANEL_EVIDENCE.length} measurements checked</p>
        <p className={css.verdict}>
          {top.p < 0.6 ? "Undetermined" : DIAGNOSIS_BY_ID[top.id].name} <span>{top.p < 0.6 ? "" : `${Math.round(top.p * 100)} %`}</span>
        </p>
        <p className={css.hint}>{top.p < 0.6 ? "No candidate stands out. More evidence is needed before anything is declared: check another measurement." : DIAGNOSIS_BY_ID[top.id].effect}</p>
        <div className={css.shares}>
          {ranked.slice(0, 5).map((r) => (
            <ShareBar key={r.id} label={DIAGNOSIS_BY_ID[r.id].name} value={r.p} strong={r.id === top.id} />
          ))}
        </div>
        {lines.length > 0 && (
          <ul className={css.evidenceList} aria-label={`Evidence for and against ${DIAGNOSIS_BY_ID[top.id].name}`}>
            {lines.slice(0, 7).map((line) => (
              <li key={line.symptom} data-effect={line.effect}>
                <span className={css.evidenceMark}>{line.effect === "supports" ? "Supports" : line.effect === "contradicts" ? "Contradicts" : "Unexplained"}</span>
                {line.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
