"use client";
import { useMemo, useState } from "react";
import { PencilRuler, AlertTriangle, CheckCircle2 } from "lucide-react";
import { designStation, DESIGN_DEFAULTS, DESIGN_HEURISTICS, type DesignInput, type DesignOutput } from "@/lib/space-station/designer";
import { SimFrame, Slider, Select, Check, Metric, fmt } from "./SimFrame";
import Wizard from "./Wizard";
import styles from "../station.module.css";

function Architecture({ d, input }: { d: DesignOutput; input: DesignInput }) {
  const n = d.modules.length;
  const w = Math.min(110, 560 / n);
  const x0 = 320 - (n * w) / 2;
  const arrayScale = Math.min(1, d.powerDemandKW / 150);
  const radScale = Math.min(1, d.radiatorAreaM2 / 700);
  return (
    <svg viewBox="0 0 640 250" role="img" aria-label={`Concept architecture: ${d.modules.join(", ")}; ${input.dockingPorts} docking ports; arrays sized for about ${fmt(d.powerDemandKW)} kW; radiators about ${fmt(d.radiatorAreaM2)} square metres.`} style={{ width: "100%", height: "auto", background: "#0b1733", borderRadius: 10 }}>
      <line x1={x0 - 30} y1={70} x2={x0 + n * w + 30} y2={70} stroke="#94a3b8" strokeWidth={5} />
      {[x0 - 30, x0 + n * w - 10].map((x) => (
        <g key={x}>
          <rect x={x} y={70 - 55 * (0.4 + arrayScale * 0.6)} width={40} height={55 * (0.4 + arrayScale * 0.6)} fill="#1d4ed8" stroke="#93c5fd" />
          <rect x={x} y={70} width={40} height={55 * (0.4 + arrayScale * 0.6)} fill="#1d4ed8" stroke="#93c5fd" />
        </g>
      ))}
      <rect x={300} y={70 - 50 * (0.3 + radScale * 0.7)} width={40} height={50 * (0.3 + radScale * 0.7)} fill="#e2e8f0" />
      <line x1={320} y1={70} x2={320} y2={140} stroke="#94a3b8" strokeWidth={4} />
      {d.modules.map((m, i) => (
        <g key={`${m}-${i}`}>
          <rect x={x0 + i * w + 2} y={140} width={w - 4} height={44} rx={12} fill={m.startsWith("Laboratory") ? "#bae6fd" : m === "Airlock" ? "#fde68a" : "#cbd5e1"} stroke="#475569" />
          <text x={x0 + i * w + w / 2} y={166} fontSize={Math.min(11, w / 8)} textAnchor="middle" fill="#0f172a" fontWeight="700">
            {m.replace(" / command & control", "").replace("Laboratory", "Lab")}
          </text>
        </g>
      ))}
      {Array.from({ length: Math.min(input.dockingPorts, 6) }).map((_, i) => {
        const x = x0 + ((i + 0.5) * n * w) / Math.min(input.dockingPorts, 6);
        return <rect key={i} x={x - 7} y={184} width={14} height={12} fill="#fcd34d" stroke="#92400e" />;
      })}
      {input.robotics && <polyline points={`${x0 + n * w + 20},70 ${x0 + n * w + 20},40 ${x0 + n * w + 45},25`} fill="none" stroke="#fcd34d" strokeWidth={4} strokeLinecap="round" />}
      <text x={12} y={216} fontSize="11" fill="#b5b8c9">Arrays ≈ {fmt(d.powerDemandKW)} kW · radiators ≈ {fmt(d.radiatorAreaM2)} m² · {input.dockingPorts} docking port(s)</text>
      <text x={12} y={236} fontSize="11" fill="#fcd34d">Conceptual educational system model</text>
    </svg>
  );
}

export default function StationDesigner() {
  const [i, setI] = useState<DesignInput>(DESIGN_DEFAULTS);
  const set = <K extends keyof DesignInput>(k: K) => (v: DesignInput[K]) => setI((s) => ({ ...s, [k]: v }));
  const d = useMemo(() => designStation(i), [i]);
  return (
    <SimFrame
      title="Design a Station"
      icon={PencilRuler}
      transparency={{
        assumptions: [
          `Power: ${DESIGN_HEURISTICS.busKWPerModule} kW per module + ${DESIGN_HEURISTICS.crewSupportKWPerCrew} kW per crew + research (${Object.entries(DESIGN_HEURISTICS.researchKW).map(([k, v]) => `${k} ${v}`).join(", ")} kW) + ${DESIGN_HEURISTICS.roboticsKW} kW robotics.`,
          `Habitable volume: ${DESIGN_HEURISTICS.longDurationVolumePerCrewM3} m³ per crew beyond ${DESIGN_HEURISTICS.longDurationThresholdDays} days (informed by NASA human-factors research on net habitable volume), ${DESIGN_HEURISTICS.shortDurationVolumePerCrewM3} m³ otherwise; ${DESIGN_HEURISTICS.habitableVolumePerModuleM3} m³ per module.`,
          `Regenerative life support recommended beyond ${DESIGN_HEURISTICS.regenerativeThresholdDays} days' duration or resupply interval, or outside LEO.`,
          "Radiator area uses the Thermal Simulator model at 280 K.",
        ],
        equations: [
          { expr: "P = n_mod·p_bus + N_crew·p_crew + P_research + P_robotics" },
          { expr: "V_required = N_crew · v_crew" },
          { expr: "A_rad = Q / (εσT⁴ − q_abs)" },
        ],
        limitations: ["Not a certified or validated spacecraft design.", "Heuristics are rounded teaching values chosen to show trade-offs, not design standards."],
        sources: ["nasa-hidh", "ntrs-bvad", "nasa-cld"],
      }}
    >
      {() => (
        <Wizard
          label="Station designer"
          summaryTitle="Architecture"
          steps={[
            {
              title: "Mission",
              content: (
                <>
                  <Select label="Mission" value={i.mission} options={[{ value: "research", label: "Research" }, { value: "commercial", label: "Commercial" }, { value: "exploration", label: "Exploration" }, { value: "lunar", label: "Lunar" }, { value: "mixed", label: "Mixed" }]} onChange={set("mission")} />
                </>
              ),
            },
            {
              title: "Orbit",
              content: (
                <>
                  <Select label="Orbit" value={i.orbit} options={[{ value: "leo", label: "Low Earth orbit" }, { value: "lunar-orbit", label: "Lunar orbit" }, { value: "deep-space", label: "Conceptual deep space" }]} onChange={set("orbit")} />
                  <Select label="Radiation protection" value={i.radiation} options={[{ value: "baseline", label: "Baseline" }, { value: "enhanced", label: "Enhanced shielding" }, { value: "storm-shelter", label: "Storm shelter" }]} onChange={set("radiation")} />
                </>
              ),
            },
            {
              title: "Crew",
              content: (
                <>
                  <Slider label="Crew" value={i.crew} min={0} max={12} step={1} onChange={set("crew")} help="Educational range 0–12." />
                  <Slider label="Mission duration" value={i.durationDays} min={7} max={1500} step={1} unit="days" onChange={set("durationDays")} />
                  <Slider label="Resupply interval" value={i.resupplyDays} min={14} max={720} step={1} unit="days" onChange={set("resupplyDays")} />
                </>
              ),
            },
            {
              title: "Research",
              content: (
                <>
                  <Slider label="Modules" value={i.modules} min={1} max={10} step={1} onChange={set("modules")} />
                  <Select label="Research demand" value={i.researchDemand} options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} onChange={set("researchDemand")} />
                </>
              ),
            },
            {
              title: "Power & autonomy",
              content: (
                <>
                  <Slider label="Power requirement" value={i.powerRequirementKW} min={0} max={300} step={5} onChange={set("powerRequirementKW")} format={(v) => (v === 0 ? "Auto-estimate" : `${v} kW`)} />
                  <Select label="Autonomy level" value={i.autonomy} options={[{ value: "crew-tended", label: "Crew-tended / ground-led" }, { value: "supervised", label: "Supervised autonomy" }, { value: "high", label: "High autonomy" }]} onChange={set("autonomy")} />
                </>
              ),
            },
            {
              title: "Docking & robotics",
              content: (
                <>
                  <Slider label="Docking ports" value={i.dockingPorts} min={1} max={8} step={1} onChange={set("dockingPorts")} />
                  <Check label="Robotics" checked={i.robotics} onChange={set("robotics")} />
                </>
              ),
            },
          ]}
          summary={
            <>
            <p className={styles.simLabel}>Conceptual educational system model — not a certified spacecraft design.</p>
            <Architecture d={d} input={i} />
            <div className={styles.metrics} style={{ marginTop: 14 }}>
              <Metric label={i.powerRequirementKW ? "Power (your input)" : "Approx. power demand"} value={fmt(d.powerDemandKW)} unit="kW" />
              <Metric label="Habitable volume needed / provided" value={`${fmt(d.habitableVolumeRequiredM3)} / ${fmt(d.habitableVolumeProvidedM3)}`} unit="m³" tone={d.volumeOk ? "ok" : "bad"} />
              <Metric label="Docking ports recommended" value={`${d.dockingRecommended} (you: ${i.dockingPorts})`} tone={d.dockingOk ? "ok" : "warn"} />
              <Metric label="Radiator area" value={fmt(d.radiatorAreaM2)} unit="m²" />
            </div>
            <dl className={styles.kv}>
              <div><dt>Concept architecture</dt><dd>{d.modules.join(" → ")}</dd></div>
              <div><dt>ECLSS architecture</dt><dd>{d.eclss}</dd></div>
              <div><dt>Thermal architecture</dt><dd>{d.thermal}</dd></div>
              <div><dt>Communications</dt><dd>{d.communications}</dd></div>
              <div><dt>Research capability</dt><dd>{d.researchCapability}</dd></div>
            </dl>
            <div className={styles.grid2} style={{ marginTop: 14 }}>
              <div>
                <h4>Risk areas</h4>
                <ul>
                  {d.risks.map((r) => (
                    <li key={r}>
                      {r.startsWith("No major") ? <CheckCircle2 size={13} aria-hidden="true" /> : <AlertTriangle size={13} aria-hidden="true" />} {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Technology gaps</h4>
                <ul>{d.technologyGaps.length ? d.technologyGaps.map((g) => <li key={g}>{g}</li>) : <li>None flagged for these inputs.</li>}</ul>
              </div>
            </div>
            </>
          }
        />
      )}
    </SimFrame>
  );
}
