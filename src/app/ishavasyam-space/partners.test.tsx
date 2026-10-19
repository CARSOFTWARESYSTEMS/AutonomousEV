import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import IshavasyamSpacePage from "./page";

vi.mock("next/navigation", () => ({ usePathname: () => "/space" }));
vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

describe("aerospace.ishavasyam.org/space", () => {
  it("leaves out the APEX partner card and the Partners & Engineering Ecosystem section shown on aerospace.gamyaa.in", () => {
    const { container } = render(<IshavasyamSpacePage />);
    expect(container.querySelector("#partners")).toBeNull();
    expect(container.textContent).not.toMatch(/APEX Rocket Systems/);
    expect(container.querySelector('a[href*="apexrocketsystems"]')).toBeNull();
  });
});
