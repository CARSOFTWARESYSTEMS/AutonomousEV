import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TrustSourceNav from "./TrustSourceNav";

const filters = [
  { id: "all", label: "All" },
  { id: "linkedin", label: "Professional Recognition" },
  { id: "youtube", label: "Videos" },
];

describe("TrustSourceNav", () => {
  it("renders a tab per filter with the active one marked selected", () => {
    render(<TrustSourceNav filters={filters} activeId="linkedin" onSelect={() => {}} />);
    const activeTab = screen.getByRole("tab", { name: "Professional Recognition" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onSelect when a tab is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TrustSourceNav filters={filters} activeId="all" onSelect={onSelect} />);
    await user.click(screen.getByRole("tab", { name: "Videos" }));
    expect(onSelect).toHaveBeenCalledWith("youtube");
  });

  it("moves focus and selects the next tab on ArrowRight", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TrustSourceNav filters={filters} activeId="all" onSelect={onSelect} />);
    screen.getByRole("tab", { name: "All" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(onSelect).toHaveBeenCalledWith("linkedin");
    expect(screen.getByRole("tab", { name: "Professional Recognition" })).toHaveFocus();
  });

  it("only the active tab is in the natural tab order", () => {
    render(<TrustSourceNav filters={filters} activeId="all" onSelect={() => {}} />);
    expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute("tabIndex", "0");
    expect(screen.getByRole("tab", { name: "Videos" })).toHaveAttribute("tabIndex", "-1");
  });
});
