"use client";
// Controls shared by every mission. Native inputs throughout (range,
// radio), so keyboard, screen-reader and touch behaviour come for free.
import type { ReactNode } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import styles from "./lesson.module.css";

export function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  format = (v) => String(v),
  onChange,
  hint,
  disabled,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  /** Spoken and shown unit, e.g. "km", "%". */
  format?: (v: number) => string;
  onChange: (v: number) => void;
  hint?: ReactNode;
  disabled?: boolean;
}) {
  const text = `${format(value)}${unit ? ` ${unit}` : ""}`;
  return (
    <div className={styles.slider}>
      <div className={styles.sliderHead}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className={styles.sliderValue}>
          {text}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={text}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties}
      />
      <div className={styles.sliderRange} aria-hidden="true">
        <span>
          {format(min)} {unit}
        </span>
        <span>
          {format(max)} {unit}
        </span>
      </div>
      {hint && <p className={styles.sliderHint}>{hint}</p>}
    </div>
  );
}

export function Choice<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  columns = 1,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string; detail?: string; disabled?: boolean }[];
  value: T | null;
  onChange: (v: T) => void;
  columns?: 1 | 2 | 3;
}) {
  return (
    <fieldset className={styles.choice}>
      <legend>{legend}</legend>
      <div className={styles.choiceGrid} data-columns={columns}>
        {options.map((o) => (
          <label key={o.value} className={styles.choiceOption} data-checked={value === o.value} data-disabled={o.disabled || undefined}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} disabled={o.disabled} onChange={() => onChange(o.value)} />
            <span className={styles.choiceText}>
              <span className={styles.choiceLabel}>{o.label}</span>
              {o.detail && <span className={styles.choiceDetail}>{o.detail}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** An equation with its units and an explanation pitched at the learner's level. */
export function Equation({ name, expression, substitution, units, explain }: { name: string; expression: string; substitution?: string; units: string; explain: string }) {
  return (
    <div className={styles.equation} role="group" aria-label={`Equation: ${name}`}>
      <div className={styles.eqName}>{name}</div>
      <div className={styles.eqExpr}>{expression}</div>
      {substitution && <div className={styles.eqSub}>{substitution}</div>}
      <div className={styles.eqUnits}>{units}</div>
      <p className={styles.eqExplain}>{explain}</p>
    </div>
  );
}

export function Stat({ label, value, tone = "neutral", detail }: { label: string; value: string; tone?: "good" | "bad" | "warn" | "neutral"; detail?: string }) {
  return (
    <div className={styles.stat} data-tone={tone}>
      <dt>{label}</dt>
      <dd>
        {tone === "good" && <Check size={14} aria-label="OK" />}
        {tone === "bad" && <X size={14} aria-label="Not OK" />}
        {tone === "warn" && <AlertTriangle size={14} aria-label="Caution" />}
        <span>{value}</span>
      </dd>
      {detail && <dd className={styles.statDetail}>{detail}</dd>}
    </div>
  );
}

export function Stats({ children, label }: { children: ReactNode; label: string }) {
  return (
    <dl className={styles.stats} aria-label={label}>
      {children}
    </dl>
  );
}

export function SimTag({ children = "Simulated · illustrative values" }: { children?: ReactNode }) {
  return <span className={styles.simTag}>{children}</span>;
}

export function Toggles<T extends string>({
  legend,
  items,
  active,
  onToggle,
  note,
}: {
  legend: string;
  items: { id: T; name: string; effect: string }[];
  active: T[];
  onToggle: (id: T) => void;
  note?: ReactNode;
}) {
  return (
    <div className={styles.toggles} role="group" aria-label={legend}>
      <div className={styles.togglesHead}>
        <span>{legend}</span>
        <SimTag>Educational simulation only</SimTag>
      </div>
      {items.map((f) => {
        const on = active.includes(f.id);
        return (
          <button key={f.id} type="button" className={styles.faultButton} aria-pressed={on} onClick={() => onToggle(f.id)}>
            <span className={styles.faultSwitch} aria-hidden="true" />
            <span>
              <span className={styles.faultName}>{f.name}</span>
              <span className={styles.faultEffect}>{f.effect}</span>
            </span>
          </button>
        );
      })}
      {note && <p className={styles.sliderHint}>{note}</p>}
    </div>
  );
}

export function Explain({ children }: { children: ReactNode }) {
  return <div className={styles.explain}>{children}</div>;
}
