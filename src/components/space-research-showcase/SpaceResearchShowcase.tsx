"use client";
// ISHAVASYAM.ORG · Space Research: the spacecraft counterpart to the UFlight™
// aircraft feature on /aerospace. Same card family (copy left, visual right,
// stacked on smaller screens), its own identity: an orbital scene in deep
// navy and purple with cyan telemetry. The CTA opens the Space Research
// Portal in a new tab.
import { ArrowUpRight } from "lucide-react";
import SpacecraftPreview3D from "./SpacecraftPreview3D";
import styles from "./spaceResearch.module.css";

export const SPACE_RESEARCH_URL = "https://aerospace.ev.engineer/space";

export default function SpaceResearchShowcase({ titleFont }: { titleFont?: string }) {
  return (
    <div className={styles.card}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>ISHAVASYAM.ORG · SPACE RESEARCH</p>
        <h2 id="space-research-title" className={styles.title} style={{ fontFamily: titleFont }}>
          Learn to Protect Missions.
        </h2>
        <p className={styles.subtitle} style={{ fontFamily: titleFont }}>
          Build Systems That Protect Spacecraft.
        </p>
        <p className={styles.text}>Explore spacecraft systems, digital twins, telemetry, fault detection and safe recovery through interactive engineering experiences.</p>
        <div className={styles.actions}>
          <a
            href={SPACE_RESEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Explore Space Research (opens in a new tab)"
            className={styles.cta}
            data-track-event="space_research_open"
            data-track-source="aerospace_home"
          >
            Space Research <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <p className={styles.note}>Educational 3D visualization · Simulated telemetry</p>
        </div>
      </div>
      <SpacecraftPreview3D />
    </div>
  );
}
