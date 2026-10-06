"use client";

import { useRef, useState } from "react";
import { trackAqip } from "../analytics";
import { SIM_RECORD, SIM_STEPS, type SimField, type SimStep } from "../data/product";
import css from "../interactive.module.css";

const ACTOR_LINE: Record<SimStep["actor"], string> = {
  System: "System records",
  AI: "AI interprets",
  Human: "Human approves",
  Software: "Software proves",
};

/** The value a record field shows at a step, and whether it changed at exactly that step. */
function valueAt(field: SimField, step: number) {
  let value: string | null = null;
  let changedAt = 0;
  for (const [from, text] of field.values) {
    if (from <= step) {
      value = text;
      changedAt = from;
    }
  }
  return { value, isNew: changedAt === step };
}

/**
 * Follows one synthetic characteristic through the eight steps of the digital
 * thread. The record on the right fills in as the reader presses Next; nothing
 * here is real data, a real drawing or a real approval.
 */
export default function DigitalThreadSimulator() {
  const [step, setStep] = useState(1);
  const started = useRef(false);
  const total = SIM_STEPS.length;
  const current = SIM_STEPS[step - 1];

  const go = (next: number) => {
    if (next > step && !started.current) {
      started.current = true;
      trackAqip("aqip_digital_thread_start");
    }
    if (next === total && step !== total) trackAqip("aqip_digital_thread_complete");
    setStep(next);
  };

  return (
    <div className={css.sim}>
      <ol className={css.simSteps} aria-label="Steps of the demonstration">
        {SIM_STEPS.map((item, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "current" : "todo";
          return (
            <li key={item.title} className={css.simStep} data-state={state} aria-current={n === step ? "step" : undefined}>
              <span className={css.simNum} aria-hidden="true">
                {n < step ? "✓" : n}
              </span>
              <span className={css.simStepLabel}>
                <span className={css.srOnly}>{state === "done" ? "Completed: " : state === "current" ? "Current: " : "Not started: "}</span>
                {item.title}
              </span>
            </li>
          );
        })}
      </ol>

      <div className={css.simStage}>
        <div className={css.simNarrative} aria-live="polite">
          <p className={css.simCount}>
            Step {step} of {total} <span className={css.simActor} data-actor={current.actor}>{ACTOR_LINE[current.actor]}</span>
          </p>
          <h4 className={css.simTitle}>{current.title}</h4>
          <p className={css.simText}>{current.text}</p>
        </div>

        {/* A form with autoComplete="off", so Firefox does not restore the buttons' disabled state on reload. */}
        <form className={css.simControls} autoComplete="off" onSubmit={(event) => event.preventDefault()} aria-label="Demonstration controls">
          <button type="button" className={css.button} onClick={() => go(step - 1)} disabled={step === 1}>
            Back
          </button>
          <button type="button" className={css.buttonPrimary} onClick={() => go(step + 1)} disabled={step === total}>
            Next
          </button>
          <button type="button" className={css.button} onClick={() => go(1)} disabled={step === 1}>
            Reset
          </button>
        </form>

        <dl className={css.simRecord} aria-label="Record for one characteristic">
          {SIM_RECORD.map((field) => {
            const { value, isNew } = valueAt(field, step);
            return (
              <div key={field.label} className={css.simField} data-filled={value ? "" : undefined} data-new={isNew ? "" : undefined}>
                <dt>{field.label}</dt>
                <dd>{value ?? "Pending"}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
