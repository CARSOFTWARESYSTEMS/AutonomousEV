"use client";
import { useMemo, useState } from "react";
import { Wind } from "lucide-react";
import { estimateEclss, ECLSS_DEFAULTS, ECLSS_ARCHITECTURES, WATER_PER_O2, H2_PER_CO2, WATER_PER_CO2, type EclssArchitecture, type EclssInput } from "@/lib/space-station/eclss";
import { SimFrame, Slider, Metric, fmt } from "./SimFrame";
import styles from "../station.module.css";

export default function ECLSSSimulator() {
  const [e, setE] = useState<EclssInput>(ECLSS_DEFAULTS);
  const set = (k: keyof EclssInput) => (v: number) => setE((s) => ({ ...s, [k]: v }));
  const r = useMemo(() => estimateEclss(e), [e]);
  const all = useMemo(() => (["open", "partial", "closed"] as EclssArchitecture[]).map((a) => ({ a, r: estimateEclss({ ...e, architecture: a }) })), [e]);
  const max = Math.max(...all.map((x) => x.r.resupplyMassKg), 1);
  return (
    <SimFrame
      title="Life-Support Simulator"
      icon={Wind}
      transparency={{
        assumptions: [
          "Default per-crew-day values are rounded educational figures of the order given in NASA's Life Support Baseline Values and Assumptions Document.",
          "Oxygen is produced by water electrolysis in partially and more closed architectures.",
          "CO₂ reduction uses only hydrogen from electrolysis (no stored hydrogen); methane is vented.",
          "Tankage, packaging, spares, filters and power/thermal costs of processors are excluded.",
        ],
        equations: [
          { expr: "crew-days = N · D" },
          { expr: `2H₂O → 2H₂ + O₂ :  m_H₂O = ${fmt(WATER_PER_O2, 3)} · m_O₂` },
          { expr: `CO₂ + 4H₂ → CH₄ + 2H₂O :  m_H₂ = ${fmt(H2_PER_CO2, 3)} · m_CO₂,  m_H₂O = ${fmt(WATER_PER_CO2, 3)} · m_CO₂` },
          { expr: "make-up water = use − recovered + electrolysis feed − Sabatier water" },
        ],
        limitations: [
          "Educational approximations — real consumption varies with crew mass, activity, EVAs and mission design.",
          "Ignores reliability: real loops need spares and downtime margins that can dominate mass.",
        ],
        sources: ["ntrs-bvad", "nasa-water-recovery"],
      }}
    >
      {(view) => (
        <div className={styles.simBody}>
          <div className={styles.simControls}>
            <Slider label="Crew size" value={e.crew} min={1} max={12} step={1} onChange={set("crew")} />
            <Slider label="Mission duration" value={e.durationDays} min={7} max={1000} step={1} unit="days" onChange={set("durationDays")} />
            <Slider label="Oxygen consumption" value={e.o2KgPerCrewDay} min={0.6} max={1.2} step={0.01} unit="kg/crew-day" onChange={set("o2KgPerCrewDay")} />
            <Slider label="CO₂ generation" value={e.co2KgPerCrewDay} min={0.7} max={1.4} step={0.01} unit="kg/crew-day" onChange={set("co2KgPerCrewDay")} />
            <Slider label="Water use" value={e.waterUseKgPerCrewDay} min={2} max={12} step={0.1} unit="kg/crew-day" onChange={set("waterUseKgPerCrewDay")} />
            <Slider label="Water recovery" value={e.waterRecoveryPct} min={0} max={98} step={1} unit="%" onChange={set("waterRecoveryPct")} />
            <Slider label="Food (incl. packaging)" value={e.foodKgPerCrewDay} min={1} max={3} step={0.05} unit="kg/crew-day" onChange={set("foodKgPerCrewDay")} />
            {view === "engineering" && (
              <div className={styles.field}>
                <span>Architecture</span>
                <div className={styles.segmented} role="group" aria-label="Life-support architecture">
                  {(Object.keys(ECLSS_ARCHITECTURES) as EclssArchitecture[]).map((a) => (
                    <button key={a} type="button" aria-pressed={e.architecture === a} onClick={() => setE((s) => ({ ...s, architecture: a }))}>
                      {ECLSS_ARCHITECTURES[a].label}
                    </button>
                  ))}
                </div>
                <small className={styles.fieldHelp}>{ECLSS_ARCHITECTURES[e.architecture].summary}</small>
              </div>
            )}
          </div>
          <div className={styles.simOutput}>
            <p style={{ fontSize: 14 }} className={styles.simLabel}>All numbers are educational approximations.</p>
            <div className={styles.metrics} aria-live="polite">
              <Metric label="Crew-days" value={fmt(r.crewDays)} />
              <Metric label="Oxygen required" value={fmt(r.oxygenKg)} unit="kg" />
              <Metric label="Water used" value={fmt(r.waterUseKg)} unit="kg" />
              <Metric label="Water recovered" value={fmt(r.recoveredWaterKg)} unit="kg" />
              <Metric label="Make-up water" value={fmt(r.makeupWaterKg)} unit="kg" />
              <Metric label="CO₂ to remove" value={fmt(r.co2RemovalKgPerDay, 2)} unit="kg/day" />
              <Metric label="Food" value={fmt(r.foodKg)} unit="kg" />
              <Metric label="Launched consumables" value={fmt(r.resupplyMassKg)} unit="kg" />
            </div>
            <h4>Architecture comparison — launched consumables</h4>
            <div role="img" aria-label={all.map((x) => `${ECLSS_ARCHITECTURES[x.a].label}: ${fmt(x.r.resupplyMassKg)} kg`).join("; ")} style={{ display: "grid", gap: 8, marginTop: 8 }}>
              {all.map((x) => (
                <div key={x.a} style={{ display: "grid", gridTemplateColumns: "minmax(0, 150px) minmax(0, 1fr) auto", gap: 8, alignItems: "center", fontSize: 13 }}>
                  <span>{ECLSS_ARCHITECTURES[x.a].label}</span>
                  <span style={{ height: 14, background: "var(--space-button-surface)", borderRadius: 4, overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${(x.r.resupplyMassKg / max) * 100}%`, background: x.a === e.architecture ? "#67e8f9" : "#3b82f6" }} />
                  </span>
                  <b style={{ color: "var(--space-text)", fontVariantNumeric: "tabular-nums" }}>{fmt(x.r.resupplyMassKg)} kg</b>
                </div>
              ))}
            </div>
            {view === "engineering" && (
              <p style={{ fontSize: 14, marginTop: 12 }}>
                Electrolysis consumes {fmt(r.electrolysisWaterKg)} kg of water to make {fmt(r.oxygenKg)} kg of O₂.
                {e.architecture === "closed" && ` CO₂ reduction converts ${fmt(r.co2ReducedKg)} kg of CO₂ back into ${fmt(r.sabatierWaterKg)} kg of water — limited by the hydrogen available.`}
                {e.architecture === "open" && " In open loop, recovery is zero and all oxygen is launched."}
              </p>
            )}
          </div>
        </div>
      )}
    </SimFrame>
  );
}
