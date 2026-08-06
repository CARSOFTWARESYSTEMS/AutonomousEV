"use client";

import type { WizardAnswerValue, WizardAnswers, WizardQuestion, WizardStepId } from "@/lib/battery-cybersecurity/types";
import { QuestionField } from "./QuestionField";

// One generic renderer for all 7 content steps (Battery Architecture,
// Communication, Firmware, Charging, Maintenance, Threat Detection,
// Verification) instead of 7 near-identical files — each step's shape is
// the same (a title, a short description, and a list of questions filtered
// by stepId), so the difference is entirely data, not markup.
export function QuestionStep({
  stepId,
  title,
  description,
  questions,
  answers,
  onAnswerChange,
}: {
  stepId: WizardStepId;
  title: string;
  description: string;
  questions: WizardQuestion[];
  answers: WizardAnswers;
  onAnswerChange: (questionId: string, value: WizardAnswerValue) => void;
}) {
  const stepQuestions = questions.filter((q) => q.stepId === stepId);

  return (
    <div>
      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>{title}</h3>
      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "24px", maxWidth: "720px" }}>{description}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {stepQuestions.map((question) => (
          <QuestionField
            key={question.id}
            question={question}
            value={answers[question.id] ?? null}
            onChange={(value) => onAnswerChange(question.id, value)}
          />
        ))}
      </div>
    </div>
  );
}
