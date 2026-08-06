import type { Likelihood, Severity } from "./types";

const SEVERITY_POINTS: Record<Severity, number> = { low: 1, medium: 2, high: 3, critical: 4 };
const LIKELIHOOD_POINTS: Record<Likelihood, number> = { rare: 1, possible: 2, likely: 3 };

/**
 * Deterministic consequence scoring. Severity is weighted most heavily (x2)
 * since it reflects the threat's inherent potential impact; likelihood and the
 * flight phase's consequence weight (1-5, see data/flightPhases.ts) adjust it.
 * Total range is 4 (low/rare/phase-weight-1) to 16 (critical/likely/phase-weight-5).
 */
export function scoreConsequence(
  severity: Severity,
  likelihood: Likelihood,
  flightPhaseWeight: number
): Severity {
  const total = SEVERITY_POINTS[severity] * 2 + LIKELIHOOD_POINTS[likelihood] + flightPhaseWeight;

  if (total >= 13) return "critical";
  if (total >= 10) return "high";
  if (total >= 7) return "medium";
  return "low";
}
