"use client";
import { useMemo, useState } from "react";
import { FlaskConical } from "lucide-react";
import { planExperiment, EXPERIMENT_DEFAULTS, EXPERIMENT_DOMAINS, LIFECYCLE_STAGES, type ExperimentDomain, type ExperimentInput } from "@/lib/space-station/experiment";
import { SimFrame, Slider, Select, Check } from "./SimFrame";
import Wizard from "./Wizard";
import styles from "../station.module.css";

export default function ExperimentDesigner() {
  const [e, setE] = useState<ExperimentInput>(EXPERIMENT_DEFAULTS);
  const set = <K extends keyof ExperimentInput>(k: K) => (v: ExperimentInput[K]) => setE((s) => ({ ...s, [k]: v }));
  const plan = useMemo(() => planExperiment(e), [e]);
  return (
    <SimFrame
      title="Design a Microgravity Experiment"
      icon={FlaskConical}
      transparency={{
        assumptions: [
          "Resource descriptions use generic size classes (locker, drawer, rack), not any platform's accommodation limits.",
          "Containment advice is conceptual; the platform provider's safety review decides what is acceptable.",
        ],
        equations: [
          { expr: "E_day = P × 24 h", note: "Daily energy drawn by the experiment (Wh) — counts against the laboratory's power budget." },
          { expr: "Q_heat ≈ P", note: "Nearly all electrical power becomes heat that the station's cooling loops must reject." },
        ],
        limitations: ["Educational design assistance only — not flight qualification, a safety review or an agency proposal template."],
        sources: ["isro-imex-2026", "isro-imex-2026-ao", "nasa-iss-research"],
      }}
    >
      {() => (
        <Wizard
          label="Experiment designer"
          summaryTitle="Concept summary"
          steps={[
            {
              title: "Research area",
              content: (
                <Select
                  label="Research domain"
                  value={e.domain}
                  options={(Object.keys(EXPERIMENT_DOMAINS) as ExperimentDomain[]).map((k) => ({ value: k, label: EXPERIMENT_DOMAINS[k].label }))}
                  onChange={set("domain")}
                />
              ),
            },
            {
              title: "Experiment requirements",
              content: (
                <>
                  <Slider label="Duration" value={e.durationDays} min={1} max={180} step={1} unit="days" onChange={set("durationDays")} />
                  <Select label="Crew interaction" value={e.crewInteraction} options={[{ value: "none", label: "None (automated)" }, { value: "low", label: "Low" }, { value: "high", label: "High" }]} onChange={set("crewInteraction")} />
                  <Select
                    label="Temperature requirement"
                    value={e.temperature}
                    options={[{ value: "ambient", label: "Cabin ambient" }, { value: "controlled", label: "Controlled" }, { value: "cold", label: "Cold / frozen" }, { value: "hot", label: "High temperature" }]}
                    onChange={set("temperature")}
                  />
                </>
              ),
            },
            {
              title: "Station resources",
              content: (
                <>
                  <Slider label="Power" value={e.powerW} min={0} max={2000} step={10} unit="W" onChange={set("powerW")} />
                  <Slider label="Mass" value={e.massKg} min={1} max={500} step={1} unit="kg" onChange={set("massKg")} />
                  <Slider label="Volume" value={e.volumeL} min={1} max={1000} step={1} unit="L" onChange={set("volumeL")} />
                  <Slider label="Data" value={e.dataGBPerDay} min={0} max={100} step={1} unit="GB/day" onChange={set("dataGBPerDay")} />
                </>
              ),
            },
            {
              title: "Safety & controls",
              content: (
                <>
                  <Select label="Containment" value={e.containment} options={[{ value: "none", label: "None" }, { value: "single", label: "Single level" }, { value: "multiple", label: "Multiple levels" }]} onChange={set("containment")} />
                  <Check label="Sample return required" checked={e.sampleReturn} onChange={set("sampleReturn")} />
                  <Check label="External exposure required" checked={e.externalExposure} onChange={set("externalExposure")} />
                </>
              ),
            },
          ]}
          summary={
            <>
              <p className={styles.simLabel}>Conceptual educational experiment design — not flight qualification.</p>
            <h4>Experimental concept</h4>
            <p>{plan.summary}</p>
            <p><b style={{ color: "var(--space-text)" }}>Likely platform: </b>{plan.platformClass}</p>
            <div className={styles.grid2}>
              <div>
                <h4>Station resources</h4>
                <ul>{plan.resources.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <div>
                <h4>Controls &amp; Earth control experiment</h4>
                <ul>{plan.controls.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <div>
                <h4>Measurements</h4>
                <ul>{plan.measurements.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <div>
                <h4>Safety considerations</h4>
                <ul>{plan.safety.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <div>
                <h4>Data collection plan</h4>
                <ul>{plan.dataPlan.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <div>
                <h4>Possible research questions</h4>
                <ul>{plan.questions.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
            </div>
            <h4 style={{ marginTop: 12 }}>From concept to data</h4>
            <ol className={styles.steps} style={{ marginTop: 10 }}>
              {LIFECYCLE_STAGES.map((s) => (
                <li key={s.stage}>
                  <h4>{s.stage}</h4>
                  <p>{s.note}</p>
                </li>
              ))}
            </ol>
            </>
          }
        />
      )}
    </SimFrame>
  );
}
