import { describe, expect, it } from "vitest";
import { buildAttackSurfaceNodes, buildFlightPhaseNodes, buildKnowledgeGraphNodes } from "./explorerMappers";
import { COMPONENTS } from "./data/components";
import { ENTRY_POINTS } from "./data/entryPoints";
import { THREAT_CATALOGUE } from "./data/threatCatalogue";
import { DETECTION_CONTROLS } from "./data/detectionControls";
import { FLIGHT_PHASE_PROFILES } from "./data/flightPhaseProfiles";

describe("buildAttackSurfaceNodes", () => {
  const nodes = buildAttackSurfaceNodes(COMPONENTS, ENTRY_POINTS, THREAT_CATALOGUE, DETECTION_CONTROLS);

  it("produces one node per component, preserving order", () => {
    expect(nodes.map((n) => n.id)).toEqual(COMPONENTS.map((c) => c.id));
  });

  it("every node has all four detail sections populated (never an empty array)", () => {
    for (const node of nodes) {
      expect(node.detailSections).toHaveLength(4);
      for (const section of node.detailSections) {
        expect(Array.isArray(section.body) ? section.body.length : section.body.length).toBeGreaterThan(0);
      }
    }
  });

  it("the BMS node lists threats that actually affect it in the source data", () => {
    const bms = nodes.find((n) => n.id === "bms")!;
    const threatsSection = bms.detailSections.find((s) => s.heading === "Threats")!;
    expect(threatsSection.body).toContain("Falsified State of Charge (SOC)");
  });
});

describe("buildFlightPhaseNodes", () => {
  const nodes = buildFlightPhaseNodes(FLIGHT_PHASE_PROFILES);

  it("produces nodes sorted by the profile's order field", () => {
    expect(nodes[0].id).toBe("ground");
    expect(nodes[nodes.length - 1].id).toBe("maintenance");
    expect(nodes).toHaveLength(10);
  });

  it("every node has all six detail sections", () => {
    for (const node of nodes) {
      expect(node.detailSections.map((s) => s.heading)).toEqual([
        "Threats",
        "Attack Surface",
        "Detection",
        "Mitigation",
        "Operational Impact",
        "Verification",
      ]);
    }
  });
});

describe("buildKnowledgeGraphNodes", () => {
  const nodes = buildKnowledgeGraphNodes(THREAT_CATALOGUE, DETECTION_CONTROLS);

  it("produces one node per threat with a severity badge", () => {
    expect(nodes).toHaveLength(THREAT_CATALOGUE.length);
    for (const node of nodes) {
      expect(node.badge).toEqual({ kind: "severity", value: expect.any(String) });
    }
  });

  it("resolves detection control ids to real control names, not raw ids", () => {
    const node = nodes.find((n) => n.id === "falsified-soc")!;
    const detectionSection = node.detailSections.find((s) => s.heading === "Detection Rule(s)")!;
    expect(detectionSection.body).toContain("Physics-Based Plausibility Checks");
  });

  it("includes the full Threat -> Attack -> Asset -> Detection -> Evidence -> Mitigation -> Verification -> Residual Risk chain", () => {
    const headings = nodes[0].detailSections.map((s) => s.heading);
    expect(headings).toEqual(["Attack", "Asset", "Detection Rule(s)", "Evidence", "Mitigation", "Verification", "Residual Risk"]);
  });
});
