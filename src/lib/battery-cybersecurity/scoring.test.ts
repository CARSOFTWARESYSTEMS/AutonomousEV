import { describe, expect, it } from "vitest";
import { scoreConsequence } from "./scoring";

describe("scoreConsequence", () => {
  it("returns low for the weakest combination", () => {
    expect(scoreConsequence("low", "rare", 1)).toBe("low");
  });

  it("returns critical for the strongest combination", () => {
    expect(scoreConsequence("critical", "likely", 5)).toBe("critical");
  });

  it("weights severity more heavily than likelihood or flight phase", () => {
    const highSeverityLowOthers = scoreConsequence("critical", "rare", 1);
    const lowSeverityHighOthers = scoreConsequence("low", "likely", 5);
    expect(highSeverityLowOthers).not.toBe("low");
    expect(lowSeverityHighOthers).not.toBe("critical");
  });

  it("is monotonic in flight phase weight for a fixed severity/likelihood", () => {
    const weights: number[] = [1, 2, 3, 4, 5];
    const order = ["low", "medium", "high", "critical"];
    let lastIndex = -1;
    for (const w of weights) {
      const result = scoreConsequence("medium", "possible", w);
      const idx = order.indexOf(result);
      expect(idx).toBeGreaterThanOrEqual(lastIndex);
      lastIndex = idx;
    }
  });
});
