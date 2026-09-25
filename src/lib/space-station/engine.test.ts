import { describe, expect, it } from "vitest";
import { circularOrbit, eclipseFraction, atmosphericDensity, dragDecay, groundTrack, nodeShiftPerOrbitDeg } from "./orbit";
import { simulatePowerOrbit, sunlitGenerationKW, requiredArrayArea, POWER_DEFAULTS, POWER_ASSUMPTIONS } from "./power";
import { estimateEclss, ECLSS_DEFAULTS, WATER_PER_O2, H2_PER_CO2, WATER_PER_CO2 } from "./eclss";
import { sizeRadiator, THERMAL_DEFAULTS } from "./thermal";
import { allowedClosingRate, checkCapture, checkCorridor, stageForRange, advanceRange, DOCKING_STAGES, initialDock, tickDock, DOCK_START_RANGE_M, type DockSim } from "./docking";
import { runTwin } from "./twin";
import { designStation, DESIGN_DEFAULTS } from "./designer";
import { planExperiment, EXPERIMENT_DEFAULTS, LIFECYCLE_STAGES } from "./experiment";
import { generateQuestion } from "./questions";

describe("orbital calculations", () => {
  it("matches hand-calculated LEO period and velocity at 400 km", () => {
    const o = circularOrbit(400);
    expect(o.periodS / 60).toBeCloseTo(92.56, 1);
    expect(o.velocityMs).toBeCloseTo(7669, -1);
    expect(o.orbitsPerDay).toBeCloseTo(15.56, 1);
  });

  it("gives a ~24 h period at geostationary radius", () => {
    expect(circularOrbit(35_786).periodS / 3600).toBeCloseTo(23.93, 1);
  });

  it("computes about 39% eclipse at β = 0 for 400 km, and none at high β", () => {
    expect(eclipseFraction(400, 0)).toBeCloseTo(0.39, 2);
    expect(eclipseFraction(400, 75)).toBe(0);
    expect(eclipseFraction(400, 50)).toBeLessThan(eclipseFraction(400, 0));
  });

  it("density decreases with altitude and scales with solar activity", () => {
    expect(atmosphericDensity(300)).toBeGreaterThan(atmosphericDensity(400));
    expect(atmosphericDensity(400, "high")).toBeCloseTo(atmosphericDensity(400) * 3, 20);
    expect(atmosphericDensity(400)).toBeCloseTo(3.725e-12, 15);
  });

  it("drag decay is larger at lower altitude and needs positive reboost Δv", () => {
    const base = { massKg: 400_000, dragAreaM2: 1500, dragCoefficient: 2.2, activity: "moderate" as const };
    const low = dragDecay({ ...base, altitudeKm: 350 });
    const high = dragDecay({ ...base, altitudeKm: 450 });
    expect(low.altitudeLossKmPerDay).toBeGreaterThan(high.altitudeLossKmPerDay);
    expect(high.reboostDeltaVMsPerYear).toBeGreaterThan(0);
    // Order-of-magnitude sanity: tens of metres per day to a few hundred at 400 km for a large station.
    const mid = dragDecay({ ...base, altitudeKm: 400 });
    expect(mid.altitudeLossKmPerDay).toBeGreaterThan(0.01);
    expect(mid.altitudeLossKmPerDay).toBeLessThan(1);
  });

  it("ground track stays within ±inclination and shifts westward each orbit", () => {
    const pts = groundTrack(51.6, 400, 2, 60);
    expect(Math.max(...pts.map((p) => Math.abs(p.latDeg)))).toBeLessThanOrEqual(51.6 + 1e-6);
    expect(nodeShiftPerOrbitDeg(400)).toBeCloseTo(23.2, 0);
    expect(pts[60].lonDeg).toBeLessThan(0);
  });
});

describe("power calculations and battery SOC", () => {
  it("computes sunlit generation from S·A·η·(1−d)·k", () => {
    const p = sunlitGenerationKW({ arrayAreaM2: 100, cellEfficiency: 0.2, degradation: 0 });
    expect(p).toBeCloseTo((1361 * 100 * 0.2 * POWER_ASSUMPTIONS.pointingFactor) / 1000, 6);
  });

  it("default case: battery discharges in eclipse and recovers in sunlight", () => {
    const r = simulatePowerOrbit(POWER_DEFAULTS);
    const eclipse = r.samples.filter((s) => !s.sunlit);
    expect(eclipse.length).toBeGreaterThan(0);
    expect(eclipse.every((s) => s.batteryKW < 0)).toBe(true);
    expect(r.minSoc).toBeLessThan(POWER_DEFAULTS.initialSoc);
    expect(r.eclipseMin).toBeCloseTo(POWER_DEFAULTS.periodMin * (1 - POWER_DEFAULTS.sunlightFraction), 0);
    expect(r.sustainable).toBe(true);
    for (const s of r.samples) {
      expect(s.soc).toBeGreaterThanOrEqual(0);
      expect(s.soc).toBeLessThanOrEqual(1);
    }
  });

  it("closes the energy balance for a constant-load eclipse", () => {
    const input = { ...POWER_DEFAULTS, sunlightFraction: 0, researchLoadKW: 0, initialSoc: 1, batteryCapacityKWh: 1000 };
    const r = simulatePowerOrbit(input);
    const load = input.baseLoadKW + input.crewLoadKW;
    const expectedDrop = (load * (input.periodMin / 60)) / POWER_ASSUMPTIONS.dischargeEfficiency / input.batteryCapacityKWh;
    expect(1 - r.endSoc).toBeCloseTo(expectedDrop, 4);
  });

  it("sheds research load and raises a warning when degradation is severe", () => {
    const r = simulatePowerOrbit({ ...POWER_DEFAULTS, degradation: 0.6, initialSoc: 0.4 });
    expect(r.shedMinutes).toBeGreaterThan(0);
    expect(r.sustainable).toBe(false);
  });

  it("required array area makes the orbit energy-neutral", () => {
    const area = requiredArrayArea(POWER_DEFAULTS);
    const r = simulatePowerOrbit({ ...POWER_DEFAULTS, arrayAreaM2: area, initialSoc: 0.6 });
    expect(r.endSoc).toBeCloseTo(0.6, 2);
  });
});

describe("ECLSS estimates", () => {
  it("uses correct stoichiometry", () => {
    expect(WATER_PER_O2).toBeCloseTo(1.126, 3);
    expect(H2_PER_CO2).toBeCloseTo(0.1832, 3);
    expect(WATER_PER_CO2).toBeCloseTo(0.8187, 3);
  });

  it("scales linearly with crew-days", () => {
    const a = estimateEclss({ ...ECLSS_DEFAULTS, crew: 2, durationDays: 10 });
    const b = estimateEclss({ ...ECLSS_DEFAULTS, crew: 4, durationDays: 10 });
    expect(b.oxygenKg).toBeCloseTo(a.oxygenKg * 2, 6);
    expect(a.crewDays).toBe(20);
  });

  it("closing the loop reduces resupply mass", () => {
    const open = estimateEclss({ ...ECLSS_DEFAULTS, architecture: "open" });
    const partial = estimateEclss({ ...ECLSS_DEFAULTS, architecture: "partial" });
    const closed = estimateEclss({ ...ECLSS_DEFAULTS, architecture: "closed" });
    expect(open.recoveredWaterKg).toBe(0);
    expect(open.launchedOxygenKg).toBeCloseTo(open.oxygenKg, 6);
    expect(partial.resupplyMassKg).toBeLessThan(open.resupplyMassKg);
    expect(closed.resupplyMassKg).toBeLessThan(partial.resupplyMassKg);
    expect(closed.co2ReducedKg).toBeLessThanOrEqual(closed.co2Kg);
  });
});

describe("thermal model assumptions", () => {
  it("emitted flux follows εσT⁴", () => {
    const r = sizeRadiator(THERMAL_DEFAULTS);
    expect(r.emittedWm2).toBeCloseTo(0.85 * 5.670374419e-8 * 280 ** 4, 6);
    expect(r.totalHeatW).toBe(60_000 + 4 * 125 + 15_000);
  });

  it("more payload heat needs more radiator area; hotter radiators need less", () => {
    const base = sizeRadiator(THERMAL_DEFAULTS);
    expect(sizeRadiator({ ...THERMAL_DEFAULTS, payloadKW: 40 }).radiatorAreaM2).toBeGreaterThan(base.radiatorAreaM2);
    expect(sizeRadiator({ ...THERMAL_DEFAULTS, radiatorTempK: 320 }).radiatorAreaM2).toBeLessThan(base.radiatorAreaM2);
  });

  it("flags a radiator that cannot reject heat when facing the Sun", () => {
    const r = sizeRadiator({ ...THERMAL_DEFAULTS, sunViewFactor: 1, solarAbsorptivity: 0.9, radiatorTempK: 250 });
    expect(r.feasible).toBe(false);
    expect(r.radiatorAreaM2).toBe(Infinity);
  });
});

describe("docking model", () => {
  it("has the eight stages in order", () => {
    expect(DOCKING_STAGES.map((s) => s.id)).toEqual(["far-field", "approach", "hold-point", "final-approach", "soft-capture", "hard-capture", "leak-check", "hatch-open"]);
  });

  it("maps range to stage and respects the hold point", () => {
    expect(stageForRange(5000, false)).toBe("far-field");
    expect(stageForRange(1000, false)).toBe("approach");
    expect(stageForRange(100, false)).toBe("hold-point");
    expect(stageForRange(100, true)).toBe("final-approach");
    expect(stageForRange(0, true)).toBe("soft-capture");
  });

  it("tightens the corridor as range falls", () => {
    expect(allowedClosingRate(1000)).toBeGreaterThan(allowedClosingRate(10));
    expect(checkCorridor({ rangeM: 10, closingRateMs: 0.5, lateralOffsetM: 0, angleDeg: 0 }).ok).toBe(false);
    expect(checkCorridor({ rangeM: 10, closingRateMs: 0.04, lateralOffsetM: 0, angleDeg: 0 }).ok).toBe(true);
  });

  it("accepts capture only inside the envelope", () => {
    expect(checkCapture({ rangeM: 0, closingRateMs: 0.05, lateralOffsetM: 0.02, angleDeg: 1 }).ok).toBe(true);
    const bad = checkCapture({ rangeM: 0, closingRateMs: 0.3, lateralOffsetM: 0.3, angleDeg: 8 });
    expect(bad.ok).toBe(false);
    expect(bad.reasons).toHaveLength(3);
    expect(advanceRange(1, 0.5, 10)).toBe(0);
  });
});

describe("digital twin cascades", () => {
  it("is nominal with no failures", () => {
    const r = runTwin([]);
    expect(r.subsystems.every((s) => s.health === "nominal")).toBe(true);
  });

  it("solar degradation plus payload over-draw cascades into load shedding and experiment interruption", () => {
    const r = runTwin(["solar-degraded", "payload-overdraw"]);
    const text = r.cascade.join(" ");
    expect(text).toMatch(/generation falls/);
    expect(text).toMatch(/load shedding/);
    expect(text).toMatch(/Experiment interruption/);
    expect(r.metrics.shedResearchKW).toBeGreaterThan(0);
    expect(r.subsystems.find((s) => s.id === "payloads")?.health).not.toBe("nominal");
  });

  it("CO₂ degradation with more crew produces an ECLSS warning", () => {
    const r = runTwin(["co2-degraded", "crew-increase"]);
    expect(r.subsystems.find((s) => s.id === "eclss")?.health).toBe("warning");
  });

  it("communication loss affects comms and ground", () => {
    const r = runTwin(["comms-loss"]);
    expect(r.subsystems.find((s) => s.id === "comms")?.health).toBe("warning");
    expect(r.subsystems.find((s) => s.id === "ground")?.health).toBe("warning");
  });
});

describe("station designer", () => {
  it("produces a module list with the requested count", () => {
    for (const n of [1, 2, 3, 5, 8]) {
      expect(designStation({ ...DESIGN_DEFAULTS, modules: n }).modules).toHaveLength(n);
    }
    expect(designStation(DESIGN_DEFAULTS).modules[0]).toMatch(/Core/);
  });

  it("flags volume, docking and radiation risks", () => {
    const d = designStation({ ...DESIGN_DEFAULTS, crew: 10, modules: 2, dockingPorts: 1, orbit: "lunar-orbit", radiation: "baseline" });
    expect(d.volumeOk).toBe(false);
    expect(d.dockingOk).toBe(false);
    expect(d.risks.join(" ")).toMatch(/radiation|solar particle/i);
    expect(d.communications).toMatch(/1\.3 s/);
  });

  it("uses user power requirement when given", () => {
    expect(designStation({ ...DESIGN_DEFAULTS, powerRequirementKW: 120 }).powerDemandKW).toBe(120);
    expect(designStation(DESIGN_DEFAULTS).powerDemandKW).toBeGreaterThan(0);
  });

  it("recommends dormancy life support for uncrewed stations", () => {
    expect(designStation({ ...DESIGN_DEFAULTS, crew: 0 }).eclss).toMatch(/Uncrewed/);
  });
});

describe("experiment designer and question generator", () => {
  it("lists the lifecycle from concept to data analysis", () => {
    expect(LIFECYCLE_STAGES[0].stage).toBe("Concept");
    expect(LIFECYCLE_STAGES.at(-1)?.stage).toBe("Data analysis");
    expect(LIFECYCLE_STAGES.map((s) => s.stage)).toContain("Flight qualification");
  });

  it("includes containment and sample return in the plan", () => {
    const p = planExperiment(EXPERIMENT_DEFAULTS);
    expect(p.safety.join(" ")).toMatch(/Multiple levels of containment/);
    expect(p.resources.join(" ")).toMatch(/Sample return/);
    expect(planExperiment({ ...EXPERIMENT_DEFAULTS, externalExposure: true }).platformClass).toMatch(/External/);
  });

  it("generates a structured question with only search-style resources", () => {
    const q = generateQuestion({ discipline: "Life support", subsystem: "ECLSS", environment: "Lunar orbit", trl: "TRL 1–3 (concept)", level: "PhD" });
    expect(q.problem).toMatch(/ECLSS/);
    expect(q.resources.every((r) => r.href.startsWith("https://"))).toBe(true);
    expect(JSON.stringify(q)).not.toMatch(/doi\.org|et al\./i);
  });
});


describe("docking time-stepping", () => {
  const good = { closingRateMs: 0.05, lateralOffsetM: 0.02, angleDeg: 1 };

  it("auto-approaches and stops at the hold point", () => {
    let s: DockSim = { ...initialDock(), phase: "approach" };
    for (let i = 0; i < 20000 && s.phase === "approach"; i++) s = tickDock(s, 1, good);
    expect(s.phase).toBe("hold");
    expect(s.rangeM).toBe(200);
    expect(s.elapsedS).toBeGreaterThan(0);
    expect(initialDock().rangeM).toBe(DOCK_START_RANGE_M);
  });

  it("completes docking with a gentle, aligned final approach", () => {
    let s: DockSim = { ...initialDock(), phase: "final", rangeM: 5 };
    for (let i = 0; i < 5000 && s.phase !== "complete" && s.phase !== "abort"; i++) s = tickDock(s, 1, good);
    expect(s.phase).toBe("complete");
    expect(s.stage).toBe("hatch-open");
  });

  it("aborts when closing too fast near the station", () => {
    const s = tickDock({ ...initialDock(), phase: "final", rangeM: 10 }, 1, { ...good, closingRateMs: 0.5 });
    expect(s.phase).toBe("abort");
    expect(s.reasons.join(" ")).toMatch(/exceeds/);
  });
});
