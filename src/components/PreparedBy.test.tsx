import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import PreparedBy from "./PreparedBy";

describe("PreparedBy", () => {
  it("shows the shared profile card, the attribution lines and the review date", () => {
    render(<PreparedBy notes={["First line.", "Second line."]} reviewed="2026-10-01" reviewedLabel="1 October 2026" />);
    const section = screen.getByRole("region", { name: "Prepared by" });
    const card = within(section).getByRole("complementary", { name: "About the researcher" });
    expect(within(card).getByText("Prepared by")).toBeInTheDocument();
    expect(within(card).getByRole("heading", { level: 3, name: "Sudarshana Karkala" })).toBeInTheDocument();
    expect(within(card).getByText("EV.ENGINEER™")).toBeInTheDocument();
    expect(within(card).getByRole("img", { name: "Portrait of Sudarshana Karkala" })).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: /View full profile/ })).toHaveAttribute("href", "/about/sudarshana-karkala");
    expect(within(section).getByText("First line.")).toBeInTheDocument();
    expect(within(section).getByText("Second line.")).toBeInTheDocument();
    expect(within(section).getByText(/last reviewed/)).toHaveTextContent("Experience information last reviewed: 1 October 2026.");
    expect(section.querySelector("time")).toHaveAttribute("datetime", "2026-10-01");
  });

  it("names what was reviewed when told", () => {
    render(<PreparedBy notes={[]} reviewed="2026-09-29" reviewedLabel="29 September 2026" reviewedSubject="Program information" />);
    expect(screen.getByText(/last reviewed/)).toHaveTextContent("Program information last reviewed: 29 September 2026.");
  });
});
