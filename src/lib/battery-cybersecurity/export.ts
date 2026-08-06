import type { StudioResult } from "./types";

/** Pure string builder — no DOM/Blob APIs here so it is trivially unit-testable. */
export function buildJsonExport(result: StudioResult): string {
  return JSON.stringify(result, null, 2);
}

/** Pure string builder producing a deterministic Markdown summary. */
export function buildMarkdownExport(result: StudioResult): string {
  if (!result.valid) {
    return `# Threat-Modelling Studio Result\n\n**Invalid selection:** ${result.validationMessage ?? "Unknown error."}\n`;
  }

  const lines: string[] = [];
  lines.push("# Threat-Modelling Studio Result");
  lines.push("");
  lines.push(`**Consequence severity:** ${result.consequenceSeverity}`);
  lines.push(`**Evidence status:** ${result.evidenceStatus}`);
  lines.push("");
  lines.push("## Narrative");
  lines.push(result.consequenceNarrative);
  lines.push("");
  lines.push("## Propagation Path");
  for (const step of result.propagationPath) {
    lines.push(`- **${step.componentName}** — ${step.trustState} — ${step.rationale}`);
  }
  lines.push("");
  lines.push("## Recommended Detection Controls");
  for (const control of result.recommendedDetectionControls) {
    lines.push(`- **${control.name}** (${control.layer}, ${control.evidenceStatus}) — ${control.description}`);
  }
  lines.push("");
  lines.push("## Recommended Mitigation Controls");
  for (const control of result.recommendedMitigationControls) {
    lines.push(`- **${control.name}** (${control.layer}, ${control.evidenceStatus}) — ${control.description}`);
  }
  lines.push("");
  lines.push("## Residual Risk");
  lines.push(result.residualRiskNote);
  lines.push("");

  return lines.join("\n");
}
