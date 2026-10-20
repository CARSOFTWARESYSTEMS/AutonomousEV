/**
 * The evidence registry: every technical or company claim the microsite makes
 * about APEX, where it comes from, and the words it may be said in.
 *
 * A claim reaches the page only through `approvedWording`, and only when
 * `publish` is true. Claims APEX publishes but whose basis is not stated
 * (a measured value or a design target?) are recorded with `publish: false`
 * until APEX confirms them. The prohibited phrases are checked against the
 * rendered pages by src/components/apex/claims.test.tsx.
 */
import { APEX_OFFICIAL_PAGES } from "./site";

export type EvidenceStatus =
  | "CONFIRMED_PUBLIC"
  | "OWNER_CONFIRMED"
  | "ACTIVE"
  | "PLANNED"
  | "CONCEPT"
  | "UNVERIFIED";

/** The six maturity labels a visitor sees. Never blurred together. */
export type DisplayStatus = "BUILT" | "ACTIVE" | "PLANNED" | "CONCEPT" | "PARTNER_REQUIRED" | "EVIDENCE_REQUIRED";

export const DISPLAY_STATUS_LABEL: Record<DisplayStatus, string> = {
  BUILT: "Built",
  ACTIVE: "Active",
  PLANNED: "Planned",
  CONCEPT: "Concept",
  PARTNER_REQUIRED: "Partner Required",
  EVIDENCE_REQUIRED: "Evidence Required",
};

export const DISPLAY_STATUS_MEANING: Record<DisplayStatus, string> = {
  BUILT: "Confirmed physical hardware exists.",
  ACTIVE: "Confirmed current development activity.",
  PLANNED: "Future work confirmed by APEX.",
  CONCEPT: "Proposed architecture or approach; not yet built or confirmed.",
  PARTNER_REQUIRED: "Capability identified; partner not finalised.",
  EVIDENCE_REQUIRED: "A stronger status cannot be published yet.",
};

export interface EvidenceRecord {
  id: string;
  claim: string;
  status: EvidenceStatus;
  display: DisplayStatus;
  /** Where the claim was read, or "owner-brief" for information APEX supplied for this concept experience. */
  source: string;
  sourceLabel: string;
  approvedWording: string;
  prohibitedWording: string[];
  /** False: recorded so it is not lost, but not shown until APEX confirms it. */
  publish: boolean;
  /** False for company facts (such as the founders) that are not engineering evidence. */
  engineeringEvidence?: boolean;
  ownerConfirmationRequired: boolean;
  note?: string;
}

/** Phrases no APEX page may contain unless an approved record says otherwise. */
export const GLOBAL_PROHIBITED_PHRASES = [
  "flight qualified",
  "flight-qualified",
  "launch ready",
  "launch-ready",
  "successfully hot fired",
  "successfully hot-fired",
  "hot-fire validated",
  "cold-flow validated",
  "operational launch vehicle",
  "orbital capability",
  "certified",
  "qualification complete",
  "official technology partner",
  "revolutionary",
  "game-changing",
  "world's first",
  "world’s first",
] as const;

const PERFORMANCE_PROHIBITED = [
  "successfully hot-fired",
  "flight-qualified",
  "operational",
  "launch-ready",
];

export const EVIDENCE: readonly EvidenceRecord[] = [
  {
    id: "engine-demonstrator-built",
    claim: "5 kN-class gas-generator-cycle liquid-engine demonstrator has been built",
    status: "CONFIRMED_PUBLIC",
    display: "BUILT",
    source: APEX_OFFICIAL_PAGES.home,
    sourceLabel: "apexrocketsystems.com — Home",
    approvedWording:
      "APEX Rocket Systems has built a 5 kN-class gas-generator-cycle liquid-engine demonstrator as part of its propulsion-development program.",
    prohibitedWording: PERFORMANCE_PROHIBITED,
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "engine-thrust-class",
    claim: "Thrust class: 5 kN",
    status: "CONFIRMED_PUBLIC",
    display: "BUILT",
    source: APEX_OFFICIAL_PAGES.hardware,
    sourceLabel: "apexrocketsystems.com — Hardware",
    approvedWording: "5 kN class",
    prohibitedWording: ["5 kN measured thrust", "5 kN demonstrated"],
    publish: true,
    ownerConfirmationRequired: false,
    note: "A class, not a measured value.",
  },
  {
    id: "engine-cycle",
    claim: "Engine cycle: single-shaft gas generator",
    status: "CONFIRMED_PUBLIC",
    display: "BUILT",
    source: APEX_OFFICIAL_PAGES.hardware,
    sourceLabel: "apexrocketsystems.com — Hardware",
    approvedWording: "Single-shaft gas-generator cycle",
    prohibitedWording: [],
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "engine-cooling",
    claim: "Cooling system: regenerative cooling",
    status: "CONFIRMED_PUBLIC",
    display: "BUILT",
    source: APEX_OFFICIAL_PAGES.hardware,
    sourceLabel: "apexrocketsystems.com — Hardware",
    approvedWording: "Regenerative cooling",
    prohibitedWording: [],
    publish: true,
    ownerConfirmationRequired: false,
    note: "Published as the demonstrator's architecture. Thermal performance is not claimed.",
  },
  {
    id: "engine-ignition",
    claim: "Ignition system: spark-augmented igniter",
    status: "CONFIRMED_PUBLIC",
    display: "BUILT",
    source: APEX_OFFICIAL_PAGES.hardware,
    sourceLabel: "apexrocketsystems.com — Hardware",
    approvedWording: "Spark-augmented ignition",
    prohibitedWording: [],
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "engine-control",
    claim: "Engine control: integrated electronic control unit (ECU)",
    status: "CONFIRMED_PUBLIC",
    display: "BUILT",
    source: APEX_OFFICIAL_PAGES.hardware,
    sourceLabel: "apexrocketsystems.com — Hardware",
    approvedWording: "Integrated electronic control unit (ECU)",
    prohibitedWording: [],
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "engine-development-status",
    claim: "Development status: prototype / technology demonstrator",
    status: "CONFIRMED_PUBLIC",
    display: "BUILT",
    source: APEX_OFFICIAL_PAGES.hardware,
    sourceLabel: "apexrocketsystems.com — Hardware",
    approvedWording: "Prototype / technology demonstrator",
    prohibitedWording: ["production engine", "flight engine"],
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "engine-development-platform",
    claim: "The current prototype serves as a development platform",
    status: "CONFIRMED_PUBLIC",
    display: "ACTIVE",
    source: APEX_OFFICIAL_PAGES.hardware,
    sourceLabel: "apexrocketsystems.com — Hardware",
    approvedWording: "The current prototype serves as APEX's propulsion development platform.",
    prohibitedWording: [],
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "engine-throttle-planned",
    claim: "Active throttle control: planned future development",
    status: "PLANNED",
    display: "PLANNED",
    source: APEX_OFFICIAL_PAGES.hardware,
    sourceLabel: "apexrocketsystems.com — Hardware",
    approvedWording: "Active throttle control is planned future development.",
    prohibitedWording: ["throttleable engine", "throttle demonstrated"],
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "engine-refinement-planned",
    claim: "Future development includes refinement of engine performance and engine control systems",
    status: "PLANNED",
    display: "PLANNED",
    source: APEX_OFFICIAL_PAGES.hardware,
    sourceLabel: "apexrocketsystems.com — Hardware",
    approvedWording: "Future development includes refinement of engine performance and engine control systems.",
    prohibitedWording: [],
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "engine-specific-impulse",
    claim: "Specific impulse value listed on the APEX Hardware page",
    status: "UNVERIFIED",
    display: "EVIDENCE_REQUIRED",
    source: APEX_OFFICIAL_PAGES.hardware,
    sourceLabel: "apexrocketsystems.com — Hardware",
    approvedWording: "Further published specifications are available on APEX's Hardware page.",
    prohibitedWording: ["measured specific impulse", "demonstrated specific impulse"],
    publish: false,
    ownerConfirmationRequired: true,
    note: "Listed by APEX without saying whether it is measured or a design target. Not reproduced here until APEX confirms the basis.",
  },
  {
    id: "engine-restart",
    claim: "Restart capability listed on the APEX Hardware page",
    status: "UNVERIFIED",
    display: "EVIDENCE_REQUIRED",
    source: APEX_OFFICIAL_PAGES.hardware,
    sourceLabel: "apexrocketsystems.com — Hardware",
    approvedWording: "Further published specifications are available on APEX's Hardware page.",
    prohibitedWording: ["restart demonstrated", "multiple restarts demonstrated"],
    publish: false,
    ownerConfirmationRequired: true,
    note: "A capability that implies testing. Not reproduced until APEX confirms whether it is demonstrated or designed for.",
  },
  {
    id: "hot-fire",
    claim: "Hot-fire testing",
    status: "UNVERIFIED",
    display: "EVIDENCE_REQUIRED",
    source: "owner-brief",
    sourceLabel: "Not published",
    approvedWording: "Engine test evidence: owner confirmation required.",
    prohibitedWording: ["successfully hot-fired", "hot-fire validated", "cold-flow validated"],
    publish: true,
    ownerConfirmationRequired: true,
  },
  {
    id: "flight-qualification",
    claim: "Flight qualification",
    status: "UNVERIFIED",
    display: "EVIDENCE_REQUIRED",
    source: "owner-brief",
    sourceLabel: "Not published",
    approvedWording: "No qualification status is claimed.",
    prohibitedWording: ["flight-qualified", "qualification complete", "launch-ready"],
    publish: true,
    ownerConfirmationRequired: true,
  },
  {
    id: "rapid-development",
    claim: "APEX moves from engineering design to physical hardware in as little as two months",
    status: "CONFIRMED_PUBLIC",
    display: "ACTIVE",
    source: APEX_OFFICIAL_PAGES.developmentTesting,
    sourceLabel: "apexrocketsystems.com — Development & Testing",
    approvedWording: "APEX states that it moves from engineering design to physical hardware in as little as two months.",
    prohibitedWording: [],
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "manufacturing-approach",
    claim: "Conventional, accessible manufacturing processes: CNC tube bending, orbital TIG welding, induction brazing",
    status: "CONFIRMED_PUBLIC",
    display: "ACTIVE",
    source: APEX_OFFICIAL_PAGES.developmentTesting,
    sourceLabel: "apexrocketsystems.com — Development & Testing",
    approvedWording:
      "APEX's published approach relies on conventional, accessible manufacturing processes, including CNC tube bending, orbital TIG welding and induction brazing.",
    prohibitedWording: [],
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "no-metal-am-dependence",
    claim: "Deliberately avoids dependence on metal additive manufacturing",
    status: "CONFIRMED_PUBLIC",
    display: "ACTIVE",
    source: APEX_OFFICIAL_PAGES.developmentTesting,
    sourceLabel: "apexrocketsystems.com — Development & Testing",
    approvedWording:
      "APEX deliberately avoids dependence on metal additive manufacturing, imported metal powders and proprietary production infrastructure.",
    prohibitedWording: [],
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "built-for-iteration",
    claim: "A manufacturing-led development process built around speed, iteration and control over design and production",
    status: "CONFIRMED_PUBLIC",
    display: "ACTIVE",
    source: APEX_OFFICIAL_PAGES.developmentTesting,
    sourceLabel: "apexrocketsystems.com — Development & Testing",
    approvedWording:
      "APEX describes a manufacturing-led development process built around speed, iteration and greater control over how its hardware is designed and produced.",
    prohibitedWording: [],
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "vision-foundation",
    claim: "Building the foundation for affordable, reliable launch systems",
    status: "CONFIRMED_PUBLIC",
    display: "ACTIVE",
    source: APEX_OFFICIAL_PAGES.home,
    sourceLabel: "apexrocketsystems.com — Home",
    approvedWording: "APEX is building the foundation for affordable, reliable launch systems through hands-on engineering, hardware development and continuous iteration.",
    prohibitedWording: [],
    publish: true,
    ownerConfirmationRequired: false,
    engineeringEvidence: false,
  },
  {
    id: "vision-access",
    claim: "The prototype as a step toward making access to space more accessible",
    status: "CONFIRMED_PUBLIC",
    display: "PLANNED",
    source: APEX_OFFICIAL_PAGES.home,
    sourceLabel: "apexrocketsystems.com — Home",
    approvedWording: "APEX describes its prototype as a step toward a broader vision of making access to space more accessible.",
    prohibitedWording: [],
    publish: true,
    ownerConfirmationRequired: false,
    engineeringEvidence: false,
  },
  {
    id: "company-focus",
    claim: "Aerospace development company focused on small and medium-lift launch vehicles",
    status: "CONFIRMED_PUBLIC",
    display: "PLANNED",
    source: APEX_OFFICIAL_PAGES.about,
    sourceLabel: "apexrocketsystems.com — About",
    approvedWording:
      "APEX describes itself as an aerospace development company focused on the development of small- and medium-lift launch vehicles, through hardware-first and manufacturability-driven design.",
    prohibitedWording: ["launch vehicle in operation", "payload capacity"],
    publish: true,
    ownerConfirmationRequired: false,
  },
  {
    id: "founders",
    claim: "Founders: Vibbhav Gopaal and Arcchit Gopaal",
    status: "OWNER_CONFIRMED",
    display: "BUILT",
    source: "owner-brief",
    sourceLabel: "Supplied by APEX",
    approvedWording: "Founders: Vibbhav Gopaal and Arcchit Gopaal.",
    prohibitedWording: [],
    publish: true,
    engineeringEvidence: false,
    ownerConfirmationRequired: false,
    note: "Titles, education and past employers are not published until supplied.",
  },
  {
    id: "partner-relationships",
    claim: "Ecosystem partner relationships",
    status: "CONCEPT",
    display: "CONCEPT",
    source: "owner-brief",
    sourceLabel: "Engineering collaboration",
    approvedWording:
      "APEX Rocket Systems and Gamyaa AeroSystems are working together in an engineering collaboration. Other organisations shown are proposed capability partners unless otherwise confirmed.",
    prohibitedWording: ["official technology partner", "strategic partner of APEX", "joint venture", "strategic alliance", "exclusive partner"],
    publish: true,
    ownerConfirmationRequired: true,
  },
  {
    id: "apex-digital-twin",
    claim: "APEX engine Digital Twin",
    status: "CONCEPT",
    display: "CONCEPT",
    source: "owner-brief",
    sourceLabel: "Concept experience",
    approvedWording: "Proposed Digital Twin approach. No maturity level is claimed.",
    prohibitedWording: ["validated digital twin", "operational digital twin"],
    publish: true,
    ownerConfirmationRequired: true,
  },
  {
    id: "review-gates",
    claim: "Engineering review gates",
    status: "CONCEPT",
    display: "CONCEPT",
    source: "owner-brief",
    sourceLabel: "Concept experience",
    approvedWording: "Review gates are shown as process concepts. Completion is not claimed.",
    prohibitedWording: ["PDR complete", "CDR complete", "passed CDR"],
    publish: true,
    ownerConfirmationRequired: true,
  },
];

export function evidence(id: string): EvidenceRecord {
  const record = EVIDENCE.find((item) => item.id === id);
  if (!record) throw new Error(`Unknown APEX evidence record: ${id}`);
  return record;
}

/** The published architecture of the demonstrator, in display order. */
export const ENGINE_PUBLISHED_SPEC: readonly { label: string; evidenceId: string }[] = [
  { label: "Thrust class", evidenceId: "engine-thrust-class" },
  { label: "Engine cycle", evidenceId: "engine-cycle" },
  { label: "Cooling", evidenceId: "engine-cooling" },
  { label: "Ignition", evidenceId: "engine-ignition" },
  { label: "Engine control", evidenceId: "engine-control" },
  { label: "Development status", evidenceId: "engine-development-status" },
  { label: "Active throttle control", evidenceId: "engine-throttle-planned" },
];
