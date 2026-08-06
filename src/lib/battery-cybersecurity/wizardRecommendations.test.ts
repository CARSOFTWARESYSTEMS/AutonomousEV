import { describe, expect, it } from "vitest";
import { buildRecommendations, estimateEngineeringEffort } from "./wizardRecommendations";
import { RECOMMENDATION_RULES } from "./data/recommendationRules";
import { WIZARD_QUESTIONS } from "./data/wizardQuestions";
import { DETECTION_CONTROLS } from "./data/detectionControls";
import type { WizardAnswers } from "./types";

describe("buildRecommendations", () => {
  it("produces zero recommendations when every question is answered Yes", () => {
    const answers: WizardAnswers = Object.fromEntries(WIZARD_QUESTIONS.filter((q) => q.type === "boolean").map((q) => [q.id, true]));
    expect(buildRecommendations(answers, RECOMMENDATION_RULES, DETECTION_CONTROLS)).toHaveLength(0);
  });

  it("produces one recommendation per rule when every question is unanswered", () => {
    const recs = buildRecommendations({}, RECOMMENDATION_RULES, DETECTION_CONTROLS);
    expect(recs).toHaveLength(RECOMMENDATION_RULES.length);
  });

  it("every produced recommendation traces back to a real rule id", () => {
    const ruleIds = new Set(RECOMMENDATION_RULES.map((r) => r.id));
    const recs = buildRecommendations({}, RECOMMENDATION_RULES, DETECTION_CONTROLS);
    for (const rec of recs) {
      expect(ruleIds.has(rec.id), rec.id).toBe(true);
    }
  });

  it("buckets deterministically by priority with no overlap: critical->immediate, high->30-day, medium->90-day, low->future", () => {
    const recs = buildRecommendations({}, RECOMMENDATION_RULES, DETECTION_CONTROLS);
    for (const rec of recs) {
      const expected = { critical: "immediate", high: "30-day", medium: "90-day", low: "future" }[rec.priority];
      expect(rec.bucket, rec.id).toBe(expected);
    }
  });

  it("resolves relatedControlId to a real control and never fabricates one", () => {
    const recs = buildRecommendations({}, RECOMMENDATION_RULES, DETECTION_CONTROLS);
    const controlIds = new Set(DETECTION_CONTROLS.map((c) => c.id));
    for (const rec of recs) {
      if (rec.relatedControlId) {
        expect(controlIds.has(rec.relatedControlId), rec.id).toBe(true);
      }
    }
  });

  it("is deterministic — identical inputs always produce identical outputs", () => {
    const answers: WizardAnswers = { "secure-boot": false, "signed-firmware": true };
    const first = buildRecommendations(answers, RECOMMENDATION_RULES, DETECTION_CONTROLS);
    const second = buildRecommendations(answers, RECOMMENDATION_RULES, DETECTION_CONTROLS);
    expect(first).toEqual(second);
  });

  it("sorts recommendations with critical priority first", () => {
    const recs = buildRecommendations({}, RECOMMENDATION_RULES, DETECTION_CONTROLS);
    expect(recs[0].priority).toBe("critical");
  });
});

describe("estimateEngineeringEffort", () => {
  it("is Low for 10 or fewer open recommendations", () => {
    expect(estimateEngineeringEffort(10)).toBe("Low");
  });
  it("is Medium for 11-25", () => {
    expect(estimateEngineeringEffort(25)).toBe("Medium");
  });
  it("is High for more than 25", () => {
    expect(estimateEngineeringEffort(26)).toBe("High");
  });
});
