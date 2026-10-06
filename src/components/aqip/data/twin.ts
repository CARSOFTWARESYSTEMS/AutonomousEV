// The 3D Inspection Twin: the concept, its limits, the synthetic part the
// demonstration uses, and the long-term ideas that build on it. Everything
// here is research or later; none of it describes shipped software.
import type { Maturity } from "../types";

export const TWIN = {
  name: "3D Inspection Twin",
  statement:
    "Transform an uploaded 2D engineering drawing into an AI-assisted interactive 3D reconstruction that helps engineers understand geometry, inspect features, navigate balloons and build quality evidence faster.",
  /** Shown wherever the demonstration's model is on screen. */
  disclaimer: "Illustrative engineering reconstruction. Not authoritative CAD geometry.",
  concept: "Verified 3D reconstruction",
  notConcept: "Automatic true CAD model",
  authority: "The source drawing remains authoritative unless an approved CAD or MBD model is explicitly supplied.",
  visualFai: "FAI should be understandable spatially, not only through tables and PDFs.",
} as const;

/** What a 2D drawing may simply not contain. The reason reconstruction has to be verified. */
export const DRAWING_GAPS = ["Depth", "Hidden geometry", "Internal features", "Draft", "Complex curves", "Surface definition", "Manufacturing intent"] as const;

/** How AQIP is designed to handle geometry it cannot be sure of. */
export const UNCERTAINTY_RULES = ["Show the assumptions", "Show the confidence, and what it is based on", "Highlight unresolved areas", "Request engineer confirmation", "Allow manual correction"] as const;

/** From an uploaded drawing to an inspection twin. `human` marks the steps a person owns. */
export const TWIN_FLOW: readonly { id: string; step: string; items: readonly string[]; human?: boolean }[] = [
  { id: "upload", step: "Upload", items: ["2D PDF", "Image", "Drawing"] },
  { id: "drawing", step: "Drawing intelligence", items: ["Views", "Dimensions", "Tolerances", "GD&T", "Notes", "Feature candidates"] },
  { id: "views", step: "View relationship analysis", items: ["Front", "Top", "Side", "Section", "Detail views"] },
  { id: "inference", step: "Geometry inference", items: ["Extrusions", "Revolutions", "Holes", "Slots", "Pockets", "Bosses", "Chamfers", "Fillets", "Patterns"] },
  { id: "reconstruction", step: "AI-assisted 3D reconstruction", items: ["Geometry candidate", "Not yet verified"] },
  { id: "review", step: "Confidence and assumption review", items: ["Per-feature certainty", "Assumption list", "Unresolved areas"], human: true },
  { id: "verify", step: "Engineer verification", items: ["Confirm", "Edit", "Mark unresolved"], human: true },
  { id: "twin", step: "Interactive 3D Inspection Twin", items: ["Rotate", "Section", "Isolate", "Navigate by balloon"] },
  { id: "evidence", step: "Balloons + characteristics + inspection + evidence", items: ["Balloon ↔ feature", "Measurement", "Evidence", "FAI status"] },
];

export const CAD_FORMATS = ["STEP", "STP", "IGES", "Parasolid", "Native CAD, where supported", "MBD / PMI"] as const;

export const CAD_FLOW = ["2D drawing + 3D CAD", "Align", "Map characteristics", "Map 2D balloons", "Highlight 3D features"] as const;

export type TwinMode = "cad" | "reconstruction";

export const TWIN_MODES: readonly { id: TwinMode; code: string; name: string; summary: string; source: string; points: readonly string[]; maturity: Maturity }[] = [
  {
    id: "cad",
    code: "Mode A",
    name: "Authoritative CAD visualisation",
    summary: "The customer supplies approved 3D geometry. AQIP displays it and maps the drawing's characteristics and balloons onto it.",
    source: "Geometry comes from the customer's approved model. AQIP infers nothing.",
    points: ["Preferred whenever approved CAD or MBD is available", "No geometry is inferred, so there is no confidence score to interpret", "Balloon-to-feature mapping is still verified by a person"],
    maturity: "planned-y23",
  },
  {
    id: "reconstruction",
    code: "Mode B",
    name: "AI-assisted reconstruction from 2D",
    summary: "Only a drawing is available. AQIP proposes a geometry candidate from its views, states its assumptions and waits for an engineer.",
    source: "Geometry is a candidate inferred from the drawing's views. The drawing stays authoritative.",
    points: ["For simple prismatic parts first", "Every assumption and unresolved area is shown", "The model is a navigation aid until an engineer verifies it, and never the engineering definition"],
    maturity: "research",
  },
];

// ── The synthetic part ──

export type FeatureStatus = "pass" | "fail" | "pending" | "evidence-missing" | "revision-impacted" | "not-inspected";

/** The four colour families of the overlay. Each status also has its own icon and wording. */
export type StatusFamily = "ok" | "attention" | "fail" | "none";

export const STATUS: Record<FeatureStatus, { label: string; family: StatusFamily; meaning: string }> = {
  pass: { label: "Pass", family: "ok", meaning: "Measured within tolerance, evidence linked, approved by a person." },
  fail: { label: "Fail · NCR", family: "fail", meaning: "Measured out of tolerance. A nonconformance report is raised." },
  pending: { label: "Pending inspection", family: "attention", meaning: "Planned, not yet measured." },
  "evidence-missing": { label: "Evidence missing", family: "attention", meaning: "A result exists, but a record it depends on is not linked." },
  "revision-impacted": { label: "Revision impacted", family: "attention", meaning: "A newer drawing revision changes this requirement." },
  "not-inspected": { label: "Not yet inspected", family: "none", meaning: "No inspection has started." },
};

export const STATUS_LEGEND: readonly { family: StatusFamily | "selected"; colour: string; label: string }[] = [
  { family: "ok", colour: "Green", label: "Verified / Pass" },
  { family: "attention", colour: "Amber", label: "Pending / Attention" },
  { family: "fail", colour: "Red", label: "Fail / NCR" },
  { family: "selected", colour: "Blue", label: "Selected feature" },
  { family: "none", colour: "Grey", label: "Not yet inspected" },
];

export type Certainty = "confirmed" | "high" | "medium" | "unresolved";

export const CERTAINTY: Record<Certainty, { label: string; weight: number }> = {
  confirmed: { label: "Confirmed", weight: 1 },
  high: { label: "High", weight: 1 },
  medium: { label: "Medium", weight: 0.6 },
  unresolved: { label: "Unresolved", weight: 0 },
};

/** One element of the reconstructed geometry, and how sure the reconstruction is of it. */
export interface GeometryElement {
  id: string;
  name: string;
  primitive: string;
  certainty: Certainty;
  /** What the certainty rests on, in the drawing's own terms. */
  basis: string;
  /** An assumption the reconstruction had to make, if any. */
  assumption?: string;
}

export const GEOMETRY: readonly GeometryElement[] = [
  { id: "g-flange", name: "Base flange", primitive: "Extrusion", certainty: "high", basis: "Front and top views agree on 120 × 80 × 10." },
  { id: "g-web", name: "Upright web", primitive: "Extrusion", certainty: "high", basis: "Front view and Section A-A agree on 12 thick, 50 above the flange." },
  { id: "g-hole-12", name: "Hole depth, balloon 12", primitive: "Hole", certainty: "confirmed", basis: "Confirmed from the section view: the hole passes through the flange." },
  { id: "g-hole-13", name: "Hole, balloon 13", primitive: "Hole · pattern", certainty: "high", basis: "Dimensioned as 2× THRU and mirrored about the centre line." },
  { id: "g-slot", name: "Slot", primitive: "Slot", certainty: "high", basis: "Full-radius ends and a THRU callout in the top view." },
  { id: "g-hole-17", name: "Web hole, balloon 17", primitive: "Hole", certainty: "high", basis: "Front view with a THRU callout." },
  {
    id: "g-pocket",
    name: "Internal pocket",
    primitive: "Pocket",
    certainty: "medium",
    basis: "Depth is given once, on hidden lines in the top view.",
    assumption: "Corner radius is not dimensioned; R3 is assumed. The floor is assumed flat and parallel to the web face.",
  },
  {
    id: "g-chamfer",
    name: "Rear chamfer",
    primitive: "Chamfer",
    certainty: "unresolved",
    basis: "A general note calls for 2 × 45°, but no view shows which edge it applies to.",
    assumption: "Not modelled. The edge is left sharp and flagged for an engineer to resolve.",
  },
];

/**
 * The overall figure, and exactly how it is reached, so it is never shown as a
 * bare number: the mean certainty weight of the geometry elements, rounded
 * down. It guides review effort. It is not a tolerance and not an approval.
 */
export function reconstructionConfidence(elements: readonly GeometryElement[] = GEOMETRY) {
  const total = elements.reduce((sum, element) => sum + CERTAINTY[element.certainty].weight, 0);
  const count = (certainty: Certainty) => elements.filter((element) => element.certainty === certainty).length;
  return {
    percent: Math.floor((total / elements.length) * 100),
    resolved: count("confirmed") + count("high"),
    medium: count("medium"),
    unresolved: count("unresolved"),
    total: elements.length,
  };
}

/** One ballooned characteristic of the synthetic part, with everything Inspection Mode shows. */
export interface TwinFeature {
  id: string;
  balloon: number;
  characteristic: string;
  feature: string;
  requirement: string;
  gdt: string;
  sheet: string;
  zone: string;
  method: string;
  equipment: string;
  measured: string;
  status: FeatureStatus;
  evidence: string;
  verification: string;
  fai: string;
  ctq: boolean;
  /** True when a record this result depends on is linked. */
  evidenceLinked: boolean;
  /** The geometry element it sits on, for the reconstruction's certainty. */
  geometry: string;
  /** What a reviewer should know that the fields above do not say. */
  note?: string;
}

/** The demonstration follows an in-progress first article, so not every result is good. All of it is invented. */
export const TWIN_PART = { part: "AQ-1042", revision: "C", article: "First article FA-001, inspection in progress", shown: "Eight characteristics are shown; a real part of this kind would carry more." } as const;

export const FEATURES: readonly TwinFeature[] = [
  {
    id: "b7",
    balloon: 7,
    characteristic: "AQ-1042-C-007",
    feature: "Overall length",
    requirement: "120.00 ±0.10 mm",
    gdt: "None: a linear dimension",
    sheet: "Sheet 2",
    zone: "Zone A5",
    method: "Digital caliper",
    equipment: "CAL-014 · 0–150 mm caliper · calibration valid",
    measured: "120.04 mm",
    status: "pass",
    evidence: "Linked",
    verification: "Human approved",
    fai: "Accounted for · Pass",
    ctq: false,
    evidenceLinked: true,
    geometry: "g-flange",
  },
  {
    id: "b9",
    balloon: 9,
    characteristic: "AQ-1042-C-009",
    feature: "Flange thickness",
    requirement: "10.00 ±0.10 mm",
    gdt: "None: a linear dimension",
    sheet: "Sheet 2",
    zone: "Zone C1",
    method: "Micrometer",
    equipment: "MIC-007 · 0–25 mm micrometer · certificate not linked",
    measured: "10.01 mm",
    status: "evidence-missing",
    evidence: "Missing: calibration certificate for MIC-007",
    verification: "Blocked until the evidence is linked",
    fai: "Open · evidence missing",
    ctq: false,
    evidenceLinked: false,
    geometry: "g-flange",
    note: "The value is in tolerance, but a result is not accepted without proof that the instrument was in calibration.",
  },
  {
    id: "b12",
    balloon: 12,
    characteristic: "AQ-1042-C-012",
    feature: "Through hole",
    requirement: "Ø10.00 ±0.05 mm",
    gdt: "Position Ø0.10 to datums A, B and C",
    sheet: "Sheet 2",
    zone: "Zone B4",
    method: "CMM",
    equipment: "CMM-02 · touch-trigger probe · calibration valid",
    measured: "10.02 mm",
    status: "pass",
    evidence: "Linked",
    verification: "Human approved",
    fai: "Accounted for · Pass",
    ctq: true,
    evidenceLinked: true,
    geometry: "g-hole-12",
  },
  {
    id: "b13",
    balloon: 13,
    characteristic: "AQ-1042-C-013",
    feature: "Through hole",
    requirement: "Ø10.00 ±0.05 mm",
    gdt: "Position Ø0.10 to datums A, B and C",
    sheet: "Sheet 2",
    zone: "Zone B5",
    method: "CMM",
    equipment: "CMM-02 · touch-trigger probe · calibration valid",
    measured: "10.07 mm",
    status: "fail",
    evidence: "Linked",
    verification: "Human reviewed · nonconformance raised",
    fai: "Open · NCR-0031 raised",
    ctq: true,
    evidenceLinked: true,
    geometry: "g-hole-13",
    note: "0.02 mm over the upper limit. Disposition belongs to the material review authority, not to software.",
  },
  {
    id: "b17",
    balloon: 17,
    characteristic: "AQ-1042-C-017",
    feature: "Through hole, web",
    requirement: "Ø6.00 ±0.10 mm",
    gdt: "Position Ø0.20 to datums A and B",
    sheet: "Sheet 2",
    zone: "Zone D5",
    method: "CMM",
    equipment: "CMM-02 · touch-trigger probe · calibration valid",
    measured: "6.03 mm",
    status: "revision-impacted",
    evidence: "Linked",
    verification: "Human approved at Revision C",
    fai: "Review required · partial FAI assessment",
    ctq: false,
    evidenceLinked: true,
    geometry: "g-hole-17",
    note: "Revision D tightens this tolerance to ±0.05 mm. The Revision C result stands only for Revision C.",
  },
  {
    id: "b18",
    balloon: 18,
    characteristic: "AQ-1042-C-018",
    feature: "Slot width",
    requirement: "12.00 +0.10 / 0.00 mm",
    gdt: "None: a width with a one-sided tolerance",
    sheet: "Sheet 2",
    zone: "Zone B5",
    method: "CMM",
    equipment: "CMM-02 · assigned, not yet used",
    measured: "Not yet measured",
    status: "pending",
    evidence: "None yet",
    verification: "Awaiting measurement",
    fai: "Open · pending inspection",
    ctq: false,
    evidenceLinked: false,
    geometry: "g-slot",
  },
  {
    id: "b21",
    balloon: 21,
    characteristic: "AQ-1042-C-021",
    feature: "Rear chamfer",
    requirement: "2.0 × 45°",
    gdt: "None: called up by a general note",
    sheet: "Sheet 1",
    zone: "Note 4",
    method: "Chamfer gauge",
    equipment: "Not yet assigned",
    measured: "Not yet measured",
    status: "not-inspected",
    evidence: "None yet",
    verification: "Not started",
    fai: "Not started",
    ctq: false,
    evidenceLinked: false,
    geometry: "g-chamfer",
    note: "The drawing does not show which edge the note applies to. In a reconstruction this stays unresolved until an engineer decides.",
  },
  {
    id: "b25",
    balloon: 25,
    characteristic: "AQ-1042-C-025",
    feature: "Pocket depth",
    requirement: "4.00 ±0.10 mm",
    gdt: "None: a linear dimension",
    sheet: "Sheet 2",
    zone: "Zone D5",
    method: "Depth micrometer",
    equipment: "Not yet assigned",
    measured: "Not yet measured",
    status: "not-inspected",
    evidence: "None yet",
    verification: "Not started",
    fai: "Not started",
    ctq: false,
    evidenceLinked: false,
    geometry: "g-pocket",
  },
];

export const FEATURE_BY_ID: ReadonlyMap<string, TwinFeature> = new Map(FEATURES.map((feature) => [feature.id, feature]));
export const GEOMETRY_BY_ID: ReadonlyMap<string, GeometryElement> = new Map(GEOMETRY.map((element) => [element.id, element]));
export const DEFAULT_FEATURE = "b12";

/** What Inspection Mode shows for a selected feature, in order. */
export const INSPECTION_FIELDS: readonly { key: "requirement" | "source" | "gdt" | "method" | "equipment" | "measured" | "evidence" | "verification" | "fai"; label: string }[] = [
  { key: "requirement", label: "Requirement" },
  { key: "source", label: "Source drawing" },
  { key: "gdt", label: "GD&T" },
  { key: "method", label: "Inspection method" },
  { key: "equipment", label: "Measuring equipment" },
  { key: "measured", label: "Measurement" },
  { key: "evidence", label: "Evidence" },
  { key: "verification", label: "Verification" },
  { key: "fai", label: "FAI status" },
];

/** Which features a highlight filter picks out. "status" picks out all of them. */
export type Highlight = "status" | "ctq" | "failed" | "evidence";

export const HIGHLIGHTS: readonly { id: Highlight; label: string; note: string }[] = [
  { id: "status", label: "Inspection status", note: "Every feature, in its status colour, icon and wording." },
  { id: "ctq", label: "CTQ", note: "Only the critical-to-quality characteristics." },
  { id: "failed", label: "Failed features", note: "Only features with a failed result or an open NCR." },
  { id: "evidence", label: "Evidence", note: "Only features whose evidence is linked." },
];

export function isHighlighted(feature: TwinFeature, highlight: Highlight): boolean {
  if (highlight === "ctq") return feature.ctq;
  if (highlight === "failed") return feature.status === "fail";
  if (highlight === "evidence") return feature.evidenceLinked;
  return true;
}

/** The viewer's controls, as the brief lists them, for the description beside the demonstration. */
export const VIEWER_CONTROLS = {
  desktop: ["Rotate", "Pan", "Zoom", "Reset", "Fit", "Isolate feature", "Section view", "Show / hide balloons", "Show / hide dimensions", "Show CTQ", "Show inspection status", "Show failed features", "Show evidence"],
  mobile: ["One-finger rotate", "Pinch zoom", "Reset", "Feature list", "Show balloons"],
  notShown: "An exploded view applies to assemblies. The demonstration is a single part, so it has none.",
} as const;

// ── Architecture and technology ──

export const ENGINE_FLOW = [
  "Drawing input",
  "OCR / CV",
  "View detection",
  "Projection matching",
  "Dimension graph",
  "Feature recognition",
  "Constraint solver",
  "Geometry candidate",
  "3D reconstruction",
  "Confidence map",
  "Engineer review",
] as const;

export const PRIMITIVES = ["Extrusion", "Revolve", "Hole", "Slot", "Pocket", "Boss", "Fillet", "Chamfer", "Pattern", "Symmetry"] as const;

export const ENGINE_LIMIT = "Arbitrary freeform aerospace surfaces are out of scope for Year 1. The research starts with simple prismatic parts built from the primitives above.";

export const TECH_OPTIONS = ["Three.js", "React Three Fiber", "OpenCascade / OCCT", "CAD kernels", "STEP parsers", "Geometry constraint solvers", "WebAssembly"] as const;

export const TECH_NOTE = "Options to investigate, not decisions. The demonstration on this page uses the 3D library the site already ships, loaded only when the viewer is reached. No CAD kernel or new dependency was added to draw it.";

// ── Long-term concepts ──

export const TWIN_REVISION = {
  item: "Characteristic 17",
  what: "Hole diameter",
  from: { revision: "Rev C", value: "Ø6.00 ±0.10" },
  to: { revision: "Rev D", value: "Ø6.00 ±0.05" },
  highlights: ["Added feature", "Deleted feature", "Dimensional change", "Tolerance change", "Hole-location change", "Geometry change", "Affected inspection characteristics"],
  impact: ["Inspection plan review required", "Partial FAI assessment required"],
} as const;

export const SPATIAL_PASSPORT = {
  part: "AQ-1042",
  serial: "000148",
  shows: ["Verified areas", "Inspected characteristics", "NCR locations", "Special-process regions", "Inspection history"],
} as const;

/** How each 3D capability is labelled. The twin as a whole is research and in development. */
export const TWIN_CAPABILITIES: readonly { name: string; text: string; maturity: Maturity }[] = [
  { name: "2D ↔ 3D balloon synchronisation", text: "Select a balloon on the drawing and its feature lights up on the model; select the feature and its record opens.", maturity: "research" },
  { name: "Inspection Mode", text: "The model as a way to navigate requirement, method, equipment, measurement, evidence and approval.", maturity: "research" },
  { name: "Visual FAI", text: "Move through a first article characteristic by characteristic, with the camera going to each one.", maturity: "research" },
  { name: "3D quality overlay", text: "Pass, pending, fail, NCR, evidence-missing and revision-impacted states shown on the geometry.", maturity: "research" },
  { name: "Authoritative STEP visualisation", text: "The customer's approved CAD, with characteristics mapped to its features.", maturity: "planned-y23" },
  { name: "3D revision intelligence", text: "Revision C against Revision D, in 2D and in 3D, with the inspection work it affects.", maturity: "vision" },
  { name: "Spatial Quality Passport", text: "A serialised part's verified history, located on its geometry.", maturity: "vision" },
];
