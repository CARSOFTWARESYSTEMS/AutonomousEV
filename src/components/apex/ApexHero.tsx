import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { apexImage } from "@/data/apex/images";
import { APEX_OFFICIAL_SITE_URL, APEX_SITE, apexHref } from "@/data/apex/site";
import { ApexPicture } from "./ApexPicture";
import { EvidenceBadge } from "./EvidenceBadge";
import { Eyebrow } from "./SectionHead";
import { UnitText } from "./UnitText";
import { apexTrack } from "./analytics";
import styles from "./apex.module.css";
import sections from "./sections.module.css";

const SPECS = [
  { value: "5 kN class", label: "Thrust class" },
  { value: "Gas-generator", label: "Engine cycle" },
  { value: "Liquid", label: "Propulsion" },
  { value: "Built", label: "Hardware status" },
];

export function ApexHero() {
  const desktop = apexImage("06");
  const mobile = apexImage("07");
  return (
    <section className={`${sections.hero} ${styles.forceDark}`} aria-labelledby="apex-hero-title">
      <div className={sections.heroMedia}>
        <ApexPicture image={desktop} mobile={mobile} sizes="100vw" cover priority alt={desktop.alt} />
        <div className={sections.heroShade} aria-hidden="true" />
      </div>

      <div className={`${styles.container} ${sections.heroContent}`}>
        <div className={sections.heroCopy}>
          <Eyebrow index="01">APEX Rocket Systems</Eyebrow>
          <h1 id="apex-hero-title" className={styles.display}>
            Engineered to <span className={styles.amber}>ascend.</span>
          </h1>
          <p className={sections.heroLine}>{APEX_SITE.supportingLine}</p>
          <div className={styles.actions}>
            <Link href={apexHref("/system")} className={`${styles.btn} ${styles.btnPrimary}`} {...apexTrack("apex_cta_click", { cta: "explore_system", placement: "hero" })}>
              Explore the system <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href={APEX_OFFICIAL_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnSecondary}`}
              {...apexTrack("apex_official_site_click", { placement: "hero" })}
            >
              Official APEX website <ArrowUpRight size={16} aria-hidden="true" />
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
          </div>
          <div className={sections.heroStatus}>
            <EvidenceBadge status="CONCEPT" label={APEX_SITE.conceptStatus} />
          </div>
        </div>

        <div className={sections.heroStrip}>
          <dl className={styles.specRow}>
            {SPECS.map((spec) => (
              <div key={spec.label} className={styles.specItem}>
                <dt className={styles.specLabel}>{spec.label}</dt>
                <dd className={styles.specValue} style={spec.value === "Built" ? { color: "var(--apex-accent)" } : undefined}>
                  <UnitText>{spec.value}</UnitText>
                </dd>
              </div>
            ))}
          </dl>
          <div className={sections.heroFig}>
            <p className={styles.figcaption}>
              {/* The phone layout shows a different photograph (art direction), so the figure number follows it. */}
              <span className={`${styles.figLabel} ${sections.onlyWide}`}>Fig. {desktop.id}</span>
              <span className={`${styles.figLabel} ${sections.onlyNarrow}`}>Fig. {mobile.id}</span>
              <span className={sections.onlyWide}>{desktop.publicCaption}</span>
              <span className={sections.onlyNarrow}>{mobile.publicCaption}</span>
            </p>
            <p className={styles.source}>
              Source:{" "}
              <a href={APEX_OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_official_site_click", { placement: "hero_source" })}>
                apexrocketsystems.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
