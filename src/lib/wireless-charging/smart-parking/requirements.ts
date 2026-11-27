// Requirements traceability for environment 01 (Smart Parking & Wireless EV
// Charging). Requirement → model → implementation → test → evidence →
// status, classified by origin. The baseline functional requirements
// (SP-R01…SP-R38) are kept verbatim in meaning and none is omitted; the
// EV.ENGINEER™ extensions (SP-E) and the scalability, POC, commercial and
// supplementary items are separate. Status is deliberately conservative:
// nothing physical has been built, so every physical deployment status is
// "Not started" and nothing is experimentally validated.
// Self-contained (type-only imports) so the documentation generator can read it.
import type { ValidationStatus } from "../registry";

export type RequirementClass = "Original functional requirement" | "EV.ENGINEER™ engineering enhancement" | "International scalability extension" | "Physical POC requirement" | "Future commercial deployment requirement";

export type PhysicalStatus = "Not started" | "Planned" | "Not applicable";

export interface Requirement {
  id: string;
  text: string;
  cls: RequirementClass;
  subsystem: string;
  hardware: string;
  software: string;
  models: string[];
  /** Where it is seen in the 3D environment, or "—". */
  visualization: string;
  status: ValidationStatus;
  /** Verification checks (SP-…) or test files. */
  tests: string[];
  evidence: string;
  physical: PhysicalStatus;
}

const O = "Original functional requirement" as const;
const E = "EV.ENGINEER™ engineering enhancement" as const;
const X = "International scalability extension" as const;
const P = "Physical POC requirement" as const;
const C = "Future commercial deployment requirement" as const;

const r = (id: string, text: string, cls: RequirementClass, subsystem: string, hardware: string, software: string, models: string[], visualization: string, status: ValidationStatus, tests: string[], evidence: string, physical: PhysicalStatus = "Not started"): Requirement => ({ id, text, cls, subsystem, hardware, software, models, visualization, status, tests, evidence, physical });

const ENG = "src/lib/wireless-charging/smart-parking";
const SCN = "src/components/wireless-ev-twin/three/smart-parking";

export const REQUIREMENTS: readonly Requirement[] = [
  r("SP-R01", "Physical smart parking shelter with structural arrangements", O, "Shelter", "Steel frame, canopy, foundations", `${SCN}/Shelter.tsx`, ["SP-MATH-007"], "Shelter, columns, beams, purlins; Shelter view and cutaway", "Implemented", [], "3D model and SMART_PARKING_HARDWARE_PLAN.md; representative dimensions, no structural assessment"),
  r("SP-R02", "Protection from sunlight, rain and dust", O, "Shelter", "Roof, gutters, overhangs", `${ENG}/environment.ts`, ["SP-MATH-007"], "Roof overhang, gutters; rain scenario", "Implemented", ["SP-A04"], "Solar gain and rain in the thermal model; protection is geometric (no weathering model)"),
  r("SP-R03", "IoT-based vehicle detection", O, "Sensing", "Presence loop, IR beams, ESP32 nodes", `${ENG}/facility.ts · detect`, ["SP-CTRL-002", "SP-MATH-003"], "Presence detectors at the gates", "Tested", ["SP-B01", "SP-B19"], "One detection event opens one session"),
  r("SP-R04", "Real-time parking bay occupancy monitoring", O, "Sensing", "Ultrasonic, IR, row cameras", `${ENG}/occupancy.ts`, ["SP-MATH-003"], "Bay indicators, Occupancy view", "Tested", ["SP-A08", "SP-B06", "SP-B18"], "Fused bay states twice a second"),
  r("SP-R05", "Embedded sensor controllers", O, "IoT", "ESP32-class nodes", `${ENG}/occupancy.ts · debounce`, ["SP-MATH-003", "SP-MATH-011"], "Nodes on the columns", "Tested", ["SP-A08"], "Node debounce and publishing modelled; firmware plan in SMART_PARKING_IOT_ARCHITECTURE.md"),
  r("SP-R06", "Automated vehicle entry", O, "Access", "Entry barrier, controller", `${ENG}/facility.ts`, ["SP-CTRL-001", "SP-CTRL-002"], "Entry gate and barrier animation", "Tested", ["SP-B01", "SP-B07"], "Detection → identification → authorisation → allocation → barrier"),
  r("SP-R07", "Automated vehicle exit", O, "Access", "Exit barrier, ANPR", `${ENG}/facility.ts · exitFlow`, ["SP-CTRL-002"], "Exit gate", "Tested", ["SP-B15", "SP-B24"], "Exit after billing; safe egress"),
  r("SP-R08", "Camera-based vehicle identification", O, "Identification", "Recognition camera", `${ENG}/identification.ts`, ["SP-AI-001"], "Recognition camera and pipeline panel", "Tested", ["SP-B02"], "SIMULATED recognition with a declared error model"),
  r("SP-R09", "AI-based image processing", O, "Identification", "Edge computer", `${ENG}/identification.ts`, ["SP-AI-001"], "Pipeline stages", "Implemented", ["SP-B02"], "Pipeline and confidence simulated; no inference runs in the web app — model evaluation planned on POC images (SMART_PARKING_AI_MODELS.md)"),
  r("SP-R10", "RFID access", O, "Identification", "RFID reader", `${ENG}/identification.ts · decideAccess`, ["SP-AI-001"], "Reader pedestal", "Tested", ["SP-B02"], "RFID fallback and member access"),
  r("SP-R11", "QR access", O, "Identification", "QR reader", `${ENG}/identification.ts · decideAccess`, ["SP-AI-001"], "Reader pedestal", "Tested", ["SP-B02"], "Reservation QR and visitor tickets"),
  r("SP-R12", "Automatic Number Plate Recognition", O, "Identification", "ANPR camera", `${ENG}/identification.ts, vehicles.ts`, ["SP-AI-001"], "Recognition camera", "Implemented", ["SP-B02"], "Regional formats validated; accuracy not claimed until evaluated"),
  r("SP-R13", "Intelligent parking slot allocation", O, "Allocation", "Edge computer", `${ENG}/allocation.ts`, ["SP-MATH-004"], "Allocation stage, guidance display", "Tested", ["SP-B03", "SP-B04", "SP-B05"], "Five policies with hard constraints"),
  r("SP-R14", "Parking duration tracking", O, "Billing", "—", `${ENG}/billing.ts`, ["SP-MATH-010"], "Session panel", "Tested", ["SP-B16"], "Entry to payment, minute rounding"),
  r("SP-R15", "Secure MQTT communication", O, "IoT", "Broker, nodes, gateway", `${ENG}/telemetry.ts`, ["SP-IOT-001"], "IoT view", "Tested", ["SP-B08", "SP-B19", "SP-B20"], "TLS-required identities, ACLs, integrity tag (simulated), idempotency; no real broker"),
  r("SP-R16", "Edge processing using an appropriate embedded computing platform", O, "Edge", "Raspberry Pi-class gateway", `${ENG}/facility.ts · gateway`, ["SP-IOT-001", "SP-CTRL-001"], "Edge gateway in the enclosure", "Tested", ["SP-B09", "SP-B24"], "Decisions on the gateway; offline operation"),
  r("SP-R17", "Centralized cloud or equivalent data platform", O, "Cloud", "—", "Interfaces only (store and forward)", ["SP-IOT-001"], "—", "Designed", [], "Store-and-forward counter; cloud platform architecture in SMART_PARKING_ARCHITECTURE.md"),
  r("SP-R18", "Database and API services", O, "Cloud", "—", "Session, reservation and ledger records in the simulation", ["SP-SIM-001"], "Operator panel", "Designed", [], "Data model and API outline in SMART_PARKING_ARCHITECTURE.md; no server database for parking yet"),
  r("SP-R19", "Parking demand forecasting", O, "Analytics", "—", `${ENG}/forecast.ts`, ["SP-MATH-006"], "Forecast stage", "Tested", ["SP-A10"], "Deterministic baselines on synthetic history; ML planned"),
  r("SP-R20", "Anomaly detection", O, "Analytics", "—", `${ENG}/facility.ts · anomalies`, ["SP-AI-003"], "Operator anomalies list", "Tested", ["SP-A12", "SP-B06"], "Rules and robust statistics, labelled as such"),
  r("SP-R21", "Smoke, gas and temperature monitoring", O, "Environment", "Prototype smoke, gas, temperature sensors", `${ENG}/environment.ts`, ["SP-MATH-007"], "Environmental equipment, Environment view", "Tested", ["SP-B10"], "Simulated sources only; not life-safety equipment"),
  r("SP-R22", "Ventilation control", O, "Environment", "Jet fans", `${ENG}/environment.ts · fanDemand`, ["SP-MATH-007"], "Fans spin with duty", "Tested", ["SP-B10", "SP-B09"], "Thermal, CO and alarm demand"),
  r("SP-R23", "Solar energy management", O, "Energy", "Canopy PV, inverter", `${ENG}/energy.ts`, ["SP-MATH-008", "SP-MATH-009"], "PV canopy, Energy view", "Tested", ["SP-A05", "SP-A06"], "PV with temperature derating in the dispatch"),
  r("SP-R24", "Battery energy management", O, "Energy", "Battery storage", `${ENG}/energy.ts`, ["SP-MATH-009"], "Storage cabinet", "Tested", ["SP-A06"], "Reserve for essential loads; storage-assisted study"),
  r("SP-R25", "Intelligent lighting management", O, "Environment", "Dimmable LED", `${ENG}/environment.ts`, ["SP-MATH-007"], "Luminaires dim with daylight", "Implemented", [], "Daylight- and activity-linked dimming"),
  r("SP-R26", "Parking fee calculation", O, "Billing", "—", `${ENG}/billing.ts`, ["SP-MATH-010"], "Receipt", "Analytically verified", ["SP-A07", "SP-B17"], "Integer minor units"),
  r("SP-R27", "Payment processing architecture", O, "Billing", "—", `${ENG}/billing.ts · PaymentRecord`, ["SP-MATH-010"], "Driver payment sheet", "Implemented", ["SP-B24"], "Simulated providers only; real processing needs a provider integration"),
  r("SP-R28", "Automated parking barrier", O, "Access", "Barrier drive and boom", `${ENG}/barrier.ts`, ["SP-CTRL-002"], "Animated boom from the controller's angle", "Tested", ["SP-B07"], "Interlock refuses and reverses closing"),
  r("SP-R29", "LED parking guidance displays", O, "Guidance", "LED modules", `${SCN}/Guidance.tsx`, ["SP-MATH-004"], "Entry sign and per-bay symbols", "Implemented", [], "Symbols plus colour (never colour alone)"),
  r("SP-R30", "Alarm actuators", O, "Environment", "Sounder/beacon", `${ENG}/environment.ts`, ["SP-MATH-007"], "Beacons on alarm", "Tested", ["SP-B10"], "Local alarm controller"),
  r("SP-R31", "Fan and lighting actuators", O, "Environment", "Fan and lighting controllers", `${ENG}/environment.ts`, ["SP-MATH-007"], "Fans, luminaires", "Tested", ["SP-B10"], "Duty and level driven by the local controller"),
  r("SP-R32", "Driver reservation interface", O, "Interfaces", "—", "src/components/wireless-ev-twin/env/ParkingPanels.tsx · DriverPanel", ["SP-MATH-004"], "Driver tab", "Implemented", ["SP-B05"], "Book a class and window; conflicts refused"),
  r("SP-R33", "Driver payment interface", O, "Interfaces", "—", "ParkingPanels.tsx · DriverPanel", ["SP-MATH-010"], "Driver tab", "Implemented", [], "Simulated payment and receipt; no credentials collected"),
  r("SP-R34", "Centralized operator dashboard", O, "Interfaces", "—", "ParkingPanels.tsx · OperatorPanel", ["SP-SIM-001"], "Operator tab (compact, beside the 3D scene)", "Implemented", [], "Occupancy, sessions, devices, energy, environment, anomalies, audit"),
  r("SP-R35", "Authorized operator override", O, "Interfaces", "—", `${ENG}/telemetry.ts · checkCommand`, ["SP-IOT-001", "SP-CTRL-002"], "Operator actions", "Tested", ["SP-B08", "SP-B07"], "Role-based, expiring, audited commands that never bypass interlocks"),
  r("SP-R36", "Physical prototype", O, "Prototype", "Six-bay miniature (BOM)", "—", [], "—", "Designed", [], "SMART_PARKING_POC_BOM.md and HARDWARE_PLAN.md; nothing procured", "Planned"),
  r("SP-R37", "Testing and performance evaluation", O, "Verification", "Laboratory instruments", "Vitest, Playwright, in-browser checks", ["SP-SIM-001"], "Engineering Assurance", "Tested", ["SP-B21", "SP-B22", "SP-B23"], "Software verification only; physical test procedures in SMART_PARKING_TEST_PLAN.md"),
  r("SP-R38", "Research documentation and engineering evidence", O, "Research", "—", "docs/wireless-ev-charging-digital-twin/SMART_PARKING_*.md", [], "Research mode", "Implemented", [], "Generated registries and the documentation set"),
  r("SP-E01", "Wireless charging-compatible parking bays", E, "Charging", "Ground pads, cabinets", `${SCN}/Bays.tsx`, ["SP-INT-001"], "Pads in the wireless bays", "Tested", ["SP-B11", "SP-B12"], "Four in the default layout, two in the POC"),
  r("SP-E02", "Conventional parking bays", E, "Layout", "—", `${ENG}/layout.ts`, ["SP-MATH-004"], "Bays", "Tested", ["SP-B03"], "Configurable count"),
  r("SP-E03", "EV charging eligibility verification", E, "Charging", "—", `${ENG}/charging.ts · evaluateEligibility`, ["SP-INT-001"], "Eligibility stage", "Tested", ["SP-B11"], "Seven parking-side checks before the Station's own"),
  r("SP-E04", "Charging-aware parking allocation", E, "Allocation", "—", `${ENG}/allocation.ts`, ["SP-MATH-004"], "Allocation stage", "Tested", ["SP-B03"], "Charging-aware and multi-objective policies"),
  r("SP-E05", "Integration with the existing Station Digital Twin", E, "Charging", "—", `${ENG}/charging.ts; src/components/wireless-ev-twin/state/runtime.ts · handover`, ["SP-INT-001", "WPT-SIM-001"], "Explore Wireless Charging → Station", "Tested", ["SP-B12", "SP-B13", "SP-B15"], "Each wireless bay runs its own Station simulation; the Station environment shows the selected session"),
  r("SP-E06", "Shared battery and energy models", E, "Charging", "—", `${ENG}/charging.ts`, ["WPT-BAT-001", "SP-INT-001"], "—", "Tested", ["SP-B14"], "No duplicate battery or WPT engine"),
  r("SP-E07", "Interactive 3D engineering visualization", E, "Visualisation", "—", SCN, [], "The facility, views and stages", "Implemented", [], "Browser checks in scripts/test-wireless-ev-twin.cjs"),
  r("SP-E08", "Scientific and mathematical parking models", E, "Science", "—", ENG, ["SP-MATH-001", "SP-MATH-002", "SP-MATH-003", "SP-MATH-004", "SP-MATH-007", "SP-MATH-008", "SP-MATH-010"], "Science panel, Physics & Mathematics lesson", "Analytically verified", ["SP-A01", "SP-A02", "SP-A03", "SP-A04", "SP-A05", "SP-A07"], "Model registry entries with equations, units, validity and limitations"),
  r("SP-E09", "Research experiments", E, "Research", "—", `${ENG}/experiments.ts`, ["SP-RES-001"], "Research mode", "Tested", ["SP-A09"], "Ten reproducible studies"),
  r("SP-E10", "Multi-site architecture", E, "Architecture", "—", `${ENG}/telemetry.ts (site-scoped topics and ACLs)`, ["SP-IOT-001"], "—", "Designed", [], "Site-scoped namespace and identities; multi-site cloud is architecture only"),
  r("SP-E11", "Regional deployment adapters", E, "Architecture", "—", `${ENG}/billing.ts, vehicles.ts`, ["SP-MATH-010", "SP-AI-001"], "Region selector", "Implemented", ["SP-A07"], "IN, US and CN plate formats, currencies, locales, time zones, payment adapter names"),
  r("SP-E12", "Secure physical prototype integration", E, "Integration", "—", `${ENG}/adapters.ts`, ["SP-IOT-001"], "Operating-mode selector (hardware modes shown as blocked)", "Designed", ["SP-B08"], "Adapter interfaces; Connected POC mode read-only and blocked until hardware exists"),
  r("SP-X01", "Configurable language, time zone, currency and number plate format per region", X, "Internationalisation", "—", `${ENG}/billing.ts · LOCALES`, ["SP-MATH-010"], "Region selector", "Implemented", ["SP-A07"], "UTC storage, local display"),
  r("SP-X02", "Regional payment, data retention and data residency configuration", X, "Internationalisation", "—", "Configuration interfaces", [], "—", "Designed", [], "SMART_PARKING_INTERNATIONALIZATION.md; no residency is enforced in the simulation"),
  r("SP-X03", "Evaluation of parking data interoperability (APDS) and charging back-end interfaces", X, "Interoperability", "—", "—", [], "—", "Planned", [], "Listed for evaluation; not treated as real-time wireless charging control"),
  r("SP-P01", "Six-bay miniature facility (four conventional, two wireless demonstration bays) within INR 100,000", P, "Prototype", "BOM", "Same logical architecture (POC_LAYOUT)", [], "6-bay preset", "Designed", [], "SMART_PARKING_POC_BOM.md (cost ceilings, not quotations)", "Planned"),
  r("SP-P02", "One isolated low-voltage wireless charging link", P, "Prototype", "LV coil pair, driver", "WirelessChargingAdapter (designed)", ["WPT-SIM-001"], "—", "Designed", [], "Hardware plan; safety plan", "Planned"),
  r("SP-P03", "Hardware-in-the-loop and software-in-the-loop modes", P, "Integration", "POC hardware", `${ENG}/adapters.ts`, [], "Operating-mode selector", "Designed", [], "Simulation (SIL) runs; HIL modes blocked until devices are connected", "Planned"),
  r("SP-C01", "Full-scale pilot shelter with certified electrical, structural and life-safety systems", C, "Deployment", "Full-size infrastructure", "—", [], "—", "Planned", [], "Separate requirements in SMART_PARKING_HARDWARE_PLAN.md; separate estimate", "Not started"),
  r("SP-C02", "Real payment collection and commercial-grade wireless charging", C, "Deployment", "Provider integration, certified charger", "—", [], "—", "Blocked", [], "Requires separate approved integrations", "Not started"),
  r("SP-S01", "Shelter engineering exploration: framework, roof slope, drainage, sun and dust protection, bay dimensions, mounting, cable routing, enclosure, ventilation, lighting, PV, maintenance access", E, "Shelter", "—", `${SCN}/Shelter.tsx`, ["SP-MATH-007"], "Shelter view (cutaway, dimensions)", "Implemented", [], "Representative drawings and specifications in SMART_PARKING_HARDWARE_PLAN.md; no certification claimed"),
  r("SP-S02", "Installation and commissioning workflow with device-to-twin mapping", P, "Deployment", "—", "docs", [], "—", "Designed", [], "SMART_PARKING_HARDWARE_PLAN.md (site survey → validation; device identification scheme)", "Planned"),
  r("SP-S03", "Configurable edge, cloud and hybrid AI deployment; safety-critical control local", E, "Architecture", "—", `${ENG}/identification.ts (deployment latency)`, ["SP-AI-001"], "Engineer inputs", "Implemented", ["SP-B09"], "Placement changes latency; safety interlocks local in every placement"),
  r("SP-S04", "Three independent timelines (workshop, Phases 4A–4I, 24-month physical programme)", E, "Programme", "—", `${ENG}/programme.ts`, [], "Research mode", "Implemented", [], "Programme data with milestones, deliverables, verification criteria and evidence"),
  r("SP-S05", "Research evaluation methods against a manual baseline", E, "Research", "—", `${ENG}/experiments.ts · comparePolicies`, ["SP-RES-001"], "Research mode", "Tested", ["SP-A09"], "Manual baseline in every policy comparison; methods in SMART_PARKING_TEST_PLAN.md"),
  r("SP-S06", "Research governance and intellectual property records (private)", E, "Governance", "—", "docs (template only)", [], "—", "Designed", [], "SMART_PARKING_GOVERNANCE_TEMPLATE.md; nothing confidential in the public application", "Not applicable"),
  r("SP-S07", "Site deployment and demonstration validation plan", C, "Deployment", "—", "docs", [], "—", "Designed", [], "SMART_PARKING_TEST_PLAN.md · deployment validation", "Not started"),
];

export const REQUIREMENT_COUNTS = REQUIREMENTS.reduce<Record<string, number>>((acc, x) => ((acc[x.status] = (acc[x.status] ?? 0) + 1), acc), {});
