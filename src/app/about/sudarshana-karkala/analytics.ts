// Analytics for the profile. Every event the profile reports is declared here
// and goes through the site's existing `trackEvent`: there is one Google
// Analytics installation, and this adds nothing to it but these events.
//
// A parameter is always a value from the profile's own data: the id of a
// project, the kind of a contact action, a route. A link's address and its
// text are never sent, so the telephone number on the page cannot reach
// analytics, and a value that is not a short id or route is dropped.
import { trackEvent } from "@/utils/analytics";

export interface ProfileEvents {
  /** The profile was shown. Not a second `page_view`: the site's own page view is reported by GoogleAnalytics.tsx. */
  profile_view: { page_type: "profile"; profile_name: "sudarshana_karkala" };
  /** A link to one of the organisations the profile names. `section` says which of its places on the page was used. */
  profile_initiative_click: {
    initiative_name: "ishavasyam" | "ev_engineer" | "car_software_systems" | "itelematics" | "thasmai" | "gamyaa";
    destination: string;
    section: "hero" | "primary_initiative" | "initiatives" | "background" | "consulting";
  };
  profile_project_click: { project_name: string; destination: string; section: "selected_work" };
  /** `destination_type` says what kind of place the action leads to, never the place itself. */
  profile_contact_click: { contact_type: "linkedin" | "resume" | "consultation" | "phone" | "contact_page"; destination_type: "external" | "document" | "internal" | "telephone" };
}

export type ProfileEvent = keyof ProfileEvents;

export const PROFILE_VIEW: ProfileEvents["profile_view"] = { page_type: "profile", profile_name: "sudarshana_karkala" };

const EVENTS: readonly string[] = ["profile_view", "profile_initiative_click", "profile_project_click", "profile_contact_click"] satisfies readonly ProfileEvent[];
/** A short id, a host name or a route of this site. No scheme, no query, nothing a person typed. */
const VALUE = /^[a-z0-9_./-]{1,80}$/;
const ATTRIBUTE = "data-profile-";

function clean(params: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && VALUE.test(value)) out[key] = value;
  }
  return out;
}

/** Reports one event. Analytics failing must never disturb the page, so errors stop here. */
export function trackProfile<E extends ProfileEvent>(event: E, params: ProfileEvents[E]): void {
  try {
    trackEvent(event, clean(params));
  } catch {
    // Deliberately ignored.
  }
}

/**
 * Attributes for a server-rendered link. ProfileAnalytics.tsx reports them when
 * the link is used, so the link itself needs no script.
 */
export function profileTracking<E extends Exclude<ProfileEvent, "profile_view">>(event: E, params: ProfileEvents[E]): Record<`data-profile-${string}`, string> {
  const attributes: Record<`data-profile-${string}`, string> = { [`${ATTRIBUTE}event`]: event };
  for (const [key, value] of Object.entries(clean(params))) attributes[`${ATTRIBUTE}${key}`] = value;
  return attributes;
}

/** The event a tracked element declares, read back from its attributes. Null where it declares none of the profile's events. */
export function declaredEvent(element: Element): { event: ProfileEvent; params: Record<string, string> } | null {
  const event = element.getAttribute(`${ATTRIBUTE}event`);
  if (!event || !EVENTS.includes(event)) return null;
  const params: Record<string, string> = {};
  for (const attribute of Array.from(element.attributes)) {
    if (attribute.name.startsWith(ATTRIBUTE) && attribute.name !== `${ATTRIBUTE}event`) params[attribute.name.slice(ATTRIBUTE.length)] = attribute.value;
  }
  return { event: event as ProfileEvent, params: clean(params) };
}
