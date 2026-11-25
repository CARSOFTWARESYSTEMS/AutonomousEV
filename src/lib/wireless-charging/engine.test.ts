import { describe, expect, it } from "vitest";
import { CHECKS, runChecks } from "./benchmarks";
import { computeCoupler, DEFAULT_RX_PAD, DEFAULT_TX_PAD, validatePad } from "./coils";
import { designCompensation, frequencySweep, splittingCoupling, TOPOLOGIES } from "./circuits";
import { MODELS, SI_UNITS } from "./registry";
import { createStation, DEFAULT_STATION_INPUTS, NO_FAULTS, setStationInputs, stepStation } from "./station";
import { NORMAL_SEQUENCE, PHASES } from "./stateMachine";
import { COMPONENTS } from "./components";

describe("verification checks", () => {
  for (const check of CHECKS) {
    it(`${check.id} — ${check.title}`, () => {
      const [result] = runChecks([check.id]);
      expect(result.passed, `${check.expected}\nmeasured: ${result.measured}`).toBe(true);
    }, 60_000);
  }
});

describe("model registry", () => {
  it("gives every model a unique id, a fidelity, SI units and at least one check that exists", () => {
    const ids = new Set(MODELS.map((m) => m.id));
    expect(ids.size).toBe(MODELS.length);
    const checks = new Set(CHECKS.map((c) => c.id));
    for (const m of MODELS) {
      for (const qty of [...m.inputs, ...m.outputs]) expect(SI_UNITS.has(qty.unit), `${m.id} ${qty.name}: ${qty.unit}`).toBe(true);
      expect(m.tests.length, m.id).toBeGreaterThan(0);
      for (const t of m.tests) expect(checks.has(t), `${m.id} → ${t}`).toBe(true);
      expect(m.status).not.toBe("Experimentally validated");
    }
  });

  it("links every check to models that exist", () => {
    const ids = new Set(MODELS.map((m) => m.id));
    for (const c of CHECKS) for (const m of c.models) expect(ids.has(m), `${c.id} → ${m}`).toBe(true);
  });

  it("names a model for every component that has one", () => {
    const ids = new Set(MODELS.map((m) => m.id));
    for (const c of COMPONENTS) for (const m of c.models) expect(ids.has(m), `${c.id} → ${m}`).toBe(true);
  });
});

describe("charging state machine", () => {
  it("has nineteen normal steps, the last returning to available", () => {
    expect(NORMAL_SEQUENCE).toHaveLength(18);
    expect(NORMAL_SEQUENCE[0]).toBe("available");
    expect(PHASES.departure.text).toMatch(/available \(step 19\)/);
  });

  it("walks the normal sequence in order on a clean session", () => {
    const sim = createStation(DEFAULT_STATION_INPUTS);
    for (let i = 0; i < 2000; i++) stepStation(sim, NO_FAULTS, 0.05);
    const visited = sim.state.events.map((e) => e.to);
    const order = ["approaching", "detected", "identification", "communication", "authorization", "alignment", "battery-check", "safety-checks", "low-power-init", "resonance-check", "ramp-up", "charging"];
    let at = -1;
    for (const id of order) {
      const next = visited.indexOf(id as never, at + 1);
      expect(next, id).toBeGreaterThan(at);
      at = next;
    }
  });

  it("refuses to start outside the alignment tolerance and resumes once re-parked", () => {
    const sim = createStation({ ...DEFAULT_STATION_INPUTS, lateral: 0.18 });
    for (let i = 0; i < 600; i++) stepStation(sim, NO_FAULTS, 0.05);
    expect(sim.state.phase).toBe("misalignment");
    expect(sim.state.energy.batteryTerminals).toBe(0);
    setStationInputs(sim, { ...sim.inputs, lateral: 0.02 });
    for (let i = 0; i < 600; i++) stepStation(sim, NO_FAULTS, 0.05);
    expect(["ramp-up", "charging", "optimizing"]).toContain(sim.state.phase);
  });

  it("trips on overcurrent when the receiver is pulled 20 cm sideways while charging", () => {
    const sim = createStation(DEFAULT_STATION_INPUTS);
    for (let i = 0; i < 1200; i++) stepStation(sim, NO_FAULTS, 0.05);
    expect(sim.state.phase).toBe("charging");
    setStationInputs(sim, { ...sim.inputs, lateral: 0.2 });
    for (let i = 0; i < 4; i++) stepStation(sim, NO_FAULTS, 0.05);
    expect(sim.state.phase).toBe("overcurrent");
    expect(sim.state.point.pBattery).toBe(0);
  });
});

describe("coupler and circuits", () => {
  it("accepts the default pads and rejects overlapping turns", () => {
    expect(validatePad(DEFAULT_TX_PAD)).toEqual([]);
    expect(validatePad({ ...DEFAULT_TX_PAD, turns: 60 })[0]).toMatch(/overlap/);
  });

  it("couples less as the air gap grows", () => {
    const k = [0.1, 0.15, 0.2, 0.25].map((h) => computeCoupler({ tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: h, lateral: 0, longitudinal: 0 }).k);
    for (let i = 1; i < k.length; i++) expect(k[i]).toBeLessThan(k[i - 1]);
  });

  it("tunes every topology to a resistive input at f0", () => {
    const coils = { L1: 110e-6, L2: 65e-6, M: 25e-6, R1: 0.14, R2: 0.12 };
    for (const t of TOPOLOGIES) {
      const d = designCompensation(t.id, coils, 85000, 15);
      const [r] = frequencySweep(d, coils, 15, 85000, 0, 1);
      expect(Math.abs(r.phaseIn), t.id).toBeLessThan(1e-6);
    }
  });

  it("shows frequency splitting above the critical coupling", () => {
    const strong = { L1: 110e-6, L2: 110e-6, M: 40e-6, R1: 0.1, R2: 0.1 };
    const d = designCompensation("SS", strong, 85000, 15);
    expect(strong.M / Math.sqrt(strong.L1 * strong.L2)).toBeGreaterThan(splittingCoupling(strong, 85000, 15));
    const sweep = frequencySweep(d, strong, 15, 85000, 0.3, 241, 100);
    const p = sweep.map((s) => s.pIn);
    const peaks = p.filter((v, i) => i > 0 && i < p.length - 1 && v > p[i - 1] && v > p[i + 1]).length;
    expect(peaks).toBe(2);
  });
});
