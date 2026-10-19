import type { CSSProperties } from "react";
import { CAPABILITIES } from "@/data/apex/partner-capabilities";
import { SYSTEM_DOMAINS } from "@/data/apex/system";
import { InView } from "./InView";
import { Eyebrow } from "./SectionHead";
import styles from "./apex.module.css";
import sections from "./sections.module.css";

const DEPENDENCIES = [
  "Propulsion",
  "Structures",
  "Avionics",
  "Embedded systems",
  "Software",
  "Sensors",
  "Manufacturing",
  "Quality",
  "Testing",
  "Ground systems",
  "Specialist engineering",
];

/** 03 — The central problem: an engine is one part of the system. */
export function EngineToSystem({ index = "03" }: { index?: string }) {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="beginning-title" id="beginning">
      <div className={styles.container}>
        <div className={sections.problemGrid}>
          <div style={{ display: "grid", gap: 22 }}>
            <Eyebrow index={index}>Why an engine is only the beginning</Eyebrow>
            <h2 id="beginning-title" className={styles.h2}>
              Building an engine is the beginning.
            </h2>
            <p className={styles.lead}>
              Progressing toward a credible launch system requires coordinated development across propulsion, structures, avionics, embedded systems,
              software, sensors, manufacturing, quality, testing, ground systems and specialist engineering.
            </p>
          </div>

          <InView>
            <div style={{ display: "grid", gap: 28 }}>
              <div className={sections.scaleRow}>
                <div className={sections.scaleItem}>
                  <span className={sections.scaleNumber} data-accent="">1</span>
                  <span className={styles.specLabel}>Engine demonstrator built</span>
                </div>
                <div className={sections.scaleItem}>
                  <span className={sections.scaleNumber}>{SYSTEM_DOMAINS.length}</span>
                  <span className={styles.specLabel}>System domains</span>
                </div>
                <div className={sections.scaleItem}>
                  <span className={sections.scaleNumber}>{CAPABILITIES.length}</span>
                  <span className={styles.specLabel}>Specialist capabilities</span>
                </div>
              </div>
              <ul className={sections.dependencyCloud} aria-label="Disciplines a launch system depends on">
                {DEPENDENCIES.map((name, i) => (
                  <li key={name} className={sections.dependency} data-core={i === 0 ? "" : undefined} style={{ "--i": i } as CSSProperties}>
                    {name}
                  </li>
                ))}
              </ul>
              <p className={styles.small}>The engine is where APEX started. Each discipline above is a system of its own, with interfaces to the others.</p>
            </div>
          </InView>
        </div>
      </div>
    </section>
  );
}
