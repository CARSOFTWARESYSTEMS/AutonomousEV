import { describe, expect, it, vi } from "vitest";

// Overlays import the page fonts; next/font is not available under Vitest.
vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModeProvider } from "./components/ModeProvider";
import PowerSimulator from "./components/PowerSimulator";
import StationDesigner from "./components/StationDesigner";
import StationDigitalTwin from "./components/StationDigitalTwin";
import DockingSimulator from "./components/DockingSimulator";
import ECLSSSimulator from "./components/ECLSSSimulator";
import ThermalSimulator from "./components/ThermalSimulator";
import OrbitSimulator from "./components/OrbitSimulator";
import CrewDaySimulator from "./components/CrewDaySimulator";
import ExperimentDesigner from "./components/ExperimentDesigner";
import ResearchQuestionGenerator from "./components/ResearchQuestionGenerator";
import StationAnatomy from "./components/StationAnatomy";
import FailureSimulator from "./components/FailureSimulator";
import PurposeExplorer from "./components/PurposeExplorer";
import ResearchFrontier from "./components/ResearchFrontier";
import ResearchLibrary from "./components/ResearchLibrary";

const inMode = (ui: React.ReactNode, initial: "learn" | "engineering" | "research" = "learn") => render(<ModeProvider initial={initial}>{ui}</ModeProvider>);

describe("simulators", () => {
  it("every simulator frame labels itself as an educational model and exposes transparency", () => {
    for (const C of [PowerSimulator, OrbitSimulator, DockingSimulator, ECLSSSimulator, ThermalSimulator, StationDigitalTwin, StationDesigner, ExperimentDesigner]) {
      const { unmount } = inMode(<C />);
      expect(screen.getByText("Educational model — not mission design data.")).toBeInTheDocument();
      expect(screen.getByText(/Show engineering: assumptions, equations, limitations/)).toBeInTheDocument();
      for (const h of ["Assumptions", "Equations", "Limitations", "Source"]) expect(screen.getByRole("heading", { name: h, level: 4 })).toBeInTheDocument();
      unmount();
    }
  });

  it("Simple | Engineering view follows the page mode and can be overridden", async () => {
    const user = userEvent.setup();
    inMode(<PowerSimulator />, "learn");
    const view = screen.getByRole("group", { name: "Power Simulator view" });
    expect(within(view).getByRole("button", { name: "Simple" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText(/Array area needed to balance this orbit/)).not.toBeInTheDocument();
    await user.click(within(view).getByRole("button", { name: "Engineering" }));
    expect(screen.getByText(/Array area needed to balance this orbit/)).toBeInTheDocument();
  });

  it("power simulator reacts to degradation with load shedding or a critical warning", () => {
    inMode(<PowerSimulator />);
    expect(screen.getByText(/Energy-positive orbit/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Array degradation"), { target: { value: "0.7" } });
    expect(screen.getByText(/Critical-load warning|Research loads shed/)).toBeInTheDocument();
  });

  it("station designer shows the conceptual label and flags risks", () => {
    inMode(<StationDesigner />);
    expect(screen.getAllByText(/Conceptual educational system model/).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText("Crew"), { target: { value: "12" } });
    fireEvent.change(screen.getByLabelText("Modules"), { target: { value: "2" } });
    expect(screen.getByText(/Habitable volume below the long-duration guideline/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Concept architecture/ })).toBeInTheDocument();
  });

  it("digital twin cascades from solar degradation to experiment interruption", async () => {
    const user = userEvent.setup();
    inMode(<StationDigitalTwin />);
    expect(screen.getByText("No failures injected. All subsystems nominal.")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Solar array degraded 30%"));
    await user.click(screen.getByLabelText("Research payload draws excess power"));
    expect(screen.getByText(/load shedding: research loads cut/)).toBeInTheDocument();
    expect(screen.getByText(/Experiment interruption/)).toBeInTheDocument();
    // Health is conveyed by text as well as colour.
    expect(screen.getAllByText(/^(Caution|Warning)$/).length).toBeGreaterThan(0);
  });

  it("docking simulator starts ready with all eight stages listed", () => {
    inMode(<DockingSimulator />);
    const stages = screen.getByRole("list", { name: "Docking stages" });
    expect(within(stages).getAllByRole("listitem")).toHaveLength(8);
    expect(screen.getByRole("button", { name: /Start approach/ })).toBeInTheDocument();
  });

  it("life-support simulator labels numbers as approximations and compares architectures", () => {
    inMode(<ECLSSSimulator />, "engineering");
    expect(screen.getByText("All numbers are educational approximations.")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Life-support architecture" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Open loop: .* kg; Partially closed/ })).toBeInTheDocument();
  });

  it("thermal simulator teaches the vacuum heat-rejection principle", () => {
    inMode(<ThermalSimulator />);
    expect(screen.getByText("Getting rid of heat in vacuum is a major spacecraft engineering problem.")).toBeInTheDocument();
  });

  it("crew day switches mission profiles", async () => {
    const user = userEvent.setup();
    inMode(<CrewDaySimulator />);
    await user.click(screen.getByRole("button", { name: "Docking Day" }));
    expect(screen.getByText(/A visiting vehicle arrives/)).toBeInTheDocument();
  });

  it("experiment designer distinguishes concept from flight qualification", () => {
    inMode(<ExperimentDesigner />);
    for (const s of ["Concept", "Laboratory prototype", "Ground validation", "Safety review", "Flight qualification", "Integration", "Operations", "Data analysis"]) {
      expect(screen.getByRole("heading", { name: s, level: 4 })).toBeInTheDocument();
    }
  });

  it("question generator produces search-only resources", () => {
    const { container } = inMode(<ResearchQuestionGenerator />);
    expect(screen.getByText("Research problem")).toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/doi\.org/);
  });

  it("anatomy hotspots select components by keyboard and show a tabbed inspector", async () => {
    const user = userEvent.setup();
    const { container } = inMode(<StationAnatomy />);
    expect(screen.getByText("Generic teaching architecture — not a model of any real station.")).toBeInTheDocument();
    const radiators = screen.getByRole("button", { name: "3. Radiators" });
    radiators.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "Radiators", level: 3 })).toBeInTheDocument();
    expect(container.querySelector('[data-part="radiators"]')?.getAttribute("class")).toMatch(/selected/);
    await user.click(screen.getByRole("tab", { name: "Engineering" }));
    expect(screen.getByText("Redundancy philosophy")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Research" }));
    expect(screen.getByText("Open research questions")).toBeInTheDocument();
  });

  it("anatomy interior and system-flow views de-emphasise unrelated components", async () => {
    const user = userEvent.setup();
    const { container } = inMode(<StationAnatomy />);
    await user.click(screen.getByRole("button", { name: "Interior" }));
    expect(screen.getByRole("button", { name: "4. Pressurised laboratory" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "System flow" }));
    for (const [flow, first] of [["Power", "Solar arrays"], ["Thermal", "Heat sources"], ["Data", "Payloads"], ["Life support", "Crew outputs"]] as const) {
      await user.click(within(screen.getByRole("group", { name: "System flow" })).getByRole("button", { name: flow }));
      expect(screen.getByText(first)).toBeInTheDocument();
    }
    // Life support: unrelated hardware such as the solar arrays is dimmed.
    expect(container.querySelector('[data-part="arrays"]')?.getAttribute("class")).toMatch(/dim/);
    expect(screen.getByText(/only partly closed/)).toBeInTheDocument();
  });

  it("purpose explorer groups every purpose under six domains and cross-links related domains", async () => {
    const user = userEvent.setup();
    inMode(<PurposeExplorer />);
    const domains = screen.getAllByRole("radio");
    expect(domains).toHaveLength(6);
    expect(domains[0]).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", { name: /Orbital Industry/ }));
    expect(screen.getByRole("heading", { name: "Orbital Industry & Commercial Research", level: 3 })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Space Manufacturing" }));
    expect(screen.getByText("Also relevant to")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Microgravity Science" }));
    expect(screen.getByRole("radio", { name: /Microgravity Science/ })).toHaveAttribute("aria-checked", "true");
    screen.getByRole("radio", { name: /Microgravity Science/ }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: /Human Health/ })).toHaveFocus();
  });

  it("digital twin inspector shows the selected subsystem and marks injected failures", async () => {
    const user = userEvent.setup();
    inMode(<StationDigitalTwin />);
    await user.click(screen.getByLabelText("Cooling loop degraded"));
    await user.click(screen.getByRole("button", { name: /^Thermal:/ }));
    expect(screen.getByRole("heading", { name: "Thermal", level: 4 })).toBeInTheDocument();
    expect(screen.getByText(/failure injected here/)).toBeInTheDocument();
    expect(screen.getByText("Heat load / rejection")).toBeInTheDocument();
  });

  it("research frontier filters the topic list and library filters by organisation", async () => {
    const user = userEvent.setup();
    const { unmount } = inMode(<ResearchFrontier />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Filter research themes" }), { target: { value: "radiation" } });
    const nav = screen.getByRole("navigation", { name: "Research themes" });
    expect(within(nav).getAllByRole("button").length).toBeLessThan(22);
    await user.click(within(nav).getByRole("button", { name: /Radiation mitigation/ }));
    expect(screen.getByRole("heading", { name: "Radiation mitigation", level: 3 })).toBeInTheDocument();
    unmount();
    inMode(<ResearchLibrary />);
    expect(screen.getAllByRole("listitem").length).toBe(16);
    await user.click(screen.getByRole("button", { name: "JAXA" }));
    expect(screen.getAllByRole("listitem").every((li) => /JAXA/.test(li.textContent ?? ""))).toBe(true);
  });

  it("emergency simulator steps through response phases", async () => {
    const user = userEvent.setup();
    inMode(<FailureSimulator />);
    await user.click(screen.getByRole("button", { name: "Next phase" }));
    expect(screen.getByText("Phase 2 of 7")).toBeInTheDocument();
  });

  it("wizards step through inputs and show the result on the final step", async () => {
    const user = userEvent.setup();
    inMode(<ExperimentDesigner />);
    const progress = screen.getByRole("list", { name: "Experiment designer progress" });
    expect(within(progress).getAllByRole("button")).toHaveLength(5);
    expect(screen.getByText("Step 1 of 5 · Research area")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Step 2 of 5 · Experiment requirements")).toBeInTheDocument();
    await user.click(within(progress).getByRole("button", { name: /Step 5 of 5/ }));
    expect(screen.getByText(/Conceptual educational experiment design — not flight qualification/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start over/ })).toBeInTheDocument();
  });

  it("digital twin failure sheet injects scenarios on phones", async () => {
    const user = userEvent.setup();
    inMode(<StationDigitalTwin />);
    await user.click(screen.getByRole("button", { name: /Inject failure/ }));
    const sheet = screen.getByRole("dialog", { name: "Inject failure" });
    await user.click(within(sheet).getByLabelText("Communication loss"));
    await user.click(within(sheet).getByRole("button", { name: "Show cascade" }));
    expect(screen.getByRole("button", { name: /Inject failure \(1 active\)/ })).toBeInTheDocument();
    expect(screen.getByText(/Communication loss → ground loses telemetry/)).toBeInTheDocument();
    const ladder = screen.getByRole("list", { name: /Station systems — tap to inspect/ });
    await user.click(within(ladder).getByRole("button", { name: /Communications/ }));
    expect(screen.getByRole("dialog", { name: "Communications inspector" })).toBeInTheDocument();
  });
});
