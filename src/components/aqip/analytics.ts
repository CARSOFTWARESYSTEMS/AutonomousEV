// Analytics for the AQIP strategy page. Every event the page reports from code
// is declared here and goes through the site's existing `trackEvent`; link
// clicks use the site's `data-track-event` attributes instead (see LINK_EVENTS).
//
// Parameters are fixed ids from the page's own data. Nothing a visitor types is
// ever sent: no calculator values, scorecard answers, search text or names. A
// value that is not a short lower-case id is dropped.
import { trackEvent } from "@/utils/analytics";

type NoParams = Record<string, never>;

export interface AqipEvents {
  aqip_page_view: NoParams;
  aqip_section_view: { section: string };
  aqip_strategy_nav_click: { section: string };
  aqip_header_nav_click: { item: string };
  aqip_ecosystem_menu_open: NoParams;
  aqip_mobile_menu_open: NoParams;
  /** A chapter chosen from the contents ("index") or opened in place on a phone ("chapter"). */
  aqip_chapter_select: { chapter: string; source: "index" | "chapter" };
  aqip_problem_expand: { item: string };
  aqip_quality_graph_interaction: { node: string; view: "network" | "focus" | "explorer" };
  aqip_digital_thread_start: NoParams;
  aqip_digital_thread_complete: NoParams;
  aqip_roadmap_year_select: { year: string };
  aqip_role_select: { item: string };
  aqip_revenue_engine_select: { item: string };
  aqip_roi_calculator_start: NoParams;
  aqip_roi_calculator_complete: NoParams;
  aqip_customer_playbook_open: { item: string };
  aqip_scorecard_complete: { band: string };
  aqip_decision_framework_use: { decision: string };
  aqip_90_day_interaction: { phase: string; action: "check" | "uncheck" | "clear" };
  aqip_policy_toggle: { critical: "true" | "false" };
  aqip_glossary_search: NoParams;
  aqip_view_mode: { mode: "executive" | "full" };
  aqip_print: NoParams;
}

export type AqipEvent = keyof AqipEvents;

/** Events a master/detail list may report when one of its items is opened. */
export type AqipSelectEvent = "aqip_problem_expand" | "aqip_role_select" | "aqip_revenue_engine_select" | "aqip_customer_playbook_open";

/** Link clicks, reported by the site-wide click listener from `data-track-event`. */
export const LINK_EVENTS = {
  cta: "aqip_cta_click",
  source: "aqip_external_source_click",
  profile: "aqip_profile_click",
  evSociety: "aqip_evsociety_click",
  iTelematics: "aqip_itelematics_click",
  ecosystem: "aqip_ecosystem_link_click",
} as const;

const SAFE_ID = /^[a-z0-9][a-z0-9_-]{0,39}$/;

type ParamsArg<E extends AqipEvent> = AqipEvents[E] extends NoParams ? [] : [params: AqipEvents[E]];

export function trackAqip<E extends AqipEvent>(event: E, ...[params]: ParamsArg<E>) {
  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (typeof value === "string" && SAFE_ID.test(value)) safe[key] = value;
  }
  trackEvent(event, safe);
}
