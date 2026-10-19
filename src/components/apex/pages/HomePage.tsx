import { JsonLd } from "@/lib/structured-data/JsonLd";
import { apexJsonLd } from "@/data/apex/seo";
import { ApexHero } from "../ApexHero";
import { ApexPageView } from "../ApexPageView";
import { BuiltAtApex } from "../BuiltAtApex";
import { EngineToSystem } from "../EngineToSystem";
import { EngineeringPhilosophy } from "../EngineeringPhilosophy";
import { CollaborationCTA, EcosystemSummary, FounderSection, LoopSection, PhysicalDigital, RoadmapSummary } from "../HomeSections";
import { SectionHead } from "../SectionHead";
import { SystemExplorer } from "../SystemExplorer";
import { WhereApexFits } from "../WhereApexFits";
import styles from "../apex.module.css";

/**
 * One continuous executive story, in the order a founder narrates it:
 * who APEX is, what it has built, why an engine is the beginning, the whole
 * system, how it is engineered and proved, the loop, the ecosystem, the
 * roadmap, the founders, and the collaboration.
 */
export function HomePage() {
  return (
    <>
      <JsonLd data={apexJsonLd("home")} />
      <ApexPageView page="home" />
      <ApexHero />
      <BuiltAtApex />
      <EngineToSystem />
      <section className={styles.section} aria-labelledby="system-title" id="system">
        <div className={styles.container}>
          <SectionHead
            index="04"
            eyebrow="Complete rocket system"
            id="system-title"
            title="The rocket as a system of systems"
            lead="Eighteen domains, each with its own purpose, interfaces and evidence. Select any domain to see what it connects to and who can contribute."
          />
          <SystemExplorer />
          <WhereApexFits />
        </div>
      </section>
      <EngineeringPhilosophy />
      <PhysicalDigital />
      <LoopSection />
      <EcosystemSummary />
      <RoadmapSummary />
      <FounderSection />
      <CollaborationCTA />
    </>
  );
}
