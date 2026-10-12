import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SpaceHeader, { SPACE_HEADER_COMPACT_MAX } from "./SpaceHeader";
import { EOI_FORM_URL } from "@/lib/eoi";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

const css = fs.readFileSync(path.resolve(import.meta.dirname, "../space.module.css"), "utf-8");

/** Body of every @media block with the given condition (flat blocks only). */
function mediaBlocks(condition: string): string[] {
  const out: string[] = [];
  let i = css.indexOf(`@media (${condition})`);
  while (i !== -1) {
    const start = css.indexOf("{", i);
    let depth = 0;
    let j = start;
    for (; j < css.length; j++) {
      if (css[j] === "{") depth++;
      if (css[j] === "}" && --depth === 0) break;
    }
    out.push(css.slice(start + 1, j));
    i = css.indexOf(`@media (${condition})`, j);
  }
  return out;
}

describe("Shared Space header", () => {
  afterEach(() => vi.restoreAllMocks());

  it("switches to the compact header below a laptop-width breakpoint defined once and mirrored in CSS", () => {
    expect(SPACE_HEADER_COMPACT_MAX).toBeGreaterThanOrEqual(1279);
    const compact = mediaBlocks(`max-width: ${SPACE_HEADER_COMPACT_MAX}px`).join("\n");
    expect(compact).toMatch(/\.headerNavDesktop\s*\{\s*display:\s*none/);
    expect(compact).toMatch(/\.headerToggle\s*\{\s*display:\s*flex/);
    // The old tablet-only breakpoint no longer controls the desktop nav.
    expect(mediaBlocks("max-width: 1024px").join("\n")).not.toMatch(/headerNavDesktop/);
  });

  it("never lets desktop nav labels wrap onto two lines", () => {
    render(<SpaceHeader basePath="/space" />);
    const nav = screen.getByRole("navigation", { name: "Space section navigation" });
    within(nav)
      .getAllByRole("link")
      .forEach((a) => expect(a).toHaveStyle({ whiteSpace: "nowrap" }));
  });

  it("closes the menu when the viewport reaches the desktop breakpoint", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(window, "matchMedia");
    render(<SpaceHeader basePath="/space" />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(spy).toHaveBeenCalledWith(`(min-width: ${SPACE_HEADER_COMPACT_MAX + 1}px)`);
  });

  it("is branded ISHAVASYAM.ORG /space: the organisation leads to its own site, the section to the top of Space", () => {
    render(<SpaceHeader basePath="/space" />);
    const header = screen.getByRole("banner");
    expect(header).toHaveTextContent(/^ISHAVASYAM\.ORG\/space/);
    const brand = within(header).getAllByRole("link", { name: "ISHAVASYAM.ORG" });
    // Once: the brand is the link to the organisation, and no menu item repeats it.
    expect(brand).toHaveLength(1);
    expect(brand[0]).toHaveAttribute("href", "https://ishavasyam.org/");
    expect(brand[0]).toHaveAttribute("target", "_blank");
    expect(brand[0]).toHaveAttribute("rel", "noopener noreferrer");
    const section = within(header).getByRole("link", { name: /^\/space/ });
    expect(section).toHaveTextContent("/space");
    expect(section).toHaveAttribute("href", "/space#home");
  });

  it("offers iTelematics and EV.ENGINEER beside the navigation, and no longer UFlight", () => {
    render(<SpaceHeader />);
    const nav = screen.getByRole("navigation", { name: "Space section navigation" });
    expect(within(nav).getAllByRole("link").map((a) => a.textContent)).toEqual(["Home", "Mission Path", "Research", "Labs", "Research Themes", "Vision & References", "Community", "iTelematics", "EV.ENGINEER"]);
    expect(within(nav).getByRole("link", { name: "iTelematics" })).toHaveAttribute("href", "https://itelematics.com/");
    expect(within(nav).getByRole("link", { name: "EV.ENGINEER" })).toHaveAttribute("href", "https://ev.engineer/");
    for (const name of ["iTelematics", "EV.ENGINEER"]) expect(within(nav).getByRole("link", { name })).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("banner").textContent).not.toMatch(/UFlight/);
    // On the landing page itself the section link is an in-page jump.
    expect(within(screen.getByRole("banner")).getByRole("link", { name: /^\/space/ })).toHaveAttribute("href", "#home");
  });

  it("keeps every destination — including iTelematics, EV.ENGINEER and Express Interest — in the compact menu, and the organisation only as the brand", async () => {
    const user = userEvent.setup();
    render(<SpaceHeader basePath="/space" />);
    const desktopNav = screen.getByRole("navigation", { name: "Space section navigation" });
    const desktop = within(desktopNav)
      .getAllByRole("link")
      .map((a) => [a.textContent, a.getAttribute("href")]);

    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "space-mobile-menu");
    expect(toggle).toHaveStyle({ width: "44px", height: "44px" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    const menu = document.getElementById("space-mobile-menu") as HTMLElement;
    const menuLinks = within(menu)
      .getAllByRole("link")
      .map((a) => [a.textContent, a.getAttribute("href")]);
    desktop.forEach((entry) => expect(menuLinks).toContainEqual(entry));
    ["Home", "Mission Path", "Research", "Labs", "Research Themes", "Vision & References", "Community", "iTelematics", "EV.ENGINEER"].forEach(
      (label) => expect(menuLinks.map(([l]) => l)).toContain(label),
    );
    expect(menuLinks.map(([l]) => l)).not.toContain("ISHAVASYAM.ORG");
    expect(within(screen.getByRole("banner")).getByRole("link", { name: "ISHAVASYAM.ORG" })).toHaveAttribute("href", "https://ishavasyam.org/");
    expect(within(menu).getByRole("link", { name: /Express Interest/ })).toHaveAttribute("href", EOI_FORM_URL);
  });

  it("closes on Escape and returns focus to the menu button", async () => {
    const user = userEvent.setup();
    render(<SpaceHeader basePath="/space" />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    await user.click(toggle);
    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("space-mobile-menu")).toBeNull();
    expect(toggle).toHaveFocus();
  });
});
