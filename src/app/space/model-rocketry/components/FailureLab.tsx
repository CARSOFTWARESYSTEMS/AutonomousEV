"use client";
import { useState } from "react";
import { FAILURE_MODES, SYSTEM_LABELS } from "../rocketData";
import { useMediaQuery } from "./useMediaQuery";
import styles from "../model-rocketry.module.css";

const MOBILE_PREVIEW_COUNT = 4;

export default function FailureLab() {
  const [expanded, setExpanded] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const showExpandControl = !isDesktop && !expanded && FAILURE_MODES.length > MOBILE_PREVIEW_COUNT;
  const visible = showExpandControl ? FAILURE_MODES.slice(0, MOBILE_PREVIEW_COUNT) : FAILURE_MODES;

  return (
    <div>
      {visible.map((f) => (
        <details key={f.id} className={styles.accordionItem}>
          <summary>{f.title}</summary>
          <div>
            <dl>
              <dt>System</dt>
              <dd>{SYSTEM_LABELS[f.system]}</dd>
              <dt>What would you observe?</dt>
              <dd>{f.observe}</dd>
              <dt>Possible causes</dt>
              <dd>
                <ul>
                  {f.causes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </dd>
              <dt>Engineering consequence</dt>
              <dd>{f.consequence}</dd>
              <dt>How would you detect it?</dt>
              <dd>{f.detect}</dd>
              <dt>Prevention / verification</dt>
              <dd>{f.prevent}</dd>
            </dl>
          </div>
        </details>
      ))}
      {showExpandControl && (
        <button type="button" className={styles.expandButton} onClick={() => setExpanded(true)}>
          Explore all failure modes ({FAILURE_MODES.length})
        </button>
      )}
    </div>
  );
}
