import { describe, expect, it } from "vitest";
import { computeFieldSection, DEFAULT_RX_PAD, DEFAULT_TX_PAD } from "./coils";
import { createRoad, DEFAULT_ROAD_INPUTS, stepRoad } from "./dynamic";
import { type FieldSource, fieldAt, fieldAtDirect, fieldKernel, instantaneous, roadExcitation, roadFieldConfig, roadFieldLines, roadFieldSection, rmsOf } from "./roadField";

const station = { tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: 0.15 };

describe("dynamic road magnetic field (WPT-EM-005)", () => {
  const k = fieldKernel(station);

  it("is zero without excitation", () => {
    for (const z of [0.02, 0.075, 0.13]) expect(rmsOf(fieldAt(k, [], 0.1, 0.02, z))).toBe(0);
    const zero: FieldSource[] = [{ coil: "tx", x: 0, y: 0, current: { re: 0, im: 0 }, segment: 0 }];
    expect(rmsOf(fieldAt(k, zero, 0.05, 0, 0.075))).toBe(0);
  });

  it("agrees with the station's field section for a single pad (same model, same geometry)", () => {
    const offset = 0.06;
    const currents = { i1: { re: 22, im: 0 }, i2: { re: 0, im: -26 } };
    const sec = computeFieldSection({ ...station, lateral: 0, longitudinal: offset }, currents, { nx: 36, nz: 18 });
    const sources: FieldSource[] = [
      { coil: "tx", x: 0, y: 0, current: currents.i1, segment: 0 },
      { coil: "rx", x: offset, y: 0, current: currents.i2, segment: -1 },
    ];
    let worst = 0;
    let compared = 0;
    for (let iz = 0; iz < sec.nz; iz++) {
      const z = sec.z0 + ((sec.z1 - sec.z0) * iz) / (sec.nz - 1);
      // Bilinear interpolation of the tables is coarse within a few millimetres of the conductors.
      if (z < 0.012 || z > station.airGap - 0.012) continue;
      for (let ix = 0; ix < sec.nx; ix++) {
        const ref = sec.brms[iz * sec.nx + ix];
        if (!Number.isFinite(ref) || ref < 0.02 * sec.max) continue;
        const x = sec.x0 + ((sec.x1 - sec.x0) * ix) / (sec.nx - 1);
        const v = rmsOf(fieldAt(k, sources, x, 0, z));
        worst = Math.max(worst, Math.abs(v - ref) / ref);
        compared++;
      }
    }
    expect(compared).toBeGreaterThan(100);
    expect(worst).toBeLessThan(0.03);
  });

  it("interpolates its cached basis within 1 % of direct summation away from the windings", () => {
    const sources: FieldSource[] = [
      { coil: "tx", x: 0, y: 0, current: { re: 45, im: 0 }, segment: 3 },
      { coil: "tx", x: 1.0, y: 0, current: { re: 30, im: 0 }, segment: 4 },
      { coil: "rx", x: 0.4, y: 0.05, current: { re: 0, im: -40 }, segment: -1 },
    ];
    let worst = 0;
    for (const [x, y, z] of [
      [0.2, 0.05, 0.075],
      [0.5, 0.05, 0.06],
      [0.75, 0, 0.1],
      [-0.3, 0.02, 0.05],
      [1.2, 0.05, 0.09],
    ]) {
      const a = rmsOf(fieldAt(k, sources, x, y, z));
      const b = rmsOf(fieldAtDirect(station, sources, x, y, z));
      worst = Math.max(worst, Math.abs(a - b) / b);
    }
    expect(worst).toBeLessThan(0.01);
  });

  it("is a linear superposition of its sources", () => {
    const a: FieldSource = { coil: "tx", x: 0, y: 0, current: { re: 45, im: 0 }, segment: 1 };
    const b: FieldSource = { coil: "tx", x: 1.0, y: 0, current: { re: 45 * 0.4, im: 0 }, segment: 2 };
    const c: FieldSource = { coil: "rx", x: 0.55, y: 0.05, current: { re: 0, im: -30 }, segment: -1 };
    const p = [0.5, 0.05, 0.07] as const;
    const sum = fieldAt(k, [a, b, c], ...p);
    const parts = [a, b, c].map((s) => fieldAt(k, [s], ...p));
    for (let i = 0; i < 3; i++) {
      expect(sum.re[i]).toBeCloseTo(parts.reduce((t, q) => t + q.re[i], 0), 12);
      expect(sum.im[i]).toBeCloseTo(parts.reduce((t, q) => t + q.im[i], 0), 12);
    }
  });

  it("keeps the signs and phase convention: I₁ at its peak drives B up through its own pad; a receiver current in quadrature adds nothing at θ = 0", () => {
    const tx: FieldSource = { coil: "tx", x: 0, y: 0, current: { re: 30, im: 0 }, segment: 0 };
    const rx: FieldSource = { coil: "rx", x: 0, y: 0, current: { re: 0, im: -25 }, segment: -1 };
    const above = instantaneous(fieldAt(k, [tx], 0, 0, 0.075), 0);
    expect(above[2]).toBeGreaterThan(0);
    const both = instantaneous(fieldAt(k, [tx, rx], 0, 0, 0.075), 0);
    expect(both[2]).toBeCloseTo(above[2], 12);
    // A quarter cycle later only the receiver (I₂ = −j|I₂|, lagging by 90°) contributes: I₁ is falling through
    // zero, and the induced current sustains the flux (Lenz), so B still points up through the pads.
    const later = instantaneous(fieldAt(k, [tx, rx], 0, 0, 0.075), Math.PI / 2);
    expect(later[2]).toBeGreaterThan(0);
    expect(later[2]).toBeCloseTo(instantaneous(fieldAt(k, [rx], 0, 0, 0.075), Math.PI / 2)[2], 12);
    // Symmetry about a lone pad's centre: the field is the same either side; its radial part reverses.
    const l = fieldAt(k, [tx], -0.2, 0, 0.05);
    const r = fieldAt(k, [tx], 0.2, 0, 0.05);
    expect(rmsOf(l)).toBeCloseTo(rmsOf(r), 12);
    expect(l.re[0]).toBeCloseTo(-r.re[0], 12);
  });

  it("reads its excitation from the road simulation: energised segments only, at their positions, never failed ones", () => {
    const sim = createRoad({ ...DEFAULT_ROAD_INPUTS, coverage: 1, speed: 15 });
    // Drive until a pad is energised under the receiver.
    for (let i = 0; i < 20000 && !sim.state.segments.some((s) => s.level > 0.9); i++) stepRoad(sim);
    const ex = roadExcitation(sim);
    expect(ex.receiver.x).toBeCloseTo(sim.state.x + sim.vehicle.receiverOffset, 12);
    expect(ex.receiver.y).toBe(sim.inputs.lateral);
    const tx = ex.sources.filter((s) => s.coil === "tx");
    expect(tx.length).toBeGreaterThan(0);
    for (const s of tx) {
      const seg = sim.state.segments[s.segment];
      expect(s.x).toBe(seg.x);
      expect(seg.level).toBeGreaterThan(0);
      expect(s.current.re).toBeCloseTo(sim.inputs.primaryCurrent * seg.level, 12);
    }
    const rx = ex.sources.find((s) => s.coil === "rx")!;
    expect(rx.current.im).toBeCloseTo(-sim.state.i2, 12);

    // Fail the pad under the receiver: once its level decays, it contributes nothing.
    const under = tx.reduce((a, b) => (Math.abs(a.x - ex.receiver.x) < Math.abs(b.x - ex.receiver.x) ? a : b));
    const failed = createRoad({ ...DEFAULT_ROAD_INPUTS, coverage: 1, speed: 15, failedSegment: under.segment });
    for (let i = 0; i < 20000 && failed.state.x + failed.vehicle.receiverOffset < under.x; i++) stepRoad(failed);
    expect(roadExcitation(failed).sources.some((s) => s.segment === under.segment)).toBe(false);
  });

  it("does not depend on how finely it is drawn (rendering resolution)", () => {
    const sim = createRoad({ ...DEFAULT_ROAD_INPUTS, coverage: 1, speed: 15 });
    for (let i = 0; i < 6000; i++) stepRoad(sim);
    const ex = roadExcitation(sim);
    const kk = fieldKernel(roadFieldConfig(sim));
    const spec = (nx: number) => ({ x0: ex.receiver.x - 1, x1: ex.receiver.x + 1, y: ex.receiver.y, nx, nz: 9 });
    const coarse = roadFieldSection(kk, ex, spec(11));
    const fine = roadFieldSection(kk, ex, spec(21));
    for (let iz = 0; iz < 9; iz++)
      for (let ix = 0; ix < 11; ix++) {
        const a = coarse.brms[iz * 11 + ix];
        const b = fine.brms[iz * 21 + ix * 2];
        if (Number.isNaN(a)) expect(Number.isNaN(b)).toBe(true);
        else expect(a).toBeCloseTo(b, 12);
      }
    expect(coarse.atReceiver).toBeCloseTo(fine.atReceiver, 12);
    expect(roadFieldLines(kk, ex, spec(11), 0).length).toBeGreaterThan(4);
  });
});
