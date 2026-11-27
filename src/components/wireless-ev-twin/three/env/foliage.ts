// Procedural vegetation: trees and shrubs built from a tapered, slightly bent
// trunk with primary branches and a crown of leaf-cluster cards (an alpha
// texture of overlapping leaves drawn on a canvas at start-up). Card normals
// point out of the crown, so it shades as a soft volume, and vertex colours
// darken its interior and underside (a cheap ambient occlusion). Four species
// give varied silhouettes; every instance also varies in scale, rotation and
// tint. Context only: nothing here is simulated.
import { BufferGeometry, CanvasTexture, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute, IcosahedronGeometry, MeshStandardMaterial, SRGBColorSpace, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type Species = "broadleaf" | "columnar" | "spreading" | "young" | "shrub";
export const SPECIES: readonly Species[] = ["broadleaf", "columnar", "spreading", "young", "shrub"];

/** Deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Shape {
  trunkHeight: number;
  trunkRadius: number;
  /** Crown centre height and radii (horizontal, vertical). */
  crownY: number;
  rx: number;
  ry: number;
  clusters: number;
  cardsPerCluster: number;
  card: number;
  branches: number;
  /** Flattens the crown's underside (umbrella-shaped species). */
  flatBelow: number;
}

const SHAPES: Record<Species, Shape> = {
  broadleaf: { trunkHeight: 2.6, trunkRadius: 0.17, crownY: 4.4, rx: 2.5, ry: 2.1, clusters: 46, cardsPerCluster: 7, card: 1.35, branches: 5, flatBelow: 0.15 },
  columnar: { trunkHeight: 1.1, trunkRadius: 0.13, crownY: 4.3, rx: 0.95, ry: 3.4, clusters: 40, cardsPerCluster: 7, card: 1.0, branches: 0, flatBelow: 0 },
  spreading: { trunkHeight: 3.0, trunkRadius: 0.2, crownY: 4.6, rx: 3.6, ry: 1.35, clusters: 52, cardsPerCluster: 7, card: 1.4, branches: 6, flatBelow: 0.45 },
  young: { trunkHeight: 1.8, trunkRadius: 0.08, crownY: 3.0, rx: 1.25, ry: 1.35, clusters: 22, cardsPerCluster: 7, card: 0.95, branches: 3, flatBelow: 0.1 },
  shrub: { trunkHeight: 0, trunkRadius: 0, crownY: 0.45, rx: 0.75, ry: 0.5, clusters: 12, cardsPerCluster: 6, card: 0.65, branches: 0, flatBelow: 0.5 },
};

/** A tapered cylinder from a to b (open ends), as a non-indexed geometry with normals. */
function limb(a: Vector3, b: Vector3, r0: number, r1: number, sides = 7): BufferGeometry {
  const axis = new Vector3().subVectors(b, a);
  const len = axis.length();
  axis.normalize();
  const ref = Math.abs(axis.y) < 0.95 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0);
  const u = new Vector3().crossVectors(axis, ref).normalize();
  const v = new Vector3().crossVectors(axis, u).normalize();
  const pos: number[] = [];
  const nrm: number[] = [];
  const col: number[] = [];
  const ring = (c: Vector3, r: number, k: number) => {
    const t = (k / sides) * Math.PI * 2;
    const n = new Vector3().addScaledVector(u, Math.cos(t)).addScaledVector(v, Math.sin(t));
    return { p: new Vector3().copy(c).addScaledVector(n, r), n };
  };
  for (let k = 0; k < sides; k++) {
    const p00 = ring(a, r0, k);
    const p01 = ring(a, r0, k + 1);
    const p10 = ring(b, r1, k);
    const p11 = ring(b, r1, k + 1);
    for (const q of [p00, p10, p11, p00, p11, p01]) {
      pos.push(q.p.x, q.p.y, q.p.z);
      nrm.push(q.n.x, q.n.y, q.n.z);
      col.push(1, 1, 1);
    }
  }
  void len;
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new Float32BufferAttribute(nrm, 3));
  g.setAttribute("color", new Float32BufferAttribute(col, 3));
  return g;
}

/** Builds one tree (or shrub) of a species: trunk and branches, and the leaf crown. */
export function buildPlant(species: Species, seed: number, detail = 1): { wood: BufferGeometry | null; leaves: BufferGeometry } {
  const base = SHAPES[species];
  // Level of detail: fewer clusters, larger cards, the same crown volume.
  const s = detail === 1 ? base : { ...base, clusters: Math.max(6, Math.round(base.clusters * detail)), card: base.card / Math.sqrt(detail) };
  const r = rng(seed * 7919 + 13);
  const wood: BufferGeometry[] = [];
  const centre = new Vector3(0, s.crownY, 0);
  if (s.trunkHeight > 0) {
    // Trunk in three slightly bent segments, continuing into the crown.
    const lean = new Vector3((r() - 0.5) * 0.25, 0, (r() - 0.5) * 0.25);
    let p = new Vector3(0, -0.05, 0);
    let rad = s.trunkRadius * 1.25;
    const top = s.trunkHeight + s.ry * 0.55;
    for (let i = 1; i <= 3; i++) {
      const q = new Vector3(lean.x * i + (r() - 0.5) * 0.12, (top * i) / 3, lean.z * i + (r() - 0.5) * 0.12);
      const r1 = s.trunkRadius * (1 - 0.22 * i);
      wood.push(limb(p, q, rad, r1));
      p = q;
      rad = r1;
    }
    centre.x += lean.x * 2;
    centre.z += lean.z * 2;
    for (let b = 0; b < s.branches; b++) {
      const a = (b / s.branches) * Math.PI * 2 + r() * 0.8;
      const start = new Vector3(lean.x * 2, s.trunkHeight * (0.85 + r() * 0.25), lean.z * 2);
      const reach = s.rx * (0.55 + r() * 0.3);
      const end = new Vector3(start.x + Math.cos(a) * reach, s.crownY + (r() - 0.3) * s.ry * 0.6, start.z + Math.sin(a) * reach);
      wood.push(limb(start, end, s.trunkRadius * 0.45, s.trunkRadius * 0.12, 5));
    }
  }
  // Crown: clusters inside the ellipsoid, cards around each cluster.
  const pos: number[] = [];
  const nrm: number[] = [];
  const uv: number[] = [];
  const col: number[] = [];
  const tmp = new Vector3();
  for (let c = 0; c < s.clusters; c++) {
    // Uniform-ish point in the ellipsoid, biased outward so the silhouette is full.
    let d: Vector3;
    do d = new Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
    while (d.lengthSq() > 1);
    d.multiplyScalar(0.35 + 0.65 * Math.cbrt(d.length()));
    if (d.y < -s.flatBelow) d.y = -s.flatBelow + (d.y + 1) * 0.05;
    const cc = new Vector3(centre.x + d.x * s.rx, centre.y + d.y * s.ry, centre.z + d.z * s.rx);
    for (let k = 0; k < s.cardsPerCluster; k++) {
      const size = s.card * (0.7 + r() * 0.6);
      const p = new Vector3(cc.x + (r() - 0.5) * size * 0.8, cc.y + (r() - 0.5) * size * 0.6, cc.z + (r() - 0.5) * size * 0.8);
      // Random card orientation.
      const yaw = r() * Math.PI * 2;
      const pitch = (r() - 0.5) * 1.2;
      const ax = new Vector3(Math.cos(yaw), 0, Math.sin(yaw));
      const ay = new Vector3(-Math.sin(yaw) * Math.sin(pitch), Math.cos(pitch), Math.cos(yaw) * Math.sin(pitch));
      // Normal: outward from the crown, tilted up (sky-lit tops, darker undersides).
      const out = tmp.copy(p).sub(centre);
      out.x /= s.rx;
      out.y /= s.ry;
      out.z /= s.rx;
      const radial = Math.min(1, out.length());
      const n = out.normalize().multiplyScalar(0.8).add(new Vector3(0, 0.45, 0)).normalize();
      const shade = (0.42 + 0.58 * radial) * (0.72 + 0.28 * Math.min(1, Math.max(0, (p.y - (centre.y - s.ry)) / (2 * s.ry))));
      const flip = r() > 0.5;
      const corners = [
        [-1, -1, 0, 0],
        [1, -1, 1, 0],
        [1, 1, 1, 1],
        [-1, -1, 0, 0],
        [1, 1, 1, 1],
        [-1, 1, 0, 1],
      ];
      for (const [cx, cy, u, v] of corners) {
        pos.push(p.x + (ax.x * cx + ay.x * cy) * size * 0.5, p.y + (ax.y * cx + ay.y * cy) * size * 0.5, p.z + (ax.z * cx + ay.z * cy) * size * 0.5);
        nrm.push(n.x, n.y, n.z);
        uv.push(flip ? 1 - u : u, v);
        col.push(shade, shade, shade);
      }
    }
  }
  const leaves = new BufferGeometry();
  leaves.setAttribute("position", new Float32BufferAttribute(pos, 3));
  leaves.setAttribute("normal", new Float32BufferAttribute(nrm, 3));
  leaves.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  leaves.setAttribute("color", new Float32BufferAttribute(col, 3));
  leaves.computeBoundingSphere();
  return { wood: wood.length ? mergeGeometries(wood)! : null, leaves };
}

/**
 * A low-poly stand-in that casts the plant's shadow (crown ellipsoid and
 * trunk). Leaf cards are alpha-tested, which defeats early depth rejection in
 * the shadow pass; this volume gives the same soft shadow for a fraction of
 * the cost. It is drawn only by the sun's shadow camera (layer 1).
 */
export function buildShadowProxy(species: Species): BufferGeometry {
  const s = SHAPES[species];
  const crown = new IcosahedronGeometry(1, 1);
  crown.scale(s.rx * 0.82, s.ry * (0.82 - 0.3 * s.flatBelow), s.rx * 0.82);
  crown.translate(0, s.crownY + 0.15 * s.flatBelow * s.ry, 0);
  const flat = (g: BufferGeometry) => (g.index ? g.toNonIndexed() : g);
  const parts = [flat(crown)];
  if (s.trunkHeight > 0) parts.push(flat(new CylinderGeometry(s.trunkRadius, s.trunkRadius * 1.2, s.crownY, 6).translate(0, s.crownY / 2, 0)));
  return mergeGeometries(parts)!;
}

/** The scene layer the shadow stand-ins live on (rendered by the sun's shadow camera, not the view). */
export const SHADOW_PROXY_LAYER = 1;

/** Overlapping leaves on a transparent canvas: the texture of every leaf card. */
export function leafTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const r = rng(42);
  ctx.clearRect(0, 0, 256, 256);
  for (let i = 0; i < 230; i++) {
    const a = r() * Math.PI * 2;
    const rad = Math.sqrt(r()) * 100;
    const x = 128 + Math.cos(a) * rad;
    const y = 128 + Math.sin(a) * rad;
    const len = 15 + r() * 13;
    const g = 175 + r() * 60;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r() * Math.PI * 2);
    ctx.fillStyle = `rgb(${Math.round(g * 0.8)},${Math.round(g)},${Math.round(g * 0.66)})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, len * 0.5, len * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(30,45,20,0.35)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-len * 0.45, 0);
    ctx.lineTo(len * 0.45, 0);
    ctx.stroke();
    ctx.restore();
  }
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Shared wind clock for the leaf shader (advanced by the scene). */
export const wind = { time: { value: 0 } };

/** A gentle sway that grows with height in the crown; phase varies per tree (instance position). */
function sway(m: MeshStandardMaterial) {
  m.onBeforeCompile = (shader) => {
    shader.uniforms.windTime = wind.time;
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float windTime;").replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
#ifdef USE_INSTANCING
  float wphase = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.21;
#else
  float wphase = 0.0;
#endif
  float wamp = 0.035 * max(0.0, position.y - 1.2);
  transformed.x += sin(windTime * 1.1 + wphase + position.y * 0.6) * wamp;
  transformed.z += cos(windTime * 0.8 + wphase * 1.3 + position.x) * wamp * 0.6;`,
    );
  };
  m.customProgramCacheKey = () => "leaf-sway";
  return m;
}

export function foliageMaterials(leaf: CanvasTexture) {
  return {
    leaves: sway(new MeshStandardMaterial({ map: leaf, alphaTest: 0.42, alphaToCoverage: true, side: DoubleSide, vertexColors: true, roughness: 0.78, metalness: 0, color: new Color("#ffffff"), envMapIntensity: 0.6 })),
    wood: new MeshStandardMaterial({ color: "#4a3d31", roughness: 0.92, metalness: 0, vertexColors: true }),
  };
}

/** Leaf tints per instance: summer greens with an occasional olive or yellow-green. */
export function leafTint(seed: number, out = new Color()): Color {
  const r = rng(seed * 31 + 5);
  const base = [0x6f9a3e, 0x5f8f36, 0x7da447, 0x557f30, 0x8aa44a, 0x648d3b][Math.floor(r() * 6)];
  out.setHex(base);
  const k = 0.85 + r() * 0.3;
  return out.multiplyScalar(k);
}
