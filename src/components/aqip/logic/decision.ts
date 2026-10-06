// The management decision framework: how many of the six questions a proposed
// feature answers "yes" to decides what happens to it.

export type Decision = "BUILD" | "INVESTIGATE" | "DEFER";

export function decide(yesCount: number): Decision {
  if (yesCount >= 4) return "BUILD";
  if (yesCount >= 2) return "INVESTIGATE";
  return "DEFER";
}

export const DECISION_NOTE: Record<Decision, string> = {
  BUILD: "Four or more clear benefits: schedule it, with the KPI it should move.",
  INVESTIGATE: "Two or three benefits: validate with customers before committing engineering time.",
  DEFER: "One benefit or none: leave it out of the roadmap for now.",
};
