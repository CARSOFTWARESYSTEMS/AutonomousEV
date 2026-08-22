import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AerospacePage from "./page";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-uflight-manrope" }),
  Inter: () => ({ variable: "--font-uflight-inter" }),
}));

describe("Aerospace page", () => {
  it("has a skip link and a main landmark", () => {
    render(<AerospacePage />);
    const skipLink = screen.getByRole("link", { name: "Skip to content" });
    expect(skipLink).toHaveAttribute("href", "#main-content");
    expect(document.getElementById("main-content")?.tagName.toLowerCase()).toBe("main");
  });

  it("mobile menu toggle exposes aria-expanded and an accessible name that flips between Open/Close menu", async () => {
    const user = userEvent.setup();
    render(<AerospacePage />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Close menu" })).toBe(toggle);
    expect(document.getElementById("aerospace-mobile-menu")).not.toBeNull();
  });

  it("closes the mobile menu on Escape and restores focus to the toggle", async () => {
    const user = userEvent.setup();
    render(<AerospacePage />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    await user.click(toggle);
    expect(document.getElementById("aerospace-mobile-menu")).not.toBeNull();

    await user.keyboard("{Escape}");
    expect(document.getElementById("aerospace-mobile-menu")).toBeNull();
    expect(toggle).toHaveFocus();
  });

  it("points every Express Interest CTA at the approved Google Form, opened safely in a new tab", async () => {
    const user = userEvent.setup();
    render(<AerospacePage />);
    // The mobile-drawer CTA only mounts once the menu is opened.
    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const links = screen.getAllByRole("link", { name: /Express Interest/ });
    expect(links.length).toBeGreaterThanOrEqual(3);
    links.forEach((link) => {
      expect(link).toHaveAttribute("href", "https://forms.gle/GZbPDHd7qozGSZuJA");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.tagName.toLowerCase()).toBe("a");
    });
  });

  it("leaves Join Community pointed at /contact, unaffected by the EOI change", () => {
    render(<AerospacePage />);
    const joinLink = screen.getByRole("link", { name: "Join Community" });
    expect(joinLink).toHaveAttribute("href", "/contact");
  });

  it("shows exactly one mobile-only Expression of Interest hero CTA, positioned before Explore Learning", () => {
    const { container } = render(<AerospacePage />);
    const eoiCtas = screen.getAllByRole("link", { name: /Expression of Interest/ });
    expect(eoiCtas).toHaveLength(1);
    expect(eoiCtas[0]).toHaveAttribute("href", "https://forms.gle/GZbPDHd7qozGSZuJA");
    expect(eoiCtas[0]).toHaveAttribute("target", "_blank");
    expect(eoiCtas[0]).toHaveAttribute("rel", "noopener noreferrer");

    const exploreLearning = screen.getByRole("button", { name: /Explore Learning/ });
    const position = eoiCtas[0].compareDocumentPosition(exploreLearning);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(eoiCtas[0].parentElement).toBe(exploreLearning.parentElement);

    // Rendered once in the DOM (visibility toggled by a mobile-only media query, not JS).
    expect(container.querySelectorAll('a[aria-label*="Expression of Interest"]').length).toBe(1);
  });
});
