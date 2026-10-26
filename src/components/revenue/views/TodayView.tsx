"use client";
// Today's Mission: one day of the programme, in the same template every day —
// mission, why, learn, apply to FAI, do, ask, don't, evidence, submit,
// self-review, gate, reflection and what unlocks next.
import { useEffect, useId } from "react";
import { trackRevenue } from "../analytics";
import { TOTAL_DAYS, VIEW_LABEL, isReviewDay } from "../data/framework";
import { MISSIONS } from "../data/missions";
import { missionFor, phaseOf, weekInfo, weekOf } from "../logic/missions";
import { useRevenue } from "../state/store";
import { Badge } from "../ui/badges";
import { CheckItem, List, Notice, TextArea } from "../ui/controls";
import { ViewLink, useGo } from "../workspace/nav";
import css from "../workspace.module.css";

const REFLECTION = [
  { key: "before", label: "Before — what did I believe?" },
  { key: "evidence", label: "Evidence — what did I learn?" },
  { key: "change", label: "Change — what assumption changed?" },
  { key: "tomorrow", label: "Tomorrow — what will I do differently?" },
] as const;

const JUMPS = [
  ["rv-do", "Do"],
  ["rv-ask", "Ask"],
  ["rv-dont", "Don't"],
  ["rv-evidence", "Evidence"],
  ["rv-submit", "Submit"],
  ["rv-reflect", "Reflect"],
] as const;

/** Scrolls to a section of the mission and moves focus there, for one-handed use on a phone. */
function jump(id: string) {
  const section = document.getElementById(id)?.closest("section");
  if (!section) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  section.setAttribute("tabindex", "-1");
  section.focus({ preventScroll: true });
}

export default function TodayView() {
  const go = useGo();
  const jumpId = useId();
  const day = useRevenue((state) => state.day);
  const completed = useRevenue((state) => state.completed);
  const checks = useRevenue((state) => state.checks);
  const reflection = useRevenue((state) => state.reflections[state.day]);
  const toggleCheck = useRevenue((state) => state.toggleCheck);
  const setReflection = useRevenue((state) => state.setReflection);
  const completeDay = useRevenue((state) => state.completeDay);

  const mission = missionFor(day);
  const week = weekInfo(day);
  const phase = phaseOf(day);
  const done = Boolean(completed[day]);

  useEffect(() => {
    trackRevenue("daily_mission_view", { day: String(day) });
  }, [day]);

  const submitMissing = mission.submit.filter((_, i) => !checks[`${day}:submit:${i}`]);
  const reflectionMissing = mission.customerFacing && REFLECTION.some(({ key }) => !reflection?.[key]?.trim());
  const ready = submitMissing.length === 0 && !reflectionMissing;

  const complete = () => {
    if (!ready) return;
    completeDay(day, true);
    trackRevenue("evidence_submit", { day: String(day) });
    trackRevenue("daily_mission_complete", { day: String(day) });
  };

  return (
    <article className={css.mission} aria-labelledby="rv-mission-title">
      <header className={css.missionHead}>
        <div className={css.missionDay}>
          <p className={css.dayNumber}>
            <span className={css.dayLabel}>Day</span> {String(day).padStart(2, "0")}
          </p>
          <p className={css.missionContext}>
            Week {weekOf(day)} · {week.theme}
            <br />
            Phase {phase.n} · {phase.name}
          </p>
        </div>
        <div className={css.dayNav}>
          <button type="button" className={css.ghostButton} disabled={day <= 1} onClick={() => go("today", { day: day - 1 })} aria-label={`Previous day, Day ${day - 1}`}>
            ← Day {Math.max(1, day - 1)}
          </button>
          <label htmlFor={jumpId} className={css.srOnly}>
            Jump to a day
          </label>
          <select id={jumpId} className={css.select} value={day} autoComplete="off" onChange={(event) => go("today", { day: Number(event.target.value) })}>
            {MISSIONS.map((m) => (
              <option key={m.day} value={m.day}>
                Day {m.day} — {m.title}
                {completed[m.day] ? " ✓" : ""}
              </option>
            ))}
          </select>
          <button type="button" className={css.ghostButton} disabled={day >= TOTAL_DAYS} onClick={() => go("today", { day: day + 1 })} aria-label={`Next day, Day ${day + 1}`}>
            Day {Math.min(TOTAL_DAYS, day + 1)} →
          </button>
        </div>
      </header>

      <p className={css.eyebrow}>Today&apos;s Mission</p>
      <h2 id="rv-mission-title" className={css.missionTitle} tabIndex={-1}>
        {mission.title}
      </h2>
      <p className={css.missionOutcome}>{mission.mission}</p>
      <div className={css.missionMeta}>
        <Badge tone="cyan">Output: {mission.output}</Badge>
        {mission.customerFacing ? <Badge tone="amber">Customer-facing · reflection required</Badge> : <Badge>Internal preparation</Badge>}
        {done ? <Badge tone="green">Completed {completed[day]}</Badge> : null}
      </div>
      {mission.tools?.length ? (
        <p className={css.toolLinks}>
          <span>Use:</span>
          {mission.tools.map((tool) => (
            <ViewLink key={tool} view={tool} className={css.chipLink}>
              {VIEW_LABEL[tool]}
            </ViewLink>
          ))}
        </p>
      ) : null}

      <nav className={css.jumpRow} aria-label="Sections of today's mission">
        {JUMPS.map(([id, label]) => (
          <button key={id} type="button" className={css.chip} onClick={() => jump(id)}>
            {label}
          </button>
        ))}
      </nav>

      {isReviewDay(day) ? (
        <Notice tone="warn">
          <strong>Friday review due.</strong> Complete this week&apos;s CEO / CMO / CSO review with evidence links.{" "}
          <ViewLink view="review">Open Weekly Review</ViewLink>
        </Notice>
      ) : null}

      <div className={css.missionGrid}>
        <section className={css.block} aria-labelledby="rv-why">
          <h3 id="rv-why" className={css.blockTitle}>
            Why it matters
          </h3>
          <p>{mission.why}</p>
        </section>
        <section className={css.block} aria-labelledby="rv-learn">
          <h3 id="rv-learn" className={css.blockTitle}>
            Learn
          </h3>
          <p>{mission.learn}</p>
        </section>
        <section className={css.block} data-tone="accent" aria-labelledby="rv-apply">
          <h3 id="rv-apply" className={css.blockTitle}>
            Apply to FAI
          </h3>
          <p>{mission.applyFai}</p>
        </section>

        <section className={css.block} data-span="" aria-labelledby="rv-do">
          <h3 id="rv-do" className={css.blockTitle}>
            Do today
          </h3>
          <ol className={css.checkList}>
            {mission.doToday.map((item, i) => (
              <CheckItem key={i} checked={Boolean(checks[`${day}:do:${i}`])} onChange={() => toggleCheck(`${day}:do:${i}`)}>
                <span className={css.stepNo}>{i + 1}.</span> {item}
              </CheckItem>
            ))}
          </ol>
        </section>

        <section className={css.block} aria-labelledby="rv-ask">
          <h3 id="rv-ask" className={css.blockTitle}>
            Ask the customer
          </h3>
          {mission.askNote ? <p className={css.blockNote}>{mission.askNote}</p> : null}
          <List items={mission.ask} />
          <a
            href="#questions"
            className={css.inlineLink}
            onClick={(event) => {
              event.preventDefault();
              trackRevenue("ask_customer_open", { day: String(day) });
              go("questions");
            }}
          >
            Build a meeting question set →
          </a>
        </section>

        <section className={css.block} data-tone="warn" aria-labelledby="rv-dont">
          <h3 id="rv-dont" className={css.blockTitle}>
            Don&apos;t
          </h3>
          <List items={mission.dont} />
          <a
            href="#evidence"
            className={css.inlineLink}
            onClick={(event) => {
              event.preventDefault();
              trackRevenue("dont_open", { day: String(day) });
              go("evidence");
            }}
          >
            Full DON&apos;T library and claim checker →
          </a>
        </section>

        <section className={css.block} aria-labelledby="rv-evidence">
          <h3 id="rv-evidence" className={css.blockTitle}>
            Evidence to collect
          </h3>
          <List items={mission.evidence} />
        </section>

        <section className={css.block} aria-labelledby="rv-submit">
          <h3 id="rv-submit" className={css.blockTitle}>
            Submit / record
          </h3>
          <ul className={css.checkList}>
            {mission.submit.map((item, i) => (
              <CheckItem key={i} checked={Boolean(checks[`${day}:submit:${i}`])} onChange={() => toggleCheck(`${day}:submit:${i}`)}>
                {item}
              </CheckItem>
            ))}
          </ul>
        </section>

        <section className={css.block} aria-labelledby="rv-review">
          <h3 id="rv-review" className={css.blockTitle}>
            Self-review
          </h3>
          <List items={mission.selfReview} />
        </section>

        {mission.gate ? (
          <section className={css.block} data-tone="gate" aria-labelledby="rv-gate">
            <h3 id="rv-gate" className={css.blockTitle}>
              Mentor gate
            </h3>
            <p>{mission.gate}</p>
            <ViewLink view="internship" className={css.inlineLink}>
              Gates and approvals →
            </ViewLink>
          </section>
        ) : null}

        <section className={css.block} data-span="" aria-labelledby="rv-reflect">
          <h3 id="rv-reflect" className={css.blockTitle}>
            What changed my mind?
          </h3>
          <p className={css.blockNote}>{mission.customerFacing ? "Required today: this is a customer-facing day." : "Optional today; required on every customer-facing day."}</p>
          <div className={css.formGrid}>
            {REFLECTION.map(({ key, label }) => (
              <TextArea key={key} label={label} rows={2} required={mission.customerFacing} value={reflection?.[key] ?? ""} onChange={(value) => setReflection(day, { [key]: value })} />
            ))}
          </div>
        </section>

        <section className={css.block} data-span="" data-tone="next" aria-labelledby="rv-next">
          <h3 id="rv-next" className={css.blockTitle}>
            Next
          </h3>
          <p>{mission.next}</p>
          {done ? (
            <div className={css.buttonRow}>
              <p className={css.success} role="status">
                Day {day} is complete.
              </p>
              {day < TOTAL_DAYS ? (
                <button type="button" className={css.primaryButton} onClick={() => go("today", { day: day + 1 })}>
                  Start Day {day + 1}
                </button>
              ) : null}
              <button type="button" className={css.ghostButton} onClick={() => completeDay(day, false)}>
                Reopen Day {day}
              </button>
            </div>
          ) : (
            <>
              {!ready ? (
                <div className={css.blockNote} id="rv-complete-needs">
                  To complete Day {day}:
                  <ul className={css.list}>
                    {submitMissing.length ? <li>Tick every Submit / record item ({submitMissing.length} left).</li> : null}
                    {reflectionMissing ? <li>Answer all four reflection questions.</li> : null}
                  </ul>
                </div>
              ) : null}
              <button type="button" className={css.primaryButton} aria-disabled={!ready} aria-describedby={!ready ? "rv-complete-needs" : undefined} onClick={complete}>
                Mark Day {day} complete
              </button>
            </>
          )}
        </section>
      </div>
    </article>
  );
}
