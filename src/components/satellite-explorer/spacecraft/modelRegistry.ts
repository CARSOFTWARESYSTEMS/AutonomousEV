// Mapping layer between semantic component ids and scene objects. Every
// interaction (selection, outline, camera focus, labels) resolves a
// ComponentId here, so the procedural model can be replaced by an authored
// GLB without touching interaction logic: bind its nodes with `bindModel`.
import type { Mesh, Object3D } from "three";
import type { ComponentId } from "../types";

interface Registration {
  root: Object3D;
  meshes: Mesh[];
}

const parts = new Map<ComponentId, Registration>();

export function registerPart(id: ComponentId, root: Object3D, meshes: Mesh[]) {
  parts.set(id, { root, meshes });
}

export function unregisterPart(id: ComponentId, root: Object3D) {
  if (parts.get(id)?.root === root) parts.delete(id);
}

export const partRoot = (id: ComponentId) => parts.get(id)?.root ?? null;
export const partMeshes = (id: ComponentId): Mesh[] => parts.get(id)?.meshes ?? [];
export const registeredParts = () => [...parts.keys()];

/** Node name(s) in an authored model for each semantic id. */
export type ModelBinding = Partial<Record<ComponentId, string | readonly string[]>>;

const collectMeshes = (root: Object3D) => {
  const meshes: Mesh[] = [];
  root.traverse((o) => {
    if ((o as Mesh).isMesh) meshes.push(o as Mesh);
  });
  return meshes;
};

/**
 * Register the nodes of a loaded model (for example a GLB scene) under
 * semantic ids. Returns the ids that could not be found, so a mismatched
 * asset is caught at load time rather than failing silently.
 */
export function bindModel(model: Object3D, binding: ModelBinding): ComponentId[] {
  const missing: ComponentId[] = [];
  (Object.keys(binding) as ComponentId[]).forEach((id) => {
    const names = binding[id];
    if (!names) return;
    const list = typeof names === "string" ? [names] : names;
    const nodes = list.map((name) => model.getObjectByName(name)).filter((n): n is Object3D => Boolean(n));
    if (nodes.length === 0) {
      missing.push(id);
      return;
    }
    nodes.forEach((n) => {
      n.userData.componentId = id;
    });
    registerPart(id, nodes[0], nodes.flatMap(collectMeshes));
  });
  return missing;
}

/** Semantic id of the part an intersected object belongs to, walking up the hierarchy. */
export function componentIdOf(object: Object3D | null): ComponentId | null {
  for (let o = object; o; o = o.parent) {
    const id = o.userData?.componentId as ComponentId | undefined;
    if (id) return id;
  }
  return null;
}
