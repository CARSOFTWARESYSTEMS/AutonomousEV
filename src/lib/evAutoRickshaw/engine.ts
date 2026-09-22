import { estimateBatteryMassKg, recommendBatteryCapacityKWh, usableEnergyWh } from "./battery";
import { estimateChargingTime, recommendCharger } from "./charging";
import { computeCostBreakdown } from "./cost";
import {
  achievableGradeabilityPct,
  estimatePeakBatteryCurrentA,
  powertrainWarning,
  recommendPowertrain,
} from "./powertrain";
import type {
  CustomerRequirement,
  EngineeringOverrides,
  SimulatorAssumptions,
  SimulatorOutputs,
} from "./types";
import { budgetStatus, buildConfigurationWarnings, sanitizeRequirement } from "./validation";
import { computeMassBreakdown, estimateEnergyConsumption, estimateRangeBand } from "./vehicle";

const INITIAL_CAPACITY_GUESS_KWH = 11;
const CONVERGENCE_ITERATIONS = 3;

function fullLoadMassKg(gliderPlusBatteryMassKg: number, requirement: CustomerRequirement): number {
  return gliderPlusBatteryMassKg + requirement.driverWeightKg + requirement.passengerCapacity * 100 + 100;
}

/**
 * Runs the full concept-level engineering + cost simulation for a given
 * requirement/overrides/assumptions set. This is the single orchestration
 * point every UI surface should call — no calculation logic belongs in
 * components.
 *
 * Battery capacity and vehicle mass are mutually dependent (a bigger battery
 * is heavier, and a heavier vehicle needs more energy per km), so when the
 * battery is not manually overridden this runs a short fixed-point loop that
 * converges in a couple of iterations given how small the battery mass is
 * relative to total vehicle mass.
 */
export function runSimulation(
  rawRequirement: CustomerRequirement,
  overrides: EngineeringOverrides,
  assumptions: SimulatorAssumptions,
): SimulatorOutputs {
  const requirement = sanitizeRequirement(rawRequirement);

  let capacityKWh = overrides.batteryCapacityKWh ?? INITIAL_CAPACITY_GUESS_KWH;
  let requiredDailyEnergyWh = 0;

  for (let i = 0; i < CONVERGENCE_ITERATIONS; i++) {
    const batteryMassKg = estimateBatteryMassKg(capacityKWh, assumptions, overrides);
    const mass = computeMassBreakdown(requirement, overrides, batteryMassKg);
    const typicalEnergy = estimateEnergyConsumption(
      mass.loadedMassKg,
      requirement.maxSpeedKmh,
      requirement.terrain,
      requirement.traffic,
      requirement.acEnabled,
      assumptions,
      overrides,
    );
    requiredDailyEnergyWh = requirement.dailyDistanceKm * typicalEnergy.whPerKm;

    if (overrides.batteryCapacityKWh !== undefined) break;
    capacityKWh = recommendBatteryCapacityKWh(requiredDailyEnergyWh, assumptions, overrides);
  }

  const batteryMassKg = estimateBatteryMassKg(capacityKWh, assumptions, overrides);
  const mass = computeMassBreakdown(requirement, overrides, batteryMassKg);
  const usableEnergy = usableEnergyWh(capacityKWh, assumptions, overrides);
  const gliderPlusBattery = mass.gliderMassKg + mass.batteryMassKg;

  const { band: range, energyByCondition } = estimateRangeBand(
    usableEnergy,
    mass.loadedMassKg,
    gliderPlusBattery,
    requirement,
    assumptions,
    overrides,
  );

  const fullMassKg = fullLoadMassKg(gliderPlusBattery, requirement);
  const sizing = recommendPowertrain(
    mass.loadedMassKg,
    fullMassKg,
    requirement.maxSpeedKmh,
    requirement.terrain,
    assumptions,
    overrides,
  );

  const selectedPeakKw = overrides.peakPowerKw ?? sizing.recommendedPeakKw;
  const selectedContinuousKw = overrides.continuousPowerKw ?? sizing.recommendedContinuousKw;
  const maxGradeAbilityPct = achievableGradeabilityPct(selectedPeakKw, fullMassKg, assumptions, overrides);
  const peakBatteryCurrentA = estimatePeakBatteryCurrentA(selectedPeakKw, requirement.voltageClass, overrides);
  const powertrainWarningMsg = powertrainWarning(
    selectedPeakKw,
    sizing.recommendedPeakKw,
    requirement.terrain,
    requirement.traffic,
  );

  const chargerRecommendation = recommendCharger(
    requirement.chargingAvailability,
    requirement.dailyDistanceKm,
    range.typicalKm,
  );
  const chargerPowerKw =
    overrides.chargerPowerKw ?? (chargerRecommendation.recommendedCharger === "6.6kW" ? 6.6 : 3.3);
  const startSocPct = overrides.startSocPct ?? 10;
  const targetSocPct = overrides.targetSocPct ?? 100;
  const chargingTime = estimateChargingTime(
    capacityKWh,
    startSocPct,
    targetSocPct,
    chargerPowerKw,
    assumptions,
    overrides.chargerEfficiency,
  );

  const cost = computeCostBreakdown(
    requirement,
    capacityKWh,
    selectedPeakKw,
    chargerRecommendation.recommendedCharger,
    assumptions,
    overrides,
  );

  const warnings = buildConfigurationWarnings(requirement, range, cost.sellingPriceInr, powertrainWarningMsg);

  return {
    mass,
    energy: {
      typical: energyByCondition.typical,
      lightLoad: energyByCondition.light,
      fullLoad: energyByCondition.full,
    },
    range,
    battery: {
      capacityKWh,
      voltageClass: requirement.voltageClass,
      chemistry: requirement.chemistry,
      massKg: mass.batteryMassKg,
      usableEnergyWh: usableEnergy,
      requiredDailyEnergyWh,
    },
    powertrain: {
      continuousPowerKw: selectedContinuousKw,
      peakPowerKw: selectedPeakKw,
      maxGradeAbilityPct,
      peakBatteryCurrentA,
      warning: powertrainWarningMsg,
    },
    charging: {
      energyRequiredWh: chargingTime.energyRequiredWh,
      hoursTo80: chargingTime.hoursTo80,
      hoursToTarget: chargingTime.hoursToTarget,
      recommendedCharger: chargerRecommendation.recommendedCharger,
      recommendationNote: chargerRecommendation.recommendationNote,
    },
    cost,
    warnings,
    budgetStatus: budgetStatus(cost.sellingPriceInr, requirement.targetPriceInr),
  };
}
