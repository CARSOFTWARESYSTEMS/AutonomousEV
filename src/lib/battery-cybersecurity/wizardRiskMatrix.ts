import type { BucketedRecommendation, Likelihood, RiskMatrixCell, Severity, WizardAnswers } from "./types";

// Fixed, documented likelihood x impact -> priority table (same style as
// scoring.ts's severity table). Impact is the recommendation's own priority
// (how severe the gap is); likelihood reflects how confirmed the gap is.
const PRIORITY_TABLE: Record<Likelihood, Record<Severity, Severity>> = {
  rare: { low: "low", medium: "low", high: "medium", critical: "medium" },
  possible: { low: "low", medium: "medium", high: "high", critical: "high" },
  likely: { low: "medium", medium: "high", high: "high", critical: "critical" },
};

/** A confirmed "No" answer is treated as a confirmed (likely) gap; an
 * unanswered question is treated as unconfirmed (possible) — the underlying
 * capability may exist but wasn't reported. */
export function deriveLikelihood(answers: WizardAnswers, questionId: string): Likelihood {
  return answers[questionId] === false ? "likely" : "possible";
}

export function priorityFor(likelihood: Likelihood, impact: Severity): Severity {
  return PRIORITY_TABLE[likelihood][impact];
}

export function buildRiskMatrix(recommendations: BucketedRecommendation[], answers: WizardAnswers): RiskMatrixCell[] {
  const cells = new Map<string, RiskMatrixCell>();

  for (const rec of recommendations) {
    const likelihood = deriveLikelihood(answers, rec.questionId);
    const impact = rec.priority;
    const key = `${likelihood}|${impact}`;

    let cell = cells.get(key);
    if (!cell) {
      cell = { likelihood, impact, priority: priorityFor(likelihood, impact), recommendations: [] };
      cells.set(key, cell);
    }
    cell.recommendations.push(rec);
  }

  return [...cells.values()];
}
