import type { AssessmentScores } from "@/lib/battery-cybersecurity/types";
import { ALL_TRUST_DIMENSIONS } from "@/lib/battery-cybersecurity/wizardScoring";
import { RadarChart, DIMENSION_LABELS } from "../charts/RadarChart";
import { MaturityGauge } from "../charts/MaturityGauge";
import { ProgressBar } from "../charts/ProgressBar";
import { DIMENSION_EXPLANATIONS } from "./dimensionExplanations";
import pageStyles from "../../../page.module.css";

export function BatteryTrustScoreSection({ scores }: { scores: AssessmentScores }) {
  return (
    <div className={pageStyles.navyPanel} style={{ padding: "24px" }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bcs-cyan)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px" }}>
        Battery Trust Score
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "28px", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
        <RadarChart dimensionScores={scores.dimensionScores} />
        <MaturityGauge value={scores.overallTrust} label="Overall Trust Score" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {ALL_TRUST_DIMENSIONS.map((dimension) => (
          <div key={dimension}>
            <ProgressBar label={DIMENSION_LABELS[dimension]} value={scores.dimensionScores[dimension]} />
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>{DIMENSION_EXPLANATIONS[dimension]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
