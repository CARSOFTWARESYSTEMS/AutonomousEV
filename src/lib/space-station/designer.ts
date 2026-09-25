// "Design a Station" — a conceptual educational system model.
// Every heuristic below is a named, rounded teaching value. Outputs are not
// a certified or validated spacecraft design.
import { sizeRadiator, THERMAL_DEFAULTS } from "./thermal";

export type Mission = "research" | "commercial" | "exploration" | "lunar" | "mixed";
export type OrbitRegime = "leo" | "lunar-orbit" | "deep-space";
export type Level3 = "low" | "medium" | "high";
export type Autonomy = "crew-tended" | "supervised" | "high";
export type Radiation = "baseline" | "enhanced" | "storm-shelter";

export interface DesignInput {
  mission: Mission;
  orbit: OrbitRegime;
  crew: number; // 0–12
  durationDays: number;
  modules: number;
  researchDemand: Level3;
  powerRequirementKW: number; // 0 = let the model estimate
  autonomy: Autonomy;
  dockingPorts: number;
  robotics: boolean;
  radiation: Radiation;
  resupplyDays: number;
}

export const DESIGN_DEFAULTS: DesignInput = {
  mission: "research",
  orbit: "leo",
  crew: 4,
  durationDays: 180,
  modules: 4,
  researchDemand: "medium",
  powerRequirementKW: 0,
  autonomy: "supervised",
  dockingPorts: 2,
  robotics: true,
  radiation: "baseline",
  resupplyDays: 90,
};

export const DESIGN_HEURISTICS = {
  busKWPerModule: 4,
  crewSupportKWPerCrew: 2.5,
  researchKW: { low: 8, medium: 25, high: 60 } as Record<Level3, number>,
  roboticsKW: 3,
  /** Net habitable volume per crew member for long-duration missions (m³). */
  longDurationVolumePerCrewM3: 25,
  shortDurationVolumePerCrewM3: 10,
  longDurationThresholdDays: 30,
  /** Rough net habitable volume contributed by one pressurised module (m³). */
  habitableVolumePerModuleM3: 60,
  /** Days beyond which (or resupply intervals beyond which) water/O₂ regeneration is recommended. */
  regenerativeThresholdDays: 60,
} as const;

export interface DesignOutput {
  modules: string[];
  powerDemandKW: number;
  powerEstimatedKW: number;
  habitableVolumeRequiredM3: number;
  habitableVolumeProvidedM3: number;
  volumeOk: boolean;
  eclss: string;
  dockingRecommended: number;
  dockingOk: boolean;
  radiatorAreaM2: number;
  thermal: string;
  communications: string;
  researchCapability: string;
  risks: string[];
  technologyGaps: string[];
}

export function designStation(input: DesignInput): DesignOutput {
  const H = DESIGN_HEURISTICS;
  const crew = Math.max(0, Math.min(12, Math.round(input.crew)));
  const modulesN = Math.max(1, Math.round(input.modules));
  const crewed = crew > 0;
  const longDuration = input.durationDays > H.longDurationThresholdDays;

  const powerEstimatedKW =
    modulesN * H.busKWPerModule + crew * H.crewSupportKWPerCrew + H.researchKW[input.researchDemand] + (input.robotics ? H.roboticsKW : 0);
  const powerDemandKW = input.powerRequirementKW > 0 ? input.powerRequirementKW : powerEstimatedKW;

  const volPerCrew = longDuration ? H.longDurationVolumePerCrewM3 : H.shortDurationVolumePerCrewM3;
  const habitableVolumeRequiredM3 = crew * volPerCrew;
  const habitableVolumeProvidedM3 = modulesN * H.habitableVolumePerModuleM3;

  // Module list for the architecture diagram.
  // Core first, then habitation, laboratories, a logistics node on larger
  // stations, and an airlock; truncated to the requested module count.
  const modules: string[] = ["Core / command & control"];
  if (crewed) modules.push("Habitation");
  const wantsAirlock = input.robotics || crewed;
  const free = modulesN - modules.length - (wantsAirlock ? 1 : 0);
  const logistics = free >= 3 ? 1 : 0;
  for (let i = 0; i < free - logistics; i++) modules.push(`Laboratory ${i + 1}`);
  if (logistics) modules.push("Logistics node");
  if (wantsAirlock) modules.push("Airlock");
  modules.length = Math.min(modules.length, modulesN);

  const regenerative = crewed && (input.durationDays > H.regenerativeThresholdDays || input.resupplyDays > H.regenerativeThresholdDays || input.orbit !== "leo");
  const eclss = !crewed
    ? "Uncrewed or crew-tended: maintain a safe atmosphere during dormancy and reactivate life support before crew arrival."
    : regenerative
      ? "Regenerative: water recovery, oxygen generation by electrolysis and CO₂ removal, with CO₂ reduction to recover water where mass matters most."
      : "Partially regenerative: CO₂ removal and water recovery, with stored oxygen and frequent resupply.";

  const dockingRecommended = (crewed ? 1 : 0) + 1 + (input.mission === "commercial" || input.mission === "mixed" ? 1 : 0) + (modulesN > 3 ? 1 : 0);

  const radiator = sizeRadiator({ ...THERMAL_DEFAULTS, equipmentKW: powerDemandKW, crew, payloadKW: 0 });
  const thermal =
    input.orbit === "leo"
      ? "Pumped fluid loops to deployable radiators, sized for Earth IR and albedo as well as heat load."
      : "Pumped fluid loops with radiators sized for a colder, Earth-free sky but long, deep eclipses or Sun-facing periods; heaters needed for dormancy.";

  const communications =
    input.orbit === "leo"
      ? "Relay satellites plus direct-to-ground links; near-continuous coverage and negligible light-time delay."
      : input.orbit === "lunar-orbit"
        ? "Deep-space ground networks and lunar relays; about 1.3 s one-way light time, with periods behind the Moon."
        : "Deep-space networks; one-way delays of minutes, so the crew and station must act autonomously.";

  const researchCapability = {
    low: "A few racks for opportunistic experiments.",
    medium: "Dedicated laboratory racks, external payload sites and regular sample return.",
    high: "Multiple laboratories, high-power facilities, external platforms and frequent sample return — power, crew time and thermal become the limiting resources.",
  }[input.researchDemand];

  const risks: string[] = [];
  if (crewed && habitableVolumeProvidedM3 < habitableVolumeRequiredM3) risks.push("Habitable volume below the long-duration guideline: crew performance and behavioural health at risk.");
  if (input.dockingPorts < dockingRecommended) risks.push("Too few docking ports for crew rotation, cargo and contingency at the same time.");
  if (crewed && input.orbit !== "leo") risks.push("Emergency return to Earth takes days, not hours: medical and safe-haven capability must be onboard.");
  if (input.orbit !== "leo" && input.radiation === "baseline") risks.push("Beyond Earth's magnetosphere, baseline shielding leaves crew exposed to solar particle events.");
  if (input.resupplyDays > 120 && !regenerative && crewed) risks.push("Long resupply interval with limited regeneration: consumables margin is thin.");
  if (input.autonomy === "crew-tended" && input.orbit === "deep-space") risks.push("Deep-space operations with crew-tended autonomy: ground cannot react in time to fast faults.");
  if (powerDemandKW > 150) risks.push("High power demand drives very large arrays and radiators — structural dynamics and drag grow too.");
  if (crew > 7) risks.push("Large crews multiply consumables, sleep stations, hygiene and evacuation capacity requirements.");
  if (risks.length === 0) risks.push("No major risk flags for these inputs — detailed analysis still required.");

  const technologyGaps: string[] = [];
  if (regenerative) technologyGaps.push("Reliable, low-maintenance regenerative life support with high closure.");
  if (input.autonomy !== "crew-tended") technologyGaps.push("Onboard fault detection, diagnosis and recovery that crew and ground can trust.");
  if (input.robotics) technologyGaps.push("Robotic inspection, maintenance and payload handling with minimal crew time.");
  if (input.orbit !== "leo") technologyGaps.push("Radiation-tolerant avionics and crew protection for long exposures.");
  if (input.mission === "commercial" || input.mission === "mixed") technologyGaps.push("Standardised payload interfaces and low-cost logistics.");
  if (input.durationDays > 365) technologyGaps.push("Countermeasures for bone, muscle and vision changes on very long missions.");

  return {
    modules,
    powerDemandKW,
    powerEstimatedKW,
    habitableVolumeRequiredM3,
    habitableVolumeProvidedM3,
    volumeOk: habitableVolumeProvidedM3 >= habitableVolumeRequiredM3,
    eclss,
    dockingRecommended,
    dockingOk: input.dockingPorts >= dockingRecommended,
    radiatorAreaM2: radiator.radiatorAreaM2,
    thermal,
    communications,
    researchCapability,
    risks,
    technologyGaps,
  };
}
