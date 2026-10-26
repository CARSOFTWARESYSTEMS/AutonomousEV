// The Revenue Cockpit's figures, derived from saved records. Qualified
// pipeline counts only opportunities that meet all seven qualification criteria.
import { STAGES, isQualifiedStage } from "../data/scoring";
import type { Account, Feedback, Meeting, Opportunity, PainState } from "../state/model";
import type { PipelineStage } from "../types";
import { accountFit, isFullyQualified } from "./scoring";

export interface CockpitInput {
  accounts: readonly Account[];
  opportunities: readonly Opportunity[];
  meetings: readonly Meeting[];
  pains: Record<string, PainState>;
  painTotal: number;
  feedback: readonly Feedback[];
  decisions: number;
  weights?: Record<string, number>;
}

const probability = Object.fromEntries(STAGES.map((stage) => [stage.id, stage.probability / 100])) as Record<PipelineStage, number>;

const reached = (opportunity: Opportunity, stage: PipelineStage) =>
  opportunity.stage !== "lost" && STAGES.findIndex((s) => s.id === opportunity.stage) >= STAGES.findIndex((s) => s.id === stage);

export function cockpitMetrics(input: CockpitInput) {
  const { accounts, opportunities, meetings, pains, feedback } = input;
  const fits = accounts.map((account) => accountFit(account.ratings, account.evidence, input.weights));
  const open = opportunities.filter((opportunity) => opportunity.stage !== "won" && opportunity.stage !== "lost");
  const qualifiedPipeline = open.filter((opportunity) => isQualifiedStage(opportunity.stage) && isFullyQualified(opportunity.qualified));
  const won = opportunities.filter((opportunity) => opportunity.stage === "won");
  const lost = opportunities.filter((opportunity) => opportunity.stage === "lost");
  const contacted = opportunities.filter((opportunity) => opportunity.stage !== "research");
  const painStates = Object.values(pains);
  const gross = open.reduce((sum, opportunity) => sum + opportunity.value, 0);
  const weighted = open.reduce((sum, opportunity) => sum + opportunity.value * probability[opportunity.stage], 0);
  const qualifiedValue = qualifiedPipeline.reduce((sum, opportunity) => sum + opportunity.value, 0);
  const nextDates = open.map((opportunity) => opportunity.nextDate).filter(Boolean).sort();

  return {
    market: {
      accounts: accounts.length,
      icpFit: fits.filter((fit) => fit.suggestedTier === "A").length,
      segments: new Set(accounts.map((account) => account.category)).size,
      evidence: accounts.reduce((sum, account) => sum + account.evidence, 0),
    },
    buyers: {
      stakeholders: accounts.reduce((sum, account) => sum + account.buyerRoles, 0),
      champions: opportunities.filter((opportunity) => opportunity.qualified.stakeholder).length,
    },
    engagement: {
      outreach: contacted.length,
      meetings: meetings.length,
      replies: opportunities.filter((opportunity) => reached(opportunity, "discovery")).length,
    },
    validation: {
      hypotheses: input.painTotal,
      validated: painStates.filter((pain) => !pain.invalidated && (pain.level === "customer" || pain.level === "pilot" || pain.level === "commercial")).length,
      invalidated: painStates.filter((pain) => pain.invalidated).length,
    },
    commercial: {
      qualified: qualifiedPipeline.length,
      demos: opportunities.filter((opportunity) => reached(opportunity, "demo")).length,
      evaluations: opportunities.filter((opportunity) => reached(opportunity, "evaluation")).length,
      pilots: opportunities.filter((opportunity) => reached(opportunity, "pilot")).length,
      proposals: opportunities.filter((opportunity) => reached(opportunity, "proposal")).length,
      negotiations: opportunities.filter((opportunity) => reached(opportunity, "negotiation")).length,
    },
    pipeline: {
      gross,
      weighted,
      qualifiedValue,
      expectedClose: nextDates[nextDates.length - 1] ?? "",
      average: open.length ? gross / open.length : 0,
    },
    outcomes: {
      won: won.length,
      lost: lost.length,
      revenue: won.reduce((sum, opportunity) => sum + opportunity.value, 0),
    },
    learning: {
      insights: feedback.length,
      objections: meetings.filter((meeting) => meeting.objections.trim()).length,
      lossReasons: new Set(lost.map((opportunity) => opportunity.lossReason).filter(Boolean)).size,
      decisions: input.decisions,
    },
  };
}

export type CockpitMetrics = ReturnType<typeof cockpitMetrics>;
