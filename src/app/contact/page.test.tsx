import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactPage, { metadata } from "./page";

describe("/contact page", () => {
  it("has a canonical URL and is indexable", () => {
    expect(metadata.alternates?.canonical).toBe("https://autonomous.ev.engineer/contact");
    const robots = metadata.robots as { index: boolean; follow: boolean };
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it("visibly shows the published email and phone that also appear in the JSON-LD ContactPoint", () => {
    render(<ContactPage />);
    expect(screen.getByText("info@iTelematics.com")).toBeInTheDocument();
    expect(screen.getAllByText("+91 91082 06147").length).toBeGreaterThan(0);
  });

  it("injects a JSON-LD ContactPage/ContactPoint graph whose values match the visible page", () => {
    const { container } = render(<ContactPage />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "");
    const contactPage = parsed["@graph"].find((n: Record<string, unknown>) => n["@type"] === "ContactPage");
    expect(contactPage).toBeDefined();
    const contactPoint = contactPage.mainEntity;
    expect(contactPoint.email).toBe("info@iTelematics.com");
    expect(contactPoint.telephone).toBe("+91 91082 06147");
  });
});
