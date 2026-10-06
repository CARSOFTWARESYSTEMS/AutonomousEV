import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships" }));
vi.mock("next/font/google", () => ({ Manrope: () => ({ variable: "font-display" }), Inter: () => ({ variable: "font-inter" }) }));
// The lazy wrappers load their modules on demand; here the same components are used directly.
vi.mock("@/components/aqip/interactive/Lazy", async () => ({
  QualityGraph: (await import("@/components/aqip/interactive/QualityGraph")).default,
  DigitalThreadSimulator: (await import("@/components/aqip/interactive/DigitalThreadSimulator")).default,
  CustomerScorecard: (await import("@/components/aqip/interactive/CustomerScorecard")).default,
  RoiCalculator: (await import("@/components/aqip/interactive/RoiCalculator")).default,
  InspectionTwin: (await import("@/components/aqip/interactive/InspectionTwin")).default,
}));

import Footer from "@/components/Footer";
import { AGENTS } from "@/components/aqip/data/ai";
import { CHAPTERS, FAQ, NAV, SOURCES } from "@/components/aqip/data/reference";
import { FEATURES } from "@/components/aqip/data/twin";
import { MATURITY_ORDER, TONE_LABEL } from "@/components/aqip/types";
import { buildInternshipsGraph } from "@/lib/structured-data/internshipsGraph";
import sitemap from "../../sitemap";
import InternshipsPage from "../page";
import Page, { metadata } from "./page";
import { structuredData } from "./seo";

const ROUTE = "/internships/aerospace-quality-intelligence-platform";
const CANONICAL = `https://autonomous.ev.engineer${ROUTE}`;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const renderPage = () => render(<Page />);
const root = (container: HTMLElement) => container.querySelector<HTMLElement>("#aqip-root")!;
// The page draws its own chrome: AQIP's header, the manual, and AQIP's footer.
const header = (container: HTMLElement) => container.querySelector<HTMLElement>("#aqip-root > header")!;
const main = (container: HTMLElement) => container.querySelector<HTMLElement>("#aqip-root > main")!;
const footer = (container: HTMLElement) => container.querySelector<HTMLElement>("#aqip-root > footer")!;
const block = (container: HTMLElement, id: string) => container.querySelector<HTMLElement>(`[id="${id}"]`)!;
const pairs = (list: HTMLElement) => Object.fromEntries(within(list).getAllByRole("term").map((term) => [term.textContent, term.nextElementSibling?.textContent]));

describe("AQIP page: structure", () => {
  it("has one H1 that names AQIP in full, and never skips a heading level", () => {
    const { container } = renderPage();
    expect(screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual(["AQIP Aerospace Quality Intelligence Platform"]);
    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"), (h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    levels.reduce((previous, level) => {
      expect(level - previous, `h${previous} followed by h${level}`).toBeLessThanOrEqual(1);
      return level;
    });
    expect(container.querySelectorAll("h5, h6")).toHaveLength(0);
  });

  it("shows a breadcrumb back to the internships hub and to the Space & Aerospace tracks", () => {
    renderPage();
    const crumbs = within(screen.getByRole("navigation", { name: "Breadcrumb" })).getAllByRole("listitem");
    expect(crumbs.map((crumb) => crumb.textContent)).toEqual(["Internships", "Space & Aerospace", "AQIP"]);
    expect(within(crumbs[0]).getByRole("link")).toHaveAttribute("href", "/internships");
    expect(within(crumbs[1]).getByRole("link")).toHaveAttribute("href", "/internships#space-aerospace-engineering");
    expect(crumbs[2]).toHaveAttribute("aria-current", "page");
  });

  it("has its own header in place of the site navbar, one main landmark, and its own footer", () => {
    const { container } = renderPage();
    const top = header(container);
    expect(within(top).getByRole("link", { name: /^AQIP: Aerospace Quality Intelligence Platform/ })).toBeInTheDocument();
    expect(within(within(top).getByRole("navigation", { name: "AQIP" })).getAllByRole("link").map((link) => link.textContent)).toEqual(["Strategy", "Product", "Roadmap", "Customers", "Business", "Leadership", "Execution"]);
    expect(within(top).getByRole("button", { name: "Ecosystem" })).toBeInTheDocument();
    expect(within(top).getByRole("link", { name: "Discuss AQIP" })).toHaveAttribute("href", "/consulting");
    // None of the EV.ENGINEER navbar: no wordmark, no Training, EV Career or Gallery.
    expect(top.textContent).not.toMatch(/EV\.ENGINEER™?\s*$|Training|EV Career|Gallery|Workshops/);
    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toEqual([footer(container)]);
    // Header, main and footer, in that order, and nothing else that a reader would see.
    expect(Array.from(root(container).children, (child) => child.tagName).filter((tag) => tag !== "NOSCRIPT")).toEqual(["HEADER", "MAIN", "FOOTER"]);
    // AQIP's footer, not the site's recoloured: its own identity and none of the EV.ENGINEER columns or the dead link.
    expect(footer(container)).toHaveTextContent("AQIPAerospace Quality Intelligence PlatformThe Trust Infrastructure for Aerospace & Defence Manufacturing");
    expect(footer(container)).not.toHaveTextContent(/Production-grade training|AV Simulations|Corporate Training/);
    expect(container.querySelector('a[href="/simulations"]')).toBeNull();
  });

  it("leads the hero with two actions and one quieter link", () => {
    const { container } = renderPage();
    const hero = container.querySelector<HTMLElement>("#top")!;
    const links = Array.from(hero.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    expect(links.map((link) => [link.textContent, link.getAttribute("href"), link.getAttribute("data-kind")])).toEqual([
      ["Explore Strategy", "#overview", "primary"],
      ["View Product Architecture", "#architecture", "secondary"],
      ["Customer Discovery Playbook", "#customer-discovery", null],
    ]);
    expect(within(hero).getByText("Aerospace & Defence • Quality Intelligence")).toBeInTheDocument();
    expect(within(within(hero).getByRole("list", { name: "How AQIP works" })).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["AI-Assisted", "Digital Thread", "Human Verified"]);
    expect(within(within(hero).getByRole("list", { name: /^The digital thread/ })).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Engineering", "Manufacturing", "Inspection", "Measurement", "Evidence", "Acceptance"]);
  });

  it("groups the twenty sections into seven chapters, each section a labelled landmark", () => {
    const { container } = renderPage();
    const chapters = Array.from(container.querySelectorAll<HTMLElement>("[data-chapter]"));
    expect(chapters.map((chapter) => chapter.id)).toEqual(CHAPTERS.map((chapter) => chapter.id));
    expect(chapters.map((chapter) => Array.from(chapter.querySelectorAll(":scope > div > section"), (section) => section.id))).toEqual(CHAPTERS.map((chapter) => [...chapter.sections]));
    for (const item of NAV) {
      const section = container.querySelector(`[id="${item.id}"]`);
      expect(section, item.id).not.toBeNull();
      expect(section!.tagName).toBe("SECTION");
      expect(document.getElementById(section!.getAttribute("aria-labelledby")!)?.tagName).toBe("H2");
    }
    // Every chapter's sections are in the document whether or not a phone has the chapter open.
    for (const chapter of chapters) expect(chapter.querySelector("[data-aqip-chapter-body]")!.children.length).toBeGreaterThan(0);
    // The Product chapter now carries the three pillars added to the manual, numbered in the handbook's order.
    expect(chapters[1].querySelectorAll(":scope > div > section")).toHaveLength(5);
    expect(Array.from(chapters[1].querySelectorAll(":scope > div > section > div > header > p:first-child"), (kicker) => kicker.textContent)).toEqual(["2.1 Product", "2.2 3D Inspection Twin", "2.3 Quality Graph", "2.4 AI Assurance", "2.5 Cybersecurity"]);
  });

  it("replaces the old row of seventeen pills with the current chapter's sections and a full table of contents", () => {
    renderPage();
    const nav = screen.getByRole("navigation", { name: "Chapters and sections" });
    expect(within(within(nav).getByRole("list", { name: "Sections in Strategy" })).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(["#overview", "#opportunity", "#problems"]);
    const contents = document.getElementById(within(nav).getAllByRole("button")[0].getAttribute("aria-controls")!)!;
    expect(contents).toHaveAttribute("hidden");
    const hrefs = Array.from(contents.querySelectorAll("a"), (link) => link.getAttribute("href"));
    expect(hrefs).toHaveLength(CHAPTERS.length + NAV.length);
    for (const item of NAV) expect(hrefs, item.id).toContain(`#${item.id}`);
    expect(screen.queryByRole("navigation", { name: "Strategy index" })).toBeNull();
  });

  it("points every in-page link at something that exists", () => {
    const { container } = renderPage();
    const targets = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'), (a) => a.getAttribute("href")!.slice(1));
    expect(targets.length).toBeGreaterThan(20);
    for (const id of targets) expect(document.getElementById(id), `#${id}`).not.toBeNull();
  });

  it("links internally only to pages in the sitemap, and opens external links safely in a new tab", () => {
    const { container } = renderPage();
    // Header and manual first; the footer's links are checked after them.
    const own = [header(container), main(container)];
    const known = new Set(sitemap().map((entry) => new URL(entry.url).pathname));
    const internal = own.flatMap((part) => Array.from(part.querySelectorAll<HTMLAnchorElement>('a[href^="/"]'), (a) => a.getAttribute("href")!.split("#")[0]));
    expect(internal).toEqual(expect.arrayContaining(["/contact", "/consulting", "/about/sudarshana-karkala", "/", "/internships"]));
    for (const href of internal) expect(known.has(href), href).toBe(true);
    const external = own.flatMap((part) => Array.from(part.querySelectorAll<HTMLAnchorElement>('a[href^="http"]')));
    // The sources, then UFlight, EV Society and iTelematics in both the Ecosystem menu and the attribution.
    expect(external.length).toBe(SOURCES.length + 3 + 3);
    // The footer: the three ecosystem sites again, and the fees FAQ the site footer has always carried.
    const footerInternal = Array.from(footer(container).querySelectorAll<HTMLAnchorElement>('a[href^="/"]'), (a) => a.getAttribute("href")!);
    expect(new Set(footerInternal)).toEqual(new Set(["/", "/contact", "/consulting", "/about/sudarshana-karkala", "/trust-center", "/about"]));
    for (const href of footerInternal) expect(known.has(href), href).toBe(true);
    const footerExternal = Array.from(footer(container).querySelectorAll<HTMLAnchorElement>('a[href^="http"]'));
    expect(footerExternal).toHaveLength(4);
    for (const link of [...external, ...footerExternal]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.textContent).toContain("(opens in a new tab)");
    }
  });

  it("no longer sends anyone to the deleted /simulations page from the site's shared footer", () => {
    const { container } = render(<Footer />);
    const known = new Set(sitemap().map((entry) => new URL(entry.url).pathname));
    const internal = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="/"]'), (a) => a.getAttribute("href")!);
    expect(internal).not.toContain("/simulations");
    expect(internal.length).toBeGreaterThan(5);
    for (const href of internal) expect(known.has(href), href).toBe(true);
  });

  it("gives every control an accessible name and every image a text alternative", () => {
    const { container } = renderPage();
    // Buttons, links and summaries are named by their text, or by a label when they have none.
    // Controls that are not currently offered (the index's scroll buttons at rest) are not exposed at all.
    for (const control of container.querySelectorAll<HTMLElement>("button:not([hidden]), a, summary")) {
      expect(control.textContent?.trim() || control.getAttribute("aria-label"), control.outerHTML.slice(0, 120)).toBeTruthy();
    }
    // Form fields are named by a label, which only the accessibility tree can confirm.
    const fields = container.querySelectorAll<HTMLElement>("input, select");
    expect(fields.length).toBeGreaterThan(70);
    for (const field of fields) expect(field, field.outerHTML.slice(0, 120)).toHaveAccessibleName();
    for (const image of screen.getAllByRole("img")) expect(image).toHaveAccessibleName();
    for (const svg of container.querySelectorAll("svg")) expect(svg).toHaveAttribute("aria-hidden", "true");
  }, 20000);
});

describe("AQIP page: content", () => {
  it("states the positioning, philosophy and safety principle from the brief", () => {
    const { container } = renderPage();
    const text = main(container).textContent!;
    for (const statement of [
      "The Trust Infrastructure for Aerospace & Defence Manufacturing",
      "Help aerospace manufacturers prove that every part was built exactly as engineering intended.",
      "From requirement to evidence, supplier to OEM, and factory to field.",
      "AI interprets • Humans approve • Software proves",
      "Zero Silent AI Approval",
      "AI must never silently release a controlled aerospace quality record.",
      "FAI is the initial market entry wedge.",
      "The major problem is not paperwork itself.",
      "Customer engineering data must not be used for general AI model training without explicit authorisation.",
      "Any supported critical characteristic requires human reconciliation before release.",
      "An OEM/customer asks suppliers to use AQIP.",
      "Capital should accelerate something that is already working.",
      "Verified Engineering Characteristics Under Control",
      // The final strategic message, in its three statements and its long-term aim.
      "AQIP is not simply FAI software.",
      "AQIP connects engineering drawings, interactive 3D inspection intelligence, manufacturing quality evidence, cybersecurity and human-controlled AI into one trusted digital thread.",
      "We help aerospace manufacturers prove that every part was built exactly as engineering intended.",
      "AQIP aims to become the trusted quality intelligence infrastructure for aerospace and defence manufacturing — from requirement to evidence, 2D drawing to 3D inspection twin, supplier to OEM, and factory to field.",
      // The three pillars' own statements.
      "Illustrative engineering reconstruction. Not authoritative CAD geometry.",
      "The source drawing remains authoritative unless an approved CAD or MBD model is explicitly supplied.",
      "FAI should be understandable spatially, not only through tables and PDFs.",
      "An honest “Unable to determine” is better than inventing geometry.",
      "Digital trust is part of manufacturing quality.",
      "Quality evidence is only valuable if its digital integrity can be trusted.",
      "Treat file ingestion as a cybersecurity boundary.",
      "3D reconstruction must not send customer drawings to uncontrolled external AI providers.",
      "AI may assist. Deterministic workflow controls release.",
      "Why did the system propose this?",
      "Trust in how aerospace products were built.",
    ]) {
      expect(text, statement).toContain(statement);
    }
    expect(screen.getAllByText("FAI Engineer").length).toBeGreaterThan(0);
    expect(text).toContain("Aerospace Quality Network");
    expect(text).toContain("Aerospace Manufacturing Trust Infrastructure");
    // The strategic progression, seven steps, where the manual opens and where it closes.
    const steps = ["FAI Engineer", "Drawing Intelligence", "3D Inspection Twin", "AQIP", "Secure Aerospace Quality Intelligence", "Supplier Quality Network", "Aerospace Manufacturing Trust Infrastructure"];
    for (const id of ["strategic-progression", "closing"]) {
      const flow = within(block(container, id)).getByRole("list", { name: new RegExp(steps.join(" to ")) });
      expect(Array.from(flow.querySelectorAll(":scope > li > span:first-child"), (label) => label.textContent)).toEqual(steps);
    }
    expect(within(block(container, "principles-final")).getAllByRole("heading", { level: 4 }).map((heading) => heading.textContent)).toEqual(["Quality", "Visual engineering", "Human authority", "Cybersecurity", "AI assurance", "Intelligence", "Trust"]);
    expect(block(container, "principles-final")).toHaveTextContent("AQIP's ultimate product is not a PDF, not a 3D model, not an AI agent and not a QMS.");
  });

  it("makes none of the claims the brief rules out, and invents no market size", () => {
    const { container } = renderPage();
    const text = main(container).textContent!;
    expect(text).not.toMatch(/world['’]s first|nobody has done|only solution|guaranteed compliance|AI replaces quality engineers|market leader|award[- ]winning/i);
    expect(header(container).textContent).not.toMatch(/world['’]s first|only solution|guaranteed/i);
    expect(text).not.toMatch(/\b(TAM|SAM|SOM)\b[^.]*\d/);
    expect(text).not.toMatch(/\$\s?\d|billion|crore market/i);
    expect(text).toContain("This page gives no TAM, SAM or SOM figures.");
    // No certification is claimed, and none of the six capabilities the brief names is called production-ready.
    expect(text).not.toMatch(/(ISO ?27001|SOC ?2|CMMC|Nadcap|AS9100)[ -]?(certified|compliant|accredited)/i);
    expect(text).toContain("AQIP holds no external security certification today");
    expect(text).not.toMatch(/(is|are|now) (fully )?production[- ]ready/i);
    // Partnerships are never implied.
    expect(text).toContain("Potential customer discovery channel");
    expect(text).toContain("None of these organisations or events is a partner of AQIP.");
  });

  it("labels what exists, what is planned and what is only illustrative", () => {
    const { container } = renderPage();
    const maturity = container.querySelector<HTMLElement>("#maturity")!;
    expect(within(maturity).getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual(["FAI Engineer prototype foundations", "First AQIP capabilities", "Year 1 plan", "Years 2 and 3 plan", "Research directions", "Long-term vision"]);
    expect(Array.from(maturity.querySelectorAll("[data-tone]"), (chip) => chip.textContent)).toEqual(MATURITY_ORDER.map((tone) => TONE_LABEL[tone]));
    expect(maturity).toHaveTextContent("Not production-ready today");
    for (const capability of ["Automatic full drawing interpretation", "Advanced GD&T", "Autonomous inspection planning", "Broad CMM integration", "Supplier-quality network", "Predictive quality", "Autonomous agent execution", "2D-to-3D reconstruction", "Field-to-factory intelligence"]) {
      expect(within(within(maturity).getByRole("list", { name: "Capabilities that are not production-ready today" })).getByText(capability)).toBeInTheDocument();
    }

    const modules = container.querySelector<HTMLElement>("#modules")!;
    expect(within(modules).getAllByRole("listitem")).toHaveLength(15);
    expect(within(modules).getByText("Exists today in the FAI Engineer prototype. A foundation, not a production product.")).toBeInTheDocument();
    expect(within(within(modules).getByRole("heading", { level: 4, name: "3D Inspection Twin" }).closest("li")!).getByText("Research")).toBeInTheDocument();

    // Every chip on the page uses the agreed vocabulary: no bare "Now", "Next", "Later", "Available" or "Current".
    const chips = Array.from(main(container).querySelectorAll<HTMLElement>("[data-tone]"));
    expect(chips.length).toBeGreaterThan(80);
    for (const chip of chips) {
      expect(Object.keys(TONE_LABEL), chip.textContent ?? "").toContain(chip.getAttribute("data-tone"));
      expect(chip.textContent).not.toMatch(/^(Now|Next|Later|Available|Current)$/i);
    }

    expect(within(container.querySelector<HTMLElement>("#digital-thread")!).getByText("Illustrative synthetic demonstration")).toBeInTheDocument();
    expect(within(container.querySelector<HTMLElement>("#quality-policy-as-code")!).getByText("Long-Term Product Direction")).toBeInTheDocument();
    expect(within(container.querySelector<HTMLElement>("#evidence-api")!).getByText("Future Architecture Concept")).toBeInTheDocument();
    expect(within(container.querySelector<HTMLElement>("#network-model")!).getByText("Strategic Business Model — Future Scale")).toBeInTheDocument();
    expect(within(container.querySelector<HTMLElement>("#north-star")!).getByText("Illustrative future scale")).toBeInTheDocument();
    expect(within(container.querySelector<HTMLElement>("#revenue-model")!).getByText(/Illustrative commercial hypotheses — validate through customer discovery\./)).toBeInTheDocument();
    expect(within(container.querySelector<HTMLElement>("#risk-register")!).getAllByText(/has not been formally audited/).length).toBeGreaterThan(0);
  });

  it("keeps all ten problems and all ten roles in the document, whichever one is open", () => {
    const { container } = renderPage();
    const problems = container.querySelector<HTMLElement>("#top-10-problems")!;
    expect(within(problems).getAllByRole("region", { hidden: true })).toHaveLength(10);
    for (const field of ["Why it matters", "Current workflow", "Failure / risk", "AQIP solution", "Product module", "Customer benefit", "KPI to measure", "Product phase", "Long-term intelligence opportunity"]) {
      expect(within(problems).getAllByText(field, { ignore: "script" })).toHaveLength(10);
    }
    const roles = container.querySelector<HTMLElement>("#executive-roles")!;
    expect(within(roles).getAllByRole("button").map((button) => button.textContent)).toEqual(["Founder / CEO", "CTO", "Chief Quality Officer", "Chief Product Officer", "CISO", "Chief Sales Officer", "CMO", "CFO", "Customer Success", "Engineering / AI Team"]);
    expect(roles.textContent).toContain("CEO = Chief Customer Officer");
    expect(roles.textContent).toContain("Deterministic where correctness matters; AI where interpretation creates leverage.");
  });

  it("presents the risk register and comparison tables as real tables with headers", () => {
    const { container } = renderPage();
    const risks = within(container.querySelector<HTMLElement>("#risk-register")!).getByRole("table");
    expect(within(risks).getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["Risk", "Probability", "Impact", "Mitigation", "Owner", "Early warning indicator"]);
    expect(within(risks).getAllByRole("rowheader")).toHaveLength(16);
    const governance = within(container.querySelector<HTMLElement>("#ai-governance")!).getByRole("table");
    expect(within(governance).getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["Activity", "AI assist", "Controlled authority"]);
  });

  it("renders the FAQ visibly, with every answer in the document", () => {
    const { container } = renderPage();
    const faq = container.querySelector<HTMLElement>("#faq")!;
    expect(faq.querySelectorAll("details")).toHaveLength(19);
    for (const question of ["What is the 3D Inspection Twin?", "Can AQIP turn any 2D drawing into an exact 3D CAD model?", "How does AQIP protect engineering drawings and quality evidence?", "What are AQIP's AI agents allowed to do?"]) {
      expect(within(faq).getByText(question)).toBeInTheDocument();
    }
    for (const item of FAQ) {
      expect(within(faq).getByText(item.q)).toBeInTheDocument();
      expect(faq.textContent).toContain(item.a);
    }
  });

  it("credits the design and keeps the four names' roles distinct", () => {
    const { container } = renderPage();
    const designed = screen.getByRole("region", { name: "Designed by" });
    expect(within(designed).getByText("Designed by")).toBeInTheDocument();
    expect(within(designed).getByRole("heading", { level: 3, name: "Sudarshana Karkala" })).toBeInTheDocument();
    expect(within(designed).getByText("EV.ENGINEER™")).toBeInTheDocument();
    const profile = within(designed).getByRole("link", { name: /View full profile/ });
    expect(profile).toHaveAttribute("href", "/about/sudarshana-karkala");
    expect(profile).toHaveAttribute("data-track-event", "aqip_profile_click");

    const attribution = container.querySelector<HTMLElement>("#attribution")!;
    const cards = within(attribution).getAllByRole("listitem");
    expect(cards.map((card) => within(card).getByRole("heading", { level: 4 }).textContent)).toEqual(["EV Society™", "EV.ENGINEER™", "UFlight™", "iTelematics® Software Private Limited"]);
    expect(cards[0]).toHaveTextContent("Initiative");
    expect(cards[0]).toHaveTextContent("Non Profit Organisation");
    expect(cards[1]).toHaveTextContent("Building World-Class Engineers to Solve Energy and EV Battery Challenges");
    expect(cards[2]).toHaveTextContent("Advanced health monitoring systems for aerospace and autonomous platforms.");
    expect(cards[3]).toHaveTextContent("Commercial Product Development");
    expect(cards.map((card) => [within(card).getByRole("link").getAttribute("href"), within(card).getByRole("link").getAttribute("data-track-event")])).toEqual([
      ["https://www.evsociety.org/", "aqip_evsociety_click"],
      ["/", "aqip_ecosystem_link_click"],
      ["https://www.uflight.in/", "aqip_ecosystem_link_click"],
      ["https://itelematics.com/", "aqip_itelematics_click"],
    ]);
    // Two organisations and two brands: nothing says they are one legal entity, or that UFlight is a company.
    expect(attribution.textContent).toContain("EV Society™ and iTelematics® Software Private Limited are separate organisations; EV.ENGINEER™ and UFlight™ are brands, not companies.");
    expect(main(container).textContent).not.toMatch(/UFlight™? (Private Limited|Pvt|Inc|company)/i);
  });

  it("sends the closing calls to action to the site's existing contact pages", () => {
    const { container } = renderPage();
    const closing = container.querySelector<HTMLElement>("#closing")!;
    const ctas = ["Explore a Pilot", "Discuss AQIP", "Customer Discovery / Design Partner"].map((name) => within(closing).getByRole("link", { name }));
    expect(ctas.map((link) => link.getAttribute("href"))).toEqual(["/contact", "/consulting", "/contact"]);
    for (const link of ctas) expect(link).toHaveAttribute("data-track-event", "aqip_cta_click");
    expect(container.innerHTML).not.toMatch(/mailto:|<form[^>]*action=/i);
  });

  it("marks the page as reporting its own interactions, so they are not double counted", () => {
    const { container } = renderPage();
    expect(root(container)).toHaveAttribute("data-track-manual");
    expect(root(container)).toHaveAttribute("data-mode", "full");
  });
});

describe("AQIP page: 3D Inspection Twin", () => {
  it("presents it as research, as a verified reconstruction and never as authoritative CAD", () => {
    const { container } = renderPage();
    const section = block(container, "inspection-twin");
    expect(section).toHaveAttribute("data-executive");
    expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent("2D drawing → interactive 3D Inspection Twin");
    const concept = block(container, "twin-concept");
    expect(concept).toHaveAttribute("data-executive");
    expect(within(concept).getByText("Research / In development")).toHaveAttribute("data-tone", "research");
    expect(concept).toHaveTextContent("Transform an uploaded 2D engineering drawing into an AI-assisted interactive 3D reconstruction");
    expect(within(concept).getAllByRole("heading", { level: 4 }).map((heading) => heading.textContent)).toEqual(["Verified 3D reconstruction", "Automatic true CAD model"]);
    expect(concept).toHaveTextContent("AQIP does not claim that an arbitrary engineering drawing can always be reconstructed exactly");

    const limits = block(container, "twin-limits");
    expect(within(within(limits).getByRole("list", { name: "What a 2D drawing may not define" })).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Depth", "Hidden geometry", "Internal features", "Draft", "Complex curves", "Surface definition", "Manufacturing intent"]);
    for (const rule of ["Show the assumptions", "Highlight unresolved areas", "Request engineer confirmation", "Allow manual correction"]) expect(within(limits).getByText(rule)).toBeInTheDocument();
  });

  it("carries the demonstration, labelled synthetic, with its disclaimer on the model", () => {
    const { container } = renderPage();
    const demo = block(container, "twin-demo");
    expect(within(demo).getByText("Synthetic demo")).toHaveAttribute("data-tone", "synthetic");
    expect(within(demo).getByText("Illustrative engineering reconstruction. Not authoritative CAD geometry.")).toBeInTheDocument();
    expect(demo).toHaveTextContent("The part, its measurements and its statuses are invented for this page.");
    // The same eight characteristics on the drawing, on the model and in the list.
    for (const name of [/^2D drawing/, /^3D model of part AQ-1042/, /^Visual FAI/]) expect(within(within(demo).getByRole("group", { name })).getAllByRole("button")).toHaveLength(FEATURES.length);
    expect(within(demo).getByRole("group", { name: /^Inspection Mode/ })).toHaveTextContent("Balloon 12 · Through hole");
    // Phones: four actions and a list that opens on request; the rest of the toolbar is for wide screens.
    expect(Array.from(demo.querySelectorAll("button[data-phone]"), (button) => button.textContent)).toEqual(["Rotate", "Reset", "Show balloonsBalloons", "Feature list"]);
    expect(within(demo).getByRole("list", { name: "Phone viewer controls" })).toHaveTextContent("One-finger rotatePinch zoomResetFeature listShow balloons");
    expect(demo).toHaveTextContent("Where WebGL is not available the model is shown as a fixed isometric drawing, and the rest of the page is unaffected.");
  });

  it("explains the workflow, the two sources of geometry and the engine, each with its limits", () => {
    const { container } = renderPage();
    const flow = within(block(container, "twin-flow")).getByRole("list", { name: "From an uploaded 2D drawing to an inspection twin" });
    expect(Array.from(flow.querySelectorAll(":scope > li > h4"), (step) => step.textContent)).toEqual([
      "Upload",
      "Drawing intelligence",
      "View relationship analysis",
      "Geometry inference",
      "AI-assisted 3D reconstruction",
      "Confidence and assumption review",
      "Engineer verification",
      "Interactive 3D Inspection Twin",
      "Balloons + characteristics + inspection + evidence",
    ]);
    // The two steps that belong to a person are marked as such.
    expect(Array.from(flow.querySelectorAll(':scope > li[data-emphasis="human"] > h4'), (step) => step.textContent)).toEqual(["Confidence and assumption review", "Engineer verification"]);

    const modes = block(container, "twin-modes");
    expect(within(modes).getAllByRole("heading", { level: 4 }).map((heading) => heading.textContent)).toEqual(["Authoritative CAD visualisation", "AI-assisted reconstruction from 2D"]);
    expect(modes).toHaveTextContent("If the customer also supplies approved 3D geometry, AQIP should prefer it.");
    expect(within(within(modes).getByRole("list", { name: "CAD inputs AQIP is intended to accept" })).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["STEP", "STP", "IGES", "Parasolid", "Native CAD, where supported", "MBD / PMI"]);

    const engine = block(container, "twin-engine");
    expect(within(within(engine).getByRole("list", { name: /^Reconstruction engine/ })).getAllByRole("listitem")).toHaveLength(11);
    expect(within(within(engine).getByRole("list", { name: "Geometry primitives the engine works with" })).getAllByRole("listitem")).toHaveLength(10);
    expect(engine).toHaveTextContent("Arbitrary freeform aerospace surfaces are out of scope for Year 1.");
    expect(engine).toHaveTextContent("No CAD kernel or new dependency was added to draw it.");
    expect(within(engine).getByRole("link", { name: "see how uploaded engineering files are handled" })).toHaveAttribute("href", "#file-security");

    const capabilities = block(container, "twin-capabilities");
    expect(within(capabilities).getAllByRole("heading", { level: 4 }).map((heading) => heading.textContent)).toEqual([
      "2D ↔ 3D balloon synchronisation",
      "Inspection Mode",
      "Visual FAI",
      "3D quality overlay",
      "Authoritative STEP visualisation",
      "3D revision intelligence",
      "Spatial Quality Passport",
    ]);
    expect(within(block(container, "twin-revision")).getByText("Long-term · advanced capability")).toHaveAttribute("data-tone", "vision");
    expect(block(container, "twin-revision")).toHaveTextContent("Rev CØ6.00 ±0.10Rev DØ6.00 ±0.05");
    expect(within(block(container, "spatial-quality-passport")).getByText("Future product vision")).toHaveAttribute("data-tone", "vision");
  });

  it("carries 3D into the roadmap, the business, the customer manual and validation without assuming demand", () => {
    const { container } = renderPage();
    const year1 = container.querySelector<HTMLElement>("#year-1-title")!.closest("article")!;
    expect(pairs(year1)).toMatchObject({ Quality: "Drawing → Inspection → FAI", AI: "Source-linked extraction, verified by a person", "3D": "Research prototype: reconstruction of simple parts", Security: "RBAC, MFA, encryption, audit and private deployment foundations" });

    const revenue = block(container, "twin-revenue");
    expect(within(revenue).getByText("Future Commercial Model")).toBeInTheDocument();
    expect(within(within(revenue).getByRole("list", { name: /^Potential pricing dimensions/ })).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Parts processed", "Reconstruction complexity", "CAD conversion", "Seats", "Enterprise integration"]);
    expect(revenue.textContent).not.toMatch(/₹|\d+\s*lakh/);

    const discovery = block(container, "customer-discovery");
    expect(within(discovery).getByRole("button", { name: "3D and CAD" })).toBeInTheDocument();
    for (const question of ["Are STEP files always available?", "How often do suppliers receive only PDF drawings?", "Can CAD files leave your network?", "What CAD formats do you receive?"]) expect(discovery.textContent).toContain(question);
    expect(discovery).toHaveTextContent("Do not assume customer demand for 3D. Validate it.");

    const validation = block(container, "twin-validation");
    expect(within(validation).getAllByRole("rowheader").map((cell) => cell.textContent)).toEqual(["Reconstruction time", "Engineer correction time", "Feature mapping accuracy", "Balloon-to-feature accuracy", "User comprehension", "Inspection navigation time", "Ambiguity rate"]);
    expect(within(validation).getByRole("heading", { level: 4, name: "Unsupported Geometry Rate" })).toBeInTheDocument();

    // Win-Win-Win-Win: what the twin could add, labelled as research, for each of the four parties.
    const value = block(container, "win-win");
    expect(within(value).getAllByText("Research")).toHaveLength(4);
    for (const win of ["Quicker onboarding of junior engineers", "Visually linked quality evidence", "Stronger manufacturing assurance", "Premium differentiated module"]) expect(within(value).getByText(win)).toBeInTheDocument();
    expect(block(container, "investor-thesis")).toHaveTextContent("3D inspection intelligence + security by design");
  });
});

describe("AQIP page: cybersecurity and digital trust", () => {
  it("draws the Trust Triangle and asks its three questions in words", () => {
    const { container } = renderPage();
    expect(block(container, "cybersecurity")).toHaveAttribute("data-executive");
    expect(within(block(container, "cybersecurity")).getByRole("heading", { level: 2 })).toHaveTextContent("Cybersecurity & Digital Trust");
    const triangle = block(container, "trust-triangle");
    expect(triangle).toHaveAttribute("data-executive");
    expect(triangle.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(Array.from(triangle.querySelectorAll("svg text"), (label) => label.textContent)).toEqual(["TRUST", "QUALITY", "CYBERSECURITY", "AI ASSURANCE"]);
    expect(within(triangle).getAllByRole("listitem").map((side) => side.textContent)).toEqual([
      expect.stringMatching(/^QualityWas the product manufactured correctly\?/),
      expect.stringMatching(/^CybersecurityCan we trust the identity, data and evidence\?/),
      expect.stringMatching(/^AI AssuranceCan we understand and verify AI-assisted conclusions\?/),
    ]);
    expect(triangle).toHaveTextContent("AQIP requires all three.");
  });

  it("sets out the architecture, the principles and the controls as design requirements, not certifications", () => {
    const { container } = renderPage();
    const layers = within(block(container, "security-architecture")).getByRole("list", { name: /^Cybersecurity architecture/ });
    expect(Array.from(layers.querySelectorAll(":scope > li > h4"), (layer) => layer.textContent)).toEqual(["Identity", "Data security", "Application security", "Infrastructure", "Audit", "AI security"]);
    expect(layers).toHaveTextContent("RBACMFALeast privilege");
    expect(layers).toHaveTextContent("Private cloudIndia hostingOn-premNetwork segmentationFuture air gap");
    expect(layers).toHaveTextContent("ProvenanceModel versioningBounded agentsSource groundingHuman approval");

    expect(within(block(container, "security-principles")).getAllByRole("heading", { level: 4 }).map((heading) => heading.textContent)).toEqual([
      "Security by design",
      "Zero trust mindset",
      "Least privilege",
      "Defence-ready deployment",
      "Full auditability",
      "Data sovereignty",
      "Controlled sharing",
      "Secure AI",
      "Software supply chain security",
      "Incident readiness",
    ]);
    expect(block(container, "security-principles")).toHaveTextContent("No certification is claimed");
    expect(within(block(container, "security-pillar")).getAllByRole("heading", { level: 4 })).toHaveLength(8);
    // The controls that used to sit in the product section are here, with the data commitment.
    expect(block(container, "security")).toHaveTextContent("Customer engineering data must not be used for general AI model training without explicit authorisation.");
    expect(block(container, "security").closest("section")).toHaveAttribute("id", "cybersecurity");
  });

  it("treats uploaded engineering files as a boundary, and ties a security failure to the quality failure it causes", () => {
    const { container } = renderPage();
    const files = block(container, "file-security");
    const cards = within(files).getAllByRole("heading", { level: 4 });
    expect(cards.map((heading) => heading.textContent)).toEqual(["Potential threats", "Mitigations"]);
    expect(within(cards[0].parentElement!).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Malicious PDF", "Embedded scripts", "Malformed CAD", "Decompression bombs", "Parser exploits", "Hidden attachments", "Prompt-injection text", "Oversized files"]);
    expect(within(cards[1].parentElement!).getAllByRole("listitem")).toHaveLength(11);
    expect(within(within(files).getByRole("list", { name: "Controls applied to uploaded engineering files" })).getAllByRole("listitem")).toHaveLength(11);

    const links = within(block(container, "security-quality")).getAllByRole("listitem");
    expect(links.map((link) => link.textContent)).toEqual([
      "Unauthorised drawing changeleads toWrong manufacturing requirement",
      "Altered CMM resultleads toFalse acceptance",
      "Stolen drawingleads toIP and defence risk",
      "Compromised supplier accountleads toFraudulent evidence",
    ]);
  });

  it("shows the platform as four layers, with cybersecurity and governance spanning the other three", () => {
    const { container } = renderPage();
    const platform = within(block(container, "architecture")).getByRole("list", { name: /^Platform architecture/ });
    const layers = Array.from(platform.querySelectorAll<HTMLElement>(":scope > li"));
    expect(layers.map((layer) => within(layer).getByRole("heading", { level: 4 }).textContent)).toEqual(["Quality Workflows", "AI & Quality Intelligence", "Aerospace Quality Graph", "Cybersecurity & Governance"]);
    expect(layers.map((layer) => layer.hasAttribute("data-spans"))).toEqual([false, false, false, true]);
    expect(layers[3]).toHaveTextContent("Spans every layer above.");
    expect(layers[0]).toHaveTextContent("Drawing3D Inspection TwinInspectionFAINCR/CAPASPCSupplier QualityQuality Passport");
    expect(layers[1]).toHaveTextContent("2D→3D Intelligence");
    expect(layers[2]).toHaveTextContent("Geometry");
    // The data-flow diagram is still in the manual, under its own name.
    expect(within(block(container, "data-flow")).getByRole("list", { name: "Architecture layers, from input to output" }).children).toHaveLength(8);
  });
});

describe("AQIP page: AI assurance and agentic workflows", () => {
  it("lays out how AI workflows evolve, each stage with how far along it is", () => {
    const { container } = renderPage();
    expect(within(block(container, "ai-assurance")).getByRole("heading", { level: 2 })).toHaveTextContent("Advanced AI-Driven Quality Workflows");
    const stages = within(within(block(container, "ai-evolution")).getByRole("list", { name: /^How AI-driven quality workflows/ })).getAllByRole("listitem");
    expect(stages.map((stage) => [stage.querySelector("span")!.textContent, stage.querySelector("[data-tone]")!.textContent])).toEqual([
      ["Document AI", "In development"],
      ["Engineering AI", "In development"],
      ["Workflow AI", "Planned — Year 1"],
      ["Agentic Assistance", "Research"],
      ["Quality Intelligence", "Long-term vision"],
    ]);
    expect(within(within(block(container, "ai-evolution")).getByRole("list", { name: "What is stored with every engineering AI result" })).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Source", "Sheet", "Zone", "Revision", "Confidence", "Model version", "Human verification"]);
    expect(within(within(block(container, "workflow-ai")).getByRole("list")).getAllByRole("listitem").map((step) => step.querySelector("span")!.textContent)).toEqual(["Drawing", "AI extraction", "Human verification", "Inspection planning", "Measurement", "Evidence", "FAI preparation", "Authorised approval"]);
  });

  it("bounds nine agents, none of them production software, and states what each cannot do", () => {
    const { container } = renderPage();
    const agents = block(container, "agents");
    expect(within(agents).getByText("Research / long-term")).toBeInTheDocument();
    expect(agents).toHaveTextContent("None is production software today.");
    const tabs = within(within(agents).getByRole("group", { name: "Bounded agents" })).getAllByRole("button");
    expect(tabs.map((tab) => tab.querySelector("span")!.textContent)).toEqual(AGENTS.map((agent) => agent.name));
    expect(tabs.map((tab) => tab.querySelector("[data-tone]")!.textContent)).toEqual(["Research", "Research", "Research", "Research", "Research", "Research", "Long-term vision", "Long-term vision", "Long-term vision"]);
    // Every agent's limits are in the document, whichever one is open.
    const panels = within(agents).getAllByRole("region", { hidden: true });
    expect(panels).toHaveLength(9);
    for (const panel of panels) expect(panel.querySelectorAll('[data-kind="cannot"] li').length).toBeGreaterThanOrEqual(3);
    const reconstruction = panels[1];
    for (const limit of ["Declare inferred geometry authoritative", "Approve geometry", "Release CAD", "Approve an FAI or release a FAIR", "Override a human correction", "Export customer data externally", "Change permissions"]) {
      expect(reconstruction.querySelector('[data-kind="cannot"]')!.textContent).toContain(limit);
    }
    for (const ability of ["Analyse orthographic views", "Generate a temporary geometry candidate", "Create an assumption list", "Flag ambiguity"]) expect(reconstruction.querySelector('[data-kind="can"]')!.textContent).toContain(ability);
    for (const bound of ["Allowlisted tools", "Minimum data", "Minimum privileges", "Bounded actions", "Audit trail"]) expect(within(agents).getByText(bound)).toBeInTheDocument();
  });

  it("keeps a person in the loop, the provenance of every result, and the models under governance", () => {
    const { container } = renderPage();
    const hitl = block(container, "hitl");
    expect(within(hitl).getByText("Concept with synthetic data")).toBeInTheDocument();
    expect(within(hitl).getAllByRole("heading", { level: 4 }).map((heading) => heading.textContent)).toEqual(["AI result", "Geometry candidate"]);
    expect(within(hitl).getAllByText("Needs verification")).toHaveLength(2);

    const provenance = within(block(container, "ai-provenance")).getByRole("table");
    expect(within(provenance).getAllByRole("rowheader").map((cell) => cell.textContent)).toEqual(["File", "Revision", "Source location", "Model ID", "Model version", "Workflow version", "Confidence", "Timestamp", "Reviewer", "Corrections", "Approval"]);

    const governance = block(container, "model-governance");
    expect(within(within(governance).getByRole("list", { name: /^The lifecycle of a model or agent/ })).getAllByRole("listitem").map((step) => step.textContent)).toEqual(["Model / agent", "Benchmark", "Quality review", "Security review", "Approved release", "Monitor", "Correction analysis", "Revalidate"]);
    for (const control of ["Registry", "Rollback", "Regression", "Drift", "False negatives", "Dataset version", "Release gate"]) expect(within(governance).getByText(control)).toBeInTheDocument();

    const security = block(container, "ai-security");
    expect(within(security).getByText("Prompt injection in uploaded documents")).toBeInTheDocument();
    expect(within(security).getByText("Hallucinated engineering interpretation")).toBeInTheDocument();
    expect(within(security).getByText("Tool allowlists")).toBeInTheDocument();
    expect(block(container, "secure-rag")).toHaveTextContent("Licensed standards are not ingested or reproduced without legal authorisation.");
    expect(block(container, "secure-rag")).toHaveTextContent("Every answer cites the internal source records it used.");
    // The authority table moved here with the rest of AI assurance.
    expect(block(container, "ai-governance").closest("section")).toHaveAttribute("id", "ai-assurance");
  });
});

describe("AQIP page: SEO", () => {
  it("has the brief's title and description, a canonical URL, and is indexable", () => {
    expect(metadata.title).toBe("AQIP — Aerospace Quality Intelligence Platform | EV.ENGINEER™");
    expect(metadata.description).toBe(
      "A comprehensive strategy and engineering platform for aerospace and defence manufacturing quality intelligence — digital inspection, FAI, traceability, configuration control, supplier quality and trusted manufacturing evidence.",
    );
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ url: CANONICAL, type: "article", siteName: "EV.ENGINEER" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(metadata.keywords).toEqual(expect.arrayContaining(["Aerospace Quality Intelligence Platform", "AQIP", "AS9102 FAI", "First Article Inspection", "Aerospace MSME India"]));
    expect(metadata.keywords).toEqual(expect.arrayContaining(["3D Inspection Twin", "2D to 3D Engineering Drawing Reconstruction", "Aerospace Manufacturing Cybersecurity", "AI Assurance"]));
  });

  it("is in the sitemap and in llms.txt", () => {
    expect(sitemap().map((entry) => entry.url)).toContain(CANONICAL);
    expect(fs.readFileSync(path.join(process.cwd(), "public/llms.txt"), "utf-8")).toContain(`(${CANONICAL})`);
  });

  it("describes the page, article, breadcrumb, FAQ and glossary in one JSON-LD graph", () => {
    const { container } = renderPage();
    const graph = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!)["@graph"] as Array<Record<string, unknown>>;
    expect(graph.map((node) => node["@type"])).toEqual(["WebSite", "Brand", "Organization", "Organization", "Person", "WebPage", "TechArticle", "BreadcrumbList", "FAQPage", "DefinedTermSet"]);
    // Every @id that is referenced is defined in the same graph.
    const defined = new Set(graph.map((node) => node["@id"]));
    const referenced = [...JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g)].map((match) => match[1]);
    expect(referenced.length).toBeGreaterThan(8);
    for (const id of referenced) expect(defined, id).toContain(id);

    const article = graph.find((node) => node["@type"] === "TechArticle")!;
    expect(article.author).toEqual({ "@id": "https://autonomous.ev.engineer/about/sudarshana-karkala#person" });
    expect(article.articleSection).toEqual(NAV.map((item) => item.label));
    // The markup lists pages; the visible trail's middle step is a place on the internships page.
    const crumbs = (graph.find((node) => node["@type"] === "BreadcrumbList")!.itemListElement as Array<Record<string, unknown>>).map((item) => item.name);
    expect(crumbs).toEqual(["Home", "Internships", "Aerospace Quality Intelligence Platform"]);
  });

  it("marks up only the FAQ that is visible, and invents no product, rating, offer or award", () => {
    const { container } = renderPage();
    const faqNode = structuredData["@graph"].find((node) => node["@type"] === "FAQPage") as { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> };
    const faq = container.querySelector<HTMLElement>("#faq")!;
    expect(faqNode.mainEntity).toHaveLength(19);
    for (const entry of faqNode.mainEntity) {
      expect(faq.textContent).toContain(entry.name);
      expect(faq.textContent).toContain(entry.acceptedAnswer.text);
    }
    const json = JSON.stringify(structuredData);
    expect(json).not.toMatch(/SoftwareApplication|aggregateRating|"review"|"offers"|"award"|"price"/);
  });
});

describe("AQIP on the internships page", () => {
  it("is a Space & Aerospace Engineering track, not a GenAI project", () => {
    render(<InternshipsPage />);
    const section = screen.getByRole("heading", { level: 2, name: "Space & Aerospace Engineering" }).parentElement!;
    const card = within(section).getByRole("heading", { level: 3, name: "Aerospace Quality Intelligence Platform" }).closest("article")!;
    const link = within(card).getByRole("link", { name: "Explore AQIP" });
    expect(link).toHaveAttribute("href", ROUTE);
    expect(link).toHaveAttribute("data-track-event", "aqip_card_click");
    expect(link).toHaveAttribute("data-track-destination", ROUTE);
    expect(within(card).getByText("AQIP")).toBeInTheDocument();
    expect(within(within(card).getByRole("list", { name: "Topics" })).getAllByRole("listitem").slice(0, 6).map((tag) => tag.textContent)).toEqual(["Aerospace", "Defence", "Quality Intelligence", "Digital Thread", "Secure Engineering", "AI-Assisted"]);

    const genai = screen.getByRole("heading", { level: 2, name: "GenAI & Agentic AI Projects" }).nextElementSibling as HTMLElement;
    expect(genai.textContent).not.toMatch(/Aerospace Quality Intelligence Platform|AQIP/);
  });

  it("is listed in the internships structured data", () => {
    const graph = buildInternshipsGraph({ title: "t", description: "d", dateModified: "2026-10-06" }) as Array<Record<string, unknown>>;
    expect(JSON.stringify(graph)).toContain(CANONICAL);
  });
});
