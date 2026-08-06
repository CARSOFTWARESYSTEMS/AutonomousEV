import type { AssessmentScores } from "@/lib/battery-cybersecurity/types";
import { ALL_TRUST_DIMENSIONS } from "@/lib/battery-cybersecurity/wizardScoring";
import { DIMENSION_LABELS } from "../charts/RadarChart";
import pageStyles from "../../../page.module.css";

// Documented, fixed thresholds — not a judgment call made per-report.
const STRENGTH_THRESHOLD = 70;
const WEAKNESS_THRESHOLD = 40;

export function StrengthsWeaknesses({ scores }: { scores: AssessmentScores }) {
  const sorted = [...ALL_TRUST_DIMENSIONS].sort((a, b) => scores.dimensionScores[b] - scores.dimensionScores[a]);
  const strengths = sorted.filter((d) => scores.dimensionScores[d] >= STRENGTH_THRESHOLD);
  const weaknesses = [...sorted].reverse().filter((d) => scores.dimensionScores[d] < WEAKNESS_THRESHOLD);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
      <div className={pageStyles.navyPanel} style={{ padding: "20px", borderLeft: "3px solid #22d3ee" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#22d3ee", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px" }}>
          Strengths (&ge; {STRENGTH_THRESHOLD})
        </p>
        {strengths.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>No dimension currently scores {STRENGTH_THRESHOLD} or above.</p>
        ) : (
          <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {strengths.map((d) => (
              <li key={d} style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {DIMENSION_LABELS[d]} — <strong style={{ color: "var(--text-primary)" }}>{scores.dimensionScores[d]}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={pageStyles.navyPanel} style={{ padding: "20px", borderLeft: "3px solid #f87171" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#f87171", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px" }}>
          Weaknesses (&lt; {WEAKNESS_THRESHOLD})
        </p>
        {weaknesses.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>No dimension currently scores below {WEAKNESS_THRESHOLD}.</p>
        ) : (
          <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {weaknesses.map((d) => (
              <li key={d} style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {DIMENSION_LABELS[d]} — <strong style={{ color: "var(--text-primary)" }}>{scores.dimensionScores[d]}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
