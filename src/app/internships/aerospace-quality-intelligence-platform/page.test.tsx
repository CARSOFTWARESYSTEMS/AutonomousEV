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
}));

import { FAQ, NAV, SOURCES } from "@/components/aqip/data/reference";
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

  it("shows a breadcrumb back to the internships hub that matches the structured data", () => {
    renderPage();
    const crumbs = within(screen.getByRole("navigation", { name: "Breadcrumb" })).getAllByRole("listitem");
    expect(crumbs.map((crumb) => crumb.textContent)).toEqual(["Home", "Internships", "AQIP"]);
    expect(within(crumbs[0]).getByRole("link")).toHaveAttribute("href", "/");
    expect(within(crumbs[1]).getByRole("link")).toHaveAttribute("href", "/internships");
    expect(crumbs[2]).toHaveAttribute("aria-current", "page");
  });

  it("gives the strategy index a link to each of its seventeen sections, and each section a labelled landmark", () => {
    const { container } = renderPage();
    const nav = screen.getByRole("navigation", { name: "Strategy index" });
    const hrefs = within(nav).getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs).toHaveLength(17);
    for (const item of NAV) {
      const section = container.querySelector(`[id="${item.id}"]`);
      expect(section, item.id).not.toBeNull();
      expect(section!.tagName).toBe("SECTION");
      expect(document.getElementById(section!.getAttribute("aria-labelledby")!)?.tagName).toBe("H2");
    }
    // The suggested categories from the brief are all present.
    for (const label of ["Overview", "Opportunity", "Problems", "Product", "Quality Graph", "Roadmap", "Customers", "Validation", "Business", "Go-To-Market", "Leadership", "Investor", "Execution", "Metrics", "Risks", "90-Day Plan"]) {
      expect(within(nav).getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("points every in-page link at something that exists", () => {
    const { container } = renderPage();
    const targets = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'), (a) => a.getAttribute("href")!.slice(1));
    expect(targets.length).toBeGreaterThan(20);
    for (const id of targets) expect(document.getElementById(id), `#${id}`).not.toBeNull();
  });

  it("links internally only to pages in the sitemap, and opens external links safely in a new tab", () => {
    const { container } = renderPage();
    const known = new Set(sitemap().map((entry) => new URL(entry.url).pathname));
    const internal = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="/"]'), (a) => a.getAttribute("href")!);
    expect(internal).toEqual(expect.arrayContaining(["/contact", "/consulting", "/about/sudarshana-karkala", "/"]));
    for (const href of internal) expect(known.has(href), href).toBe(true);
    const external = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="http"]'));
    expect(external.length).toBe(SOURCES.length + 2);
    for (const link of external) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.textContent).toContain("(opens in a new tab)");
    }
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
    const text = root(container).textContent!;
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
      "We do not build aerospace quality software merely to digitise paperwork.",
    ]) {
      expect(text, statement).toContain(statement);
    }
    expect(screen.getAllByText("FAI Engineer").length).toBeGreaterThan(0);
    expect(text).toContain("Aerospace Quality Network");
    expect(text).toContain("Aerospace Manufacturing Trust Infrastructure");
  });

  it("makes none of the claims the brief rules out, and invents no market size", () => {
    const { container } = renderPage();
    const text = root(container).textContent!;
    expect(text).not.toMatch(/world['’]s first|nobody has done|only solution|guaranteed compliance|AI replaces quality engineers|market leader|award[- ]winning/i);
    expect(text).not.toMatch(/\b(TAM|SAM|SOM)\b[^.]*\d/);
    expect(text).not.toMatch(/\$\s?\d|billion|crore market/i);
    expect(text).toContain("This page gives no TAM, SAM or SOM figures.");
    // Partnerships are never implied.
    expect(text).toContain("Potential customer discovery channel");
    expect(text).toContain("None of these organisations or events is a partner of AQIP.");
  });

  it("labels what exists, what is planned and what is only illustrative", () => {
    const { container } = renderPage();
    const maturity = container.querySelector<HTMLElement>("#maturity")!;
    expect(within(maturity).getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual(["FAI Engineer prototype foundations", "First AQIP capabilities", "Planned AQIP capabilities", "Research directions"]);
    for (const label of ["Available", "In development", "Planned", "Research"]) expect(within(maturity).getByText(label)).toBeInTheDocument();

    const modules = container.querySelector<HTMLElement>("#modules")!;
    expect(within(modules).getAllByRole("listitem")).toHaveLength(14);
    expect(within(modules).getByText("Year 1 build focus. Not a statement that the module is finished.")).toBeInTheDocument();

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
    expect(faq.querySelectorAll("details")).toHaveLength(15);
    for (const item of FAQ) {
      expect(within(faq).getByText(item.q)).toBeInTheDocument();
      expect(faq.textContent).toContain(item.a);
    }
  });

  it("credits the design and keeps the three organisations' roles distinct", () => {
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
    expect(cards.map((card) => within(card).getByRole("heading", { level: 4 }).textContent)).toEqual(["EV Society™", "EV.ENGINEER™", "iTelematics® Software Private Limited"]);
    expect(cards[0]).toHaveTextContent("Initiative");
    expect(cards[0]).toHaveTextContent("Non Profit Organisation");
    expect(cards[1]).toHaveTextContent("Building World-Class Engineers to Solve Energy and EV Battery Challenges");
    expect(cards[2]).toHaveTextContent("Commercial Product Development");
    expect(within(cards[0]).getByRole("link")).toHaveAttribute("href", "https://www.evsociety.org/");
    expect(within(cards[0]).getByRole("link")).toHaveAttribute("data-track-event", "aqip_evsociety_click");
    expect(within(cards[2]).getByRole("link")).toHaveAttribute("href", "https://itelematics.com/");
    expect(within(cards[2]).getByRole("link")).toHaveAttribute("data-track-event", "aqip_itelematics_click");
    expect(attribution.textContent).toContain("EV Society™ and iTelematics® Software Private Limited are separate organisations.");
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
    const crumbs = (graph.find((node) => node["@type"] === "BreadcrumbList")!.itemListElement as Array<Record<string, unknown>>).map((item) => item.name);
    expect(crumbs).toEqual(["Home", "Internships", "Aerospace Quality Intelligence Platform"]);
  });

  it("marks up only the FAQ that is visible, and invents no product, rating, offer or award", () => {
    const { container } = renderPage();
    const faqNode = structuredData["@graph"].find((node) => node["@type"] === "FAQPage") as { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> };
    const faq = container.querySelector<HTMLElement>("#faq")!;
    expect(faqNode.mainEntity).toHaveLength(15);
    for (const entry of faqNode.mainEntity) {
      expect(faq.textContent).toContain(entry.name);
      expect(faq.textContent).toContain(entry.acceptedAnswer.text);
    }
    const json = JSON.stringify(structuredData);
    expect(json).not.toMatch(/SoftwareApplication|aggregateRating|"review"|"offers"|"award"|"price"/);
  });
});

describe("AQIP on the internships page", () => {
  it("sits next to EV Help Agent under GenAI & Agentic AI Projects, with its badge, tags and link", () => {
    render(<InternshipsPage />);
    const heading = screen.getByRole("heading", { level: 2, name: "GenAI & Agentic AI Projects" });
    const grid = heading.nextElementSibling as HTMLElement;
    expect(within(grid).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["EV Help Agent", "Aerospace Quality Intelligence Platform"]);

    const card = within(grid).getByRole("link", { name: /Aerospace Quality Intelligence Platform/ });
    expect(card).toHaveAttribute("href", ROUTE);
    expect(card).toHaveAttribute("data-track-event", "aqip_card_click");
    expect(card).toHaveAttribute("data-track-destination", ROUTE);
    expect(within(card).getByText("AQIP")).toBeInTheDocument();
    expect(within(card).getByText(/connecting engineering requirements, inspection, evidence, FAI, configuration control and supplier quality through a trusted digital thread\./)).toBeInTheDocument();
    for (const tag of ["Aerospace", "Defence", "GenAI", "Agentic AI", "Quality Intelligence", "Manufacturing", "Digital Thread"]) expect(within(card).getByText(tag)).toBeInTheDocument();
    expect(within(card).getByText(/Explore AQIP/)).toBeInTheDocument();

    // EV Help Agent is unchanged.
    expect(within(grid).getByRole("link", { name: /Visit Website/ })).toHaveAttribute("href", "https://help.ev.engineer/");
    expect(within(grid).getByRole("link", { name: /design flow/ })).toHaveAttribute("href", "/internships/ev-help-agent");
  });

  it("is listed in the internships structured data", () => {
    const graph = buildInternshipsGraph({ title: "t", description: "d", dateModified: "2026-10-06" }) as Array<Record<string, unknown>>;
    expect(JSON.stringify(graph)).toContain(CANONICAL);
  });
});
