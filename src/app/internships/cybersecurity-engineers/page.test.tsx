import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { BHAVYA_KSHATRI } from "@/data/public-entities";
import sitemap from "../../sitemap";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships" }));

import BatteryCybersecurityContent from "../battery-cybersecurity/BatteryCybersecurityContent";
import InternshipsPage from "../page";
import CybersecurityEngineersPage, { metadata } from "./page";

const ROUTE = "/internships/cybersecurity-engineers";
const CANONICAL = `https://autonomous.ev.engineer${ROUTE}`;
const BHAVYA = "Bhavya Naga Sai Parvathi Kshatri";
const card = (name: string) => screen.getByRole("article", { name });
const hrefs = (el: HTMLElement) => within(el).getAllByRole("link").map((a) => a.getAttribute("href"));

describe("Cybersecurity Engineers page", () => {
  it("has one H1 and the two engineers and the programs as H2s, in that order", () => {
    render(<CybersecurityEngineersPage />);
    expect(screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual(["Cybersecurity Engineers"]);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([BHAVYA, "Sudarshana Karkala", "Cybersecurity Research & Programs"]);
    expect(screen.getByText("Engineering Security for EV, Battery, Aerospace and Connected Systems")).toBeInTheDocument();
    expect(screen.getByText(/^Meet engineers and researchers contributing to cybersecurity, battery safety, connected systems/)).toBeInTheDocument();
  });

  it("gives each engineer a portrait, the role already published for them, focus areas and three links", () => {
    render(<CybersecurityEngineersPage />);
    const bhavya = card(BHAVYA);
    expect(within(bhavya).getByRole("img", { name: `${BHAVYA} — Cybersecurity Researcher` }).getAttribute("src")).toContain("bhavyaparvathi.png");
    expect(within(bhavya).getByText("Cybersecurity Researcher · EV.ENGINEER™")).toBeInTheDocument();
    expect(within(bhavya).getAllByRole("listitem").slice(0, 3).map((li) => li.textContent)).toEqual(["Cybersecurity", "Threat Detection & Alert Investigation", "AI SOC Analysis"]);
    expect(hrefs(bhavya)).toEqual(["https://bhavyacyber.github.io/", "https://www.linkedin.com/in/bhavya-naga-sai-parvathi-kshatri", "/internships/AegisCAN"]);
    expect(BHAVYA_KSHATRI.sameAs).toContain(hrefs(bhavya)[1]);

    const sudarshana = card("Sudarshana Karkala");
    expect(within(sudarshana).getByRole("img", { name: "Sudarshana Karkala — Co-Researcher, EV.ENGINEER" }).getAttribute("src")).toContain("SudarshanaKarkala.jpg");
    expect(within(sudarshana).getByText("Co-Researcher · EV.ENGINEER™")).toBeInTheDocument();
    expect(hrefs(sudarshana)).toEqual(["https://www.linkedin.com/in/sudarshanakarkala/", "https://www.evsociety.org/programs/evto/candidates/sudarshana-karkala", "/internships/battery-cybersecurity"]);
  });

  it("does not present Tanuja Jadhav's EV Society page as Bhavya's profile", () => {
    const { container } = render(<CybersecurityEngineersPage />);
    expect(container.innerHTML).not.toMatch(/tanujajadhav/i);
    expect(hrefs(card(BHAVYA)).some((href) => href?.includes("evsociety.org"))).toBe(false);
  });

  it("opens external profiles in a new tab, names them for screen readers, and reports every profile click", () => {
    render(<CybersecurityEngineersPage />);
    const links = within(card(BHAVYA)).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("target"))).toEqual(["_blank", "_blank", null]);
    expect(links[0]).toHaveAttribute("rel", "noopener noreferrer");
    expect(links[0]).toHaveAccessibleName(`Portfolio of ${BHAVYA} (opens in a new tab)`);
    expect(links[2]).toHaveAccessibleName("AegisCAN Research");
    expect(links.map((a) => [a.getAttribute("data-track-event"), a.getAttribute("data-track-engineer"), a.getAttribute("data-track-link_type")])).toEqual([
      ["cybersecurity_engineer_profile_click", "Bhavya Parvathi", "portfolio"],
      ["cybersecurity_engineer_profile_click", "Bhavya Parvathi", "linkedin"],
      ["cybersecurity_engineer_profile_click", "Bhavya Parvathi", "research_project"],
    ]);
    expect(within(card("Sudarshana Karkala")).getAllByRole("link").map((a) => a.getAttribute("data-track-link_type"))).toEqual(["linkedin", "ev_society", "battery_cybersecurity"]);
    expect(links[0]).toHaveAttribute("data-track-destination", "https://bhavyacyber.github.io/");
  });

  it("links on to Battery Cybersecurity, AegisCAN and the internships hub", () => {
    render(<CybersecurityEngineersPage />);
    const programs = screen.getByRole("region", { name: "Cybersecurity Research & Programs" });
    expect(hrefs(programs)).toEqual(["/internships/battery-cybersecurity", "/internships/AegisCAN", "/internships"]);
    expect(within(programs).getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });

  it("has the brief's title and description, a canonical URL, and no portrait as its social image", () => {
    expect(metadata.title).toBe("Cybersecurity Engineers | EV.ENGINEER");
    expect(metadata.description).toBe("Meet engineers contributing to EV battery cybersecurity, connected systems, digital engineering and aerospace security research at EV.ENGINEER.");
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect(metadata.openGraph).toMatchObject({ url: CANONICAL, title: "Cybersecurity Engineers | EV.ENGINEER" });
    expect(metadata.openGraph).not.toHaveProperty("images");
    expect(sitemap().map((e) => e.url)).toContain(CANONICAL);
    expect(fs.readFileSync(path.join(process.cwd(), "public/llms.txt"), "utf-8")).toContain(CANONICAL);
  });

  it("describes the page, the list and both people in one JSON-LD graph, with nothing invented", () => {
    const { container } = render(<CybersecurityEngineersPage />);
    const graph = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!)["@graph"] as Array<Record<string, unknown>>;
    expect(graph.map((n) => n["@type"])).toEqual(["WebSite", "Brand", "Organization", "Person", "Person", "WebPage", "ItemList"]);
    const people = graph.filter((n) => n["@type"] === "Person");
    expect(people.map((p) => p.name)).toEqual([BHAVYA, "Sudarshana Karkala"]);
    expect(people[0].sameAs).toEqual(["https://www.linkedin.com/in/bhavya-naga-sai-parvathi-kshatri", "https://bhavyacyber.github.io/"]);
    expect(people[1].sameAs).toContain("https://www.linkedin.com/in/sudarshanakarkala/");
    for (const person of people) {
      expect(person.image).toMatch(/^https:\/\/autonomous\.ev\.engineer\//);
      for (const invented of ["jobTitle", "worksFor", "alumniOf", "hasCredential", "award"]) expect(person).not.toHaveProperty(invented);
    }
    // Every @id that is referenced is defined in the same graph.
    const defined = new Set(graph.map((n) => n["@id"]));
    const referenced = [...JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g)].map((m) => m[1]);
    expect(referenced.length).toBeGreaterThan(4);
    for (const id of referenced) expect(defined, id).toContain(id);
  });
});

describe("links into the page", () => {
  it("/internships: a Cybersecurity Engineers card right after Selection Process & Fees structure", () => {
    render(<InternshipsPage />);
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    const at = titles.indexOf("Cybersecurity Engineers");
    expect(titles.slice(at - 3, at + 2)).toEqual(["EV Career", "EV Startup", "Selection Process & Fees structure", "Cybersecurity Engineers", "VTU Internyet"]);
    const link = screen.getByRole("link", { name: /Explore Engineers/ });
    expect(link).toHaveAttribute("href", ROUTE);
    expect(link).toHaveAttribute("data-track-event", "cybersecurity_engineers_card_click");
    expect(link).toHaveAttribute("data-track-source", "internships_miscellaneous");
    expect(link).toHaveAttribute("data-track-destination", ROUTE);
    // Every other card keeps the event it had.
    expect(screen.getByRole("link", { name: /Explore Program →/ })).toHaveAttribute("data-track-event", "internship_card_click");
  });

  it("Battery Cybersecurity: a Cybersecurity Engineers CTA immediately before Gen Z, which is unchanged", () => {
    render(<BatteryCybersecurityContent />);
    const cta = screen.getByRole("link", { name: "Cybersecurity Engineers →" });
    const genZ = screen.getByRole("link", { name: "Gen Z →" });
    expect(cta.nextElementSibling).toBe(genZ);
    expect(cta).toHaveAttribute("href", ROUTE);
    expect(cta).toHaveClass("btn", "btn-secondary");
    expect(cta).toHaveAttribute("data-track-event", "cybersecurity_engineers_cta_click");
    expect(cta).toHaveAttribute("data-track-source", "battery_cybersecurity");
    expect(genZ).toHaveAttribute("href", "https://genz.ev.engineer/");
    expect(genZ).toHaveClass("btn", "btn-primary");
    expect(genZ).toHaveAttribute("data-track-event", "cybersecurity_hero_genz_click");
  });
});
