import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

  it("sends the header's EV.ENGINEER button to EV.ENGINEER's own site, and the links in the page to this site's home", () => {
    render(<SpacePage />);
    const header = screen.getByRole("navigation", { name: "Space section navigation" });
    // "/" would be the wrong place on aerospace.ishavasyam.org, which serves this same header.
    expect(within(header).getByRole("link", { name: "EV.ENGINEER" })).toHaveAttribute("href", "https://ev.engineer/");
    const inPage = screen.getAllByRole("link", { name: "EV.ENGINEER" }).filter((link) => !header.contains(link));
    expect(inPage.length).toBeGreaterThan(0);
    inPage.forEach((link) => expect(link).toHaveAttribute("href", "/"));
  });

  it("credits its designer as the founder of ISHAVASYAM.ORG, whose initiative Space is, and links to his profile", () => {
    render(<SpacePage />);
    const card = screen.getByRole("complementary", { name: "About the researcher" });
    expect([...card.querySelectorAll("p, h3")].map((line) => line.textContent)).toEqual(["Designed by", "Sudarshana Karkala", "Founder · ISHAVASYAM.ORG"]);
    expect(within(card).getByRole("link", { name: /View full profile/ })).toHaveAttribute("href", "/about/sudarshana-karkala");
    // The line about who prepared the page is a different credit, and is unchanged.
    expect(screen.getByText(/Prepared by the ISHAVASYAM\.ORG technical team\. Last reviewed: 14 August 2026\./)).toBeInTheDocument();
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

  it("includes an Ecosystem and Responsibilities section linking ISHAVASYAM.ORG, EV.ENGINEER, UFlight, iTelematics and the EV Society community", () => {
    render(<SpacePage />);
    const section = document.getElementById("ecosystem") as HTMLElement;
    expect(section).not.toBeNull();

    // The initiative belongs to ISHAVASYAM.ORG. EV Society keeps its separate, community role and nothing more.
    expect(within(section).getByRole("link", { name: "ISHAVASYAM.ORG" })).toHaveAttribute("href", "https://ishavasyam.org/");
    expect(section.textContent).toMatch(/Space is an ISHAVASYAM\.ORG education, research and engineering initiative, hosted within the EV\.ENGINEER engineering ecosystem\./);
    expect(section.textContent).toMatch(/Community membership is offered through EV Society, a separate community initiative\./);

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

  it("shows an editorial freshness line naming the ISHAVASYAM.ORG technical team and a real review date", () => {
    render(<SpacePage />);
    expect(
      screen.getByText(/Prepared by the ISHAVASYAM\.ORG technical team\. Last reviewed: .+\./)
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

  it("points every Express Interest CTA at the approved Google Form, opened safely in a new tab", () => {
    render(<SpacePage />);
    const links = screen.getAllByRole("link", { name: /Express Interest/ });
    expect(links.length).toBeGreaterThanOrEqual(5);
    links.forEach((link) => {
      expect(link).toHaveAttribute("href", "https://forms.gle/GZbPDHd7qozGSZuJA");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.tagName.toLowerCase()).toBe("a");
    });
  });

  it("does not append query params or tracking identifiers to the EOI form URL", () => {
    render(<SpacePage />);
    const links = screen.getAllByRole("link", { name: /Express Interest/ });
    links.forEach((link) => {
      expect(link.getAttribute("href")).toBe("https://forms.gle/GZbPDHd7qozGSZuJA");
    });
  });

  it("leaves Partner With Us and Contact Us pointed at the internal contact page", () => {
    render(<SpacePage />);
    const partner = screen.getByRole("link", { name: "Partner With Us" });
    expect(partner).toHaveAttribute("href", "/contact");

    const contactLinks = screen.getAllByRole("link", { name: /Contact Us/ });
    contactLinks.forEach((link) => expect(link).toHaveAttribute("href", "/contact"));
  });

  it("shows exactly one mobile-only Expression of Interest hero CTA, positioned before Explore the Mission", () => {
    const { container } = render(<SpacePage />);
    const eoiCtas = screen.getAllByRole("link", { name: /Expression of Interest/ });
    expect(eoiCtas).toHaveLength(1);
    expect(eoiCtas[0]).toHaveAttribute("href", "https://forms.gle/GZbPDHd7qozGSZuJA");
    expect(eoiCtas[0]).toHaveAttribute("target", "_blank");
    expect(eoiCtas[0]).toHaveAttribute("rel", "noopener noreferrer");

    const heroSection = document.getElementById("home") as HTMLElement;
    const exploreMissionInHero = within(heroSection).getByRole("link", { name: /Explore the Mission/ });
    const position = eoiCtas[0].compareDocumentPosition(exploreMissionInHero);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(eoiCtas[0].parentElement).toBe(exploreMissionInHero.parentElement);

    // Rendered once in the DOM (visibility toggled by a mobile-only media query, not JS).
    expect(container.querySelectorAll('a[aria-label*="Expression of Interest"]').length).toBe(1);
  });

  it("FAQ answer for expressing interest points to the EOI form and does not claim selection or participation", () => {
    render(<SpacePage />);
    const faqSection = document.getElementById("faq") as HTMLElement;
    const question = within(faqSection).getByRole("button", {
      name: /How can schools, faculty, experts and industry express interest\?/,
    });
    expect(question.textContent).not.toMatch(/no separate form/i);

    const panelId = question.getAttribute("aria-controls") as string;
    const panel = document.getElementById(panelId) as HTMLElement;
    expect(panel.textContent).not.toMatch(/no separate form/i);
    expect(panel.textContent).toMatch(/does not confirm selection/i);
  });
});

 it("links to the CubeTwin simulator from the featured tutorials, which come before the planned labs and research themes", () => {
    const { container } = render(<SpacePage />);
    const simulations = container.querySelector("#simulations");
    expect(simulations).not.toBeNull();
    expect(within(simulations as HTMLElement).getByRole("link", { name: "Explore CubeTwin" })).toHaveAttribute("href", "/space/cubesat");
    // The UX refinement's order: hero, the four pathways, Space Academy, the mission, tutorials, then the research,
    // programme and partner panels, the FAQ and the call to take part. Every earlier anchor is still a section.
    const ids = Array.from(container.querySelectorAll("section[id]")).map(section => section.id);
    expect(ids).toEqual(["home", "pathway", "education", "mission", "simulations", "vision", "internships", "labs", "research", "projects", "roadmap", "access", "partners", "ecosystem", "faq", "community"]);
  });

it("keeps the research, programme and partner detail in the HTML behind closed panels whose heading and status line stay visible", () => {
    const { container } = render(<SpacePage />);
    for (const id of ["vision", "internships", "labs", "research", "projects", "roadmap", "access", "partners", "ecosystem"]) {
      const section = container.querySelector(`#${id}`) as HTMLElement;
      const details = section.querySelector("details[data-panel]") as HTMLDetailsElement;
      expect(details, id).not.toBeNull();
      expect(details.open, id).toBe(false);
      expect(details.querySelector("summary")?.textContent, id).toMatch(/^Show\s*Hide /);
      expect(details.textContent?.length, id).toBeGreaterThan(40);
      // The heading is outside the disclosure, so it is always visible and stays a real heading.
      const heading = within(section).getAllByRole("heading", { level: 2 })[0];
      expect(details.contains(heading), id).toBe(false);
    }
    // Status disclaimers stay outside the closed panels.
    expect(container.querySelector("#partners details")?.contains(screen.getByText(/proposed\s+capability partners unless otherwise confirmed/))).toBe(false);
    expect(container.querySelector("#vision details")?.contains(screen.getByText("Independent initiative."))).toBe(false);
    expect(within(container.querySelector("#research") as HTMLElement).getByText("Planned Research Platform").closest("details")).toBeNull();
  });

it("opens a closed panel when a link to its anchor is followed, from the header or from a pathway card", async () => {
    const user = userEvent.setup();
    const { container } = render(<SpacePage />);
    const labs = container.querySelector("#labs details") as HTMLDetailsElement;
    const header = screen.getByRole("navigation", { name: "Space section navigation" });
    await user.click(within(header).getByRole("link", { name: "Labs" }));
    expect(labs.open).toBe(true);
    const internships = container.querySelector("#internships details") as HTMLDetailsElement;
    await user.click(screen.getByRole("link", { name: /See Internships & Research/ }));
    expect(internships.open).toBe(true);
    window.history.replaceState(null, "", "/");
  });

it("keeps the hero to one statement and three calls to action, with Space Academy first", () => {
    const { container } = render(<SpacePage />);
    const hero = container.querySelector("#home") as HTMLElement;
    expect(hero.querySelectorAll("p")).toHaveLength(2); // the statement, and the console's illustrative-simulation label
    const links = within(hero).getAllByRole("link");
    expect(links.map((a) => a.textContent?.replace(/\s+/g, " ").trim())).toEqual(["Enter Space AcademyAges 14–18 · interactive 3D missions", "Expression of Interest", "Explore the Mission"]);
    expect(links[0]).toHaveAttribute("href", "/space/academy");
  });

it("shows the Model Rocketry card before the CubeTwin card in the simulations section", () => {
    const { container } = render(<SpacePage />);
    const simulations = container.querySelector("#simulations") as HTMLElement;
    const rocketryLink = within(simulations).getByRole("link", { name: /Explore Model Rocketry/ });
    expect(rocketryLink).toHaveAttribute("href", "/space/model-rocketry");
    const cubetwinLink = within(simulations).getByRole("link", { name: "Explore CubeTwin" });
    expect(
      rocketryLink.compareDocumentPosition(cubetwinLink) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

it("shows the Space Applications card before the Model Rocketry card in the simulations section", () => {
    const { container } = render(<SpacePage />);
    const simulations = container.querySelector("#simulations") as HTMLElement;
    const applicationsLink = within(simulations).getByRole("link", { name: /Explore Space Applications/ });
    expect(applicationsLink).toHaveAttribute("href", "/space/everyday-applications");
    const rocketryLink = within(simulations).getByRole("link", { name: /Explore Model Rocketry/ });
    expect(
      applicationsLink.compareDocumentPosition(rocketryLink) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

it("shows a researcher attribution card linking to the canonical profile", () => {
    render(<SpacePage />);
    const profileLink = screen.getByRole("link", { name: /View full profile/ });
    expect(profileLink).toHaveAttribute("href", "/about/sudarshana-karkala");
  });

/** The showcase's rows, in order, each with its article (visual and text). */
const showcaseRows = (container: HTMLElement) => {
  const simulations = container.querySelector("#simulations") as HTMLElement;
  return Array.from(simulations.querySelectorAll("ol > li")) as HTMLElement[];
};
const rowOf = (link: HTMLElement) => link.closest("li") as HTMLElement;

it("shows every tutorial as its own full-width row, in the agreed order", () => {
    const { container } = render(<SpacePage />);
    const rows = showcaseRows(container);
    expect(rows.map((r) => within(r).getByRole("heading", { level: 3 }).textContent)).toEqual(["Space Applications", "Satellite Engineering", "Model Rocketry", "CubeTwin", "Space Station", "APEX Rocket Systems", "Next-Generation Rocket Engine Digital Twin", "Advanced Rocket Propulsion Digital Twin"]);
    // Every row keeps its label, a short first line, the complete description behind a closed disclosure, one button and its status note.
    const ctas = [
      ["Explore Space Applications", "/space/everyday-applications"],
      ["Explore Satellite Engineering", "/space/satellite-engineering"],
      ["Explore Model Rocketry", "/space/model-rocketry"],
      ["Explore CubeTwin", "/space/cubesat"],
      ["Explore Space Station", "/space/space-station"],
      ["Explore APEX Collaboration Concept", "/space/partners/apexrocketsystems"],
      ["Explore Rocket Engine Digital Twin", "/space/rocket-engine-digital-twin"],
      ["Explore Advanced Digital Twin", "/space/rocket-engine-digital-twin-advanced"],
    ];
    rows.forEach((row, i) => {
      const details = row.querySelector("details") as HTMLDetailsElement;
      expect(details.open).toBe(false);
      expect(details.querySelector("summary")?.textContent).toBe("About this tutorial");
      expect(details.querySelectorAll("p").length).toBeGreaterThan(0);
      const links = within(row).getAllByRole("link").filter((a) => !/Official website/.test(a.textContent ?? ""));
      expect(links.map((a) => [a.textContent?.trim(), a.getAttribute("href")])).toEqual([ctas[i]]);
    });
  });

it("gives every showcase visual a text alternative, and only uses a photograph APEX supplied for the APEX row", () => {
    const { container } = render(<SpacePage />);
    const rows = showcaseRows(container);
    rows.forEach((row) => {
      const figure = row.querySelector("figure") as HTMLElement;
      const img = within(figure).getByRole("img");
      expect(img.getAttribute("aria-label") ?? img.getAttribute("alt")).toBeTruthy();
      expect(figure.querySelector("figcaption")?.textContent?.length).toBeGreaterThan(20);
    });
    const apex = rows[5];
    const photo = apex.querySelector("img") as HTMLImageElement;
    expect(photo.getAttribute("src")).toMatch(/apex-hardware-01-768\.jpg$/);
    // The approved caption only: the photograph is not claimed to be the 5 kN-class demonstrator.
    expect(apex.querySelector("figcaption")?.textContent).toMatch(/^APEX propulsion development hardware in the workshop\./);
    // Illustrations are labelled for what they simplify.
    expect(rows[0].querySelector("figcaption")?.textContent).toMatch(/to scale with Earth; satellites enlarged/);
    expect(rows[2].querySelector("figcaption")?.textContent).toMatch(/Not to scale/);
    expect(rows[4].querySelector("figcaption")?.textContent).toMatch(/Not a model of any real station/);
    expect(rows[6].querySelector("figcaption")?.textContent).toMatch(/not a real engine/);
  });

it("shows the Space Station row immediately after the CubeTwin row", () => {
    const { container } = render(<SpacePage />);
    const simulations = container.querySelector("#simulations") as HTMLElement;
    const cubetwin = rowOf(within(simulations).getByRole("link", { name: "Explore CubeTwin" }));
    const stationLink = within(simulations).getByRole("link", { name: /Explore Space Station/ });
    expect(stationLink).toHaveAttribute("href", "/space/space-station");
    expect(cubetwin.nextElementSibling).toBe(rowOf(stationLink));
    expect(within(rowOf(stationLink)).getByRole("heading", { level: 3 })).toHaveTextContent("Space Station");
  });

it("shows the flagship Satellite Engineering row immediately after Space Applications and before Model Rocketry", () => {
    const { container } = render(<SpacePage />);
    const simulations = container.querySelector("#simulations") as HTMLElement;
    const satelliteLink = within(simulations).getByRole("link", { name: /Explore Satellite Engineering/ });
    expect(satelliteLink).toHaveAttribute("href", "/space/satellite-engineering");
    const row = rowOf(satelliteLink);
    expect(row).toHaveAttribute("data-flagship");
    expect(within(row).getByText("Flagship Advanced Program")).toBeInTheDocument();
    expect(within(row).getByText("From First Principles to Spacecraft Systems Architect")).toBeInTheDocument();
    expect(within(row).getByText(/Architecture & Leadership Track · Systems Leads · CTO · Chief Architect/)).toBeInTheDocument();
    expect(within(row.previousElementSibling as HTMLElement).getByRole("heading", { level: 3 })).toHaveTextContent("Space Applications");
    expect(within(row.nextElementSibling as HTMLElement).getByRole("heading", { level: 3 })).toHaveTextContent("Model Rocketry");
  });

it("links to the Next-Generation Rocket Engine Digital Twin from the simulations section and reports the click", () => {
    const { container } = render(<SpacePage />);
    const simulations = container.querySelector("#simulations") as HTMLElement;
    const link = within(simulations).getByRole("link", { name: "Explore Rocket Engine Digital Twin" });
    expect(link).toHaveAttribute("href", "/space/rocket-engine-digital-twin");
    expect(link).toHaveAttribute("data-track-event", "space_project_card_click");
    expect(link).toHaveAttribute("data-track-project", "rocket_engine_digital_twin");
    expect(link).toHaveAttribute("data-track-placement", "simulation_projects");
    const row = rowOf(link);
    expect(within(row).getByRole("heading", { level: 3 })).toHaveTextContent("Next-Generation Rocket Engine Digital Twin");
    expect(within(row).getByText("Educational demonstrator · Reference and simulated data · Not a real engine.")).toBeInTheDocument();
    // The row follows Space Station and the APEX row next to it.
    const apexRow = rowOf(within(simulations).getByRole("link", { name: /Explore APEX Collaboration Concept/ }));
    expect(rowOf(within(simulations).getByRole("link", { name: /Explore Space Station/ })).nextElementSibling).toBe(apexRow);
    expect(apexRow.nextElementSibling).toBe(row);
  });

it("places the APEX Rocket Systems row next to Space Station, linking to the APEX microsite and to APEX's official website", () => {
    const { container } = render(<SpacePage />);
    const simulations = container.querySelector("#simulations") as HTMLElement;
    const link = within(simulations).getByRole("link", { name: /Explore APEX Collaboration Concept/ });
    expect(link).toHaveAttribute("href", "/space/partners/apexrocketsystems");
    expect(link).toHaveAttribute("data-track-event", "space_project_card_click");
    expect(link).toHaveAttribute("data-track-project", "apex_rocket_systems");
    const row = rowOf(link);
    expect(within(row).getByRole("heading", { level: 3 })).toHaveTextContent("APEX Rocket Systems");
    expect(within(row).getByText("Rocket Propulsion · Integrated Launch Systems")).toBeInTheDocument();
    const official = within(row).getByRole("link", { name: /Official website/ });
    expect(official).toHaveAttribute("href", "https://www.apexrocketsystems.com/");
    expect(official).toHaveAttribute("target", "_blank");
    expect(official).toHaveAttribute("rel", "noopener noreferrer");
    expect(row.textContent).toMatch(/Engineering collaboration with Gamyaa AeroSystems/);
    expect(row.textContent).not.toMatch(/hot-fired|flight-qualified|launch-ready|ishavasyam/i);
  });

it("lists the partners in a Partners & Engineering Ecosystem section, each in its own role: Gamyaa AeroSystems in an engineering collaboration, the rest proposed", () => {
    const { container } = render(<SpacePage />);
    const section = container.querySelector("#partners") as HTMLElement;
    expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent("Partners & Engineering Ecosystem");
    const text = section.textContent ?? "";
    expect(text).toMatch(/Rocket Propulsion · Integrated Launch Systems/);
    expect(text).toMatch(/Digital Engineering · Digital Twin · Quality/);
    expect(text).toMatch(/Embedded Systems · Firmware/);
    expect(text).toMatch(/Cybersecurity · AI/);
    expect(text).toMatch(/Skills · Internships · Academia/);
    expect(text).toMatch(/APEX Rocket Systems and Gamyaa AeroSystems are working together in an engineering collaboration/);
    expect(text).toMatch(/proposed\s+capability partners unless otherwise confirmed/);
    expect(text).not.toMatch(/no formal agreement is implied|collaboration proposal/i);
    expect(text).not.toMatch(/official technology partner|joint venture|strategic alliance/i);
    const gamyaa = within(section).getByRole("heading", { name: "Gamyaa AeroSystems" }).parentElement as HTMLElement;
    expect(gamyaa.textContent).toMatch(/Engineering Collaboration/);
    expect(gamyaa.textContent).not.toMatch(/Proposed/);
    const ifab = within(section).getByRole("heading", { name: "iFab Innovations Private Limited" }).parentElement as HTMLElement;
    expect(ifab.textContent).toMatch(/Proposed Capability Partner/);
  });

it("places the Advanced Rocket Propulsion Digital Twin row immediately after the Rocket Engine Digital Twin row, as the last row", () => {
    const { container } = render(<SpacePage />);
    const simulations = container.querySelector("#simulations") as HTMLElement;
    const link = within(simulations).getByRole("link", { name: "Explore Advanced Digital Twin" });
    expect(link).toHaveAttribute("href", "/space/rocket-engine-digital-twin-advanced");
    expect(link).toHaveAttribute("data-track-event", "space_project_card_click");
    expect(link).toHaveAttribute("data-track-project", "rocket_propulsion_digital_twin_advanced");
    expect(link).toHaveAttribute("data-track-placement", "simulation_projects");
    const row = rowOf(link);
    expect(within(row).getByRole("heading", { level: 3 })).toHaveTextContent("Advanced Rocket Propulsion Digital Twin");
    expect(within(row).getByText("Build a physics-based, data-driven and AI/ML-assisted Digital Twin for an end-to-end rocket propulsion system, with a focus on pressure monitoring, fault detection, diagnosis and prognostics.")).toBeInTheDocument();
    expect(within(row).getByText("Physics · Pressure Monitoring · AI/ML · FDIR · Prognostics")).toBeInTheDocument();
    // Fundamentals first, then advanced: the two rows are neighbours, and the advanced row is the last.
    const rocketRow = rowOf(within(simulations).getByRole("link", { name: "Explore Rocket Engine Digital Twin" }));
    expect(rocketRow.nextElementSibling).toBe(row);
    expect(row.nextElementSibling).toBeNull();
  });

it("positions the advanced row as the next step, with a propulsion visual and no claim to be any agency's engine", () => {
    const { container } = render(<SpacePage />);
    const simulations = container.querySelector("#simulations") as HTMLElement;
    const row = rowOf(within(simulations).getByRole("link", { name: "Explore Advanced Digital Twin" }));
    const progression = within(row).getByText("Understand the Engine").parentElement as HTMLElement;
    expect(progression).toHaveTextContent(/Understand the Engine\s*, then\s*Engineer the Digital Twin/);
    expect(within(row).getByRole("img", { name: /pressure sensors.*harness.*controller/i })).toBeInTheDocument();
    // Its still drawing (shown before or instead of 3D) is the propulsion twin drawing.
    expect(row.querySelector('svg[aria-label*="Digital Twin"]')).not.toBeNull();
    expect(within(row).getByText("Advanced educational and research-oriented reference architecture · Simulated data · Not a proprietary or flight engine.")).toBeInTheDocument();
    expect(row.textContent).not.toMatch(/SpaceX|NASA|ISRO/);
  });

it("lays the showcase out one tutorial per row, 50/50 from 861px, at most 1,440px wide, stacking with the visual first on phones", () => {
    const css = readFileSync(resolve(import.meta.dirname, "components/showcase/showcase.module.css"), "utf-8");
    expect(css).toMatch(/\.showcase \{[^}]*flex-direction: column;[^}]*max-width: 1440px;/);
    expect(css).toMatch(/\.card \{[^}]*grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\);/);
    expect(css).toMatch(/@media \(max-width: 860px\) \{\s*\.showcase \{[^}]*\}\s*\.card \{ grid-template-columns: minmax\(0, 1fr\);/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    // The visual comes first in each row's markup, so it is first when the row stacks.
    const { container } = render(<SpacePage />);
    showcaseRows(container).forEach((row) => expect(row.querySelector("article")?.firstElementChild?.tagName).toBe("FIGURE"));
  });

it("does not import the advanced propulsion twin into the Space page: its 3D loads only on demand, and its still is an inline drawing", () => {
    const source = readFileSync(resolve(import.meta.dirname, "SpaceLanding.tsx"), "utf-8");
    expect(source).not.toMatch(/propulsion-twin-advanced/);
    const visual = readFileSync(resolve(import.meta.dirname, "components/PropulsionTwinCardVisual.tsx"), "utf-8");
    expect(visual).not.toMatch(/^import /m);
  });

it("does not import the rocket engine experience into the Space page: the showcase's 3D chunk is loaded lazily, in the browser only", () => {
    const source = readFileSync(resolve(import.meta.dirname, "SpaceLanding.tsx"), "utf-8");
    expect(source).not.toMatch(/rocket-engine-twin/);
    const showcase = readFileSync(resolve(import.meta.dirname, "components/showcase/TutorialShowcase.tsx"), "utf-8");
    expect(showcase).not.toMatch(/rocket-engine-twin|ShowcaseCanvas/);
    const visual = readFileSync(resolve(import.meta.dirname, "components/showcase/ShowcaseVisual.tsx"), "utf-8");
    expect(visual).toMatch(/dynamic\(\(\) => import\("\.\/ShowcaseCanvas"\), \{ ssr: false \}\)/);
  });

it("gives each of the four pathway categories its own call to action, with Discover leading to Space Academy", () => {
    const { container } = render(<SpacePage />);
    const pathway = container.querySelector("#pathway") as HTMLElement;
    const cards = within(pathway).getAllByRole("article");
    expect(cards.map((c) => within(c).getByRole("heading", { level: 3 }).textContent)).toEqual(["Ages 14–18", "Higher Education", "Applied Teams", "Young Founders"]);
    // Each pathway's own call to action (Discover's picture also links straight to Mission 1).
    const ctas = cards.map((c) => c.querySelector('a[data-track-event="space_pathway_cta_click"]') as HTMLAnchorElement);
    expect(cards.map((c) => c.querySelectorAll('a[data-track-event="space_pathway_cta_click"]').length)).toEqual([1, 1, 1, 1]);
    expect(within(cards[0]).getByRole("link", { name: /Play Mission 1/ })).toHaveAttribute("href", "/space/academy/missions/build-your-first-cubesat");
    expect(new Set(ctas.map((a) => a.textContent)).size).toBe(4);
    expect(ctas[0]).toHaveTextContent("Explore Space Academy");
    expect(ctas[0]).toHaveAttribute("href", "/space/academy");
    expect(ctas[1]).toHaveAttribute("href", "#internships");
    expect(ctas[2]).toHaveAttribute("href", "#research");
    expect(ctas[3]).toHaveAttribute("href", "https://forms.gle/GZbPDHd7qozGSZuJA");
    expect(ctas[3]).toHaveAttribute("rel", "noopener noreferrer");
    ctas.forEach((a) => expect(a).toHaveAttribute("data-track-event", "space_pathway_cta_click"));
  });

it("leads into Space Academy from the hero and the Ages 14–18 section, and keeps the planned programme labelled", () => {
    const { container } = render(<SpacePage />);
    const hero = container.querySelector("#home") as HTMLElement;
    expect(within(hero).getByRole("link", { name: /Enter Space Academy.*Ages 14–18/ })).toHaveAttribute("href", "/space/academy");
    const education = container.querySelector("#education") as HTMLElement;
    expect(within(education).getByRole("link", { name: /Explore Space Academy/ })).toHaveAttribute("href", "/space/academy");
    expect(within(education).getByText("Planned Programme")).toBeInTheDocument();
    expect(education.textContent).toMatch(/Online classes and CanSat and Model Rocketry workshops are planned/);
    // Each playable mission is one tap from the portal.
    const missions = within(education).getByRole("list", { name: "Interactive 3D missions" });
    expect(within(missions).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "/space/academy/missions/build-your-first-cubesat",
      "/space/academy/missions/survive-the-eclipse",
      "/space/academy/missions/stable-model-rocket",
    ]);
  });

it("offers an 'On this page' section navigation whose links all resolve", () => {
    render(<SpacePage />);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    const links = within(nav).getAllByRole("link");
    // Short on purpose: the audiences' main destinations, not every section.
    expect(links.length).toBeGreaterThanOrEqual(6);
    expect(links.length).toBeLessThanOrEqual(9);
    links.filter((a) => a.getAttribute("href")?.startsWith("#")).forEach((a) => expect(document.getElementById((a.getAttribute("href") as string).slice(1))).not.toBeNull());
    expect(within(nav).getByRole("link", { name: "Space Academy" })).toHaveAttribute("href", "/space/academy");
  });

it("keeps the long mission explanation in the HTML behind a native disclosure", () => {
    const { container } = render(<SpacePage />);
    const details = Array.from(container.querySelectorAll("#mission details")).find((d) => d.querySelector("summary")?.textContent === "Why spacecraft need this") as HTMLDetailsElement;
    expect(details).not.toBeNull();
    expect(details.open).toBe(false);
    expect(details.textContent).toMatch(/Fault Detection, Isolation and Recovery \(FDIR\)/);
  });

it("turns the six-stage loop into connected, keyboard-operable stages that drive one illustrative, simulated scenario", async () => {
    const user = userEvent.setup();
    const { container } = render(<SpacePage />);
    const mission = container.querySelector("#mission") as HTMLElement;
    expect(within(mission).getByRole("heading", { level: 2 })).toHaveTextContent("Can a spacecraft understand its own health and recover safely?");
    expect(within(mission).getByText("Observe. Diagnose. Recover. Verify.")).toBeInTheDocument();
    const science = Array.from(mission.querySelectorAll("details")).find((d) => d.querySelector("summary")?.textContent === "Learn the science") as HTMLDetailsElement;
    expect(science.open).toBe(false);
    expect(science.textContent).toMatch(/Autonomous Spacecraft Health Management is the capability to observe spacecraft telemetry/);

    const loop = within(mission).getByRole("tablist", { name: "The six-stage health-management loop" });
    const tabs = within(loop).getAllByRole("tab");
    expect(tabs.map((t) => t.textContent?.replace(/^\d+/, ""))).toEqual(["Observe telemetry", "Detect anomaly", "Diagnose fault", "Predict impact", "Recover safely", "Verify recovery"]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    // Every stage's explanation is in the HTML; only the selected one shows.
    expect(mission.querySelectorAll('[role="tabpanel"]')).toHaveLength(6);
    expect(mission.querySelectorAll('[role="tabpanel"][hidden]')).toHaveLength(5);

    await user.click(tabs[2]);
    const diagnose = document.getElementById("health-panel-diagnose") as HTMLElement;
    expect(diagnose).not.toHaveAttribute("hidden");
    expect(diagnose.textContent).toMatch(/cell 2 at 2\.92 V against 3\.98 V/);
    tabs[2].focus();
    await user.keyboard("{ArrowRight}");
    expect(tabs[3]).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(tabs[3]);

    // A subsystem can be inspected at any stage.
    await user.click(within(mission).getByRole("button", { name: "Thermal" }));
    expect(within(mission).getByRole("button", { name: "Thermal" })).toHaveAttribute("aria-pressed", "true");
    expect(mission.textContent).toMatch(/Battery temperature 27 °C/);

    // It says what it is, and what it is not.
    expect(mission.textContent).toMatch(/Not data from any spacecraft, and not a validated or flight-ready autonomy system\./);
    expect(within(mission).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(expect.arrayContaining(["Advisory", "Supervised", "Bounded Autonomy"]));
    expect(mission.textContent).toMatch(/Generative AI must not directly control a safety-critical spacecraft loop\./);
  });

it("shows the four pathways as full-width rows, each with its own visual, three themes up front and every item under About this pathway", () => {
    const { container } = render(<SpacePage />);
    const rows = Array.from(container.querySelectorAll("#pathway article[data-pathway]")).map((a) => a.closest("li")) as HTMLElement[];
    expect(rows).toHaveLength(4);
    const labels = rows.map((r) => (r.querySelector("[role=img]") as HTMLElement).getAttribute("aria-label"));
    expect(new Set(labels).size).toBe(4);
    const all = [
      ["Spacecraft systems", "Sensors and telemetry", "Faults, redundancy and safe mode", "Mission-health challenge"],
      ["Simulator and telemetry engineering", "Digital twins", "Fault detection, isolation and recovery", "Hardware-in-the-loop validation"],
      ["Verified algorithms", "Fault libraries and datasets", "Papers and patent candidates", "Academic and industry validation"],
      ["Customer discovery", "Validated prototype", "Responsible incubation", "Space products and services"],
    ];
    rows.forEach((row, i) => {
      expect(within(row).getByRole("list", { name: "Key themes" }).querySelectorAll("li")).toHaveLength(3);
      const about = row.querySelector("details") as HTMLDetailsElement;
      expect(about.querySelector("summary")?.textContent).toBe("About this pathway");
      expect(Array.from(about.querySelectorAll("li")).map((li) => li.textContent)).toEqual(all[i]);
      expect(row.querySelector("figure")).not.toBeNull();
    });
    expect(within(rows[0]).getByText("Seven learning tracks and interactive 3D missions.")).toBeInTheDocument();
    expect(within(rows[3]).getByText("Records interest only; it does not confirm selection.")).toBeInTheDocument();
  });

it("presents Space Academy as one feature: two age groups, the three playable missions, one way in, and the planned programme still labelled", () => {
    const { container } = render(<SpacePage />);
    const education = container.querySelector("#education") as HTMLElement;
    expect(within(education).getByRole("heading", { level: 2 })).toHaveTextContent("Your mission starts in Space Academy");
    expect(within(education).getByRole("list", { name: "Two age groups" }).textContent).toMatch(/Ages 14–16.*Ages 17–18/);
    const missions = within(within(education).getByRole("list", { name: "Interactive 3D missions" }).parentElement as HTMLElement).getAllByRole("link").filter((a) => a.getAttribute("href")?.includes("/missions/"));
    expect(missions.map((a) => a.textContent)).toEqual(["Mission 1 · playable nowBuild Your First CubeSat", "Mission 2 · playable nowSurvive the Eclipse", "Mission 3 · playable nowDesign a Stable Model Rocket"]);
    expect(within(education).getAllByRole("link", { name: /Explore Space Academy/ })).toHaveLength(1);
    const explorers = Array.from(education.querySelectorAll("details")).find((d) => /Space Health Explorers/.test(d.querySelector("summary")?.textContent ?? "")) as HTMLDetailsElement;
    expect(explorers.open).toBe(false);
    expect(explorers.querySelector("summary")?.textContent).toMatch(/Planned Programme/);
    expect(explorers.textContent).toMatch(/Space Health Explorers is a planned programme for students aged 14–18/);
  });

it("makes the Discover hero a playable 3D exhibit: four stages, five parts to find, and the Mission 1 button", async () => {
    const user = userEvent.setup();
    const { container } = render(<SpacePage />);
    const row = (container.querySelector('#pathway article[data-pathway="discover"]') as HTMLElement).closest("li") as HTMLElement;
    expect(within(within(row).getByRole("group", { name: "Animation stages" })).getAllByRole("button").map((b) => b.textContent?.replace(/^\d/, ""))).toEqual(["Discover", "Explore", "Experiment", "Mission"]);
    const parts = within(row).getByRole("group", { name: "Find a part" });
    expect(within(parts).getAllByRole("button").map((b) => b.textContent)).toEqual(["Solar panels", "Battery", "Flight computer", "Sensors", "Antenna"]);
    await user.click(within(parts).getByRole("button", { name: "Battery" }));
    expect(within(row).getByText(/Stores energy for the eclipse/)).toBeInTheDocument();
    expect(within(row).getByRole("button", { name: "Exploded view" })).toHaveAttribute("aria-pressed", "false");
    expect(within(row).getByRole("link", { name: /Play Mission 1/ })).toHaveAttribute("href", "/space/academy/missions/build-your-first-cubesat");
    expect(row.querySelector("figcaption")?.textContent).toMatch(/educational 1U CubeSat model.*not flight hardware.*simulated.*Not to scale/);
  });
