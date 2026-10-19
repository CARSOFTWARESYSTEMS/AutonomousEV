import { JsonLd } from "@/lib/structured-data/JsonLd";
import { apexJsonLd } from "@/data/apex/seo";
import { PARTNER_STATUS_LABEL } from "@/data/apex/partners";
import { ApexPageView } from "../ApexPageView";
import { CapabilityExplorer } from "../CapabilityExplorer";
import { ContributionFinder } from "../ContributionFinder";
import { EcosystemRings } from "../EcosystemRings";
import { NextPage, PageHero } from "../PageHero";
import { PartnerCards } from "../PartnerCards";
import { SectionHead } from "../SectionHead";
import styles from "../apex.module.css";

const LANGUAGE = ["PROPOSED_PARTNER", "CAPABILITY_PROVIDER", "PARTNER_REQUIRED", "TO_BE_IDENTIFIED"] as const;

export function EcosystemPage() {
  return (
    <>
      <JsonLd data={apexJsonLd("ecosystem")} />
      <ApexPageView page="ecosystem" />
      <PageHero
        eyebrow="Ecosystem"
        title="No rocket company builds everything alone."
        lead="Integrated rocket systems require a coordinated network of propulsion, electronics, software, manufacturing, quality, test, digital-engineering and specialist capabilities."
      />

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="rings-title" id="map">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Ecosystem map"
            id="rings-title"
            title="APEX at the centre"
            lead="Choose an area to see its capabilities and who is proposed for each. A capability can have many partners; a partner can hold many capabilities."
            small
          />
          <EcosystemRings />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="partners-title" id="partners">
        <div className={styles.container}>
          <SectionHead eyebrow="Organisations" id="partners-title" title="Proposed partners" lead="Select an organisation to see every capability it is proposed for." small />
          <PartnerCards />
          <div className={styles.note} style={{ marginTop: 24 }}>
            <span>
              Relationship language used on this site:{" "}
              {LANGUAGE.map((status, i) => (
                <span key={status}>
                  <strong style={{ color: "var(--apex-text)" }}>{PARTNER_STATUS_LABEL[status]}</strong>
                  {i < LANGUAGE.length - 1 ? " · " : ". "}
                </span>
              ))}
              No relationship shown is a formal agreement unless it is marked as one.
            </span>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="capabilities-title" id="capabilities">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Capabilities"
            id="capabilities-title"
            title="Every capability, and its gaps"
            lead="Why it matters, what it connects to, its deliverables and evidence, who is proposed and where more partners can join."
            small
          />
          <CapabilityExplorer />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="contribute-title" id="contribute">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Business & entrepreneur view"
            id="contribute-title"
            title="Where can we contribute?"
            lead="Choose what your organisation does. See where it connects to the APEX development lifecycle and which interfaces matter."
            small
          />
          <ContributionFinder />
        </div>
      </section>
      <NextPage current="ecosystem" />
    </>
  );
}
