"use client";
// Today's left column: the step this day belongs to, that step's days, the
// way to the next or previous day, and a picker for any of the sixty.
import Link from "next/link";
import { JOURNEY_HREF, TOTAL_DAYS } from "../data/framework";
import { daysOfStep, stepNo, stepOfDay } from "../data/steps";
import { missionFor } from "../logic/missions";
import { useRevenue } from "../state/store";
import DayPicker from "../ui/DayPicker";
import css from "../app.module.css";

export default function StepRail({ onDayChange }: { onDayChange: (day: number) => void }) {
  const day = useRevenue((state) => state.day);
  const completed = useRevenue((state) => state.completed);
  const step = stepOfDay(day);

  return (
    <nav className={css.rail} aria-label="This step">
      <p className={css.railKicker}>Step {stepNo(step.n)} of 10</p>
      <p className={css.railName}>{step.name}</p>
      <p className={css.railLine}>{step.line}</p>
      <ol className={css.railDays} aria-label={`Days in Step ${step.n}`}>
        {daysOfStep(step.n).map((n) => (
          <li key={n}>
            <button type="button" className={css.railDay} aria-current={n === day ? "step" : undefined} data-done={completed[n] ? "" : undefined} onClick={() => onDayChange(n)}>
              <span className={css.railDayNo}>{completed[n] ? "✓" : `Day ${n}`}</span>
              <span className={css.railDayTitle}>
                {missionFor(n).title}
                {completed[n] ? <span className={css.srOnly}> (complete, Day {n})</span> : null}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className={css.railNav}>
        <button type="button" className={css.ghostButton} disabled={day <= 1} onClick={() => onDayChange(day - 1)} aria-label={`Previous day, Day ${day - 1}`}>
          ← Day {Math.max(1, day - 1)}
        </button>
        <button type="button" className={css.ghostButton} disabled={day >= TOTAL_DAYS} onClick={() => onDayChange(day + 1)} aria-label={`Next day, Day ${day + 1}`}>
          Day {Math.min(TOTAL_DAYS, day + 1)} →
        </button>
      </div>
      <DayPicker value={day} onSelect={onDayChange} />
      <Link href={JOURNEY_HREF} className={css.inlineLink}>
        All 10 steps →
      </Link>
    </nav>
  );
}
