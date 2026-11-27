"use client";
// Instanced vegetation. Every species has two variants; each variant is one
// instanced trunk mesh and one instanced crown, so a whole corridor of trees
// costs a few draw calls. Instances may wrap along x (the road is drawn in the
// vehicle's frame), with a period that divides the simulated route.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type BufferGeometry, Color, type InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, Vector3 } from "three";
import { buildPlant, buildShadowProxy, foliageMaterials, leafTexture, leafTint, SHADOW_PROXY_LAYER, type Species, SPECIES, wind } from "./foliage";

export interface Plant {
  x: number;
  z: number;
  y?: number;
  species: Species;
  scale: number;
  rot: number;
  seed: number;
}

const VARIANTS = 2;
let shared: { geo: Record<string, ReturnType<typeof buildPlant>>; proxy: Record<string, BufferGeometry>; proxyMat: MeshBasicMaterial; tex: ReturnType<typeof leafTexture>; mats: ReturnType<typeof foliageMaterials>; users: number } | null = null;

function acquire() {
  if (!shared) {
    const geo: Record<string, ReturnType<typeof buildPlant>> = {};
    for (const s of SPECIES)
      for (let v = 0; v < VARIANTS; v++) {
        geo[`${s}${v}`] = buildPlant(s, v * 101 + s.length * 17);
        // Distant level of detail.
        geo[`${s}${v}far`] = buildPlant(s, v * 101 + s.length * 17, 0.5);
      }
    const proxy: Record<string, BufferGeometry> = {};
    for (const sp of SPECIES) proxy[sp] = buildShadowProxy(sp);
    const tex = leafTexture();
    shared = { geo, proxy, proxyMat: new MeshBasicMaterial({ colorWrite: false, depthWrite: false }), tex, mats: foliageMaterials(tex), users: 0 };
  }
  shared.users += 1;
  return shared;
}
function release() {
  if (!shared) return;
  shared.users -= 1;
  if (shared.users > 0) return;
  for (const g of Object.values(shared.geo)) {
    g.leaves.dispose();
    g.wood?.dispose();
  }
  for (const g of Object.values(shared.proxy)) g.dispose();
  shared.proxyMat.dispose();
  shared.tex.dispose();
  shared.mats.leaves.dispose();
  shared.mats.wood.dispose();
  shared = null;
}

const m4 = new Matrix4();
const p3 = new Vector3();
const q4 = new Quaternion();
const s3 = new Vector3();
const up = new Vector3(0, 1, 0);
const tint = new Color();
const bark = new Color();

function setMatrix(el: InstancedMesh, i: number, p: Plant, wrap?: (x: number) => number) {
  p3.set(wrap ? wrap(p.x) : p.x, p.y ?? 0, p.z);
  q4.setFromAxisAngle(up, p.rot);
  s3.setScalar(p.scale);
  m4.compose(p3, q4, s3);
  el.setMatrixAt(i, m4);
}

interface Props {
  plants: readonly Plant[];
  /** Road-frame wrapping: x is placed at wrap(plant.x) each frame. */
  wrap?: (x: number) => number;
  shadows?: boolean;
  /** Distant plants: the lighter level of detail. */
  far?: boolean;
}

export function Forest({ plants, wrap, shadows = true, far = false }: Props) {
  const assets = useMemo(() => acquire(), []);
  useEffect(() => () => release(), []);
  const groups = useMemo(() => {
    const out: { key: string; list: Plant[] }[] = [];
    for (const s of SPECIES) for (let v = 0; v < VARIANTS; v++) out.push({ key: `${s}${v}`, list: plants.filter((p) => p.species === s && p.seed % VARIANTS === v) });
    return out.filter((g) => g.list.length > 0);
  }, [plants]);
  const meshes = useRef<Record<string, { wood: InstancedMesh | null; leaves: InstancedMesh | null; proxy: InstancedMesh | null }>>({});

  /** Colours and first placement as soon as a mesh exists (before its first frame, so the shader includes instance colours). */
  const attach = (key: string, list: Plant[], kind: "wood" | "leaves" | "proxy") => (el: InstancedMesh | null) => {
    const slot = (meshes.current[key] ??= { wood: null, leaves: null, proxy: null });
    slot[kind] = el;
    if (!el) return;
    if (kind === "proxy") el.layers.set(SHADOW_PROXY_LAYER);
    list.forEach((p, i) => {
      if (kind !== "proxy") el.setColorAt(i, kind === "leaves" ? leafTint(p.seed, tint) : bark.setScalar(0.8 + ((p.seed * 13) % 7) * 0.05));
      setMatrix(el, i, p, wrap);
    });
    if (el.instanceColor) el.instanceColor.needsUpdate = true;
    el.instanceMatrix.needsUpdate = true;
  };

  useFrame((_, dt) => {
    wind.time.value += Math.min(dt, 0.1);
    if (!wrap) return;
    for (const g of groups) {
      const r = meshes.current[g.key];
      if (!r) continue;
      for (const el of [r.wood, r.leaves, r.proxy]) {
        if (!el) continue;
        g.list.forEach((p, i) => setMatrix(el, i, p, wrap));
        el.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {groups.map((g) => {
        const geo = assets.geo[far ? `${g.key}far` : g.key];
        return (
          <group key={g.key}>
            {geo.wood && <instancedMesh ref={attach(g.key, g.list, "wood")} args={[geo.wood, assets.mats.wood, g.list.length]} frustumCulled={false} />}
            <instancedMesh ref={attach(g.key, g.list, "leaves")} args={[geo.leaves, assets.mats.leaves, g.list.length]} receiveShadow frustumCulled={false} />
            {/* The shadow comes from a low-poly stand-in seen only by the sun's shadow camera. */}
            {shadows && <instancedMesh ref={attach(g.key, g.list, "proxy")} args={[assets.proxy[g.key.replace(/\d+$/, "")], assets.proxyMat, g.list.length]} castShadow frustumCulled={false} />}
          </group>
        );
      })}
    </group>
  );
}
