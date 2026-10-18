"use client";
// Inputs for the real workflow. Every field has a value and a data-origin
// state; an empty field is NOT MEASURED, never a demo value.
import { useId } from "react";
import { MEASUREMENTS, OBSERVATIONS } from "@/data/ev-battery-toolkit/fields";
import { PROVENANCE, REAL_FIELD_PROVENANCE } from "@/lib/ev-battery-toolkit/provenance";
import type { DiagnosticMeasurement, DiagnosticObservation, MeasurementKey, ObservationKey, Provenance } from "@/lib/ev-battery-toolkit/types";
import css from "../diagnosis.module.css";

const EMPTY: Provenance[] = ["NOT_MEASURED", "NOT_AVAILABLE", "UNKNOWN"];

function ProvenanceSelect({ id, value, onChange, label }: { id: string; value: Provenance; onChange: (p: Provenance) => void; label: string }) {
  return (
    <select id={id} className={css.provSelect} value={value} onChange={(e) => onChange(e.target.value as Provenance)} aria-label={`${label} — data origin`} data-family={PROVENANCE[value].family}>
      {REAL_FIELD_PROVENANCE.map((p) => (
        <option key={p} value={p}>
          {PROVENANCE[p].label}
        </option>
      ))}
    </select>
  );
}

export function MeasurementInput({ name, value, onChange }: { name: MeasurementKey; value: DiagnosticMeasurement | undefined; onChange: (m: DiagnosticMeasurement) => void }) {
  const f = MEASUREMENTS[name];
  const id = useId();
  const provenance = value?.provenance ?? "NOT_MEASURED";
  const text = value?.value !== null && value?.value !== undefined && Number.isFinite(value.value) ? String(value.value) : "";
  return (
    <div className={css.fieldRow}>
      <label htmlFor={id} className={css.fieldLabel}>
        {f.label} <span className={css.unit}>({f.unit})</span>
        {f.hint ? <span className={css.hint}>{f.hint}</span> : null}
      </label>
      <div className={css.fieldControls}>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step="any"
          value={text}
          placeholder="NOT MEASURED"
          onChange={(e) => {
            const raw = e.target.value;
            const n = raw === "" ? null : Number(raw);
            if (n === null || !Number.isFinite(n)) return onChange({ key: name, value: null, provenance: "NOT_MEASURED" });
            onChange({ key: name, value: n, provenance: EMPTY.includes(provenance) ? "MEASURED" : provenance });
          }}
        />
        <ProvenanceSelect id={`${id}-p`} label={f.label} value={provenance} onChange={(p) => onChange({ key: name, value: EMPTY.includes(p) ? null : (value?.value ?? null), provenance: p })} />
      </div>
    </div>
  );
}

export function ObservationInput({ name, value, onChange }: { name: ObservationKey; value: DiagnosticObservation | undefined; onChange: (o: DiagnosticObservation) => void }) {
  const f = OBSERVATIONS[name];
  const id = useId();
  const provenance = value?.provenance ?? "NOT_MEASURED";
  const current = value?.value ?? "";
  const set = (v: string) => onChange({ key: name, value: v || null, provenance: v ? (EMPTY.includes(provenance) ? "USER_ENTERED" : provenance) : "NOT_MEASURED" });
  return (
    <div className={css.fieldRow}>
      <label htmlFor={id} className={css.fieldLabel}>
        {f.label}
      </label>
      <div className={css.fieldControls}>
        {f.options.length ? (
          <select id={id} value={current} onChange={(e) => set(e.target.value)}>
            <option value="">NOT RECORDED</option>
            {f.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <input id={id} type="text" value={current} placeholder="e.g. codes as shown by the tool, or None" maxLength={120} onChange={(e) => set(e.target.value)} />
        )}
        <ProvenanceSelect id={`${id}-p`} label={f.label} value={provenance} onChange={(p) => onChange({ key: name, value: EMPTY.includes(p) ? null : (value?.value ?? null), provenance: p })} />
      </div>
    </div>
  );
}
