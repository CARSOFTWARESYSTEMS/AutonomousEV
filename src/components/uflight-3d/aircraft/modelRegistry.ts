// Mapping layer between semantic component ids and scene objects. Selection,
// outline, camera focus and labels all resolve a ComponentId here, so the
// procedural aircraft can be replaced by an authored GLB without touching
// interaction or health logic: bind its nodes with `bindModel`.
import type { Mesh, Object3D } from "three";
import type { ComponentId } from "../types";
import { COMPONENTS, COMPONENT_IDS } from "../data/componentDefinitions";

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

/** Meshes of a component; for an assembly, the meshes of all its parts. */
export function partMeshes(id: ComponentId): Mesh[] {
  const own = parts.get(id)?.meshes;
  if (own) return own;
  return COMPONENT_IDS.filter((child) => COMPONENTS[child].parent === id).flatMap((child) => parts.get(child)?.meshes ?? []);
}

export const registeredParts = () => [...parts.keys()];

const collectMeshes = (root: Object3D) => {
  const meshes: Mesh[] = [];
  root.traverse((o) => {
    if ((o as Mesh).isMesh) meshes.push(o as Mesh);
  });
  return meshes;
};

/**
 * Register the nodes of a loaded model (for example a GLB scene) under
 * semantic ids, using each component's `meshNames`. Returns the ids whose
 * nodes could not be found, so a mismatched asset is caught at load time.
 */
export function bindModel(model: Object3D, ids: readonly ComponentId[] = COMPONENT_IDS): ComponentId[] {
  const missing: ComponentId[] = [];
  for (const id of ids) {
    const nodes = COMPONENTS[id].meshNames.map((name) => model.getObjectByName(name.split("/").pop()!)).filter((n): n is Object3D => Boolean(n));
    if (nodes.length === 0) {
      missing.push(id);
      continue;
    }
    nodes.forEach((n) => {
      n.userData.componentId = id;
    });
    registerPart(id, nodes[0], nodes.flatMap(collectMeshes));
  }
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
