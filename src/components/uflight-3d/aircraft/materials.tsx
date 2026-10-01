// PBR material presets and mesh building blocks for the reference aircraft.
// Every mesh gets its own material instance so a part can be faded, tinted
// or highlighted on its own.
import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei/core/RoundedBox";
import type { ThreeElements } from "@react-three/fiber";
import { type BufferGeometry, CanvasTexture, CatmullRomCurve3, DoubleSide, RepeatWrapping, SRGBColorSpace, type Side, type Texture, Vector3 } from "three";
import type { Vec3 } from "../types";

interface Preset {
  physical?: boolean;
  color: string;
  metalness: number;
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  envMapIntensity?: number;
  map?: "carbon";
}

export const MATERIALS = {
  // Exterior
  /** Warm ceramic aerospace white: painted composite under a satin clear coat. */
  paint: { physical: true, color: "#d6d1c7", metalness: 0, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 },
  graphite: { physical: true, color: "#2b2d31", metalness: 0.1, roughness: 0.52, clearcoat: 0.3, clearcoatRoughness: 0.4 },
  carbon: { physical: true, color: "#ffffff", metalness: 0.1, roughness: 0.44, clearcoat: 0.7, clearcoatRoughness: 0.22, map: "carbon" },
  /** Dark neutral aircraft glazing. */
  glass: { physical: true, color: "#0c1014", metalness: 0, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, opacity: 0.46, envMapIntensity: 1.5 },
  rubber: { color: "#0d0d0e", metalness: 0, roughness: 0.92 },
  // Metals
  aluminium: { color: "#c3c7cd", metalness: 0.92, roughness: 0.34 },
  machined: { color: "#d3d6da", metalness: 0.96, roughness: 0.24 },
  titanium: { color: "#8d8a86", metalness: 0.9, roughness: 0.42 },
  steel: { color: "#bcc0c4", metalness: 1, roughness: 0.2 },
  darkSteel: { color: "#4c4f55", metalness: 0.9, roughness: 0.42 },
  copper: { color: "#b9763f", metalness: 1, roughness: 0.36 },
  magnet: { color: "#34373c", metalness: 0.7, roughness: 0.38 },
  // Equipment
  enclosure: { color: "#23262b", metalness: 0.78, roughness: 0.44 },
  enclosureLight: { color: "#5b5f66", metalness: 0.82, roughness: 0.4 },
  batteryCase: { color: "#1a1c20", metalness: 0.5, roughness: 0.5 },
  cell: { color: "#39404a", metalness: 0.35, roughness: 0.46 },
  connector: { color: "#b9a05a", metalness: 0.9, roughness: 0.36 },
  sensor: { color: "#474b53", metalness: 0.7, roughness: 0.38 },
  radiator: { color: "#9aa0a8", metalness: 0.85, roughness: 0.42 },
  plastic: { color: "#15171a", metalness: 0, roughness: 0.62 },
  screen: { color: "#04060a", metalness: 0.2, roughness: 0.2, emissive: "#16303c", emissiveIntensity: 0.9 },
  // Harness
  cableHv: { color: "#d2742a", metalness: 0, roughness: 0.6 },
  cableData: { color: "#2e343c", metalness: 0, roughness: 0.6 },
  coolantLine: { color: "#2c5578", metalness: 0.1, roughness: 0.5 },
  // Cabin
  interior: { color: "#d8d4cb", metalness: 0, roughness: 0.74 },
  seatShell: { color: "#e4e0d7", metalness: 0, roughness: 0.5 },
  seatFabric: { color: "#9fa3a8", metalness: 0, roughness: 0.9 },
  seatTrim: { color: "#34373b", metalness: 0.2, roughness: 0.6 },
  floor: { color: "#7c8086", metalness: 0.25, roughness: 0.62 },
} as const satisfies Record<string, Preset>;

export type MaterialKey = keyof typeof MATERIALS;

let carbonTexture: Texture | null = null;

/** A small twill weave, tiled over exposed carbon. */
function getCarbonTexture(): Texture {
  if (carbonTexture) return carbonTexture;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#191a1d";
  ctx.fillRect(0, 0, size, size);
  const tow = size / 4;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      // 2×2 twill: each tow passes over two and under two, stepping one each row.
      const over = (col + row) % 4 < 2;
      const gradient = over ? ctx.createLinearGradient(col * tow, 0, (col + 1) * tow, 0) : ctx.createLinearGradient(0, row * tow, 0, (row + 1) * tow);
      gradient.addColorStop(0, "#17181b");
      gradient.addColorStop(0.5, over ? "#33353a" : "#26282c");
      gradient.addColorStop(1, "#17181b");
      ctx.fillStyle = gradient;
      ctx.fillRect(col * tow + 0.5, row * tow + 0.5, tow - 1, tow - 1);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  carbonTexture = texture;
  return texture;
}

export function disposeMaterialTextures() {
  carbonTexture?.dispose();
  carbonTexture = null;
}

interface MatProps {
  k: MaterialKey;
  side?: Side;
  /** The material animates its own emissive; the Part leaves it alone. */
  live?: boolean;
  /** Tiling of the preset's texture. */
  repeat?: readonly [number, number];
  color?: string;
}

/** One material instance from a preset. */
export function Mat({ k, side, live, repeat, color }: MatProps) {
  const preset: Preset = MATERIALS[k];
  const repeatU = repeat?.[0];
  const repeatV = repeat?.[1];
  const map = useMemo(() => {
    if (!preset.map) return undefined;
    const texture = getCarbonTexture().clone();
    texture.repeat.set(repeatU ?? 6, repeatV ?? 6);
    return texture;
  }, [preset.map, repeatU, repeatV]);

  const shared = {
    color: color ?? preset.color,
    metalness: preset.metalness,
    roughness: preset.roughness,
    map,
    emissive: preset.emissive ?? "#000000",
    emissiveIntensity: preset.emissiveIntensity ?? 1,
    opacity: preset.opacity ?? 1,
    transparent: (preset.opacity ?? 1) < 1,
    envMapIntensity: preset.envMapIntensity ?? 1,
    side,
    userData: live ? { live: true } : undefined,
  };
  if (preset.physical) return <meshPhysicalMaterial {...shared} clearcoat={preset.clearcoat ?? 0} clearcoatRoughness={preset.clearcoatRoughness ?? 0} />;
  return <meshStandardMaterial {...shared} />;
}

type Placement = Pick<ThreeElements["group"], "position" | "rotation" | "scale">;

/** Below this size a chamfer cannot be seen, so the box is drawn with plain faces. */
const CHAMFER_FROM = 0.05;

/** Chamfered box. Small boxes and thin plates are plain: their edges are never seen closely enough to matter. */
export function Box({ size, mat, radius = 0.012, color, ...props }: { size: Vec3; mat: MaterialKey; radius?: number; color?: string } & Placement) {
  const thinnest = Math.min(size[0], size[1], size[2]);
  if (thinnest < CHAMFER_FROM || radius < 0.006) {
    return (
      <mesh castShadow receiveShadow {...props}>
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <Mat k={mat} color={color} />
      </mesh>
    );
  }
  return (
    <RoundedBox args={[size[0], size[1], size[2]]} radius={Math.min(radius, thinnest * 0.45)} smoothness={1} castShadow receiveShadow {...props}>
      <Mat k={mat} color={color} />
    </RoundedBox>
  );
}

const AXIS_ROTATION = { x: [0, 0, -Math.PI / 2], y: [0, 0, 0], z: [Math.PI / 2, 0, 0] } as const;

/** Cylinder whose axis runs along x, y or z. `rTop` makes it a cone frustum; `inner` is not drawn (use Ring for a hollow one). */
export function Cyl({
  r,
  h,
  axis = "y",
  mat,
  rTop,
  segments = 20,
  open = false,
  doubleSide = false,
  position,
  color,
}: {
  r: number;
  h: number;
  axis?: "x" | "y" | "z";
  mat: MaterialKey;
  rTop?: number;
  segments?: number;
  open?: boolean;
  doubleSide?: boolean;
  position?: Vec3;
  color?: string;
}) {
  return (
    <mesh position={position as [number, number, number] | undefined} rotation={AXIS_ROTATION[axis] as unknown as [number, number, number]} castShadow receiveShadow>
      <cylinderGeometry args={[rTop ?? r, r, h, segments, 1, open]} />
      <Mat k={mat} side={doubleSide ? DoubleSide : undefined} color={color} />
    </mesh>
  );
}

/** A ring (annulus with thickness) about an axis: bearing races, stator, seals. */
export function Ring({ r, tube, axis = "x", mat, position, segments = 24 }: { r: number; tube: number; axis?: "x" | "y" | "z"; mat: MaterialKey; position?: Vec3; segments?: number }) {
  const rotation = axis === "x" ? [0, Math.PI / 2, 0] : axis === "y" ? [Math.PI / 2, 0, 0] : [0, 0, 0];
  return (
    <mesh position={position as [number, number, number] | undefined} rotation={rotation as [number, number, number]} castShadow receiveShadow>
      <torusGeometry args={[r, tube, 8, segments]} />
      <Mat k={mat} />
    </mesh>
  );
}

/** A mesh from a prebuilt geometry. */
export function Geo({
  geometry,
  mat,
  doubleSide = false,
  castShadow = true,
  repeat,
  renderOrder,
  ...props
}: { geometry: BufferGeometry; mat: MaterialKey; doubleSide?: boolean; castShadow?: boolean; repeat?: readonly [number, number]; renderOrder?: number } & Placement) {
  return (
    <mesh geometry={geometry} castShadow={castShadow} receiveShadow renderOrder={renderOrder} {...props}>
      <Mat k={mat} side={doubleSide ? DoubleSide : undefined} repeat={repeat} />
    </mesh>
  );
}

/** Insert a point either side of every corner so a spline through the result has tight, rounded bends. */
export function roundedPolyline(points: readonly Vec3[], cornerRadius = 0.08): Vector3[] {
  const out: Vector3[] = [];
  const v = points.map((p) => new Vector3(p[0], p[1], p[2]));
  v.forEach((point, i) => {
    if (i === 0 || i === v.length - 1) {
      out.push(point.clone());
      return;
    }
    const toPrev = v[i - 1].clone().sub(point);
    const toNext = v[i + 1].clone().sub(point);
    out.push(point.clone().add(toPrev.setLength(Math.min(cornerRadius, toPrev.length() * 0.45))), point.clone().add(toNext.setLength(Math.min(cornerRadius, toNext.length() * 0.45))));
  });
  return out;
}

export const curveThrough = (points: readonly Vec3[], cornerRadius?: number) => new CatmullRomCurve3(roundedPolyline(points, cornerRadius), false, "centripetal");

/** A cable, hose or tube following a routed polyline. */
export function Cable({ points, radius = 0.012, mat, cornerRadius }: { points: readonly Vec3[]; radius?: number; mat: MaterialKey; cornerRadius?: number }) {
  const curve = useMemo(() => curveThrough(points, cornerRadius), [points, cornerRadius]);
  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, Math.max(12, points.length * 7), radius, 5, false]} />
      <Mat k={mat} />
    </mesh>
  );
}
