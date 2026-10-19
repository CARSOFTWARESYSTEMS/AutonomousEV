import { JsonLd } from "@/lib/structured-data/JsonLd";
import { CTO_QUESTIONS } from "@/data/apex/business";
import { apexImage } from "@/data/apex/images";
import { apexJsonLd } from "@/data/apex/seo";
import { SYSTEM_DOMAINS } from "@/data/apex/system";
import { ApexPageView } from "../ApexPageView";
import { EvidenceFigure } from "../EvidenceFigure";
import { NextPage, PageHero } from "../PageHero";
import { SectionHead } from "../SectionHead";
import { SystemExplorer } from "../SystemExplorer";
import { QuestionList, ReviewGates } from "../SystemSections";
import { WhereApexFits } from "../WhereApexFits";
import styles from "../apex.module.css";

export function SystemPage() {
  return (
    <>
      <JsonLd data={apexJsonLd("system")} />
      <ApexPageView page="system" />
      <PageHero
        eyebrow="System"
        title="Rocket as a system of systems"
        lead={`An integrated launch vehicle is ${SYSTEM_DOMAINS.length} interdependent domains. Propulsion is where APEX started; every other domain has its own purpose, interfaces, evidence and partner capabilities.`}
        aside={<EvidenceFigure image={apexImage("04")} sizes="(min-width: 1024px) 34vw, 100vw" aspect="4 / 5" priority />}
      />

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="explorer-title" id="explorer">
        <div className={styles.container}>
          <SectionHead
            eyebrow="System explorer"
            id="explorer-title"
            title="Select a domain"
            lead="Purpose, interfaces, development evidence, partner capabilities, status and dependencies for each. The technical view adds the interface matrix."
            small
          />
          <SystemExplorer allowTechnical />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="fit-title" id="where-apex-fits-section">
        <div className={styles.container}>
          <SectionHead eyebrow="Authority" id="fit-title" title="Where APEX fits" lead="Partners contribute capability. Intent, architecture, configuration and acceptance stay with APEX." small />
          <WhereApexFits />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="gates-title" id="review-gates">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Engineering governance"
            id="gates-title"
            title="Review gates"
            lead="Each gate asks one question and needs evidence to pass. They give investors, partners and authorities a shared view of maturity."
            small
          />
          <ReviewGates />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="cto-title" id="technical-questions">
        <div className={styles.container}>
          <SectionHead eyebrow="Technical view" id="cto-title" title="Questions a CTO will ask" small />
          <QuestionList items={CTO_QUESTIONS} />
        </div>
      </section>
      <NextPage current="system" />
    </>
  );
}
