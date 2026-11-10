"use client";
import { LEVELS, LEVEL_ORDER } from "../data/curriculum";
import { setLevel, useLevel } from "@/components/space-academy/store";
import { academyEvent } from "@/components/space-academy/analytics";
import styles from "../academy.module.css";

/** Ages 14–16 / 17–18. The choice applies across the Academy and is kept in this browser. */
export default function LevelSwitch({ placement }: { placement: string }) {
  const level = useLevel();
  return (
    <div className={styles.levelSwitch} role="group" aria-label="Learning level">
      <span className={styles.levelLabel}>I am</span>
      {LEVEL_ORDER.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={level === l}
          className={styles.levelButton}
          onClick={() => {
            if (level === l) return;
            setLevel(l);
            academyEvent("academy_level_change", { level: l, placement });
          }}
        >
          <span className={styles.levelAges}>{LEVELS[l].label}</span>
          <span className={styles.levelName}>{LEVELS[l].name}</span>
        </button>
      ))}
    </div>
  );
}
