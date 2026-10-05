import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { BHAVYA_KSHATRI } from "@/data/public-entities";
import DesignInspirationCredit from "./DesignInspirationCredit";

const NAME = "Bhavya Naga Sai Parvathi Kshatri";
const THANKS = "Special thanks to Bhavya for inspiring our early approach to interactive engineering visualisation and Digital Twin experiences across Satellite Engineering, Model Rocketry and Aerospace.";
const section = () => screen.getByRole("region", { name: "Inspiration & Acknowledgement" });

describe("DesignInspirationCredit", () => {
  it("is the heading, the person's name and one paragraph of thanks, with no second heading", () => {
    render(<DesignInspirationCredit />);
    expect(within(section()).getByRole("heading", { level: 3, name: "Inspiration & Acknowledgement" })).toBeInTheDocument();
    expect(Array.from(section().querySelectorAll("p"), (p) => p.textContent)).toEqual([NAME, THANKS]);
    expect(section().textContent).not.toMatch(/Original Design/i);
    // What the thanks are for is the one emphasised phrase.
    expect(Array.from(section().querySelectorAll("strong"), (s) => s.textContent)).toEqual(["interactive engineering visualisation and Digital Twin experiences"]);
  });

  it("shows the full name once: the link labels stay short", () => {
    render(<DesignInspirationCredit />);
    expect(section().textContent!.split(NAME)).toHaveLength(2);
    expect(within(section()).getAllByRole("link").map((a) => a.textContent)).toEqual(["View Original Work", "LinkedIn"]);
  });

  it("links to her original work and her LinkedIn profile in a new tab, and says so in each link's name", () => {
    render(<DesignInspirationCredit />);
    const links = within(section()).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["https://bhavyacyber.github.io/", "https://www.linkedin.com/in/bhavya-naga-sai-parvathi-kshatri"]);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(links[0]).toHaveAccessibleName(`View Original Work by ${NAME} (opens in a new tab)`);
    expect(links[1]).toHaveAccessibleName(`LinkedIn profile of ${NAME} (opens in a new tab)`);
    // The arrows are decoration: the accessible name carries whose work it is.
    for (const icon of section().querySelectorAll("svg")) expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("uses the name and the profile link the entity registry records for her", () => {
    render(<DesignInspirationCredit />);
    expect(BHAVYA_KSHATRI.name).toBe(NAME);
    expect(BHAVYA_KSHATRI.sameAs).toContain(within(section()).getByRole("link", { name: /^LinkedIn/ }).getAttribute("href"));
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
