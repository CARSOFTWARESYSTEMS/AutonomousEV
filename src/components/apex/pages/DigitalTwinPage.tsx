import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { apexImage } from "@/data/apex/images";
import { apexJsonLd } from "@/data/apex/seo";
import { DIGITAL_TWIN_RESPONSIBILITIES, MEASUREMENT_CLASSES } from "@/data/apex/validation";
import { ApexPageView } from "../ApexPageView";
import { EvidenceBadge } from "../EvidenceBadge";
import { EvidenceFigure } from "../EvidenceFigure";
import { NextPage, PageHero } from "../PageHero";
import { SectionHead } from "../SectionHead";
import { TwinCorrelationChart } from "../TwinCorrelationChart";
import { ConfigurationRecord, InstrumentationChain, TestRecord, TwinLoop, TwinMaturity } from "../TwinSections";
import { apexTrack } from "../analytics";
import styles from "../apex.module.css";
import validation from "../validation.module.css";

const RELATED = [
  {
    href: "/space/rocket-engine-digital-twin",
    title: "Next-Generation Rocket Engine Digital Twin",
    detail: "An educational reference architecture with simulated data — propellant feed, combustion, cooling, control and simulated testing.",
    id: "rocket_engine_digital_twin",
  },
  {
    href: "/space/rocket-engine-digital-twin-advanced",
    title: "Advanced Rocket Propulsion Digital Twin",
    detail: "A research-oriented reference for physics-based and data-driven twins: pressure monitoring, fault detection, diagnosis and prognostics.",
    id: "rocket_propulsion_digital_twin_advanced",
  },
];

export function DigitalTwinPage() {
  return (
    <>
      <JsonLd data={apexJsonLd("digital-twin")} />
      <ApexPageView page="digital-twin" />
      <PageHero
        eyebrow="Digital Twin"
        title="Digital Twin + physical testing"
        lead="A Digital Twin increases the value of physical testing by helping engineers predict expected behaviour, compare measured results, investigate deviations and improve the next engineering baseline."
        aside={<EvidenceFigure image={apexImage("03")} sizes="(min-width: 1024px) 34vw, 100vw" aspect="4 / 5" priority />}
      >
        <div className={styles.chips} style={{ alignItems: "center" }}>
          <EvidenceBadge status="CONCEPT" label="Proposed approach" />
          <span className={styles.small}>Never a replacement for physical testing.</span>
        </div>
      </PageHero>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="responsibilities-title">
        <div className={styles.container}>
          <SectionHead eyebrow="What the twin does" id="responsibilities-title" title="Nine responsibilities" small />
          <ul className={validation.measures}>
            {DIGITAL_TWIN_RESPONSIBILITIES.map((item, i) => (
              <li key={item.id} className={validation.measure}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="twin-loop-title" id="twin-loop">
        <div className={styles.container}>
          <SectionHead eyebrow="The twin loop" id="twin-loop-title" title="Predict. Test. Compare. Decide." lead="The loop runs once per test. Each pass leaves a prediction, a measurement and a decision on record." small />
          <TwinLoop />
          <div style={{ marginTop: 48, maxWidth: 820 }}>
            <TwinCorrelationChart />
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="maturity-title" id="maturity">
        <div className={styles.container}>
          <SectionHead eyebrow="Digital Twin maturity" id="maturity-title" title="Five potential levels" lead="Confidence in a twin is earned the same way as confidence in hardware: by evidence, within defined limits." small />
          <TwinMaturity />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="config-title" id="configuration">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Configuration-aware twin"
            id="config-title"
            title="Same configuration, or no comparison."
            lead="Predicted-versus-measured comparisons are meaningful only when the digital and physical configurations correspond."
            small
          />
          <ConfigurationRecord />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="instrumentation-title" id="instrumentation">
        <div className={styles.container}>
          <SectionHead eyebrow="Instrumentation" id="instrumentation-title" title="If you cannot measure it, you cannot correlate it." small />
          <ul className={validation.measures} style={{ marginBottom: 32 }}>
            {MEASUREMENT_CLASSES.map((name, i) => (
              <li key={name} className={validation.measure}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {name}
              </li>
            ))}
          </ul>
          <h3 className={styles.h4} style={{ marginBottom: 14 }}>
            Sensor to correlation — and who can contribute at each stage
          </h3>
          <InstrumentationChain />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="test-data-title" id="test-data">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Engineering test data"
            id="test-data-title"
            title="Every test, a traceable record"
            lead="Each physical test becomes a digital record tied to its configuration. Proposed capability partner: Gamyaa Aerospace — digital engineering, test-data platform, model correlation and engineering evidence."
            small
          />
          <TestRecord />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="related-title" id="related">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Related Gamyaa Aerospace Digital Engineering Capability"
            id="related-title"
            title="Reference work"
            lead="Educational and research reference architectures published on this site. They are not APEX engine twins and use no APEX data."
            small
          />
          <div className={validation.related}>
            {RELATED.map((item) => (
              <Link key={item.href} href={item.href} className={validation.relatedCard} {...apexTrack("apex_cta_click", { cta: item.id, placement: "related_capability" })}>
                <span className={styles.specLabel}>Related Gamyaa Aerospace Digital Engineering Capability</span>
                <span className={styles.h3}>{item.title}</span>
                <span className={styles.small}>{item.detail}</span>
                <span className={styles.mono} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--apex-text)" }}>
                  Open <ArrowRight size={14} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <NextPage current="digital-twin" />
    </>
  );
}
