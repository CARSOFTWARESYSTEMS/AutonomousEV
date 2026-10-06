// Pilot-fit scoring for the customer interview scorecard. Pure and client-side:
// answers are never stored or sent anywhere.

export type Answer = 0 | 1 | 2 | 3;
export type FitBand = "LOW" | "MEDIUM" | "HIGH" | "VERY HIGH";

export interface ScoreDimension {
  id: string;
  label: string;
  /** How much the dimension counts towards pilot fit. */
  weight: number;
  /** What each answer from 0 to 3 means for this dimension. */
  levels: readonly [string, string, string, string];
}

export const SCORE_DIMENSIONS: readonly ScoreDimension[] = [
  { id: "fai-frequency", label: "FAI frequency", weight: 2, levels: ["Rare", "A few a year", "Monthly", "Weekly or more"] },
  { id: "manual-effort", label: "Manual effort", weight: 2, levels: ["Mostly automated", "Some manual steps", "Largely manual", "Entirely PDF, Excel and re-typing"] },
  { id: "drawing-complexity", label: "Drawing complexity", weight: 1, levels: ["Simple parts", "Moderate", "Complex, many characteristics", "Very complex, heavy GD&T"] },
  { id: "revision-frequency", label: "Revision frequency", weight: 1, levels: ["Rare", "Occasional", "Frequent", "Constant"] },
  { id: "cmm-usage", label: "CMM usage", weight: 1, levels: ["No CMM", "Occasional", "Regular", "Most characteristics measured on CMM"] },
  { id: "quality-team", label: "Quality team size", weight: 1, levels: ["No dedicated quality role", "One person", "Small team", "Established team with FAI owners"] },
  { id: "rejection-pain", label: "Customer rejection pain", weight: 1.5, levels: ["None reported", "Occasional returns", "Regular rejected packages", "Rejections delaying deliveries"] },
  { id: "data-security", label: "Data-security needs", weight: 1, levels: ["Not discussed", "Basic", "Customer-mandated controls", "Defence data, private deployment needed"] },
  { id: "software-dissatisfaction", label: "Current software dissatisfaction", weight: 1, levels: ["Satisfied", "Minor complaints", "Actively frustrated", "Looking to replace"] },
  { id: "budget-authority", label: "Budget authority", weight: 1.5, levels: ["No access to a buyer", "Influencer only", "Budget holder engaged", "Decision maker sponsoring"] },
  { id: "pilot-readiness", label: "Pilot readiness", weight: 2, levels: ["No interest in a pilot", "Open to a demo", "Will share a past FAI", "Will run the next live FAI together"] },
] as const;

export type Answers = Partial<Record<string, Answer>>;

export interface FitResult {
  answered: number;
  total: number;
  /** Weighted score as a percentage of the maximum, from 0 to 100. */
  percent: number;
  /** Only given once every dimension is answered. */
  band: FitBand | null;
  /** True when a missing pilot path holds an otherwise strong score back. */
  capped: boolean;
}

function bandFor(percent: number): FitBand {
  if (percent >= 80) return "VERY HIGH";
  if (percent >= 60) return "HIGH";
  if (percent >= 40) return "MEDIUM";
  return "LOW";
}

export function scorePilotFit(answers: Answers, dimensions: readonly ScoreDimension[] = SCORE_DIMENSIONS): FitResult {
  let score = 0;
  let max = 0;
  let answered = 0;
  for (const dimension of dimensions) {
    max += dimension.weight * 3;
    const answer = answers[dimension.id];
    if (answer === undefined) continue;
    answered += 1;
    score += dimension.weight * answer;
  }
  const percent = max === 0 ? 0 : Math.round((score / max) * 100);
  if (answered < dimensions.length) return { answered, total: dimensions.length, percent, band: null, capped: false };
  const band = bandFor(percent);
  // Strong pain without any willingness to pilot is not a strong pilot candidate.
  const capped = answers["pilot-readiness"] === 0 && (band === "HIGH" || band === "VERY HIGH");
  return { answered, total: dimensions.length, percent, band: capped ? "MEDIUM" : band, capped };
}
