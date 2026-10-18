"use client";
// Owner Mode and Technician Mode. Owner Mode explains symptoms and the safe
// next step only; it never shows enclosure opening, live-pack work or cell,
// busbar or module repair. Technician Mode shows the workflow and repair depths.
import { useState } from "react";
import { HardHat, ShieldAlert, User } from "lucide-react";
import { FLOW, FLOW_DETAIL, OWNER_SAFETY_RULES, OWNER_SYMPTOMS, REPAIR_DEPTH_SCOPE, type SymptomSeverity } from "@/data/ev-battery-toolkit/content";
import { REPAIR_DEPTH } from "@/data/ev-battery-toolkit/components";
import { trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import type { RepairDepth } from "@/lib/ev-battery-toolkit/types";
import { useToolkit } from "../state/store";
import { Pill, SafetyBanner } from "../ui/Badges";
import css from "../toolkit.module.css";

const SEVERITY_FAMILY: Record<SymptomSeverity, "ok" | "warning" | "service" | "critical"> = { Low: "ok", Moderate: "warning", High: "service", Stop: "critical" };

export function OwnerMode() {
  const [symptomId, setSymptomId] = useState<string | null>(null);
  const symptom = OWNER_SYMPTOMS.find((s) => s.id === symptomId) ?? null;
  return (
    <div className={css.modePanel} data-audience="owner">
      <p className={css.modeIntro}>Choose what you are noticing. You will see possible causes, how serious it is and the safe next step.</p>
      <div className={css.ownerLayout}>
        <ul className={css.symptomGrid} aria-label="Battery symptoms">
          {OWNER_SYMPTOMS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={css.symptom}
                aria-pressed={symptomId === s.id}
                onClick={() => {
                  setSymptomId(s.id);
                  trackToolkit("owner_symptom_selected", { symptom: s.id });
                }}
              >
                <span>{s.title}</span>
                <Pill family={SEVERITY_FAMILY[s.severity]}>{s.severity === "Stop" ? "Stop" : s.severity}</Pill>
              </button>
            </li>
          ))}
        </ul>
        <div className={css.symptomDetail} aria-live="polite">
          {symptom ? (
            <>
              <h3 className={css.h3}>{symptom.title}</h3>
              {symptom.severity === "Stop" ? <SafetyBanner level="stop" title="STOP — keep away and do not charge" /> : null}
              <dl className={css.detailList}>
                <div>
                  <dt>Possible causes</dt>
                  <dd>
                    <ul>
                      {symptom.causes.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt>Severity</dt>
                  <dd>
                    <Pill family={SEVERITY_FAMILY[symptom.severity]}>{symptom.severity}</Pill>
                  </dd>
                </div>
                <div>
                  <dt>Safe next step</dt>
                  <dd>{symptom.safeNextStep}</dd>
                </div>
                <div>
                  <dt>Professional inspection</dt>
                  <dd>{symptom.inspection}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className={css.muted}>Select a symptom to see its possible causes and the safe next step.</p>
          )}
          <div className={css.ownerRules}>
            <p className={css.panelLabel}>
              <ShieldAlert size={14} aria-hidden="true" /> Always
            </p>
            <ul>
              {OWNER_SAFETY_RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TechnicianMode() {
  const depth = useToolkit((s) => s.depth);
  const setDepth = useToolkit((s) => s.setDepth);
  return (
    <div className={css.modePanel} data-audience="technician">
      <ol className={css.flow} aria-label="Technician workflow">
        {FLOW.map((step, i) => (
          <li key={step}>
            <span className={css.flowIndex}>{String(i + 1).padStart(2, "0")}</span>
            <span className={css.flowName}>{step}</span>
            <span className={css.flowDetail}>{FLOW_DETAIL[step]}</span>
          </li>
        ))}
      </ol>
      <div className={css.depthBlock}>
        <div className={css.depthTabs} role="tablist" aria-label="Repair depth">
          {(Object.keys(REPAIR_DEPTH) as RepairDepth[]).map((d) => (
            <button key={d} type="button" role="tab" id={`depth-${d}`} aria-selected={depth === d} aria-controls="depth-panel" className={css.depthTab} onClick={() => setDepth(d)}>
              {REPAIR_DEPTH[d].name}
            </button>
          ))}
        </div>
        <div className={css.depthPanel} id="depth-panel" role="tabpanel" aria-labelledby={`depth-${depth}`}>
          <p className={css.muted}>{REPAIR_DEPTH[depth].summary}</p>
          <ul className={css.scopeList}>
            {REPAIR_DEPTH_SCOPE[depth].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={css.fine}>Repair depths describe the scope of work and the equipment it needs. They are not certification levels.</p>
        </div>
      </div>
    </div>
  );
}

export default function ModeSection() {
  const audience = useToolkit((s) => s.audience);
  const setAudience = useToolkit((s) => s.setAudience);
  const choose = (a: "owner" | "technician") => {
    setAudience(a);
    trackToolkit(a === "owner" ? "owner_mode_selected" : "technician_mode_selected");
  };
  return (
    <div>
      <div className={css.modeTabs} role="tablist" aria-label="Toolkit mode">
        <button type="button" role="tab" id="mode-owner" aria-selected={audience === "owner"} aria-controls="mode-panel" className={css.modeTab} onClick={() => choose("owner")}>
          <User size={20} aria-hidden="true" />
          <span>
            <strong>Owner Mode</strong>
            <small>Understand battery symptoms safely</small>
          </span>
        </button>
        <button type="button" role="tab" id="mode-technician" aria-selected={audience === "technician"} aria-controls="mode-panel" className={css.modeTab} onClick={() => choose("technician")}>
          <HardHat size={20} aria-hidden="true" />
          <span>
            <strong>Technician Mode</strong>
            <small>Diagnose, repair and verify</small>
          </span>
        </button>
      </div>
      <div id="mode-panel" role="tabpanel" aria-labelledby={audience === "owner" ? "mode-owner" : "mode-technician"}>
        {audience === "owner" ? <OwnerMode /> : <TechnicianMode />}
      </div>
    </div>
  );
}
