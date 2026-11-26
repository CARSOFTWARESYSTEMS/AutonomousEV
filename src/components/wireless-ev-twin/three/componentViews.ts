// The view in which each component can actually be seen. Selecting a part
// that is hidden in the current view switches to it, so framing never lands
// on the outside of the car or the closed cabinet.
import type { ViewModeId } from "@/lib/wireless-charging/content";

const VIEW: Record<string, ViewModeId> = {};
for (const id of ["tx-enclosure", "fod-sensor", "tx-coil", "tx-ferrite", "tx-insulation", "tx-shield", "tx-base"]) VIEW[id] = "cutaway";
for (const id of ["rx-enclosure", "rx-coil", "rx-ferrite", "rx-compensation"]) VIEW[id] = "receiver";
for (const id of ["battery-pack", "bms", "hv-junction"]) VIEW[id] = "battery";
for (const id of ["rectifier", "dcdc", "vcu", "traction", "cooling"]) VIEW[id] = "xray";
for (const id of ["protection", "pfc", "dc-link", "inverter", "gate-driver", "tx-compensation", "station-controller", "safety-controller", "iot-gateway", "power-cabinet", "lod-sensor"]) VIEW[id] = "power";

/** Views in which every station component is already visible (science overlays and the exploded pads keep their own framing). */
const KEEP: ViewModeId[] = ["exploded", "field", "energy", "thermal", "iot", "engineering"];

/** On the road: the pads and layers are seen through the section cut. */
const ROAD_VIEW: Record<string, ViewModeId> = { "road-coil": "cutaway", "road-layers": "cutaway", "rx-coil": "receiver" };
const ROAD_KEEP: ViewModeId[] = ["cutaway", "receiver", "segments", "coupling"];

/** The view to switch to when `id` is selected in `current`, or null to stay. */
export function viewFor(id: string, current: ViewModeId, env = "station"): ViewModeId | null {
  if (env === "dynamic") {
    const want = ROAD_VIEW[id];
    return want && want !== current && !ROAD_KEEP.includes(current) ? want : null;
  }
  if (env !== "station") return null;
  const want = VIEW[id];
  if (!want || want === current || KEEP.includes(current)) return null;
  return want;
}
