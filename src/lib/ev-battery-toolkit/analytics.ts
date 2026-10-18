// Analytics for the toolkit. Every event is declared here and goes through the
// site's `trackEvent`. Parameters are fixed ids from the toolkit's own data:
// a value that is not a short lower-case id is dropped before sending.
//
// Never sent: registration numbers, battery serials, battery IDs, customer or
// technician names, notes, measurements, report text or any other value a
// technician types. Nothing from a job card is a parameter of any event.
import { trackEvent } from "@/utils/analytics";

type NoParams = Record<string, never>;

export interface ToolkitEvents {
  ev_battery_toolkit_page_view: NoParams;
  owner_mode_selected: NoParams;
  technician_mode_selected: NoParams;
  owner_symptom_selected: { symptom: string };
  fixed_battery_selected: NoParams;
  swappable_battery_selected: NoParams;
  battery_3d_started: { source: string };
  battery_xray_opened: NoParams;
  pack_exploded: NoParams;
  component_selected: { component: string };
  bms_view_opened: NoParams;
  thermal_view_opened: NoParams;
  cell_view_opened: NoParams;
  fault_selected: { fault: string; mode: "known" | "unknown" };
  fault_injected: { fault: string; mode: "known" | "unknown" };
  vehicle_selected: { vehicle: string };
  diagnosis_started: { context: "real" | "simulation" };
  measurement_completed: { tool: string };
  diagnosis_completed: { context: "real" | "simulation"; status: string };
  repair_workflow_started: NoParams;
  repair_workflow_completed: { outcome: string };
  report_preview_opened: { context: "real" | "simulation" };
  report_generated: { context: "real" | "simulation" };
  mobile_desktop_cta_clicked: { action: string };
  // EVeium vehicle page: ids only — never measurements, serials, notes or fault-code payloads.
  eveium_model_selected: { model: string };
  eveium_real_diagnosis_started: NoParams;
  eveium_safety_screen_completed: { result: string };
  eveium_measurement_entered: { field: string };
  eveium_bms_data_entered: { field: string };
  eveium_fault_candidate_opened: { candidate: string };
  eveium_evidence_gate_failed: { candidate: string };
  eveium_root_cause_selected: { candidate: string };
  eveium_repair_decision_completed: { status: string };
  eveium_report_generated: NoParams;
}

export type ToolkitEvent = keyof ToolkitEvents;

/** Link clicks reported by the site-wide listener from `data-track-event`. */
export const LINK_EVENTS = {
  card: "ev_battery_toolkit_card_clicked",
  externalTool: "external_tool_clicked",
  profile: "profile_clicked",
} as const;

const SAFE_ID = /^[a-z0-9][a-z0-9_-]{0,39}$/;

type ParamsArg<E extends ToolkitEvent> = ToolkitEvents[E] extends NoParams ? [] : [params: ToolkitEvents[E]];

/** Keeps only short lower-case ids. Anything else — names, serials, numbers, free text — is dropped. */
export function sanitizeParams(params: Record<string, unknown> | undefined): Record<string, string> {
  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (typeof value === "string" && SAFE_ID.test(value) && SAFE_ID.test(key)) safe[key] = value;
  }
  return safe;
}

export function trackToolkit<E extends ToolkitEvent>(event: E, ...[params]: ParamsArg<E>) {
  trackEvent(event, sanitizeParams(params as Record<string, unknown> | undefined));
}

/** Ids for statuses and outcomes, so they pass the filter. */
export const toId = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
