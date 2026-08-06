import type { AssessmentScores, TrustDimension, WizardAnswers, WizardQuestion } from "./types";

// The 9 radar axes — the 7-dimension Battery Trust Framework (data/frameworks.ts)
// plus Detection and Verification.
export const ALL_TRUST_DIMENSIONS: TrustDimension[] = [
  "identity",
  "integrity",
  "authenticity",
  "availability",
  "safety",
  "evidence",
  "resilience",
  "detection",
  "verification",
];

function emptyDimensionRecord(): Record<TrustDimension, number> {
  return ALL_TRUST_DIMENSIONS.reduce(
    (acc, d) => {
      acc[d] = 0;
      return acc;
    },
    {} as Record<TrustDimension, number>
  );
}

/**
 * Pure and deterministic: the same answers always produce the same scores.
 * Per-dimension score = (earned weight / possible weight) * 100, rounded,
 * clamped by construction to [0, 100]. Overall Trust = average of the 9
 * dimension scores. Multi-select questions carry no `dimensions` and are
 * ignored here — they only inform recommendationRules.ts.
 */
export function scoreAssessment(answers: WizardAnswers, questions: WizardQuestion[]): AssessmentScores {
  const earned = emptyDimensionRecord();
  const possible = emptyDimensionRecord();

  for (const question of questions) {
    if (question.type !== "boolean") continue;
    for (const { dimension, weight } of question.dimensions) {
      possible[dimension] += weight;
      if (answers[question.id] === true) {
        earned[dimension] += weight;
      }
    }
  }

  const dimensionScores = emptyDimensionRecord();
  for (const dimension of ALL_TRUST_DIMENSIONS) {
    dimensionScores[dimension] = possible[dimension] > 0 ? Math.round((earned[dimension] / possible[dimension]) * 100) : 0;
  }

  const overallTrust = Math.round(
    ALL_TRUST_DIMENSIONS.reduce((sum, d) => sum + dimensionScores[d], 0) / ALL_TRUST_DIMENSIONS.length
  );

  return { dimensionScores, overallTrust };
}
