"use client";

import { useRef, useState } from "react";
import { trackAqip } from "../analytics";
import { DECISION_QUESTIONS } from "../data/execution";
import { DECISION_NOTE, decide } from "../logic/decision";
import css from "../interactive.module.css";

/** Six questions to ask of a proposed feature, and the decision the answers point to. */
export default function DecisionFramework() {
  const [yes, setYes] = useState<ReadonlySet<string>>(new Set());
  const reported = useRef(false);
  const decision = decide(yes.size);

  const toggle = (id: string, checked: boolean) => {
    const next = new Set(yes);
    if (checked) next.add(id);
    else next.delete(id);
    setYes(next);
    if (reported.current) return;
    reported.current = true;
    trackAqip("aqip_decision_framework_use", { decision: decide(next.size).toLowerCase() });
  };

  return (
    <div className={css.decision}>
      <fieldset className={css.checkGroup}>
        <legend>Before building a feature, ask:</legend>
        {DECISION_QUESTIONS.map((item) => (
          <label key={item.id} className={css.check}>
            <input type="checkbox" autoComplete="off" checked={yes.has(item.id)} onChange={(event) => toggle(item.id, event.target.checked)} />
            <span>{item.question}</span>
          </label>
        ))}
      </fieldset>
      <output className={css.decisionResult} aria-live="polite">
        <span className={css.scoreLabel}>Decision</span>
        <strong className={css.decisionValue} data-decision={decision}>
          {decision}
        </strong>
        <span className={css.scoreNote}>
          {yes.size} of {DECISION_QUESTIONS.length} answered yes. {DECISION_NOTE[decision]}
        </span>
      </output>
    </div>
  );
}
