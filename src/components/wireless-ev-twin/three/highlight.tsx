"use client";
// Selection highlight and isolation. The meshes of the selected component
// draw with a tinted copy of their own material; with isolation on, every
// other engineering part draws as a faint ghost. Originals are restored when
// the selection changes. Copies are cached per material and disposed on exit.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { type Material, type Mesh, MeshStandardMaterial, type Object3D } from "three";
import { useTwin } from "../state/store";
import { ghostMaterial, HIGHLIGHT } from "./materials";
import { setMeshMaterial } from "./mutate";

type Mat = Material | Material[];

export function Highlighter() {
  const scene = useThree((s) => s.scene);
  const ghost = useMemo(() => ghostMaterial(), []);
  const copies = useRef(new Map<Material, Material>());
  const swapped = useRef(new Map<Mesh, Mat>());
  const key = useRef("");
  const timer = useRef(0);
  const pulse = useRef(0);

  useEffect(() => {
    const cache = copies.current;
    const live = swapped.current;
    return () => {
      for (const [mesh, original] of live) setMeshMaterial(mesh, original);
      live.clear();
      for (const m of cache.values()) m.dispose();
      cache.clear();
      ghost.dispose();
    };
  }, [ghost]);

  const tinted = (m: Material): Material => {
    let c = copies.current.get(m);
    if (!c) {
      c = m.clone();
      if (c instanceof MeshStandardMaterial) {
        c.emissive.set(HIGHLIGHT);
        c.emissiveIntensity = 0.45;
        c.opacity = Math.max(c.opacity, 0.85);
      }
      copies.current.set(m, c);
    }
    return c;
  };

  useFrame((_, dt) => {
    const s = useTwin.getState();
    timer.current += dt;
    pulse.current += dt;
    const k = `${s.selected}|${s.isolate}|${s.view}|${s.environment}|${s.revision}`;
    // Re-apply on change, and periodically while something is selected (parts can remount).
    if (k === key.current && !(s.selected && timer.current > 0.5)) {
      animate(copies.current, s.reducedMotion ? 0 : pulse.current);
      return;
    }
    key.current = k;
    timer.current = 0;
    for (const [mesh, original] of swapped.current) setMeshMaterial(mesh, original);
    swapped.current.clear();
    if (!s.selected) return;
    scene.traverse((o: Object3D) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      const id = mesh.userData?.component as string | undefined;
      const original = mesh.material as Mat;
      if (id === s.selected) {
        swapped.current.set(mesh, original);
        setMeshMaterial(mesh, Array.isArray(original) ? original.map(tinted) : tinted(original));
      } else if (s.isolate && id) {
        swapped.current.set(mesh, original);
        setMeshMaterial(mesh, ghost);
      }
    });
  });
  return null;
}

/** A slow, small breathing of the highlight (none with reduced motion). */
function animate(copies: Map<Material, Material>, t: number) {
  const v = 0.42 + 0.12 * Math.sin(t * 2.4);
  for (const c of copies.values()) if (c instanceof MeshStandardMaterial) c.emissiveIntensity = v;
}
