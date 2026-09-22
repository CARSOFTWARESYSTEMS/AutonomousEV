/**
 * Centralized, sourced competitor data for the Market Benchmark section.
 *
 * Every field is either a verified published figure (with a source and
 * whether it is OEM or a secondary aggregator) or explicitly `null` where no
 * credible source could be found — never a guessed or interpolated value.
 * Researched and cross-checked 2026-09-22.
 */

export interface CompetitorSource {
  label: string;
  url: string;
  kind: "OEM" | "secondary";
}

export interface CompetitorSpec {
  id: string;
  name: string;
  manufacturer: string;
  seating: string;
  batteryChemistry: string | null;
  batteryCapacityKWh: number | null;
  motorPowerKw: number | null;
  motorPowerNote: string | null;
  /** Range figures are kept separate and labeled — never merged into one number. */
  certifiedRangeKm: number | null;
  publishedTypicalRangeKm: number | null;
  rangeNote: string | null;
  topSpeedKmh: number | null;
  gradeabilityPct: number | null;
  chargingTimeHours: number | null;
  chargingNote: string | null;
  /**
   * Unladen kerb weight ONLY — never GVW (gross/laden weight) or "dry
   * weight". These are frequently confused in secondary automotive listings
   * (a real example: a secondary source mislabeled Bajaj RE E-TEC 9.0's 708
   * kg GVW/dry-weight figure as "kerb weight", when its actual kerb weight
   * is 362 kg per the OEM's own financing arm and a second independent
   * secondary source). Verify against at least two sources before setting
   * this field, and use gvwKg for the gross figure instead of overloading
   * this one.
   */
  kerbWeightKg: number | null;
  /** Gross Vehicle Weight (laden) — kept separate from kerbWeightKg, never substituted for it. */
  gvwKg: number | null;
  vehicleWarranty: string | null;
  approxPriceInr: number | null;
  priceNote: string | null;
  sources: CompetitorSource[];
}

export const COMPETITORS: CompetitorSpec[] = [
  {
    id: "tvs-king-ev-max",
    name: "TVS King EV MAX",
    manufacturer: "TVS Motor Company",
    seating: "Driver + 3",
    batteryChemistry: "LFP",
    batteryCapacityKWh: 9.2,
    motorPowerKw: 11,
    motorPowerNote: "40 Nm peak torque; OEM does not split continuous vs peak power.",
    certifiedRangeKm: 179,
    publishedTypicalRangeKm: null,
    rangeNote: "OEM states a \"certified range\" of 179 km without explicitly naming the test standard.",
    topSpeedKmh: 60,
    gradeabilityPct: 31,
    chargingTimeHours: 3.5,
    chargingNote: "3 kW off-board charger; 0-80% in ~2h15m, 0-100% in ~3h30m.",
    kerbWeightKg: 457,
    gvwKg: null,
    vehicleWarranty: "6 years / 150,000 km",
    approxPriceInr: 328000,
    priceNote: "No OEM price published; two secondary figures found (₹2.95L and ₹3.28L) — shown here is the better-corroborated figure, state/variant-dependent.",
    sources: [
      { label: "TVS King EV MAX — official page", url: "https://www.tvsmotor.com/three-wheelers/king-ev-max", kind: "OEM" },
      { label: "CarDekho Trucks — TVS King EV MAX", url: "https://trucks.cardekho.com/en/trucks/tvs/king-ev-max", kind: "secondary" },
    ],
  },
  {
    id: "bajaj-re-etec-9-0",
    name: "Bajaj RE E-TEC 9.0",
    manufacturer: "Bajaj Auto",
    seating: "Driver + 3",
    batteryChemistry: "LFP",
    batteryCapacityKWh: 8.9,
    motorPowerKw: 4.5,
    motorPowerNote: "4.5 kW continuous, 36 Nm, PMS motor with 2-speed AMT.",
    certifiedRangeKm: 178,
    publishedTypicalRangeKm: null,
    rangeNote: "OEM brochure explicitly footnotes 178 km \"as per ARAI certificate.\"",
    topSpeedKmh: 45,
    gradeabilityPct: 29,
    chargingTimeHours: 4.5,
    chargingNote: "3-pin 16A on-board charger; full charge ~4h30m, under 3h to 80%.",
    // Verified 2026-09-22: an earlier version of this dataset listed 708 kg as kerb weight,
    // sourced from 91trucks.com — but that figure is actually GVW/dry weight. Bajaj's own
    // financing arm (bajajautocredit.com) and CarDekho both independently list 708 kg as
    // "GVW/Dry Weight" and separately give 362 kg as kerb weight. Corrected accordingly.
    kerbWeightKg: 362,
    gvwKg: 708,
    vehicleWarranty: "36 months / 80,000 km",
    approxPriceInr: 376000,
    priceNote: "Ex-showroom Delhi per secondary sources (₹3.27L–3.76L across states/variants); no OEM price published.",
    sources: [
      { label: "Bajaj RE E-TEC 9.0 — OEM brochure (PDF)", url: "https://www.bajajauto.com/-/media/assets/bajajauto/three-wheelers/ev/bajaj-re-etec-90.pdf", kind: "OEM" },
      { label: "Bajaj Auto Credit — RE E-TEC 9.0 (weight specs)", url: "https://www.bajajautocredit.com/three-wheeler-loan/bajaj-ev-re-e-tech-9.0", kind: "secondary" },
      { label: "CarDekho Trucks — Bajaj RE E-TEC 9.0 specifications", url: "https://trucks.cardekho.com/en/trucks/bajaj/re-e-tec-9-0/specifications", kind: "secondary" },
    ],
  },
  {
    id: "mahindra-treo-plus",
    name: "Mahindra Treo Plus",
    manufacturer: "Mahindra Last Mile Mobility",
    seating: "Driver + 3",
    batteryChemistry: "Li-ion",
    batteryCapacityKWh: 10.24,
    motorPowerKw: 8,
    motorPowerNote: "8 kW peak, 42 Nm peak torque, IP67-rated; continuous rating not published.",
    certifiedRangeKm: 167,
    publishedTypicalRangeKm: 150,
    rangeNote: "OEM publishes both an ARAI-certified figure (167 km) and a typical real-world figure (~150 km, \"depends on driving conditions\").",
    topSpeedKmh: 55,
    gradeabilityPct: null,
    chargingTimeHours: 4.5,
    chargingNote: "Full charge in ~4h30m per OEM; charger type/power not confirmed on the OEM page.",
    kerbWeightKg: null,
    gvwKg: null,
    vehicleWarranty: "5 years / 120,000 km",
    approxPriceInr: 373500,
    priceNote: "₹3.69L–3.78L ex-showroom Delhi across two variants; no OEM price published.",
    sources: [
      { label: "Mahindra Treo Plus — official page", url: "https://mahindralastmilemobility.com/treo-plus", kind: "OEM" },
      { label: "CarDekho Trucks — Mahindra Treo Plus", url: "https://trucks.cardekho.com/en/trucks/mahindra/treo-plus", kind: "secondary" },
    ],
  },
  {
    id: "piaggio-ape-e-city-ultra",
    name: "Piaggio Ape E-City Ultra",
    manufacturer: "Piaggio Vehicles",
    seating: "Driver + 3",
    batteryChemistry: "Li-ion",
    batteryCapacityKWh: 10.2,
    motorPowerKw: 9.5,
    motorPowerNote: "9.5 kW @ 2500 RPM, 45 Nm.",
    certifiedRangeKm: null,
    publishedTypicalRangeKm: 205,
    rangeNote: "Contested figure: OEM states \"205 ± 5 km\" typical range without an ARAI label; a secondary source separately claims an ARAI-certified 236 km. The two do not reconcile — treat both as unverified until a test certificate is checked.",
    topSpeedKmh: null,
    gradeabilityPct: 28,
    chargingTimeHours: 3.75,
    chargingNote: "~3h45m full charge; charger type/power not published by OEM or secondary sources.",
    kerbWeightKg: 448,
    gvwKg: null,
    vehicleWarranty: "5 years",
    approxPriceInr: 388000,
    priceNote: "₹3.88L ex-showroom per secondary source; effective price may be lower after state EV subsidies. No OEM price published.",
    sources: [
      { label: "Piaggio Ape E-City Ultra — official page", url: "https://piaggio-cv.co.in/electric/ape-e-city-ultra/", kind: "OEM" },
      { label: "e-vehicleinfo — Ape E-City Ultra / FX Maxx", url: "https://e-vehicleinfo.com/piaggios-ape-e-city-ultra-fx-maxx-electric-rickshaws/", kind: "secondary" },
    ],
  },
];

export const COMPETITOR_DATA_ACCESSED_DATE = "2026-09-22";
