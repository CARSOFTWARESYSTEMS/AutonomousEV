"use client";
// One day as five short cards: Today (with why it matters), Do, Ask, Don't
// and Result. Phones show one card at a time with one action (Start, Next,
// Complete Day); from 1024px the day reads top to bottom, Result below it on
// laptops and beside it from 1440px. Tools appear inside the card that needs them, once their
// day has come (UNLOCKS); mentor checks and reviews appear only on their day.
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { trackRevenue } from "../analytics";
import { DONT_ASK, GATES, INLINE_TOOLS, PROFESSIONAL_BEHAVIOUR, ROUTES, TOOL_LINKS, TOTAL_DAYS, WEEKS, isReviewDay, isUnlocked, weekOf } from "../data/framework";
import { stepNo, stepOfDay } from "../data/steps";
import { missionFor } from "../logic/missions";
import { gateUnlocked, useRevenue } from "../state/store";
import type { Mission } from "../types";
import { Badge } from "../ui/badges";
import { CheckItem, List, Notice, TextArea } from "../ui/controls";
import css from "../app.module.css";
import StepRail from "./StepRail";

// Tools that only some days use load when their day opens.
const loading = () => (
  <p className={css.loading} role="status">
    Loading…
  </p>
);
const RoiCalculator = dynamic(() => import("../case/RoiCalculator"), { loading });
const QuestionPicker = dynamic(() => import("../accounts/QuestionPicker"), { loading });
const ClaimChecker = dynamic(() => import("../case/ClaimChecker"), { loading });
const WeeklyReview = dynamic(() => import("./WeeklyReview"), { loading });
const Boardroom = dynamic(() => import("./Boardroom"), { loading });

export const CARDS = [
  { id: "today", label: "Today", question: "What are we learning?" },
  { id: "do", label: "Do", question: "What exactly should I do?" },
  { id: "ask", label: "Ask", question: "What should I ask?" },
  { id: "dont", label: "Don't", question: "What should I avoid?" },
  { id: "result", label: "Result", question: "What should I have when I finish?" },
] as const;

const LAST = CARDS.length - 1;

const REFLECTION = [
  { key: "before", label: "Before — what did I believe?" },
  { key: "evidence", label: "Evidence — what did I learn?" },
  { key: "change", label: "Change — what assumption changed?" },
  { key: "tomorrow", label: "Tomorrow — what will I do differently?" },
] as const;

/** The tools a day names that are open on that day, less those Today shows itself (the ROI calculator opens in Do). */
const toolsFor = (mission: Mission) =>
  (mission.tools ?? []).filter((tool) => tool !== "roi" && !INLINE_TOOLS.includes(tool) && (!TOOL_LINKS[tool].unlock || isUnlocked(TOOL_LINKS[tool].unlock!, mission.day)));

export default function DayView({ onDayChange }: { onDayChange: (day: number) => void }) {
  const day = useRevenue((state) => state.day);
  const card = useRevenue((state) => Math.min(LAST, state.stages[state.day] ?? 0));
  const completed = useRevenue((state) => state.completed);
  const checks = useRevenue((state) => state.checks);
  const reflection = useRevenue((state) => state.reflections[state.day]);
  const gates = useRevenue((state) => state.gates);
  const professional = useRevenue((state) => state.professional);
  const challenges = useRevenue((state) => state.challenges);
  const setStage = useRevenue((state) => state.setStage);
  const toggleCheck = useRevenue((state) => state.toggleCheck);
  const setReflection = useRevenue((state) => state.setReflection);
  const completeDay = useRevenue((state) => state.completeDay);
  const setGate = useRevenue((state) => state.setGate);
  const setProfessional = useRevenue((state) => state.setProfessional);
  const setChallenge = useRevenue((state) => state.setChallenge);
  const headings = useRef<(HTMLElement | null)[]>([]);
  const moved = useRef(false);

  const mission = missionFor(day);
  const step = stepOfDay(day);
  const week = weekOf(day);
  const done = Boolean(completed[day]);
  const tools = toolsFor(mission);
  const gatesToday = GATES.filter((gate) => gate.day === day);
  const doneCount = Object.keys(completed).length;

  const submitMissing = mission.submit.filter((_, i) => !checks[`${day}:submit:${i}`]).length;
  const reflectionMissing = Boolean(mission.customerFacing) && REFLECTION.some(({ key }) => !reflection?.[key]?.trim());
  const ready = submitMissing === 0 && !reflectionMissing;

  // On phones, bring the new card's heading into view and give it focus — but not on first render.
  useEffect(() => {
    if (!moved.current) return;
    const heading = headings.current[card];
    if (!heading) return;
    heading.focus({ preventScroll: true });
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [card, day]);

  const go = (next: number) => {
    moved.current = true;
    setStage(day, next);
    trackRevenue("mission_step_view", { day: String(day), step: CARDS[next].id });
  };

  const complete = () => {
    if (!ready) return;
    completeDay(day, true);
    trackRevenue("evidence_submit", { day: String(day) });
    trackRevenue("daily_mission_complete", { day: String(day) });
  };

  const toggleBehaviour = (i: number) => {
    toggleCheck(`pro:${i}`);
    setProfessional(PROFESSIONAL_BEHAVIOUR.every((_, j) => (j === i ? !checks[`pro:${i}`] : checks[`pro:${j}`])));
  };

  /** A card's name and, on phones, its position. */
  const kicker = (index: number) => (
    <p className={css.cardKicker}>
      <span>{CARDS[index].label}</span>
      <span className={css.cardOf} aria-hidden="true">
        {index + 1} / {CARDS.length}
      </span>
    </p>
  );

  /** A card's heading is its question. Focusable, so a phone can move focus to the card it opens. */
  const heading = (index: number) => (
    <h2
      id={`rv-card-${CARDS[index].id}`}
      className={css.cardTitle}
      tabIndex={-1}
      ref={(node) => {
        headings.current[index] = node;
      }}
    >
      {CARDS[index].question}
    </h2>
  );

  /** Back and Next on phones; hidden from 1024px, where every card is open. */
  const cardNav = (index: number) => (
    <div className={css.cardNav}>
      <button type="button" className={css.ghostButton} onClick={() => go(index - 1)}>
        ← Back
      </button>
      <button type="button" className={css.primaryButton} onClick={() => go(index + 1)}>
        Next →
      </button>
    </div>
  );

  const cardProps = (index: number) => ({
    className: css.card,
    "data-card": CARDS[index].id,
    "data-active": card === index ? "" : undefined,
    "aria-labelledby": `rv-card-${CARDS[index].id}`,
  });

  return (
    <div className={css.day} data-card={card}>
      <div className={css.cardProgress} aria-hidden="true">
        <span style={{ width: `${((card + 1) / CARDS.length) * 100}%` }} />
      </div>

      <article className={css.dayMain} aria-labelledby="rv-card-today">
        <header {...cardProps(0)}>
          <p className={css.dayCount}>
            Day {stepNo(day)} <span>/ {TOTAL_DAYS}</span>
            <span className={css.dayStep}>
              {" "}
              · Step {stepNo(step.n)} {step.short}
            </span>
          </p>
          {kicker(0)}
          <h1
            id="rv-card-today"
            className={css.dayTitle}
            tabIndex={-1}
            ref={(node) => {
              headings.current[0] = node;
            }}
          >
            {mission.title}
          </h1>
          <p className={css.dayToday}>{mission.mission}</p>
          {done ? <Badge tone="green">Completed</Badge> : null}
          <div className={css.why}>
            <p className={css.cardKicker}>
              <span>Why</span>
            </p>
            <h2 className={css.whyTitle}>Why does it matter?</h2>
            <p className={css.cardText}>{mission.why}</p>
            <details className={css.disclosure}>
              <summary>Learn More</summary>
              <p className={css.keyLine}>{mission.key}</p>
              <p>{mission.learn}</p>
              <h3 className={css.blockTitle}>Apply to FAI</h3>
              <p>{mission.applyFai}</p>
            </details>
          </div>
          <div className={css.cardStart}>
            <button type="button" className={css.primaryButton} onClick={() => go(1)}>
              Start →
            </button>
          </div>
        </header>

        <section {...cardProps(1)}>
          {kicker(1)}
          {heading(1)}
          <ol className={css.checkList}>
            {mission.doToday.map((item, i) => (
              <CheckItem key={i} checked={Boolean(checks[`${day}:do:${i}`])} onChange={() => toggleCheck(`${day}:do:${i}`)}>
                <span className={css.stepNo}>{i + 1}.</span> {item}
              </CheckItem>
            ))}
          </ol>
          {tools.length ? (
            <p className={css.toolLinks}>
              <span>Use:</span>
              {tools.map((tool) => (
                <Link key={tool} href={TOOL_LINKS[tool].href} className={css.chipLink}>
                  {TOOL_LINKS[tool].label}
                </Link>
              ))}
            </p>
          ) : null}
          {mission.tools?.includes("roi") ? (
            <details className={css.disclosure}>
              <summary>ROI calculator</summary>
              <RoiCalculator />
            </details>
          ) : null}
          {cardNav(1)}
        </section>

        <section {...cardProps(2)}>
          {kicker(2)}
          {heading(2)}
          {mission.askNote ? <Notice tone="warn">{mission.askNote}</Notice> : null}
          <List items={mission.ask} />
          <div>
            <h3 className={css.blockTitle} data-tone="warn">
              Don&apos;t ask yet
            </h3>
            <List items={DONT_ASK} />
          </div>
          {day >= 10 ? (
            <>
              <Link href={`${ROUTES.sales}#meeting-guide`} className={css.inlineLink}>
                Customer Meeting Guide →
              </Link>
              <details className={css.disclosure}>
                <summary>More questions for your meeting</summary>
                <QuestionPicker />
              </details>
            </>
          ) : null}
          {cardNav(2)}
        </section>

        <section {...cardProps(3)}>
          {kicker(3)}
          {heading(3)}
          <List items={mission.dont} />
          {isUnlocked("outreach", day) ? (
            <details className={css.disclosure}>
              <summary>Check a message before you send it</summary>
              <ClaimChecker />
            </details>
          ) : null}
          {cardNav(3)}
        </section>
      </article>

      <aside {...cardProps(4)} className={`${css.card} ${css.result}`}>
        {kicker(4)}
        {heading(4)}
        <p className={css.resultOutput}>{mission.output}</p>
        <ul className={css.checkList} aria-label="Tick when you have it">
          {mission.submit.map((item, i) => (
            <CheckItem key={i} checked={Boolean(checks[`${day}:submit:${i}`])} onChange={() => toggleCheck(`${day}:submit:${i}`)}>
              {item}
            </CheckItem>
          ))}
        </ul>

        {gatesToday.length ? (
          <div className={css.resultBlock}>
            <h3 className={css.blockTitle}>Mentor check</h3>
            <ul className={css.checkList}>
              {gatesToday.map((gate) => (
                <CheckItem
                  key={gate.id}
                  checked={Boolean(gates[gate.id])}
                  disabled={!gateUnlocked({ gates, professional }, gate.id)}
                  onChange={(value) => {
                    setGate(gate.id, value);
                    if (value) trackRevenue("mentor_gate_complete", { gate: gate.id.toLowerCase() });
                  }}
                >
                  <strong>
                    Gate {gate.id} — {gate.name}.
                  </strong>{" "}
                  {gate.criterion}
                </CheckItem>
              ))}
            </ul>
            {gatesToday.some((gate) => gate.requires) ? (
              <details className={css.disclosure}>
                <summary>Professional behaviour ({PROFESSIONAL_BEHAVIOUR.filter((_, i) => checks[`pro:${i}`]).length} / {PROFESSIONAL_BEHAVIOUR.length})</summary>
                <ul className={css.checkList}>
                  {PROFESSIONAL_BEHAVIOUR.map((item, i) => (
                    <CheckItem key={item} checked={Boolean(checks[`pro:${i}`])} onChange={() => toggleBehaviour(i)}>
                      {item}
                    </CheckItem>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}

        {mission.customerFacing ? (
          <div className={css.resultBlock}>
            <h3 className={css.blockTitle}>What changed my mind?</h3>
            <p className={css.blockNote}>Required today: you spoke with, or prepared for, customers.</p>
            <div className={css.formGrid}>
              {REFLECTION.map(({ key, label }) => (
                <TextArea key={key} label={label} rows={2} required value={reflection?.[key] ?? ""} onChange={(value) => setReflection(day, { [key]: value })} />
              ))}
            </div>
          </div>
        ) : null}

        {isReviewDay(day) ? (
          <details className={css.disclosure}>
            <summary>Weekly review — due today</summary>
            <p className={css.challenge}>
              <span className={css.blockTitle}>Weekly Business Challenge</span> {WEEKS[week - 1].challenge}
            </p>
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
            <WeeklyReview week={week} />
          </details>
        ) : null}

        {day >= 59 ? (
          <details className={css.disclosure}>
            <summary>Final review</summary>
            <Boardroom />
          </details>
        ) : null}

        <details className={css.disclosure}>
          <summary>Check your work</summary>
          <List items={mission.selfReview} />
        </details>

        {done ? (
          <div className={css.stack}>
            <p className={css.success} role="status">
              Day {day} is complete.
            </p>
            {day < TOTAL_DAYS ? (
              <div className={css.nextCard}>
                <p className={css.eyebrow}>Next · Day {day + 1}</p>
                <p className={css.nextTitle}>{missionFor(day + 1).title}</p>
                <button type="button" className={css.primaryButton} onClick={() => onDayChange(day + 1)}>
                  Start Day {day + 1} →
                </button>
              </div>
            ) : null}
            <button type="button" className={css.ghostButton} onClick={() => completeDay(day, false)}>
              Reopen Day {day}
            </button>
          </div>
        ) : (
          <div className={css.stack}>
            {ready ? null : (
              <ul className={css.requirements}>
                {submitMissing ? <li>{`Tick ${submitMissing} more result${submitMissing === 1 ? "" : "s"} above`}</li> : null}
                {reflectionMissing ? <li>Answer the four questions in “What changed my mind?”</li> : null}
              </ul>
            )}
            <button type="button" className={css.primaryButton} aria-disabled={!ready} onClick={complete}>
              Complete Day {day} →
            </button>
            <p className={css.blockNote}>{mission.next}</p>
          </div>
        )}

        <div className={css.cardNav} data-last="">
          <button type="button" className={css.ghostButton} onClick={() => go(LAST - 1)}>
            ← Back
          </button>
        </div>

        <div className={css.progress}>
          <p className={css.progressText}>
            <span className={css.tabular}>{doneCount}</span> of {TOTAL_DAYS} days complete
          </p>
          <span className={css.progressBar} aria-hidden="true">
            <span style={{ width: `${(doneCount / TOTAL_DAYS) * 100}%` }} />
          </span>
        </div>
      </aside>

      <div className={css.dayRail}>
        <StepRail onDayChange={onDayChange} />
      </div>
    </div>
  );
}
