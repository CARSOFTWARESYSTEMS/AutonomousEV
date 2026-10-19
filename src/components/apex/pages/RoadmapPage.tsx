import { JsonLd } from "@/lib/structured-data/JsonLd";
import { BUSINESS_MODEL_CANVAS, CAPITAL_INTENSIVE, INVESTOR_QUESTIONS } from "@/data/apex/business";
import { DISPLAY_STATUS_LABEL, EVIDENCE, evidence } from "@/data/apex/evidence";
import { CAPABILITIES, capabilityCoverage } from "@/data/apex/partner-capabilities";
import { ROADMAP, ROADMAP_STATUS_ORDER, roadmapDateLabel } from "@/data/apex/roadmap";
import { apexJsonLd } from "@/data/apex/seo";
import Link from "next/link";
import { apexHref } from "@/data/apex/site";
import { ApexPageView, ViewOnce } from "../ApexPageView";
import { EvidenceBadge } from "../EvidenceBadge";
import { NextPage, PageHero } from "../PageHero";
import { SectionHead } from "../SectionHead";
import { apexTrack } from "../analytics";
import styles from "../apex.module.css";
import sections from "../sections.module.css";
import roadmap from "../roadmap.module.css";

function evidenceLabel(ref: string): string {
  const record = EVIDENCE.find((item) => item.id === ref);
  if (!record) return ref;
  return record.source === "owner-brief" ? record.sourceLabel : `Source: ${record.sourceLabel}`;
}

export function RoadmapPage() {
  const coverage = capabilityCoverage();
  const open = CAPABILITIES.filter((item) => item.status === "PARTNER_REQUIRED");
  const published = EVIDENCE.filter((item) => item.publish && item.engineeringEvidence !== false);
  const counts = (["BUILT", "ACTIVE", "PLANNED", "CONCEPT", "EVIDENCE_REQUIRED"] as const).map((status) => ({
    status,
    count: published.filter((item) => item.display === status).length,
  }));

  return (
    <>
      <JsonLd data={apexJsonLd("roadmap")} />
      <ApexPageView page="roadmap" />
      <PageHero
        eyebrow="Roadmap"
        title="Evidence first. Dates when confirmed."
        lead="Every item carries its status and the evidence it rests on. Built and active items come from APEX's own published information; planned items are APEX's stated future work; concept items are proposed in this collaboration."
      >
        <ul className={styles.chips}>
          {ROADMAP_STATUS_ORDER.map((status) => (
            <li key={status}>
              <EvidenceBadge status={status} />
            </li>
          ))}
        </ul>
      </PageHero>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="roadmap-title" id="roadmap-items">
        <div className={styles.container}>
          <SectionHead eyebrow="Roadmap" id="roadmap-title" title="By status" lead="No date is guessed. When APEX confirms a year or quarter, it appears against the item." small />
          <div className={roadmap.board}>
            {ROADMAP_STATUS_ORDER.map((status) => {
              const items = ROADMAP.filter((item) => item.status === status && item.publicSafe);
              return (
                <div key={status} className={roadmap.column}>
                  <div className={roadmap.columnHead}>
                    <EvidenceBadge status={status} />
                    <span className={styles.mono} style={{ color: "var(--apex-text-3)" }}>
                      {items.length}
                    </span>
                  </div>
                  <ul className={roadmap.items}>
                    {items.map((item) => (
                      <li key={item.id} className={roadmap.item} data-status={item.status}>
                        <span className={roadmap.category}>{item.category}</span>
                        <span className={roadmap.title}>{item.title}</span>
                        <span className={roadmap.meta}>{roadmapDateLabel(item)}</span>
                        <span className={roadmap.meta}>{evidenceLabel(item.evidence)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="investor-title" id="investor-view">
        <ViewOnce event="apex_investor_view" id="investor_view">
          <div className={styles.container}>
            <SectionHead
              eyebrow="Investor view"
              id="investor-title"
              title="Is the execution problem understood?"
              lead="What exists, what is active, what is missing, where partners can contribute, and where capital goes. No proprietary detail."
            />

            <div className={roadmap.investorGrid}>
              <div className={roadmap.panel}>
                <h3 className={styles.h4}>What exists</h3>
                <p className={styles.body}>{evidence("engine-demonstrator-built").approvedWording}</p>
                <EvidenceBadge status="BUILT" label="Physical evidence" />
              </div>
              <div className={roadmap.panel}>
                <h3 className={styles.h4}>What is active</h3>
                <ul className={styles.list}>
                  <li>{evidence("engine-development-platform").approvedWording}</li>
                  <li>{evidence("manufacturing-approach").approvedWording}</li>
                </ul>
              </div>
              <div className={roadmap.panel}>
                <h3 className={styles.h4}>What is missing</h3>
                <p className={styles.body}>
                  {open.length} capabilities have no partner yet, including {open.slice(0, 5).map((item) => item.name).join(", ")}.
                </p>
                <Link href={apexHref("/ecosystem#capabilities")} className={styles.textLink} {...apexTrack("apex_cta_click", { cta: "capability_gaps", placement: "investor_view" })}>
                  See every open capability
                </Link>
              </div>
              <div className={roadmap.panel}>
                <h3 className={styles.h4}>Next evidence milestone</h3>
                <p className={styles.body}>Set by APEX. Not published until APEX confirms it.</p>
                <EvidenceBadge status="EVIDENCE_REQUIRED" label="Owner confirmation required" />
              </div>
            </div>

            <div className={roadmap.split}>
              <div>
                <h3 className={styles.h4} style={{ marginBottom: 14 }}>
                  Partner coverage
                </h3>
                <div className={sections.statsRow} style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                  <div className={sections.stat}>
                    <span className={sections.statValue} style={{ color: "var(--apex-accent)" }}>
                      {coverage.core}
                    </span>
                    <span className={styles.specLabel}>Held by APEX</span>
                  </div>
                  <div className={sections.stat}>
                    <span className={sections.statValue}>{coverage.proposed}</span>
                    <span className={styles.specLabel}>Partner proposed</span>
                  </div>
                  <div className={sections.stat}>
                    <span className={sections.statValue}>{coverage.partnerRequired}</span>
                    <span className={styles.specLabel}>Partner required</span>
                  </div>
                  <div className={sections.stat}>
                    <span className={sections.statValue}>{coverage.supported}</span>
                    <span className={styles.specLabel}>Formally agreed</span>
                  </div>
                </div>
                <div className={roadmap.coverageBar} role="img" aria-label={`${coverage.core} of ${coverage.total} held by APEX, ${coverage.proposed} partner proposed, ${coverage.partnerRequired} open`}>
                  <span style={{ flex: coverage.core, background: "var(--apex-amber)" }} />
                  <span style={{ flex: coverage.proposed, background: "var(--apex-silver)" }} />
                  <span style={{ flex: coverage.partnerRequired }} className={roadmap.hatched} />
                </div>
              </div>
              <div>
                <h3 className={styles.h4} style={{ marginBottom: 14 }}>
                  Evidence maturity
                </h3>
                <ul className={roadmap.maturityList}>
                  {counts.map(({ status, count }) => (
                    <li key={status}>
                      <EvidenceBadge status={status} />
                      <span className={roadmap.maturityBar} aria-hidden="true">
                        <span style={{ width: `${(count / published.length) * 100}%` }} />
                      </span>
                      <span className={styles.mono}>
                        {count}
                        <span className={styles.srOnly}> published records {DISPLAY_STATUS_LABEL[status]}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className={styles.small} style={{ marginTop: 10 }}>
                  Published engineering claims by status, counted from the evidence registry behind this site. &ldquo;Built&rdquo; counts the demonstrator and its published architecture.
                </p>
              </div>
            </div>

            <div className={roadmap.split}>
              <div className={roadmap.panel}>
                <h3 className={styles.h4}>Capital-intensive areas</h3>
                <ul className={styles.chips}>
                  {CAPITAL_INTENSIVE.map((item) => (
                    <li key={item} className={styles.chip}>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className={styles.small}>Where partner access avoids duplicating facilities and equipment.</p>
              </div>
              <div className={roadmap.panel}>
                <h3 className={styles.h4}>Outsource / partner opportunities</h3>
                <p className={styles.small}>Capabilities that do not need to be built inside APEX:</p>
                <ul className={styles.chips}>
                  {open.slice(0, 12).map((item) => (
                    <li key={item.id} className={styles.chip}>
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <h3 className={styles.h4} style={{ margin: "56px 0 6px" }}>
              Questions answered
            </h3>
            <dl className={roadmap.qa}>
              {INVESTOR_QUESTIONS.map((item) => (
                <div key={item.q} className={roadmap.qaItem}>
                  <dt className={roadmap.qaQ}>{item.q}</dt>
                  <dd className={roadmap.qaA}>
                    {item.a}{" "}
                    {item.link && (
                      <Link href={apexHref(item.link.path)} className={styles.textLink} {...apexTrack("apex_cta_click", { cta: item.link.path.replace("/", ""), placement: "investor_questions" })}>
                        {item.link.label}
                      </Link>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </ViewOnce>
      </section>

      <section className={`${styles.section} ${styles.paper}`} aria-labelledby="bmc-title" id="business-model">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Business view"
            id="bmc-title"
            title="Business model canvas"
            lead="A launch-system engineering and validation ecosystem, with APEX as the anchor company and design partner. Shown as a concept."
            small
          />
          <div className={roadmap.bmc}>
            {BUSINESS_MODEL_CANVAS.map((block) => (
              <div key={block.id} className={roadmap.bmcBlock} data-block={block.id}>
                <h3 className={styles.specLabel} style={{ color: "var(--apex-text-2)" }}>
                  {block.title}
                </h3>
                {block.items.length === 1 ? (
                  <p className={styles.body} style={{ color: "var(--apex-text)" }}>
                    {block.items[0]}
                  </p>
                ) : (
                  <ul className={styles.list}>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <NextPage current="roadmap" />
    </>
  );
}
