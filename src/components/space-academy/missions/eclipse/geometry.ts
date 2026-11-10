// Where the satellite is at a given point in its orbit, matching the
// simulation's convention: each orbit starts as it leaves Earth's shadow and
// ends with the eclipse. The Sun is along +x; the shadow is the cylinder
// behind Earth along −x. Angles in radians.
import { EARTH_RADIUS_KM } from "./model";

/** Orbit angle for a phase in [0, 1): 0 is the shadow exit. */
export function orbitAngle(phase: number, altitudeKm: number) {
  const alpha = Math.asin(EARTH_RADIUS_KM / (EARTH_RADIUS_KM + altitudeKm));
  return Math.PI + alpha + 2 * Math.PI * phase;
}

export function inShadow(angle: number, altitudeKm: number) {
  const r = EARTH_RADIUS_KM + altitudeKm;
  return r * Math.cos(angle) < 0 && Math.abs(r * Math.sin(angle)) < EARTH_RADIUS_KM;
}
