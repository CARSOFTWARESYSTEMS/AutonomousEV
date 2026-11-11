"use client";
import { Check } from "lucide-react";
import { LEVELS, LEVEL_ORDER, type Level } from "../data/curriculum";
import { setLevel, useLevel } from "@/components/space-academy/store";
import { academyEvent } from "@/components/space-academy/analytics";
import styles from "../academy.module.css";

/** What changes between the two levels, in three lines each. */
const DIFFERENCES: Record<Level, string[]> = {
  foundation: ["Plain-language explanations and worked numbers", "Arithmetic, ratios and simple formulas", "Challenges that check you understand the idea"],
  advanced: ["Derivations and standard engineering equations", "Margins, trade studies and worst cases", "Stricter pass criteria in every mission"],
};

/**
 * The two learner pathways. Choosing one sets the level for every track and
 * mission (kept in this browser only); either can be changed at any time.
 */
export default function LearnerPathways() {
  const level = useLevel();
  return (
    <div className={styles.pathways} role="group" aria-label="Learner pathway">
      {LEVEL_ORDER.map((l) => {
        const selected = level === l;
        return (
          <article key={l} className={styles.pathwayCard} data-level={l} data-selected={selected || undefined}>
            <button
              type="button"
              className={styles.pathwayChoose}
              aria-pressed={selected}
              onClick={() => {
                if (selected) return;
                setLevel(l);
                academyEvent("academy_level_change", { level: l, placement: "pathways" });
              }}
            >
              <span className={styles.pathwayRadio} aria-hidden="true">
                {selected && <Check size={14} />}
              </span>
              <span className={styles.pathwayChooseText}>
                <span className={styles.pathwayAges}>{LEVELS[l].label}</span>
                <span className={styles.pathwayName}>{LEVELS[l].name} pathway</span>
              </span>
            </button>
            <p>{LEVELS[l].summary}</p>
            <ul className={styles.checkList}>
              {DIFFERENCES[l].map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
