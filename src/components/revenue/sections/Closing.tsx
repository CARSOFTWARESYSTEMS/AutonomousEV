// Below the workspace: the core philosophy, and the 12-week guided internship.
import { LINK_EVENTS } from "../analytics";
import { FULL_JOURNEY, INTERNSHIP, OPERATING_SYSTEM, PHASES, PRINCIPLES } from "../data/framework";
import css from "../revenue.module.css";

export function Philosophy() {
  return (
    <section className={css.section} aria-labelledby="rv-philosophy">
      <div className={css.container}>
        <p className={css.eyebrow}>Core product philosophy</p>
        <h2 id="rv-philosophy" className={css.sectionTitle}>
          Ten principles, every day
        </h2>
        <ol className={css.principles}>
          {PRINCIPLES.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ol>
        <div className={css.osRow}>
          <p className={css.osLabel}>Daily operating system</p>
          <ol className={css.osSteps}>
            {OPERATING_SYSTEM.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <details className={css.fullJourney}>
          <summary>The full market-to-profit journey</summary>
          <p>{FULL_JOURNEY.join(" → ")}</p>
        </details>
      </div>
    </section>
  );
}

export function Internship() {
  return (
    <section id="rv-apply" className={css.section} data-tone="internship" aria-labelledby="rv-internship">
      <div className={css.container}>
        <p className={css.eyebrow}>Internship mode</p>
        <h2 id="rv-internship" className={css.sectionTitle}>
          {INTERNSHIP.title}
        </h2>
        <div className={css.internGrid}>
          <div>
            <h3 className={css.cardTitle}>Who it is for</h3>
            <ul className={css.ticks}>
              {INTERNSHIP.eligibility.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={css.muted}>The framework is open to everyone; the internship is one guided mode inside it.</p>
          </div>
          <dl className={css.internFacts}>
            <div>
              <dt>Cohort</dt>
              <dd>{INTERNSHIP.cohort}</dd>
            </div>
            <div>
              <dt>Selection</dt>
              <dd>{INTERNSHIP.selection}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{INTERNSHIP.mode}</dd>
            </div>
            <div>
              <dt>Certification</dt>
              <dd>{INTERNSHIP.certification.join(" · ")}</dd>
            </div>
            <div>
              <dt>Phases</dt>
              <dd>{PHASES.map((phase) => phase.name).join(" → ")}</dd>
            </div>
          </dl>
        </div>
        <p className={css.muted}>{INTERNSHIP.details}</p>
        <div className={css.applyRow}>
          <a href={INTERNSHIP.apply.url} target="_blank" rel="noopener noreferrer" className={css.primaryCta} data-track-event={LINK_EVENTS.apply} data-track-source="internship">
            {INTERNSHIP.apply.label}
            <span className={css.srOnly}> (opens in a new tab)</span>
          </a>
          <p className={css.muted}>{INTERNSHIP.apply.note}</p>
        </div>
      </div>
    </section>
  );
}
