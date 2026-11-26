"use client";
// The site around the shelter: an asphalt apron where vehicles approach the
// bays, the access road to the highway, street lights, and low planters
// along the shelter's sides. Context only; nothing here is simulated.
import { useEffect, useMemo } from "react";
import { BoxGeometry, type BufferGeometry, Color, CylinderGeometry, MeshStandardMaterial } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { asphaltTexture } from "../materials";
import { Forest, type Plant } from "../env/Forest";
import { rng, type Species } from "../env/foliage";

/** Landscaping: clipped shrubs in the planters, trees framing the site (none over the bays or the access lane). */
const PLANTS: Plant[] = (() => {
  const out: Plant[] = [];
  const r = rng(77);
  const add = (x: number, z: number, species: Species, scale: number) => out.push({ x, z, species, scale, rot: r() * Math.PI * 2, seed: out.length * 7 + 3 });
  for (const z of [-8.35, 5.65]) for (let i = 0; i < 12; i++) add(-5.2 + i * 0.82 + (r() - 0.5) * 0.15, z + (r() - 0.5) * 0.15, "shrub", 0.75 + r() * 0.3, );
  // Behind the shelter and along its sides.
  for (let i = 0; i < 7; i++) add(10.5 + r() * 2.5, -16 + i * 4.2 + (r() - 0.5) * 1.2, i % 3 === 1 ? "columnar" : "broadleaf", 0.85 + r() * 0.35);
  for (let i = 0; i < 5; i++) add(-4 + i * 4.4 + (r() - 0.5), -14.5 - r() * 2, i % 2 ? "spreading" : "broadleaf", 0.8 + r() * 0.3);
  for (let i = 0; i < 4; i++) add(-3 + i * 4.5 + (r() - 0.5), 11 + r() * 2, i % 2 ? "young" : "broadleaf", 0.85 + r() * 0.3);
  // Along the access lane and the apron edge.
  for (let i = 0; i < 6; i++) add(-20.5 - r() * 1.5, -16 + i * 6.5, i % 2 ? "columnar" : "young", 0.9 + r() * 0.3);
  for (let i = 0; i < 4; i++) add(-12 + (r() - 0.5) * 2, 9 + i * 3.6, "shrub", 1.1 + r() * 0.4);
  // Farther out: scattered groups that give the lawns depth.
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const d = 32 + r() * 60;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (z > 14 && z < 50) continue;
    add(x, z, (["broadleaf", "spreading", "columnar", "broadleaf", "young"] as Species[])[i % 5], 0.9 + r() * 0.5);
  }
  return out;
})();

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
    for (const z of [-8.35, 5.65]) planter.push(box(10.4, 0.42, 0.9, -0.7, 0.21, z));
    return { apron, kerbs, poles: mergeGeometries(poles)!, heads: mergeGeometries(heads)!, planter: mergeGeometries(planter)! };
  }, []);
  const m = useMemo(
    () => ({
      asphalt: new MeshStandardMaterial({ map: tex, color: "#6a6e74", roughness: 0.9 }),
      kerb: new MeshStandardMaterial({ color: "#a2a7ac", roughness: 0.85 }),
      pole: new MeshStandardMaterial({ color: "#3c4249", metalness: 0.6, roughness: 0.45 }),
      head: new MeshStandardMaterial({ color: "#ffffff", emissive: new Color("#fff1dc"), emissiveIntensity: 2.2 }),
      planter: new MeshStandardMaterial({ color: "#5d6268", roughness: 0.85 }),
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
      <Forest plants={PLANTS} />
    </group>
  );
}
