// The replacement path for production 3D assets.
//
// Today every asset is procedural: the scene builds the scooter and the pack
// from data (src/data/ev-battery-toolkit/architectures.ts and the resolved
// pack). To use a real model, export it as GLB/GLTF, put it under
// /public/models/ev-battery-toolkit/, and change its entry here to
// `{ kind: "gltf", url, nodes }`, mapping each toolkit component id to the node
// name in the file. Selection, highlighting and every diagnostic overlay key on
// component ids, never on geometry, so nothing else changes.
import type { ComponentId } from "@/lib/ev-battery-toolkit/types";

export type AssetId = "generic-scooter" | "pack-fixed-floor" | "pack-swappable" | "pack-serviceable";

export type AssetSource =
  | { kind: "procedural"; label: string }
  | {
      kind: "gltf";
      url: string;
      label: string;
      /** Toolkit component id → node name inside the GLB. */
      nodes: Partial<Record<ComponentId | "scooter-body" | "battery-bay", string>>;
      /** True only when the model is checked against the manufacturer's vehicle. */
      oemVerified: boolean;
    };

export const MODEL_REGISTRY: Record<AssetId, AssetSource> = {
  "generic-scooter": { kind: "procedural", label: "Generic procedural scooter — NOT OEM GEOMETRY" },
  "pack-fixed-floor": { kind: "procedural", label: "Procedural fixed floor pack — educational representation" },
  "pack-swappable": { kind: "procedural", label: "Procedural swappable pack — educational representation" },
  "pack-serviceable": { kind: "procedural", label: "Procedural serviceable pack — educational representation" },
};

export function packAssetFor(architecture: "fixed-floor" | "swappable" | "serviceable-pack"): AssetId {
  return architecture === "fixed-floor" ? "pack-fixed-floor" : architecture === "swappable" ? "pack-swappable" : "pack-serviceable";
}

/** Whether any asset in use would need the GLTF loader. */
export const usesGltf = (ids: AssetId[]) => ids.some((id) => MODEL_REGISTRY[id].kind === "gltf");
