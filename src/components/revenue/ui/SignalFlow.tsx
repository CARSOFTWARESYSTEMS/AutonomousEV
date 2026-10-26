"use client";
// A process drawn as a line of stages with one signal on it — the
// platform's teaching animation. When the flow comes into view the signal
// travels once from the first stage to the last, lighting each; choosing a
// stage (hover, tap or keyboard) moves the signal there and shows its detail.
// With reduced motion every stage is lit and nothing moves. Phones read it
// top to bottom; from 900px it runs left to right.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { trackRevenue } from "../analytics";
import css from "../site.module.css";

const STEP_MS = 520;

export const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export interface SignalFlowProps {
  /** A short id for analytics and element ids, e.g. "customer-to-revenue". */
  id: string;
  /** The list's accessible name. */
  label: string;
  stages: readonly { name: string; hint?: string }[];
  /** Show each stage's hint under its name. */
  hints?: boolean;
  /**
   * The chosen stage's detail. Without it the panel repeats the hint, and
   * phones (which already list every hint) leave it out.
   */
  detail?: (index: number) => ReactNode;
}

export default function SignalFlow({ id, label, stages, hints = true, detail }: SignalFlowProps) {
  const last = stages.length - 1;
  const [pos, setPos] = useState(0);
  const [reached, setReached] = useState(0);
  const [selected, setSelected] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const node = wrap.current;
    if (!node) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") {
      setReached(last);
      return;
    }
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || played.current) return;
        played.current = true;
        for (let i = 1; i <= last; i++) {
          timers.push(
            window.setTimeout(() => {
              setPos(i);
              setReached((current) => Math.max(current, i));
            }, i * STEP_MS),
          );
        }
        // Rest back on the first stage, so the panel and the signal agree.
        timers.push(window.setTimeout(() => setPos(0), (last + 2) * STEP_MS));
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [last]);

  const choose = (index: number) => {
    if (index === selected && pos === index) return;
    setSelected(index);
    setPos(index);
    setReached((current) => Math.max(current, index));
    trackRevenue("flow_stage_view", { flow: id, stage: slug(stages[index].name) });
  };

  const stage = stages[selected];
  const detailId = `rv-flow-${id}`;

  return (
    <div className={css.flowWrap}>
      <div ref={wrap} className={css.flow} style={{ ["--pos" as string]: pos, ["--stages" as string]: stages.length }}>
        <span className={css.flowLine} aria-hidden="true">
          <span className={css.flowFill} />
        </span>
        <span className={css.flowSignal} aria-hidden="true" />
        <ol className={css.flowStages} aria-label={label}>
          {stages.map((item, i) => (
            <li key={item.name}>
              <button
                type="button"
                className={css.flowStage}
                aria-pressed={selected === i}
                aria-controls={detailId}
                data-lit={i <= reached ? "" : undefined}
                onClick={() => choose(i)}
                onMouseEnter={() => choose(i)}
                onFocus={() => choose(i)}
              >
                <span className={css.flowNode} aria-hidden="true" />
                <span className={css.flowName}>{item.name}</span>
                {hints && item.hint ? <span className={css.flowHint}>{item.hint}</span> : null}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div id={detailId} className={css.flowDetail} data-rich={detail ? "" : undefined} aria-live="polite">
        <p className={css.flowDetailStep}>
          {String(selected + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")} · {stage.name}
        </p>
        {detail ? detail(selected) : <p className={css.flowDetailQuestion}>{stage.hint}</p>}
      </div>
    </div>
  );
}
