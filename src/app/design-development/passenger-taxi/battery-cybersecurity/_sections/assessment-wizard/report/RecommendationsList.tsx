import type { BucketedRecommendation, RoadmapBucket } from "@/lib/battery-cybersecurity/types";
import { SeverityBadge } from "../../../Badges";
import pageStyles from "../../../page.module.css";

const BUCKET_ORDER: RoadmapBucket[] = ["immediate", "30-day", "90-day", "future"];
const BUCKET_LABEL: Record<RoadmapBucket, string> = {
  immediate: "Immediate Actions",
  "30-day": "30-Day Roadmap",
  "90-day": "90-Day Roadmap",
  future: "Future Recommendations",
};

export function RecommendationsList({ recommendations }: { recommendations: BucketedRecommendation[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {BUCKET_ORDER.map((bucket) => {
        const items = recommendations.filter((r) => r.bucket === bucket);
        return (
          <div key={bucket}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              {BUCKET_LABEL[bucket]} ({items.length})
            </h4>
            {items.length === 0 ? (
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>None.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {items.map((rec) => (
                  <div key={rec.id} className={pageStyles.navyPanel} style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.88rem" }}>{rec.title}</p>
                      <SeverityBadge severity={rec.priority} />
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "6px" }}>
                      <strong style={{ color: "var(--bcs-cyan)" }}>Rationale: </strong>
                      {rec.rationale}
                    </p>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "6px" }}>
                      <strong style={{ color: "var(--bcs-cyan)" }}>Verification: </strong>
                      {rec.verification}
                    </p>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                      <strong style={{ color: "var(--bcs-cyan)" }}>Expected Benefit: </strong>
                      {rec.expectedBenefit}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
