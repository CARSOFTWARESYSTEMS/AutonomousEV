// The ten steps: one line and one way in each. Phones read a vertical
// timeline; from 1024px the steps run in two rows of five along a line.
import Link from "next/link";
import { ROUTES } from "../data/framework";
import { STEPS, stepNo } from "../data/steps";
import css from "../site.module.css";

export default function StepJourney() {
  return (
    <section id="journey" className={css.section} data-tone="alt" aria-labelledby="rv-journey-title">
      <div className={css.container}>
        <p className={css.eyebrow}>The 10-Step Journey</p>
        <h2 id="rv-journey-title" className={css.sectionTitle}>
          Ten Steps From Customer to Revenue
        </h2>
        <ol className={css.journey}>
          {STEPS.map((step) => (
            <li key={step.n} className={css.journeyStep}>
              <span className={css.journeyNode} aria-hidden="true" />
              <p className={css.journeyNo}>{stepNo(step.n)}</p>
              <h3 className={css.journeyName}>{step.short}</h3>
              <p className={css.journeyLine}>{step.line}</p>
              <Link href={`${ROUTES[step.page]}#step-${step.n}`} className={css.journeyLink}>
                Open{" "}
                <span className={css.srOnly}>
                  Step {step.n}: {step.short}
                </span>{" "}
                →
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
