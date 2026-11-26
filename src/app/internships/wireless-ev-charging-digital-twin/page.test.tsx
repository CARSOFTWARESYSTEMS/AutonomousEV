import { describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships/wireless-ev-charging-digital-twin" }));
vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
  JetBrains_Mono: () => ({ variable: "--font-twin-mono" }),
}));

import { isSelfContainedPath } from "@/components/ChromeGate";
import sitemap from "@/app/sitemap";
import { PROGRAMME_TRACKS } from "@/lib/structured-data/internshipsGraph";
import Page, { metadata } from "./page";
import { structuredData } from "./seo";

const ROUTE = "/internships/wireless-ev-charging-digital-twin";

describe("Wireless EV Charging Digital Twin route", () => {
  it("states the product, tagline, programme and attribution in the server-rendered hero", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1, name: "Next-Generation Wireless EV Charging Digital Twin" })).toBeInTheDocument();
    expect(screen.getAllByText("Park. Drive. Charge. Automatically.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("8-Month Advanced Engineering Research & Practical Workshop").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Designed and developed by and for the EV\.ENGINEER™ team\./).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Enter Research Laboratory/ })).toHaveAttribute("href", "#research-laboratory");
  });

  it("opens cinematically: descriptors, a poster from the twin's own scene, and two calls to action", () => {
    render(<Page />);
    expect(screen.getByText("Physics-based · Mathematics-driven · IoT-enabled · Data-driven")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /rendered from the digital twin's own 3D scene/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Watch Technology Demonstration/ })).toHaveAttribute("href", "#demo");
  });

  it("lists five research environments, with the Smart Parking Shelter marked as planned rather than working", () => {
    render(<Page />);
    const rail = screen.getByRole("navigation", { name: "Research environments" });
    const buttons = within(rail).getAllByRole("button");
    expect(buttons.slice(0, 5).map((b) => b.textContent)).toEqual(["01Smart ParkingPlanned", "02Station", "03Dynamic", "04Autonomous", "05Infrastructure"]);
    expect(buttons[0]).toBeDisabled();
    expect(screen.getByRole("heading", { level: 2, name: "Five research environments" })).toBeInTheDocument();
    expect(screen.getByText(/Specified · planned for Phase 4/)).toBeInTheDocument();
  });

  it("offers the nine research sections and the four experience modes", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Research environment" });
    expect(within(nav).getAllByRole("button").map((b) => b.textContent)).toEqual(["Overview", "Digital Twin", "Physics & Mathematics", "Simulation Lab", "Circuit Lab", "IoT & Data", "Research Lab", "Practical Workshop", "Engineering Assurance"]);
    const modes = screen.getByRole("radiogroup", { name: "Experience mode" });
    expect(within(modes).getAllByRole("radio").map((b) => b.textContent)).toEqual(["Explore", "Learn", "Engineer", "Research"]);
  });

  it("works without WebGL: the 2D field view replaces the 3D stage", () => {
    render(<Page />);
    expect(screen.getByText("3D view unavailable on this device")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /RMS flux density between the transmitter and receiver pads/ })).toBeInTheDocument();
  });

  it("switches sections and keeps inputs labelled as inputs and outputs as calculated", async () => {
    const user = userEvent.setup();
    render(<Page />);
    expect(screen.getAllByText("INPUT").length).toBeGreaterThan(0);
    expect(screen.getAllByText("CALCULATED").length).toBeGreaterThan(0);
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Practical Workshop" }));
    });
    expect(await screen.findByRole("heading", { level: 2, name: "Eight months from first principles to a working twin" })).toBeInTheDocument();
    expect(screen.getAllByText("8-Month Advanced Engineering Research & Practical Workshop").length).toBeGreaterThan(1);
    const stats = screen.getByText("Weeks").closest("dl") as HTMLElement;
    expect(within(stats).getByText("32")).toBeInTheDocument();
    expect(within(stats).getByText("64")).toBeInTheDocument();
  });

  it("never mentions universities or external institutions, and claims no compliance or validation", () => {
    const { container } = render(<Page />);
    const text = container.textContent ?? "";
    const all = `${text} ${JSON.stringify(structuredData)} ${JSON.stringify(metadata)}`;
    expect(all).not.toMatch(/universit|institute of technology|\bIIT\b|\bNIT\b|college/i);
    expect(all).not.toMatch(/production-ready|industry-leading|experimentally proven/i);
    // "certified" may appear only as a disclaimer ("not certified …", "no … certified results").
    for (const m of all.matchAll(/certified/gi)) expect(all.slice(Math.max(0, m.index! - 40), m.index!), "certified used as a claim").toMatch(/\bnot\b|\bno\b/i);
    expect(text).toMatch(/no compliance or certification is claimed/i);
  });

  it("opens the research environment full screen (overlay where the Fullscreen API is missing) and leaves it with Esc", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const app = document.getElementById("research-laboratory") as HTMLElement;
    expect(app).not.toHaveAttribute("data-fullscreen");
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Full screen" }));
    });
    expect(app).toHaveAttribute("data-fullscreen", "overlay");
    expect(screen.getAllByRole("button", { name: /Exit full screen/ }).length).toBeGreaterThan(0);
    await act(async () => {
      await user.keyboard("{Escape}");
    });
    expect(app).not.toHaveAttribute("data-fullscreen");
    await act(async () => {
      await user.keyboard("f");
    });
    expect(app).toHaveAttribute("data-fullscreen", "overlay");
    await act(async () => {
      await user.keyboard("f");
    });
    expect(app).not.toHaveAttribute("data-fullscreen");
  });

  it("shows Research & Project Leadership with Tanuja Jadhav highlighted as Lead Researcher, linked to AegisCAN", () => {
    render(<Page />);
    const section = screen.getByRole("heading", { level: 2, name: "Research & Project Leadership" }).closest("section") as HTMLElement;
    expect(section).toHaveAttribute("id", "research-team");
    expect(section).toHaveTextContent("Researchers guiding the Next-Generation Wireless EV Charging Digital Twin engineering and research initiative through EV.ENGINEER™");
    expect(section).toHaveTextContent(/Leads research direction for the Next-Generation Wireless EV Charging Digital Twin/);
    const names = within(section).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(["Ms. Tanuja Jadhav", "Mr. Sudarshana Karkala"]);
    const lead = within(section).getByRole("heading", { level: 3, name: "Ms. Tanuja Jadhav" }).closest("li") as HTMLElement;
    expect(lead).toHaveAttribute("data-lead");
    expect(lead).toHaveTextContent("Lead Researcher · EV.ENGINEER™");
    expect(within(lead).getByRole("link", { name: /AegisCAN/ })).toHaveAttribute("href", "/internships/AegisCAN");
    const co = within(section).getByRole("heading", { level: 3, name: "Mr. Sudarshana Karkala" }).closest("li") as HTMLElement;
    expect(co).not.toHaveAttribute("data-lead");
    expect(co).toHaveTextContent("Co-Researcher · EV.ENGINEER™");
    expect(co).toHaveTextContent("EV.ENGINEER™");
    expect(within(co).getByRole("link", { name: /EV\.ENGINEER Profile/ })).toHaveAttribute("href", "/about/sudarshana-karkala");
    for (const a of within(section).getAllByRole("link").filter((l) => l.getAttribute("href")!.startsWith("http"))) {
      expect(a).toHaveAttribute("target", "_blank");
      expect(a).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("is canonical, indexable, listed in the sitemap and the programme tracks, and brings its own chrome", () => {
    expect(metadata.alternates?.canonical).toBe(`https://autonomous.ev.engineer${ROUTE}`);
    expect((metadata.robots as { index: boolean }).index).toBe(true);
    expect(sitemap().map((e) => e.url)).toContain(`https://autonomous.ev.engineer${ROUTE}`);
    expect(PROGRAMME_TRACKS.map((t) => t.url)).toContain(`https://autonomous.ev.engineer${ROUTE}`);
    expect(isSelfContainedPath(ROUTE)).toBe(true);
    expect(isSelfContainedPath(`${ROUTE}/x`)).toBe(false);
  });
});
