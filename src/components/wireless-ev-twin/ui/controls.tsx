"use client";
// Small, labelled controls. Every input says it is an INPUT, every model
// output says it is CALCULATED, every sensor value carries its data mode.
import { type ReactNode, useId } from "react";
import type { DataMode } from "@/lib/wireless-charging/sensors";
import ui from "../twin.module.css";

export function Tag({ kind }: { kind: "input" | "calculated" | DataMode }) {
  const label = kind === "input" ? "INPUT" : kind === "calculated" ? "CALCULATED" : kind;
  return (
    <span className={ui.tag} data-kind={kind}>
      {label}
    </span>
  );
}

export function Panel({ title, tag, children, actions }: { title: string; tag?: "input" | "calculated" | DataMode; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className={ui.panel} aria-label={title}>
      <header className={ui.panelHead}>
        <h3>{title}</h3>
        {tag && <Tag kind={tag} />}
        {actions}
      </header>
      {children}
    </section>
  );
}

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  /** Display scale: shown value = value × scale. */
  scale?: number;
  digits?: number;
  onChange: (v: number) => void;
  hint?: string;
}

export function Slider({ label, value, min, max, step, unit, scale = 1, digits, onChange, hint }: SliderProps) {
  const id = useId();
  const shown = value * scale;
  const d = digits ?? (step * scale >= 1 ? 0 : step * scale >= 0.1 ? 1 : 2);
  return (
    <div className={ui.slider}>
      <div className={ui.sliderHead}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>
          {shown.toFixed(d)}
          {unit ? <span> {unit}</span> : null}
        </output>
      </div>
      <input id={id} type="range" min={min * scale} max={max * scale} step={step * scale} value={shown} onChange={(e) => onChange(Number(e.target.value) / scale)} aria-describedby={hint ? `${id}-hint` : undefined} />
      {hint && (
        <p id={`${id}-hint`} className={ui.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint, danger }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string; danger?: boolean }) {
  const id = useId();
  return (
    <div className={ui.toggle} data-danger={danger || undefined}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id}>
        {label}
        {hint && <span className={ui.hint}>{hint}</span>}
      </label>
    </div>
  );
}

export function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { id: T; label: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div className={ui.select}>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** A labelled value. */
export function Readout({ label, value, unit, digits = 2, note, emphasis }: { label: string; value: number | string | null; unit?: string; digits?: number; note?: string; emphasis?: boolean }) {
  const text = value === null ? "—" : typeof value === "string" ? value : Number.isFinite(value) ? fmt(value, digits) : "—";
  return (
    <div className={ui.readout} data-emphasis={emphasis || undefined}>
      <dt>{label}</dt>
      <dd>
        {text}
        {unit && value !== null && <span>{` ${unit}`}</span>}
        {note && <small>{note}</small>}
      </dd>
    </div>
  );
}

export function fmt(v: number, digits = 2): string {
  if (!Number.isFinite(v)) return "—";
  const a = Math.abs(v);
  // Floating-point residue (such as 3e-109 kW of storage power) is zero, not a reading.
  if (a < 1e-30) return (0).toFixed(digits);
  if (a >= 1e6 || (a !== 0 && digits > 0 && a < 10 ** -digits)) return v.toExponential(Math.max(1, digits - 1));
  return v.toFixed(digits);
}

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className={ui.group}>
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

export function Segmented<T extends string>({ label, value, options, onChange, small }: { label: string; value: T; options: readonly { id: T; label: string }[]; onChange: (v: T) => void; small?: boolean }) {
  return (
    <div className={ui.segmented} role="radiogroup" aria-label={label} data-small={small || undefined}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Mode gating: shows children only at or above a depth. */
const DEPTH = { explore: 0, learn: 1, engineer: 2, research: 3 } as const;
export function AtDepth({ mode, min, children }: { mode: keyof typeof DEPTH; min: keyof typeof DEPTH; children: ReactNode }) {
  return DEPTH[mode] >= DEPTH[min] ? <>{children}</> : null;
}

/** A user-initiated file download. */
export function download(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
