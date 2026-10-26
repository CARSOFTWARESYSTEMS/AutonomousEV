// The overview's other sections: the live case study, the three-phase
// journey, outcomes and audience, and the internship. One idea each.
import Link from "next/link";
import { LINK_EVENTS } from "../analytics";
import { AUDIENCES, CASE_STUDY, INTERNSHIP, OUTCOMES, PHASES, ROUTES } from "../data/framework";
import css from "../site.module.css";

export function CaseStudyTeaser() {
  const cards = [
    { label: "Product", value: CASE_STUDY.product },
    { label: "Market", value: CASE_STUDY.market },
    { label: "Geography", value: CASE_STUDY.geography },
    { label: "Objective", value: CASE_STUDY.objective },
  ];
  return (
    <section className={css.section} data-rule="" aria-labelledby="rv-case-title">
      <div className={css.container}>
        <p className={css.eyebrow}>{CASE_STUDY.label}</p>
        <h2 id="rv-case-title" className={css.sectionTitle}>
          {CASE_STUDY.title}
        </h2>
        <dl className={css.factRow}>
          {cards.map((card) => (
            <div key={card.label} className={css.fact}>
              <dt>{card.label}</dt>
              <dd>{card.value}</dd>
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
            AQIP strategy context →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function JourneyStages() {
  return (
    <section id="journey" className={css.section} data-tone="alt" aria-labelledby="rv-stages-title">
      <div className={css.container}>
        <p className={css.eyebrow}>12-Week Journey</p>
        <h2 id="rv-stages-title" className={css.sectionTitle}>
          Three months. Three proofs.
        </h2>
        <ol className={css.stages}>
          {PHASES.map((phase) => (
            <li key={phase.n} className={css.stage}>
              <p className={css.stageNo}>{String(phase.n).padStart(2, "0")}</p>
              <h3 className={css.stageName}>{phase.name}</h3>
              <p className={css.stageWeeks}>{phase.weeks}</p>
              <p className={css.stageVerb}>{phase.verb}</p>
              <ul className={css.stageTopics}>
                {phase.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
              <Link href={ROUTES[phase.route]} className={css.textLink}>
                {phase.cta} →
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Outcomes() {
  return (
    <section className={css.section} data-rule="" aria-labelledby="rv-outcomes-title">
      <div className={css.container}>
        <div className={css.split}>
          <div>
            <p className={css.eyebrow}>Outcomes</p>
            <h2 id="rv-outcomes-title" className={css.sectionTitle}>
              What you will be able to do
            </h2>
          </div>
          <ol className={css.numbered}>
            {OUTCOMES.map((outcome, i) => (
              <li key={outcome.title}>
                <span className={css.numberedNo} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className={css.numberedTitle}>{outcome.title}</span>
                  <span className={css.numberedText}>{outcome.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className={css.audience}>
          <h3 className={css.smallHead}>Who it is for</h3>
          <ul className={css.chips} aria-label="Who it is for">
            {AUDIENCES.map((audience) => (
              <li key={audience}>{audience}</li>
            ))}
          </ul>
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
    <section id="internship" className={css.section} data-tone="alt" aria-labelledby="rv-internship-title">
      <div className={css.container}>
        <div className={css.split}>
          <div>
            <p className={css.eyebrow}>Internship mode</p>
            <h2 id="rv-internship-title" className={css.sectionTitle}>
              {INTERNSHIP.title}
            </h2>
            <p className={css.sectionLede}>The framework is open to everyone. The internship is one guided way through it, with mentor reviews.</p>
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
