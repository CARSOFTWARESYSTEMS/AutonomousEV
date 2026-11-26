import { describe, expect, it } from "vitest";
import { DEFAULT_ROAD_INPUTS, recentBatteryPower, ROUTE_LENGTH, runDrive, ZONE_PERIOD, type RoadSample } from "@/lib/wireless-charging/dynamic";
import { DYNAMIC_STAGES, ROAD_PRESETS } from "../../story/stages";
import { viewFor } from "../componentViews";
import { targets } from "../viewState";
import { WINDOW, wrapRel } from "./layout";
import { segmentLook } from "./segmentLook";

const sample = (t: number, x: number, pBattery: number): RoadSample => ({ t, x, v: 10, pReceived: 0, pTraction: 0, pBattery, mTotal: 0, k: 0, soc: 0.5, active: 0 });

describe("energy over a whole zone period", () => {
  it("waits until a full zone period has been driven, then averages over it (across the route's lap)", () => {
    const short = Array.from({ length: 50 }, (_, i) => sample(i * 0.1, i, 1000));
    expect(recentBatteryPower(short)).toBeNull();
    // 300 m at 1 m per sample, crossing the end of the route; the last 200 m average −2 kW.
    const lapped = Array.from({ length: 300 }, (_, i) => sample(i * 0.1, (900 + i) % ROUTE_LENGTH, i < 100 ? 5000 : -2000));
    const r = recentBatteryPower(lapped)!;
    expect(r.regime).toBe("discharging");
    expect(r.mean).toBeCloseTo(-2000, 6);
    expect(r.seconds).toBeCloseTo(ZONE_PERIOD * 0.1, 6);
  });

  it.each([
    ["gain", "charging"],
    ["neutral", "energy-neutral"],
    ["lose", "discharging"],
  ] as const)("the %s stage's preset gives the outcome its title states (%s)", (id, want) => {
    const preset = { gain: ROAD_PRESETS.charging, neutral: ROAD_PRESETS.neutral, lose: ROAD_PRESETS.discharging }[id];
    const { sim } = runDrive({ ...DEFAULT_ROAD_INPUTS, ...preset }, 260);
    expect(recentBatteryPower(sim.state.samples)?.regime).toBe(want);
    // And the stage is the one that applies it.
    expect(DYNAMIC_STAGES.find((s) => s.id === id)?.enter).toBeTypeOf("function");
  }, 60000);
});

describe("road scene", () => {
  it("wraps repeating items with a period that divides the route, so nothing jumps when it laps", () => {
    expect(ROUTE_LENGTH % WINDOW).toBe(0);
    for (const spacing of [12.5, 5, 2.5, 50, 250]) {
      const n = WINDOW / spacing;
      expect(Number.isInteger(n)).toBe(true);
      for (const x0 of [3, 517.25, 999.9]) {
        const before = Array.from({ length: n }, (_, i) => wrapRel(i * spacing, x0, WINDOW, -WINDOW / 2)).sort((a, b) => a - b);
        const after = Array.from({ length: n }, (_, i) => wrapRel(i * spacing, x0 - ROUTE_LENGTH, WINDOW, -WINDOW / 2)).sort((a, b) => a - b);
        after.forEach((v, i) => expect(v).toBeCloseTo(before[i], 6));
      }
    }
  });

  it("shows each pad's state from the controller", () => {
    expect(segmentLook({ state: "off", level: 0 })).toBe("off");
    expect(segmentLook({ state: "on", level: 0.4 })).toBe("energising");
    expect(segmentLook({ state: "on", level: 1 })).toBe("active");
    expect(segmentLook({ state: "off", level: 0.3 })).toBe("de-energising");
    expect(segmentLook({ state: "blocked", level: 0 })).toBe("blocked");
    expect(segmentLook({ state: "failed", level: 0 })).toBe("failed");
  });

  it("opens the road only in the road's own views, and keeps the car solid in the road cutaway", () => {
    expect(targets("cutaway", "dynamic")).toMatchObject({ cut: 1, xray: 0, segments: 1, reveal: 0 });
    expect(targets("coupling", "dynamic")).toMatchObject({ coupling: 1, segments: 1 });
    expect(targets("segments", "dynamic")).toMatchObject({ segments: 1, xray: 1, receiver: 1 });
    expect(targets("coupling", "station").coupling).toBe(0);
    expect(viewFor("road-coil", "cinematic", "dynamic")).toBe("cutaway");
    expect(viewFor("road-coil", "coupling", "dynamic")).toBeNull();
    expect(viewFor("battery-pack", "cinematic", "infrastructure")).toBeNull();
  });
});
