"use client";
// One day as a guided sequence: Learn → Do → Ask → Don't → Evidence →
// Review → Complete. One stage is shown at a time; the current stage carries
// the accent, finished stages a check, later stages stay quiet. Tools appear
// inside the stage that needs them, once their day has come (UNLOCKS).
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { trackRevenue } from "../analytics";
import { DONT_ASK, ROUTES, TOOL_LINKS, TOTAL_DAYS, isReviewDay, isUnlocked, phaseOf, unlockDay, weekOf } from "../data/framework";
import { missionFor, weekInfo } from "../logic/missions";
import { useRevenue } from "../state/store";
import type { Mission, ToolId } from "../types";
import { Badge } from "../ui/badges";
import { CheckItem, List, Notice, TextArea } from "../ui/controls";
import css from "../app.module.css";

// Tools that only some stages use load when their stage opens.
const loading = () => (
  <p className={css.loading} role="status">
    Loading…
  </p>
);
const RoiCalculator = dynamic(() => import("../case/RoiCalculator"), { loading });
const QuestionPicker = dynamic(() => import("../accounts/QuestionPicker"), { loading });
const ClaimChecker = dynamic(() => import("../case/ClaimChecker"), { loading });
const WeeklyReview = dynamic(() => import("./WeeklyReview"), { loading });

export const STEPS = [
  { id: "learn", label: "Learn" },
  { id: "do", label: "Do" },
  { id: "ask", label: "Ask" },
  { id: "dont", label: "Don't" },
  { id: "evidence", label: "Evidence" },
  { id: "review", label: "Review" },
  { id: "complete", label: "Complete" },
] as const;

const REFLECTION = [
  { key: "before", label: "Before — what did I believe?" },
  { key: "evidence", label: "Evidence — what did I learn?" },
  { key: "change", label: "Change — what assumption changed?" },
  { key: "tomorrow", label: "Tomorrow — what will I do differently?" },
] as const;

/** The tools a mission names that are open on its day. */
const toolsFor = (mission: Mission) => (mission.tools ?? []).filter((tool) => !TOOL_LINKS[tool].unlock || isUnlocked(TOOL_LINKS[tool].unlock!, mission.day));

function ToolChips({ tools }: { tools: readonly ToolId[] }) {
  if (!tools.length) return null;
  return (
    <p className={css.toolLinks}>
      <span>Use:</span>
      {tools.map((tool) => (
        <Link key={tool} href={TOOL_LINKS[tool].href} className={css.chipLink}>
          {TOOL_LINKS[tool].label}
        </Link>
      ))}
    </p>
  );
}

/** Which question categories fit the phase: workflow first, buying questions later. */
const QUESTION_GROUPS: Record<1 | 2 | 3, readonly string[] | undefined> = { 1: ["process", "effort", "error", "frequency"], 2: undefined, 3: undefined };

export default function MissionFlow({ onDayChange, tools: headerTools }: { onDayChange: (day: number) => void; tools?: ReactNode }) {
  const day = useRevenue((state) => state.day);
  const stage = useRevenue((state) => state.stages[state.day] ?? 0);
  const completed = useRevenue((state) => state.completed);
  const checks = useRevenue((state) => state.checks);
  const reflection = useRevenue((state) => state.reflections[state.day]);
  const setStage = useRevenue((state) => state.setStage);
  const toggleCheck = useRevenue((state) => state.toggleCheck);
  const setReflection = useRevenue((state) => state.setReflection);
  const completeDay = useRevenue((state) => state.completeDay);
  const panelHeading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const mission = missionFor(day);
  const phase = phaseOf(day);
  const week = weekInfo(day);
  const done = Boolean(completed[day]);
  const current = stage === 0 ? null : STEPS[Math.min(stage, STEPS.length) - 1];
  const tools = toolsFor(mission);

  const submitMissing = mission.submit.filter((_, i) => !checks[`${day}:submit:${i}`]).length;
  const reflectionMissing = Boolean(mission.customerFacing) && REFLECTION.some(({ key }) => !reflection?.[key]?.trim());
  const ready = submitMissing === 0 && !reflectionMissing;

  // Bring the new stage's heading into view and give it focus, but not on first render.
  useEffect(() => {
    if (!moved.current || !panelHeading.current) return;
    panelHeading.current.focus({ preventScroll: true });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panelHeading.current.closest("section")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [stage, day]);

  const go = (next: number) => {
    moved.current = true;
    setStage(day, next);
    const step = STEPS[next - 1];
    if (step) trackRevenue("mission_step_view", { day: String(day), step: step.id });
  };

  const complete = () => {
    if (!ready) return;
    completeDay(day, true);
    trackRevenue("evidence_submit", { day: String(day) });
    trackRevenue("daily_mission_complete", { day: String(day) });
  };

  const stageBody = () => {
    switch (current?.id) {
      case "learn":
        return (
          <>
            <p className={css.keyLine}>{mission.key}</p>
            <div className={css.stack}>
              <div>
                <h3 className={css.blockTitle}>Why it matters</h3>
                <p>{mission.why}</p>
              </div>
              <div className={css.applyBox}>
                <h3 className={css.blockTitle}>Apply to FAI</h3>
                <p>{mission.applyFai}</p>
              </div>
              <details className={css.disclosure}>
                <summary>Go deeper</summary>
                <p>{mission.learn}</p>
              </details>
            </div>
            <ToolChips tools={tools} />
          </>
        );
      case "do":
        return (
          <ol className={css.checkList}>
            {mission.doToday.map((item, i) => (
              <CheckItem key={i} checked={Boolean(checks[`${day}:do:${i}`])} onChange={() => toggleCheck(`${day}:do:${i}`)}>
                <span className={css.stepNo}>{i + 1}.</span> {item}
              </CheckItem>
            ))}
          </ol>
        );
      case "ask":
        return (
          <div className={css.stack}>
            <p className={css.goal}>
              <span className={css.blockTitle}>Goal</span> {phase.conversationGoal}
            </p>
            {mission.askNote ? <Notice tone="warn">{mission.askNote}</Notice> : null}
            <div>
              <h3 className={css.blockTitle}>Ask</h3>
              <List items={mission.ask} />
            </div>
            <div>
              <h3 className={css.blockTitle} data-tone="warn">
                Don&apos;t ask
              </h3>
              <List items={DONT_ASK} />
            </div>
            <details className={css.disclosure}>
              <summary>More questions for your meeting</summary>
              <QuestionPicker categories={QUESTION_GROUPS[phase.n]} />
            </details>
            {day >= 10 ? (
              <Link href={`${ROUTES.accounts}#meetings`} className={css.inlineLink}>
                Prepare a meeting →
              </Link>
            ) : null}
          </div>
        );
      case "dont":
        return (
          <div className={css.stack}>
            <List items={mission.dont} />
            {isUnlocked("outreach", day) ? (
              <ClaimChecker />
            ) : (
              <p className={css.blockNote}>
                The message checker opens on Day {unlockDay("outreach")}, when outreach begins. Until then: <Link href={`${ROUTES.caseStudy}#evidence`}>approved claims</Link>.
              </p>
            )}
          </div>
        );
      case "evidence":
        return (
          <div className={css.stack}>
            <div>
              <h3 className={css.blockTitle}>Capture</h3>
              <List items={mission.evidence} />
            </div>
            <div>
              <h3 className={css.blockTitle}>Record</h3>
              <ul className={css.checkList}>
                {mission.submit.map((item, i) => (
                  <CheckItem key={i} checked={Boolean(checks[`${day}:submit:${i}`])} onChange={() => toggleCheck(`${day}:submit:${i}`)}>
                    {item}
                  </CheckItem>
                ))}
              </ul>
            </div>
            {tools.includes("roi") ? (
              <details className={css.disclosure}>
                <summary>ROI calculator</summary>
                <RoiCalculator />
              </details>
            ) : null}
            <ToolChips tools={tools.filter((tool) => tool !== "roi")} />
          </div>
        );
      case "review":
        return (
          <div className={css.stack}>
            <div>
              <h3 className={css.blockTitle}>Is today&apos;s work good enough?</h3>
              <List items={mission.selfReview} />
            </div>
            {mission.gate ? (
              <div className={css.gateBox}>
                <h3 className={css.blockTitle}>Mentor gate</h3>
                <p>{mission.gate}</p>
                <a href="#gates" className={css.inlineLink}>
                  Gates and approvals →
                </a>
              </div>
            ) : null}
            <div>
              <h3 className={css.blockTitle}>What changed my mind?</h3>
              <p className={css.blockNote}>{mission.customerFacing ? "Required today: this is a customer-facing day." : "Optional today; required on every customer-facing day."}</p>
              <div className={css.formGrid}>
                {REFLECTION.map(({ key, label }) => (
                  <TextArea key={key} label={label} rows={2} required={mission.customerFacing} value={reflection?.[key] ?? ""} onChange={(value) => setReflection(day, { [key]: value })} />
                ))}
              </div>
            </div>
            {isReviewDay(day) ? (
              <details className={css.disclosure} open>
                <summary>Weekly CEO / CMO / CSO review — due today</summary>
                <WeeklyReview week={weekOf(day)} />
              </details>
            ) : null}
            {day >= 59 ? (
              <Link href={`${ROUTES.execution}#boardroom`} className={css.inlineLink}>
                Final boardroom checklist →
              </Link>
            ) : null}
          </div>
        );
      case "complete":
        return (
          <div className={css.stack}>
            <ul className={css.requirements}>
              <li data-ok={submitMissing === 0 ? "" : undefined}>{submitMissing === 0 ? "✓ Everything recorded" : `Record ${submitMissing} more item${submitMissing === 1 ? "" : "s"} in Evidence`}</li>
              {mission.customerFacing ? <li data-ok={!reflectionMissing ? "" : undefined}>{!reflectionMissing ? "✓ Reflection written" : "Answer the four reflection questions in Review"}</li> : null}
            </ul>
            {done ? (
              <>
                <p className={css.success} role="status">
                  Day {day} is complete.
                </p>
                {day < TOTAL_DAYS ? (
                  <div className={css.nextCard}>
                    <p className={css.eyebrow}>Next · Day {day + 1}</p>
                    <p className={css.nextTitle}>{missionFor(day + 1).title}</p>
                    <p className={css.blockNote}>{missionFor(day + 1).key}</p>
                    <button type="button" className={css.primaryButton} onClick={() => onDayChange(day + 1)}>
                      Start Day {day + 1} →
                    </button>
                  </div>
                ) : null}
                <button type="button" className={css.ghostButton} onClick={() => completeDay(day, false)}>
                  Reopen Day {day}
                </button>
              </>
            ) : (
              <>
                <p>{mission.next}</p>
                <button type="button" className={css.primaryButton} aria-disabled={!ready} onClick={complete}>
                  Complete Day {day}
                </button>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const stepIndex = current ? STEPS.indexOf(current) : -1;
  const nextStep = STEPS[stepIndex + 1];

  return (
    <article className={css.mission} aria-labelledby="rv-mission-title">
      <header className={css.missionIntro}>
        <div className={css.missionMeta}>
          <p className={css.dayCount}>
            Day {String(day).padStart(2, "0")} <span>/ {TOTAL_DAYS}</span>
          </p>
          <div className={css.dayNav}>
            {headerTools}
            <button type="button" className={css.iconButton} disabled={day <= 1} onClick={() => onDayChange(day - 1)} aria-label={`Previous day, Day ${day - 1}`}>
              ←
            </button>
            <button type="button" className={css.iconButton} disabled={day >= TOTAL_DAYS} onClick={() => onDayChange(day + 1)} aria-label={`Next day, Day ${day + 1}`}>
              →
            </button>
          </div>
        </div>
        <p className={css.eyebrow}>
          {phase.name} · Week {weekOf(day)} · {week.theme}
        </p>
        <h1 id="rv-mission-title" className={css.missionTitle}>
          {mission.title}
        </h1>
        <p className={css.missionObjective}>{mission.mission}</p>
        <div className={css.chipRow}>
          <Badge tone="cyan">Output: {mission.output}</Badge>
          {mission.customerFacing ? <Badge tone="amber">Customer-facing</Badge> : null}
          {done ? <Badge tone="green">Completed</Badge> : null}
        </div>
        {stage === 0 ? (
          <div className={css.startRow}>
            <button type="button" className={css.primaryButton} onClick={() => go(1)}>
              Start Mission →
            </button>
            <p className={css.blockNote}>{STEPS.map((step) => step.label).join(" → ")}</p>
          </div>
        ) : null}
      </header>

      {current ? (
        <>
          <ol className={css.stepper} aria-label="Today's steps">
            {STEPS.map((step, i) => {
              const state = i < stepIndex || (step.id === "complete" && done) ? "done" : i === stepIndex ? "current" : "todo";
              return (
                <li key={step.id}>
                  <button type="button" className={css.step} data-state={state} aria-current={state === "current" ? "step" : undefined} onClick={() => go(i + 1)}>
                    <span className={css.stepMark} aria-hidden="true">
                      {state === "done" ? "✓" : i + 1}
                    </span>
                    <span className={css.stepLabel}>{step.label}</span>
                    {state === "done" ? <span className={css.srOnly}> (done)</span> : null}
                  </button>
                </li>
              );
            })}
          </ol>

          <section className={css.stage} aria-labelledby="rv-stage-title">
            <h2 id="rv-stage-title" ref={panelHeading} className={css.stageTitle} tabIndex={-1}>
              {current.id === "dont" ? "Don't" : current.label}
            </h2>
            {stageBody()}
            <div className={css.stageNav}>
              {stepIndex > 0 ? (
                <button type="button" className={css.ghostButton} onClick={() => go(stepIndex)}>
                  ← {STEPS[stepIndex - 1].label}
                </button>
              ) : (
                <span />
              )}
              {nextStep ? (
                <button type="button" className={css.primaryButton} onClick={() => go(stepIndex + 2)}>
                  Next: {nextStep.label} →
                </button>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </article>
  );
}
