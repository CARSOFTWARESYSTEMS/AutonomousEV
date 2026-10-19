import { ArrowRight } from "lucide-react";
import { ENGINEERING_PHILOSOPHY, PHASE_LABEL } from "@/data/apex/lifecycle";
import { SectionHead } from "./SectionHead";
import styles from "./apex.module.css";
import sections from "./sections.module.css";

/** 05 — ENGINEER → BUILD → PROVE → IMPROVE, on the paper page. */
export function EngineeringPhilosophy({ index = "05", headingId = "philosophy-title" }: { index?: string; headingId?: string }) {
  return (
    <section className={`${styles.section} ${styles.paper}`} aria-labelledby={headingId} id="engineer-build-prove">
      <div className={styles.container}>
        <SectionHead
          index={index}
          eyebrow="Core engineering philosophy"
          id={headingId}
          title={
            <>
              Engineer <span aria-hidden="true">→</span>
              <span className={styles.srOnly}>, then</span> Build <span aria-hidden="true">→</span>
              <span className={styles.srOnly}>, then</span> Prove <span aria-hidden="true">→</span>
              <span className={styles.srOnly}>, then</span> Improve
            </>
          }
          lead="Confidence is earned in a fixed order. What is learned in each pass becomes the next baseline."
        />
        <ol className={sections.phases}>
          {ENGINEERING_PHILOSOPHY.map((phase, i) => (
            <li key={phase.phase} className={sections.phase}>
              <span className={sections.phaseNumber}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={sections.phaseName}>
                {PHASE_LABEL[phase.phase]}
                {i < ENGINEERING_PHILOSOPHY.length - 1 && <ArrowRight className={sections.phaseArrow} size={28} aria-hidden="true" />}
              </h3>
              <p className={styles.body} style={{ color: "var(--apex-text)" }}>
                {phase.summary}
              </p>
              <ul className={sections.phaseItems}>
                {phase.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <div className={sections.returnPath}>
          <span>Back to Engineer</span>
          <span className={sections.returnLine} aria-hidden="true" />
          <span>Improve feeds the next design</span>
        </div>
      </div>
    </section>
  );
}
