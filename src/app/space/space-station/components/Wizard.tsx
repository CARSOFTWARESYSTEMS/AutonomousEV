"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import styles from "../station.module.css";

/**
 * Guided workflow for phones: one group of inputs per step, then the result.
 * On larger screens every step is shown at once beside the result, as before.
 */
export default function Wizard({ label, steps, summaryTitle, summary }: { label: string; steps: { title: string; content: React.ReactNode }[]; summaryTitle: string; summary: React.ReactNode }) {
  const [step, setStep] = useState(0);
  const total = steps.length + 1;
  const final = step === steps.length;
  const top = useRef<HTMLDivElement>(null);
  const go = (n: number) => {
    setStep(n);
    top.current?.scrollIntoView?.({ block: "nearest" });
  };
  return (
    <div className={styles.simBody} data-wizard="" data-final={final}>
      <div className={styles.simControls} ref={top}>
        <ol className={styles.stepper} aria-label={`${label} progress`}>
          {[...steps.map((s) => s.title), summaryTitle].map((t, i) => (
            <li key={t} aria-current={i === step ? "step" : undefined} data-done={i < step || undefined}>
              <button type="button" onClick={() => go(i)} aria-label={`Step ${i + 1} of ${total}: ${t}`}>
                {i + 1}
              </button>
            </li>
          ))}
        </ol>
        <p className={styles.stepTitle} aria-live="polite">
          Step {step + 1} of {total} · {final ? summaryTitle : steps[step].title}
        </p>
        {steps.map((s, i) => (
          <fieldset key={s.title} className={styles.wizardStep} data-active={i === step}>
            <legend>{s.title}</legend>
            {s.content}
          </fieldset>
        ))}
        <div className={styles.wizardNav}>
          <button type="button" className={styles.button} onClick={() => go(step - 1)} disabled={step === 0}>
            <ChevronLeft size={16} aria-hidden="true" /> Back
          </button>
          {final ? (
            <button type="button" className={styles.button} onClick={() => go(0)}>
              <RotateCcw size={16} aria-hidden="true" /> Start over
            </button>
          ) : (
            <button type="button" className={styles.primaryButton} onClick={() => go(step + 1)}>
              {step === steps.length - 1 ? `See ${summaryTitle.toLowerCase()}` : "Next"} <ChevronRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div className={styles.simOutput} aria-live="polite">
        {summary}
      </div>
    </div>
  );
}
