// Regenerates docs/wireless-ev-charging-digital-twin/{FEATURE_COVERAGE,MODEL_REGISTRY}.md from the registries.
// Run: node --experimental-strip-types scripts/wireless-twin-docs.mts
import { writeFileSync } from "node:fs";
import { FEATURES, FEATURE_COUNTS } from "../src/lib/wireless-charging/coverage.ts";
import { MODELS, FIDELITY } from "../src/lib/wireless-charging/registry.ts";
import { REQUIREMENTS } from "../src/lib/wireless-charging/smart-parking/requirements.ts";
import { NORMAL_LIFECYCLE, STATES, TRANSITIONS } from "../src/lib/wireless-charging/smart-parking/lifecycle.ts";
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

// ── Environment 01 — Smart Parking ──
const classes = ["Original functional requirement", "EV.ENGINEER™ engineering enhancement", "International scalability extension", "Physical POC requirement", "Future commercial deployment requirement"] as const;
const counts = (key: "status" | "physical") => Object.entries(REQUIREMENTS.reduce<Record<string, number>>((a, r) => ((a[r[key]] = (a[r[key]] ?? 0) + 1), a), {})).map(([k, v]) => `${k} ${v}`).join(" · ");
const trace = [
  "# Smart Parking — requirements traceability",
  "",
  "Generated from `src/lib/wireless-charging/smart-parking/requirements.ts`. Requirement → subsystem → hardware and software dependencies → model → 3D visualisation → implementation status → verification → evidence → physical deployment status. Baseline functional requirements (SP-R01–SP-R38) are kept in full and none is omitted; EV.ENGINEER™ extensions and the scalability, POC, commercial and supplementary items are listed separately. Nothing physical has been built, so no item is physically deployed or experimentally validated.",
  "",
  `Implementation status: ${counts("status")}`,
  "",
  `Physical deployment status: ${counts("physical")}`,
  "",
  ...classes.flatMap((c) => {
    const rows = REQUIREMENTS.filter((r) => r.cls === c);
    if (!rows.length) return [];
    return [
      `## ${c} (${rows.length})`,
      "",
      "| ID | Requirement | Subsystem | Hardware | Software | Model | 3D visualisation | Status | Verification | Evidence | Physical |",
      "|---|---|---|---|---|---|---|---|---|---|---|",
      ...rows.map((r) => `| ${r.id} | ${esc(r.text)} | ${esc(r.subsystem)} | ${esc(r.hardware)} | ${esc(r.software)} | ${r.models.join(", ") || "—"} | ${esc(r.visualization)} | ${r.status} | ${r.tests.join(", ") || "—"} | ${esc(r.evidence)} | ${r.physical} |`),
      "",
    ];
  }),
];
writeFileSync(`${dir}/SMART_PARKING_REQUIREMENTS_TRACEABILITY.md`, trace.join("\n"));
const sp = MODELS.filter((m) => m.id.startsWith("SP-"));
const spReg = [
  "# Smart Parking — model registry",
  "",
  `Generated from \`src/lib/wireless-charging/registry.ts\` (the ${sp.length} SP- models of environment 01, registered beside the twin's own). Smart Parking reuses, rather than duplicates, the existing models it depends on: WPT-SIM-001 (the Station, one instance per wireless bay), WPT-CTRL-001 (its charging state machine and interlocks), WPT-BAT-001 (the battery), WPT-GRID-001 (the daily PV shape), WPT-IOT-001 (the link model) and WPT-AV-001 (the kinematic bicycle).`,
  "",
  "| ID | Model | Domain | Fidelity | Status | Checks | Implementation |",
  "|---|---|---|---|---|---|---|",
  ...sp.map((m) => `| ${m.id} | ${esc(m.name)} | ${esc(m.domain)} | ${m.fidelity} | ${m.status} | ${m.tests.join(", ")} | \`${m.implementation}\` |`),
  "",
  "Each model's equations, SI inputs and outputs, assumptions, validity, numerical method, dependencies and limitations are in MODEL_REGISTRY.md. Validation status: none is experimentally validated — no measurements exist yet.",
  "",
];
writeFileSync(`${dir}/SMART_PARKING_MODEL_REGISTRY.md`, spReg.join("\n"));
const exceptional = (Object.keys(STATES) as (keyof typeof STATES)[]).filter((k) => STATES[k].kind === "exception");
const sm = [
  "# Smart Parking — session state machine (SP-CTRL-001)",
  "",
  "Generated from `src/lib/wireless-charging/smart-parking/lifecycle.ts`. A transition happens only if it is in the table below and its guard holds; any other request is refused and logged on the session (`refused`), never applied. Timers are model quantities (processing times, timeouts, driver actions), never a visual stand-in for a state change. The parking session hands a charging session to the bay's own Station state machine (WPT-CTRL-001), whose 19 phases and 13 abnormal states run unchanged.",
  "",
  `## Normal lifecycle (${NORMAL_LIFECYCLE.length} states)`,
  "",
  "| Step | State | Meaning | May go to |",
  "|---|---|---|---|",
  ...NORMAL_LIFECYCLE.map((k) => `| ${STATES[k].step} | ${STATES[k].label} (\`${k}\`) | ${esc(STATES[k].text)} | ${TRANSITIONS[k].map((t) => `\`${t}\``).join(", ") || "— (final)"} |`),
  "",
  `## Exceptional states (${exceptional.length})`,
  "",
  "| State | Meaning | Recovery | May go to |",
  "|---|---|---|---|",
  ...exceptional.map((k) => `| ${STATES[k].label} (\`${k}\`) | ${esc(STATES[k].text)} | ${esc(STATES[k].recovery ?? "")} | ${TRANSITIONS[k].map((t) => `\`${t}\``).join(", ") || "— (final)"} |`),
  "",
  "## Facility-level conditions that act as guards",
  "",
  "- **Environmental alarm** (simulated smoke or gas, local safety controller): allocation and entry suspended (sessions wait in `environmental-alarm`), exit held open for egress, every Station tripped through its own emergency stop; cleared and acknowledged by an operator, the Stations recover through their own reset.",
  "- **Edge gateway down**: new sessions wait in `gateway-unavailable`; the exit opens on local presence (safe egress); payment falls back to a deferred record by policy.",
  "- **Cloud down / payment service down**: the edge continues (store and forward); payment becomes `payment-pending`, exit allowed on a deferred-payment record by policy.",
  "- **Barrier obstruction**: the barrier interlock refuses or reverses closing; the session may pass through `barrier-obstructed`.",
  "",
];
writeFileSync(`${dir}/SMART_PARKING_STATE_MACHINE.md`, sm.join("\n"));
console.log("ok", FEATURES.length, MODELS.length, REQUIREMENTS.length, NORMAL_LIFECYCLE.length);
