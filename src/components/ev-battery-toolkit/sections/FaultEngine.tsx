"use client";
// The fault engine: NORMAL, KNOWN FAULT and UNKNOWN FAULT. An unknown fault
// hides its root cause, so it has to be found from the dashboard, the BMS data
// and the 3D views. Severe faults show an early warning or a stop banner.
import { useState } from "react";
import { ArrowRight, Eye } from "lucide-react";
import { COMMON_ISSUES } from "@/data/ev-battery-toolkit/content";
import { FAULT_BY_ID, FAULT_CATEGORIES, FAULTS } from "@/data/ev-battery-toolkit/faults";
import { trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import type { FaultCategory } from "@/lib/ev-battery-toolkit/types";
import { scrollToAndFocus } from "../state/device";
import { faultOf, useToolkit, type FaultMode } from "../state/store";
import { ContextBanner, Pill, SafetyBanner } from "../ui/Badges";
import { startWorkspace } from "../workspace/Workspace";
import css from "../toolkit.module.css";

const SEVERITY_FAMILY = { info: "info", warning: "warning", service: "service", critical: "critical" } as const;

/** Opens a known fault in the workspace, from a card or the list. */
export function openFault(id: string, source: string) {
  const st = useToolkit.getState();
  st.setFaultMode("known");
  st.choosePendingFault(id);
  st.injectFault(id);
  trackToolkit("fault_selected", { fault: id, mode: "known" });
  trackToolkit("fault_injected", { fault: id, mode: "known" });
  startWorkspace(source);
}

export default function FaultEngine() {
  const mode = useToolkit((s) => s.faultMode);
  const pending = useToolkit((s) => s.pendingFaultId);
  const faultId = useToolkit((s) => s.faultId);
  const revealed = useToolkit((s) => s.revealed);
  const st = useToolkit.getState;
  const [category, setCategory] = useState<FaultCategory>("cell");
  const fault = faultOf(faultId);
  const hidden = mode === "unknown" && fault && !revealed;

  const setMode = (m: FaultMode) => {
    st().setFaultMode(m);
    if (m === "normal") st().injectFault(null);
  };

  return (
    <div className={css.faults}>
      <ContextBanner context="simulation" />
      <div className={css.modeSwitch} role="radiogroup" aria-label="Fault mode">
        {(["normal", "known", "unknown"] as const).map((m) => (
          <button key={m} type="button" role="radio" aria-checked={mode === m} className={css.modeSwitchItem} onClick={() => setMode(m)}>
            {m === "normal" ? "NORMAL" : m === "known" ? "KNOWN FAULT" : "UNKNOWN FAULT"}
          </button>
        ))}
      </div>

      {mode === "known" ? (
        <div className={css.faultPicker}>
          <div className={css.categoryTabs} role="tablist" aria-label="Fault category">
            {FAULT_CATEGORIES.map((c) => (
              <button key={c.id} type="button" role="tab" aria-selected={category === c.id} className={css.categoryTab} onClick={() => setCategory(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
          <ul className={css.faultList} role="radiogroup" aria-label={`${FAULT_CATEGORIES.find((c) => c.id === category)?.name} faults`}>
            {FAULTS.filter((f) => f.category === category).map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={pending === f.id}
                  className={css.faultItem}
                  onClick={() => {
                    st().choosePendingFault(f.id);
                    trackToolkit("fault_selected", { fault: f.id, mode: "known" });
                  }}
                >
                  <span className={css.faultName}>{f.name}</span>
                  <Pill family={SEVERITY_FAMILY[f.severity]}>{f.severity}</Pill>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={css.primaryButton}
            disabled={!pending}
            onClick={() => {
              if (!pending) return;
              st().injectFault(pending);
              trackToolkit("fault_injected", { fault: pending, mode: "known" });
              startWorkspace("fault_engine");
            }}
          >
            Inject fault
          </button>
        </div>
      ) : mode === "unknown" ? (
        <div className={css.faultPicker}>
          <p className={css.muted}>A random fault is injected and its name is hidden. Use the health dashboard, BMS data, thermal and voltage views and the workbench to find it, then reveal it.</p>
          <div className={css.actionsRow}>
            <button
              type="button"
              className={css.primaryButton}
              onClick={() => {
                const id = st().injectRandomFault();
                trackToolkit("fault_selected", { fault: "hidden", mode: "unknown" });
                trackToolkit("fault_injected", { fault: "hidden", mode: "unknown" });
                startWorkspace("fault_engine");
                return id;
              }}
            >
              {fault ? "Inject another unknown fault" : "Inject unknown fault"}
            </button>
            {fault && !revealed ? (
              <button type="button" className={css.secondary} onClick={() => st().reveal()}>
                <Eye size={15} aria-hidden="true" /> Reveal root cause
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <p className={css.muted}>The simulated pack is running normally. Choose KNOWN FAULT or UNKNOWN FAULT to inject one.</p>
      )}

      <div className={css.faultStatus} aria-live="polite">
        {fault ? (
          <>
            {fault.safety === "stop" ? <SafetyBanner level="stop">{!hidden ? <p className={css.safetyText}>{fault.diagnosticArea}.</p> : null}</SafetyBanner> : fault.safety === "early-warning" ? <SafetyBanner level="early-warning">{!hidden ? <p className={css.safetyText}>{fault.diagnosticArea}.</p> : null}</SafetyBanner> : null}
            {hidden ? (
              <p>
                <strong>Unknown fault injected.</strong> Symptom reported: “{fault.symptom}”
              </p>
            ) : (
              <dl className={css.detailList}>
                <div>
                  <dt>Injected fault</dt>
                  <dd>
                    {fault.name} <Pill family={SEVERITY_FAMILY[fault.severity]}>{fault.severity}</Pill>
                  </dd>
                </div>
                <div>
                  <dt>Symptom</dt>
                  <dd>{fault.symptom}</dd>
                </div>
                <div>
                  <dt>Diagnostic area</dt>
                  <dd>{fault.diagnosticArea}</dd>
                </div>
                <div>
                  <dt>Confirm with</dt>
                  <dd>{fault.confirmWith.join(" · ")}</dd>
                </div>
              </dl>
            )}
            <button type="button" className={css.textButton} onClick={() => scrollToAndFocus("explorer")}>
              See it in the 3D explorer <ArrowRight size={15} aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function CommonIssues() {
  return (
    <ul className={css.issueGrid}>
      {COMMON_ISSUES.map((issue) => (
        <li key={issue.id} className={css.issue}>
          <div className={css.issueHead}>
            <h3 className={css.h4}>{issue.title}</h3>
            <Pill family={issue.severity === "Critical" ? "critical" : issue.severity === "Service" ? "service" : "warning"}>{issue.severity}</Pill>
          </div>
          <p>{issue.symptom}</p>
          <p className={css.issueArea}>
            <span>Diagnostic area</span> {issue.area}
          </p>
          <button
            type="button"
            className={css.textButton}
            onClick={() => {
              openFault(issue.faultId, "common_issue");
              scrollToAndFocus("explorer");
            }}
            aria-label={`Open ${issue.title} in the toolkit (${FAULT_BY_ID[issue.faultId]?.name ?? "simulated fault"})`}
          >
            Open in toolkit <ArrowRight size={15} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
