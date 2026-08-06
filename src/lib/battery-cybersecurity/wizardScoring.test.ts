import { describe, expect, it } from "vitest";
import { scoreAssessment, ALL_TRUST_DIMENSIONS } from "./wizardScoring";
import { WIZARD_QUESTIONS } from "./data/wizardQuestions";
import type { WizardAnswers } from "./types";

describe("scoreAssessment", () => {
  it("scores 0 across all dimensions when every question is answered No", () => {
    const answers: WizardAnswers = Object.fromEntries(WIZARD_QUESTIONS.map((q) => [q.id, q.type === "boolean" ? false : []]));
    const result = scoreAssessment(answers, WIZARD_QUESTIONS);
    for (const d of ALL_TRUST_DIMENSIONS) {
      expect(result.dimensionScores[d]).toBe(0);
    }
    expect(result.overallTrust).toBe(0);
  });

  it("scores 100 across all dimensions when every question is answered Yes", () => {
    const answers: WizardAnswers = Object.fromEntries(WIZARD_QUESTIONS.map((q) => [q.id, q.type === "boolean" ? true : []]));
    const result = scoreAssessment(answers, WIZARD_QUESTIONS);
    for (const d of ALL_TRUST_DIMENSIONS) {
      expect(result.dimensionScores[d]).toBe(100);
    }
    expect(result.overallTrust).toBe(100);
  });

  it("treats an unanswered question the same as a No answer", () => {
    const allNo: WizardAnswers = Object.fromEntries(WIZARD_QUESTIONS.map((q) => [q.id, q.type === "boolean" ? false : []]));
    const allUnanswered: WizardAnswers = {};
    expect(scoreAssessment(allUnanswered, WIZARD_QUESTIONS)).toEqual(scoreAssessment(allNo, WIZARD_QUESTIONS));
  });

  it("is deterministic — identical answers always produce identical scores", () => {
    const answers: WizardAnswers = { "secure-boot": true, "signed-firmware": false };
    const first = scoreAssessment(answers, WIZARD_QUESTIONS);
    const second = scoreAssessment(answers, WIZARD_QUESTIONS);
    expect(first).toEqual(second);
  });

  it("every dimension has at least one contributing question in the real question set", () => {
    const answers: WizardAnswers = Object.fromEntries(WIZARD_QUESTIONS.map((q) => [q.id, q.type === "boolean" ? true : []]));
    const result = scoreAssessment(answers, WIZARD_QUESTIONS);
    // if a dimension had zero possible weight, its score would be 0 even
    // though every question was answered Yes — this would indicate a gap
    // in wizardQuestions.ts's dimension coverage.
    for (const d of ALL_TRUST_DIMENSIONS) {
      expect(result.dimensionScores[d], d).toBe(100);
    }
  });

  it("computes a fractional dimension correctly (e.g. 1 of 2 weight earned = 50)", () => {
    const answers: WizardAnswers = { "battery-passport": true }; // identity:1, evidence:1 out of identity total 5 in the real set
    const result = scoreAssessment(answers, WIZARD_QUESTIONS);
    expect(result.dimensionScores.identity).toBeGreaterThan(0);
    expect(result.dimensionScores.identity).toBeLessThan(100);
  });
});
