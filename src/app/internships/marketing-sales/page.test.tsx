import fs from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships/marketing-sales" }));
vi.mock("@/utils/analytics", () => ({ trackEvent: vi.fn() }));

import { isSelfContainedPath } from "@/components/ChromeGate";
import { INTERNSHIP } from "@/components/revenue/data/framework";
import { useRevenue } from "@/components/revenue/state/store";
import sitemap from "../../sitemap";
import Layout from "./layout";
import Page, { metadata } from "./page";
import { structuredData } from "./seo";

const BASE = "/internships/marketing-sales";
const CANONICAL = `https://autonomous.ev.engineer${BASE}`;
const renderPage = () => render(<Layout>{<Page />}</Layout>);

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  window.localStorage.clear();
  useRevenue.getState().resetAll();
});

describe("Revenue Engineering overview: route and metadata", () => {
  it("is indexable at its canonical URL with the brief's title and description", () => {
    expect(metadata.title).toBe("B2B Revenue Engineering for Aerospace & Defence MSMEs | Marketing & Sales Framework | EV.ENGINEER™");
    expect(metadata.description).toBe(
      "A practical 12-week B2B marketing, customer discovery and consultative sales framework using a live AS9102 FAI software case study for Bengaluru aerospace and defence MSMEs.",
    );
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect((metadata.robots as { index: boolean }).index).toBe(true);
  });

  it("lists the content pages in the sitemap and leaves the personal tools out", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const route of ["", "/today", "/marketing", "/sales", "/execution", "/case-study"]) expect(urls).toContain(`${CANONICAL}${route}`);
    for (const route of ["/accounts", "/pipeline"]) expect(urls).not.toContain(`${CANONICAL}${route}`);
  });

  it("describes itself as a WebPage with a breadcrumb — not a course, job posting or affiliation", () => {
    const json = JSON.stringify(structuredData);
    expect(() => JSON.parse(json)).not.toThrow();
    const types = structuredData["@graph"].map((node) => (node as { "@type": string })["@type"]);
    expect(types).toEqual(expect.arrayContaining(["WebPage", "BreadcrumbList"]));
    expect(json).not.toMatch(/"Course"|JobPosting|EducationalOccupationalProgram|SAE International/);
  });

  it("draws its own chrome on every page of the platform", () => {
    for (const route of ["", "/today", "/marketing", "/sales", "/execution", "/case-study", "/accounts", "/pipeline"]) expect(isSelfContainedPath(`${BASE}${route}`)).toBe(true);
    const { container } = renderPage();
    expect(container.querySelector("#revenue-root header")).not.toBeNull();
    expect(container.querySelector("#revenue-root footer")).not.toBeNull();
  });
});

describe("Revenue Engineering overview: a short product page", () => {
  it("has one H1 and never skips a heading level", () => {
    const { container } = renderPage();
    expect(screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual(["Turn Customer Problems Into Revenue"]);
    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"), (h) => Number(h.tagName[1]));
    levels.reduce((previous, level) => {
      expect(level - previous, `h${previous} followed by h${level}`).toBeLessThanOrEqual(1);
      return level;
    });
  });

  it("keeps to seven sections and none of the application tools", () => {
    const { container } = renderPage();
    expect(container.querySelectorAll("main > section")).toHaveLength(7);
    const text = container.querySelector("main")!.textContent ?? "";
    for (const tool of ["Revenue Cockpit", "Question Bank", "Pain Library", "Decision Log", "Final Boardroom", "Gate A", "Orion", "Synthetic"]) expect(text, tool).not.toContain(tool);
    // No sixty-day list: only today's day is named.
    expect(text.match(/Day \d+/g)).toEqual(["Day 01"]);
  });

  it("opens with the hero: eyebrow, headline, copy, context and two ways in", () => {
    renderPage();
    const hero = screen.getByRole("region", { name: "Turn Customer Problems Into Revenue" });
    expect(within(hero).getByText("B2B Revenue Engineering")).toBeInTheDocument();
    expect(within(hero).getByText(/Learn how to understand Bengaluru Aerospace & Defence MSMEs, validate real customer pain/)).toBeInTheDocument();
    expect(within(within(hero).getByRole("list", { name: "Focus" })).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Bengaluru", "Aerospace & Defence MSMEs", "FAI", "Customer Discovery", "Sales"]);
    expect(within(hero).getByRole("link", { name: "Start Today's Mission" })).toHaveAttribute("href", `${BASE}/today`);
    expect(within(hero).getByRole("link", { name: "Explore the Journey" })).toHaveAttribute("href", "#journey");
  });

  it("has a public header without application navigation", () => {
    renderPage();
    const nav = screen.getByRole("navigation", { name: "Overview" });
    expect(within(nav).getAllByRole("link").map((link) => link.textContent)).toEqual(["Overview", "Journey", "Case Study", "Internship"]);
    expect(screen.getByRole("link", { name: "Start Framework" })).toHaveAttribute("href", `${BASE}/today`);
    expect(screen.queryByRole("navigation", { name: "Framework" })).toBeNull();
  });

  it("turns the revenue journey into seven questions, one stage at a time", async () => {
    const user = userEvent.setup();
    renderPage();
    const stages = within(screen.getByRole("list", { name: "The revenue journey" })).getAllByRole("button");
    expect(stages.map((stage) => stage.querySelector("span:nth-child(2)")!.textContent)).toEqual(["Problem", "Customer", "Evidence", "Value", "Opportunity", "Pilot", "Revenue"]);
    expect(stages[0]).toHaveAttribute("aria-pressed", "true");
    await user.click(stages[3]);
    expect(stages[3]).toHaveAttribute("aria-pressed", "true");
    expect(document.getElementById("rv-journey-detail")).toHaveTextContent("04 / 07 · Value");
    expect(document.getElementById("rv-journey-detail")).toHaveTextContent("Why should they change?");
  });

  it("shows the live case study in four facts with its links", () => {
    renderPage();
    const section = screen.getByRole("region", { name: "Balloon Drawings & AS9102 FAI Reporting" });
    expect(within(section).getAllByRole("term").map((term) => term.textContent)).toEqual(["Product", "Market", "Geography", "Objective"]);
    const product = within(section).getByRole("link", { name: /Explore FAI Product/ });
    expect(product).toHaveAttribute("href", "https://fai.ev.engineer/");
    expect(product).toHaveAttribute("target", "_blank");
    expect(product).toHaveAttribute("data-track-event", "fai_product_click");
    expect(within(section).getByRole("link", { name: "View Case Study →" })).toHaveAttribute("href", `${BASE}/case-study`);
    expect(within(section).getByRole("link", { name: /AQIP strategy context/ })).toHaveAttribute("href", "/internships/aerospace-quality-intelligence-platform");
  });

  it("shows the twelve weeks as three proofs, each with its page", () => {
    renderPage();
    const section = screen.getByRole("region", { name: "Three months. Three proofs." });
    expect(within(section).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Prove the Market", "Prove the Sales Motion", "Prove the Business"]);
    expect(within(section).getByRole("link", { name: "Explore Marketing →" })).toHaveAttribute("href", `${BASE}/marketing`);
    expect(within(section).getByRole("link", { name: "Explore Sales →" })).toHaveAttribute("href", `${BASE}/sales`);
    expect(within(section).getByRole("link", { name: "Explore Execution →" })).toHaveAttribute("href", `${BASE}/execution`);
  });

  it("previews today's mission without embedding it", () => {
    renderPage();
    const preview = screen.getByRole("region", { name: "Understand the Bengaluru Aerospace & Defence Market" });
    expect(preview).toHaveTextContent("Day 01 / 60 · Prove the Market");
    expect(within(preview).getAllByRole("term").map((term) => term.textContent)).toEqual(["Learn", "Do", "Evidence"]);
    expect(within(preview).getByRole("link", { name: "Open Today's Mission →" })).toHaveAttribute("href", `${BASE}/today`);
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

describe("Revenue Engineering: motion", () => {
  it("animates only lightly, never forever, and not at all with reduced motion", () => {
    for (const file of ["site.module.css", "app.module.css"]) {
      const css = fs.readFileSync(path.resolve(import.meta.dirname, "../../../components/revenue", file), "utf8");
      expect(css, file).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*transition: none/);
      expect(css, file).not.toMatch(/infinite/);
    }
  });
});
