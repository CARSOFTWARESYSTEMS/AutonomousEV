// Analytics for the Advanced Rocket Propulsion System Digital Twin. Every event
// the tutorial reports is declared here and goes through the site's existing
// `trackEvent`; nothing else in the tutorial talks to the analytics layer.
//
// Events record learning interactions only. Parameters are fixed ids from the
// tutorial's own data; simulated telemetry, free text and anything a learner
// types are never sent, and a value that is not a short lower_snake_case id is
// dropped.
import { trackEvent } from "@/utils/analytics";
import type { FaultId } from "./simulation/isolation";
import type { ModuleId } from "./types";

type NoParams = Record<string, never>;

export interface AdvancedTwinEvents {
  advanced_twin_page_view: NoParams;
  module_open: { module: ModuleId };
  pressure_sensor_selected: { sensor: string };
  pressure_path_started: NoParams;
  pressure_path_completed: NoParams;
  physics_model_opened: { model: string };
  digital_twin_architecture_opened: { view: string };
  ai_model_opened: { model: string };
  fault_injected: { fault: FaultId };
  fault_detected: { fault: FaultId };
  diagnosis_opened: { fault: string };
  root_cause_completed: { fault: string };
  prediction_opened: NoParams;
  cto_mode_opened: NoParams;
  week_module_opened: { week: string };
  week_module_completed: { week: string };
  desktop_3d_entered: NoParams;
  profile_clicked: { placement: "prepared_by" };
}

export type AdvancedTwinEvent = keyof AdvancedTwinEvents;

type ParamsArg<E extends AdvancedTwinEvent> = AdvancedTwinEvents[E] extends NoParams ? [] : [params: AdvancedTwinEvents[E]];

/** Sent with every event, so that these generically named events can be told apart from the rest of the site's. */
const EXPERIENCE = "advanced_propulsion_twin";
const ID = /^[a-z0-9_]{1,64}$/;

function clean(params: Record<string, unknown> | undefined): Record<string, string> {
  const out: Record<string, string> = { experience: EXPERIENCE };
  for (const [key, value] of Object.entries(params ?? {})) {
    if (typeof value === "string" && ID.test(value)) out[key] = value;
  }
  return out;
}

// Analytics failing must never disturb the tutorial, so errors stop here.
function send(event: AdvancedTwinEvent, params?: Record<string, unknown>): void {
  try {
    trackEvent(event, clean(params));
  } catch {
    // Deliberately ignored.
  }
}

/** Reports one event. */
export function trackAdvancedTwin<E extends AdvancedTwinEvent>(event: E, ...[params]: ParamsArg<E>): void {
  send(event, params);
}

const reported = new Set<string>();

/** Reports an event at most once per page load, however often it is asked for. */
export function trackAdvancedTwinOnce<E extends AdvancedTwinEvent>(event: E, ...[params]: ParamsArg<E>): void {
  const key = `${event}:${JSON.stringify(params ?? {})}`;
  if (reported.has(key)) return;
  reported.add(key);
  send(event, params);
}

/** Forgets what has been reported once. For tests. */
export function resetAdvancedTwinTracking(): void {
  reported.clear();
}

/**
 * `data-track-*` attributes for a server-rendered link. The site-wide click
 * listener in GoogleAnalytics.tsx reports them, so the link needs no script.
 */
export function advancedTwinLinkTracking<E extends AdvancedTwinEvent>(event: E, ...[params]: ParamsArg<E>): Record<`data-track-${string}`, string> {
  const attributes: Record<`data-track-${string}`, string> = { "data-track-event": event };
  for (const [key, value] of Object.entries(clean(params))) attributes[`data-track-${key}`] = value;
  return attributes;
}
