import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { evidence } from "@/data/apex/evidence";
import { apexImage } from "@/data/apex/images";
import { capabilitiesForPartner } from "@/data/apex/partner-capabilities";
import { apexJsonLd } from "@/data/apex/seo";
import { APEX_OFFICIAL_PAGES, APEX_OFFICIAL_SITE_URL, APEX_SITE } from "@/data/apex/site";
import { APEX_RESPONSIBILITIES } from "@/data/apex/system";
import { ApexPageView } from "../ApexPageView";
import { ContactComposer } from "../ContactComposer";
import { EvidenceFigure } from "../EvidenceFigure";
import { FounderSection } from "../HomeSections";
import { PageHero } from "../PageHero";
import { ProtectedEmail } from "../ProtectedEmail";
import { SectionHead } from "../SectionHead";
import { apexTrack } from "../analytics";
import styles from "../apex.module.css";
import company from "../company.module.css";

export function CompanyPage() {
  const apexCaps = capabilitiesForPartner("apex");
  return (
    <>
      <JsonLd data={apexJsonLd("company")} />
      <ApexPageView page="company" />
      <PageHero
        eyebrow="Company"
        title="APEX Rocket Systems"
        lead={evidence("company-focus").approvedWording}
        aside={<EvidenceFigure image={apexImage("05")} sizes="(min-width: 1024px) 34vw, 100vw" aspect="4 / 5" priority />}
      >
        <div className={styles.actions}>
          <a
            href={APEX_OFFICIAL_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btn} ${styles.btnPrimary}`}
            {...apexTrack("apex_official_site_click", { placement: "company_hero" })}
          >
            Official website <ArrowUpRight size={16} aria-hidden="true" />
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </a>
        </div>
      </PageHero>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="about-title" id="about">
        <div className={styles.container}>
          <div className={company.aboutGrid}>
            <SectionHead
              eyebrow="About APEX"
              id="about-title"
              title="Hardware first"
              lead="At APEX, engineering concepts become physical hardware. These facts come from APEX's official website or were supplied by APEX for this proposal."
              small
            />
            <dl className={company.factList}>
              <div>
                <dt>Company</dt>
                <dd>APEX Rocket Systems</dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>Small- and medium-lift launch vehicles</dd>
              </div>
              <div>
                <dt>Built</dt>
                <dd>5 kN-class gas-generator-cycle liquid-engine demonstrator</dd>
              </div>
              <div>
                <dt>Approach</dt>
                <dd>Hardware-first, manufacturability-driven design with conventional, accessible processes</dd>
              </div>
              <div>
                <dt>Founders</dt>
                <dd>Vibbhav Gopaal · Arcchit Gopaal</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>
                  <a href={APEX_OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer" className={styles.textLink} {...apexTrack("apex_official_site_click", { placement: "company_facts" })}>
                    www.apexrocketsystems.com
                  </a>
                </dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>
                  <ProtectedEmail placement="company_facts" className={styles.textLink} />
                </dd>
              </div>
            </dl>
          </div>
          <p className={styles.source} style={{ marginTop: 18 }}>
            Sources:{" "}
            <a href={APEX_OFFICIAL_PAGES.about} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_official_site_click", { placement: "company_source" })}>
              apexrocketsystems.com — About
            </a>{" "}
            ·{" "}
            <a href={APEX_OFFICIAL_PAGES.home} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_official_site_click", { placement: "company_source_home" })}>
              Home
            </a>
          </p>
        </div>
      </section>

      <FounderSection index="" headingLevel={2} />

      <section className={styles.section} aria-labelledby="ownership-title" id="ownership">
        <div className={styles.container}>
          <SectionHead eyebrow="Positioning" id="ownership-title" title={APEX_SITE.ownerRole} small />
          <div className={company.ownership}>
            <div className={company.ownBlock} data-apex="">
              <h3 className={styles.h4}>APEX owns</h3>
              <ul className={styles.list}>
                {APEX_RESPONSIBILITIES.map((item) => (
                  <li key={item.id}>
                    <strong style={{ color: "var(--apex-text)" }}>{item.label}.</strong> {item.detail}
                  </li>
                ))}
              </ul>
            </div>
            <div className={company.ownBlock} data-partners="">
              <h3 className={styles.h4}>Ecosystem partners contribute</h3>
              <p className={styles.body}>
                Specialist capabilities — electronics, firmware, sensors, software, digital engineering, manufacturing, quality, cybersecurity, AI, verification and
                skills — delivered to APEX&rsquo;s requirements and accepted by APEX.
              </p>
              <p className={styles.small}>APEX itself holds {apexCaps.length} capabilities as program owner: {apexCaps.map(({ capability }) => capability.name).join(", ")}.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="contact-title" id="contact">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Contact"
            id="contact-title"
            title={
              <>
                Build with <span className={styles.amber}>APEX.</span>
              </>
            }
            lead="Strategic partnership, engineering collaboration, manufacturing, embedded systems, avionics, sensors, testing, research, investment or talent."
          />
          <ContactComposer />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionTight}`} aria-labelledby="disclosure-title">
        <div className={styles.container}>
          <h2 id="disclosure-title" className={styles.h4} style={{ marginBottom: 12 }}>
            About this site
          </h2>
          <p className={styles.body}>
            {APEX_SITE.disclosure}{" "}
            It sets out a proposed way of working and does not imply that every partner, capability, test or product shown already exists. Claims
            about APEX are limited to APEX&rsquo;s own published information and information APEX supplied; anything else is marked Concept, Partner Required or
            Evidence Required.
          </p>
        </div>
      </section>
    </>
  );
}
