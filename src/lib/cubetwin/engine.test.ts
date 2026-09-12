import { describe, it, expect } from "vitest";
import {
  cloneScenario,
  validateScenario,
  parseScenario,
  FAULT_TYPES,
  FAULT_INFO,
  presetScenario,
} from "./scenario";
import {
  simulate,
  batteryStep,
  orbitalPeriodSeconds,
  isSunlit,
  openCircuitVoltage,
  stateTransition,
  activeFaults,
  runMonteCarlo,
} from "./engine";
import { exportJson, exportCsv } from "./export";
describe("CubeTwin analytical models", () => {
  it("computes a 500 km circular orbit and altitude trend", () => {
    expect(orbitalPeriodSeconds(500) / 60).toBeCloseTo(94.46907, 3);
    expect(orbitalPeriodSeconds(600)).toBeGreaterThan(
      orbitalPeriodSeconds(400),
    );
    expect(() => orbitalPeriodSeconds(NaN)).toThrow();
  });
  it("integrates constant load with discharge losses", () => {
    const r = batteryStep(32, 38, -8, 3600, 0.95, 0.95);
    expect(r.energyWh).toBeCloseTo(32 - 8 / 0.95, 10);
    expect(r.energyWh + r.lossWh + 8).toBeCloseTo(32, 10);
  });
  it("integrates generation and reports rejected energy at full charge", () => {
    const r = batteryStep(37, 38, 10, 3600, 0.9, 0.9);
    expect(r.energyWh).toBe(38);
    expect(r.rejectedWh).toBeCloseTo(10 - 1 / 0.9);
    expect(r.lossWh).toBeCloseTo(1 / 0.9 - 1);
  });
  it("clamps empty battery and accounts for unmet load", () => {
    const r = batteryStep(1, 40, -10, 3600, 0.9, 0.8);
    expect(r.energyWh).toBe(0);
    expect(r.unmetWh).toBeCloseTo(9.2);
    expect(r.lossWh).toBeCloseTo(0.2);
  });
  it("preserves equilibrium", () =>
    expect(batteryStep(20, 40, 0, 100, 0.95, 0.95).energyWh).toBe(20));
  it("switches exactly at eclipse boundaries", () => {
    expect(isSunlit(3899.999, 6000, 35)).toBe(true);
    expect(isSunlit(3900, 6000, 35)).toBe(false);
    expect(isSunlit(6000, 6000, 35)).toBe(true);
  });
  it("interpolates OCV without inferring SOC from voltage", () => {
    expect(
      openCircuitVoltage(35, cloneScenario().battery.ocvCurve),
    ).toBeCloseTo(7.2);
  });
  it("requires recovery hysteresis and continuous dwell", () => {
    const b = cloneScenario().battery;
    let s = stateTransition({ safe: false, recoverySince: null }, 19, 0, b);
    expect(s.safe).toBe(true);
    s = stateTransition(s, 41, 10, b);
    expect(s.recoverySince).toBe(10);
    expect(stateTransition(s, 41, 129, b).safe).toBe(true);
    expect(stateTransition(s, 41, 130, b).safe).toBe(false);
    expect(stateTransition(s, 39, 100, b).recoverySince).toBe(null);
  });
});
describe("CubeTwin integration and faults", () => {
  it("replays deterministically and closes full-day energy accounting", () => {
    const s = cloneScenario(),
      a = simulate(s),
      b = simulate(s);
    expect(a).toEqual(b);
    expect(a.samples[0].timeSeconds).toBe(0);
    expect(a.samples.at(-1)!.timeSeconds).toBe(86400);
    expect(Math.abs(a.metrics.energyResidualWh)).toBeLessThan(1e-8);
    expect(
      a.samples.every(
        (s) =>
          Number.isFinite(s.voltageV) &&
          s.socPercent >= 0 &&
          s.socPercent <= 95.00001,
      ),
    ).toBe(true);
  });
  it.each(FAULT_TYPES)(
    "applies %s only inside its time window and conserves energy",
    (type) => {
      const s = cloneScenario();
      s.durationSeconds = 3600;
      s.activities = [];
      s.faults = [
        {
          id: "fault",
          type,
          startSecond: 600,
          durationSeconds: 600,
          severity: FAULT_INFO[type].defaultSeverity,
        },
      ];
      const r = simulate(s);
      expect(activeFaults(s.faults, 599).length).toBe(0);
      expect(activeFaults(s.faults, 600).length).toBe(1);
      expect(activeFaults(s.faults, 1200).length).toBe(0);
      expect(
        r.samples.find((x) => x.timeSeconds === 600)?.activeFaultIds,
      ).toEqual(["fault"]);
      expect(
        r.samples.find((x) => x.timeSeconds === 1200)?.activeFaultIds,
      ).toEqual([]);
      expect(Math.abs(r.metrics.energyResidualWh)).toBeLessThan(1e-8);
    },
  );
  it("solar faults reduce delivered generation", () => {
    const s = cloneScenario();
    s.durationSeconds = 600;
    s.activities = [];
    s.faults = [
      {
        id: "solar",
        type: "solar-degradation",
        startSecond: 0,
        durationSeconds: 600,
        severity: 0.5,
      },
    ];
    expect(simulate(s).samples[0].solarW).toBe(9);
  });
  it("separates biased and missing telemetry from truth", () => {
    const s = cloneScenario();
    s.durationSeconds = 600;
    s.activities = [];
    s.faults = [
      {
        id: "bias",
        type: "soc-bias",
        startSecond: 0,
        durationSeconds: 100,
        severity: 15,
      },
      {
        id: "drop",
        type: "telemetry-dropout",
        startSecond: 100,
        durationSeconds: 100,
        severity: 1,
      },
    ];
    const r = simulate(s);
    expect(r.samples[0].observedSocPercent).toBe(95);
    expect(r.samples[0].socPercent).toBe(80);
    expect(
      r.samples.find((x) => x.timeSeconds === 100)?.observedSocPercent,
    ).toBeNull();
  });
  it("increased resistance increases discharge sag and heating", () => {
    const s = cloneScenario();
    s.durationSeconds = 600;
    s.activities = [];
    s.solar.peakPowerW = 0;
    const a = simulate(s);
    s.battery.internalResistanceOhm = 0.5;
    const b = simulate(s);
    expect(b.samples[0].voltageV).toBeLessThan(a.samples[0].voltageV);
    expect(b.metrics.maxTemperatureC!).toBeGreaterThan(
      a.metrics.maxTemperatureC!,
    );
  });
  it("enters safe mode in a heater-stuck scenario and reports affected activities", () => {
    const r = simulate(presetScenario("Heater Stuck On"));
    expect(r.metrics.safeEntries).toBeGreaterThan(0);
    expect(r.events.some((e) => e.message.includes("Safe mode entered"))).toBe(
      true,
    );
  });
  it("validates every preset", () => {
    for (const name of [
      "Baseline",
      "Extended Eclipse",
      "Degraded Solar Array",
      "Aged Battery",
      "Heater Stuck On",
    ])
      expect(() => validateScenario(presetScenario(name))).not.toThrow();
  });
});
describe("scenario security and export", () => {
  it("rejects non-finite, missing and out-of-range inputs", () => {
    for (const value of [
      null,
      {},
      [],
      { ...cloneScenario(), durationSeconds: Infinity },
      { ...cloneScenario(), schemaVersion: "2.0" },
    ])
      expect(() => validateScenario(value)).toThrow();
    const s = cloneScenario();
    s.battery.recoverySocPercent = 10;
    expect(() => validateScenario(s)).toThrow(/safe < reserve/);
  });
  it("bounds total samples and file size", () => {
    const s = cloneScenario();
    s.timeStepSeconds = 1;
    expect(() => validateScenario(s)).toThrow(/20,000/);
    expect(() => parseScenario(" ".repeat(100001))).toThrow(/100 KB/);
    expect(() => parseScenario("{bad}")).toThrow(/valid JSON/);
  });
  it("rejects duplicate IDs and overlapping or out-of-window activities", () => {
    const s = cloneScenario();
    s.activities[1].id = s.activities[0].id;
    expect(() => validateScenario(s)).toThrow(/unique ID/);
    s.activities[1].id = "other";
    s.activities[1].startSecond = 0;
    expect(() => validateScenario(s)).toThrow(/overlap/);
  });
  it("exports all timestamps with scenario version, units and assumptions", () => {
    const s = cloneScenario();
    s.durationSeconds = 600;
    s.activities = [];
    const r = simulate(s),
      json = JSON.parse(exportJson(r)),
      csv = exportCsv(r);
    expect(json.schemaVersion).toBe("1.0");
    expect(json.units.socPercent).toBe("%");
    expect(json.assumptions.length).toBeGreaterThan(5);
    expect(csv.split("\r\n").length).toBe(r.samples.length + 4);
    expect(csv).toContain("timeSeconds [s]");
    expect(json.samples.at(-1).timeSeconds).toBe(600);
  });
});
describe("seeded uncertainty", () => {
  it("replays the same distribution for the same seed", () => {
    const s = cloneScenario();
    s.durationSeconds = 600;
    s.activities = [];
    expect(runMonteCarlo(s, 5, 10)).toEqual(runMonteCarlo(s, 5, 10));
  });
  it("zero uncertainty collapses to deterministic output", () => {
    const s = cloneScenario();
    s.durationSeconds = 600;
    s.activities = [];
    const r = runMonteCarlo(s, 3, 0);
    expect(r.minimumSocDistribution).toEqual(
      Array(3).fill(simulate(s).metrics.minSocPercent),
    );
    expect(() => runMonteCarlo(s, 101)).toThrow();
  });
});

describe('fault effects and import edge cases', () => {
  it.each(['solar-degradation', 'panel-loss'] as const)('%s lowers array output', type => {
    const s=cloneScenario();s.durationSeconds=7200;s.activities=[];s.faults=[{id:'f',type,startSecond:0,durationSeconds:7200,severity:.5}];
    expect(simulate(s).samples[0].solarW).toBe(9);
  });
  it.each(['load-spike','heater-stuck','payload-overrun'] as const)('%s adds the requested load',type=>{
    const s=cloneScenario();s.durationSeconds=7200;s.activities=[];s.faults=[{id:'f',type,startSecond:0,durationSeconds:7200,severity:6}];
    expect(simulate(s).samples[0].loadW).toBe(14);
  });
  it('extended eclipse moves the actual shadow boundary and produces no solar power',()=>{
    const s=cloneScenario();s.durationSeconds=7200;s.activities=[];s.faults=[{id:'f',type:'extended-eclipse',startSecond:0,durationSeconds:7200,severity:15}];
    const r=simulate(s);const boundary=r.periodSeconds-50*60;
    expect(r.samples.find(x=>x.timeSeconds===boundary)?.sunlight).toBe(false);
    expect(r.samples.find(x=>x.timeSeconds===3000)?.solarW).toBe(0);
    expect(simulate({...s,faults:[]}).samples.find(x=>x.timeSeconds===3000)?.solarW).toBe(18);
  });
  it('resolves eclipse boundaries for overlapping fault windows',()=>{
    const s=cloneScenario();s.durationSeconds=12000;s.activities=[];s.faults=[{id:'f1',type:'extended-eclipse',startSecond:0,durationSeconds:12000,severity:10},{id:'f2',type:'extended-eclipse',startSecond:6000,durationSeconds:6000,severity:5}];
    const r=simulate(s);expect(r.samples.find(x=>x.timeSeconds===r.periodSeconds-45*60)?.sunlight).toBe(false);
    expect(r.samples.find(x=>x.timeSeconds===2*r.periodSeconds-50*60)?.sunlight).toBe(false);
  });
  it('capacity-fade removes excess energy explicitly and never creates it on recovery',()=>{
    const s=cloneScenario();s.durationSeconds=600;s.activities=[];s.solar.peakPowerW=0;s.faults=[{id:'f',type:'capacity-fade',startSecond:0,durationSeconds:300,severity:.5}];
    const r=simulate(s);expect(r.metrics.capacityRemovedWh).toBeCloseTo(13);expect(r.samples.find(x=>x.timeSeconds===300)!.energyWh).toBeLessThan(19);expect(Math.abs(r.metrics.energyResidualWh)).toBeLessThan(1e-8);
  });
  it('charge efficiency fault stores less energy and resistance fault creates more sag',()=>{
    const s=cloneScenario();s.durationSeconds=600;s.activities=[];const baseline=simulate(s);s.faults=[{id:'f',type:'charge-loss',startSecond:0,durationSeconds:600,severity:.5}];expect(simulate(s).metrics.batteryFinalWh).toBeLessThan(baseline.metrics.batteryFinalWh);
    s.solar.peakPowerW=0;s.faults=[{id:'f',type:'resistance-rise',startSecond:0,durationSeconds:600,severity:2}];expect(simulate(s).samples[0].voltageV).toBeLessThan(simulate({...s,faults:[]}).samples[0].voltageV);
  });
  it('full battery rejects charging without a fictitious charge current',()=>{
    const s=cloneScenario();s.durationSeconds=600;s.activities=[];s.battery.initialSocPercent=95;const r=simulate(s);expect(r.samples[0].currentA).toBe(0);expect(r.metrics.rejectedWh).toBeGreaterThan(0);
  });
  it('rejects prototype-named faults and malformed voltage points',()=>{
    const s=cloneScenario();const bad=JSON.parse(JSON.stringify(s));bad.faults=[{id:'x',type:'__proto__',startSecond:0,durationSeconds:600,severity:1}];expect(()=>validateScenario(bad)).toThrow(/Unknown fault/);bad.faults=[];bad.battery.ocvCurve=[null,null];expect(()=>validateScenario(bad)).toThrow(/ocvCurve/);
  });
  it('neutralizes spreadsheet formulas in imported fault identifiers',()=>{
    const s=cloneScenario();s.durationSeconds=600;s.activities=[];s.faults=[{id:'=1+1',type:'load-spike',startSecond:0,durationSeconds:600,severity:1}];expect(exportCsv(simulate(s))).toContain('"\'=1+1"');
  });
});
