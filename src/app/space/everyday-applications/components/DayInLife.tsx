"use client";
import { useState } from "react";
import { CloudSun, Navigation, Package, UtensilsCrossed, Wifi, Tv, MapPin, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DAY_IN_LIFE } from "../applicationsData";
import { useMediaQuery } from "./useMediaQuery";
import StageAccordion, { type Stage } from "./StageAccordion";
import styles from "../everyday-applications.module.css";

const STAGE_ICONS: Record<string, LucideIcon> = {
  "morning-weather": CloudSun,
  commute: Navigation,
  delivery: Package,
  "food-supply": UtensilsCrossed,
  connectivity: Wifi,
  broadcast: Tv,
  "evening-navigation": MapPin,
  emergency: AlertTriangle,
};

export default function DayInLife() {
  const [activeIndex, setActiveIndex] = useState(0);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const active = DAY_IN_LIFE[activeIndex];
  const ActiveIcon = STAGE_ICONS[active.id] ?? CloudSun;

  if (!isDesktop) {
    const stages: Stage[] = DAY_IN_LIFE.map((stage) => ({
      id: stage.id,
      label: stage.time,
      sublabel: stage.activity,
      icon: STAGE_ICONS[stage.id] ?? CloudSun,
      body: (
        <>
          <div className={styles.componentField}>
            <h4>Space capability</h4>
            <p>{stage.spaceCapability}</p>
          </div>
          <div className={styles.componentField}>
            <h4>Service you use</h4>
            <p>{stage.service}</p>
          </div>
          <div className={styles.componentField}>
            <h4>Everyday benefit</h4>
            <p>{stage.benefit}</p>
          </div>
        </>
      ),
    }));
    return (
      <div>
        <StageAccordion stages={stages} groupName="day-in-life" />
        <p className={styles.formNote} style={{ marginTop: 16 }}>
          Not every app on your phone talks to a satellite directly — often a satellite feeds data to a government or
          commercial system, which then powers the app or service you actually use.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.phaseRail} role="tablist" aria-label="Times of day">
        {DAY_IN_LIFE.map((stage, i) => {
          const Icon = STAGE_ICONS[stage.id] ?? CloudSun;
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
              {stage.time}
            </button>
          );
        })}
      </div>
      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${((activeIndex + 1) / DAY_IN_LIFE.length) * 100}%` }} />
      </div>
      <div className={styles.phasePanel} role="tabpanel" aria-live="polite">
        <div className={styles.phasePanelHead}>
          <span className={styles.phasePanelIcon}>
            <ActiveIcon size={20} aria-hidden="true" />
          </span>
          <h3 style={{ margin: 0 }}>{active.activity}</h3>
        </div>
        <div className={styles.componentField}>
          <h4>Space capability</h4>
          <p>{active.spaceCapability}</p>
        </div>
        <div className={styles.componentField}>
          <h4>Service you use</h4>
          <p>{active.service}</p>
        </div>
        <div className={styles.componentField}>
          <h4>Everyday benefit</h4>
          <p>{active.benefit}</p>
        </div>
        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            disabled={activeIndex === 0}
          >
            ← Earlier
          </button>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => setActiveIndex((i) => Math.min(DAY_IN_LIFE.length - 1, i + 1))}
            disabled={activeIndex === DAY_IN_LIFE.length - 1}
          >
            Later →
          </button>
        </div>
      </div>
      <p className={styles.formNote} style={{ marginTop: 16 }}>
        Not every app on your phone talks to a satellite directly — often a satellite feeds data to a government or
        commercial system, which then powers the app or service you actually use.
      </p>
    </div>
  );
}
