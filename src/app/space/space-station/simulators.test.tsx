import { describe, expect, it } from "vitest";
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

  it("anatomy selection updates the detail panel via keyboard", async () => {
    const user = userEvent.setup();
    inMode(<StationAnatomy />);
    const radiators = screen.getByRole("button", { name: "Radiators" });
    radiators.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "Radiators", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Redundancy philosophy")).toBeInTheDocument();
  });

  it("emergency simulator steps through response phases", async () => {
    const user = userEvent.setup();
    inMode(<FailureSimulator />);
    await user.click(screen.getByRole("button", { name: "Next phase" }));
    expect(screen.getByText("Phase 2 of 7")).toBeInTheDocument();
  });
});
