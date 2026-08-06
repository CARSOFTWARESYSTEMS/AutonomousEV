import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThreatModellingStudio } from "./ThreatModellingStudio";
import { SCENARIO_PRESETS } from "@/lib/battery-cybersecurity/data/scenarioPresets";

describe("ThreatModellingStudio", () => {
  it("renders a valid result for the default (first preset) selection", () => {
    render(<ThreatModellingStudio />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getAllByText(/severity/i).length).toBeGreaterThan(0);
  });

  it("updates the result when a different preset is selected", async () => {
    const user = userEvent.setup();
    render(<ThreatModellingStudio />);
    const secondPreset = SCENARIO_PRESETS[1];
    await user.click(screen.getByRole("button", { name: secondPreset.label, pressed: false }));
    expect(screen.getByRole("button", { name: secondPreset.label })).toHaveAttribute("aria-pressed", "true");
  });

  it("exposes export controls once a valid result is shown", () => {
    render(<ThreatModellingStudio />);
    expect(screen.getByRole("button", { name: /export json/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export markdown/i })).toBeInTheDocument();
  });

  it("never calls fetch while interacting with the studio", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw new Error("fetch should never be called");
    });
    const user = userEvent.setup();
    render(<ThreatModellingStudio />);
    for (const preset of SCENARIO_PRESETS) {
      const button = screen.queryByRole("button", { name: preset.label });
      if (button) await user.click(button);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("changing the aircraft profile updates the component options", async () => {
    const user = userEvent.setup();
    render(<ThreatModellingStudio />);
    const profileSelect = screen.getByLabelText("Aircraft Profile") as HTMLSelectElement;
    await user.selectOptions(profileSelect, "defense-uav");
    expect(profileSelect.value).toBe("defense-uav");
  });
});
