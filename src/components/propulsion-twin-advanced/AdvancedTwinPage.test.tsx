import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import AdvancedTwinPage from "./AdvancedTwinPage";
import { type AdvancedTwinEvents, resetAdvancedTwinTracking } from "./analytics";
import { CTO_QUESTIONS, CYBER_ATTACKS, CYBER_CONTROLS, DIGITAL_THREAD, GRAPH_EDGES, GRAPH_KINDS, GRAPH_NODES, NORTH_STAR } from "./data/architecture";
import { AI_BOUNDARY, HYBRID_APPROACHES, MODEL_FAMILIES } from "./data/aiml";
import { CHECKPOINTS } from "./data/checkpoints";
import { ACCEPTANCE, COURSE_PHASES, COURSE_WEEKS, FINAL_DELIVERABLE, READINESS_CATEGORIES } from "./data/course";
import { FAQ, REFERENCES } from "./data/faq";
import { DETECTION_METHODS, FAULT_LIBRARY, TREE_BRANCHES } from "./data/fdir";
import { FIDELITY_LEVELS, PHYSICS_CONCEPTS } from "./data/physics";
import { TRANSFORMATION_STEPS } from "./data/pipeline";
import { DELTA_PS, PRESSURE_PATH, PRESSURE_SENSORS } from "./data/pressure";
import { CREDIBILITY_NOTICE, ENGINEERING_CHAIN, LEARNING_STORY, LEARNING_STORY_END, MODULES, PRINCIPLE, PRODUCT } from "./data/product";
import { SUBSYSTEMS } from "./data/system";
import { ESTIMATORS, MATURITY_LEVELS, MODEL_CARDS, MODEL_STATUSES, TWIN_DEFINITION, TWIN_STATES, UNCERTAINTY_SOURCES, VV_TERMS } from "./data/twin";
import { CH } from "./simulation/channels";
import { DESIGN, scheduleSpeed, steadyState } from "./simulation/plant";
import { WEEKS_STORAGE_KEY, resetLabStore, useLabStore } from "./state/labStore";
import { MODULE_IDS } from "./types";

const trackEvent = vi.fn();
vi.mock("@/utils/analytics", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));

const calls = (event: keyof AdvancedTwinEvents) => trackEvent.mock.calls.filter(([name]) => name === event);
/** The text of the server-rendered page: what a crawler receives, with no effects and no interaction. */
const staticText = () =>
  renderToStaticMarkup(<AdvancedTwinPage />)
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
/** Text as it reads once runs of spaces are collapsed, as they are in `staticText`. */
const flat = (value: string) => value.replace(/\s+/g, " ");

// The whole tutorial is in the document at once, so queries over it are slow.
vi.setConfig({ testTimeout: 30000 });

const tab = (name: string) => within(screen.getByRole("tablist", { name: "Tutorial modules" })).getByRole("tab", { name });
const panel = (id: string) => document.getElementById(id) as HTMLElement;
const open = (name: string) => fireEvent.click(tab(name));

beforeEach(() => {
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

describe("page identity", () => {
  it("has exactly one H1, the page title from the brief", () => {
    render(<AdvancedTwinPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Advanced Rocket Propulsion System Digital Twin");
  });

  it("shows the hero subtitle, supporting line and primary mission", () => {
    render(<AdvancedTwinPage />);
    const hero = screen.getByRole("region", { name: PRODUCT.name });
    expect(within(hero).getByText("From Physical Propulsion System to a Physics-Based, Data-Driven, AI-Assisted Digital Twin")).toBeInTheDocument();
    expect(within(hero).getByText("Model · Instrument · Synchronise · Detect · Diagnose · Predict · Validate")).toBeInTheDocument();
    expect(within(hero).getByRole("link", { name: "Start the Tutorial" })).toHaveAttribute("href", "#system");
    expect(within(hero).getByRole("link", { name: "Open the Fault Injection Lab" })).toHaveAttribute("href", "#lab");
    expect(within(hero).getByRole("link", { name: "CTO / Architect View" })).toHaveAttribute("href", "#cto");
    expect(screen.getByText(/Rocket Propulsion Pressure Monitoring, Fault Detection, Diagnosis and Prognostics/)).toBeInTheDocument();
  });

  it("links back to the fundamentals page with the wording of the brief", () => {
    render(<AdvancedTwinPage />);
    const links = screen.getAllByRole("link", { name: "Start with Rocket Engine Digital Twin Fundamentals" });
    expect(links.length).toBeGreaterThanOrEqual(1);
    links.forEach((link) => expect(link).toHaveAttribute("href", "/space/rocket-engine-digital-twin"));
  });

  it("displays the credibility notice word for word, in the hero and again at the foot", () => {
    render(<AdvancedTwinPage />);
    expect(CREDIBILITY_NOTICE).toBe(
      "This experience is an educational and research-oriented Digital Twin engineering environment. Generic propulsion architecture, simulated telemetry, reference models and illustrative failure scenarios are used unless explicitly identified otherwise. It does not reproduce a proprietary flight engine and is not a flight-certification or flight-safety authority.",
    );
    expect(within(screen.getByRole("complementary", { name: "Credibility notice" })).getByText(CREDIBILITY_NOTICE)).toBeInTheDocument();
    expect(screen.getAllByText(CREDIBILITY_NOTICE)).toHaveLength(2);
  });

  it("gives a breadcrumb back to Space and a skip link", () => {
    render(<AdvancedTwinPage />);
    expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByRole("link", { name: "Space" })).toHaveAttribute("href", "/space");
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main-content");
  });

  it("names no agency or company as a source, partner or model for the engine", () => {
    const text = staticText();
    // The only mentions are the statement of independence and the cited public references.
    expect(text.match(/SpaceX/g) ?? []).toHaveLength(1);
    expect(text).toMatch(/not affiliated with or endorsed by NASA, SpaceX, ISRO/);
    expect(text).not.toMatch(/\b(Raptor|Merlin|RS-25|Vikas|SSME|BE-4|flight[- ]proven)\b/i);
  });
});

describe("navigation", () => {
  it("offers the twelve modules in the order of the brief", () => {
    render(<AdvancedTwinPage />);
    const tabs = within(screen.getByRole("tablist", { name: "Tutorial modules" })).getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["Overview", "System", "Pressure", "Physics", "Data", "Twin", "AI/ML", "FDIR", "Health", "Lab", "Architecture", "12 Weeks"]);
    expect(MODULES.map((m) => m.id)).toEqual([...MODULE_IDS]);
  });

  it("shows one module at a time and keeps every module in the document", () => {
    render(<AdvancedTwinPage />);
    expect(screen.getAllByRole("tabpanel", { hidden: false }).filter((p) => (MODULE_IDS as readonly string[]).includes(p.id))).toHaveLength(1);
    expect(panel("overview")).not.toHaveAttribute("hidden");
    for (const id of MODULE_IDS) expect(panel(id), id).toBeInTheDocument();
    open("Pressure");
    expect(panel("pressure")).not.toHaveAttribute("hidden");
    expect(panel("overview")).toHaveAttribute("hidden");
    expect(tab("Pressure")).toHaveAttribute("aria-selected", "true");
    expect(window.location.hash).toBe("#pressure");
    expect(calls("module_open")).toEqual([["module_open", { experience: "advanced_propulsion_twin", module: "pressure" }]]);
  });

  it("moves between modules with the arrow keys", () => {
    render(<AdvancedTwinPage />);
    fireEvent.keyDown(tab("Overview"), { key: "ArrowRight" });
    expect(tab("System")).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(tab("System"), { key: "End" });
    expect(tab("12 Weeks")).toHaveAttribute("aria-selected", "true");
  });

  it("opens the module named in the address, and follows in-page #module links", () => {
    window.history.replaceState(null, "", "/#fdir");
    render(<AdvancedTwinPage />);
    expect(panel("fdir")).not.toHaveAttribute("hidden");
    act(() => {
      window.history.replaceState(null, "", "/#lab");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(panel("lab")).not.toHaveAttribute("hidden");
  });

  it("switches reading depth without changing what is in the document", () => {
    render(<AdvancedTwinPage />);
    const root = document.getElementById("advanced-propulsion-twin") as HTMLElement;
    expect(root).toHaveAttribute("data-level", "learn");
    const before = root.textContent;
    fireEvent.click(screen.getByRole("button", { name: /Engineer mode/ }));
    expect(root).toHaveAttribute("data-level", "engineer");
    fireEvent.click(screen.getByRole("button", { name: /Architect mode/ }));
    expect(root).toHaveAttribute("data-level", "architect");
    expect(root.textContent).toBe(before);
  });

  it("CTO / Architect View opens the architecture module at architect depth and reports it", () => {
    render(<AdvancedTwinPage />);
    fireEvent.click(screen.getByRole("button", { name: "CTO / Architect View" }));
    expect(panel("architecture")).not.toHaveAttribute("hidden");
    expect(document.getElementById("advanced-propulsion-twin")).toHaveAttribute("data-level", "architect");
    expect(calls("cto_mode_opened")).toHaveLength(1);
  });

  it("reports the page view once", () => {
    render(<AdvancedTwinPage />);
    expect(calls("advanced_twin_page_view")).toHaveLength(1);
  });
});

describe("content rendered on the server", () => {
  const text = staticText();

  it("defines a propulsion Digital Twin directly, and answers every question of the brief", () => {
    expect(text).toContain(TWIN_DEFINITION);
    expect(FAQ.map((f) => f.q)).toEqual([
      "What is a propulsion Digital Twin?",
      "How is it different from simulation?",
      "Why is pressure monitored in rocket propulsion?",
      "What is chamber pressure?",
      "What is model residual?",
      "What AI models are used in Digital Twins?",
      "What is a physics-informed Digital Twin?",
      "How are propulsion faults detected?",
      "How do we distinguish sensor drift from real engine degradation?",
      "What is state estimation?",
      "What is Digital Twin validation?",
      "Can AI replace propulsion physics?",
      "What is FDIR?",
      "What is prognostics?",
      "What is Digital Twin uncertainty?",
    ]);
    for (const item of FAQ) {
      expect(text, item.q).toContain(item.q);
      expect(text, item.q).toContain(item.a);
    }
  });

  it("carries the principle, the engineering chain and the learning story", () => {
    for (const line of PRINCIPLE) expect(text).toContain(`${line.source} ${line.says}`);
    expect(ENGINEERING_CHAIN).toHaveLength(16);
    for (const step of ENGINEERING_CHAIN) expect(text).toContain(step);
    for (const line of LEARNING_STORY) expect(text).toContain(line);
    expect(text).toContain(LEARNING_STORY_END);
    expect(text).toContain("A 3D model is not automatically a Digital Twin.");
  });

  it("contains every module's teaching, whichever module is showing", () => {
    const everything: readonly (readonly string[])[] = [
      MATURITY_LEVELS.map((l) => l.what),
      SUBSYSTEMS.map((s) => s.role),
      PRESSURE_SENSORS.flatMap((s) => [s.tag, s.purpose, s.failureSignature, s.twinUse]),
      PRESSURE_PATH.map((s) => s.text),
      DELTA_PS.map((d) => d.formula),
      PHYSICS_CONCEPTS.flatMap((c) => [c.definition, c.simple, c.engineering, c.math.equation, c.twin, c.failure]),
      FIDELITY_LEVELS.map((f) => f.inTwin),
      TRANSFORMATION_STEPS.map((s) => s.summary),
      TWIN_STATES.map((s) => s.definition),
      ESTIMATORS.flatMap((e) => [e.definition, e.failure]),
      UNCERTAINTY_SOURCES.map((u) => u.text),
      MODEL_CARDS.flatMap((m) => [m.purpose, m.limitations]),
      VV_TERMS.map((v) => v.question),
      MODEL_FAMILIES.map((f) => f.definition),
      HYBRID_APPROACHES.flatMap((h) => [h.definition, h.math.equation]),
      [AI_BOUNDARY],
      DETECTION_METHODS.flatMap((d) => [d.strengths, d.limitations, d.falseAlarms]),
      FAULT_LIBRARY.flatMap((g) => g.faults.map((f) => f.name)),
      TREE_BRANCHES.map((b) => b.cause),
      CTO_QUESTIONS.flatMap((q) => [q.q, q.a]),
      CYBER_CONTROLS.map((c) => c.name),
      CYBER_ATTACKS.map((a) => a.name),
      DIGITAL_THREAD.map((d) => d.stage),
      COURSE_WEEKS.flatMap((w) => [w.title, ...w.deliver]),
      FINAL_DELIVERABLE,
      ACCEPTANCE.map((a) => a.item),
      CHECKPOINTS.flatMap((c) => [c.explain.prompt, c.identify.question, c.diagnose.question, c.architect.question]),
      REFERENCES.map((r) => r.title),
    ];
    for (const group of everything) for (const item of group) expect(text, item.slice(0, 60)).toContain(flat(item));
  });

  it("describes each live instrument where it will appear, so the page reads completely without the simulation", () => {
    expect(text).toMatch(/Eight charts: chamber pressure in its observed, estimated, expected and predicted states/);
    expect(text).toMatch(/Seven detectors running side by side/);
    expect(text).toMatch(/An interactive chamber-pressure example through a throttle step/);
    expect(text).toMatch(/a ±2σ band that widens with the horizon/);
  });

  it("marks synthetic values as SIMULATED or REFERENCE VALUE, and says so in words", () => {
    expect(text).toContain("Every number on this page is SIMULATED or a REFERENCE VALUE");
    expect(text).toMatch(/REFERENCE VALUE/);
    expect(text).toMatch(/SIMULATED/);
    expect(text).toContain("Ranges are given as a class, never as an operating range.");
  });

  it("separates its own reference architecture from external evidence", () => {
    render(<AdvancedTwinPage />);
    const references = screen.getByRole("region", { name: "References" });
    expect(within(references).getByRole("heading", { level: 3, name: "Reference Architecture" })).toBeInTheDocument();
    expect(within(references).getByRole("heading", { level: 3, name: "Verified External Technical Evidence" })).toBeInTheDocument();
    const links = within(references).getAllByRole("link");
    expect(links).toHaveLength(REFERENCES.length);
    for (const link of links) {
      expect(link.getAttribute("href")).toMatch(/^https:\/\//);
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("never calls one of its own models validated", () => {
    expect(MODEL_STATUSES.map((s) => s.status)).toEqual(["CONCEPTUAL", "REFERENCE MODEL", "SIMULATED", "CALIBRATED", "TEST-CORRELATED", "VALIDATED WITHIN DEFINED ENVELOPE"]);
    for (const card of MODEL_CARDS) {
      expect(["CONCEPTUAL", "REFERENCE MODEL", "SIMULATED"], card.name).toContain(card.status);
      expect(card.lastValidation).toMatch(/^None/);
    }
    expect(text).toContain("No model on this page is described as validated");
    expect(text).not.toMatch(/certified for flight|flight[- ]qualified|guarantee/i);
  });
});

describe("data consistency", () => {
  it("uses reference pressures that are the design point of its own model", () => {
    const point = steadyState(DESIGN, scheduleSpeed(1)).values;
    expect(PRESSURE_SENSORS).toHaveLength(15);
    for (const sensor of PRESSURE_SENSORS) expect(point[CH[sensor.id]], sensor.name).toBeCloseTo(sensor.reference, 1);
  });

  it("covers the sensor locations, pressure differences and structures the brief lists", () => {
    expect(PRESSURE_SENSORS.map((s) => s.id).sort()).toEqual(["pCoolIn", "pCoolOut", "pInFu", "pInOx", "pInjFu", "pInjOx", "pOutFu", "pOutOx", "pPb", "pTankFu", "pTankOx", "pTi", "pTo", "pcA", "pcB"].sort());
    expect(DELTA_PS.map((d) => d.name)).toEqual(["ΔP Pump", "ΔP Injector", "ΔP Cooling Circuit", "ΔP Filter / Line"]);
    expect(SUBSYSTEMS).toHaveLength(10);
    expect(PHYSICS_CONCEPTS.map((c) => c.title)).toEqual(["Conservation of Mass", "Conservation of Momentum", "Conservation of Energy", "Fluid Dynamics", "Pump Physics", "Combustion", "Nozzle", "Thermal Physics"]);
    expect(TRANSFORMATION_STEPS).toHaveLength(12);
    expect(MATURITY_LEVELS.map((l) => l.name)).toEqual(["Geometry", "Simulation", "Instrumented Simulation", "Digital Shadow", "Digital Twin", "Predictive Digital Twin", "Decision-Support Twin"]);
    expect(MATURITY_LEVELS.filter((l) => l.isTwin).map((l) => l.level)).toEqual([4, 5, 6]);
    expect(DETECTION_METHODS).toHaveLength(7);
    expect(TREE_BRANCHES).toHaveLength(7);
    expect(FAULT_LIBRARY.map((g) => g.name)).toEqual(["Propellant Storage / Feed", "Pump / Turbomachinery", "Cooling", "Injector", "Combustion Chamber", "Hot-Gas / Turbine Circuit", "Control", "Instrumentation", "Digital / Software"]);
    expect(FAULT_LIBRARY.flatMap((g) => g.faults).length).toBeGreaterThanOrEqual(64);
    expect(READINESS_CATEGORIES).toHaveLength(13);
    expect(CTO_QUESTIONS).toHaveLength(12);
    expect(COURSE_PHASES.map((p) => p.weeks.length)).toEqual([3, 3, 3, 3]);
    expect(COURSE_WEEKS.map((w) => w.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(COURSE_WEEKS.filter((w) => w.review).map((w) => w.review)).toEqual(["Mission / System Concept Review", "Instrumentation Architecture Review", "Physics Model Review", "Digital Twin Intelligence Review", "DIGITAL TWIN READINESS REVIEW"]);
    expect(NORTH_STAR[0]).toBe("PHYSICAL PROPULSION SYSTEM");
    expect(NORTH_STAR.at(-1)).toBe("VALIDATION");
  });

  it("gives every teaching module a checkpoint with one right answer per question", () => {
    expect(CHECKPOINTS.map((c) => c.module)).toEqual(MODULE_IDS.filter((id) => id !== "weeks"));
    for (const checkpoint of CHECKPOINTS) {
      for (const question of [checkpoint.identify, checkpoint.diagnose, checkpoint.architect]) {
        expect(question.choices.filter((c) => c.correct), question.question).toHaveLength(1);
        expect(question.reasoning.length).toBeGreaterThan(60);
      }
    }
  });

  it("builds a knowledge graph whose edges join real nodes of every kind", () => {
    const ids = new Set(GRAPH_NODES.map((n) => n.id));
    for (const [a, b] of GRAPH_EDGES) {
      expect(ids.has(a), a).toBe(true);
      expect(ids.has(b), b).toBe(true);
    }
    expect(new Set(GRAPH_NODES.map((n) => n.kind))).toEqual(new Set(GRAPH_KINDS));
  });

  it("cites each reference once, by https link", () => {
    expect(new Set(REFERENCES.map((r) => r.href)).size).toBe(REFERENCES.length);
    for (const r of REFERENCES) expect(r.href).toMatch(/^https:\/\/(doi\.org|www\.nasa\.gov|standards\.nasa\.gov|ntrs\.nasa\.gov|www\.lpsc\.gov\.in)\//);
  });
});

describe("interactive learning", () => {
  it("reveals a checkpoint's reasoning only after an answer is chosen", () => {
    render(<AdvancedTwinPage />);
    const checkpoint = within(panel("overview")).getByRole("region", { name: "Learning Checkpoint" });
    const question = within(checkpoint).getByRole("group", { name: /A team shows a detailed 3D engine/ });
    const reasoning = CHECKPOINTS[0].identify.reasoning;
    expect(within(question).getByText(reasoning, { exact: false })).not.toBeVisible();
    fireEvent.click(within(question).getByRole("button", { name: "A Digital Twin" }));
    expect(within(question).getByText(reasoning, { exact: false })).toBeVisible();
    expect(within(question).getByText("Not quite.")).toBeInTheDocument();
    expect(within(question).getByRole("button", { name: /A Digital Shadow\s*\(correct answer\)/ })).toBeInTheDocument();
    expect(within(question).getByRole("button", { name: /A Digital Twin\s*\(your answer, not correct\)/ })).toBeInTheDocument();
  });

  it("walks the maturity ladder and says which levels are Digital Twins", () => {
    render(<AdvancedTwinPage />);
    const ladder = within(panel("overview")).getByRole("tablist", { name: "Digital Twin maturity levels" });
    expect(within(ladder).getAllByRole("tab")).toHaveLength(7);
    fireEvent.click(within(ladder).getByRole("tab", { name: /Digital Shadow/ }));
    expect(screen.getByText(/Level 3 — Digital Shadow/)).toBeVisible();
    expect(calls("digital_twin_architecture_opened")).toHaveLength(1);
  });

  it("selects a pressure sensor and follows it from the transducer to a statement about health", () => {
    render(<AdvancedTwinPage />);
    open("Pressure");
    fireEvent.click(within(screen.getByRole("group", { name: "Pressure sensors" })).getByRole("button", { name: /Chamber, sensor A/ }));
    const detail = screen.getByRole("complementary", { name: "Chamber pressure, sensor A: measurement detail" });
    const chain = within(detail).getByRole("list", { name: "From the sensor to a statement about health" });
    expect(within(chain).getAllByRole("listitem").map((li) => li.querySelector("span")?.textContent)).toEqual(["Physical sensor", "Raw signal", "Conditioned measurement", "Engineering value", "Digital Twin state", "Residual", "Health interpretation"]);
    for (const label of ["OBSERVED", "ESTIMATED", "EXPECTED", "RESIDUAL", "STATUS"]) expect(within(detail).getByText(label)).toBeInTheDocument();
    expect(within(detail).getByText(/PREDICTED/)).toBeInTheDocument();
    expect(within(detail).getAllByText("REFERENCE VALUE").length).toBeGreaterThan(0);
    expect(calls("pressure_sensor_selected")).toEqual([["pressure_sensor_selected", { experience: "advanced_propulsion_twin", sensor: "pc_a" }]]);
    fireEvent.click(within(detail).getByRole("button", { name: "Close measurement detail" }));
    expect(screen.queryByRole("complementary", { name: /measurement detail/ })).not.toBeInTheDocument();
  });

  it("traces the pressure path from tank to environment, reporting its start and its completion", () => {
    render(<AdvancedTwinPage />);
    open("Pressure");
    const controls = within(screen.getByText("One pressure path · oxidiser side").parentElement as HTMLElement);
    fireEvent.click(controls.getByRole("button", { name: "Trace the pressure path" }));
    expect(calls("pressure_path_started")).toHaveLength(1);
    expect(screen.getByText(PRESSURE_PATH[0].text)).toBeVisible();
    expect(screen.getByText(PRESSURE_PATH[3].text)).not.toBeVisible();
    for (let i = 1; i < PRESSURE_PATH.length; i++) fireEvent.click(controls.getByRole("button", { name: "Next" }));
    expect(screen.getByText(PRESSURE_PATH.at(-1)!.text)).toBeVisible();
    expect(controls.getByText(/path complete/)).toBeInTheDocument();
    expect(calls("pressure_path_completed")).toHaveLength(1);
    expect(PRESSURE_PATH.map((s) => s.label)).toEqual(["Tank pressure", "Pump inlet pressure", "Pump", "Pump discharge pressure", "Valve and line losses", "Injector inlet pressure", "Injector ΔP", "Chamber pressure", "Nozzle throat", "Nozzle exit", "Environment"]);
  });

  it("changes the diagnosis as supporting evidence is added: one measurement does not decide", () => {
    render(<AdvancedTwinPage />);
    open("Twin");
    const output = screen.getByRole("status", { name: "Ranked probable causes" });
    expect(within(output).getByText(/No candidate stands out/)).toBeInTheDocument();
    expect(within(output).getByText(/2 of 14 measurements checked/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /plus normal pump discharge, abnormal valve position, reduced flow/ }));
    expect(within(output).getByText(/Main fuel valve restriction/, { selector: "p" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sensors A and B disagree, thrust unchanged" }));
    expect(within(output).getByText(/Chamber pressure sensor A drift/, { selector: "p" })).toBeInTheDocument();
  });

  it("shows, for each branch of the fault tree, the evidence that raises and lowers confidence", () => {
    render(<AdvancedTwinPage />);
    open("FDIR");
    const causes = screen.getByRole("list", { name: "Possible causes of low chamber pressure" });
    expect(within(causes).getAllByRole("button").map((b) => b.textContent?.replace("→ ", ""))).toEqual(["Low feed pressure", "Degraded pump performance", "Valve restriction", "Flow reduction", "Injector restriction", "Combustion-performance issue", "Sensor bias / drift"]);
    fireEvent.click(within(causes).getByRole("button", { name: /Sensor bias \/ drift/ }));
    const evidence = screen.getByRole("region", { name: "Evidence for Sensor bias / drift" });
    expect(within(evidence).getByText("Chamber sensors A and B disagree")).toBeInTheDocument();
    expect(within(evidence).getByText("Both chamber sensors and the thrust proxy falling together.")).toBeInTheDocument();
    expect(calls("diagnosis_opened").at(-1)).toEqual(["diagnosis_opened", { experience: "advanced_propulsion_twin", fault: "pc_sensor_drift" }]);
  });

  it("explores the knowledge graph from the chamber pressure sensor", () => {
    render(<AdvancedTwinPage />);
    open("Architecture");
    const graph = panel("architecture");
    expect(within(graph).getByText("Chamber pressure sensor A", { selector: "p" })).toBeInTheDocument();
    fireEvent.click(within(graph).getByRole("button", { name: "Chamber pressure sensor drift" }));
    expect(within(graph).getByText("FAILURE MODE")).toBeInTheDocument();
    expect(within(graph).getByRole("button", { name: "Back to Chamber pressure sensor A" })).toBeInTheDocument();
  });

  it("scores readiness by the weakest category and never as a certification", () => {
    render(<AdvancedTwinPage />);
    open("Health");
    const health = panel("health");
    expect(within(health).getByText(/Level 1 of 4: Conceptual/)).toBeInTheDocument();
    expect(within(health).getByText(/not a certification/)).toBeInTheDocument();
    fireEvent.click(within(health).getByRole("button", { name: "Assess your own programme" }));
    for (const slider of within(health).getAllByRole("slider")) fireEvent.change(slider, { target: { value: "3" } });
    expect(within(health).getByText(/Level 3 of 4: Calibrated on the asset/)).toBeInTheDocument();
  });

  it("tracks the 12 weeks: opening and completing a week is reported and remembered", () => {
    render(<AdvancedTwinPage />);
    open("12 Weeks");
    const weeks = panel("weeks");
    fireEvent.click(within(weeks).getByRole("button", { name: /Week 8\s*State Estimation/ }));
    expect(calls("week_module_opened")).toEqual([["week_module_opened", { experience: "advanced_propulsion_twin", week: "week_8" }]]);
    const body = document.getElementById("week-8") as HTMLElement;
    fireEvent.click(within(body).getByRole("button", { name: "Mark week complete" }));
    expect(calls("week_module_completed")).toEqual([["week_module_completed", { experience: "advanced_propulsion_twin", week: "week_8" }]]);
    expect(within(weeks).getByText(/1 of 12 weeks marked complete/)).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(WEEKS_STORAGE_KEY) ?? "[]")).toEqual([8]);
    fireEvent.click(within(body).getByRole("button", { name: /Study: Twin module/ }));
    expect(panel("twin")).not.toHaveAttribute("hidden");
  });

  it("offers the 3D engineering mode only where it can run, and tells a phone so", () => {
    render(<AdvancedTwinPage />);
    open("System");
    // jsdom is a small screen with no WebGL.
    expect(within(panel("system")).getByText("USE DESKTOP / LAPTOP FOR ADVANCED 3D ENGINEERING MODE")).toBeInTheDocument();
    expect(within(panel("system")).queryByRole("button", { name: "Enter 3D Engineering Mode" })).not.toBeInTheDocument();
    fireEvent.click(within(panel("system")).getByRole("button", { name: "Regenerative Cooling" }));
    expect(within(panel("system")).getByText(/Regenerative Cooling: the rest of the system is dimmed/)).toBeInTheDocument();
  });
});

describe("the shared simulated twin", () => {
  it("is fetched only when asked for, then injects, detects and reports a fault", async () => {
    render(<AdvancedTwinPage />);
    expect(useLabStore.getState().engine).toBeNull();
    await act(async () => {
      await useLabStore.getState().boot();
    });
    const store = useLabStore.getState();
    expect(store.engine).not.toBeNull();
    expect(store.snapshot?.status.health).toBe("NOMINAL");
    act(() => {
      store.inject("valve_restriction");
      for (let i = 0; i < 16; i++) store.step();
    });
    const snapshot = useLabStore.getState().snapshot!;
    expect(snapshot.faults.map((f) => f.id)).toEqual(["valve_restriction"]);
    expect(snapshot.anomaly).toBe(true);
    expect(snapshot.ranking[0].id).toBe("valve_restriction");
    expect(calls("fault_injected")).toEqual([["fault_injected", { experience: "advanced_propulsion_twin", fault: "valve_restriction" }]]);
    expect(calls("fault_detected")).toEqual([["fault_detected", { experience: "advanced_propulsion_twin", fault: "valve_restriction" }]]);
    act(() => useLabStore.getState().resetSimulation());
    expect(useLabStore.getState().snapshot?.faults).toHaveLength(0);
  });

  it("sends analytics nothing but fixed ids: no telemetry values, no free text", async () => {
    render(<AdvancedTwinPage />);
    await act(async () => {
      await useLabStore.getState().boot();
    });
    act(() => {
      useLabStore.getState().inject("pump_degradation");
      for (let i = 0; i < 20; i++) useLabStore.getState().step();
    });
    open("Pressure");
    for (const [, params] of trackEvent.mock.calls) {
      for (const value of Object.values(params as Record<string, unknown>)) expect(value).toMatch(/^[a-z0-9_]{1,64}$/);
    }
  });
});
