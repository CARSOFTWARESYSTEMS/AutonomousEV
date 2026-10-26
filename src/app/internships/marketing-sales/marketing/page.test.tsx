import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships/marketing-sales/marketing" }));
vi.mock("@/utils/analytics", () => ({ trackEvent: vi.fn() }));

import { useRevenue } from "@/components/revenue/state/store";
import ExecutionPage from "../execution/page";
import SalesPage from "../sales/page";
import MarketingPage, { metadata } from "./page";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  window.localStorage.clear();
  useRevenue.getState().resetAll();
});

const weekButtons = () => screen.getAllByRole("button", { expanded: true }).concat(screen.getAllByRole("button", { expanded: false })).filter((b) => /^Week \d+/.test(b.textContent ?? ""));

describe("Journey pages", () => {
  it("give each month its own page and metadata", () => {
    expect(metadata.alternates?.canonical).toBe("https://autonomous.ev.engineer/internships/marketing-sales/marketing");
    render(<MarketingPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Prove the Market" })).toBeInTheDocument();
    const months = screen.getByRole("navigation", { name: "Journey months" });
    expect(within(months).getAllByRole("link").map((link) => link.textContent)).toEqual(["01 Marketing", "02 Sales", "03 Execution"]);
    expect(within(months).getByRole("link", { name: "01 Marketing" })).toHaveAttribute("aria-current", "page");
  });

  it("show four week cards, with only the active week open", () => {
    render(<MarketingPage />);
    const titles = weekButtons().map((button) => button.textContent);
    expect(titles.map((t) => t?.replace(/\d\/5.*/, ""))).toEqual(expect.arrayContaining(["Week 1Market & Problem", "Week 2Customer Discovery", "Week 3Value & Positioning", "Week 4Go-To-Market"]));
    expect(screen.getAllByRole("button", { expanded: true })).toHaveLength(1);
    expect(screen.getByRole("button", { expanded: true })).toHaveTextContent("Week 1");
  });

  it("reveal five daily missions per week, each opening in Today", async () => {
    const user = userEvent.setup();
    render(<MarketingPage />);
    const week1 = document.getElementById("rv-week-1")!;
    const days = within(week1).getAllByRole("link");
    expect(days).toHaveLength(5);
    expect(days[0]).toHaveAttribute("href", "/internships/marketing-sales/today#day-1");
    expect(days[0]).toHaveTextContent("Understand the Bengaluru Aerospace & Defence Market");
    expect(document.getElementById("rv-week-2")).not.toBeVisible();
    await user.click(screen.getByRole("button", { name: /Week 2/ }));
    expect(document.getElementById("rv-week-2")).toBeVisible();
    expect(document.getElementById("rv-week-1")).not.toBeVisible();
  });

  it("name the Weekly Business Challenge, not the Founder Challenge", () => {
    const { container } = render(<MarketingPage />);
    expect(container.textContent).toContain("Weekly Business Challenge");
    expect(container.textContent).not.toContain("Founder Challenge");
  });

  it("open the user's current week on the month they are in", () => {
    act(() => useRevenue.getState().setDay(27));
    render(<SalesPage />);
    expect(screen.getByRole("button", { expanded: true })).toHaveTextContent("Week 6");
  });

  it("show commercial indicators first on the Execution month, from the user's own data only", () => {
    const { container } = render(<ExecutionPage />);
    const signals = screen.getByRole("region", { name: "Your pipeline so far" });
    expect(within(signals).getByText("Qualified pipeline")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Orion|Synthetic Demonstration/);
    expect(screen.getByRole("heading", { level: 2, name: "Final boardroom" })).toBeInTheDocument();
    expect(screen.getByRole("button", { expanded: true })).toHaveTextContent("Week 9");
  });
});
