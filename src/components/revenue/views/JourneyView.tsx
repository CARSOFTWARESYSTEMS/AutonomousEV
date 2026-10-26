"use client";
// The 12-week journey: three phases, twelve weeks, sixty days. The current
// week is open, other weeks are collapsed, and every day can be searched.
import { useId, useMemo, useState } from "react";
import { trackRevenue } from "../analytics";
import { GATES, PHASES, WEEKS, weekOf } from "../data/framework";
import { daysOfWeek, searchMissions } from "../logic/missions";
import { useRevenue } from "../state/store";
import { Badge } from "../ui/badges";
import { ViewHeader } from "../ui/controls";
import { useGo } from "../workspace/nav";
import css from "../workspace.module.css";

const QUICK = ["ROI", "ICP", "objection", "security", "pilot", "AS9102"] as const;

export default function JourneyView() {
  const go = useGo();
  const searchId = useId();
  const day = useRevenue((state) => state.day);
  const completed = useRevenue((state) => state.completed);
  const challenges = useRevenue((state) => state.challenges);
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchMissions(query), [query]);
  const currentWeek = weekOf(day);

  const search = (value: string) => {
    if (!query && value) trackRevenue("mission_search");
    setQuery(value);
  };

  return (
    <div>
      <ViewHeader
        eyebrow="Execute"
        title="12-Week Revenue Journey"
        lede="Three outcome-driven phases. Each week ends with a Founder Challenge and a Friday review; each phase ends with a gate."
      />

      <ol className={css.phaseRow}>
        {PHASES.map((phase) => {
          const first = (phase.n - 1) * 20 + 1;
          const done = Array.from({ length: 20 }, (_, i) => first + i).filter((n) => completed[n]).length;
          return (
            <li key={phase.n} className={css.phaseCard} data-current={Math.ceil(currentWeek / 4) === phase.n ? "" : undefined}>
              <p className={css.kicker}>
                Month {phase.n} · {phase.weeks}
              </p>
              <h3 className={css.panelTitle}>{phase.name}</h3>
              <p className={css.phaseQuestion}>{phase.question}</p>
              <p className={css.phaseDeliverable}>
                Deliverable: <strong>{phase.deliverable}</strong>
              </p>
              <p className={css.railMeta}>{done} of 20 days complete</p>
            </li>
          );
        })}
      </ol>

      <div className={css.searchBox}>
        <label htmlFor={searchId} className={css.label}>
          Search all 60 days
        </label>
        <input id={searchId} type="search" className={css.input} value={query} placeholder="ROI, ICP, objection, security, pilot, AS9102…" autoComplete="off" onChange={(event) => search(event.target.value)} />
        <div className={css.chipRow}>
          {QUICK.map((word) => (
            <button key={word} type="button" className={css.chip} aria-pressed={query === word} onClick={() => search(query === word ? "" : word)}>
              {word}
            </button>
          ))}
        </div>
      </div>

      {query ? (
        <section aria-labelledby="rv-search-results" className={css.searchResults}>
          <h3 id="rv-search-results" className={css.blockTitle}>
            Search results
          </h3>
          <p className={css.blockNote} role="status">
            {results.length} {results.length === 1 ? "day matches" : "days match"} “{query}”
          </p>
          <ul className={css.dayList}>
            {results.map((mission) => (
              <li key={mission.day}>
                <button type="button" className={css.dayButton} onClick={() => go("today", { day: mission.day })}>
                  <span className={css.dayBadge}>Day {mission.day}</span>
                  <span className={css.dayTitle}>{mission.title}</span>
                  <span className={css.dayOutput}>{mission.output}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className={css.weeks}>
        {WEEKS.map((week) => {
          const days = daysOfWeek(week.n);
          const doneCount = days.filter((mission) => completed[mission.day]).length;
          const gates = GATES.filter((gate) => weekOf(gate.day) === week.n);
          return (
            <details key={week.n} className={css.week} open={week.n === currentWeek}>
              <summary className={css.weekSummary}>
                <span className={css.weekNo}>Week {week.n}</span>
                <span className={css.weekTheme}>{week.theme}</span>
                <span className={css.weekCount}>
                  {doneCount}/5{doneCount === 5 ? " ✓" : ""}
                </span>
              </summary>
              <div className={css.weekBody}>
                <p className={css.challenge}>
                  <span className={css.kicker}>Founder Challenge</span> {week.challenge} {challenges[week.n] ? <Badge tone="green">Done</Badge> : null}
                </p>
                <ul className={css.dayList}>
                  {days.map((mission) => {
                    const status = completed[mission.day] ? "Completed" : mission.day === day ? "Open today" : "Upcoming";
                    return (
                      <li key={mission.day}>
                        <button
                          type="button"
                          className={css.dayButton}
                          data-status={completed[mission.day] ? "done" : mission.day === day ? "current" : "upcoming"}
                          onClick={() => go("today", { day: mission.day })}
                        >
                          <span className={css.dayBadge}>Day {mission.day}</span>
                          <span className={css.dayTitle}>{mission.title}</span>
                          <span className={css.dayOutput}>
                            {mission.output} · {status}
                            {mission.customerFacing ? " · customer-facing" : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {gates.length ? (
                  <p className={css.blockNote}>
                    Gates this week: {gates.map((gate) => `Gate ${gate.id} — ${gate.name}`).join("; ")}
                  </p>
                ) : null}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
