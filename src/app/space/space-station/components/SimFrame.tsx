"use client";
import { useId, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useMode } from "./ModeProvider";
import { source, type SourceId } from "../data/sources";
import { EDU_LABEL } from "./ui";
import styles from "../station.module.css";

export type View = "simple" | "engineering";

export interface Transparency {
  assumptions: string[];
  equations: { expr: string; note?: string }[];
  limitations: string[];
  sources: SourceId[];
}

/**
 * Common shell for every simulator: title, educational label, a local
 * Simple | Engineering toggle that follows the page mode until the user
 * overrides it, and an always-available transparency panel.
 */
export function SimFrame({
  title,
  icon: Icon,
  transparency,
  children,
}: {
  title: string;
  icon: LucideIcon;
  transparency: Transparency;
  children: (view: View) => React.ReactNode;
}) {
  const { mode } = useMode();
  const [override, setOverride] = useState<View | null>(null);
  const view: View = override ?? (mode === "learn" ? "simple" : "engineering");
  return (
    <div className={styles.sim}>
      <div className={styles.simHead}>
        <div>
          <h3>
            <Icon size={18} aria-hidden="true" /> {title}
          </h3>
          <span className={styles.simLabel}>{EDU_LABEL}</span>
        </div>
        <div className={styles.segmented} role="group" aria-label={`${title} view`}>
          {(["simple", "engineering"] as View[]).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setOverride(v)}>
              {v === "simple" ? "Simple" : "Engineering"}
            </button>
          ))}
        </div>
      </div>
      {children(view)}
      {/* Remounts on view change: open by default in Engineering view, closed in Simple. */}
      <details key={view} className={styles.transparency} open={view === "engineering"}>
        <summary>Show engineering: assumptions, equations, limitations &amp; sources</summary>
        <div>
          <div>
            <h4>Assumptions</h4>
            <ul>
              {transparency.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Equations</h4>
            {transparency.equations.map((e) => (
              <code key={e.expr} className={styles.equation}>
                {e.expr}
                {e.note && <small>{e.note}</small>}
              </code>
            ))}
          </div>
          <div>
            <h4>Limitations</h4>
            <ul>
              {transparency.limitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Source</h4>
            <ul>
              {transparency.sources.map((id) => {
                const s = source(id);
                return (
                  <li key={id}>
                    <a className={styles.inlineLink} href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.org}: {s.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  help,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  help?: string;
  format?: (v: number) => string;
}) {
  const id = useId();
  const shown = format ? format(value) : `${value}${unit ? ` ${unit}` : ""}`;
  return (
    <div className={styles.field}>
      <span>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{shown}</output>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={shown}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {help && <small className={styles.fieldHelp}>{help}</small>}
    </div>
  );
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[] | readonly T[];
  onChange: (v: T) => void;
}) {
  const id = useId();
  const opts = (options as readonly (T | { value: T; label: string })[]).map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <div className={styles.field}>
      <span>
        <label htmlFor={id}>{label}</label>
      </span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={styles.check}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function Metric({ label, value, unit, tone }: { label: string; value: string; unit?: string; tone?: "ok" | "warn" | "bad" }) {
  return (
    <div className={styles.metric} data-tone={tone}>
      <span>{label}</span>
      <strong>
        {value}
        {unit && <small>{unit}</small>}
      </strong>
    </div>
  );
}

export const fmt = (v: number, digits = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits }) : "—";
