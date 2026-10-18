// Every value the toolkit shows carries where it came from. These helpers make
// a Sourced value and turn one into text that can never read "undefined",
// "NaN" or "Infinity".
import type { Provenance, Sourced } from "./types";

export const PROVENANCE: Record<Provenance, { label: string; family: "measured" | "user" | "manufacturer" | "thirdparty" | "simulated" | "estimated" | "calculated" | "unknown" }> = {
  MEASURED: { label: "MEASURED", family: "measured" },
  USER_ENTERED: { label: "USER ENTERED", family: "user" },
  MANUFACTURER_VERIFIED: { label: "MANUFACTURER VERIFIED", family: "manufacturer" },
  THIRD_PARTY_DOCUMENTED: { label: "THIRD-PARTY DOCUMENTED", family: "thirdparty" },
  SIMULATED: { label: "SIMULATED", family: "simulated" },
  ESTIMATED: { label: "ESTIMATED", family: "estimated" },
  CALCULATED: { label: "CALCULATED", family: "calculated" },
  NOT_MEASURED: { label: "NOT MEASURED", family: "unknown" },
  NOT_AVAILABLE: { label: "NOT AVAILABLE", family: "unknown" },
  UNKNOWN: { label: "UNKNOWN", family: "unknown" },
};

/** The states a technician can give a real-vehicle reading. */
export const REAL_FIELD_PROVENANCE: readonly Provenance[] = ["MEASURED", "USER_ENTERED", "NOT_MEASURED", "NOT_AVAILABLE", "UNKNOWN"];

/** Specification fields (nominal voltage, rated capacity) may also come from documentation. */
export const SPEC_FIELD_PROVENANCE: readonly Provenance[] = ["USER_ENTERED", "MANUFACTURER_VERIFIED", "THIRD_PARTY_DOCUMENTED", "NOT_MEASURED", "NOT_AVAILABLE", "UNKNOWN"];

export const SOURCE_CONFLICT = "Sources disagree — confirm on the pack label.";

export const UNVERIFIED_SPEC = "Technical specification not verified.";
export const NOT_AVAILABLE = "Not available.";
export const NOT_MEASURED = "NOT MEASURED";

export const unknown = <T>(note?: string): Sourced<T> => ({ value: null, provenance: "UNKNOWN", note });
export const simulated = <T>(value: T, unit?: string): Sourced<T> => ({ value, provenance: "SIMULATED", unit });
export const estimated = <T>(value: T, unit?: string): Sourced<T> => ({ value, provenance: "ESTIMATED", unit });
export const notAvailable = <T>(unit?: string): Sourced<T> => ({ value: null, provenance: "NOT_AVAILABLE", unit });

/** A number fit to show, or null when it is missing or not finite. */
export function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Rounds without the float noise that differs between engines (and would break hydration). */
export function round(value: number, digits = 0): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

/** A number with its unit, or the right words when there is no number. */
export function formatNumber(value: unknown, unit = "", digits = 0, empty = NOT_AVAILABLE): string {
  const n = finite(value);
  if (n === null) return empty;
  const text = round(n, digits).toFixed(digits);
  return unit ? `${text} ${unit}` : text;
}

/** What a Sourced value reads as, honouring its provenance when there is no value. */
export function formatSourced(item: Sourced<unknown> | undefined, digits = 0): string {
  if (!item) return NOT_AVAILABLE;
  const { value, provenance, unit } = item;
  if (item.conflict) return SOURCE_CONFLICT;
  // A value without a trustworthy origin is never shown, even if one was attached.
  if (value === null || value === undefined || provenance === "UNKNOWN" || provenance === "NOT_MEASURED" || provenance === "NOT_AVAILABLE") {
    if (provenance === "NOT_MEASURED") return NOT_MEASURED;
    if (provenance === "UNKNOWN") return UNVERIFIED_SPEC;
    return NOT_AVAILABLE;
  }
  if (typeof value === "number") return formatNumber(value, unit, digits);
  if (typeof value === "boolean") return value ? "Enabled" : "Disabled";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  const text = String(value).trim();
  return text ? (unit ? `${text} ${unit}` : text) : NOT_AVAILABLE;
}

/** Simulated values must never be presented as measured: any value a simulation produced keeps that label. */
export function isSimulationOnly(item: Sourced<unknown>): boolean {
  return item.provenance === "SIMULATED";
}
