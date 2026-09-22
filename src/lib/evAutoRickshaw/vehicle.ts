import type {
  CustomerRequirement,
  EnergyConsumptionResult,
  EngineeringOverrides,
  MassBreakdown,
  RangeBand,
  SimulatorAssumptions,
  Terrain,
  Traffic,
} from "./types";

/**
 * Concept-level glider mass (chassis + body + suspension + brakes + wheels +
 * motor + controller + electronics, EXCLUDING the battery pack). Scales
 * gently with seating architecture because a D+6 cabin needs a longer/
 * stronger structure than a D+3. This is a planning placeholder, not a
 * weighed prototype figure.
 */
export function gliderMassKg(
  requirement: CustomerRequirement,
  overrides: EngineeringOverrides,
): number {
  if (overrides.gliderMassKg !== undefined) return overrides.gliderMassKg;
  return 360 + (requirement.passengerCapacity - 3) * 18;
}

/**
 * Net additional energy from hilly terrain after accounting for partial regen
 * recovery on descents (a round trip's ascents and descents otherwise cancel
 * out, so this is deliberately a small correction, not a one-way climb force).
 */
export function terrainLossFactor(terrain: Terrain): number {
  const factors: Record<Terrain, number> = { flat: 1, mixed: 1.06, hilly: 1.16 };
  return factors[terrain];
}

/**
 * Net-of-regen stop-go loss multiplier applied to tractive energy. Heavier
 * traffic lowers the representative average speed (less aero drag) but adds
 * much more frequent accel/decel cycling with imperfect regen recovery — the
 * net real-world effect is still higher energy per km in heavier traffic.
 */
export function trafficLossFactor(traffic: Traffic): number {
  const factors: Record<Traffic, number> = { light: 1.05, medium: 1.25, heavy: 1.65 };
  return factors[traffic];
}

/**
 * A vehicle's "maximum speed requirement" is a top-speed capability target,
 * not the speed it actually averages over a duty cycle full of traffic
 * signals, congestion and stops. This converts max-speed capability into a
 * representative average driving speed for the energy-consumption model.
 */
export function representativeAverageSpeedKmh(maxSpeedKmh: number, traffic: Traffic): number {
  const factors: Record<Traffic, number> = { light: 0.72, medium: 0.58, heavy: 0.42 };
  return maxSpeedKmh * factors[traffic];
}

export function computeMassBreakdown(
  requirement: CustomerRequirement,
  overrides: EngineeringOverrides,
  batteryMassKg: number,
): MassBreakdown {
  const glider = gliderMassKg(requirement, overrides);
  const kerbMassKg = glider + batteryMassKg;
  const passengerMassKg = requirement.passengerCapacity * requirement.avgPassengerWeightKg;
  const driverMassKg = requirement.driverWeightKg;
  const luggageMassKg = requirement.luggageKg;
  const loadedMassKg = kerbMassKg + driverMassKg + passengerMassKg + luggageMassKg;

  return {
    gliderMassKg: glider,
    batteryMassKg,
    kerbMassKg,
    driverMassKg,
    passengerMassKg,
    luggageMassKg,
    loadedMassKg,
  };
}

/**
 * Simplified road-load energy model, evaluated at a representative average
 * duty-cycle speed (not the vehicle's top-speed capability):
 *
 *   Rolling:      Frr = Crr * m * g
 *   Aerodynamic:  Fad = 0.5 * rho * Cd * A * v^2
 *   Traction:     P   = (Frr + Fad) * v
 *
 * Grade is deliberately excluded from the base traction force: over a real
 * route, ascents and descents largely cancel (energy spent climbing is
 * partly recovered coasting/regen-braking down the other side), so a
 * constant one-way climb force would badly overstate consumption. Instead,
 * terrain and traffic each apply a small net loss factor on top of the ideal
 * traction energy, representing imperfect regen recovery, extra
 * accel/decel cycling and stop-go losses. Auxiliary load (base 12V/BMS/
 * controller draw plus AC when enabled) is added per km travelled.
 */
export function estimateEnergyConsumption(
  massKg: number,
  maxSpeedKmh: number,
  terrain: Terrain,
  traffic: Traffic,
  acEnabled: boolean,
  assumptions: SimulatorAssumptions,
  overrides: EngineeringOverrides,
): EnergyConsumptionResult {
  const avgSpeedKmh = representativeAverageSpeedKmh(maxSpeedKmh, traffic);
  const v = avgSpeedKmh / 3.6; // m/s
  const g = assumptions.gravityMS2;
  const crr = overrides.rollingResistanceCoefficient ?? assumptions.rollingResistanceCoefficient;
  const cd = overrides.dragCoefficient ?? assumptions.dragCoefficient;
  const area = overrides.frontalAreaM2 ?? assumptions.frontalAreaM2;
  const rho = assumptions.airDensityKgM3;

  const fRolling = crr * massKg * g;
  const fAero = 0.5 * rho * cd * area * v * v;
  const fIdeal = fRolling + fAero;

  const wattsRolling = fRolling * v;
  const wattsAero = fAero * v;

  const eta = overrides.drivetrainEfficiency ?? assumptions.drivetrainEfficiency;
  // Energy per km (Wh) = force(N) * 1000m / 3600 (J->Wh), then correct for driveline losses.
  const whPerKmTractionIdeal = fIdeal / 3.6 / eta;

  const traffic_ = trafficLossFactor(traffic);
  const terrain_ = terrainLossFactor(terrain);
  const combinedLoss = traffic_ * terrain_;
  const whPerKmTraction = whPerKmTractionIdeal * combinedLoss;

  const wattsTraction = wattsRolling + wattsAero; // ideal, pre-loss-factor
  const wattsTerrainTrafficLoss = (whPerKmTraction - whPerKmTractionIdeal) * 3.6 * eta;

  const auxiliaryLoadW = overrides.auxiliaryLoadW ?? 150;
  const acLoadW = acEnabled ? 700 : 0;
  const totalAuxW = auxiliaryLoadW + acLoadW;
  const whPerKmAux = avgSpeedKmh > 0 ? totalAuxW / avgSpeedKmh : 0;

  return {
    avgSpeedKmh,
    wattsRolling,
    wattsAero,
    wattsTerrainTrafficLoss,
    wattsTraction,
    trafficLossFactor: traffic_,
    terrainLossFactor: terrain_,
    whPerKmTraction,
    whPerKmAux,
    whPerKm: whPerKmTraction + whPerKmAux,
  };
}

/**
 * Estimated practical range across three load conditions, sharing the same
 * usable battery energy but varying the mass/consumption inputs.
 */
export function estimateRangeBand(
  usableEnergyWh: number,
  loadedMassKg: number,
  gliderPlusBatteryMassKg: number,
  requirement: CustomerRequirement,
  assumptions: SimulatorAssumptions,
  overrides: EngineeringOverrides,
): { band: RangeBand; energyByCondition: { light: EnergyConsumptionResult; typical: EnergyConsumptionResult; full: EnergyConsumptionResult } } {
  // Light load: kerb mass + driver only.
  const lightMassKg = gliderPlusBatteryMassKg + requirement.driverWeightKg;
  // Full load: kerb mass + driver + full-rated passenger mass (100 kg/seat) + max luggage (100 kg).
  const fullMassKg =
    gliderPlusBatteryMassKg + requirement.driverWeightKg + requirement.passengerCapacity * 100 + 100;

  const light = estimateEnergyConsumption(
    lightMassKg,
    requirement.maxSpeedKmh,
    requirement.terrain,
    requirement.traffic,
    requirement.acEnabled,
    assumptions,
    overrides,
  );
  const typical = estimateEnergyConsumption(
    loadedMassKg,
    requirement.maxSpeedKmh,
    requirement.terrain,
    requirement.traffic,
    requirement.acEnabled,
    assumptions,
    overrides,
  );
  const full = estimateEnergyConsumption(
    fullMassKg,
    requirement.maxSpeedKmh,
    requirement.terrain,
    requirement.traffic,
    requirement.acEnabled,
    assumptions,
    overrides,
  );

  return {
    band: {
      lightLoadKm: usableEnergyWh / light.whPerKm,
      typicalKm: usableEnergyWh / typical.whPerKm,
      fullLoadKm: usableEnergyWh / full.whPerKm,
    },
    energyByCondition: { light, typical, full },
  };
}
