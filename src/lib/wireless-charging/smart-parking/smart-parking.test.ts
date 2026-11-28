import { describe, expect, it } from "vitest";
import { createRng } from "../math";
import { MODELS } from "../registry";
import { createStation, DEFAULT_STATION_INPUTS, NO_FAULTS, setStationInputs, stationCommand, stepStation } from "../station";
import { PHASES } from "../stateMachine";
import { ALL_COMPONENTS } from "../components";
import { PARKING_CHECKS } from "./checks";
import { capacityStudy, chargingDemandSweep, comparePolicies, energyStudy, environmentalStudy, evaluateFusion, iotReliability, pricingStudy, recognitionStudy, scalabilityStudy } from "./experiments";
import { arrive, createFacility, DEFAULT_FACILITY, runFacility, sessionOf } from "./facility";
import { buildLayout, DEFAULT_LAYOUT, POC_LAYOUT } from "./layout";
import { NORMAL_LIFECYCLE, STATES, TRANSITIONS } from "./lifecycle";
import { parseTopic, topic } from "./telemetry";
import { PLATE_FORMATS, syntheticPlate, validPlate } from "./vehicles";
import { PARKING_COMPONENTS } from "./components";
import { REQUIREMENTS } from "./requirements";
import { faultRecovery, RESEARCH_POLICIES, runExperiment, runResearch, SCENARIOS, seedList, summarise, t975 } from "./research";

describe("Smart Parking engine", () => {
  it("defines a complete, closed session state machine", () => {
    expect(NORMAL_LIFECYCLE).toHaveLength(25);
    expect(NORMAL_LIFECYCLE[0]).toBe("approaching");
    expect(NORMAL_LIFECYCLE.at(-1)).toBe("released");
    for (const [from, tos] of Object.entries(TRANSITIONS)) for (const to of tos) expect(STATES[to as keyof typeof STATES], `${from} → ${to}`).toBeDefined();
    // Every normal state but the last can reach the next one.
    for (let i = 0; i < NORMAL_LIFECYCLE.length - 2; i++) {
      const a = NORMAL_LIFECYCLE[i];
      const b = NORMAL_LIFECYCLE[i + 1];
      if (a === "eligibility" || a === "charging" || a === "charged" || a === "parked") continue;
      expect(TRANSITIONS[a], `${a} → ${b}`).toContain(b);
    }
  });

  it("generates synthetic plates that validate in their own region's format", () => {
    const r = createRng(1);
    for (const region of ["IN", "US", "CN"] as const)
      for (let k = 0; k < 200; k++) {
        const plate = syntheticPlate(region, r, k % 2 === 0);
        expect(validPlate(region, plate), `${region} ${plate}`).toBe(true);
      }
    expect(validPlate("IN", PLATE_FORMATS.IN.example)).toBe(true);
    expect(validPlate("CN", PLATE_FORMATS.CN.example)).toBe(true);
  });

  it("builds any layout size without assuming twelve bays", () => {
    for (const n of [6, 12, 50, 100, 501]) {
      const l = buildLayout({ ...DEFAULT_LAYOUT, bays: n, wireless: Math.round(n / 3), accessible: 2 });
      expect(l.bays).toHaveLength(n);
      expect(l.bays.filter((b) => b.type === "wireless")).toHaveLength(Math.round(n / 3));
      expect(new Set(l.bays.map((b) => b.id)).size).toBe(n);
    }
    const poc = buildLayout(POC_LAYOUT);
    expect(poc.bays.filter((b) => b.type === "wireless")).toHaveLength(2);
    expect(poc.bays.filter((b) => b.type === "conventional")).toHaveLength(4);
  });

  it("uses a parseable, versioned MQTT namespace", () => {
    const t = topic("telemetry", "EVE-IN-POC-01", "US-N01");
    expect(t).toBe("evengineer/v1/sites/EVE-IN-POC-01/devices/US-N01/telemetry");
    expect(parseTopic(t)).toEqual({ site: "EVE-IN-POC-01", kind: "telemetry", id: "US-N01" });
    expect(parseTopic("evengineer/v1/sites/S/bays/N01/occupancy")?.kind).toBe("occupancy");
    expect(parseTopic("evengineer/v2/sites/S/devices/X/telemetry")).toBeNull();
    expect(parseTopic("evengineer/v1/sites/S/devices/X/occupancy")).toBeNull();
  });

  it("runs the demonstration scenario for ten minutes with no refused transition and nothing LIVE", () => {
    const sim = createFacility(DEFAULT_FACILITY);
    sim.stationStep = 0.25;
    const id = arrive(sim, { powertrain: "electric", wirelessCompatible: true, wantsCharging: true, cls: "sedan", soc: 0.34, member: true, plateObstructed: false, denied: false, stay: 3600 }, 2);
    runFacility(sim, 600);
    expect(sim.stats.refusedTransitions).toBe(0);
    for (const s of sim.sessions.values()) expect(s.lc.refused, s.id).toHaveLength(0);
    expect(sessionOf(sim, id)?.lc.state).toBe("charging");
    expect(sim.samples.length).toBeGreaterThan(0);
    for (const b of sim.bays) for (const v of b.votes.values()) expect(v.mode).not.toBe("LIVE");
  }, 60_000);

  it("registers every Smart Parking component, model, check and requirement consistently", () => {
    const models = new Set(MODELS.map((m) => m.id));
    const components = new Set(ALL_COMPONENTS.map((c) => c.id));
    for (const c of PARKING_COMPONENTS) for (const m of c.models) expect(models.has(m), `${c.id} → ${m}`).toBe(true);
    for (const m of MODELS.filter((x) => x.id.startsWith("SP-"))) for (const c of m.components) expect(components.has(c), `${m.id} → ${c}`).toBe(true);
    for (const c of PARKING_CHECKS) for (const m of c.models) expect(models.has(m), `${c.id} → ${m}`).toBe(true);
    const ids = REQUIREMENTS.map((r) => r.id);
    for (let k = 1; k <= 38; k++) expect(ids, `SP-R${String(k).padStart(2, "0")}`).toContain(`SP-R${String(k).padStart(2, "0")}`);
    for (let k = 1; k <= 12; k++) expect(ids).toContain(`SP-E${String(k).padStart(2, "0")}`);
    const checks = new Set(PARKING_CHECKS.map((c) => c.id));
    for (const r of REQUIREMENTS) {
      for (const t of r.tests) if (t.startsWith("SP-")) expect(checks.has(t), `${r.id} → ${t}`).toBe(true);
      for (const m of r.models) expect(models.has(m), `${r.id} → ${m}`).toBe(true);
      expect(r.physical).not.toBe("Experimentally validated");
      if (r.status === "Tested") expect(r.tests.length, r.id).toBeGreaterThan(0);
    }
  });
});

describe("Smart Parking research experiments", () => {
  it("compares allocation policies against the manual baseline on common random numbers", () => {
    const rows = comparePolicies({ hours: 8 });
    const manual = rows.find((r) => r.policy === "manual")!;
    const best = rows.find((r) => r.policy === "multi-objective")!;
    expect(rows.every((r) => r.arrived === manual.arrived)).toBe(true);
    expect(best.chargingServed).toBeGreaterThanOrEqual(manual.chargingServed);
    expect(best.meanSearch).toBeLessThan(manual.meanSearch);
  });

  it("runs every study and reports plausible values", () => {
    const cap = capacityStudy(12, 4, 2, [3, 8]);
    expect(cap[1].analytic.blocking).toBeGreaterThan(cap[0].analytic.blocking);
    expect(chargingDemandSweep([0.1, 0.6], { hours: 6 })).toHaveLength(2);
    const fusion = evaluateFusion({ kind: "infrared", mode: "stuck-occupied" }, 3600);
    expect(fusion.find((f) => f.strategy === "bayes")!.uncertain).toBeGreaterThan(fusion.find((f) => f.strategy === "ultrasonic-only")!.uncertain);
    const rec = recognitionStudy([0.8, 0.95], 600);
    expect(rec[0].rows[0].falseAccept).toBeGreaterThanOrEqual(rec[0].rows[1].falseAccept);
    const iot = iotReliability();
    expect(iot[0].deliveredShare).toBeGreaterThan(iot[3].deliveredShare);
    const energy = energyStudy();
    expect(energy[2].gridKWh).toBeLessThanOrEqual(energy[0].gridKWh);
    for (const e of energy) expect(e.maxResidual).toBeLessThan(1e-6);
    expect(environmentalStudy().every((s) => s.alarmAfter !== null)).toBe(true);
    expect(pricingStudy()).toHaveLength(3);
    expect(scalabilityStudy([12, 100])).toHaveLength(2);
  }, 60_000);
});

describe("Station commands added for the parking hand-over", () => {
  const firstEnergised = (command: "arrive" | "arrive-parked") => {
    const sim = createStation({ ...DEFAULT_STATION_INPUTS, holdAfterComplete: true, initialSoc: 0.3, targetSoc: 0.8 }, 7);
    sim.commands.splice(0);
    stationCommand(sim, command);
    while (!PHASES[sim.state.phase].energised && sim.state.t < 120) stepStation(sim, NO_FAULTS, 0.05);
    return sim;
  };

  it("arrive-parked runs the Station's own checks without an approach, stop de-energises safely, and holdAfterComplete holds", () => {
    const driven = firstEnergised("arrive");
    const parked = firstEnergised("arrive-parked");
    expect(PHASES[parked.state.phase].energised).toBe(true);
    // The parked vehicle skips the approach run but not the Station's sequence.
    expect(parked.state.t).toBeLessThan(driven.state.t);
    expect(parked.state.t).toBeGreaterThan(1);
    expect(parked.state.vehicle.v).toBe(0);

    stationCommand(parked, "stop");
    const t0 = parked.state.t;
    while (PHASES[parked.state.phase].energised && parked.state.t < t0 + 30) stepStation(parked, NO_FAULTS, 0.05);
    expect(PHASES[parked.state.phase].energised).toBe(false);
    expect(parked.state.phase).toBe("completed");

    // Held for the parking side to detach it, instead of the Station's own departure.
    for (let i = 0; i < 600; i++) stepStation(parked, NO_FAULTS, 0.05);
    expect(parked.state.phase).toBe("completed");
    setStationInputs(parked, { ...parked.inputs, holdAfterComplete: false });
    for (let i = 0; i < 100; i++) stepStation(parked, NO_FAULTS, 0.05);
    // Without the hold, the Station runs its own departure (and is free again once the vehicle has left).
    expect(["departure", "available"]).toContain(parked.state.phase);
  });

  it("stop before energising ends the session without powering the pad", () => {
    const sim = createStation({ ...DEFAULT_STATION_INPUTS, holdAfterComplete: true }, 7);
    sim.commands.splice(0);
    stationCommand(sim, "arrive-parked");
    stepStation(sim, NO_FAULTS, 0.05);
    stationCommand(sim, "stop");
    let energised = false;
    for (let i = 0; i < 200; i++) {
      stepStation(sim, NO_FAULTS, 0.05);
      energised ||= PHASES[sim.state.phase].energised;
    }
    expect(energised).toBe(false);
    expect(sim.state.phase).toBe("completed");
  });
});

describe("replicated research comparisons (SP-RES-002)", () => {
  const normal = SCENARIOS.find((s) => s.id === "normal")!;

  it("is deterministic and gives every policy the same arrivals (common random numbers)", () => {
    const a = runResearch("soc-aware", normal, 77);
    const b = runResearch("soc-aware", normal, 77);
    expect(b).toEqual(a);
    const arrived = RESEARCH_POLICIES.map((p) => runResearch(p.id, normal, 77).arrived);
    expect(new Set(arrived).size).toBe(1);
  });

  it("loses no bays to protection: with no EVs, charging-aware policies park exactly as many vehicles as nearest-bay guidance", () => {
    const noEv = { ...SCENARIOS.find((s) => s.id === "peak")!, mix: { evShare: 0 } };
    for (const seed of seedList(5)) {
      const nearest = runResearch("nearest", noEv, seed);
      for (const p of ["charging-compatible", "energy-aware"] as const) expect(runResearch(p, noEv, seed).parked).toBe(nearest.parked);
    }
  });

  it("keeps energy and shares physical: delivered ≤ requested, solar use ≤ availability, peaks within the import limit", () => {
    for (const s of SCENARIOS)
      for (const p of RESEARCH_POLICIES) {
        const m = runResearch(p.id, s, 5);
        expect(m.energyDeliveredKWh).toBeLessThanOrEqual(m.energyRequestedKWh + 1e-9);
        expect(m.pvUsedKWh).toBeLessThanOrEqual(m.pvAvailableKWh + 1e-9);
        expect(m.peakGridKW).toBeLessThanOrEqual(s.gridLimitW / 1000 + 1e-6);
        expect(m.chargingServed).toBeLessThanOrEqual(m.chargingAsked);
        expect(m.utilisation).toBeLessThanOrEqual(1);
      }
  });

  it("energy-aware scheduling lowers the mean peak import against the same allocation without it (paired seeds)", () => {
    const seeds = seedList(12);
    const peak = (p: "charging-compatible" | "energy-aware") => seeds.reduce((a, s) => a + runResearch(p, normal, s).peakGridKW, 0) / seeds.length;
    expect(peak("energy-aware")).toBeLessThan(peak("charging-compatible"));
  });

  it("summarises with Student-t confidence intervals and measures fault recovery against the fault-free day", () => {
    for (const [df, t] of [[4, 2.776], [10, 2.228], [29, 2.045], [49, 2.010]] as const) expect(Math.abs(t975(df) - t) / t).toBeLessThan(0.005);
    const s = summarise([1, 2, 3, 4, 5]);
    expect(s.mean).toBe(3);
    expect(s.sd).toBeCloseTo(Math.sqrt(2.5), 12);
    expect(s.ciHigh - s.mean).toBeCloseTo((t975(4) * Math.sqrt(2.5)) / Math.sqrt(5), 12);
    expect(s.p50).toBe(3);
    const r = faultRecovery([0, 2, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], new Array(16).fill(0), 3);
    expect(r.extraQueueVehMin).toBe(9);
    expect(r.recoveryMin).toBe(2);
  });

  it("runs a scenario's paired comparison with recovery for fault scenarios", () => {
    const r = runExperiment("charger-outage", 4);
    expect(r.dataMode).toBe("SIMULATED");
    expect(r.policies).toHaveLength(RESEARCH_POLICIES.length);
    expect(r.policies.every((p) => p.recovery && p.metrics.throughputPerHour.n === 4)).toBe(true);
    expect(r.policies.find((p) => p.policy === "manual")!.vsManual.throughputPerHour.mean).toBe(0);
  });
});
