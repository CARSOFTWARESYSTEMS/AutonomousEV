import type { AssessmentScores, BucketedRecommendation } from "@/lib/battery-cybersecurity/types";
import { ALL_TRUST_DIMENSIONS } from "@/lib/battery-cybersecurity/wizardScoring";
import { estimateEngineeringEffort } from "@/lib/battery-cybersecurity/wizardRecommendations";
import { MaturityGauge } from "../charts/MaturityGauge";
import { DIMENSION_LABELS } from "../charts/RadarChart";
import pageStyles from "../../../page.module.css";

export function CtoDashboard({ scores, recommendations }: { scores: AssessmentScores; recommendations: BucketedRecommendation[] }) {
  const gapsSorted = [...recommendations].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 } as const;
    return order[a.priority] - order[b.priority];
  });
  const topGaps = gapsSorted.slice(0, 10);
  const topStrengths = [...ALL_TRUST_DIMENSIONS].sort((a, b) => scores.dimensionScores[b] - scores.dimensionScores[a]).slice(0, 10);
  const quickWins = recommendations.filter((r) => r.bucket === "30-day");
  const effort = estimateEngineeringEffort(recommendations.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
        <MaturityGauge value={scores.overallTrust} label="Overall Maturity" />
        <div className={pageStyles.navyPanel} style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bcs-amber)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
            Estimated Engineering Effort
          </p>
          <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>{effort}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Based on {recommendations.length} open recommendation{recommendations.length === 1 ? "" : "s"}.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        <div className={pageStyles.navyPanel} style={{ padding: "18px" }}>
          <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px" }}>Top Gaps ({topGaps.length})</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {topGaps.map((g) => (
              <li key={g.id} style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                {g.title} <span style={{ color: "var(--text-muted)" }}>({g.priority})</span>
              </li>
            ))}
            {topGaps.length === 0 && <li style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>None.</li>}
          </ul>
        </div>

        <div className={pageStyles.navyPanel} style={{ padding: "18px" }}>
          <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px" }}>Top Strengths</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {topStrengths.map((d) => (
              <li key={d} style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                {DIMENSION_LABELS[d]} <span style={{ color: "var(--text-muted)" }}>({scores.dimensionScores[d]})</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={pageStyles.navyPanel} style={{ padding: "18px" }}>
          <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px" }}>Quick Wins ({quickWins.length})</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {quickWins.slice(0, 10).map((r) => (
              <li key={r.id} style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                {r.title}
              </li>
            ))}
            {quickWins.length === 0 && <li style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>None identified.</li>}
          </ul>
        </div>
      </div>

      <div className={pageStyles.navyPanel} style={{ padding: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          For a structured, guided follow-up, see the Discovery &amp; Threat-Modelling Workshop.
        </p>
        <a href="#workshop" className="btn btn-secondary" style={{ fontSize: "0.82rem", padding: "0.55rem 1.1rem" }}>
          View Workshop Offering
        </a>
      </div>
    </div>
  );
}
