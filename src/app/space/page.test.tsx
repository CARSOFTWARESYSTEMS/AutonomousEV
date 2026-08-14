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

  it("has a real whitespace text node between the two H1 spans so extracted text reads correctly", () => {
    render(<SpacePage />);
    const h1 = screen.getAllByRole("heading", { level: 1 })[0];
    expect(h1.textContent).toMatch(/Protect Missions\.\s+Build Systems That Protect Spacecraft\./);
    expect(h1.textContent).not.toMatch(/Missions\.Build/);
  });

  it("renames the Projects nav item to Research Themes and Resources to Vision & References", () => {
    render(<SpacePage />);
    expect(screen.queryByRole("link", { name: "Projects" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Resources" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Research Themes" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Vision & References" }).length).toBeGreaterThan(0);
  });

  it("points the hero Join Community CTA at the join page", () => {
    render(<SpacePage />);
    const joinLinks = screen.getAllByRole("link", { name: "Join Community" });
    expect(joinLinks.length).toBeGreaterThan(0);
    joinLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "https://www.evsociety.org/join");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("gives a direct, citable definition of Autonomous Spacecraft Health Management right after the mission heading", () => {
    render(<SpacePage />);
    expect(
      screen.getByText(
        /Autonomous Spacecraft Health Management is the capability to observe spacecraft telemetry, detect and isolate faults, predict mission impact, and recommend or execute verified recovery actions within bounded safety limits\./
      )
    ).toBeInTheDocument();
  });

  it("defines FDIR in full on first use before using the bare acronym", () => {
    const { container } = render(<SpacePage />);
    const text = container.textContent ?? "";
    const fullTermIndex = text.indexOf("Fault Detection, Isolation and Recovery (FDIR)");
    const bareIndex = text.indexOf("(FDIR)", fullTermIndex + 1);
    expect(fullTermIndex).toBeGreaterThan(-1);
    expect(bareIndex).toBeGreaterThan(fullTermIndex);
  });

  it("includes an Ecosystem and Responsibilities section linking EV Society, EV.ENGINEER, UFlight and iTelematics", () => {
    render(<SpacePage />);
    const section = document.getElementById("ecosystem") as HTMLElement;
    expect(section).not.toBeNull();

    const evSociety = within(section).getByRole("link", { name: "EV Society" });
    expect(evSociety).toHaveAttribute("href", "https://www.evsociety.org/");

    const evEngineer = within(section).getByRole("link", { name: "EV.ENGINEER" });
    expect(evEngineer).toHaveAttribute("href", "/");

    const uflight = within(section).getByRole("link", { name: "UFlight" });
    expect(uflight).toHaveAttribute("href", "https://www.uflight.in/");

    const itelematics = within(section).getByRole("link", {
      name: "iTelematics Software Private Limited",
    });
    expect(itelematics).toHaveAttribute("href", "https://itelematics.com/");

    expect(section.textContent).not.toMatch(/\b(subsidiary|owner|division)\b/i);
  });

  it("keeps every FAQ answer in server-rendered HTML behind a real aria-controls id, hidden until expanded", () => {
    render(<SpacePage />);
    const faqSection = document.getElementById("faq") as HTMLElement;
    const buttons = within(faqSection).getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);

    for (const button of buttons) {
      const panelId = button.getAttribute("aria-controls");
      expect(panelId).toBeTruthy();
      const panel = document.getElementById(panelId as string);
      // Present in the DOM even though the accordion is collapsed.
      expect(panel).not.toBeNull();
      expect(panel?.textContent?.length).toBeGreaterThan(0);
      expect(panel?.hasAttribute("hidden")).toBe(true);
    }
  });

  it("includes the crawlable health-management-loop diagram with accurate alt text and a visible caption", () => {
    render(<SpacePage />);
    const img = screen.getByRole("img", {
      name: "Autonomous spacecraft health-management loop from telemetry monitoring through verified safe recovery.",
    });
    expect(img).toHaveAttribute(
      "src",
      "/space/autonomous-spacecraft-health-management-loop.svg"
    );
    expect(img).toHaveAttribute("width", "1200");
    expect(img).toHaveAttribute("height", "320");
    expect(img.closest("figure")?.querySelector("figcaption")).not.toBeNull();
  });

  it("shows an editorial freshness line naming the EV Society technical team and a real review date", () => {
    render(<SpacePage />);
    expect(
      screen.getByText(/Prepared by the EV Society technical team\. Last reviewed: .+\./)
    ).toBeInTheDocument();
  });

  it("adds publication years to the official reference links where known", () => {
    render(<SpacePage />);
    expect(screen.getByRole("link", { name: /Mars Orbiter Mission, MOM \(2013\)/ })).toBeInTheDocument();
  });

  it("injects a valid JSON-LD entity graph without dangerouslySetInnerHTML, safely escaped", () => {
    const { container } = render(<SpacePage />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(script?.textContent).toBeTruthy();

    const parsed = JSON.parse(script?.textContent ?? "");
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(Array.isArray(parsed["@graph"])).toBe(true);
    expect(parsed["@graph"].length).toBeGreaterThan(0);

    // Raw "<" must never appear literally in the serialized JSON-LD text.
    expect(script?.textContent).not.toMatch(/</);
  });

  it("contains no href=\"#\" placeholder links", () => {
    const { container } = render(<SpacePage />);
    expect(container.querySelectorAll('a[href="#"]').length).toBe(0);
  });
});
