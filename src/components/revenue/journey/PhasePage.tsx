"use client";
// A month of the journey: its question and deliverable, then four week
// cards. Opening a week reveals its five days and the ideas it teaches;
// a day opens in Today. Only one week is open at a time.
import Link from "next/link";
import { useState } from "react";
import { CHALLENGE_LABEL, PHASES, ROUTES, phaseOf, phaseWeeks, todayHref, weekOf, type Phase } from "../data/framework";
import { LEARN } from "../data/library";
import { daysOfWeek } from "../logic/missions";
import { useRevenue } from "../state/store";
import { Badge } from "../ui/badges";
import AppShell from "../app/AppShell";
import css from "../app.module.css";
import Boardroom from "./Boardroom";
import ExecutionSignals from "./ExecutionSignals";

const CONCEPTS = [...LEARN.marketing.concepts, ...LEARN.sales.concepts, ...LEARN.revenue.concepts];
const conceptsForWeek = (week: number) => CONCEPTS.filter((concept) => weekOf(concept.days[0]) === week);

export default function PhasePage({ phase }: { phase: Phase }) {
  const day = useRevenue((state) => state.day);
  const completed = useRevenue((state) => state.completed);
  const challenges = useRevenue((state) => state.challenges);
  const weeks = phaseWeeks(phase);
  const currentWeek = weekOf(day);
  // Until the user picks a week, the open one is the week they are in (if it is in this month).
  const [chosen, setOpen] = useState<number | null | undefined>(undefined);
  const open = chosen !== undefined ? chosen : phaseOf(day).n === phase.n ? currentWeek : weeks[0].n;

  return (
    <AppShell active="journey">
      <div className={css.page}>
        <nav aria-label="Journey months" className={css.segmented}>
          {PHASES.map((item) => (
            <Link key={item.n} href={ROUTES[item.route]} className={css.segment} aria-current={item.n === phase.n ? "page" : undefined}>
              <span className={css.segmentNo}>{String(item.n).padStart(2, "0")}</span> {item.label}
            </Link>
          ))}
        </nav>

        <header className={css.pageHead}>
          <p className={css.eyebrow}>
            {String(phase.n).padStart(2, "0")} · {phase.weeks}
          </p>
          <h1 className={css.pageTitle}>{phase.name}</h1>
          <p className={css.pageLede}>{phase.question}</p>
          <p className={css.blockNote}>
            Deliverable: <strong>{phase.deliverable}</strong>
          </p>
        </header>

        {phase.route === "execution" ? <ExecutionSignals /> : null}

        <ol className={css.weekCards}>
          {weeks.map((week) => {
            const days = daysOfWeek(week.n);
            const doneCount = days.filter((mission) => completed[mission.day]).length;
            const isOpen = open === week.n;
            const concepts = conceptsForWeek(week.n);
            return (
              <li key={week.n} className={css.weekCard} data-open={isOpen ? "" : undefined} data-current={week.n === currentWeek ? "" : undefined}>
                <h2 className={css.weekHeading}>
                  <button type="button" className={css.weekToggle} aria-expanded={isOpen} aria-controls={`rv-week-${week.n}`} onClick={() => setOpen(isOpen ? null : week.n)}>
                    <span className={css.weekNo}>Week {week.n}</span>
                    <span className={css.weekTheme}>{week.theme}</span>
                    <span className={css.weekCount}>
                      {doneCount}/5{week.n === currentWeek ? " · now" : ""}
                    </span>
                  </button>
                </h2>
                <div id={`rv-week-${week.n}`} className={css.weekBody} hidden={!isOpen}>
                  <p className={css.challenge}>
                    <span className={css.contextSub}>{CHALLENGE_LABEL}</span> {week.challenge} {challenges[week.n] ? <Badge tone="green">Met</Badge> : null}
                  </p>
                  <ul className={css.dayList}>
                    {days.map((mission) => (
                      <li key={mission.day}>
                        <Link href={todayHref(mission.day)} className={css.dayLink} data-status={completed[mission.day] ? "done" : mission.day === day ? "current" : "upcoming"}>
                          <span className={css.dayBadge}>{completed[mission.day] ? "✓" : `Day ${mission.day}`}</span>
                          <span className={css.dayTitle}>
                            {mission.title}
                            {completed[mission.day] ? <span className={css.srOnly}> (complete, Day {mission.day})</span> : null}
                          </span>
                          <span className={css.dayKey}>{mission.key}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {concepts.length ? (
                    <details className={css.disclosure}>
                      <summary>Ideas this week ({concepts.length})</summary>
                      <ul className={css.conceptList}>
                        {concepts.map((concept) => (
                          <li key={concept.id}>
                            <p className={css.conceptTitle}>{concept.title}</p>
                            <p>{concept.summary}</p>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        {phase.route === "execution" ? (
          <section id="boardroom" className={css.pageSection} aria-labelledby="rv-boardroom">
            <h2 id="rv-boardroom" className={css.sectionTitle}>
              Final boardroom
            </h2>
            <p className={css.pageLede}>A management review, not a student presentation. Rate each item by the strongest evidence you can show for it.</p>
            <Boardroom />
          </section>
        ) : null}

        <div className={css.gateNote}>
          <p className={css.contextSub}>Month {phase.n} gate</p>
          <p className={css.gateStatement}>“{phase.gate}”</p>
        </div>
      </div>
    </AppShell>
  );
}
