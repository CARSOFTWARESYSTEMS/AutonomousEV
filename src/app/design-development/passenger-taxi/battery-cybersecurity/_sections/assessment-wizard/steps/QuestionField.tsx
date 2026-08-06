"use client";

import type { WizardAnswerValue, WizardQuestion } from "@/lib/battery-cybersecurity/types";
import pageStyles from "../../../page.module.css";

// Native fieldset/legend + radio/checkbox inputs — same accessible pattern
// already proven in Quiz.tsx (Phase 1), reused here rather than inventing a
// custom toggle-button widget.
export function QuestionField({
  question,
  value,
  onChange,
}: {
  question: WizardQuestion;
  value: WizardAnswerValue;
  onChange: (value: WizardAnswerValue) => void;
}) {
  if (question.type === "boolean") {
    const boolValue = value as boolean | null | undefined;
    return (
      <fieldset className={pageStyles.navyPanel} style={{ border: "none", padding: "18px 20px", margin: 0 }}>
        <legend style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)", padding: 0, marginBottom: "10px" }}>
          {question.text}
        </legend>
        {question.helpText && <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "10px" }}>{question.helpText}</p>}
        <div style={{ display: "flex", gap: "16px" }}>
          {(["Yes", "No"] as const).map((label) => {
            const optionValue = label === "Yes";
            const inputId = `${question.id}-${label}`;
            return (
              <label
                key={label}
                htmlFor={inputId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--glass-border)",
                  background: boolValue === optionValue ? "rgba(34,211,238,0.08)" : "transparent",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  minHeight: "44px",
                }}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={question.id}
                  checked={boolValue === optionValue}
                  onChange={() => onChange(optionValue)}
                />
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  const selected = (value as string[] | null) ?? [];
  return (
    <fieldset className={pageStyles.navyPanel} style={{ border: "none", padding: "18px 20px", margin: 0 }}>
      <legend style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)", padding: 0, marginBottom: "10px" }}>
        {question.text}
      </legend>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {question.options?.map((option) => {
          const inputId = `${question.id}-${option}`;
          const checked = selected.includes(option);
          return (
            <label
              key={option}
              htmlFor={inputId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--glass-border)",
                background: checked ? "rgba(34,211,238,0.08)" : "transparent",
                cursor: "pointer",
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                minHeight: "44px",
              }}
            >
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked ? [...selected, option] : selected.filter((s) => s !== option))}
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
