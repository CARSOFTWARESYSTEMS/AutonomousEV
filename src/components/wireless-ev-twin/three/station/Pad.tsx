"use client";
// A charging-pad assembly built from its real layers, from the air gap
// outward: protective enclosure, foreign-object sense coils (ground pad),
// potting, Litz winding on its former, ferrite, insulation sheet, aluminium
// shield, and the structural base with its terminal box (ground) or mounting
// brackets (vehicle). The winding follows the simulated turn count and radii.
//
// Exploded view: layers separate away from the air gap, so the gap itself
// keeps its true size; with an empty bay the ground pad opens upward from its
// base instead. Cutaway: a quarter of the enclosure is clipped away.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BoxGeometry, type BufferGeometry, CanvasTexture, type Color, CylinderGeometry, DoubleSide, type Group, LatheGeometry, type Material, MeshPhysicalMaterial, MeshStandardMaterial, Plane, Quaternion, Vector2, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { spiralCoil } from "../geometry";
import { enableLocalClipping, setEmissive, setOpacity } from "../mutate";
import { pick } from "../pick";
import { view } from "../viewState";

export interface PadProps {
  turns: number;
  inner: number;
  outer: number;
  /** "ground": winding above ferrite, cover on top. "vehicle": mirrored, cover underneath. */
  side: "ground" | "vehicle";
  /** 0–1 coil glow (current). */
  glow?: () => number;
  /** Tint for the thermal view, or null. */
  heat?: () => Color | null;
}

/** Winding plane above the pad's mounting face, m. */
export const WINDING_OFFSET = 0.034;
const COVER_H = 0.062;

const IDS = {
  ground: { cover: "tx-enclosure", fod: "fod-sensor", potting: "tx-insulation", coil: "tx-coil", ferrite: "tx-ferrite", sheet: "tx-insulation", shield: "tx-shield", base: "tx-base" },
  vehicle: { cover: "rx-enclosure", fod: "rx-enclosure", potting: "rx-enclosure", coil: "rx-coil", ferrite: "rx-ferrite", sheet: "rx-ferrite", shield: "rx-ferrite", base: "rx-enclosure" },
} as const;

type LayerKey = keyof (typeof IDS)["ground"];
/** Layers from the air gap outward, with their exploded distances (away from the gap, and upward from the base). */
const LAYERS: { key: LayerKey; away: number; up: number }[] = [
  { key: "cover", away: 0, up: 0.5 },
  { key: "fod", away: 0.05, up: 0.42 },
  { key: "potting", away: 0.09, up: 0.35 },
  { key: "coil", away: 0.15, up: 0.27 },
  { key: "ferrite", away: 0.22, up: 0.18 },
  { key: "sheet", away: 0.27, up: 0.11 },
  { key: "shield", away: 0.32, up: 0.05 },
  { key: "base", away: 0.38, up: 0 },
];

function housing(radius: number): LatheGeometry {
  const c = 0.016;
  const p = [new Vector2(0, COVER_H), new Vector2(radius - c * 2.4, COVER_H), new Vector2(radius - c * 0.4, COVER_H - c * 0.6), new Vector2(radius, COVER_H - c * 1.6), new Vector2(radius + 0.004, 0.006), new Vector2(radius + 0.006, 0)];
  return new LatheGeometry(p, 96);
}

function disc(r: number, y0: number, y1: number, seg = 72) {
  const g = new CylinderGeometry(r, r, y1 - y0, seg);
  g.translate(0, (y0 + y1) / 2, 0);
  return g;
}

/** Radial ferrite bars between the winding's inner region and its outer edge. */
function ferrite(inner: number, outer: number): BufferGeometry {
  const parts: BufferGeometry[] = [];
  const len = outer + 0.012 - inner * 0.45;
  for (let i = 0; i < 16; i++) {
    const g = new BoxGeometry(0.042, 0.012, len).toNonIndexed();
    g.translate(0, 0.0155, inner * 0.45 + len / 2);
    g.rotateY((i / 16) * Math.PI * 2);
    parts.push(g);
  }
  return mergeGeometries(parts)!;
}

/** Slotted former: eight radial ribs the winding rests on. */
function former(inner: number, outer: number): BufferGeometry {
  const parts: BufferGeometry[] = [disc(inner * 0.9, 0.0215, 0.03, 36).toNonIndexed()];
  for (let i = 0; i < 8; i++) {
    const len = outer + 0.01 - inner * 0.9;
    const g = new BoxGeometry(0.012, 0.009, len).toNonIndexed();
    g.translate(0, 0.026, inner * 0.9 + len / 2);
    g.rotateY(((i + 0.5) / 8) * Math.PI * 2);
    parts.push(g);
  }
  return mergeGeometries(parts)!;
}

function base(radius: number, side: "ground" | "vehicle"): BufferGeometry {
  const parts: BufferGeometry[] = [disc(radius + 0.004, 0, 0.004).toNonIndexed()];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const bolt = new CylinderGeometry(0.009, 0.009, 0.01, 6).toNonIndexed();
    bolt.translate(Math.cos(a) * (radius - 0.02), side === "ground" ? 0.008 : -0.004, Math.sin(a) * (radius - 0.02));
    parts.push(bolt);
  }
  if (side === "ground") {
    // Terminal box and cable gland on the edge facing the power cabinet (+x).
    const box = new BoxGeometry(0.09, 0.048, 0.13).toNonIndexed();
    box.translate(radius + 0.05, 0.024, 0);
    const gland = new CylinderGeometry(0.016, 0.016, 0.03, 16).toNonIndexed();
    gland.rotateZ(Math.PI / 2);
    gland.translate(radius + 0.105, 0.022, 0);
    parts.push(box, gland);
  } else {
    // Mounting brackets to the battery enclosure.
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const b = new BoxGeometry(0.08, 0.012, 0.04).toNonIndexed();
      b.translate(Math.cos(a) * (radius - 0.03), -0.006, Math.sin(a) * (radius - 0.03));
      parts.push(b);
    }
    const box = new BoxGeometry(0.08, 0.04, 0.1).toNonIndexed();
    box.translate(radius - 0.02, -0.02, 0.12);
    parts.push(box);
  }
  return mergeGeometries(parts)!;
}

let fodTex: CanvasTexture | null = null;
/** A printed array of small sense coils, as used for foreign-object detection. */
function fodTexture(): CanvasTexture {
  if (fodTex) return fodTex;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#1c3d2f";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "rgba(214,170,96,0.9)";
  ctx.lineWidth = 1.4;
  for (let y = 8; y < 256; y += 20) {
    for (let x = 8; x < 256; x += 20) {
      for (let r = 2; r < 8; r += 2.2) ctx.strokeRect(x - r, y - r, r * 2, r * 2);
    }
  }
  fodTex = new CanvasTexture(canvas);
  return fodTex;
}

const damp = (a: number, b: number, rate: number, dt: number) => a + (b - a) * (1 - Math.exp(-rate * dt));
const tmpQ = new Quaternion();
const tmpV = new Vector3();
const tmpN = new Vector3();

export function Pad({ turns, inner, outer, side, glow, heat }: PadProps) {
  const s = side === "ground" ? 1 : -1;
  const radius = outer + 0.045;
  const gl = useThree((st) => st.gl);
  const geo = useMemo(
    () => ({
      cover: housing(radius),
      fod: disc(outer + 0.03, 0.046, 0.0475),
      potting: disc(outer + 0.03, 0.04, 0.044),
      coil: spiralCoil(inner, outer, turns, 0.0062, WINDING_OFFSET),
      former: former(inner, outer),
      ferrite: ferrite(inner, outer),
      sheet: disc(radius - 0.01, 0.0075, 0.0095),
      shield: disc(radius - 0.006, 0.004, 0.0075),
      base: base(radius, side),
    }),
    [inner, outer, turns, radius, side],
  );
  const mats = useMemo(
    () => ({
      cover: new MeshPhysicalMaterial({ color: side === "ground" ? "#23272d" : "#1a1d22", metalness: 0.05, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4, side: DoubleSide }),
      fod: new MeshStandardMaterial({ map: fodTexture(), roughness: 0.6, metalness: 0.1 }),
      potting: new MeshStandardMaterial({ color: "#c98f3a", roughness: 0.35, metalness: 0, transparent: true, opacity: 0.42, depthWrite: false }),
      copper: new MeshStandardMaterial({ color: "#c77b4a", metalness: 1, roughness: 0.3 }),
      former: new MeshStandardMaterial({ color: "#8c8a62", roughness: 0.7 }),
      ferrite: new MeshStandardMaterial({ color: "#26272b", metalness: 0.15, roughness: 0.62 }),
      sheet: new MeshStandardMaterial({ color: "#b8862e", roughness: 0.45, transparent: true, opacity: 0.85 }),
      shield: new MeshStandardMaterial({ color: "#c7ccd2", metalness: 1, roughness: 0.3 }),
      base: new MeshStandardMaterial({ color: side === "ground" ? "#5f656d" : "#8e949b", metalness: 0.75, roughness: 0.45 }),
    }),
    [side],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  const root = useRef<Group>(null);
  const layers = useRef<Partial<Record<LayerKey, Group | null>>>({});
  const planes = useMemo(() => [new Plane(), new Plane()], []);
  const clipOn = useRef(false);

  useFrame((_, dt) => {
    const ex = view.exploded;
    // Ground pad with no vehicle over it: open upward from the base. Otherwise away from the gap.
    const upward = side === "ground" ? 1 - view.occupied : 0;
    for (const l of LAYERS) {
      const g = layers.current[l.key];
      if (g) g.position.y = ex * (upward * l.up - (1 - upward) * l.away);
    }
    const g = glow ? glow() : 0;
    const h = heat?.() ?? null;
    setEmissive(mats.copper, h ?? "#ff8a3d", h ? 0.9 : 0.05 + 1.3 * g);
    // The enclosure turns translucent to show the winding, except in the cutaway, where a quarter is removed instead.
    const target = 1 - 0.84 * view.reveal * (1 - view.cut);
    setOpacity(mats.cover, damp(mats.cover.opacity, target, 6, dt), 0.6);
    // Quarter-section clipping planes follow the pad's world pose.
    const cut = view.cut > 0.5;
    if (cut !== clipOn.current) {
      clipOn.current = cut;
      enableLocalClipping(gl);
      for (const m of [mats.cover, mats.fod, mats.potting, mats.base, mats.shield, mats.sheet] as Material[]) assignClipping(m, cut ? planes : null);
    }
    if (cut && root.current) {
      root.current.getWorldQuaternion(tmpQ);
      root.current.getWorldPosition(tmpV);
      planes[0].setFromNormalAndCoplanarPoint(tmpN.set(-1, 0, 0).applyQuaternion(tmpQ), tmpV);
      planes[1].setFromNormalAndCoplanarPoint(tmpN.set(0, 0, -1).applyQuaternion(tmpQ), tmpV);
    }
  });

  const ids = IDS[side];
  const layer = (key: LayerKey) => (el: Group | null) => {
    layers.current[key] = el;
  };
  return (
    <group ref={root} scale={[1, s, 1]}>
      <group ref={layer("cover")}>
        <mesh geometry={geo.cover} material={mats.cover} castShadow receiveShadow {...pick(ids.cover)} />
      </group>
      {side === "ground" && (
        <group ref={layer("fod")}>
          <mesh geometry={geo.fod} material={mats.fod} {...pick(ids.fod)} />
        </group>
      )}
      <group ref={layer("potting")}>
        <mesh geometry={geo.potting} material={mats.potting} renderOrder={2} {...pick(ids.potting)} />
      </group>
      <group ref={layer("coil")}>
        <mesh geometry={geo.coil} material={mats.copper} castShadow {...pick(ids.coil)} />
        <mesh geometry={geo.former} material={mats.former} {...pick(ids.coil)} />
      </group>
      <group ref={layer("ferrite")}>
        <mesh geometry={geo.ferrite} material={mats.ferrite} {...pick(ids.ferrite)} />
      </group>
      <group ref={layer("sheet")}>
        <mesh geometry={geo.sheet} material={mats.sheet} {...pick(ids.sheet)} />
      </group>
      <group ref={layer("shield")}>
        <mesh geometry={geo.shield} material={mats.shield} {...pick(ids.shield)} />
      </group>
      <group ref={layer("base")}>
        <mesh geometry={geo.base} material={mats.base} castShadow receiveShadow {...pick(ids.base)} />
      </group>
    </group>
  );
}

/** Sets or clears a material's clipping planes (a shader change, so it recompiles once). */
function assignClipping(m: Material, planes: Plane[] | null) {
  m.clippingPlanes = planes;
  m.clipIntersection = true;
  m.needsUpdate = true;
}

/** A ground pad assembly at the origin of its group (its mounting face 2 mm above the slab). */
export function GroundPad({ turns, inner, outer, glow, heat }: { turns: number; inner: number; outer: number; glow?: () => number; heat?: () => Color | null }) {
  return (
    <group position={[0, 0.002, 0]}>
      <Pad side="ground" turns={turns} inner={inner} outer={outer} glow={glow} heat={heat} />
    </group>
  );
}
