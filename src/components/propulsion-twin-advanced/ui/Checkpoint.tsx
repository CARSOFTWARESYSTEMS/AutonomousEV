"use client";
// The checkpoint at the end of a module: four questions, each of which shows
// its reasoning only after the learner has committed to an answer.
import { useState } from "react";
import { Check, X } from "lucide-react";
import { CHECKPOINT_LABELS, type Checkpoint as CheckpointData, type Question } from "../data/checkpoints";
import css from "../advancedTwin.module.css";

function Choices({ id, label, item }: { id: string; label: string; item: Question }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const answered = chosen !== null;
  return (
    <fieldset className={css.question}>
      <legend>
        <span className={css.questionKind}>{label}</span>
        {item.question}
      </legend>
      <div className={css.choices}>
        {item.choices.map((choice, i) => {
          const state = !answered ? undefined : choice.correct ? "correct" : chosen === i ? "wrong" : "other";
          return (
            <button key={choice.text} type="button" className={css.choice} data-state={state} aria-pressed={chosen === i} disabled={answered && chosen !== i && !choice.correct} onClick={() => setChosen(i)}>
              {state === "correct" && <Check size={14} aria-hidden="true" />}
              {state === "wrong" && <X size={14} aria-hidden="true" />}
              <span>{choice.text}</span>
              {state === "correct" && <span className={css.srOnly}> (correct answer)</span>}
              {state === "wrong" && <span className={css.srOnly}> (your answer, not correct)</span>}
            </button>
          );
        })}
      </div>
      <p id={`${id}-reasoning`} className={css.reasoning} role="status" hidden={!answered}>
        <strong>{answered && item.choices[chosen].correct ? "Correct. " : "Not quite. "}</strong>
        {item.reasoning}
      </p>
    </fieldset>
  );
}

function Explain({ prompt, answer }: { prompt: string; answer: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className={css.question}>
      <p>
        <span className={css.questionKind}>{CHECKPOINT_LABELS.explain}</span>
        {prompt}
      </p>
      <p className={css.hint}>Answer it in your own words first.</p>
      <button type="button" className={css.ghost} aria-expanded={shown} onClick={() => setShown((s) => !s)}>
        {shown ? "Hide the model answer" : "Reveal a model answer"}
      </button>
      <p className={css.reasoning} hidden={!shown}>
        {answer}
      </p>
    </div>
  );
}

export default function Checkpoint({ data }: { data: CheckpointData }) {
  return (
    <section className={css.checkpoint} aria-labelledby={`checkpoint-${data.module}`}>
      <h3 id={`checkpoint-${data.module}`} className={css.h3}>
        Learning Checkpoint
      </h3>
      <div className={css.questions}>
        <Explain prompt={data.explain.prompt} answer={data.explain.answer} />
        <Choices id={`${data.module}-identify`} label={CHECKPOINT_LABELS.identify} item={data.identify} />
        <Choices id={`${data.module}-diagnose`} label={CHECKPOINT_LABELS.diagnose} item={data.diagnose} />
        <Choices id={`${data.module}-architect`} label={CHECKPOINT_LABELS.architect} item={data.architect} />
      </div>
    </section>
  );
}
