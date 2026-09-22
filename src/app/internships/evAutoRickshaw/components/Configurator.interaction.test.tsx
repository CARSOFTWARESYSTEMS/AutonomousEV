import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EvAutoRickshawContent from "../EvAutoRickshawContent";

describe("EV Auto Rickshaw configurator interactivity", () => {
  it("updates the recommendation panel when the daily distance slider changes", () => {
    // jsdom does not implement native keyboard-stepping behaviour for
    // input[type=range] (a documented jsdom gap, not a browser limitation),
    // so this exercises the same onChange path a real drag/arrow-key
    // interaction would trigger via fireEvent.change instead.
    render(<EvAutoRickshawContent />);

    const before = screen.getByTestId("result-range").textContent;

    const slider = screen.getByLabelText("Daily Driving Distance");
    fireEvent.change(slider, { target: { value: "250" } });

    const after = screen.getByTestId("result-range").textContent;
    expect(after).not.toBe(before);
  });

  it("updates the recommendation panel when passenger capacity changes", async () => {
    const user = userEvent.setup();
    render(<EvAutoRickshawContent />);

    const beforePrice = screen.getByTestId("result-selling-price").textContent;

    await user.click(screen.getByRole("button", { name: "D+3" }));

    const afterPrice = screen.getByTestId("result-selling-price").textContent;
    expect(afterPrice).not.toBe(beforePrice);
  });

  it("updates configuration when a preset is applied", async () => {
    const user = userEvent.setup();
    render(<EvAutoRickshawContent />);

    const beforePrice = screen.getByTestId("result-selling-price").textContent;

    await user.click(screen.getByRole("button", { name: /Fleet\+/ }));

    const afterPrice = screen.getByTestId("result-selling-price").textContent;
    expect(afterPrice).not.toBe(beforePrice);
  });

  it("switches to Engineering mode and shows the Reset to Recommended control", async () => {
    const user = userEvent.setup();
    render(<EvAutoRickshawContent />);

    await user.click(screen.getByRole("button", { name: "Engineering" }));

    expect(screen.getByText("Reset to Recommended")).toBeInTheDocument();
  });
});
