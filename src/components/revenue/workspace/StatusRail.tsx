"use client";
// The right-hand rail: where you are in the sixty days, this week's challenge,
// the next gate, the evidence so far and the North Star.
import { GATES, TOTAL_DAYS, isReviewDay, weekOf } from "../data/framework";
import { PAINS } from "../data/library";
import { SYNTHETIC_OPPORTUNITIES } from "../data/synthetic";
import { formatINRShort } from "../logic/format";
import { phaseOf, weekInfo } from "../logic/missions";
import { isFullyQualified } from "../logic/scoring";
import { isQualifiedStage } from "../data/scoring";
import { useRevenue } from "../state/store";
import { EVIDENCE_LABEL, EVIDENCE_ORDER } from "../types";
import css from "../workspace.module.css";
import DataControls from "./DataControls";
import { ViewLink } from "./nav";

export default function StatusRail() {
  const day = useRevenue((state) => state.day);
  const completed = useRevenue((state) => state.completed);
  const challenges = useRevenue((state) => state.challenges);
  const gates = useRevenue((state) => state.gates);
  const pains = useRevenue((state) => state.pains);
  const opportunities = useRevenue((state) => state.opportunities);
  const showSynthetic = useRevenue((state) => state.showSynthetic);

  const week = weekOf(day);
  const phase = phaseOf(day);
  const doneCount = Object.keys(completed).length;
  const nextGate = GATES.find((gate) => !gates[gate.id]);
  const reviewDay = Math.ceil(day / 5) * 5;

  const counts = EVIDENCE_ORDER.map((level) => ({
    level,
    count: PAINS.filter((pain) => !pains[pain.id]?.invalidated && (pains[pain.id]?.level ?? "assumption") === level).length,
  }));
  const invalidated = PAINS.filter((pain) => pains[pain.id]?.invalidated).length;

  const pool = showSynthetic ? [...opportunities, ...SYNTHETIC_OPPORTUNITIES] : opportunities;
  const qualified = pool.filter((opportunity) => isQualifiedStage(opportunity.stage) && isFullyQualified(opportunity.qualified));
  const qualifiedValue = qualified.reduce((sum, opportunity) => sum + opportunity.value, 0);

  return (
    <div className={css.railStack}>
      <section className={css.railCard} aria-labelledby="rv-rail-progress">
        <h3 id="rv-rail-progress" className={css.railTitle}>
          Progress
        </h3>
        <p className={css.railBig}>
          Day {day} <span>of {TOTAL_DAYS}</span>
        </p>
        <p className={css.railMeta}>
          Week {week} · Phase {phase.n}: {phase.name}
        </p>
        <ol className={css.dayStrip} aria-label={`${doneCount} of ${TOTAL_DAYS} days complete`}>
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((n) => (
            <li key={n} data-done={completed[n] ? "" : undefined} data-current={n === day ? "" : undefined} data-gate={n % 20 === 0 ? "" : undefined} />
          ))}
        </ol>
        <p className={css.railMeta}>{doneCount} days complete</p>
      </section>

      <section className={css.railCard} aria-labelledby="rv-rail-challenge">
        <h3 id="rv-rail-challenge" className={css.railTitle}>
          Founder Challenge · Week {week}
        </h3>
        <p className={css.railText}>{weekInfo(day).challenge}</p>
        <p className={css.railMeta}>{challenges[week] ? "Marked complete" : "Open"}</p>
        <ViewLink view="challenges" className={css.railLink}>
          All challenges
        </ViewLink>
      </section>

      <section className={css.railCard} aria-labelledby="rv-rail-review">
        <h3 id="rv-rail-review" className={css.railTitle}>
          Mentor &amp; self-review
        </h3>
        <p className={css.railText}>{isReviewDay(day) ? "Today is Friday: the weekly CEO / CMO / CSO review is due." : `Weekly review due on Day ${reviewDay}.`}</p>
        {nextGate ? (
          <p className={css.railMeta}>
            Next gate: <strong>Gate {nextGate.id} — {nextGate.name}</strong> (around Day {nextGate.day})
          </p>
        ) : (
          <p className={css.railMeta}>All gates complete.</p>
        )}
        <div className={css.railLinks}>
          <ViewLink view="review" className={css.railLink}>
            Weekly review
          </ViewLink>
          <ViewLink view="internship" className={css.railLink}>
            Gates
          </ViewLink>
        </div>
      </section>

      <section className={css.railCard} aria-labelledby="rv-rail-evidence">
        <h3 id="rv-rail-evidence" className={css.railTitle}>
          Evidence ladder
        </h3>
        <ul className={css.ladderList}>
          {counts.map(({ level, count }) => (
            <li key={level}>
              <span>{EVIDENCE_LABEL[level]}</span>
              <span className={css.tabular}>{count}</span>
            </li>
          ))}
          <li>
            <span>Invalidated</span>
            <span className={css.tabular}>{invalidated}</span>
          </li>
        </ul>
        <ViewLink view="pains" className={css.railLink}>
          Pain Library
        </ViewLink>
      </section>

      <section className={css.railCard} data-tone="accent" aria-labelledby="rv-rail-north">
        <h3 id="rv-rail-north" className={css.railTitle}>
          North Star
        </h3>
        <p className={css.railText}>Qualified Revenue Pipeline Created</p>
        <p className={css.railBig}>{formatINRShort(qualifiedValue)}</p>
        <p className={css.railMeta}>
          {qualified.length} qualified {qualified.length === 1 ? "opportunity" : "opportunities"}
          {showSynthetic ? " · includes synthetic demonstration data" : ""}
        </p>
        <ViewLink view="cockpit" className={css.railLink}>
          Revenue Cockpit
        </ViewLink>
      </section>

      <DataControls />
    </div>
  );
}
