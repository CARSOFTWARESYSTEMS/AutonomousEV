import { PEAK_POWER_MAX_KW, PEAK_POWER_MIN_KW } from "./defaults";
import type { EngineeringOverrides, SimulatorAssumptions, Terrain, VoltageClass } from "./types";

/**
 * Indicative peak-gradeability sizing target by terrain profile. These are
 * design targets for motor sizing, not homologated gradeability figures —
 * they must be validated on a prototype.
 */
export function terrainGradeTargetPct(terrain: Terrain): number {
  const targets: Record<Terrain, number> = { flat: 8, mixed: 12, hilly: 18 };
  return targets[terrain];
}

export const DEFAULT_GRADE_SPEED_KMH = 25;
export const DEFAULT_WHEEL_RADIUS_M = 0.25;
export const DEFAULT_FINAL_DRIVE_RATIO = 9;

function tractiveForceN(
  massKg: number,
  speedMs: number,
  gradePct: number,
  assumptions: SimulatorAssumptions,
  overrides: EngineeringOverrides,
): number {
  const g = assumptions.gravityMS2;
  const crr = overrides.rollingResistanceCoefficient ?? assumptions.rollingResistanceCoefficient;
  const cd = overrides.dragCoefficient ?? assumptions.dragCoefficient;
  const area = overrides.frontalAreaM2 ?? assumptions.frontalAreaM2;
  const rho = assumptions.airDensityKgM3;
  const theta = Math.atan(gradePct / 100);

  const fRolling = crr * massKg * g * Math.cos(theta);
  const fAero = 0.5 * rho * cd * area * speedMs * speedMs;
  const fGrade = massKg * g * Math.sin(theta);
  return fRolling + fAero + fGrade;
}

/** Continuous power to sustain the required cruise speed on flat ground, with a 10% margin. */
export function continuousPowerRequirementKw(
  massKg: number,
  maxSpeedKmh: number,
  assumptions: SimulatorAssumptions,
  overrides: EngineeringOverrides,
): number {
  const v = maxSpeedKmh / 3.6;
  const eta = overrides.drivetrainEfficiency ?? assumptions.drivetrainEfficiency;
  const force = tractiveForceN(massKg, v, 0, assumptions, overrides);
  const watts = (force * v) / eta;
  return (watts / 1000) * 1.1;
}

/** Peak power to sustain the terrain-based gradeability target at full load and the specified grade speed. */
export function hillClimbPowerRequirementKw(
  fullLoadMassKg: number,
  gradePct: number,
  gradeSpeedKmh: number,
  assumptions: SimulatorAssumptions,
  overrides: EngineeringOverrides,
): number {
  const v = gradeSpeedKmh / 3.6;
  const eta = overrides.drivetrainEfficiency ?? assumptions.drivetrainEfficiency;
  const force = tractiveForceN(fullLoadMassKg, v, gradePct, assumptions, overrides);
  const watts = (force * v) / eta;
  return watts / 1000;
}

export interface PowertrainSizing {
  recommendedContinuousKw: number;
  recommendedPeakKw: number;
}

export function recommendPowertrain(
  loadedMassKg: number,
  fullLoadMassKg: number,
  maxSpeedKmh: number,
  terrain: Terrain,
  gradeSpeedKmh: number,
  assumptions: SimulatorAssumptions,
  overrides: EngineeringOverrides,
): PowertrainSizing {
  const continuousKw = continuousPowerRequirementKw(loadedMassKg, maxSpeedKmh, assumptions, overrides);
  const gradeTarget = terrainGradeTargetPct(terrain);
  const hillKw = hillClimbPowerRequirementKw(fullLoadMassKg, gradeTarget, gradeSpeedKmh, assumptions, overrides);

  const peakKw = Math.max(continuousKw * 1.4, hillKw * 1.05);
  const recommendedPeakKw = clampPeakPower(roundHalf(peakKw));
  const recommendedContinuousKw = Math.min(roundHalf(continuousKw), recommendedPeakKw * 0.6);

  return { recommendedContinuousKw, recommendedPeakKw };
}

export function clampPeakPower(peakKw: number): number {
  return Math.min(PEAK_POWER_MAX_KW, Math.max(PEAK_POWER_MIN_KW, peakKw));
}

function roundHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * Sustained Gradeability @ specified speed — power-limited, always
 * computable from peak power alone: at a steady non-zero speed, P = F*v is
 * valid physics regardless of the motor's torque curve, as long as the
 * motor can sustain that power at that speed (a fair concept-level
 * assumption). This is NOT a hill-start / very-low-speed figure.
 */
export function sustainedGradeabilityPct(
  selectedPeakKw: number,
  fullLoadMassKg: number,
  gradeSpeedKmh: number,
  assumptions: SimulatorAssumptions,
  overrides: EngineeringOverrides,
): number {
  const v = gradeSpeedKmh / 3.6;
  const eta = overrides.drivetrainEfficiency ?? assumptions.drivetrainEfficiency;
  const availableForce = (selectedPeakKw * 1000 * eta) / v;

  const g = assumptions.gravityMS2;
  const crr = overrides.rollingResistanceCoefficient ?? assumptions.rollingResistanceCoefficient;
  const cd = overrides.dragCoefficient ?? assumptions.dragCoefficient;
  const area = overrides.frontalAreaM2 ?? assumptions.frontalAreaM2;
  const rho = assumptions.airDensityKgM3;
  const fAero = 0.5 * rho * cd * area * v * v;

  // Small-angle approximation: Frr ~= Crr * m * g (cos(theta) ~ 1 at these grades).
  const sinTheta = (availableForce - crr * fullLoadMassKg * g - fAero) / (fullLoadMassKg * g);
  if (sinTheta <= 0) return 0;
  const clampedSin = Math.min(sinTheta, 0.98);
  const theta = Math.asin(clampedSin);
  return Math.max(0, Math.tan(theta) * 100);
}

/**
 * Hill-Start / Very-Low-Speed Gradeability — torque-limited, not
 * power-limited (as speed -> 0, P = F*v breaks down since it implies
 * unbounded force for any finite power). This requires an actual motor
 * peak-torque assumption to be meaningful: available wheel force is
 * torque * finalDriveRatio * drivetrainEfficiency / wheelRadius, capped by
 * whatever the controller's current limit and the motor's torque curve
 * actually allow — figures this simulator cannot invent responsibly.
 * Callers should only invoke this when `motorPeakTorqueNm` has been
 * explicitly supplied (see engine.ts) and otherwise report that hill-start
 * capability requires torque-curve + controller current-limit validation.
 */
export function hillStartGradeabilityPct(
  motorPeakTorqueNm: number,
  finalDriveRatio: number,
  wheelRadiusM: number,
  fullLoadMassKg: number,
  assumptions: SimulatorAssumptions,
  overrides: EngineeringOverrides,
): number {
  const eta = overrides.drivetrainEfficiency ?? assumptions.drivetrainEfficiency;
  const wheelForceN = (motorPeakTorqueNm * finalDriveRatio * eta) / wheelRadiusM;

  const g = assumptions.gravityMS2;
  const crr = overrides.rollingResistanceCoefficient ?? assumptions.rollingResistanceCoefficient;
  // Aero and cos(theta) correction are negligible at near-zero hill-start speed.
  const sinTheta = (wheelForceN - crr * fullLoadMassKg * g) / (fullLoadMassKg * g);
  if (sinTheta <= 0) return 0;
  const clampedSin = Math.min(sinTheta, 0.98);
  return Math.max(0, Math.tan(Math.asin(clampedSin)) * 100);
}

const NOMINAL_VOLTAGE_MAP: Record<VoltageClass, number> = {
  "60V": 60,
  "72V": 72,
  "76.8V": 76.8,
  "96V": 96,
};

export function estimatePeakBatteryCurrentA(
  peakPowerKw: number,
  voltageClass: VoltageClass,
  overrides: EngineeringOverrides,
): number {
  const controllerEfficiency = overrides.controllerEfficiency ?? 0.94;
  const nominalVoltage = NOMINAL_VOLTAGE_MAP[voltageClass];
  return (peakPowerKw * 1000) / controllerEfficiency / nominalVoltage;
}

export function powertrainWarning(
  selectedPeakKw: number,
  recommendedPeakKw: number,
  terrain: Terrain,
  traffic: string,
  passengerCapacity: number,
  hillStartGradeAbilityPct: number | null,
): string | null {
  if (selectedPeakKw < recommendedPeakKw * 0.85) {
    return "Powertrain may be undersized for the selected load and terrain.";
  }
  if (
    terrain === "hilly" &&
    passengerCapacity === 6 &&
    hillStartGradeAbilityPct !== null &&
    hillStartGradeAbilityPct < terrainGradeTargetPct("hilly")
  ) {
    return "Hill-start torque may be insufficient for a fully loaded D+6 vehicle on hilly terrain — validate motor peak torque, final-drive ratio and controller current limit.";
  }
  if (selectedPeakKw > recommendedPeakKw * 1.4 && terrain === "flat" && traffic !== "heavy") {
    return "Cost optimization opportunity: selected motor may exceed the duty-cycle requirement.";
  }
  return null;
}
