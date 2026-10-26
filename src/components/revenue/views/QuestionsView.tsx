"use client";
// The searchable customer discovery question bank, and the meeting-specific
// question set built from it.
import { useId, useMemo, useState } from "react";
import { QUESTIONS, QUESTION_CATEGORIES } from "../data/library";
import { useRevenue } from "../state/store";
import { Notice, Panel, ViewHeader } from "../ui/controls";
import { ViewLink } from "../workspace/nav";
import css from "../workspace.module.css";

export default function QuestionsView() {
  const searchId = useId();
  const questionSet = useRevenue((state) => state.questionSet);
  const toggleQuestion = useRevenue((state) => state.toggleQuestion);
  const clearQuestions = useRevenue((state) => state.clearQuestions);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  const visible = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return QUESTIONS.filter((question) => (category === "all" || question.category === category) && words.every((word) => `${question.text} ${question.category}`.toLowerCase().includes(word)));
  }, [query, category]);

  const chosen = questionSet.map((id) => QUESTIONS.find((question) => question.id === id)).filter((question) => question !== undefined);

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
    <div>
      <ViewHeader eyebrow="Sell" title="Customer Discovery Question Bank" lede="Ask about past behaviour, not future intentions. Build a 10–12 question set for each meeting." />

      <Notice tone="warn">Use these with customers only after Gate C (Discovery Ready). Never pressure anyone to share drawings, controlled or defence-sensitive information.</Notice>

      <div className={css.searchBox}>
        <label htmlFor={searchId} className={css.label}>
          Search questions
        </label>
        <input id={searchId} type="search" className={css.input} value={query} placeholder="revision, review, cloud, approve…" autoComplete="off" onChange={(event) => setQuery(event.target.value)} />
        <div className={css.chipRow} role="group" aria-label="Category">
          {[{ id: "all", name: "All" }, ...QUESTION_CATEGORIES].map((item) => {
            const value = item.id === "all" ? "all" : item.name;
            return (
              <button key={item.id} type="button" className={css.chip} aria-pressed={category === value} onClick={() => setCategory(value)}>
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className={css.twoCol}>
        <Panel title={`Questions (${visible.length})`} kicker="Bank">
          <ul className={css.questionList}>
            {visible.map((question) => {
              const inSet = questionSet.includes(question.id);
              return (
                <li key={question.id} className={css.questionItem}>
                  <div>
                    <p className={css.kicker}>{question.category}</p>
                    <p>{question.text}</p>
                  </div>
                  <button type="button" className={css.ghostButton} aria-pressed={inSet} onClick={() => toggleQuestion(question.id)}>
                    {inSet ? "Remove" : "Add"}
                    <span className={css.srOnly}> {inSet ? "from" : "to"} meeting set: {question.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel
          title={`My meeting question set (${chosen.length})`}
          kicker="This meeting"
          tone="accent"
          actions={
            chosen.length ? (
              <div className={css.buttonRow}>
                <button type="button" className={css.ghostButton} onClick={copy}>
                  {copied ? "Copied" : "Copy"}
                </button>
                <button type="button" className={css.ghostButton} onClick={clearQuestions}>
                  Clear
                </button>
              </div>
            ) : null
          }
        >
          {chosen.length ? (
            <ol className={css.orderedList}>
              {chosen.map((question) => (
                <li key={question.id}>{question.text}</li>
              ))}
            </ol>
          ) : (
            <p className={css.empty}>Add questions from the bank. Aim for 10–12, mostly open and about the last FAI the customer prepared.</p>
          )}
          {chosen.length > 12 ? <p className={css.warnText}>More than 12 questions rarely fit a 30-minute conversation.</p> : null}
          <ViewLink view="meetings" className={css.inlineLink}>
            Use it in the Meeting Workspace →
          </ViewLink>
        </Panel>
      </div>
    </div>
  );
}
