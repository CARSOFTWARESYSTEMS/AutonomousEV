import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { ENGINE_PUBLISHED_SPEC, evidence } from "@/data/apex/evidence";
import { apexImage } from "@/data/apex/images";
import { ENGINE_FLOW, PHASE_LABEL } from "@/data/apex/lifecycle";
import { apexJsonLd } from "@/data/apex/seo";
import { APEX_OFFICIAL_PAGES } from "@/data/apex/site";
import { MEASUREMENT_CLASSES } from "@/data/apex/validation";
import { ApexPageView } from "../ApexPageView";
import { EngineSystemView } from "../EngineSystemView";
import { EvidenceBadge } from "../EvidenceBadge";
import { EvidenceFigure } from "../EvidenceFigure";
import { HardwareGallery } from "../HardwareGallery";
import { NextPage, PageHero } from "../PageHero";
import { SectionHead } from "../SectionHead";
import { UnitText } from "../UnitText";
import { apexTrack } from "../analytics";
import styles from "../apex.module.css";
import validation from "../validation.module.css";

const APPROACH = [
  { id: "rapid", title: "Rapid development", lead: "Design to hardware, quickly enough to learn from it.", evidenceIds: ["rapid-development"] },
  { id: "independence", title: "Manufacturing independence", lead: "Conventional, accessible processes.", evidenceIds: ["manufacturing-approach", "no-metal-am-dependence"] },
  { id: "iteration", title: "Built for iteration", lead: "Speed, iteration and control.", evidenceIds: ["built-for-iteration"] },
];

export function EnginePage() {
  return (
    <>
      <JsonLd data={apexJsonLd("engine")} />
      <ApexPageView page="engine" />
      <PageHero
        eyebrow="Engine"
        title={
          <>
            <UnitText>5 kN-class</UnitText> liquid engine demonstrator
          </>
        }
        lead={evidence("engine-demonstrator-built").approvedWording}
        aside={<EvidenceFigure image={apexImage("07")} sizes="(min-width: 1024px) 34vw, 100vw" aspect="4 / 5" priority />}
      >
        <div className={styles.chips} style={{ alignItems: "center" }}>
          <EvidenceBadge status="BUILT" label="Hardware built" />
          <EvidenceBadge status="EVIDENCE_REQUIRED" label="Test evidence: owner confirmation required" />
        </div>
      </PageHero>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="spec-title">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Published by APEX"
            id="spec-title"
            title="Demonstrator architecture"
            lead="These entries are taken from APEX's own Hardware page, with their status. They describe the architecture of the demonstrator, not tested performance."
            small
          />
          <ul className={styles.ruleGrid} style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
            {ENGINE_PUBLISHED_SPEC.map(({ label, evidenceId }) => {
              const record = evidence(evidenceId);
              return (
                <li key={evidenceId} className={styles.cell} style={{ gridTemplateColumns: "minmax(0, 1fr)", gap: 8 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "8px 24px" }}>
                    <span className={styles.specLabel}>{label}</span>
                    <EvidenceBadge status={record.display} />
                  </div>
                  <p className={styles.h3}>
                    <UnitText>{record.approvedWording}</UnitText>
                  </p>
                </li>
              );
            })}
          </ul>
          <div className={styles.note} style={{ marginTop: 24 }}>
            <span>
              Performance figures are not repeated here until APEX confirms whether each is a measured value or a design target. APEX&rsquo;s own Hardware page lists
              further specifications.{" "}
              <a
                href={APEX_OFFICIAL_PAGES.hardware}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.textLink}
                {...apexTrack("apex_official_site_click", { placement: "engine_spec" })}
              >
                APEX Hardware page <ArrowUpRight size={13} aria-hidden="true" style={{ verticalAlign: "-1px" }} />
                <span className={styles.srOnly}> (opens in a new tab)</span>
              </a>
            </span>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="approach-title">
        <div className={styles.container}>
          <SectionHead
            eyebrow="How APEX builds"
            id="approach-title"
            title="Manufacturing-led development"
            lead="In APEX's own words, from its Development & Testing page."
            small
            aside={<EvidenceFigure image={apexImage("09")} sizes="(min-width: 960px) 40vw, 100vw" aspect="16 / 10" />}
          />
          <div className={`${styles.ruleGrid} ${styles.cols3}`}>
            {APPROACH.map((item) => (
              <div key={item.id} className={styles.cell}>
                <h3 className={styles.h3}>{item.title}</h3>
                <p className={styles.small}>{item.lead}</p>
                {item.evidenceIds.map((id) => (
                  <p key={id} className={styles.body}>
                    {evidence(id).approvedWording}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <p className={styles.source} style={{ marginTop: 16 }}>
            Source:{" "}
            <a href={APEX_OFFICIAL_PAGES.developmentTesting} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_official_site_click", { placement: "engine_approach" })}>
              apexrocketsystems.com — Development & Testing
            </a>
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="flow-title">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Engine development story"
            id="flow-title"
            title="From requirement to verified engine"
            lead="The engineering lifecycle an engine passes through. It describes what happens and what evidence it leaves — not how to build propulsion hardware."
          />
          <ol className={validation.flow}>
            {ENGINE_FLOW.map((step) => (
              <li key={step.id} className={validation.flowStep} data-phase={step.phase}>
                <span className={validation.flowLabel}>{step.label}</span>
                <span className={styles.small}>
                  {PHASE_LABEL[step.phase]} · {step.detail}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="engine-view-title" id="engine-system">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Engine system view"
            id="engine-view-title"
            title="The engine as functional blocks"
            lead="What each block does, what it interfaces with, the capability it needs, how it is verified and who may contribute."
          />
          <EngineSystemView />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="measure-title">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Instrumentation"
            id="measure-title"
            title="If you cannot measure it, you cannot correlate it."
            lead="The classes of measurement an engine test program needs. Ranges, channel counts and locations are APEX's to define."
            small
          />
          <ul className={validation.measures}>
            {MEASUREMENT_CLASSES.map((name, i) => (
              <li key={name} className={validation.measure}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="record-title">
        <div className={styles.container}>
          <SectionHead eyebrow="Hardware record" id="record-title" title="APEX photographs" small />
          <HardwareGallery title="All supplied photographs" />
        </div>
      </section>
      <NextPage current="engine" />
    </>
  );
}
