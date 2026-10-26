import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships/marketing-sales/sales" }));
vi.mock("@/utils/analytics", () => ({ trackEvent: vi.fn() }));

import { useRevenue } from "@/components/revenue/state/store";
import CloseStep, { metadata as closeMeta } from "./close/page";
import CustomerStep, { metadata as customerMeta } from "./customer/page";
import MarketingStep, { metadata as marketingMeta } from "./marketing/page";
import PilotStep, { metadata as pilotMeta } from "./pilot/page";
import RevenueStep, { metadata as revenueMeta } from "./revenue/page";
import SalesStep, { metadata as salesMeta } from "./sales/page";

const BASE = "/internships/marketing-sales";
const PAGES = [
  { route: "customer", Page: CustomerStep, meta: customerMeta, eyebrow: "Steps 01–02 · Customer", title: "Know the Customer. Find the Real Pain.", steps: [1, 2], first: [1, 2] },
  { route: "marketing", Page: MarketingStep, meta: marketingMeta, eyebrow: "Steps 03–04 · Marketing", title: "Find the Right Customer. Create a Reason to Talk.", steps: [3, 4], first: [4, 9] },
  { route: "sales", Page: SalesStep, meta: salesMeta, eyebrow: "Steps 05–07 · Sales", title: "Understand. Demonstrate. Help the Customer Decide.", steps: [5, 6, 7], first: [21, 10, 31] },
  { route: "pilot", Page: PilotStep, meta: pilotMeta, eyebrow: "Step 08 · Pilot", title: "Prove Value Before Asking for a Bigger Commitment", steps: [8], first: [37] },
  { route: "close", Page: CloseStep, meta: closeMeta, eyebrow: "Step 09 · Proposal & Close", title: "From Proven Value to a Purchase Order", steps: [9], first: [34] },
  { route: "revenue", Page: RevenueStep, meta: revenueMeta, eyebrow: "Step 10 · Revenue & Profit", title: "Revenue Is Only Good When Customer Value Is Real", steps: [10], first: [56] },
] as const;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  window.localStorage.clear();
  useRevenue.getState().resetAll();
});

describe("Step pages", () => {
  it.each(PAGES)("$route: its own indexable page, headline and steps, each with Do, Avoid, a result and Start", ({ route, Page, meta, eyebrow, title, steps, first }) => {
    expect(meta.alternates?.canonical).toBe(`https://autonomous.ev.engineer${BASE}/${route}`);
    expect((meta.robots as { index: boolean }).index).toBe(true);
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText(eyebrow)).toBeInTheDocument();
    steps.forEach((n, i) => {
      const section = document.getElementById(`step-${n}`)!;
      expect(section, `Step ${n}`).not.toBeNull();
      expect(within(section).getByRole("heading", { level: 3, name: "Do" })).toBeInTheDocument();
      expect(within(section).getByRole("heading", { level: 3, name: "Avoid" })).toBeInTheDocument();
      expect(within(section).getByText("Result")).toBeInTheDocument();
      expect(within(section).getByRole("link", { name: `Start Step ${n} →` })).toHaveAttribute("href", `${BASE}/today#day-${first[i]}`);
      expect(within(section).getByText("Learn More")).toBeInTheDocument();
    });
  });

  it("customer: the company and its people, then the workflow with its hypotheses", async () => {
    const user = userEvent.setup();
    render(<CustomerStep />);
    expect(within(document.getElementById("step-1")!).getByRole("list", { name: "People in the customer company" })).toBeInTheDocument();
    const step2 = document.getElementById("step-2")!;
    expect(within(step2).getByRole("list", { name: "The customer's FAI workflow" })).toBeInTheDocument();
    expect(within(step2).getByText("Hypothesis — Validate with Customer")).toBeInTheDocument();
    expect(within(step2).getByRole("heading", { level: 3, name: "Ask" })).toBeInTheDocument();
    await user.click(within(step2).getByText("Learn More"));
    expect(within(step2).getByText("Pain hypotheses")).toBeInTheDocument();
    // The evidence ladder lives here, not on the homepage.
    expect(within(step2).getByText("The evidence ladder")).toBeInTheDocument();
    expect(within(step2).getByText("Commercial Proof")).toBeInTheDocument();
    expect(within(step2).getByRole("link", { name: "Day 3" })).toHaveAttribute("href", `${BASE}/today#day-3`);
  });

  it("marketing: four stages — Find, Research, Position, Reach — then lessons on request", () => {
    render(<MarketingStep />);
    const stages = within(screen.getByRole("list", { name: "Marketing in four stages" })).getAllByRole("button");
    expect(stages.map((stage) => stage.querySelector("span:nth-child(2)")!.textContent)).toEqual(["Find", "Research", "Position", "Reach"]);
    expect(within(document.getElementById("step-4")!).getByRole("list", { name: "Generating leads" })).toHaveTextContent("FindResearchPrioritiseContact");
    // Lessons wait behind Learn more.
    expect(document.querySelector("#step-3 details")).not.toHaveAttribute("open");
  });

  it("sales: the eight-stage path, and the Customer Meeting Guide one tap from the bottom bar's Sales", () => {
    render(<SalesStep />);
    const stages = within(screen.getByRole("list", { name: "From first contact to purchase" })).getAllByRole("button");
    expect(stages.map((stage) => stage.querySelector("span:nth-child(2)")!.textContent)).toEqual(["Contact", "Discovery", "Validate", "Demo", "Value", "Pilot", "Proposal", "Purchase"]);
    expect(within(screen.getByRole("navigation", { name: "Essentials" })).getByRole("link", { name: "Sales" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Prepare for Customer Meeting" })).toHaveAttribute("href", "#meeting-guide");
    const guide = screen.getByRole("region", { name: "Customer Meeting Guide" });
    expect(guide).toHaveAttribute("id", "meeting-guide");
    expect(guide).toHaveTextContent("Understand the customer's existing FAI workflow.");
    const ask = within(guide).getByRole("heading", { level: 3, name: "Ask" }).nextElementSibling!;
    expect(within(ask as HTMLElement).getAllByRole("listitem")).toHaveLength(7);
    expect(within(guide).getAllByRole("listitem").map((li) => li.textContent)).toEqual(expect.arrayContaining(["Time", "Rework", "Errors", "Review effort", "Revisions", "Delivery impact", "Approval delay"]));
    expect(guide).toHaveTextContent("Permission for a relevant product demonstration or sample evaluation.");
    // After the meeting: what to record and the next step.
    expect(within(guide).getByRole("heading", { level: 3, name: "After the meeting, record" })).toBeInTheDocument();
    expect(guide).toHaveTextContent("The agreed next step, with a date");
    expect(within(guide).getByRole("link", { name: "Write your meeting notes →" })).toHaveAttribute("href", `${BASE}/accounts#meetings`);
  });

  it("sales: Talk to the Customer lists what not to ask yet", () => {
    render(<SalesStep />);
    const step6 = document.getElementById("step-6")!;
    expect(within(step6).getByRole("heading", { level: 3, name: "Don't ask yet" })).toBeInTheDocument();
    for (const question of ["Do you want to buy our software?", "What is your budget?", "Is your current process bad?", "Don't you think AI can solve this?", "Can we replace your existing system?"]) expect(within(step6).getByText(question)).toBeInTheDocument();
  });

  it("pilot: the current workflow beside the FAI-assisted one, measured the same way", () => {
    render(<PilotStep />);
    expect(screen.getByText("Current Workflow")).toBeInTheDocument();
    expect(screen.getByText("FAI-Assisted Workflow")).toBeInTheDocument();
    const compare = screen.getByRole("figure");
    expect(within(compare).getAllByRole("term").map((term) => term.textContent)).toEqual(["Time", "Manual work", "Review effort", "Corrections", "User feedback"]);
    // No numbers: the pilot produces them, with the customer.
    expect(compare.textContent).not.toMatch(/\d+\s*%/);
    expect(screen.getAllByText(/Agree success criteria before starting/).length).toBeGreaterThan(0);
  });

  it("close: interest is not a purchase, and what may still stand before the order", () => {
    render(<CloseStep />);
    expect(screen.getByText("Customer interest is not a purchase.")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Before a purchase order" })).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Technical review",
      "IT / security review",
      "Procurement",
      "Vendor registration",
      "NDA",
      "Commercial negotiation",
      "Purchase order",
    ]);
    expect(within(screen.getByRole("list", { name: "From validated problem to purchase" })).getAllByRole("button")).toHaveLength(6);
  });

  it("revenue: four plain questions first, the formal metrics behind Learn Advanced Metrics", () => {
    render(<RevenueStep />);
    const step10 = document.getElementById("step-10")!;
    expect(within(within(step10).getByRole("list", { name: "Four questions about revenue" })).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "What did we earn?",
      "What did it cost to acquire and support the customer?",
      "Will the customer renew?",
      "Can we serve more customers profitably?",
    ]);
    const advanced = within(step10).getByText("Learn Advanced Metrics").closest("details")!;
    expect(advanced).not.toHaveAttribute("open");
    expect(within(advanced).getAllByRole("term").map((term) => term.textContent)).toEqual([
      "CAC — Customer Acquisition Cost",
      "ACV — Annual Contract Value",
      "LTV — Lifetime Value",
      "Sales cycle",
      "Pipeline coverage",
      "Margin",
      "Renewal",
    ]);
  });

  it("link to the previous and next pages in journey order", () => {
    const { unmount } = render(<CustomerStep />);
    let nav = screen.getByRole("navigation", { name: "Previous and next steps" });
    expect(within(nav).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([BASE, `${BASE}/marketing`]);
    unmount();
    render(<RevenueStep />);
    nav = screen.getByRole("navigation", { name: "Previous and next steps" });
    expect(within(nav).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([`${BASE}/close`, `${BASE}/case-study`]);
  });
});
