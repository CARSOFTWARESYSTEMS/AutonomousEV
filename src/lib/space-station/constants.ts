// Physical constants and named educational assumptions for the
// /space/space-station simulators. Every number used by a simulator lives
// here (or in a named, exported assumption object next to its model) so the
// UI can show it and nothing is hidden inside a calculation. SI units.

export interface NamedConstant {
  symbol: string;
  name: string;
  value: number;
  unit: string;
  source: string;
}

/** Earth's standard gravitational parameter (WGS 84 / IERS value). */
export const MU_EARTH = 3.986004418e14; // m^3 s^-2
/** WGS 84 equatorial radius. */
export const R_EARTH = 6_378_137; // m
/** Earth's rotation rate relative to inertial space. */
export const OMEGA_EARTH = 7.2921150e-5; // rad s^-1
/** Total solar irradiance at 1 AU (approximate mean). */
export const SOLAR_CONSTANT = 1361; // W m^-2
/** Stefan–Boltzmann constant (CODATA 2018). */
export const STEFAN_BOLTZMANN = 5.670374419e-8; // W m^-2 K^-4
/** Global-mean outgoing longwave radiation from Earth (approximate). */
export const EARTH_IR = 240; // W m^-2
/** Global-mean Bond albedo of Earth (approximate). */
export const EARTH_ALBEDO = 0.3;
export const SECONDS_PER_DAY = 86_400;
export const SECONDS_PER_YEAR = 365.25 * SECONDS_PER_DAY;

/** Molar masses used for life-support stoichiometry (g mol^-1). */
export const MOLAR_MASS = {
  H2: 2.016,
  O2: 31.998,
  H2O: 18.015,
  CO2: 44.009,
  CH4: 16.043,
} as const;

export const PHYSICAL_CONSTANTS: NamedConstant[] = [
  { symbol: "μ", name: "Earth gravitational parameter", value: MU_EARTH, unit: "m³/s²", source: "WGS 84 / IERS conventions" },
  { symbol: "R⊕", name: "Earth equatorial radius", value: R_EARTH, unit: "m", source: "WGS 84" },
  { symbol: "ω⊕", name: "Earth rotation rate", value: OMEGA_EARTH, unit: "rad/s", source: "WGS 84" },
  { symbol: "S", name: "Solar irradiance at 1 AU", value: SOLAR_CONSTANT, unit: "W/m²", source: "Mean total solar irradiance (NASA / NOAA TSI records)" },
  { symbol: "σ", name: "Stefan–Boltzmann constant", value: STEFAN_BOLTZMANN, unit: "W/(m²·K⁴)", source: "CODATA 2018" },
  { symbol: "q_IR", name: "Earth outgoing longwave radiation", value: EARTH_IR, unit: "W/m²", source: "Global-mean Earth energy budget (approximate)" },
  { symbol: "a", name: "Earth albedo", value: EARTH_ALBEDO, unit: "–", source: "Global-mean Bond albedo (approximate)" },
];

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const round = (v: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};
