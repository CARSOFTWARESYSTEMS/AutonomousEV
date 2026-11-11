import { afterEach, describe, expect, it } from "vitest";
import { simClock } from "../state/simClock";
import { resetUFlightSession, useUFlightStore } from "../state/uflightStore";
import { LOOP_SECONDS, STAGES, STAGE_STARTS, StageClock } from "./stages";
import { STEPS, previewEnvironment, previewFit, previewPreset, stepAt } from "./UFlightSceneController";

afterEach(() => resetUFlightSession());

const runStage = (id: keyof typeof STEPS) => STEPS[id].forEach((step, i) => step.apply(i === 0));

describe("UFlight™ preview stages", () => {
  it("offers exactly four stages, in the story's order, each 4–7 seconds", () => {
    expect(STAGES.map((s) => `${s.number} · ${s.label}`)).toEqual(["01 · Discover", "02 · Systems", "03 · Health", "04 · Digital Twin"]);
    STAGES.forEach((s) => {
      expect(s.seconds).toBeGreaterThanOrEqual(4);
      expect(s.seconds).toBeLessThanOrEqual(7);
    });
    expect(STAGE_STARTS).toEqual([0, 6, 13, 20]);
    expect(LOOP_SECONDS).toBe(27);
  });

  it("loops automatically, plays a chosen stage through and holds it, and stays put when paused", () => {
    const clock = new StageClock();
    const seen: number[] = [];
    clock.onStage((s) => seen.push(s));
    for (let t = 0; t < LOOP_SECONDS + 0.5; t += 0.1) clock.advance(0.1);
    expect(seen).toEqual([1, 2, 3, 0]);

    clock.jump(2, "stage");
    for (let t = 0; t < 20; t += 0.1) clock.advance(0.1);
    expect(clock.stage).toBe(2);
    expect(clock.local).toBeGreaterThan(6.9);

    const generation = clock.generation;
    clock.setPlay("paused");
    const time = clock.time;
    clock.advance(5);
    expect(clock.time).toBe(time);
    clock.jump(2, "stage");
    expect(clock.generation).toBe(generation + 1);
  });

  it("drives the application's own modes: aircraft, systems, the bearing scenario and the digital twin", () => {
    runStage("discover");
    let s = useUFlightStore.getState();
    expect([s.started, s.mode, s.flightConfig, s.xrayEnabled]).toEqual([true, "aircraft", "ground", false]);

    runStage("systems");
    s = useUFlightStore.getState();
    expect(s.mode).toBe("systems");
    expect(s.selectedSystem).toBe("flightControl");
    expect(STEPS.systems.map((step) => step.key)).toEqual(["propulsion", "energy", "avionics", "flightControl"]);

    runStage("health");
    s = useUFlightStore.getState();
    expect([s.mode, s.faultScenario, s.faultStage]).toEqual(["fault-lab", "bearing-degradation", "DIAGNOSED"]);
    expect(stepAt("health", 3.5).key).toBe("ANOMALOUS");

    runStage("twin");
    s = useUFlightStore.getState();
    expect([s.mode, s.twinSystem, s.faultScenario, s.faultStage]).toEqual(["twin", "propulsion", "bearing-degradation", "DEGRADING"]);
    expect(simClock.faultSeverity).toBeGreaterThan(0.4);

    // Back to Discover: the fault is cleared and the aircraft is parked again.
    runStage("discover");
    s = useUFlightStore.getState();
    expect([s.mode, s.faultScenario, s.flightConfig]).toEqual(["aircraft", null, "ground"]);
  });

  it("reaches the twin's established comparison when chosen directly", () => {
    runStage("twin");
    const s = useUFlightStore.getState();
    expect(s.mode).toBe("twin");
    expect(simClock.faultSeverity).toBeGreaterThan(0.4);
  });

  it("keeps the dark studio (or the twin workspace), and composes one view per stage that fits the canvas", () => {
    runStage("health");
    expect(useUFlightStore.getState().environment).toBe("flight"); // the application's choice …
    expect(previewEnvironment(useUFlightStore.getState())).toBe("studio"); // … which the preview overrides
    runStage("twin");
    expect(previewEnvironment(useUFlightStore.getState())).toBe("twin");
    const views = (["discover", "systems", "health", "twin"] as const).map((id) => {
      runStage(id);
      return previewPreset(useUFlightStore.getState());
    });
    expect(new Set(views).size).toBe(4);
    // Wide canvases stand closer than tall ones, within limits.
    expect(previewFit(700, 550)).toBeLessThan(previewFit(390, 244) + 0.5);
    expect(previewFit(1400, 300)).toBeGreaterThanOrEqual(0.8);
    expect(previewFit(300, 600)).toBeLessThanOrEqual(1.9);
  });
});
