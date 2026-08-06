import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectionNav } from "./SectionNav";

const items = [
  { id: "trust-chain", label: "Trust Chain" },
  { id: "trust-questions", label: "Trust Questions" },
  { id: "faq", label: "FAQ" },
];

function renderWithSections() {
  return render(
    <>
      <SectionNav items={items} />
      <div id="trust-chain" />
      <div id="trust-questions" />
      <div id="faq" />
    </>
  );
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe("SectionNav", () => {
  it("renders a tab per section, with the first marked active by default", () => {
    renderWithSections();
    expect(screen.getByRole("tab", { name: "Trust Chain" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "FAQ" })).toHaveAttribute("aria-selected", "false");
  });

  it("scrolls to the target section when a tab is clicked", async () => {
    const user = userEvent.setup();
    renderWithSections();
    await user.click(screen.getByRole("tab", { name: "FAQ" }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("moves focus to the next tab on ArrowRight", async () => {
    const user = userEvent.setup();
    renderWithSections();
    screen.getByRole("tab", { name: "Trust Chain" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Trust Questions" })).toHaveFocus();
  });

  it("moves focus to the last tab on End", async () => {
    const user = userEvent.setup();
    renderWithSections();
    screen.getByRole("tab", { name: "Trust Chain" }).focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "FAQ" })).toHaveFocus();
  });

  it("only the active tab is in the natural tab order", () => {
    renderWithSections();
    expect(screen.getByRole("tab", { name: "Trust Chain" })).toHaveAttribute("tabIndex", "0");
    expect(screen.getByRole("tab", { name: "FAQ" })).toHaveAttribute("tabIndex", "-1");
  });
});
