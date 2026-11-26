"use client";
// The site around the shelter: an asphalt apron where vehicles approach the
// bays, the access road to the highway, street lights, and low planters
// along the shelter's sides. Context only; nothing here is simulated.
import { useEffect, useMemo } from "react";
import { BoxGeometry, type BufferGeometry, Color, CylinderGeometry, MeshStandardMaterial, SphereGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { asphaltTexture } from "../materials";

const box = (w: number, h: number, d: number, x: number, y: number, z: number) => new BoxGeometry(w, h, d).toNonIndexed().translate(x, y, z);

export function Surroundings() {
  const tex = useMemo(() => {
    const t = asphaltTexture();
    t.repeat.set(6, 10);
    return t;
  }, []);
  const g = useMemo(() => {
    // Apron in front of the bays and the access road toward the highway (z ≈ 24).
    const apron = mergeGeometries([box(11.0, 0.01, 26, -11.7, -0.005, -5), box(4.4, 0.01, 17, -15.0, -0.005, 16.5)])!;
    // Kerbs along the slab's open side, with a gap at each bay.
    const kerbs = mergeGeometries([box(0.18, 0.12, 2.2, -6.25, 0.05, -9.0), box(0.18, 0.12, 2.6, -6.25, 0.05, 5.0)])!;
    const poles: BufferGeometry[] = [];
    const heads: BufferGeometry[] = [];
    for (const z of [-14, -4, 6, 16]) {
      poles.push(new CylinderGeometry(0.06, 0.09, 6.2, 12).toNonIndexed().translate(-17.9, 3.1, z), box(1.4, 0.07, 0.08, -17.3, 6.15, z));
      heads.push(box(0.55, 0.06, 0.22, -16.75, 6.08, z));
    }
    const planter: BufferGeometry[] = [];
    const shrubs: BufferGeometry[] = [];
    for (const z of [-8.35, 5.65]) {
      planter.push(box(10.4, 0.42, 0.9, -0.7, 0.21, z));
      for (let i = 0; i < 14; i++) shrubs.push(new SphereGeometry(0.42 + ((i * 37) % 7) * 0.03, 12, 8).toNonIndexed().scale(1, 0.62, 0.9).translate(-5.4 + i * 0.72, 0.58, z));
    }
    return { apron, kerbs, poles: mergeGeometries(poles)!, heads: mergeGeometries(heads)!, planter: mergeGeometries(planter)!, shrubs: mergeGeometries(shrubs)! };
  }, []);
  const m = useMemo(
    () => ({
      asphalt: new MeshStandardMaterial({ map: tex, color: "#6a6e74", roughness: 0.9 }),
      kerb: new MeshStandardMaterial({ color: "#a2a7ac", roughness: 0.85 }),
      pole: new MeshStandardMaterial({ color: "#3c4249", metalness: 0.6, roughness: 0.45 }),
      head: new MeshStandardMaterial({ color: "#ffffff", emissive: new Color("#fff1dc"), emissiveIntensity: 2.2 }),
      planter: new MeshStandardMaterial({ color: "#5d6268", roughness: 0.85 }),
      shrub: new MeshStandardMaterial({ color: "#20382a", roughness: 0.95 }),
    }),
    [tex],
  );
  useEffect(
    () => () => {
      tex.dispose();
      Object.values(g).forEach((x) => x.dispose());
      Object.values(m).forEach((x) => x.dispose());
    },
    [tex, g, m],
  );
  return (
    <group>
      <mesh geometry={g.apron} material={m.asphalt} receiveShadow />
      <mesh geometry={g.kerbs} material={m.kerb} castShadow receiveShadow />
      <mesh geometry={g.poles} material={m.pole} castShadow />
      <mesh geometry={g.heads} material={m.head} />
      <mesh geometry={g.planter} material={m.planter} castShadow receiveShadow />
      <mesh geometry={g.shrubs} material={m.shrub} castShadow receiveShadow />
    </group>
  );
}
