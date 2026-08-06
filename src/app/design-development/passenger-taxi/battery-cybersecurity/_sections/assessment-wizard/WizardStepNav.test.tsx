import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WizardStepNav } from "./WizardStepNav";

const steps = [
  { id: "welcome", label: "Welcome" },
  { id: "aircraft-profile", label: "Aircraft" },
  { id: "report", label: "Report" },
];

describe("WizardStepNav", () => {
  it("marks the current step selected", () => {
    render(<WizardStepNav steps={steps} currentId="aircraft-profile" completedIds={new Set()} onSelect={() => {}} />);
    expect(screen.getByRole("tab", { name: /Aircraft/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Welcome/ })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onSelect when a step is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<WizardStepNav steps={steps} currentId="welcome" completedIds={new Set()} onSelect={onSelect} />);
    await user.click(screen.getByRole("tab", { name: /Report/ }));
    expect(onSelect).toHaveBeenCalledWith("report");
  });

  it("moves focus with ArrowRight, wrapping at the end", async () => {
    const user = userEvent.setup();
    render(<WizardStepNav steps={steps} currentId="report" completedIds={new Set()} onSelect={() => {}} />);
    screen.getByRole("tab", { name: /Report/ }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Welcome/ })).toHaveFocus();
  });

  it("only the active tab is in the natural tab order", () => {
    render(<WizardStepNav steps={steps} currentId="welcome" completedIds={new Set()} onSelect={() => {}} />);
    expect(screen.getByRole("tab", { name: /Welcome/ })).toHaveAttribute("tabIndex", "0");
    expect(screen.getByRole("tab", { name: /Report/ })).toHaveAttribute("tabIndex", "-1");
  });
});
