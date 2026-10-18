// EVeium Cosmo / Comet / Czar — publicly documented battery data.
//
// Only what a recorded source states is published. Each value lists every
// source claim, including ones that disagree, with the source's category and
// the date EV.ENGINEER read it. Where sources conflict (Czar capacity), no
// single value is published: the technician confirms it on the pack label.
//
// Nothing here describes the internal pack: cell chemistry subtype, cell
// format, series/parallel layout, BMS, protocol, connector, fuse, limits,
// location and removal sequence are UNKNOWN until an authoritative source is
// added. Adding one later is a data change only (see EVEIUM_UNKNOWN_FIELDS).
import { round, unknown } from "@/lib/ev-battery-toolkit/provenance";
import type { Confidence, SourceReference, SpecSource, Sourced, Vehicle, VehicleBatterySpec } from "@/lib/ev-battery-toolkit/types";

export const EVEIUM_VERIFIED_DATE = "2026-10-18";

export const EVEIUM_SOURCES: Record<string, SpecSource> = {
  "eveium-scooters": {
    id: "eveium-scooters",
    title: "EVeium scooter specifications",
    publisher: "EVeium Smart Mobility (manufacturer website)",
    url: "https://eveium.in/scooters/",
    category: "MANUFACTURER",
    verifiedDate: EVEIUM_VERIFIED_DATE,
  },
  "eveium-home": {
    id: "eveium-home",
    title: "EVeium home page — scooter cards and features",
    publisher: "EVeium Smart Mobility (manufacturer website)",
    url: "https://eveium.in/",
    category: "MANUFACTURER",
    verifiedDate: EVEIUM_VERIFIED_DATE,
  },
  "autocarpro-2022": {
    id: "autocarpro-2022",
    title: "Hyderabad-based firm enters India EV market with three scooters",
    publisher: "Autocar Professional",
    url: "https://autocarpro.in/news-national/hyderabadbased-firm-enters-india-ev-market-with-three-scooters-92244",
    category: "INDUSTRY_REPORT",
    published: "2022-07-19",
    verifiedDate: EVEIUM_VERIFIED_DATE,
  },
  "rushlane-2022": {
    id: "rushlane-2022",
    title: "New EVeium electric scooters launch — price, range",
    publisher: "Rushlane",
    url: "https://www.rushlane.com/new-eveium-electric-scooters-launch-price-range-12443674.html",
    category: "THIRD_PARTY",
    published: "2022-07-19",
    verifiedDate: EVEIUM_VERIFIED_DATE,
  },
};

const claim = (value: string, sourceId: keyof typeof EVEIUM_SOURCES) => ({ value, sourceId });

const mfr = <T,>(value: T, unit: string | undefined, confidence: Confidence, claims: { value: string; sourceId: string }[], note?: string): Sourced<T> => ({
  value,
  unit,
  provenance: "MANUFACTURER_VERIFIED",
  confidence,
  claims,
  note,
});

/** Nominal energy from published voltage and capacity. A calculation, not a measured usable energy. */
export function nominalEnergy(voltage: number, ampHours: number) {
  const wh = round(voltage * ampHours, 0);
  return { wh, kwh: round(wh / 1000, 3), text: `${voltage} V × ${ampHours} Ah = ${wh} Wh = ${round(wh / 1000, 3)} kWh` };
}

export const ENERGY_NOTE = "CALCULATED FROM PUBLISHED NOMINAL VOLTAGE AND CAPACITY — not a measured usable energy.";

const calculated = (voltage: number, ampHours: number): Sourced<number> => {
  const e = nominalEnergy(voltage, ampHours);
  return { value: e.kwh, unit: "kWh", provenance: "CALCULATED", confidence: "HIGH", note: `${e.text}. ${ENERGY_NOTE}` };
};

const SWAPPABLE_NOTE = "The manufacturer's feature list states \"Lithium ion swappable Battery\". This is a marketing specification, not service documentation; battery location, mounting and removal are not stated.";

const unknownRest = () => ({
  batteryLocation: unknown<never>("Not stated by any recorded source."),
  chemistry: unknown<never>("Cell chemistry subtype (e.g. NMC or LFP) not stated."),
  cellType: unknown<never>("Cell format not stated."),
  enclosure: unknown<string>(),
  ipRating: unknown<string>(),
  chargingSpecification: unknown<string>("Charger rating and charge current limit not stated."),
  bmsCommunication: unknown<string>("BMS protocol not publicly verified."),
  connectorType: unknown<string>(),
  thermalSystem: unknown<string>(),
});

const shared = {
  nominalVoltage: mfr(72, "V", "HIGH", [claim("72 V", "eveium-scooters"), claim("72 V", "autocarpro-2022")]),
  batteryType: mfr("Lithium-ion", undefined, "HIGH", [claim("Lithium ion", "eveium-scooters"), claim("Lithium-ion", "autocarpro-2022"), claim("Li-ion", "rushlane-2022")]),
  batteryArchitecture: mfr<"swappable">("swappable", undefined, "MEDIUM", [claim("Lithium ion swappable Battery", "eveium-scooters")], SWAPPABLE_NOTE),
  chargingTime: mfr("3.5–4 h", undefined, "MEDIUM", [claim("Recharge in just 3.5 – 4 hours (brand-level)", "eveium-home"), claim("Fully charged in 4 hours (all models)", "rushlane-2022")], "Brand-level claim, not a per-model charger specification."),
};

const COSMO: VehicleBatterySpec = {
  ...shared,
  ...unknownRest(),
  capacityAh: mfr(30, "Ah", "HIGH", [claim("30 Ah", "eveium-scooters"), claim("30 Ah", "autocarpro-2022"), claim("30 Ah", "rushlane-2022")]),
  energyKWh: calculated(72, 30),
  motorPowerW: mfr(2000, "W", "HIGH", [claim("2000 W", "eveium-scooters"), claim("2000 W", "autocarpro-2022"), claim("2,000 W", "rushlane-2022")]),
  claimedRange: mfr("100 km (manufacturer claim)", undefined, "MEDIUM", [claim("100* km", "eveium-scooters"), claim("80 km", "autocarpro-2022"), claim("80 km", "rushlane-2022")], "Claimed range, not a test result. 2022 launch coverage reported 80 km."),
};

const COMET: VehicleBatterySpec = {
  ...shared,
  ...unknownRest(),
  capacityAh: mfr(50, "Ah", "HIGH", [claim("50 Ah", "eveium-scooters"), claim("50 Ah", "autocarpro-2022"), claim("50 Ah", "rushlane-2022")]),
  energyKWh: calculated(72, 50),
  motorPowerW: mfr(3000, "W", "HIGH", [claim("3000 W", "eveium-scooters"), claim("3000 W", "autocarpro-2022"), claim("3,000 W", "rushlane-2022")]),
  claimedRange: mfr("165 km (manufacturer claim)", undefined, "MEDIUM", [claim("165* km", "eveium-scooters"), claim("150 km", "autocarpro-2022"), claim("150 km", "rushlane-2022")], "Claimed range, not a test result. 2022 launch coverage reported 150 km."),
};

/** Czar capacity: the manufacturer's site and the 2022 launch coverage disagree, so no single value is published. */
export const CZAR_CAPACITY_CONFLICT = {
  manufacturer: { ampHours: 40, energy: nominalEnergy(72, 40), sourceId: "eveium-scooters" },
  launch2022: { ampHours: 42, energy: nominalEnergy(72, 42), sourceId: "autocarpro-2022" },
} as const;

const CZAR: VehicleBatterySpec = {
  ...shared,
  ...unknownRest(),
  capacityAh: {
    value: null,
    unit: "Ah",
    provenance: "UNKNOWN",
    conflict: true,
    confidence: "LOW",
    claims: [claim("40 Ah", "eveium-scooters"), claim("42 Ah", "autocarpro-2022"), claim("3.02 kWh (≈ 42 Ah at 72 V)", "rushlane-2022")],
    note: "The manufacturer's current website states 40 Ah; 2022 launch coverage states 42 Ah. Confirm on the pack label.",
  },
  energyKWh: {
    value: null,
    unit: "kWh",
    provenance: "UNKNOWN",
    conflict: true,
    confidence: "LOW",
    claims: [claim(`${CZAR_CAPACITY_CONFLICT.manufacturer.energy.kwh} kWh (${CZAR_CAPACITY_CONFLICT.manufacturer.energy.text})`, "eveium-scooters"), claim(`${CZAR_CAPACITY_CONFLICT.launch2022.energy.kwh} kWh (${CZAR_CAPACITY_CONFLICT.launch2022.energy.text})`, "autocarpro-2022")],
    note: `Calculated for each published capacity. ${ENERGY_NOTE}`,
  },
  motorPowerW: mfr(4000, "W", "HIGH", [claim("4000 W", "eveium-scooters"), claim("4000 W", "autocarpro-2022"), claim("4,000 W", "rushlane-2022")]),
  claimedRange: mfr("120–150 km (manufacturer claim)", undefined, "MEDIUM", [claim("120-150* km", "eveium-scooters"), claim("150 km", "autocarpro-2022"), claim("150 km", "rushlane-2022")], "Claimed range, not a test result."),
};

const toReference = (s: SpecSource): SourceReference => ({
  title: `${s.publisher} — ${s.title}`,
  url: s.url,
  sourceType: s.category === "MANUFACTURER" ? "MANUFACTURER_DOCUMENTED" : "THIRD_PARTY_DOCUMENTED",
  retrieved: s.verifiedDate,
});

const SOURCES = Object.values(EVEIUM_SOURCES).map(toReference);

export const EVEIUM_SERVICE_NOTES = [
  "Battery location: NOT YET VERIFIED. Use physical inspection and authorised service documentation to confirm battery location and service access.",
  "Exact mechanical removal sequence varies by model. Refer to authorised manufacturer service documentation.",
];

const model = (id: string, name: string, battery: VehicleBatterySpec): Vehicle => ({
  id,
  manufacturer: "EVeium",
  model: name,
  family: "EVeium Cosmo / Comet / Czar family",
  variants: [{ id: "not-specified", name: "Not specified", modelYears: [], battery }],
  serviceNotes: EVEIUM_SERVICE_NOTES,
  source: SOURCES,
  verificationStatus: "MANUFACTURER_DOCUMENTED",
  lastVerifiedDate: EVEIUM_VERIFIED_DATE,
  confidence: "MEDIUM",
});

export const EVEIUM_VEHICLES: Vehicle[] = [model("eveium-cosmo", "Cosmo", COSMO), model("eveium-comet", "Comet", COMET), model("eveium-czar", "Czar", CZAR)];

export const EVEIUM_DATA_QUALITY = "PUBLIC SPECIFICATION PARTIALLY VERIFIED";

/** Shown openly: what no recorded source states yet. */
export const EVEIUM_UNKNOWN_FIELDS = [
  "Exact cell chemistry",
  "Cell manufacturer",
  "Cell format",
  "Series / parallel arrangement",
  "BMS manufacturer",
  "BMS protocol",
  "Connector pinout",
  "Fuse rating",
  "Charge current limit",
  "Discharge current limit",
  "Thermal thresholds",
  "Balancing thresholds",
  "Exact pack location",
  "Exact removal sequence",
  "Internal mechanical layout",
] as const;

/** Service data the architecture is ready to take, once an authoritative source exists. */
export const EVEIUM_FUTURE_DATA = ["Service manual", "OEM diagnostic procedure", "Connector pinout", "BMS communication map", "Cell layout", "Internal pack photographs", "Verified removal sequence", "Component part numbers"] as const;
