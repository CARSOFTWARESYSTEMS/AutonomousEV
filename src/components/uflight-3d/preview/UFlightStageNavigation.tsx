"use client";
// 01 · Discover — 02 · Systems — 03 · Health — 04 · Digital Twin.
// Ordinary toggle buttons: reachable by Tab, operated by Enter, Space or touch;
// the pressed one is the stage on screen.
import { STAGES } from "./stages";
import styles from "./preview.module.css";

export default function UFlightStageNavigation({ stage, onSelect }: { stage: number; onSelect: (stage: number) => void }) {
  return (
    <div className={styles.nav} role="group" aria-label="Preview stages">
      {STAGES.map((s, i) => (
        <button key={s.id} type="button" className={styles.navBtn} aria-pressed={stage === i} onClick={() => onSelect(i)}>
          <span className={styles.navNum}>{s.number}</span>
          <span className={styles.navSep} aria-hidden="true">
            ·
          </span>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}
