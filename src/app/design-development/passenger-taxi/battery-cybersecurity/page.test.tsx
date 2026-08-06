import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import BatteryCybersecurityPage from "./page";
import { THREAT_CATALOGUE } from "@/lib/battery-cybersecurity/data/threatCatalogue";
import { FAQ_ITEMS } from "@/lib/battery-cybersecurity/data/faq";
import { GLOSSARY_TERMS } from "@/lib/battery-cybersecurity/data/glossary";
import { SCENARIO_PRESETS } from "@/lib/battery-cybersecurity/data/scenarioPresets";

describe("BatteryCybersecurityPage", () => {
  it("renders exactly one H1", () => {
    render(<BatteryCybersecurityPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("renders the hero CTAs pointing to in-page anchors", () => {
    render(<BatteryCybersecurityPage />);
    expect(screen.getByRole("link", { name: /Assess Your Energy Attack Surface/i })).toHaveAttribute("href", "#threat-modelling-studio");
    expect(screen.getByRole("link", { name: /Explore the Threat Model/i })).toHaveAttribute("href", "#energy-trust-chain");
  });

  it("renders the section navigator with one tab per section", () => {
    render(<BatteryCybersecurityPage />);
    expect(screen.getAllByRole("tab").length).toBeGreaterThanOrEqual(13);
  });

  it("renders the full threat catalogue from data", () => {
    const { container } = render(<BatteryCybersecurityPage />);
    const catalogue = within(container.querySelector("#threat-catalogue")!);
    for (const threat of THREAT_CATALOGUE) {
      expect(catalogue.getByText(threat.name)).toBeInTheDocument();
    }
  });

  it("renders the full FAQ from data", () => {
    const { container } = render(<BatteryCybersecurityPage />);
    const faq = within(container.querySelector("#faq")!);
    for (const item of FAQ_ITEMS) {
      expect(faq.getByText(item.question)).toBeInTheDocument();
    }
  });

  it("renders the full glossary from data", () => {
    const { container } = render(<BatteryCybersecurityPage />);
    const glossary = within(container.querySelector("#glossary")!);
    for (const term of GLOSSARY_TERMS) {
      expect(glossary.getByText(term.term)).toBeInTheDocument();
    }
  });

  it("renders the threat-modelling studio with every scenario preset", () => {
    render(<BatteryCybersecurityPage />);
    for (const preset of SCENARIO_PRESETS) {
      expect(screen.getByRole("button", { name: preset.label })).toBeInTheDocument();
    }
  });

  it("embeds valid JSON-LD structured data with a 4-level breadcrumb and matching FAQ count", () => {
    const { container } = render(<BatteryCybersecurityPage />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.innerHTML);
    const breadcrumb = data["@graph"].find((n: { "@type": string }) => n["@type"] === "BreadcrumbList");
    expect(breadcrumb.itemListElement).toHaveLength(4);
    const faqNode = data["@graph"].find((n: { "@type": string }) => n["@type"] === "FAQPage");
    expect(faqNode.mainEntity).toHaveLength(FAQ_ITEMS.length);
  });
});
