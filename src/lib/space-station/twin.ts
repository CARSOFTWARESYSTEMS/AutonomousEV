// Coupled, rule-based "digital twin" of a generic station for teaching
// cascading failures. Values are illustrative orbit-average figures for an
// imaginary station — educational model, not mission design data.

export const TWIN_NOMINAL = {
  /** Orbit-average power available to loads with healthy arrays (kW). */
  generationKW: 100,
  batteryModules: 6,
  /** Eclipse load each battery module can carry (kW). */
  eclipseKWPerModule: 18,
  essentialLoadKW: 45,
  crewSupportKWPerCrew: 3,
  researchLoadKW: 25,
  crew: 4,
  /** Heat the active thermal control system can reject (kW). */
  heatRejectionKW: 110,
  metabolicKWPerCrew: 0.125,
  co2KgPerCrewDay: 1.04,
  /** CO₂ removal capacity with all removal assemblies healthy (kg/day). */
  co2RemovalKgPerDay: 6.5,
} as const;

export type FailureId =
  | "solar-degraded"
  | "battery-module-out"
  | "cooling-degraded"
  | "co2-degraded"
  | "comms-loss"
  | "payload-overdraw"
  | "docking-approach"
  | "crew-increase";

export interface FailureDef {
  id: FailureId;
  label: string;
  detail: string;
}

export const FAILURES: FailureDef[] = [
  { id: "solar-degraded", label: "Solar array degraded 30%", detail: "Array output falls by 30% (for example shadowing, a stuck joint or string failures)." },
  { id: "battery-module-out", label: "Battery module unavailable", detail: "One of six battery modules is isolated." },
  { id: "cooling-degraded", label: "Cooling loop degraded", detail: "One external cooling loop runs at reduced capacity; heat rejection drops by 40%." },
  { id: "co2-degraded", label: "CO₂ scrubber degraded", detail: "CO₂ removal capacity halves." },
  { id: "comms-loss", label: "Communication loss", detail: "No space-to-ground link for an extended period." },
  { id: "payload-overdraw", label: "Research payload draws excess power", detail: "A payload draws 15 kW above its allocation." },
  { id: "docking-approach", label: "Docking vehicle approaching", detail: "Station holds attitude and arrays are positioned for the approach; crew attention is committed." },
  { id: "crew-increase", label: "Crew size increases", detail: "Crew rises from 4 to 7 during a handover period." },
];

export type SubsystemId = "orbit" | "gnc" | "power" | "thermal" | "eclss" | "crew" | "payloads" | "comms" | "ground";
export type Health = "nominal" | "caution" | "warning";

export interface SubsystemState {
  id: SubsystemId;
  label: string;
  health: Health;
  note: string;
}

export interface TwinResult {
  subsystems: SubsystemState[];
  cascade: string[];
  responses: string[];
  metrics: {
    generationKW: number;
    demandKW: number;
    servedKW: number;
    shedResearchKW: number;
    shedCrewSupportKW: number;
    eclipseCapacityKW: number;
    heatLoadKW: number;
    heatRejectionKW: number;
    co2GenerationKgPerDay: number;
    co2RemovalKgPerDay: number;
    crew: number;
  };
}

export const SUBSYSTEM_ORDER: { id: SubsystemId; label: string }[] = [
  { id: "orbit", label: "Orbit" },
  { id: "gnc", label: "GNC" },
  { id: "power", label: "Power" },
  { id: "thermal", label: "Thermal" },
  { id: "eclss", label: "ECLSS" },
  { id: "crew", label: "Crew" },
  { id: "payloads", label: "Payloads" },
  { id: "comms", label: "Communications" },
  { id: "ground", label: "Ground" },
];

const worst = (a: Health, b: Health): Health => (a === "warning" || b === "warning" ? "warning" : a === "caution" || b === "caution" ? "caution" : "nominal");

export function runTwin(active: FailureId[]): TwinResult {
  const on = new Set(active);
  const N = TWIN_NOMINAL;
  const cascade: string[] = [];
  const responses: string[] = [];
  const health: Record<SubsystemId, Health> = { orbit: "nominal", gnc: "nominal", power: "nominal", thermal: "nominal", eclss: "nominal", crew: "nominal", payloads: "nominal", comms: "nominal", ground: "nominal" };
  const notes: Record<SubsystemId, string> = {
    orbit: "Altitude within the planned band.",
    gnc: "Attitude held; momentum within limits.",
    power: "Generation covers demand with margin.",
    thermal: "Heat rejection exceeds heat load.",
    eclss: "Atmosphere and water within limits.",
    crew: "Normal schedule.",
    payloads: "All experiments powered.",
    comms: "Space-to-ground link available.",
    ground: "Routine monitoring.",
  };
  const set = (id: SubsystemId, h: Health, note: string) => {
    health[id] = worst(health[id], h);
    notes[id] = note;
  };

  const crew = on.has("crew-increase") ? 7 : N.crew;
  let generation = N.generationKW;
  if (on.has("solar-degraded")) {
    generation *= 0.7;
    cascade.push(`Solar array degradation → generation falls from ${N.generationKW} kW to ${generation.toFixed(0)} kW.`);
  }
  if (on.has("docking-approach")) {
    generation *= 0.9;
    set("gnc", "caution", "Attitude hold for the approach; momentum management deferred.");
    cascade.push("Docking approach → station holds a fixed attitude and arrays are parked, trimming generation by ~10%.");
    responses.push("Coordinate the approach timeline with power and thermal planners; avoid scheduling power-hungry experiments during the approach.");
  }

  const modules = N.batteryModules - (on.has("battery-module-out") ? 1 : 0);
  const eclipseCapacity = modules * N.eclipseKWPerModule;
  if (on.has("battery-module-out")) cascade.push(`Battery module isolated → eclipse capacity falls to ${eclipseCapacity} kW.`);

  const crewSupport = crew * N.crewSupportKWPerCrew;
  let research = N.researchLoadKW + (on.has("payload-overdraw") ? 15 : 0);
  if (on.has("payload-overdraw")) cascade.push("Payload over-draw → research demand rises to 40 kW against a 25 kW allocation.");
  if (on.has("crew-increase")) cascade.push(`Crew increases to ${crew} → crew-support power, metabolic heat and CO₂ generation all rise.`);
  const dockingLoad = on.has("docking-approach") ? 5 : 0;
  const demand = N.essentialLoadKW + crewSupport + research + dockingLoad;
  const powerLimit = Math.min(generation, eclipseCapacity);

  let shedResearch = 0;
  let shedCrew = 0;
  let served = demand;
  if (served > powerLimit) {
    const deficit = served - powerLimit;
    shedResearch = Math.min(research, deficit);
    research -= shedResearch;
    served -= shedResearch;
    cascade.push(`${generation < eclipseCapacity ? "Power deficit" : "Battery eclipse limit"} (${deficit.toFixed(0)} kW) → load shedding: research loads cut by ${shedResearch.toFixed(0)} kW.`);
    if (served > powerLimit) {
      shedCrew = Math.min(crewSupport * 0.3, served - powerLimit);
      served -= shedCrew;
      cascade.push(`Remaining deficit → non-essential crew-support loads reduced by ${shedCrew.toFixed(0)} kW.`);
    }
    set("power", served > powerLimit ? "warning" : "caution", served > powerLimit ? "Essential loads at risk." : "Balanced only by load shedding.");
    responses.push("Isolate the fault, shed loads in priority order and protect essential systems; re-plan experiment timelines.");
  }

  // Thermal: almost all electrical power becomes heat, plus crew metabolic heat.
  const rejection = N.heatRejectionKW * (on.has("cooling-degraded") ? 0.6 : 1);
  let heat = served + crew * N.metabolicKWPerCrew;
  if (on.has("cooling-degraded")) cascade.push(`Cooling loop degraded → heat rejection falls to ${rejection.toFixed(0)} kW.`);
  if (heat > rejection) {
    const cut = Math.min(research, heat - rejection);
    research -= cut;
    shedResearch += cut;
    served -= cut;
    heat -= cut;
    cascade.push(`Heat load exceeds rejection → further ${cut.toFixed(0)} kW of experiments powered down to stay within thermal limits.`);
    set("thermal", heat > rejection ? "warning" : "caution", heat > rejection ? "Heat load exceeds rejection even after shedding." : "Held in limits by powering down payloads.");
    responses.push("Reduce heat load, consolidate loads onto the healthy loop and investigate the degraded loop.");
  } else if (shedResearch > 0) {
    cascade.push("Lower electrical load → less waste heat; thermal margin improves as a side effect of load shedding.");
  }

  if (shedResearch > 0) {
    set("payloads", shedResearch >= N.researchLoadKW ? "warning" : "caution", `${shedResearch.toFixed(0)} kW of research shed — experiments interrupted.`);
    cascade.push("Experiment interruption → time-critical samples may need cold stowage or restart; science return is reduced.");
    set("ground", "caution", "Replanning experiments and power timeline.");
  }

  const co2Gen = crew * N.co2KgPerCrewDay;
  const co2Cap = N.co2RemovalKgPerDay * (on.has("co2-degraded") ? 0.5 : 1);
  if (on.has("co2-degraded")) cascade.push(`CO₂ scrubber degraded → removal capacity falls to ${co2Cap.toFixed(1)} kg/day.`);
  if (co2Gen > co2Cap) {
    set("eclss", "warning", `CO₂ generation ${co2Gen.toFixed(1)} kg/day exceeds removal ${co2Cap.toFixed(1)} kg/day — cabin CO₂ will rise.`);
    set("crew", "caution", "Exercise and exertion limited; symptoms monitored.");
    cascade.push("CO₂ removal below generation → cabin CO₂ partial pressure rises → crew health risk (headaches, reduced performance).");
    responses.push("Activate backup CO₂ removal, reduce crew exertion and prioritise repair; consider temporarily reducing crew on board.");
  } else if (on.has("co2-degraded")) {
    set("eclss", "caution", "Operating on reduced CO₂ removal margin.");
  }
  if (on.has("crew-increase")) set("crew", "caution", `${crew} crew aboard: sleep stations, hygiene and consumables stretched.`);

  if (on.has("comms-loss")) {
    set("comms", "warning", "No space-to-ground link.");
    set("ground", "warning", "No telemetry; flight controllers cannot command.");
    set("crew", "caution", "Crew works from onboard procedures and autonomy.");
    cascade.push("Communication loss → ground loses telemetry and commanding → station relies on onboard fault management and crew; science data is stored on board.");
    responses.push("Run pre-agreed loss-of-signal plans, switch to backup links or antennas, and store science data for later downlink.");
  }

  if (on.has("solar-degraded")) set("orbit", "nominal", "Orbit unaffected, but reboost planning must account for reduced power.");
  if (health.power === "nominal" && (on.has("solar-degraded") || on.has("battery-module-out"))) set("power", "caution", "Reduced margin; no load shedding yet.");
  if (on.has("docking-approach")) set("crew", "caution", "Crew assigned to monitor the approach.");

  if (cascade.length === 0) cascade.push("No failures injected. All subsystems nominal.");
  if (responses.length === 0 && active.length > 0) responses.push("Monitor trends, confirm margins and keep contingency plans ready.");

  return {
    subsystems: SUBSYSTEM_ORDER.map((s) => ({ ...s, health: health[s.id], note: notes[s.id] })),
    cascade,
    responses,
    metrics: {
      generationKW: generation,
      demandKW: demand,
      servedKW: served,
      shedResearchKW: shedResearch,
      shedCrewSupportKW: shedCrew,
      eclipseCapacityKW: eclipseCapacity,
      heatLoadKW: heat,
      heatRejectionKW: rejection,
      co2GenerationKgPerDay: co2Gen,
      co2RemovalKgPerDay: co2Cap,
      crew,
    },
  };
}
