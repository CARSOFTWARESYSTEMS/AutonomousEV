import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const trackEvent = vi.hoisted(() => vi.fn());
vi.mock("@/utils/analytics", () => ({ trackEvent }));

import { trackAqip } from "./analytics";
import { NINETY_DAY, RISKS } from "./data/execution";
import { GRAPH_EDGES, GRAPH_NODES, NODE_BY_ID, relationsOf } from "./data/graph";
import { PROBLEMS } from "./data/problems";
import { MATURITY_MATRIX, MODULES, SIM_STEPS } from "./data/product";
import { CHAPTERS, ECOSYSTEM, FAQ, GLOSSARY, HEADER_NAV, NAV } from "./data/reference";
import { ROADMAP } from "./data/roadmap";
import AqipHeader from "./interactive/AqipHeader";
import Chapter from "./interactive/Chapter";
import ChapterNav from "./interactive/ChapterNav";
import CustomerScorecard from "./interactive/CustomerScorecard";
import DecisionFramework from "./interactive/DecisionFramework";
import DigitalThreadSimulator from "./interactive/DigitalThreadSimulator";
import Glossary from "./interactive/Glossary";
import MasterDetail from "./interactive/MasterDetail";
import MobileDisclosure from "./interactive/MobileDisclosure";
import NinetyDayChecklist, { STORAGE_KEY } from "./interactive/NinetyDayChecklist";
import { VIEW_MODE_KEY, resetPageState, setActiveSection, setChapterOpen } from "./interactive/pageState";
import PolicyAsCode from "./interactive/PolicyAsCode";
import QualityGraph from "./interactive/QualityGraph";
import RoadmapExplorer from "./interactive/RoadmapExplorer";
import RoiCalculator from "./interactive/RoiCalculator";
import Runtime from "./interactive/Runtime";
import ViewControls from "./interactive/ViewControls";
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
  act(() => resetPageState());
  window.history.replaceState(null, "", "/");
  vi.mocked(Element.prototype.scrollIntoView).mockClear();
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
    expect(ROADMAP.map((year) => year.horizon)).toEqual(["target", "target", "target", "vision", "vision"]);
  });

  it("puts every section in exactly one of seven chapters, in page order", () => {
    expect(CHAPTERS.map((chapter) => `${chapter.n} ${chapter.title}`)).toEqual(["01 Strategy", "02 Product", "03 Roadmap", "04 Customer", "05 Business", "06 Leadership & Execution", "07 Reference"]);
    expect(CHAPTERS.flatMap((chapter) => chapter.sections)).toEqual(NAV.map((item) => item.id));
    for (const item of HEADER_NAV) expect(NAV.map((section) => section.id)).toContain(item.target);
  });

  it("names four ecosystem destinations, with UFlight at the address the project already uses", () => {
    expect(ECOSYSTEM.map((entity) => [entity.name, entity.href, entity.external])).toEqual([
      ["EV.ENGINEER™", "/", false],
      ["UFlight™", "https://www.uflight.in/", true],
      ["EV Society™", "https://www.evsociety.org/", true],
      ["iTelematics® Software Private Limited", "https://itelematics.com/", true],
    ]);
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
  it("keeps all five years in the document and updates the platform scope on selection", async () => {
    const user = userEvent.setup();
    render(<RoadmapExplorer />);
    expect(screen.getAllByRole("article")).toHaveLength(5);
    expect(screen.getAllByText("Customer phase")).toHaveLength(5);
    expect(screen.getAllByText("Company phase")).toHaveLength(5);
    expect(screen.getAllByText("Long-term vision")).toHaveLength(2);
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

    expect(screen.getAllByRole("group").map((group) => within(group).getByText(/./, { selector: "legend" }).textContent)).toEqual(["Current Process", "Improvement Assumptions", "Commercial Estimate"]);
    const fais = screen.getByLabelText("First article inspections");
    expect(fais).toHaveAccessibleDescription("FAIs / month");
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
    const cost = screen.getByLabelText("Software cost");
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

describe("AqipHeader", () => {
  it("carries AQIP's own identity, seven destinations, the Ecosystem menu and one action", () => {
    render(<AqipHeader />);
    const header = screen.getByRole("banner");
    expect(within(header).getByRole("link", { name: /^AQIP: Aerospace Quality Intelligence Platform/ })).toHaveAttribute("href", "#top");
    const nav = within(header).getByRole("navigation", { name: "AQIP" });
    expect(within(nav).getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Strategy", "#overview"],
      ["Product", "#product"],
      ["Roadmap", "#roadmap"],
      ["Customers", "#customers"],
      ["Business", "#business"],
      ["Leadership", "#leadership"],
      ["Execution", "#execution"],
    ]);
    expect(within(nav).getByRole("button", { name: "Ecosystem" })).toHaveAttribute("aria-expanded", "false");
    expect(within(header).getByRole("link", { name: "Discuss AQIP" })).toHaveAttribute("href", "/consulting");
    // Nothing of the site-wide EV.ENGINEER navbar.
    expect(within(header).queryByRole("link", { name: /Training|Consulting$|Gallery|EV Career/ })).toBeNull();
    expect(header.querySelectorAll("h1, h2, h3")).toHaveLength(0);
  });

  it("marks the destination the reader is in, and none while in the reference chapter", () => {
    render(<AqipHeader />);
    const link = (name: string) => within(screen.getByRole("navigation", { name: "AQIP" })).getByRole("link", { name });
    expect(link("Strategy")).toHaveAttribute("aria-current", "location");
    act(() => setActiveSection("risks"));
    expect(link("Execution")).toHaveAttribute("aria-current", "location");
    expect(link("Strategy")).not.toHaveAttribute("aria-current");
    act(() => setActiveSection("reference"));
    expect(screen.getByRole("navigation", { name: "AQIP" }).querySelectorAll("[aria-current]")).toHaveLength(0);
  });

  it("jumps to a destination and reports which one", async () => {
    const user = userEvent.setup();
    render(
      <>
        <AqipHeader />
        <section id="roadmap" tabIndex={-1} />
      </>,
    );
    await user.click(within(screen.getByRole("navigation", { name: "AQIP" })).getByRole("link", { name: "Roadmap" }));
    expect(document.getElementById("roadmap")!.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(window.location.hash).toBe("#roadmap");
    expect(eventParams("aqip_header_nav_click")).toEqual([{ item: "roadmap" }]);
  });
});

describe("Ecosystem menu", () => {
  const open = async (user: ReturnType<typeof userEvent.setup>) => {
    const button = screen.getByRole("button", { name: "Ecosystem" });
    await user.click(button);
    return { button, panel: document.getElementById(button.getAttribute("aria-controls")!)! };
  };

  it("opens on click and lists the four names, each with its purpose and where it leads", async () => {
    const user = userEvent.setup();
    render(<AqipHeader />);
    const { button, panel } = await open(user);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(panel).toBeVisible();
    const links = within(panel).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/", "https://www.uflight.in/", "https://www.evsociety.org/", "https://itelematics.com/"]);
    expect(links[0]).not.toHaveAttribute("target");
    for (const link of links.slice(1)) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.textContent).toContain("(opens in a new tab)");
    }
    expect(links[1]).toHaveTextContent("UFlight™Advanced health monitoring systems for aerospace and autonomous platforms.");
    expect(links.map((link) => [link.getAttribute("data-track-event"), link.getAttribute("data-track-destination")])).toEqual([
      ["aqip_ecosystem_link_click", "ev-engineer"],
      ["aqip_ecosystem_link_click", "uflight"],
      ["aqip_ecosystem_link_click", "ev-society"],
      ["aqip_ecosystem_link_click", "itelematics"],
    ]);
    expect(panel.textContent).toContain("These are separate names with different roles.");
    expect(events()).toContain("aqip_ecosystem_menu_open");
  });

  it("closes on Escape and returns focus to its button, and closes on a press outside", async () => {
    const user = userEvent.setup();
    render(
      <>
        <AqipHeader />
        <p>Elsewhere</p>
      </>,
    );
    const { button, panel } = await open(user);
    await user.keyboard("{Escape}");
    expect(panel).not.toBeVisible();
    expect(button).toHaveFocus();
    await user.click(button);
    expect(panel).toBeVisible();
    await user.click(screen.getByText("Elsewhere"));
    expect(panel).not.toBeVisible();
  });

  it("is reachable and operable from the keyboard alone", async () => {
    const user = userEvent.setup();
    render(<AqipHeader />);
    const button = screen.getByRole("button", { name: "Ecosystem" });
    button.focus();
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.tab();
    expect(document.activeElement).toHaveAttribute("href", "/");
  });
});

describe("Phone menu", () => {
  it("opens as a dialog with AQIP's sections, the ecosystem and contact, and locks the page behind it", async () => {
    const user = userEvent.setup();
    render(<AqipHeader />);
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(screen.getByRole("button", { name: "Close" })).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("dialog", { name: "AQIP menu" });
    expect(menu).toHaveAttribute("aria-modal", "true");
    expect(within(within(menu).getByRole("navigation", { name: "AQIP sections" })).getAllByRole("link").map((link) => link.textContent)).toEqual(["Strategy", "Product", "Roadmap", "Customers", "Business", "Leadership", "Execution"]);
    for (const name of ["EV.ENGINEER™", "UFlight™", "EV Society™", "iTelematics® Software Private Limited"]) expect(within(menu).getByText(name)).toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: "Discuss AQIP" })).toHaveAttribute("href", "/consulting");
    expect(within(menu).getByRole("link", { name: "Explore a Pilot" })).toHaveAttribute("href", "/contact");
    expect(document.body.style.overflow).toBe("hidden");
    expect(within(menu).getByRole("link", { name: "Strategy" })).toHaveFocus();
    expect(events()).toContain("aqip_mobile_menu_open");
  });

  it("closes on Escape, restores scrolling and returns focus to the button", async () => {
    const user = userEvent.setup();
    render(<AqipHeader />);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
    expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
  });

  it("keeps Tab inside the menu, and closes when a section is chosen", async () => {
    const user = userEvent.setup();
    render(
      <>
        <AqipHeader />
        <section id="business" tabIndex={-1} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Menu" }));
    const menu = screen.getByRole("dialog");
    const links = within(menu).getAllByRole("link");
    links[links.length - 1].focus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await user.click(within(menu).getByRole("link", { name: "Business" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.getElementById("business")!.scrollIntoView).toHaveBeenCalled();
  });
});

describe("ChapterNav", () => {
  const nav = () => screen.getByRole("navigation", { name: "Chapters and sections" });
  const toggle = () => within(nav()).getAllByRole("button")[0];

  it("names the current chapter and section, and lists only that chapter's sections beside it", () => {
    render(<ChapterNav />);
    expect(toggle()).toHaveTextContent("Jump to section01StrategyOverview");
    expect(within(within(nav()).getByRole("list", { name: "Sections in Strategy" })).getAllByRole("link").map((link) => link.textContent)).toEqual(["Overview", "Opportunity", "Problems"]);
    act(() => setActiveSection("validation"));
    expect(toggle()).toHaveTextContent("04CustomerValidation");
    const sections = within(within(nav()).getByRole("list", { name: "Sections in Customer" })).getAllByRole("link");
    expect(sections.map((link) => link.textContent)).toEqual(["Customers", "Validation", "Go-To-Market"]);
    expect(sections[1]).toHaveAttribute("aria-current", "location");
    expect(events()).toEqual(["aqip_page_view", "aqip_section_view", "aqip_section_view"]);
  });

  it("opens the full contents: seven chapters and their seventeen sections", async () => {
    const user = userEvent.setup();
    render(<ChapterNav />);
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle());
    const contents = document.getElementById(toggle().getAttribute("aria-controls")!)!;
    expect(contents).toBeVisible();
    const chapters = within(contents).getAllByRole("listitem").filter((item) => item.parentElement === contents.querySelector("ol"));
    expect(chapters).toHaveLength(7);
    expect(chapters.map((chapter) => within(chapter).getAllByRole("link").length - 1)).toEqual([3, 2, 1, 3, 2, 5, 1]);
    await user.keyboard("{Escape}");
    expect(contents).not.toBeVisible();
    expect(toggle()).toHaveFocus();
  });

  it("jumps to a chosen section or chapter, closes the contents and reports the choice", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ChapterNav />
        <section id="risks" tabIndex={-1} />
        <section id="product" tabIndex={-1} />
      </>,
    );
    await user.click(toggle());
    const contents = document.getElementById(toggle().getAttribute("aria-controls")!)!;
    await user.click(within(contents).getByRole("link", { name: "Risks" }));
    expect(document.getElementById("risks")!.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(document.getElementById("risks")).toHaveFocus();
    expect(contents).not.toBeVisible();
    expect(eventParams("aqip_strategy_nav_click")).toEqual([{ section: "risks" }]);

    await user.click(toggle());
    await user.click(within(contents).getByRole("link", { name: "02Product" }));
    expect(window.location.hash).toBe("#product");
    expect(eventParams("aqip_chapter_select")).toEqual([{ chapter: "chapter-product", source: "index" }]);
  });

  it("does not animate the jump for readers who ask for reduced motion", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList);
    const user = userEvent.setup();
    render(
      <>
        <ChapterNav />
        <section id="problems" tabIndex={-1} />
      </>,
    );
    await user.click(within(nav()).getByRole("link", { name: "Problems" }));
    expect(document.getElementById("problems")!.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });
});

describe("Chapter", () => {
  const [strategy, product] = CHAPTERS;

  it("is a labelled region whose sections are always in the document, open or closed", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Chapter chapter={strategy}>
          <p>Strategy sections</p>
        </Chapter>
        <Chapter chapter={product} executive>
          <p>Product sections</p>
        </Chapter>
      </>,
    );
    const region = screen.getByRole("region", { name: "02 Product" });
    expect(region).toHaveAttribute("data-executive");
    expect(within(region).getByText("Product sections")).toBeInTheDocument();
    // The first chapter starts open on a phone; the rest start closed.
    expect(within(screen.getByRole("region", { name: "01 Strategy" })).getByRole("button")).toHaveAttribute("aria-expanded", "true");
    const toggle = within(region).getByRole("button", { name: "Open chapter" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(toggle.getAttribute("aria-controls")!)).not.toHaveAttribute("data-open");
    await user.click(toggle);
    expect(within(region).getByRole("button", { name: "Close chapter" })).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(toggle.getAttribute("aria-controls")!)).toHaveAttribute("data-open");
    expect(eventParams("aqip_chapter_select")).toEqual([{ chapter: "chapter-product", source: "chapter" }]);
  });
});

describe("ViewControls and Runtime", () => {
  const page = () =>
    render(
      <div id="root-under-test" data-mode="full">
        <Runtime rootId="root-under-test" />
        <ViewControls sections={["Vision", "Roadmap"]} />
        <a href="#deep">Go deep</a>
        <Chapter chapter={CHAPTERS[1]}>
          <section id="deep" tabIndex={-1} />
        </Chapter>
        <details>
          <summary>Question</summary>Answer
        </details>
      </div>,
    );
  const root = () => document.getElementById("root-under-test")!;

  it("offers Executive View and the Full Operating Manual, each explained, and applies the choice to the page", async () => {
    const user = userEvent.setup();
    page();
    const executive = screen.getByRole("button", { name: /Executive View/ });
    const full = screen.getByRole("button", { name: /Full Operating Manual/ });
    expect(executive).toHaveTextContent("~10-minute overview");
    expect(full).toHaveTextContent("Complete strategy & execution reference");
    expect(full).toHaveAttribute("aria-pressed", "true");
    await user.click(executive);
    expect(root()).toHaveAttribute("data-mode", "executive");
    expect(screen.getByText("Executive View: Vision, Roadmap.")).toBeInTheDocument();
    await user.click(full);
    expect(root()).toHaveAttribute("data-mode", "full");
    expect(eventParams("aqip_view_mode")).toEqual([{ mode: "executive" }, { mode: "full" }]);
  });

  it("remembers the view in this browser, so the next visit starts in it", async () => {
    const user = userEvent.setup();
    const { unmount } = page();
    await user.click(screen.getByRole("button", { name: /Executive View/ }));
    expect(window.localStorage.getItem(VIEW_MODE_KEY)).toBe("executive");
    unmount();
    page();
    expect(screen.getByRole("button", { name: /Executive View/ })).toHaveAttribute("aria-pressed", "true");
    expect(root()).toHaveAttribute("data-mode", "executive");
  });

  it("opens and closes every chapter at once", async () => {
    const user = userEvent.setup();
    page();
    const chapter = within(screen.getByRole("region", { name: "02 Product" }));
    expect(chapter.getByRole("button")).toHaveAttribute("aria-expanded", "false");
    await user.click(screen.getByRole("button", { name: "Expand all" }));
    expect(chapter.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Expand all" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Collapse all" }));
    expect(chapter.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the chapter an in-page link points into before scrolling there", async () => {
    const user = userEvent.setup();
    page();
    act(() => setChapterOpen(CHAPTERS[1].id, false));
    await user.click(screen.getByRole("link", { name: "Go deep" }));
    expect(within(screen.getByRole("region", { name: "02 Product" })).getByRole("button")).toHaveAttribute("aria-expanded", "true");
    // The move waits for the newly opened chapter to be laid out.
    await waitFor(() => expect(window.location.hash).toBe("#deep"));
    expect(document.getElementById("deep")!.scrollIntoView).toHaveBeenCalledOnce();
  });

  it("opens every collapsed answer for printing and closes them again afterwards", async () => {
    const print = vi.fn();
    vi.stubGlobal("print", print);
    const user = userEvent.setup();
    page();
    await user.click(screen.getByRole("button", { name: "Print / Executive Brief" }));
    expect(print).toHaveBeenCalledOnce();
    const details = document.querySelector("details")!;
    act(() => {
      window.dispatchEvent(new Event("beforeprint"));
    });
    expect(details.open).toBe(true);
    act(() => {
      window.dispatchEvent(new Event("afterprint"));
    });
    expect(details.open).toBe(false);
    vi.unstubAllGlobals();
  });
});
