"use client";
import { useState } from "react";
import { MISSION_WORKFLOW } from "../rocketData";
import styles from "../model-rocketry.module.css";

export default function MissionWorkflow() {
  const [activeId, setActiveId] = useState(MISSION_WORKFLOW[0].id);
  const active = MISSION_WORKFLOW.find((s) => s.id === activeId)!;

  return (
    <div>
      <div className={styles.workflowRail} role="tablist" aria-label="Mission-to-flight engineering workflow">
        {MISSION_WORKFLOW.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === activeId}
            className={styles.workflowStep}
            onClick={() => setActiveId(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>
      <dl className={styles.workflowDetail} aria-live="polite">
        <dt>Stage</dt>
        <dd>{active.name}</dd>
        <dt>Inputs</dt>
        <dd>{active.inputs}</dd>
        <dt>Outputs</dt>
        <dd>{active.outputs}</dd>
        <dt>Key engineering questions</dt>
        <dd>
          <ul>
            {active.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </dd>
        <dt>Common mistakes</dt>
        <dd>
          <ul>
            {active.mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </dd>
      </dl>
    </div>
  );
}
