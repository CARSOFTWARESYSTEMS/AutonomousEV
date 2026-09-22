/**
 * Shared types for the EV Auto Rickshaw concept-level engineering + cost simulator.
 *
 * Everything in this module is deliberately framework-free (no React) so it can
 * be unit tested in isolation and reused by any UI surface.
 */

import type { DailyDutyScenario } from "./dailyDuty";

export type PassengerCapacity = 3 | 4 | 5 | 6;

export type Terrain = "flat" | "mixed" | "hilly";

export type Traffic = "light" | "medium" | "heavy";

export type ChargingAvailability =
  | "overnight"
  | "overnight-opportunity"
  | "fleet-depot"
  | "battery-swap";

export type BatteryChemistry = "LFP" | "NMC";

export type VoltageClass = "60V" | "72V" | "76.8V" | "96V";

export type SoftwareTier = "standard" | "connected" | "fleet" | "intelligence";

export type PresetId = "value" | "city" | "long-range" | "fleet-plus";

/**
 * How the recommendation engine trades off battery/reserve margin against
 * acquisition price and charging flexibility. This does not change the
 * underlying physics — only how much energy reserve is sized in on top of
 * the actual duty-cycle requirement.
 */
export type OptimizationPriority = "lowest-price" | "balanced" | "max-uptime";

/** Customer-facing duty-cycle requirement — the "Simple" configurator inputs. */
export interface CustomerRequirement {
  passengerCapacity: PassengerCapacity;
  avgPassengerWeightKg: number;
  driverWeightKg: number;
  dailyDistanceKm: number;
  terrain: Terrain;
  traffic: Traffic;
  maxSpeedKmh: number;
  acEnabled: boolean;
  luggageKg: number;
  chargingAvailability: ChargingAvailability;
  targetPriceInr: number;
  softwareTier: SoftwareTier;
  swappingEnabled: boolean;
  chemistry: BatteryChemistry;
  voltageClass: VoltageClass;
  /** Vehicle + battery warranty selection feeds the cost model's warranty reserve. */
  vehicleWarrantyYears: 3 | 5 | 6;
  batteryWarrantyYears: 3 | 5 | 6;
  optimizationPriority: OptimizationPriority;
  /** Only meaningful when chargingAvailability === "overnight-opportunity". */
  opportunityChargingHours: number;
}

/** Engineering-mode overrides. Any field left undefined falls back to a derived default. */
export interface EngineeringOverrides {
  // Vehicle
  gliderMassKg?: number;
  wheelRadiusM?: number;
  frontalAreaM2?: number;
  dragCoefficient?: number;
  rollingResistanceCoefficient?: number;
  auxiliaryLoadW?: number;

  // Battery
  batteryCapacityKWh?: number;
  usableSocWindow?: number; // fraction, e.g. 0.90
  reserveFraction?: number; // fraction of usable energy held back, e.g. 0.05
  degradationAllowance?: number; // fraction, e.g. 0.08
  packSpecificEnergyWhPerKg?: number;
  batteryCostPerKWhInr?: number;

  // Powertrain
  continuousPowerKw?: number;
  peakPowerKw?: number;
  controllerEfficiency?: number;
  drivetrainEfficiency?: number;
  finalDriveRatio?: number;
  /** Motor peak torque at the shaft. Left unset unless an engineer supplies it — hill-start/torque-limited gradeability is only computed when this is present; otherwise the UI states it requires torque-curve validation rather than inventing a number. Engineering Assumption. */
  motorPeakTorqueNm?: number;
  /** Motor continuous (thermally sustainable) torque at the shaft. Feeds the Sustained Climb Check's continuous-rating margin when supplied. Engineering Assumption. */
  motorContinuousTorqueNm?: number;
  /** Motor RPM at which it transitions from constant-torque to constant-power (field weakening). Needed to know which region governs gradeability at a given road speed. Engineering Assumption. */
  baseMotorRpm?: number;
  /** Motor's maximum RPM — cross-checked against the max-speed requirement via final-drive ratio and wheel radius when supplied. Engineering Assumption. */
  maxMotorRpm?: number;
  /** Controller continuous current rating — informational; not yet load-bearing in a calculation. Engineering Assumption. */
  controllerContinuousCurrentA?: number;
  /** Controller peak current rating — cross-checked against the estimated peak battery current when supplied. Engineering Assumption. */
  controllerPeakCurrentA?: number;
  /** Speed at which "sustained gradeability" is evaluated (power-limited, not torque-limited). */
  gradeSpeedKmh?: number;
  regenRecoveryFraction?: number;

  // Charging
  chargerPowerKw?: number;
  chargerEfficiency?: number;
  startSocPct?: number;
  targetSocPct?: number;
  /** Explicit override for the daily charging window. Unset = derived from chargingAvailability. */
  chargingWindowHours?: number;

  // Economics
  motorControllerCostPerKwInr?: number;
  chassisBodyCostInr?: number;
  electronicsCostInr?: number;
  assemblyOverheadPct?: number;
  warrantyReservePct?: number;
  logisticsPct?: number;
  distributionMarginPct?: number;
}

export interface SimulatorAssumptions {
  airDensityKgM3: number;
  gravityMS2: number;
  rollingResistanceCoefficient: number;
  dragCoefficient: number;
  frontalAreaM2: number;
  drivetrainEfficiency: number;
  chargerEfficiency: number;
  usableSocWindow: number;
  reserveFraction: number;
  degradationAllowance: number;
  packSpecificEnergyWhPerKg: number;
  batteryCostPerKWhInr: number;
  bmsCostInr: number;
  motorControllerCostPerKwInr: number;
  motorControllerBaseCostInr: number;
  chargerCost3_3kWInr: number;
  chargerCost6_6kWInr: number;
  dcDcCostInr: number;
  chassisBaseCostInr: number;
  chassisCostPerSeatInr: number;
  suspensionBrakesBaseCostInr: number;
  wheelsTyresCostInr: number;
  acSystemCostInr: number;
  swapReadyCostInr: number;
  assemblyOverheadPct: number;
  logisticsPct: number;
  distributionMarginPct: number;
  electricityTariffInrPerKWh: number;
  loanInterestRatePct: number;
  loanTenureMonths: number;
}

export interface MassBreakdown {
  gliderMassKg: number;
  batteryMassKg: number;
  kerbMassKg: number;
  driverMassKg: number;
  passengerMassKg: number;
  luggageMassKg: number;
  loadedMassKg: number;
}

export interface EnergyConsumptionResult {
  avgSpeedKmh: number;
  wattsRolling: number;
  wattsAero: number;
  wattsTerrainTrafficLoss: number;
  wattsTraction: number;
  trafficLossFactor: number;
  terrainLossFactor: number;
  whPerKmTraction: number;
  whPerKmAux: number;
  whPerKm: number;
}

export interface RangeBand {
  lightLoadKm: number;
  typicalKm: number;
  fullLoadKm: number;
}

export interface BatteryRecommendation {
  capacityKWh: number;
  voltageClass: VoltageClass;
  chemistry: BatteryChemistry;
  massKg: number;
  usableEnergyWh: number;
  requiredDailyEnergyWh: number;
}

export interface HillPerformancePoint {
  speedKmh: number;
  pct: number;
  region: "torque-limited" | "power-limited";
  note: string | null;
}

export interface PowertrainRecommendation {
  continuousPowerKw: number;
  peakPowerKw: number;
  /** Power-limited grade the vehicle can sustain at gradeSpeedKmh — always computable. */
  sustainedGradeabilityPct: number;
  gradeSpeedKmh: number;
  /**
   * Torque-limited hill-start/very-low-speed capability. This is only
   * computable when an engineer has supplied a motor peak torque — a
   * power-based estimate breaks down as speed approaches zero, so this is
   * `null` (never a guessed number) until that assumption is provided.
   */
  hillStartGradeabilityPct: number | null;
  /** Hill Performance at 10/20/25/30 km/h, each labeled torque- or power-limited. */
  hillPerformance: HillPerformancePoint[];
  sustainedClimbCheck: {
    gradePct: number;
    speedKmh: number;
    requiredWheelPowerKw: number;
    requiredMotorPowerKw: number;
    continuousRatingMarginKw: number;
    thermalValidationRequired: true;
  };
  peakBatteryCurrentA: number;
  warning: string | null;
}

export interface ChargingResult {
  energyRequiredWh: number;
  hoursTo80: number;
  hoursToTarget: number;
  recommendedCharger: "3.3kW" | "6.6kW";
  recommendationNote: string;
  /** Daily charging window this recommendation was evaluated against (hours). */
  availableWindowHours: number;
  /** Hours needed to replenish the day's actual energy consumption at each charger power — independent of single-charge range. */
  hoursNeededAt3_3kW: number;
  hoursNeededAt6_6kW: number;
}

export interface CostBreakdown {
  batteryCellsPackInr: number;
  bmsInr: number;
  motorControllerInr: number;
  chargerInr: number;
  dcDcInr: number;
  chassisBodyInr: number;
  suspensionBrakesWheelsInr: number;
  electricalElectronicsInr: number;
  interiorAcInr: number;
  swapReadyInr: number;
  subtotalComponentsInr: number;
  assemblyOverheadInr: number;
  warrantyReserveInr: number;
  logisticsInr: number;
  manufacturingCostInr: number;
  distributionMarginInr: number;
  sellingPriceInr: number;
  shareByGroup: {
    battery: number;
    powertrain: number;
    chassisBody: number;
    electricalElectronics: number;
    suspensionBrakesWheels: number;
    assemblyWarrantyOther: number;
  };
}

export interface EmiResult {
  loanAmountInr: number;
  monthlyEmiInr: number;
  totalInterestInr: number;
  totalPayableInr: number;
}

export interface TcoInputs {
  purchasePriceInr: number;
  downPaymentInr: number;
  loanInterestRatePct: number;
  loanTenureMonths: number;
  dailyDistanceKm: number;
  workingDaysPerMonth: number;
  electricityTariffInrPerKWh: number;
  avgPassengersPerTrip: number;
  avgFarePerPassengerInr: number;
  tripsPerDay: number;
  annualMaintenanceInr: number;
  annualInsuranceInr: number;
  tyreSetCostInr: number;
  tyreLifeKm: number;
}

/**
 * Same three ₹/km scopes for EV, CNG and petrol so they are never compared
 * on inconsistent bases:
 *   energyFuelPerKm  — energy/fuel only
 *   runningPerKm     — + maintenance + tyres
 *   ownershipPerKm   — + insurance + EMI/finance (0 for cash-purchase fuel vehicles)
 */
export interface CostPerKmBreakdown {
  energyFuelPerKm: number;
  runningPerKm: number;
  ownershipPerKm: number;
}

export interface LifetimeTco {
  totalCostInr: number;
  totalKm: number;
  perKm: number;
}

export interface LifetimeTcoByYear {
  year3: LifetimeTco;
  year5: LifetimeTco;
  year10: LifetimeTco;
}

export interface TcoResult {
  emi: EmiResult;
  dailyElectricityCostInr: number;
  monthlyElectricityCostInr: number;
  monthlyMaintenanceInr: number;
  monthlyInsuranceInr: number;
  monthlyTyreProvisionInr: number;
  monthlyOperatingCostInr: number;
  monthlyRevenueInr: number;
  monthlyOperatingSurplusInr: number;
  costPerKm: CostPerKmBreakdown;
  ownershipCostPerPassengerKmInr: number;
  lifetimeTco: LifetimeTcoByYear;
  /** Time to recover the down payment from monthly operating surplus (revenue - full operating cost including EMI). Not a vehicle-investment payback. */
  downPaymentRecoveryMonths: number | null;
}

export interface ConfigurationWarning {
  severity: "info" | "caution";
  title: string;
  message: string;
}

export interface SimulatorState {
  requirement: CustomerRequirement;
  overrides: EngineeringOverrides;
  assumptions: SimulatorAssumptions;
}

export interface SimulatorOutputs {
  mass: MassBreakdown;
  energy: {
    typical: EnergyConsumptionResult;
    lightLoad: EnergyConsumptionResult;
    fullLoad: EnergyConsumptionResult;
  };
  range: RangeBand;
  battery: BatteryRecommendation;
  powertrain: PowertrainRecommendation;
  charging: ChargingResult;
  cost: CostBreakdown;
  dailyDuty: DailyDutyScenario[];
  warnings: ConfigurationWarning[];
  budgetStatus: "within-budget" | "above-budget";
}
