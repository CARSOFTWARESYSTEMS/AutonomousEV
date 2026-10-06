import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/internships",
}));

import InternshipsPage, { metadata } from "./page";

describe("/internships canonical hub page", () => {
  it("has a canonical URL and is indexable", () => {
    expect(metadata.alternates?.canonical).toBe("https://autonomous.ev.engineer/internships");
    const robots = metadata.robots as { index: boolean; follow: boolean };
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it("visibly answers who can apply, prerequisites, stipend status, and how to apply", () => {
    render(<InternshipsPage />);
    expect(screen.getByText("Who can apply?")).toBeInTheDocument();
    expect(screen.getByText("What prerequisites are required?")).toBeInTheDocument();
    expect(screen.getByText("Is a stipend guaranteed?")).toBeInTheDocument();
    expect(screen.getByText(/No stipend is published or guaranteed/)).toBeInTheDocument();
    expect(screen.getByText("How do I apply?")).toBeInTheDocument();
  });

  it("links to the model rocketry guide and to Sudarshana Karkala's public profile", () => {
    render(<InternshipsPage />);
    expect(screen.getAllByRole("link", { name: /model rocketry/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Sudarshana Karkala's profile/i })).toHaveAttribute(
      "href",
      "/about/sudarshana-karkala"
    );
  });

  it("injects a valid JSON-LD CollectionPage/ItemList graph", () => {
    const { container } = render(<InternshipsPage />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "");
    const types = parsed["@graph"].map((n: Record<string, unknown>) => n["@type"]);
    expect(types).toContain("CollectionPage");
  });
});

describe("/internships hero, prerequisites and metadata", () => {
  it("is headed for every track, not only EV and battery", () => {
    render(<InternshipsPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Engineering Internships & R&D");
    expect(screen.getByText(/to Solve Energy, EV Battery, Autonomous Systems, Aerospace and Space Engineering Challenges/)).toBeInTheDocument();
    expect(screen.getByText(/across EV, Energy, AI, Autonomous Systems, Aerospace and Space\./)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/AV, EV & Battery/);
  });

  it("states a common foundation and what each family of tracks adds", () => {
    render(<InternshipsPage />);
    const card = screen.getByRole("heading", { level: 3, name: "Prerequisites" }).parentElement!;
    expect(within(card).getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual(["Common Foundation", "EV / Battery", "AI / Software", "Space / Aerospace"]);
    expect(within(card).getAllByRole("list").map((list) => within(list).getAllByRole("listitem").length)).toEqual([4, 3, 2, 3]);
    expect(within(card).getByText("Specific prerequisites vary by project. A discovery call confirms fit and any bridge learning required.")).toBeInTheDocument();
    // EV and lithium-ion knowledge is asked of the EV / Battery tracks only.
    expect(within(card).getByText("Lithium-ion battery fundamentals").closest("div")).toHaveTextContent(/^EV \/ Battery/);
    expect(within(card).getByRole("link", { name: /Book Discovery Call/ })).toHaveAttribute("href", "https://topmate.io/sudarshana_karkala");
    expect(screen.getByText(/It depends on the track\./)).toBeInTheDocument();
  });

  it("has a title and description that span the whole programme", () => {
    expect(metadata.title).toBe("Engineering Internships & R&D — EV, AI, Aerospace & Space | EV.ENGINEER™");
    expect(metadata.description).toBe(
      "Hands-on engineering internships and R&D projects across EV batteries, autonomous systems, AI, aerospace, space systems, cybersecurity, model rocketry and advanced manufacturing.",
    );
    expect(metadata.openGraph).toMatchObject({ title: metadata.title, description: metadata.description });
  });
});

describe("/internships Space & Aerospace Engineering", () => {
  const section = () => screen.getByRole("heading", { level: 2, name: "Space & Aerospace Engineering" }).parentElement!;

  it("lists the four tracks in order, each with an eyebrow, six tags and one primary action", () => {
    render(<InternshipsPage />);
    const cards = within(section()).getAllByRole("article");
    expect(cards.map((card) => within(card).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Spacecraft Health Management Mission 2040",
      "Aerospace Learning & Research Platform",
      "Aerospace Quality Intelligence Platform",
      "IN-SPACe Model Rocketry",
    ]);
    expect(cards.map((card) => card.querySelector("p")!.textContent)).toEqual(["Space Systems R&D", "Aerospace Engineering & Research", "Aerospace & Defence R&D", "Model Rocketry & Mission Engineering"]);
    const primary = cards.map((card) => within(card).getAllByRole("link")[0]);
    expect(primary.map((link) => link.textContent)).toEqual(["Explore Space Mission→", "Explore Aerospace→", "Explore AQIP→", "Explore Model Rocketry→"]);
    expect(primary.map((link) => link.getAttribute("href"))).toEqual(["/space", "/aerospace", "/internships/aerospace-quality-intelligence-platform", "/space/2026-INSPACe-ROCKETRY-059"]);
    // The arrow is decoration, so each action is named by its words alone.
    expect(primary[2]).toHaveAccessibleName("Explore AQIP");
    for (const card of cards) {
      const tags = within(within(card).getByRole("list", { name: "Topics" })).getAllByRole("listitem");
      // Six tags, plus the "+2" a phone shows in place of the last two.
      expect(tags).toHaveLength(7);
      expect(tags[6]).toHaveTextContent("+2");
      expect(tags.filter((tag) => tag.hasAttribute("data-extra"))).toHaveLength(2);
    }
  });

  it("gives AQIP its new identity: a badge, FAI and AI-Assisted tags, and no Agentic AI label", () => {
    render(<InternshipsPage />);
    const card = within(section()).getByRole("heading", { level: 3, name: "Aerospace Quality Intelligence Platform" }).closest("article")!;
    expect(within(card).getByText("AQIP")).toBeInTheDocument();
    expect(within(card).getByText(/connecting engineering requirements, inspection, FAI, configuration control, manufacturing evidence and supplier quality through a trusted digital thread\./)).toBeInTheDocument();
    expect(within(within(card).getByRole("list", { name: "Topics" })).getAllByRole("listitem").slice(0, 6).map((tag) => tag.textContent)).toEqual(["Aerospace", "Defence", "Quality Intelligence", "FAI", "Digital Thread", "AI-Assisted"]);
    expect(card.textContent).not.toMatch(/Agentic AI|GenAI/);
    expect(within(card).getByRole("link", { name: "Explore AQIP" })).toHaveAttribute("data-track-event", "aqip_card_click");
  });

  it("keeps Model Rocketry's supporting links, below its primary action", () => {
    render(<InternshipsPage />);
    const card = within(section()).getByRole("heading", { level: 3, name: "IN-SPACe Model Rocketry" }).closest("article")!;
    const supporting = within(within(card).getByRole("list", { name: "More for IN-SPACe Model Rocketry" })).getAllByRole("link");
    expect(supporting.map((link) => link.getAttribute("href"))).toEqual([
      "https://labs.ev.engineer/Internships/Rocketry/astroforge.html",
      "https://www.inspace.gov.in/inspace?id=workshop_on_essentials_of_model_rocketry",
      "/workbook/inspace-model-rocketry-workshop-brochure.pdf",
      "/workbook/model-rocketry-7-day-learning-workbook-2026.pdf",
    ]);
    expect(supporting[0]).toHaveAttribute("target", "_blank");
    expect(supporting[0]).toHaveAttribute("rel", "noopener noreferrer");
    expect(supporting[0]).toHaveAccessibleName("Student Competition 2026 (opens in a new tab)");
  });

  it("leaves GenAI & Agentic AI Projects with EV Help Agent alone, and shows AQIP once on the page", () => {
    render(<InternshipsPage />);
    const genai = screen.getByRole("heading", { level: 2, name: "GenAI & Agentic AI Projects" }).nextElementSibling as HTMLElement;
    expect(within(genai).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["EV Help Agent"]);
    expect(within(genai).getByRole("link", { name: /Visit Website/ })).toHaveAttribute("href", "https://help.ev.engineer/");
    expect(within(genai).getByRole("link", { name: /design flow/ })).toHaveAttribute("href", "/internships/ev-help-agent");
    expect(within(genai).getByRole("link", { name: /Real AI Dialogs/ })).toHaveAttribute("href", "/internships/ev-help-agent/usecases");
    expect(screen.getAllByRole("heading", { name: "Aerospace Quality Intelligence Platform" })).toHaveLength(1);
    expect(document.querySelectorAll('a[href="/internships/aerospace-quality-intelligence-platform"]')).toHaveLength(1);
  });

  it("keeps the heading order: the section is an H2 and every card title an H3", () => {
    render(<InternshipsPage />);
    expect(section().querySelectorAll("h3")).toHaveLength(4);
    expect(section().querySelectorAll("h1, h4, h5, h6")).toHaveLength(0);
    expect(section()).toHaveAttribute("id", "space-aerospace-engineering");
  });
});
