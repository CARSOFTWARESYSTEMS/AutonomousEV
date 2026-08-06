import { describe, expect, it } from "vitest";
import { buildWizardMarkdownReport, buildWizardJsonReport, buildWizardCsvReport } from "./wizardExport";
import type { WizardExportInput } from "./wizardExport";
import type { BucketedRecommendation } from "./types";
import { scoreAssessment } from "./wizardScoring";
import { buildRecommendations } from "./wizardRecommendations";
import { WIZARD_QUESTIONS } from "./data/wizardQuestions";
import { RECOMMENDATION_RULES } from "./data/recommendationRules";
import { DETECTION_CONTROLS } from "./data/detectionControls";

const scores = scoreAssessment({}, WIZARD_QUESTIONS);
const recommendations = buildRecommendations({}, RECOMMENDATION_RULES, DETECTION_CONTROLS);
const input: WizardExportInput = { aircraftProfileName: "Passenger eVTOL", scores, recommendations };

describe("buildWizardMarkdownReport", () => {
  it("includes the aircraft profile, overall score, and all four bucket headings", () => {
    const md = buildWizardMarkdownReport(input);
    expect(md).toContain("Passenger eVTOL");
    expect(md).toContain(`${scores.overallTrust} / 100`);
    expect(md).toContain("## Immediate Actions");
    expect(md).toContain("## 30-Day Roadmap");
    expect(md).toContain("## 90-Day Roadmap");
    expect(md).toContain("## Future Recommendations");
  });

  it("starts with a single H1", () => {
    expect(buildWizardMarkdownReport(input).startsWith("# Battery Cybersecurity Assessment Report")).toBe(true);
  });
});

describe("buildWizardJsonReport", () => {
  it("produces valid, parseable JSON round-tripping the input", () => {
    const json = buildWizardJsonReport(input);
    const parsed = JSON.parse(json);
    expect(parsed.aircraftProfileName).toBe("Passenger eVTOL");
    expect(parsed.scores.overallTrust).toBe(scores.overallTrust);
    expect(parsed.recommendations).toHaveLength(recommendations.length);
  });
});

describe("buildWizardCsvReport", () => {
  it("produces one header row plus one row per recommendation", () => {
    const csv = buildWizardCsvReport(recommendations);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(recommendations.length + 1);
    expect(lines[0]).toBe("id,priority,bucket,title,rationale,verification,expectedBenefit,relatedControlId");
  });

  it("escapes embedded quotes safely", () => {
    const rec: BucketedRecommendation = {
      id: "x",
      questionId: "q",
      title: 'Has a "quoted" word',
      rationale: "r",
      verification: "v",
      expectedBenefit: "b",
      priority: "low",
      bucket: "future",
    };
    const csv = buildWizardCsvReport([rec]);
    expect(csv).toContain('"Has a ""quoted"" word"');
  });
});
