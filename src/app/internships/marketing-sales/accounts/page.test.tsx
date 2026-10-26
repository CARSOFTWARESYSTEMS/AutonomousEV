import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships/marketing-sales/accounts" }));
vi.mock("@/utils/analytics", () => ({ trackEvent: vi.fn() }));

import { useRevenue } from "@/components/revenue/state/store";
import { trackEvent } from "@/utils/analytics";
import Page, { metadata } from "./page";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  window.localStorage.clear();
  useRevenue.getState().resetAll();
  vi.mocked(trackEvent).mockClear();
});

describe("Accounts page", () => {
  it("is a personal tool: not indexed", () => {
    expect((metadata.robots as { index: boolean }).index).toBe(false);
  });

  it("shows each account's company, fit, why, pain, buyer, status, next and evidence — synthetic ones labelled", () => {
    render(<Page />);
    const vega = screen.getByRole("heading", { level: 2, name: "Vega Aerospace Components" }).closest("li")!;
    expect(within(vega).getByText("Synthetic Demonstration Data")).toBeInTheDocument();
    expect(within(vega).getByText("Fit: Medium")).toBeInTheDocument();
    expect(within(vega).getAllByRole("term").map((term) => term.textContent)).toEqual(["Why", "Pain", "Buyer", "Status", "Next", "Evidence"]);
    expect(within(vega).getByText("Unknown")).toBeInTheDocument();
    expect(within(vega).getByText("Research current FAI workflow")).toBeInTheDocument();
    expect(within(vega).queryByRole("button", { name: /^Delete/ })).toBeNull();
  });

  it("asks for a reason and a source before saving, and keeps names out of analytics", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole("button", { name: "Add account" }));
    const save = screen.getByRole("button", { name: "Save account" });
    expect(save).toHaveAttribute("aria-disabled", "true");
    await user.type(screen.getByLabelText(/^Company/), "Account X");
    await user.type(screen.getByLabelText(/^Why this account/), "Precision machining");
    await user.type(screen.getByLabelText(/^Evidence source/), "Company website");
    await user.click(save);
    expect(screen.getByRole("heading", { level: 2, name: "Account X" })).toBeInTheDocument();
    expect(JSON.stringify(vi.mocked(trackEvent).mock.calls)).not.toMatch(/Account X/);
  });

  it("prepares a meeting for an account, with the question bank beside it", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole("button", { name: "Prepare meeting with Orion Precision Aero Pvt Ltd" }));
    const meetings = screen.getByRole("region", { name: "Meeting prep" });
    expect(within(meetings).getByLabelText(/^Account/)).toHaveValue("Orion Precision Aero Pvt Ltd");
    expect(within(meetings).getByRole("group", { name: "Question category" })).toBeInTheDocument();
  });
});
