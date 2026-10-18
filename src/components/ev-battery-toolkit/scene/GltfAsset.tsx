"use client";
// Loads a production GLB/GLTF in place of a procedural model and tags the
// mapped nodes with toolkit component ids, so selection and overlays keep
// working unchanged. Used only when MODEL_REGISTRY points an asset at a file.
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { ComponentId } from "@/lib/ev-battery-toolkit/types";

export default function GltfAsset({ url, nodes, onSelect }: { url: string; nodes: Partial<Record<string, string>>; onSelect: (id: ComponentId) => void }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    for (const [id, name] of Object.entries(nodes)) {
      if (!name) continue;
      copy.getObjectByName(name)?.traverse((child) => {
        child.userData.componentId = id;
      });
    }
    return copy;
  }, [scene, nodes]);
  return (
    <primitive
      object={model}
      onClick={(e: { stopPropagation: () => void; object: { userData: { componentId?: ComponentId } } }) => {
        e.stopPropagation();
        const id = e.object.userData.componentId;
        if (id) onSelect(id);
      }}
    />
  );
}
