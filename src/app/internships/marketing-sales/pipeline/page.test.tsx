import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships/marketing-sales/pipeline" }));
vi.mock("@/utils/analytics", () => ({ trackEvent: vi.fn() }));

import { useRevenue } from "@/components/revenue/state/store";
import { trackEvent } from "@/utils/analytics";
import Page, { metadata } from "./page";

const tracked = () => vi.mocked(trackEvent).mock.calls.map(([event]) => event);

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  window.localStorage.clear();
  useRevenue.getState().resetAll();
  vi.mocked(trackEvent).mockClear();
});

describe("Pipeline page: the Revenue Cockpit", () => {
  it("is a personal tool: not indexed", () => {
    expect((metadata.robots as { index: boolean }).index).toBe(false);
  });

  it("shows the eight cockpit figures and the North Star with its six conditions", () => {
    render(<Page />);
    const cockpit = screen.getByLabelText("Cockpit");
    expect(within(cockpit).getAllByRole("term").map((term) => term.textContent)).toEqual(["Accounts", "Meetings", "Validated pains", "Qualified opportunities", "Pilots", "Proposals", "Pipeline ₹", "Revenue ₹"]);
    const north = screen.getByRole("region", { name: "Qualified Revenue Pipeline Created" });
    expect(within(north).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Right account", "Validated problem", "Relevant stakeholder", "Plausible technical fit", "Plausible commercial fit", "Agreed next action"]);
  });

  it("labels synthetic examples and drops them on request", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const north = screen.getByRole("region", { name: "Qualified Revenue Pipeline Created" });
    expect(north).toHaveTextContent("₹1,80,000");
    expect(screen.getAllByText("Synthetic Demonstration Data").length).toBeGreaterThan(0);
    await user.click(screen.getByLabelText("Include synthetic examples"));
    expect(north).toHaveTextContent("₹0");
    expect(screen.queryByText("Synthetic Demonstration Data")).toBeNull();
  });

  it("says when pipeline work begins, without locking anyone out", () => {
    render(<Page />);
    expect(screen.getByText(/Pipeline work begins on Day 39/)).toBeInTheDocument();
    act(() => useRevenue.getState().setDay(40));
    expect(screen.queryByText(/Pipeline work begins on Day 39/)).toBeNull();
  });

  it("moves an opportunity through stages and asks for the learning when it is lost", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText(/Opportunity name/), "Account X workflow review");
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    const card = screen.getByRole("heading", { level: 3, name: "Account X workflow review" }).closest("li")!;
    await user.selectOptions(within(card).getByLabelText("Stage"), "proposal");
    expect(tracked()).toEqual(expect.arrayContaining(["pipeline_stage_change", "proposal_stage_entered"]));
    await user.selectOptions(within(card).getByLabelText("Stage"), "lost");
    expect(within(card).getByText("Learning required")).toBeInTheDocument();
    expect(JSON.stringify(vi.mocked(trackEvent).mock.calls)).not.toMatch(/Account X/);
  });

  it("will not let a pilot pass without predefined criteria and a baseline", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByText("Open the pilot charter"));
    const status = screen.getByLabelText("Pilot status");
    expect(within(status).getByRole("option", { name: /Passed/ })).toBeDisabled();
    act(() => useRevenue.getState().setPilot({ status: "passed" }));
    expect(useRevenue.getState().pilot.status).not.toBe("passed");
    await user.type(screen.getByLabelText(/Success criteria/), "Preparation time per drawing measured and agreed");
    await user.type(screen.getByLabelText(/Baseline/), "Last three FAIs");
    expect(within(status).getByRole("option", { name: "Passed" })).not.toBeDisabled();
  });

  it("works revenue backwards from the target", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByText("Revenue math — from target to outreach"));
    expect(screen.getByText("Required Pipeline = Revenue Target ÷ Expected Win Rate")).toBeInTheDocument();
  });
});
