import { describe, expect, it } from "vitest";
import { TEST_PHASES } from "../data/engineReference";
import { DEFECT_ORDER, MAINTENANCE_THRESHOLD, SEVERITY_LIMIT, STAGE_AT, diagnose, healthState, healthTrend, maintenanceWindow, severityAt, spectrum, stageAt, trend, twinReading, uncertaintyAt, uncertaintyLabel, vibrationLevel, waveform } from "./bearingFault";
import { COLD, PHASE_MS, REFERENCE_RUNNING, THROTTLE_LEVELS, operatingPoint, ramp, scriptedThrottle } from "./engineSim";

const rms = (values: readonly number[]) => Math.sqrt(values.reduce((sum, v) => sum + v * v, 0) / values.length);

describe("simulated engine test: operating point", () => {
  it("has a duration for every phase", () => {
    expect(Object.keys(PHASE_MS)).toEqual(TEST_PHASES.map((p) => p.id));
    for (const ms of Object.values(PHASE_MS)) expect(ms).toBeGreaterThan(0);
  });

  it("is cold through the system check and ready, with the lines chilled by the end of conditioning", () => {
    expect(operatingPoint("system_check", 0.5)).toEqual(COLD);
    expect(operatingPoint("conditioning", 1).conditioning).toBe(1);
    expect(operatingPoint("ready", 0.5)).toMatchObject({ conditioning: 1, valves: 0, chamber: 0, plume: 0 });
  });

  it("starts in order: valves, flow, rotation, combustion, plume", () => {
    // The progress at which each quantity first passes half way.
    const half = (key: "valves" | "flow" | "rotor" | "chamber" | "plume") => {
      for (let p = 0; p <= 1; p += 0.005) if (operatingPoint("start", p)[key] >= 0.5) return p;
      return 1;
    };
    const order = [half("valves"), half("flow"), half("rotor"), half("chamber"), half("plume")];
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(new Set(order).size).toBe(order.length);
  });

  it("does not turn the plume on at once: it develops", () => {
    expect(operatingPoint("start", 0.5).plume).toBe(0);
    expect(operatingPoint("start", 0.8).plume).toBeGreaterThan(0.2);
    expect(operatingPoint("start", 0.8).plume).toBeLessThan(0.9);
  });

  it("reaches mainstage at the end of start, without a step", () => {
    const end = operatingPoint("start", 1);
    const mainstage = operatingPoint("mainstage", 0);
    for (const key of ["valves", "flow", "chamber", "plume", "thermal", "thrust"] as const) expect(end[key]).toBeCloseTo(mainstage[key], 5);
    expect(mainstage).toEqual(REFERENCE_RUNNING);
  });

  it("throttle changes flow, rotation, chamber, plume, heat load and thrust together", () => {
    const full = operatingPoint("throttle", 0.5, 1);
    const low = operatingPoint("throttle", 0.5, 0.4);
    for (const key of ["flow", "rotor", "chamber", "plume", "thermal", "thrust"] as const) expect(low[key]).toBeLessThan(full[key]);
    expect(low.thrust).toBeCloseTo(0.4);
    expect(low.rotor).toBeGreaterThan(0.4);
  });

  it("steps the demonstration through the throttle levels and back to full", () => {
    expect(scriptedThrottle(0)).toBe(1);
    expect(scriptedThrottle(0.55)).toBe(0.4);
    expect(scriptedThrottle(0.95)).toBe(1);
    expect([...THROTTLE_LEVELS]).toEqual([40, 60, 80, 100]);
  });

  it("shuts down in reverse and ends cold apart from residual heat", () => {
    expect(operatingPoint("shutdown", 0).thrust).toBeCloseTo(1);
    const half = operatingPoint("shutdown", 0.5);
    expect(half.plume).toBe(0);
    expect(half.rotor).toBeGreaterThan(0);
    const end = operatingPoint("shutdown", 1);
    expect(end).toMatchObject({ valves: 0, flow: 0, chamber: 0, plume: 0, thrust: 0 });
    expect(end.rotor).toBeCloseTo(0);
    expect(operatingPoint("review", 1).thermal).toBe(0);
  });

  it("keeps every quantity normalised", () => {
    for (const phase of TEST_PHASES) {
      for (let p = 0; p <= 1; p += 0.1) for (const value of Object.values(operatingPoint(phase.id, p, 0.6))) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
    expect(ramp(0.5, 0, 1)).toBe(0.5);
  });
});

describe("bearing degradation", () => {
  it("moves through its stages as severity grows, and stops short of failure", () => {
    expect([0, 0.2, 0.5, 0.8].map(stageAt)).toEqual(["healthy", "early", "anomaly", "diagnosis"]);
    expect(STAGE_AT.healthy).toBe(0);
    expect(SEVERITY_LIMIT).toBeLessThan(1);
  });

  it("raises vibration first and temperature later", () => {
    expect(vibrationLevel(0)).toBe(1);
    expect(vibrationLevel(0.8)).toBeGreaterThan(vibrationLevel(0.4));
    // At the anomaly stage vibration has moved clearly; temperature has barely moved.
    expect(vibrationLevel(0.45) - 1).toBeGreaterThan(0.4);
    expect(waveform(0).length).toBe(180);
  });

  it("names the state without ever calling it a failure", () => {
    expect([0, 0.3, 0.5, 0.8].map(healthState)).toEqual(["nominal", "nominal", "monitor", "degraded"]);
  });

  it("drives the time signal from the same severity: the bursts grow", () => {
    expect(rms(waveform(0.8))).toBeGreaterThan(rms(waveform(0.4)));
    expect(rms(waveform(0.4))).toBeGreaterThan(rms(waveform(0)));
    expect(waveform(0.5)).toEqual(waveform(0.5));
  });

  it("puts the fault in the spectrum at the defect frequency, not at a shaft harmonic", () => {
    const at = (severity: number, order: number) => spectrum(severity).find((l) => Math.abs(l.order - order) < 0.13)!.amplitude;
    expect(Number.isInteger(DEFECT_ORDER)).toBe(false);
    expect(at(0.8, DEFECT_ORDER)).toBeGreaterThan(at(0, DEFECT_ORDER) + 0.4);
    expect(at(0.8, 1)).toBeCloseTo(at(0, 1));
    expect(spectrum(0).some((l) => l.defect)).toBe(false);
    expect(spectrum(0.6).some((l) => l.defect)).toBe(true);
  });

  it("shows the trend rising to the present level", () => {
    const values = trend(0.8);
    expect(values[values.length - 1]).toBeGreaterThan(values[0] + 0.8);
    expect(values[values.length - 1]).toBeCloseTo(vibrationLevel(0.8), 1);
  });

  it("gathers evidence in order and reports confidence as a band, never a number", () => {
    expect(diagnose(0)).toMatchObject({ finding: "No deviation", confidence: "LOW" });
    expect(diagnose(0.2)).toMatchObject({ finding: "Deviation emerging", confidence: "LOW" });
    expect(diagnose(0.5)).toMatchObject({ finding: "Possible bearing degradation", confidence: "MEDIUM" });
    expect(diagnose(0.8)).toMatchObject({ finding: "Possible bearing degradation", confidence: "HIGH" });
    expect(diagnose(0.8).evidence.map((e) => e.label)).toEqual(["Vibration trend", "Spectral feature", "Thermal trend"]);
    for (const s of [0, 0.3, 0.6, 0.9]) expect(JSON.stringify(diagnose(s))).not.toMatch(/failure|\d\.\d/i);
  });
});

describe("digital twin over time", () => {
  it("is healthy in the past, at the present severity now, and worse in the predicted future", () => {
    expect(severityAt(-1, 0.6)).toBe(0);
    expect(severityAt(0, 0.6)).toBeCloseTo(0.6);
    expect(severityAt(1, 0.6)).toBeGreaterThan(0.6);
    expect(severityAt(1, 0)).toBe(0);
  });

  it("observes and estimates up to now, and predicts only after it", () => {
    const past = twinReading(-0.5, 0.6);
    const now = twinReading(0, 0.6);
    const future = twinReading(0.5, 0.6);
    expect(past.observed).not.toBeNull();
    expect(past.predicted).toBeNull();
    expect(now.residual).toBeCloseTo(now.observed! - now.expected);
    expect(now.residual).toBeGreaterThan(past.residual!);
    expect(future.observed).toBeNull();
    expect(future.residual).toBeNull();
    expect(future.estimated).toBeNull();
    expect(future.predicted).toBeLessThan(now.estimated!);
  });

  it("expects nominal behaviour at every time: the reference does not degrade", () => {
    for (const tau of [-1, -0.3, 0, 0.4, 1]) expect(twinReading(tau, 0.7).expected).toBe(1);
  });

  it("has no residual when nothing is wrong", () => {
    expect(twinReading(0, 0).residual).toBeCloseTo(0);
    expect(twinReading(0, 0).estimated).toBe(1);
  });

  it("widens its uncertainty the further ahead it looks, and has none looking back", () => {
    expect(uncertaintyAt(-0.5, 0.6)).toBe(0);
    expect(uncertaintyAt(0.2, 0.6)).toBeLessThan(uncertaintyAt(0.6, 0.6));
    expect(uncertaintyAt(0.6, 0.6)).toBeLessThan(uncertaintyAt(1, 0.6));
    expect([0.1, 0.5, 1].map((tau) => uncertaintyLabel(tau, 0.6))).toEqual(["LOW", "MEDIUM", "HIGH"]);
    const points = healthTrend(0.6);
    const widths = points.filter((p) => p.tau > 0).map((p) => p.high - p.low);
    expect(widths).toEqual([...widths].sort((a, b) => a - b));
    expect(points.filter((p) => p.tau <= 0).every((p) => p.high === p.low)).toBe(true);
  });

  it("gives maintenance as a window, not a single moment, and only when there is a fault", () => {
    const window = maintenanceWindow(0.6)!;
    expect(window.earliest).toBeLessThanOrEqual(window.expected);
    expect(window.earliest).toBeGreaterThan(0);
    expect(maintenanceWindow(0)).toBeNull();
    expect(MAINTENANCE_THRESHOLD).toBeGreaterThan(0);
  });
});
