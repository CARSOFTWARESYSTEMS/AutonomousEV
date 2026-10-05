import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import DesignInspirationCredit from "./DesignInspirationCredit";

const THANKS = "Special thanks to Bhavya for inspiring our early approach to interactive engineering visualisation and Digital Twin experiences across Satellite Engineering, Model Rocketry and Aerospace.";
const section = () => screen.getByRole("region", { name: "Inspiration & Acknowledgement" });

describe("DesignInspirationCredit", () => {
  it("is the heading and one paragraph of thanks, with no separate name line or second heading", () => {
    render(<DesignInspirationCredit />);
    expect(within(section()).getByRole("heading", { level: 3, name: "Inspiration & Acknowledgement" })).toBeInTheDocument();
    expect(Array.from(section().querySelectorAll("p"), (p) => p.textContent)).toEqual([THANKS]);
    expect(section().textContent).not.toMatch(/Original Design|Naga Sai Parvathi Kshatri/i);
  });

  it("emphasises the name and what the thanks are for, inside the sentence", () => {
    render(<DesignInspirationCredit />);
    expect(Array.from(section().querySelectorAll("p strong"), (s) => s.textContent)).toEqual(["Bhavya", "interactive engineering visualisation and Digital Twin experiences"]);
  });

  it("has one link, to the original work, in a new tab, and says so in the link's name", () => {
    render(<DesignInspirationCredit />);
    const link = within(section()).getByRole("link");
    expect(link).toHaveAttribute("href", "https://bhavyacyber.github.io/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.textContent).toBe("View Original Work");
    expect(link).toHaveAccessibleName("View Original Work by Bhavya (opens in a new tab)");
    // The arrow is decoration: the accessible name carries the rest.
    for (const icon of section().querySelectorAll("svg")) expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("does not link to a LinkedIn profile", () => {
    const { container } = render(<DesignInspirationCredit />);
    expect(container.innerHTML).not.toMatch(/linkedin/i);
  });

  it("credits inspiration, never authorship of the current experiences", () => {
    render(<DesignInspirationCredit />);
    expect(section().textContent).not.toMatch(/\b(designed|developed|created|built|engineered|implemented) by\b/i);
    expect(section().textContent).toMatch(/inspiring our early approach/);
  });

  it("gives each instance its own heading id", () => {
    render(
      <>
        <DesignInspirationCredit />
        <DesignInspirationCredit />
      </>,
    );
    const ids = screen.getAllByRole("heading", { level: 3 }).map((h) => h.id);
    expect(new Set(ids).size).toBe(2);
    expect(screen.getAllByRole("region", { name: "Inspiration & Acknowledgement" })).toHaveLength(2);
  });
});
