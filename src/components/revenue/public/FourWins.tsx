"use client";
// Four wins in one row, joined by a thin line. When the row comes into view
// a signal runs along the line once and each win lights as it passes. With
// reduced motion, or before the script runs, every win is simply lit.
import { useEffect, useRef, useState } from "react";
import { FOUR_WINS, WINS_NOTE, stepNo } from "../data/steps";
import css from "../site.module.css";

export default function FourWins() {
  const wrap = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"wait" | "play" | undefined>(undefined);

  useEffect(() => {
    const node = wrap.current;
    if (!node || typeof IntersectionObserver === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setState("wait");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setState("play");
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={css.section} data-tone="alt" aria-labelledby="rv-wins-title">
      <div className={css.container}>
        <p className={css.eyebrow}>Win–Win–Win–Win</p>
        <h2 id="rv-wins-title" className={css.sectionTitle}>
          Four Wins
        </h2>
        <p className={css.sectionLede}>A sale is only good when the customer, the business, the team and the product all win.</p>
        <div ref={wrap} className={css.winsWrap} data-state={state}>
          <span className={css.winsLine} aria-hidden="true">
            <span className={css.winsSignal} />
          </span>
          <ol className={css.wins}>
            {FOUR_WINS.map((win, i) => (
              <li key={win.id} className={css.win} data-win={win.id} style={{ ["--i" as string]: i }}>
                <p className={css.winNo}>{stepNo(i + 1)}</p>
                <h3 className={css.winName}>{win.name}</h3>
                <ul className={css.winItems}>
                  {win.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
        <p className={css.note}>{WINS_NOTE}</p>
      </div>
    </section>
  );
}
