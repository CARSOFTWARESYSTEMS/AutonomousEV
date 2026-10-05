import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FaultStage } from "../types";
import AircraftControls from "../modes/AircraftMode";
import ArchitectureControls, { ArchitectureChain, ArchitecturePanel } from "../modes/ArchitectureMode";
import FaultControls, { FaultPanel, FaultStages } from "../modes/FaultLabMode";
import { HealthDetail, HealthSummary } from "../modes/HealthMode";
import MissionControls, { MissionCaption, MissionPanel } from "../modes/MissionMode";
import SystemsControls, { SystemPanel } from "../modes/SystemsMode";
import TwinControls, { TwinPanel, TwinSystems } from "../modes/TwinMode";
import { STAGE_SEVERITY } from "../simulation/faultModels";
import { buildHealthSnapshot } from "../simulation/hums";
import { flightStateAt, groundState, stageAt, steadyState } from "../simulation/mission";
import { simClock } from "../state/simClock";
import { resetUFlightSession, useUFlightStore } from "../state/uflightStore";
import AboutPanel from "./AboutPanel";
import ComponentPanel from "./ComponentPanel";
import Header from "./Header";
import HeroOverlay from "./HeroOverlay";
import LoadingScreen from "./LoadingScreen";
import ModeToolbar from "./ModeToolbar";
import SensorPanel from "./SensorPanel";

vi.mock("@/utils/analytics", () => ({ trackEvent: vi.fn() }));

const state = () => useUFlightStore.getState();

/** Publish the simulation's output, as the render loop does. */
function sync(severity?: number) {
  act(() => {
    const s = state();
    const mission = simClock.mission;
    const inMission = s.mode === "mission" && mission.stage !== "IDLE";
    const time = Math.min(mission.timeS, 119.9);
    const flight = inMission ? flightStateAt(time, mission.profile) : simClock.fault.stage === "MAINTENANCE" ? groundState() : steadyState(s.mode === "fault-lab" && simClock.fault.scenario === "battery-imbalance" ? "hover" : "cruise");
    const level = severity ?? (simClock.fault.scenario ? STAGE_SEVERITY[simClock.fault.stage] : 0);
    simClock.faultSeverity = level;
    const inputs = {
      missionTimeS: time,
      missionPhase: mission.stage,
      config: "cruise" as const,
      flight,
      faults: { scenario: simClock.fault.scenario, stage: simClock.fault.stage, severity: level, fccBFailed: s.fccBFailed, gnssUnavailable: s.gnssUnavailable },
    };
    s.syncSimulation({ flight, inputs, snapshot: buildHealthSnapshot(inputs), missionTimeS: time, stageProgress: inMission && mission.stage !== "COMPLETE" ? stageAt(time, mission.profile).progress : 0, awaitingAuthorization: false });
  });
}

const goTo = (stage: FaultStage) => {
  act(() => state().faultDispatch({ type: "GOTO", stage }));
  sync();
};

beforeEach(() => {
  act(() => resetUFlightSession());
});

describe("opening", () => {
  it("presents the product, the headline and the two calls to action", async () => {
    const user = userEvent.setup();
    render(<HeroOverlay />);
    expect(screen.getByText("THE AIRCRAFT KNOWS MORE THAN YOU CAN SEE.")).toBeInTheDocument();
    expect(screen.getByText(/Advanced Health Monitoring Systems for/)).toHaveTextContent("Next-Generation Air Mobility");
    expect(screen.getByText("6-Seat eVTOL Reference Platform")).toBeInTheDocument();
    expect(screen.getByText(/digital engineering demonstrator/)).toBeInTheDocument();

    const enter = screen.getByRole("button", { name: /ENTER DIGITAL TWIN/ });
    expect(enter).toHaveAttribute("data-track-event", "uflight_3d_launch");
    expect(screen.getByRole("button", { name: /RUN HEALTH DEMO/ })).toHaveAttribute("data-track-event", "uflight_3d_health_demo");
    await user.click(enter);
    expect(state()).toMatchObject({ started: true, mode: "aircraft" });
  });

  it("runs the health demo from the opening", async () => {
    const user = userEvent.setup();
    render(<HeroOverlay />);
    await user.click(screen.getByRole("button", { name: /RUN HEALTH DEMO/ }));
    expect(state()).toMatchObject({ mode: "fault-lab", faultScenario: "bearing-degradation" });
  });

  it("loads through five named steps, with a progress bar rather than a spinner", () => {
    render(<LoadingScreen progress={0.5} />);
    expect(screen.getByText("INITIALIZING DIGITAL AIRCRAFT")).toBeInTheDocument();
    const steps = within(screen.getByRole("list", { name: "Loading steps" })).getAllByRole("listitem");
    expect(steps.map((s) => s.textContent)).toEqual(["Aircraft geometry", "Systems architecture", "Health models", "Digital twin", "Mission environment"]);
    expect(steps.map((s) => s.dataset.state)).toEqual(["done", "done", "active", "pending", "pending"]);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  });
});

describe("header and navigation", () => {
  it("holds the only H1, the audience toggle and the vehicle state", async () => {
    const user = userEvent.setup();
    act(() => state().start());
    render(<Header />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("UFLIGHT™ 3D");
    expect(screen.getByRole("link", { name: "Back to Aerospace" })).toHaveAttribute("href", "/aerospace");
    expect(screen.getByTestId("vehicle-state")).toHaveTextContent("MISSION CAPABLE");

    expect(screen.getByRole("button", { name: "EXECUTIVE" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "ENGINEER" }));
    expect(state().audienceMode).toBe("engineer");
    expect(screen.getByRole("button", { name: "ENGINEER" })).toHaveAttribute("aria-pressed", "true");
  });

  it("offers the six primary modes and ARCHITECTURE, one marked current", async () => {
    const user = userEvent.setup();
    act(() => state().start());
    render(<ModeToolbar />);
    const nav = screen.getByRole("navigation", { name: "UFlight 3D modes" });
    expect(within(nav).getAllByRole("button").map((b) => b.textContent)).toEqual(["AIRCRAFT", "SYSTEMS", "HEALTH", "MISSION", "FAULT LAB", "TWIN", "ARCHITECTURE", "RESET"]);
    expect(within(nav).getByRole("button", { name: "AIRCRAFT" })).toHaveAttribute("aria-current", "page");
    await user.click(within(nav).getByRole("button", { name: "HEALTH" }));
    expect(state().mode).toBe("health");
    expect(within(nav).getByRole("button", { name: "HEALTH" })).toHaveAttribute("data-track-event", "uflight_3d_health_mode");
    expect(within(nav).getByRole("button", { name: "FAULT LAB" })).toHaveAttribute("data-track-event", "uflight_3d_fault_lab");
    expect(within(nav).getByRole("button", { name: "TWIN" })).toHaveAttribute("data-track-event", "uflight_3d_twin_mode");
  });

  it("shows who prepared the experience from the header", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Header />
        <AboutPanel />
      </>,
    );
    await user.click(screen.getByRole("button", { name: /About this experience/ }));
    const about = screen.getByRole("dialog", { name: "About this experience" });
    expect(within(about).getByText("Prepared by")).toBeInTheDocument();
    expect(within(about).getByRole("link", { name: /View full profile/ })).toHaveAttribute("href", "/about/sudarshana-karkala");
    expect(within(about).getByText(/UFlight™ 3D is an EV.ENGINEER™ digital engineering demonstrator/)).toBeInTheDocument();
    await user.click(within(about).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog", { name: "About this experience" })).toBeNull();
  });

  it("acknowledges the early design work that inspired it, after Prepared by", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Header />
        <AboutPanel />
      </>,
    );
    await user.click(screen.getByRole("button", { name: /About this experience/ }));
    const about = screen.getByRole("dialog", { name: "About this experience" });
    const credit = within(about).getByRole("region", { name: "Inspiration & Acknowledgement" });
    expect(within(about).getByRole("region", { name: "Prepared by" }).compareDocumentPosition(credit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(credit).getByText(/helped inspire our approach to visualising complex aerospace systems, Digital Twins, health monitoring and interactive 3D engineering\./)).toBeInTheDocument();
    expect(within(credit).getAllByRole("link")).toHaveLength(2);
  });
});

describe("aircraft and systems controls", () => {
  it("offers X-ray with its eight system filters, the assembly slider and three levels", async () => {
    const user = userEvent.setup();
    act(() => state().start());
    render(<AircraftControls />);
    const xray = screen.getByRole("button", { name: "X-RAY" });
    expect(xray).toHaveAttribute("data-track-event", "uflight_3d_xray");
    expect(screen.queryByRole("group", { name: /X-ray filter/ })).toBeNull();
    await user.click(xray);
    expect(xray).toHaveAttribute("aria-pressed", "true");
    const filters = within(screen.getByRole("group", { name: /X-ray filter/ })).getAllByRole("button");
    expect(filters.map((f) => f.textContent)).toEqual(["ALL", "POWER", "PROPULSION", "AVIONICS", "FLIGHT CONTROL", "THERMAL", "STRUCTURE", "DATA", "HEALTH"]);
    await user.click(screen.getByRole("button", { name: "PROPULSION" }));
    expect(state().xrayFilter).toBe("propulsion");

    expect(screen.getByRole("slider", { name: /ASSEMBLY/ })).toHaveValue("0");
    await user.click(screen.getByRole("button", { name: "SUBSYSTEMS" }));
    expect(state().explodedLevel).toBe(2);
    await user.click(screen.getByRole("button", { name: "CABIN" }));
    expect(state().viewPreset).toBe("cabin");
    await user.click(screen.getByRole("button", { name: "CRUISE" }));
    expect(state().flightConfig).toBe("cruise");
  });

  it("lists the nine systems and describes the selected one", async () => {
    const user = userEvent.setup();
    act(() => {
      state().start();
      state().setMode("systems");
    });
    render(
      <>
        <SystemsControls />
        <SystemPanel />
      </>,
    );
    const tabs = within(screen.getByRole("tablist", { name: "Systems" })).getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["PROPULSION", "ENERGY", "AVIONICS", "FLIGHT CONTROL", "NAVIGATION", "STRUCTURES", "THERMAL", "COMMUNICATIONS", "HUMS"]);
    expect(screen.getByRole("tab", { name: "PROPULSION" })).toHaveAttribute("data-track-event", "uflight_3d_propulsion");
    expect(screen.getByRole("tab", { name: "ENERGY" })).toHaveAttribute("data-track-event", "uflight_3d_energy");

    const panel = screen.getByTestId("system-panel");
    expect(within(panel).getByRole("list", { name: "PROPULSION flow" })).toHaveTextContent("BatteryHV busInverterMotor");

    await user.click(screen.getByRole("tab", { name: "STRUCTURES" }));
    expect(within(panel).getByText(/ENGINEERING VISUALIZATION/)).toBeInTheDocument();
    await user.click(within(panel).getByRole("button", { name: "HOVER" }));
    expect(state().flightConfig).toBe("hover");

    await user.click(screen.getByRole("tab", { name: "THERMAL" }));
    expect(within(screen.getByRole("list", { name: "Heat levels" })).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["COOL", "NOMINAL", "WARM", "LIMITED"]);

    await user.click(screen.getByRole("tab", { name: "ENERGY" }));
    await user.click(screen.getByRole("button", { name: "DEPENDENCIES" }));
    const deps = screen.getByTestId("dependencies");
    for (const system of ["PROPULSION", "FLIGHT CONTROL", "AVIONICS", "THERMAL", "COMMUNICATIONS", "HUMS"]) expect(within(deps).getAllByText(system).length).toBeGreaterThan(0);
  });
});

describe("component panel", () => {
  const open = () => {
    act(() => {
      state().startFault("bearing-degradation");
      state().faultDispatch({ type: "GOTO", stage: "DIAGNOSED" });
      state().selectComponent("propulsion-unit-04");
    });
    sync();
    return render(<ComponentPanel />);
  };

  it("gives an executive the consequences: health, mission impact, availability, maintenance", () => {
    open();
    const panel = screen.getByTestId("component-panel");
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("PROPULSION UNIT 04");
    expect(within(panel).getByText("Electric propulsion module")).toBeInTheDocument();
    const text = panel.textContent ?? "";
    expect(text).toContain("Health◐DEGRADED");
    expect(text).toContain("Mission impactLOW");
    expect(text).toContain("AvailabilityAVAILABLE");
    expect(text).toContain("MaintenanceINSPECTION REQUIRED");
    expect(within(panel).queryByText("Telemetry")).toBeNull();
    expect(text).not.toMatch(/RPM|Sensor IDs/);
  });

  it("gives an engineer the telemetry behind the state", () => {
    act(() => state().setAudienceMode("engineer"));
    open();
    const panel = screen.getByTestId("component-panel");
    const text = panel.textContent ?? "";
    for (const label of ["RPM", "Phase current", "DC voltage", "Winding temp", "Inverter temp", "Bearing temp", "Vibration", "Vibration feature", "Health model state", "Residual", "Trend", "Predicted band", "Sensor IDs"]) expect(text, label).toContain(label);
    expect(text).toContain("ResidualABOVE BASELINE");
    expect(text).toContain("TrendINCREASING");
    expect(text).toContain("VIB-M04-A");
    expect(text).toContain("SIMULATED HEALTH DATA");
    expect(within(panel).getByRole("list", { name: "Position in the aircraft" })).toHaveTextContent("AIRCRAFTPROPULSIONPropulsion Unit 04");
  });

  it("offers isolate, sensors, trace, fault demo and twin", async () => {
    const user = userEvent.setup();
    open();
    const panel = screen.getByTestId("component-panel");
    for (const name of ["ISOLATE", "VIEW SENSORS", "TRACE HEALTH DATA", "RUN FAULT DEMO", "VIEW TWIN", "BACK"]) expect(within(panel).getByRole("button", { name })).toBeInTheDocument();
    await user.click(within(panel).getByRole("button", { name: "ISOLATE" }));
    expect(state().isolatedComponent).toBe("propulsion-unit-04");
    await user.click(within(panel).getByRole("button", { name: "TRACE HEALTH DATA" }));
    expect(state().trace?.sensorId).toBe("VIB-M04-A");
  });
});

describe("health mode", () => {
  beforeEach(() => {
    act(() => {
      state().start();
      state().setMode("health");
    });
    sync();
  });

  it("reports seven systems and the aircraft status in words, not a single score", () => {
    render(<HealthSummary />);
    const rows = within(screen.getByRole("group", { name: "System health" })).getAllByRole("button");
    expect(rows.map((r) => r.textContent)).toEqual(["PROPULSION●NOMINAL", "ENERGY●NOMINAL", "FLIGHT CONTROL●NOMINAL", "STRUCTURE●NOMINAL", "AVIONICS●NOMINAL", "THERMAL●NOMINAL", "NAVIGATION●NOMINAL"]);
    expect(screen.getByRole("status", { name: "Aircraft status" })).toHaveTextContent("MISSION CAPABLE");
    expect(screen.getByTestId("health-summary").textContent).not.toMatch(/\d+\s?%/);
  });

  it("drills from a system down to its assemblies", async () => {
    const user = userEvent.setup();
    act(() => {
      state().startFault("bearing-degradation");
      state().faultDispatch({ type: "GOTO", stage: "DIAGNOSED" });
      state().setMode("health");
    });
    sync();
    render(
      <>
        <HealthSummary />
        <HealthDetail />
      </>,
    );
    expect(screen.getByRole("status", { name: "Aircraft status" })).toHaveTextContent("MISSION CAPABLE");
    const propulsion = within(screen.getByRole("group", { name: "System health" })).getByRole("button", { name: /PROPULSION/ });
    expect(propulsion).toHaveTextContent("◐DEGRADED");
    await user.click(propulsion);
    const detail = screen.getByTestId("system-health");
    expect(within(detail).getByRole("list", { name: "Health hierarchy" })).toHaveTextContent("AIRCRAFTPROPULSION");
    expect(within(detail).getAllByRole("button", { name: /PROPULSION UNIT/ })).toHaveLength(8);
    await user.click(within(detail).getByRole("button", { name: /PROPULSION UNIT 04/ }));
    expect(state().selectedComponent).toBe("propulsion-unit-04");
  });

  it("filters sensors by category and opens one", async () => {
    const user = userEvent.setup();
    render(
      <>
        <HealthSummary />
        <HealthDetail />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "SENSORS" }));
    const list = screen.getByTestId("sensor-list");
    expect(within(within(list).getByRole("group", { name: "Sensor category" })).getAllByRole("button").map((b) => b.textContent)).toEqual(["VIBRATION", "THERMAL", "ELECTRICAL", "STRUCTURAL", "POSITION", "NAVIGATION"]);
    await user.click(within(list).getByRole("button", { name: /VIB-M04-A/ }));
    expect(state().selectedSensor).toBe("VIB-M04-A");
    await user.click(within(list).getByRole("button", { name: "STRUCTURAL" }));
    expect(state().sensorCategory).toBe("structural");
    expect(within(list).getByRole("button", { name: /STR-WR-1/ })).toBeInTheDocument();
  });

  it("explains HUMS in six layers", async () => {
    const user = userEvent.setup();
    render(
      <>
        <HealthSummary />
        <HealthDetail />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "HUMS" }));
    const layers = within(screen.getByRole("group", { name: "HUMS layers" })).getAllByRole("button");
    expect(layers).toHaveLength(6);
    await user.click(layers[3]);
    expect(state().humsLayer).toBe(4);
    expect(layers[3]).toHaveTextContent("Feature extraction · FFT · Order analysis · Sensor fusion · Anomaly detection");
  });
});

describe("sensor trace", () => {
  it("lists the eight steps and follows them", async () => {
    const user = userEvent.setup();
    act(() => {
      state().start();
      state().setMode("health");
      state().selectSensor("VIB-M04-A");
    });
    sync();
    render(<SensorPanel />);
    const panel = screen.getByTestId("sensor-panel");
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("VIB-M04-A");
    const steps = within(screen.getByTestId("trace-steps")).getAllByRole("listitem");
    expect(steps.map((s) => s.textContent?.replace(/^\d\d/, ""))).toEqual(["Sensor", "Acquisition Node", "Edge Processing", "Feature Extraction", "Health Model", "Diagnostic State", "Prognostic Model", "Maintenance Action"]);

    await user.click(within(panel).getByRole("button", { name: "TRACE" }));
    expect(state().trace?.sensorId).toBe("VIB-M04-A");
    expect(within(panel).getByRole("button", { name: "STOP TRACE" })).toBeInTheDocument();
    expect(within(screen.getByTestId("trace-steps")).getAllByRole("listitem")[0]).toHaveAttribute("aria-current", "step");
    await user.click(within(panel).getByRole("button", { name: "STOP TRACE" }));
    expect(state().trace).toBeNull();
  });
});

describe("bearing fault progression", () => {
  const start = () => {
    act(() => state().startFault("bearing-degradation"));
    sync();
    return render(
      <>
        <FaultStages />
        <FaultControls />
        <FaultPanel />
      </>,
    );
  };

  it("starts healthy and quiet", () => {
    start();
    const panel = screen.getByTestId("fault-panel");
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("Motor 04 is running normally");
    expect(panel.textContent).toContain("Motor 04●NOMINAL");
    expect(panel.textContent).toContain("HUMSMONITORING");
    expect(panel.textContent).not.toContain("ANOMALY DETECTED");
    expect(within(panel).getByText("SIMULATED SIGNAL", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByTestId("signal-chart")).toHaveAttribute("data-domain", "time");
  });

  it("stays in monitoring through the early change, then announces the anomaly", () => {
    start();
    goTo("EARLY_CHANGE");
    const panel = screen.getByTestId("fault-panel");
    expect(panel.textContent).toContain("HUMSMONITORING");
    expect(panel.textContent).toContain("Motor 04●NOMINAL");

    goTo("ANOMALOUS");
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("ANOMALY DETECTED");
    expect(panel.textContent).toContain("Motor 04◐DEGRADED");
    expect(panel.textContent).toContain("Vehicle●MISSION CAPABLE");
  });

  it("diagnoses with evidence and a worded confidence", () => {
    start();
    goTo("DIAGNOSED");
    const diagnosis = screen.getByTestId("diagnosis");
    expect(diagnosis).toHaveTextContent("POSSIBLE BEARING DEGRADATION");
    expect(within(within(diagnosis).getByRole("list", { name: "Evidence" })).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Vibration trendPRESENT", "Frequency featurePRESENT", "Temperature trendPRESENT"]);
    expect(diagnosis.textContent).toContain("ConfidenceHIGH");
    expect(diagnosis.textContent).not.toMatch(/\d+(\.\d+)?\s?%/);
  });

  it("projects a health trajectory with a maintenance window, not a precise life", () => {
    start();
    goTo("DEGRADING");
    const prognosis = screen.getByTestId("prognosis");
    expect(within(prognosis).getByTestId("prognosis-chart")).toBeInTheDocument();
    expect(prognosis.textContent).toMatch(/Within next \d+–\d+ flight cycles/);
    expect(prognosis.textContent).toContain("MAINTENANCE THRESHOLD");
    expect(prognosis.textContent).not.toMatch(/\d+\.\d+\s?hours/);
  });

  it("states the mission impact, then the maintenance action after landing", () => {
    start();
    goTo("ACTION_REQUIRED");
    const impact = screen.getByTestId("mission-impact");
    expect(impact.textContent).toContain("Immediate safety impactNONE");
    expect(impact.textContent).toContain("Flight-control effectNONE");
    expect(impact.textContent).toContain("Propulsion availabilityAVAILABLE");
    expect(impact.textContent).toContain("Dispatch impactPOST-FLIGHT INSPECTION REQUIRED");

    goTo("MAINTENANCE");
    const panel = screen.getByTestId("fault-panel");
    expect(panel.textContent).toContain("Inspect propulsion unit 04 bearing assembly.");
    expect(panel.textContent).toContain("Close condition only after inspection.");
    expect(panel.textContent).toContain("Motor 04■MAINTENANCE REQUIRED");
    expect(panel.textContent).toContain("Vehicle■NOT RELEASED");
    expect(panel.textContent).toContain("This is a reference educational scenario.");
  });

  it("steps with the stage list and the transport", async () => {
    const user = userEvent.setup();
    start();
    const stages = within(screen.getByRole("list", { name: "Scenario stages" })).getAllByRole("button");
    expect(stages.map((s) => s.textContent?.replace(/^\d\d/, ""))).toEqual(["HEALTHY", "EARLY CHANGE", "ANOMALY", "DIAGNOSIS", "PROGNOSIS", "MISSION DECISION", "MAINTENANCE ACTION"]);
    await user.click(screen.getByRole("button", { name: "Next stage" }));
    expect(state().faultStage).toBe("EARLY_CHANGE");
    expect(screen.getByTestId("fault-stage")).toHaveTextContent("02 / 07EARLY CHANGE");
    await user.click(stages[3]);
    expect(state().faultStage).toBe("DIAGNOSED");
    expect(stages[3]).toHaveAttribute("aria-current", "step");
    await user.click(screen.getByRole("button", { name: "Previous stage" }));
    expect(state().faultStage).toBe("ANOMALOUS");
  });

  it("offers time, frequency and order views to an engineer", async () => {
    const user = userEvent.setup();
    act(() => state().setAudienceMode("engineer"));
    start();
    goTo("DIAGNOSED");
    const domains = within(screen.getByRole("group", { name: "Signal domain" })).getAllByRole("button");
    expect(domains.map((d) => d.textContent)).toEqual(["TIME", "FREQUENCY", "ORDER"]);
    await user.click(screen.getByRole("button", { name: "FREQUENCY" }));
    expect(screen.getByTestId("signal-chart")).toHaveAttribute("data-domain", "frequency");
    expect(screen.getByTestId("signal-chart").textContent).toContain("Bearing");
    await user.click(screen.getByRole("button", { name: "ORDER" }));
    expect(screen.getByTestId("signal-chart")).toHaveAttribute("data-domain", "order");
    expect(screen.getByTestId("signal-chart").textContent).toContain("3.58× bearing");
    expect(screen.getByTestId("signal-view").textContent).toContain("Bearing feature");
  });
});

describe("battery fault", () => {
  it("degrades module 03 and derates power capability", () => {
    act(() => state().startFault("battery-imbalance"));
    sync();
    render(<FaultPanel />);
    const panel = screen.getByTestId("fault-panel");
    expect(panel.textContent).toContain("Module 03●NOMINAL");
    goTo("DIAGNOSED");
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("MODULE 03 DEGRADED");
    expect(panel.textContent).toContain("Voltage spread ↑");
    expect(panel.textContent).toContain("Temperature spread ↑");
    expect(panel.textContent).toContain("Resistance estimate ↑");
    goTo("ACTION_REQUIRED");
    expect(screen.getByTestId("mission-impact").textContent).toContain("Power capabilityDERATED");
    expect(panel.textContent).toContain("Vehicle▲MISSION CAPABLE WITH LIMITATION");
  });
});

describe("mission", () => {
  const view = () =>
    render(
      <>
        <MissionCaption />
        <MissionPanel />
        <MissionControls />
      </>,
    );

  it("offers the executive demo and the engineering mission", async () => {
    const user = userEvent.setup();
    act(() => {
      state().start();
      state().setMode("mission");
    });
    view();
    const executive = screen.getByRole("button", { name: /EXECUTIVE DEMO/ });
    expect(executive).toHaveAttribute("data-track-event", "uflight_3d_mission_start");
    expect(screen.getByRole("button", { name: /ENGINEERING MISSION/ })).toBeInTheDocument();
    await user.click(executive);
    expect(state()).toMatchObject({ missionStage: "PREFLIGHT", missionProfile: "executive" });
  });

  it("assesses release in preflight and waits for authorization", async () => {
    const user = userEvent.setup();
    act(() => state().runMission("executive"));
    act(() => {
      simClock.mission = { ...simClock.mission, timeS: 8.99 };
      const s = state();
      s.syncSimulation({ ...s.telemetry, missionTimeS: 8.99, stageProgress: 1, awaitingAuthorization: true });
    });
    view();
    const panel = screen.getByTestId("mission-panel");
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("AIRCRAFT RELEASE ASSESSMENT");
    expect(within(within(panel).getByRole("list", { name: "Release checks" })).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "ENERGY●PASS",
      "PROPULSION●PASS",
      "FLIGHT CONTROL●PASS",
      "NAVIGATION●PASS",
      "STRUCTURE●PASS",
      "THERMAL●PASS",
      "AVIONICS●PASS",
      "HUMS●READY",
    ]);
    expect(panel.textContent).toContain("VEHICLE●MISSION CAPABLE");
    await user.click(within(panel).getByRole("button", { name: "AUTHORIZE FLIGHT" }));
    expect(state()).toMatchObject({ missionStage: "TAKEOFF", missionAuthorized: true });
  });

  it("announces each stage to assistive technology and shows lift share in transition", () => {
    act(() => {
      state().runMission("executive");
      state().missionDispatch({ type: "PAUSE" });
      state().missionDispatch({ type: "NEXT" });
      state().missionDispatch({ type: "NEXT" });
      state().missionDispatch({ type: "SEEK", timeS: simClock.mission.timeS + 7 });
    });
    sync();
    view();
    const caption = screen.getByTestId("mission-caption");
    expect(caption).toHaveAttribute("aria-live", "polite");
    expect(caption).toHaveTextContent("TRANSITION");
    const bars = screen.getByLabelText("Share of lift carried by the rotors and by the wing");
    expect(bars.textContent).toMatch(/ROTOR\d+%WING\d+%/);
    expect(screen.getByText("Educational representation, not measured aerodynamics.")).toBeInTheDocument();
    expect(screen.getByTestId("mission-stage")).toHaveTextContent("03TRANSITION");
    expect(within(screen.getByRole("list", { name: "Mission stages" })).getAllByRole("button")).toHaveLength(10);
  });

  it("is quiet in cruise", () => {
    act(() => {
      state().runMission("executive");
      state().missionDispatch({ type: "PAUSE" });
      for (let i = 0; i < 3; i++) state().missionDispatch({ type: "NEXT" });
    });
    sync();
    view();
    expect(screen.getByTestId("mission-caption")).toHaveTextContent("HUMS · BACKGROUND MONITORING");
    expect(screen.getByTestId("mission-panel")).toHaveTextContent("BACKGROUND MONITORING");
    expect(screen.getByTestId("mission-panel").textContent).not.toContain("ANOMALY");
  });

  it("decides to continue, then requires maintenance after the flight", () => {
    act(() => {
      state().runMission("executive");
      state().missionDispatch({ type: "PAUSE" });
      for (let i = 0; i < 6; i++) state().missionDispatch({ type: "NEXT" });
    });
    act(() => {
      simClock.fault = { scenario: "bearing-degradation", stage: "DEGRADING", playing: false, stageTimeS: 0 };
    });
    sync(0.52);
    view();
    const panel = screen.getByTestId("mission-panel");
    expect(panel.textContent).toContain("MOTOR 04 · Degradation detected");
    expect(panel.textContent).toContain("Immediate safety impactNONE");
    expect(panel.textContent).toContain("Mission impactLOW");
    expect(panel.textContent).toContain("Operational recommendationCONTINUE TO DESTINATION");
    expect(panel.textContent).toContain("Post-flightINSPECTION REQUIRED");
    expect(panel.textContent).toContain("REFERENCE / SIMULATED");

    act(() => {
      for (let i = 0; i < 3; i++) state().missionDispatch({ type: "NEXT" });
      simClock.fault = { scenario: "bearing-degradation", stage: "MAINTENANCE", playing: false, stageTimeS: 0 };
    });
    sync(0.58);
    expect(state().missionStage).toBe("POSTFLIGHT");
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("POST-FLIGHT HEALTH ASSESSMENT");
    const comparison = screen.getByTestId("postflight-comparison");
    expect(comparison.textContent).toBe("PRE-FLIGHT●NOMINAL→POST-FLIGHT◐DEGRADED");
    expect(panel.textContent).toContain("OUTCOME■MAINTENANCE REQUIRED");
  });
});

describe("digital twin", () => {
  it("compares observed, expected and predicted for motor 04", async () => {
    const user = userEvent.setup();
    act(() => {
      state().startFault("bearing-degradation");
      state().faultDispatch({ type: "GOTO", stage: "DIAGNOSED" });
    });
    sync();
    act(() => state().setMode("twin"));
    sync();
    render(
      <>
        <TwinSystems />
        <TwinPanel />
        <TwinControls />
      </>,
    );
    for (const name of ["OBSERVED", "ESTIMATED", "EXPECTED", "PREDICTED"]) expect(within(screen.getByTestId("twin-systems")).getByText(name)).toBeInTheDocument();
    const panel = screen.getByTestId("twin-panel");
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("MOTOR 04");
    expect(panel.textContent).toMatch(/OBSERVED1\.4\dsimulated units/);
    expect(panel.textContent).toMatch(/Expected range0\.7\d–0\.90simulated units/);
    expect(panel.textContent).toContain("ResidualABOVE BASELINE");
    expect(panel.textContent).toContain("State◐DEGRADED");
    expect(panel.textContent).toContain("TrendINCREASING");
    expect(panel.textContent).toContain("ProjectionMAINTENANCE ACTION RECOMMENDED");

    const slider = screen.getByRole("slider", { name: /Twin time/ });
    expect(slider).toHaveAttribute("min", "-100");
    expect(slider).toHaveAttribute("max", "100");
    act(() => state().setPredictionTime(60));
    expect(screen.getByTestId("twin-time")).toHaveTextContent("+60 cycles");
    expect(panel.textContent).toMatch(/PREDICTED\d+\.\d\dsimulated units \(\d+\.\d\d–\d+\.\d\d\)/);
    act(() => state().setPredictionTime(-100));
    expect(panel.textContent).toContain("RECORDED");
    expect(panel.textContent).toContain("State●NOMINAL");

    await user.click(screen.getByRole("button", { name: "RETURN TO NOW" }));
    expect(state().predictionTime).toBe(0);
    await user.click(within(screen.getByTestId("twin-systems")).getByRole("button", { name: /THERMAL/ }));
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("COOLING LOOP");
  });
});

describe("architecture", () => {
  const view = () =>
    render(
      <>
        <ArchitectureChain />
        <ArchitecturePanel />
        <ArchitectureControls />
      </>,
    );

  beforeEach(() => {
    act(() => {
      state().start();
      state().setMode("architecture");
    });
    sync();
  });

  it("shows the data architecture and the network filters", async () => {
    const user = userEvent.setup();
    view();
    expect(within(screen.getByRole("list", { name: /Data architecture/ })).getAllByRole("listitem")).toHaveLength(8);
    expect(within(screen.getByRole("group", { name: "Network filter" })).getAllByRole("button").map((b) => b.textContent)).toEqual(["ALL", "FLIGHT CRITICAL", "HEALTH", "MAINTENANCE", "GROUND"]);
    await user.click(screen.getByRole("button", { name: "HEALTH" }));
    expect(state().networkFilter).toBe("health");
    expect(screen.getByTestId("network-panel")).toHaveTextContent("HUMS data routes");
  });

  it("contains the loss of FCC-B", async () => {
    const user = userEvent.setup();
    view();
    await user.click(screen.getByRole("button", { name: "REDUNDANCY" }));
    const panel = screen.getByTestId("redundancy-panel");
    expect(panel.textContent).toContain("REFERENCE ARCHITECTURE");
    await user.click(within(panel).getByRole("button", { name: "SIMULATE CHANNEL FAILURE" }));
    sync();
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("FAULT CONTAINED");
    expect(panel.textContent).toContain("FCC-B✕UNAVAILABLE");
    expect(panel.textContent).toContain("FCC-A●AVAILABLE");
    expect(panel.textContent).toContain("VotingAVAILABLE");
    expect(panel.textContent).toContain("Flight controlAVAILABLE");
    expect(panel.textContent).toContain("Vehicle▲MISSION CAPABLE WITH LIMITATION");
  });

  it("keeps a position solution without GNSS", async () => {
    const user = userEvent.setup();
    view();
    await user.click(screen.getByRole("button", { name: "NAVIGATION" }));
    const panel = screen.getByTestId("navigation-panel");
    await user.click(within(panel).getByRole("button", { name: "GNSS UNAVAILABLE" }));
    sync();
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("GNSS UNAVAILABLE");
    expect(panel.textContent).toContain("Navigation◐DEGRADED");
    expect(panel.textContent).toContain("Position solutionAVAILABLE");
    expect(panel.textContent).toContain("GNSS✕UNAVAILABLE");
    expect(panel.textContent).toContain("IMU-A●AVAILABLE");
  });
});
