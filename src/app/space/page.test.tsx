import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SpacePage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/space",
}));

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

describe("Space page", () => {
  it("renders exactly one H1 with the mission headline", () => {
    render(<SpacePage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/Protect Missions/);
  });

  it("links EV.ENGINEER back to the home page", () => {
    render(<SpacePage />);
    const homeLinks = screen.getAllByRole("link", { name: "EV.ENGINEER" });
    expect(homeLinks.length).toBeGreaterThan(0);
    homeLinks.forEach((link) => expect(link).toHaveAttribute("href", "/"));
  });

  it("labels the hero console as an illustrative simulation, not live telemetry", () => {
    render(<SpacePage />);
    expect(screen.getByText(/Illustrative Mission Simulation/)).toBeInTheDocument();
    expect(screen.getByText(/Illustrative simulation, not live spacecraft telemetry\./)).toBeInTheDocument();
  });

  it("gives every planned lab a Planned status pill", () => {
    render(<SpacePage />);
    const plannedPills = screen.getAllByText("Planned");
    expect(plannedPills.length).toBeGreaterThanOrEqual(8);
  });

  it("gives every research theme a Proposed or Research Direction status, never a fabricated stat", () => {
    render(<SpacePage />);
    expect(screen.queryByText(/★|stars?\b/i)).not.toBeInTheDocument();
    const proposed = screen.queryAllByText("Proposed");
    const researchDirection = screen.queryAllByText("Research Direction");
    expect(proposed.length + researchDirection.length).toBeGreaterThanOrEqual(8);
  });

  it("marks official ISRO reference links as safe external links", () => {
    render(<SpacePage />);
    const isroLink = screen.getByRole("link", { name: /Indian Space Policy 2023/ });
    expect(isroLink).toHaveAttribute("target", "_blank");
    expect(isroLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(isroLink.getAttribute("href")).toMatch(/^https:\/\/www\.isro\.gov\.in\//);
  });

  it("shows the independence disclaimer near the national-vision references, with 'Independent initiative.' emphasized", () => {
    render(<SpacePage />);
    const emphasis = screen.getByText("Independent initiative.");
    expect(emphasis.tagName.toLowerCase()).toBe("strong");
    expect(emphasis.parentElement?.textContent).toMatch(
      /Independent initiative\.\s*References to national space goals/
    );
  });

  it("does not use 'free' positioning language", () => {
    render(<SpacePage />);
    expect(screen.queryByText(/Start Learning Free/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Free Internship/i)).not.toBeInTheDocument();
  });

  it("never claims EV Society is already a registered Section 8 entity", () => {
    render(<SpacePage />);
    expect(screen.queryByText(/registered Section 8/i)).not.toBeInTheDocument();
  });

  it("every same-page nav anchor resolves to a real section id on the page", () => {
    const { container } = render(<SpacePage />);
    const anchorHrefs = Array.from(container.querySelectorAll('a[href^="#"]')).map(
      (a) => a.getAttribute("href") as string
    );
    expect(anchorHrefs.length).toBeGreaterThan(0);
    anchorHrefs.forEach((href) => {
      const id = href.slice(1);
      expect(container.querySelector(`#${CSS.escape(id)}`)).not.toBeNull();
    });
  });

  it("FAQ accordion is keyboard operable and accessible", async () => {
    const user = userEvent.setup();
    render(<SpacePage />);
    const faqSection = document.getElementById("faq") as HTMLElement;
    const firstQuestion = within(faqSection).getByRole("button", {
      name: /What is the single focus of the Space initiative\?/,
    });
    expect(firstQuestion).toHaveAttribute("aria-expanded", "false");

    await user.click(firstQuestion);
    expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/bounded, supervised autonomy/)).toBeInTheDocument();
  });

  it("mobile menu toggle exposes aria-expanded and opens the menu", async () => {
    const user = userEvent.setup();
    render(<SpacePage />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("space-mobile-menu")).not.toBeNull();
  });
});
