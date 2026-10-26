"use client";
// The live case study's product: what exists today, the approved demo, the
// security and trust checklist, and the roadmap kept apart from the product.
import { LINK_EVENTS, trackRevenue } from "../analytics";
import { CASE_STUDY } from "../data/framework";
import { SOURCES } from "../data/market";
import { AQIP_CONTEXT, APPROVED_DEMO, CAPABILITIES, PRODUCT_ROADMAP, PRODUCT_SUMMARY, STANDARD_NOTE, TRUST_CHECKLIST, TRUST_RULE } from "../data/product";
import { AnswerBadge, Badge, MaturityBadge } from "../ui/badges";
import { List, Notice, Panel, Tabs, ViewHeader } from "../ui/controls";
import css from "../workspace.module.css";

export default function ProductView() {
  return (
    <div>
      <ViewHeader eyebrow="Case Study" title={CASE_STUDY.title} lede={`${CASE_STUDY.product}: ${PRODUCT_SUMMARY}`}>
        <div className={css.buttonRow}>
          <a href={CASE_STUDY.productUrl} target="_blank" rel="noopener noreferrer" className={css.primaryButton} data-track-event={LINK_EVENTS.product} data-track-source="workspace">
            Explore the product<span className={css.srOnly}> (opens in a new tab)</span> ↗
          </a>
          <a href={CASE_STUDY.contextUrl} className={css.ghostButton} data-track-event={LINK_EVENTS.aqip} data-track-source="workspace">
            AQIP context →
          </a>
        </div>
      </ViewHeader>

      <Notice tone="info">{STANDARD_NOTE}</Notice>

      <Tabs
        label="FAI product"
        onSelect={(id) => (id === "demo" ? trackRevenue("demo_plan_view") : undefined)}
        tabs={[
          {
            id: "today",
            label: "What exists today",
            content: (
              <>
                <ul className={css.capabilityList}>
                  {CAPABILITIES.map((capability) => (
                    <li key={capability.name} className={css.miniCard}>
                      <div className={css.miniHead}>
                        <h3 className={css.miniTitle}>{capability.name}</h3>
                        <MaturityBadge maturity={capability.maturity} />
                      </div>
                      <p>{capability.text}</p>
                    </li>
                  ))}
                </ul>
                <p className={css.sourceLine}>
                  Source:{" "}
                  <a href={SOURCES.faiProduct.url} target="_blank" rel="noopener noreferrer">
                    {SOURCES.faiProduct.label}
                    <span className={css.srOnly}> (opens in a new tab)</span>
                  </a>
                  , accessed {SOURCES.faiProduct.accessed}. Restrict every current-product demo to this list.
                </p>
              </>
            ),
          },
          {
            id: "demo",
            label: "Approved demo",
            content: (
              <Panel title="Approved demo flow — 15 minutes" kicker="Current product only" tone="accent">
                <List items={APPROVED_DEMO} ordered />
                <p className={css.blockNote}>Diagnose before demonstrating. Use a fictitious drawing unless the customer has explicitly authorised a sample of their choosing.</p>
              </Panel>
            ),
          },
          {
            id: "trust",
            label: "Security & trust",
            content: (
              <Panel title="Trust checklist" kicker="Security / confidentiality discovery">
                <Notice tone="danger">{TRUST_RULE}</Notice>
                <ul className={css.trustList}>
                  {TRUST_CHECKLIST.map((topic) => (
                    <li key={topic.topic} className={css.trustItem}>
                      <div className={css.miniHead}>
                        <h3 className={css.miniTitle}>{topic.topic}</h3>
                        <AnswerBadge status={topic.status} />
                      </div>
                      <p>{topic.answer}</p>
                      {topic.published ? <p className={css.blockNote}>Use the product page&apos;s published wording only.</p> : <p className={css.blockNote}>Needs Product / Security Team Confirmation.</p>}
                    </li>
                  ))}
                </ul>
              </Panel>
            ),
          },
          {
            id: "roadmap",
            label: "Roadmap & vision",
            content: (
              <>
                <Panel title="FAI Engineer roadmap" kicker="Not available today">
                  <List items={PRODUCT_ROADMAP} />
                  <p className={css.blockNote}>The product page labels these as future roadmap items with timelines subject to change. Never sell them as existing.</p>
                </Panel>
                <Panel title="AQIP — the broader initiative" kicker="Roadmap / Vision">
                  <ul className={css.maturityList}>
                    {AQIP_CONTEXT.map((item) => (
                      <li key={item.name}>
                        <MaturityBadge maturity={item.maturity} />
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                  <p className={css.blockNote}>
                    Planned AQIP capabilities are not current FAI product features. <Badge>Roadmap / Vision</Badge>
                  </p>
                </Panel>
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
