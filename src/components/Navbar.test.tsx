import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "./Navbar";

describe("Navbar About dropdown", () => {
  it("lists Trust Center alongside the existing About links, in both the desktop dropdown and the mobile menu", () => {
    render(<Navbar />);
    const trustCenterLinks = screen.getAllByRole("link", { name: "Trust Center" });
    expect(trustCenterLinks.length).toBeGreaterThanOrEqual(2);
    trustCenterLinks.forEach((link) => expect(link).toHaveAttribute("href", "/trust-center"));

    expect(screen.getAllByRole("link", { name: "About Us" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Sudarshana Karkala" }).length).toBeGreaterThan(0);
  });

  it("is closed by default and opens on click, exposing aria-expanded", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const trigger = screen.getByRole("button", { name: "About" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const trigger = screen.getByRole("button", { name: "About" });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes when clicking outside the menu", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Navbar />
        <button type="button">outside</button>
      </div>
    );
    const trigger = screen.getByRole("button", { name: "About" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "outside" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
