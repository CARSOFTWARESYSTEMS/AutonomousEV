import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AerospacePage from "./page";
import { AEROSPACE_HEADER_COMPACT_MAX } from "./AerospacePage";

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

  it("does not show the aerospace.ev.engineer poster on other hosts", () => {
    render(<AerospacePage />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("link", { name: "WhatsApp" })).toBeNull();
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

  it("keeps the UFlight™ feature as it was, and follows it directly with the Space Research feature", () => {
    const { container } = render(<AerospacePage />);
    const uflight = container.querySelector<HTMLElement>('section[aria-labelledby="uflight-3d-title"]')!;
    expect(within(uflight).getByRole("heading", { level: 2, name: "THE AIRCRAFT KNOWS MORE THAN YOU CAN SEE." })).toBeInTheDocument();
    expect(within(uflight).getByRole("link", { name: /LAUNCH UFLIGHT™ 3D/ })).toHaveAttribute("href", "/aerospace/uflight-3d");
    expect(within(uflight).getByRole("img", { name: /UFlight™ Reference eVTOL/ })).toBeInTheDocument();
    expect(uflight.nextElementSibling).toBe(container.querySelector("section#space-research"));
  });

  it("shows the Space Research copy exactly as approved", () => {
    const { container } = render(<AerospacePage />);
    const section = within(container.querySelector<HTMLElement>("section#space-research")!);
    expect(section.getByText("ISHAVASYAM.ORG · SPACE RESEARCH")).toBeInTheDocument();
    expect(section.getByRole("heading", { level: 2, name: "Learn to Protect Missions." })).toBeInTheDocument();
    expect(section.getByText("Build Systems That Protect Spacecraft.")).toBeInTheDocument();
    expect(
      section.getByText("Explore spacecraft systems, digital twins, telemetry, fault detection and safe recovery through interactive engineering experiences."),
    ).toBeInTheDocument();
  });

  it("opens the Space Research Portal in a new tab, and says so", () => {
    render(<AerospacePage />);
    const cta = screen.getByRole("link", { name: "Explore Space Research (opens in a new tab)" });
    expect(cta).toHaveAttribute("href", "https://aerospace.ev.engineer/space");
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
    expect(cta).toHaveTextContent("Space Research");
    expect(cta).toHaveAttribute("data-track-event", "space_research_open");
  });

  it("describes the spacecraft, shows a still where 3D is unavailable, and labels it as educational and simulated", () => {
    const { container } = render(<AerospacePage />);
    const section = container.querySelector<HTMLElement>("section#space-research")!;
    expect(within(section).getByRole("img", { name: /Educational 3D model of a 6U CubeSat-class spacecraft.*Stage 1 of 4: Spacecraft reveal/ })).toBeInTheDocument();
    // Without WebGL (jsdom) no canvas is mounted; the still is in the frame from the start.
    expect(section.querySelector("canvas")).toBeNull();
    expect(section.querySelector('img[src*="space-research"]')).not.toBeNull();
    const caption = section.querySelector("figcaption")!;
    expect(caption).toHaveTextContent(/not flight hardware/);
    expect(caption).toHaveTextContent(/Telemetry and the anomaly are simulated/);
    expect(caption).toHaveTextContent(/research concept, not an operational system/);
  });

  it("lets visitors step through the stages, pick a subsystem, and pause", async () => {
    const user = userEvent.setup();
    const { container } = render(<AerospacePage />);
    const section = within(container.querySelector<HTMLElement>("section#space-research")!);
    const stages = section.getByRole("group", { name: "Animation stages" });
    expect(within(stages).getAllByRole("button")).toHaveLength(4);
    expect(within(stages).getByRole("button", { name: /Reveal/ })).toHaveAttribute("aria-pressed", "true");

    await user.click(within(stages).getByRole("button", { name: /Health/ }));
    expect(within(stages).getByRole("button", { name: /Health/ })).toHaveAttribute("aria-pressed", "true");
    expect(section.getByRole("img", { name: /Stage 3 of 4: Mission health/ })).toBeInTheDocument();
    expect(section.getByText("Simulated telemetry")).toBeInTheDocument();

    await user.click(within(stages).getByRole("button", { name: /Recovery/ }));
    expect(section.getByText("Battery discharging faster than predicted")).toBeInTheDocument();

    const subsystems = section.getByRole("group", { name: "Spacecraft subsystems" });
    expect(within(subsystems).getAllByRole("button")).toHaveLength(6);
    await user.click(within(subsystems).getByRole("button", { name: "Computer" }));
    expect(within(subsystems).getByRole("button", { name: "Computer" })).toHaveAttribute("aria-pressed", "true");
    expect(section.getByText(/Runs the flight software/)).toBeInTheDocument();
    // Picking a part pauses the loop; Play resumes it and hands back to the story.
    await user.click(section.getByRole("button", { name: "Play the animation" }));
    expect(section.getByRole("button", { name: "Pause the animation" })).toBeInTheDocument();
    expect(section.queryByText(/Runs the flight software/)).toBeNull();
  });

  it("never wraps a desktop nav label, and switches to the menu at one breakpoint mirrored in CSS", () => {
    render(<AerospacePage />);
    const nav = screen.getByRole("navigation", { name: "Aerospace section navigation" });
    within(nav)
      .getAllByRole("link")
      .forEach((a) => expect(a).toHaveStyle({ whiteSpace: "nowrap" }));

    // With Login in the bar the full header needs a laptop-width screen.
    expect(AEROSPACE_HEADER_COMPACT_MAX).toBeGreaterThanOrEqual(1299);
    const css = fs.readFileSync(path.resolve(import.meta.dirname, "aerospace.module.css"), "utf-8");
    const at = css.indexOf(`@media (max-width: ${AEROSPACE_HEADER_COMPACT_MAX}px)`);
    expect(at).toBeGreaterThan(-1);
    expect(css.slice(at, css.indexOf("}", css.indexOf(".headerToggle", at)) + 1)).toMatch(/\.headerNavDesktop\s*\{\s*display:\s*none[\s\S]*\.headerToggle\s*\{\s*display:\s*flex/);
  });
});
