import { describe, expect, it } from "vitest";
import { angleCurve, constantPowerEnergy, solarPower, type SolarInputs } from "./solar";
const input: SolarInputs = { angleDeg: 0, irradianceWm2: 1000, areaM2: 0.5, efficiencyPercent: 20 };

describe("educational solar-incidence contract", () => {
  it.each([[0, 100], [45, 70.71067811865476], [60, 50], [90, 0], [180, 0]])("computes the independently known result at %s degrees", (angleDeg, watts) => {
    expect(solarPower({ ...input, angleDeg }).electricalW).toBeCloseTo(watts, 10);
  });
  it("is exactly zero at grazing incidence, darkness, zero area and zero efficiency", () => {
    for (const override of [{ angleDeg: 90 }, { irradianceWm2: 0 }, { areaM2: 0 }, { efficiencyPercent: 0 }]) expect(solarPower({ ...input, ...override }).electricalW).toBe(0);
  });
  it("conserves intercepted energy and respects conversion bounds across the domain", () => {
    for (const angleDeg of [0, 1, 45, 89, 90, 120, 180]) {
      for (const irradianceWm2 of [0, 100, 1000, 1400]) {
        for (const efficiencyPercent of [0, 20, 40, 100]) {
          for (const areaM2 of [0, 0.05, 0.5, 2]) {
            const m = solarPower({ angleDeg, irradianceWm2, areaM2, efficiencyPercent });
            expect(m.electricalW).toBeGreaterThanOrEqual(0);
            expect(m.electricalW).toBeLessThanOrEqual(m.incidentW);
            expect(m.incidentW).toBeLessThanOrEqual(irradianceWm2 * areaM2);
            expect(m.electricalW + m.unconvertedW).toBeCloseTo(m.incidentW, 10);
          }
        }
      }
    }
  });
  it("scales linearly with area, irradiance and conversion efficiency", () => {
    const baseline = solarPower({ ...input, angleDeg: 45 }).electricalW;
    for (const override of [{ areaM2: 1 }, { efficiencyPercent: 40 }]) {
      expect(solarPower({ ...input, angleDeg: 45, ...override }).electricalW).toBeCloseTo(baseline * 2, 10);
    }
    expect(solarPower({ ...input, irradianceWm2: 500 }).electricalW).toBe(50);
  });
  it("rejects invalid inputs instead of silently producing plausible results", () => {
    for (const key of Object.keys(input) as (keyof SolarInputs)[]) {
      for (const value of [NaN, Infinity, -Infinity, -1]) expect(() => solarPower({ ...input, [key]: value })).toThrow(RangeError);
    }
    for (const override of [{ angleDeg: 181 }, { areaM2: 2.1 }, { irradianceWm2: 1401 }, { efficiencyPercent: 101 }]) expect(() => solarPower({ ...input, ...override })).toThrow(RangeError);
  });
  it("gives a deterministic non-increasing angle curve with consistent endpoints", () => {
    const curve = angleCurve(input);
    expect(curve).toEqual(angleCurve(input));
    expect(curve[0].powerW).toBe(100);
    expect(curve[90].powerW).toBe(0);
    curve.slice(1).forEach((point, i) => expect(point.powerW).toBeLessThanOrEqual(curve[i].powerW));
  });
  it("converts seconds to joules and watt-hours exactly once", () => {
    expect(constantPowerEnergy(50, 60)).toEqual({ joules: 3000, wattHours: 5 / 6 });
    expect(constantPowerEnergy(100, 3600)).toEqual({ joules: 360000, wattHours: 100 });
    expect(() => constantPowerEnergy(10, -1)).toThrow();
    expect(() => constantPowerEnergy(Infinity, 10)).toThrow();
  });
});
