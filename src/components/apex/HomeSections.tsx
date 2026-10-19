import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BUSINESS_EQUATION, BUSINESS_RESULT, COLLABORATION_CATEGORIES } from "@/data/apex/business";
import { FOUNDERS } from "@/data/apex/founders";
import { apexImage } from "@/data/apex/images";
import { CLOSED_LOOP, SIGNATURE_LOOP } from "@/data/apex/lifecycle";
import { capabilityCoverage } from "@/data/apex/partner-capabilities";
import { ROADMAP, ROADMAP_STATUS_ORDER, roadmapDateLabel } from "@/data/apex/roadmap";
import { APEX_OFFICIAL_SITE_URL, apexHref } from "@/data/apex/site";
import { ApexPicture } from "./ApexPicture";
import { DevelopmentLoop } from "./DevelopmentLoop";
import { EvidenceBadge } from "./EvidenceBadge";
import { PartnerCards } from "./PartnerCards";
import { SectionHead, Eyebrow } from "./SectionHead";
import { TwinCorrelationChart } from "./TwinCorrelationChart";
import { apexTrack } from "./analytics";
import styles from "./apex.module.css";
import loop from "./loop.module.css";
import sections from "./sections.module.css";

/** 06 — Physical + digital validation. */
export function PhysicalDigital({ index = "06" }: { index?: string }) {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="physical-digital-title" id="physical-digital">
      <div className={styles.container}>
        <SectionHead
          index={index}
          eyebrow="Physical + digital validation"
          id="physical-digital-title"
          title="Digital Twin + physical testing"
          lead="A Digital Twin increases the value of physical testing by helping engineers predict expected behaviour, compare measured results, investigate deviations and improve the next engineering baseline."
        />
        <div className={sections.pairGrid}>
          <div className={sections.pairCard}>
            <p className={styles.eyebrow}>Physical</p>
            <div className={sections.pairMedia}>
              <ApexPicture image={apexImage("03")} sizes="(min-width: 1024px) 40vw, 100vw" cover />
            </div>
            <ul className={styles.list}>
              <li>Hardware built to a recorded configuration</li>
              <li>Instrumented, calibrated and time-synchronised</li>
              <li>Tested to a written objective</li>
              <li>Measured data, events and anomalies recorded</li>
            </ul>
            <p className={styles.small}>Fig. 03 — {apexImage("03").publicCaption}</p>
          </div>
          <div className={sections.pairPlus} aria-hidden="true">
            +
          </div>
          <div className={sections.pairCard}>
            <p className={styles.eyebrow}>Digital</p>
            <TwinCorrelationChart compact />
            <ul className={styles.list}>
              <li>Prediction made before the test</li>
              <li>Compared with measurements on the same configuration</li>
              <li>Deviations investigated, not averaged away</li>
              <li>Model or hardware updated, then retested</li>
            </ul>
          </div>
        </div>
        <p className={styles.note} style={{ marginTop: 28 }}>
          The Digital Twin never replaces physical testing. It makes each test more informative and each decision better evidenced.
        </p>
        <div className={styles.actions} style={{ marginTop: 28 }}>
          <Link href={apexHref("/digital-twin")} className={`${styles.btn} ${styles.btnSecondary}`} {...apexTrack("apex_cta_click", { cta: "digital_twin", placement: "physical_digital" })}>
            Digital Twin approach <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** 07 — The development and validation loop: the signature of the site. */
export function LoopSection({ index = "07" }: { index?: string }) {
  return (
    <section className={styles.section} aria-labelledby="loop-title" id="loop">
      <div className={styles.container}>
        <div className={loop.loopSection}>
          <div style={{ display: "grid", gap: 22 }}>
            <Eyebrow index={index}>Development & validation loop</Eyebrow>
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

/** 08 — The engineering ecosystem and the business equation. */
export function EcosystemSummary({ index = "08" }: { index?: string }) {
  const coverage = capabilityCoverage();
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="ecosystem-summary-title" id="ecosystem">
      <div className={styles.container}>
        <SectionHead
          index={index}
          eyebrow="Engineering ecosystem"
          id="ecosystem-summary-title"
          title="No rocket company builds everything alone."
          lead="APEX keeps the rocket. Specialist partners contribute capabilities. Digital engineering connects the evidence; physical testing builds the confidence."
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

        <div style={{ marginTop: "clamp(40px, 6vw, 72px)", display: "grid", gap: 24 }}>
          <div className={sections.statsRow}>
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
              <span className={sections.statValue}>{coverage.proposed}</span>
              <span className={styles.specLabel}>Partner proposed</span>
            </div>
            <div className={sections.stat}>
              <span className={sections.statValue}>{coverage.partnerRequired}</span>
              <span className={styles.specLabel}>Open — partner required</span>
            </div>
          </div>
          <PartnerCards />
          <div className={styles.actions}>
            <Link href={apexHref("/ecosystem")} className={`${styles.btn} ${styles.btnPrimary}`} {...apexTrack("apex_cta_click", { cta: "ecosystem", placement: "home_ecosystem" })}>
              Explore the ecosystem <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href={apexHref("/ecosystem#contribute")} className={`${styles.btn} ${styles.btnSecondary}`} {...apexTrack("apex_cta_click", { cta: "where_contribute", placement: "home_ecosystem" })}>
              Where can we contribute?
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 09 — The roadmap, grouped by status. Dates are shown only when APEX confirms them. */
export function RoadmapSummary({ index = "09" }: { index?: string }) {
  return (
    <section className={styles.section} aria-labelledby="roadmap-summary-title" id="roadmap">
      <div className={styles.container}>
        <SectionHead
          index={index}
          eyebrow="Roadmap"
          id="roadmap-summary-title"
          title="Evidence first. Dates when confirmed."
          lead="Each item carries its status and what it rests on. No date appears until APEX confirms it."
        />
        <div className={sections.roadmapCols}>
          {ROADMAP_STATUS_ORDER.map((status) => {
            const items = ROADMAP.filter((item) => item.status === status && item.publicSafe);
            return (
              <div key={status} className={sections.roadmapCol}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <EvidenceBadge status={status} />
                  <span className={styles.mono} style={{ color: "var(--apex-text-3)" }}>
                    {items.length}
                  </span>
                </div>
                <ul>
                  {items.slice(0, 3).map((item) => (
                    <li key={item.id} className={sections.roadmapItem}>
                      <span className={sections.roadmapItemTitle}>{item.title}</span>
                      <span className={sections.roadmapDate}>{roadmapDateLabel(item)}</span>
                    </li>
                  ))}
                  {items.length > 3 && <li className={styles.small}>+ {items.length - 3} more</li>}
                </ul>
              </div>
            );
          })}
        </div>
        <div className={styles.actions} style={{ marginTop: 28 }}>
          <Link href={apexHref("/roadmap")} className={`${styles.btn} ${styles.btnSecondary}`} {...apexTrack("apex_cta_click", { cta: "roadmap", placement: "home_roadmap" })}>
            Roadmap & investor view <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** 10 — Founders. Only what has been supplied. */
export function FounderSection({ index = "10", headingLevel = 2 }: { index?: string; headingLevel?: 2 | 3 }) {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="founders-title" id="founders">
      <div className={styles.container}>
        <SectionHead index={index} eyebrow="Founders" id="founders-title" title="Building APEX" level={headingLevel} small />
        <ul className={sections.founders}>
          {FOUNDERS.map((founder) => (
            <li key={founder.id} className={sections.founderCard}>
              <span className={sections.monogram} aria-hidden="true">
                {founder.initials}
              </span>
              <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
                <p className={sections.founderName}>{founder.name}</p>
                <p className={styles.mono} style={{ color: "var(--apex-text-3)" }}>
                  {founder.title} · APEX Rocket Systems
                </p>
                {founder.linkedin && (
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnGhost}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14 }}
                    {...apexTrack("apex_cta_click", { cta: "founder_linkedin", founder_id: founder.id })}
                  >
                    LinkedIn <ArrowUpRight size={15} aria-hidden="true" />
                    <span className={styles.srOnly}> profile of {founder.name} (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 11 — Build with APEX. */
export function CollaborationCTA({ index = "11" }: { index?: string }) {
  return (
    <section className={`${styles.section} ${sections.cta}`} aria-labelledby="cta-title" id="collaborate">
      <div className={styles.container}>
        <div className={sections.ctaInner}>
          <Eyebrow index={index}>Collaboration</Eyebrow>
          <h2 id="cta-title" className={sections.ctaTitle}>
            Build with <span className={styles.amber}>APEX.</span>
          </h2>
          <p className={styles.lead}>
            For engineering organisations, manufacturers, test laboratories, researchers, investors and engineers who want to help turn propulsion hardware into a
            validated rocket system.
          </p>
          <ul className={styles.chips} aria-label="Collaboration areas">
            {COLLABORATION_CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  href={apexHref(`/company?topic=${category.id}#contact`)}
                  className={styles.chip}
                  {...apexTrack("apex_collaboration_click", { topic: category.id, placement: "cta_chips" })}
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <Link href={apexHref("/company#contact")} className={`${styles.btn} ${styles.btnPrimary}`} {...apexTrack("apex_collaboration_click", { placement: "cta" })}>
              Discuss collaboration <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href={APEX_OFFICIAL_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnSecondary}`}
              {...apexTrack("apex_official_site_click", { placement: "cta" })}
            >
              Official APEX website <ArrowUpRight size={16} aria-hidden="true" />
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
