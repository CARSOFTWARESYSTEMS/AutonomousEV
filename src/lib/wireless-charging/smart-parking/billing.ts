// Parking and charging billing (SP-MATH-010).
//
// Two independent ledgers. Parking: duration from the entry barrier to the
// payment, a free grace period, a first block and further blocks (each
// started block is charged), a daily cap, a reservation fee, configured
// discounts and tax. Charging: energy at the configured metering boundary —
// the charger's grid-side input or the energy into the battery — times the
// energy tariff. All money is integer minor units (paise, cents, fen) with an
// explicit rounding rule; energy is integer watt-hours. The tariffs below are
// illustrative configuration, not anyone's published prices, and the tax
// rates are placeholders that a deployment must set for its jurisdiction.
// Payment is simulated: no credential is ever collected.
import type { Currency, Region } from "./types";

export type Rounding = "half-up" | "up" | "down";

export interface Tariff {
  currency: Currency;
  /** Minor units per major unit. */
  minor: number;
  graceMin: number;
  firstBlockMin: number;
  firstBlock: number;
  blockMin: number;
  block: number;
  dailyCap: number;
  reservationFee: number;
  /** Percentage discounts, applied to parking before tax. */
  memberDiscountPct: number;
  accessibleDiscountPct: number;
  /** Charging energy price, minor units per kWh. */
  energyPerKWh: number;
  /** Where charging energy is metered. */
  metering: "grid-side" | "vehicle-side";
  /** Tax rate, percent (placeholder; set per jurisdiction). */
  taxPct: number;
  /** Final amounts rounded to this many minor units. */
  roundTo: number;
  rounding: Rounding;
}

export const TARIFFS: Record<Region, Tariff> = {
  IN: { currency: "INR", minor: 100, graceMin: 10, firstBlockMin: 60, firstBlock: 3000, blockMin: 30, block: 1500, dailyCap: 25000, reservationFee: 2000, memberDiscountPct: 10, accessibleDiscountPct: 50, energyPerKWh: 1800, metering: "grid-side", taxPct: 18, roundTo: 100, rounding: "half-up" },
  US: { currency: "USD", minor: 100, graceMin: 10, firstBlockMin: 60, firstBlock: 300, blockMin: 30, block: 150, dailyCap: 2500, reservationFee: 200, memberDiscountPct: 10, accessibleDiscountPct: 0, energyPerKWh: 45, metering: "grid-side", taxPct: 8, roundTo: 1, rounding: "half-up" },
  CN: { currency: "CNY", minor: 100, graceMin: 15, firstBlockMin: 60, firstBlock: 1000, blockMin: 30, block: 500, dailyCap: 8000, reservationFee: 500, memberDiscountPct: 10, accessibleDiscountPct: 50, energyPerKWh: 160, metering: "grid-side", taxPct: 6, roundTo: 10, rounding: "half-up" },
};

/** Integer rounding of a minor-unit amount (which may carry a fraction from a product) to a multiple of `step`. */
export function roundMinor(amount: number, step: number, rule: Rounding): number {
  const q = amount / step;
  // Guard against binary noise on exact halves (e.g. 2.5000000001).
  const n = Math.round(q * 1e6) / 1e6;
  const r = rule === "up" ? Math.ceil(n) : rule === "down" ? Math.floor(n) : Math.floor(n + 0.5);
  return r * step;
}

/** Percentage of an integer amount, as an exact rational rounded half-up to a minor unit. */
const pct = (amount: number, p: number) => Math.floor((amount * Math.round(p * 100) + 5000) / 10000);

export interface ParkingBill {
  durationS: number;
  billableMin: number;
  blocks: number;
  base: number;
  capped: boolean;
  reservation: number;
  discount: number;
  net: number;
  tax: number;
  total: number;
  lines: string[];
}

/** Whole minutes of parking from s of time (a started minute counts). */
export const billableMinutes = (seconds: number) => Math.max(0, Math.ceil(seconds / 60 - 1e-9));

export function parkingBill(t: Tariff, durationS: number, opts: { reservation: boolean; member: boolean; accessible: boolean }): ParkingBill {
  const minutes = billableMinutes(durationS);
  const lines: string[] = [];
  let base = 0;
  let blocks = 0;
  if (minutes > t.graceMin) {
    base = t.firstBlock;
    blocks = 1;
    const beyond = minutes - t.firstBlockMin;
    if (beyond > 0) {
      const extra = Math.ceil(beyond / t.blockMin);
      blocks += extra;
      base += extra * t.block;
    }
  }
  // The cap applies per started 24 h.
  const days = Math.max(1, Math.ceil(minutes / 1440));
  const cap = days * t.dailyCap;
  const capped = base > cap;
  if (capped) base = cap;
  lines.push(minutes <= t.graceMin ? `Within the ${t.graceMin}-minute grace period` : `${blocks} block${blocks > 1 ? "s" : ""} for ${minutes} min${capped ? " (daily cap)" : ""}`);
  const reservation = opts.reservation ? t.reservationFee : 0;
  if (reservation) lines.push("Reservation fee");
  const discountPct = Math.max(opts.member ? t.memberDiscountPct : 0, opts.accessible ? t.accessibleDiscountPct : 0);
  const discount = pct(base, discountPct);
  if (discount) lines.push(`Discount ${discountPct} %`);
  const net = base + reservation - discount;
  const tax = pct(net, t.taxPct);
  const total = roundMinor(net + tax, t.roundTo, t.rounding);
  return { durationS, billableMin: minutes, blocks, base, capped, reservation, discount, net, tax, total, lines };
}

export interface ChargingBill {
  /** Energy at the metering boundary, Wh (integer). */
  meteredWh: number;
  /** Both boundaries, Wh, for the receipt. */
  gridWh: number;
  vehicleWh: number;
  energyCost: number;
  tax: number;
  total: number;
  boundary: Tariff["metering"];
}

/** Energy price × metered energy, in exact integer arithmetic (Wh × minor/kWh ÷ 1000, rounded half-up). */
export function chargingBill(t: Tariff, gridJ: number, vehicleJ: number): ChargingBill {
  const gridWh = Math.round(gridJ / 3600);
  const vehicleWh = Math.round(vehicleJ / 3600);
  const meteredWh = t.metering === "grid-side" ? gridWh : vehicleWh;
  const energyCost = Math.floor((meteredWh * t.energyPerKWh + 500) / 1000);
  const tax = pct(energyCost, t.taxPct);
  return { meteredWh, gridWh, vehicleWh, energyCost, tax, total: roundMinor(energyCost + tax, t.roundTo, t.rounding), boundary: t.metering };
}

export const LOCALES: Record<Region, { locale: string; timeZone: string; languages: string[] }> = {
  IN: { locale: "en-IN", timeZone: "Asia/Kolkata", languages: ["en"] },
  US: { locale: "en-US", timeZone: "America/Los_Angeles", languages: ["en"] },
  CN: { locale: "zh-CN", timeZone: "Asia/Shanghai", languages: ["zh-CN", "en"] },
};

/** A minor-unit amount as localised currency text. */
export function money(region: Region, minor: number): string {
  const t = TARIFFS[region];
  try {
    return new Intl.NumberFormat(LOCALES[region].locale, { style: "currency", currency: t.currency }).format(minor / t.minor);
  } catch {
    return `${t.currency} ${(minor / t.minor).toFixed(2)}`;
  }
}

export type PaymentStatus = "captured" | "pending" | "failed";

export interface PaymentRecord {
  id: string;
  provider: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  at: number;
  /** Always simulated in the public twin. */
  simulated: true;
}

/** Regional payment adapters (interfaces only: a real provider needs its own integration and authorisation). */
export const PAYMENT_PROVIDERS: Record<Region, string> = { IN: "UPI-class adapter (simulated)", US: "Card-network adapter (simulated)", CN: "Mobile-wallet adapter (simulated)" };
