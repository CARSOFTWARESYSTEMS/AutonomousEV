"use client";

import { useState } from "react";
import { LIFECYCLE_STEPS, MISSION_TO_FLIGHT } from "@/data/apex/lifecycle";
import { capability, partnersForCapability } from "@/data/apex/partner-capabilities";
import { trackApex } from "./analytics";
import { usePanel } from "./panelContext";
import styles from "./apex.module.css";
import timeline from "./timeline.module.css";

function StepDetail({ stepIndex }: { stepIndex: number }) {
  const { open } = usePanel();
  const step = LIFECYCLE_STEPS[stepIndex];
  const stages = step.stageIds.map((id) => MISSION_TO_FLIGHT.find((stage) => stage.id === id)!);
  return (
    <div className={timeline.detail}>
      <div className={timeline.detailHead}>
        <span className={timeline.detailIndex}>
          {String(stepIndex + 1).padStart(2, "0")} / {String(LIFECYCLE_STEPS.length).padStart(2, "0")}
        </span>
        <h3 className={timeline.detailTitle}>{step.label}</h3>
        <p className={styles.lead} style={{ maxWidth: 680 }}>
          {step.summary}
        </p>
      </div>
      {stages.length > 0 && (
        <ol className={timeline.stages}>
          {stages.map((stage) => {
            const partners = [...new Set(stage.capabilityIds.flatMap((id) => partnersForCapability(id).map(({ partner }) => partner.shortName)))];
            return (
              <li key={stage.id} className={timeline.stage}>
                <h4 className={styles.h4}>{stage.label}</h4>
                <dl className={timeline.stageFacts}>
                  <div>
                    <dt>What happens</dt>
                    <dd>{stage.happens}</dd>
                  </div>
                  <div>
                    <dt>Deliverable</dt>
                    <dd>{stage.deliverable}</dd>
                  </div>
                  <div>
                    <dt>Evidence</dt>
                    <dd>{stage.evidence}</dd>
                  </div>
                </dl>
                <div className={styles.chips}>
                  {stage.capabilityIds.map((id) => (
                    <button key={id} type="button" className={styles.chip} onClick={(event) => open({ kind: "capability", id }, event.currentTarget)}>
                      {capability(id).name}
                    </button>
                  ))}
                </div>
                <p className={styles.small}>{partners.length ? `Partners: ${partners.join(" · ")} · open to more` : "Partners: required — open to multiple partners"}</p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/** One continuous lifecycle, Mission → Learn. Horizontal on wide screens, vertical on phones; each step opens on demand. */
export function LifecycleTimeline() {
  const [active, setActive] = useState(0);
  const select = (index: number) => {
    setActive(index);
    trackApex("apex_lifecycle_open", { stage_id: LIFECYCLE_STEPS[index].id });
  };
  return (
    <div className={timeline.root}>
      <ol className={timeline.track} aria-label="Lifecycle from mission to learning">
        {LIFECYCLE_STEPS.map((step, index) => (
          <li key={step.id} className={timeline.item} data-active={active === index ? "true" : undefined} data-done={index < active ? "true" : undefined}>
            <button type="button" className={timeline.node} aria-expanded={active === index} aria-controls="lifecycle-step" onClick={() => select(index)}>
              <span className={timeline.dot} aria-hidden="true" />
              <span className={timeline.nodeIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={timeline.nodeLabel}>{step.label}</span>
            </button>
            {active === index && (
              <div className={timeline.inline}>
                <StepDetail stepIndex={index} />
              </div>
            )}
          </li>
        ))}
      </ol>
      <div className={timeline.below} id="lifecycle-step" aria-live="polite">
        <StepDetail stepIndex={active} />
      </div>
    </div>
  );
}
