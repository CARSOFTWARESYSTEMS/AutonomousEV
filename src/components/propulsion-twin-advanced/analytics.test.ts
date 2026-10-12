import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { advancedTwinLinkTracking, resetAdvancedTwinTracking, trackAdvancedTwin, trackAdvancedTwinOnce } from "./analytics";

const trackEvent = vi.fn();
vi.mock("@/utils/analytics", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));

beforeEach(() => {
  trackEvent.mockReset();
  resetAdvancedTwinTracking();
});

describe("advanced twin analytics", () => {
  it("declares exactly the learning events of the brief", () => {
    const source = fs.readFileSync(path.resolve(import.meta.dirname, "analytics.ts"), "utf-8");
    const declared = [...source.slice(source.indexOf("export interface AdvancedTwinEvents"), source.indexOf("export type AdvancedTwinEvent ")).matchAll(/^ {2}([a-z0-9_]+):/gm)].map((m) => m[1]);
    expect(declared).toEqual([
      "advanced_twin_page_view",
      "module_open",
      "pressure_sensor_selected",
      "pressure_path_started",
      "pressure_path_completed",
      "physics_model_opened",
      "digital_twin_architecture_opened",
      "ai_model_opened",
      "fault_injected",
      "fault_detected",
      "diagnosis_opened",
      "root_cause_completed",
      "prediction_opened",
      "cto_mode_opened",
      "week_module_opened",
      "week_module_completed",
      "desktop_3d_entered",
      "profile_clicked",
    ]);
  });

  it("tags every event with the experience, so generic names can be told apart from the rest of the site", () => {
    trackAdvancedTwin("module_open", { module: "pressure" });
    trackAdvancedTwin("prediction_opened");
    expect(trackEvent.mock.calls).toEqual([
      ["module_open", { experience: "advanced_propulsion_twin", module: "pressure" }],
      ["prediction_opened", { experience: "advanced_propulsion_twin" }],
    ]);
  });

  it("drops anything that is not a short fixed id: no telemetry values and no free text reach analytics", () => {
    const send = trackAdvancedTwin as unknown as (event: string, params: Record<string, unknown>) => void;
    send("pressure_sensor_selected", { sensor: "pc_a", value: 99.72, note: "Chamber pressure fell by 5 %", nested: { a: 1 } });
    expect(trackEvent).toHaveBeenCalledWith("pressure_sensor_selected", { experience: "advanced_propulsion_twin", sensor: "pc_a" });
  });

  it("reports a once-only event once for the same parameters", () => {
    trackAdvancedTwinOnce("week_module_completed", { week: "week_3" });
    trackAdvancedTwinOnce("week_module_completed", { week: "week_3" });
    trackAdvancedTwinOnce("week_module_completed", { week: "week_4" });
    expect(trackEvent).toHaveBeenCalledTimes(2);
  });

  it("never lets an analytics failure reach the tutorial", () => {
    trackEvent.mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => trackAdvancedTwin("cto_mode_opened")).not.toThrow();
  });

  it("gives server-rendered links their tracking as data attributes", () => {
    expect(advancedTwinLinkTracking("profile_clicked", { placement: "prepared_by" })).toEqual({ "data-track-event": "profile_clicked", "data-track-experience": "advanced_propulsion_twin", "data-track-placement": "prepared_by" });
  });
});
