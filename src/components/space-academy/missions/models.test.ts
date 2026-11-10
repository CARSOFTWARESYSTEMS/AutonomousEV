import { describe, expect, it } from "vitest";
import { canInstall, evaluateBudget, idQuestions, INSTALLABLE, INTERNAL, sunlitPowerW, DEFAULT_DESIGN, type PartId } from "./cubesat/model";
import { checkSurvival, DEFAULT_EPS, eclipseFraction, orbitEnergyBalance, orbitSummary, simulateEps, type EpsConfig } from "./eclipse/model";
import { centreOfPressure, checkRocket, DEFAULT_ROCKET, evaluateRocket, type RocketDesign } from "./rocket/model";
import { orbitAngle, inShadow } from "./eclipse/geometry";

describe("Build Your First CubeSat", () => {
  it("installs inside-out: panels only after every internal part, the antenna last", () => {
    expect(canInstall([], "antenna").ok).toBe(false);
    expect(canInstall([], "panels").ok).toBe(false);
    expect(canInstall(["payload", "battery"], "panels").reason).toMatch(/Install the parts that go inside first/);
    expect(canInstall(INTERNAL, "antenna").ok).toBe(false);
    let installed: PartId[] = [];
    for (const id of INSTALLABLE) {
      expect(canInstall(installed, id).ok, id).toBe(true);
      installed = [...installed, id];
    }
    expect(canInstall(installed, "radio").ok).toBe(false);
  });

  it("asks identification questions whose answers are real, installable parts", () => {
    for (const level of ["foundation", "advanced"] as const) {
      const qs = idQuestions(level);
      expect(qs).toHaveLength(3);
      qs.forEach((q) => expect(INSTALLABLE).toContain(q.answer));
    }
  });

  it("follows P = S·A·η·cos θ: half the power at 60°", () => {
    expect(sunlitPowerW("body", 60)).toBeCloseTo(sunlitPowerW("body", 0) / 2, 6);
    expect(sunlitPowerW("wings", 0)).toBeCloseTo(3 * sunlitPowerW("body", 0), 6);
  });

  it("makes the budget a real trade: the default fails, body panels cannot power the basic camera, and one design closes at Advanced", () => {
    expect(evaluateBudget(DEFAULT_DESIGN, "foundation").pass).toBe(false);
    expect(evaluateBudget({ payload: "basic", solar: "body", txDuty: 0.1 }, "foundation").checks.find((c) => c.id === "power")?.pass).toBe(false);
    expect(evaluateBudget({ payload: "basic", solar: "wings", txDuty: 0.1 }, "foundation").pass).toBe(true);
    expect(evaluateBudget({ payload: "hd", solar: "wings", txDuty: 0.2 }, "foundation").pass).toBe(true);
    expect(evaluateBudget({ payload: "spectrometer", solar: "wings", txDuty: 0.15 }, "foundation").checks.find((c) => c.id === "mass")?.pass).toBe(false);
    // Advanced: only the basic camera with wings keeps a 10% mass margin and closes power at 45°.
    const passing = (["basic", "hd", "spectrometer"] as const).flatMap((payload) =>
      (["body", "wings"] as const).flatMap((solar) => [0.1, 0.15, 0.2, 0.3].map((txDuty) => ({ payload, solar, txDuty }))),
    ).filter((d) => evaluateBudget(d, "advanced").pass);
    expect(passing.length).toBeGreaterThan(0);
    passing.forEach((d) => expect(d).toMatchObject({ payload: "basic", solar: "wings" }));
  });

  it("requires enough radio time for the payload's data", () => {
    const r = evaluateBudget({ payload: "hd", solar: "wings", txDuty: 0.1 }, "foundation");
    expect(r.checks.find((c) => c.id === "downlink")?.pass).toBe(false);
  });
});

describe("Survive the Eclipse", () => {
  it("matches textbook orbit figures: about 92 minutes and 36 minutes of shadow at 400 km", () => {
    const o = orbitSummary(400);
    expect(o.periodMin).toBeCloseTo(92.4, 0);
    expect(o.eclipseMin).toBeCloseTo(36, 0);
  });

  it("spends a smaller share of each orbit in shadow as altitude rises", () => {
    expect(eclipseFraction(300)).toBeGreaterThan(eclipseFraction(600));
    expect(eclipseFraction(600)).toBeGreaterThan(eclipseFraction(1000));
  });

  it("places the satellite in the shadow exactly during the simulated eclipse", () => {
    const alt = 500;
    const f = eclipseFraction(alt);
    expect(inShadow(orbitAngle(0.1, alt), alt)).toBe(false);
    expect(inShadow(orbitAngle(1 - f / 2, alt), alt)).toBe(true);
    expect(inShadow(orbitAngle(1 - f - 0.02, alt), alt)).toBe(false);
  });

  it("is energy-positive per orbit only with deployable wings and imaging in sunlight", () => {
    const combos = (["body", "wings"] as const).flatMap((solar) => (["always", "sunlit"] as const).map((imaging) => ({ solar, imaging })));
    const positive = combos.filter((c) => orbitEnergyBalance({ ...DEFAULT_EPS, ...c }).netWh > 0);
    expect(positive).toEqual([{ solar: "wings", imaging: "sunlit" }]);
  });

  it("never stores more energy than the battery holds", () => {
    const r = simulateEps({ ...DEFAULT_EPS, solar: "wings", imaging: "sunlit", cells: 4 });
    r.samples.forEach((s) => expect(s.socPct).toBeLessThanOrEqual(100.0001));
  });

  const run = (c: Partial<EpsConfig>) => simulateEps({ ...DEFAULT_EPS, solar: "wings", imaging: "sunlit", ...c });

  it("starts unsolved and becomes solvable at the Foundation level", () => {
    expect(checkSurvival(simulateEps(DEFAULT_EPS), "foundation").pass).toBe(false);
    expect(checkSurvival(run({ cells: 1 }), "foundation").pass).toBe(true);
    // A fault breaks the one-pack design; safe mode or a second pack recovers it.
    const string1 = { cells: 1, faults: ["string" as const] };
    expect(checkSurvival(run(string1), "foundation", { faultChallenge: true, config: { ...DEFAULT_EPS, solar: "wings", imaging: "sunlit", ...string1 } }).pass).toBe(false);
    const string2 = { cells: 2, faults: ["string" as const] };
    expect(checkSurvival(run(string2), "foundation", { faultChallenge: true, config: { ...DEFAULT_EPS, solar: "wings", imaging: "sunlit", ...string2 } }).pass).toBe(true);
  });

  it("has an Advanced fault answer that needs both faults, at most two packs and a real hysteresis band", () => {
    const good: EpsConfig = { ...DEFAULT_EPS, solar: "wings", imaging: "sunlit", cells: 2, faults: ["ageing", "string"], safeMode: true, safeEnterPct: 40, safeExitPct: 70 };
    expect(checkSurvival(simulateEps(good), "advanced", { faultChallenge: true, config: good }).pass).toBe(true);
    const tooMany = { ...good, cells: 3 };
    expect(checkSurvival(simulateEps(tooMany), "advanced", { faultChallenge: true, config: tooMany }).pass).toBe(false);
    const noBand = { ...good, safeEnterPct: 50, safeExitPct: 50 };
    expect(checkSurvival(simulateEps(noBand), "advanced", { faultChallenge: true, config: noBand }).pass).toBe(false);
    const oneFault = { ...good, faults: ["ageing" as const] };
    expect(checkSurvival(simulateEps(oneFault), "advanced", { faultChallenge: true, config: oneFault }).pass).toBe(false);
  });
});

describe("Design a Stable Model Rocket", () => {
  it("reproduces a hand-worked Barrowman example", () => {
    const d: RocketDesign = { ...DEFAULT_ROCKET, noseShape: "ogive", noseLengthMm: 100, bodyLengthMm: 400, finCount: 3, rootChordMm: 70, tipChordMm: 40, spanMm: 50, sweepMm: 30 };
    const cp = centreOfPressure(d);
    expect(cp.noseXMm).toBeCloseTo(46.6, 1);
    expect(cp.finCn).toBeCloseTo(10.13, 1);
    expect(cp.finXMm).toBeCloseTo(457.7, 0);
    expect(cp.xMm).toBeCloseTo(389.9, 0);
  });

  it("moves the CG forward with nose ballast and the CP aft with bigger fins", () => {
    expect(evaluateRocket({ ...DEFAULT_ROCKET, ballastG: 20 }).cg.xMm).toBeLessThan(evaluateRocket(DEFAULT_ROCKET).cg.xMm);
    expect(evaluateRocket({ ...DEFAULT_ROCKET, spanMm: 60 }).cp.xMm).toBeGreaterThan(evaluateRocket(DEFAULT_ROCKET).cp.xMm);
    expect(centreOfPressure({ ...DEFAULT_ROCKET, finCount: 4 }).finCn).toBeGreaterThan(centreOfPressure(DEFAULT_ROCKET).finCn);
  });

  it("loses margin with a heavier motor, as the lesson teaches", () => {
    expect(evaluateRocket(DEFAULT_ROCKET, "heavyMotor").margin).toBeLessThan(evaluateRocket(DEFAULT_ROCKET).margin);
  });

  it("starts unsolved and is solvable at both levels", () => {
    expect(checkRocket(DEFAULT_ROCKET, "foundation").pass).toBe(false);
    const designs: RocketDesign[] = [];
    for (const spanMm of [30, 40, 50, 60, 70]) for (const ballastG of [0, 5, 10, 15, 20]) for (const motor of ["A", "B", "C"] as const) designs.push({ ...DEFAULT_ROCKET, spanMm, ballastG, motor });
    expect(designs.some((d) => checkRocket(d, "foundation").pass)).toBe(true);
    expect(designs.some((d) => checkRocket(d, "advanced").pass)).toBe(true);
  });
});
