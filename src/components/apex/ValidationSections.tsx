import type { CSSProperties } from "react";
import { CONFIDENCE_LADDER, HIL_CHAIN, QUALITY_THREAD, TEST_CATEGORIES, VIRTUAL_TO_PHYSICAL } from "@/data/apex/validation";
import { EvidenceBadge } from "./EvidenceBadge";
import { InView } from "./InView";
import styles from "./apex.module.css";
import validation from "./validation.module.css";

/** Confidence accumulates from material to flight. */
export function ConfidenceLadder() {
  return (
    <div className={validation.ladderWrap}>
      <ol className={validation.ladder} aria-label="Confidence ladder, from material to flight">
        {[...CONFIDENCE_LADDER].reverse().map((rung, i) => {
          const level = CONFIDENCE_LADDER.length - 1 - i;
          return (
            <li key={rung.id} className={validation.rung} style={{ "--level": level } as CSSProperties}>
              <span className={validation.rungIndex}>{String(level + 1).padStart(2, "0")}</span>
              <span style={{ display: "grid", gap: 2 }}>
                <span className={validation.rungLabel}>{rung.label}</span>
                <span className={validation.rungDetail}>{rung.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <div style={{ display: "grid", gap: 18 }}>
        <p className={styles.lead} style={{ color: "var(--apex-text)" }}>
          Confidence should be accumulated progressively through evidence rather than assumed at the final integrated level.
        </p>
        <p className={styles.body}>
          Each rung is cheaper to test than the one above it, and a problem found low on the ladder costs far less to fix. Flight is the last and most expensive
          evidence, not the first.
        </p>
      </div>
    </div>
  );
}

export function TestCategories() {
  return (
    <ul className={`${styles.ruleGrid} ${styles.cols4}`}>
      {TEST_CATEGORIES.map((category, i) => (
        <li key={category.id} className={styles.cell}>
          <span className={styles.specLabel}>{String(i + 1).padStart(2, "0")}</span>
          <h3 className={styles.h4}>{category.label}</h3>
          <p className={styles.small}>{category.detail}</p>
        </li>
      ))}
    </ul>
  );
}

export function HilDiagram() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <ol className={validation.hil} aria-label="Hardware-in-the-loop architecture">
        {HIL_CHAIN.map((step, i) => (
          <li key={step.id} className={validation.hilStep} data-real={step.real ? "" : undefined}>
            <span className={styles.specLabel}>{String(i + 1).padStart(2, "0")}</span>
            <span className={validation.hilLabel}>{step.label}</span>
            <span className={validation.hilKind}>{step.real ? "Real hardware / firmware" : "Simulated"}</span>
          </li>
        ))}
      </ol>
      <p className={styles.small}>
        The response feeds back into the simulator, closing the loop. Controllers and firmware are exercised against faults and edge cases long before they meet an
        engine or a vehicle.
      </p>
    </div>
  );
}

export function VirtualToPhysical() {
  return (
    <InView>
      <ol className={validation.v2p} aria-label="From simulation to flight">
        {VIRTUAL_TO_PHYSICAL.map((step, i) => (
          <li key={step.id} className={validation.v2pRow}>
            <span className={styles.specLabel}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ display: "grid", gap: 2 }}>
              <span className={styles.h4}>{step.label}</span>
              <span className={styles.small}>{step.detail}</span>
            </span>
            <span className={validation.v2pBar} aria-hidden="true">
              <span className={validation.v2pFill} style={{ "--w": `${Math.round(((i + 1) / VIRTUAL_TO_PHYSICAL.length) * 100)}%`, "--i": i } as CSSProperties} />
            </span>
          </li>
        ))}
      </ol>
      <div className={validation.v2pAxis}>
        <span>Physical evidence ↑</span>
        <span>Model confidence ↑</span>
        <span>System confidence ↑</span>
      </div>
      <div className={styles.chips} style={{ marginTop: 16, alignItems: "center" }}>
        <EvidenceBadge status="CONCEPT" label="Approach" />
        <span className={styles.small}>Not every step is implemented today. Each will be marked when APEX confirms it.</span>
      </div>
    </InView>
  );
}

export function QualityThread() {
  return (
    <ol className={validation.thread} aria-label="Digital quality thread">
      {QUALITY_THREAD.map((item, i) => (
        <li key={item} className={validation.threadItem}>
          <span className={validation.threadNode}>{item}</span>
          {i < QUALITY_THREAD.length - 1 && <span className={validation.threadLink} aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}
