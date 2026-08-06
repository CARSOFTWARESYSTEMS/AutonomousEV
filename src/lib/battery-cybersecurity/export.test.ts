import { describe, expect, it } from "vitest";
import { buildJsonExport, buildMarkdownExport } from "./export";
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

const validResult = runThreatModel(SCENARIO_PRESETS[0], dataset);
const invalidResult = runThreatModel(
  { aircraftProfileId: "passenger-evtol", componentId: "bms", entryPointId: "charging-interface", threatId: "falsified-soc", flightPhaseId: "climb" },
  dataset
);

describe("buildJsonExport", () => {
  it("produces valid, parseable JSON containing the input and result", () => {
    const json = buildJsonExport(validResult);
    const parsed = JSON.parse(json);
    expect(parsed.valid).toBe(true);
    expect(parsed.input).toEqual(validResult.input);
    expect(parsed.propagationPath.length).toBeGreaterThan(0);
  });

  it("never contains an undefined literal", () => {
    const json = buildJsonExport(validResult);
    expect(json).not.toContain("undefined");
  });
});

describe("buildMarkdownExport", () => {
  it("produces a heading and all major sections for a valid result", () => {
    const md = buildMarkdownExport(validResult);
    expect(md).toContain("# Threat-Modelling Studio Result");
    expect(md).toContain("## Propagation Path");
    expect(md).toContain("## Recommended Detection Controls");
    expect(md).toContain("## Residual Risk");
  });

  it("produces a short invalid-selection message without throwing for an invalid result", () => {
    const md = buildMarkdownExport(invalidResult);
    expect(md).toContain("Invalid selection");
    expect(md).not.toContain("## Propagation Path");
  });
});
