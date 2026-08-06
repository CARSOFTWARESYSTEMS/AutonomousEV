// Shared content types for the Electric Aircraft Battery Cybersecurity page and
// its deterministic Threat-Modelling Studio.

export type TrustState = "trusted" | "degraded" | "unverified" | "compromised";

// Every claim-bearing content item declares how real its capability is today.
// This is enforced structurally (not just editorially) via dataQuality.test.ts.
export type EvidenceStatus =
  | "available-capability"
  | "demonstration-poc"
  | "research-in-progress"
  | "future-roadmap";

export type SystemDomain =
  | "energy"
  | "propulsion"
  | "flight-control"
  | "avionics"
  | "communications"
  | "ground-support";

export interface AircraftComponent {
  id: string;
  name: string;
  domain: SystemDomain;
  trustRole: string;
  downstreamComponentIds: string[];
}

export type EntryPointExposure =
  | "physical"
  | "wireless-local"
  | "wireless-wide-area"
  | "supply-chain"
  | "ground-network";

export interface EntryPoint {
  id: string;
  name: string;
  exposure: EntryPointExposure;
  description: string;
  reachableComponentIds: string[];
}

export interface FlightPhase {
  id: string;
  name: string;
  description: string;
  consequenceWeight: 1 | 2 | 3 | 4 | 5;
}

export type DetectionLayerId =
  | "identity"
  | "telemetry-integrity"
  | "behavioral-anomaly"
  | "firmware-assurance"
  | "network"
  | "operational-process";

export interface DetectionControl {
  id: string;
  name: string;
  layer: DetectionLayerId;
  description: string;
  evidenceStatus: EvidenceStatus;
}

export type ThreatCategory =
  | "spoofing"
  | "tampering"
  | "repudiation"
  | "information-disclosure"
  | "denial-of-service"
  | "elevation-of-privilege";

export type Severity = "low" | "medium" | "high" | "critical";
export type Likelihood = "rare" | "possible" | "likely";

export interface ThreatCard {
  id: string;
  name: string;
  category: ThreatCategory;
  entryPoint: string;
  assetAffected: string;
  summary: string;
  attackVector: string;
  affectedComponentIds: string[];
  affectedEntryPointIds: string[];
  potentialConsequence: string;
  severity: Severity;
  likelihood: Likelihood;
  detectionControlIds: string[];
  mitigationControlIds: string[];
  verificationScenario: string;
  residualRiskNote: string;
  evidenceStatus: EvidenceStatus;
  postQuantumRelated?: boolean;
}

export interface AircraftProfile {
  id: string;
  name: string;
  description: string;
  componentIds: string[];
  defaultFlightPhaseId: string;
}

export interface ScenarioPreset {
  id: string;
  label: string;
  description: string;
  aircraftProfileId: string;
  componentId: string;
  entryPointId: string;
  threatId: string;
  flightPhaseId: string;
}

export interface TrustQuestion {
  id: string;
  question: string;
  shortLabel: string;
  whyItMatters: string;
  attackSurface: string;
  exampleThreats: string[];
  detectionApproaches: string[];
  mitigations: string[];
  verificationMethod: string;
  flightSafetyImpact: string;
  internExercise: string;
  evidenceStatus: EvidenceStatus;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  whyItMatters: string;
  example: string;
  verificationApproach: string;
}

export interface WorkshopDeliverable {
  id: string;
  title: string;
  description: string;
  evidenceStatus: EvidenceStatus;
}

export interface WorkshopPhase {
  id: string;
  phase: string;
  title: string;
  activities: string[];
}

export interface RoadmapItem {
  id: string;
  phase: "now" | "next" | "future";
  title: string;
  description: string;
  status: EvidenceStatus;
}

export interface ReferenceItem {
  id: string;
  title: string;
  publisher: string;
  url: string;
  note?: string;
}

export interface InternExercise {
  id: string;
  title: string;
  objective: string;
  input: string;
  task: string;
  expectedOutput: string;
  acceptanceCriteria: string[];
  commonMistakes: string[];
  stretchGoal: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// ---- Threat-Modelling Studio I/O ----

export interface StudioInput {
  aircraftProfileId: string;
  componentId: string;
  entryPointId: string;
  threatId: string;
  flightPhaseId: string;
}

export interface StudioDataset {
  aircraftProfiles: AircraftProfile[];
  components: AircraftComponent[];
  entryPoints: EntryPoint[];
  threats: ThreatCard[];
  flightPhases: FlightPhase[];
  detectionControls: DetectionControl[];
}

export interface StudioPropagationStep {
  componentId: string;
  componentName: string;
  trustState: TrustState;
  rationale: string;
}

export interface StudioResult {
  input: StudioInput;
  valid: boolean;
  validationMessage?: string;
  propagationPath: StudioPropagationStep[];
  consequenceSeverity: Severity;
  consequenceNarrative: string;
  recommendedDetectionControls: DetectionControl[];
  recommendedMitigationControls: DetectionControl[];
  residualRiskNote: string;
  evidenceStatus: EvidenceStatus;
}

// ================================================================
// Phase 2 — Engineering Excellence
// ================================================================

export interface EngineeringFramework {
  id: string;
  name: string;
  shortLabel: string;
  stages: string[];
  executiveSummary: string;
  engineeringExplanation: string;
  practicalExample: string;
  verificationMethod: string;
}

export interface MaturityLevel {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  characteristics: string[];
  engineeringControls: string[];
  expectedOutputs: string[];
  gaps: string[];
  nextStepGuidance: string;
  evidenceStatus: EvidenceStatus;
}

export interface FlightPhaseProfile {
  id: string;
  name: string;
  order: number;
  batteryFunctions: string[];
  threats: string[];
  attackSurface: string;
  detection: string;
  mitigation: string;
  operationalImpact: string;
  verification: string;
}

export interface DecisionTreeStep {
  id: string;
  question: string;
  yes: { label: string; next: string | null; outcome?: string };
  no: { label: string; next: string | null; outcome?: string };
}

export interface DecisionTree {
  id: string;
  title: string;
  description: string;
  startStepId: string;
  steps: DecisionTreeStep[];
}

export interface DigitalTwinLayer {
  id: string;
  order: number;
  name: string;
  description: string;
  inputs: string[];
  evidenceStatus: EvidenceStatus;
}

export interface MethodologyStep {
  id: string;
  order: number;
  name: string;
  description: string;
  typicalOutputs: string[];
}

export interface WorkshopJourneyStage {
  id: string;
  order: number;
  name: string;
  description: string;
}

export type DownloadCategory =
  | "threat-modelling"
  | "security-checklist"
  | "architecture-review"
  | "detection-rules"
  | "workshop-brochure"
  | "executive-summary";

export interface DownloadTemplate {
  id: string;
  category: DownloadCategory;
  title: string;
  description: string;
  filename: string;
  buildMarkdown: () => string;
}

export type ResearchLibraryCategory = "whitepapers" | "papers" | "patents" | "talks" | "videos";

export interface ResearchLibraryEntry {
  id: string;
  category: ResearchLibraryCategory;
  title: string;
  publisher: string;
  url: string;
  note?: string;
}

export interface RelatedArticle {
  id: string;
  title: string;
  href: string;
  description: string;
}

// ---- Generic node-explorer shape shared by Attack Surface, Flight Phase,
// and Knowledge Graph explorers (see NodeExplorer.tsx) ----

export interface ExplorerDetailSection {
  heading: string;
  body: string | string[];
}

export type ExplorerBadge =
  | { kind: "trust"; value: TrustState }
  | { kind: "evidence"; value: EvidenceStatus }
  | { kind: "severity"; value: Severity };

export interface ExplorerNode {
  id: string;
  label: string;
  summary: string;
  detailSections: ExplorerDetailSection[];
  badge?: ExplorerBadge;
}

// ================================================================
// Phase 3 — Assessment Wizard
// ================================================================

// The 9 radar axes: the 7-dimension Battery Trust Framework (see
// data/frameworks.ts) plus Detection and Verification, matching the
// wizard spec's own scoring list.
export type TrustDimension =
  | "identity"
  | "integrity"
  | "authenticity"
  | "availability"
  | "safety"
  | "evidence"
  | "resilience"
  | "detection"
  | "verification";

export type WizardStepId =
  | "battery-architecture"
  | "communication"
  | "firmware"
  | "charging"
  | "maintenance"
  | "threat-detection"
  | "verification";

export interface WizardQuestionDimensionWeight {
  dimension: TrustDimension;
  weight: number;
}

export interface WizardQuestion {
  id: string;
  stepId: WizardStepId;
  text: string;
  type: "boolean" | "multi-select";
  options?: string[]; // multi-select only
  dimensions: WizardQuestionDimensionWeight[]; // empty for multi-select context questions
  helpText?: string;
}

export type WizardAnswerValue = boolean | string[] | null;

export type WizardAnswers = Record<string, WizardAnswerValue>;

export interface AssessmentScores {
  dimensionScores: Record<TrustDimension, number>; // 0-100
  overallTrust: number; // 0-100
}

export interface Recommendation {
  id: string;
  questionId: string;
  title: string;
  rationale: string;
  verification: string;
  expectedBenefit: string;
  priority: Severity;
  relatedControlId?: string;
}

export type RoadmapBucket = "immediate" | "30-day" | "90-day" | "future";

export interface BucketedRecommendation extends Recommendation {
  bucket: RoadmapBucket;
}

export interface RecommendationRule {
  id: string;
  questionId: string;
  triggerAnswer: false; // every rule fires when the boolean question is answered "No" (or left unanswered)
  title: string;
  rationale: string;
  verification: string;
  expectedBenefit: string;
  priority: Severity;
  relatedControlId?: string;
}

export interface RiskMatrixCell {
  likelihood: Likelihood;
  impact: Severity;
  priority: Severity;
  recommendations: BucketedRecommendation[];
}
