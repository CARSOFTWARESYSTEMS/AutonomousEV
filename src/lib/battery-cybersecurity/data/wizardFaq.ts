import type { FaqItem } from "../types";

// Additive FAQ entries about the Assessment Wizard, merged into FAQ_ITEMS at
// render time (see page.tsx) so they flow through the existing FaqSection +
// FAQPage JSON-LD pipeline without a second schema block.
export const WIZARD_FAQ_ITEMS: FaqItem[] = [
  {
    id: "what-does-the-assessment-wizard-measure",
    question: "What does the Battery Cybersecurity Assessment Wizard measure?",
    answer: "It scores a described battery and energy architecture across 9 trust dimensions — Identity, Integrity, Authenticity, Availability, Safety, Evidence, Resilience, Detection, and Verification — based on answers to a structured set of engineering questions, and generates deterministic, traceable recommendations for each gap.",
  },
  {
    id: "is-wizard-data-uploaded",
    question: "Is my data uploaded anywhere when I use the assessment wizard?",
    answer: "No. The wizard runs entirely in your browser. Answers, scores, and the generated report are never sent to a server, stored in a cookie, or persisted anywhere unless you explicitly export them yourself.",
  },
  {
    id: "how-are-wizard-recommendations-generated",
    question: "How are the wizard's recommendations generated?",
    answer: "Every recommendation comes from a fixed decision table matching a specific answer to a specific, pre-written recommendation — there is no AI generation and no hallucinated content. Each recommendation is traceable to the exact question that triggered it.",
  },
  {
    id: "what-is-the-battery-trust-score",
    question: "What is the Battery Trust Score?",
    answer: "The Battery Trust Score is the wizard's overall result: an average of the 9 trust-dimension scores, each explained individually, giving a single number alongside the detailed breakdown behind it.",
  },
  {
    id: "can-i-export-the-assessment-report",
    question: "Can I export the assessment report?",
    answer: "Yes — as Markdown, JSON, or CSV, generated and downloaded entirely in your browser, or printed directly. PDF export is a planned future addition and is not available yet.",
  },
];
