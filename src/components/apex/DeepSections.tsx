import { ArrowUpRight } from "lucide-react";
import { BUSINESS_EQUATION, BUSINESS_RESULT } from "@/data/apex/business";
import { FOUNDERS } from "@/data/apex/founders";
import { CLOSED_LOOP, SIGNATURE_LOOP } from "@/data/apex/lifecycle";
import { capabilityCoverage } from "@/data/apex/partner-capabilities";
import { DevelopmentLoop } from "./DevelopmentLoop";
import { Eyebrow, SectionHead } from "./SectionHead";
import { apexTrack } from "./analytics";
import styles from "./apex.module.css";
import loop from "./loop.module.css";
import sections from "./sections.module.css";

/** DESIGN → SIMULATE → BUILD → INSTRUMENT → TEST → CORRELATE → IMPROVE, with the closed loop behind it. Lives on Build & Validate. */
export function LoopSection() {
  return (
    <section className={styles.section} aria-labelledby="loop-title" id="loop">
      <div className={styles.container}>
        <div className={loop.loopSection}>
          <div style={{ display: "grid", gap: 22 }}>
            <Eyebrow>Development & validation loop</Eyebrow>
            <h2 id="loop-title" className={loop.sequence}>
              {SIGNATURE_LOOP.map((step, i) => (
                <span key={step.id} style={{ display: "inline-flex", gap: 12 }}>
                  {step.label}
                  {i < SIGNATURE_LOOP.length - 1 && (
                    <span className={loop.arrow} aria-hidden="true">
                      →
                    </span>
                  )}
                </span>
              ))}
            </h2>
            <p className={styles.lead}>
              Every pass through the loop leaves evidence: a prediction, a measurement, a comparison and a decision. Confidence grows one loop at a time.
            </p>
          </div>
          <DevelopmentLoop />
        </div>
        <div className={loop.strip}>
          <h3 className={styles.h4}>The closed loop in detail</h3>
          <ol className={loop.stripList}>
            {CLOSED_LOOP.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** The business equation and capability coverage. Lives on the Ecosystem page. */
export function EquationSection() {
  const coverage = capabilityCoverage();
  return (
    <section className={styles.section} aria-labelledby="equation-title" id="equation">
      <div className={styles.container}>
        <SectionHead
          eyebrow="The model"
          id="equation-title"
          title="APEX retains system authority."
          lead="Specialist partners contribute domain capabilities. Digital engineering connects the evidence; physical testing builds the confidence."
          small
        />
        <div className={sections.equation} role="group" aria-label="The business equation">
          {BUSINESS_EQUATION.map((term, i) => (
            <div key={term.title} style={{ display: "contents" }}>
              <div className={sections.term}>
                <span className={sections.termTitle}>{term.title}</span>
                <span className={styles.small}>{term.line}</span>
              </div>
              <span className={sections.operator} aria-hidden="true">
                {i < BUSINESS_EQUATION.length - 1 ? "+" : "="}
              </span>
            </div>
          ))}
          <div className={sections.result}>
            <span className={sections.termTitle}>{BUSINESS_RESULT}</span>
          </div>
        </div>
        <div className={`${sections.statsRow} ${sections.statsRowFive}`} style={{ marginTop: "clamp(40px, 6vw, 72px)" }}>
          <div className={sections.stat}>
            <span className={sections.statValue}>{coverage.total}</span>
            <span className={styles.specLabel}>Capabilities mapped</span>
          </div>
          <div className={sections.stat}>
            <span className={sections.statValue} style={{ color: "var(--apex-accent)" }}>
              {coverage.core}
            </span>
            <span className={styles.specLabel}>Held by APEX</span>
          </div>
          <div className={sections.stat}>
            <span className={sections.statValue}>{coverage.collaboration}</span>
            <span className={styles.specLabel}>Engineering collaboration</span>
          </div>
          <div className={sections.stat}>
            <span className={sections.statValue}>{coverage.proposed}</span>
            <span className={styles.specLabel}>Partner proposed</span>
          </div>
          <div className={sections.stat}>
            <span className={sections.statValue}>{coverage.partnerRequired}</span>
            <span className={styles.specLabel}>Open — partner required</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Founders as typographic profiles: name, confirmed title, profile link. No portraits have been supplied, so none are faked. */
export function FounderSection({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="founders-title" id="founders">
      <div className={styles.container}>
        <SectionHead eyebrow="Founders" id="founders-title" title="Building APEX" level={headingLevel} small />
        <ul className={sections.founders}>
          {FOUNDERS.map((founder) => (
            <li key={founder.id} className={sections.founderProfile}>
              <p className={sections.founderName}>{founder.name}</p>
              <p className={styles.mono} style={{ color: "var(--apex-text-3)" }}>
                {founder.title} · APEX Rocket Systems
              </p>
              {founder.linkedin && (
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.textLink}
                  style={{ justifySelf: "start", fontSize: 15 }}
                  {...apexTrack("apex_cta_click", { cta: "founder_linkedin", founder_id: founder.id })}
                >
                  LinkedIn <ArrowUpRight size={14} aria-hidden="true" style={{ verticalAlign: "-1px" }} />
                  <span className={styles.srOnly}> profile of {founder.name} (opens in a new tab)</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
