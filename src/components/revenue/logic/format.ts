// Indian number and currency formatting: 12,34,567 and ₹12.3 lakh.

const GROUPED = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Whole rupees with Indian digit grouping: ₹12,34,567. */
export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value < 0 ? "−" : "";
  return `${sign}₹${GROUPED.format(Math.abs(Math.round(value)))}`;
}

/** Rupees in lakh or crore for compact display: ₹4.5 lakh, ₹1.2 crore. Below a lakh, the full figure. */
export function formatINRShort(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  const trim = (n: number) => (n >= 100 ? Math.round(n).toString() : n.toFixed(1).replace(/\.0$/, ""));
  if (abs >= 1e7) return `${sign}₹${trim(abs / 1e7)} crore`;
  if (abs >= 1e5) return `${sign}₹${trim(abs / 1e5)} lakh`;
  return formatINR(value);
}

/** A count with Indian digit grouping. */
export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return GROUPED.format(Math.round(value));
}

export function formatPercent(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

/** A date written the Indian way: 26 Oct 2026. Accepts YYYY-MM-DD. */
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(match[3])} ${months[Number(match[2]) - 1]} ${match[1]}`;
}

/** A positive number from a form field, or 0. Accepts Indian-grouped input such as "1,20,000". */
export function parseAmount(input: string): number {
  const value = Number(String(input).replace(/[₹,\s]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : 0;
}
