import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { CONSULTING, STELLR_SPACE_ENGAGEMENT, consultingEngagementsFor } from "./profile";

// The profile rendered for aerospace.stellrspace.com: that host's copy sets the render's host (src/lib/host-brand-render).
vi.mock("next/font/google", () => ({ Manrope: () => ({ variable: "font-manrope" }), Inter: () => ({ variable: "font-inter" }) }));
vi.mock("@/lib/host-brand-render", () => ({ renderHost: () => "stellr", renderHostBrand: () => null, hostText: (text: string) => text }));

describe("/about/sudarshana-karkala on aerospace.stellrspace.com", () => {
  it("lists STELLR Space after iFab Innovations there, and nowhere else", () => {
    const names = (host: string | null) => consultingEngagementsFor(host).map((engagement) => engagement.organisation.name);
    expect(names(null)).toEqual(CONSULTING.engagements.map((engagement) => engagement.organisation.name));
    expect(names(null)).not.toContain("STELLR Space");
    const stellr = names("stellr");
    expect(stellr.indexOf("STELLR Space")).toBe(stellr.indexOf("iFab Innovations") + 1);
    expect(stellr).toHaveLength(CONSULTING.engagements.length + 1);
  });

  it("shows the row as the owner wrote it: STELLR Space, a consulting engagement in Space Engineering, its name the link to stellrspace.com", async () => {
    const { default: ProfilePage } = await import("./page");
    render(<ProfilePage />);
    const consulting = screen.getByRole("region", { name: "Consulting Engagements" });
    const row = within(consulting).getAllByRole("listitem").find((li) => li.textContent?.startsWith("STELLR Space"))!;
    expect(row.textContent?.replace(/\s+/g, " ").trim()).toBe("STELLR Space Consulting Engagement Space Engineering");
    const link = within(row).getByRole("link", { name: "STELLR Space (opens in a new tab)" });
    expect(link).toHaveAttribute("href", "https://stellrspace.com/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("data-profile-initiative_name", "stellr_space");
    expect(STELLR_SPACE_ENGAGEMENT.areas).toEqual(["Space Engineering"]);
  });
});
