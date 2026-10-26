// The hero: the transformation in one line, the live case study, the
// commercial journey as a signal passing stage to stage, and the programme.
import Link from "next/link";
import { LINK_EVENTS } from "../analytics";
import { CASE_STUDY, FRAMEWORK, JOURNEY, MAIN_MESSAGE, PROGRAMME_META } from "../data/framework";
import css from "../revenue.module.css";
import HeroActions from "./HeroActions";

export default function Hero() {
  return (
    <section className={css.hero} aria-labelledby="rv-hero-title">
      <div className={css.heroGrid} aria-hidden="true" />
      <div className={css.heroInner}>
        <div className={css.heroCopy}>
          <nav aria-label="Breadcrumb" className={css.breadcrumb}>
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/internships">Internships</Link>
              </li>
              <li aria-current="page">Marketing &amp; Sales</li>
            </ol>
          </nav>
          <p className={css.eyebrow}>{FRAMEWORK.eyebrow}</p>
          <h1 id="rv-hero-title" className={css.title}>
            {FRAMEWORK.headline}
          </h1>
          <p className={css.lede}>{FRAMEWORK.lede}</p>
          <HeroActions />
          <ul className={css.meta} aria-label="Programme">
            {PROGRAMME_META.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <aside className={css.caseCard} aria-labelledby="rv-case-title">
          <p className={css.caseLabel}>
            <span className={css.liveDot} aria-hidden="true" />
            {CASE_STUDY.label}
          </p>
          <h2 id="rv-case-title" className={css.caseTitle}>
            {CASE_STUDY.title}
          </h2>
          <dl className={css.caseFacts}>
            <div>
              <dt>Product</dt>
              <dd>{CASE_STUDY.product} — browser-based ballooning and Form 3-oriented export</dd>
            </div>
            <div>
              <dt>Market</dt>
              <dd>{CASE_STUDY.market}</dd>
            </div>
            <div>
              <dt>Geography</dt>
              <dd>{CASE_STUDY.geography}</dd>
            </div>
          </dl>
          <div className={css.caseLinks}>
            <a href={CASE_STUDY.productUrl} target="_blank" rel="noopener noreferrer" data-track-event={LINK_EVENTS.product} data-track-source="hero">
              Explore Product<span className={css.srOnly}> (opens in a new tab)</span> ↗
            </a>
            <Link href={CASE_STUDY.contextUrl} data-track-event={LINK_EVENTS.aqip} data-track-source="hero">
              Understand AQIP Context →
            </Link>
          </div>
        </aside>
      </div>

      <div className={css.signalWrap}>
        <ol className={css.signal} aria-label={`The commercial journey: ${JOURNEY.join(" to ")}`}>
          {JOURNEY.map((stage, i) => (
            <li key={stage} style={{ ["--i" as string]: i }}>
              <span className={css.signalNode} aria-hidden="true" />
              <span className={css.signalLabel}>{stage}</span>
            </li>
          ))}
        </ol>
        <span className={css.signalPulse} aria-hidden="true" />
      </div>

      <div className={css.anchor}>
        <p className={css.anchorDont}>
          Don&apos;t start by asking: <q>{MAIN_MESSAGE.dont}</q>
        </p>
        <p className={css.anchorDo}>
          Start by asking: <q>{MAIN_MESSAGE.do}</q>
        </p>
        <p className={css.anchorChain}>{MAIN_MESSAGE.chain.join(" → ")}</p>
      </div>
    </section>
  );
}
