import { beforeEach, describe, expect, it, vi } from "vitest";
import { STAGE_SEVERITY } from "../simulation/faultModels";
import { buildHealthSnapshot } from "../simulation/hums";
import { groundState, steadyState } from "../simulation/mission";
import { flowActivation, focusSet, isXrayActive, operatingPoint, presentationMap, sceneShift, sensorVisibility, subAssemblyOpen, componentOpen, viewFlags, OPACITY } from "./selectors";
import { viewportFit } from "../scene/cameraPresets";
import { simClock } from "./simClock";
import { resetUFlightSession, useUFlightStore } from "./uflightStore";

const trackEvent = vi.fn();
vi.mock("@/utils/analytics", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));

const state = () => useUFlightStore.getState();

/** What the render loop does a few times a second: publish the simulation's output. */
function sync(severity = simClock.faultSeverity) {
  const s = state();
  const flight = s.mode === "mission" || s.faultStage === "MAINTENANCE" ? groundState() : steadyState("cruise");
  const inputs = {
    missionTimeS: simClock.mission.timeS,
    missionPhase: simClock.mission.stage,
    config: "cruise" as const,
    flight,
    faults: { scenario: simClock.fault.scenario, stage: simClock.fault.stage, severity, fccBFailed: s.fccBFailed, gnssUnavailable: s.gnssUnavailable },
  };
  s.syncSimulation({ flight, inputs, snapshot: buildHealthSnapshot(inputs), missionTimeS: inputs.missionTimeS, stageProgress: 0, awaitingAuthorization: false });
}

beforeEach(() => {
  resetUFlightSession();
  trackEvent.mockClear();
});

describe("opening and modes", () => {
  it("opens on the hero, in the studio, in executive mode", () => {
    expect(state()).toMatchObject({ started: false, mode: "hero", audienceMode: "executive", environment: "studio", cameraPreset: "hero", vehicleState: "MISSION_CAPABLE" });
  });

  it("enters the digital twin of the aircraft into AIRCRAFT mode", () => {
    state().start();
    expect(state()).toMatchObject({ started: true, mode: "aircraft", cameraPreset: "aircraft-overview" });
  });

  it("runs the health demo as the bearing scenario, playing", () => {
    state().runHealthDemo();
    expect(state()).toMatchObject({ started: true, mode: "fault-lab", faultScenario: "bearing-degradation", faultStage: "HEALTHY", faultPlaying: true, environment: "flight" });
  });

  it("switches between the seven modes, clearing the selection", () => {
    state().start();
    state().selectComponent("fcc-a");
    for (const mode of ["systems", "health", "mission", "fault-lab", "twin", "architecture", "aircraft"] as const) {
      state().setMode(mode);
      expect(state().mode).toBe(mode);
      expect(state().selectedComponent).toBeNull();
    }
    state().setMode("systems");
    expect(state().selectedSystem).toBe("propulsion");
  });

  it("leaves X-ray and the exploded view behind when the mode changes", () => {
    state().start();
    state().toggleXray();
    state().setExplodedAmount(1);
    state().setMode("mission");
    expect(state()).toMatchObject({ xrayEnabled: false, explodedAmount: 0 });
    expect(isXrayActive(state())).toBe(false);
  });

  it("moves the camera whenever the view changes", () => {
    state().start();
    const before = state().cameraNonce;
    state().setMode("systems");
    expect(state().cameraPreset).toBe("propulsion-overview");
    state().selectSystem("energy");
    expect(state().cameraPreset).toBe("battery-bay");
    expect(state().cameraNonce).toBeGreaterThan(before);
  });

  it("toggles between executive and engineer without changing the view", () => {
    state().start();
    const nonce = state().cameraNonce;
    state().setAudienceMode("engineer");
    expect(state()).toMatchObject({ audienceMode: "engineer", mode: "aircraft", cameraNonce: nonce });
    state().setAudienceMode("executive");
    expect(state().audienceMode).toBe("executive");
  });

  it("resets to the aircraft overview, keeping the audience mode", () => {
    state().start();
    state().setAudienceMode("engineer");
    state().startFault("bearing-degradation");
    state().reset();
    expect(state()).toMatchObject({ mode: "aircraft", faultScenario: null, explodedAmount: 0, xrayEnabled: false, audienceMode: "engineer", started: true });
  });
});

describe("inspection", () => {
  beforeEach(() => state().start());

  it("selects, isolates and steps back through the hierarchy with Esc", () => {
    state().selectComponent("pu04-bearing-front");
    state().isolateComponent("pu04-bearing-front");
    expect(state()).toMatchObject({ selectedComponent: "pu04-bearing-front", isolatedComponent: "pu04-bearing-front" });
    state().goBack();
    expect(state().isolatedComponent).toBeNull();
    state().goBack();
    expect(state().selectedComponent).toBe("propulsion-unit-04");
    state().goBack();
    expect(state().selectedComponent).toBeNull();
  });

  it("turns X-ray on with a filter and fades only the skin", () => {
    state().toggleXray();
    expect(isXrayActive(state())).toBe(true);
    let map = presentationMap(state());
    expect(map.get("fuselage-shell")!.opacity).toBe(OPACITY.xray);
    expect(map.get("battery-pack-left")!.opacity).toBe(1);

    state().setXrayFilter("power");
    map = presentationMap(state());
    expect(map.get("battery-pack-left")!.opacity).toBe(1);
    expect(map.get("fcc-a")!.opacity).toBe(OPACITY.faded);
    expect(map.get("pu04-inverter")!.opacity).toBe(1);
  });

  it("explodes in three levels: assemblies, then sub-assemblies, then inside a component", () => {
    state().setExplodedAmount(1);
    expect(state().cameraPreset).toBe("exploded");
    expect(subAssemblyOpen(state(), "pu04-motor")).toBe(false);

    state().setExplodedLevel(2);
    expect(subAssemblyOpen(state(), "pu04-motor")).toBe(true);
    state().selectComponent("propulsion-unit-04");
    expect(subAssemblyOpen(state(), "pu04-motor")).toBe(true);
    expect(subAssemblyOpen(state(), "pu03-motor")).toBe(false);

    state().setExplodedLevel(3);
    state().selectComponent("pu04-bearing-front");
    expect(componentOpen(state(), "pu04-bearing-front")).toBe(true);
    expect(componentOpen(state(), "pu04-motor")).toBe(false);

    state().setExplodedAmount(2);
    expect(state().explodedAmount).toBe(1);
  });

  it("sees a selected part through the skin of its own assembly", () => {
    state().selectComponent("propulsion-unit-04");
    state().selectComponent("pu04-motor");
    const map = presentationMap(state());
    expect(map.get("pu04-motor")!.opacity).toBe(1);
    expect(map.get("pu04-nacelle")!.opacity).toBe(OPACITY.xray);
    expect(map.get("fuselage-shell")!.opacity).toBe(OPACITY.xray);
    expect(map.get("pu04-nacelle")!.selectable).toBe(false);
  });

  it("offers cabin and structure views", () => {
    state().setViewPreset("cabin");
    expect(state().cameraPreset).toBe("cabin");
    expect(focusSet(state())).toEqual(expect.arrayContaining(["cabin-seats", "floor-structure", "battery-pack-left"]));
    state().setViewPreset("structure");
    expect(viewFlags(state()).loads).toBe(true);
    expect(focusSet(state())).toEqual(expect.arrayContaining(["wing-structure-left", "fuselage-frames", "main-gear-left"]));
  });
});

describe("systems", () => {
  beforeEach(() => {
    state().start();
    state().setMode("systems");
  });

  it("isolates a system's components and switches on its flow", () => {
    state().selectSystem("energy");
    const map = presentationMap(state());
    expect(map.get("battery-module-03")!.opacity).toBe(1);
    expect(map.get("gnss")!.opacity).toBe(OPACITY.faded);
    const flows = flowActivation(state());
    expect(flows["hv-pack-left"]).toBe(1);
    expect(flows["lv-forward"]).toBe(1);
    expect(flows["coolant-supply"]).toBe(0);
    expect(sceneShift(state())).toBeLessThan(0);
  });

  it("shows heat for thermal, loads for structures", () => {
    state().selectSystem("thermal");
    expect(viewFlags(state())).toMatchObject({ thermal: true, loads: false });
    expect(flowActivation(state())["coolant-battery-left"]).toBe(1);
    state().selectSystem("structures");
    expect(viewFlags(state())).toMatchObject({ thermal: false, loads: true });
  });

  it("widens the focus to related systems in the dependency view", () => {
    state().selectSystem("energy");
    expect(focusSet(state())).not.toContain("fcc-a");
    state().toggleDependencies();
    expect(viewFlags(state()).dependencies).toBe(true);
    expect(focusSet(state())).toEqual(expect.arrayContaining(["battery-module-03", "fcc-a", "pu04-motor", "heat-exchanger", "hums-computer"]));
  });
});

describe("health", () => {
  beforeEach(() => {
    state().start();
    state().setMode("health");
  });

  it("shows only the selected sensor category", () => {
    state().setHealthView("sensors");
    expect(sensorVisibility(state())).toEqual({ category: "vibration", ids: [] });
    state().setSensorCategory("thermal");
    expect(sensorVisibility(state()).category).toBe("thermal");
    expect(viewFlags(state()).thermal).toBe(true);
    state().setHealthView("overview");
    expect(sensorVisibility(state()).category).toBeNull();
  });

  it("keeps the skin see-through in the sensor view, even where it carries a sensor", () => {
    state().setHealthView("sensors");
    // An airframe vibration sensor sits on the starboard boom; the boom must not turn solid on its own.
    expect(focusSet(state())).toContain("pu04-bearing-front");
    expect(focusSet(state())).not.toContain("boom-right");
    const map = presentationMap(state());
    expect(map.get("boom-right")!.opacity).toBe(map.get("boom-left")!.opacity);
    expect(map.get("boom-right")!.opacity).toBe(OPACITY.xray);
  });

  it("traces a sensor: its own acquisition route and the health path light up", () => {
    state().startTrace("VIB-M04-A");
    expect(state()).toMatchObject({ selectedSensor: "VIB-M04-A", selectedComponent: null });
    expect(state().trace?.sensorId).toBe("VIB-M04-A");
    const flows = flowActivation(state());
    expect(flows["acquisition-04"]).toBe(1);
    expect(flows["uplink-wing-right"]).toBe(1);
    expect(flows["hums-edge"]).toBe(1);
    expect(flows["hums-maintenance"]).toBe(1);
    expect(flows["acquisition-01"]).toBe(0);
    expect(sensorVisibility(state()).ids).toContain("VIB-M04-A");

    state().goBack();
    expect(state().trace).toBeNull();
    expect(state().selectedSensor).toBe("VIB-M04-A");
    state().startTrace("NOT-A-SENSOR");
    expect(state().trace).toBeNull();
  });

  it("highlights a HUMS layer where it lives", () => {
    state().setHealthView("hums");
    state().setHumsLayer(4);
    expect(focusSet(state())).toContain("edge-processor");
    expect(state().cameraPreset).toBe("hums");
  });
});

describe("mission", () => {
  it("starts from a healthy aircraft on the vertiport pad", () => {
    state().startFault("bearing-degradation");
    state().runMission("executive");
    expect(state()).toMatchObject({ mode: "mission", missionStage: "PREFLIGHT", missionPlaying: true, missionAuthorized: false, faultScenario: null, environment: "vertiport", cameraPreset: "mission-preflight" });
    expect(operatingPoint(state())).toEqual({ kind: "mission" });
  });

  it("follows the stages through flight and back to the pad", () => {
    state().runMission("executive");
    state().missionDispatch({ type: "AUTHORIZE" });
    expect(state()).toMatchObject({ missionStage: "TAKEOFF", missionAuthorized: true, cameraPreset: "mission-takeoff" });
    state().missionDispatch({ type: "NEXT" });
    expect(state()).toMatchObject({ missionStage: "TRANSITION", environment: "flight" });
    for (let i = 0; i < 3; i++) state().missionDispatch({ type: "NEXT" });
    expect(state()).toMatchObject({ missionStage: "DIAGNOSIS", cameraPreset: "mission-event" });
    expect(presentationMap(state()).get("pu04-nacelle")!.opacity).toBe(OPACITY.xray);
    for (let i = 0; i < 4; i++) state().missionDispatch({ type: "NEXT" });
    expect(state()).toMatchObject({ missionStage: "POSTFLIGHT", environment: "vertiport" });
    state().missionDispatch({ type: "NEXT" });
    expect(state()).toMatchObject({ missionStage: "COMPLETE", missionPlaying: false });
  });

  it("reports completion once, when the clock reaches the end", () => {
    state().runMission("executive");
    simClock.mission = { ...simClock.mission, stage: "COMPLETE", playing: false };
    sync(STAGE_SEVERITY.MAINTENANCE);
    sync(STAGE_SEVERITY.MAINTENANCE);
    expect(state().missionStage).toBe("COMPLETE");
    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith("uflight_3d_mission_complete", { profile: "executive" });
  });

  it("hands the finding to the rest of the experience when the mission is left", () => {
    state().runMission("executive");
    for (let i = 0; i < 9; i++) state().missionDispatch({ type: "NEXT" });
    expect(state().missionStage).toBe("POSTFLIGHT");
    state().setMode("health");
    expect(state()).toMatchObject({ missionStage: "IDLE", faultScenario: "bearing-degradation", faultStage: "MAINTENANCE", environment: "studio" });
  });
});

describe("fault lab", () => {
  it("steps the bearing scenario through its stages, flying until maintenance", () => {
    state().startFault("bearing-degradation");
    expect(operatingPoint(state())).toMatchObject({ kind: "steady", config: "cruise" });
    expect(state().cameraPreset).toBe("fault");
    for (const stage of ["EARLY_CHANGE", "ANOMALOUS", "DIAGNOSED", "DEGRADING", "ACTION_REQUIRED"] as const) {
      state().faultDispatch({ type: "NEXT" });
      expect(state().faultStage).toBe(stage);
      expect(state().environment).toBe("flight");
    }
    state().faultDispatch({ type: "NEXT" });
    expect(state()).toMatchObject({ faultStage: "MAINTENANCE", environment: "vertiport" });
    expect(operatingPoint(state())).toMatchObject({ kind: "steady", config: "ground" });
    expect(viewFlags(state()).vibration).toBe(true);
  });

  it("mirrors the simulation's health into the store", () => {
    state().startFault("bearing-degradation");
    state().faultDispatch({ type: "GOTO", stage: "DIAGNOSED" });
    sync(STAGE_SEVERITY.DIAGNOSED);
    expect(state().healthStates.propulsion).toBe("DEGRADED");
    expect(state().vehicleState).toBe("MISSION_CAPABLE");
    expect(state().digitalTwinState.components["propulsion-unit-04"]?.state).toBe("DEGRADED");
    expect(state().sensorValues["pu04.vibration"]).toBeGreaterThan(1.3);
    expect(state().faultSeverity).toBe(simClock.faultSeverity);
  });

  it("runs the battery scenario in the battery bay, in hover", () => {
    state().startFault("battery-imbalance");
    expect(state().cameraPreset).toBe("battery-bay");
    expect(operatingPoint(state())).toMatchObject({ config: "hover" });
    expect(presentationMap(state()).get("battery-module-03")!.opacity).toBe(1);
    expect(flowActivation(state())["battery-sense-left"]).toBe(1);
  });

  it("clears the fault", () => {
    state().startFault("bearing-degradation");
    state().clearFault();
    expect(state()).toMatchObject({ faultScenario: null, faultStage: "HEALTHY", faultSeverity: 0, environment: "studio" });
  });
});

describe("digital twin", () => {
  it("opens in the twin space at an operating condition, with the reference overlay", () => {
    state().start();
    state().setMode("twin");
    expect(state()).toMatchObject({ environment: "twin", cameraPreset: "digital-twin", twinSystem: "propulsion", flightConfig: "cruise", predictionTime: 0 });
    expect(viewFlags(state()).ghost).toBe(true);
    expect(presentationMap(state()).get("fuselage-shell")!.opacity).toBe(OPACITY.twinSkin);
  });

  it("moves along the time control, within its horizon", () => {
    state().setMode("twin");
    state().setPredictionTime(60);
    expect(state().predictionTime).toBe(60);
    state().setPredictionTime(-500);
    expect(state().predictionTime).toBe(-100);
    state().setPredictionTime(500);
    expect(state().predictionTime).toBe(100);
    state().setMode("health");
    expect(state().predictionTime).toBe(0);
  });

  it("follows the active scenario to the system it concerns", () => {
    state().startFault("battery-imbalance");
    state().setMode("twin");
    expect(state().twinSystem).toBe("energy");
    state().viewTwin("thermal");
    expect(state()).toMatchObject({ mode: "twin", twinSystem: "thermal" });
  });
});

describe("architecture", () => {
  beforeEach(() => {
    state().start();
    state().setMode("architecture");
  });

  it("filters the data routes by network", () => {
    state().setNetworkFilter("health");
    let flows = flowActivation(state());
    expect(flows["acquisition-04"]).toBe(1);
    expect(flows["hums-edge"]).toBe(1);
    expect(flows["nav-fcc-a"]).toBe(0);
    expect(flows["hv-riser"]).toBe(0);

    state().setNetworkFilter("flight-critical");
    flows = flowActivation(state());
    expect(flows["nav-fcc-a"]).toBe(1);
    expect(flows["command-b"]).toBe(1);
    expect(flows["motor-command-04"]).toBe(1);
    expect(flows["acquisition-04"]).toBe(0);

    state().setNetworkFilter("ground");
    flows = flowActivation(state());
    expect(flows["link-maintenance"]).toBe(1);
    expect(flows["hums-edge"]).toBe(0);
  });

  it("stops FCC-B's routes when the channel fails, and nothing else", () => {
    state().setArchitectureView("redundancy");
    expect(state().cameraPreset).toBe("redundancy");
    expect(flowActivation(state())["command-b"]).toBe(1);
    state().toggleChannelFailure();
    const flows = flowActivation(state());
    expect(flows["command-b"]).toBe(0);
    expect(flows["nav-fcc-b"]).toBe(0);
    expect(flows["command-a"]).toBe(1);
    expect(flows["command-c"]).toBe(1);
    sync();
    expect(state().vehicleState).toBe("MISSION_CAPABLE_WITH_LIMITATION");
    expect(state().healthStates.flightControl).toBe("LIMITED");
  });

  it("drops the GNSS route when GNSS is unavailable, keeping the others", () => {
    state().setArchitectureView("navigation");
    state().toggleGnss();
    const flows = flowActivation(state());
    expect(flows["nav-gnss"]).toBe(0);
    expect(flows["nav-imu-a"]).toBe(1);
    expect(flows["nav-vision-sensors"]).toBe(1);
    sync();
    expect(state().healthStates.navigation).toBe("DEGRADED");
  });
});

describe("panels", () => {
  it("closes help and about before anything else on Esc", () => {
    state().start();
    state().selectComponent("fcc-a");
    state().setAboutOpen(true);
    expect(state()).toMatchObject({ aboutOpen: true, helpOpen: false });
    state().setHelpOpen(true);
    expect(state()).toMatchObject({ aboutOpen: false, helpOpen: true });
    state().goBack();
    expect(state()).toMatchObject({ helpOpen: false, selectedComponent: "fcc-a" });
  });
});

describe("camera composition", () => {
  it("stands further back in a window that leaves less room between the panels, and never closer", () => {
    expect(viewportFit(1440, 900)).toBe(1);
    expect(viewportFit(1920, 1080)).toBe(1);
    expect(viewportFit(1024, 768)).toBeGreaterThan(1.3);
    expect(viewportFit(1024, 768)).toBeLessThan(1.5);
    // A tall, narrow window is capped so the aircraft never becomes a speck.
    expect(viewportFit(1024, 1366)).toBe(1.6);
  });
});
