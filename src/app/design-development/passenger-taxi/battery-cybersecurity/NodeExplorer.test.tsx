import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NodeExplorer } from "./NodeExplorer";
import type { ExplorerNode } from "@/lib/battery-cybersecurity/types";

const nodes: ExplorerNode[] = [
  {
    id: "bms",
    label: "BMS",
    summary: "Battery Management System summary.",
    detailSections: [
      { heading: "Interfaces", body: ["Vehicle network bus", "Ground diagnostic port"] },
      { heading: "Notes", body: "Central trust broker." },
    ],
    badge: { kind: "trust", value: "trusted" },
  },
  {
    id: "ems",
    label: "EMS",
    summary: "Energy Management System summary.",
    detailSections: [{ heading: "Interfaces", body: ["OTA update channel"] }],
    badge: { kind: "evidence", value: "research-in-progress" },
  },
  {
    id: "pdu",
    label: "PDU",
    summary: "Power Distribution Unit summary.",
    detailSections: [{ heading: "Interfaces", body: ["Vehicle network bus"] }],
  },
];

describe("NodeExplorer", () => {
  it("shows the first node's detail by default", () => {
    render(<NodeExplorer nodes={nodes} ariaLabel="Test explorer" trackEventPrefix="test" />);
    expect(screen.getByRole("tab", { name: "BMS" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Battery Management System summary.")).toBeInTheDocument();
  });

  it("updates the detail panel when a different node is selected", async () => {
    const user = userEvent.setup();
    render(<NodeExplorer nodes={nodes} ariaLabel="Test explorer" trackEventPrefix="test" />);
    await user.click(screen.getByRole("tab", { name: "EMS" }));
    expect(screen.getByText("Energy Management System summary.")).toBeInTheDocument();
    expect(screen.queryByText("Battery Management System summary.")).not.toBeInTheDocument();
  });

  it("moves focus and selection with ArrowRight, wrapping at the end", async () => {
    const user = userEvent.setup();
    render(<NodeExplorer nodes={nodes} ariaLabel="Test explorer" trackEventPrefix="test" />);
    screen.getByRole("tab", { name: "PDU" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "BMS" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "BMS" })).toHaveAttribute("aria-selected", "true");
  });

  it("only the active tab is in the natural tab order", () => {
    render(<NodeExplorer nodes={nodes} ariaLabel="Test explorer" trackEventPrefix="test" />);
    expect(screen.getByRole("tab", { name: "BMS" })).toHaveAttribute("tabIndex", "0");
    expect(screen.getByRole("tab", { name: "EMS" })).toHaveAttribute("tabIndex", "-1");
  });

  it("renders a badge when provided and omits it when absent", () => {
    render(<NodeExplorer nodes={nodes} ariaLabel="Test explorer" trackEventPrefix="test" />);
    expect(screen.getByText("Trusted")).toBeInTheDocument();
  });

  it("renders list-type detail sections as a list", () => {
    render(<NodeExplorer nodes={nodes} ariaLabel="Test explorer" trackEventPrefix="test" />);
    expect(screen.getByText("Vehicle network bus")).toBeInTheDocument();
    expect(screen.getByText("Ground diagnostic port")).toBeInTheDocument();
  });
});
