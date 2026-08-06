import type { BucketedRecommendation, DetectionControl, RecommendationRule, RoadmapBucket, Severity, WizardAnswers } from "./types";

const PRIORITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

// One deterministic priority -> bucket mapping — no overlap, no ambiguity.
const BUCKET_BY_PRIORITY: Record<Severity, RoadmapBucket> = {
  critical: "immediate",
  high: "30-day",
  medium: "90-day",
  low: "future",
};

/**
 * Pure and deterministic — every rule fires only on its own trigger
 * condition (an explicit "No" or an unanswered question), never on any
 * generated or inferred text. `relatedControlId`, when present, is resolved
 * against the real `controls` dataset; an unresolvable id is simply dropped
 * rather than fabricated.
 */
export function buildRecommendations(
  answers: WizardAnswers,
  rules: RecommendationRule[],
  controls: DetectionControl[]
): BucketedRecommendation[] {
  const controlIds = new Set(controls.map((c) => c.id));

  const fired = rules.filter((rule) => answers[rule.questionId] !== true);

  return [...fired]
    .sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority))
    .map((rule) => ({
      id: rule.id,
      questionId: rule.questionId,
      title: rule.title,
      rationale: rule.rationale,
      verification: rule.verification,
      expectedBenefit: rule.expectedBenefit,
      priority: rule.priority,
      relatedControlId: rule.relatedControlId && controlIds.has(rule.relatedControlId) ? rule.relatedControlId : undefined,
      bucket: BUCKET_BY_PRIORITY[rule.priority],
    }));
}

export function estimateEngineeringEffort(openRecommendationCount: number): "Low" | "Medium" | "High" {
  if (openRecommendationCount <= 10) return "Low";
  if (openRecommendationCount <= 25) return "Medium";
  return "High";
}
