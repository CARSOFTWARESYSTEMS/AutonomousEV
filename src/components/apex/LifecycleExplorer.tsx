"use client";

import { useState } from "react";
import { MISSION_TO_FLIGHT, PHASE_LABEL, type LifecycleNode, type LifecyclePhase } from "@/data/apex/lifecycle";
import { capability, partnersForCapability } from "@/data/apex/partner-capabilities";
import { trackApex } from "./analytics";
import { usePanel } from "./panelContext";
import styles from "./apex.module.css";
import validation from "./validation.module.css";

function Detail({ node, index }: { node: LifecycleNode; index: number }) {
  const { open } = usePanel();
  const partnerNames = [...new Set(node.capabilityIds.flatMap((id) => partnersForCapability(id).map(({ partner }) => partner.shortName)))];
  return (
    <div className={validation.detailCard}>
      <div className={validation.detailHead}>
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowIndex}>{String(index + 1).padStart(2, "0")}</span>
          <span className={styles.eyebrowRule} aria-hidden="true" />
          {PHASE_LABEL[node.phase]}
        </span>
        <h3 className={validation.detailTitle}>{node.label}</h3>
      </div>
      <dl className={validation.detailRows}>
        <div className={validation.detailRow}>
          <dt className={validation.detailLabel}>What happens</dt>
          <dd className={validation.detailText}>{node.happens}</dd>
        </div>
        <div className={validation.detailRow}>
          <dt className={validation.detailLabel}>Deliverable</dt>
          <dd className={validation.detailText}>{node.deliverable}</dd>
        </div>
        <div className={validation.detailRow}>
          <dt className={validation.detailLabel}>Evidence</dt>
          <dd className={validation.detailText}>{node.evidence}</dd>
        </div>
        <div className={validation.detailRow}>
          <dt className={validation.detailLabel}>Capabilities needed</dt>
          <dd className={styles.chips}>
            {node.capabilityIds.map((id) => (
              <button key={id} type="button" className={styles.chip} onClick={(event) => open({ kind: "capability", id }, event.currentTarget)}>
                {capability(id).name}
              </button>
            ))}
          </dd>
        </div>
        <div className={validation.detailRow}>
          <dt className={validation.detailLabel}>Partners</dt>
          <dd className={validation.detailText}>{partnerNames.length ? `${partnerNames.join(" · ")} · open to more` : "Partner required — open to multiple partners"}</dd>
        </div>
      </dl>
    </div>
  );
}

const PHASES: (LifecyclePhase | "all")[] = ["all", "engineer", "build", "prove", "improve"];

/** From mission to flight: one lifecycle, each stage with its deliverable, evidence, capabilities and partners. */
export function LifecycleExplorer() {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<LifecyclePhase | "all">("all");
  const node = MISSION_TO_FLIGHT[active];

  const select = (i: number) => {
    setActive(i);
    trackApex("apex_lifecycle_open", { stage_id: MISSION_TO_FLIGHT[i].id });
  };

  return (
    <div className={validation.lifecycle}>
      <div>
        <div className={validation.phaseFilter} role="group" aria-label="Highlight a phase">
          {PHASES.map((p) => (
            <button key={p} type="button" className={styles.chip} aria-pressed={phase === p} onClick={() => setPhase(p)}>
              {p === "all" ? "All stages" : PHASE_LABEL[p]}
            </button>
          ))}
        </div>
        <ol className={validation.nodes}>
          {MISSION_TO_FLIGHT.map((item, i) => (
            <li key={item.id} className={validation.nodeItem}>
              <button
                type="button"
                className={validation.nodeButton}
                aria-pressed={active === i}
                aria-controls="lifecycle-detail"
                data-dim={phase !== "all" && item.phase !== phase ? "" : undefined}
                onClick={() => select(i)}
              >
                <span className={validation.nodeIndex}>{String(i + 1).padStart(2, "0")}</span>
                <span className={validation.nodeLabel}>{item.label}</span>
                <span className={validation.nodePhase}>{PHASE_LABEL[item.phase]}</span>
              </button>
              {active === i && (
                <div className={validation.inlineDetail}>
                  <Detail node={item} index={i} />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className={validation.stickyDetail} id="lifecycle-detail" aria-live="polite">
        <Detail node={node} index={active} />
      </div>
    </div>
  );
}
