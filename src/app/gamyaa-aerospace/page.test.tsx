import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import nextConfig from "../../../next.config";
import GamyaaAerospacePage, { metadata } from "./page";
import AerospacePage from "../aerospace/page";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-uflight-manrope" }),
  Inter: () => ({ variable: "--font-uflight-inter" }),
}));

const hostRule = (rules: { source: string; has?: { type: string; value?: string }[]; destination: string }[], source: string) =>
  rules.find((r) => r.source === source && r.has?.some((h) => h.type === "host" && new RegExp(`^${h.value}$`).test("aerospace.gamyaa.in")));

describe("aerospace.gamyaa.in routing", () => {
  it("redirects the host's root to /aerospace, permanently", async () => {
    const redirects = await nextConfig.redirects!();
    const rule = hostRule(redirects, "/");
    expect(rule).toMatchObject({ destination: "/aerospace", permanent: true });
    // The host pattern matches that host only.
    const value = rule!.has![0].value!;
    expect(new RegExp(`^${value}$`).test("aerospacexgamyaa.in")).toBe(false);
    expect(new RegExp(`^${value}$`).test("aerospace.ev.engineer")).toBe(false);
  });

  it("serves the Gamyaa.in variant at that host's /aerospace without changing the URL", async () => {
    const rewrites = (await nextConfig.rewrites!()) as { beforeFiles: { source: string; has?: { type: string; value?: string }[]; destination: string }[] };
    expect(hostRule(rewrites.beforeFiles, "/aerospace")).toMatchObject({ destination: "/gamyaa-aerospace" });
  });
});

describe("Aerospace top menu by host", () => {
  it("shows Gamyaa.in instead of EV.ENGINEER on aerospace.gamyaa.in, on desktop and in the mobile menu", async () => {
    const user = userEvent.setup();
    render(<GamyaaAerospacePage />);
    const nav = screen.getByRole("navigation", { name: "Aerospace section navigation" });
    expect(within(nav).getByRole("link", { name: "Gamyaa.in" })).toHaveAttribute("href", "/aerospace");
    expect(within(nav).queryByRole("link", { name: "EV.ENGINEER" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = document.getElementById("aerospace-mobile-menu")!;
    expect(within(menu).getByRole("link", { name: "Gamyaa.in" })).toHaveAttribute("href", "/aerospace");
    expect(within(menu).queryByRole("link", { name: "EV.ENGINEER" })).toBeNull();
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("keeps EV.ENGINEER on every other host", () => {
    render(<AerospacePage />);
    const nav = screen.getByRole("navigation", { name: "Aerospace section navigation" });
    expect(within(nav).getByRole("link", { name: "EV.ENGINEER" })).toHaveAttribute("href", "/");
    expect(within(nav).queryByRole("link", { name: "Gamyaa.in" })).toBeNull();
  });
});
