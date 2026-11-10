"use client";
// Runs a mission: guided steps, a goal per step, hints revealed one at a
// time, checks with per-criterion feedback, retries, and a completion state.
// Progress (which steps are done) is kept in this browser only.
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, Check, CheckCircle2, Lightbulb, RefreshCw, XCircle } from "lucide-react";
import type { Level, TutorialRef } from "@/app/space/academy/data/curriculum";
import { LEVELS } from "@/app/space/academy/data/curriculum";
import type { MissionMeta } from "@/app/space/academy/data/missions";
import { saveMissionProgress, useMissionProgress } from "../store";
import { academyEvent } from "../analytics";
import styles from "./lesson.module.css";

export interface CheckResult {
  pass: boolean;
  messages: { pass: boolean; text: string }[];
}

export interface LessonStep {
  id: string;
  title: string;
  goal: string;
  content: ReactNode;
  hints: string[];
  /** Without a check, the step completes when the learner continues. */
  check?: () => CheckResult;
  checkLabel?: string;
  /** Shown once the step passes. */
  success?: string;
}

interface Props {
  mission: MissionMeta;
  level: Level;
  steps: LessonStep[];
  viewer: ReactNode;
  stepIndex: number;
  onStepChange: (index: number) => void;
  /** Resets the mission's own design state. */
  onReplay: () => void;
  learned: string[];
  next?: { href: string; label: string };
  related: TutorialRef[];
}

export default function LessonShell({ mission, level, steps, viewer, stepIndex, onStepChange, onReplay, learned, next, related }: Props) {
  const progress = useMissionProgress(mission.slug);
  const [hintsShown, setHintsShown] = useState<Record<string, number>>({});
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ step: string; result: CheckResult } | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const panelRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  const step = steps[stepIndex];
  const done = new Set(progress.completed);
  const firstOpen = steps.findIndex((s) => !done.has(s.id));
  const reachable = firstOpen === -1 ? steps.length - 1 : firstOpen;
  const stepPassed = done.has(step.id) || (result?.step === step.id && result.result.pass);
  const shownHints = hintsShown[step.id] ?? 0;
  const tries = attempts[step.id] ?? 0;
  const completedCount = steps.filter((s) => done.has(s.id)).length;

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    academyEvent("lesson_start", { mission: mission.slug, level });
  }, [mission.slug, level]);

  useEffect(() => {
    academyEvent("lesson_step_view", { mission: mission.slug, step: steps[stepIndex].id, level });
    // Only when the step changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const save = (completed: string[], finished: boolean, extraHints = 0) =>
    saveMissionProgress(mission.slug, { completed, finished, hintsUsed: progress.hintsUsed + extraHints });

  const goTo = (i: number) => {
    setResult(null);
    setShowCompletion(false);
    onStepChange(i);
    requestAnimationFrame(() => panelRef.current?.focus());
  };

  const complete = () => {
    const completed = Array.from(new Set([...progress.completed, step.id]));
    const finished = steps.every((s) => completed.includes(s.id));
    save(completed, finished);
    academyEvent("lesson_step_complete", { mission: mission.slug, step: step.id, level, attempts: tries + 1, hints: shownHints });
    if (finished && !progress.finished) academyEvent("lesson_complete", { mission: mission.slug, level, hints: progress.hintsUsed });
    return finished;
  };

  const runCheck = () => {
    if (!step.check) return;
    const r = step.check();
    setResult({ step: step.id, result: r });
    setAttempts((a) => ({ ...a, [step.id]: (a[step.id] ?? 0) + 1 }));
    academyEvent("lesson_check", { mission: mission.slug, step: step.id, level, result: r.pass ? "pass" : "fail", attempt: tries + 1 });
    if (r.pass) complete();
  };

  const advance = () => {
    if (!step.check && !done.has(step.id)) complete();
    if (stepIndex < steps.length - 1) goTo(stepIndex + 1);
    else {
      setShowCompletion(true);
      requestAnimationFrame(() => panelRef.current?.focus());
    }
  };

  const showHint = () => {
    setHintsShown((h) => ({ ...h, [step.id]: Math.min(step.hints.length, (h[step.id] ?? 0) + 1) }));
    save(progress.completed, progress.finished, 1);
    academyEvent("lesson_hint", { mission: mission.slug, step: step.id, level, hint: shownHints + 1 });
  };

  const replay = () => {
    saveMissionProgress(mission.slug, null);
    setHintsShown({});
    setAttempts({});
    setResult(null);
    setShowCompletion(false);
    onReplay();
    onStepChange(0);
    academyEvent("lesson_reset", { mission: mission.slug, level });
  };

  const finishedView = showCompletion;
  const current = result?.step === step.id ? result.result : null;

  return (
    <div className={styles.lesson}>
      <div className={styles.progressBar}>
        <div className={styles.progressMeta}>
          <span>
            Mission {mission.number} · {LEVELS[level].label}
          </span>
          <span>
            {completedCount} of {steps.length} steps complete
          </span>
        </div>
        <div className={styles.progressTrack} role="progressbar" aria-label="Mission progress" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={completedCount}>
          <div className={styles.progressFill} style={{ width: `${(completedCount / steps.length) * 100}%` }} />
        </div>
        <ol className={styles.stepper} aria-label="Mission steps">
          {steps.map((s, i) => {
            const isDone = done.has(s.id);
            const locked = i > reachable;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={styles.stepButton}
                  aria-current={i === stepIndex && !finishedView ? "step" : undefined}
                  data-done={isDone || undefined}
                  disabled={locked}
                  onClick={() => goTo(i)}
                  title={locked ? "Complete the earlier steps first" : s.title}
                >
                  <span className={styles.stepDot} aria-hidden="true">
                    {isDone ? <Check size={13} /> : i + 1}
                  </span>
                  <span className={styles.stepName}>{s.title}</span>
                  <span className={styles.srOnly}>{isDone ? " (complete)" : locked ? " (locked)" : ""}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={styles.layout}>
        <div className={styles.viewerCol}>{viewer}</div>

        <section className={styles.panel} aria-labelledby="lesson-step-title">
          {finishedView ? (
            <div className={styles.completion}>
              <Award size={40} className={styles.completionIcon} aria-hidden />
              <h2 id="lesson-step-title" ref={panelRef} tabIndex={-1} className={styles.stepTitle}>
                Mission complete: {mission.title}
              </h2>
              <p className={styles.goal}>
                You finished all {steps.length} steps at the {LEVELS[level].name} level{progress.hintsUsed ? `, using ${progress.hintsUsed} hint${progress.hintsUsed === 1 ? "" : "s"}` : " without hints"}. Your progress is saved in this browser.
              </p>
              <h3 className={styles.subhead}>What you practised</h3>
              <ul className={styles.learned}>
                {learned.map((l) => (
                  <li key={l}>
                    <CheckCircle2 size={16} aria-hidden /> {l}
                  </li>
                ))}
              </ul>
              <div className={styles.actions}>
                {next && (
                  <Link href={next.href} className={styles.primary} data-track-event="lesson_next_mission_click" data-track-mission={mission.slug}>
                    {next.label} <ArrowRight size={16} aria-hidden />
                  </Link>
                )}
                <button type="button" className={styles.secondary} onClick={replay}>
                  <RefreshCw size={16} aria-hidden /> Replay mission
                </button>
                {level === "foundation" && (
                  <span className={styles.nudge}>Ready for more? Switch to Ages 17–18 above for the Advanced version.</span>
                )}
              </div>
              {related.length > 0 && (
                <>
                  <h3 className={styles.subhead}>Keep exploring</h3>
                  <ul className={styles.related}>
                    {related.map((t) => (
                      <li key={t.href}>
                        <Link href={t.href}>{t.label}</Link>
                        <span>{t.note}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <>
              {progress.finished && (
                <p className={styles.returning}>
                  <Award size={16} aria-hidden /> You completed this mission in this browser.{" "}
                  <button type="button" className={styles.linkButton} onClick={() => setShowCompletion(true)}>
                    See the summary
                  </button>{" "}
                  or{" "}
                  <button type="button" className={styles.linkButton} onClick={replay}>
                    replay it
                  </button>
                  .
                </p>
              )}
              <div className={styles.stepKicker}>
                Step {stepIndex + 1} of {steps.length}
              </div>
              <h2 id="lesson-step-title" ref={panelRef} tabIndex={-1} className={styles.stepTitle}>
                {step.title}
              </h2>
              <p className={styles.goal}>
                <strong>Goal: </strong>
                {step.goal}
              </p>
              <div className={styles.stepBody}>{step.content}</div>

              {shownHints > 0 && (
                <ol className={styles.hints} aria-label="Hints">
                  {step.hints.slice(0, shownHints).map((h) => (
                    <li key={h}>
                      <Lightbulb size={15} aria-hidden /> {h}
                    </li>
                  ))}
                </ol>
              )}

              <div className={styles.feedback} aria-live="polite">
                {current && (
                  <div className={styles.result} data-pass={current.pass}>
                    <p className={styles.resultTitle}>
                      {current.pass ? <CheckCircle2 size={18} aria-hidden /> : <XCircle size={18} aria-hidden />}
                      {current.pass ? step.success ?? "Check passed." : `Not yet${tries > 1 ? ` (attempt ${tries})` : ""}. Adjust and try again.`}
                    </p>
                    <ul>
                      {current.messages.map((m) => (
                        <li key={m.text} data-pass={m.pass}>
                          {m.pass ? <Check size={14} aria-label="Passed" /> : <XCircle size={14} aria-label="Not passed" />} {m.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                {stepIndex > 0 && (
                  <button type="button" className={styles.ghost} onClick={() => goTo(stepIndex - 1)}>
                    <ArrowLeft size={16} aria-hidden /> Back
                  </button>
                )}
                {step.check && !stepPassed && (
                  <button type="button" className={styles.primary} onClick={runCheck}>
                    {step.checkLabel ?? "Check"}
                  </button>
                )}
                {(!step.check || stepPassed) && (
                  <button type="button" className={styles.primary} onClick={advance}>
                    {stepIndex < steps.length - 1 ? "Next step" : "Finish mission"} <ArrowRight size={16} aria-hidden />
                  </button>
                )}
                {step.hints.length > 0 && shownHints < step.hints.length && !stepPassed && (
                  <button type="button" className={styles.secondary} onClick={showHint} data-emphasis={tries >= 2 || undefined}>
                    <Lightbulb size={16} aria-hidden /> {shownHints === 0 ? "Show a hint" : "Another hint"}
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
