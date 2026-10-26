import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships/marketing-sales/today" }));
vi.mock("@/utils/analytics", () => ({ trackEvent: vi.fn() }));

import { STORAGE_KEY, useRevenue } from "@/components/revenue/state/store";
import { trackEvent } from "@/utils/analytics";
import Page, { metadata } from "./page";

const ROUTE = "/internships/marketing-sales/today";
const tracked = () => vi.mocked(trackEvent).mock.calls.map(([event]) => event);
const steps = () => within(screen.getByRole("list", { name: "Today's steps" })).getAllByRole("button");
const step = (label: string) => steps().find((button) => button.textContent?.replace(/^[\d✓]/, "").startsWith(label))!;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

beforeEach(() => {
  window.localStorage.clear();
  useRevenue.getState().resetAll();
  window.history.replaceState(null, "", ROUTE);
  vi.mocked(trackEvent).mockClear();
});

describe("Today: the core application experience", () => {
  it("is its own page with its own metadata", () => {
    expect(metadata.alternates?.canonical).toBe(`https://autonomous.ev.engineer${ROUTE}`);
    expect(metadata.title).toMatch(/^Today's Mission/);
  });

  it("opens on a calm intro: the day, the phase, one objective and Start Mission", () => {
    render(<Page />);
    expect(screen.getByText(/^Day 01/)).toHaveTextContent("Day 01 / 60");
    expect(screen.getByText("Prove the Market · Week 1 · Market & Problem")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Understand the Bengaluru Aerospace & Defence Market" })).toBeInTheDocument();
    expect(screen.getByText("Identify the types of companies most likely to experience drawing-driven inspection and FAI workflow pain.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Mission →" })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Today's steps" })).toBeNull();
  });

  it("guides through Learn → Do → Ask → Don't → Evidence → Review → Complete, one stage at a time", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole("button", { name: "Start Mission →" }));
    expect(steps().map((button) => button.textContent?.replace(/^[\d✓]/, "").replace(" (done)", ""))).toEqual(["Learn", "Do", "Ask", "Don't", "Evidence", "Review", "Complete"]);
    expect(step("Learn")).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("heading", { level: 2, name: "Learn" })).toBeInTheDocument();
    expect(screen.getByText("Know the ecosystem before you contact anyone in it.")).toBeInTheDocument();
    expect(screen.getByText("Go deeper")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next: Do →" }));
    expect(screen.getByRole("heading", { level: 2, name: "Do" })).toBeInTheDocument();
    expect(step("Learn")).toHaveAttribute("data-state", "done");
    expect(step("Do")).toHaveAttribute("aria-current", "step");
    expect(step("Ask")).toHaveAttribute("data-state", "todo");
    expect(tracked()).toContain("mission_step_view");
    // The stage reached is remembered.
    expect(useRevenue.getState().stages[1]).toBe(2);
  });

  it("puts customer questions two taps away, with what not to ask", async () => {
    const user = userEvent.setup();
    act(() => useRevenue.getState().setStage(1, 3));
    render(<Page />);
    expect(screen.getByRole("heading", { level: 2, name: "Ask" })).toBeInTheDocument();
    expect(screen.getByText("Understand the current workflow — not sell.")).toBeInTheDocument();
    expect(screen.getByText("Do you want to buy our software?")).toBeInTheDocument();
    await user.click(screen.getByText("More questions for your meeting"));
    await user.click((await screen.findAllByRole("button", { name: /^Add/ }))[0]);
    expect(useRevenue.getState().questionSet).toHaveLength(1);
  });

  it("reveals the claim checker only once outreach begins, on Day 26", async () => {
    const user = userEvent.setup();
    act(() => useRevenue.getState().setStage(1, 4));
    const { unmount } = render(<Page />);
    expect(screen.queryByLabelText("Check a draft message before you send it")).toBeNull();
    expect(screen.getByText(/opens on Day 26/)).toBeInTheDocument();
    unmount();

    act(() => {
      useRevenue.getState().setDay(26);
      useRevenue.getState().setStage(26, 4);
    });
    render(<Page />);
    await user.type(await screen.findByLabelText("Check a draft message before you send it"), "Our software guarantees AS9102 compliance.");
    expect(screen.getByText(/do not send this message/)).toBeInTheDocument();
  });

  it("brings the ROI calculator into Day 33's evidence step", async () => {
    const user = userEvent.setup();
    act(() => {
      useRevenue.getState().setDay(33);
      useRevenue.getState().setStage(33, 5);
    });
    render(<Page />);
    await user.click(screen.getByText("ROI calculator"));
    expect(await screen.findByText(/They are not guaranteed savings\./)).toBeInTheDocument();
  });

  it("completes a day only once its record is ticked, then offers the next", async () => {
    const user = userEvent.setup();
    act(() => useRevenue.getState().setStage(1, 5));
    render(<Page />);
    for (const box of within(screen.getByRole("heading", { name: "Record" }).parentElement!).getAllByRole("checkbox")) await user.click(box);
    await user.click(step("Complete"));
    await user.click(screen.getByRole("button", { name: "Complete Day 1" }));
    expect(screen.getByText("Day 1 is complete.")).toBeInTheDocument();
    expect(tracked()).toEqual(expect.arrayContaining(["evidence_submit", "daily_mission_complete"]));
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).state.completed[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await user.click(screen.getByRole("button", { name: "Start Day 2 →" }));
    expect(screen.getByRole("heading", { level: 1, name: "Understand the FAI Workflow" })).toBeInTheDocument();
  });

  it("will not complete a customer-facing day without the reflection", () => {
    act(() => {
      useRevenue.getState().setDay(10);
      useRevenue.getState().setStage(10, 7);
      for (let i = 0; i < 2; i++) useRevenue.getState().toggleCheck(`10:submit:${i}`);
    });
    render(<Page />);
    expect(screen.getByRole("button", { name: "Complete Day 10" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Answer the four reflection questions in Review")).toBeInTheDocument();
  });

  it("opens a day from the address and moves between days", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", `${ROUTE}#day-33`);
    render(<Page />);
    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "ROI & Business Value" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Next day, Day 34" }));
    expect(screen.getByRole("heading", { level: 1, name: "Pricing Architecture" })).toBeInTheDocument();
    expect(window.location.hash).toBe("#day-34");
  });
});

describe("Today: context and navigation", () => {
  it("shows progress by month and the active week only — no synthetic data", () => {
    const { container } = render(<Page />);
    const panel = screen.getByRole("complementary", { name: "Progress, evidence and gates" });
    expect(within(panel).getByText("Month 1 — Market")).toBeInTheDocument();
    expect(within(panel).getAllByText("0 / 20")).toHaveLength(3);
    expect(within(within(panel).getByRole("list", { name: "Week 1" })).getAllByRole("button").map((b) => b.textContent)).toEqual(["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"]);
    expect(within(panel).getByText("Prove the problem may exist.")).toBeInTheDocument();
    expect(within(panel).getByText("Weekly Business Challenge · Week 1")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Synthetic Demonstration|Orion|Vega|Akash|₹/);
  });

  it("keeps Gate G locked until Gates A–F and Professional Behaviour are complete", () => {
    render(<Page />);
    const gateG = screen.getByLabelText("Gate G — Customer-Facing");
    expect(gateG).toBeDisabled();
    act(() => {
      for (const id of ["A", "B", "C", "D", "E", "F"] as const) useRevenue.getState().setGate(id, true);
      useRevenue.getState().setProfessional(true);
    });
    expect(screen.getByLabelText("Gate G — Customer-Facing")).not.toBeDisabled();
  });

  it("uses app navigation — Today, Journey, Accounts, Pipeline, More — on every screen size", async () => {
    const user = userEvent.setup();
    render(<Page />);
    for (const name of ["Framework", "Framework essentials"]) {
      const nav = screen.getByRole("navigation", { name });
      expect(within(nav).getAllByRole("link").map((link) => link.textContent)).toEqual(["Today", "Journey", "Accounts", "Pipeline"]);
      expect(within(nav).getByRole("link", { name: "Today" })).toHaveAttribute("aria-current", "page");
      expect(within(nav).getByRole("link", { name: "Journey" })).toHaveAttribute("href", "/internships/marketing-sales/marketing");
    }
    await user.click(within(screen.getByRole("navigation", { name: "Framework essentials" })).getByRole("button", { name: "More" }));
    const sheet = screen.getByRole("dialog", { name: "More" });
    expect(within(sheet).getByRole("link", { name: /Case Study/ })).toHaveAttribute("href", "/internships/marketing-sales/case-study");
    expect(within(sheet).getByRole("link", { name: "Apply for Internship" })).toHaveAttribute("href", "/contact");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("restores saved progress, and the address wins over the saved day", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { day: 12, completed: { 1: "2026-10-26" } }, version: 2 }));
    render(<Page />);
    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Feature vs Business Outcome" })).toBeInTheDocument());
  });

  it("moves version 1 progress into version 2", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { day: 3, accounts: [{ id: "a", name: "Old" }] }, version: 1 }));
    render(<Page />);
    await waitFor(() => expect(useRevenue.getState().day).toBe(3));
    expect(useRevenue.getState().accounts[0]).toMatchObject({ name: "Old", pain: "Unknown", status: "Researching" });
    expect(useRevenue.getState().stages).toEqual({});
  });
});
