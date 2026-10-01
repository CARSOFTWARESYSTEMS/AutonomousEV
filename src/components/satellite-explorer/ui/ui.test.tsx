import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MISSION_PLAN, stagePlan } from "../simulation/mission";
import { INITIAL_TELEMETRY, resetExplorerStore, useExplorerStore } from "../state/explorerStore";
import { simClock } from "../state/simClock";
import BuildMode from "../modes/BuildMode";
import ExploreMode from "../modes/ExploreMode";
import { SignalPanel } from "../modes/SignalMode";
import SystemsMode, { SystemPanel } from "../modes/SystemsMode";
import ComponentIndex from "./ComponentIndex";
import ComponentPanel from "./ComponentPanel";
import ExplorerHeader from "./ExplorerHeader";
import HelpPanel from "./HelpPanel";
import HeroOverlay from "./HeroOverlay";
import LearnEngineerToggle from "./LearnEngineerToggle";
import LoadingScreen from "./LoadingScreen";
import MissionConsole from "./MissionConsole";
import MissionTimeline from "./MissionTimeline";
import ModeToolbar from "./ModeToolbar";
import StatusCaption from "./StatusCaption";
import TourController from "./TourController";
import { formatAmps, formatGeo, formatLive, formatRpm } from "./liveValues";

vi.mock("next/navigation", () => ({ usePathname: () => "/space/satellite-engineering/interactive-3d" }));

const state = () => useExplorerStore.getState();
const setTelemetry = (patch: Partial<typeof INITIAL_TELEMETRY>) => state().setTelemetry({ ...state().telemetry, ...patch });

beforeEach(() => {
  resetExplorerStore();
  state().start();
});

describe("live value formatting", () => {
  it("signs wheel speeds and currents and rounds for display", () => {
    expect(formatRpm(2432)).toBe("+2,430 rpm");
    expect(formatRpm(-904)).toBe("−900 rpm");
    expect(formatRpm(3)).toBe("0 rpm");
    expect(formatAmps(-1.83)).toBe("−1.8 A");
    expect(formatAmps(0.78)).toBe("+0.8 A");
    expect(formatAmps(0.01)).toBe("0.0 A");
  });

  it("formats the simulated quantities the panels bind to", () => {
    const t = { ...INITIAL_TELEMETRY, batterySoc: 78.4, busVoltage: 8.09, generationW: 18.44, loadW: 12.1, sunlit: false, storageMb: 318, downlinkProgress: 0.42 };
    expect(formatLive("batterySoc", t)).toBe("78%");
    expect(formatLive("busVoltage", t)).toBe("8.1 V");
    expect(formatLive("generation", t)).toBe("18.4 W");
    expect(formatLive("generationPerWing", t)).toBe("9.2 W");
    expect(formatLive("load", t)).toBe("12.1 W");
    expect(formatLive("sunlight", t)).toBe("Eclipse");
    expect(formatLive("storage", t)).toBe("318 MB");
    expect(formatLive("downlink", t)).toBe("42%");
    expect(formatLive("batteryState", t)).toBe("Charging");
    expect(formatLive("linkState", t)).toBe("No link");
    expect(formatGeo(12.97, 77.59)).toBe("13.0°N 77.6°E");
    expect(formatGeo(-33.1, -70.2)).toBe("33.1°S 70.2°W");
  });
});

describe("Learn / Engineer", () => {
  it("toggles the detail level with pressed-state buttons", async () => {
    const user = userEvent.setup();
    render(<LearnEngineerToggle />);
    const learn = screen.getByRole("button", { name: "LEARN" });
    const engineer = screen.getByRole("button", { name: "ENGINEER" });
    expect(learn).toHaveAttribute("aria-pressed", "true");
    expect(engineer).toHaveAttribute("aria-pressed", "false");
    await user.click(engineer);
    expect(state().learnMode).toBe("engineer");
    expect(engineer).toHaveAttribute("aria-pressed", "true");
  });

  it("Learn shows one sentence and a couple of simulated values", () => {
    state().selectComponent("battery");
    setTelemetry({ batterySoc: 78, busVoltage: 8.1 });
    render(<ComponentPanel />);
    const panel = screen.getByTestId("component-panel");
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("BATTERY");
    expect(within(panel).getByText("Stores electrical energy for eclipse and peak loads.")).toBeInTheDocument();
    expect(within(panel).getByText("Status").nextElementSibling).toHaveTextContent("78%");
    expect(within(panel).getByText("Supply").nextElementSibling).toHaveTextContent("8.1 V");
    expect(within(panel).queryByText("Interfaces")).toBeNull();
    expect(within(panel).queryByText(/40 Wh/)).toBeNull();
    expect(within(panel).getByRole("button", { name: "SEE POWER FLOW" })).toBeInTheDocument();
  });

  it("Engineer shows the role, reference figures and interfaces for the same component", () => {
    state().selectComponent("battery");
    state().setLearnMode("engineer");
    setTelemetry({ batterySoc: 78, busVoltage: 8.1, batteryCurrentA: -1.8 });
    render(<ComponentPanel />);
    const panel = screen.getByTestId("component-panel");
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("BATTERY PACK");
    expect(within(panel).getByText("Eclipse operation and transient load support")).toBeInTheDocument();
    expect(within(panel).getByText("Energy").nextElementSibling).toHaveTextContent("40 Wh reference");
    expect(within(panel).getByText("Current").nextElementSibling).toHaveTextContent("−1.8 A");
    expect(within(panel).getByText("Interfaces").nextElementSibling).toHaveTextContent("PCDU / Power bus");
  });

  it("marks simulated values as simulated and labels the panel's provenance", () => {
    state().selectComponent("battery");
    state().setLearnMode("engineer");
    render(<ComponentPanel />);
    const panel = screen.getByTestId("component-panel");
    // State of charge, bus voltage and current are simulated; energy and temperature rows are not live.
    expect(within(panel).getAllByText("SIM")).toHaveLength(3);
    expect(within(panel).getByText("REFERENCE & SIMULATED VALUES")).toBeInTheDocument();
    expect(within(panel).getByText(/18.4 °C simulated/)).toBeInTheDocument();
  });

  it("renders nothing when no component is selected", () => {
    const { container } = render(<ComponentPanel />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("component panel actions", () => {
  it("ISOLATE, ANIMATE, SHOW FLOW and BACK drive the store", async () => {
    const user = userEvent.setup();
    state().selectComponent("reaction-wheel-y");
    render(<ComponentPanel />);
    const isolate = screen.getByRole("button", { name: "ISOLATE" });
    await user.click(isolate);
    expect(state().isolatedComponent).toBe("reaction-wheel-y");
    expect(isolate).toHaveAttribute("aria-pressed", "true");
    await user.click(isolate);
    expect(state().isolatedComponent).toBeNull();

    await user.click(screen.getByRole("button", { name: "ANIMATE" }));
    expect(state().componentAnimation?.id).toBe("reaction-wheel-y");

    await user.click(screen.getByRole("button", { name: "BACK" }));
    expect(state().selectedComponent).toBeNull();
  });

  it("SHOW FLOW opens the matching system", async () => {
    const user = userEvent.setup();
    state().selectComponent("reaction-wheel-y");
    render(<ComponentPanel />);
    await user.click(screen.getByRole("button", { name: "SHOW FLOW" }));
    expect(state()).toMatchObject({ mode: "systems", subsystem: "adcs" });
  });

  it("offers no flow for structure, which has none", () => {
    state().selectComponent("primary-frame");
    render(<ComponentPanel />);
    expect(screen.queryByRole("button", { name: /FLOW/ })).toBeNull();
  });
});

describe("mode toolbar", () => {
  it("lists the six modes and RESET, with the active one marked", async () => {
    const user = userEvent.setup();
    render(<ModeToolbar />);
    const nav = screen.getByRole("navigation", { name: "Explorer modes" });
    expect(within(nav).getAllByRole("button").map((b) => b.textContent)).toEqual(["BUILD", "EXPLORE", "SYSTEMS", "MISSION", "ORBIT", "SIGNALS", "RESET"]);
    expect(within(nav).getByRole("button", { name: "EXPLORE" })).toHaveAttribute("aria-current", "page");

    await user.click(within(nav).getByRole("button", { name: "BUILD" }));
    expect(state().mode).toBe("build");
    expect(within(nav).getByRole("button", { name: "BUILD" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("button", { name: "EXPLORE" })).not.toHaveAttribute("aria-current");
  });

  it("carries the analytics events for Build and Signals", () => {
    render(<ModeToolbar />);
    expect(screen.getByRole("button", { name: "BUILD" })).toHaveAttribute("data-track-event", "build_mode_open");
    expect(screen.getByRole("button", { name: "SIGNALS" })).toHaveAttribute("data-track-event", "signal_view_open");
  });

  it("RESET returns to the Explore defaults", async () => {
    const user = userEvent.setup();
    state().setMode("orbit");
    state().toggleXray();
    render(<ModeToolbar />);
    await user.click(screen.getByRole("button", { name: "RESET" }));
    expect(state()).toMatchObject({ mode: "explore", xrayEnabled: false });
  });
});

describe("build controls", () => {
  it("shows the eight steps and moves through them with NEXT and BACK", async () => {
    const user = userEvent.setup();
    state().setMode("build");
    render(<BuildMode />);
    const steps = within(screen.getByRole("list", { name: "Assembly steps" })).getAllByRole("button");
    expect(steps.map((s) => s.textContent)).toEqual(["01STRUCTURE", "02POWER", "03AVIONICS", "04ADCS", "05COMMUNICATIONS", "06PAYLOAD", "07THERMAL", "08READY"]);
    expect(steps[0]).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: "BACK" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "NEXT" }));
    expect(state().buildStep).toBe(2);
    expect(steps[1]).toHaveAttribute("aria-current", "step");
    expect(steps[0]).toHaveAttribute("data-state", "done");

    await user.click(steps[5]);
    expect(state().buildStep).toBe(6);
    await user.click(screen.getByRole("button", { name: "BACK" }));
    expect(state().buildStep).toBe(5);

    await user.click(screen.getByRole("button", { name: "AUTO BUILD" }));
    expect(state().buildAuto).toBe(true);
    await user.click(screen.getByRole("button", { name: "RESET" }));
    expect(state()).toMatchObject({ buildStep: 1, buildAuto: false });
  });

  it("captions the current step and offers RUN MISSION once assembled", async () => {
    const user = userEvent.setup();
    state().setMode("build");
    const { rerender } = render(<StatusCaption />);
    expect(screen.getByText("Provides mechanical support and launch-load path.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /RUN MISSION/ })).toBeNull();

    state().setBuildStep(8);
    rerender(<StatusCaption />);
    expect(screen.getByText("SPACECRAFT ASSEMBLED")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /RUN MISSION/ }));
    expect(state()).toMatchObject({ mode: "mission", missionStage: "BOOT", missionPlaying: true });
  });
});

describe("explore controls", () => {
  it("offers EXPLODE, a 0–100 scrubber and X-RAY", async () => {
    const user = userEvent.setup();
    render(<ExploreMode />);
    const slider = screen.getByRole("slider", { name: /EXPLODED/ });
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "100");
    expect(slider).toHaveValue("0");

    const explode = screen.getByRole("button", { name: "EXPLODE" });
    expect(explode).toHaveAttribute("data-track-event", "exploded_view_open");
    await user.click(explode);
    expect(state().explodedAmount).toBe(1);
    expect(slider).toHaveValue("100");
    expect(screen.getByRole("button", { name: "ASSEMBLE" })).toHaveAttribute("aria-pressed", "true");

    const xray = screen.getByRole("button", { name: "X-RAY" });
    await user.click(xray);
    expect(state().xrayEnabled).toBe(true);
    expect(xray).toHaveAttribute("aria-pressed", "true");
  });
});

describe("systems", () => {
  it("has the seven sub-tabs of the brief, selectable by click and arrow keys", async () => {
    const user = userEvent.setup();
    state().setMode("systems");
    render(<SystemsMode />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["POWER", "ADCS", "PAYLOAD", "COMMS", "THERMAL", "AVIONICS", "STRUCTURE"]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("data-track-event", "system_power_open");
    expect(tabs[1]).toHaveAttribute("data-track-event", "system_adcs_open");

    await user.click(tabs[2]);
    expect(state().subsystem).toBe("payload");
    tabs[2].focus();
    await user.keyboard("{ArrowRight}");
    expect(state().subsystem).toBe("communications");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(state().subsystem).toBe("adcs");
  });

  it("Power shows generation, load, battery and state, the scenarios and the CubeTwin cross-link", async () => {
    const user = userEvent.setup();
    state().setSubsystem("power");
    setTelemetry({ generationW: 18.4, loadW: 12.1, batterySoc: 78, batteryState: "CHARGING", sunlit: true });
    render(<SystemPanel />);
    const panel = screen.getByTestId("system-panel");
    expect(within(panel).getByText("Generated").nextElementSibling).toHaveTextContent("18.4 W");
    expect(within(panel).getByText("Load").nextElementSibling).toHaveTextContent("12.1 W");
    expect(within(panel).getByText("Battery", { selector: "dt" }).nextElementSibling).toHaveTextContent("78%");
    expect(within(panel).getByText("State", { selector: "dt" }).nextElementSibling).toHaveTextContent("Charging");
    expect(within(panel).getByText("SUNLIGHT", { selector: "p" })).toBeInTheDocument();

    const link = within(panel).getByRole("link", { name: /RUN ENERGY SIMULATION IN CUBETWIN/ });
    expect(link).toHaveAttribute("href", "/space/cubesat");
    expect(link).toHaveAttribute("data-track-event", "cubesat_crosslink");

    await user.click(within(panel).getByRole("button", { name: "ECLIPSE" }));
    expect(state().powerScenario).toBe("eclipse");
    await user.click(within(panel).getByRole("button", { name: "POWER BUS" }));
    expect(state().xrayEnabled).toBe(true);
  });

  it("Power reports eclipse and discharge in words, not only in colour", () => {
    state().setSubsystem("power");
    setTelemetry({ generationW: 0, batteryState: "DISCHARGING", sunlit: false });
    render(<SystemPanel />);
    expect(screen.getByText("ECLIPSE", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("Battery supplies the loads")).toBeInTheDocument();
    expect(screen.getByText("State").nextElementSibling).toHaveTextContent("Discharging");
    expect(screen.getByText("Generated").nextElementSibling).toHaveTextContent("0.0 W");
  });

  it("ADCS offers a slew about each axis and the magnetorquer demonstration", async () => {
    const user = userEvent.setup();
    state().setSubsystem("adcs");
    render(<SystemPanel />);
    await user.click(screen.getByRole("button", { name: "Slew about body Y" }));
    expect(state().slewDemo?.axis).toBe("Y");
    await user.click(screen.getByRole("button", { name: "MAGNETORQUER" }));
    expect(state().showMagnetorquer).toBe(true);
    expect(screen.getByText(/τ = m × B/)).toBeInTheDocument();
  });

  it("Communications distinguishes TT&C from payload data", () => {
    state().setSubsystem("communications");
    render(<SystemPanel />);
    expect(screen.getByText("TT&C · S-band")).toBeInTheDocument();
    expect(screen.getByText("Telemetry · Tracking · Command")).toBeInTheDocument();
    expect(screen.getByText("PAYLOAD DATA · X-band")).toBeInTheDocument();
    expect(screen.getByText("Imagery / mission data")).toBeInTheDocument();
  });

  it("Thermal shows the COOL / NOMINAL / WARM legend and says it is not a simulation", () => {
    state().setSubsystem("thermal");
    render(<SystemPanel />);
    const legend = screen.getByRole("list", { name: "Thermal legend" });
    expect(within(legend).getAllByRole("listitem").map((li) => li.textContent?.trim())).toEqual(["COOL", "NOMINAL", "WARM"]);
    expect(screen.getByText(/not a thermal simulation, and no temperatures are implied/)).toBeInTheDocument();
  });

  it("Avionics names the bus as a reference data bus", () => {
    state().setSubsystem("avionics");
    render(<SystemPanel />);
    expect(screen.getByText("REFERENCE DATA BUS")).toBeInTheDocument();
    expect(screen.getByText(/No specific bus standard is implied/)).toBeInTheDocument();
  });
});

describe("mission timeline", () => {
  it("offers RUN MISSION before a mission has started", async () => {
    const user = userEvent.setup();
    state().setMode("mission");
    render(<MissionTimeline />);
    const run = screen.getByRole("button", { name: /RUN MISSION/ });
    expect(run).toHaveAttribute("data-track-event", "mission_run");
    await user.click(run);
    expect(state()).toMatchObject({ missionStage: "BOOT", missionPlaying: true });
  });

  it("shows the eleven stages, the compressed clock and the transport controls", async () => {
    const user = userEvent.setup();
    state().runMission();
    render(<MissionTimeline />);
    const stages = within(screen.getByRole("list", { name: "Mission stages" })).getAllByRole("button");
    expect(stages).toHaveLength(11);
    expect(stages.map((s) => s.textContent)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"]);
    expect(stages[0]).toHaveAttribute("aria-current", "step");
    expect(screen.getByTestId("mission-stage")).toHaveTextContent("01BOOT");
    expect(screen.getByLabelText(/Mission clock 00:00 of 12:00/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next stage" }));
    expect(state().missionStage).toBe("POWER");
    expect(screen.getByTestId("mission-stage")).toHaveTextContent("02POWER");

    await user.click(screen.getByRole("button", { name: "Previous stage" }));
    expect(state().missionStage).toBe("BOOT");

    await user.click(screen.getByRole("button", { name: "Pause mission" }));
    expect(state().missionPlaying).toBe(false);
    await user.click(screen.getByRole("button", { name: "Play mission" }));
    expect(state().missionPlaying).toBe(true);

    await user.click(stages[7]);
    expect(state().missionStage).toBe("UPLINK");
    expect(simClock.mission.timeS).toBe(stagePlan("UPLINK").startS);

    await user.click(screen.getByRole("button", { name: "Restart mission" }));
    expect(state()).toMatchObject({ missionStage: "BOOT", missionPlaying: true });
    expect(simClock.mission.timeS).toBe(0);
  });

  it("exposes the scrubber with a text value for assistive technology", () => {
    state().runMission();
    state().dispatchMission({ type: "SEEK", timeS: stagePlan("CAPTURE").startS + 10 });
    setTelemetry({ missionTimeS: simClock.mission.timeS });
    render(<MissionTimeline />);
    const scrubber = screen.getByRole("slider", { name: "Mission time" });
    expect(scrubber).toHaveAttribute("max", "720");
    expect(scrubber).toHaveAttribute("aria-valuetext", `04:15, stage 5 of ${MISSION_PLAN.length}, EARTH OBSERVATION`);
  });
});

describe("mission console", () => {
  it("is absent until the ground segment is involved", () => {
    state().runMission();
    const { container } = render(<MissionConsole />);
    expect(container).toBeEmptyDOMElement();
  });

  it("names the station as illustrative and shows the link state in words", () => {
    state().runMission();
    state().dispatchMission({ type: "SEEK", timeS: stagePlan("GROUND_PASS").startS });
    setTelemetry({ link: "AOS" });
    render(<MissionConsole />);
    expect(screen.getByText("ILLUSTRATIVE GROUND STATION — BENGALURU")).toBeInTheDocument();
    expect(screen.getByText("AOS")).toBeInTheDocument();
    expect(screen.getByText("Acquisition of Signal")).toBeInTheDocument();
  });

  it("shows the telemetry frame from the brief once telemetry has arrived", () => {
    state().runMission();
    state().dispatchMission({ type: "SEEK", timeS: stagePlan("TELEMETRY").startS + 50 });
    setTelemetry({ link: "LINK_ACTIVE", telemetryProgress: 1, commandPhase: "VERIFIED", batterySoc: 78, spacecraftMode: "NOMINAL", attitudeLocked: true });
    render(<MissionConsole />);
    expect(screen.getByText("SPACECRAFT NOMINAL")).toBeInTheDocument();
    const value = (label: string) => screen.getByText(label).nextElementSibling;
    expect(value("POWER")).toHaveTextContent("78%");
    expect(value("MODE")).toHaveTextContent("NOMINAL");
    expect(value("ATTITUDE")).toHaveTextContent("LOCKED");
    expect(value("THERMAL")).toHaveTextContent("NOMINAL");
    expect(value("COMMS")).toHaveTextContent("CONNECTED");
    expect(screen.getByText("SIMULATED TELEMETRY")).toBeInTheDocument();
  });

  it("reports downlink progress and the received image", () => {
    state().runMission();
    state().dispatchMission({ type: "SEEK", timeS: stagePlan("PAYLOAD_DOWNLINK").startS + 40 });
    setTelemetry({ link: "LINK_ACTIVE", telemetryProgress: 1, commandPhase: "VERIFIED", downlinkProgress: 0.42 });
    const { rerender } = render(<MissionConsole />);
    expect(screen.getByRole("progressbar", { name: "Payload downlink" })).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText("RECEIVING…")).toBeInTheDocument();

    setTelemetry({ downlinkProgress: 1 });
    rerender(<MissionConsole />);
    expect(screen.getByText("PAYLOAD DATA RECEIVED")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Reconstructed image of the observation target" })).toBeInTheDocument();
  });
});

describe("signals", () => {
  it("lays out each route hop by hop with its direction in words", () => {
    state().setMode("signals");
    const { rerender } = render(<SignalPanel />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("COMMAND");
    expect(screen.getByText("Ground → Satellite")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((li) => li.textContent?.replace(/^\d+/, ""))).toEqual([
      "Mission control",
      "Ground station",
      "RF uplink",
      "Antenna",
      "Transceiver",
      "OBC",
      "Flight software",
      "Target subsystem",
    ]);
    expect(screen.getByLabelText("Example command: POINT PAYLOAD TO TARGET")).toBeInTheDocument();

    state().setSignalView("payload-data");
    rerender(<SignalPanel />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("PAYLOAD DATA");
    expect(screen.getByText("X-band · Payload data")).toBeInTheDocument();
    expect(screen.getByText("Satellite → Ground")).toBeInTheDocument();
  });
});

describe("header, help, hero and index", () => {
  it("the header carries the page's only H1 and the way back", () => {
    render(<ExplorerHeader />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("SATELLITE EXPLORER 3D");
    expect(screen.getByRole("link", { name: "Back to Satellite Engineering" })).toHaveAttribute("href", "/space/satellite-engineering");
  });

  it("help lists the controls from the brief and closes with its button", async () => {
    const user = userEvent.setup();
    state().setHelpOpen(true);
    render(<HelpPanel />);
    const help = screen.getByRole("dialog", { name: "Controls" });
    for (const [action, input] of [
      ["ROTATE", "Drag"],
      ["ZOOM", "Scroll"],
      ["SELECT", "Click"],
      ["FOCUS", "Double Click"],
      ["BACK", "Esc"],
    ]) {
      expect(within(help).getByText(action).nextElementSibling).toHaveTextContent(input);
    }
    await user.click(within(help).getByRole("button", { name: "Close help" }));
    expect(state().helpOpen).toBe(false);
  });

  it("the hero offers both entry points with their analytics events and gets out of the way once started", async () => {
    resetExplorerStore();
    const user = userEvent.setup();
    const { container } = render(<HeroOverlay />);
    expect(screen.getByText("Build · Explore · Operate a Satellite")).toBeInTheDocument();
    expect(screen.getByText("6U Earth Observation Reference Mission")).toBeInTheDocument();
    expect(screen.getByText("Interactive engineering learning experience")).toBeInTheDocument();
    const start = screen.getByRole("button", { name: /START EXPLORATION/ });
    expect(start).toHaveAttribute("data-track-event", "satellite_3d_launch");
    expect(screen.getByRole("button", { name: /GUIDED TOUR/ })).toHaveAttribute("data-track-event", "guided_tour_start");
    // The large title is presentational; the H1 lives in the header.
    expect(container.querySelector("h1")).toBeNull();

    await user.click(start);
    expect(state()).toMatchObject({ started: true, mode: "explore" });
    expect(container.firstElementChild).toHaveAttribute("data-hidden", "true");
    expect(container.firstElementChild).toHaveAttribute("inert");
  });

  it("GUIDED TOUR starts the tour, which is a caption with controls and not a modal", async () => {
    resetExplorerStore();
    const user = userEvent.setup();
    render(
      <>
        <HeroOverlay />
        <TourController />
      </>,
    );
    await user.click(screen.getByRole("button", { name: /GUIDED TOUR/ }));
    const tour = screen.getByTestId("tour");
    expect(tour).not.toHaveAttribute("role", "dialog");
    expect(within(tour).getByText("Meet the satellite")).toBeInTheDocument();
    expect(within(tour).getByText(/1 \/ 9/)).toBeInTheDocument();
    await user.click(within(tour).getByRole("button", { name: /NEXT/ }));
    expect(within(tour).getByText("Open the spacecraft")).toBeInTheDocument();
    await user.click(within(tour).getByRole("button", { name: /BACK/ }));
    expect(within(tour).getByText("Meet the satellite")).toBeInTheDocument();
    await user.click(within(tour).getByRole("button", { name: /EXIT TOUR/ }));
    expect(screen.queryByTestId("tour")).toBeNull();
  });

  it("the component list selects any part from the keyboard", async () => {
    const user = userEvent.setup();
    state().setMode("orbit");
    state().setIndexOpen(true);
    render(<ComponentIndex />);
    const index = screen.getByRole("dialog", { name: "Spacecraft components" });
    expect(within(index).getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["POWER", "ADCS", "PAYLOAD", "COMMS", "THERMAL", "AVIONICS", "STRUCTURE"]);
    await user.click(within(index).getByRole("button", { name: "Battery Pack" }));
    // Orbit is not a part-level view, so the part is shown in Explore.
    expect(state()).toMatchObject({ mode: "explore", selectedComponent: "battery", indexOpen: false });
  });

  it("the loading screen reports progress as a progress bar, not a spinner", () => {
    const { rerender } = render(<LoadingScreen />);
    expect(screen.getByText("SATELLITE EXPLORER 3D")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Preparing spacecraft…");
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
    rerender(<LoadingScreen progress={0.5} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  });
});
