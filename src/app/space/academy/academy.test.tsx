import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { existsSync } from "node:fs";
import { join } from "node:path";
import AcademyPage, { metadata } from "./page";
import TrackPage, { generateStaticParams } from "./[track]/page";
import { LEVELS, TRACKS } from "./data/curriculum";
import { MISSIONS } from "./data/missions";
import { FORMATS, DISCLAIMERS } from "./data/programme";
import { academyGraph } from "./seo";

vi.mock("next/navigation", () => ({ usePathname: () => "/space/academy", notFound: () => { throw new Error("notFound"); } }));
vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

const APP = join(__dirname, "..", "..");
/** A site path has a page file (route groups and dynamic segments aside, every target here is a plain folder). */
const pageExists = (href: string) => {
  const path = href.split("#")[0];
  return existsSync(join(APP, path, "page.tsx"));
};

describe("Space Academy curriculum", () => {
  it("has the seven tracks the brief names, in order", () => {
    expect(TRACKS.map((t) => t.title)).toEqual(["Space Technology", "Spacecraft Systems", "Satellite Engineering", "Model Rocketry", "CanSat", "Sensors & Telemetry", "Faults & Safe Mode"]);
  });

  it("documents every required field for every track and both age levels", () => {
    for (const t of TRACKS) {
      for (const level of Object.keys(LEVELS) as (keyof typeof LEVELS)[]) {
        const p = t.levels[level];
        const where = `${t.slug}/${level}`;
        expect(p.prerequisites.length, where).toBeGreaterThan(0);
        expect(p.objectives.length, where).toBeGreaterThan(1);
        expect(p.modules.length, where).toBeGreaterThan(1);
        p.modules.forEach((m) => expect(m.topics.length, `${where} ${m.title}`).toBeGreaterThan(0));
        expect(p.models3d.length, where).toBeGreaterThan(0);
        expect(p.physics.length, where).toBeGreaterThan(0);
        p.physics.forEach((e) => expect(e.units.length, `${where} ${e.name} units`).toBeGreaterThan(0));
        expect(p.activities.length, where).toBeGreaterThan(0);
        expect(p.challenge.pass.length, where).toBeGreaterThan(0);
        expect(p.outcomes.length, where).toBeGreaterThan(0);
      }
      expect(t.tutorials.length, t.slug).toBeGreaterThan(0);
    }
  });

  it("references only tutorials and missions that exist on this site", () => {
    for (const t of TRACKS) {
      t.tutorials.forEach((ref) => expect(pageExists(ref.href), ref.href).toBe(true));
      t.missions.forEach((slug) => expect(MISSIONS.some((m) => m.slug === slug), slug).toBe(true));
    }
    MISSIONS.forEach((m) => expect(pageExists(`/space/academy/missions/${m.slug}`), m.slug).toBe(true));
  });

  it("labels classes and workshops Planned, and only the self-paced missions Available", () => {
    expect(FORMATS.filter((f) => f.status === "Available").map((f) => f.title)).toEqual(["Self-paced 3D missions"]);
    expect(FORMATS.filter((f) => /workshop|classes/i.test(f.title)).every((f) => f.status === "Planned")).toBe(true);
  });

  it("never claims agency affiliation or competition eligibility", () => {
    const text = JSON.stringify({ TRACKS, MISSIONS, FORMATS, DISCLAIMERS });
    // Every mention of IN-SPACe is a disclaimer.
    for (const m of text.matchAll(/[^.]*IN-SPACe[^.]*/g)) expect(m[0], m[0]).toMatch(/not (affiliated|an official)/);
    // Positive endorsement claims only; the disclaimer itself says "not affiliated with, endorsed by".
    expect(text).not.toMatch(/(?<!not affiliated with, )\b(approved|endorsed|certified) by\b/i);
    expect(text).not.toMatch(/eligible for (the|any)? ?[A-Z]/);
    expect(DISCLAIMERS.eligibility).toMatch(/does not register anyone for, or make anyone eligible for/);
    expect(text).not.toMatch(/EV Society/);
  });
});

describe("/space/academy", () => {
  it("has its own canonical, title and an indexable, ISHAVASYAM.ORG-published page", () => {
    expect(metadata.alternates?.canonical).toBe("https://aerospace.ev.engineer/space/academy");
    expect(String(metadata.title)).toMatch(/Space Academy/);
    expect(metadata.publisher).toBe("ISHAVASYAM.ORG");
  });

  it("describes courses without dates or prices, since classes are planned", () => {
    const graph = JSON.stringify(academyGraph());
    expect(graph).toMatch(/"@type":"Course"/);
    expect(graph).not.toMatch(/hasCourseInstance|offers|startDate|price/);
  });

  it("renders one heading, every track and mission, and the notices", () => {
    render(<AcademyPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    for (const t of TRACKS) expect(screen.getByRole("link", { name: `Open the ${t.title} track` })).toHaveAttribute("href", `/space/academy/${t.slug}`);
    for (const m of MISSIONS) expect(screen.getByRole("link", { name: `Play ${m.title}` })).toHaveAttribute("href", `/space/academy/missions/${m.slug}`);
    expect(screen.getByText(/not affiliated with, endorsed by, or run on behalf of ISRO, IN-SPACe/)).toBeInTheDocument();
    expect(screen.getByText(/does not register anyone for, or make anyone eligible for/)).toBeInTheDocument();
  });

  it("switches the age level for the whole page", async () => {
    const user = userEvent.setup();
    render(<AcademyPage />);
    const advanced = screen.getAllByRole("button", { name: /Ages 17–18/ })[0];
    expect(advanced).toHaveAttribute("aria-pressed", "false");
    await user.click(advanced);
    expect(advanced).toHaveAttribute("aria-pressed", "true");
    window.localStorage.clear();
  });

  it("asks a student for a parent or guardian's agreement before showing the form", async () => {
    const user = userEvent.setup();
    render(<AcademyPage />);
    const enquire = document.getElementById("enquire") as HTMLElement;
    await user.click(within(enquire).getByRole("button", { name: "I am a student" }));
    expect(within(enquire).queryByRole("link", { name: /Express Interest/ })).toBeNull();
    await user.click(within(enquire).getByRole("checkbox", { name: /parent or guardian knows about this enquiry/ }));
    const form = within(enquire).getByRole("link", { name: /Express Interest/ });
    expect(form).toHaveAttribute("href", "https://forms.gle/GZbPDHd7qozGSZuJA");
    expect(form).toHaveAttribute("rel", "noopener noreferrer");
    // Parents and schools go straight to the form and the contact page.
    await user.click(within(enquire).getByRole("button", { name: "I am a parent or guardian" }));
    expect(within(enquire).getByRole("link", { name: /Express Interest/ })).toHaveAttribute("href", "https://forms.gle/GZbPDHd7qozGSZuJA");
    expect(within(enquire).getByRole("link", { name: "Contact page" })).toHaveAttribute("href", "/contact");
  });
});

describe("/space/academy/[track]", () => {
  it("generates a page for each of the seven tracks", () => {
    expect(generateStaticParams().map((p) => p.track)).toEqual(TRACKS.map((t) => t.slug));
  });

  it.each(TRACKS.map((t) => [t.slug, t] as const))("%s: shows both levels' curriculum, with the inactive level hidden but in the HTML", async (slug, t) => {
    render(await TrackPage({ params: Promise.resolve({ track: slug }) }));
    expect(screen.getByRole("heading", { level: 1, name: t.title })).toBeInTheDocument();
    for (const id of ["topics", "prerequisites", "objectives", "physics", "models", "activities", "challenge", "outcomes"]) {
      expect(document.getElementById(id), id).not.toBeNull();
      expect(document.getElementById(`${id}-advanced`), `${id}-advanced`).not.toBeNull();
    }
    expect(document.querySelector('[data-level="advanced"]')).toHaveAttribute("hidden");
    expect(document.getElementById("challenge-advanced")?.textContent).toContain(t.levels.advanced.challenge.title);
    const tutorials = document.getElementById("tutorials") as HTMLElement;
    t.tutorials.forEach((ref) => {
      const link = tutorials.querySelector(`a[href="${ref.href}"]`);
      expect(link, ref.href).not.toBeNull();
      expect(link?.textContent).toContain(ref.label);
    });
  });
});
