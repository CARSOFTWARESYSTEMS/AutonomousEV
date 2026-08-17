import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/internships",
}));

import InternshipsPage, { metadata } from "./page";

describe("/internships canonical hub page", () => {
  it("has a canonical URL and is indexable", () => {
    expect(metadata.alternates?.canonical).toBe("https://autonomous.ev.engineer/internships");
    const robots = metadata.robots as { index: boolean; follow: boolean };
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it("visibly answers who can apply, prerequisites, stipend status, and how to apply", () => {
    render(<InternshipsPage />);
    expect(screen.getByText("Who can apply?")).toBeInTheDocument();
    expect(screen.getByText("What prerequisites are required?")).toBeInTheDocument();
    expect(screen.getByText("Is a stipend guaranteed?")).toBeInTheDocument();
    expect(screen.getByText(/No stipend is published or guaranteed/)).toBeInTheDocument();
    expect(screen.getByText("How do I apply?")).toBeInTheDocument();
  });

  it("links to the model rocketry guide and to Sudarshana Karkala's public profile", () => {
    render(<InternshipsPage />);
    expect(screen.getAllByRole("link", { name: /model rocketry/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Sudarshana Karkala's profile/i })).toHaveAttribute(
      "href",
      "/about/sudarshana-karkala"
    );
  });

  it("injects a valid JSON-LD CollectionPage/ItemList graph", () => {
    const { container } = render(<InternshipsPage />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "");
    const types = parsed["@graph"].map((n: Record<string, unknown>) => n["@type"]);
    expect(types).toContain("CollectionPage");
  });
});
