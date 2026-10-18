// Domain model for the EV Battery Health & Diagnostics Toolkit.
//
// Kept apart from rendering: the 3D scene, the vehicle data, the diagnostic
// engine, the report and analytics all speak these types and nothing else,
// so a GLB model, an imported tester file or a future live BMS source can
// replace one piece without touching the others.

// ── Provenance ──

/** Where a displayed technical value came from. Shown next to every value. */
export type Provenance =
  | "MEASURED"
  | "SIMULATED"
  | "MANUFACTURER_VERIFIED"
  | "USER_ENTERED"
  | "ESTIMATED"
  | "NOT_MEASURED"
  | "NOT_AVAILABLE"
  | "UNKNOWN";

/** A value and where it came from. `value` is null whenever nothing trustworthy is known. */
export interface Sourced<T> {
  value: T | null;
  provenance: Provenance;
  unit?: string;
  /** Free-text source note, e.g. a document title. Never shown as manufacturer data unless provenance says so. */
  note?: string;
}

// ── Vehicles ──

export type VerificationStatus = "VERIFIED" | "MANUFACTURER_DOCUMENTED" | "THIRD_PARTY_DOCUMENTED" | "ESTIMATED" | "UNKNOWN";
export type Confidence = "LOW" | "MEDIUM" | "HIGH";

export interface SourceReference {
  title: string;
  url?: string;
  sourceType: VerificationStatus;
  retrieved?: string;
}

export type BatteryLocation = "floor" | "under-seat" | "under-floor-boot";

export interface VehicleBatterySpec {
  batteryLocation: Sourced<BatteryLocation>;
  batteryArchitecture: Sourced<ArchitectureId>;
  nominalVoltage: Sourced<number>;
  capacityAh: Sourced<number>;
  energyKWh: Sourced<number>;
  chemistry: Sourced<BatteryChemistry>;
  cellType: Sourced<CellFormat>;
  enclosure: Sourced<string>;
  ipRating: Sourced<string>;
  chargingSpecification: Sourced<string>;
  bmsCommunication: Sourced<string>;
  connectorType: Sourced<string>;
  thermalSystem: Sourced<string>;
}

export interface VehicleVariant {
  id: string;
  name: string;
  /** Model years offered for selection. Empty when not verified: the technician enters the year. */
  modelYears: number[];
  battery: VehicleBatterySpec;
}

export interface Vehicle {
  id: string;
  manufacturer: string;
  model: string;
  family: string;
  variants: VehicleVariant[];
  serviceNotes: string[];
  source: SourceReference[];
  verificationStatus: VerificationStatus;
  lastVerifiedDate: string | null;
  confidence: Confidence;
}

// ── Battery architecture & configuration ──

export type BatteryChemistry = "NMC" | "LFP";
export type CellFormat = "cylindrical" | "prismatic" | "pouch";
export type ArchitectureId = "fixed-floor" | "swappable" | "serviceable-pack";
export type PackLayout = "single" | "multi-module" | "fixed" | "removable" | "swappable" | "dual-pack";
export type VoltageClass = "36" | "48" | "51" | "60" | "72" | "custom";
export type EnergyBand = "lt2" | "2to3" | "3to4" | "4to5" | "gt5";

/** A data-driven description of an architecture concept; the 3D model is built from it. */
export interface BatteryArchitecture {
  id: ArchitectureId;
  name: string;
  summary: string;
  location: BatteryLocation;
  /** Enclosure size in scene units (1 unit ≈ 100 mm), width × height × depth. */
  dimensions: [number, number, number];
  /** Rotation of the pack in the scooter, radians about Y. */
  orientation: number;
  removal: "fixed" | "removable" | "swappable";
  modules: number;
  /** Where the BMS board sits on the pack. */
  bmsPosition: "end" | "top" | "side";
  connectors: { id: "charge" | "discharge"; face: "front" | "rear" | "top" }[];
  serviceability: string;
}

export interface BatteryConfig {
  chemistry: BatteryChemistry;
  format: CellFormat;
  voltage: VoltageClass;
  /** Used only when `voltage` is "custom". */
  customVoltage: number;
  energy: EnergyBand;
  layout: PackLayout;
  architecture: ArchitectureId;
}

/** The pack the configuration resolves to. Every number here is an illustrative estimate. */
export interface BatteryPack {
  config: BatteryConfig;
  series: number;
  parallel: number;
  modules: number;
  groupsPerModule: number[];
  cellNominalV: number;
  cellCapacityAh: number;
  nominalV: number;
  capacityAh: number;
  energyKWh: number;
  totalCells: number;
}

// ── Components ──

export type RepairDepth = "basic" | "expert" | "advanced";

export type ComponentId =
  | "enclosure"
  | "cover"
  | "gasket"
  | "modules"
  | "cells"
  | "cell-holders"
  | "busbars"
  | "fuse"
  | "current-sensor"
  | "sense-harness"
  | "temp-sensors"
  | "bms"
  | "charge-connector"
  | "discharge-connector"
  | "insulation"
  | "tim"
  | "vent";

export interface ComponentDefinition {
  id: ComponentId;
  name: string;
  function: string;
  commonFaults: string[];
  measurements: string[];
  repairDepth: RepairDepth;
}

// ── BMS ──

export type CommInterface = "CAN" | "UART" | "BLE";
export type LinkState = "ONLINE" | "OFFLINE" | "INTERMITTENT";
export type BmsState = "NORMAL" | "WARNING" | "PROTECTION" | "OFFLINE";

export interface BMSProfile {
  interfaces: CommInterface[];
  balancing: "passive" | "active" | "unknown";
}

export interface BmsSnapshot {
  packVoltage: Sourced<number>;
  packCurrent: Sourced<number>;
  soc: Sourced<number>;
  soh: Sourced<number>;
  maxCellV: Sourced<number>;
  minCellV: Sourced<number>;
  cellDeltaMv: Sourced<number>;
  avgCellV: Sourced<number>;
  maxTemp: Sourced<number>;
  minTemp: Sourced<number>;
  tempSpread: Sourced<number>;
  chargeEnabled: Sourced<boolean>;
  dischargeEnabled: Sourced<boolean>;
  bmsState: Sourced<BmsState>;
  faultCodes: Sourced<string[]>;
  comms: Record<CommInterface, LinkState>;
  /** Per series group, in pack order. */
  groupVoltages: number[];
  groupTemps: number[];
  /** Series-group index the worst condition sits in, if any. */
  hotGroup: number | null;
  weakGroup: number | null;
  /** Temperature sensor channels that read nothing. */
  failedSensors: number[];
}

// ── Faults ──

export type FaultCategory = "cell" | "thermal" | "electrical" | "bms" | "charging" | "environment" | "lifecycle" | "communication" | "safety";
export type Severity = "info" | "warning" | "service" | "critical";
export type SafetyLevel = "none" | "early-warning" | "stop";

/** How a fault changes the simulated pack. Declarative, so the engine stays generic. */
export interface FaultEffects {
  weakGroupMv?: number;
  /** Extra sag under load on the weak group, mV. */
  loadSagMv?: number;
  highGroupMv?: number;
  allGroupsMv?: number;
  imbalanceSpreadMv?: number;
  hotGroupC?: number;
  packTempC?: number;
  gradientC?: number;
  failedTempSensor?: boolean;
  sohOverride?: number;
  socOverride?: number;
  packCurrentA?: number;
  chargeDisabled?: boolean;
  dischargeDisabled?: boolean;
  bmsOffline?: boolean;
  bmsState?: BmsState;
  comms?: Partial<Record<CommInterface, LinkState>>;
  /** Fault codes the simulated BMS reports. Illustrative, not any OEM's code set. */
  codes?: string[];
  /** Components the fault sits in, highlighted in the 3D view. */
  components?: ComponentId[];
  packVoltageReadsZero?: boolean;
}

export interface FaultDefinition {
  id: string;
  name: string;
  category: FaultCategory;
  severity: Severity;
  safety: SafetyLevel;
  symptom: string;
  diagnosticArea: string;
  effects: FaultEffects;
  /** The measurements that would confirm it. */
  confirmWith: string[];
}

// ── Diagnosis ──

export type DiagnosticContext = "real" | "simulation";

export type MeasurementKey =
  | "packVoltage"
  | "chargerVoltage"
  | "chargerCurrent"
  | "packCurrent"
  | "soc"
  | "soh"
  | "cellMin"
  | "cellMax"
  | "cellDelta"
  | "tempMin"
  | "tempMax"
  | "tempSpread"
  | "ambientTemp"
  | "voltageDuringCharge"
  | "insulationResistance";

export type ObservationKey =
  | "bmsStatus"
  | "bmsFaultCodes"
  | "chargeEnable"
  | "dischargeEnable"
  | "commStatus"
  | "fuseStatus"
  | "connectorCondition"
  | "corrosion"
  | "waterIngress"
  | "swelling"
  | "enclosureDamage"
  | "smellOrHeat"
  | "hotspotLocation"
  | "loadBehaviour"
  | "capacityTest"
  | "internalResistanceTest";

/** A numeric field in the real workflow. NOT_MEASURED until the technician records a value. */
export interface DiagnosticMeasurement {
  key: MeasurementKey;
  value: number | null;
  provenance: Provenance;
}

export interface DiagnosticObservation {
  key: ObservationKey;
  value: string | null;
  provenance: Provenance;
}

export interface DiagnosticStep {
  id: string;
  title: string;
  purpose: string;
}

export type CandidateGate = "MET" | "INSUFFICIENT";

export interface RootCauseCandidate {
  id: string;
  name: string;
  supporting: string[];
  conflicting: string[];
  missing: string[];
  nextMeasurement: string;
  confidence: Confidence;
  gate: CandidateGate;
}

export type RepairStatus =
  | "NO_REPAIR_REQUIRED"
  | "SERVICEABLE"
  | "COMPONENT_REPAIR"
  | "BMS_SERVICE"
  | "MODULE_REPAIR"
  | "ADVANCED_CELL_REPAIR"
  | "PACK_REPLACEMENT_RECOMMENDED"
  | "UNSAFE_QUARANTINE"
  | "INSUFFICIENT_EVIDENCE";

export interface RepairDecision {
  status: RepairStatus;
  reason: string;
  evidence: string[];
  repairDepth: RepairDepth | null;
  verificationRequired: string[];
}

export type VerificationOutcome = "PASS" | "CONDITIONAL_PASS" | "FURTHER_DIAGNOSIS_REQUIRED" | "UNSAFE_DO_NOT_RETURN";
export type CheckResult = "pass" | "fail" | "not-done" | "not-applicable";

/** "changed" is for values with no better or worse direction, such as pack voltage or SOC. */
export type Trend = "improved" | "unchanged" | "worsened" | "changed" | "not-comparable";

// ── Job card & report ──

export interface JobCard {
  jobId: string;
  date: string;
  technician: string;
  complaint: string;
  complaintCategory: string;
  vehicleId: string | null;
  variantId: string | null;
  modelYear: number | null;
  odometerKm: number | null;
  batteryId: string;
  batterySerial: string;
  architecture: ArchitectureId | null;
  safetyFlags: string[];
  safetyAcknowledged: boolean;
  before: Partial<Record<MeasurementKey, DiagnosticMeasurement>>;
  observations: Partial<Record<ObservationKey, DiagnosticObservation>>;
  groupVoltages: (number | null)[];
  repairPerformed: string;
  partsReplaced: string;
  after: Partial<Record<MeasurementKey, DiagnosticMeasurement>>;
  afterObservations: Partial<Record<ObservationKey, DiagnosticObservation>>;
  verification: Record<string, CheckResult>;
  technicianConfirmed: boolean;
  notes: string;
}

export interface ReportRow {
  label: string;
  value: string;
  provenance: Provenance;
}

export interface ReportSection {
  id: "before" | "diagnosis" | "root-cause" | "repair" | "after" | "verification" | "recommendation" | "evidence";
  title: string;
  rows: ReportRow[];
  text?: string[];
}

export interface DataQualitySummary {
  measured: number;
  userEntered: number;
  manufacturerVerified: number;
  simulated: number;
  estimated: number;
  unknown: number;
  notMeasured: number;
}

export interface Report {
  context: DiagnosticContext;
  title: string;
  brand: string;
  jobId: string;
  generatedAt: string;
  header: ReportRow[];
  sections: ReportSection[];
  quality: DataQualitySummary;
  finalHealth: string;
  safetyStatus: string;
  footer: string;
}
