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

import { CHAPTERS, FAQ, NAV, SOURCES } from "@/components/aqip/data/reference";
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
// The page draws its own chrome: AQIP's header, the manual, and the site footer in AQIP's colours.
const header = (container: HTMLElement) => container.querySelector<HTMLElement>("#aqip-root > header")!;
const main = (container: HTMLElement) => container.querySelector<HTMLElement>("#aqip-root > main")!;

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

  it("has its own header in place of the site navbar, one main landmark, and the site footer", () => {
    const { container } = renderPage();
    const top = header(container);
    expect(within(top).getByRole("link", { name: /^AQIP: Aerospace Quality Intelligence Platform/ })).toBeInTheDocument();
    expect(within(within(top).getByRole("navigation", { name: "AQIP" })).getAllByRole("link").map((link) => link.textContent)).toEqual(["Strategy", "Product", "Roadmap", "Customers", "Business", "Leadership", "Execution"]);
    expect(within(top).getByRole("button", { name: "Ecosystem" })).toBeInTheDocument();
    expect(within(top).getByRole("link", { name: "Discuss AQIP" })).toHaveAttribute("href", "/consulting");
    // None of the EV.ENGINEER navbar: no wordmark, no Training, EV Career or Gallery.
    expect(top.textContent).not.toMatch(/EV\.ENGINEER™?\s*$|Training|EV Career|Gallery|Workshops/);
    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    // Header, main and footer, in that order, and nothing else that a reader would see.
    expect(Array.from(root(container).children, (child) => child.tagName).filter((tag) => tag !== "NOSCRIPT")).toEqual(["HEADER", "MAIN", "DIV"]);
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

  it("groups the seventeen sections into seven chapters, each section a labelled landmark", () => {
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
    // The shared footer is tested with the site; these are the links this page adds.
    const own = [header(container), main(container)];
    const known = new Set(sitemap().map((entry) => new URL(entry.url).pathname));
    const internal = own.flatMap((part) => Array.from(part.querySelectorAll<HTMLAnchorElement>('a[href^="/"]'), (a) => a.getAttribute("href")!.split("#")[0]));
    expect(internal).toEqual(expect.arrayContaining(["/contact", "/consulting", "/about/sudarshana-karkala", "/", "/internships"]));
    for (const href of internal) expect(known.has(href), href).toBe(true);
    const external = own.flatMap((part) => Array.from(part.querySelectorAll<HTMLAnchorElement>('a[href^="http"]')));
    // The sources, then UFlight, EV Society and iTelematics in both the Ecosystem menu and the attribution.
    expect(external.length).toBe(SOURCES.length + 3 + 3);
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
    const text = main(container).textContent!;
    expect(text).not.toMatch(/world['’]s first|nobody has done|only solution|guaranteed compliance|AI replaces quality engineers|market leader|award[- ]winning/i);
    expect(header(container).textContent).not.toMatch(/world['’]s first|only solution|guaranteed/i);
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
    // The markup lists pages; the visible trail's middle step is a place on the internships page.
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
  it("is a Space & Aerospace Engineering track, not a GenAI project", () => {
    render(<InternshipsPage />);
    const section = screen.getByRole("heading", { level: 2, name: "Space & Aerospace Engineering" }).parentElement!;
    const card = within(section).getByRole("heading", { level: 3, name: "Aerospace Quality Intelligence Platform" }).closest("article")!;
    const link = within(card).getByRole("link", { name: "Explore AQIP" });
    expect(link).toHaveAttribute("href", ROUTE);
    expect(link).toHaveAttribute("data-track-event", "aqip_card_click");
    expect(link).toHaveAttribute("data-track-destination", ROUTE);
    expect(within(card).getByText("AQIP")).toBeInTheDocument();

    const genai = screen.getByRole("heading", { level: 2, name: "GenAI & Agentic AI Projects" }).nextElementSibling as HTMLElement;
    expect(genai.textContent).not.toMatch(/Aerospace Quality Intelligence Platform|AQIP/);
  });

  it("is listed in the internships structured data", () => {
    const graph = buildInternshipsGraph({ title: "t", description: "d", dateModified: "2026-10-06" }) as Array<Record<string, unknown>>;
    expect(JSON.stringify(graph)).toContain(CANONICAL);
  });
});
