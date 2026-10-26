import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships/marketing-sales/today" }));
vi.mock("@/utils/analytics", () => ({ trackEvent: vi.fn() }));

import { STORAGE_KEY, useRevenue } from "@/components/revenue/state/store";
import { trackEvent } from "@/utils/analytics";
import Page, { metadata } from "./page";

const BASE = "/internships/marketing-sales";
const ROUTE = `${BASE}/today`;
const tracked = () => vi.mocked(trackEvent).mock.calls.map(([event]) => event);
/** The card a phone shows: the one marked active. */
const activeCard = () => document.querySelector<HTMLElement>("[data-card][data-active]")!;
const card = (id: string) => document.querySelector<HTMLElement>(`[data-card="${id}"]`)!;
const openDay = (day: number, stage = 0) =>
  act(() => {
    useRevenue.getState().setDay(day);
    useRevenue.getState().setStage(day, stage);
  });

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

describe("Today: what do I do today?", () => {
  it("is its own page with its own metadata", () => {
    expect(metadata.alternates?.canonical).toBe(`https://autonomous.ev.engineer${ROUTE}`);
    expect(metadata.title).toBe("Today | Marketing & Sales | EV.ENGINEER™");
  });

  it("opens on the day, its step, what we are learning, why it matters and one action: Start", () => {
    render(<Page />);
    expect(screen.getByText(/^Day 01/)).toHaveTextContent("Day 01 / 60 · Step 01 Understand Customer");
    expect(screen.getByRole("heading", { level: 1, name: "Understand the Customer" })).toBeInTheDocument();
    expect(card("today")).toHaveTextContent("Understand what type of Bengaluru aerospace / defence company may need FAI software.");
    expect(within(card("today")).getByRole("heading", { level: 2, name: "Why does it matter?" })).toBeInTheDocument();
    expect(within(card("today")).getByRole("button", { name: "Start →" })).toBeInTheDocument();
    expect(activeCard()).toBe(card("today"));
  });

  it("lays every day out as five cards — Today (with Why), Do, Ask, Don't and Result — each a question", () => {
    render(<Page />);
    const cards = [...document.querySelectorAll<HTMLElement>("[data-card]")].filter((node) => node.tagName !== "DIV");
    expect(cards.map((node) => node.dataset.card)).toEqual(["today", "do", "ask", "dont", "result"]);
    expect(screen.getAllByRole("heading", { level: 2 }).slice(0, 5).map((h) => h.textContent)).toEqual([
      "Why does it matter?",
      "What exactly should I do?",
      "What should I ask?",
      "What should I avoid?",
      "What should I have when I finish?",
    ]);
  });

  it("is Day 1 of the brief: research five companies, no contact, five things not to do", () => {
    render(<Page />);
    expect(card("today")).toHaveTextContent("You cannot market a product effectively if you do not know who the customer is.");
    expect(within(card("do")).getAllByRole("checkbox")).toHaveLength(5);
    expect(card("do")).toHaveTextContent("Research 5 Bengaluru aerospace / defence manufacturing companies, from public sources.");
    expect(card("ask")).toHaveTextContent("No customer contact today. Answer these from research.");
    expect(card("ask")).toHaveTextContent("Who appears responsible for quality?");
    expect(card("dont")).toHaveTextContent("Don't call every aerospace company a target customer.");
    expect(card("result")).toHaveTextContent("5 researched companies");
  });

  it("moves one card at a time on a phone: Start, Next, Back — and remembers the card", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole("button", { name: "Start →" }));
    expect(activeCard()).toBe(card("do"));
    expect(useRevenue.getState().stages[1]).toBe(1);
    expect(tracked()).toContain("mission_step_view");
    await user.click(within(card("do")).getByRole("button", { name: "Next →" }));
    expect(activeCard()).toBe(card("ask"));
    await user.click(within(card("ask")).getByRole("button", { name: "← Back" }));
    expect(activeCard()).toBe(card("do"));
  });

  it("keeps the advanced tools out of Day 1", () => {
    const { container } = render(<Page />);
    const text = container.querySelector("main")!.textContent ?? "";
    for (const hidden of ["Revenue Cockpit", "North Star", "Founder Challenge", "Synthetic", "₹", "Gate A", "Mentor check", "Final review", "Weekly review"]) expect(text, hidden).not.toContain(hidden);
  });

  it("puts what to ask, and what not to ask, in the Ask card — and the meeting guide once meetings begin", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Page />);
    expect(within(card("ask")).getByText("Do you want to buy our software?")).toBeInTheDocument();
    expect(within(card("ask")).queryByRole("link", { name: "Customer Meeting Guide →" })).toBeNull();
    unmount();

    openDay(10, 2);
    render(<Page />);
    expect(within(card("ask")).getByRole("link", { name: "Customer Meeting Guide →" })).toHaveAttribute("href", `${BASE}/sales#meeting-guide`);
    await user.click(within(card("ask")).getByText("More questions for your meeting"));
    await user.click((await screen.findAllByRole("button", { name: /^Add/ }))[0]);
    expect(useRevenue.getState().questionSet).toHaveLength(1);
  });

  it("brings the claim checker into Don't only once outreach begins, on Day 26", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Page />);
    expect(screen.queryByText("Check a message before you send it")).toBeNull();
    unmount();

    openDay(26, 3);
    render(<Page />);
    await user.click(screen.getByText("Check a message before you send it"));
    await user.type(await screen.findByLabelText("Check a draft message before you send it"), "Our software guarantees AS9102 compliance.");
    expect(screen.getByText(/do not send this message/)).toBeInTheDocument();
  });

  it("brings the ROI calculator into Day 33's Do card", async () => {
    const user = userEvent.setup();
    openDay(33, 1);
    render(<Page />);
    await user.click(within(card("do")).getByText("ROI calculator"));
    expect(await screen.findByText(/They are not guaranteed savings\./)).toBeInTheDocument();
  });

  it("completes a day only once its results are ticked, then offers the next", async () => {
    const user = userEvent.setup();
    openDay(1, 4);
    render(<Page />);
    const result = card("result");
    expect(within(result).getByRole("button", { name: "Complete Day 1 →" })).toHaveAttribute("aria-disabled", "true");
    expect(result).toHaveTextContent("Tick 2 more results above");
    for (const box of within(within(result).getByRole("list", { name: "Tick when you have it" })).getAllByRole("checkbox")) await user.click(box);
    await user.click(within(result).getByRole("button", { name: "Complete Day 1 →" }));
    expect(screen.getByText("Day 1 is complete.")).toBeInTheDocument();
    expect(tracked()).toEqual(expect.arrayContaining(["evidence_submit", "daily_mission_complete"]));
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).state.completed[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toHaveTextContent("1 of 60 days complete");
    await user.click(screen.getByRole("button", { name: "Start Day 2 →" }));
    expect(screen.getByRole("heading", { level: 1, name: "Understand the FAI Workflow" })).toBeInTheDocument();
    expect(activeCard()).toBe(card("today"));
  });

  it("will not complete a customer-facing day without the reflection", () => {
    act(() => {
      useRevenue.getState().setDay(10);
      useRevenue.getState().setStage(10, 4);
      for (let i = 0; i < 2; i++) useRevenue.getState().toggleCheck(`10:submit:${i}`);
    });
    render(<Page />);
    expect(screen.getByRole("button", { name: "Complete Day 10 →" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Answer the four questions in “What changed my mind?”")).toBeInTheDocument();
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

describe("Today: the step, mentor checks and navigation", () => {
  it("shows the day's step and only that step's days — never the sixty", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const rail = screen.getByRole("navigation", { name: "This step" });
    expect(rail).toHaveTextContent("Step 01 of 10");
    expect(rail).toHaveTextContent("Understand the Customer");
    const days = within(within(rail).getByRole("list", { name: "Days in Step 1" })).getAllByRole("button");
    expect(days.map((day) => day.firstChild!.textContent)).toEqual(["Day 1", "Day 6", "Day 7", "Day 8"]);
    expect(days[0]).toHaveAttribute("aria-current", "step");
    await user.click(days[1]);
    expect(screen.getByRole("heading", { level: 1, name: "Customer Segmentation" })).toBeInTheDocument();
    expect(within(rail).getByRole("link", { name: "All 10 steps →" })).toHaveAttribute("href", `${BASE}#journey`);
  });

  it("jumps to any day from the step column, and shows which day is open", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const picker = within(screen.getByRole("navigation", { name: "This step" })).getByRole("combobox", { name: "Go to any day" });
    expect(picker).toHaveValue("1");
    await user.selectOptions(picker, "47");
    expect(screen.getByRole("heading", { level: 1, name: "Validate / Invalidate Pain" })).toBeInTheDocument();
    expect(window.location.hash).toBe("#day-47");
    expect(within(screen.getByRole("navigation", { name: "This step" })).getByRole("combobox", { name: "Go to any day" })).toHaveValue("47");
  });

  it("shows a mentor check only on its day, and keeps Gate G locked until Gates A–F and Professional Behaviour", () => {
    openDay(10, 4);
    const { unmount } = render(<Page />);
    expect(screen.getByLabelText(/^Gate A — Market Ready/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Gate C — Discovery Ready/)).toBeInTheDocument();
    unmount();

    openDay(40, 4);
    render(<Page />);
    expect(screen.getByLabelText(/^Gate G — Customer-Facing/)).toBeDisabled();
    act(() => {
      for (const id of ["A", "B", "C", "D", "E", "F"] as const) useRevenue.getState().setGate(id, true);
      useRevenue.getState().setProfessional(true);
    });
    expect(screen.getByLabelText(/^Gate G — Customer-Facing/)).not.toBeDisabled();
  });

  it("adds the weekly review on Fridays and the final review on the last two days", () => {
    openDay(5, 4);
    const { unmount } = render(<Page />);
    expect(screen.getByText("Weekly review — due today")).toBeInTheDocument();
    expect(screen.queryByText("Final review")).toBeNull();
    unmount();
    openDay(59, 4);
    render(<Page />);
    expect(screen.getByText("Final review")).toBeInTheDocument();
  });

  it("uses the same header and bottom bar as every page, with Today current", async () => {
    const user = userEvent.setup();
    render(<Page />);
    expect(screen.getByRole("link", { name: "Today: Day 1 of 60" })).toHaveAttribute("aria-current", "page");
    const bar = screen.getByRole("navigation", { name: "Essentials" });
    expect(within(bar).getAllByRole("link").map((link) => link.textContent)).toEqual(["Today", "Journey", "Customer", "Sales"]);
    expect(within(bar).getByRole("link", { name: "Today" })).toHaveAttribute("aria-current", "page");
    await user.click(within(bar).getByRole("button", { name: "More" }));
    const sheet = screen.getByRole("dialog", { name: "More" });
    expect(within(sheet).getByRole("link", { name: /Case Study/ })).toHaveAttribute("href", `${BASE}/case-study`);
    expect(within(sheet).getByRole("link", { name: "Customer Meeting Guide" })).toHaveAttribute("href", `${BASE}/sales#meeting-guide`);
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

  it("opens a day saved on a later card of an older, longer flow on its last card", () => {
    openDay(4, 7);
    render(<Page />);
    expect(activeCard()).toBe(card("result"));
  });
});
