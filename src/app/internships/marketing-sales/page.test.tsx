import fs from "node:fs";
import path from "node:path";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships/marketing-sales" }));
vi.mock("next/font/google", () => ({ Manrope: () => ({ variable: "font-display" }), Inter: () => ({ variable: "font-inter" }) }));
vi.mock("@/utils/analytics", () => ({ trackEvent: vi.fn() }));

import { isSelfContainedPath } from "@/components/ChromeGate";
import { INTERNSHIP } from "@/components/revenue/data/framework";
import { STORAGE_KEY, useRevenue } from "@/components/revenue/state/store";
import { trackEvent } from "@/utils/analytics";
import sitemap from "../../sitemap";
import Page, { metadata } from "./page";
import { structuredData } from "./seo";

const ROUTE = "/internships/marketing-sales";
const CANONICAL = `https://autonomous.ev.engineer${ROUTE}`;
const tracked = () => vi.mocked(trackEvent).mock.calls.map(([event]) => event);

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  window.localStorage.clear();
  useRevenue.getState().resetAll();
  window.history.replaceState(null, "", ROUTE);
  vi.mocked(trackEvent).mockClear();
});

const renderPage = () => render(<Page />);
const workspaceNav = () => screen.getByRole("navigation", { name: "Workspace" });
const open = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(within(workspaceNav()).getByRole("link", { name: label }));
};

describe("Revenue Engineering: route, metadata and structure", () => {
  it("is indexable at its canonical URL with the brief's title and description", () => {
    expect(metadata.title).toBe("B2B Revenue Engineering for Aerospace & Defence MSMEs | Marketing & Sales Framework | EV.ENGINEER™");
    expect(metadata.description).toBe(
      "A practical 12-week B2B marketing, customer discovery and consultative sales framework using a live AS9102 FAI software case study for Bengaluru aerospace and defence MSMEs.",
    );
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect((metadata.robots as { index: boolean }).index).toBe(true);
    expect(sitemap().map((entry) => entry.url)).toContain(CANONICAL);
  });

  it("describes itself as a WebPage with a breadcrumb — not a course, job posting or affiliation", () => {
    const json = JSON.stringify(structuredData);
    expect(() => JSON.parse(json)).not.toThrow();
    const types = structuredData["@graph"].map((node) => (node as { "@type": string })["@type"]);
    expect(types).toEqual(expect.arrayContaining(["WebPage", "BreadcrumbList"]));
    expect(json).not.toMatch(/"Course"|JobPosting|EducationalOccupationalProgram|SAE International/);
  });

  it("draws its own header and footer instead of the site navbar", () => {
    expect(isSelfContainedPath(ROUTE)).toBe(true);
    const { container } = renderPage();
    expect(container.querySelector("#revenue-root > header")).not.toBeNull();
    expect(container.querySelector("#revenue-root > footer")).not.toBeNull();
  });

  it("has one H1 with the hero headline and never skips a heading level", () => {
    const { container } = renderPage();
    expect(screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual(["Turn Aerospace Customer Problems Into Revenue"]);
    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"), (h) => Number(h.tagName[1]));
    levels.reduce((previous, level) => {
      expect(level - previous, `h${previous} followed by h${level}`).toBeLessThanOrEqual(1);
      return level;
    });
  });
});

describe("Revenue Engineering: hero", () => {
  it("states the transformation, the flagship case, its links and the programme", () => {
    renderPage();
    const hero = screen.getByRole("region", { name: "Turn Aerospace Customer Problems Into Revenue" });
    expect(within(hero).getByText("B2B Revenue Engineering")).toBeInTheDocument();
    expect(within(hero).getByText(/A practical daily framework for understanding Bengaluru Aerospace & Defence MSMEs/)).toBeInTheDocument();
    const caseCard = screen.getByRole("complementary", { name: "Balloon Drawings & AS9102 FAI Reporting" });
    expect(within(caseCard).getByText("Live Industry Case Study")).toBeInTheDocument();
    const product = within(caseCard).getByRole("link", { name: /Explore Product/ });
    expect(product).toHaveAttribute("href", "https://fai.ev.engineer/");
    expect(product).toHaveAttribute("target", "_blank");
    expect(product).toHaveAttribute("rel", "noopener noreferrer");
    expect(product).toHaveAttribute("data-track-event", "fai_product_click");
    const aqip = within(caseCard).getByRole("link", { name: /Understand AQIP Context/ });
    expect(aqip).toHaveAttribute("href", "/internships/aerospace-quality-intelligence-platform");
    expect(aqip).toHaveAttribute("data-track-event", "aqip_context_click");
    expect(screen.getByRole("link", { name: "Start Today's Mission" })).toHaveAttribute("href", "#today");
    expect(screen.getByRole("link", { name: "Explore 12-Week Journey" })).toHaveAttribute("href", "#journey");
    const meta = within(screen.getByRole("list", { name: "Programme" })).getAllByRole("listitem").map((li) => li.textContent);
    expect(meta).toEqual(["12 Weeks", "Hybrid", "Bengaluru Market", "6 Internship Positions per Cohort", "Live Customer Context", "Certificate of Completion", "Internship Certificate"]);
  });

  it("shows the commercial journey and the main message", () => {
    renderPage();
    expect(screen.getByRole("list", { name: /The commercial journey: Problem to Customer to Evidence to Value to Opportunity to Pilot to Revenue/ })).toBeInTheDocument();
    expect(screen.getByText(/What important problem does this customer have, what evidence proves it/)).toBeInTheDocument();
  });

  it("never claims compliance, certification or guaranteed savings anywhere in its visible copy", () => {
    const { container } = renderPage();
    const copy = container.querySelector("#revenue-root")!.textContent ?? "";
    expect(copy).not.toMatch(/guaranteed (AS9102 )?compliance(?! cannot)/i);
    expect(copy).not.toMatch(/\bTAM\b|\bSAM\b|\bSOM\b/);
  });
});

describe("Revenue Engineering: Today's Mission", () => {
  it("opens on Day 1 with every section of the daily template", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 2, name: "What Is B2B Marketing?" })).toBeInTheDocument();
    const mission = screen.getByRole("article", { name: "What Is B2B Marketing?" });
    const sections = within(mission).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(sections).toEqual(["Why it matters", "Learn", "Apply to FAI", "Do today", "Ask the customer", "Don't", "Evidence to collect", "Submit / record", "Self-review", "What changed my mind?", "Next"]);
  });

  it("moves between days with the buttons and the day picker", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Next day, Day 2" }));
    expect(screen.getByRole("heading", { level: 2, name: "Understand Bengaluru Aerospace & Defence" })).toBeInTheDocument();
    expect(window.location.hash).toBe("#day-2");
    await user.selectOptions(screen.getByLabelText("Jump to a day"), "33");
    expect(screen.getByRole("heading", { level: 2, name: "ROI & Business Value" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Previous day, Day 32" }));
    expect(screen.getByRole("heading", { level: 2, name: "Product Demonstration" })).toBeInTheDocument();
    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith("daily_mission_view", { day: "32" });
  });

  it("completes a day only after its record is submitted, then saves it in this browser", async () => {
    const user = userEvent.setup();
    renderPage();
    const complete = screen.getByRole("button", { name: "Mark Day 1 complete" });
    expect(complete).toHaveAttribute("aria-disabled", "true");
    await user.click(complete);
    expect(useRevenue.getState().completed[1]).toBeUndefined();

    const submit = screen.getByRole("heading", { name: "Submit / record" }).parentElement!;
    for (const box of within(submit).getAllByRole("checkbox")) await user.click(box);
    expect(complete).toHaveAttribute("aria-disabled", "false");
    await user.click(complete);
    expect(screen.getByRole("status")).toHaveTextContent("Day 1 is complete.");
    expect(tracked()).toEqual(expect.arrayContaining(["evidence_submit", "daily_mission_complete"]));
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).state.completed[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await user.click(screen.getByRole("button", { name: "Start Day 2" }));
    expect(screen.getByRole("heading", { level: 2, name: "Understand Bengaluru Aerospace & Defence" })).toBeInTheDocument();
  });

  it("requires the 'What changed my mind?' reflection on customer-facing days", async () => {
    const user = userEvent.setup();
    act(() => useRevenue.getState().setDay(10));
    renderPage();
    expect(screen.getByText("Customer-facing · reflection required")).toBeInTheDocument();
    const submit = screen.getByRole("heading", { name: "Submit / record" }).parentElement!;
    for (const box of within(submit).getAllByRole("checkbox")) await user.click(box);
    expect(screen.getByRole("button", { name: "Mark Day 10 complete" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Answer all four reflection questions.")).toBeInTheDocument();
    for (const label of [/^Before — what did I believe\?/, /^Evidence — what did I learn\?/, /^Change — what assumption changed\?/, /^Tomorrow — what will I do differently\?/]) {
      await user.type(screen.getByLabelText(label), "Noted");
    }
    expect(screen.getByRole("button", { name: "Mark Day 10 complete" })).toHaveAttribute("aria-disabled", "false");
  });

  it("reminds on Fridays that the weekly review is due", () => {
    act(() => useRevenue.getState().setDay(5));
    renderPage();
    expect(screen.getByText("Friday review due.")).toBeInTheDocument();
  });
});

describe("Revenue Engineering: workspace navigation", () => {
  it("opens views from the sidebar and from the address", async () => {
    const user = userEvent.setup();
    renderPage();
    await open(user, "Pipeline");
    expect(await screen.findByRole("heading", { level: 2, name: "Pipeline" })).toBeInTheDocument();
    expect(window.location.hash).toBe("#pipeline");
    expect(within(workspaceNav()).getByRole("link", { name: "Pipeline" })).toHaveAttribute("aria-current", "page");
    act(() => {
      window.location.hash = "#journey";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(await screen.findByRole("heading", { level: 2, name: "12-Week Revenue Journey" })).toBeInTheDocument();
  });

  it("gives phones a bottom bar with Today, Journey, Accounts, Pipeline, Learn and More", async () => {
    const user = userEvent.setup();
    renderPage();
    const bar = screen.getByRole("navigation", { name: "Workspace essentials" });
    expect(within(bar).getAllByRole("link").map((link) => link.textContent)).toEqual(["Today", "Journey", "Accounts", "Pipeline", "Learn"]);
    await user.click(within(bar).getByRole("button", { name: "More" }));
    const sheet = screen.getByRole("dialog", { name: "All tools" });
    expect(within(sheet).getByRole("link", { name: "Revenue Cockpit" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("respects reduced motion when it scrolls to a view", async () => {
    const user = userEvent.setup();
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({ matches: query.includes("reduce"), media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() }));
    renderPage();
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    await open(user, "Journey");
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    matchMedia.mockRestore();
  });

  it("stops every animation when reduced motion is requested", () => {
    for (const file of ["revenue.module.css", "workspace.module.css"]) {
      const css = fs.readFileSync(path.resolve(import.meta.dirname, "../../../components/revenue", file), "utf8");
      expect(css, file).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none/);
      // Motion plays once: no infinite loops.
      expect(css, file).not.toMatch(/infinite/);
    }
  });

  it("searches all sixty days", async () => {
    const user = userEvent.setup();
    renderPage();
    await open(user, "Journey");
    await user.type(await screen.findByLabelText("Search all 60 days"), "ROI");
    expect(screen.getByRole("status")).toHaveTextContent(/\d+ days match “ROI”/);
    const results = screen.getByRole("region", { name: "Search results" });
    expect(within(results).getAllByRole("button")[0]).toHaveTextContent("Day 33ROI & Business Value");
  });
});

describe("Revenue Engineering: tools", () => {
  it("labels synthetic demonstration data in the pipeline and keeps it read-only", async () => {
    const user = userEvent.setup();
    renderPage();
    await open(user, "Pipeline");
    await screen.findByRole("heading", { level: 2, name: "Pipeline" });
    const orion = screen.getByRole("heading", { level: 3, name: "Orion — quality team workflow evaluation" }).closest("li")!;
    expect(within(orion).getByText("Synthetic Demonstration Data")).toBeInTheDocument();
    expect(within(orion).getByText("Qualified pipeline")).toBeInTheDocument();
    expect(within(orion).queryByRole("button", { name: "Delete" })).toBeNull();
  });

  it("moves a user's opportunity through stages and requires learning when it is lost", async () => {
    const user = userEvent.setup();
    renderPage();
    await open(user, "Pipeline");
    await user.click(await screen.findByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText(/Opportunity name/), "Account X workflow review");
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    const card = screen.getByRole("heading", { level: 3, name: "Account X workflow review" }).closest("li")!;
    await user.selectOptions(within(card).getByLabelText("Stage"), "proposal");
    expect(tracked()).toEqual(expect.arrayContaining(["pipeline_stage_change", "proposal_stage_entered"]));
    await user.selectOptions(within(card).getByLabelText("Stage"), "lost");
    expect(within(card).getByText("Learning required")).toBeInTheDocument();
    expect(within(card).getByRole("heading", { name: "Lost opportunity analysis" })).toBeInTheDocument();
    // Nothing the user typed reaches analytics.
    expect(JSON.stringify(vi.mocked(trackEvent).mock.calls)).not.toMatch(/Account X/);
  });

  it("will not let a pilot pass without predefined criteria and a baseline", async () => {
    const user = userEvent.setup();
    renderPage();
    await open(user, "Pilot");
    const status = await screen.findByLabelText("Pilot status");
    expect(within(status).getByRole("option", { name: /Passed/ })).toBeDisabled();
    act(() => useRevenue.getState().setPilot({ status: "passed" }));
    expect(useRevenue.getState().pilot.status).not.toBe("passed");
    await user.type(screen.getByLabelText(/Success criteria/), "Preparation time per drawing measured and agreed");
    await user.type(screen.getByLabelText(/Baseline/), "Last three FAIs");
    expect(within(status).getByRole("option", { name: "Passed" })).not.toBeDisabled();
  });

  it("estimates ROI as a range with the disclaimer in view", async () => {
    const user = userEvent.setup();
    renderPage();
    await open(user, "ROI");
    expect(await screen.findByText(/They are not guaranteed savings\./)).toBeInTheDocument();
    expect(screen.getByText("₹28,080 – ₹1.1 lakh")).toBeInTheDocument();
    const fais = screen.getByLabelText("FAIs per month");
    await user.clear(fais);
    await user.type(fais, "12");
    expect(screen.getByText("₹56,160 – ₹2.2 lakh")).toBeInTheDocument();
    expect(tracked()).toContain("roi_calculated");
  });

  it("warns before a restricted claim is sent", async () => {
    const user = userEvent.setup();
    renderPage();
    await open(user, "Evidence & Claims");
    await user.type(await screen.findByLabelText("Paste or write a draft message"), "Our software guarantees AS9102 compliance.");
    expect(screen.getByText(/do not send this message/)).toBeInTheDocument();
    expect(screen.getByText(/Instead: Designed to support workflows used in preparing and documenting First Article Inspection\./)).toBeInTheDocument();
  });

  it("scores accounts with score, confidence and evidence count", async () => {
    const user = userEvent.setup();
    renderPage();
    await open(user, "Accounts");
    const orion = (await screen.findByRole("heading", { level: 3, name: "Orion Precision Aero Pvt Ltd" })).closest("li")!;
    expect(orion).toHaveTextContent(/\d+ \/ 100 · Medium Confidence · 5 Evidence Items/);
    await user.click(screen.getByRole("button", { name: "Add account" }));
    expect(screen.getByRole("button", { name: "Save account" })).toHaveAttribute("aria-disabled", "true");
  });

  it("keeps Gate G locked until Gates A–F and the Professional Behaviour module are done", async () => {
    const user = userEvent.setup();
    renderPage();
    await open(user, "Internship & Gates");
    const gateG = (await screen.findByRole("heading", { name: "Gate G — Customer-Facing" })).closest("li")!;
    expect(within(gateG).getByRole("checkbox")).toBeDisabled();
    act(() => {
      for (const id of ["A", "B", "C", "D", "E", "F"] as const) useRevenue.getState().setGate(id, true);
      useRevenue.getState().setProfessional(true);
    });
    expect(within(gateG).getByRole("checkbox")).not.toBeDisabled();
    // The workspace, the internship section and the footer all lead to the one application form.
    for (const apply of screen.getAllByRole("link", { name: /Apply for Internship/ })) {
      expect(apply).toHaveAttribute("href", INTERNSHIP.apply.url);
      expect(apply).toHaveAttribute("data-track-event", "apply_internship_click");
    }
  });
});

describe("Revenue Engineering: internship section", () => {
  it("lists eligibility, cohort, selection, mode and certification, and links to the application", () => {
    renderPage();
    const section = screen.getByRole("region", { name: "12-Week Guided Internship" });
    for (const text of ["MBA / BBA students", "Startup founders", "6 positions", "Online Interview", "Hybrid", "Certificate of Completion · Internship Certificate", "Program details will be shared with shortlisted participants."]) {
      expect(within(section).getByText(text)).toBeInTheDocument();
    }
    expect(within(section).getByRole("link", { name: /Apply for Internship/ })).toHaveAttribute("data-track-event", "apply_internship_click");
  });
});

describe("Revenue Engineering: saved progress", () => {
  it("restores progress from this browser after mount", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { day: 12, completed: { 1: "2026-10-26" } }, version: 1 }));
    renderPage();
    await waitFor(() => expect(screen.getByRole("heading", { level: 2, name: "Feature vs Business Outcome" })).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Continue Day 2" })).toBeInTheDocument();
  });
});
