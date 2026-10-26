"use client";
// Today's context: progress by month and the active week, the evidence so
// far, the mentor gates, the Weekly Business Challenge and the next action.
// No synthetic data here — only the user's own progress.
import Link from "next/link";
import { trackRevenue } from "../analytics";
import { CHALLENGE_LABEL, GATES, PHASES, PROFESSIONAL_BEHAVIOUR, ROUTES, phaseOf, weekOf } from "../data/framework";
import { PAINS } from "../data/library";
import { daysOfWeek, missionFor, weekInfo } from "../logic/missions";
import { gateUnlocked, useRevenue } from "../state/store";
import { EVIDENCE_LABEL, EVIDENCE_ORDER } from "../types";
import { CheckItem } from "../ui/controls";
import css from "../app.module.css";
import DataControls from "../app/DataControls";

export default function ContextPanel({ onDayChange }: { onDayChange: (day: number) => void }) {
  const day = useRevenue((state) => state.day);
  const completed = useRevenue((state) => state.completed);
  const pains = useRevenue((state) => state.pains);
  const gates = useRevenue((state) => state.gates);
  const professional = useRevenue((state) => state.professional);
  const challenges = useRevenue((state) => state.challenges);
  const checks = useRevenue((state) => state.checks);
  const setGate = useRevenue((state) => state.setGate);
  const setChallenge = useRevenue((state) => state.setChallenge);
  const setProfessional = useRevenue((state) => state.setProfessional);
  const toggleCheck = useRevenue((state) => state.toggleCheck);

  const week = weekOf(day);
  const nextGate = GATES.find((gate) => !gates[gate.id]);
  const counts = EVIDENCE_ORDER.map((level) => ({ level, count: PAINS.filter((pain) => !pains[pain.id]?.invalidated && (pains[pain.id]?.level ?? "assumption") === level).length }));

  const toggleBehaviour = (i: number) => {
    toggleCheck(`pro:${i}`);
    setProfessional(PROFESSIONAL_BEHAVIOUR.every((_, j) => (j === i ? !checks[`pro:${i}`] : checks[`pro:${j}`])));
  };

  const confirmGate = (id: (typeof GATES)[number]["id"], done: boolean) => {
    setGate(id, done);
    if (done) trackRevenue("mentor_gate_complete", { gate: id.toLowerCase() });
  };

  return (
    <div className={css.context}>
      <section className={css.contextBlock} aria-labelledby="rv-ctx-progress">
        <h2 id="rv-ctx-progress" className={css.contextTitle}>
          Progress
        </h2>
        <ul className={css.months}>
          {PHASES.map((phase) => {
            const first = (phase.n - 1) * 20 + 1;
            const done = Array.from({ length: 20 }, (_, i) => first + i).filter((n) => completed[n]).length;
            return (
              <li key={phase.n} data-current={phaseOf(day).n === phase.n ? "" : undefined}>
                <span>
                  Month {phase.n} — {phase.short}
                </span>
                <span className={css.tabular}>{done} / 20</span>
                <span className={css.monthBar} aria-hidden="true">
                  <span style={{ width: `${(done / 20) * 100}%` }} />
                </span>
              </li>
            );
          })}
        </ul>
        <p className={css.contextSub}>
          Week {week} · {weekInfo(day).theme}
        </p>
        <ol className={css.weekDays} aria-label={`Week ${week}`}>
          {daysOfWeek(week).map((mission) => (
            <li key={mission.day}>
              <button
                type="button"
                className={css.weekDay}
                aria-current={mission.day === day ? "step" : undefined}
                data-done={completed[mission.day] ? "" : undefined}
                onClick={() => onDayChange(mission.day)}
                aria-label={`Day ${mission.day}: ${mission.title}${completed[mission.day] ? " (complete)" : ""}`}
              >
                Day {mission.day}
                {completed[mission.day] ? " ✓" : ""}
              </button>
            </li>
          ))}
        </ol>
        <Link href={ROUTES[phaseOf(day).route]} className={css.inlineLink}>
          The full journey →
        </Link>
      </section>

      <section className={css.contextBlock} aria-labelledby="rv-ctx-next">
        <h2 id="rv-ctx-next" className={css.contextTitle}>
          Next action
        </h2>
        <p>{missionFor(day).next}</p>
        <p className={css.contextSub}>
          {CHALLENGE_LABEL} · Week {week}
        </p>
        <p className={css.challenge}>{weekInfo(day).challenge}</p>
        <label className={css.switchLabel}>
          <input
            type="checkbox"
            checked={Boolean(challenges[week])}
            autoComplete="off"
            onChange={(event) => {
              setChallenge(week, event.target.checked);
              if (event.target.checked) trackRevenue("founder_challenge_complete", { week: String(week) });
            }}
          />
          Challenge met, with evidence
        </label>
      </section>

      <section className={css.contextBlock} aria-labelledby="rv-ctx-evidence">
        <h2 id="rv-ctx-evidence" className={css.contextTitle}>
          Evidence
        </h2>
        <ul className={css.ladderList}>
          {counts.map(({ level, count }) => (
            <li key={level}>
              <span>{EVIDENCE_LABEL[level]}</span>
              <span className={css.tabular}>{count}</span>
            </li>
          ))}
        </ul>
        <Link href={`${ROUTES.caseStudy}#problems`} className={css.inlineLink}>
          Problem hypotheses →
        </Link>
      </section>

      <section id="gates" className={css.contextBlock} aria-labelledby="rv-ctx-gates">
        <h2 id="rv-ctx-gates" className={css.contextTitle}>
          Mentor gate
        </h2>
        {nextGate ? (
          <div className={css.nextGate}>
            <p className={css.nextGateName}>
              Gate {nextGate.id} — {nextGate.name}
            </p>
            <p className={css.blockNote}>
              {nextGate.criterion} Around Day {nextGate.day}.
            </p>
          </div>
        ) : (
          <p className={css.success}>All gates confirmed.</p>
        )}
        <details className={css.disclosure}>
          <summary>All gates (A–G)</summary>
          <ul className={css.gateList}>
            {GATES.map((gate) => {
              const unlocked = gateUnlocked({ gates, professional }, gate.id);
              return (
                <li key={gate.id}>
                  <label className={css.switchLabel}>
                    <input type="checkbox" checked={Boolean(gates[gate.id])} disabled={!unlocked} autoComplete="off" onChange={(event) => confirmGate(gate.id, event.target.checked)} />
                    Gate {gate.id} — {gate.name}
                  </label>
                  {!unlocked ? <p className={css.blockNote}>Locked until Gates A–F and Professional Behaviour are complete.</p> : null}
                </li>
              );
            })}
          </ul>
        </details>
        <details className={css.disclosure}>
          <summary>Professional behaviour {professional ? "✓" : "(required before customer contact)"}</summary>
          <ul className={css.checkList}>
            {PROFESSIONAL_BEHAVIOUR.map((item, i) => (
              <CheckItem key={item} checked={Boolean(checks[`pro:${i}`])} onChange={() => toggleBehaviour(i)}>
                {item}
              </CheckItem>
            ))}
          </ul>
        </details>
      </section>

      <DataControls />
    </div>
  );
}
