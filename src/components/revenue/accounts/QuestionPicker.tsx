"use client";
// The discovery question bank, brought to where it is needed: pick a
// category, add questions to the meeting set, copy the set before a meeting.
import { useState } from "react";
import { QUESTIONS, QUESTION_CATEGORIES } from "../data/library";
import { useRevenue } from "../state/store";
import css from "../app.module.css";

export default function QuestionPicker({ categories }: { categories?: readonly string[] }) {
  const questionSet = useRevenue((state) => state.questionSet);
  const toggleQuestion = useRevenue((state) => state.toggleQuestion);
  const clearQuestions = useRevenue((state) => state.clearQuestions);
  const groups = QUESTION_CATEGORIES.filter((group) => !categories || categories.includes(group.id));
  const [category, setCategory] = useState(groups[0]?.id ?? "process");
  const [copied, setCopied] = useState(false);

  const chosen = questionSet.map((id) => QUESTIONS.find((question) => question.id === id)).filter((question) => question !== undefined);
  const visible = QUESTIONS.filter((question) => question.id.startsWith(`${category}-`));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(chosen.map((question, i) => `${i + 1}. ${question.text}`).join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={css.picker}>
      <div className={css.chipRow} role="group" aria-label="Question category">
        {groups.map((group) => (
          <button key={group.id} type="button" className={css.chip} aria-pressed={category === group.id} onClick={() => setCategory(group.id)}>
            {group.name}
          </button>
        ))}
      </div>
      <ul className={css.questionList}>
        {visible.map((question) => {
          const inSet = questionSet.includes(question.id);
          return (
            <li key={question.id} className={css.questionItem}>
              <p>{question.text}</p>
              <button type="button" className={css.ghostButton} aria-pressed={inSet} onClick={() => toggleQuestion(question.id)}>
                {inSet ? "Added" : "Add"}
                <span className={css.srOnly}> {inSet ? "— remove from" : "to"} meeting set: {question.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className={css.meetingSet}>
        <p className={css.label}>Meeting question set ({chosen.length})</p>
        {chosen.length ? (
          <>
            <ol className={css.orderedList}>
              {chosen.map((question) => (
                <li key={question.id}>{question.text}</li>
              ))}
            </ol>
            <div className={css.buttonRow}>
              <button type="button" className={css.ghostButton} onClick={copy}>
                {copied ? "Copied" : "Copy questions"}
              </button>
              <button type="button" className={css.ghostButton} onClick={clearQuestions}>
                Clear
              </button>
            </div>
            {chosen.length > 12 ? <p className={css.warnText}>More than 12 questions rarely fit a 30-minute conversation.</p> : null}
          </>
        ) : (
          <p className={css.blockNote}>Aim for 10–12, mostly open and about the last FAI the customer prepared.</p>
        )}
      </div>
    </div>
  );
}
