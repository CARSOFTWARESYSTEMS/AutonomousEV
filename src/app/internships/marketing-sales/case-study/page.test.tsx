import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships/marketing-sales/case-study" }));
vi.mock("@/utils/analytics", () => ({ trackEvent: vi.fn() }));

import { useRevenue } from "@/components/revenue/state/store";
import Page, { metadata } from "./page";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  window.localStorage.clear();
  useRevenue.getState().resetAll();
});

describe("Case Study page", () => {
  it("is indexable and focused on the live FAI case", () => {
    expect(metadata.alternates?.canonical).toBe("https://autonomous.ev.engineer/internships/marketing-sales/case-study");
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1, name: "Balloon Drawings & AS9102 FAI Reporting" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Product",
      "Market: Bengaluru Aerospace & Defence",
      "Problem hypotheses",
      "ICP & buyer map",
      "Evidence",
      "Value proposition V1",
      "Alternatives",
      "Approved demo — 15 minutes",
      "ROI",
      "Objections",
      "Pilot",
      "Product feedback",
    ]);
  });

  it("separates the five evidence levels and never shows a hypothesis as validated", () => {
    render(<Page />);
    const evidence = screen.getByRole("region", { name: "Evidence" });
    for (const level of ["Assumption", "Research", "Customer Validated", "Pilot Validated", "Commercial Proof"]) expect(within(evidence).getAllByText(level).length).toBeGreaterThan(0);
    const value = screen.getByRole("region", { name: "Value proposition V1" });
    expect(within(value).queryByText(/Customer Validated/)).toBeNull();
    const restricted = within(evidence).getByRole("list", { name: "Restricted — Do Not Claim" });
    expect(restricted).toHaveTextContent("Guarantees AS9102 compliance.");
  });

  it("lets problem hypotheses move only with the user's own evidence", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const problems = screen.getByRole("region", { name: "Problem hypotheses" });
    const first = within(problems).getAllByLabelText("Evidence level")[0];
    await user.selectOptions(first, "customer");
    expect(within(problems).getByText(/Customer Validated needs at least one real customer conversation/)).toBeInTheDocument();
  });

  it("keeps the ROI calculator closed until asked for, with its disclaimer", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByText("Open the ROI calculator"));
    expect(await screen.findByText(/They are not guaranteed savings\./)).toBeInTheDocument();
    expect(screen.getByText("₹28,080 – ₹1.1 lakh")).toBeInTheDocument();
  });

  it("marks undocumented security answers for confirmation", () => {
    render(<Page />);
    expect(screen.getAllByText("Needs Product / Security Team Confirmation.").length).toBeGreaterThan(5);
  });
});
