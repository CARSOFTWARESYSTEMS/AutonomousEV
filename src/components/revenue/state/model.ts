// What the workspace saves. Everything stays in this browser's localStorage:
// nothing is sent to a server, and nothing reaches analytics.
import type { EvidenceLevel, PilotStatus, PipelineStage, Rating } from "../types";
import type { GateId } from "../data/framework";

export interface Account {
  id: string;
  /** Fictional demonstration records are flagged so they can never be mistaken for real ones. */
  synthetic?: boolean;
  name: string;
  location: string;
  website: string;
  category: string;
  capabilities: string;
  relevance: string;
  /** Only certifications and customers the company itself publishes. */
  certifications: string;
  customers: string;
  source: string;
  researched: string;
  buyerRoles: number;
  ratings: Record<string, Rating>;
  /** How many sourced evidence items stand behind the ratings. */
  evidence: number;
  tier: "A" | "B" | "C";
}

export interface Opportunity {
  id: string;
  synthetic?: boolean;
  accountId: string;
  name: string;
  stage: PipelineStage;
  /** Estimated annual value in rupees. */
  value: number;
  nextAction: string;
  nextDate: string;
  ratings: Record<string, Rating>;
  qualified: Record<string, boolean>;
  stop: readonly string[];
  lossReason?: string;
  lossLearning?: string;
  lossChange?: string;
}

export interface PainState {
  level: EvidenceLevel;
  /** Independent customer conversations that support it. */
  count: number;
  invalidated?: boolean;
}

export interface Reflection {
  before: string;
  evidence: string;
  change: string;
  tomorrow: string;
}

export interface Meeting {
  id: string;
  account: string;
  date: string;
  participants: string;
  objective: string;
  known: string;
  unknown: string;
  hypotheses: string;
  desiredNext: string;
  caution: string;
  said: string;
  evidence: string;
  painScore: Rating;
  objections: string;
  buyerChanges: string;
  productFeedback: string;
  nextAction: string;
  nextDate: string;
  changedMind: string;
}

export interface Pilot {
  customer: string;
  problem: string;
  baseline: string;
  scope: string;
  criteria: string;
  currentTime: string;
  assistedTime: string;
  corrections: string;
  reviewEffort: string;
  completeness: string;
  feedback: string;
  security: string;
  start: string;
  end: string;
  owner: string;
  nextDecision: string;
  status: PilotStatus;
}

export interface Decision {
  id: string;
  decision: string;
  date: string;
  owner: string;
  evidence: string;
  confidence: "Low" | "Medium" | "High";
  why: string;
  invalidate: string;
  review: string;
}

export interface Feedback {
  id: string;
  category: string;
  text: string;
  accounts: number;
  date: string;
}

export interface RevenueState {
  version: 1;
  /** The day open in Today. */
  day: number;
  /** Day → ISO date it was marked complete. */
  completed: Record<number, string>;
  /** `${day}:do:${i}` and `${day}:submit:${i}` → ticked. */
  checks: Record<string, boolean>;
  reflections: Record<number, Reflection>;
  pains: Record<string, PainState>;
  questionSet: string[];
  accounts: Account[];
  opportunities: Opportunity[];
  meetings: Meeting[];
  pilot: Pilot;
  decisions: Decision[];
  feedback: Feedback[];
  gates: Partial<Record<GateId, boolean>>;
  professional: boolean;
  challenges: Record<number, boolean>;
  /** Week → answers to the twelve review questions. */
  reviews: Record<number, Record<number, string>>;
  /** Boardroom agenda item → evidence level. */
  boardroom: Record<number, EvidenceLevel>;
  /** User-adjusted account-fit weights (criterion id → weight). */
  weights: Record<string, number>;
  /** Show fictional records beside the user's own in the cockpit and pipeline. */
  showSynthetic: boolean;
}

export const EMPTY_PILOT: Pilot = {
  customer: "",
  problem: "",
  baseline: "",
  scope: "",
  criteria: "",
  currentTime: "",
  assistedTime: "",
  corrections: "",
  reviewEffort: "",
  completeness: "",
  feedback: "",
  security: "",
  start: "",
  end: "",
  owner: "",
  nextDecision: "",
  status: "proposed",
};

export const INITIAL_STATE: RevenueState = {
  version: 1,
  day: 1,
  completed: {},
  checks: {},
  reflections: {},
  pains: {},
  questionSet: [],
  accounts: [],
  opportunities: [],
  meetings: [],
  pilot: EMPTY_PILOT,
  decisions: [],
  feedback: [],
  gates: {},
  professional: false,
  challenges: {},
  reviews: {},
  boardroom: {},
  weights: {},
  showSynthetic: true,
};
