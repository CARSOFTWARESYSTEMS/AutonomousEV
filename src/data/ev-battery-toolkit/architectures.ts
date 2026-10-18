// The three battery architecture concepts and the configurator's options.
// These are generic engineering concepts for teaching and for structuring a
// diagnosis. They are not any manufacturer's pack, and the 3D model built from
// them says so.
import type { ArchitectureId, BatteryArchitecture, BatteryChemistry, BatteryConfig, CellFormat, EnergyBand, PackLayout, VoltageClass } from "@/lib/ev-battery-toolkit/types";

export const ARCHITECTURES: Record<ArchitectureId, BatteryArchitecture> = {
  "fixed-floor": {
    id: "fixed-floor",
    name: "Integrated / Fixed Floor Battery",
    summary: "A sealed pack mounted in the floorboard and serviced in place or after a workshop removal. The owner charges it on the vehicle.",
    location: "floor",
    dimensions: [5.2, 1.1, 3.0],
    orientation: 0,
    removal: "fixed",
    modules: 2,
    bmsPosition: "end",
    connectors: [
      { id: "discharge", face: "front" },
      { id: "charge", face: "rear" },
    ],
    serviceability: "Workshop service. Removal needs vehicle isolation and the manufacturer's procedure.",
  },
  swappable: {
    id: "swappable",
    name: "Removable / Swappable Battery",
    summary: "A portable pack in the seat bay, lifted out by a handle and seated onto a blind-mate connector with a mechanical lock and an interlock.",
    location: "under-seat",
    dimensions: [2.3, 3.0, 1.7],
    orientation: 0,
    removal: "swappable",
    modules: 1,
    bmsPosition: "top",
    connectors: [{ id: "discharge", face: "rear" }],
    serviceability: "Removable by the user for charging or swapping. Internal service is workshop-only.",
  },
  "serviceable-pack": {
    id: "serviceable-pack",
    name: "Traditional Serviceable Scooter Battery Pack",
    summary: "A common aftermarket-style pack (often 60–72 V class) in a metal or ABS case with separate charge and discharge leads, an accessible BMS and replaceable modules.",
    location: "under-floor-boot",
    dimensions: [4.4, 1.7, 2.6],
    orientation: 0,
    removal: "removable",
    modules: 3,
    bmsPosition: "side",
    connectors: [
      { id: "discharge", face: "front" },
      { id: "charge", face: "top" },
    ],
    serviceability: "Workshop-serviceable at module, BMS and, with the right training, cell-group level.",
  },
};

export const ARCHITECTURE_ORDER: ArchitectureId[] = ["fixed-floor", "swappable", "serviceable-pack"];

export const CHEMISTRIES: { id: BatteryChemistry; name: string; note: string }[] = [
  { id: "NMC", name: "NMC", note: "Higher energy density; cell voltage changes steadily with SOC." },
  { id: "LFP", name: "LFP", note: "Flat voltage plateau; SOC is harder to read from voltage alone." },
];

export const CELL_FORMATS: { id: CellFormat; name: string; note: string }[] = [
  { id: "cylindrical", name: "Cylindrical", note: "Many small cells in holders, joined in parallel groups and series strings." },
  { id: "prismatic", name: "Prismatic", note: "Large rigid cells stacked under compression with busbars across the terminals." },
  { id: "pouch", name: "Pouch", note: "Flexible laminated cells with tabs, held in a compression frame." },
];

export const VOLTAGE_CLASSES: { id: VoltageClass; name: string; nominal: number | null }[] = [
  { id: "36", name: "36 V", nominal: 36 },
  { id: "48", name: "48 V", nominal: 48 },
  { id: "51", name: "51/52 V", nominal: 51.2 },
  { id: "60", name: "60 V", nominal: 60 },
  { id: "72", name: "72 V", nominal: 72 },
  { id: "custom", name: "Custom", nominal: null },
];

export const ENERGY_BANDS: { id: EnergyBand; name: string; target: number }[] = [
  { id: "lt2", name: "<2 kWh", target: 1.6 },
  { id: "2to3", name: "2–3 kWh", target: 2.5 },
  { id: "3to4", name: "3–4 kWh", target: 3.5 },
  { id: "4to5", name: "4–5 kWh", target: 4.5 },
  { id: "gt5", name: "5+ kWh", target: 5.5 },
];

export const PACK_LAYOUTS: { id: PackLayout; name: string; architecture: ArchitectureId | null }[] = [
  { id: "single", name: "Single Pack", architecture: null },
  { id: "multi-module", name: "Multi-Module", architecture: null },
  { id: "fixed", name: "Fixed", architecture: "fixed-floor" },
  { id: "removable", name: "Removable", architecture: "serviceable-pack" },
  { id: "swappable", name: "Swappable", architecture: "swappable" },
  { id: "dual-pack", name: "Dual-Pack", architecture: "swappable" },
];

/**
 * Illustrative cell figures used only to size the simulated pack. They are
 * typical of each format, not a datasheet, and the interface labels every
 * number derived from them ESTIMATED or SIMULATED.
 */
export const CELL_MODEL: Record<CellFormat, { capacityAh: number; slot: [number, number, number]; body: [number, number, number] }> = {
  // 21700-class: Ø21 × 70 mm, in a holder.
  cylindrical: { capacityAh: 4, slot: [0.24, 0.78, 0.24], body: [0.21, 0.7, 0.21] },
  prismatic: { capacityAh: 50, slot: [0.31, 1.02, 1.5], body: [0.28, 0.98, 1.44] },
  pouch: { capacityAh: 20, slot: [0.15, 0.96, 1.36], body: [0.1, 0.9, 1.3] },
};

export const CELL_NOMINAL_V: Record<BatteryChemistry, number> = { NMC: 3.6, LFP: 3.2 };

export const DEFAULT_CONFIG: BatteryConfig = {
  chemistry: "NMC",
  format: "cylindrical",
  voltage: "72",
  customVoltage: 64,
  energy: "2to3",
  layout: "fixed",
  architecture: "fixed-floor",
};
