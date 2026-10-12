// Regression tests for the defects found by the engineering audit of this page
// (docs/advanced-propulsion-twin-audit.md). Each test is named for the
// behaviour that was wrong, and fails on the code as it was before the fix.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import AdvancedTwinPage from "./AdvancedTwinPage";
import { resetAdvancedTwinTracking } from "./analytics";
import { PHYSICS_CONCEPTS } from "./data/physics";
import { QUALITY_CHECKS, TRANSFORMATION_STEPS } from "./data/pipeline";
import { PRESSURE_SENSORS, PRESSURE_UNIT_NOTE } from "./data/pressure";
import { FAQ } from "./data/faq";
import { CONTACT, PREPARED_BY, PRODUCT, CREDIBILITY_NOTICE, VALUE_NOTE } from "./data/product";
import { IMPLEMENTATION_STATUS, NOT_IMPLEMENTED } from "./data/status";
import { ESTIMATORS, MATURITY_HERE } from "./data/twin";
import { AI_BOUNDARY } from "./data/aiml";
import { PROGNOSTICS_LIMIT, READINESS_CAVEAT } from "./data/course";
import { SUBSYSTEMS } from "./data/system";
import EstimatorLab from "./live/EstimatorLab";
import { Diagnosis, FaultPicker, SCORE_NOTE, TwinPending } from "./live/shared";
import type { TwinSnapshot } from "./simulation/twinTypes";
import { resetLabStore, useLabStore } from "./state/labStore";
import Boundary from "./ui/Boundary";
import PropulsionSchematic, { COMPACT_BELOW, COMPACT_MAX, SCHEMATIC_ALT, SCHEMATIC_LAYOUTS, SHAFT_NOTE } from "./ui/PropulsionSchematic";
import { TraceChart } from "./ui/charts";
import { InjectFault } from "./widgets/actions";

const trackEvent = vi.fn();
vi.mock("@/utils/analytics", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));

// The simulation is a separate download. Here it can be made to fail, as it does when the connection drops.
const download = vi.hoisted(() => ({ fails: false }));
vi.mock("./simulation/twinEngine", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./simulation/twinEngine")>();
  return {
    ...actual,
    createTwinEngine: (seed?: number) => {
      if (download.fails) throw new Error("Failed to load chunk /_next/static/chunks/0yf~2fgamus9w.js from module 670");
      return actual.createTwinEngine(seed);
    },
  };
});

vi.setConfig({ testTimeout: 30000 });

const tab = (name: string) => within(screen.getByRole("tablist", { name: "Tutorial modules" })).getByRole("tab", { name });
const open = (name: string) => fireEvent.click(tab(name));
const boot = () =>
  act(async () => {
    await useLabStore.getState().boot();
  });
const run = (seconds: number) =>
  act(() => {
    for (let i = 0; i < seconds * 2; i++) useLabStore.getState().step();
  });
const frame = () =>
  act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  });

beforeEach(() => {
  download.fails = false;
  resetLabStore();
  resetAdvancedTwinTracking();
  trackEvent.mockReset();
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.scrollTo = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("a part of the page that cannot be loaded", () => {
  it("fails where it is, says so without build details, and leaves what surrounds it", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const Broken = (): never => {
      throw new Error("Failed to load chunk /_next/static/chunks/0yf~2fgamus9w.js from module 670");
    };
    render(
      <div>
        <p>Text beside the instrument</p>
        <Boundary what="This live instrument" fallback={<p>What the instrument shows, in words.</p>}>
          <Broken />
        </Boundary>
      </div>,
    );
    expect(screen.getByText("Text beside the instrument")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("This live instrument could not be loaded. The rest of the tutorial is unaffected.");
    expect(screen.getByText("What the instrument shows, in words.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload the page" })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/chunk|\.js|module 670/);
  });

  it("reports a simulation that could not be fetched, and starts it when asked again", async () => {
    download.fails = true;
    render(<TwinPending>Calibrating the twin…</TwinPending>);
    expect(screen.getByRole("status")).toHaveTextContent("Calibrating the twin…");
    await boot();
    expect(useLabStore.getState()).toMatchObject({ engine: null, booting: false, bootFailed: true });
    expect(screen.getByRole("alert")).toHaveTextContent("The simulation could not be loaded.");
    expect(document.body.textContent).not.toMatch(/chunk|\.js/);
    download.fails = false;
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));
      await Promise.resolve();
    });
    await boot();
    expect(useLabStore.getState().bootFailed).toBe(false);
    expect(useLabStore.getState().engine).not.toBeNull();
  });
});

describe("running a fault from the page", () => {
  it("replaces the active fault instead of adding to it, and restarts from the healthy baseline", async () => {
    await boot();
    act(() => useLabStore.getState().inject("valve_restriction"));
    run(12);
    expect(useLabStore.getState().snapshot?.ranking[0].id).toBe("valve_restriction");
    act(() => useLabStore.getState().inject("pc_sensor_drift"));
    const after = useLabStore.getState().snapshot!;
    expect(after.faults.map((f) => f.id)).toEqual(["pc_sensor_drift"]);
    expect(after.t).toBe(0);
    expect(after.anomaly).toBe(false);
    expect(after.ranking[0].id).toBe("nominal");
    expect(after.detectors.every((d) => d.latency === null)).toBe(true);
    run(14);
    expect(useLabStore.getState().snapshot?.ranking[0].id).toBe("pc_sensor_drift");
    // Each scenario is reported as injected once and detected once: the second detection was missing before.
    const names = trackEvent.mock.calls.map(([name, params]) => `${name}:${(params as { fault?: string }).fault}`);
    expect(names.filter((n) => n.startsWith("fault_injected"))).toEqual(["fault_injected:valve_restriction", "fault_injected:pc_sensor_drift"]);
    expect(names.filter((n) => n.startsWith("fault_detected"))).toEqual(["fault_detected:valve_restriction", "fault_detected:pc_sensor_drift"]);
  });

  it("offers gradual or abrupt onset for a fault that can grow, and neither choice for one that cannot", async () => {
    await boot();
    render(<FaultPicker />);
    const onset = screen.getByRole("group", { name: "Onset" });
    expect(within(onset).getByRole("button", { name: /^Gradual · 24 s/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(within(onset).getByRole("button", { name: "Abrupt" }));
    fireEvent.change(screen.getByLabelText(/^Severity/), { target: { value: "100" } });
    act(() => fireEvent.click(screen.getByRole("button", { name: "Inject fault" })));
    const active = screen.getByRole("list", { name: "Active faults" });
    expect(within(active).getAllByRole("listitem")).toHaveLength(1);
    expect(active).toHaveTextContent("Oxidiser pump degradation · abrupt onset · severity 100 % of 100 %");
    run(1);
    expect(useLabStore.getState().snapshot?.detectors.find((d) => d.id === "rate")?.latency).not.toBeNull();

    fireEvent.change(screen.getByLabelText("Fault to inject"), { target: { value: "packet_delay" } });
    expect(within(onset).getByRole("button", { name: "Gradual" })).toBeDisabled();
    expect(within(onset).getByRole("button", { name: "Abrupt" })).toHaveAttribute("aria-pressed", "true");
    act(() => fireEvent.click(screen.getByRole("button", { name: "Inject fault" })));
    expect(within(screen.getByRole("list", { name: "Active faults" })).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("list", { name: "Active faults" })).toHaveTextContent("Telemetry packet delay");
    expect(screen.getByText(/One fault at a time: injecting replaces the active fault/)).toBeInTheDocument();
  });

  it("names an inject button by the words on it, with what it injects after them", async () => {
    render(
      <>
        <InjectFault fault="cooling_restriction">A slow fault</InjectFault>
        <InjectFault fault="pump_degradation" lab />
      </>,
    );
    expect(screen.getByRole("button", { name: "A slow fault: cooling-channel restriction, into the simulation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inject in the Lab: oxidiser pump degradation, and open the Lab" })).toBeInTheDocument();
  });
});

describe("the diagnosis", () => {
  const snapshotAfter = async (fault: Parameters<ReturnType<typeof useLabStore.getState>["inject"]>[0], seconds: number): Promise<TwinSnapshot> => {
    await boot();
    act(() => useLabStore.getState().inject(fault));
    run(seconds);
    return useLabStore.getState().snapshot!;
  };

  it("announces the conclusion only: the percentage beside it is not in the live region", async () => {
    const snapshot = await snapshotAfter("cooling_restriction", 30);
    render(<Diagnosis snapshot={snapshot} />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Probable Cooling-channel restriction");
    expect(status.textContent).not.toMatch(/%|\d/);
  });

  it("says what its percentages are, and reports the consistency check behind a named cause", async () => {
    const snapshot = await snapshotAfter("cooling_restriction", 30);
    render(<Diagnosis snapshot={snapshot} />);
    expect(screen.getByText(SCORE_NOTE)).toBeInTheDocument();
    expect(SCORE_NOTE).toMatch(/SIMULATED.*not calibrated probabilities of a real engine/);
    expect(snapshot.recognition.status).toBe("explained");
    expect(screen.getByText(/Consistency check passed: cooling-channel restriction at about \d+ % severity accounts for the residuals/)).toBeInTheDocument();
  });

  it("does not present a look-alike as a diagnosis when no modelled fault explains the residuals", async () => {
    const snapshot = await snapshotAfter("cooling_restriction", 30);
    const unknown: TwinSnapshot = { ...snapshot, confidence: "LOW", recognition: { status: "unrecognised", score: 8.6, fault: "valve_restriction", severity: 0, channel: "pOutFu" } };
    render(<Diagnosis snapshot={unknown} />);
    expect(screen.getByRole("status")).toHaveTextContent("Unrecognised fault pattern");
    expect(screen.queryByText(/^Probable /)).not.toBeInTheDocument();
    expect(screen.getByText(/Confidence LOW · Nearest look-alike: Cooling-channel restriction/)).toBeInTheDocument();
    expect(screen.getByText(/The cause is outside the faults this twin has a model of\. The ranking below is the nearest look-alike, not a diagnosis\./)).toBeInTheDocument();
  });
});

describe("the propulsion schematic", () => {
  const widthOf = (px: number) => vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(px);

  it("draws two turbopumps fed by one preburner, as the 3D model does, and says where the model differs", () => {
    expect(SCHEMATIC_ALT).toMatch(/each feed their own turbopump: a pump and a turbine on one shaft\. A single preburner between them supplies hot gas to both turbines/);
    expect(SCHEMATIC_ALT).not.toMatch(/turns both on one shaft/);
    expect(SHAFT_NOTE).toMatch(/lumps both shafts into one shaft-speed state/);
    for (const layout of Object.values(SCHEMATIC_LAYOUTS)) {
      const machinery = layout.groups.find((g) => g.sub === "turbomachinery")!.parts;
      expect(machinery.filter((p) => p.t === "pump"), layout.id).toHaveLength(2);
      // Two turbine bodies, and a shaft drawn as two separate segments: no line joins the two pumps.
      expect(machinery.filter((p) => p.t === "poly"), layout.id).toHaveLength(2);
      expect(machinery.filter((p) => p.t === "shaft").map((p) => (p.t === "shaft" ? p.d.match(/M/g)?.length : 0)), layout.id).toEqual([2]);
      expect(layout.groups.find((g) => g.sub === "hot_gas")!.parts.filter((p) => p.t === "rect"), layout.id).toHaveLength(1);
    }
    render(<AdvancedTwinPage />);
    expect(screen.getAllByText(SHAFT_NOTE).length).toBeGreaterThanOrEqual(2);
  });

  it("marks the same fifteen sensors, by the same tags, in both arrangements", () => {
    for (const layout of Object.values(SCHEMATIC_LAYOUTS)) {
      expect(layout.sensors.map((s) => s.id).sort(), layout.id).toEqual(PRESSURE_SENSORS.map((s) => s.id).sort());
      for (const node of layout.sensors) expect(node.tag, `${layout.id}.${node.id}`).toBe(PRESSURE_SENSORS.find((s) => s.id === node.id)!.tag);
      for (const node of layout.sensors) expect(node.x > 0 && node.x < layout.width && node.y > 0 && node.y < layout.height, `${layout.id}.${node.id} is inside the drawing`).toBe(true);
    }
  });

  it("spaces the markers so that each has a 44 px touch target at the narrowest the arrangement is drawn", () => {
    // Landscape is used from 528 px; portrait down to a 320 px phone, whose column is 286 px.
    for (const [layout, narrowest] of [[SCHEMATIC_LAYOUTS.wide, COMPACT_BELOW], [SCHEMATIC_LAYOUTS.compact, 286]] as const) {
      const scale = narrowest / layout.width;
      for (const a of layout.sensors) {
        const nearest = Math.min(...layout.sensors.filter((b) => b !== a).map((b) => Math.hypot(a.x - b.x, a.y - b.y)));
        expect(nearest * scale, `${layout.id}.${a.id}`).toBeGreaterThanOrEqual(44);
      }
    }
  });

  it("has room for every label at the largest lettering it is drawn with: none runs off the drawing", () => {
    // Measured on the rendered page: these uppercase labels take 0.70 of the font size per character, spacing included.
    const PER_CHARACTER = 0.7;
    for (const layout of Object.values(SCHEMATIC_LAYOUTS)) {
      for (const group of layout.groups) {
        for (const part of group.parts) {
          if (part.t !== "label") continue;
          const width = PER_CHARACTER * layout.font[1] * part.text.length;
          const left = part.anchor === "end" ? part.x - width : part.anchor === "middle" ? part.x - width / 2 : part.x;
          expect(left, `${layout.id}: "${part.text}" starts inside`).toBeGreaterThanOrEqual(0);
          expect(left + width, `${layout.id}: "${part.text}" ends inside`).toBeLessThanOrEqual(layout.width);
        }
      }
      // And 11 px on screen at the narrowest the arrangement is drawn.
      const narrowest = layout.id === "wide" ? COMPACT_BELOW : 286;
      expect((layout.font[1] * narrowest) / layout.width, layout.id).toBeGreaterThanOrEqual(11);
    }
  });

  it("is in the server's HTML in both arrangements, and draws only the one that fits once it has been measured", () => {
    const html = renderToStaticMarkup(<PropulsionSchematic />);
    expect(html.match(/data-arrangement="wide"/g)).toHaveLength(1);
    expect(html.match(/data-arrangement="compact"/g)).toHaveLength(1);
    expect(html).not.toMatch(/data-chosen/);

    widthOf(700);
    const wide = render(<PropulsionSchematic />);
    expect(wide.container.querySelectorAll("[data-arrangement]")).toHaveLength(1);
    expect(wide.container.querySelector('[data-arrangement="wide"][data-chosen]')).not.toBeNull();
    wide.unmount();

    widthOf(300);
    const narrow = render(<PropulsionSchematic />);
    expect(narrow.container.querySelectorAll("[data-arrangement]")).toHaveLength(1);
    expect(narrow.container.querySelector('[data-arrangement="compact"][data-chosen]')).not.toBeNull();
  });

  it.each([[300, "compact"], [COMPACT_BELOW - 1, "compact"], [COMPACT_BELOW, "wide"], [640, "wide"], [1100, "wide"]] as const)("letters the drawing at 11 px or more on screen in a %s px box", (px, id) => {
    widthOf(px);
    const { container } = render(<PropulsionSchematic selected="pOutOx" alerts={["pcA"]} onSelectSensor={() => {}} />);
    const layout = SCHEMATIC_LAYOUTS[id];
    expect(container.querySelector(`[data-arrangement="${id}"]`)).not.toBeNull();
    const scale = Math.min(px, id === "compact" ? COMPACT_MAX : Infinity) / layout.width;
    const sizes = [...container.querySelectorAll("svg text")].map((t) => Number(t.getAttribute("font-size")) * scale);
    expect(sizes.length).toBeGreaterThanOrEqual(10);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(10.99);
  });

  it("is one picture where nothing can be chosen, and a group of buttons where sensors can", () => {
    widthOf(700);
    const picture = render(<PropulsionSchematic />);
    expect(picture.getByRole("img", { name: SCHEMATIC_ALT })).toBeInTheDocument();
    expect(picture.queryAllByRole("button")).toHaveLength(0);
    picture.unmount();

    const chosen: string[] = [];
    render(<PropulsionSchematic onSelectSensor={(id) => chosen.push(id)} selected="pOutOx" alerts={["pcA"]} />);
    // A picture cannot hold controls: with buttons in it, the drawing is a group.
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    const group = screen.getByRole("group", { name: /Pressure sensors on the propulsion schematic/ });
    expect(within(group).getAllByRole("button")).toHaveLength(15);
    expect(within(group).getByRole("button", { name: "PT-OX-03" })).toHaveAttribute("aria-pressed", "true");
    expect(within(group).getByRole("button", { name: "PT-CH-01A, outside expectation" })).toBeInTheDocument();
    fireEvent.click(within(group).getByRole("button", { name: "PT-FU-04" }));
    fireEvent.keyDown(within(group).getByRole("button", { name: "PT-HG-01" }), { key: "Enter" });
    expect(chosen).toEqual(["pCoolIn", "pPb"]);
    // The tag is written for the selected sensor and the one in alarm, and the selected one's signal path is drawn.
    expect([...group.querySelectorAll("[data-sensor] text")].map((t) => t.textContent).sort()).toEqual(["PT-CH-01A", "PT-OX-03"]);
    expect(group.querySelectorAll("[data-signal-path]")).toHaveLength(1);
    expect(group.querySelector('[data-signal-path="pOutOx"]')).not.toBeNull();
  });
});

describe("the pressure map", () => {
  it("brings a chosen sensor's detail to the reader, and Escape closes it and returns focus", async () => {
    render(<AdvancedTwinPage />);
    open("Pressure");
    const list = screen.getByRole("group", { name: "Pressure sensors" });
    const opener = within(list).getByRole("button", { name: /Chamber, sensor A/ });
    opener.focus();
    fireEvent.click(opener);
    await frame();
    const detail = screen.getByRole("complementary", { name: "Chamber pressure, sensor A: measurement detail" });
    expect(detail).toHaveFocus();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: "nearest", behavior: expect.any(String) });
    // The same choice is shown on the drawing: pressed, tagged, and joined to the controller.
    const pressure = document.getElementById("pressure")!;
    expect(pressure.querySelector('[data-sensor="pcA"]')).toHaveAttribute("aria-pressed", "true");
    expect(pressure.querySelector('[data-signal-path="pcA"]')).not.toBeNull();
    expect(within(pressure).getByText(/PT-CH-01A is selected\. The dashed line is its signal path/)).toBeInTheDocument();
    fireEvent.keyDown(detail, { key: "Escape" });
    await frame();
    expect(screen.queryByRole("complementary", { name: /measurement detail/ })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(pressure.querySelector("[data-signal-path]")).toBeNull();
  });

  it("is on every screen: the schematic is no longer withheld from a phone", () => {
    render(<AdvancedTwinPage />);
    open("Pressure");
    const pressure = document.getElementById("pressure")!;
    expect(pressure.querySelector("[data-desktop-only]")).toBeNull();
    expect(within(pressure).getByRole("group", { name: /Pressure sensors on the propulsion schematic/ })).toBeInTheDocument();
  });

  it("says that live values are estimates, and shows both residuals", async () => {
    render(<AdvancedTwinPage />);
    open("Pressure");
    await boot();
    run(2);
    const pressure = document.getElementById("pressure")!;
    expect(within(pressure).getByText(/Live values are the twin's estimated state, with sensor noise filtered out, not raw readings\./)).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("group", { name: "Pressure sensors" })).getByRole("button", { name: /Chamber, sensor A/ }));
    expect(screen.getByRole("complementary", { name: /measurement detail/ })).toHaveTextContent(/Estimated − expected [+−]?\d+\.\d+ % Pc,ref \([+−]?\d+\.\d σ\) · raw, observed − expected [+−]?\d+\.\d+/);
  });
});

describe("charts", () => {
  const lines = [
    { kind: "observed" as const, label: "Observed", values: [10, 11, Number.NaN, 13, 14, 15] },
    { kind: "expected" as const, label: "Expected", values: [10, 10, 10, 10, 10, 10] },
  ];

  it("draws at one unit per pixel, so axis lettering is its stated size at any width", () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(288);
    const { container } = render(<TraceChart title="Pump Discharge Pressure" unit="% Pc,ref" lines={lines} span={30} />);
    const svg = container.querySelector('svg[role="img"]')!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 288 168");
    expect(svg.getAttribute("width")).toBe("288");
    expect([...svg.querySelectorAll("text")].map((t) => t.textContent)).toEqual(expect.arrayContaining(["−30 s", "now"]));
    expect(screen.getByText("% Pc,ref · SIMULATED")).toBeInTheDocument();
    expect(screen.getByRole("list")).toHaveTextContent("Observed 15.00");
  });

  it("breaks a line at a missing sample instead of drawing it somewhere", () => {
    const { container } = render(<TraceChart title="T" unit="u" lines={lines} span={30} />);
    const d = container.querySelector('path[data-kind="observed"]')!.getAttribute("d")!;
    expect(d.match(/M/g)).toHaveLength(2);
    expect(d).not.toMatch(/NaN/);
  });

  it("reads out every line at the moment pointed at, or stepped to with the arrow keys", () => {
    render(<TraceChart title="Pump Discharge Pressure" unit="% Pc,ref" lines={lines} span={30} />);
    const plot = screen.getByRole("group", { name: /Pump Discharge Pressure: chart/ });
    expect(screen.getByText(/Point at the plot, or focus it and press ←\/→, to read values\./)).toBeInTheDocument();
    fireEvent.keyDown(plot, { key: "ArrowLeft" });
    expect(screen.getByText("6.0 s ago: Observed 14.00 · Expected 10.00")).toBeInTheDocument();
    fireEvent.keyDown(plot, { key: "Home" });
    expect(screen.getByText("30.0 s ago: Observed 10.00 · Expected 10.00")).toBeInTheDocument();
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    // A gap in the telemetry reads as a gap.
    expect(screen.getByText("18.0 s ago: Observed – · Expected 10.00")).toBeInTheDocument();
    fireEvent.keyDown(plot, { key: "Escape" });
    expect(screen.getByText(/Point at the plot/)).toBeInTheDocument();
    fireEvent(plot, new MouseEvent("pointermove", { bubbles: true, clientX: 5000 }));
    expect(screen.getByText("Now: Observed 15.00 · Expected 10.00")).toBeInTheDocument();
    fireEvent(plot, new MouseEvent("pointerout", { bubbles: true }));
  });
});

describe("estimators", () => {
  it("says by how little the EKF and the UKF differ, and why, instead of showing two identical rows unexplained", () => {
    render(<EstimatorLab />);
    const note = document.querySelector("[data-estimator-gap]")!;
    expect(note).toHaveTextContent(/differ by at most (\d\.\d+|\d(\.\d)?e-\d+) % Pc,ref\. They are computed differently/);
    fireEvent.click(within(screen.getByRole("group", { name: "Estimator" })).getByRole("button", { name: "Kalman Filter" }));
    expect(document.querySelector("[data-estimator-gap]")).toBeNull();
  });
});

describe("what the page says about its own model", () => {
  it("does not claim a turbine power balance the model does not solve", () => {
    const energy = PHYSICS_CONCEPTS.find((c) => c.id === "energy")!;
    expect(energy.twin).not.toMatch(/power balance gives the model its shaft speed/);
    expect(energy.twin).toMatch(/The turbine power balance is not\. This reduced-order model schedules shaft speed from the throttle command/);
  });

  it("defines the residual it judges, its sign, and the raw residual beside it", () => {
    expect(TRANSFORMATION_STEPS.find((s) => s.id === "residual")!.summary).toMatch(/judges the filtered residual, estimated − expected.*raw residual, observed − expected.*positive when the measurement is above the model/);
    expect(FAQ.map((f) => f.a).join(" ")).toMatch(/judges the filtered residual \(estimated − expected\) and also shows the raw one \(observed − expected\)/);
  });

  it("states that pressures are absolute and normalised", () => {
    expect(PRESSURE_UNIT_NOTE).toMatch(/absolute pressure, measured from vacuum and not from ambient.*percentage of the reference chamber pressure/);
    expect(PRESSURE_UNIT_NOTE).not.toMatch(/no absolute pressure is implied/);
  });

  it("says for every data-quality check whether this simulation runs it", () => {
    for (const check of QUALITY_CHECKS) expect(check.here, check.id).toMatch(/^(Implemented|Not implemented)/);
    expect(QUALITY_CHECKS.filter((c) => c.here.startsWith("Not implemented")).map((c) => c.id)).toEqual(["range", "rate"]);
    render(<AdvancedTwinPage />);
    open("Data");
    expect(within(screen.getByRole("region", { name: "Data-quality checks" })).getByRole("columnheader", { name: "In this simulation" })).toBeInTheDocument();
  });
});

describe("claims held to what the simulator runs", () => {
  const text = () => renderToStaticMarkup(<AdvancedTwinPage />).replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");

  it("says, beside each part it only describes, that the simulator does not implement it", () => {
    const page = text();
    for (const [part, statement] of Object.entries(IMPLEMENTATION_STATUS)) expect(page, part).toContain(statement);
    // The four parts that are concept only say so in the same words, and carry the CONCEPTUAL status on their heading.
    for (const part of ["mlops", "dataArchitecture", "digitalThread", "cybersecurity"] as const) expect(IMPLEMENTATION_STATUS[part].startsWith(NOT_IMPLEMENTED), part).toBe(true);
    expect(NOT_IMPLEMENTED).toBe("Concept described — not implemented in this educational simulator.");
    render(<AdvancedTwinPage />);
    open("Architecture");
    for (const title of ["Data architecture", "The digital thread", "Digital Twin Cybersecurity"]) expect(screen.getByRole("region", { name: title }).querySelector("h3")).toHaveTextContent("CONCEPTUAL");
  });

  it("does not let the live twin be credited with an estimator it does not run", () => {
    const by = Object.fromEntries(ESTIMATORS.map((e) => [e.id, e.twin]));
    expect(by.kalman).toMatch(/This is the estimator the live twin runs\./);
    for (const id of ["ekf", "ukf", "particle"]) expect(by[id], id).toMatch(/On this page: implemented in the demonstration only.*The live twin does not run it/);
    expect(IMPLEMENTATION_STATUS.estimation).toMatch(/one scalar Kalman filter per measured channel/);
  });

  it("does not credit the twin with a turbine model: the hot-gas pressures are residual channels and nothing more", () => {
    for (const id of ["pPb", "pTi", "pTo"] as const) {
      const use = PRESSURE_SENSORS.find((s) => s.id === id)!.twinUse;
      expect(use, id).toMatch(/^On this page: .*residual channel/);
      expect(use, id).not.toMatch(/turbine power estimate that is balanced|Boundary of the turbine model|^Input to the turbine pressure-ratio check/);
    }
    const hotGas = SUBSYSTEMS.find((s) => s.id === "hot_gas")!;
    expect(hotGas.twin).toMatch(/On this page that balance is not solved.*no turbine or preburner fault is modelled/);
    // And the words agree with the drawing: two turbopumps, each with its own turbine.
    expect(SUBSYSTEMS.find((s) => s.id === "turbomachinery")!.role).toMatch(/^Two turbopumps .* each using shaft power from its own turbine/);
    expect(hotGas.role).toMatch(/drives both turbines/);
  });

  it("says that recovery, range and rate checks, security controls and validation are not there", () => {
    expect(IMPLEMENTATION_STATUS.recovery).toMatch(/Recovery is not\..*it commands nothing/);
    expect(IMPLEMENTATION_STATUS.aiArchitecture).toMatch(/range and rate plausibility checks are described, not implemented/);
    expect(IMPLEMENTATION_STATUS.cybersecurity).toMatch(/None of the controls below exists on this page/);
    expect(IMPLEMENTATION_STATUS.validation).toMatch(/No physical engine has been used to calibrate or validate any model here/);
    expect(IMPLEMENTATION_STATUS.mlops).toMatch(/no drift monitoring/);
  });
});

describe("what the page is, and is not", () => {
  it("keeps every statement that keeps it honest about being a simulation", () => {
    const page = renderToStaticMarkup(<AdvancedTwinPage />).replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");
    // Simulated telemetry; no proprietary engine; educational and research; not a certification or flight-safety authority.
    expect(CREDIBILITY_NOTICE).toBe(
      "This experience is an educational and research-oriented Digital Twin engineering environment. Generic propulsion architecture, simulated telemetry, reference models and illustrative failure scenarios are used unless explicitly identified otherwise. It does not reproduce a proprietary flight engine and is not a flight-certification or flight-safety authority.",
    );
    expect(page.split(CREDIBILITY_NOTICE).length - 1).toBeGreaterThanOrEqual(2);
    // Reference values are not flight-engine measurements.
    expect(VALUE_NOTE).toMatch(/SIMULATED or a REFERENCE VALUE.*None is a value from a flight engine\./);
    expect(page).toContain(VALUE_NOTE);
    // No physical engine has validated these models; not flight-certification evidence.
    expect(page).toContain("None. Not compared with any physical engine.");
    expect(page).toContain("nothing on this page is flight-certification evidence or a basis for a flight-safety decision");
    expect(page).toContain(PROGNOSTICS_LIMIT);
    expect(PROGNOSTICS_LIMIT).toMatch(/cannot certify that hardware is safe to fly/);
    expect(page).toContain(READINESS_CAVEAT);
    expect(page).toContain(AI_BOUNDARY);
    expect(AI_BOUNDARY).toMatch(/autonomously certifies propulsion safety/);
    // Demonstrating the methods of levels 4 to 6 does not make this a physically connected level 4 to 6 twin.
    expect(MATURITY_HERE).toBe("The twin on this page implements the methods of levels 4 to 6 against a simulated asset. Because its telemetry is simulated, as a whole it is a level 2 system: an instrumented simulation that demonstrates how a level 6 twin works.");
    expect(page).toContain(MATURITY_HERE);
  });

  it("places the tutorial in the hierarchy: ISHAVASYAM.ORG's initiative, EV.ENGINEER's platform, iTelematics for commerce", () => {
    expect(PREPARED_BY.notes).toHaveLength(2);
    expect(PREPARED_BY.notes[0]).toMatch(/is an EV\.ENGINEER™ interactive engineering tutorial\..*not affiliated with or endorsed by NASA, SpaceX, ISRO/);
    expect(PREPARED_BY.notes[1]).toBe(
      "It is published within Space, an ISHAVASYAM.ORG education, research and engineering initiative. EV.ENGINEER™ is the engineering and learning platform it is built and hosted on. Commercial engineering, where applicable, is handled separately by iTelematics Software Private Limited under explicit agreements.",
    );
    render(<AdvancedTwinPage />);
    expect(document.body.textContent).toContain(PREPARED_BY.notes[1]);
    expect(document.body.textContent).not.toMatch(/EV Society/);
  });
});

describe("the way to reach the author", () => {
  it("is a link in the header, immediately before the EV.ENGINEER mark, and never a hero call to action", () => {
    const { container } = render(<AdvancedTwinPage />);
    const header = container.querySelector("header")!;
    const link = within(header).getByRole("link", { name: /^Contact \/ Consultation/ });
    expect(link).toHaveAttribute("href", "https://aerospace.ishavasyam.org/about/sudarshana-karkala");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    // Spoken, it begins with the words on it, says what it is for, and says that it leaves the page.
    expect(link).toHaveTextContent(/^Contact \/ Consultation$/);
    expect(link).toHaveAccessibleName(CONTACT.ariaLabel);
    expect(CONTACT.ariaLabel).toMatch(/technical questions, collaboration or engineering consultation \(opens in a new tab\)$/);
    expect(link.nextElementSibling).toHaveTextContent(/^EV\.ENGINEER™$/);
    // The breadcrumb still comes first, so nothing moved in the order a keyboard reaches things.
    expect(within(header).getAllByRole("link").map((a) => a.textContent)).toEqual(["Space", "Contact / Consultation"]);

    // On a narrow screen only the first word shows. It is the first word of the name, so the name still begins with what is shown.
    expect(link.querySelector("span > span")).toHaveTextContent("/ Consultation");
    expect(link.querySelector("span")!.firstChild).toHaveTextContent("Contact");
    expect(CONTACT.ariaLabel.startsWith("Contact / Consultation")).toBe(true);

    // The header and nowhere else: the module bar holds its tabs and tools as before, and the hero keeps the calls to action it had.
    expect(container.querySelectorAll(`a[href="${CONTACT.href}"]`)).toHaveLength(1);
    expect([...screen.getByRole("tablist", { name: "Tutorial modules" }).children].every((child) => child.getAttribute("role") === "tab")).toBe(true);
    expect(container.querySelector('section[aria-labelledby="advanced-twin-title"]')!.querySelector(`a[href="${CONTACT.href}"]`)).toBeNull();
  });
});

describe("who the page says it is written for", () => {
  it("keeps the capitals of titles and abbreviations: the list is not lower-cased wholesale", () => {
    render(<AdvancedTwinPage />);
    const sentence = screen.getByText(/^Written for: /).textContent!;
    expect(sentence.startsWith("Written for: CTO and Chief Architects, ")).toBe(true);
    for (const term of ["Digital Twin architects", "aerospace R&D scientists", "AI/ML engineers entering aerospace", "IVHM and PHM engineers", "PhD scholars"]) expect(sentence).toContain(term);
    expect(sentence).not.toMatch(/\bcto\b|ai\/ml|\bphd\b|\bivhm\b/);
  });
});

describe("tables and controls on a small screen", () => {
  it("labels every cell of a stacked table with its column, and keeps the table's roles", () => {
    render(<AdvancedTwinPage />);
    const stacked = [...document.querySelectorAll<HTMLTableElement>("table[data-stack]")];
    expect(stacked.length).toBeGreaterThanOrEqual(9);
    for (const table of stacked) {
      expect(table).toHaveAttribute("role", "table");
      const heads = [...table.querySelectorAll("thead th")].map((th) => th.textContent);
      for (const row of table.querySelectorAll("tbody tr")) {
        expect(row).toHaveAttribute("role", "row");
        const cells = [...row.querySelectorAll("td")];
        for (const cell of cells) expect(cell).toHaveAttribute("role", "cell");
        if (heads.length) expect(cells.map((td) => td.getAttribute("data-label"))).toEqual(heads.slice(heads.length - cells.length));
      }
    }
  });

  it("gives the CTO button one name at every width, beginning with the word that always shows", () => {
    render(<AdvancedTwinPage />);
    const button = screen.getByRole("button", { name: PRODUCT.ctoLabel });
    expect(button.querySelector("span")).toHaveTextContent("CTO");
    expect(PRODUCT.ctoLabel.startsWith(button.querySelector("span")!.textContent!)).toBe(true);
  });
});

describe("the knowledge graph and the readiness score", () => {
  it("shows a node's state in the running twin, and it changes when the twin does", async () => {
    render(<AdvancedTwinPage />);
    open("Architecture");
    await boot();
    const architecture = document.getElementById("architecture")!;
    fireEvent.click(within(architecture).getByRole("button", { name: "Chamber pressure sensor drift" }));
    const live = () => architecture.querySelector("[data-graph-live]")!.textContent!;
    expect(live()).toMatch(/Not injected\. The twin's score for it is \d+ %\./);
    act(() => useLabStore.getState().inject("pc_sensor_drift"));
    run(20);
    expect(live()).toMatch(/Injected, at \d+ % severity\. The twin's score for it is (9\d|100) %\./);
    fireEvent.click(within(architecture).getByRole("button", { name: /^Back to/ }));
    expect(live()).toMatch(/Observed \d+\.\d+, estimated \d+\.\d+, expected \d+\.\d+ % Pc,ref\. Residual [+−]\d+\.\d+/);
    fireEvent.click(within(architecture).getByRole("button", { name: "Open on the pressure map" }));
    expect(tab("Pressure")).toHaveAttribute("aria-selected", "true");
    expect(useLabStore.getState().sensor).toBe("pcA");
  });

  it("puts under each readiness category the evidence the twin can show for it, and says where it has none", async () => {
    render(<AdvancedTwinPage />);
    open("Health");
    const health = document.getElementById("health")!;
    expect(health.querySelectorAll("[data-readiness-evidence]")).toHaveLength(0);
    await boot();
    run(1);
    const evidence = Object.fromEntries([...health.querySelectorAll("[data-readiness-evidence]")].map((p) => [p.getAttribute("data-readiness-evidence"), p.textContent]));
    expect(Object.keys(evidence)).toHaveLength(13);
    const { classifier, identificationSamples } = useLabStore.getState().engine!.evidence;
    expect(evidence.ml).toContain(`${(100 * classifier.validationAccuracy).toFixed(1)} % on ${classifier.validationSamples} simulated validation conditions`);
    expect(evidence.identification).toContain(`${identificationSamples} simulated points`);
    expect(evidence.fault_coverage).toMatch(/A fault outside them is reported as unrecognised, not named/);
    for (const none of ["validation", "cybersecurity", "operations"]) expect(evidence[none]).toMatch(/None\. The twin has nothing to show for this category\./);
    expect(within(health).getByText(/Each level is an assessment, not a computation\./)).toBeInTheDocument();
  });
});
