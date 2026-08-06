import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PassengerTaxiPage from "./page";

describe("PassengerTaxiPage", () => {
  it("still renders its existing hero heading and major sections unchanged", () => {
    render(<PassengerTaxiPage />);
    expect(screen.getByRole("heading", { level: 1, name: /Passenger Air Taxi.*Component Architecture/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Major Air Taxi Components" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recommended Requirement Roadmap" })).toBeInTheDocument();
  });

  it("includes a prominent link to the new Battery & Energy Cybersecurity page", () => {
    render(<PassengerTaxiPage />);
    const link = screen.getByRole("link", { name: /Battery & Energy Cybersecurity/i });
    expect(link).toHaveAttribute("href", "/design-development/passenger-taxi/battery-cybersecurity");
  });
});
