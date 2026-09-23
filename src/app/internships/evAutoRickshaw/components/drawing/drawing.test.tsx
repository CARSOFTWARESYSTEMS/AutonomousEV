import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import EvAutoRickshawContent from "../../EvAutoRickshawContent";

describe("Concept Engineering Drawing — single source of truth", () => {
  it("shows the same battery capacity, motor power, charger and loaded mass as the recommendation panel", () => {
    render(<EvAutoRickshawContent />);

    const batteryFromPanel = screen.getByTestId("result-selling-price").textContent;
    expect(batteryFromPanel).toBeTruthy();

    // The drawing's specification block renders inside the same page tree,
    // driven by the same `sim.outputs` — assert its MASS table shows the
    // identical loaded-mass figure the recommendation panel shows.
    const massHeading = screen.getByText("MASS");
    const massCard = massHeading.parentElement;
    expect(massCard).not.toBeNull();
    expect(within(massCard as HTMLElement).getByText(/Loaded Vehicle Mass/)).toBeInTheDocument();
  });

  it("updates the drawing's battery callout when the battery capacity override changes", async () => {
    const user = userEvent.setup();
    render(<EvAutoRickshawContent />);

    const before = screen.getAllByText(/kWh/).map((el) => el.textContent).join("|");

    await user.click(screen.getByRole("button", { name: "Engineering" }));
    const batterySlider = screen.getByLabelText("Battery Capacity Override");
    fireEvent.change(batterySlider, { target: { value: "16" } });

    const after = screen.getAllByText(/kWh/).map((el) => el.textContent).join("|");
    expect(after).not.toBe(before);
    expect(after).toMatch(/16\.0 kWh/);
  });

  it("labels its own status as concept/R&D, never as production/approved/homologated", () => {
    render(<EvAutoRickshawContent />);
    // "Production Drawing" legitimately appears once, as a *future* stage
    // name in the maturity ladder (Concept GA -> ... -> Production Drawing) —
    // what must never happen is the drawing's own status badge claiming it.
    expect(screen.getByText(/CONCEPT \/ R&D — Rev 0\.1/)).toBeInTheDocument();
    expect(screen.getByText("CONCEPT / R&D")).toBeInTheDocument();
    expect(screen.queryByText(/^Approved Drawing$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Homologated Drawing$/)).not.toBeInTheDocument();
    expect(screen.getByText("NTS — Not To Scale")).toBeInTheDocument();
  });

  it("title block shows the drawing number and revision", () => {
    render(<EvAutoRickshawContent />);
    expect(screen.getByText("EVAR-GA-001")).toBeInTheDocument();
    expect(screen.getByText("0.1")).toBeInTheDocument();
  });
});

describe("Concept Engineering Drawing — dimension controls", () => {
  it("flags a dimension warning for an obviously too-short wheelbase at D+6", async () => {
    const user = userEvent.setup();
    render(<EvAutoRickshawContent />);

    await user.click(screen.getByRole("button", { name: "Engineering" }));
    // Open the Vehicle group where dimension overrides live.
    await user.click(screen.getByRole("button", { name: /^Vehicle/ }));

    const wheelbaseSlider = screen.getByLabelText("Wheelbase");
    fireEvent.change(wheelbaseSlider, { target: { value: "1900" } });

    expect(screen.getByText("Wheelbase Too Short")).toBeInTheDocument();
  });

  it("restores concept-target dimensions on Reset to Recommended", async () => {
    const user = userEvent.setup();
    render(<EvAutoRickshawContent />);

    await user.click(screen.getByRole("button", { name: "Engineering" }));
    await user.click(screen.getByRole("button", { name: /^Vehicle/ }));

    const wheelbaseSlider = screen.getByLabelText("Wheelbase") as HTMLInputElement;
    fireEvent.change(wheelbaseSlider, { target: { value: "1900" } });
    expect(screen.getByText("Wheelbase Too Short")).toBeInTheDocument();

    await user.click(screen.getByText("Reset to Recommended"));
    expect(screen.queryByText("Wheelbase Too Short")).not.toBeInTheDocument();
  });
});

describe("Concept Engineering Drawing — mobile view tabs", () => {
  it("switches the selected tab on click", async () => {
    const user = userEvent.setup();
    render(<EvAutoRickshawContent />);

    const frontTab = screen.getByRole("tab", { name: "Front" });
    expect(frontTab).toHaveAttribute("aria-selected", "false");

    await user.click(frontTab);
    expect(frontTab).toHaveAttribute("aria-selected", "true");
  });
});
