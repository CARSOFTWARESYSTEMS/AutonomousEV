// The message checker: flags restricted claims in a draft before anyone sends it.

export interface ClaimRule {
  id: string;
  pattern: RegExp;
  /** A sentence that also matches this is a disclaimer, not a claim ("GD&T recognition is on the roadmap"). */
  unless?: RegExp;
  problem: string;
  instead: string;
}

const DISCLAIMS = /\b(roadmap|not available|coming soon|planned|needs? (product|security) (team )?confirmation|not (yet )?(supported|confirmed))\b/i;

export const CLAIM_RULES: readonly ClaimRule[] = [
  {
    id: "compliance",
    pattern: /\b(guarantee[sd]?|ensures?|100\s*%)\b[^.]{0,40}\b(complian\w*|conform\w*)|\b(as\s?9102|aerospace)[^.]{0,20}\bcomplian\w*|\bfully\s+complian\w*/i,
    problem: "Compliance cannot be guaranteed by software. AS9102 complements customer and regulatory requirements.",
    instead: "Designed to support workflows used in preparing and documenting First Article Inspection.",
  },
  {
    id: "certification",
    pattern: /\b(get|gets|getting|guarantee\w*)\b[^.]{0,30}\b(certified|certification)\b|\bcertif\w*\s+guarantee\w*/i,
    problem: "Certification is granted by certification bodies and customers, not by a tool.",
    instead: "Helps keep characteristic records organised for review.",
  },
  {
    id: "guarantee",
    pattern: /\bguarantee\w*\b/i,
    problem: "Nothing in this programme may be guaranteed: savings, outcomes or results.",
    instead: "Describe what you will measure together instead.",
  },
  {
    id: "savings",
    pattern: /\b(save|saves|saving|cut|cuts|reduce|reduces|reduction)\b[^.]{0,50}\b\d{1,3}\s*%|\b\d{1,3}\s*%\s*(faster|less|fewer|saving|reduction)/i,
    problem: "A percentage saving is a claim that needs measurement on the customer's own work.",
    instead: "We can estimate a range from your inputs and measure it in a pilot.",
  },
  {
    id: "ai-everything",
    pattern: /\bAI\b[^.]{0,30}\b(solves?|automates?|does)\s+(everything|it all|all)\b|\bfully\s+automat\w*|\bautomatic(ally)?\s+(generat\w*|creat\w*)\s+(complete\s+)?(fai|reports?)/i,
    problem: "Ballooning is manual today and OCR extraction is in Beta, reviewed by a person.",
    instead: "Manual ballooning with Beta OCR assistance; every value is reviewed by your team.",
  },
  {
    id: "zero-error",
    pattern: /\b(zero|no)\s+(errors?|mistakes?)\b|\berror[-\s]?free\b|\b100\s*%\s*accura\w*/i,
    problem: "Accuracy claims need measured evidence.",
    instead: "Keeps balloons and the characteristic table linked, so differences are easier to spot.",
  },
  {
    id: "gdt",
    pattern: /\bGD\s?&\s?T\b[^.]{0,30}\b(recogni\w*|detect\w*|extract\w*|pars\w*)|\b(recogni\w*|detect\w*|extract\w*|pars\w*)\b[^.]{0,30}\bGD\s?&\s?T\b/i,
    unless: DISCLAIMS,
    problem: "GD&T recognition is on the product roadmap and not available today.",
    instead: "GD&T recognition is on the roadmap; today characteristics are entered and reviewed by your team.",
  },
  {
    id: "rev-c",
    pattern: /\b(as\s?9102\s?c|rev(ision)?\.?\s*c)\b/i,
    unless: DISCLAIMS,
    problem: "The product FAQ says the Form 3 export follows the Rev B format; Rev C alignment needs product team confirmation.",
    instead: "Exports a Form 3-oriented table; review exported forms against your customer's requirements.",
  },
  {
    id: "price",
    pattern: /(₹|rs\.?|inr|\$|usd)\s?\d|\b\d[\d,]*\s?(per|\/)\s?(user|seat|month|year)\b|\bdiscount\w*/i,
    problem: "Prices and discounts come only from approved commercial policy, after scope is understood.",
    instead: "Let's agree the scope first; I'll share approved commercial options after that.",
  },
];

export interface ClaimFinding {
  rule: ClaimRule;
  match: string;
}

/** Every rule the text breaks, each once, with the words that triggered it. Checked sentence by sentence. */
export function checkClaims(text: string): ClaimFinding[] {
  const sentences = text.split(/(?<=[.!?;])\s+|\n+/).filter((sentence) => sentence.trim());
  const findings: ClaimFinding[] = [];
  for (const rule of CLAIM_RULES) {
    for (const sentence of sentences) {
      const match = rule.pattern.exec(sentence);
      if (match && !rule.unless?.test(sentence)) {
        findings.push({ rule, match: match[0].trim() });
        break;
      }
    }
  }
  // A general "guarantee" adds nothing when a more specific rule already caught it.
  const specific = findings.some((finding) => finding.rule.id === "compliance" || finding.rule.id === "certification");
  return specific ? findings.filter((finding) => finding.rule.id !== "guarantee") : findings;
}
