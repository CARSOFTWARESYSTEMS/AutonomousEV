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

  it("renders one heading, the first mission, the four ways in, every track and mission, and the notices", () => {
    const { container } = render(<AcademyPage />);
    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0].textContent).toBe("Your Mission Starts Here.");
    // One primary action in the hero.
    const hero = h1[0].closest("section") as HTMLElement;
    expect(within(hero).getByRole("link", { name: "Explore Your First Mission" })).toHaveAttribute("href", "/space/academy/missions/build-your-first-cubesat");
    const options = within(hero).getByRole("navigation", { name: "Or choose a mission" });
    expect(within(options).getAllByRole("link").map((a) => [a.querySelector("span span")?.textContent, a.getAttribute("href")])).toEqual([
      ["Explore Satellites", "/space/academy/missions/build-your-first-cubesat#explore"],
      ["Design Rockets", "/space/academy/missions/stable-model-rocket"],
      ["Build a CanSat", "/space/academy/cansat"],
      ["Save a Mission", "/space/academy/missions/survive-the-eclipse"],
    ]);
    const tracks = document.getElementById("tracks") as HTMLElement;
    expect(within(tracks).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(TRACKS.map((t) => `/space/academy/${t.slug}`));
    for (const t of TRACKS) expect(within(tracks).getByRole("link", { name: new RegExp(`^Track \\d: ${t.title}$`), description: t.tagline })).toBeInTheDocument();
    const hrefs = Array.from(container.querySelectorAll("a[href]")).map((a) => (a.getAttribute("href") as string).split("#")[0]);
    for (const m of MISSIONS) expect(hrefs).toContain(`/space/academy/missions/${m.slug}`);
    // No repeated calls to action: each mission is linked from the hero only.
    expect(hrefs.filter((h) => h === "/space/academy/missions/build-your-first-cubesat")).toHaveLength(2);
    expect(screen.getByText(/not affiliated with, endorsed by, or run on behalf of ISRO, IN-SPACe/)).toBeInTheDocument();
    expect(screen.getByText(/does not register anyone for, or make anyone eligible for/)).toBeInTheDocument();
  });

  it("separates online from in-person learning, and keeps the tutorial list in the HTML behind a disclosure", () => {
    render(<AcademyPage />);
    const formats = document.getElementById("formats") as HTMLElement;
    const online = within(formats).getByRole("region", { name: "Online" });
    const offline = within(formats).getByRole("region", { name: "In person" });
    expect(within(online).getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual(["Self-paced 3D missions", "Live online classes"]);
    expect(within(offline).getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual(["CanSat workshop", "Model Rocketry workshop"]);
    const resources = document.getElementById("resources") as HTMLElement;
    const details = resources.querySelector("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);
    expect(details.querySelectorAll("a[href]").length).toBe(new Set(TRACKS.flatMap((t) => t.tutorials.map((r) => r.href))).size);
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

  it("asks a student for a parent or guardian's agreement before showing the contact link", async () => {
    const user = userEvent.setup();
    render(<AcademyPage />);
    const enquire = document.getElementById("enquire") as HTMLElement;
    await user.click(within(enquire).getByRole("button", { name: "I am a student" }));
    expect(within(enquire).queryByRole("link", { name: /Express Interest/ })).toBeNull();
    await user.click(within(enquire).getByRole("checkbox", { name: /parent or guardian knows about this enquiry/ }));
    const form = within(enquire).getByRole("link", { name: /Express Interest/ });
    expect(form).toHaveAttribute("href", "https://itelematics.com/contact");
    expect(form).toHaveAttribute("rel", "noopener noreferrer");
    expect(form).toHaveAttribute("target", "_blank");
    expect(form).toHaveAttribute("data-track-event", "academy_enquiry_form_click");
    expect(form).toHaveAccessibleName("Express Interest in Space Academy (opens the iTelematics contact page in a new tab)");
    // The page has no Academy enquiry type, so the guidance says which one to choose.
    expect(enquire).toHaveTextContent(/Choose “Other” as the enquiry type and mention Space Academy/);
    expect(enquire).not.toHaveTextContent(/Google/);
    // Parents and schools go straight to the iTelematics contact page, and to this site's contact page.
    await user.click(within(enquire).getByRole("button", { name: "I am a parent or guardian" }));
    expect(within(enquire).getByRole("link", { name: /Express Interest/ })).toHaveAttribute("href", "https://itelematics.com/contact");
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

  it("separates the course description, the lesson plan and the classes and workshops, with the maths optional at 14–16", async () => {
    render(await TrackPage({ params: Promise.resolve({ track: "spacecraft-systems" }) }));
    const parts = Array.from(document.querySelectorAll("section[id='course'], section[id='lesson-plan'], section[id='formats'], section[id='tutorials']")).map((el) => el.id);
    expect(parts).toEqual(["course", "lesson-plan", "formats", "tutorials"]);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    expect(within(nav).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(["#course", "#lesson-plan", "#formats", "#tutorials"]);
    // Course: who it is for and what it achieves. Lesson plan: lessons, activities, challenge, maths, models.
    const course = document.getElementById("course") as HTMLElement;
    for (const id of ["prerequisites", "objectives", "outcomes"]) expect(course.querySelector(`#${id}`), id).not.toBeNull();
    const plan = document.getElementById("lesson-plan") as HTMLElement;
    for (const id of ["topics", "activities", "challenge", "physics", "models"]) expect(plan.querySelector(`#${id}`), id).not.toBeNull();
    expect((document.querySelector("#physics details") as HTMLDetailsElement).open).toBe(false);
    expect((document.querySelector("#physics-advanced details") as HTMLDetailsElement).open).toBe(true);
    const formats = document.getElementById("formats") as HTMLElement;
    expect(within(formats).getByRole("heading", { level: 3, name: "Online" })).toBeInTheDocument();
    expect(within(formats).getByRole("heading", { level: 3, name: "In person" })).toBeInTheDocument();
  });
});
