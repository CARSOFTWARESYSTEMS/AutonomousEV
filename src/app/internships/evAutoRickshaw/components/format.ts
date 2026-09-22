export function formatInr(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(value));
}

export function formatInrLakh(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `₹${(value / 100000).toFixed(2)}L`;
}

export function formatKm(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${Math.round(value)} km`;
}

export function formatKWh(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(1)} kWh`;
}

export function formatKg(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${Math.round(value)} kg`;
}

export function formatHours(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

export function formatPct(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(fractionDigits)}%`;
}

export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
