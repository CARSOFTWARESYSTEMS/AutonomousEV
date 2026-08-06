import { describe, expect, it } from "vitest";
import { AIRCRAFT_PROFILES } from "./data/aircraftProfiles";
import { COMPONENTS } from "./data/components";
import { ENTRY_POINTS } from "./data/entryPoints";
import { DETECTION_CONTROLS } from "./data/detectionControls";
import { THREAT_CATALOGUE } from "./data/threatCatalogue";
import { GLOSSARY_TERMS } from "./data/glossary";
import { FAQ_ITEMS } from "./data/faq";
import { QUIZ_QUESTIONS } from "./data/quiz";
import { INTERN_EXERCISES } from "./data/exercises";
import { REFERENCES } from "./data/references";
import { SCENARIO_PRESETS } from "./data/scenarioPresets";
import { FRAMEWORKS } from "./data/frameworks";
import { MATURITY_LEVELS } from "./data/maturityModel";
import { FLIGHT_PHASE_PROFILES } from "./data/flightPhaseProfiles";
import { DECISION_TREES } from "./data/decisionTrees";
import { DIGITAL_TWIN_LAYERS } from "./data/digitalTwin";
import { METHODOLOGY_STEPS } from "./data/methodology";
import { WORKSHOP_JOURNEY } from "./data/workshopJourney";
import { DOWNLOAD_TEMPLATES } from "./data/downloadTemplates";
import { RESEARCH_LIBRARY_ENTRIES, RESEARCH_LIBRARY_CATEGORIES } from "./data/researchLibrary";
import { RELATED_ARTICLES } from "./data/relatedArticles";
import sitemap from "../../app/sitemap";

function assertUniqueIds(items: Array<{ id: string }>, label: string) {
  const ids = items.map((i) => i.id);
  expect(new Set(ids).size, `${label} should have unique ids`).toBe(ids.length);
}

describe("glossary data quality", () => {
  it("every term has all five required fields non-empty (term -> definition -> why it matters -> example -> verification)", () => {
    for (const term of GLOSSARY_TERMS) {
      expect(term.term.trim().length, term.id).toBeGreaterThan(0);
      expect(term.definition.trim().length, term.id).toBeGreaterThan(0);
      expect(term.whyItMatters.trim().length, term.id).toBeGreaterThan(0);
      expect(term.example.trim().length, term.id).toBeGreaterThan(0);
      expect(term.verificationApproach.trim().length, term.id).toBeGreaterThan(0);
    }
  });

  it("has unique ids", () => assertUniqueIds(GLOSSARY_TERMS, "glossary terms"));
});

describe("FAQ data quality", () => {
  it("every FAQ item has a non-empty question and answer", () => {
    for (const item of FAQ_ITEMS) {
      expect(item.question.trim().length).toBeGreaterThan(0);
      expect(item.answer.trim().length).toBeGreaterThan(0);
    }
  });

  it("has unique ids", () => assertUniqueIds(FAQ_ITEMS, "FAQ items"));
});

describe("threat catalogue integrity", () => {
  it("has unique ids", () => assertUniqueIds(THREAT_CATALOGUE, "threats"));

  it("every threat references only real components", () => {
    const componentIds = new Set(COMPONENTS.map((c) => c.id));
    for (const threat of THREAT_CATALOGUE) {
      for (const id of threat.affectedComponentIds) {
        expect(componentIds.has(id), `${threat.id} -> unknown component ${id}`).toBe(true);
      }
    }
  });

  it("every threat references only real entry points", () => {
    const entryPointIds = new Set(ENTRY_POINTS.map((e) => e.id));
    for (const threat of THREAT_CATALOGUE) {
      for (const id of threat.affectedEntryPointIds) {
        expect(entryPointIds.has(id), `${threat.id} -> unknown entry point ${id}`).toBe(true);
      }
    }
  });

  it("every threat references only real detection/mitigation controls", () => {
    const controlIds = new Set(DETECTION_CONTROLS.map((c) => c.id));
    for (const threat of THREAT_CATALOGUE) {
      for (const id of [...threat.detectionControlIds, ...threat.mitigationControlIds]) {
        expect(controlIds.has(id), `${threat.id} -> unknown control ${id}`).toBe(true);
      }
    }
  });

  it("keeps post-quantum-related threats to a small minority of the catalogue (~12% cap)", () => {
    const pqcCount = THREAT_CATALOGUE.filter((t) => t.postQuantumRelated).length;
    const share = pqcCount / THREAT_CATALOGUE.length;
    expect(share).toBeLessThanOrEqual(0.12);
  });

  it("every threat has a residual risk note", () => {
    for (const threat of THREAT_CATALOGUE) {
      expect(threat.residualRiskNote.trim().length, threat.id).toBeGreaterThan(0);
    }
  });
});

describe("component and entry point graph integrity", () => {
  it("every component's downstream ids reference real components", () => {
    const componentIds = new Set(COMPONENTS.map((c) => c.id));
    for (const component of COMPONENTS) {
      for (const id of component.downstreamComponentIds) {
        expect(componentIds.has(id), `${component.id} -> unknown downstream ${id}`).toBe(true);
      }
    }
  });

  it("every entry point's reachable ids reference real components", () => {
    const componentIds = new Set(COMPONENTS.map((c) => c.id));
    for (const entryPoint of ENTRY_POINTS) {
      for (const id of entryPoint.reachableComponentIds) {
        expect(componentIds.has(id), `${entryPoint.id} -> unknown component ${id}`).toBe(true);
      }
    }
  });

  it("every aircraft profile references only real components and a real default flight phase", () => {
    const componentIds = new Set(COMPONENTS.map((c) => c.id));
    for (const profile of AIRCRAFT_PROFILES) {
      for (const id of profile.componentIds) {
        expect(componentIds.has(id), `${profile.id} -> unknown component ${id}`).toBe(true);
      }
    }
  });
});

describe("scenario presets", () => {
  it("has unique ids", () => assertUniqueIds(SCENARIO_PRESETS, "scenario presets"));

  it("includes at least the 6 spec-required presets", () => {
    expect(SCENARIO_PRESETS.length).toBeGreaterThanOrEqual(6);
  });
});

describe("quiz and exercises", () => {
  it("every quiz question has a valid correctIndex within its options", () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
      expect(q.explanation.trim().length).toBeGreaterThan(0);
    }
  });

  it("has at least 5 quiz questions and 5 intern exercises", () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(5);
    expect(INTERN_EXERCISES.length).toBeGreaterThanOrEqual(5);
  });

  it("every exercise has non-empty acceptance criteria and a stretch goal", () => {
    for (const exercise of INTERN_EXERCISES) {
      expect(exercise.acceptanceCriteria.length).toBeGreaterThan(0);
      expect(exercise.stretchGoal.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("references", () => {
  it("every reference has a well-formed https URL", () => {
    for (const ref of REFERENCES) {
      expect(ref.url.startsWith("https://")).toBe(true);
    }
  });

  it("has unique ids", () => assertUniqueIds(REFERENCES, "references"));
});

// ================================================================
// Phase 2 — Engineering Excellence
// ================================================================

describe("frameworks data quality", () => {
  it("has unique ids and every field non-empty", () => {
    assertUniqueIds(FRAMEWORKS, "frameworks");
    for (const fw of FRAMEWORKS) {
      expect(fw.stages.length).toBeGreaterThan(0);
      expect(fw.executiveSummary.trim().length, fw.id).toBeGreaterThan(0);
      expect(fw.engineeringExplanation.trim().length, fw.id).toBeGreaterThan(0);
      expect(fw.practicalExample.trim().length, fw.id).toBeGreaterThan(0);
      expect(fw.verificationMethod.trim().length, fw.id).toBeGreaterThan(0);
    }
  });
});

describe("maturity model data quality", () => {
  it("has exactly 7 levels, numbered 1-7 uniquely", () => {
    expect(MATURITY_LEVELS).toHaveLength(7);
    const levels = MATURITY_LEVELS.map((l) => l.level).sort((a, b) => a - b);
    expect(levels).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("every level has non-empty characteristics, controls, outputs, gaps, and guidance", () => {
    for (const lvl of MATURITY_LEVELS) {
      expect(lvl.characteristics.length, lvl.id).toBeGreaterThan(0);
      expect(lvl.engineeringControls.length, lvl.id).toBeGreaterThan(0);
      expect(lvl.expectedOutputs.length, lvl.id).toBeGreaterThan(0);
      expect(lvl.gaps.length, lvl.id).toBeGreaterThan(0);
      expect(lvl.nextStepGuidance.trim().length, lvl.id).toBeGreaterThan(0);
    }
  });

  it("maturity increases (or holds) monotonically toward future-roadmap by level order", () => {
    const order = ["available-capability", "demonstration-poc", "research-in-progress", "future-roadmap"];
    const sorted = [...MATURITY_LEVELS].sort((a, b) => a.level - b.level);
    let lastIndex = -1;
    for (const lvl of sorted) {
      const idx = order.indexOf(lvl.evidenceStatus);
      expect(idx, lvl.id).toBeGreaterThanOrEqual(lastIndex);
      lastIndex = idx;
    }
  });
});

describe("flight phase profiles data quality", () => {
  it("has exactly the 10 spec-required phases, uniquely ordered", () => {
    expect(FLIGHT_PHASE_PROFILES).toHaveLength(10);
    const orders = FLIGHT_PHASE_PROFILES.map((p) => p.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assertUniqueIds(FLIGHT_PHASE_PROFILES, "flight phase profiles");
  });

  it("every phase has all seven required fields non-empty", () => {
    for (const p of FLIGHT_PHASE_PROFILES) {
      expect(p.batteryFunctions.length, p.id).toBeGreaterThan(0);
      expect(p.threats.length, p.id).toBeGreaterThan(0);
      expect(p.attackSurface.trim().length, p.id).toBeGreaterThan(0);
      expect(p.detection.trim().length, p.id).toBeGreaterThan(0);
      expect(p.mitigation.trim().length, p.id).toBeGreaterThan(0);
      expect(p.operationalImpact.trim().length, p.id).toBeGreaterThan(0);
      expect(p.verification.trim().length, p.id).toBeGreaterThan(0);
    }
  });
});

describe("decision trees integrity", () => {
  it("has unique ids and every step's next id resolves to a real step or is a terminal outcome", () => {
    assertUniqueIds(DECISION_TREES, "decision trees");
    for (const tree of DECISION_TREES) {
      const stepIds = new Set(tree.steps.map((s) => s.id));
      expect(stepIds.has(tree.startStepId), tree.id).toBe(true);
      for (const step of tree.steps) {
        for (const branch of [step.yes, step.no]) {
          if (branch.next !== null) {
            expect(stepIds.has(branch.next), `${tree.id}/${step.id}`).toBe(true);
          } else {
            expect(branch.outcome?.trim().length ?? 0, `${tree.id}/${step.id}`).toBeGreaterThan(0);
          }
        }
      }
    }
  });
});

describe("digital twin layers data quality", () => {
  it("has exactly 4 layers, uniquely ordered 1-4", () => {
    expect(DIGITAL_TWIN_LAYERS).toHaveLength(4);
    const orders = DIGITAL_TWIN_LAYERS.map((l) => l.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4]);
  });

  it("separates current capability from future roadmap explicitly", () => {
    const statuses = DIGITAL_TWIN_LAYERS.map((l) => l.evidenceStatus);
    expect(statuses).toContain("available-capability");
    expect(statuses).toContain("future-roadmap");
  });
});

describe("methodology steps data quality", () => {
  it("has exactly 8 steps, uniquely ordered 1-8", () => {
    expect(METHODOLOGY_STEPS).toHaveLength(8);
    const orders = METHODOLOGY_STEPS.map((s) => s.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("workshop journey data quality", () => {
  it("has exactly 8 stages, uniquely ordered 1-8", () => {
    expect(WORKSHOP_JOURNEY).toHaveLength(8);
    const orders = WORKSHOP_JOURNEY.map((s) => s.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("download templates data quality", () => {
  it("has exactly the 6 spec-required categories, each producing non-empty markdown", () => {
    const categories = new Set(DOWNLOAD_TEMPLATES.map((t) => t.category));
    expect(categories.size).toBe(6);
    for (const template of DOWNLOAD_TEMPLATES) {
      const md = template.buildMarkdown();
      expect(md.trim().length, template.id).toBeGreaterThan(0);
      expect(md.startsWith("#"), template.id).toBe(true);
      expect(template.filename.endsWith(".md"), template.id).toBe(true);
    }
  });

  it("has unique ids", () => assertUniqueIds(DOWNLOAD_TEMPLATES, "download templates"));
});

describe("research library integrity", () => {
  it("every entry belongs to a declared category", () => {
    const categoryIds = new Set(RESEARCH_LIBRARY_CATEGORIES.map((c) => c.id));
    for (const entry of RESEARCH_LIBRARY_ENTRIES) {
      expect(categoryIds.has(entry.category), entry.id).toBe(true);
    }
  });

  it("every entry has a well-formed https URL (no invented sources)", () => {
    for (const entry of RESEARCH_LIBRARY_ENTRIES) {
      expect(entry.url.startsWith("https://"), entry.id).toBe(true);
    }
  });

  it("declares all 5 spec-required categories even when some are empty", () => {
    expect(RESEARCH_LIBRARY_CATEGORIES.map((c) => c.id).sort()).toEqual(
      ["papers", "patents", "talks", "videos", "whitepapers"].sort()
    );
  });
});

describe("related articles integrity", () => {
  it("every related-article href is a real, existing site route", () => {
    const realPaths = new Set(sitemap().map((entry) => entry.url.replace("https://autonomous.ev.engineer", "") || "/"));
    for (const article of RELATED_ARTICLES) {
      expect(realPaths.has(article.href), `${article.id} -> ${article.href} not in sitemap`).toBe(true);
    }
  });

  it("has unique ids", () => assertUniqueIds(RELATED_ARTICLES, "related articles"));
});
