import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import IshavasyamSpacePage from "./page";

vi.mock("next/navigation", () => ({ usePathname: () => "/space" }));
vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

describe("aerospace.ishavasyam.org/space", () => {
  it("shows the APEX partner card and the Partners & Engineering Ecosystem section, exactly as aerospace.gamyaa.in does", () => {
    const { container } = render(<IshavasyamSpacePage />);
    const partners = container.querySelector("#partners") as HTMLElement;
    expect(partners).not.toBeNull();
    expect(partners.textContent).toMatch(/Partners & Engineering Ecosystem/);
    expect(partners.textContent).toMatch(/Gamyaa AeroSystems/);
    const simulations = container.querySelector("#simulations") as HTMLElement;
    const card = Array.from(simulations.querySelectorAll("h3")).find((h) => h.textContent === "APEX Rocket Systems");
    expect(card).toBeDefined();
    expect(container.querySelector('a[href="/space/partners/apexrocketsystems"]')).not.toBeNull();
  });
});
