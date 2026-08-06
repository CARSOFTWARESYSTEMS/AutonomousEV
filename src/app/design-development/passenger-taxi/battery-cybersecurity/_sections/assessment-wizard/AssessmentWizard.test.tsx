import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssessmentWizard } from "./AssessmentWizard";

describe("AssessmentWizard", () => {
  it("starts on the Welcome step with no step nav visible", () => {
    render(<AssessmentWizard />);
    expect(screen.getByRole("button", { name: "Start Assessment" })).toBeInTheDocument();
    expect(screen.queryByRole("tablist", { name: "Assessment wizard steps" })).not.toBeInTheDocument();
  });

  it("advances to the Aircraft Profile step after Start, showing the step nav", async () => {
    const user = userEvent.setup();
    render(<AssessmentWizard />);
    await user.click(screen.getByRole("button", { name: "Start Assessment" }));
    expect(screen.getByText("Select Aircraft Profile")).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: "Assessment wizard steps" })).toBeInTheDocument();
  });

  it("can select an aircraft profile and move to the first question step", async () => {
    const user = userEvent.setup();
    render(<AssessmentWizard />);
    await user.click(screen.getByRole("button", { name: "Start Assessment" }));
    await user.click(screen.getByText("Passenger eVTOL"));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Battery Architecture")).toBeInTheDocument();
    expect(screen.getByText(/Is the battery supplier known and documented\?/)).toBeInTheDocument();
  });

  it("answering a question updates its selection state", async () => {
    const user = userEvent.setup();
    const { container } = render(<AssessmentWizard />);
    await user.click(screen.getByRole("button", { name: "Start Assessment" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    const yesInput = container.querySelector<HTMLInputElement>("#supplier-known-Yes")!;
    await user.click(yesInput);
    expect(yesInput).toBeChecked();
  });

  it("reaches the Report step via the step nav and renders the full report with no network calls", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw new Error("fetch should never be called");
    });
    const user = userEvent.setup();
    render(<AssessmentWizard />);
    await user.click(screen.getByRole("button", { name: "Start Assessment" }));
    await user.click(screen.getByRole("tab", { name: /Report/ }));

    expect(screen.getByText("Executive Summary")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "CTO Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Engineer Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export Markdown/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export JSON/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export CSV/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /PDF \(Coming Soon\)/i })).toBeDisabled();

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("shows an Engineer Dashboard when that tab is selected", async () => {
    const user = userEvent.setup();
    render(<AssessmentWizard />);
    await user.click(screen.getByRole("button", { name: "Start Assessment" }));
    await user.click(screen.getByRole("tab", { name: /Report/ }));
    await user.click(screen.getByRole("tab", { name: "Engineer Dashboard" }));
    expect(screen.getByText(/Threat Matrix/)).toBeInTheDocument();
  });

  it("Start a New Assessment resets back to the Welcome step", async () => {
    const user = userEvent.setup();
    render(<AssessmentWizard />);
    await user.click(screen.getByRole("button", { name: "Start Assessment" }));
    await user.click(screen.getByRole("tab", { name: /Report/ }));
    await user.click(screen.getByRole("button", { name: "Start a New Assessment" }));
    expect(screen.getByRole("button", { name: "Start Assessment" })).toBeInTheDocument();
  });
});
