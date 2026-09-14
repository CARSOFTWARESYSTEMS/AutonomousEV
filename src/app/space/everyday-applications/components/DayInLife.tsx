"use client";
import { useState } from "react";
import { DAY_IN_LIFE } from "../applicationsData";
import { useMediaQuery } from "./useMediaQuery";
import StageAccordion, { type Stage } from "./StageAccordion";
import styles from "../everyday-applications.module.css";

export default function DayInLife() {
  const [activeIndex, setActiveIndex] = useState(0);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const active = DAY_IN_LIFE[activeIndex];

  if (!isDesktop) {
    const stages: Stage[] = DAY_IN_LIFE.map((stage) => ({
      id: stage.id,
      label: stage.time,
      sublabel: stage.activity,
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
        {DAY_IN_LIFE.map((stage, i) => (
          <button
            key={stage.id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            className={styles.phaseChip}
            onClick={() => setActiveIndex(i)}
          >
            {stage.time}
          </button>
        ))}
      </div>
      <div className={styles.phasePanel} role="tabpanel" aria-live="polite">
        <h3>{active.activity}</h3>
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
