// The hero: what this is, for whom, and the way in — beside a readout of the
// evidence ladder, the idea the whole framework rests on.
import { FRAMEWORK } from "../data/framework";
import { EVIDENCE_LABEL, EVIDENCE_ORDER } from "../types";
import css from "../site.module.css";
import HeroActions from "./HeroActions";

/** The ladder from the top rung down; only Assumption is reached on Day 1. */
const RUNGS = [...EVIDENCE_ORDER].reverse();

export default function Hero() {
  return (
    <section className={css.hero} aria-labelledby="rv-hero-title">
      <div className={css.container}>
        <div className={css.heroGrid}>
          <div>
            <p className={css.eyebrow}>{FRAMEWORK.eyebrow}</p>
            <h1 id="rv-hero-title" className={css.title}>
              {FRAMEWORK.headline}
            </h1>
            <p className={css.lede}>{FRAMEWORK.lede}</p>
            <HeroActions />
            <div className={css.heroMeta}>
              <ul className={css.contextLine} aria-label="Focus">
                {FRAMEWORK.context.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <figure className={css.instrument} aria-labelledby="rv-instrument-caption">
            <figcaption id="rv-instrument-caption" className={css.instrumentHead}>
              <span>Evidence ladder</span>
              <span>Day 01</span>
            </figcaption>
            <ol className={css.instrumentRows}>
              {RUNGS.map((level) => {
                const on = level === "assumption";
                return (
                  <li key={level} data-on={on ? "" : undefined}>
                    <span className={css.instrumentName}>{EVIDENCE_LABEL[level]}</span>
                    <span className={css.instrumentBar} aria-hidden="true">
                      <span style={{ ["--fill" as string]: on ? "100%" : "0%" }} />
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className={css.instrumentStatus}>Every claim starts as an assumption</p>
          </figure>
        </div>
      </div>
    </section>
  );
}
