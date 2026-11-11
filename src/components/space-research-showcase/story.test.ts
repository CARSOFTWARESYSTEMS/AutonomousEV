import { describe, expect, it } from "vitest";
import {
  ARRAY_PEAK_W,
  FOCUS,
  LOOP_SECONDS,
  NOMINAL_ARRAY_W,
  PHASES,
  SAFE_ARRAY_W,
  STAGES,
  SUBSYSTEMS,
  SUN_UNIT,
  StoryClock,
  cameraAt,
  chipsFor,
  cutawayAt,
  phaseIndexAt,
  slewAt,
  telemetryFor,
  tonesFor,
} from "./story";

describe("Space Research story", () => {
  it("runs four stages back to back in a 15–20 second loop", () => {
    expect(STAGES.map((s) => s.title)).toEqual(["Spacecraft reveal", "Spacecraft exploration", "Mission health", "Safe recovery"]);
    STAGES.forEach((s, i) => {
      const end = i + 1 < STAGES.length ? STAGES[i + 1].start : LOOP_SECONDS;
      expect(s.start + s.seconds).toBeCloseTo(end);
    });
    expect(LOOP_SECONDS).toBeGreaterThanOrEqual(15);
    expect(LOOP_SECONDS).toBeLessThanOrEqual(20);
  });

  it("puts every phase inside its stage, in order", () => {
    PHASES.forEach((p, i) => {
      const stage = STAGES[p.stage];
      expect(p.start).toBeGreaterThanOrEqual(stage.start);
      expect(p.start).toBeLessThan(stage.start + stage.seconds);
      if (i > 0) expect(p.start).toBeGreaterThan(PHASES[i - 1].start);
      expect(phaseIndexAt(p.start + 0.01)).toBe(i);
    });
    expect(phaseIndexAt(LOOP_SECONDS + 0.01)).toBe(0);
  });

  it("reports phase changes as the clock runs and loops", () => {
    const clock = new StoryClock();
    const seen: number[] = [];
    clock.onPhase((p) => seen.push(p));
    for (let t = 0; t < LOOP_SECONDS + 1; t += 0.05) clock.advance(0.05);
    expect(seen).toEqual([1, 2, 3, 4, 5, 6, 7, 0]);
    clock.jumpToStage(3);
    expect(PHASES[clock.phase].id).toBe("anomaly");
  });

  it("moves the camera smoothly, with no jump where the loop restarts", () => {
    const a = cameraAt(LOOP_SECONDS - 0.001);
    const b = cameraAt(0);
    expect(Math.abs(a.az - b.az)).toBeLessThan(0.05);
    expect(Math.abs(a.el - b.el)).toBeLessThan(0.05);
    expect(Math.abs(a.dist - b.dist)).toBeLessThan(0.001);
    // Never too close to the spacecraft, never too far.
    for (let t = 0; t < LOOP_SECONDS; t += 0.1) {
      const v = cameraAt(t);
      expect(v.dist).toBeGreaterThan(0.85);
      expect(v.dist).toBeLessThan(1.6);
      expect(Math.abs(v.el)).toBeLessThan(25);
    }
    for (const v of Object.values(FOCUS)) expect(v.dist).toBeGreaterThan(0.45);
  });

  it("closes the cutaway and returns to the nominal attitude before the loop restarts", () => {
    expect(cutawayAt(0)).toBe(0);
    expect(cutawayAt(2)).toBe(0);
    expect(cutawayAt(10)).toBe(1);
    expect(cutawayAt(LOOP_SECONDS - 0.01)).toBe(0);
    expect(slewAt(0)).toBe(0);
    expect(slewAt(13)).toBe(0);
    expect(slewAt(16.5)).toBe(1);
    expect(slewAt(LOOP_SECONDS - 0.01)).toBeCloseTo(0, 3);
  });

  it("derives array power from the Sun angle: P = P_max · cos θ", () => {
    expect(Math.hypot(...SUN_UNIT)).toBeCloseTo(1);
    expect(NOMINAL_ARRAY_W).toBeCloseTo(ARRAY_PEAK_W * SUN_UNIT[2], 1);
    expect(NOMINAL_ARRAY_W).toBeLessThan(SAFE_ARRAY_W);
    expect(SAFE_ARRAY_W).toBe(ARRAY_PEAK_W);
  });

  it("tells the recovery story consistently: anomaly, safe mode, recovered", () => {
    expect(telemetryFor("reveal")).toBeNull();
    const health = telemetryFor("health")!;
    const anomaly = telemetryFor("anomaly")!;
    const safe = telemetryFor("safe-mode")!;
    const recovered = telemetryFor("recovered")!;
    expect([health.mode, anomaly.mode, safe.mode, recovered.mode]).toEqual(["Nominal", "Alert", "Safe mode", "Recovered"]);
    // The anomaly lowers the charge; safe mode turns the arrays to the Sun; recovery raises the charge again.
    expect(anomaly.battery).toBeLessThan(health.battery);
    expect(safe.arrayW).toBeGreaterThan(anomaly.arrayW);
    expect(recovered.battery).toBeGreaterThan(safe.battery);
    expect(anomaly.health.find((h) => h.id === "power")?.ok).toBe(false);
    expect(recovered.health.every((h) => h.ok)).toBe(true);
    expect(tonesFor("anomaly").power).toBe("alert");
    expect(chipsFor("anomaly", false)[0].text).toMatch(/simulated/i);
  });

  it("covers every subsystem the brief asks to show", () => {
    expect(SUBSYSTEMS.map((s) => s.name)).toEqual(["Solar arrays", "Battery & EPS", "Onboard computer", "Attitude control", "Thermal control", "Communications"]);
    SUBSYSTEMS.forEach((s) => expect(s.line.length).toBeLessThan(140));
  });
});
