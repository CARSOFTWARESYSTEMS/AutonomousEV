import fs from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ usePathname: () => "/internships/marketing-sales", useRouter: () => ({ push }) }));
vi.mock("@/utils/analytics", () => ({ trackEvent: vi.fn() }));

import { isSelfContainedPath } from "@/components/ChromeGate";
import { INTERNSHIP } from "@/components/revenue/data/framework";
import { useRevenue } from "@/components/revenue/state/store";
import { trackEvent } from "@/utils/analytics";
import sitemap from "../../sitemap";
import Layout from "./layout";
import Page, { metadata } from "./page";
import { structuredData } from "./seo";

const BASE = "/internships/marketing-sales";
const CANONICAL = `https://autonomous.ev.engineer${BASE}`;
const CONTENT_ROUTES = ["", "/today", "/customer", "/marketing", "/sales", "/pilot", "/close", "/revenue", "/case-study"];
const renderPage = () => render(<Layout>{<Page />}</Layout>);
const main = () => document.querySelector("main")!;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  window.localStorage.clear();
  useRevenue.getState().resetAll();
  vi.mocked(trackEvent).mockClear();
});

describe("Marketing & Sales overview: route and metadata", () => {
  it("is indexable at its canonical URL, positioned as Marketing & Sales", () => {
    expect(metadata.title).toBe("Marketing & Sales for Aerospace & Defence MSMEs | A Practical B2B Customer-to-Revenue Framework | EV.ENGINEER™");
    expect(metadata.description).toMatch(/^Learn marketing and sales step by step/);
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect((metadata.robots as { index: boolean }).index).toBe(true);
  });

  it("lists the content pages in the sitemap and leaves the personal tools and the old months out", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const route of CONTENT_ROUTES) expect(urls).toContain(`${CANONICAL}${route}`);
    for (const route of ["/accounts", "/pipeline", "/execution"]) expect(urls).not.toContain(`${CANONICAL}${route}`);
  });

  it("sends the retired Execution month to Revenue & Profit", async () => {
    const config = (await import("../../../../next.config")).default;
    const redirects = await config.redirects!();
    expect(redirects).toContainEqual(expect.objectContaining({ source: `${BASE}/execution`, destination: `${BASE}/revenue`, permanent: true }));
  });

  it("describes itself as a WebPage with a breadcrumb — not a course, job posting or affiliation", () => {
    const json = JSON.stringify(structuredData);
    expect(() => JSON.parse(json)).not.toThrow();
    const types = structuredData["@graph"].map((node) => (node as { "@type": string })["@type"]);
    expect(types).toEqual(expect.arrayContaining(["WebPage", "BreadcrumbList"]));
    expect(json).not.toMatch(/"Course"|JobPosting|EducationalOccupationalProgram|SAE International/);
  });

  it("draws its own chrome on every page of the platform", () => {
    for (const route of [...CONTENT_ROUTES, "/accounts", "/pipeline"]) expect(isSelfContainedPath(`${BASE}${route}`)).toBe(true);
    const { container } = renderPage();
    expect(container.querySelector("#revenue-root header")).not.toBeNull();
    expect(container.querySelector("#revenue-root footer")).not.toBeNull();
  });
});

describe("Marketing & Sales overview: short, simple, beginner first", () => {
  it("has one H1 — the four-line headline — and never skips a heading level", () => {
    const { container } = renderPage();
    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1).toHaveLength(1);
    expect(Array.from(h1[0].children, (line) => line.textContent)).toEqual(["Learn Marketing.", "Learn Sales.", "Create Value.", "Generate Revenue."]);
    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"), (h) => Number(h.tagName[1]));
    levels.reduce((previous, level) => {
      expect(level - previous, `h${previous} followed by h${level}`).toBeLessThanOrEqual(1);
      return level;
    });
  });

  it("keeps to the brief's nine sections, then the credit, and none of the advanced tools", () => {
    renderPage();
    expect(main().querySelectorAll(":scope > section")).toHaveLength(10);
    expect(main().lastElementChild).toHaveAccessibleName("Designed by");
    const text = main().textContent ?? "";
    for (const hidden of ["B2B Revenue Engineering", "Revenue Cockpit", "North Star", "Founder Challenge", "Question Bank", "Pain Library", "Decision Log", "Final Boardroom", "Gate A", "Orion", "Synthetic", "₹", "60 days", "12-week journey"]) {
      expect(text, hidden).not.toContain(hidden);
    }
    // No sixty-day grid: outside the closed day picker, only today's day is named.
    const outsidePicker = [...main().querySelectorAll(":scope > section")].map((section) => {
      const copy = section.cloneNode(true) as HTMLElement;
      copy.querySelectorAll("select").forEach((select) => select.remove());
      return copy.textContent;
    });
    expect(outsidePicker.join(" ").match(/Day \d+/g)).toEqual(["Day 01"]);
  });

  it("answers the beginner's first questions on the page itself", () => {
    renderPage();
    const text = main().textContent ?? "";
    expect(text).toContain("Balloon Drawings & AS9102 FAI Reporting"); // What are we selling?
    expect(text).toContain("Bengaluru Aerospace & Defence MSMEs"); // To whom?
    expect(text).toContain("Hypothesis — Validate with Customer"); // What problem might they have?
    expect(text).toContain("Marketing means giving the right customer a reason to talk."); // What is marketing?
    expect(text).toContain("Sales means helping the customer make a good business decision."); // What is sales?
    // What first?
    expect(within(screen.getByRole("region", { name: "Learn Marketing. Learn Sales. Create Value. Generate Revenue." })).getByRole("link", { name: "Start Today" })).toHaveAttribute("href", `${BASE}/today#day-1`);
  });

  it("opens with the hero: eyebrow, headline, copy, the path and two ways in", () => {
    renderPage();
    const hero = screen.getByRole("region", { name: "Learn Marketing. Learn Sales. Create Value. Generate Revenue." });
    expect(within(hero).getByText("Marketing & Sales")).toBeInTheDocument();
    expect(within(hero).getByText("A practical guide to market and sell Balloon Drawings & AS9102 FAI Reporting software to Bengaluru Aerospace & Defence MSMEs.")).toBeInTheDocument();
    expect(within(within(hero).getByRole("list", { name: "The path" })).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Customer", "Pain", "Marketing", "Sales", "Value", "Revenue"]);
    expect(within(hero).getByRole("link", { name: "Start Today" })).toHaveAttribute("href", `${BASE}/today#day-1`);
    expect(within(hero).getByRole("link", { name: "See the Journey" })).toHaveAttribute("href", "#journey");
    // The drawing shows what ballooning is, on a fictitious part.
    expect(within(hero).getByText("Fictitious drawing")).toBeInTheDocument();
    expect(within(within(hero).getByRole("table")).getAllByRole("row")).toHaveLength(6);
  });

  it("continues a returning learner where they left off", () => {
    useRevenue.getState().completeDay(1, true);
    useRevenue.getState().completeDay(2, true);
    renderPage();
    expect(screen.getByRole("link", { name: "Continue Day 3" })).toHaveAttribute("href", `${BASE}/today#day-3`);
  });

  it("goes to any day, first to last, from beside the main action", async () => {
    const user = userEvent.setup();
    useRevenue.getState().completeDay(1, true);
    renderPage();
    const picker = screen.getByRole("combobox", { name: "Or go to any day" });
    const options = within(picker).getAllByRole("option").filter((option) => option.getAttribute("value"));
    expect(options).toHaveLength(60);
    expect(options[0]).toHaveTextContent("Day 1 — Understand the Customer ✓");
    expect(options[59]).toHaveTextContent("Day 60 — Final Revenue Review");
    expect(within(picker).getAllByRole("group").map((group) => group.getAttribute("label"))).toHaveLength(12);
    await user.selectOptions(picker, "60");
    expect(push).toHaveBeenCalledWith(`${BASE}/today#day-60`);
    expect(useRevenue.getState().day).toBe(60);
  });

  it("has five header destinations and one action, and a bottom bar of four places and More", () => {
    renderPage();
    const header = screen.getByRole("navigation", { name: "Main" });
    expect(within(header).getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Overview", BASE],
      ["Customer", `${BASE}/customer`],
      ["Marketing", `${BASE}/marketing`],
      ["Sales", `${BASE}/sales`],
      ["Case Study", `${BASE}/case-study`],
    ]);
    expect(within(header).getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    expect(within(screen.getByRole("banner")).getByRole("link", { name: "Start Today" })).toHaveAttribute("href", `${BASE}/today`);
    const bar = screen.getByRole("navigation", { name: "Essentials" });
    expect(within(bar).getAllByRole("link").map((link) => link.textContent)).toEqual(["Today", "Journey", "Customer", "Sales"]);
    expect(within(bar).getByRole("link", { name: "Journey" })).toHaveAttribute("aria-current", "page");
    expect(within(bar).getByRole("button", { name: "More" })).toBeInTheDocument();
  });

  it("asks one question and animates the way from customer to revenue, one stage at a time", async () => {
    const user = userEvent.setup();
    renderPage();
    const section = screen.getByRole("region", { name: "Can we solve a real customer problem well enough that they will pay for it?" });
    const stages = within(within(section).getByRole("list", { name: "From customer to revenue" })).getAllByRole("button");
    expect(stages.map((stage) => stage.querySelector("span:nth-child(2)")!.textContent)).toEqual(["Customer", "Pain", "Marketing", "Sales", "Value", "Revenue"]);
    expect(stages[0]).toHaveAttribute("aria-pressed", "true");
    await user.click(stages[3]);
    expect(stages[3]).toHaveAttribute("aria-pressed", "true");
    const detail = document.getElementById("rv-flow-customer-to-revenue")!;
    expect(detail).toHaveTextContent("04 / 06 · Sales");
    expect(detail).toHaveTextContent("Is this a real opportunity?");
    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith("flow_stage_view", { flow: "customer-to-revenue", stage: "sales" });
    // The evidence ladder is for later steps, not the homepage.
    expect(main().textContent).not.toMatch(/Pilot Validated|Commercial Proof/);
  });

  it("shows the customer as one company and four people, one explanation at a time", async () => {
    const user = userEvent.setup();
    renderPage();
    const section = screen.getByRole("region", { name: "Who Are We Trying to Help?" });
    expect(within(section).getByText("Bengaluru Aerospace / Defence MSME")).toBeInTheDocument();
    const people = within(within(section).getByRole("list", { name: "People in the customer company" })).getAllByRole("button");
    expect(people.map((person) => person.firstChild!.textContent)).toEqual(["Business Owner", "Quality Head", "Quality Engineer", "Manufacturing / Operations"]);
    await user.click(people[2]);
    expect(people[2]).toHaveAttribute("aria-pressed", "true");
    expect(document.getElementById("rv-role-detail")).toHaveTextContent(/Does the work.*Quality Engineer.*Balloons drawings/);
  });

  it("explains the work before the software, every pain tagged as a hypothesis", async () => {
    const user = userEvent.setup();
    renderPage();
    const section = screen.getByRole("region", { name: "Understand the Work Before Selling the Software" });
    const stages = within(within(section).getByRole("list", { name: "The customer's FAI workflow" })).getAllByRole("button");
    expect(stages.map((stage) => stage.textContent)).toEqual(["Drawing", "Characteristics", "Ballooning", "Inspection", "FAI Report", "Review", "Approval"]);
    await user.click(stages[2]);
    const detail = document.getElementById("rv-flow-fai-workflow")!;
    expect(within(detail).getAllByRole("term").map((term) => term.textContent)).toEqual(["What happens here?", "What should we ask?", "What pain might exist?"]);
    expect(detail).toHaveTextContent("Drawing characteristics are identified and linked to balloon numbers.");
    expect(within(detail).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["How do you do this today?", "Who does it?", "How long does it take?", "What causes correction?"]);
    expect(detail).toHaveTextContent("Manual effort / rework.");
    expect(within(detail).getByText("Hypothesis — Validate with Customer")).toBeInTheDocument();
  });

  it("shows the ten steps, each with one line and one way in", () => {
    renderPage();
    const section = screen.getByRole("region", { name: "Ten Steps From Customer to Revenue" });
    expect(section).toHaveAttribute("id", "journey");
    expect(within(section).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Understand Customer",
      "Find Pain",
      "Learn Marketing",
      "Generate Leads",
      "Learn Sales",
      "Talk to Customer",
      "Demonstrate Value",
      "Pilot",
      "Proposal & Close",
      "Revenue & Profit",
    ]);
    const links = within(section).getAllByRole("link");
    expect(links).toHaveLength(10);
    expect(links[0]).toHaveAccessibleName("Open Step 1: Understand Customer →");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      `${BASE}/customer#step-1`,
      `${BASE}/customer#step-2`,
      `${BASE}/marketing#step-3`,
      `${BASE}/marketing#step-4`,
      `${BASE}/sales#step-5`,
      `${BASE}/sales#step-6`,
      `${BASE}/sales#step-7`,
      `${BASE}/pilot#step-8`,
      `${BASE}/close#step-9`,
      `${BASE}/revenue#step-10`,
    ]);
  });

  it("shows the live case study: product, customer, a problem still to be validated, and its links", () => {
    renderPage();
    const section = screen.getByRole("region", { name: "Balloon Drawings & AS9102 FAI Reporting" });
    expect(within(section).getAllByRole("term").map((term) => term.textContent)).toEqual(["Product", "Customer", "Customer problem"]);
    expect(within(section).getByText("To be validated with customers.")).toBeInTheDocument();
    const product = within(section).getByRole("link", { name: /Explore FAI Product/ });
    expect(product).toHaveAttribute("href", "https://fai.ev.engineer/");
    expect(product).toHaveAttribute("target", "_blank");
    expect(product).toHaveAttribute("data-track-event", "fai_product_click");
    expect(within(section).getByRole("link", { name: "View Case Study →" })).toHaveAttribute("href", `${BASE}/case-study`);
    expect(within(section).getByRole("link", { name: "AQIP Context →" })).toHaveAttribute("href", "/internships/aerospace-quality-intelligence-platform");
  });

  it("previews today's step without embedding it", () => {
    renderPage();
    const preview = screen.getByRole("region", { name: "Understand the Customer" });
    expect(preview).toHaveTextContent("Today's Mission · Day 01 · Step 01 Understand Customer");
    // The brief's order: Today's Mission, then the case study.
    const order = [...main().querySelectorAll(":scope > section")].map((section) => section.getAttribute("aria-labelledby"));
    expect(order.indexOf("rv-preview-title")).toBe(order.indexOf("rv-case-title") - 1);
    expect(within(preview).getAllByRole("term").map((term) => term.textContent)).toEqual(["Do", "Result"]);
    expect(within(preview).getByText("5 researched companies")).toBeInTheDocument();
    expect(within(preview).getByRole("link", { name: "Open Today →" })).toHaveAttribute("href", `${BASE}/today#day-1`);
  });

  it("shows four wins and promises no customer savings", () => {
    renderPage();
    const section = screen.getByRole("region", { name: "Four Wins" });
    expect(within(section).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Customer Wins", "Business Wins", "Team Wins", "Product Wins"]);
    expect(within(section).getAllByRole("listitem").filter((li) => !li.querySelector("li")).map((li) => li.textContent)).toEqual(
      expect.arrayContaining(["Better workflow", "Less effort", "Better traceability", "Faster execution where validated", "Repeat business", "Industry knowledge", "Market fit"]),
    );
    expect(section).toHaveTextContent("measured with the customer before anyone claims it");
    expect(main().textContent).not.toMatch(/guaranteed (savings|revenue|profit|compliance)/i);
  });

  it("ends with the internship, whose Apply button goes to the contact page", () => {
    renderPage();
    const section = screen.getByRole("region", { name: "12-Week Guided Internship" });
    for (const text of ["Hybrid", "6", "Online Interview", "Certificate of Completion + Internship Certificate", "MBA / BBA students", "Startup founders"]) expect(within(section).getByText(text)).toBeInTheDocument();
    const apply = within(section).getByRole("link", { name: "Apply for Internship" });
    expect(apply).toHaveAttribute("href", "/contact");
    expect(apply).not.toHaveAttribute("target");
    expect(apply).toHaveAttribute("data-track-event", "apply_internship_click");
    expect(INTERNSHIP.apply.url).toBe("/contact");
  });
});

describe("Marketing & Sales overview: credit", () => {
  it("credits its designer, linking to the profile on aerospace.ev.engineer", () => {
    renderPage();
    const credit = screen.getByRole("region", { name: "Designed by" });
    expect(within(credit).getByText("Designed by")).toBeInTheDocument();
    expect(within(credit).getByRole("heading", { level: 3, name: "Sudarshana Karkala" })).toBeInTheDocument();
    expect(within(credit).getByText("EV.ENGINEER™")).toBeInTheDocument();
    const profile = within(credit).getByRole("link", { name: /View full profile/ });
    expect(profile).toHaveAttribute("href", "https://aerospace.ev.engineer/about/sudarshana-karkala");
    expect(profile).toHaveAttribute("data-track-event", "revenue_framework_profile_click");
  });
});

describe("Marketing & Sales: motion", () => {
  it("animates only lightly, never forever, and not at all with reduced motion", () => {
    for (const file of ["site.module.css", "app.module.css"]) {
      const css = fs.readFileSync(path.resolve(import.meta.dirname, "../../../components/revenue", file), "utf8");
      expect(css, file).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*transition: none/);
      expect(css, file).not.toMatch(/infinite/);
    }
    const site = fs.readFileSync(path.resolve(import.meta.dirname, "../../../components/revenue/site.module.css"), "utf8");
    expect(site).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.balloon,[\s\S]*animation: none/);
  });
});
