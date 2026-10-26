// Account fit and opportunity scores. Both are prioritisation aids: every
// score is shown with why it exists and how much evidence stands behind it.
import { ACCOUNT_CRITERIA, OPPORTUNITY_BANDS, OPPORTUNITY_CRITERIA, QUALIFICATION, type Criterion } from "../data/scoring";
import type { Rating } from "../types";

export type Confidence = "Low" | "Medium" | "High";

/** The criteria with any user-adjusted weights applied. */
export function withWeights(criteria: readonly Criterion[], overrides: Record<string, number> = {}): Criterion[] {
  return criteria.map((criterion) => ({ ...criterion, weight: overrides[criterion.id] ?? criterion.weight }));
}

export const totalWeight = (criteria: readonly Criterion[]) => criteria.reduce((sum, criterion) => sum + criterion.weight, 0);

/**
 * A 0–100 score: each criterion's 0–5 rating as a share of its weight. Weights
 * that do not add up to 100 are scaled so the result is still out of 100.
 */
export function weightedScore(criteria: readonly Criterion[], ratings: Record<string, Rating | number | undefined>): number {
  const total = totalWeight(criteria);
  if (total <= 0) return 0;
  const raw = criteria.reduce((sum, criterion) => sum + (criterion.weight * clampRating(ratings[criterion.id])) / 5, 0);
  return Math.round((raw / total) * 100);
}

const clampRating = (value: number | undefined) => Math.min(5, Math.max(0, Number(value) || 0));

/** Confidence comes from evidence, not from the score: fewer than 3 items is low, 6 or more is high. */
export function confidenceFor(evidenceCount: number): Confidence {
  if (evidenceCount >= 6) return "High";
  if (evidenceCount >= 3) return "Medium";
  return "Low";
}

export interface AccountFit {
  score: number;
  confidence: Confidence;
  evidence: number;
  /** "78 / 100 · Medium Confidence · 5 Evidence Items" */
  summary: string;
  suggestedTier: "A" | "B" | "C";
}

export function accountFit(ratings: Record<string, Rating | number | undefined>, evidence: number, weights?: Record<string, number>): AccountFit {
  const score = weightedScore(withWeights(ACCOUNT_CRITERIA, weights), ratings);
  const confidence = confidenceFor(evidence);
  const items = Math.max(0, Math.round(evidence));
  return {
    score,
    confidence,
    evidence: items,
    summary: `${score} / 100 · ${confidence} Confidence · ${items} Evidence ${items === 1 ? "Item" : "Items"}`,
    suggestedTier: score >= 70 ? "A" : score >= 45 ? "B" : "C",
  };
}

export interface OpportunityScore {
  score: number;
  band: (typeof OPPORTUNITY_BANDS)[number];
  /** The two strongest and two weakest criteria: why the score is what it is. */
  strongest: string[];
  weakest: string[];
}

export function opportunityScore(ratings: Record<string, Rating | number | undefined>): OpportunityScore {
  const score = weightedScore(OPPORTUNITY_CRITERIA, ratings);
  const band = OPPORTUNITY_BANDS.find((candidate) => score >= candidate.min) ?? OPPORTUNITY_BANDS[OPPORTUNITY_BANDS.length - 1];
  const ranked = OPPORTUNITY_CRITERIA.map((criterion) => ({
    label: criterion.label,
    contribution: (criterion.weight * clampRating(ratings[criterion.id])) / 5,
    gap: (criterion.weight * (5 - clampRating(ratings[criterion.id]))) / 5,
  }));
  return {
    score,
    band,
    strongest: [...ranked].sort((a, b) => b.contribution - a.contribution).slice(0, 2).filter((item) => item.contribution > 0).map((item) => item.label),
    weakest: [...ranked].sort((a, b) => b.gap - a.gap).slice(0, 2).filter((item) => item.gap > 0).map((item) => item.label),
  };
}

/** The qualification criteria still missing. An opportunity is qualified pipeline only when none are. */
export function missingQualification(qualified: Record<string, boolean>): string[] {
  return QUALIFICATION.filter((criterion) => !qualified[criterion.id]).map((criterion) => criterion.label);
}

export const isFullyQualified = (qualified: Record<string, boolean>) => missingQualification(qualified).length === 0;
