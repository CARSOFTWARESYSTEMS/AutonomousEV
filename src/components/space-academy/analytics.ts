// Academy analytics. Events carry only the mission, step, level and outcome:
// never anything a learner typed, and nothing that identifies them.
import { trackEvent } from "@/utils/analytics";

export type AcademyEvent =
  | "academy_level_change"
  | "academy_enquiry_path"
  | "academy_track_level_view"
  | "lesson_start"
  | "lesson_step_view"
  | "lesson_step_complete"
  | "lesson_check"
  | "lesson_hint"
  | "lesson_complete"
  | "lesson_reset"
  | "lesson_view_mode"
  | "lesson_fault_toggle"
  | "lesson_viewer_fallback";

export function academyEvent(name: AcademyEvent, params: Record<string, string | number | boolean> = {}) {
  trackEvent(name, { ...params, page_path: typeof window !== "undefined" ? window.location.pathname : "" });
}
