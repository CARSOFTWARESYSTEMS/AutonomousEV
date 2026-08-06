import { describe, expect, it } from "vitest";
import { buildCapabilityMatrix } from "./capabilityMatrix";
import { THREAT_CATALOGUE } from "./data/threatCatalogue";
import { DETECTION_CONTROLS } from "./data/detectionControls";

describe("buildCapabilityMatrix", () => {
  it("sums counts across all evidence statuses to the category total", () => {
    const matrix = buildCapabilityMatrix([
      { label: "Threats", items: THREAT_CATALOGUE },
      { label: "Detection Controls", items: DETECTION_CONTROLS },
    ]);
    for (const row of matrix) {
      const sum = Object.values(row.counts).reduce((a, b) => a + b, 0);
      expect(sum).toBe(row.totalCount);
    }
  });

  it("produces one row per category, in the order given", () => {
    const matrix = buildCapabilityMatrix([
      { label: "A", items: [{ evidenceStatus: "future-roadmap" }] },
      { label: "B", items: [{ evidenceStatus: "available-capability" }] },
    ]);
    expect(matrix.map((r) => r.category)).toEqual(["A", "B"]);
  });

  it("handles an empty category without throwing", () => {
    const matrix = buildCapabilityMatrix([{ label: "Empty", items: [] }]);
    expect(matrix[0].totalCount).toBe(0);
    expect(matrix[0].counts["available-capability"]).toBe(0);
  });
});
