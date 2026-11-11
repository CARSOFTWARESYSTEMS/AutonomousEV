import { describe, expect, it } from "vitest";
import {
  BATTERY, CRITERIA, DETECTION, ECLIPSE_MIN, ENERGY_ABOVE_CUTOFF_WH, LOAD_W, ORBIT_MIN, SAFE_MIN_V, STAGES, TELEMETRY,
  actualTrace, eclipseEnergyWh, minutesToCutoff, withoutActionTrace,
} from "./scenario";

describe("the illustrative power-anomaly scenario", () => {
  it("uses a 500 km orbit's real period and worst-case eclipse", () => {
    expect(ORBIT_MIN).toBeCloseTo(94.5, 1);
    expect(ECLIPSE_MIN).toBeCloseTo(35.7, 1);
  });

  it("keeps the six stages of the loop, in order", () => {
    expect(STAGES.map((s) => s.title)).toEqual(["Observe telemetry", "Detect anomaly", "Diagnose fault", "Predict impact", "Recover safely", "Verify recovery"]);
    // Stages run forward in time on the chart.
    STAGES.slice(1).forEach((s, i) => expect(s.at).toBeGreaterThan(STAGES[i].at));
  });

  it("adds up at every stage: two cells in series make the pack voltage, within the pack's limits", () => {
    for (const [stage, t] of Object.entries(TELEMETRY)) {
      expect(t.cell1V + t.cell2V, stage).toBeCloseTo(t.busV, 2);
      expect(t.busV, stage).toBeLessThanOrEqual(BATTERY.fullV);
      expect(t.busV, stage).toBeGreaterThan(BATTERY.cutoffV);
    }
  });

  it("moves through the stages in a physically sensible order", () => {
    const order = ["observe", "detect", "diagnose", "predict", "recover", "verify"] as const;
    const temps = order.map((s) => TELEMETRY[s].batteryTempC);
    // Warms with the fault, cools once charging is slowed in safe mode.
    expect(temps).toEqual([18, 27, 27, 27, 24, 22]);
    expect(order.map((s) => TELEMETRY[s].loadW)).toEqual([4.2, 4.2, 4.2, 4.2, 1.5, 1.5]);
  });

  it("detects only what the rule says: in sunlight below the band, with the array still delivering", () => {
    expect(TELEMETRY.observe.busV).toBeGreaterThanOrEqual(DETECTION.bandV[0]);
    expect(TELEMETRY.detect.busV).toBeLessThan(DETECTION.bandV[0]);
    expect(TELEMETRY.detect.arrayA).toBe(TELEMETRY.observe.arrayA);
  });

  it("predicts a brown-out without action and survival in safe mode, from the same energy", () => {
    expect(minutesToCutoff(LOAD_W.normal)).toBeLessThan(ECLIPSE_MIN);
    expect(minutesToCutoff(LOAD_W.safe)).toBeGreaterThan(ECLIPSE_MIN);
    expect(eclipseEnergyWh(LOAD_W.safe)).toBeLessThan(ENERGY_ABOVE_CUTOFF_WH);
    expect(SAFE_MIN_V).toBeGreaterThanOrEqual(CRITERIA.minBusV);
    expect(TELEMETRY.verify.busV).toBeCloseTo(SAFE_MIN_V, 2);
    expect(TELEMETRY.verify.batteryTempC).toBeLessThanOrEqual(CRITERIA.maxTempC);
  });

  it("draws traces that agree with the numbers in the text", () => {
    const actual = actualTrace();
    expect(Math.min(...actual.map((p) => p.v))).toBeGreaterThanOrEqual(CRITERIA.minBusV);
    expect(actual[actual.length - 1].v).toBeCloseTo(SAFE_MIN_V, 2);
    const without = withoutActionTrace();
    expect(without[without.length - 1].v).toBe(BATTERY.cutoffV);
  });

  it("says in every stage's text what the telemetry says", () => {
    const text = STAGES.map((s) => s.short).join(" ");
    expect(text).toMatch(/6\.9 V/);
    expect(text).toMatch(/2\.92 V against 3\.98 V/);
    expect(text).toMatch(new RegExp(`about ${Math.round(minutesToCutoff(LOAD_W.normal))} minutes into the next ${Math.round(ECLIPSE_MIN)}-minute eclipse`));
    expect(text).toMatch(/operator approves it before it runs/);
  });
});
