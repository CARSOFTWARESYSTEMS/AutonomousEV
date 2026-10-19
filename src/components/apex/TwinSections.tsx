"use client";

import type { CSSProperties } from "react";
import { capability } from "@/data/apex/partner-capabilities";
import { CONFIGURATION_RECORD, INSTRUMENTATION_CHAIN, TEST_RECORD_FIELDS, TWIN_LOOP, TWIN_MATURITY } from "@/data/apex/validation";
import { EvidenceBadge } from "./EvidenceBadge";
import { usePanel } from "./panelContext";
import styles from "./apex.module.css";
import loop from "./loop.module.css";
import validation from "./validation.module.css";

/** Model → prediction → test → measurement → comparison → review → update → retest, highlighted slowly in turn. */
export function TwinLoop() {
  return (
    <div>
      <ol className={loop.twinLoop}>
        {TWIN_LOOP.map((step, i) => (
          <li key={step.id} className={`${loop.twinStep} ${loop.twinActive}`} data-branch={step.branch ? "" : undefined} style={{ "--i": i } as CSSProperties}>
            <span className={loop.twinIndex}>{String(i + 1).padStart(2, "0")}</span>
            <span className={loop.twinLabel}>{step.label}</span>
            {step.branch && <span className={styles.small}>The review decides which: the model was wrong, or the hardware needs to change.</span>}
          </li>
        ))}
      </ol>
      <div className={loop.twinReturn}>
        <span>↺ Retest returns to the engineering model</span>
      </div>
    </div>
  );
}

export function TwinMaturity() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <ol className={validation.maturity}>
        {TWIN_MATURITY.map((level) => (
          <li key={level.id} className={validation.level}>
            <span className={validation.levelBars} aria-hidden="true">
              {TWIN_MATURITY.map((other) => (
                <span key={other.id} style={{ height: `${other.level * 20}%` }} data-on={other.level <= level.level ? "" : undefined} />
              ))}
            </span>
            <span className={validation.levelNumber}>Level {level.level}</span>
            <span className={styles.h4}>{level.label}</span>
            <span className={styles.small}>{level.detail}</span>
          </li>
        ))}
      </ol>
      <div className={styles.chips} style={{ alignItems: "center" }}>
        <EvidenceBadge status="EVIDENCE_REQUIRED" label="APEX level: owner confirmation required" />
        <span className={styles.small}>No maturity level is claimed for an APEX twin.</span>
      </div>
    </div>
  );
}

export function ConfigurationRecord() {
  const { physical, digital } = CONFIGURATION_RECORD;
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className={validation.recordPair}>
        {[physical, digital].map((record, i) => (
          <div key={record.id} className={validation.record}>
            <div className={validation.recordHead}>
              <span>{record.title}</span>
              <span>{i === 0 ? "Physical" : "Digital"}</span>
            </div>
            <div className={validation.recordId}>
              <span className={validation.recordIdMain}>{record.id}</span>
              <span style={{ color: "var(--apex-accent)" }}>{record.revision}</span>
            </div>
            <ul className={validation.recordItems}>
              {record.items.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                  <span>linked</span>
                </li>
              ))}
            </ul>
          </div>
        )).reduce<React.ReactNode[]>((acc, node, i) => (i === 0 ? [node] : [...acc, <span key="link" className={validation.link}>Corresponds ⇄</span>, node]), [])}
      </div>
      <div className={styles.chips} style={{ alignItems: "center" }}>
        <EvidenceBadge status="CONCEPT" label="Illustrative record format" />
        <span className={styles.small}>Identifiers are examples of structure, not APEX records.</span>
      </div>
    </div>
  );
}

export function InstrumentationChain() {
  const { open } = usePanel();
  return (
    <ol className={validation.chain} aria-label="From sensor to Digital Twin correlation">
      {INSTRUMENTATION_CHAIN.map((step, i) => (
        <li key={step.id} className={validation.chainStep}>
          <span className={styles.specLabel}>{String(i + 1).padStart(2, "0")}</span>
          <span className={styles.h4}>{step.label}</span>
          <span className={validation.chainCaps}>
            {step.capabilityIds.map((id) => (
              <button key={id} type="button" onClick={(event) => open({ kind: "capability", id }, event.currentTarget)}>
                {capability(id).name}
              </button>
            ))}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function TestRecord() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className={validation.fieldGroups}>
        {TEST_RECORD_FIELDS.map((group) => (
          <div key={group.group} className={validation.fieldGroup}>
            <span className={styles.specLabel}>{group.group}</span>
            <ul>
              {group.fields.map((field) => (
                <li key={field} className={validation.field}>
                  {field}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={styles.chips} style={{ alignItems: "center" }}>
        <EvidenceBadge status="CONCEPT" label="Record structure" />
        <span className={styles.small}>Fields only. No APEX test data is shown.</span>
      </div>
    </div>
  );
}
