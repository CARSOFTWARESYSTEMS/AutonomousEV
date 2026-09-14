"use client";
import { useState } from "react";
import { SYSTEM_DIAGRAM_STAGES } from "../applicationsData";
import { useViewMode } from "./ViewProvider";
import styles from "../everyday-applications.module.css";

export default function SystemDiagram() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { view } = useViewMode();
  const active = SYSTEM_DIAGRAM_STAGES[activeIndex];

  return (
    <div>
      <div className={styles.phaseRail} role="tablist" aria-label="Space value chain stages">
        {SYSTEM_DIAGRAM_STAGES.map((stage, i) => (
          <button
            key={stage.id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            className={styles.phaseChip}
            onClick={() => setActiveIndex(i)}
          >
            {stage.plainLabel}
          </button>
        ))}
      </div>
      <div className={styles.phasePanel} role="tabpanel" aria-live="polite">
        <h3>{active.plainLabel}</h3>
        {view === "engineering" && <p className={styles.formNote} style={{ marginTop: -6 }}>{active.technicalLabel}</p>}
        <p>{active.description}</p>
        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            disabled={activeIndex === 0}
          >
            ← Previous stage
          </button>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => setActiveIndex((i) => Math.min(SYSTEM_DIAGRAM_STAGES.length - 1, i + 1))}
            disabled={activeIndex === SYSTEM_DIAGRAM_STAGES.length - 1}
          >
            Next stage →
          </button>
        </div>
      </div>
      <p className={styles.formNote} style={{ marginTop: 16 }}>
        Rockets provide access to space. Satellites create services from space. Data becomes valuable only when it
        improves a decision.
      </p>
    </div>
  );
}
