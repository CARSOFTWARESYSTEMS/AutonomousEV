import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { BHAVYA_KSHATRI } from "@/data/public-entities";
import DesignInspirationCredit from "./DesignInspirationCredit";

const NAME = "Bhavya Naga Sai Parvathi Kshatri";
const CONTEXT = "Her early interactive design work helped inspire our approach to this page.";
const section = () => screen.getByRole("region", { name: "Inspiration & Acknowledgement" });

describe("DesignInspirationCredit", () => {
  it("names the section, the credit and the person, then the shared thanks and the page's own line", () => {
    render(<DesignInspirationCredit context={CONTEXT} />);
    expect(within(section()).getByRole("heading", { level: 3, name: "Inspiration & Acknowledgement" })).toBeInTheDocument();
    expect(within(section()).getByText("Original Design / Inspiration")).toBeInTheDocument();
    expect(within(section()).getByText(NAME)).toBeInTheDocument();
    expect(within(section()).getByText(/^Special thanks to/)).toHaveTextContent(
      "Special thanks to Bhavya Naga Sai Parvathi Kshatri for inspiring our early approach to interactive engineering visualisation and Digital Twin experiences. Her original design exploration helped influence the evolution of our Satellite Engineering, Model Rocketry, Aerospace and 3D Digital Twin learning experiences.",
    );
    expect(within(section()).getByText(CONTEXT)).toBeInTheDocument();
    expect(Array.from(section().querySelectorAll("p"), (p) => p.textContent).at(-1)).toBe(CONTEXT);
  });

  it("links to her original work and her LinkedIn profile in a new tab, and says so in each link's name", () => {
    render(<DesignInspirationCredit context={CONTEXT} />);
    const links = within(section()).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["https://bhavyacyber.github.io/", "https://www.linkedin.com/in/bhavya-naga-sai-parvathi-kshatri"]);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(links[0]).toHaveAccessibleName(`View Original Work by ${NAME} (opens in a new tab)`);
    expect(links[1]).toHaveAccessibleName(`LinkedIn profile of ${NAME} (opens in a new tab)`);
    // The arrows are decoration: the text carries the name.
    for (const icon of section().querySelectorAll("svg")) expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("uses the name and the profile link the entity registry records for her", () => {
    render(<DesignInspirationCredit context={CONTEXT} />);
    expect(BHAVYA_KSHATRI.name).toBe(NAME);
    expect(BHAVYA_KSHATRI.sameAs).toContain(within(section()).getByRole("link", { name: /^LinkedIn/ }).getAttribute("href"));
  });

  it("credits inspiration and early design exploration, never authorship of the current experiences", () => {
    render(<DesignInspirationCredit context={CONTEXT} />);
    expect(section().textContent).not.toMatch(/\b(designed|developed|created|built|engineered|implemented) by\b/i);
    expect(section().textContent).toMatch(/inspiring our early approach/);
    expect(section().textContent).toMatch(/original design exploration helped influence/);
  });

  it("gives each instance its own heading id", () => {
    render(
      <>
        <DesignInspirationCredit context={CONTEXT} />
        <DesignInspirationCredit context="Another page's line." />
      </>,
    );
    const ids = screen.getAllByRole("heading", { level: 3 }).map((h) => h.id);
    expect(new Set(ids).size).toBe(2);
    expect(screen.getAllByRole("region", { name: "Inspiration & Acknowledgement" })).toHaveLength(2);
  });
});
