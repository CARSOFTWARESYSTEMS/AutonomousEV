"use client";
import { useState } from "react";
import { MATURITY_PATHWAY, OPPORTUNITY_CATEGORIES } from "../rocketData";
import styles from "../model-rocketry.module.css";

export default function EnterpriseMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = OPPORTUNITY_CATEGORIES.find((c) => c.id === selectedId) ?? null;

  return (
    <div>
      <h4 style={{ marginBottom: 12 }}>Maturity pathway</h4>
      <div className={styles.phaseRail} role="list" aria-label="Maturity pathway from learning to enterprise" style={{ marginBottom: 28 }}>
        {MATURITY_PATHWAY.map((stage, i) => (
          <span key={stage} className={styles.phaseChip} role="listitem" aria-current={undefined}>
            {i + 1}. {stage}
          </span>
        ))}
      </div>

      <h4 style={{ marginBottom: 12 }}>Startup opportunity categories</h4>
      <p style={{ marginBottom: 16 }}>
        Select a category to see an illustrative problem, potential customer, prototype idea and validation step.
        These are directional examples, not guarantees of revenue or market fit.
      </p>
      <div className={styles.careerGrid}>
        {OPPORTUNITY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={styles.systemMemberButton}
            style={{
              textAlign: "left",
              border: "1px solid var(--space-border)",
              borderRadius: 12,
              padding: 14,
              background: cat.id === selectedId ? "var(--space-button-surface)" : "var(--space-surface)",
            }}
            aria-pressed={cat.id === selectedId}
            onClick={() => setSelectedId(cat.id === selectedId ? null : cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className={styles.componentPanel} style={{ marginTop: 16 }} aria-live="polite">
        {selected ? (
          <div>
            <h3>{selected.name}</h3>
            <div className={styles.componentField}>
              <h4>Problem</h4>
              <p>{selected.problem}</p>
            </div>
            <div className={styles.componentField}>
              <h4>Potential customer</h4>
              <p>{selected.customer}</p>
            </div>
            <div className={styles.componentField}>
              <h4>Prototype idea</h4>
              <p>{selected.prototypeIdea}</p>
            </div>
            <div className={styles.componentField}>
              <h4>Validation needed</h4>
              <p>{selected.validationNeeded}</p>
            </div>
            <div className={styles.componentField}>
              <h4>Illustrative business models</h4>
              <div className={styles.componentChips}>
                {selected.businessModels.map((b) => (
                  <span key={b} className={styles.componentChip}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className={styles.componentPanelEmpty}>Select a category above to explore it.</p>
        )}
      </div>
      <p className={styles.formNote} style={{ marginTop: 16 }}>
        Aerospace commercialisation requires validation, safety, regulation, documentation, genuine customer need
        and reliability. None of the above is a guarantee of revenue, funding or market success.
      </p>
    </div>
  );
}
