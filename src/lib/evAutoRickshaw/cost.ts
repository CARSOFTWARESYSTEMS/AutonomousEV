import type {
  CostBreakdown,
  CustomerRequirement,
  EngineeringOverrides,
  SimulatorAssumptions,
  SoftwareTier,
} from "./types";

const SOFTWARE_TIER_COST_INR: Record<SoftwareTier, number> = {
  standard: 9000,
  connected: 14000,
  fleet: 19000,
  intelligence: 26000,
};

/**
 * Warranty reserve grows with vehicle/battery warranty duration selected in
 * the simulator. This is a cost-model provisioning assumption, not a
 * commercial warranty commitment.
 */
function warrantyReservePct(vehicleYears: number, batteryYears: number): number {
  const vehiclePart = 2 + (vehicleYears - 3) * 1;
  const batteryPart = 1.5 + (batteryYears - 3) * 1.2;
  return vehiclePart + batteryPart;
}

export function computeCostBreakdown(
  requirement: CustomerRequirement,
  batteryCapacityKWh: number,
  peakPowerKw: number,
  chargerKw: "3.3kW" | "6.6kW",
  assumptions: SimulatorAssumptions,
  overrides: EngineeringOverrides,
): CostBreakdown {
  const batteryCostPerKWh = overrides.batteryCostPerKWhInr ?? assumptions.batteryCostPerKWhInr;
  const chemistryMultiplier = requirement.chemistry === "NMC" ? 1.15 : 1;
  const batteryCellsPackInr = batteryCapacityKWh * batteryCostPerKWh * chemistryMultiplier;
  const bmsInr = assumptions.bmsCostInr;

  const motorControllerCostPerKw =
    overrides.motorControllerCostPerKwInr ?? assumptions.motorControllerCostPerKwInr;
  const motorControllerInr = peakPowerKw * motorControllerCostPerKw + assumptions.motorControllerBaseCostInr;

  const chargerInr = chargerKw === "6.6kW" ? assumptions.chargerCost6_6kWInr : assumptions.chargerCost3_3kWInr;
  const dcDcInr = assumptions.dcDcCostInr;

  const chassisBodyInr =
    overrides.chassisBodyCostInr ??
    assumptions.chassisBaseCostInr + (requirement.passengerCapacity - 3) * assumptions.chassisCostPerSeatInr;

  const suspensionBrakesWheelsInr = assumptions.suspensionBrakesBaseCostInr + assumptions.wheelsTyresCostInr;

  const electricalElectronicsInr =
    overrides.electronicsCostInr ?? SOFTWARE_TIER_COST_INR[requirement.softwareTier];

  const interiorAcInr = 18000 + (requirement.acEnabled ? assumptions.acSystemCostInr : 0);
  const swapReadyInr = requirement.swappingEnabled ? assumptions.swapReadyCostInr : 0;

  const subtotalComponentsInr =
    batteryCellsPackInr +
    bmsInr +
    motorControllerInr +
    chargerInr +
    dcDcInr +
    chassisBodyInr +
    suspensionBrakesWheelsInr +
    electricalElectronicsInr +
    interiorAcInr +
    swapReadyInr;

  const assemblyOverheadPct = overrides.assemblyOverheadPct ?? assumptions.assemblyOverheadPct;
  const assemblyOverheadInr = (subtotalComponentsInr * assemblyOverheadPct) / 100;

  const warrantyPct =
    overrides.warrantyReservePct ??
    warrantyReservePct(requirement.vehicleWarrantyYears, requirement.batteryWarrantyYears);
  const warrantyReserveInr = (subtotalComponentsInr * warrantyPct) / 100;

  const logisticsPct = overrides.logisticsPct ?? assumptions.logisticsPct;
  const logisticsInr = (subtotalComponentsInr * logisticsPct) / 100;

  const manufacturingCostInr =
    subtotalComponentsInr + assemblyOverheadInr + warrantyReserveInr + logisticsInr;

  const distributionMarginPct = overrides.distributionMarginPct ?? assumptions.distributionMarginPct;
  const distributionMarginInr = (manufacturingCostInr * distributionMarginPct) / 100;

  const sellingPriceInr = manufacturingCostInr + distributionMarginInr;

  const powertrainGroup = motorControllerInr + chargerInr + dcDcInr;
  const electricalGroup = electricalElectronicsInr;
  const otherGroup = assemblyOverheadInr + warrantyReserveInr + logisticsInr + swapReadyInr + distributionMarginInr;

  return {
    batteryCellsPackInr,
    bmsInr,
    motorControllerInr,
    chargerInr,
    dcDcInr,
    chassisBodyInr,
    suspensionBrakesWheelsInr,
    electricalElectronicsInr,
    interiorAcInr,
    swapReadyInr,
    subtotalComponentsInr,
    assemblyOverheadInr,
    warrantyReserveInr,
    logisticsInr,
    manufacturingCostInr,
    distributionMarginInr,
    sellingPriceInr,
    shareByGroup: {
      battery: (batteryCellsPackInr + bmsInr) / sellingPriceInr,
      powertrain: powertrainGroup / sellingPriceInr,
      chassisBody: chassisBodyInr / sellingPriceInr,
      electricalElectronics: (electricalGroup + interiorAcInr) / sellingPriceInr,
      suspensionBrakesWheels: suspensionBrakesWheelsInr / sellingPriceInr,
      assemblyWarrantyOther: otherGroup / sellingPriceInr,
    },
  };
}
