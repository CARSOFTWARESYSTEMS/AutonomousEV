import type { AssessmentScores, BucketedRecommendation } from "@/lib/battery-cybersecurity/types";
import pageStyles from "../../../page.module.css";

function trustBand(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Trusted", color: "#22d3ee" };
  if (score >= 60) return { label: "Degraded", color: "#fbbf24" };
  if (score >= 40) return { label: "Unverified", color: "#94a3b8" };
  return { label: "Compromised", color: "#f87171" };
}

export function ExecutiveSummary({
  aircraftProfileName,
  scores,
  recommendations,
}: {
  aircraftProfileName: string;
  scores: AssessmentScores;
  recommendations: BucketedRecommendation[];
}) {
  const band = trustBand(scores.overallTrust);
  const immediateCount = recommendations.filter((r) => r.bucket === "immediate").length;
  const criticalCount = recommendations.filter((r) => r.priority === "critical").length;

  return (
    <div className={pageStyles.navyPanel} style={{ padding: "24px" }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bcs-cyan)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px" }}>
        Executive Summary
      </p>
      <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.75 }}>
        For the assessed <strong>{aircraftProfileName}</strong> configuration, overall battery cybersecurity trust
        scores <strong style={{ color: band.color }}>{scores.overallTrust}/100 ({band.label})</strong>.{" "}
        {criticalCount > 0
          ? `${criticalCount} critical-priority gap${criticalCount === 1 ? "" : "s"} and ${immediateCount} immediate-action item${immediateCount === 1 ? "" : "s"} were identified.`
          : immediateCount > 0
            ? `${immediateCount} immediate-action item${immediateCount === 1 ? "" : "s"} were identified, with no critical-priority gaps.`
            : "No immediate-action items were identified for the answers provided."}
      </p>
    </div>
  );
}
