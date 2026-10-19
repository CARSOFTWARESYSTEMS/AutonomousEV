import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { evidence } from "@/data/apex/evidence";
import { apexImage } from "@/data/apex/images";
import { APEX_OFFICIAL_PAGES, apexHref } from "@/data/apex/site";
import { EvidenceBadge } from "./EvidenceBadge";
import { EvidenceFigure } from "./EvidenceFigure";
import { HardwareGallery } from "./HardwareGallery";
import { Eyebrow } from "./SectionHead";
import { UnitText } from "./UnitText";
import { apexTrack } from "./analytics";
import styles from "./apex.module.css";
import sections from "./sections.module.css";

/** 02 — What APEX has built. The one claim, its words, and its source. */
export function BuiltAtApex({ index = "02", showGallery = true }: { index?: string; showGallery?: boolean }) {
  const built = evidence("engine-demonstrator-built");
  return (
    <section className={styles.section} aria-labelledby="built-title" id="built">
      <div className={styles.container}>
        <div className={sections.builtGrid}>
          <EvidenceFigure image={apexImage("05")} sizes="(min-width: 960px) 44vw, 100vw" aspect="4 / 5" />
          <div className={sections.builtCopy}>
            <Eyebrow index={index}>What APEX has built</Eyebrow>
            <h2 id="built-title" className={styles.h2}>
              Built at APEX
            </h2>
            <h3 className={styles.h3}>5 kN-Class Liquid Engine Demonstrator</h3>
            <p className={styles.lead}>
              Gas-generator-cycle liquid propulsion demonstrator developed as part of APEX Rocket Systems&rsquo; propulsion-development program.
            </p>
            <dl className={sections.builtSpecs}>
              {[
                ["Thrust class", "5 kN class"],
                ["Cycle", "Gas-generator cycle"],
                ["Type", "Liquid propulsion"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className={styles.specLabel}>{label}</dt>
                  <dd className={sections.tripleValue}>
                    <UnitText>{value}</UnitText>
                  </dd>
                </div>
              ))}
            </dl>
            <div className={styles.chips} style={{ alignItems: "center", gap: 14 }}>
              <EvidenceBadge status="BUILT" label="Hardware built" />
              <p className={styles.source}>
                Source:{" "}
                <a href={APEX_OFFICIAL_PAGES.home} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_official_site_click", { placement: "built_source" })}>
                  {built.sourceLabel}
                </a>
              </p>
            </div>
            <p className={styles.small}>
              Performance figures and test results are shown here only when APEX confirms them. Engine test evidence: owner confirmation required.
            </p>
            <div>
              <Link href={apexHref("/engine")} className={`${styles.btn} ${styles.btnSecondary}`} {...apexTrack("apex_cta_click", { cta: "engine_detail", placement: "built" })}>
                Engine detail <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        {showGallery && <HardwareGallery />}
      </div>
    </section>
  );
}
