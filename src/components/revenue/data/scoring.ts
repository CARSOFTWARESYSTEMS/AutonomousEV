// The scorecards, the pipeline's stages and the pilot's states. Weights and
// probabilities are starting assumptions the user can change, not truths.
import type { PilotStatus, PipelineStage } from "../types";

export interface Criterion {
  id: string;
  label: string;
  weight: number;
}

export const ACCOUNT_CRITERIA: readonly Criterion[] = [
  { id: "fai", label: "FAI / drawing-driven inspection relevance", weight: 20 },
  { id: "ad", label: "Aerospace / defence manufacturing fit", weight: 15 },
  { id: "frequency", label: "Frequency / repeatability of need", weight: 10 },
  { id: "pain", label: "Pain evidence", weight: 15 },
  { id: "access", label: "Decision-maker access", weight: 10 },
  { id: "technical", label: "Technical fit", weight: 10 },
  { id: "security", label: "Security / deployment fit", weight: 5 },
  { id: "pilot", label: "Pilot readiness", weight: 5 },
  { id: "commercial", label: "Commercial potential", weight: 5 },
  { id: "reference", label: "Strategic reference value", weight: 5 },
];

export const OPPORTUNITY_CRITERIA: readonly Criterion[] = [
  { id: "severity", label: "Problem Severity", weight: 20 },
  { id: "frequency", label: "Frequency", weight: 10 },
  { id: "impact", label: "Economic Impact", weight: 15 },
  { id: "urgency", label: "Urgency", weight: 10 },
  { id: "access", label: "Decision-Maker Access", weight: 10 },
  { id: "technical", label: "Technical Fit", weight: 15 },
  { id: "pilot", label: "Pilot Interest", weight: 10 },
  { id: "commercial", label: "Commercial Potential", weight: 10 },
];

export const OPPORTUNITY_BANDS: readonly { min: number; id: string; label: string; action: string }[] = [
  { min: 80, id: "high", label: "High Priority", action: "Invest time now; multi-thread and move to evaluation." },
  { min: 60, id: "develop", label: "Develop", action: "Close the weakest criteria before advancing." },
  { min: 40, id: "nurture", label: "Nurture", action: "Keep in touch with useful content; do not push." },
  { min: 0, id: "hold", label: "Do Not Chase Yet", action: "Record what you learned and step back." },
];

/** The North Star's definition: an opportunity counts as qualified pipeline only when all six hold. */
export const QUALIFICATION: readonly { id: string; label: string }[] = [
  { id: "account", label: "Right account" },
  { id: "problem", label: "Validated problem" },
  { id: "stakeholder", label: "Relevant stakeholder" },
  { id: "technical", label: "Plausible technical fit" },
  { id: "commercial", label: "Plausible commercial fit" },
  { id: "next", label: "Agreed next action" },
];

/**
 * Stage probabilities are planning assumptions for the weighted pipeline.
 * Calibrate them from your own wins and losses.
 */
export const STAGES: readonly { id: PipelineStage; label: string; probability: number }[] = [
  { id: "research", label: "Research", probability: 0 },
  { id: "contacted", label: "Contacted", probability: 0 },
  { id: "discovery", label: "Discovery", probability: 5 },
  { id: "qualified", label: "Qualified", probability: 10 },
  { id: "demo", label: "Demo", probability: 20 },
  { id: "evaluation", label: "Evaluation", probability: 30 },
  { id: "pilot", label: "Pilot", probability: 40 },
  { id: "proposal", label: "Proposal", probability: 60 },
  { id: "negotiation", label: "Negotiation", probability: 75 },
  { id: "won", label: "Won", probability: 100 },
  { id: "lost", label: "Lost", probability: 0 },
];

export const STAGE_INDEX: Record<PipelineStage, number> = Object.fromEntries(STAGES.map((stage, i) => [stage.id, i])) as Record<PipelineStage, number>;

export const STAGE_LABEL: Record<PipelineStage, string> = Object.fromEntries(STAGES.map((stage) => [stage.id, stage.label])) as Record<PipelineStage, string>;

/** Stages from which an opportunity may count as qualified pipeline (if all seven criteria hold). */
export const isQualifiedStage = (stage: PipelineStage) => STAGE_INDEX[stage] >= STAGE_INDEX.qualified && stage !== "won" && stage !== "lost";

export const PILOT_STATUSES: readonly { id: PilotStatus; label: string }[] = [
  { id: "proposed", label: "Proposed" },
  { id: "approved", label: "Approved" },
  { id: "in-progress", label: "In Progress" },
  { id: "evidence-review", label: "Evidence Review" },
  { id: "passed", label: "Passed" },
  { id: "failed", label: "Failed" },
  { id: "paused", label: "Paused" },
];

export const RATING_LABELS = ["None", "Very weak", "Weak", "Moderate", "Strong", "Very strong"] as const;
