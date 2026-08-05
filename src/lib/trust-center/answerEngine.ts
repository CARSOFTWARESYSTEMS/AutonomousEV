import type {
  GroundedTrustAnswer,
  TrustAnswerEngine,
  TrustSearchResult,
} from "./types";

const INSUFFICIENT_EVIDENCE_MESSAGE =
  "The Trust Center does not currently contain enough verified information to answer that question.";

/**
 * Deterministic, non-generative answer engine. This is keyword search, not
 * an LLM — the UI must label results "Trust Center Search", never
 * "AI-generated". See docs/trust-center.md for the Phase 2 RAG architecture
 * this interface is designed to support without changing the contract.
 */
export class DeterministicTrustAnswerEngine implements TrustAnswerEngine {
  async answer(_question: string, evidence: TrustSearchResult[]): Promise<GroundedTrustAnswer> {
    const strongEvidence = evidence.filter((e) => e.score >= 4);

    if (strongEvidence.length === 0) {
      return {
        answer: INSUFFICIENT_EVIDENCE_MESSAGE,
        confidence: "low",
        citations: [],
        insufficientEvidence: true,
      };
    }

    const top = strongEvidence.slice(0, 5);
    const sourceLabels = Array.from(new Set(top.map((r) => r.item.sourceLabel)));
    const answer = `Found ${top.length} related item${top.length === 1 ? "" : "s"} from ${sourceLabels.join(
      ", "
    )}. Review the evidence below for the exact source text and verification status.`;

    return {
      answer,
      confidence: top.length >= 3 ? "high" : "medium",
      citations: top.map((r) => ({
        contentId: r.item.id,
        sourceLabel: r.item.sourceLabel,
        sourceUrl: r.item.sourceUrl,
      })),
      insufficientEvidence: false,
    };
  }
}

export { INSUFFICIENT_EVIDENCE_MESSAGE };
