import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { resetRocketTwinTracking } from "./analytics";
import { DISCLAIMER, FAQ, GLOSSARY, MODELS, MODEL_STATUS, OVERVIEW, PREPARED_BY, PRODUCT, SYSTEMS, TEST_PHASES, TWIN_STATES } from "./data/engineReference";
import { PHASE_MS } from "./simulation/engineSim";
import RocketTwinPage from "./RocketTwinPage";
import { resetRocketTwinStore } from "./state/twinStore";

const trackEvent = vi.fn();
vi.mock("@/utils/analytics", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));

const calls = (event: string) => trackEvent.mock.calls.filter(([name]) => name === event);
const words = (text: string) => text.trim().split(/\s+/).length;
/** The text of the server-rendered page: what a crawler receives, with no effects and no interaction. */
const staticText = () =>
  renderToStaticMarkup(<RocketTwinPage />)
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

/**
 * jsdom reports no media query as matching, which is a small screen here; this makes it a desktop.
 * jsdom has no WebGL either, so a desktop here gets the lightweight console: the fallback.
 */
function asDesktopViewport() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) => ({ matches: true, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false }) as MediaQueryList,
  );
}

beforeEach(() => {
  resetRocketTwinStore();
  resetRocketTwinTracking();
  trackEvent.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("page identity", () => {
  it("has exactly one H1, and it is the product name", () => {
    render(<RocketTwinPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Next-Generation Rocket Engine Digital Twin");
  });

  it("shows the hero copy from the brief", () => {
    render(<RocketTwinPage />);
    const hero = screen.getByRole("region", { name: PRODUCT.name });
    expect(within(hero).getByText("Design · Simulate · Test · Diagnose")).toBeInTheDocument();
    expect(within(hero).getByText("Reusable Liquid Rocket Engine · Reference Architecture")).toBeInTheDocument();
    expect(within(hero).getByText("Interactive digital-engineering learning environment for understanding propulsion systems, control, instrumentation, health monitoring and digital-twin behaviour.")).toBeInTheDocument();
    expect(within(hero).getByRole("link", { name: "Enter Digital Twin" })).toHaveAttribute("href", "#digital-twin");
    expect(within(hero).getByRole("link", { name: "Run Engine Demo" })).toHaveAttribute("href", "#digital-twin");
    expect(within(hero).getByRole("button", { name: "Guided Engine Tour" })).toBeInTheDocument();
    expect(within(hero).getByText("Desktop / Laptop Experience")).toBeInTheDocument();
  });

  it("follows the section order of the brief", () => {
    render(<RocketTwinPage />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Understand a Rocket Engine as a Complete System",
      "Explore the Engine",
      "From Sensors to Digital Twin",
      "Model Credibility",
      "Frequently Asked Questions",
      "Prepared By",
    ]);
  });

  it("gives a breadcrumb back to Space", () => {
    render(<RocketTwinPage />);
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumbs).getByRole("link", { name: "Space" })).toHaveAttribute("href", "/space");
    expect(within(crumbs).getByText(PRODUCT.name)).toHaveAttribute("aria-current", "page");
  });

  it("uses no other product name", () => {
    const html = renderToStaticMarkup(<RocketTwinPage />);
    expect(html).not.toMatch(/UFlight|CubeTwin|Satellite Explorer|Raptor|Merlin|RS-25|BE-4|Vulcain/i);
    expect(html).not.toMatch(/world's first|rank #?1|best rocket engine/i);
  });
});

describe("semantic content, without running the interactive console", () => {
  const text = staticText();

  it("says what the digital twin is and what it covers", () => {
    for (const paragraph of OVERVIEW.paragraphs) expect(text).toContain(paragraph);
    for (const item of OVERVIEW.covers) expect(text).toContain(item);
    expect(OVERVIEW.covers).toHaveLength(12);
    const overviewWords = OVERVIEW.paragraphs.reduce((n, p) => n + words(p), 0);
    expect(overviewWords).toBeGreaterThanOrEqual(80);
    expect(overviewWords).toBeLessThanOrEqual(300);
  });

  it("names every engine system as a real heading with a summary", () => {
    render(<RocketTwinPage />);
    for (const name of ["Rocket Engine Architecture", "Propellant Feed System", "Turbomachinery", "Combustion Chamber", "Regenerative Cooling", "Rocket Nozzle", "Valves and Actuation", "Rocket Engine Instrumentation", "Engine Control System"]) {
      expect(screen.getByRole("heading", { level: 3, name })).toBeInTheDocument();
    }
    for (const system of SYSTEMS) expect(text).toContain(system.summary);
  });

  it("explains testing, health monitoring and the four digital twin states", () => {
    render(<RocketTwinPage />);
    for (const name of ["Simulated Engine Testing", "Engine Health Monitoring", "Digital Twin"]) expect(screen.getByRole("heading", { level: 3, name })).toBeInTheDocument();
    expect(TWIN_STATES.map((s) => s.label)).toEqual(["OBSERVED", "ESTIMATED", "EXPECTED", "PREDICTED"]);
    for (const state of TWIN_STATES) {
      expect(text).toContain(state.label);
      expect(text).toContain(state.text);
    }
    expect(text).toContain("Synthetic or imported telemetry");
    for (const phase of TEST_PHASES) expect(text).toContain(phase.name);
  });

  it("states model credibility without implying validation", () => {
    render(<RocketTwinPage />);
    const section = screen.getByRole("region", { name: "Model Credibility" });
    expect(within(section).getByText(/The experience uses reference and reduced-order models for interactive learning\./)).toBeInTheDocument();
    const terms = within(section).getByRole("list", { name: "Model status terms" });
    expect(within(terms).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["REFERENCE MODEL", "SIMULATED", "REDUCED ORDER", "NOT TEST-CORRELATED"]);
    expect([...MODEL_STATUS]).toEqual(["REFERENCE MODEL", "SIMULATED", "REDUCED ORDER", "NOT TEST-CORRELATED"]);
    const rows = within(section).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(MODELS.length);
    for (const model of MODELS) expect(model.validation).toBe("NOT TEST-CORRELATED");
    expect(section.textContent).not.toMatch(/\bvalidated\b|flight[- ]proven|certified|\bqualified\b/i);
  });

  it("keeps the short disclaimer once, in the footer, apart from Prepared By", () => {
    render(<RocketTwinPage />);
    expect(text.split(DISCLAIMER)).toHaveLength(2);
    const disclaimer = screen.getByText(DISCLAIMER);
    expect(disclaimer.closest("footer")).not.toBeNull();
    expect(screen.getByRole("region", { name: "Prepared by" })).not.toContainElement(disclaimer);
  });

  it("carries a text alternative for the engine schematic", () => {
    render(<RocketTwinPage />);
    expect(screen.getByRole("img", { name: /Schematic of the reusable liquid rocket engine reference architecture/ })).toBeInTheDocument();
  });

});

describe("frequently asked questions", () => {
  it("asks the eight questions, each answered in 40 to 90 words", () => {
    expect(FAQ.map((f) => f.q)).toEqual([
      "What is a rocket engine digital twin?",
      "What can I explore in this 3D rocket engine?",
      "What is turbomachinery in a liquid rocket engine?",
      "How does regenerative cooling work?",
      "What does the engine controller monitor?",
      "How is engine health monitored?",
      "What is the difference between a simulation and a digital twin?",
      "Are the engine values shown here from a real flight engine?",
    ]);
    for (const item of FAQ) {
      expect(words(item.a), item.q).toBeGreaterThanOrEqual(40);
      expect(words(item.a), item.q).toBeLessThanOrEqual(90);
    }
  });

  it("keeps every answer in the HTML, expanded or not", () => {
    const text = staticText();
    for (const item of FAQ) {
      expect(text).toContain(item.q);
      expect(text).toContain(item.a);
    }
    for (const entry of GLOSSARY) expect(text).toContain(entry.definition);
  });

  it("uses native disclosure elements, so they work from the keyboard without script", () => {
    render(<RocketTwinPage />);
    const section = screen.getByRole("region", { name: "Frequently Asked Questions" });
    const details = section.querySelectorAll("details");
    expect(details).toHaveLength(FAQ.length + 1);
    details.forEach((d) => expect(d.querySelector("summary h3")).not.toBeNull());
    expect(details[0]).toHaveAttribute("open");
  });

  it("says plainly that the engine is not a real one", () => {
    const answer = FAQ.find((f) => f.q.startsWith("Are the engine values"))!.a;
    expect(answer).toMatch(/^No\. The engine shown here is a reusable liquid rocket engine reference architecture created for digital-engineering education and simulation\./);
    expect(answer).toContain("Geometry, telemetry, operating states, faults and predictions are illustrative or simulated unless explicitly identified otherwise.");
  });

  it("defines a digital twin without claiming this one is test-correlated", () => {
    const answer = FAQ[0].a;
    expect(answer).toContain("A rocket engine digital twin is a digital representation that combines an engine architecture, physics-based or data-driven models, simulated or measured telemetry, operating state and health information.");
    expect(answer).toMatch(/its telemetry is simulated/);
  });
});

describe("Prepared By", () => {
  it("reuses the shared profile card with the brief's copy and review date", () => {
    render(<RocketTwinPage />);
    const section = screen.getByRole("region", { name: "Prepared by" });
    const card = within(section).getByRole("complementary", { name: "About the researcher" });
    expect(within(card).getByText("Prepared by")).toBeInTheDocument();
    expect(within(card).getByRole("heading", { level: 3, name: "Sudarshana Karkala" })).toBeInTheDocument();
    expect(within(card).getByText("EV.ENGINEER™")).toBeInTheDocument();
    expect(within(section).getByText("Next-Generation Rocket Engine Digital Twin is an EV.ENGINEER™ interactive engineering experience for rocket propulsion, simulation, health monitoring and digital-twin learning.")).toBeInTheDocument();
    expect(within(section).getByText(/last reviewed/)).toHaveTextContent("Experience information last reviewed: 3 October 2026.");
    expect(section.querySelector("time")).toHaveAttribute("datetime", "2026-10-03");
  });

  it("keeps the attribution to a single short line", () => {
    expect(PREPARED_BY.notes).toHaveLength(1);
    expect(words(PREPARED_BY.notes[0])).toBeLessThan(30);
    render(<RocketTwinPage />);
    expect(screen.getByRole("region", { name: "Prepared by" }).querySelectorAll("p")).toHaveLength(4); // eyebrow, role, attribution, review date
  });

  it("uses the existing portrait with explicit dimensions and the brief's alt text", () => {
    render(<RocketTwinPage />);
    const portrait = screen.getByRole("img", { name: "Sudarshana Karkala — EV.ENGINEER" });
    expect(portrait.getAttribute("src")).toContain("SudarshanaKarkala.jpg");
    expect(portrait).toHaveAttribute("width", "56");
    expect(portrait).toHaveAttribute("height", "56");
  });

  it("links to the full profile and reports the click with its placement", () => {
    render(<RocketTwinPage />);
    const link = screen.getByRole("link", { name: /View full profile/ });
    expect(link).toHaveAttribute("href", "/about/sudarshana-karkala");
    expect(link).toHaveAttribute("data-track-event", "rocket_twin_profile_click");
    expect(link).toHaveAttribute("data-track-placement", "prepared_by");
  });
});

describe("related learning", () => {
  it("links to Space, Model Rocketry and Satellite Engineering with descriptive text", () => {
    render(<RocketTwinPage />);
    const nav = screen.getByRole("navigation", { name: "Related learning" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/space", "/space/model-rocketry", "/space/satellite-engineering"]);
    expect(links.map((a) => a.getAttribute("data-track-destination"))).toEqual(["space", "model_rocketry", "satellite_engineering"]);
    for (const link of links) {
      expect(link).toHaveAttribute("data-track-event", "rocket_twin_related_click");
      expect(link.textContent).not.toMatch(/click here|read more|learn more/i);
      expect(words(link.textContent ?? "")).toBeGreaterThan(4);
    }
  });
});

describe("calls to action", () => {
  it("Enter Digital Twin reports once", () => {
    asDesktopViewport();
    render(<RocketTwinPage />);
    const enter = screen.getByRole("link", { name: "Enter Digital Twin" });
    fireEvent.click(enter);
    fireEvent.click(enter);
    expect(calls("rocket_twin_enter")).toEqual([["rocket_twin_enter"]]);
  });

  it("Run Engine Demo reports once and starts the simulated test", () => {
    asDesktopViewport();
    render(<RocketTwinPage />);
    const demo = screen.getByRole("link", { name: "Run Engine Demo" });
    fireEvent.click(demo);
    fireEvent.click(demo);
    expect(calls("rocket_twin_demo_start")).toHaveLength(1);
    expect(calls("rocket_twin_test_start")).toHaveLength(1);
    expect(screen.getByRole("tab", { name: "Open simulated engine test" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Phase 1 of 8: System check")).toBeInTheDocument();
  });

  it("opens a system in the console from its summary", () => {
    asDesktopViewport();
    render(<RocketTwinPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Show engine flow paths" }));
    fireEvent.click(screen.getByRole("link", { name: "Explore regenerative cooling" }));
    expect(screen.getByRole("tab", { name: "Explore engine systems" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: "Explore regenerative cooling" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Engine · Regenerative Cooling");
  });
});

describe("interactive console", () => {
  beforeEach(asDesktopViewport);

  it("labels every mode meaningfully and shows one panel at a time", () => {
    render(<RocketTwinPage />);
    const tabs = within(screen.getByRole("tablist", { name: "Digital twin modes" })).getAllByRole("tab");
    expect(tabs.map((t) => t.getAttribute("aria-label"))).toEqual([
      "Explore engine systems",
      "Open engine build view",
      "Show engine flow paths",
      "Open engine control and instrumentation",
      "Open simulated engine test",
      "Open engine health monitoring",
      "Compare digital twin states",
      "Open system architecture",
    ]);
    expect(tabs.map((t) => t.textContent)).toEqual(["Engine", "Build", "Flow", "Control", "Test", "Health", "Twin", "Architecture"]);
    // The visible word is part of the accessible name, so voice control can address the tab by what it shows.
    for (const tab of tabs) expect(tab.getAttribute("aria-label")!.toLowerCase()).toContain(tab.textContent!.toLowerCase());
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
  });

  it("reports a mode change with that mode's event", () => {
    render(<RocketTwinPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Open engine health monitoring" }));
    fireEvent.click(screen.getByRole("tab", { name: "Open engine health monitoring" }));
    expect(trackEvent.mock.calls).toEqual([["rocket_twin_health_open"]]);
    expect(screen.getByRole("tabpanel", { name: "Open engine health monitoring" })).toBeVisible();
  });

  it("moves between modes with the arrow keys", () => {
    render(<RocketTwinPage />);
    fireEvent.keyDown(screen.getByRole("tab", { name: "Explore engine systems" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Open engine build view" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Open engine build view" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("tab", { name: "Open engine build view" }), { key: "End" });
    expect(screen.getByRole("tab", { name: "Open system architecture" })).toHaveAttribute("aria-selected", "true");
  });

  it("sends the semantic component id when a component is selected", () => {
    render(<RocketTwinPage />);
    fireEvent.click(screen.getByRole("button", { name: "Engineer mode: engineering detail" }));
    fireEvent.click(screen.getByRole("button", { name: "Oxidiser turbopump" }));
    expect(calls("rocket_twin_audience_mode")).toEqual([["rocket_twin_audience_mode", { mode: "engineer" }]]);
    expect(calls("rocket_twin_component_select")).toEqual([["rocket_twin_component_select", { component_id: "oxidiser_turbopump", system: "turbomachinery", mode: "engine", audience_mode: "engineer" }]]);
    expect(screen.getByText(/Pump pressure rise scales roughly with the square of shaft speed/)).toBeInTheDocument();
  });

  it("switches the explanation between Learn and Engineer", () => {
    render(<RocketTwinPage />);
    fireEvent.click(screen.getByRole("button", { name: "Preburner" }));
    expect(screen.getByText("A small combustor that makes the hot gas that drives the turbines.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Engineer mode: engineering detail" }));
    expect(screen.getByText(/keep turbine inlet temperature within material limits/)).toBeInTheDocument();
  });

  it("gives the build, flow and sensor controls descriptive names", () => {
    render(<RocketTwinPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Open engine build view" }));
    fireEvent.click(screen.getByRole("button", { name: "View combustion chamber cutaway" }));
    fireEvent.click(screen.getByRole("button", { name: "Exploded view: Major assemblies" }));
    fireEvent.click(screen.getByRole("tab", { name: "Show engine flow paths" }));
    fireEvent.click(screen.getByRole("button", { name: "Show regenerative cooling flow" }));
    fireEvent.click(screen.getByRole("tab", { name: "Open engine control and instrumentation" }));
    fireEvent.click(screen.getByRole("button", { name: "Trace the turbopump shaft speed sensor" }));
    expect(calls("rocket_twin_cutaway")).toEqual([["rocket_twin_cutaway", { system: "combustion" }]]);
    expect(calls("rocket_twin_exploded_view")).toEqual([["rocket_twin_exploded_view", { level: "assemblies" }]]);
    expect(calls("rocket_twin_flow_select")).toEqual([["rocket_twin_flow_select", { flow_type: "cooling" }]]);
    expect(calls("rocket_twin_sensor_trace")).toEqual([["rocket_twin_sensor_trace", { sensor_type: "speed", system: "turbomachinery" }]]);
    const names = screen.getAllByRole("button", { hidden: true }).map((b) => b.getAttribute("aria-label") ?? b.textContent ?? "");
    for (const name of names) expect(name.trim()).not.toMatch(/^(button \d+|open|more|click)$/i);
  });

  it("runs the simulated test through all eight phases, reporting the start once", () => {
    vi.useFakeTimers();
    // StrictMode runs effects twice; the test clock must still tick once per phase.
    render(
      <StrictMode>
        <RocketTwinPage />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Open simulated engine test" }));
    fireEvent.click(screen.getByRole("button", { name: "Run simulated engine test" }));
    expect(screen.queryByRole("button", { name: "Run simulated engine test" })).not.toBeInTheDocument();
    for (const phase of TEST_PHASES) act(() => void vi.advanceTimersByTime(PHASE_MS[phase.id]));
    act(() => void vi.advanceTimersByTime(20_000));

    expect(calls("rocket_twin_test_start")).toHaveLength(1);
    expect(calls("rocket_twin_test_phase").map(([, p]) => p.phase)).toEqual(["system_check", "conditioning", "ready", "start", "mainstage", "throttle", "shutdown", "review"]);
    expect(calls("rocket_twin_test_complete")).toEqual([["rocket_twin_test_complete", { completion_status: "completed" }]]);
    expect(screen.getByText("Test complete. Every phase ran.")).toBeInTheDocument();
  });

  it("sends the fault type through a fault scenario", () => {
    render(<RocketTwinPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Open engine health monitoring" }));
    fireEvent.click(screen.getByRole("button", { name: "Start fault scenario: Chamber pressure sensor drift" }));
    expect(screen.queryByText(/isolated to the measurement/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View diagnosis: Chamber pressure sensor drift" }));
    fireEvent.click(screen.getByRole("button", { name: "Show response and complete scenario: Chamber pressure sensor drift" }));
    expect(calls("rocket_twin_fault_start")).toEqual([["rocket_twin_fault_start", { fault_type: "chamber_pressure_sensor_drift", system: "instrumentation" }]]);
    expect(calls("rocket_twin_fault_diagnosis_view")).toEqual([["rocket_twin_fault_diagnosis_view", { fault_type: "chamber_pressure_sensor_drift" }]]);
    expect(calls("rocket_twin_fault_complete")).toEqual([["rocket_twin_fault_complete", { fault_type: "chamber_pressure_sensor_drift" }]]);
    expect(screen.getByText(/The controller votes the sensor out/)).toBeInTheDocument();
  });

  it("compares digital twin states with simulated, labelled values", () => {
    render(<RocketTwinPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Compare digital twin states" }));
    fireEvent.click(screen.getByRole("button", { name: "Compare observed, estimated and expected states" }));
    const table = screen.getByRole("table", { name: /Illustrative mainstage snapshot/ });
    expect(within(table).getByText("SIMULATED")).toBeInTheDocument();
    expect(within(table).getByText("NOT TEST-CORRELATED")).toBeInTheDocument();
    expect(within(table).getByRole("row", { name: /Chamber pressure/ })).toHaveTextContent("98.498.6100.0−1.6");
    fireEvent.click(screen.getByRole("button", { name: "Show predicted state" }));
    fireEvent.click(screen.getByRole("link", { name: "Open Model Credibility" }));
    expect(screen.getByRole("link", { name: "Open Model Credibility" })).toHaveAttribute("href", "#model-credibility");
    expect(trackEvent.mock.calls.map(([name]) => name).filter((n) => n !== "rocket_twin_journey_milestone")).toEqual(["rocket_twin_twin_open", "rocket_twin_compare_open", "rocket_twin_prediction_open", "rocket_twin_model_credibility_open"]);
  });

  it("opts out of the site's implicit click tracking, since it reports its own events", () => {
    const { container } = render(<RocketTwinPage />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-track-manual");
    expect(root).toContainElement(screen.getByRole("tablist", { name: "Digital twin modes" }));
  });
});

describe("small screens", () => {
  it("serves the same subject at the same address, with a note that a larger screen is easier", () => {
    render(<RocketTwinPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const note = screen.getByRole("complementary", { name: /DESKTOP EXPERIENCE RECOMMENDED/ });
    expect(note).toHaveTextContent("Here you can explore the same systems, test and health views on a schematic.");
    // The lightweight experience covers the brief's basics: feed, turbomachinery, combustion, cooling, control, health and the twin.
    for (const name of ["Explore the propellant feed system", "Explore turbomachinery", "Explore the combustion chamber", "Explore regenerative cooling", "Explore the engine control system"]) expect(screen.getByRole("button", { name })).toBeInTheDocument();
    for (const name of ["Open engine health monitoring", "Compare digital twin states"]) expect(screen.getByRole("tab", { name })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Model Credibility" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Engine Health Monitoring" })).toBeInTheDocument();
  });

  it("reports the small-screen visit and the recommendation once each", () => {
    const first = render(
      <StrictMode>
        <RocketTwinPage />
      </StrictMode>,
    );
    first.unmount();
    render(<RocketTwinPage />);
    window.dispatchEvent(new Event("resize"));
    expect(calls("rocket_twin_mobile_view")).toEqual([["rocket_twin_mobile_view"]]);
    expect(calls("rocket_twin_desktop_recommendation_view")).toEqual([["rocket_twin_desktop_recommendation_view"]]);
  });

  it("reports neither on a desktop viewport", () => {
    asDesktopViewport();
    render(<RocketTwinPage />);
    expect(trackEvent).not.toHaveBeenCalled();
  });
});
