import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, prefetch: () => {} }),
  usePathname: () => "/",
}));

import Home from "./page";

describe("home page (/) JSON-LD", () => {
  it("injects a valid JSON-LD graph anchoring WebSite, Brand and WebPage nodes", () => {
    const { container } = render(<Home />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "");
    expect(parsed["@context"]).toBe("https://schema.org");
    const types = parsed["@graph"].map((n: Record<string, unknown>) => n["@type"]);
    expect(types).toContain("WebSite");
    expect(types).toContain("Brand");
    expect(types).toContain("WebPage");
    expect(script?.textContent).not.toMatch(/</);
  });
});
