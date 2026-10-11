"use client";
// An educational readiness indicator. It opens on an honest assessment of this
// page's own twin; the learner can then assess a programme of their own. The
// result is limited by the weakest category, which is the point it teaches.
import { useState } from "react";
import { READINESS_CATEGORIES, READINESS_CAVEAT, READINESS_LEVELS } from "../data/course";
import css from "../advancedTwin.module.css";

const HERE = Object.fromEntries(READINESS_CATEGORIES.map((c) => [c.id, c.here]));
const MAX = READINESS_LEVELS.length - 1;

export default function ReadinessScore() {
  const [levels, setLevels] = useState<Record<string, number>>(HERE);
  const [own, setOwn] = useState(false);
  const values = READINESS_CATEGORIES.map((c) => levels[c.id]);
  const weakest = Math.min(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const limiting = READINESS_CATEGORIES.filter((c) => levels[c.id] === weakest);

  return (
    <div className={css.readiness}>
      <div className={css.options} role="group" aria-label="What is being assessed">
        <button
          type="button"
          className={css.option}
          aria-pressed={!own}
          onClick={() => {
            setOwn(false);
            setLevels(HERE);
          }}
        >
          This page&apos;s educational twin
        </button>
        <button type="button" className={css.option} aria-pressed={own} onClick={() => setOwn(true)}>
          Assess your own programme
        </button>
      </div>

      <div className={css.readinessSummary} role="status">
        <p className={css.verdict}>
          Level {weakest} of {MAX}: {READINESS_LEVELS[weakest]}
        </p>
        <p>
          Limited by {limiting.length === 1 ? "its weakest category" : `${limiting.length} categories`}: {limiting.map((c) => c.name).join(", ")}. The average across all thirteen is {mean.toFixed(1)}, but a twin is only as ready as its weakest foundation.
        </p>
        <p className={css.note}>{READINESS_CAVEAT}</p>
      </div>

      <ul className={css.readinessList}>
        {READINESS_CATEGORIES.map((c) => {
          const value = levels[c.id];
          return (
            <li key={c.id} data-limiting={value === weakest || undefined}>
              <div className={css.readinessHead}>
                <span className={css.readinessName}>{c.name}</span>
                <span className={css.readinessLevel}>
                  {value} · {READINESS_LEVELS[value]}
                  {value === weakest ? " · limiting" : ""}
                </span>
              </div>
              <p className={css.hint}>{own ? c.asks : c.why}</p>
              <input type="range" min={0} max={MAX} step={1} value={value} disabled={!own} aria-label={`${c.name}: readiness level`} aria-valuetext={`${value}: ${READINESS_LEVELS[value]}`} onChange={(e) => setLevels((l) => ({ ...l, [c.id]: Number(e.target.value) }))} className={css.range} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
