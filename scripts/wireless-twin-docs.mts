// Regenerates docs/wireless-ev-charging-digital-twin/{FEATURE_COVERAGE,MODEL_REGISTRY}.md from the registries.
// Run: node --experimental-strip-types scripts/wireless-twin-docs.mts
import { writeFileSync } from "node:fs";
import { FEATURES, FEATURE_COUNTS } from "../src/lib/wireless-charging/coverage.ts";
import { MODELS, FIDELITY } from "../src/lib/wireless-charging/registry.ts";
const dir = new URL("../docs/wireless-ev-charging-digital-twin", import.meta.url).pathname;
const esc = (s: string) => s.replace(/\|/g, "\\|");
const cov = [
  "# Feature coverage",
  "",
  "Generated from `src/lib/wireless-charging/coverage.ts` (the same list the Engineering Assurance view shows). Statuses: Planned · Designed · Implemented · Tested · Analytically verified · Experimentally validated · Blocked. Nothing is experimentally validated: no measurements exist yet.",
  "",
  `Counts: ${Object.entries(FEATURE_COUNTS).map(([k, v]) => `${k} ${v}`).join(" · ")}`,
  "",
  "| Area | Feature | Status | Note |",
  "|---|---|---|---|",
  ...FEATURES.map((f) => `| ${f.area} | ${esc(f.feature)} | ${f.status} | ${esc(f.note ?? "")} |`),
  "",
];
writeFileSync(`${dir}/FEATURE_COVERAGE.md`, cov.join("\n"));
const reg = [
  "# Physics and model registry",
  "",
  "Generated from `src/lib/wireless-charging/registry.ts`, the single source the interface, documentation and verification suite read.",
  "",
  "## Fidelity levels",
  "",
  ...Object.entries(FIDELITY).map(([k, v]) => `- **${k} — ${v.name}.** ${v.text}`),
  "",
  ...MODELS.flatMap((m) => [
    `## ${m.id} · ${m.name} (v${m.version})`,
    "",
    `${m.description}`,
    "",
    `- **Domain:** ${m.domain} · **Fidelity:** ${m.fidelity} · **Status:** ${m.status}`,
    `- **Implementation:** \`${m.implementation}\``,
    `- **Equations:**`,
    ...m.equations.map((e) => `  - \`${e}\``),
    `- **Inputs:** ${m.inputs.map((q) => `${q.symbol} — ${q.name} [${q.unit}]`).join("; ")}`,
    `- **Outputs:** ${m.outputs.map((q) => `${q.symbol} — ${q.name} [${q.unit}]`).join("; ")}`,
    `- **Assumptions:** ${m.assumptions.join(" ")}`,
    `- **Validity:** ${m.validity}`,
    `- **Numerical method:** ${m.method}`,
    `- **Depends on:** ${m.dependencies.join(", ") || "—"}`,
    `- **Known limitations:** ${m.limitations.join(" ")}`,
    `- **Verification checks:** ${m.tests.join(", ")}`,
    "",
  ]),
];
writeFileSync(`${dir}/MODEL_REGISTRY.md`, reg.join("\n"));
console.log("ok", FEATURES.length, MODELS.length);
