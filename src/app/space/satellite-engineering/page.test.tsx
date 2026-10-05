import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EOI_FORM_URL } from "@/lib/eoi";
import SatelliteEngineeringPage from "./page";
import { outcomes, portfolio, phases, reviewGates, GATE_ORDER, tocLinks } from "./programData";

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
    expect(text).toMatch(/course completion alone does not confer senior titles such as CTO, Chief Architect or Director/i);
    expect(text).toMatch(/not flight-qualified hardware/);
    expect(text).toMatch(/not an accredited academic qualification/);
  });

  it("routes Express Interest to the approved EOI form and keeps the Designed by panel", () => {
    render(<SatelliteEngineeringPage />);
    const cta = screen.getByRole("region", { name: "Architect the Mission. Defend the Decisions." });
    const eoi = within(cta).getByRole("link", { name: /Express Interest/ });
    expect(eoi).toHaveAttribute("href", EOI_FORM_URL);
    expect(eoi).toHaveAttribute("target", "_blank");
    expect(eoi).toHaveAttribute("rel", "noopener noreferrer");
    expect(within(cta).getByRole("link", { name: /Explore Space R&D/ })).toHaveAttribute("href", "/space#research");

    const prepared = screen.getByRole("complementary", { name: "About the researcher" });
    expect(within(prepared).getByText("Designed by")).toBeInTheDocument();
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

describe("Satellite Engineering V1.1 architecture rigour", () => {
  const FORMAL_ORDER = ["MCR", "SRR", "PDR", "CDR", "TRR", "ORR", "MRR"];

  it("orders formal review gates MCR < SRR < PDR < CDR < TRR < ORR < MRR everywhere", () => {
    expect([...GATE_ORDER]).toEqual(FORMAL_ORDER);
    expect(reviewGates.map((g) => g.code)).toEqual(FORMAL_ORDER);
    // Week-level milestones, read in week order, follow the same sequence.
    expect(phases.flatMap((p) => p.weeks).flatMap((w) => w.milestones ?? []).map((m) => m.code)).toEqual(FORMAL_ORDER);

    const { container } = render(<SatelliteEngineeringPage />);
    const timeline = Array.from(container.querySelectorAll("#reviews ol > li")).map((li) => li.getAttribute("data-gate"));
    expect(timeline).toEqual(FORMAL_ORDER);
    const heroStrip = Array.from(container.querySelectorAll("figure ol li")).slice(0, 7).map((li) => li.textContent);
    expect(heroStrip).toEqual(FORMAL_ORDER);
  });

  it("keeps formal TRR after the CDR baseline and treats Week 10 as an engineering-model checkpoint", () => {
    const weeks = phases.flatMap((p) => p.weeks);
    const week10 = weeks.find((w) => w.number === 10)!;
    expect(week10.milestones).toBeUndefined();
    expect(week10.checkpoint).toMatch(/Engineering-model verification campaign \+ CDR preparation/);
    const week12 = weeks.find((w) => w.number === 12)!;
    expect(week12.milestones?.map((m) => m.code)).toEqual(["CDR", "TRR", "ORR", "MRR"]);

    const { container } = render(<SatelliteEngineeringPage />);
    expect(container.querySelector("#reviews")?.textContent).toMatch(
      /Engineering-model verification occurs throughout the course, while formal review gates represent the progressive maturity of the\s+mission architecture and test baseline/,
    );
  });

  it("uses Verification-Ready Baseline and introduces no unsupported qualification claims", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("Verification-Ready Baseline");
    expect(text).not.toMatch(/Qualified design/i);
    // The only permitted use of "qualified" is the explicit negation for the flatsat.
    const remaining = text.replace(/not flight-qualified/g, "");
    expect(remaining).not.toMatch(/\bqualified\b/i);
  });

  it("presents the mission as a system-of-systems with all six segments", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const block = container.querySelector("#system-of-systems") as HTMLElement;
    expect(block).not.toBeNull();
    expect(within(block).getByRole("heading", { name: "A Satellite Mission Is a System-of-Systems" })).toBeInTheDocument();
    ["Space Segment", "Payload", "Launch Segment", "Ground Segment", "Mission Operations", "Data / User Segment"].forEach((seg) =>
      expect(within(block).getByText(seg)).toBeInTheDocument(),
    );
    expect(within(block).getByText("Mission objective")).toBeInTheDocument();
    expect(within(block).getByText("Mission capability")).toBeInTheDocument();
    expect(block.textContent).toMatch(/A spacecraft cannot be architected in isolation/);
  });

  it("adds pointing and image-quality budgets, the margin policy and an ADR example to the dossier", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const dossier = container.querySelector("#dossier") as HTMLElement;
    expect(within(dossier).getByText("Pointing budget")).toBeInTheDocument();
    expect(within(dossier).getByText("Performance / Image Quality budget")).toBeInTheDocument();
    expect(within(dossier).getByRole("heading", { name: "Engineering Margin Policy" })).toBeInTheDocument();
    expect(dossier.textContent).toMatch(/What margin remains, and what assumptions consume it\?/);
    expect(within(dossier).getAllByText("Architecture Decision Records").length).toBeGreaterThan(0);
    expect(within(dossier).getByText("ADR-ADCS-004")).toBeInTheDocument();
    ["Question", "Options considered", "Evaluation criteria", "Selected option", "Rationale", "Assumptions", "Risks", "Revisit trigger"].forEach(
      (field) => expect(within(dossier).getByText(field)).toBeInTheDocument(),
    );
  });

  it("states digital-twin fidelity responsibly", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    expect(container.querySelector("#digital-twin")?.textContent).toMatch(
      /engineering model whose fidelity increases as simulation, test and\s+telemetry evidence are added\. It should not be interpreted as a validated flight digital twin/,
    );
  });

  it("covers software assurance, EEE parts and product assurance inside the weeks", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const panel = (n: number) =>
      document.getElementById((container.querySelector(`#week-${n} button`) as HTMLElement).getAttribute("aria-controls") as string)!;
    expect(panel(8).textContent).toMatch(/Software assurance/);
    expect(panel(8).textContent).toMatch(/Requirements-to-code traceability/);
    expect(panel(10).textContent).toMatch(/EEE parts engineering/);
    expect(panel(10).textContent).toMatch(/Counterfeit avoidance/);
    expect(panel(10).textContent).toMatch(/Product assurance & quality engineering/);
    expect(panel(10).textContent).toMatch(/design intent is preserved through manufacturing, integration, test and acceptance/);
    expect(panel(7).textContent).toMatch(/Regulatory feasibility is an input to communications architecture, not post-design paperwork/);
  });

  it("frames mission life as a design trade and uses the refined hero wording", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/Design Life Target3 years/);
    expect(text).toMatch(/Evaluate extension toward 5 years/);
    expect(text).not.toMatch(/Lifetime3–5 years/);
    expect(text).toMatch(/required to architect complex satellite missions/);
    expect(text.match(/Satellite Systems Engineering Course in India/g)).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Engineering Tools & Open Technical Stack" })).toBeInTheDocument();
    expect(text).toMatch(/EV\.ENGINEER™ professional program within the EV Society™ Space initiative/);
  });
});

describe("Satellite Engineering in-page navigation", () => {
  const EXPECTED = ["Overview", "Audience", "Program", "Mission", "Curriculum", "Digital Twin", "Flatsat", "Reviews", "Outcomes", "Portfolio", "Careers"];

  it("uses eleven short labels whose anchors all resolve, without a Certification entry", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => a.textContent)).toEqual(EXPECTED);
    expect(tocLinks).toHaveLength(11);
    expect(within(nav).queryByRole("link", { name: /Certification/ })).toBeNull();
    links.forEach((a) => expect(container.querySelector(a.getAttribute("href") as string)).not.toBeNull());
    // Certification content itself stays on the page, reachable after Careers.
    expect(screen.getByRole("heading", { level: 2, name: "Certification" })).toBeInTheDocument();
  });

  it("exposes an accessible 'On this page' disclosure for small screens", async () => {
    const user = userEvent.setup();
    render(<SatelliteEngineeringPage />);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    const toggle = within(nav).getByRole("button", { name: "On this page" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "page-toc-list");
    expect(document.getElementById("page-toc-list")).not.toBeNull();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();

    await user.click(toggle);
    await user.click(within(nav).getByRole("link", { name: "Curriculum" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the V1.1 technical content after the responsive pass", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const text = container.textContent ?? "";
    [
      "Verification-Ready Baseline",
      "A Satellite Mission Is a System-of-Systems",
      "Pointing budget",
      "Performance / Image Quality budget",
      "Engineering Margin Policy",
      "Architecture Decision Records",
      "Software assurance",
      "EEE parts engineering",
      "Product assurance & quality engineering",
      "validated flight digital twin",
      "Design Life Target",
      "Evaluate extension toward 5 years",
      "EV.ENGINEER™ professional program",
      "Engineering Tools & Open Technical Stack",
    ].forEach((phrase) => expect(text).toContain(phrase));
    expect(Array.from(container.querySelectorAll("#reviews ol > li")).map((li) => li.getAttribute("data-gate"))).toEqual([...GATE_ORDER]);
  });
});
