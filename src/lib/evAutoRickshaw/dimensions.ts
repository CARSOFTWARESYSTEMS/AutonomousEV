import { DEFAULT_WHEEL_RADIUS_M } from "./powertrain";
import type { ConfigurationWarning, CustomerRequirement, EngineeringOverrides } from "./types";

/**
 * Concept-level vehicle packaging envelope for the General Arrangement
 * drawing. Every field here is a CONCEPT_TARGET — a starting-point
 * engineering assumption for exploration, not a finalized or validated
 * dimension. Wheel diameter is deliberately NOT an independent constant:
 * it derives from the same wheelRadiusM used by the powertrain model, so
 * the drawing and the gradeability/current calculations never disagree
 * about wheel size.
 */
export interface VehicleDimensions {
  overallLengthMm: number;
  overallWidthMm: number;
  overallHeightMm: number;
  wheelbaseMm: number;
  frontTrackMm: number;
  rearTrackMm: number;
  groundClearanceMm: number;
  frontOverhangMm: number;
  rearOverhangMm: number;
  wheelDiameterMm: number;
  cabinFloorHeightMm: number;
}

/**
 * CONCEPT_TARGET starting envelope. Chosen to be internally consistent
 * (wheelbase + overhangs ~= overall length; wheel diameter matches the
 * 0.25 m wheelRadiusM already used elsewhere in the simulator for a
 * 12-inch-class commercial tyre) rather than picked independently.
 * Sourced from the packaging considerations in the spec (D+6 seating,
 * battery package, turning clearance, competitor envelopes) — not a
 * supplier or CAD-validated figure.
 */
export const CONCEPT_TARGET_DIMENSIONS: VehicleDimensions = {
  overallLengthMm: 3250,
  overallWidthMm: 1475,
  overallHeightMm: 1850,
  wheelbaseMm: 2200,
  frontTrackMm: 1250,
  rearTrackMm: 1200,
  groundClearanceMm: 190,
  frontOverhangMm: 550,
  rearOverhangMm: 500,
  wheelDiameterMm: DEFAULT_WHEEL_RADIUS_M * 2 * 1000,
  cabinFloorHeightMm: 450,
};

/**
 * Merges Engineering-mode dimension overrides onto the concept target
 * envelope. wheelDiameterMm always derives from wheelRadiusM (shared with
 * the powertrain model) rather than being independently overridable, so
 * there is exactly one place that defines wheel size.
 */
export function computeVehicleDimensions(overrides: EngineeringOverrides): VehicleDimensions {
  return {
    overallLengthMm: overrides.overallLengthMm ?? CONCEPT_TARGET_DIMENSIONS.overallLengthMm,
    overallWidthMm: overrides.overallWidthMm ?? CONCEPT_TARGET_DIMENSIONS.overallWidthMm,
    overallHeightMm: overrides.overallHeightMm ?? CONCEPT_TARGET_DIMENSIONS.overallHeightMm,
    wheelbaseMm: overrides.wheelbaseMm ?? CONCEPT_TARGET_DIMENSIONS.wheelbaseMm,
    frontTrackMm: overrides.frontTrackMm ?? CONCEPT_TARGET_DIMENSIONS.frontTrackMm,
    rearTrackMm: overrides.rearTrackMm ?? CONCEPT_TARGET_DIMENSIONS.rearTrackMm,
    groundClearanceMm: overrides.groundClearanceMm ?? CONCEPT_TARGET_DIMENSIONS.groundClearanceMm,
    frontOverhangMm: CONCEPT_TARGET_DIMENSIONS.frontOverhangMm,
    rearOverhangMm: CONCEPT_TARGET_DIMENSIONS.rearOverhangMm,
    wheelDiameterMm: (overrides.wheelRadiusM ?? DEFAULT_WHEEL_RADIUS_M) * 2 * 1000,
    cabinFloorHeightMm: CONCEPT_TARGET_DIMENSIONS.cabinFloorHeightMm,
  };
}

const MIN_WHEELBASE_FOR_D6_MM = 2100;
const MIN_WIDTH_FOR_D6_MM = 1400;
const MIN_GROUND_CLEARANCE_MM = 160;
const STABILITY_HEIGHT_TO_TRACK_RATIO = 1.6;

/**
 * Engineering warnings about obvious packaging conflicts — not homologation
 * verdicts, and never a substitute for CAD packaging, rollover/stability
 * analysis or structural validation.
 */
export function validateDimensions(
  dimensions: VehicleDimensions,
  requirement: Pick<CustomerRequirement, "passengerCapacity">,
): ConfigurationWarning[] {
  const warnings: ConfigurationWarning[] = [];

  if (requirement.passengerCapacity === 6 && dimensions.wheelbaseMm < MIN_WHEELBASE_FOR_D6_MM) {
    warnings.push({
      severity: "caution",
      title: "Wheelbase Too Short",
      message: `Selected wheelbase (${dimensions.wheelbaseMm} mm) may not support the current D+6 passenger/battery packaging assumptions.`,
    });
  }

  if (requirement.passengerCapacity >= 5 && dimensions.overallWidthMm < MIN_WIDTH_FOR_D6_MM) {
    warnings.push({
      severity: "caution",
      title: "Width Review Required",
      message: `Selected cabin width (${dimensions.overallWidthMm} mm) may be insufficient for the selected passenger arrangement.`,
    });
  }

  if (dimensions.groundClearanceMm < MIN_GROUND_CLEARANCE_MM) {
    warnings.push({
      severity: "caution",
      title: "Ground Clearance Review",
      message: `Selected ground clearance (${dimensions.groundClearanceMm} mm) may create underbody/battery protection concerns.`,
    });
  }

  const avgTrackMm = (dimensions.frontTrackMm + dimensions.rearTrackMm) / 2;
  if (avgTrackMm > 0 && dimensions.overallHeightMm / avgTrackMm > STABILITY_HEIGHT_TO_TRACK_RATIO) {
    warnings.push({
      severity: "caution",
      title: "Stability Review Required",
      message: "Vehicle height/track relationship requires rollover/stability analysis before design freeze.",
    });
  }

  return warnings;
}
