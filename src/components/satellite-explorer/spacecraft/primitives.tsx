// Building blocks for the procedural reference model: chamfered boxes,
// cylinders, boards and PBR material presets. Every mesh gets its own material
// instance so a part can be faded, tinted or highlighted on its own.
import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei/core/RoundedBox";
import type { ThreeElements } from "@react-three/fiber";
import { CatmullRomCurve3, DoubleSide, type Side, Vector3 } from "three";
import type { Vec3 } from "../types";
import { getSpacecraftTextures } from "./textures";

interface Preset {
  physical?: boolean;
  color: string;
  metalness: number;
  roughness: number;
  map?: "solarCells" | "batteryWrap" | "pcb" | "radiator";
  /** Texture whose green channel scales roughness and blue channel scales metalness. */
  surfaceMap?: "solarSurface";
  normalMap?: "mliNormal";
  normalScale?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  /** Thin-film interference, 0–1: the colour shift of a coated surface with viewing angle. */
  iridescence?: number;
  /** Film thickness range in nanometres. */
  iridescenceThickness?: readonly [number, number];
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  envMapIntensity?: number;
}

export const MATERIALS = {
  // Structure
  frame: { color: "#b3b8c0", metalness: 0.9, roughness: 0.38 },
  rail: { color: "#3a3d44", metalness: 0.78, roughness: 0.46 },
  panel: { color: "#8b919a", metalness: 0.86, roughness: 0.44 },
  machined: { color: "#c9cdd3", metalness: 0.95, roughness: 0.27 },
  // Electronics
  enclosure: { color: "#24272d", metalness: 0.8, roughness: 0.42 },
  shield: { color: "#9ba1aa", metalness: 0.92, roughness: 0.33 },
  pcb: { color: "#ffffff", metalness: 0.12, roughness: 0.62, map: "pcb" },
  chip: { color: "#0c0d10", metalness: 0.2, roughness: 0.55 },
  connector: { color: "#d6d0c0", metalness: 0.05, roughness: 0.65 },
  gold: { color: "#ffd27d", metalness: 1, roughness: 0.24 },
  nickel: { color: "#cfd2d4", metalness: 1, roughness: 0.34 },
  plastic: { color: "#14161a", metalness: 0, roughness: 0.6 },
  copper: { color: "#b87740", metalness: 1, roughness: 0.36 },
  // Power
  // Roughness and metalness come from the panel's surface map; the cover glass is the clearcoat
  // and its anti-reflection coating the thin film.
  cell: {
    physical: true,
    color: "#ffffff",
    metalness: 1,
    roughness: 1,
    map: "solarCells",
    surfaceMap: "solarSurface",
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: 0.45,
    iridescenceThickness: [170, 340],
    envMapIntensity: 1.3,
  },
  panelBack: { color: "#131417", metalness: 0.35, roughness: 0.62 },
  batteryCell: { physical: true, color: "#ffffff", metalness: 0, roughness: 0.42, map: "batteryWrap", clearcoat: 0.55, clearcoatRoughness: 0.3 },
  cableGround: { color: "#16181c", metalness: 0.05, roughness: 0.6 },
  cablePower: { color: "#7a2a25", metalness: 0.05, roughness: 0.6 },
  cableData: { color: "#2a3038", metalness: 0.05, roughness: 0.6 },
  // Thermal
  // Aluminised polyimide: a gold mirror under a glossy film.
  mli: { physical: true, color: "#ffc35c", metalness: 1, roughness: 0.2, normalMap: "mliNormal", normalScale: 1, clearcoat: 0.6, clearcoatRoughness: 0.12, envMapIntensity: 1.5 },
  radiator: { color: "#f1f3f5", metalness: 0.6, roughness: 0.2, map: "radiator" },
  kapton: { color: "#d99a2e", metalness: 0.55, roughness: 0.34 },
  // Optics and antennas
  glass: { physical: true, color: "#0a1220", metalness: 0, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.02, opacity: 0.32 },
  lens: { physical: true, color: "#05070b", metalness: 0.1, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02 },
  mirror: { color: "#e3e9f0", metalness: 1, roughness: 0.05 },
  black: { color: "#07080a", metalness: 0.05, roughness: 0.9 },
  ceramic: { color: "#e6e2d6", metalness: 0, roughness: 0.72 },
  white: { color: "#eef0f2", metalness: 0, roughness: 0.6 },
} as const satisfies Record<string, Preset>;

export type MaterialKey = keyof typeof MATERIALS;

/** One material instance from a preset. `repeat` tiles its normal map, for surfaces of different sizes. */
export function Mat({ k, side, live, repeat }: { k: MaterialKey; side?: Side; live?: boolean; repeat?: readonly [number, number] }) {
  const preset: Preset = MATERIALS[k];
  const textures = getSpacecraftTextures();
  const baseNormal = preset.normalMap ? textures[preset.normalMap] : undefined;
  const repeatU = repeat?.[0];
  const repeatV = repeat?.[1];
  const normalMap = useMemo(() => {
    if (!baseNormal || repeatU === undefined || repeatV === undefined) return baseNormal;
    // A clone shares the image; only the tiling is its own.
    const tiled = baseNormal.clone();
    tiled.repeat.set(repeatU, repeatV);
    return tiled;
  }, [baseNormal, repeatU, repeatV]);
  useEffect(
    () => () => {
      if (normalMap && normalMap !== baseNormal) normalMap.dispose();
    },
    [normalMap, baseNormal],
  );

  const surfaceMap = preset.surfaceMap ? textures[preset.surfaceMap] : undefined;
  const shared = {
    color: preset.color,
    metalness: preset.metalness,
    roughness: preset.roughness,
    map: preset.map ? textures[preset.map] : undefined,
    roughnessMap: surfaceMap,
    metalnessMap: surfaceMap,
    normalMap,
    emissive: preset.emissive ?? "#000000",
    emissiveIntensity: preset.emissiveIntensity ?? 1,
    opacity: preset.opacity ?? 1,
    transparent: (preset.opacity ?? 1) < 1,
    envMapIntensity: preset.envMapIntensity ?? 1,
    side,
    // `live` materials animate their own emissive; the Part leaves it alone.
    userData: live ? { live: true } : undefined,
  };
  const normalScale: [number, number] | undefined = preset.normalScale ? [preset.normalScale, preset.normalScale] : undefined;
  if (preset.physical) {
    return (
      <meshPhysicalMaterial
        {...shared}
        normalScale={normalScale}
        clearcoat={preset.clearcoat ?? 0}
        clearcoatRoughness={preset.clearcoatRoughness ?? 0}
        iridescence={preset.iridescence ?? 0}
        iridescenceIOR={1.5}
        iridescenceThicknessRange={preset.iridescenceThickness ? [preset.iridescenceThickness[0], preset.iridescenceThickness[1]] : [100, 400]}
      />
    );
  }
  return <meshStandardMaterial {...shared} normalScale={normalScale} />;
}

type GroupProps = Pick<ThreeElements["group"], "position" | "rotation" | "scale">;

/** Chamfered box. */
export function Box({ size, mat, radius = 0.016, ...props }: { size: Vec3; mat: MaterialKey; radius?: number } & GroupProps) {
  const r = Math.min(radius, Math.min(size[0], size[1], size[2]) * 0.45);
  return (
    <RoundedBox args={[size[0], size[1], size[2]]} radius={r} smoothness={2} castShadow receiveShadow {...props}>
      <Mat k={mat} />
    </RoundedBox>
  );
}

const AXIS_ROTATION = { x: [0, 0, -Math.PI / 2], y: [0, 0, 0], z: [Math.PI / 2, 0, 0] } as const;

/** Cylinder whose axis runs along x, y or z. `rTop` makes it a cone frustum. */
export function Cyl({
  r,
  h,
  axis = "y",
  mat,
  rTop,
  segments = 28,
  open = false,
  doubleSide = false,
  position,
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
}) {
  return (
    <mesh position={position as [number, number, number] | undefined} rotation={AXIS_ROTATION[axis] as unknown as [number, number, number]} castShadow receiveShadow>
      <cylinderGeometry args={[rTop ?? r, r, h, segments, 1, open]} />
      <Mat k={mat} side={doubleSide ? DoubleSide : undefined} />
    </mesh>
  );
}

export interface ChipSpec {
  /** Position on the board: [x, z] from its centre. */
  at: readonly [number, number];
  /** [width, height, depth]. */
  size: Vec3;
  mat?: MaterialKey;
}

/** A PC/104-style board lying in the XZ plane, populated with components on its +Y face. */
export function Board({ position, size = [0.9, 0.86], chips = [], children }: { position: Vec3; size?: readonly [number, number]; chips?: readonly ChipSpec[]; children?: React.ReactNode }) {
  const thickness = 0.024;
  return (
    <group position={position as [number, number, number]}>
      <Box size={[size[0], thickness, size[1]]} mat="pcb" radius={0.008} />
      {/* Stack connector along the +X edge. */}
      <Box size={[0.07, 0.07, size[1] * 0.62]} mat="connector" position={[size[0] / 2 - 0.06, thickness / 2 + 0.035, 0.04]} radius={0.008} />
      {chips.map((chip, i) => (
        <Box key={i} size={chip.size} mat={chip.mat ?? "chip"} position={[chip.at[0], thickness / 2 + chip.size[1] / 2, chip.at[1]]} radius={0.008} />
      ))}
      {children}
    </group>
  );
}

/** Insert a point either side of every corner so a spline through the result has tight, rounded bends. */
export function roundedPolyline(points: readonly Vec3[], cornerRadius = 0.06): Vector3[] {
  const out: Vector3[] = [];
  const v = points.map((p) => new Vector3(p[0], p[1], p[2]));
  v.forEach((point, i) => {
    if (i === 0 || i === v.length - 1) {
      out.push(point.clone());
      return;
    }
    const toPrev = v[i - 1].clone().sub(point);
    const toNext = v[i + 1].clone().sub(point);
    const rPrev = Math.min(cornerRadius, toPrev.length() * 0.45);
    const rNext = Math.min(cornerRadius, toNext.length() * 0.45);
    out.push(point.clone().add(toPrev.setLength(rPrev)), point.clone().add(toNext.setLength(rNext)));
  });
  return out;
}

export const curveThrough = (points: readonly Vec3[], cornerRadius?: number) =>
  new CatmullRomCurve3(roundedPolyline(points, cornerRadius), false, "centripetal");

/** A cable following a routed polyline. */
export function Cable({ points, radius = 0.012, mat }: { points: readonly Vec3[]; radius?: number; mat: MaterialKey }) {
  const curve = useMemo(() => curveThrough(points), [points]);
  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, Math.max(24, points.length * 14), radius, 6, false]} />
      <Mat k={mat} />
    </mesh>
  );
}
