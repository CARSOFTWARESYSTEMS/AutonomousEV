/**
 * Every analytics event the APEX microsite reports, declared once.
 *
 * Events go through the site's existing Google Analytics installation with a
 * `site_namespace` of "apex", so APEX traffic can be separated from the rest
 * of the site and the namespace survives a move to APEX's own property.
 * Parameters are short ids from the microsite's own data — never a typed
 * message, an email address or engineering data.
 */
export const APEX_ANALYTICS_NAMESPACE = "apex";

export const APEX_EVENTS = [
  // Page views
  "apex_home_view",
  "apex_engine_view",
  "apex_system_view",
  "apex_build_validate_view",
  "apex_digital_twin_view",
  "apex_roadmap_view",
  "apex_ecosystem_view",
  "apex_company_view",
  // Views within a page
  "apex_investor_view",
  "apex_technical_view",
  // Exploration
  "apex_capability_open",
  "apex_partner_open",
  "apex_system_domain_open",
  "apex_engine_block_open",
  "apex_lifecycle_open",
  "apex_loop_step",
  "apex_gallery_open",
  "apex_partner_interest",
  // Navigation and contact
  "apex_nav_click",
  "apex_cta_click",
  "apex_official_site_click",
  "apex_collaboration_click",
  "apex_email_click",
  "apex_partner_site_click",
  "apex_theme_change",
] as const;

export type ApexEvent = (typeof APEX_EVENTS)[number];

export const APEX_PAGE_VIEW_EVENT: Record<string, ApexEvent> = {
  home: "apex_home_view",
  engine: "apex_engine_view",
  system: "apex_system_view",
  "build-validate": "apex_build_validate_view",
  "digital-twin": "apex_digital_twin_view",
  roadmap: "apex_roadmap_view",
  ecosystem: "apex_ecosystem_view",
  company: "apex_company_view",
};
