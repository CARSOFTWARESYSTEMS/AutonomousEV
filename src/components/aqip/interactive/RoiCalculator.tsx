"use client";

import { useId, useRef, useState } from "react";
import { trackAqip } from "../analytics";
import { ROI_FIELDS } from "../data/business";
import { ROI_DEFAULTS, computeRoi, type RoiInputs } from "../logic/roi";
import css from "../interactive.module.css";

type Field = keyof RoiInputs;
type Draft = Record<Field, string>;

const asDraft = (inputs: RoiInputs) => Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, String(value)])) as Draft;

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const whole = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function payback(months: number | null) {
  if (months === null) return "Not recovered on these assumptions";
  if (months > 120) return "More than 10 years";
  return `${months.toFixed(1)} months`;
}

/**
 * A back-of-envelope return calculation. It runs in the browser; the figures a
 * visitor types are never stored or sent. Analytics learns only that the
 * calculator was used.
 */
export default function RoiCalculator() {
  const uid = useId();
  const [draft, setDraft] = useState<Draft>(() => asDraft(ROI_DEFAULTS));
  const started = useRef(false);
  const completed = useRef(false);

  const inputs = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, Number(value)])) as unknown as RoiInputs;
  const result = computeRoi(inputs);

  const change = (key: Field, value: string) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    if (started.current) return;
    started.current = true;
    trackAqip("aqip_roi_calculator_start");
  };

  const finish = () => {
    if (!started.current || completed.current) return;
    completed.current = true;
    trackAqip("aqip_roi_calculator_complete");
  };

  const outputs: readonly { label: string; value: string; strong?: boolean }[] = [
    { label: "Current annual effort", value: `${whole.format(result.annualHours)} hours` },
    { label: "Current annual engineering cost", value: rupees.format(result.annualCost) },
    { label: "Potential hours saved", value: `${whole.format(result.hoursSaved)} hours` },
    { label: "Potential cost saved", value: rupees.format(result.costSaved), strong: true },
    { label: "Indicative payback period", value: payback(result.paybackMonths), strong: true },
    { label: "Characteristics accounted for per year", value: whole.format(result.annualCharacteristics) },
  ];

  return (
    // autoComplete="off": Firefox otherwise restores a control's value, checked and disabled state on reload,
    // before React starts from its own initial state, leaving the two out of step.
    <form className={css.roi} autoComplete="off" onSubmit={(event) => event.preventDefault()} aria-label="ROI calculator">
      <div className={css.roiInputs}>
        {ROI_FIELDS.map((field) => (
          <div key={field.key} className={css.roiField}>
            <label htmlFor={`${uid}-${field.key}`}>{field.label}</label>
            <div className={css.roiControl}>
              <input
                id={`${uid}-${field.key}`}
                type="number"
                inputMode="decimal"
                min={0}
                max={field.max}
                step={field.step}
                value={draft[field.key]}
                onChange={(event) => change(field.key, event.target.value)}
                onBlur={finish}
              />
              <span aria-hidden="true">{field.unit}</span>
            </div>
          </div>
        ))}
        <button
          type="button"
          className={css.button}
          onClick={() => {
            setDraft(asDraft(ROI_DEFAULTS));
          }}
        >
          Reset to illustrative assumptions
        </button>
      </div>

      <div className={css.roiOutputs}>
        <dl aria-live="polite">
          {outputs.map((output) => (
            <div key={output.label} className={css.roiOutput} data-strong={output.strong ? "" : undefined}>
              <dt>{output.label}</dt>
              <dd>{output.value}</dd>
            </div>
          ))}
        </dl>
        <p className={css.privacyNote}>
          Potential cost saved = hours saved × loaded cost, plus the same expected reduction applied to rework and rejection cost. Calculated in your browser; nothing you enter is stored or sent.
        </p>
      </div>
    </form>
  );
}
