import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FounderPage, { metadata } from "./page";

describe("/about/sudarshana-karkala canonical profile page", () => {
  it("renders Sudarshana Karkala's full public name in the initial HTML", () => {
    render(<FounderPage />);
    expect(screen.getAllByText("Sudarshana Karkala").length).toBeGreaterThan(0);
  });

  it("has a canonical URL and is indexable", () => {
    expect(metadata.alternates?.canonical).toBe("https://autonomous.ev.engineer/about/sudarshana-karkala");
    const robots = metadata.robots as { index: boolean; follow: boolean };
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it("shows the verified phone number and LinkedIn link visibly, with no email address anywhere on the page", () => {
    render(<FounderPage />);
    expect(screen.getAllByText(/\+91 9845561518/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /LinkedIn/i }).length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  });

  it("links to Internships, Space, the rocketry guide, Trust Center and Contact", () => {
    render(<FounderPage />);
    expect(screen.getByRole("link", { name: /EV\.ENGINEER Internships/i })).toHaveAttribute("href", "/internships");
    expect(screen.getByRole("link", { name: /Space Initiative/i })).toHaveAttribute("href", "/space");
    expect(screen.getByRole("link", { name: /Model Rocketry Learning Guide/i })).toHaveAttribute(
      "href",
      "/space/2026-INSPACe-ROCKETRY-059"
    );
    expect(screen.getAllByRole("link", { name: /Trust Center/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /contact/i }).length).toBeGreaterThan(0);
  });

  it("injects a valid JSON-LD ProfilePage/Person graph without dangerouslySetInnerHTML", () => {
    const { container } = render(<FounderPage />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "");
    expect(parsed["@context"]).toBe("https://schema.org");
    const types = parsed["@graph"].map((n: Record<string, unknown>) => n["@type"]);
    expect(types).toContain("Person");
    expect(types).toContain("ProfilePage");
  });
});
