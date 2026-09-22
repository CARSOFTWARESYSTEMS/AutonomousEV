"use client";

import { useState } from "react";
import styles from "./page.module.css";

export type Week = {
  n: number;
  title: string;
  phase: string;
  learn: string[];
  build: string[];
  demonstrate: string[];
  submit: string[];
};

/**
 * Renders the 12-week plan as native <details> accordions (keyboard-
 * accessible, no JS required to read any of them) plus an Expand All /
 * Collapse All control pair. The controls are the only reason this is a
 * client component — everything else about the weekly cards stays as
 * plain, server-rendered markup.
 */
export default function WeekAccordions({ weeks }: { weeks: Week[] }) {
  const [openAll, setOpenAll] = useState<boolean | null>(null);

  return (
    <div>
      <div className={styles.accordionControls}>
        <button type="button" className={styles.accordionControlBtn} onClick={() => setOpenAll(true)}>
          Expand All
        </button>
        <button type="button" className={styles.accordionControlBtn} onClick={() => setOpenAll(false)}>
          Collapse All
        </button>
      </div>
      <div className={styles.accordionList}>
        {weeks.map((w) => (
          <details
            className={styles.accordionItem}
            key={`${w.n}-${String(openAll)}`}
            open={openAll === null ? w.n === 1 : openAll}
          >
            <summary className={styles.accordionSummary}>
              <span className={styles.accordionSummaryLeft}>
                <span className={styles.accordionWeekNum}>Week {w.n}</span>
                <span className={styles.accordionSummaryTitle}>{w.title}</span>
                <span className={styles.phaseBadgeOnAccordion}>{w.phase}</span>
              </span>
              <span className={styles.accordionChevron} aria-hidden="true">▾</span>
            </summary>
            <div className={styles.accordionBody}>
              <div className={styles.accordionBodyBlock}>
                <h4>Learn</h4>
                <ul>{w.learn.map((l, i) => <li key={i}>{l}</li>)}</ul>
              </div>
              <div className={styles.accordionBodyBlock}>
                <h4>Build</h4>
                <ul>{w.build.map((b, i) => <li key={i}>{b}</li>)}</ul>
              </div>
              <div className={styles.accordionBodyBlock}>
                <h4>Demonstrate</h4>
                <ul>{w.demonstrate.map((d, i) => <li key={i}>{d}</li>)}</ul>
              </div>
              <div className={styles.accordionBodyBlock}>
                <h4>Submit</h4>
                <ul>{w.submit.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
