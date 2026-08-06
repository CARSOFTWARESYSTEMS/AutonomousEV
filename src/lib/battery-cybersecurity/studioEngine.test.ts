import { describe, expect, it, vi } from "vitest";
import { runThreatModel } from "./studioEngine";
import { AIRCRAFT_PROFILES } from "./data/aircraftProfiles";
import { COMPONENTS } from "./data/components";
import { ENTRY_POINTS } from "./data/entryPoints";
import { FLIGHT_PHASES } from "./data/flightPhases";
import { DETECTION_CONTROLS } from "./data/detectionControls";
import { THREAT_CATALOGUE } from "./data/threatCatalogue";
import { SCENARIO_PRESETS } from "./data/scenarioPresets";
import type { StudioDataset } from "./types";

const dataset: StudioDataset = {
  aircraftProfiles: AIRCRAFT_PROFILES,
  components: COMPONENTS,
  entryPoints: ENTRY_POINTS,
  threats: THREAT_CATALOGUE,
  flightPhases: FLIGHT_PHASES,
  detectionControls: DETECTION_CONTROLS,
};

describe("runThreatModel — production dataset", () => {
  it("resolves valid:true for every scenario preset", () => {
    for (const preset of SCENARIO_PRESETS) {
      const result = runThreatModel(
        {
          aircraftProfileId: preset.aircraftProfileId,
          componentId: preset.componentId,
          entryPointId: preset.entryPointId,
          threatId: preset.threatId,
          flightPhaseId: preset.flightPhaseId,
        },
        dataset
      );
      expect(result.valid, `preset "${preset.id}" should be valid: ${result.validationMessage}`).toBe(true);
    }
  });

  it("produces a non-empty propagation path and narrative for a valid preset", () => {
    const preset = SCENARIO_PRESETS[0];
    const result = runThreatModel(preset, dataset);
    expect(result.propagationPath.length).toBeGreaterThan(0);
    expect(result.consequenceNarrative.length).toBeGreaterThan(0);
    expect(result.propagationPath[0].componentId).toBe(preset.componentId);
  });

  it("rolls up evidence status to the weakest value across threat and recommended controls", () => {
    const preset = SCENARIO_PRESETS[0];
    const result = runThreatModel(preset, dataset);
    const allStatuses = [
      THREAT_CATALOGUE.find((t) => t.id === preset.threatId)!.evidenceStatus,
      ...result.recommendedDetectionControls.map((c) => c.evidenceStatus),
      ...result.recommendedMitigationControls.map((c) => c.evidenceStatus),
    ];
    const order = ["future-roadmap", "research-in-progress", "demonstration-poc", "available-capability"];
    const expectedWeakest = allStatuses.reduce((weakest, status) =>
      order.indexOf(status) < order.indexOf(weakest) ? status : weakest
    );
    expect(result.evidenceStatus).toBe(expectedWeakest);
  });

  it("never calls fetch — fully deterministic, no network/AI calls", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw new Error("fetch should never be called");
    });
    for (const preset of SCENARIO_PRESETS) {
      runThreatModel(preset, dataset);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("returns the same result for the same input (pure function)", () => {
    const preset = SCENARIO_PRESETS[0];
    const first = runThreatModel(preset, dataset);
    const second = runThreatModel(preset, dataset);
    expect(first).toEqual(second);
  });
});

describe("runThreatModel — invalid combinations", () => {
  it("rejects an unknown threat id without throwing", () => {
    const result = runThreatModel(
      {
        aircraftProfileId: "passenger-evtol",
        componentId: "bms",
        entryPointId: "vehicle-network-bus",
        threatId: "not-a-real-threat",
        flightPhaseId: "climb",
      },
      dataset
    );
    expect(result.valid).toBe(false);
    expect(result.validationMessage).toMatch(/unknown threat/i);
  });

  it("rejects a component the entry point cannot reach", () => {
    const result = runThreatModel(
      {
        aircraftProfileId: "passenger-evtol",
        componentId: "propulsion",
        entryPointId: "ground-diagnostic-port",
        threatId: "falsified-soc",
        flightPhaseId: "climb",
      },
      dataset
    );
    expect(result.valid).toBe(false);
    expect(result.validationMessage).toBeTruthy();
  });

  it("rejects a threat/entry-point mismatch", () => {
    const result = runThreatModel(
      {
        aircraftProfileId: "passenger-evtol",
        componentId: "bms",
        entryPointId: "charging-interface",
        threatId: "falsified-soc",
        flightPhaseId: "climb",
      },
      dataset
    );
    expect(result.valid).toBe(false);
  });
});
