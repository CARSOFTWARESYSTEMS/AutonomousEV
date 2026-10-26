// Shared types for the B2B Revenue Engineering workspace. Content lives in
// ./data, calculations in ./logic, saved progress in ./state; these types are
// what they agree on.

/** How well a claim is supported, from belief to commercial proof. */
export type EvidenceLevel = "assumption" | "research" | "customer" | "pilot" | "commercial";

export const EVIDENCE_ORDER: readonly EvidenceLevel[] = ["assumption", "research", "customer", "pilot", "commercial"];

export const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  assumption: "Assumption",
  research: "Research",
  customer: "Customer Validated",
  pilot: "Pilot Validated",
  commercial: "Commercial Proof",
};

export const EVIDENCE_MEANING: Record<EvidenceLevel, string> = {
  assumption: "Believed but not validated.",
  research: "Supported by secondary research.",
  customer: "Confirmed through customer conversation.",
  pilot: "Measured in an agreed evaluation or pilot.",
  commercial: "Supported by a purchase, paid pilot, renewal or contracted outcome.",
};

/** How mature a product capability is. Only "prototype" and "beta" describe something a customer can use today. */
export type Maturity = "prototype" | "beta" | "development" | "planned" | "research" | "vision";

export const MATURITY_LABEL: Record<Maturity, string> = {
  prototype: "Prototype Foundation",
  beta: "Beta",
  development: "In Development",
  planned: "Planned",
  research: "Research",
  vision: "Long-Term Vision",
};

/** Status of a marketing or sales claim in the Approved Claims Registry. */
export type ClaimStatus = "verified" | "customer" | "hypothesis" | "restricted";

export const CLAIM_LABEL: Record<ClaimStatus, string> = {
  verified: "Verified",
  customer: "Customer-Validated",
  hypothesis: "Hypothesis",
  restricted: "Restricted — Do Not Claim",
};

/** Who must answer a security, technical or commercial question before anyone outside the team hears it. */
export type AnswerClass = "approved" | "technical" | "commercial" | "security" | "legal";

export const ANSWER_LABEL: Record<AnswerClass, string> = {
  approved: "Approved Answer",
  technical: "Technical Review Needed",
  commercial: "Commercial Review Needed",
  security: "Security Review Needed",
  legal: "Legal / Contract Review Needed",
};

/** One day of the 60-day programme. Every field is required: the template is the same every day. */
export interface Mission {
  day: number;
  title: string;
  /** The single outcome the day should produce. */
  mission: string;
  why: string;
  learn: string;
  applyFai: string;
  doToday: readonly string[];
  /** Questions for customers; on research days they are prepared, not asked (see askNote). */
  ask: readonly string[];
  askNote?: string;
  dont: readonly string[];
  evidence: readonly string[];
  /** What to record before the day counts as done. */
  submit: readonly string[];
  selfReview: readonly string[];
  /** What needs a mentor's approval, if anything, before external contact. */
  gate?: string;
  next: string;
  /** The named deliverable. */
  output: string;
  /** Customer-facing days make the "What changed my mind?" reflection mandatory. */
  customerFacing?: boolean;
  /** Workspace tools the day uses. */
  tools?: readonly ViewId[];
  /** Extra words the mission search should match. */
  tags?: readonly string[];
}

/** Every place in the workspace that can be opened by address (#id). */
export type ViewId =
  | "today"
  | "journey"
  | "cockpit"
  | "market"
  | "icp"
  | "pains"
  | "accounts"
  | "questions"
  | "meetings"
  | "pipeline"
  | "pilot"
  | "learn-marketing"
  | "learn-sales"
  | "learn-revenue"
  | "product"
  | "evidence"
  | "roi"
  | "feedback"
  | "review"
  | "decisions"
  | "challenges"
  | "boardroom"
  | "internship";

export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

export type PipelineStage =
  | "research"
  | "contacted"
  | "discovery"
  | "qualified"
  | "demo"
  | "evaluation"
  | "pilot"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type PilotStatus = "proposed" | "approved" | "in-progress" | "evidence-review" | "passed" | "failed" | "paused";
