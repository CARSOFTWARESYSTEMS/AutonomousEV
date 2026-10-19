// Analytics for the APEX microsite. Every event is declared in
// src/data/apex/analytics.ts and goes through the site's existing
// `trackEvent`; this adds the "apex" namespace and drops any parameter that
// is not a short id, so nothing a visitor types and no engineering data can
// reach analytics.
import { trackEvent } from "@/utils/analytics";
import { APEX_ANALYTICS_NAMESPACE, APEX_EVENTS, type ApexEvent } from "@/data/apex/analytics";

const VALUE = /^[a-z0-9_./-]{1,80}$/;

export type ApexParams = Record<string, string | undefined>;

export function cleanParams(params: ApexParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && /^[a-z_]{1,40}$/.test(key) && VALUE.test(value)) out[key] = value;
  }
  return out;
}

/** Reports one event. Analytics must never disturb the page, so errors stop here. */
export function trackApex(event: ApexEvent, params: ApexParams = {}): void {
  if (!(APEX_EVENTS as readonly string[]).includes(event)) return;
  try {
    trackEvent(event, { site_namespace: APEX_ANALYTICS_NAMESPACE, ...cleanParams(params) });
  } catch {
    // Deliberately ignored.
  }
}

/**
 * Attributes for a link that the site-wide click listener (GoogleAnalytics.tsx)
 * reports when used, so a server-rendered link needs no script of its own.
 */
export function apexTrack(event: ApexEvent, params: ApexParams = {}): Record<string, string> {
  const attributes: Record<string, string> = {
    "data-track-event": event,
    "data-track-site_namespace": APEX_ANALYTICS_NAMESPACE,
  };
  for (const [key, value] of Object.entries(cleanParams(params))) attributes[`data-track-${key}`] = value;
  return attributes;
}
