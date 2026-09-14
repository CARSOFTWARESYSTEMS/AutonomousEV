"use client";
import { useState } from "react";
import { QUESTIONS } from "../applicationsData";
import { useMediaQuery } from "./useMediaQuery";
import styles from "../everyday-applications.module.css";

const MOBILE_PREVIEW_COUNT = 5;

export default function QuestionWall() {
  const [expanded, setExpanded] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const showExpandControl = !isDesktop && !expanded && QUESTIONS.length > MOBILE_PREVIEW_COUNT;
  const visible = showExpandControl ? QUESTIONS.slice(0, MOBILE_PREVIEW_COUNT) : QUESTIONS;

  return (
    <div>
      {visible.map((q) => (
        <details key={q.id} className={styles.accordionItem}>
          <summary>{q.question}</summary>
          <div>
            <dl>
              <dt>The problem</dt>
              <dd>{q.problem}</dd>
              <dt>How space helps</dt>
              <dd>{q.howSpaceHelps}</dd>
              <dt>What you actually receive</dt>
              <dd>{q.whatYouReceive}</dd>
              <dt>Who uses it</dt>
              <dd>{q.whoUsesIt}</dd>
              <dt>Future opportunity</dt>
              <dd>{q.futureOpportunity}</dd>
            </dl>
          </div>
        </details>
      ))}
      {showExpandControl && (
        <button type="button" className={styles.expandButton} onClick={() => setExpanded(true)}>
          Show all questions ({QUESTIONS.length})
        </button>
      )}
    </div>
  );
}
