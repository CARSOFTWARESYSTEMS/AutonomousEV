// Analytics for the Next-Generation Rocket Engine Digital Twin. Every event the
// experience reports is declared here and goes through the site's existing
// `trackEvent`; nothing else in the experience talks to the analytics layer.
//
// Parameters are fixed ids from the experience's own data. Free-form text is
// never sent: a value that is not a short lower_snake_case id is dropped.
import { trackEvent } from "@/utils/analytics";
import type { ArchitectureLayer, AudienceMode, ComponentId, ExplodedLevel, FaultId, FlowId, ModeId, RelatedDestination, SensorType, SystemId, TestPhaseId } from "./types";

export type JourneyMilestone = "entered" | "first_component" | "first_flow" | "first_test" | "first_fault" | "first_twin_comparison" | "test_complete";

type NoParams = Record<string, never>;

export interface RocketTwinEvents {
  rocket_twin_enter: NoParams;
  rocket_twin_demo_start: NoParams;
  rocket_twin_build_open: NoParams;
  rocket_twin_systems_open: NoParams;
  rocket_twin_flow_open: NoParams;
  rocket_twin_control_open: NoParams;
  rocket_twin_test_open: NoParams;
  rocket_twin_health_open: NoParams;
  rocket_twin_twin_open: NoParams;
  rocket_twin_architecture_open: NoParams;
  rocket_twin_open_engine: NoParams;
  rocket_twin_throttle: { level: "40" | "60" | "80" | "100" };
  rocket_twin_residual_open: NoParams;
  rocket_twin_layer_select: { layer: ArchitectureLayer };
  rocket_twin_tour_start: NoParams;
  rocket_twin_tour_complete: { completion_status: "completed" | "exited" };
  rocket_twin_component_select: { component_id: ComponentId; system: SystemId; mode: ModeId; audience_mode: AudienceMode };
  rocket_twin_cutaway: { system: SystemId };
  rocket_twin_exploded_view: { level: ExplodedLevel };
  rocket_twin_flow_select: { flow_type: FlowId };
  rocket_twin_sensor_trace: { sensor_type: SensorType; system: SystemId };
  rocket_twin_test_start: NoParams;
  rocket_twin_test_phase: { phase: TestPhaseId };
  rocket_twin_test_complete: { completion_status: "completed" | "aborted" };
  rocket_twin_fault_start: { fault_type: FaultId; system: SystemId };
  rocket_twin_fault_diagnosis_view: { fault_type: FaultId };
  rocket_twin_fault_complete: { fault_type: FaultId };
  rocket_twin_compare_open: NoParams;
  rocket_twin_model_credibility_open: NoParams;
  rocket_twin_prediction_open: { model_type: "reduced_order" };
  rocket_twin_audience_mode: { mode: AudienceMode };
  rocket_twin_profile_click: { placement: "prepared_by" };
  rocket_twin_related_click: { destination: RelatedDestination };
  rocket_twin_mobile_view: NoParams;
  rocket_twin_desktop_recommendation_view: NoParams;
  rocket_twin_journey_milestone: { milestone: JourneyMilestone };
}

export type RocketTwinEvent = keyof RocketTwinEvents;

type ParamsArg<E extends RocketTwinEvent> = RocketTwinEvents[E] extends NoParams ? [] : [params: RocketTwinEvents[E]];

/** The event each mode reports when it is opened. Engine mode is the systems view, and keeps that event's name. */
export const MODE_OPEN_EVENT = {
  engine: "rocket_twin_systems_open",
  build: "rocket_twin_build_open",
  flow: "rocket_twin_flow_open",
  control: "rocket_twin_control_open",
  test: "rocket_twin_test_open",
  health: "rocket_twin_health_open",
  twin: "rocket_twin_twin_open",
  architecture: "rocket_twin_architecture_open",
} as const satisfies Record<ModeId, RocketTwinEvent>;

const ID = /^[a-z0-9_]{1,64}$/;

function clean(params: Record<string, unknown> | undefined): Record<string, string> | undefined {
  if (!params) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && ID.test(value)) out[key] = value;
  }
  return out;
}

// Analytics failing must never disturb the experience, so errors stop here.
function send(event: RocketTwinEvent, params?: Record<string, unknown>): void {
  try {
    const cleaned = clean(params);
    if (cleaned) trackEvent(event, cleaned);
    else trackEvent(event);
  } catch {
    // Deliberately ignored.
  }
}

/** Reports one event. */
export function trackRocketTwinEvent<E extends RocketTwinEvent>(event: E, ...[params]: ParamsArg<E>): void {
  send(event, params);
}

const reported = new Set<string>();

/** Reports an event at most once per page load, however often it is asked for. */
export function trackRocketTwinOnce<E extends RocketTwinEvent>(event: E, ...[params]: ParamsArg<E>): void {
  const key = `${event}:${JSON.stringify(params ?? {})}`;
  if (reported.has(key)) return;
  reported.add(key);
  send(event, params);
}

/** Forgets what has been reported once. For tests. */
export function resetRocketTwinTracking(): void {
  reported.clear();
}

/**
 * `data-track-*` attributes for a server-rendered link. The site-wide click
 * listener in GoogleAnalytics.tsx reports them, so the link needs no script.
 */
export function rocketTwinLinkTracking<E extends RocketTwinEvent>(event: E, ...[params]: ParamsArg<E>): Record<`data-track-${string}`, string> {
  const attributes: Record<`data-track-${string}`, string> = { "data-track-event": event };
  for (const [key, value] of Object.entries(clean(params) ?? {})) attributes[`data-track-${key}`] = value;
  return attributes;
}
