"use client";
// Form controls, panels, tabs and figures shared by the workspace views.
// Every control has a visible label; ratings are radio groups; tabs follow the
// WAI-ARIA tabs pattern with arrow-key movement.
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { RATING_LABELS } from "../data/scoring";
import type { Rating } from "../types";
import css from "../workspace.module.css";

export function Panel({ title, kicker, actions, children, tone, id }: { title: ReactNode; kicker?: ReactNode; actions?: ReactNode; children: ReactNode; tone?: "accent" | "warn" | "quiet"; id?: string }) {
  return (
    <section className={css.panel} data-tone={tone} id={id}>
      <header className={css.panelHead}>
        <div>
          {kicker ? <p className={css.kicker}>{kicker}</p> : null}
          <h3 className={css.panelTitle}>{title}</h3>
        </div>
        {actions ? <div className={css.panelActions}>{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}

export function ViewHeader({ eyebrow, title, lede, children }: { eyebrow: string; title: string; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header className={css.viewHead}>
      <p className={css.eyebrow}>{eyebrow}</p>
      <h2 className={css.viewTitle} tabIndex={-1}>
        {title}
      </h2>
      {lede ? <p className={css.viewLede}>{lede}</p> : null}
      {children}
    </header>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "danger" | "synthetic"; children: ReactNode }) {
  return (
    <div className={css.notice} data-tone={tone}>
      {children}
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder, type = "text", hint, required }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: "text" | "date" | "url"; hint?: string; required?: boolean }) {
  const id = useId();
  return (
    <div className={css.field}>
      <label htmlFor={id} className={css.label}>
        {label}
        {required ? <span className={css.required}> (required)</span> : null}
      </label>
      <input id={id} className={css.input} type={type} value={value} placeholder={placeholder} autoComplete="off" aria-describedby={hint ? `${id}-hint` : undefined} onChange={(event) => onChange(event.target.value)} />
      {hint ? (
        <p id={`${id}-hint`} className={css.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 3, hint, required }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number; hint?: string; required?: boolean }) {
  const id = useId();
  return (
    <div className={css.field}>
      <label htmlFor={id} className={css.label}>
        {label}
        {required ? <span className={css.required}> (required)</span> : null}
      </label>
      <textarea id={id} className={css.textarea} value={value} rows={rows} placeholder={placeholder} autoComplete="off" aria-describedby={hint ? `${id}-hint` : undefined} onChange={(event) => onChange(event.target.value)} />
      {hint ? (
        <p id={`${id}-hint`} className={css.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function NumberField({ label, value, onChange, min = 0, max, step = 1, suffix, prefix, hint }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; suffix?: string; prefix?: string; hint?: string }) {
  const id = useId();
  return (
    <div className={css.field}>
      <label htmlFor={id} className={css.label}>
        {label}
      </label>
      <div className={css.numberWrap}>
        {prefix ? <span className={css.affix} aria-hidden="true">{prefix}</span> : null}
        <input
          id={id}
          className={css.input}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          autoComplete="off"
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(event) => {
            const next = event.target.valueAsNumber;
            onChange(Number.isFinite(next) ? next : 0);
          }}
        />
        {suffix ? <span className={css.affix} aria-hidden="true">{suffix}</span> : null}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className={css.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function SelectField<T extends string>({ label, value, onChange, options, hint }: { label: string; value: T; onChange: (value: T) => void; options: readonly { value: T; label: string; disabled?: boolean }[]; hint?: string }) {
  const id = useId();
  return (
    <div className={css.field}>
      <label htmlFor={id} className={css.label}>
        {label}
      </label>
      <select id={id} className={css.select} value={value} autoComplete="off" aria-describedby={hint ? `${id}-hint` : undefined} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={`${id}-hint`} className={css.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** A 0–5 rating as a radio group, named by the criterion and its weight. */
export function RatingField({ label, weight, value, onChange, readOnly }: { label: string; weight?: number; value: Rating; onChange: (value: Rating) => void; readOnly?: boolean }) {
  const id = useId();
  return (
    <fieldset className={css.rating} disabled={readOnly}>
      <legend className={css.ratingLegend}>
        <span>{label}</span>
        {weight !== undefined ? <span className={css.ratingWeight}>weight {weight}</span> : null}
      </legend>
      <div className={css.ratingScale}>
        {([0, 1, 2, 3, 4, 5] as Rating[]).map((n) => (
          <label key={n} className={css.ratingOption} title={RATING_LABELS[n]}>
            <input type="radio" name={id} value={n} checked={value === n} autoComplete="off" onChange={() => onChange(n)} />
            <span>{n}</span>
            <span className={css.srOnly}>{RATING_LABELS[n]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CheckItem({ checked, onChange, children, disabled }: { checked: boolean; onChange: (checked: boolean) => void; children: ReactNode; disabled?: boolean }) {
  return (
    <li className={css.checkItem} data-checked={checked ? "" : undefined}>
      <label>
        <input type="checkbox" checked={checked} disabled={disabled} autoComplete="off" onChange={(event) => onChange(event.target.checked)} />
        <span>{children}</span>
      </label>
    </li>
  );
}

export function Stat({ label, value, note, emphasis }: { label: string; value: ReactNode; note?: ReactNode; emphasis?: boolean }) {
  return (
    <div className={css.stat} data-emphasis={emphasis ? "" : undefined}>
      <dt className={css.statLabel}>{label}</dt>
      <dd className={css.statValue}>{value}</dd>
      {note ? <dd className={css.statNote}>{note}</dd> : null}
    </div>
  );
}

/** A 0–100 bar with its number written out beside it. */
export function Meter({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={css.meter}>
      <div className={css.meterTrack} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(clamped)}>
        <span className={css.meterFill} style={{ width: `${clamped}%` }} />
      </div>
      <span className={css.meterValue}>{Math.round(clamped)}</span>
    </div>
  );
}

export interface TabSpec {
  id: string;
  label: string;
  content: ReactNode;
}

/** WAI-ARIA tabs: arrow keys move between tabs, Home and End jump to the ends. */
export function Tabs({ label, tabs, onSelect }: { label: string; tabs: readonly TabSpec[]; onSelect?: (id: string) => void }) {
  const uid = useId();
  const [active, setActive] = useState(tabs[0]?.id);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const choose = (index: number) => {
    const tab = tabs[index];
    if (!tab) return;
    setActive(tab.id);
    onSelect?.(tab.id);
    refs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = tabs.length - 1;
    const target = event.key === "ArrowRight" ? (index === last ? 0 : index + 1) : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1) : event.key === "Home" ? 0 : event.key === "End" ? last : null;
    if (target === null) return;
    event.preventDefault();
    choose(target);
  };

  return (
    <div className={css.tabs}>
      <div role="tablist" aria-label={label} className={css.tabList}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`${uid}-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            className={css.tab}
            onClick={() => choose(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" id={`${uid}-panel-${tab.id}`} aria-labelledby={`${uid}-tab-${tab.id}`} hidden={active !== tab.id} tabIndex={0} className={css.tabPanel}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}

/** A plain bulleted list. */
export function List({ items, ordered }: { items: readonly ReactNode[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={ordered ? css.orderedList : css.list}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}

/** A random-enough id for a new record, stable once created. */
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const today = () => new Date().toISOString().slice(0, 10);
