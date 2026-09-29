import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EOI_FORM_URL } from "@/lib/eoi";
import SatelliteEngineeringPage from "./page";
import { outcomes, portfolio, phases } from "./programData";

vi.mock("next/navigation", () => ({
  usePathname: () => "/space/satellite-engineering",
}));

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

describe("Satellite Engineering page", () => {
  it("renders exactly one H1 and states track, depth and audience in the hero", () => {
    render(<SatelliteEngineeringPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Satellite Engineering");
    expect(screen.getByText("From First Principles to Spacecraft Systems Architect")).toBeInTheDocument();
    expect(screen.getByText("Flagship").closest("p")?.textContent).toMatch(/Flagship\s+·\s+Architecture & Leadership Track/);
    expect(screen.getByText(/Systems Leads · Principal Engineers · Engineering Managers · CTOs · Chief Architects/)).toBeInTheDocument();
  });

  it("never skips a heading level", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));
    levels.reduce((prev, level) => {
      expect(level).toBeLessThanOrEqual(prev + 1);
      return level;
    }, 1);
  });

  it("offers a breadcrumb back to /space", () => {
    render(<SatelliteEngineeringPage />);
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumbs).getByRole("link", { name: "Space" })).toHaveAttribute("href", "/space");
    expect(within(crumbs).getByText("Satellite Engineering")).toHaveAttribute("aria-current", "page");
  });

  it("every same-page anchor resolves to a real element id", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const hrefs = Array.from(container.querySelectorAll('a[href^="#"]')).map((a) => a.getAttribute("href") as string);
    expect(hrefs.length).toBeGreaterThan(10);
    hrefs.forEach((href) => expect(container.querySelector(`#${CSS.escape(href.slice(1))}`)).not.toBeNull());
  });

  it("renders all twelve weeks as accessible disclosures with content present in the HTML while collapsed", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const curriculum = container.querySelector("#curriculum") as HTMLElement;
    const toggles = within(curriculum)
      .getAllByRole("button")
      .filter((b) => b.hasAttribute("aria-controls"));
    expect(toggles).toHaveLength(12);
    expect(toggles[0]).toHaveAttribute("aria-expanded", "true");
    toggles.slice(1).forEach((t) => expect(t).toHaveAttribute("aria-expanded", "false"));

    // Collapsed panels are hidden, not removed — Week 2 content is in the DOM.
    const week2Panel = document.getElementById(toggles[1].getAttribute("aria-controls") as string) as HTMLElement;
    expect(week2Panel).toHaveAttribute("hidden");
    expect(week2Panel.textContent).toMatch(/Keplerian mechanics/);
  });

  it("opens a week on click and expands every week from the toolbar", async () => {
    const user = userEvent.setup();
    const { container } = render(<SatelliteEngineeringPage />);
    const curriculum = container.querySelector("#curriculum") as HTMLElement;
    const week3 = within(curriculum).getByRole("button", { name: /Attitude Determination & Control/ });
    await user.click(week3);
    expect(week3).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(week3.getAttribute("aria-controls") as string)).not.toHaveAttribute("hidden");

    await user.click(within(curriculum).getByRole("button", { name: "Expand all 12 weeks" }));
    within(curriculum)
      .getAllByRole("button")
      .filter((b) => b.hasAttribute("aria-controls"))
      .forEach((t) => expect(t).toHaveAttribute("aria-expanded", "true"));
    expect(within(curriculum).getByRole("button", { name: "Collapse all weeks" })).toBeInTheDocument();
  });

  it("lists every outcome and all twenty portfolio deliverables", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    expect(container.querySelectorAll("#outcomes ol > li")).toHaveLength(outcomes.length);
    expect(outcomes).toHaveLength(16);
    const deliverables = portfolio.flatMap((c) => c.items);
    expect(deliverables.map((d) => d.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(container.querySelectorAll("#portfolio li")).toHaveLength(20);
    expect(phases.flatMap((p) => p.weeks)).toHaveLength(12);
  });

  it("makes no guarantee, affiliation or title-conferral claims", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/guaranteed (job|placement)|NASA-certified|MIT-equivalent|Stanford-equivalent|World.s #1|Industry certified|in 12 weeks become/i);
    expect(text).toMatch(/course completion alone does not confer senior titles such as CTO or Chief Architect/i);
    expect(text).toMatch(/not flight-qualified hardware/);
    expect(text).toMatch(/not an accredited academic qualification/);
  });

  it("routes Express Interest to the approved EOI form and keeps the Prepared by panel", () => {
    render(<SatelliteEngineeringPage />);
    const cta = screen.getByRole("region", { name: "Architect the Mission. Defend the Decisions." });
    const eoi = within(cta).getByRole("link", { name: /Express Interest/ });
    expect(eoi).toHaveAttribute("href", EOI_FORM_URL);
    expect(eoi).toHaveAttribute("target", "_blank");
    expect(eoi).toHaveAttribute("rel", "noopener noreferrer");
    expect(within(cta).getByRole("link", { name: /Explore Space R&D/ })).toHaveAttribute("href", "/space#research");

    const prepared = screen.getByRole("complementary", { name: "About the researcher" });
    expect(within(prepared).getByText("Prepared by")).toBeInTheDocument();
    expect(within(prepared).getByRole("link", { name: /View full profile/ })).toHaveAttribute("href", "/about/sudarshana-karkala");
  });

  it("opens external reference links safely", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const external = Array.from(container.querySelectorAll("#tools a[href^='http']"));
    expect(external.length).toBeGreaterThan(0);
    external.forEach((a) => {
      expect(a).toHaveAttribute("target", "_blank");
      expect(a).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
