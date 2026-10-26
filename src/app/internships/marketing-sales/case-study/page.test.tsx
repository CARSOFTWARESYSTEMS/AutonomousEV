import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships/marketing-sales/case-study" }));
vi.mock("@/utils/analytics", () => ({ trackEvent: vi.fn() }));

import { useRevenue } from "@/components/revenue/state/store";
import Page, { metadata } from "./page";

const ROUTE = "/internships/marketing-sales/case-study";
const reference = (id: string) => document.getElementById(id) as HTMLDetailsElement;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  window.localStorage.clear();
  useRevenue.getState().resetAll();
  window.history.replaceState(null, "", ROUTE);
});

describe("Case Study page", () => {
  it("is indexable and opens on the product, the customer and a problem still to be validated", () => {
    expect(metadata.alternates?.canonical).toBe(`https://autonomous.ev.engineer${ROUTE}`);
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1, name: "Balloon Drawings & AS9102 FAI Reporting" })).toBeInTheDocument();
    const hero = screen.getByRole("region", { name: "Balloon Drawings & AS9102 FAI Reporting" });
    expect(within(hero).getAllByRole("term").map((term) => term.textContent)).toEqual(["Product", "Customer", "Customer problem"]);
    expect(within(hero).getAllByRole("definition").map((d) => d.textContent)).toEqual(["FAI Engineer", "Bengaluru Aerospace & Defence MSMEs", "To be validated with customers."]);
    expect(within(hero).getByRole("link", { name: /Explore FAI Product/ })).toHaveAttribute("href", "https://fai.ev.engineer/");
    expect(within(hero).getByRole("link", { name: "AQIP Context →" })).toHaveAttribute("href", "/internships/aerospace-quality-intelligence-platform");
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Current Hypotheses", "What FAI Engineer Does Today", "Reference"]);
  });

  it("tags every hypothesis as needing customer validation", () => {
    render(<Page />);
    const items = within(screen.getByRole("region", { name: "Current Hypotheses" })).getAllByRole("listitem");
    expect(items.map((item) => item.firstChild!.textContent)).toEqual(["Manual ballooning effort", "Characteristic reconciliation", "Report preparation effort", "Revision rework", "Review burden"]);
    for (const item of items) expect(item).toHaveTextContent("Hypothesis — Customer Validation Required");
  });

  it("keeps later steps' material closed, each labelled with the step that needs it", () => {
    render(<Page />);
    const references = [...document.querySelectorAll<HTMLDetailsElement>("#revenue-root details[id], main details[id]")];
    expect(references.map((node) => [node.id, node.querySelector("summary")!.lastChild!.textContent])).toEqual([
      ["market", "Step 01"],
      ["problems", "Step 02"],
      ["icp", "Step 01"],
      ["evidence", "Step 04"],
      ["value", "Step 03"],
      ["alternatives", "Step 03"],
      ["demo", "Step 07"],
      ["roi", "Step 07"],
      ["objections", "Step 09"],
      ["pilot", "Step 08"],
      ["feedback", "Step 06"],
      ["security", "Step 09"],
      ["roadmap", "Step 07"],
    ]);
    for (const node of references) expect(node.open, node.id).toBe(false);
  });

  it("opens the reference an address points to", () => {
    window.history.replaceState(null, "", `${ROUTE}#roi`);
    render(<Page />);
    expect(reference("roi").open).toBe(true);
    expect(reference("market").open).toBe(false);
  });

  it("separates the five evidence levels and never shows a hypothesis as validated", () => {
    render(<Page />);
    const evidence = reference("evidence");
    for (const level of ["Assumption", "Research", "Customer Validated", "Pilot Validated", "Commercial Proof"]) expect(within(evidence).getAllByText(level).length).toBeGreaterThan(0);
    expect(within(reference("value")).queryByText(/Customer Validated/)).toBeNull();
    expect(within(evidence).getByRole("list", { name: "Restricted — Do Not Claim" })).toHaveTextContent("Guarantees AS9102 compliance.");
  });

  it("lets pain hypotheses move only with the user's own evidence", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(within(reference("problems")).getByText("Pain hypotheses: track your evidence"));
    await user.selectOptions(within(reference("problems")).getAllByLabelText("Evidence level")[0], "customer");
    expect(within(reference("problems")).getByText(/Customer Validated needs at least one real customer conversation/)).toBeInTheDocument();
  });

  it("shows the ROI calculator with its disclaimer when its reference is opened", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(within(reference("roi")).getByText("ROI calculator"));
    expect(await screen.findByText(/They are not guaranteed savings\./)).toBeInTheDocument();
    expect(screen.getByText("₹28,080 – ₹1.1 lakh")).toBeInTheDocument();
  });

  it("marks undocumented security answers for confirmation", () => {
    render(<Page />);
    expect(within(reference("security")).getAllByText("Needs Product / Security Team Confirmation.").length).toBeGreaterThan(5);
  });
});
