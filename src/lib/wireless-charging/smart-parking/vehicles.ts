// Synthetic vehicle registry and regional plate formats.
//
// Every identity here is generated: plates use series that are not issued
// (India "ZZ", USA a leading "0", China the test character 测), RFID tags and
// QR tokens are random hex. Nothing is a real person's vehicle. Dimensions
// are representative of each class, not of a model.
import type { Rng } from "../math";
import type { Powertrain, Region, VehicleClass, VehicleProfile } from "./types";

export const CLASSES: Record<VehicleClass, { length: number; width: number; height: number; wheelbase: number; scale: number; capacity: number }> = {
  compact: { length: 3.95, width: 1.74, height: 1.5, wheelbase: 2.5, scale: 0.86, capacity: 40 },
  sedan: { length: 4.7, width: 1.85, height: 1.45, wheelbase: 2.9, scale: 1, capacity: 60 },
  suv: { length: 4.85, width: 1.93, height: 1.68, wheelbase: 2.95, scale: 1.04, capacity: 77 },
  van: { length: 5.1, width: 1.98, height: 1.95, wheelbase: 3.1, scale: 1.09, capacity: 70 },
};

/** Realistic automotive paints (no brand colours). */
export const PAINTS = ["#e4e7ea", "#c9ced4", "#8b929a", "#3a4048", "#17191d", "#1f3550", "#7d1a22", "#2c4a3a", "#b8a98f", "#f2f2ee"] as const;

export interface PlateFormat {
  region: Region;
  name: string;
  /** Accepts the issued formats the recogniser validates against. */
  pattern: RegExp;
  example: string;
  note: string;
}

export const PLATE_FORMATS: Record<Region, PlateFormat> = {
  IN: { region: "IN", name: "India (state series and BH series)", pattern: /^([A-Z]{2} ?\d{1,2} ?[A-Z]{0,3} ?\d{4}|\d{2} ?BH ?\d{4} ?[A-Z]{1,2})$/, example: "ZZ 07 EV 4821", note: "Synthetic plates use the unissued state code ZZ." },
  US: { region: "US", name: "USA (state formats vary; 5–7 alphanumerics)", pattern: /^[A-Z0-9]{2,4}[ -]?[A-Z0-9]{2,4}$/, example: "0EVT 482", note: "Formats differ by state; synthetic plates start with 0 and are not checked against any state's issued series." },
  CN: { region: "CN", name: "China (GA 36: province, letter, five or six characters; six for new-energy vehicles)", pattern: /^[一-龥][A-Z]·?[A-HJ-NP-Z0-9]{5,6}$/, example: "测A·D4821", note: "Synthetic plates use the test character 测 instead of a province." },
};

const L = "ABCDEFGHJKLMNPRSTUVWXYZ";
const pick = <T>(r: Rng, xs: readonly T[]) => xs[Math.floor(r.next() * xs.length) % xs.length];
const digits = (r: Rng, n: number) => Array.from({ length: n }, () => String(Math.floor(r.next() * 10))).join("");
const hex = (r: Rng, n: number) => Array.from({ length: n }, () => "0123456789ABCDEF"[Math.floor(r.next() * 16)]).join("");

export function syntheticPlate(region: Region, r: Rng, electric: boolean): string {
  if (region === "IN") return `ZZ ${digits(r, 2)} ${pick(r, ["EV", "XE", "AB", "CD"])} ${digits(r, 4)}`;
  if (region === "US") return `0${pick(r, [...L])}${pick(r, [...L])}${pick(r, [...L])} ${digits(r, 3)}`;
  return `测${pick(r, [...L])}·${electric ? pick(r, ["D", "F"]) : pick(r, [...L])}${digits(r, electric ? 5 : 4)}`;
}

export const validPlate = (region: Region, plate: string) => PLATE_FORMATS[region].pattern.test(plate);

export interface Mix {
  /** Share of arrivals that are electric. */
  evShare: number;
  /** Share of electric vehicles with a compatible wireless receiver. */
  wirelessShare: number;
  /** Share of electric vehicles that ask to charge. */
  chargeShare: number;
  reservationShare: number;
  accessibleShare: number;
  memberShare: number;
  /** Share of arrivals with no access right (turned away unless visitors may enter). */
  deniedShare: number;
  obstructedShare: number;
  /** Mean planned stay, s. */
  meanStay: number;
  stayModel: "exponential" | "lognormal";
}

export const DEFAULT_MIX: Mix = { evShare: 0.45, wirelessShare: 0.6, chargeShare: 0.85, reservationShare: 0.2, accessibleShare: 0.05, memberShare: 0.35, deniedShare: 0.03, obstructedShare: 0.05, meanStay: 2.5 * 3600, stayModel: "lognormal" };

/** Lognormal with the given mean and a coefficient of variation of 0.8 (parking stays are right-skewed). */
export function sampleStay(r: Rng, mean: number, model: Mix["stayModel"]): number {
  if (model === "exponential") return -Math.log(1 - r.next()) * mean;
  const cv = 0.8;
  const s2 = Math.log(1 + cv * cv);
  const mu = Math.log(mean) - s2 / 2;
  return Math.exp(mu + Math.sqrt(s2) * r.normal());
}

let counter = 0;
/** Resets the id counter (tests and fresh facilities). */
export const resetVehicleIds = (start = 0) => {
  counter = start;
};

export function syntheticVehicle(region: Region, r: Rng, mix: Mix = DEFAULT_MIX, over: Partial<VehicleProfile> = {}, seq?: number): VehicleProfile {
  const n = seq ?? ++counter;
  const powertrain: Powertrain = r.next() < mix.evShare ? "electric" : "conventional";
  const cls: VehicleClass = powertrain === "electric" ? pick(r, ["compact", "sedan", "sedan", "suv"] as const) : pick(r, ["compact", "sedan", "suv", "van"] as const);
  const dims = CLASSES[over.cls ?? cls];
  const electric = (over.powertrain ?? powertrain) === "electric";
  const wireless = electric && r.next() < mix.wirelessShare;
  const reservation = r.next() < mix.reservationShare;
  const member = r.next() < mix.memberShare;
  const base: VehicleProfile = {
    id: `V-${String(n).padStart(4, "0")}`,
    cls,
    length: dims.length,
    width: dims.width,
    height: dims.height,
    powertrain,
    wirelessCompatible: wireless,
    capacityKWh: electric ? dims.capacity : 0,
    soc: electric ? 0.15 + r.next() * 0.55 : 0,
    targetSoc: 0.8,
    wantsCharging: electric && r.next() < mix.chargeShare,
    plate: syntheticPlate(region, r, electric),
    rfid: member ? `RF-${hex(r, 8)}` : null,
    qr: reservation ? `QR-${hex(r, 10)}` : null,
    accessiblePermit: r.next() < mix.accessibleShare,
    member,
    plateObstructed: r.next() < mix.obstructedShare,
    denied: r.next() < mix.deniedShare,
    stay: Math.max(600, Math.min(10 * 3600, sampleStay(r, mix.meanStay, mix.stayModel))),
    paint: pick(r, PAINTS),
  };
  const v = { ...base, ...over };
  const d = CLASSES[v.cls];
  return { ...v, length: d.length, width: d.width, height: d.height, capacityKWh: v.powertrain === "electric" ? (over.capacityKWh ?? d.capacity) : 0, wirelessCompatible: v.powertrain === "electric" && v.wirelessCompatible, wantsCharging: v.powertrain === "electric" && v.wantsCharging };
}

export const footprintOf = (v: Pick<VehicleProfile, "cls">) => ({ length: CLASSES[v.cls].length, width: CLASSES[v.cls].width, wheelbase: CLASSES[v.cls].wheelbase });
/** Receiver ahead of the vehicle centre, m (0.6 m on the reference sedan, scaled with the class). */
export const receiverOffset = (v: Pick<VehicleProfile, "cls">) => 0.6 * CLASSES[v.cls].scale;
