// Two-body circular-orbit model with a cylindrical Earth shadow and an
// exponential atmosphere for drag. Educational model — not mission design data.
import { MU_EARTH, R_EARTH, OMEGA_EARTH, SECONDS_PER_DAY, SECONDS_PER_YEAR, clamp } from "./constants";

export interface CircularOrbit {
  altitudeKm: number;
  semiMajorAxisM: number;
  periodS: number;
  velocityMs: number;
  orbitsPerDay: number;
}

/** T = 2π √(a³/μ), v = √(μ/a), for a circular orbit of radius a = R⊕ + h. */
export function circularOrbit(altitudeKm: number): CircularOrbit {
  const a = R_EARTH + altitudeKm * 1000;
  const periodS = 2 * Math.PI * Math.sqrt(a ** 3 / MU_EARTH);
  return {
    altitudeKm,
    semiMajorAxisM: a,
    periodS,
    velocityMs: Math.sqrt(MU_EARTH / a),
    orbitsPerDay: SECONDS_PER_DAY / periodS,
  };
}

/**
 * Fraction of a circular orbit spent in Earth's (cylindrical) shadow.
 * β is the angle between the orbit plane and the Sun vector.
 * f = (1/π)·acos( √(h² + 2R⊕h) / ((R⊕ + h)·cos β) ), and 0 when |β| ≥ β*.
 */
export function eclipseFraction(altitudeKm: number, betaDeg = 0): number {
  const h = altitudeKm * 1000;
  const r = R_EARTH + h;
  const betaStar = Math.asin(R_EARTH / r);
  const beta = Math.abs((betaDeg * Math.PI) / 180);
  if (beta >= betaStar) return 0;
  const arg = Math.sqrt(h * h + 2 * R_EARTH * h) / (r * Math.cos(beta));
  return Math.acos(clamp(arg, -1, 1)) / Math.PI;
}

/**
 * Exponential atmosphere, piecewise by altitude band: ρ = ρ₀·exp(−(h − h₀)/H).
 * Base values follow the widely used textbook table in Vallado,
 * "Fundamentals of Astrodynamics and Applications". Real density varies by
 * an order of magnitude or more with solar activity, which the
 * solar-activity factor only crudely represents.
 */
export const ATMOSPHERE_TABLE: { h0: number; rho0: number; H: number }[] = [
  { h0: 150, rho0: 2.07e-9, H: 22.523 },
  { h0: 180, rho0: 5.464e-10, H: 29.74 },
  { h0: 200, rho0: 2.789e-10, H: 37.105 },
  { h0: 250, rho0: 7.248e-11, H: 45.546 },
  { h0: 300, rho0: 2.418e-11, H: 53.628 },
  { h0: 350, rho0: 9.518e-12, H: 53.298 },
  { h0: 400, rho0: 3.725e-12, H: 58.515 },
  { h0: 450, rho0: 1.585e-12, H: 60.828 },
  { h0: 500, rho0: 6.967e-13, H: 63.822 },
  { h0: 600, rho0: 1.454e-13, H: 71.835 },
  { h0: 700, rho0: 3.614e-14, H: 88.667 },
  { h0: 800, rho0: 1.17e-14, H: 124.64 },
  { h0: 900, rho0: 5.245e-15, H: 181.05 },
  { h0: 1000, rho0: 3.019e-15, H: 268 },
];

/** Illustrative multipliers on the tabulated density. */
export const SOLAR_ACTIVITY_FACTOR = { low: 0.5, moderate: 1, high: 3 } as const;
export type SolarActivity = keyof typeof SOLAR_ACTIVITY_FACTOR;

export function atmosphericDensity(altitudeKm: number, activity: SolarActivity = "moderate"): number {
  const h = clamp(altitudeKm, ATMOSPHERE_TABLE[0].h0, 1100);
  let band = ATMOSPHERE_TABLE[0];
  for (const row of ATMOSPHERE_TABLE) if (h >= row.h0) band = row;
  return band.rho0 * Math.exp(-(h - band.h0) / band.H) * SOLAR_ACTIVITY_FACTOR[activity];
}

export interface DragInput {
  altitudeKm: number;
  massKg: number;
  dragAreaM2: number;
  dragCoefficient: number;
  activity: SolarActivity;
}

export interface DragResult {
  densityKgM3: number;
  ballisticCoefficient: number; // m / (Cd A), kg/m²
  dragAccelerationMs2: number;
  altitudeLossKmPerDay: number;
  reboostDeltaVMsPerYear: number;
}

/**
 * Drag deceleration a_D = ½ρv²·C_D·A/m. For a near-circular orbit the
 * semi-major axis decays at da/dt = −√(μa)·ρ·C_D·A/m. The Δv needed each
 * year to hold altitude is approximately a_D × (seconds per year).
 */
export function dragDecay(input: DragInput): DragResult {
  const { altitudeKm, massKg, dragAreaM2, dragCoefficient, activity } = input;
  const orbit = circularOrbit(altitudeKm);
  const rho = atmosphericDensity(altitudeKm, activity);
  const areaToMass = (dragCoefficient * dragAreaM2) / massKg;
  const aD = 0.5 * rho * orbit.velocityMs ** 2 * areaToMass;
  const dadt = -Math.sqrt(MU_EARTH * orbit.semiMajorAxisM) * rho * areaToMass; // m/s
  return {
    densityKgM3: rho,
    ballisticCoefficient: massKg / (dragCoefficient * dragAreaM2),
    dragAccelerationMs2: aD,
    altitudeLossKmPerDay: (-dadt * SECONDS_PER_DAY) / 1000,
    reboostDeltaVMsPerYear: aD * SECONDS_PER_YEAR,
  };
}

export interface GroundTrackPoint {
  latDeg: number;
  lonDeg: number;
  /** True where the track wraps across ±180° and a plotted line should break. */
  wrap: boolean;
}

/**
 * Sub-satellite points for a circular orbit starting at the ascending node
 * over longitude 0: lat = asin(sin i·sin u), lon = atan2(cos i·sin u, cos u) − ω⊕t.
 * Ignores nodal precession (J2) — adequate for showing the westward shift.
 */
export function groundTrack(inclinationDeg: number, altitudeKm: number, orbits = 3, pointsPerOrbit = 90): GroundTrackPoint[] {
  const { periodS } = circularOrbit(altitudeKm);
  const inc = (inclinationDeg * Math.PI) / 180;
  const n = (2 * Math.PI) / periodS;
  const total = Math.round(orbits * pointsPerOrbit);
  const points: GroundTrackPoint[] = [];
  let prevLon: number | null = null;
  for (let k = 0; k <= total; k++) {
    const t = (k / pointsPerOrbit) * periodS;
    const u = n * t;
    const lat = Math.asin(Math.sin(inc) * Math.sin(u));
    let lon = Math.atan2(Math.cos(inc) * Math.sin(u), Math.cos(u)) - OMEGA_EARTH * t;
    lon = ((((lon + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
    const lonDeg = (lon * 180) / Math.PI;
    points.push({
      latDeg: (lat * 180) / Math.PI,
      lonDeg,
      wrap: prevLon !== null && Math.abs(lonDeg - prevLon) > 180,
    });
    prevLon = lonDeg;
  }
  return points;
}

/** Westward shift of successive ascending nodes per orbit (degrees). */
export function nodeShiftPerOrbitDeg(altitudeKm: number): number {
  return (OMEGA_EARTH * circularOrbit(altitudeKm).periodS * 180) / Math.PI;
}

export interface OrbitPreset {
  id: string;
  label: string;
  altitudeKm: number;
  inclinationDeg: number;
  massKg: number;
  dragAreaM2: number;
  note: string;
}

// Educational examples only. The ISS-like row uses rounded, publicly
// reported orders of magnitude and is not an ISS operational dataset.
export const ORBIT_PRESETS: OrbitPreset[] = [
  { id: "iss-like", label: "ISS-like (educational)", altitudeKm: 415, inclinationDeg: 51.6, massKg: 420_000, dragAreaM2: 1_500, note: "Rounded values of the order NASA publishes for the ISS; drag area is an illustrative assumption." },
  { id: "low-leo", label: "Low LEO, small station", altitudeKm: 350, inclinationDeg: 42, massKg: 80_000, dragAreaM2: 600, note: "Generic example showing how quickly drag grows at lower altitude." },
  { id: "high-leo", label: "Higher LEO", altitudeKm: 550, inclinationDeg: 51.6, massKg: 80_000, dragAreaM2: 600, note: "Generic example: less drag, but more debris exposure and launch energy." },
];
