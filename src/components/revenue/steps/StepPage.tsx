// A step page: a short hero with the page's process as an animated flow,
// then each of its steps, then the way to the previous and next page.
// Customer holds Steps 1–2, Marketing 3–4, Sales 5–7, Pilot 8, Close 9 and
// Revenue 10. Each step's visual is chosen here; its words are in data/steps.
import Link from "next/link";
import type { ReactNode } from "react";
import AppShell from "../app/AppShell";
import { ROUTES } from "../data/framework";
import { BEFORE_PURCHASE, PROPOSAL_PARTS, REVENUE_METRICS, STEP_PAGES, STEP_PAGE_ORDER, stepRange, stepsOnPage, type StepPageId } from "../data/steps";
import CustomerMap from "../public/CustomerMap";
import WorkflowExplorer from "../public/WorkflowExplorer";
import SignalFlow from "../ui/SignalFlow";
import css from "../site.module.css";
import Chain from "./Chain";
import MeetingGuide from "./MeetingGuide";
import PilotCompare from "./PilotCompare";
import StepSection from "./StepSection";

/** What each step shows between its sentence and its Do / Ask / Avoid. */
const VISUALS: Partial<Record<number, ReactNode>> = {
  1: <CustomerMap />,
  2: <WorkflowExplorer />,
  4: <Chain label="Generating leads" items={["Find", "Research", "Prioritise", "Contact"]} />,
  5: <Chain label="The sales path" items={["Contact", "Discovery", "Validate Pain", "Demo", "Show Value", "Pilot", "Proposal", "Purchase"]} />,
  7: <Chain label="Demonstrating value" items={["Customer Problem", "Relevant Product Workflow", "Business Benefit", "Evidence"]} />,
  9: (
    <div className={css.closeGrid}>
      <div>
        <p className={css.stepLabel}>A proposal covers</p>
        <ol className={css.numberedList}>
          {PROPOSAL_PARTS.map((part) => (
            <li key={part}>{part}</li>
          ))}
        </ol>
      </div>
      <div className={css.interest}>
        <p className={css.interestTitle}>Customer interest is not a purchase.</p>
        <p className={css.interestText}>Even a customer who wants to buy may still need:</p>
        <Chain label="Before a purchase order" items={BEFORE_PURCHASE} />
      </div>
    </div>
  ),
  10: (
    <dl className={css.metrics}>
      {REVENUE_METRICS.map((metric) => (
        <div key={metric.name}>
          <dt>{metric.name}</dt>
          <dd>{metric.text}</dd>
        </div>
      ))}
    </dl>
  ),
};

export default function StepPage({ page }: { page: StepPageId }) {
  const content = STEP_PAGES[page];
  const steps = stepsOnPage(page);
  const at = STEP_PAGE_ORDER.indexOf(page);
  const previous = STEP_PAGE_ORDER[at - 1];
  const next = STEP_PAGE_ORDER[at + 1];

  return (
    <AppShell page={page}>
      <section className={css.pageHero} aria-labelledby="rv-page-title">
        <div className={css.container}>
          <p className={css.eyebrow}>
            {stepRange(page)} · {content.label}
          </p>
          <h1 id="rv-page-title" className={css.pageTitle}>
            {content.title}
          </h1>
          <p className={css.lede}>{content.lede}</p>
          {page === "sales" ? (
            <div className={css.actions}>
              <a href="#meeting-guide" className={css.secondaryCta}>
                Customer Meeting Guide ↓
              </a>
            </div>
          ) : null}
          {content.flow ? (
            <div className={css.pageFlow}>
              <SignalFlow id={`${page}-flow`} label={content.flow.label} stages={content.flow.stages} />
            </div>
          ) : null}
          {page === "pilot" ? <PilotCompare /> : null}
        </div>
      </section>

      {page === "sales" ? <MeetingGuide /> : null}

      {steps.map((step, i) => (
        <StepSection key={step.n} step={step} tone={i % 2 === 1 ? "alt" : undefined}>
          {VISUALS[step.n]}
        </StepSection>
      ))}

      <nav className={css.pageNav} aria-label="Previous and next steps">
        <div className={css.container}>
          <div className={css.pageNavInner}>
            {previous ? (
              <Link href={ROUTES[previous]} className={css.pageNavLink} data-dir="previous">
                <span className={css.pageNavKicker}>← {stepRange(previous)}</span>
                <span className={css.pageNavName}>{STEP_PAGES[previous].label}</span>
              </Link>
            ) : (
              <Link href={ROUTES.overview} className={css.pageNavLink} data-dir="previous">
                <span className={css.pageNavKicker}>← All 10 steps</span>
                <span className={css.pageNavName}>Overview</span>
              </Link>
            )}
            {next ? (
              <Link href={ROUTES[next]} className={css.pageNavLink} data-dir="next">
                <span className={css.pageNavKicker}>{stepRange(next)} →</span>
                <span className={css.pageNavName}>{STEP_PAGES[next].label}</span>
              </Link>
            ) : (
              <Link href={ROUTES.caseStudy} className={css.pageNavLink} data-dir="next">
                <span className={css.pageNavKicker}>Live case study →</span>
                <span className={css.pageNavName}>Case Study</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </AppShell>
  );
}
