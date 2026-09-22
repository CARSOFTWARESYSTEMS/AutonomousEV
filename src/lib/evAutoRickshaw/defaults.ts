import type {
  CustomerRequirement,
  EngineeringOverrides,
  PresetId,
  SimulatorAssumptions,
} from "./types";

/**
 * Concept-stage planning assumptions. Every figure here is a placeholder for a
 * supplier quotation / test result and is exposed in the Assumptions drawer so
 * it can be inspected and edited rather than trusted blindly.
 */
export const DEFAULT_ASSUMPTIONS: SimulatorAssumptions = {
  airDensityKgM3: 1.19,
  gravityMS2: 9.81,
  rollingResistanceCoefficient: 0.012,
  dragCoefficient: 0.9,
  frontalAreaM2: 1.9,
  drivetrainEfficiency: 0.9,
  chargerEfficiency: 0.9,
  usableSocWindow: 0.9,
  reserveFraction: 0.08,
  degradationAllowance: 0.08,
  packSpecificEnergyWhPerKg: 95,
  batteryCostPerKWhInr: 9000,
  bmsCostInr: 9000,
  motorControllerCostPerKwInr: 1500,
  motorControllerBaseCostInr: 6000,
  chargerCost3_3kWInr: 4500,
  chargerCost6_6kWInr: 8500,
  dcDcCostInr: 1800,
  chassisBaseCostInr: 55000,
  chassisCostPerSeatInr: 3000,
  suspensionBrakesBaseCostInr: 22000,
  wheelsTyresCostInr: 8000,
  acSystemCostInr: 9000,
  swapReadyCostInr: 12000,
  assemblyOverheadPct: 6,
  logisticsPct: 8,
  distributionMarginPct: 20,
  electricityTariffInrPerKWh: 8,
  loanInterestRatePct: 13,
  loanTenureMonths: 36,
};

export const DEFAULT_REQUIREMENT: CustomerRequirement = {
  passengerCapacity: 6,
  avgPassengerWeightKg: 80,
  driverWeightKg: 75,
  dailyDistanceKm: 120,
  terrain: "mixed",
  traffic: "medium",
  maxSpeedKmh: 50,
  acEnabled: false,
  luggageKg: 20,
  chargingAvailability: "overnight",
  targetPriceInr: 425000,
  softwareTier: "connected",
  swappingEnabled: false,
  chemistry: "LFP",
  voltageClass: "76.8V",
  vehicleWarrantyYears: 3,
  batteryWarrantyYears: 3,
};

export const EMPTY_OVERRIDES: EngineeringOverrides = {};

export interface PresetDefinition {
  id: PresetId;
  label: string;
  description: string;
  requirement: Partial<CustomerRequirement>;
  overrides: EngineeringOverrides;
}

/**
 * Presets seed the simulator inputs; they never hardcode output numbers.
 * The recommendation engine still derives battery/motor/cost from these inputs.
 */
export const PRESETS: PresetDefinition[] = [
  {
    id: "value",
    label: "Value",
    description: "Lowest acquisition cost for shorter, predictable daily routes.",
    requirement: {
      passengerCapacity: 4,
      dailyDistanceKm: 80,
      targetPriceInr: 350000,
      softwareTier: "standard",
      voltageClass: "72V",
    },
    overrides: {
      batteryCapacityKWh: undefined,
      peakPowerKw: undefined,
    },
  },
  {
    id: "city",
    label: "City — Recommended Default",
    description: "Balanced D+6 configuration for typical Tier-2/Tier-3 duty cycles.",
    requirement: {
      passengerCapacity: 6,
      dailyDistanceKm: 120,
      targetPriceInr: 425000,
      softwareTier: "connected",
      voltageClass: "76.8V",
    },
    overrides: {},
  },
  {
    id: "long-range",
    label: "Long Range",
    description: "Larger battery for drivers running high daily kilometres.",
    requirement: {
      passengerCapacity: 6,
      dailyDistanceKm: 170,
      targetPriceInr: 475000,
      softwareTier: "connected",
      voltageClass: "76.8V",
    },
    overrides: {},
  },
  {
    id: "fleet-plus",
    label: "Fleet+",
    description: "High-utilization fleet configuration with swap-readiness and telematics.",
    requirement: {
      passengerCapacity: 6,
      dailyDistanceKm: 200,
      targetPriceInr: 550000,
      softwareTier: "fleet",
      swappingEnabled: true,
      voltageClass: "96V",
      chargingAvailability: "fleet-depot",
    },
    overrides: {},
  },
];

export const BATTERY_CAPACITY_MIN_KWH = 8;
export const BATTERY_CAPACITY_MAX_KWH = 16;
export const PEAK_POWER_MIN_KW = 8;
export const PEAK_POWER_MAX_KW = 18;
