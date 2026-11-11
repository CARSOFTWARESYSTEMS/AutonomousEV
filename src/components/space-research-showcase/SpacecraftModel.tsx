"use client";
// An educational 6U CubeSat-class spacecraft (1 unit = 1 cm): a 22.6 × 36.6
// × 10 cm body on four hard-anodised rails, two deployed solar-array wings of
// two panels each, gold multi-layer insulation on the Sun-facing side, a
// mirrored-tile radiator, and the modules a real 6U carries: battery and power
// board, onboard computer, reaction wheels, magnetorquers and a star tracker,
// S-band and UHF radios and antennas, and an Earth-observation camera. A
// generic design for teaching, not a specific mission's hardware.
import { createContext, useContext, useRef, type ReactNode, type RefObject } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { DoubleSide, type Group, type MeshStandardMaterial, type Texture } from "three";
import { useLabelAnchor } from "@/components/space-academy/viewer/labels";
import type { SubsystemId, Tone } from "./story";
import { useSpacecraftTextures } from "./textures";

type V3 = [number, number, number];

const ToneContext = createContext<Tone | null>(null);
const GLOW: Record<Tone, string> = { info: "#22d3ee", alert: "#f59e0b" };

interface MatProps {
  color?: string;
  metalness?: number;
  roughness?: number;
  map?: Texture;
  roughnessMap?: Texture;
  emissive?: string;
  emissiveIntensity?: number;
  doubleSided?: boolean;
}

function Mat({ color = "#ffffff", metalness = 0.5, roughness = 0.5, map, roughnessMap, emissive, emissiveIntensity = 0, doubleSided }: MatProps) {
  const tone = useContext(ToneContext);
  return (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      map={map ?? null}
      roughnessMap={roughnessMap ?? null}
      emissive={tone ? GLOW[tone] : (emissive ?? "#000000")}
      emissiveIntensity={tone ? (tone === "alert" ? 0.5 : 0.26) : emissiveIntensity}
      side={doubleSided ? DoubleSide : undefined}
    />
  );
}

function Box({ size, at = [0, 0, 0], rot, ...mat }: { size: V3; at?: V3; rot?: V3 } & MatProps) {
  return (
    <mesh position={at} rotation={rot}>
      <boxGeometry args={size} />
      <Mat {...mat} />
    </mesh>
  );
}

function Cyl({ r, top, h, at = [0, 0, 0], rot, open, segments = 28, ...mat }: { r: number; top?: number; h: number; at?: V3; rot?: V3; open?: boolean; segments?: number } & MatProps) {
  return (
    <mesh position={at} rotation={rot}>
      <cylinderGeometry args={[top ?? r, r, h, segments, 1, open]} />
      <Mat {...mat} />
    </mesh>
  );
}

// Finishes.
const RAIL = { color: "#8d95a3", metalness: 0.85, roughness: 0.3 };
const ANODISED = { color: "#1b1f27", metalness: 0.78, roughness: 0.4 };
const ANODISED_LIGHT = { color: "#2c313b", metalness: 0.8, roughness: 0.36 };
const PCB = { color: "#18432f", metalness: 0.15, roughness: 0.62 };
const CHIP = { color: "#0d0f13", metalness: 0.3, roughness: 0.45 };
const GOLD = { color: "#d8b15a", metalness: 1, roughness: 0.28 };
const SILVER = { color: "#c9ced6", metalness: 0.95, roughness: 0.24 };
const COPPER = { color: "#b9733d", metalness: 0.9, roughness: 0.34 };
const GLASS = { color: "#0b1530", metalness: 1, roughness: 0.06 };
const CERAMIC = { color: "#ece8de", metalness: 0, roughness: 0.62 };

/** Modules sit in two 10 cm bays: A (x = +5.65) for the avionics stack, B (x = −5.65) for the camera. */
const BAY_A = 5.65;
const BAY_B = -5.65;

function Board({ x, y }: { x: number; y: number }) {
  return <Box size={[9.2, 0.16, 9.2]} at={[x, y, 0]} {...PCB} />;
}

/** A clickable subsystem that can glow, with a label anchor. */
function Subsystem({ id, tone, anchor, onSelect, children }: { id: SubsystemId; tone?: Tone; anchor: V3; onSelect?: (id: SubsystemId) => void; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useLabelAnchor(id, ref, anchor);
  return (
    <group
      ref={ref}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        // A drag to turn the model is not a click.
        if (!onSelect || e.delta > 6) return;
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(e) => {
        if (!onSelect) return;
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <ToneContext.Provider value={tone ?? null}>{children}</ToneContext.Provider>
    </group>
  );
}

function Structure() {
  return (
    <>
      {/* Rails along the four long edges, and the end frames. */}
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Box key={`r${sx}${sz}`} size={[1, 36.6, 1]} at={[sx * 10.8, 0, sz * 4.5]} {...RAIL} />))}
      {[-1, 1].map((sy) => (
        <Box key={`e${sy}`} size={[22.6, 0.8, 10]} at={[0, sy * 17.9, 0]} {...ANODISED_LIGHT} />
      ))}
      {/* Side and back skins. */}
      <Box size={[0.3, 34.6, 9]} at={[-11.05, 0, 0]} {...ANODISED} />
      <Box size={[0.3, 34.6, 9]} at={[10.95, 0, 0]} {...ANODISED} />
      <Box size={[21, 34.6, 0.3]} at={[0, 0, -4.95]} {...ANODISED} />
      {/* Stack standoffs. */}
      {[-1, 1].flatMap((dx) => [-1, 1].map((dz) => <Cyl key={`a${dx}${dz}`} r={0.18} h={29} at={[BAY_A + dx * 4.1, 2.5, dz * 4.1]} segments={8} {...GOLD} />))}
      {/* Earth-observation camera in bay B: telescope tube, electronics, and the aperture on the Earth-facing end. */}
      <Cyl r={3.9} h={21} at={[BAY_B, -7.4, 0]} color="#30353f" metalness={0.75} roughness={0.38} />
      <Cyl r={4.3} h={1.2} at={[BAY_B, -18.9, 0]} {...ANODISED_LIGHT} />
      <Cyl r={3.3} h={0.2} at={[BAY_B, -19.55, 0]} {...GLASS} />
      <Box size={[9, 3.4, 8.6]} at={[BAY_B, 5.2, 0]} color="#2a2f38" metalness={0.7} roughness={0.4} />
      <Board x={BAY_B} y={9.6} />
      <Box size={[3, 0.4, 3]} at={[BAY_B, 9.88, 1]} {...CHIP} />
      <Board x={BAY_B} y={12.2} />
      {/* GPS antenna on the space-facing end. */}
      <Box size={[3.2, 0.3, 3.2]} at={[BAY_B, 18.45, 0]} {...CERAMIC} />
    </>
  );
}

function ArrayWing({ side, cells }: { side: 1 | -1; cells: { map: Texture; roughnessMap: Texture } }) {
  // Mirrored for the −x wing; three.js keeps the faces correct under a negative scale.
  return (
    <group scale={[side, 1, 1]}>
      {[-12, 12].map((y) => (
        <Box key={y} size={[1.6, 2.6, 1]} at={[11.9, y, 5.2]} {...RAIL} />
      ))}
      <Cyl r={0.32} h={30} at={[12.5, 0, 5.4]} {...RAIL} />
      {[22.9, 43.7].map((cx) => (
        <group key={cx} position={[cx, 0, 5.6]}>
          <Box size={[20, 34, 0.5]} color="#141821" metalness={0.5} roughness={0.5} />
          <mesh position={[0, 0, 0.26]}>
            <planeGeometry args={[19.3, 33.3]} />
            <Mat map={cells.map} roughnessMap={cells.roughnessMap} metalness={0.55} roughness={1} />
          </mesh>
        </group>
      ))}
      <Cyl r={0.32} h={30} at={[33.3, 0, 5.6]} {...RAIL} />
    </group>
  );
}

/** Gold insulation over the Sun-facing side; it turns see-through for the cutaway. */
function Foil({ map, bumpMap, materialRef }: { map: Texture; bumpMap: Texture; materialRef: RefObject<MeshStandardMaterial | null> }) {
  const tone = useContext(ToneContext);
  return (
    <mesh position={[0, 0, 5.12]}>
      <boxGeometry args={[21, 34.6, 0.4]} />
      <meshStandardMaterial
        ref={materialRef}
        map={map}
        bumpMap={bumpMap}
        bumpScale={0.5}
        color="#ffffff"
        metalness={1}
        roughness={0.36}
        transparent
        emissive={tone ? GLOW[tone] : "#000000"}
        emissiveIntensity={tone ? 0.2 : 0}
      />
    </mesh>
  );
}

function ReactionWheel({ at, rot }: { at: V3; rot?: V3 }) {
  return (
    <group position={at} rotation={rot}>
      <Cyl r={1.7} h={1.1} {...SILVER} />
      <Cyl r={0.5} h={1.3} {...GOLD} />
    </group>
  );
}

function UhfAntenna({ sx, sz }: { sx: number; sz: number }) {
  return (
    <group position={[sx * 10.4, -18.4, sz * 4.2]} rotation={[0, Math.atan2(sx, sz), 0]}>
      <group rotation={[0.26, 0, 0]}>
        <mesh position={[0, 0, 16]}>
          <boxGeometry args={[0.5, 0.06, 32]} />
          <Mat color="#d9d4c5" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

export interface SpacecraftModelProps {
  tones: Partial<Record<SubsystemId, Tone>>;
  onSelect?: (id: SubsystemId) => void;
  foilMaterialRef: RefObject<MeshStandardMaterial | null>;
}

export function SpacecraftModel({ tones, onSelect, foilMaterialRef }: SpacecraftModelProps) {
  const textures = useSpacecraftTextures();
  return (
    <group>
      <Structure />

      <Subsystem id="arrays" tone={tones.arrays} anchor={[43.7, 19.2, 6]} onSelect={onSelect}>
        <ArrayWing side={1} cells={textures.cells} />
        <ArrayWing side={-1} cells={textures.cells} />
      </Subsystem>

      <Subsystem id="thermal" tone={tones.thermal} anchor={[-5, 19.2, 5.6]} onSelect={onSelect}>
        <Foil map={textures.foil.map} bumpMap={textures.foil.bumpMap} materialRef={foilMaterialRef} />
        {/* Radiator on the +x side: mirrored tiles shed heat to space. */}
        <mesh position={[11.13, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[8.4, 34]} />
          <Mat map={textures.radiator.map} roughnessMap={textures.radiator.roughnessMap} metalness={0.95} roughness={1} />
        </mesh>
      </Subsystem>

      <Subsystem id="power" tone={tones.power} anchor={[BAY_A, 7.4, 5.6]} onSelect={onSelect}>
        {/* Power board (EPS) with its inductors and regulators. */}
        <Board x={BAY_A} y={8.4} />
        <Cyl r={0.7} h={0.8} at={[BAY_A - 2.2, 8.9, 2]} color="#3b4150" metalness={0.6} roughness={0.4} />
        <Cyl r={0.7} h={0.8} at={[BAY_A + 2.2, 8.9, 2]} color="#3b4150" metalness={0.6} roughness={0.4} />
        <Box size={[1.6, 0.3, 1.6]} at={[BAY_A, 8.63, -1.8]} {...CHIP} />
        {/* Battery pack: four lithium-ion cells in a bracket. */}
        {[2, 6.9].map((y) => (
          <Box key={y} size={[9.2, 0.3, 9.2]} at={[BAY_A, y, 0]} color="#3a3f49" metalness={0.8} roughness={0.38} />
        ))}
        {[3.45, 5.45].flatMap((y) => [-2.2, 2.2].map((z) => <Cyl key={`${y}${z}`} r={0.92} h={7.4} at={[BAY_A, y, z]} rot={[0, 0, Math.PI / 2]} color="#2e3a4f" metalness={0.55} roughness={0.36} />))}
      </Subsystem>

      <Subsystem id="computer" tone={tones.computer} anchor={[BAY_A, 11.2, 5.6]} onSelect={onSelect}>
        <Board x={BAY_A} y={10.4} />
        <Box size={[2.6, 0.35, 2.6]} at={[BAY_A, 10.66, 1]} {...CHIP} />
        <Box size={[1.2, 0.25, 2]} at={[BAY_A + 3, 10.6, 1]} {...CHIP} />
        <Box size={[1.2, 0.25, 2]} at={[BAY_A - 3, 10.6, 1]} {...CHIP} />
        <Box size={[6, 0.4, 0.6]} at={[BAY_A, 10.68, -3.8]} {...GOLD} />
      </Subsystem>

      <Subsystem id="attitude" tone={tones.attitude} anchor={[BAY_A, 23.4, -1.2]} onSelect={onSelect}>
        {/* Reaction wheels on three axes. */}
        <Box size={[9.2, 0.3, 9.2]} at={[BAY_A, 12.5, 0]} {...ANODISED_LIGHT} />
        <ReactionWheel at={[BAY_A - 2.3, 14.4, -2]} rot={[0, 0, Math.PI / 2]} />
        <ReactionWheel at={[BAY_A, 16, 2.2]} />
        <ReactionWheel at={[BAY_A + 2.4, 14.2, 2]} rot={[Math.PI / 2, 0, 0]} />
        {/* Magnetorquer rods. */}
        <Cyl r={0.45} h={8} at={[BAY_A, -9.2, -2.5]} rot={[0, 0, Math.PI / 2]} {...COPPER} />
        <Cyl r={0.45} h={8} at={[BAY_A, -10.6, 1]} rot={[Math.PI / 2, 0, 0]} {...COPPER} />
        {/* Star tracker with its sunshade, and coarse sun sensors. */}
        <Box size={[3.4, 2.4, 3.4]} at={[BAY_A, 19.5, -1.2]} {...ANODISED_LIGHT} />
        <Cyl r={1.5} top={2.3} h={3.6} at={[BAY_A, 22.4, -1.2]} rot={[-0.22, 0, 0]} open color="#0b0c10" metalness={0.4} roughness={0.7} doubleSided />
        <Cyl r={1.25} h={0.12} at={[BAY_A, 20.75, -1.2]} {...GLASS} />
        {[-8.4, 8.4].map((x) => (
          <Box key={x} size={[1.4, 0.35, 1.4]} at={[x, 18.45, 3]} {...GLASS} />
        ))}
      </Subsystem>

      <Subsystem id="comms" tone={tones.comms} anchor={[5.6, -22, 0]} onSelect={onSelect}>
        {/* S-band and UHF radios, each under a shield can. */}
        <Board x={BAY_A} y={-0.4} />
        <Box size={[6.4, 0.9, 5.4]} at={[BAY_A, 0.15, 0.6]} {...SILVER} />
        <Board x={BAY_A} y={-3.2} />
        <Box size={[5.4, 0.8, 4.4]} at={[BAY_A, -2.7, 0.8]} {...SILVER} />
        {/* S-band patch antennas on the Earth-facing end, and four UHF tape antennas. */}
        {[3.3, 8.2].map((x) => (
          <group key={x}>
            <Box size={[4, 0.3, 4]} at={[x, -18.45, 0]} {...CERAMIC} />
            <Box size={[2.6, 0.06, 2.6]} at={[x, -18.63, 0]} {...GOLD} />
          </group>
        ))}
        {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <UhfAntenna key={`${sx}${sz}`} sx={sx} sz={sz} />))}
      </Subsystem>
    </group>
  );
}
