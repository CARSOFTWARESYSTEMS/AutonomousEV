"use client";
import { useState } from "react";
import { Rocket, Orbit, Satellite, Eye, Database, BrainCircuit, Layers, Users, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SYSTEM_DIAGRAM_STAGES } from "../applicationsData";
import { useViewMode } from "./ViewProvider";
import { useMediaQuery } from "./useMediaQuery";
import StageAccordion, { type Stage } from "./StageAccordion";
import styles from "../everyday-applications.module.css";

const STAGE_ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  access: Orbit,
  satellite: Satellite,
  observation: Eye,
  data: Database,
  intelligence: BrainCircuit,
  service: Layers,
  citizen: Users,
  benefit: Sparkles,
};

export default function SystemDiagram() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { view } = useViewMode();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const active = SYSTEM_DIAGRAM_STAGES[activeIndex];
  const ActiveIcon = STAGE_ICONS[active.id] ?? Rocket;

  if (!isDesktop) {
    const stages: Stage[] = SYSTEM_DIAGRAM_STAGES.map((stage) => {
      const Icon = STAGE_ICONS[stage.id] ?? Rocket;
      return {
        id: stage.id,
        label: stage.plainLabel,
        sublabel: view === "engineering" ? stage.technicalLabel : undefined,
        icon: Icon,
        body: <p>{stage.description}</p>,
      };
    });
    return (
      <div>
        <StageAccordion stages={stages} groupName="system-diagram" />
        <p className={styles.formNote} style={{ marginTop: 16 }}>
          Rockets provide access to space. Satellites create services from space. Data becomes valuable only when it
          improves a decision.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.phaseRail} role="tablist" aria-label="Space value chain stages">
        {SYSTEM_DIAGRAM_STAGES.map((stage, i) => {
          const Icon = STAGE_ICONS[stage.id] ?? Rocket;
          return (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              className={styles.phaseChip}
              onClick={() => setActiveIndex(i)}
            >
              <Icon size={14} aria-hidden="true" />
              {stage.plainLabel}
            </button>
          );
        })}
      </div>
      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${((activeIndex + 1) / SYSTEM_DIAGRAM_STAGES.length) * 100}%` }} />
      </div>
      <div className={styles.phasePanel} role="tabpanel" aria-live="polite">
        <div className={styles.phasePanelHead}>
          <span className={styles.phasePanelIcon}>
            <ActiveIcon size={20} aria-hidden="true" />
          </span>
          <h3 style={{ margin: 0 }}>{active.plainLabel}</h3>
        </div>
        {view === "engineering" && <p className={styles.formNote} style={{ marginTop: 6 }}>{active.technicalLabel}</p>}
        <p style={{ marginTop: 12 }}>{active.description}</p>
        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            disabled={activeIndex === 0}
          >
            ← Previous stage
          </button>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => setActiveIndex((i) => Math.min(SYSTEM_DIAGRAM_STAGES.length - 1, i + 1))}
            disabled={activeIndex === SYSTEM_DIAGRAM_STAGES.length - 1}
          >
            Next stage →
          </button>
        </div>
      </div>
      <p className={styles.formNote} style={{ marginTop: 16 }}>
        Rockets provide access to space. Satellites create services from space. Data becomes valuable only when it
        improves a decision.
      </p>
    </div>
  );
}
