import { estimateBatteryMassKg, recommendBatteryCapacityKWh, usableEnergyWh } from "./battery";
import { computeAvailableChargingWindowHours, estimateChargingTime, recommendCharger } from "./charging";
import { computeCostBreakdown } from "./cost";
import { OPTIMIZATION_PRIORITY_SETTINGS } from "./defaults";
import {
  DEFAULT_FINAL_DRIVE_RATIO,
  DEFAULT_GRADE_SPEED_KMH,
  DEFAULT_WHEEL_RADIUS_M,
  estimatePeakBatteryCurrentA,
  hillStartGradeabilityPct,
  powertrainWarning,
  recommendPowertrain,
  sustainedGradeabilityPct,
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

  // Optimization Priority sets the default reserve/degradation margin used to
  // size the battery; explicit Engineering-mode overrides always win over it.
  const prioritySetting = OPTIMIZATION_PRIORITY_SETTINGS[requirement.optimizationPriority];
  const effectiveOverrides: EngineeringOverrides = {
    reserveFraction: prioritySetting.reserveFraction,
    degradationAllowance: prioritySetting.degradationAllowance,
    ...overrides,
  };

  let capacityKWh = effectiveOverrides.batteryCapacityKWh ?? INITIAL_CAPACITY_GUESS_KWH;
  let requiredDailyEnergyWh = 0;

  for (let i = 0; i < CONVERGENCE_ITERATIONS; i++) {
    const batteryMassKg = estimateBatteryMassKg(capacityKWh, assumptions, effectiveOverrides);
    const mass = computeMassBreakdown(requirement, effectiveOverrides, batteryMassKg);
    const typicalEnergy = estimateEnergyConsumption(
      mass.loadedMassKg,
      requirement.maxSpeedKmh,
      requirement.terrain,
      requirement.traffic,
      requirement.acEnabled,
      assumptions,
      effectiveOverrides,
    );
    requiredDailyEnergyWh = requirement.dailyDistanceKm * typicalEnergy.whPerKm;

    if (effectiveOverrides.batteryCapacityKWh !== undefined) break;
    capacityKWh = recommendBatteryCapacityKWh(requiredDailyEnergyWh, assumptions, effectiveOverrides);
  }

  const batteryMassKg = estimateBatteryMassKg(capacityKWh, assumptions, effectiveOverrides);
  const mass = computeMassBreakdown(requirement, effectiveOverrides, batteryMassKg);
  const usableEnergy = usableEnergyWh(capacityKWh, assumptions, effectiveOverrides);
  const gliderPlusBattery = mass.gliderMassKg + mass.batteryMassKg;

  const { band: range, energyByCondition } = estimateRangeBand(
    usableEnergy,
    mass.loadedMassKg,
    gliderPlusBattery,
    requirement,
    assumptions,
    effectiveOverrides,
  );

  const fullMassKg = fullLoadMassKg(gliderPlusBattery, requirement);
  const gradeSpeedKmh = effectiveOverrides.gradeSpeedKmh ?? DEFAULT_GRADE_SPEED_KMH;
  const sizing = recommendPowertrain(
    mass.loadedMassKg,
    fullMassKg,
    requirement.maxSpeedKmh,
    requirement.terrain,
    gradeSpeedKmh,
    assumptions,
    effectiveOverrides,
  );

  const selectedPeakKw = effectiveOverrides.peakPowerKw ?? sizing.recommendedPeakKw;
  const selectedContinuousKw = effectiveOverrides.continuousPowerKw ?? sizing.recommendedContinuousKw;

  const sustainedGrade = sustainedGradeabilityPct(selectedPeakKw, fullMassKg, gradeSpeedKmh, assumptions, effectiveOverrides);
  const hillStartGrade =
    effectiveOverrides.motorPeakTorqueNm !== undefined
      ? hillStartGradeabilityPct(
          effectiveOverrides.motorPeakTorqueNm,
          effectiveOverrides.finalDriveRatio ?? DEFAULT_FINAL_DRIVE_RATIO,
          effectiveOverrides.wheelRadiusM ?? DEFAULT_WHEEL_RADIUS_M,
          fullMassKg,
          assumptions,
          effectiveOverrides,
        )
      : null;

  const peakBatteryCurrentA = estimatePeakBatteryCurrentA(selectedPeakKw, requirement.voltageClass, effectiveOverrides);
  const powertrainWarningMsg = powertrainWarning(
    selectedPeakKw,
    sizing.recommendedPeakKw,
    requirement.terrain,
    requirement.traffic,
    requirement.passengerCapacity,
    hillStartGrade,
  );

  const chargerEfficiency = effectiveOverrides.chargerEfficiency ?? assumptions.chargerEfficiency;
  const availableWindowHours = computeAvailableChargingWindowHours(
    requirement.chargingAvailability,
    requirement.opportunityChargingHours,
    effectiveOverrides,
  );
  const chargerRecommendation = recommendCharger(
    requirement.chargingAvailability,
    requiredDailyEnergyWh,
    availableWindowHours,
    chargerEfficiency,
  );
  const chargerPowerKw =
    effectiveOverrides.chargerPowerKw ?? (chargerRecommendation.recommendedCharger === "6.6kW" ? 6.6 : 3.3);
  const startSocPct = effectiveOverrides.startSocPct ?? 10;
  const targetSocPct = effectiveOverrides.targetSocPct ?? 100;
  const chargingTime = estimateChargingTime(capacityKWh, startSocPct, targetSocPct, chargerPowerKw, chargerEfficiency);

  const cost = computeCostBreakdown(
    requirement,
    capacityKWh,
    selectedPeakKw,
    chargerRecommendation.recommendedCharger,
    assumptions,
    effectiveOverrides,
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
      sustainedGradeabilityPct: sustainedGrade,
      gradeSpeedKmh,
      hillStartGradeabilityPct: hillStartGrade,
      peakBatteryCurrentA,
      warning: powertrainWarningMsg,
    },
    charging: {
      energyRequiredWh: chargingTime.energyRequiredWh,
      hoursTo80: chargingTime.hoursTo80,
      hoursToTarget: chargingTime.hoursToTarget,
      recommendedCharger: chargerRecommendation.recommendedCharger,
      recommendationNote: chargerRecommendation.recommendationNote,
      availableWindowHours,
      hoursNeededAt3_3kW: chargerRecommendation.hoursNeededAt3_3kW,
      hoursNeededAt6_6kW: chargerRecommendation.hoursNeededAt6_6kW,
    },
    cost,
    warnings,
    budgetStatus: budgetStatus(cost.sellingPriceInr, requirement.targetPriceInr),
  };
}
