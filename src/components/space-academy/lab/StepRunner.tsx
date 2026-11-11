"use client";
// Runs one phase of a mission (Learn or Challenge) inside the Mission Lab's
// panel: a goal per step, a short explanation that can be read aloud, the
// maths on request, hints one at a time, checks with per-criterion feedback,
// retry, and progress kept in this browser only.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Lightbulb, RotateCcw, Sigma, XCircle } from "lucide-react";
import type { Level } from "@/app/space/academy/data/curriculum";
import type { MissionMeta } from "@/app/space/academy/data/missions";
import { saveMissionProgress, useLabSettings, useMissionProgress } from "../store";
import { academyEvent } from "../analytics";
import { ListenButton, stopSpeaking, useAutoNarration } from "./speech";
import styles from "./lab.module.css";

export interface CheckResult {
  pass: boolean;
  messages: { pass: boolean; text: string }[];
}

export interface LabStep {
  id: string;
  title: string;
  goal: string;
  /** One or two sentences: what Listen reads. Defaults to the goal. */
  say?: string;
  content: ReactNode;
  /** The optional mathematical explanation, behind "Show the maths". */
  maths?: ReactNode;
  hints: string[];
  /** Without a check, the step completes when the learner continues. */
  check?: () => CheckResult;
  checkLabel?: string;
  /** Shown once the step passes. */
  success?: string;
  /** Puts the step's own controls back to where they started ("Start this step over"). */
  onRetry?: () => void;
}

interface Props {
  mission: MissionMeta;
  level: Level;
  phase: "learn" | "challenge";
  steps: LabStep[];
  stepIndex: number;
  onStepChange: (index: number) => void;
  /** Every step id of the mission, both phases: the mission is finished when all are complete. */
  allStepIds: string[];
  /** After the last step: label and action (go to the Challenge, or to the debrief). */
  finish: { label: string; onFinish: () => void };
}

export default function StepRunner({ mission, level, phase, steps, stepIndex, onStepChange, allStepIds, finish }: Props) {
  const progress = useMissionProgress(mission.slug);
  const settings = useLabSettings();
  const [hintsShown, setHintsShown] = useState<Record<string, number>>({});
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ step: string; result: CheckResult } | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const done = new Set(progress.completed);
  const firstOpen = steps.findIndex((s) => !done.has(s.id));
  const reachable = firstOpen === -1 ? steps.length - 1 : firstOpen;
  const stepPassed = done.has(step.id) || (result?.step === step.id && result.result.pass);
  const shownHints = hintsShown[step.id] ?? 0;
  const tries = attempts[step.id] ?? 0;
  const current = result?.step === step.id ? result.result : null;
  const say = step.say ?? step.goal;

  useAutoNarration(`${mission.slug}:${step.id}:${level}`, `${step.title}. ${say}`, settings.narrate);

  useEffect(() => {
    academyEvent("lesson_step_view", { mission: mission.slug, step: step.id, level, phase });
    // Only when the step changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const save = (completed: string[], extraHints = 0) => {
    const finished = allStepIds.every((id) => completed.includes(id));
    saveMissionProgress(mission.slug, { completed, finished, hintsUsed: progress.hintsUsed + extraHints });
    return finished;
  };

  const complete = () => {
    const completed = Array.from(new Set([...progress.completed, step.id]));
    const finished = save(completed);
    academyEvent("lesson_step_complete", { mission: mission.slug, step: step.id, level, phase, attempts: tries + 1, hints: shownHints });
    if (finished && !progress.finished) academyEvent("lesson_complete", { mission: mission.slug, level, hints: progress.hintsUsed });
  };

  const goTo = (i: number) => {
    stopSpeaking();
    setResult(null);
    onStepChange(i);
    requestAnimationFrame(() => titleRef.current?.focus());
  };

  const runCheck = () => {
    if (!step.check) return;
    const r = step.check();
    setResult({ step: step.id, result: r });
    setAttempts((a) => ({ ...a, [step.id]: (a[step.id] ?? 0) + 1 }));
    academyEvent("lesson_check", { mission: mission.slug, step: step.id, level, phase, result: r.pass ? "pass" : "fail", attempt: tries + 1 });
    if (r.pass) complete();
  };

  const advance = () => {
    if (!step.check && !done.has(step.id)) complete();
    if (stepIndex < steps.length - 1) goTo(stepIndex + 1);
    else {
      stopSpeaking();
      finish.onFinish();
    }
  };

  const showHint = () => {
    setHintsShown((h) => ({ ...h, [step.id]: Math.min(step.hints.length, (h[step.id] ?? 0) + 1) }));
    save(progress.completed, 1);
    academyEvent("lesson_hint", { mission: mission.slug, step: step.id, level, phase, hint: shownHints + 1 });
  };

  const retry = () => {
    setResult(null);
    step.onRetry?.();
    academyEvent("lesson_retry", { mission: mission.slug, step: step.id, level, phase });
  };

  return (
    <div className={styles.runner}>
      <ol className={styles.dots} aria-label={phase === "learn" ? "Learn steps" : "Challenge steps"}>
        {steps.map((s, i) => {
          const isDone = done.has(s.id);
          const locked = i > reachable;
          return (
            <li key={s.id}>
              <button
                type="button"
                className={styles.dot}
                aria-current={i === stepIndex ? "step" : undefined}
                data-done={isDone || undefined}
                disabled={locked}
                onClick={() => goTo(i)}
                aria-label={`Step ${i + 1}: ${s.title}${isDone ? " (complete)" : locked ? " (locked)" : ""}`}
                title={locked ? "Complete the earlier steps first" : s.title}
              >
                {isDone ? <Check size={13} aria-hidden /> : i + 1}
              </button>
            </li>
          );
        })}
      </ol>

      <p className={styles.kicker}>
        {phase === "learn" ? "Learn" : "Challenge"} · step {stepIndex + 1} of {steps.length}
      </p>
      <h2 id="lesson-step-title" ref={titleRef} tabIndex={-1} className={styles.stepTitle}>
        {step.title}
      </h2>
      <div className={styles.goalRow}>
        <p className={styles.goal}>
          <strong>Goal: </strong>
          {step.goal}
        </p>
        <ListenButton id={`${mission.slug}:${step.id}:${level}`} text={`${step.title}. ${say}`} />
      </div>

      <div className={styles.stepBody}>{step.content}</div>

      {step.maths && (
        <details className={styles.maths} onToggle={(e) => (e.currentTarget.open ? academyEvent("lesson_maths_open", { mission: mission.slug, step: step.id, level }) : undefined)}>
          <summary>
            <Sigma size={16} aria-hidden /> Show the maths
          </summary>
          <div className={styles.mathsBody}>{step.maths}</div>
        </details>
      )}

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
              {current.pass ? step.success ?? "Check passed." : `Not yet${tries > 1 ? ` (attempt ${tries})` : ""}. Adjust and check again.`}
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
        {step.check && !stepPassed && (
          <button type="button" className={styles.primary} onClick={runCheck}>
            {step.checkLabel ?? "Check"}
          </button>
        )}
        {(!step.check || stepPassed) && (
          <button type="button" className={styles.primary} onClick={advance}>
            {stepIndex < steps.length - 1 ? "Next step" : finish.label} <ArrowRight size={16} aria-hidden />
          </button>
        )}
        {step.hints.length > 0 && shownHints < step.hints.length && !stepPassed && (
          <button type="button" className={styles.secondary} onClick={showHint} data-emphasis={tries >= 2 || undefined}>
            <Lightbulb size={16} aria-hidden /> {shownHints === 0 ? "Hint" : "Another hint"}
          </button>
        )}
        {current && !current.pass && step.onRetry && (
          <button type="button" className={styles.ghost} onClick={retry}>
            <RotateCcw size={16} aria-hidden /> Start this step over
          </button>
        )}
        {stepIndex > 0 && (
          <button type="button" className={styles.ghost} onClick={() => goTo(stepIndex - 1)}>
            <ArrowLeft size={16} aria-hidden /> Back
          </button>
        )}
      </div>
    </div>
  );
}
