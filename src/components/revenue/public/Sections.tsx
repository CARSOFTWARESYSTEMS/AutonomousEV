// The overview's other sections, one idea each: the central question, the
// customer, their work, the live case study, the internship and who
// designed it. The four wins animate, so they are a component of their own.
import Link from "next/link";
import ResearcherCard from "@/components/ResearcherCard";
import { LINK_EVENTS } from "../analytics";
import { CASE_STUDY, DESIGNED_BY, FRAMEWORK, INTERNSHIP, ROUTES } from "../data/framework";
import { CUSTOMER_TO_REVENUE } from "../data/steps";
import SignalFlow from "../ui/SignalFlow";
import css from "../site.module.css";
import CustomerMap from "./CustomerMap";
import WorkflowExplorer from "./WorkflowExplorer";

export function CentralQuestion() {
  return (
    <section className={css.section} data-tone="alt" aria-labelledby="rv-question-title">
      <div className={css.container}>
        <div className={css.sectionHeadCenter}>
          <p className={css.eyebrow}>One question</p>
          <h2 id="rv-question-title" className={css.questionTitle}>
            {FRAMEWORK.question}
          </h2>
          <p className={css.sectionLede}>Every stage answers one part of it. Choose a stage.</p>
        </div>
        <SignalFlow id="customer-to-revenue" label="From customer to revenue" stages={CUSTOMER_TO_REVENUE} />
      </div>
    </section>
  );
}

export function CustomerSection() {
  return (
    <section id="customer" className={css.section} data-rule="" aria-labelledby="rv-customer-title">
      <div className={css.container}>
        <div className={css.split}>
          <div>
            <p className={css.eyebrow}>Our customer</p>
            <h2 id="rv-customer-title" className={css.sectionTitle}>
              Who Are We Trying to Help?
            </h2>
            <p className={css.sectionLede}>A Bengaluru aerospace or defence manufacturer that makes parts to drawings — and four people inside it. Choose one.</p>
            <Link href={`${ROUTES.customer}#step-1`} className={css.textLink}>
              Step 01: Understand the Customer →
            </Link>
          </div>
          <CustomerMap />
        </div>
      </div>
    </section>
  );
}

export function ProblemSection() {
  return (
    <section className={css.section} data-tone="alt" aria-labelledby="rv-problem-title">
      <div className={css.container}>
        <div className={css.sectionHeadCenter}>
          <p className={css.eyebrow}>The problem</p>
          <h2 id="rv-problem-title" className={css.sectionTitle}>
            Understand the Work Before Selling the Software
          </h2>
          <p className={css.sectionLede}>From drawing to approval. Choose a stage to see what happens, what to ask and where pain might be.</p>
        </div>
        <WorkflowExplorer />
        <p className={css.centerLink}>
          <Link href={`${ROUTES.customer}#step-2`} className={css.textLink}>
            Step 02: Find the Pain →
          </Link>
        </p>
      </div>
    </section>
  );
}

export function CaseStudyTeaser() {
  const facts = [
    { label: "Product", value: CASE_STUDY.product },
    { label: "Customer", value: CASE_STUDY.market },
    { label: "Customer problem", value: CASE_STUDY.problem },
  ];
  return (
    <section className={css.section} data-rule="" aria-labelledby="rv-case-title">
      <div className={css.container}>
        <p className={css.eyebrow}>{CASE_STUDY.label}</p>
        <h2 id="rv-case-title" className={css.sectionTitle}>
          {CASE_STUDY.title}
        </h2>
        <dl className={css.factRow}>
          {facts.map((fact) => (
            <div key={fact.label} className={css.fact}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        <div className={css.linkRow}>
          <a href={CASE_STUDY.productUrl} target="_blank" rel="noopener noreferrer" className={css.primaryCta} data-track-event={LINK_EVENTS.product} data-track-source="overview">
            <span>Explore FAI Product</span>
            <span aria-hidden="true">↗</span>
            <span className={css.srOnly}>(opens in a new tab)</span>
          </a>
          <Link href={ROUTES.caseStudy} className={css.textLink}>
            View Case Study →
          </Link>
          <Link href={CASE_STUDY.contextUrl} className={css.textLink} data-track-event={LINK_EVENTS.aqip} data-track-source="overview">
            AQIP Context →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function InternshipCta() {
  const facts = [
    { label: "Mode", value: INTERNSHIP.mode },
    { label: "Positions", value: "6" },
    { label: "Selection", value: INTERNSHIP.selection },
    { label: "Certification", value: INTERNSHIP.certification.join(" + ") },
  ];
  return (
    <section id="internship" className={css.section} data-rule="" aria-labelledby="rv-internship-title">
      <div className={css.container}>
        <div className={css.split}>
          <div>
            <p className={css.eyebrow}>Internship</p>
            <h2 id="rv-internship-title" className={css.sectionTitle}>
              {INTERNSHIP.title}
            </h2>
            <p className={css.sectionLede}>The 10 steps are open to everyone. The internship is one guided way through them, with mentor reviews.</p>
            <div className={css.actions}>
              <Link href={INTERNSHIP.apply.url} className={css.primaryCta} data-track-event={LINK_EVENTS.apply} data-track-source="overview">
                {INTERNSHIP.apply.label}
              </Link>
            </div>
            <p className={css.note}>{INTERNSHIP.apply.note}</p>
          </div>
          <div>
            <dl className={css.factGrid}>
              {facts.map((fact) => (
                <div key={fact.label} className={css.fact}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <h3 className={css.smallHead}>Eligibility</h3>
            <ul className={css.chips} aria-label="Eligibility">
              {INTERNSHIP.eligibility.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={css.note}>{INTERNSHIP.details}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The site's shared "Designed by" card, linking to the profile on aerospace.ev.engineer. */
export function DesignedBy() {
  return (
    <section className={css.designedBy} aria-label="Designed by">
      <div className={css.container}>
        <ResearcherCard href={DESIGNED_BY.profileUrl} profileLinkProps={{ "data-track-event": LINK_EVENTS.profile, "data-track-placement": "designed_by" }} />
      </div>
    </section>
  );
}
