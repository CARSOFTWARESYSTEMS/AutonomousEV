import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "./Navbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

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

function getDesktopSpaceTrigger() {
  const trigger = screen
    .getAllByRole("button", { name: "Space & Aerospace" })
    .find((btn) => btn.getAttribute("aria-controls") === "space-dropdown-menu");
  if (!trigger) throw new Error("Desktop Space & Aerospace trigger not found");
  return trigger;
}

describe("Navbar Space & Aerospace dropdown", () => {
  it("replaces the old Aerospace item with a Space & Aerospace trigger exposing both destinations", () => {
    render(<Navbar />);
    expect(screen.queryByRole("link", { name: "Aerospace" })).toBeInTheDocument();

    const trigger = getDesktopSpaceTrigger();
    expect(trigger).toHaveAttribute("aria-haspopup", "true");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    const spaceLinks = screen.getAllByRole("link", { name: "Space" });
    expect(spaceLinks.some((l) => l.getAttribute("href") === "/space")).toBe(true);

    const aerospaceLinks = screen.getAllByRole("link", { name: "Aerospace" });
    expect(aerospaceLinks.length).toBeGreaterThanOrEqual(1);
    aerospaceLinks.forEach((link) => expect(link).toHaveAttribute("href", "/aerospace"));
  });

  it("opens on click and closes on Escape, returning focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const trigger = getDesktopSpaceTrigger();

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
    const trigger = getDesktopSpaceTrigger();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "outside" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("exposes a mobile accordion with both Space and Aerospace links", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const mobileTrigger = screen
      .getAllByRole("button", { name: /Space & Aerospace/ })
      .find((btn) => btn.getAttribute("aria-controls") === "mobile-space-panel");
    expect(mobileTrigger).toBeDefined();
    expect(mobileTrigger).toHaveAttribute("aria-expanded", "false");

    await user.click(mobileTrigger!);
    expect(mobileTrigger).toHaveAttribute("aria-expanded", "true");

    const panel = document.getElementById("mobile-space-panel");
    expect(panel).not.toBeNull();
    expect(panel?.querySelector('a[href="/space"]')).not.toBeNull();
    expect(panel?.querySelector('a[href="/aerospace"]')).not.toBeNull();
  });
});
