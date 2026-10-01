// Reference orbit model: circular, sun-synchronous-like low Earth orbit around a
// rotating spherical Earth with a fixed Sun direction. Educational fidelity —
// no drag, J2 or precession. Coordinates are an Earth-centred inertial frame
// in the three.js convention (Y = north), distances in kilometres.
import type { Vec3 } from "../types";
import { DEG, add, clamp, cross, dot, length, normalize, rotateY, scale, smoothstep, sub } from "../lib/math";

export const EARTH_RADIUS_KM = 6371;
export const MU_KM3_S2 = 398600.4418;
export const EARTH_ROTATION_RAD_S = 7.2921159e-5;

export interface GeoPoint {
  latDeg: number;
  lonDeg: number;
}

/** Illustrative site only: no operational ground station is implied. */
export const GROUND_STATION: GeoPoint & { name: string; label: string } = {
  name: "Bengaluru",
  label: "ILLUSTRATIVE GROUND STATION — BENGALURU",
  latDeg: 12.97,
  lonDeg: 77.59,
};

export const OBSERVATION_TARGET: GeoPoint & { name: string; label: string } = {
  name: "Himalayan glacier region",
  label: "ILLUSTRATIVE TARGET — HIMALAYA",
  latDeg: 31.0,
  lonDeg: 79.0,
};

export const ORBIT_REFERENCE = {
  altitudeKm: 525,
  inclinationDeg: 97.5,
  /** Local solar time at the target when the spacecraft passes over it (descending). */
  targetLocalSolarTimeH: 10.5,
  sunDeclinationDeg: 10,
  elevationMaskDeg: 10,
} as const;

const SEMI_MAJOR_KM = EARTH_RADIUS_KM + ORBIT_REFERENCE.altitudeKm;
export const MEAN_MOTION_RAD_S = Math.sqrt(MU_KM3_S2 / SEMI_MAJOR_KM ** 3);
export const ORBIT_PERIOD_S = (2 * Math.PI) / MEAN_MOTION_RAD_S;
export const ORBIT_SPEED_KM_S = MEAN_MOTION_RAD_S * SEMI_MAJOR_KM;

const INCLINATION = ORBIT_REFERENCE.inclinationDeg * DEG;
const SIN_I = Math.sin(INCLINATION);
const COS_I = Math.cos(INCLINATION);

/** Unit vector toward the Sun (right ascension 0, fixed over the short timescales shown). */
export const SUN_DIRECTION: Vec3 = normalize([
  Math.cos(ORBIT_REFERENCE.sunDeclinationDeg * DEG),
  Math.sin(ORBIT_REFERENCE.sunDeclinationDeg * DEG),
  0,
]);

// ── Epoch design ──────────────────────────────────────────────────────────
// Orbit time t = 0 is defined as the moment the spacecraft flies over the
// observation target on a descending (southbound) pass at the reference local
// solar time. The node and Earth rotation phase are solved from that.
const HOUR_ANGLE = (ORBIT_REFERENCE.targetLocalSolarTimeH - 12) * 15 * DEG;
/** Argument of latitude at the target overflight (descending leg). */
const ARG_LAT_EPOCH = Math.PI - Math.asin(Math.sin(OBSERVATION_TARGET.latDeg * DEG) / SIN_I);
const RA_FROM_NODE = Math.atan2(Math.sin(ARG_LAT_EPOCH) * COS_I, Math.cos(ARG_LAT_EPOCH));
/** Right ascension of the ascending node. */
export const RAAN = HOUR_ANGLE - RA_FROM_NODE;
/** Earth rotation angle at t = 0. */
const EARTH_ROTATION_EPOCH = HOUR_ANGLE - OBSERVATION_TARGET.lonDeg * DEG;
const SIN_RAAN = Math.sin(RAAN);
const COS_RAAN = Math.cos(RAAN);

export const earthRotationAt = (t: number) => EARTH_ROTATION_EPOCH + EARTH_ROTATION_RAD_S * t;
export const argumentOfLatitudeAt = (t: number) => ARG_LAT_EPOCH + MEAN_MOTION_RAD_S * t;

/** Earth-fixed unit vector for a latitude / longitude (matches the equirectangular Earth texture). */
export function geoToUnit(point: GeoPoint): Vec3 {
  const lat = point.latDeg * DEG;
  const lon = point.lonDeg * DEG;
  return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)];
}

export function unitToGeo(v: Vec3): GeoPoint {
  const u = normalize(v);
  return { latDeg: Math.asin(clamp(u[1], -1, 1)) / DEG, lonDeg: Math.atan2(-u[2], u[0]) / DEG };
}

function orbitUnit(u: number): Vec3 {
  const cu = Math.cos(u);
  const su = Math.sin(u);
  // Classical frame (z north) → scene frame (X = x, Y = z, Z = -y).
  const x = cu * COS_RAAN - su * COS_I * SIN_RAAN;
  const y = cu * SIN_RAAN + su * COS_I * COS_RAAN;
  const z = su * SIN_I;
  return [x, z, -y];
}

export interface OrbitState {
  /** Inertial position, km. */
  position: Vec3;
  /** Unit velocity direction. */
  velocityDir: Vec3;
  /** Unit vector from Earth's centre through the spacecraft. */
  zenith: Vec3;
  /** Unit orbit normal (angular momentum direction). */
  normal: Vec3;
}

export function orbitStateAt(t: number): OrbitState {
  const u = argumentOfLatitudeAt(t);
  const zenith = orbitUnit(u);
  const velocityDir = orbitUnit(u + Math.PI / 2);
  return { position: scale(zenith, SEMI_MAJOR_KM), velocityDir, zenith, normal: cross(zenith, velocityDir) };
}

/** Inertial position of an Earth-fixed surface point at orbit time t, km. */
export function surfacePointAt(point: GeoPoint, t: number, altitudeKm = 0): Vec3 {
  return scale(rotateY(geoToUnit(point), earthRotationAt(t)), EARTH_RADIUS_KM + altitudeKm);
}

/** Latitude / longitude directly beneath the spacecraft. */
export function subSatellitePoint(t: number): GeoPoint {
  return unitToGeo(rotateY(orbitStateAt(t).zenith, -earthRotationAt(t)));
}

/**
 * Fraction of sunlight reaching the spacecraft: 1 in full sun, 0 in Earth's
 * shadow, with a short smooth edge so lighting does not snap. Cylindrical
 * shadow model.
 */
export function sunFractionAt(t: number): number {
  const { position } = orbitStateAt(t);
  const along = dot(position, SUN_DIRECTION);
  if (along >= 0) return 1;
  const radial = length(sub(position, scale(SUN_DIRECTION, along)));
  return smoothstep(EARTH_RADIUS_KM - 25, EARTH_RADIUS_KM + 25, radial);
}

export const isSunlitAt = (t: number) => sunFractionAt(t) > 0.5;

export interface StationGeometry {
  elevationDeg: number;
  rangeKm: number;
}

/** Elevation of the spacecraft above the local horizon of a surface point, and the slant range. */
export function lookAngles(point: GeoPoint, t: number): StationGeometry {
  const site = surfacePointAt(point, t);
  const toSat = sub(orbitStateAt(t).position, site);
  const rangeKm = length(toSat);
  const elevationDeg = Math.asin(clamp(dot(toSat, normalize(site)) / rangeKm, -1, 1)) / DEG;
  return { elevationDeg, rangeKm };
}

/** First time in [from, to] where `fn` crosses from below to at-or-above `level` (or the reverse). */
export function findCrossing(
  fn: (t: number) => number,
  level: number,
  from: number,
  to: number,
  direction: "rising" | "falling",
  stepS = 2,
): number | null {
  const step = to >= from ? stepS : -stepS;
  let prevT = from;
  let prev = fn(from);
  for (let t = from + step; step > 0 ? t <= to : t >= to; t += step) {
    const value = fn(t);
    // Normalise so the scan always sees time increasing.
    const [aT, a, bT, b] = step > 0 ? [prevT, prev, t, value] : [t, value, prevT, prev];
    const crossed = direction === "rising" ? a < level && b >= level : a >= level && b < level;
    if (crossed) {
      let lo = aT;
      let hi = bT;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        const below = fn(mid) < level;
        if ((direction === "rising") === below) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    prevT = t;
    prev = value;
  }
  return null;
}

export interface PassWindow {
  aosS: number;
  losS: number;
  closestApproachS: number;
  maxElevationDeg: number;
}

/** The first pass over `point` that rises at or after `from`. */
export function findPass(point: GeoPoint, from: number, maskDeg: number = ORBIT_REFERENCE.elevationMaskDeg): PassWindow | null {
  const elevation = (t: number) => lookAngles(point, t).elevationDeg;
  const aosS = findCrossing(elevation, maskDeg, from, from + 2 * ORBIT_PERIOD_S, "rising", 5);
  if (aosS === null) return null;
  const losS = findCrossing(elevation, maskDeg, aosS + 1, aosS + ORBIT_PERIOD_S / 2, "falling", 5);
  if (losS === null) return null;
  let closestApproachS = aosS;
  let maxElevationDeg = maskDeg;
  for (let t = aosS; t <= losS; t += 1) {
    const e = elevation(t);
    if (e > maxElevationDeg) {
      maxElevationDeg = e;
      closestApproachS = t;
    }
  }
  return { aosS, losS, closestApproachS, maxElevationDeg };
}

/** Earth-fixed ground-track unit vectors sampled across [from, to]. */
export function groundTrack(from: number, to: number, samples: number): Vec3[] {
  const points: Vec3[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = from + ((to - from) * i) / samples;
    points.push(rotateY(orbitStateAt(t).zenith, -earthRotationAt(t)));
  }
  return points;
}

/** Inertial orbit ring as unit vectors, with whether each point is sunlit. */
export function orbitRing(samples: number): { points: Vec3[]; sunlit: boolean[] } {
  const points: Vec3[] = [];
  const sunlit: boolean[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (ORBIT_PERIOD_S * i) / samples;
    points.push(orbitStateAt(t).zenith);
    sunlit.push(isSunlitAt(t));
  }
  return { points, sunlit };
}

/** Where a ray from the spacecraft hits the Earth's surface (inertial km), or null if it misses. */
export function intersectEarth(origin: Vec3, direction: Vec3): Vec3 | null {
  const d = normalize(direction);
  const b = dot(origin, d);
  const c = dot(origin, origin) - EARTH_RADIUS_KM ** 2;
  const disc = b * b - c;
  if (disc < 0) return null;
  const s = -b - Math.sqrt(disc);
  return s > 0 ? add(origin, scale(d, s)) : null;
}

// Named instants on the reference orbit, relative to the target overflight.
const eclipseExit = findCrossing(sunFractionAt, 0.5, 0, -ORBIT_PERIOD_S, "rising", 5);
const eclipseEntry = findCrossing(sunFractionAt, 0.5, 0, ORBIT_PERIOD_S, "falling", 5);
const stationPass = findPass(GROUND_STATION, -60);

if (eclipseExit === null || eclipseEntry === null || stationPass === null) {
  throw new Error("Satellite Explorer: reference orbit has no eclipse or no station pass — check ORBIT_REFERENCE.");
}

export const ORBIT_EVENTS = {
  /** Spacecraft leaves Earth's shadow on the revolution that images the target. */
  eclipseExitS: eclipseExit,
  /** Overflight of the observation target. */
  targetS: 0,
  /** The ground-station pass that follows the target overflight. */
  pass: stationPass,
  /** Spacecraft enters Earth's shadow again. */
  eclipseEntryS: eclipseEntry,
} as const;

/** Fraction of each orbit spent in eclipse on the reference orbit. */
export const ECLIPSE_FRACTION = 1 - (eclipseEntry - eclipseExit) / ORBIT_PERIOD_S;
