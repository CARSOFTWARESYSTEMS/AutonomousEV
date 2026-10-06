import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const trackEvent = vi.hoisted(() => vi.fn());
vi.mock("@/utils/analytics", () => ({ trackEvent }));

import { trackAqip } from "./analytics";
import { NINETY_DAY, RISKS } from "./data/execution";
import { GRAPH_EDGES, GRAPH_NODES, NODE_BY_ID, relationsOf } from "./data/graph";
import { PROBLEMS } from "./data/problems";
import { MATURITY_MATRIX, MODULES, SIM_STEPS } from "./data/product";
import { FAQ, GLOSSARY, NAV } from "./data/reference";
import CustomerScorecard from "./interactive/CustomerScorecard";
import DecisionFramework from "./interactive/DecisionFramework";
import DigitalThreadSimulator from "./interactive/DigitalThreadSimulator";
import Glossary from "./interactive/Glossary";
import MasterDetail from "./interactive/MasterDetail";
import MobileDisclosure from "./interactive/MobileDisclosure";
import NinetyDayChecklist, { STORAGE_KEY } from "./interactive/NinetyDayChecklist";
import PageTools from "./interactive/PageTools";
import PolicyAsCode from "./interactive/PolicyAsCode";
import QualityGraph from "./interactive/QualityGraph";
import RoadmapExplorer from "./interactive/RoadmapExplorer";
import RoiCalculator from "./interactive/RoiCalculator";
import StrategyNav from "./interactive/StrategyNav";
import { SCORE_DIMENSIONS } from "./logic/scorecard";

const events = () => trackEvent.mock.calls.map(([name]) => name as string);
const eventParams = (name: string) => trackEvent.mock.calls.filter(([event]) => event === name).map(([, params]) => params as Record<string, string>);

beforeAll(() => {
  // jsdom implements neither; the widgets call them after a selection.
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo;
});

beforeEach(() => {
  trackEvent.mockClear();
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("content data", () => {
  it("has the counts the brief specifies", () => {
    expect(PROBLEMS.map((problem) => problem.code)).toEqual(["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"]);
    expect(MODULES).toHaveLength(14);
    expect(GRAPH_NODES).toHaveLength(29);
    expect(SIM_STEPS).toHaveLength(8);
    expect(RISKS).toHaveLength(16);
    expect(FAQ).toHaveLength(15);
    expect(GLOSSARY).toHaveLength(24);
    expect(NINETY_DAY.map((phase) => phase.items.length)).toEqual([8, 7, 7]);
    expect(NAV).toHaveLength(17);
  });

  it("connects every graph node, with no edge to a node that does not exist", () => {
    for (const edge of GRAPH_EDGES) {
      expect(NODE_BY_ID.has(edge.from), edge.from).toBe(true);
      expect(NODE_BY_ID.has(edge.to), edge.to).toBe(true);
    }
    for (const node of GRAPH_NODES) expect(relationsOf(node.id).length, node.id).toBeGreaterThan(0);
    expect(NODE_BY_ID.get("characteristic")?.fields).toEqual(["Source Drawing", "Revision", "Zone", "Nominal", "Tolerance", "GD&T", "Criticality", "Inspection Method", "Measurement", "Evidence", "Verifier", "Status"]);
  });

  it("marks only the prototype foundations as available", () => {
    const available = MATURITY_MATRIX.filter((column) => column.status === "available");
    expect(available).toHaveLength(1);
    expect(available[0].items).toEqual(["Engineering drawing viewer", "Manual ballooning workflow", "Digital characteristic table", "AS9102 Form 3-oriented workflow and export foundation"]);
    expect(MATURITY_MATRIX.map((column) => column.status)).toEqual(["available", "development", "planned", "research"]);
  });
});

describe("analytics", () => {
  it("sends fixed ids and drops anything that is not one", () => {
    trackAqip("aqip_section_view", { section: "roadmap" });
    trackAqip("aqip_section_view", { section: "Acme Aerospace Pvt Ltd" });
    trackAqip("aqip_section_view", { section: "₹5,00,000" });
    expect(trackEvent.mock.calls).toEqual([
      ["aqip_section_view", { section: "roadmap" }],
      ["aqip_section_view", {}],
      ["aqip_section_view", {}],
    ]);
  });
});

describe("MasterDetail", () => {
  const items = [
    { id: "one", label: "First" },
    { id: "two", label: "Second" },
  ];
  const panels = [<p key="one">Panel one</p>, <p key="two">Panel two</p>];

  it("keeps every panel in the document and shows the open one", () => {
    render(<MasterDetail label="Things" items={items} panels={panels} />);
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Panel one")).toBeVisible();
    expect(screen.getByText("Panel two")).toBeInTheDocument();
    expect(screen.getByText("Panel two")).not.toBeVisible();
  });

  it("opens another item, reports it, and on a phone closes the open one again", async () => {
    const user = userEvent.setup();
    render(<MasterDetail label="Things" items={items} panels={panels} event="aqip_problem_expand" />);
    const second = screen.getByRole("button", { name: "Second" });
    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Second" })).toBeVisible();
    expect(eventParams("aqip_problem_expand")).toEqual([{ item: "two" }]);
    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "false");
    expect(eventParams("aqip_problem_expand")).toHaveLength(1);
  });

  it("always keeps one panel open in the wide layout", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({ matches: true, media: query }) as MediaQueryList);
    const user = userEvent.setup();
    render(<MasterDetail label="Things" items={items} panels={panels} />);
    const first = screen.getByRole("button", { name: "First" });
    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
  });

  it("is operable from the keyboard", async () => {
    const user = userEvent.setup();
    render(<MasterDetail label="Things" items={items} panels={panels} />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Second" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "true");
  });
});

describe("QualityGraph", () => {
  const view = (container: HTMLElement, name: string) => container.querySelector<HTMLElement>(`[data-view="${name}"]`)!;

  it("draws all 29 entities as buttons and starts on Characteristic with its twelve fields", () => {
    const { container } = render(<QualityGraph />);
    const network = view(container, "network");
    expect(within(network).getAllByRole("button")).toHaveLength(29);
    expect(within(network).getByRole("button", { name: "Characteristic" })).toHaveAttribute("aria-pressed", "true");
    const panel = view(container, "panel");
    expect(within(panel).getByRole("heading", { level: 4, name: "Characteristic" })).toBeInTheDocument();
    for (const field of ["Source Drawing", "Zone", "Nominal", "Tolerance", "Criticality", "Inspection Method", "Verifier", "Status"]) expect(within(panel).getByText(field)).toBeInTheDocument();
    // The edges are decoration: the relationships are spelled out as text.
    expect(network.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(within(panel).getByText("Characteristic is verified by Inspection")).toBeInTheDocument();
  });

  it("selecting an entity updates the panel and reports the node, never free text", async () => {
    const user = userEvent.setup();
    const { container } = render(<QualityGraph />);
    await user.click(within(view(container, "network")).getByRole("button", { name: "Calibration" }));
    const panel = view(container, "panel");
    expect(within(panel).getByRole("heading", { level: 4, name: "Calibration" })).toBeInTheDocument();
    expect(within(panel).getByText("Equipment is covered by Calibration")).toBeInTheDocument();
    expect(eventParams("aqip_quality_graph_interaction")).toEqual([{ node: "calibration", view: "network" }]);
    // A relation in the panel is a way to move on through the graph.
    await user.click(within(panel).getByRole("button", { name: "Equipment" }));
    expect(within(panel).getByRole("heading", { level: 4, name: "Equipment" })).toBeInTheDocument();
  });

  it("offers the tablet view a picker and the selected entity's neighbours", async () => {
    const user = userEvent.setup();
    const { container } = render(<QualityGraph />);
    const focus = view(container, "focus");
    expect(within(focus).getAllByRole("option")).toHaveLength(29);
    await user.selectOptions(within(focus).getByRole("combobox", { name: "Entity" }), "ncr");
    expect(within(focus).getAllByRole("button").map((button) => button.textContent)).toEqual(["Inspection", "CAPA", "Concession"]);
  });

  it("gives phones every entity as an expandable item with its summary in the page", async () => {
    const user = userEvent.setup();
    const { container } = render(<QualityGraph />);
    const explorer = view(container, "explorer");
    expect(within(explorer).getAllByRole("heading", { level: 4 })).toHaveLength(6);
    for (const node of GRAPH_NODES) expect(explorer.textContent).toContain(node.summary);
    // An entity's own toggle carries aria-expanded; the same name can also appear as a relation link.
    const toggle = (name: string) => within(explorer).getAllByRole("button", { name }).find((button) => button.hasAttribute("aria-expanded"))!;
    expect(toggle("Characteristic")).toHaveAttribute("aria-expanded", "true");
    expect(toggle("FAI")).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle("FAI"));
    expect(toggle("FAI")).toHaveAttribute("aria-expanded", "true");
    expect(toggle("Characteristic")).toHaveAttribute("aria-expanded", "false");
  });
});

describe("DigitalThreadSimulator", () => {
  it("fills the synthetic record in step by step and reports start and completion once", async () => {
    const user = userEvent.setup();
    render(<DigitalThreadSimulator />);
    const record = screen.getByLabelText("Record for one characteristic");
    const next = screen.getByRole("button", { name: "Next" });
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    expect(within(record).getAllByText("Pending")).toHaveLength(10);

    await user.click(next);
    expect(screen.getByRole("heading", { level: 4, name: "AI detects characteristics" })).toBeInTheDocument();
    expect(within(record).getByText("AI-proposed, unverified")).toBeInTheDocument();
    await user.click(next);
    expect(within(record).getByText("Human-verified")).toBeInTheDocument();
    expect(within(record).getByText("Ø10.00 ±0.05 mm")).toBeInTheDocument();

    for (let step = 3; step < 8; step += 1) await user.click(next);
    expect(screen.getByText(/Step 8 of 8/)).toBeInTheDocument();
    for (const value of ["CMM", "10.02 mm", "PASS", "VALID", "LINKED", "APPROVED", "COMPLETE"]) expect(within(record).getByText(value)).toBeInTheDocument();
    expect(within(record).queryByText("Pending")).toBeNull();
    expect(next).toBeDisabled();
    expect(events()).toEqual(["aqip_digital_thread_start", "aqip_digital_thread_complete"]);

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText(/Step 1 of 8/)).toBeInTheDocument();
  });

  it("marks each step as completed, current or not started for screen readers", async () => {
    const user = userEvent.setup();
    render(<DigitalThreadSimulator />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    const steps = within(screen.getByRole("list", { name: "Steps of the demonstration" })).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual(expect.arrayContaining(["✓Completed: Drawing uploaded", "2Current: AI detects characteristics", "3Not started: Human verifies"]));
    expect(steps[1]).toHaveAttribute("aria-current", "step");
  });
});

describe("RoadmapExplorer", () => {
  it("keeps all three years in the document and updates the platform scope on selection", async () => {
    const user = userEvent.setup();
    render(<RoadmapExplorer />);
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("Platform scope by the end of Year 1")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Year 3/ }));
    expect(screen.getByRole("button", { name: /Year 3/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Platform scope by the end of Year 3")).toBeInTheDocument();
    expect(screen.getByText("Added in Year 3")).toBeInTheDocument();
    expect(eventParams("aqip_roadmap_year_select")).toEqual([{ year: "year-3" }]);
  });
});

describe("PolicyAsCode", () => {
  it("shows the controls the example rule yields for a critical and a non-critical characteristic", async () => {
    const user = userEvent.setup();
    render(<PolicyAsCode />);
    const outcome = screen.getByLabelText("Controls the rule yields");
    expect(within(outcome).getByText("100%")).toBeInTheDocument();
    await user.click(screen.getByRole("switch"));
    expect(within(outcome).getByText("per approved sampling plan")).toBeInTheDocument();
    expect(within(outcome).getByText("standard inspector")).toBeInTheDocument();
  });
});

describe("RoiCalculator", () => {
  it("starts from labelled defaults and recalculates as values change", async () => {
    const user = userEvent.setup();
    render(<RoiCalculator />);
    const outputs = () => Object.fromEntries(screen.getAllByRole("definition").map((dd) => [dd.previousElementSibling?.textContent, dd.textContent]));
    expect(outputs()).toMatchObject({ "Current annual effort": "1,536 hours", "Potential hours saved": "614 hours", "Indicative payback period": "8.9 months" });

    const fais = screen.getByLabelText("FAIs per month");
    await user.clear(fais);
    await user.type(fais, "16");
    expect(outputs()["Current annual effort"]).toBe("3,072 hours");

    await user.click(screen.getByRole("button", { name: "Reset to illustrative assumptions" }));
    expect(fais).toHaveValue(8);
    expect(outputs()["Current annual effort"]).toBe("1,536 hours");
  });

  it("says when the cost is not recovered", async () => {
    const user = userEvent.setup();
    render(<RoiCalculator />);
    await user.clear(screen.getByLabelText("Expected time reduction"));
    expect(screen.getByText("Not recovered on these assumptions")).toBeInTheDocument();
  });

  it("reports only that the calculator was used, never a value that was typed", async () => {
    const user = userEvent.setup();
    render(<RoiCalculator />);
    const cost = screen.getByLabelText("Annual software cost");
    await user.clear(cost);
    await user.type(cost, "987654");
    await user.tab();
    expect(trackEvent.mock.calls).toEqual([
      ["aqip_roi_calculator_start", {}],
      ["aqip_roi_calculator_complete", {}],
    ]);
    expect(JSON.stringify(trackEvent.mock.calls)).not.toMatch(/\d{3}/);
  });

  it("uses 16px numeric inputs with a label each, so phones do not zoom and the right keypad opens", () => {
    render(<RoiCalculator />);
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs).toHaveLength(7);
    for (const input of inputs) {
      expect(input).toHaveAccessibleName();
      expect(input).toHaveAttribute("inputmode", "decimal");
    }
  });
});

describe("CustomerScorecard", () => {
  it("shows progress until all eleven dimensions are answered, then the pilot-fit band", async () => {
    const user = userEvent.setup();
    render(<CustomerScorecard />);
    expect(screen.getAllByRole("group")).toHaveLength(11);
    expect(screen.getByText(/0 of 11 answered/)).toBeInTheDocument();
    for (const dimension of SCORE_DIMENSIONS) {
      const group = screen.getByRole("group", { name: dimension.label });
      await user.click(within(group).getAllByRole("radio")[3]);
    }
    expect(screen.getByText("VERY HIGH")).toBeInTheDocument();
    expect(eventParams("aqip_scorecard_complete")).toEqual([{ band: "very_high" }]);

    await user.click(screen.getByRole("button", { name: "Reset scorecard" }));
    expect(screen.getByText(/0 of 11 answered/)).toBeInTheDocument();
    expect(screen.getByText(/Nothing you select is stored or sent/)).toBeInTheDocument();
  });
});

describe("DecisionFramework", () => {
  it("moves from DEFER to INVESTIGATE to BUILD as questions are answered yes", async () => {
    const user = userEvent.setup();
    render(<DecisionFramework />);
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes).toHaveLength(6);
    expect(screen.getByText("DEFER")).toBeInTheDocument();
    await user.click(boxes[0]);
    await user.click(boxes[1]);
    expect(screen.getByText("INVESTIGATE")).toBeInTheDocument();
    await user.click(boxes[2]);
    await user.click(boxes[3]);
    expect(screen.getByText("BUILD")).toBeInTheDocument();
  });
});

describe("NinetyDayChecklist", () => {
  it("counts progress, remembers it in this browser only, and clears on request", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<NinetyDayChecklist />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(22);
    expect(screen.getByRole("status")).toHaveTextContent("0 of 22 actions complete");

    await user.click(screen.getByRole("checkbox", { name: "Interview 20 companies" }));
    await user.click(screen.getByRole("checkbox", { name: "Measure ROI" }));
    expect(screen.getByRole("status")).toHaveTextContent("2 of 22 actions complete");
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual({ "d30-interviews": true, "d90-roi": true });
    expect(eventParams("aqip_90_day_interaction")).toEqual([
      { phase: "d30", action: "check" },
      { phase: "d90", action: "check" },
    ]);

    // A later visit starts from what was saved.
    unmount();
    render(<NinetyDayChecklist />);
    expect(screen.getByRole("checkbox", { name: "Interview 20 companies" })).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Clear progress" }));
    expect(screen.getByRole("status")).toHaveTextContent("0 of 22 actions complete");
    expect(screen.getByRole("checkbox", { name: "Interview 20 companies" })).not.toBeChecked();
  });

  it("still works when the browser refuses storage", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage is blocked");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage is blocked");
    });
    const user = userEvent.setup();
    render(<NinetyDayChecklist />);
    await user.click(screen.getByRole("button", { name: "Clear progress" })).catch(() => undefined);
    await user.click(screen.getByRole("checkbox", { name: "Finalise product thesis" }));
    expect(screen.getByRole("checkbox", { name: "Finalise product thesis" })).toBeChecked();
  });
});

describe("Glossary", () => {
  it("lists every term, filters as the reader types and reports no search text", async () => {
    const user = userEvent.setup();
    render(<Glossary terms={GLOSSARY} />);
    expect(screen.getAllByRole("term")).toHaveLength(24);
    await user.type(screen.getByRole("searchbox", { name: "Search the glossary" }), "first article");
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual(["FAI", "FAIR", "AS9102"]);
    expect(screen.getByRole("status")).toHaveTextContent("3 of 24 terms");
    expect(trackEvent.mock.calls).toEqual([["aqip_glossary_search", {}]]);

    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "zzzz");
    expect(screen.getByText("No term matches that search.")).toBeInTheDocument();
  });
});

describe("MobileDisclosure", () => {
  it("exposes the title as plain text and as an expandable control, with the body always in the document", async () => {
    const user = userEvent.setup();
    render(
      <MobileDisclosure title="Channels">
        <p>Founder-led sales</p>
      </MobileDisclosure>,
    );
    expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent("Channels");
    expect(screen.getByText("Founder-led sales")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Channels" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});

describe("StrategyNav", () => {
  it("links to every section, marks the current one and reports the page view", () => {
    render(<StrategyNav items={NAV} />);
    const nav = screen.getByRole("navigation", { name: "Strategy index" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(NAV.map((item) => `#${item.id}`));
    expect(links[0]).toHaveAttribute("aria-current", "location");
    expect(events()).toEqual(["aqip_page_view", "aqip_section_view"]);
  });

  it("moves to a section, focuses it, updates the address and reports the click", async () => {
    const user = userEvent.setup();
    render(
      <>
        <StrategyNav items={NAV} />
        <section id="roadmap" tabIndex={-1} />
      </>,
    );
    const section = document.getElementById("roadmap")!;
    await user.click(screen.getByRole("link", { name: "Roadmap" }));
    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(section).toHaveFocus();
    expect(window.location.hash).toBe("#roadmap");
    expect(eventParams("aqip_strategy_nav_click")).toEqual([{ section: "roadmap" }]);
  });

  it("does not animate the scroll for readers who ask for reduced motion", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList);
    const user = userEvent.setup();
    render(
      <>
        <StrategyNav items={NAV} />
        <section id="risks" tabIndex={-1} />
      </>,
    );
    await user.click(screen.getByRole("link", { name: "Risks" }));
    expect(document.getElementById("risks")!.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });
});

describe("PageTools", () => {
  it("switches the page root between the full manual and Executive Mode", async () => {
    const user = userEvent.setup();
    render(
      <div id="root-under-test" data-mode="full">
        <PageTools rootId="root-under-test" sections={["Vision", "Roadmap"]} />
      </div>,
    );
    const root = document.getElementById("root-under-test")!;
    const executive = screen.getByRole("button", { name: "Executive Mode" });
    expect(executive).toHaveAttribute("aria-pressed", "false");
    await user.click(executive);
    expect(root).toHaveAttribute("data-mode", "executive");
    expect(screen.getByRole("status")).toHaveTextContent("Executive Mode: showing Vision, Roadmap.");
    await user.click(screen.getByRole("button", { name: "Full manual" }));
    expect(root).toHaveAttribute("data-mode", "full");
    expect(eventParams("aqip_view_mode")).toEqual([{ mode: "executive" }, { mode: "full" }]);
  });

  it("opens every collapsed answer for printing and closes them again afterwards", async () => {
    const print = vi.fn();
    vi.stubGlobal("print", print);
    const user = userEvent.setup();
    render(
      <div id="root-under-test">
        <PageTools rootId="root-under-test" sections={[]} />
        <details>
          <summary>Question</summary>Answer
        </details>
      </div>,
    );
    await user.click(screen.getByRole("button", { name: "Print / Executive Brief" }));
    expect(print).toHaveBeenCalledOnce();
    const details = document.querySelector("details")!;
    window.dispatchEvent(new Event("beforeprint"));
    expect(details.open).toBe(true);
    window.dispatchEvent(new Event("afterprint"));
    expect(details.open).toBe(false);
    vi.unstubAllGlobals();
  });
});
