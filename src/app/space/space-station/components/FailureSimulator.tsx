"use client";
import { useState } from "react";
import { Siren } from "lucide-react";
import { SCENARIOS, RESPONSE_PHASES } from "../data/operations";
import styles from "../station.module.css";

export default function FailureSimulator() {
  const [id, setId] = useState(SCENARIOS[0].id);
  const [phase, setPhase] = useState(0);
  const s = SCENARIOS.find((x) => x.id === id)!;
  return (
    <div className={styles.sim}>
      <div className={styles.simHead}>
        <div>
          <h3>
            <Siren size={18} aria-hidden="true" /> Failure &amp; Emergency Simulator
          </h3>
          <span className={styles.simLabel}>Systems-engineering view only — not an operational procedure.</span>
        </div>
      </div>
      <div className={styles.simWide}>
        <div className={styles.chips} role="group" aria-label="Scenario" style={{ marginBottom: 14 }}>
          {SCENARIOS.map((x) => (
            <button key={x.id} type="button" className={styles.chip} aria-pressed={x.id === id} onClick={() => { setId(x.id); setPhase(0); }}>
              {x.name}
            </button>
          ))}
        </div>
        <p>
          <b style={{ color: "var(--space-text)" }}>Hazard:</b> {s.hazard}
        </p>
        <ol className={styles.flow} aria-label="Response phases" style={{ margin: "12px 0" }}>
          {RESPONSE_PHASES.map((p, i) => (
            <li key={p} data-active={i === phase} aria-current={i === phase ? "step" : undefined}>
              <button type="button" className={styles.chip} aria-pressed={i === phase} onClick={() => setPhase(i)}>
                {i < phase ? "✓ " : ""}
                {p}
              </button>
            </li>
          ))}
        </ol>
        <div className={styles.card} aria-live="polite">
          <div className={styles.eyebrow}>
            Phase {phase + 1} of {RESPONSE_PHASES.length}
          </div>
          <h4>{RESPONSE_PHASES[phase]}</h4>
          <p>{s.phases[RESPONSE_PHASES[phase]]}</p>
          <div className={styles.presetRow}>
            <button type="button" className={styles.button} disabled={phase === 0} onClick={() => setPhase(phase - 1)}>
              Previous phase
            </button>
            <button type="button" className={styles.primaryButton} disabled={phase === RESPONSE_PHASES.length - 1} onClick={() => setPhase(phase + 1)}>
              Next phase
            </button>
          </div>
          {phase === RESPONSE_PHASES.length - 1 && (
            <p className={styles.callout}>Systems lesson: {s.lesson}</p>
          )}
        </div>
      </div>
    </div>
  );
}
