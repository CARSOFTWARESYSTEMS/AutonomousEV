// The hero: what this is, for whom and where to start — beside a drawing
// being ballooned, which is what the product helps with.
import { Fragment } from "react";
import { FRAMEWORK } from "../data/framework";
import css from "../site.module.css";
import BalloonDrawing from "./BalloonDrawing";
import HeroActions from "./HeroActions";

export default function Hero() {
  return (
    <section className={css.hero} aria-labelledby="rv-hero-title">
      <div className={css.container}>
        <div className={css.heroGrid}>
          <div>
            <p className={css.eyebrow}>{FRAMEWORK.eyebrow}</p>
            <h1 id="rv-hero-title" className={css.title}>
              {FRAMEWORK.headlineLines.map((line) => (
                <Fragment key={line}>
                  <span className={css.titleLine}>{line}</span>{" "}
                </Fragment>
              ))}
            </h1>
            <p className={css.lede}>{FRAMEWORK.lede}</p>
            <HeroActions />
            <ul className={`${css.contextLine} ${css.heroPath}`} aria-label="The path">
              {FRAMEWORK.context.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <BalloonDrawing />
        </div>
      </div>
    </section>
  );
}
