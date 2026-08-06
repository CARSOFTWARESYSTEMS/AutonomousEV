import type { AssessmentScores, BucketedRecommendation } from "./types";

export interface WizardExportInput {
  aircraftProfileName: string;
  scores: AssessmentScores;
  recommendations: BucketedRecommendation[];
}

const BUCKET_LABEL: Record<BucketedRecommendation["bucket"], string> = {
  immediate: "Immediate Actions",
  "30-day": "30-Day Roadmap",
  "90-day": "90-Day Roadmap",
  future: "Future Recommendations",
};

function groupByBucket(recommendations: BucketedRecommendation[]) {
  const buckets: BucketedRecommendation["bucket"][] = ["immediate", "30-day", "90-day", "future"];
  return buckets.map((bucket) => ({ bucket, label: BUCKET_LABEL[bucket], items: recommendations.filter((r) => r.bucket === bucket) }));
}

/** Pure string builder — no DOM/Blob APIs, trivially testable. */
export function buildWizardMarkdownReport(input: WizardExportInput): string {
  const { aircraftProfileName, scores, recommendations } = input;
  const lines: string[] = [];

  lines.push("# Battery Cybersecurity Assessment Report");
  lines.push("");
  lines.push(`**Aircraft Profile:** ${aircraftProfileName}`);
  lines.push(`**Overall Trust Score:** ${scores.overallTrust} / 100`);
  lines.push("");
  lines.push("## Battery Trust Score by Dimension");
  for (const [dimension, score] of Object.entries(scores.dimensionScores)) {
    lines.push(`- **${dimension}**: ${score} / 100`);
  }
  lines.push("");

  for (const group of groupByBucket(recommendations)) {
    lines.push(`## ${group.label}`);
    if (group.items.length === 0) {
      lines.push("_None._");
    } else {
      for (const rec of group.items) {
        lines.push(`### ${rec.title} (${rec.priority})`);
        lines.push(`- **Rationale:** ${rec.rationale}`);
        lines.push(`- **Verification:** ${rec.verification}`);
        lines.push(`- **Expected Benefit:** ${rec.expectedBenefit}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function buildWizardJsonReport(input: WizardExportInput): string {
  return JSON.stringify(input, null, 2);
}

export function buildWizardCsvReport(recommendations: BucketedRecommendation[]): string {
  const header = ["id", "priority", "bucket", "title", "rationale", "verification", "expectedBenefit", "relatedControlId"];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = recommendations.map((rec) =>
    [rec.id, rec.priority, rec.bucket, rec.title, rec.rationale, rec.verification, rec.expectedBenefit, rec.relatedControlId ?? ""]
      .map(escape)
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
}
