// Regenerates docs/wireless-ev-charging-digital-twin/{FEATURE_COVERAGE,MODEL_REGISTRY}.md and the generated
// SMART_PARKING_* files (traceability, evidence matrix, model registry, state machine) from the registries.
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
// Requirement → architecture → model → implementation → test → evidence → status → limitation.
const ARCH: Record<string, string> = {
  Shelter: "Physical structure (HARDWARE_PLAN §1); 3D scene layer",
  Sensing: "Edge: sensor nodes → MQTT → gateway ingestion → fusion (IOT_ARCHITECTURE §1–§5)",
  IoT: "Device layer and MQTT gateway (IOT_ARCHITECTURE)",
  Access: "Edge: local barrier controller and interlock (ARCHITECTURE §7; IOT_ARCHITECTURE §6)",
  Identification: "Edge: recognition pipeline and access decision (AI_MODELS §1)",
  Allocation: "Edge: allocation engine and atomic reservation (ARCHITECTURE §2)",
  Billing: "Edge ledgers → cloud reporting (ARCHITECTURE §7)",
  Edge: "Edge gateway (ARCHITECTURE §7)",
  Cloud: "Cloud data platform, store and forward (ARCHITECTURE §7)",
  Analytics: "Edge or cloud analytics (AI_MODELS §3–§4)",
  Environment: "Local safety controller and actuators (HARDWARE_PLAN §8)",
  Energy: "Facility energy dispatch and ledger (ARCHITECTURE §2)",
  Guidance: "Local displays driven by the gateway (HARDWARE_PLAN §2)",
  Interfaces: "Driver, operator and laboratory interfaces (ARCHITECTURE §7)",
  Prototype: "Six-bay POC hardware (POC_BOM; HARDWARE_PLAN)",
  Verification: "Test architecture (TEST_PLAN)",
  Research: "Research layer (experiments.ts, research.ts)",
  Charging: "Parking ↔ Station session adapter (CHARGING_INTEGRATION)",
  Layout: "Facility model (layout.ts)",
  Visualisation: "3D scene layer (THREE_D_ARCHITECTURE)",
  Science: "Engine models (MODEL_REGISTRY)",
  Architecture: "Platform architecture (ARCHITECTURE)",
  Integration: "Hardware adapters and data modes (HARDWARE_INTEGRATION_SPEC)",
  Internationalisation: "Regional configuration (INTERNATIONALIZATION)",
  Interoperability: "External interfaces (INTERNATIONALIZATION §4)",
  Programme: "Programme data (programme.ts)",
  Governance: "Private records outside the repository",
  Deployment: "Deployment process (HARDWARE_PLAN §3, §9; TEST_PLAN §6)",
};
const LIMIT: Record<string, string> = {
  "SP-R01": "Representative geometry; no structural design or assessment",
  "SP-R02": "No weathering or ingress model",
  "SP-R08": "Recognition simulated by a declared error model; no images processed",
  "SP-R09": "No trained model runs; accuracy unmeasured",
  "SP-R12": "Format validation only; accuracy unmeasured",
  "SP-R15": "Simulated broker; integrity tag is not cryptography; no real TLS",
  "SP-R16": "Gateway behaviour simulated; no edge hardware",
  "SP-R17": "No cloud platform built",
  "SP-R18": "No server database or API for parking",
  "SP-R19": "Baselines on synthetic history; no learned model",
  "SP-R20": "Rules and robust statistics only; energy-consumption anomaly defined but not raised",
  "SP-R21": "Simulated sources; prototype sensors are not life-safety devices",
  "SP-R27": "Simulated providers; no payment processed",
  "SP-R33": "Simulated payment; no credentials collected",
  "SP-R36": "Nothing procured or built",
  "SP-R37": "Software verification only; no physical tests",
  "SP-E05": "Each bay's Station is the twin's model; no charger hardware",
  "SP-E10": "Architecture only; single site simulated",
  "SP-E11": "zh-CN declared but interface not translated",
  "SP-E12": "Interfaces only; hardware modes blocked",
  "SP-S03": "Cloud recognition outage not modelled",
  "SP-S08": "Synthetic demand and declared behaviour; no motion or aisle congestion in the research model",
  "SP-S09": "Server HTML shows the neutral loading state until the client resolves the link",
  "SP-S10": "Specification only; no hardware connected",
  "SP-X02": "No retention or residency enforced",
  "SP-P02": "Not built; geometric scale is not electromagnetic similarity",
};
const capability = (r: (typeof REQUIREMENTS)[number]) =>
  r.status === "Planned" ? "Missing (planned)" : r.status === "Blocked" ? "Blocked (external approval)" : r.status === "Designed" ? "Design only" : r.physical === "Not applicable" ? "Implemented (software)" : "Simulated only";
const defaultLimit = (r: (typeof REQUIREMENTS)[number]) =>
  r.status === "Designed" ? "Specification only; not built" : r.status === "Planned" ? "Not started" : r.status === "Blocked" ? "Needs separate approved integrations" : r.tests.length === 0 ? "No dedicated automated check" : "Verified in simulation only";
const ev = [
  "# Smart Parking — requirement-to-evidence matrix",
  "",
  "Generated by `scripts/wireless-twin-docs.mts` from `src/lib/wireless-charging/smart-parking/requirements.ts`.",
  "",
  "**Chain:** requirement → architecture → model → implementation → test → evidence → status → limitation.",
  "",
  "**Capability classes:**",
  "",
  "- *Implemented (software)*: a software capability, complete in this application.",
  "- *Simulated only*: works in the simulation; nothing physical exists.",
  "- *Design only*: specified, not built.",
  "- *Missing (planned)*: not started.",
  "- *Blocked*: needs external approval.",
  "",
  "**None is experimentally validated.** No physical measurement exists, so every requirement is experimentally unvalidated. The evidence column cites only software evidence that exists.",
  "",
  `Capability classes: ${Object.entries(REQUIREMENTS.reduce<Record<string, number>>((a, r) => ((a[capability(r)] = (a[capability(r)] ?? 0) + 1), a), {})).map(([k, v]) => `${k} ${v}`).join(" · ")} · Experimentally validated 0`,
  "",
  "| ID | Requirement | Architecture | Model | Implementation | Test | Evidence | Status | Capability | Limitation |",
  "|---|---|---|---|---|---|---|---|---|---|",
  ...REQUIREMENTS.map((r) => `| ${r.id} | ${esc(r.text)} | ${esc(ARCH[r.subsystem] ?? r.subsystem)} | ${r.models.join(", ") || "—"} | ${esc(r.software)} | ${r.tests.join(", ") || "—"} | ${esc(r.evidence)} | ${r.status} | ${capability(r)} | ${esc(LIMIT[r.id] ?? defaultLimit(r))} |`),
  "",
];
writeFileSync(`${dir}/SMART_PARKING_EVIDENCE_MATRIX.md`, ev.join("\n"));
console.log("ok", FEATURES.length, MODELS.length, REQUIREMENTS.length, NORMAL_LIFECYCLE.length);
