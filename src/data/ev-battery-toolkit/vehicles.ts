// Priority South India EV scooter battery platforms for V1.
//
// Rule for this data: a technical value appears only when it is verified from a
// source recorded here. For Ola, TVS, Ather and River no source is recorded
// yet, so every technical field is UNKNOWN and the interface shows "Technical
// specification not verified." EVeium's published values carry their sources
// (eveium.ts). Variant names are
// the manufacturers' public model names, listed to identify the vehicle in a
// job card; they carry no battery data. The list is an order of priority for
// the toolkit, not a ranking of reliability or failures.
import { unknown } from "@/lib/ev-battery-toolkit/provenance";
import { EVEIUM_VEHICLES } from "./eveium";
import type { SourceReference, Vehicle, VehicleBatterySpec, VehicleVariant } from "@/lib/ev-battery-toolkit/types";

const UNVERIFIED_SPEC = (): VehicleBatterySpec => ({
  batteryLocation: unknown(),
  batteryArchitecture: unknown(),
  nominalVoltage: unknown(),
  capacityAh: unknown(),
  energyKWh: unknown(),
  chemistry: unknown(),
  cellType: unknown(),
  enclosure: unknown(),
  ipRating: unknown(),
  chargingSpecification: unknown(),
  bmsCommunication: unknown(),
  connectorType: unknown(),
  thermalSystem: unknown(),
  batteryType: unknown(),
  motorPowerW: unknown(),
  claimedRange: unknown(),
  chargingTime: unknown(),
});

const variant = (id: string, name: string): VehicleVariant => ({ id, name, modelYears: [], battery: UNVERIFIED_SPEC() });

const NO_VERIFIED_SOURCE: SourceReference[] = [
  { title: "No verified battery specification recorded for this platform yet", sourceType: "UNKNOWN" },
];

const SERVICE_NOTES = [
  "Battery location, architecture and specification are not yet verified for this platform. Confirm them on the vehicle.",
  "Exact mechanical removal sequence varies by model. Refer to authorised manufacturer service documentation.",
];

export const VEHICLES: Vehicle[] = [
  {
    id: "ola-s1",
    manufacturer: "Ola Electric",
    model: "S1",
    family: "Ola S1 family",
    variants: [variant("s1-pro", "S1 Pro"), variant("s1-air", "S1 Air"), variant("s1-x", "S1 X")],
    serviceNotes: SERVICE_NOTES,
    source: NO_VERIFIED_SOURCE,
    verificationStatus: "UNKNOWN",
    lastVerifiedDate: null,
    confidence: "LOW",
  },
  {
    id: "tvs-iqube",
    manufacturer: "TVS Motor Company",
    model: "iQube",
    family: "TVS iQube family",
    variants: [variant("iqube", "iQube"), variant("iqube-s", "iQube S"), variant("iqube-st", "iQube ST")],
    serviceNotes: SERVICE_NOTES,
    source: NO_VERIFIED_SOURCE,
    verificationStatus: "UNKNOWN",
    lastVerifiedDate: null,
    confidence: "LOW",
  },
  {
    id: "ather-450-rizta",
    manufacturer: "Ather Energy",
    model: "450 / Rizta",
    family: "Ather 450 / Rizta family",
    variants: [variant("450s", "450S"), variant("450x", "450X"), variant("450-apex", "450 Apex"), variant("rizta", "Rizta")],
    serviceNotes: SERVICE_NOTES,
    source: NO_VERIFIED_SOURCE,
    verificationStatus: "UNKNOWN",
    lastVerifiedDate: null,
    confidence: "LOW",
  },
  {
    id: "river-indie",
    manufacturer: "River",
    model: "Indie",
    family: "River Indie",
    variants: [variant("indie", "Indie")],
    serviceNotes: SERVICE_NOTES,
    source: NO_VERIFIED_SOURCE,
    verificationStatus: "UNKNOWN",
    lastVerifiedDate: null,
    confidence: "LOW",
  },
  // Cosmo, Comet and Czar: publicly documented battery data with sources (see eveium.ts).
  ...EVEIUM_VEHICLES,
];

export const VEHICLE_BY_ID: Record<string, Vehicle> = Object.fromEntries(VEHICLES.map((v) => [v.id, v]));

export const MANUFACTURERS = Array.from(new Set(VEHICLES.map((v) => v.manufacturer)));

/**
 * How a vehicle is named in the interface and reports: "Ola Electric S1 Pro",
 * "TVS Motor Company iQube S", "Ather Energy 450X" — never "S1 S1 Pro".
 */
export function vehicleLabel(vehicle: Vehicle, variant?: VehicleVariant | null): string {
  if (!variant || variant.id === "not-specified") return `${vehicle.manufacturer} ${vehicle.model}`;
  const name = variant.name.startsWith(vehicle.model) || vehicle.model.includes("/") ? variant.name : `${vehicle.model} ${variant.name}`;
  return `${vehicle.manufacturer} ${name}`;
}

/** The years a technician may pick for a vehicle in front of them. User-entered, never a claim about the model. */
export function selectableYears(now: Date): number[] {
  const year = now.getFullYear();
  return Array.from({ length: 8 }, (_, i) => year - i);
}

/** The fields the platform table and the locator show, in order. */
export const SPEC_FIELDS: { key: keyof VehicleBatterySpec; label: string }[] = [
  { key: "batteryLocation", label: "Battery Location" },
  { key: "batteryArchitecture", label: "Architecture" },
  { key: "chemistry", label: "Chemistry" },
  { key: "cellType", label: "Battery Type" },
  { key: "capacityAh", label: "Capacity" },
  { key: "nominalVoltage", label: "Voltage" },
  { key: "energyKWh", label: "Energy" },
  { key: "enclosure", label: "Enclosure" },
  { key: "ipRating", label: "IP Rating" },
  { key: "chargingSpecification", label: "Charging" },
  { key: "bmsCommunication", label: "BMS Communication" },
  { key: "connectorType", label: "Connector" },
  { key: "thermalSystem", label: "Thermal System" },
  { key: "batteryType", label: "Battery Type (published)" },
  { key: "motorPowerW", label: "Motor Power" },
  { key: "claimedRange", label: "Claimed Range" },
  { key: "chargingTime", label: "Charging Time" },
];
