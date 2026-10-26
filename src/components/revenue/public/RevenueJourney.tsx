"use client";
// The platform's signature visual: Problem → … → Revenue as a system flow.
// When the section comes into view a signal travels once from Problem to
// Revenue, lighting each stage. Choosing a stage (hover, tap or keyboard)
// moves the signal there and shows the one question that stage answers.
// With reduced motion every stage is lit and nothing moves.
import { useEffect, useRef, useState } from "react";
import { trackRevenue } from "../analytics";
import { JOURNEY, JOURNEY_QUESTIONS, JOURNEY_WEEKS } from "../data/framework";
import css from "../site.module.css";

const LAST = JOURNEY.length - 1;
const STEP_MS = 520;

export default function RevenueJourney() {
  const [pos, setPos] = useState(0);
  const [reached, setReached] = useState(0);
  const [selected, setSelected] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const node = wrap.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") {
      setReached(LAST);
      return;
    }
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || played.current) return;
        played.current = true;
        for (let i = 1; i <= LAST; i++) {
          timers.push(
            window.setTimeout(() => {
              setPos(i);
              setReached((current) => Math.max(current, i));
            }, i * STEP_MS),
          );
        }
        // Rest back on the first stage, so the panel and the signal agree.
        timers.push(window.setTimeout(() => setPos(0), (LAST + 2) * STEP_MS));
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const choose = (index: number) => {
    setSelected(index);
    setPos(index);
    setReached((current) => Math.max(current, index));
    trackRevenue("revenue_journey_stage", { stage: JOURNEY[index].toLowerCase() });
  };

  const stage = JOURNEY[selected];

  return (
    <section className={css.section} data-tone="alt" aria-labelledby="rv-journey-title">
      <div className={css.container}>
        <div className={css.sectionHeadCenter}>
          <h2 id="rv-journey-title" className={css.sectionTitle}>
            Can this problem become revenue?
          </h2>
          <p className={css.sectionLede}>Every opportunity passes the same seven questions. Choose a stage.</p>
        </div>

        <div ref={wrap} className={css.flow} style={{ ["--pos" as string]: pos }}>
          <span className={css.flowLine} aria-hidden="true">
            <span className={css.flowFill} />
          </span>
          <span className={css.flowSignal} aria-hidden="true" />
          <ol className={css.flowStages} aria-label="The revenue journey">
            {JOURNEY.map((name, i) => (
              <li key={name}>
                <button
                  type="button"
                  className={css.flowStage}
                  aria-pressed={selected === i}
                  aria-controls="rv-journey-detail"
                  data-lit={i <= reached ? "" : undefined}
                  onClick={() => choose(i)}
                  onMouseEnter={() => choose(i)}
                  onFocus={() => choose(i)}
                >
                  <span className={css.flowNode} aria-hidden="true" />
                  <span className={css.flowName}>{name}</span>
                  <span className={css.flowHint}>{JOURNEY_QUESTIONS[name]}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div id="rv-journey-detail" className={css.flowDetail} aria-live="polite">
          <p className={css.flowDetailStep}>
            {String(selected + 1).padStart(2, "0")} / {String(JOURNEY.length).padStart(2, "0")} · {stage}
          </p>
          <p className={css.flowDetailQuestion}>{JOURNEY_QUESTIONS[stage]}</p>
          <p className={css.flowDetailWhen}>Worked on in {JOURNEY_WEEKS[stage]}</p>
        </div>
      </div>
    </section>
  );
}
