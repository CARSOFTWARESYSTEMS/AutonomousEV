"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { QUIZ_QUESTIONS } from "@/lib/battery-cybersecurity/data/quiz";
import pageStyles from "../page.module.css";

export function Quiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = QUIZ_QUESTIONS.every((q) => answers[q.id] !== undefined);
  const score = QUIZ_QUESTIONS.filter((q) => answers[q.id] === q.correctIndex).length;

  return (
    <div id="knowledge-check" className={pageStyles.navyPanel} style={{ padding: "28px", scrollMarginTop: "140px" }}>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
        Knowledge Check
      </h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
        A short practice self-check, not a certification. Scored locally in your browser.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {QUIZ_QUESTIONS.map((q, qi) => {
          const selected = answers[q.id];
          const isCorrect = submitted && selected === q.correctIndex;
          const isWrong = submitted && selected !== undefined && selected !== q.correctIndex;

          return (
            <fieldset key={q.id} style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px", padding: 0 }}>
                {qi + 1}. {q.question}
              </legend>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {q.options.map((option, oi) => {
                  const inputId = `${q.id}-opt-${oi}`;
                  return (
                    <label
                      key={inputId}
                      htmlFor={inputId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--glass-border)",
                        background: selected === oi ? "rgba(34,211,238,0.06)" : "transparent",
                        cursor: submitted ? "default" : "pointer",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        minHeight: "44px",
                      }}
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name={q.id}
                        value={oi}
                        checked={selected === oi}
                        disabled={submitted}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
              {submitted && (
                <p
                  role="status"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    fontSize: "0.82rem",
                    marginTop: "10px",
                    lineHeight: 1.6,
                    color: isCorrect ? "var(--bcs-cyan)" : "var(--bcs-amber)",
                  }}
                >
                  {isCorrect ? (
                    <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
                  ) : (
                    <XCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
                  )}
                  <span>{isWrong ? "Not quite. " : isCorrect ? "Correct. " : ""}{q.explanation}</span>
                </p>
              )}
            </fieldset>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "28px", flexWrap: "wrap" }}>
        {!submitted ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
            data-track-event="bcs_quiz_submitted"
          >
            Check My Answers
          </button>
        ) : (
          <>
            <p style={{ fontWeight: 700, color: "var(--text-primary)" }}>
              Score: {score} / {QUIZ_QUESTIONS.length}
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
              }}
              data-track-event="bcs_quiz_reset"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
