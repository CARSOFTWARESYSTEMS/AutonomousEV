"use client";
// The live case, beginner first: the product, the customer, the problem
// (still to be validated) and the hypotheses to test. What later steps need
// — market, buyers, claims, value, demo, ROI, objections, pilot, feedback —
// waits below, closed, each labelled with the step that uses it. An address
// such as #roi opens that reference.
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { CASE_STUDY, ROUTES } from "../data/framework";
import { ALTERNATIVES, DONTS, OBJECTIONS } from "../data/library";
import { ANCHORS, BUYER_ROLES, FACTS_CAVEAT, ICP_HYPOTHESIS, ICP_TIERS, MARKET_CATEGORIES, SOURCES, VERIFIED_FACTS } from "../data/market";
import { APPROVED_DEMO, CAPABILITIES, CLAIMS, PILOT_MEASURES, PRODUCT_ROADMAP, PRODUCT_SUMMARY, STANDARD_NOTE, TRUST_CHECKLIST, TRUST_RULE, VALUE_PROPOSITION } from "../data/product";
import { stepNo } from "../data/steps";
import { LINK_EVENTS } from "../analytics";
import { CLAIM_LABEL, type ClaimStatus } from "../types";
import AppShell from "../app/AppShell";
import { AnswerBadge, Badge, ClaimBadge, EvidenceBadge, MaturityBadge } from "../ui/badges";
import { List, Notice } from "../ui/controls";
import EvidenceLadder from "../ui/EvidenceLadder";
import css from "../app.module.css";
import site from "../site.module.css";
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

/** What the case study suspects. Not one of these is a known customer problem. */
const HYPOTHESES = ["Manual ballooning effort", "Characteristic reconciliation", "Report preparation effort", "Revision rework", "Review burden"] as const;

const RELEVANCE_TONE = { Higher: "green", Medium: "cyan", Lower: "neutral" } as const;
const CLAIM_ORDER: readonly ClaimStatus[] = ["verified", "customer", "hypothesis", "restricted"];

/** A closed reference, named with the step that needs it. */
function Reference({ id, title, step, children }: { id: string; title: string; step: number; children: ReactNode }) {
  return (
    <details id={id} className={site.reference}>
      <summary>
        <span className={site.referenceName}>{title}</span>
        <span className={site.referenceStep}>Step {stepNo(step)}</span>
      </summary>
      <div className={site.referenceBody}>{children}</div>
    </details>
  );
}

/** Opens the reference the address points to, on arrival and when the address changes. */
function useOpenFromHash() {
  useEffect(() => {
    const open = () => {
      const id = window.location.hash.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (target instanceof HTMLDetailsElement) {
        target.open = true;
        target.scrollIntoView({ block: "start" });
      }
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
}

export default function CaseStudyPage() {
  useOpenFromHash();
  const source = SOURCES.investKarnataka;
  const facts = [
    { label: "Product", value: CASE_STUDY.product },
    { label: "Customer", value: CASE_STUDY.market },
    { label: "Customer problem", value: CASE_STUDY.problem },
  ];
  return (
    <AppShell page="caseStudy">
      <section className={site.pageHero} aria-labelledby="rv-case-title">
        <div className={site.container}>
          <p className={site.eyebrow}>{CASE_STUDY.label}</p>
          <h1 id="rv-case-title" className={site.pageTitle}>
            {CASE_STUDY.title}
          </h1>
          <dl className={site.factRow}>
            {facts.map((fact) => (
              <div key={fact.label} className={site.fact}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className={site.linkRow}>
            <a href={CASE_STUDY.productUrl} target="_blank" rel="noopener noreferrer" className={site.primaryCta} data-track-event={LINK_EVENTS.product} data-track-source="case-study">
              <span>Explore FAI Product</span>
              <span aria-hidden="true">↗</span>
              <span className={site.srOnly}>(opens in a new tab)</span>
            </a>
            <Link href={CASE_STUDY.contextUrl} className={site.textLink} data-track-event={LINK_EVENTS.aqip} data-track-source="case-study">
              AQIP Context →
            </Link>
          </div>
        </div>
      </section>

      <section className={site.section} data-tone="alt" aria-labelledby="rv-hypotheses-title">
        <div className={site.container}>
          <p className={site.eyebrow}>Customer problem: to be validated</p>
          <h2 id="rv-hypotheses-title" className={site.sectionTitle}>
            Current Hypotheses
          </h2>
          <p className={site.sectionLede}>What we suspect may be hard for the customer. None of these is known until customers confirm it.</p>
          <ul className={site.hypotheses}>
            {HYPOTHESES.map((hypothesis) => (
              <li key={hypothesis}>
                <span className={site.hypothesisName}>{hypothesis}</span>
                <span className={site.hypothesisTag}>Hypothesis — Customer Validation Required</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="product" className={site.section} data-rule="" aria-labelledby="rv-product-title">
        <div className={site.container}>
          <p className={site.eyebrow}>The product</p>
          <h2 id="rv-product-title" className={site.sectionTitle}>
            What FAI Engineer Does Today
          </h2>
          <p className={site.sectionLede}>{PRODUCT_SUMMARY}</p>
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
          <details className={css.disclosure}>
            <summary>About AS9102 and compliance</summary>
            <p>{STANDARD_NOTE}</p>
          </details>
          <p className={css.sourceLine}>
            Source:{" "}
            <a href={SOURCES.faiProduct.url} target="_blank" rel="noopener noreferrer">
              {SOURCES.faiProduct.label}
              <span className={css.srOnly}> (opens in a new tab)</span>
            </a>
            , accessed {SOURCES.faiProduct.accessed}.
          </p>
        </div>
      </section>

      <section className={site.section} data-tone="alt" aria-labelledby="rv-reference-title">
        <div className={site.container}>
          <p className={site.eyebrow}>For later steps</p>
          <h2 id="rv-reference-title" className={site.sectionTitle}>
            Reference
          </h2>
          <p className={site.sectionLede}>Open each one when your step reaches it.</p>
          <div className={site.references}>
        <Reference id="market" title="Bengaluru Aerospace & Defence market" step={1}>
          <p className={css.pageLede}>Public information only. Categories are hypotheses about FAI relevance, not facts.</p>
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
        </Reference>

        <Reference id="problems" title="Pain hypotheses: track your evidence" step={2}>
          <p className={css.pageLede}>Every one is a hypothesis until customers validate it — move it with your own evidence, or invalidate it.</p>
          <ProblemHypotheses />
        </Reference>

        <Reference id="icp" title="Ideal Customer Profile (ICP) & buyers" step={1}>
          <p className={css.pageLede}>Who may buy, and every role that can say yes or no.</p>
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
        </Reference>

        <Reference id="evidence" title="Evidence & approved claims" step={4}>
          <p className={css.pageLede}>Research is not customer validation, and customer validation is not commercial proof. Never let an unsupported claim look validated.</p>
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
        </Reference>

        <Reference id="value" title={`Value proposition ${VALUE_PROPOSITION.version}`} step={3}>
          <p className={css.pageLede}>Problem → solution → outcome → business value. Each part carries its evidence.</p>
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
        </Reference>

        <Reference id="alternatives" title="Alternatives" step={3}>
          <p className={css.pageLede}>The biggest competitor is usually the status quo. Describe each so a happy user of it would agree.</p>
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
        </Reference>

        <Reference id="demo" title="Approved demo — 15 minutes" step={7}>
          <p className={css.pageLede}>Current product only, on a fictitious drawing. Diagnose before demonstrating.</p>
          <List items={APPROVED_DEMO} ordered />
        </Reference>

        <Reference id="roi" title="ROI calculator" step={7}>
          <p className={css.pageLede}>Value from the customer&apos;s own numbers, as a range, measured later in a pilot.</p>
          <RoiCalculator />
        </Reference>

        <Reference id="objections" title="Objections" step={9}>
          <p className={css.pageLede}>Objections are information. Some are right — agree and record them.</p>
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
        </Reference>

        <Reference id="pilot" title="Pilot measures" step={8}>
          <p className={css.pageLede}>A pilot that cannot fail cannot prove anything. Agree success criteria and a baseline first.</p>
          <p className={css.label}>What a pilot could measure</p>
          <div className={css.chipRow}>
            {PILOT_MEASURES.map((measure) => (
              <Badge key={measure}>{measure}</Badge>
            ))}
          </div>
          <Link href={`${ROUTES.pipeline}#pilot`} className={css.inlineLink}>
            Open the pilot charter →
          </Link>
        </Reference>

        <Reference id="feedback" title="Product feedback" step={6}>
          <p className={css.pageLede}>One mention: record. A pattern: investigate. An evidence-backed pattern: product review. Never promise features.</p>
          <ProductFeedback />
        </Reference>
        <Reference id="security" title="Security questions customers ask" step={9}>
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
        </Reference>

        <Reference id="roadmap" title="The product's roadmap — not for sale today" step={7}>
          <List items={PRODUCT_ROADMAP} />
          <p className={css.blockNote}>
            The wider platform is described on <Link href={CASE_STUDY.contextUrl}>AQIP</Link>. Never demonstrate or sell what is not available today.
          </p>
        </Reference>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
