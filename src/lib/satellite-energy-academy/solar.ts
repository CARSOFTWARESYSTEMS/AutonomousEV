/** Isolated educational model v1. No atmosphere, albedo, temperature or wiring losses.
 * G is direct irradiance perpendicular to the rays, NOT panel-plane irradiance.
 * theta is measured between the front-surface normal and the direction to the Sun.
 */
export interface SolarInputs {
  angleDeg: number;
  irradianceWm2: number;
  areaM2: number;
  efficiencyPercent: number;
}

export const SOLAR_LIMITS: Record<keyof SolarInputs, readonly [number, number]> = {
  angleDeg: [0, 180], irradianceWm2: [0, 1400], areaM2: [0, 2], efficiencyPercent: [0, 100],
};

export function solarPower(input: SolarInputs) {
  for (const key of Object.keys(SOLAR_LIMITS) as (keyof SolarInputs)[]) {
    const [min, max] = SOLAR_LIMITS[key];
    if (!Number.isFinite(input[key]) || input[key] < min || input[key] > max) {
      throw new RangeError(`${key} must be finite and between ${min} and ${max}`);
    }
  }
  // Exactly zero at grazing incidence; no negative or backside generation.
  const incidence = input.angleDeg >= 90 ? 0 : Math.cos(input.angleDeg * Math.PI / 180);
  const efficiency = input.efficiencyPercent / 100;
  const faceOnW = input.irradianceWm2 * input.areaM2 * efficiency;
  const incidentW = input.irradianceWm2 * input.areaM2 * incidence;
  const electricalW = incidentW * efficiency;
  return { incidence, incidentW, electricalW, unconvertedW: incidentW - electricalW, faceOnW };
}

export function angleCurve(input: SolarInputs) {
  return Array.from({ length: 91 }, (_, angleDeg) => ({ angleDeg, powerW: solarPower({ ...input, angleDeg }).electricalW }));
}

export function constantPowerEnergy(powerW: number, durationSeconds: number) {
  if (![powerW, durationSeconds].every(v => Number.isFinite(v) && v >= 0)) throw new RangeError("Power and time must be finite and nonnegative");
  return { joules: powerW * durationSeconds, wattHours: powerW * durationSeconds / 3600 };
}
