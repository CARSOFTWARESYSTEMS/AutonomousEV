import { beforeEach, describe, expect, it } from "vitest";
import { COMPONENT_IDS } from "../data/componentDefinitions";
import { BUILD_STEP_COUNT, TOUR_STEPS } from "../data/missionSequence";
import { selectFlows, type FlowContext } from "../overlays/flowSelection";
import { MISSION_DURATION_S, stagePlan } from "../simulation/mission";
import { FLOW_IDS, type FlowId } from "../spacecraft/flowRoutes";
import { cameraForMode, resetExplorerStore, useExplorerStore } from "./explorerStore";
import { OPACITY, focusSet, isXrayActive, partPresentation, viewFlags } from "./selectors";
import { HERO_ORBIT_TIME_S, ORBIT_BOOKMARKS, simClock } from "./simClock";

const state = () => useExplorerStore.getState();

beforeEach(() => resetExplorerStore());

describe("explorer store", () => {
  it("opens on the hero, in Learn mode, with nothing selected", () => {
    expect(state()).toMatchObject({
      started: false,
      mode: "hero",
      learnMode: "learn",
      selectedComponent: null,
      explodedAmount: 0,
      xrayEnabled: false,
      missionStage: "IDLE",
      missionPlaying: false,
      cameraPreset: "hero",
    });
    expect(simClock.orbitTimeS).toBe(HERO_ORBIT_TIME_S);
  });

  it("START EXPLORATION enters Explore and moves the camera to the spacecraft overview", () => {
    const nonce = state().cameraNonce;
    state().start();
    expect(state()).toMatchObject({ started: true, mode: "explore", cameraPreset: "overview" });
    expect(state().cameraNonce).toBeGreaterThan(nonce);
  });

  it("switches between Learn and Engineer without touching the scene", () => {
    state().start();
    state().selectComponent("battery");
    state().setLearnMode("engineer");
    expect(state()).toMatchObject({ learnMode: "engineer", selectedComponent: "battery", mode: "explore" });
    state().setLearnMode("learn");
    expect(state().learnMode).toBe("learn");
  });

  it("selects, isolates and steps back out in order", () => {
    state().start();
    state().selectComponent("battery");
    expect(state().selectedComponent).toBe("battery");
    state().isolateComponent("battery");
    expect(state().isolatedComponent).toBe("battery");
    state().goBack();
    expect(state()).toMatchObject({ isolatedComponent: null, selectedComponent: "battery" });
    state().goBack();
    expect(state()).toMatchObject({ selectedComponent: null, cameraPreset: "overview" });
  });

  it("Esc closes help and the component list before anything else", () => {
    state().start();
    state().selectComponent("obc");
    state().setHelpOpen(true);
    state().goBack();
    expect(state()).toMatchObject({ helpOpen: false, selectedComponent: "obc" });
    state().setIndexOpen(true);
    expect(state().helpOpen).toBe(false);
    state().goBack();
    expect(state()).toMatchObject({ indexOpen: false, selectedComponent: "obc" });
    state().goBack();
    expect(state().selectedComponent).toBeNull();
  });

  it("scrubs and toggles the exploded view within 0–100%", () => {
    state().start();
    state().setExploded(0.4);
    expect(state().explodedAmount).toBe(0.4);
    state().setExploded(7);
    expect(state().explodedAmount).toBe(1);
    state().setExploded(-2);
    expect(state().explodedAmount).toBe(0);
    state().toggleExploded();
    expect(state()).toMatchObject({ explodedAmount: 1, cameraPreset: "exploded" });
    state().toggleExploded();
    expect(state()).toMatchObject({ explodedAmount: 0, cameraPreset: "overview" });
  });

  it("toggles X-ray", () => {
    state().start();
    state().toggleXray();
    expect(state().xrayEnabled).toBe(true);
    expect(isXrayActive(state())).toBe(true);
    state().toggleXray();
    expect(isXrayActive(state())).toBe(false);
  });

  it("clears selection and demonstrations when the mode changes", () => {
    state().start();
    state().selectComponent("pcdu");
    state().setMode("orbit");
    expect(state()).toMatchObject({ mode: "orbit", selectedComponent: null, isolatedComponent: null, cameraPreset: "orbit" });
    expect(simClock.seek?.to).toBe(ORBIT_BOOKMARKS.target);
  });

  it("frames each system with its own camera", () => {
    state().start();
    state().setSubsystem("adcs");
    expect(state()).toMatchObject({ mode: "systems", subsystem: "adcs", cameraPreset: "adcs" });
    state().setSubsystem("communications");
    expect(state().cameraPreset).toBe("communications");
    // Communications is shown during the ground pass.
    expect(simClock.seek?.to).toBe(ORBIT_BOOKMARKS.passMid);
    expect(cameraForMode("systems", { subsystem: "thermal", missionStage: "IDLE", explodedAmount: 0 })).toBe("thermal");
  });

  it("SHOW FLOW takes a component to the view that explains it", () => {
    state().start();
    state().showFlowFor("battery");
    expect(state()).toMatchObject({ mode: "systems", subsystem: "power" });
    state().showFlowFor("xband-transmitter");
    expect(state()).toMatchObject({ mode: "signals", signalView: "payload-data" });
    state().showFlowFor("sband-radio");
    expect(state()).toMatchObject({ mode: "signals", signalView: "command" });
  });
});

describe("build mode state", () => {
  beforeEach(() => {
    state().start();
    state().setMode("build");
  });

  it("starts at the structure, assembled and opaque", () => {
    expect(state()).toMatchObject({ mode: "build", buildStep: 1, buildAuto: false, explodedAmount: 0, xrayEnabled: false, cameraPreset: "build" });
    expect(viewFlags(state()).studio).toBe(true);
  });

  it("NEXT and BACK walk the eight steps and stop at the ends", () => {
    for (let step = 2; step <= BUILD_STEP_COUNT; step++) {
      state().nextBuildStep();
      expect(state().buildStep).toBe(step);
    }
    state().nextBuildStep();
    expect(state().buildStep).toBe(BUILD_STEP_COUNT);
    for (let step = BUILD_STEP_COUNT - 1; step >= 1; step--) {
      state().previousBuildStep();
      expect(state().buildStep).toBe(step);
    }
    state().previousBuildStep();
    expect(state().buildStep).toBe(1);
  });

  it("jumps to a step and clamps out-of-range requests", () => {
    state().setBuildStep(5);
    expect(state().buildStep).toBe(5);
    state().setBuildStep(40);
    expect(state().buildStep).toBe(8);
    state().setBuildStep(0);
    expect(state().buildStep).toBe(1);
  });

  it("AUTO BUILD stops itself at READY and restarts from the structure", () => {
    state().setBuildAuto(true);
    expect(state().buildAuto).toBe(true);
    for (let i = 0; i < BUILD_STEP_COUNT; i++) state().nextBuildStep();
    expect(state()).toMatchObject({ buildStep: 8, buildAuto: false });
    state().setBuildAuto(true);
    expect(state()).toMatchObject({ buildStep: 1, buildAuto: true });
  });

  it("RESET returns to step 1", () => {
    state().setBuildStep(6);
    state().setBuildAuto(true);
    state().resetBuild();
    expect(state()).toMatchObject({ buildStep: 1, buildAuto: false });
  });

  it("RUN MISSION from the assembled spacecraft starts the mission", () => {
    state().setBuildStep(8);
    state().runMission();
    expect(state()).toMatchObject({ mode: "mission", missionStage: "BOOT", missionPlaying: true, cameraPreset: "missionBoot" });
  });
});

describe("mission state in the store", () => {
  beforeEach(() => {
    state().start();
    state().runMission();
  });

  it("mirrors the mission machine and follows each stage with its camera", () => {
    expect(state()).toMatchObject({ missionStage: "BOOT", missionPlaying: true });
    state().dispatchMission({ type: "NEXT" });
    expect(state()).toMatchObject({ missionStage: "POWER", cameraPreset: "missionPower" });
    state().dispatchMission({ type: "NEXT" });
    expect(state()).toMatchObject({ missionStage: "ATTITUDE", cameraPreset: "missionAttitude" });
    state().dispatchMission({ type: "PREVIOUS" });
    expect(state()).toMatchObject({ missionStage: "POWER", cameraPreset: "missionPower" });
    expect(simClock.mission.timeS).toBe(stagePlan("POWER").startS);
  });

  it("pauses and resumes", () => {
    state().dispatchMission({ type: "PAUSE" });
    expect(state().missionPlaying).toBe(false);
    state().dispatchMission({ type: "PLAY" });
    expect(state().missionPlaying).toBe(true);
  });

  it("marks the mission complete when the render loop reaches the end", () => {
    state().dispatchMission({ type: "SEEK", timeS: MISSION_DURATION_S - 1 });
    // The render loop ticks the clock, then asks the store to sync.
    simClock.mission = { stage: "COMPLETE", timeS: MISSION_DURATION_S, playing: false };
    state().syncMission();
    expect(state()).toMatchObject({ missionStage: "COMPLETE", missionPlaying: false, missionCompleted: true });
    state().dispatchMission({ type: "RESTART" });
    expect(state()).toMatchObject({ missionStage: "BOOT", missionPlaying: true, missionCompleted: false });
  });
});

describe("state reset", () => {
  it("RESET returns every piece of interaction state to Explore defaults but keeps the user's detail level", () => {
    state().start();
    state().setLearnMode("engineer");
    state().setMode("systems");
    state().setSubsystem("payload");
    state().selectComponent("optical-payload");
    state().isolateComponent("optical-payload");
    state().setExploded(0.7);
    state().toggleXray();
    state().setMode("build");
    state().setBuildStep(5);
    state().runMission();
    state().dispatchMission({ type: "NEXT" });
    state().startTour();

    state().reset();

    expect(state()).toMatchObject({
      started: true,
      mode: "explore",
      subsystem: "power",
      signalView: "command",
      selectedComponent: null,
      isolatedComponent: null,
      explodedAmount: 0,
      xrayEnabled: false,
      buildStep: 1,
      buildAuto: false,
      missionStage: "IDLE",
      missionPlaying: false,
      missionCompleted: false,
      tourActive: false,
      cameraPreset: "overview",
      learnMode: "engineer",
    });
    expect(simClock.mission).toEqual({ stage: "IDLE", timeS: 0, playing: false });
    expect(simClock.orbitTimeS).toBe(HERO_ORBIT_TIME_S);
  });

  it("RESET on the hero screen stays on the hero", () => {
    state().reset();
    expect(state()).toMatchObject({ started: false, mode: "hero", cameraPreset: "hero" });
  });
});

describe("guided tour", () => {
  it("applies each step's view, runs the mission at the end, and exits cleanly", () => {
    state().startTour();
    expect(state()).toMatchObject({ tourActive: true, tourPlaying: true, tourStep: 0, started: true, mode: "explore" });

    state().tourNext();
    expect(state()).toMatchObject({ tourStep: 1, explodedAmount: 1, cameraPreset: "exploded" });
    state().tourNext();
    expect(state()).toMatchObject({ tourStep: 2, mode: "systems", subsystem: "power", explodedAmount: 0 });
    state().tourBack();
    expect(state().tourStep).toBe(1);

    state().tourGoTo(TOUR_STEPS.length - 1);
    expect(state()).toMatchObject({ mode: "mission", missionStage: "BOOT", missionPlaying: true });

    state().tourNext();
    expect(state()).toMatchObject({ tourActive: false, missionPlaying: false });
  });

  it("EXIT TOUR leaves the learner where they are", () => {
    state().startTour();
    state().tourGoTo(4);
    state().exitTour();
    expect(state()).toMatchObject({ tourActive: false, mode: "systems", subsystem: "adcs" });
  });
});

describe("part presentation", () => {
  beforeEach(() => state().start());

  it("shows everything solid in the plain Explore view", () => {
    COMPONENT_IDS.forEach((id) => expect(partPresentation(state(), id)).toMatchObject({ opacity: 1, selectable: true }));
  });

  it("X-ray makes the outer shell 10–20% opaque and leaves internal units solid and selectable", () => {
    state().toggleXray();
    expect(OPACITY.xray).toBeGreaterThanOrEqual(0.1);
    expect(OPACITY.xray).toBeLessThanOrEqual(0.2);
    for (const id of ["side-panels", "mli-blanket", "end-plates", "radiator"] as const) {
      expect(partPresentation(state(), id)).toMatchObject({ opacity: OPACITY.xray, selectable: false });
    }
    for (const id of ["obc", "battery", "reaction-wheel-x", "sband-radio", "payload-processor"] as const) {
      expect(partPresentation(state(), id)).toMatchObject({ opacity: 1, selectable: true });
    }
  });

  it("Systems fades everything outside the selected system to 10–25%", () => {
    state().setSubsystem("power");
    expect(partPresentation(state(), "battery")).toMatchObject({ opacity: 1, focused: true });
    expect(partPresentation(state(), "solar-array-left").opacity).toBe(1);
    const faded = partPresentation(state(), "obc");
    expect(faded.opacity).toBeGreaterThanOrEqual(0.1);
    expect(faded.opacity).toBeLessThanOrEqual(0.25);
    expect(faded.selectable).toBe(false);
  });

  it("Power in X-ray also keeps the five loads solid so they can be selected", () => {
    state().setSubsystem("power");
    expect(focusSet(state())).not.toContain("obc");
    state().toggleXray();
    expect(focusSet(state())).toEqual(expect.arrayContaining(["obc", "optical-payload", "sband-radio", "heaters", "reaction-wheel-y"]));
    expect(partPresentation(state(), "obc")).toMatchObject({ opacity: 1, selectable: true });
  });

  it("Thermal fades nothing: the whole spacecraft carries the overlay", () => {
    state().setSubsystem("thermal");
    expect(focusSet(state())).toBeNull();
    expect(viewFlags(state()).thermal).toBe(true);
    COMPONENT_IDS.forEach((id) => expect(partPresentation(state(), id).opacity).toBe(1));
  });

  it("selecting a part dims the rest slightly; an internal part is seen through the shell", () => {
    state().selectComponent("battery");
    expect(partPresentation(state(), "battery").opacity).toBe(1);
    expect(partPresentation(state(), "obc").opacity).toBe(OPACITY.context);
    expect(partPresentation(state(), "mli-blanket").opacity).toBe(OPACITY.xray);
  });

  it("isolating a part hides everything else", () => {
    state().isolateComponent("star-tracker");
    expect(partPresentation(state(), "star-tracker")).toMatchObject({ opacity: 1, selectable: true });
    expect(partPresentation(state(), "battery")).toMatchObject({ opacity: OPACITY.isolatedOthers, selectable: false });
  });

  it("Signals keeps only the route's components solid", () => {
    state().setMode("signals");
    state().setSignalView("payload-data");
    expect(partPresentation(state(), "xband-transmitter").opacity).toBe(1);
    expect(partPresentation(state(), "data-storage").opacity).toBe(1);
    expect(partPresentation(state(), "battery").opacity).toBeLessThan(0.3);
  });
});

describe("view flags", () => {
  it("shows orbit geometry in Orbit Mode and the ground segment wherever a link matters", () => {
    state().start();
    expect(viewFlags(state())).toMatchObject({ orbitPath: false, groundSegment: false, studio: false, notToScale: false });
    state().setMode("orbit");
    expect(viewFlags(state())).toMatchObject({ orbitPath: true, groundTrack: true, groundSegment: true, notToScale: true });
    state().setMode("signals");
    expect(viewFlags(state()).groundSegment).toBe(true);
    state().setSubsystem("adcs");
    expect(viewFlags(state())).toMatchObject({ bodyAxes: true, footprint: false });
    state().setSubsystem("payload");
    expect(viewFlags(state())).toMatchObject({ footprint: true, groundTrack: true });
  });

  it("turns on the right overlays for each mission stage", () => {
    state().start();
    state().runMission();
    expect(isXrayActive(state())).toBe(true); // BOOT looks inside the bus
    state().dispatchMission({ type: "SEEK", timeS: stagePlan("ATTITUDE").startS });
    expect(viewFlags(state()).bodyAxes).toBe(true);
    state().dispatchMission({ type: "SEEK", timeS: stagePlan("CAPTURE").startS });
    expect(viewFlags(state())).toMatchObject({ footprint: true, groundTrack: true });
    state().dispatchMission({ type: "SEEK", timeS: stagePlan("UPLINK").startS });
    expect(viewFlags(state())).toMatchObject({ groundSegment: true, footprint: false });
  });
});

describe("flow selection", () => {
  const base: FlowContext = {
    mode: "systems",
    subsystem: "power",
    signalView: "command",
    missionStage: "IDLE",
    buildStep: 1,
    buildStepAge: 10,
    xray: false,
    showMagnetorquer: false,
    generationW: 18.4,
    batteryW: 6.3,
    bootProgress: 1,
    payloadPhase: "IDLE",
    commandPhase: "NONE",
    linkVisible: true,
    telemetry: 1,
    downlink: 0.5,
  };
  const run = (ctx: Partial<FlowContext>) => {
    const out = Object.fromEntries(FLOW_IDS.map((id) => [id, 0])) as Record<FlowId, number>;
    const external = selectFlows(out, { ...base, ...ctx });
    return { out, external, active: FLOW_IDS.filter((id) => out[id] !== 0) };
  };

  it("in sunlight: Sun → arrays → PCDU → battery (charging)", () => {
    const { out, external } = run({});
    expect(external.sunRays).toBeGreaterThan(0);
    expect(out["array-left"]).toBeGreaterThan(0);
    expect(out["array-right"]).toBeGreaterThan(0);
    expect(out.battery).toBeGreaterThan(0);
    expect(out["load-obc"]).toBe(0);
  });

  it("in eclipse: no solar generation, and the battery flow reverses to supply the loads", () => {
    const { out, external } = run({ generationW: 0, batteryW: -13.2, xray: true });
    expect(external.sunRays).toBe(0);
    expect(out["array-left"]).toBe(0);
    expect(out.battery).toBeLessThan(0);
    for (const id of ["load-obc", "load-adcs", "load-payload", "load-comms", "load-heaters"] as const) expect(out[id]).toBeGreaterThan(0);
  });

  it("shows power distribution to the loads only in X-ray", () => {
    expect(run({ xray: false }).out["load-adcs"]).toBe(0);
    expect(run({ xray: true }).out["load-adcs"]).toBeGreaterThan(0);
  });

  it("ADCS: sensors feed the computer, which commands the wheels", () => {
    const { out } = run({ subsystem: "adcs" });
    expect(out["sense-startracker"]).toBeGreaterThan(0);
    expect(out["cmd-wheels"]).toBeGreaterThan(0);
    expect(out["array-left"]).toBe(0);
  });

  it("a command travels up, is routed inward, then drives the wheels", () => {
    const uplink = run({ mode: "signals", commandPhase: "UPLINK" });
    expect(uplink.external.uplink).toBe(1);
    expect(uplink.active).toEqual([]);

    const routing = run({ mode: "signals", commandPhase: "ROUTING" });
    // Antenna → transceiver → OBC: against the routes' defined direction.
    expect(routing.out["rf-sband-nadir"]).toBeLessThan(0);
    expect(routing.out["obc-sband"]).toBeLessThan(0);

    const executing = run({ mode: "signals", commandPhase: "EXECUTING" });
    expect(executing.out["cmd-wheels"]).toBeGreaterThan(0);
  });

  it("telemetry and payload data leave on different links", () => {
    const telemetry = run({ mode: "signals", signalView: "telemetry" });
    expect(telemetry.external.telemetry).toBeGreaterThan(0);
    expect(telemetry.external.payloadDownlink).toBe(0);
    expect(telemetry.out["rf-sband-nadir"]).toBeGreaterThan(0);
    expect(telemetry.out["rf-xband"]).toBe(0);

    const payload = run({ mode: "signals", signalView: "payload-data" });
    expect(payload.external.payloadDownlink).toBeGreaterThan(0);
    expect(payload.external.telemetry).toBe(0);
    expect(payload.out["store-xband"]).toBeGreaterThan(0);
    expect(payload.out["rf-xband"]).toBeGreaterThan(0);
  });

  it("nothing is radiated to the ground while the station cannot see the spacecraft", () => {
    expect(run({ mode: "signals", signalView: "telemetry", linkVisible: false }).external.telemetry).toBe(0);
    expect(run({ mode: "signals", signalView: "payload-data", linkVisible: false }).external.payloadDownlink).toBe(0);
  });

  it("payload capture: light becomes data, and data moves to storage", () => {
    expect(run({ subsystem: "payload", payloadPhase: "IDLE" }).active).toEqual([]);
    expect(run({ subsystem: "payload", payloadPhase: "CAPTURING" }).out["payload-raw"]).toBeGreaterThan(0);
    const processing = run({ subsystem: "payload", payloadPhase: "PROCESSING" });
    expect(processing.out["payload-raw"]).toBeGreaterThan(0);
    expect(processing.out["payload-store"]).toBeGreaterThan(0);
  });

  it("mission BOOT powers the computer from the battery", () => {
    const { out } = run({ mode: "mission", missionStage: "BOOT", generationW: 0, batteryW: -6 });
    expect(out.battery).toBeLessThan(0);
    expect(out["load-obc"]).toBeGreaterThan(0);
  });

  it("a build step waits for its parts before animating its flow", () => {
    expect(run({ mode: "build", buildStep: 2, buildStepAge: 0.5 }).active).toEqual([]);
    expect(run({ mode: "build", buildStep: 2, buildStepAge: 5 }).out["array-left"]).toBeGreaterThan(0);
    expect(run({ mode: "build", buildStep: 4, buildStepAge: 5 }).out["cmd-wheels"]).toBeGreaterThan(0);
    expect(run({ mode: "build", buildStep: 1, buildStepAge: 5 }).active).toEqual([]);
  });

  it("shows no flows in the plain Explore or Orbit views", () => {
    expect(run({ mode: "explore" }).active).toEqual([]);
    expect(run({ mode: "orbit" }).active).toEqual([]);
  });
});
