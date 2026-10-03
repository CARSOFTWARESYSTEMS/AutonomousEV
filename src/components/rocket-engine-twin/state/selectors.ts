// What each part of the engine looks like for a given state: which parts stay
// at full strength, which recede, and which carry a tint. Pure, so the rules
// can be tested without a renderer.
import { ARCHITECTURE_LAYERS, HEALTH_COLOR, HEALTH_GROUPS } from "../data/twinContent";
import { PARTS, PART_IDS, type PartDef } from "../engine/layout";
import { DEFAULT_LOOK, type PartLook } from "../scene/frameState";
import { healthState } from "../simulation/bearingFault";
import type { HealthState, PartId, SystemId } from "../types";
import type { TwinState } from "./twinStore";

const CONTROL_SYSTEMS: readonly SystemId[] = ["engine_control", "valves_actuation", "instrumentation"];
const FAULT_PARTS: readonly PartId[] = ["bearing_fuel", "turbopump_fuel", "rotor_fuel"];
const DATA_TINT = "#a9cdf7";
const SELECT_TINT = "#ffffff";

/** Health of each part while the bearing scenario runs. Only the fuel turbopump ever leaves nominal. */
export function partHealth(s: TwinState, severity: number): Map<PartId, HealthState> {
  const health = new Map<PartId, HealthState>();
  const fault = s.bearing === null ? "nominal" : healthState(severity);
  for (const id of PART_IDS) health.set(id, FAULT_PARTS.includes(id) ? fault : "nominal");
  return health;
}

/** Health of a top-level group: the worst state among its parts. Only turbomachinery ever leaves nominal. */
export function groupHealth(groupId: string, faultActive: boolean, severity: number): HealthState {
  const group = HEALTH_GROUPS.find((g) => g.id === groupId);
  if (!group?.systems.includes("turbomachinery") || !faultActive) return "nominal";
  return healthState(severity);
}

function focusLook(part: PartDef, s: TwinState): PartLook {
  if (!s.systemFocus) return DEFAULT_LOOK;
  if (s.component && part.component === s.component) return { ...DEFAULT_LOOK, tint: SELECT_TINT, strength: 0.05 };
  if (part.system === s.system) return { ...DEFAULT_LOOK, dim: s.component ? 0.22 : 0 };
  return { ...DEFAULT_LOOK, dim: 0.62 };
}

export function partLooks(s: TwinState, severity = 0): Map<PartId, PartLook> {
  const looks = new Map<PartId, PartLook>();
  const layer = s.mode === "architecture" ? ARCHITECTURE_LAYERS.find((l) => l.id === s.layer) : undefined;
  const faultState = s.bearing === null ? "nominal" : healthState(severity);

  for (const id of PART_IDS) {
    const part = PARTS[id];
    let look: PartLook = DEFAULT_LOOK;

    switch (s.mode) {
      case "engine":
      case "build":
      case "test":
        look = s.entered ? focusLook(part, s) : DEFAULT_LOOK;
        break;
      case "flow": {
        // The engine recedes so that what moves through it can be seen.
        const data = s.flow === "data" && part.system !== null && CONTROL_SYSTEMS.includes(part.system);
        look = { ...DEFAULT_LOOK, dim: s.flow ? (data ? 0.1 : 0.66) : 0 };
        if (s.flow === "cooling") {
          // Only the jacket goes see-through: the coolant is drawn where its passages are, over the liner.
          if (id === "cooling_jacket" || id === "throat_ring") look = { ...look, opacity: 0.16, dim: 0.2 };
          else if (id === "cooling_channels") look = { ...look, opacity: 0 };
          else if (id === "chamber_liner") look = { ...look, dim: 0.25 };
        }
        break;
      }
      case "control":
        look = { ...DEFAULT_LOOK, dim: part.system !== null && CONTROL_SYSTEMS.includes(part.system) ? 0 : 0.5 };
        break;
      case "health": {
        // Colour appears only here, and only as much as the state warrants.
        const inGroup = s.healthSystem === null || part.system === s.healthSystem;
        const fault = FAULT_PARTS.includes(id) && faultState !== "nominal";
        look = { ...DEFAULT_LOOK, dim: inGroup ? 0.3 : 0.66, tint: HEALTH_COLOR[fault ? faultState : "nominal"], strength: fault ? (id === "bearing_fuel" ? 0.42 : 0.05) : inGroup && part.system ? 0.04 : 0 };
        break;
      }
      case "twin": {
        const fault = FAULT_PARTS.includes(id) && s.residual && s.bearing !== null;
        look = { ...DEFAULT_LOOK, dim: fault ? 0.1 : 0.5, tint: fault ? HEALTH_COLOR.degraded : null, strength: fault ? (id === "bearing_fuel" ? 0.5 : 0.12) : 0 };
        break;
      }
      case "architecture": {
        const lit = layer ? layer.parts === "all" || layer.parts.includes(id) : false;
        look = { ...DEFAULT_LOOK, dim: lit ? 0.12 : 0.74, tint: lit && layer?.parts !== "all" ? DATA_TINT : null, strength: lit && layer?.parts !== "all" ? 0.22 : 0 };
        break;
      }
    }

    // Leads, sensor bodies and brackets belong to the assembled engine: they fade as it comes apart.
    if (part.assembledOnly && s.explodedAmount > 0.04) look = { ...look, opacity: 0, selectable: false };
    if (!s.entered || part.component === null) look = { ...look, selectable: false };
    looks.set(id, look);
  }
  return looks;
}

/** How far the engine sits to one side of the view, as a fraction of its width: it makes room for what is beside it. */
export function sceneShift(s: TwinState): number {
  if (!s.entered) return 0.17;
  if (s.mode === "architecture") return 0;
  const panel = s.component !== null || s.mode === "test" || s.mode === "health" || s.mode === "twin";
  return panel ? -0.09 : 0;
}
