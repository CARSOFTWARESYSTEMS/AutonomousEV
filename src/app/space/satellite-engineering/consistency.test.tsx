import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import SatelliteEngineeringPage from "./page";
import HeroVisual from "./components/HeroVisual";
import { structuredData } from "./seo";
import {
  GATE_ORDER,
  PROGRAM,
  fidelityStages,
  heroSubsystems,
  phases,
  referenceMission,
  referenceSpacecraft,
  reviewGates,
} from "./programData";

vi.mock("next/navigation", () => ({ usePathname: () => "/space/satellite-engineering" }));
vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

// Production-consistency guards: every surface (hero, hero visual, body,
// structured data, source, llms.txt) must agree on the V1.1 values.

const FORMAL_ORDER = ["MCR", "SRR", "PDR", "CDR", "TRR", "ORR", "MRR"];
const DIR = import.meta.dirname;
const sourceFiles = fs
  .readdirSync(DIR, { recursive: true, encoding: "utf-8" })
  .filter((f) => /\.(ts|tsx)$/.test(f) && !/\.test\./.test(f))
  .map((f) => ({ file: f, text: fs.readFileSync(path.join(DIR, f), "utf-8") }));
const llmsTxt = fs.readFileSync(path.resolve(DIR, "../../../../public/llms.txt"), "utf-8");

const isComment = (line: string) => /^\s*(\/\/|\*|\/\*)/.test(line);

describe("Satellite Engineering production consistency", () => {
  it("hero uses the approved 'architect complex satellite missions' lede from the single program source", () => {
    render(<SatelliteEngineeringPage />);
    const hero = screen.getByRole("region", { name: PROGRAM.title });
    expect(within(hero).getByText(PROGRAM.lede)).toBeInTheDocument();
    expect(PROGRAM.lede).toContain("architect complex satellite missions");
    expect(hero.textContent).not.toMatch(/design complex satellite missions/);
  });

  it("orders review gates MCR → SRR → PDR → CDR → TRR → ORR → MRR on every surface", () => {
    expect(reviewGates.map((g) => g.code)).toEqual(FORMAL_ORDER);
    expect(GATE_ORDER).toEqual(FORMAL_ORDER);
    expect(phases.flatMap((p) => p.weeks).flatMap((w) => w.milestones ?? []).map((m) => m.code)).toEqual(FORMAL_ORDER);

    const { container } = render(<SatelliteEngineeringPage />);
    const heroStrip = within(screen.getByRole("figure", { name: referenceSpacecraft.name }))
      .getAllByRole("listitem")
      .map((li) => li.textContent)
      .filter((t) => FORMAL_ORDER.includes(t ?? ""));
    expect(heroStrip).toEqual(FORMAL_ORDER);
    expect(Array.from(container.querySelectorAll("#reviews ol > li")).map((li) => li.getAttribute("data-gate"))).toEqual(FORMAL_ORDER);

    const course = (structuredData["@graph"] as { "@type": string; syllabusSections?: { description: string }[] }[]).find(
      (n) => n["@type"] === "Course",
    )!;
    const schemaGates = course.syllabusSections!.flatMap((s) => s.description.match(/Review gates: ([A-Z, ]+)\./)?.[1].split(", ") ?? []);
    expect(schemaGates).toEqual(FORMAL_ORDER);
  });

  it("has no gate list anywhere in the implementation or llms.txt where TRR precedes CDR", () => {
    // A "gate list" is a run of gate codes joined only by separators (",", "·", "→", "|", "and"…),
    // e.g. `CDR, TRR, ORR and MRR` — prose such as "verify the CDR baseline" is not a list.
    const CODE = "(?:MCR|SRR|PDR|CDR|TRR|ORR|MRR)";
    const RUN = new RegExp(`\\b${CODE}\\b(?:[\\s"'·,→|/&–-]*(?:and\\s+)?\\b${CODE}\\b)+`, "g");
    let lists = 0;
    for (const { file, text } of [...sourceFiles, { file: "public/llms.txt", text: llmsTxt }]) {
      text.split("\n").forEach((line, i) => {
        if (isComment(line)) return;
        for (const run of line.match(RUN) ?? []) {
          lists++;
          const codes = run.match(new RegExp(CODE, "g"))!;
          if (codes.includes("CDR") && codes.includes("TRR")) {
            expect(codes.indexOf("CDR"), `${file}:${i + 1} lists TRR before CDR: ${run}`).toBeLessThan(codes.indexOf("TRR"));
          }
        }
      });
    }
    expect(lists).toBeGreaterThan(3);
  });

  it("keeps no hard-coded gate-code array outside the reviewGates source", () => {
    for (const { file, text } of sourceFiles) {
      expect(text, `${file} re-declares a gate array`).not.toMatch(/\[\s*"(MCR|SRR|PDR|CDR|TRR|ORR|MRR)"\s*,/);
    }
  });

  it("describes a 3-year design-life target with a 5-year extension trade, from one data object", () => {
    const labels = referenceMission.map((s) => s.label);
    expect(labels).not.toContain("Lifetime");
    expect(referenceMission.find((s) => s.label === "Design Life Target")?.value).toBe("3 years");
    expect(referenceMission.find((s) => s.label === "Life Extension Trade")?.value).toBe("Evaluate extension toward 5 years");
    expect(referenceSpacecraft.designLifeYears).toBe(3);
    expect(referenceSpacecraft.extensionYears).toBe(5);

    const { container } = render(<SatelliteEngineeringPage />);
    expect(container.textContent).not.toMatch(/3–5 years|3-5 years/);
  });

  it("renders the hero panel from the same reference-spacecraft facts as the mission card", () => {
    render(<HeroVisual />);
    const panel = screen.getByRole("figure", { name: referenceSpacecraft.name });
    expect(within(panel).getByText(referenceSpacecraft.facts.orbit.short)).toBeInTheDocument();
    heroSubsystems.forEach(([name, value]) => {
      const term = within(panel).getByText(name);
      expect(term.nextElementSibling?.textContent).toBe(value);
    });
    expect(heroSubsystems.find(([n]) => n === "ADCS")?.[1]).toBe(referenceSpacecraft.facts.adcs.short);
  });

  it("uses only the approved fidelity labels and tools heading", () => {
    expect(fidelityStages.map((f) => f.level)).toEqual([
      "Concept Baseline",
      "Preliminary Design",
      "Verification-Ready Baseline",
      "Operational Baseline",
    ]);
    const { container } = render(<SatelliteEngineeringPage />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/Qualified design/i);
    expect(text).not.toMatch(/Industry-grade and open engineering tools/);
    expect(text).not.toMatch(/Payload, Qualification & Mission Readiness/);
    expect(screen.getByRole("heading", { level: 2, name: "Engineering Tools & Open Technical Stack" })).toBeInTheDocument();
    for (const { file, text: src } of sourceFiles) {
      expect(src, file).not.toMatch(/Qualified design|Industry-grade and open engineering tools|design complex satellite missions/);
    }
  });
});
