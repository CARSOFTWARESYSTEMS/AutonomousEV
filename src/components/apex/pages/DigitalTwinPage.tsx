import { JsonLd } from "@/lib/structured-data/JsonLd";
import { apexImage } from "@/data/apex/images";
import { apexJsonLd } from "@/data/apex/seo";
import { MEASUREMENT_CLASSES } from "@/data/apex/validation";
import { ApexPageView } from "../ApexPageView";
import { EvidenceBadge } from "../EvidenceBadge";
import { EvidenceFigure } from "../EvidenceFigure";
import { NextPage, PageHero } from "../PageHero";
import { RelatedTwins } from "../RelatedTwins";
import { SectionHead } from "../SectionHead";
import { TwinCorrelationChart } from "../TwinCorrelationChart";
import { HomeValidation } from "../HomeNarrative";
import { ConfigurationRecord, InstrumentationChain, TestRecord, TwinCycle, TwinMaturity } from "../TwinSections";
import styles from "../apex.module.css";
import validation from "../validation.module.css";

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

      <HomeValidation showLink={false} />

      <section className={styles.section} aria-labelledby="twin-loop-title" id="twin-loop">
        <div className={styles.container}>
          <SectionHead eyebrow="The twin loop" id="twin-loop-title" title="Predict. Test. Compare. Learn." lead="The loop runs once per test. Each pass leaves a prediction, a measurement and a decision on record." small />
          <TwinCycle />
          <div style={{ marginTop: 56, maxWidth: 860 }}>
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
            lead="Each physical test becomes a digital record tied to its configuration. Through the engineering collaboration, Gamyaa AeroSystems contributes digital-engineering, test-data, model-correlation and engineering-evidence capabilities."
            small
          />
          <TestRecord />
        </div>
      </section>

      <RelatedTwins />
      <NextPage current="digital-twin" />
    </>
  );
}
