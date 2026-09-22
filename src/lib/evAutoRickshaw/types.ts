/**
 * Shared types for the EV Auto Rickshaw concept-level engineering + cost simulator.
 *
 * Everything in this module is deliberately framework-free (no React) so it can
 * be unit tested in isolation and reused by any UI surface.
 */

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
  regenRecoveryFraction?: number;

  // Charging
  chargerPowerKw?: number;
  chargerEfficiency?: number;
  startSocPct?: number;
  targetSocPct?: number;

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

export interface PowertrainRecommendation {
  continuousPowerKw: number;
  peakPowerKw: number;
  maxGradeAbilityPct: number;
  peakBatteryCurrentA: number;
  warning: string | null;
}

export interface ChargingResult {
  energyRequiredWh: number;
  hoursTo80: number;
  hoursToTarget: number;
  recommendedCharger: "3.3kW" | "6.6kW";
  recommendationNote: string;
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
  costPerKmInr: number;
  costPerPassengerKmInr: number;
  paybackMonths: number | null;
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
  warnings: ConfigurationWarning[];
  budgetStatus: "within-budget" | "above-budget";
}
