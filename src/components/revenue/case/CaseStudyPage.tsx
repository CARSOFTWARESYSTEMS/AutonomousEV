"use client";
// The live FAI case: product, market, problem hypotheses, ICP and buyers,
// evidence, value proposition, alternatives, demo, ROI, objections, pilot and
// product feedback. One idea per section; every claim carries its evidence
// level, and the heavier tools open on request.
import dynamic from "next/dynamic";
import Link from "next/link";
import type { ReactNode } from "react";
import { CASE_STUDY, ROUTES } from "../data/framework";
import { ALTERNATIVES, DONTS, OBJECTIONS } from "../data/library";
import { ANCHORS, BUYER_ROLES, FACTS_CAVEAT, ICP_HYPOTHESIS, ICP_TIERS, MARKET_CATEGORIES, SOURCES, VERIFIED_FACTS } from "../data/market";
import { APPROVED_DEMO, AQIP_CONTEXT, CAPABILITIES, CLAIMS, PILOT_MEASURES, PRODUCT_ROADMAP, PRODUCT_SUMMARY, STANDARD_NOTE, TRUST_CHECKLIST, TRUST_RULE, VALUE_PROPOSITION } from "../data/product";
import { LINK_EVENTS } from "../analytics";
import { CLAIM_LABEL, type ClaimStatus } from "../types";
import AppShell from "../app/AppShell";
import { AnswerBadge, Badge, ClaimBadge, EvidenceBadge, MaturityBadge } from "../ui/badges";
import { List, Notice } from "../ui/controls";
import EvidenceLadder from "../ui/EvidenceLadder";
import css from "../app.module.css";
import ClaimChecker from "./ClaimChecker";
import ProblemHypotheses from "./ProblemHypotheses";
import ProductFeedback from "./ProductFeedback";

const RoiCalculator = dynamic(() => import("./RoiCalculator"), {
  loading: () => (
    <p className={css.loading} role="status">
      Loading the calculator…
    </p>
  ),
});

const SECTIONS = [
  { id: "product", label: "Product" },
  { id: "market", label: "Market" },
  { id: "problems", label: "Problems" },
  { id: "icp", label: "ICP & buyers" },
  { id: "evidence", label: "Evidence" },
  { id: "value", label: "Value" },
  { id: "alternatives", label: "Alternatives" },
  { id: "demo", label: "Demo" },
  { id: "roi", label: "ROI" },
  { id: "objections", label: "Objections" },
  { id: "pilot", label: "Pilot" },
  { id: "feedback", label: "Feedback" },
] as const;

const RELEVANCE_TONE = { Higher: "green", Medium: "cyan", Lower: "neutral" } as const;
const CLAIM_ORDER: readonly ClaimStatus[] = ["verified", "customer", "hypothesis", "restricted"];

function Section({ id, title, lede, children }: { id: string; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className={css.pageSection} aria-labelledby={`rv-${id}-title`}>
      <h2 id={`rv-${id}-title`} className={css.sectionTitle}>
        {title}
      </h2>
      {lede ? <p className={css.pageLede}>{lede}</p> : null}
      {children}
    </section>
  );
}

export default function CaseStudyPage() {
  const source = SOURCES.investKarnataka;
  return (
    <AppShell active="more">
      <div className={css.page}>
        <header className={css.pageHead}>
          <p className={css.eyebrow}>{CASE_STUDY.label}</p>
          <h1 className={css.pageTitle}>{CASE_STUDY.title}</h1>
          <p className={css.pageLede}>{CASE_STUDY.objective}</p>
          <div className={css.buttonRow}>
            <a href={CASE_STUDY.productUrl} target="_blank" rel="noopener noreferrer" className={css.primaryButton} data-track-event={LINK_EVENTS.product} data-track-source="case-study">
              Explore FAI Product<span className={css.srOnly}> (opens in a new tab)</span> ↗
            </a>
            <Link href={CASE_STUDY.contextUrl} className={css.ghostButton} data-track-event={LINK_EVENTS.aqip} data-track-source="case-study">
              AQIP strategy context →
            </Link>
          </div>
        </header>

        <nav aria-label="Case study sections" className={css.anchorNav}>
          {SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className={css.chip}>
              {section.label}
            </a>
          ))}
        </nav>

        <Section id="product" title="Product" lede={`${CASE_STUDY.product}: ${PRODUCT_SUMMARY}`}>
          <ul className={css.cardList}>
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
          <Notice tone="info">{STANDARD_NOTE}</Notice>
          <details className={css.disclosure}>
            <summary>Security questions customers ask</summary>
            <Notice tone="danger">{TRUST_RULE}</Notice>
            <ul className={css.trustList}>
              {TRUST_CHECKLIST.map((topic) => (
                <li key={topic.topic} className={css.trustItem}>
                  <div className={css.miniHead}>
                    <h3 className={css.miniTitle}>{topic.topic}</h3>
                    <AnswerBadge status={topic.status} />
                  </div>
                  <p>{topic.answer}</p>
                  <p className={css.blockNote}>{topic.published ? "Use the product page's published wording only." : "Needs Product / Security Team Confirmation."}</p>
                </li>
              ))}
            </ul>
          </details>
          <details className={css.disclosure}>
            <summary>Roadmap and vision — not for sale today</summary>
            <List items={PRODUCT_ROADMAP} />
            <ul className={css.maturityList}>
              {AQIP_CONTEXT.map((item) => (
                <li key={item.name}>
                  <MaturityBadge maturity={item.maturity} />
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </details>
          <p className={css.sourceLine}>
            Source:{" "}
            <a href={SOURCES.faiProduct.url} target="_blank" rel="noopener noreferrer">
              {SOURCES.faiProduct.label}
              <span className={css.srOnly}> (opens in a new tab)</span>
            </a>
            , accessed {SOURCES.faiProduct.accessed}.
          </p>
        </Section>

        <Section id="market" title="Market: Bengaluru Aerospace & Defence" lede="Public information only. Categories are hypotheses about FAI relevance, not facts.">
          <div className={css.miniHead}>
            <p className={css.label}>What the official source says</p>
            <EvidenceBadge level="research" />
          </div>
          <dl className={css.metricGrid}>
            {VERIFIED_FACTS.map((fact) => (
              <div key={fact.text} className={css.metric}>
                <dt>{fact.text}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <p className={css.sourceLine}>
            Source:{" "}
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.label}
              <span className={css.srOnly}> (opens in a new tab)</span>
            </a>
            , accessed {source.accessed}.
          </p>
          <Notice tone="warn">{FACTS_CAVEAT}</Notice>
          <details className={css.disclosure}>
            <summary>Ecosystem anchors</summary>
            <ul className={css.cardList}>
              {ANCHORS.map((anchor) => (
                <li key={anchor.name} className={css.miniCard}>
                  <h3 className={css.miniTitle}>{anchor.name}</h3>
                  <p>{anchor.text}</p>
                  {anchor.verify ? <p className={css.blockNote}>{anchor.verify}</p> : null}
                </li>
              ))}
            </ul>
          </details>
          <details className={css.disclosure}>
            <summary>Ecosystem categories and likely FAI relevance</summary>
            <ul className={css.cardList}>
              {MARKET_CATEGORIES.map((category) => (
                <li key={category.id} className={css.miniCard}>
                  <div className={css.miniHead}>
                    <h3 className={css.miniTitle}>{category.name}</h3>
                    <Badge tone={RELEVANCE_TONE[category.relevance]}>{category.relevance} (hypothesis)</Badge>
                  </div>
                  <p>{category.hypothesis}</p>
                  <p className={css.blockNote}>
                    <strong>Verify:</strong> {category.verify}
                  </p>
                </li>
              ))}
            </ul>
          </details>
        </Section>

        <Section id="problems" title="Problem hypotheses" lede="What we believe may be painful. Every one is a hypothesis until customers validate it — move it with your own evidence, or invalidate it.">
          <ProblemHypotheses />
        </Section>

        <Section id="icp" title="ICP & buyer map" lede="Who may buy, and every role that can say yes or no.">
          <div className={css.miniHead}>
            <p className={css.quote}>{ICP_HYPOTHESIS}</p>
            <EvidenceBadge level="assumption" />
          </div>
          <ul className={css.tierRow}>
            {ICP_TIERS.map((tier) => (
              <li key={tier.tier} className={css.miniCard}>
                <h3 className={css.miniTitle}>
                  Tier {tier.tier} — {tier.name}
                </h3>
                <p className={css.blockNote}>{tier.effort}</p>
                <List items={tier.signals} />
              </li>
            ))}
          </ul>
          <ol className={css.buyerChain} aria-label="User to procurement">
            {BUYER_ROLES.map((role) => (
              <li key={role.id}>{role.role}</li>
            ))}
          </ol>
          <details className={css.disclosure}>
            <summary>What each buyer cares about and fears</summary>
            <ul className={css.cardList}>
              {BUYER_ROLES.map((role) => (
                <li key={role.id} className={css.miniCard}>
                  <h3 className={css.miniTitle}>{role.role}</h3>
                  <p className={css.blockNote}>Often: {role.likely}</p>
                  <p>
                    <strong>Cares about:</strong> {role.cares}
                  </p>
                  <p>
                    <strong>Fears:</strong> {role.fears}
                  </p>
                </li>
              ))}
            </ul>
          </details>
        </Section>

        <Section id="evidence" title="Evidence" lede="Research is not customer validation, and customer validation is not commercial proof. Never let an unsupported claim look validated.">
          <EvidenceLadder />
          <h3 className={css.subTitle}>Approved claims registry</h3>
          {CLAIM_ORDER.map((status) => {
            const claims = CLAIMS.filter((claim) => claim.status === status);
            if (!claims.length) return null;
            return (
              <ul key={status} className={css.claimList} aria-label={CLAIM_LABEL[status]}>
                {claims.map((claim) => (
                  <li key={claim.id} className={css.claimItem} data-status={claim.status}>
                    <div className={css.miniHead}>
                      <p className={css.claimText}>{claim.text}</p>
                      <ClaimBadge status={claim.status} />
                    </div>
                    <p className={css.blockNote}>{claim.basis}</p>
                    {claim.instead ? <p className={css.instead}>Say instead: {claim.instead}</p> : null}
                  </li>
                ))}
              </ul>
            );
          })}
          <details className={css.disclosure}>
            <summary>Check a message for restricted claims</summary>
            <ClaimChecker />
          </details>
          <details className={css.disclosure}>
            <summary>What not to do</summary>
            <List items={DONTS} />
          </details>
        </Section>

        <Section id="value" title={`Value proposition ${VALUE_PROPOSITION.version}`} lede="Problem → solution → outcome → business value. Each part carries its evidence.">
          <dl className={css.valueProp}>
            {VALUE_PROPOSITION.parts.map((part) => (
              <div key={part.label}>
                <dt>{part.label}</dt>
                <dd>
                  {part.text} <EvidenceBadge level={part.level} />
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="alternatives" title="Alternatives" lede="The biggest competitor is usually the status quo. Describe each so a happy user of it would agree.">
          <ul className={css.cardList}>
            {ALTERNATIVES.map((alternative) => (
              <li key={alternative.name} className={css.miniCard}>
                <h3 className={css.miniTitle}>{alternative.name}</h3>
                <p>
                  <strong>Strength:</strong> {alternative.strength}
                </p>
                <p>
                  <strong>Limit:</strong> {alternative.limit}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="demo" title="Approved demo — 15 minutes" lede="Current product only, on a fictitious drawing. Diagnose before demonstrating.">
          <List items={APPROVED_DEMO} ordered />
        </Section>

        <Section id="roi" title="ROI" lede="Value from the customer's own numbers, as a range, measured later in a pilot.">
          <details className={css.disclosure}>
            <summary>Open the ROI calculator</summary>
            <RoiCalculator />
          </details>
        </Section>

        <Section id="objections" title="Objections" lede="Objections are information. Some are right — agree and record them.">
          <ul className={css.cardList}>
            {OBJECTIONS.map((objection) => (
              <li key={objection.id} className={css.miniCard}>
                <div className={css.miniHead}>
                  <h3 className={css.miniTitle}>{objection.name}</h3>
                  {objection.review ? <Badge tone="amber">{objection.review}</Badge> : null}
                </div>
                <p className={css.blockNote}>{objection.meaning}</p>
                <p>{objection.response}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="pilot" title="Pilot" lede="A pilot that cannot fail cannot prove anything. Agree success criteria and a baseline first.">
          <p className={css.label}>What a pilot could measure</p>
          <div className={css.chipRow}>
            {PILOT_MEASURES.map((measure) => (
              <Badge key={measure}>{measure}</Badge>
            ))}
          </div>
          <Link href={`${ROUTES.pipeline}#pilot`} className={css.inlineLink}>
            Open the pilot charter →
          </Link>
        </Section>

        <Section id="feedback" title="Product feedback" lede="One mention: record. A pattern: investigate. An evidence-backed pattern: product review. Never promise features.">
          <ProductFeedback />
        </Section>
      </div>
    </AppShell>
  );
}
