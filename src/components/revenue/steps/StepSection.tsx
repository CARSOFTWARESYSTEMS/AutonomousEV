// One step of the ten: its sentence, an optional visual, then Do / Ask /
// Avoid, the result to finish with and one way to start it in Today.
// Deeper ideas wait behind "Learn more".
import Link from "next/link";
import type { ReactNode } from "react";
import { DONT_ASK, todayHref } from "../data/framework";
import { LEARN } from "../data/library";
import { daysOfStep, firstDayOfStep, stepNo, type Step } from "../data/steps";
import css from "../site.module.css";

const CONCEPTS = [...LEARN.marketing.concepts, ...LEARN.sales.concepts, ...LEARN.revenue.concepts];

export default function StepSection({ step, tone, children }: { step: Step; tone?: "alt"; children?: ReactNode }) {
  const concepts = step.concepts.map((id) => CONCEPTS.find((concept) => concept.id === id)).filter((concept) => concept !== undefined);
  const days = daysOfStep(step.n);
  const titleId = `rv-step-${step.n}-title`;

  return (
    <section id={`step-${step.n}`} className={css.section} data-tone={tone} data-rule={tone ? undefined : ""} aria-labelledby={titleId}>
      <div className={css.container}>
        <p className={css.eyebrow}>Step {stepNo(step.n)}</p>
        <h2 id={titleId} className={css.sectionTitle}>
          {step.name}
        </h2>
        <p className={css.sectionLede}>{step.sentence}</p>

        {children ? <div className={css.stepVisual}>{children}</div> : null}

        <div className={css.stepGrid}>
          <div>
            <h3 className={css.stepLabel}>Do</h3>
            <ol className={css.stepList}>
              {step.doList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
          {step.ask ? (
            <div>
              <h3 className={css.stepLabel}>{step.askLabel ?? "Ask"}</h3>
              <ul className={css.stepList}>
                {step.ask.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <h3 className={css.stepLabel} data-tone="warn">
              Avoid
            </h3>
            <ul className={css.stepList} data-tone="warn">
              {step.avoid.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {step.dontAsk ? (
              <>
                <h3 className={css.stepLabel} data-tone="warn">
                  Don&apos;t ask yet
                </h3>
                <ul className={css.stepList} data-tone="warn">
                  {DONT_ASK.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>

        <p className={css.stepResult}>
          <span className={css.stepResultLabel}>Result</span>
          <span>{step.result}</span>
        </p>

        <div className={css.actions}>
          <Link href={todayHref(firstDayOfStep(step.n))} className={css.primaryCta} data-track-event="revenue_framework_start" data-track-source={`step-${step.n}`}>
            Start Step {step.n} →
          </Link>
        </div>

        <details className={css.learnMore}>
          <summary>Learn more</summary>
          <div className={css.learnBody}>
            {concepts.length ? (
              <ul className={css.conceptList}>
                {concepts.map((concept) => (
                  <li key={concept.id}>
                    <p className={css.conceptTitle}>{concept.title}</p>
                    <p>{concept.summary}</p>
                    <p className={css.conceptPoints}>{concept.points.join(" · ")}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className={css.stepDays}>
              <span>This step&apos;s days in Today:</span>
              {days.map((day) => (
                <Link key={day} href={todayHref(day)} className={css.dayChip}>
                  Day {day}
                </Link>
              ))}
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
