"use client";
import { Fragment, useMemo, useState } from "react";
import { Network, CheckCircle2, AlertTriangle, XOctagon } from "lucide-react";
import { runTwin, FAILURES, TWIN_NOMINAL, type FailureId, type Health } from "@/lib/space-station/twin";
import { SimFrame, Check, Metric, fmt } from "./SimFrame";
import styles from "../station.module.css";

const ICON: Record<Health, React.ReactNode> = {
  nominal: <CheckCircle2 size={18} aria-hidden="true" />,
  caution: <AlertTriangle size={18} aria-hidden="true" />,
  warning: <XOctagon size={18} aria-hidden="true" />,
};
const WORD: Record<Health, string> = { nominal: "Nominal", caution: "Caution", warning: "Warning" };

export default function StationDigitalTwin() {
  const [active, setActive] = useState<FailureId[]>([]);
  const r = useMemo(() => runTwin(active), [active]);
  const toggle = (id: FailureId) => setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const m = r.metrics;
  return (
    <SimFrame
      title="Space-Station Digital Twin"
      icon={Network}
      transparency={{
        assumptions: [
          `Imaginary station: ${TWIN_NOMINAL.generationKW} kW orbit-average generation, ${TWIN_NOMINAL.batteryModules} battery modules × ${TWIN_NOMINAL.eclipseKWPerModule} kW eclipse capacity, ${TWIN_NOMINAL.heatRejectionKW} kW heat rejection.`,
          `Loads: ${TWIN_NOMINAL.essentialLoadKW} kW essential, ${TWIN_NOMINAL.crewSupportKWPerCrew} kW per crew member, ${TWIN_NOMINAL.researchLoadKW} kW research.`,
          `CO₂: ${TWIN_NOMINAL.co2KgPerCrewDay} kg per crew-day generated; ${TWIN_NOMINAL.co2RemovalKgPerDay} kg/day removal capacity when healthy.`,
          "Load-shedding priority: research first, then non-essential crew support; essential loads are protected.",
        ],
        equations: [
          { expr: "P_available = min(P_generation, N_battery · P_eclipse/module)" },
          { expr: "Q_heat = P_served + N_crew · q_metabolic ≤ Q_rejection" },
          { expr: "ṁ_CO₂,gen = N_crew · 1.04 kg/day ≤ ṁ_CO₂,removal" },
        ],
        limitations: [
          "Rule-based, orbit-average couplings — no dynamics, time histories or sensor noise.",
          "Real stations have many independent power and cooling channels with far richer fault management.",
        ],
        sources: ["nasa-iss-facts", "ntrs"],
      }}
    >
      {(view) => (
        <div className={styles.simBody}>
          <div className={styles.simControls}>
            <h4>Inject failures</h4>
            <p style={{ fontSize: 14 }}>Combine events and watch the effects cascade through the system of systems.</p>
            {FAILURES.map((f) => (
              <div key={f.id}>
                <Check label={f.label} checked={active.includes(f.id)} onChange={() => toggle(f.id)} />
                {view === "engineering" && <small className={styles.fieldHelp} style={{ marginTop: -6, marginBottom: 6 }}>{f.detail}</small>}
              </div>
            ))}
            <button type="button" className={styles.textButton} onClick={() => setActive([])} disabled={active.length === 0}>
              Clear all failures
            </button>
          </div>
          <div className={styles.simOutput}>
            <div className={styles.twin}>
              <div>
                <h4>System architecture</h4>
                <ol className={styles.chain} aria-label="Coupled subsystems from orbit to ground">
                  {r.subsystems.map((s, i) => (
                    <Fragment key={s.id}>
                      <li>
                        <div className={styles.chainNode} data-health={s.health}>
                          <span className={styles.healthIcon} data-health={s.health}>{ICON[s.health]}</span>
                          <span>
                            <b>{s.label}</b>
                            <small>{s.note}</small>
                          </span>
                          <span className={styles.badge} data-tone={s.health === "nominal" ? "ok" : s.health === "caution" ? "plan" : "warn"}>
                            {WORD[s.health]}
                          </span>
                        </div>
                      </li>
                      {i < r.subsystems.length - 1 && (
                        <li aria-hidden="true">
                          <span className={styles.chainLink}>↕</span>
                        </li>
                      )}
                    </Fragment>
                  ))}
                </ol>
              </div>
              <div aria-live="polite">
                <h4>Cascading effects</h4>
                <ol className={styles.cascade}>
                  {r.cascade.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ol>
                {r.responses.length > 0 && (
                  <>
                    <h4 style={{ marginTop: 14 }}>Mission response</h4>
                    <ul>
                      {r.responses.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </>
                )}
                <div className={styles.metrics} style={{ marginTop: 14 }}>
                  <Metric label="Generation" value={fmt(m.generationKW)} unit="kW" />
                  <Metric label="Demand / served" value={`${fmt(m.demandKW)} / ${fmt(m.servedKW)}`} unit="kW" tone={m.servedKW < m.demandKW ? "warn" : undefined} />
                  <Metric label="Research shed" value={fmt(m.shedResearchKW)} unit="kW" tone={m.shedResearchKW > 0 ? "warn" : undefined} />
                  {view === "engineering" && (
                    <>
                      <Metric label="Eclipse capacity" value={fmt(m.eclipseCapacityKW)} unit="kW" />
                      <Metric label="Heat load / rejection" value={`${fmt(m.heatLoadKW)} / ${fmt(m.heatRejectionKW)}`} unit="kW" tone={m.heatLoadKW > m.heatRejectionKW ? "bad" : undefined} />
                      <Metric label="CO₂ gen / removal" value={`${fmt(m.co2GenerationKgPerDay, 1)} / ${fmt(m.co2RemovalKgPerDay, 1)}`} unit="kg/d" tone={m.co2GenerationKgPerDay > m.co2RemovalKgPerDay ? "bad" : undefined} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SimFrame>
  );
}
