import { JsonLd } from "@/lib/structured-data/JsonLd";
import { apexImage } from "@/data/apex/images";
import { MISSION_TO_FLIGHT } from "@/data/apex/lifecycle";
import { apexJsonLd } from "@/data/apex/seo";
import { ApexPageView } from "../ApexPageView";
import { EngineeringPhilosophy } from "../EngineeringPhilosophy";
import { EvidenceFigure } from "../EvidenceFigure";
import { LifecycleExplorer } from "../LifecycleExplorer";
import { NextPage, PageHero } from "../PageHero";
import { SectionHead } from "../SectionHead";
import { ConfidenceLadder, HilDiagram, QualityThread, TestCategories, VirtualToPhysical } from "../ValidationSections";
import styles from "../apex.module.css";

export function BuildValidatePage() {
  return (
    <>
      <JsonLd data={apexJsonLd("build-validate")} />
      <ApexPageView page="build-validate" />
      <PageHero
        eyebrow="Build & Validate"
        title="From mission to flight"
        lead={`One continuous engineering lifecycle in ${MISSION_TO_FLIGHT.length} stages — and back again. Each stage names what happens, what it delivers, the evidence it leaves, and the capabilities and partners it needs.`}
        aside={<EvidenceFigure image={apexImage("01")} sizes="(min-width: 1024px) 34vw, 100vw" aspect="4 / 5" priority />}
      />

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="lifecycle-title" id="lifecycle">
        <div className={styles.container}>
          <SectionHead eyebrow="Development flow" id="lifecycle-title" title="The lifecycle" lead="Select a stage. Capabilities open their detail; partners are those proposed today." small />
          <LifecycleExplorer />
        </div>
      </section>

      <EngineeringPhilosophy index="" headingId="bv-philosophy-title" />

      <section className={styles.section} aria-labelledby="ladder-title" id="testing-strategy">
        <div className={styles.container}>
          <SectionHead eyebrow="Testing strategy" id="ladder-title" title="The confidence ladder" small />
          <ConfidenceLadder />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="categories-title" id="test-categories">
        <div className={styles.container}>
          <SectionHead eyebrow="Test categories" id="categories-title" title="Eight kinds of evidence" lead="Major categories only. Detailed procedures stay with APEX." small />
          <TestCategories />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="hil-title" id="hil">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Hardware-in-the-loop"
            id="hil-title"
            title="Real controllers, simulated world"
            lead="Firmware and controller hardware can be tested against a Digital Twin or simulator before full-vehicle integration."
            small
          />
          <HilDiagram />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="v2p-title" id="virtual-to-physical">
        <div className={styles.container}>
          <SectionHead eyebrow="Virtual to physical" id="v2p-title" title="From 100% simulation to flight" small />
          <VirtualToPhysical />
        </div>
      </section>

      <section className={`${styles.section} ${styles.paper}`} aria-labelledby="thread-title" id="digital-quality-thread">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Digital quality thread"
            id="thread-title"
            title="Every part needs evidence."
            lead="An unbroken record from requirement to acceptance, so any test result can be tied to exactly what was built. Proposed capability: Gamyaa Aerospace — aerospace quality intelligence, manufacturing quality, First Article Inspection and the digital quality thread. No certification is claimed."
            small
          />
          <QualityThread />
        </div>
      </section>
      <NextPage current="build-validate" />
    </>
  );
}
