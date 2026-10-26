// Analytics for the Marketing & Sales framework. Every event the page sends
// from code is declared here and goes through the site's existing
// `trackEvent`; link clicks use `data-track-event` attributes (LINK_EVENTS).
//
// Parameters are short ids from the page's own data — a view, a day number, a
// stage. Nothing a visitor types is ever sent: no account or customer names,
// notes, calculator values, messages or email addresses. A value that is not a
// short lower-case id is dropped.
import { trackEvent } from "@/utils/analytics";

type NoParams = Record<string, never>;

export interface RevenueEvents {
  revenue_framework_start: { source: string };
  revenue_view_open: { view: string };
  daily_mission_view: { day: string };
  daily_mission_complete: { day: string };
  learn_open: { topic: string };
  ask_customer_open: { day: string };
  dont_open: { day: string };
  evidence_submit: { day: string };
  market_map_view: NoParams;
  account_created: NoParams;
  account_scored: { tier: string };
  meeting_prepare: NoParams;
  meeting_complete: NoParams;
  pain_validated: { pain: string };
  pain_invalidated: { pain: string };
  demo_plan_view: NoParams;
  roi_calculated: NoParams;
  revenue_math_calculated: NoParams;
  pilot_created: NoParams;
  proposal_stage_entered: NoParams;
  pipeline_stage_change: { stage: string };
  opportunity_won: NoParams;
  opportunity_lost: NoParams;
  founder_challenge_complete: { week: string };
  mentor_gate_complete: { gate: string };
  mission_search: NoParams;
  flow_stage_view: { flow: string; stage: string };
  customer_role_view: { role: string };
  mission_step_view: { day: string; step: string };
}

export type RevenueEvent = keyof RevenueEvents;

/** Link clicks, reported by the site-wide click listener from `data-track-event`. */
export const LINK_EVENTS = {
  card: "revenue_framework_card_click",
  product: "fai_product_click",
  aqip: "aqip_context_click",
  apply: "apply_internship_click",
  profile: "revenue_framework_profile_click",
  start: "revenue_framework_start",
} as const;

const SAFE_ID = /^[a-z0-9][a-z0-9_-]{0,39}$/;

type ParamsArg<E extends RevenueEvent> = RevenueEvents[E] extends NoParams ? [] : [params: RevenueEvents[E]];

export function trackRevenue<E extends RevenueEvent>(event: E, ...[params]: ParamsArg<E>) {
  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (typeof value === "string" && SAFE_ID.test(value)) safe[key] = value;
  }
  trackEvent(event, safe);
}
