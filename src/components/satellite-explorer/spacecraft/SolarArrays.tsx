// Two deployable wings, each of two hinged 1U × 3U panels. The ANIMATE action
// stows and redeploys a wing about its hinges.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { ComponentId } from "../types";
import { easeInOutCubic } from "../lib/math";
import { useExplorerStore } from "../state/explorerStore";
import { frame } from "../scene/frameState";
import { ARRAY, HALF } from "./layout";
import { Box, Cyl, Mat } from "./primitives";
import { Part } from "./Part";

const { panelWidth, panelLength, thickness, hingeGap } = ARRAY;
const HINGE_Y = [-1.25, 0, 1.25];

/** Fold → hold → unfold, in seconds. */
const FOLD_S = 1.7;
const HOLD_S = 0.6;
export const DEPLOY_ANIMATION_S = FOLD_S * 2 + HOLD_S;

/** Stowed fraction (0 = deployed, 1 = stowed) at `t` seconds into the animation. */
function stowedAt(t: number): number {
  if (t <= 0 || t >= DEPLOY_ANIMATION_S) return 0;
  if (t < FOLD_S) return easeInOutCubic(t / FOLD_S);
  if (t < FOLD_S + HOLD_S) return 1;
  return 1 - easeInOutCubic((t - FOLD_S - HOLD_S) / FOLD_S);
}

/** Width of the machined edge frame around each panel. */
const EDGE = 0.022;

function Panel({ name, x }: { name: string; x: number }) {
  return (
    <group name={name} position={[x, 0, 0]}>
      {/* Carbon-fibre substrate with the cell string bonded to its Sun face. */}
      <Box size={[panelWidth, panelLength, thickness]} mat="panelBack" radius={0.008} />
      <mesh position={[0, 0, thickness / 2 + 0.002]} receiveShadow>
        <planeGeometry args={[panelWidth - 0.05, panelLength - 0.05]} />
        <Mat k="cell" />
      </mesh>
      {/* Edge frame, standing just proud of the cover glass. */}
      {[-1, 1].map((s) => (
        <Box key={`x${s}`} size={[EDGE, panelLength, thickness + 0.012]} position={[s * (panelWidth / 2 - EDGE / 2), 0, 0]} mat="frame" radius={0.004} />
      ))}
      {[-1, 1].map((s) => (
        <Box key={`y${s}`} size={[panelWidth - EDGE * 2, EDGE, thickness + 0.012]} position={[0, s * (panelLength / 2 - EDGE / 2), 0]} mat="frame" radius={0.004} />
      ))}
      {/* Back face: stiffeners and the harness run to the hinge line. */}
      {[-1.15, 0, 1.15].map((y) => (
        <Box key={y} size={[panelWidth - 0.08, 0.045, 0.012]} position={[0, y, -thickness / 2 - 0.006]} mat="rail" radius={0.003} />
      ))}
      <Box size={[0.06, panelLength - 0.3, 0.005]} position={[panelWidth * 0.3, 0, -thickness / 2 - 0.0025]} mat="kapton" radius={0.001} />
    </group>
  );
}

function Hinges({ name }: { name: string }) {
  return (
    <group name={name}>
      {HINGE_Y.map((y) => (
        <group key={y} position={[0, y, 0]}>
          <Cyl r={0.028} h={0.2} mat="machined" segments={12} />
          <Box size={[hingeGap + 0.12, 0.06, 0.014]} position={[0, 0, -thickness / 2]} mat="shield" radius={0.004} />
        </group>
      ))}
    </group>
  );
}

function Wing({ id, side }: { id: ComponentId; side: 1 | -1 }) {
  const root = useRef<Group>(null);
  const mid = useRef<Group>(null);
  const label = side === 1 ? "Right" : "Left";

  useFrame(() => {
    const animation = useExplorerStore.getState().componentAnimation;
    const stowed = animation && animation.id === id ? stowedAt(frame.now - animation.startedAt) : 0;
    // Panel A folds back along the side of the bus; panel B folds flat onto it.
    if (root.current) root.current.rotation.y = side * stowed * (Math.PI / 2);
    if (mid.current) mid.current.rotation.y = -side * stowed * Math.PI * 0.985;
  });

  return (
    <Part id={id}>
      <group name={`SolarArray${label}`} ref={root} position={[side * (HALF.x + 0.012), 0, HALF.z - thickness / 2]}>
        <Hinges name={`Hinge${label}`} />
        <Panel name={`SolarPanel${label}A`} x={side * (hingeGap + panelWidth / 2)} />
        <group ref={mid} position={[side * (hingeGap * 1.5 + panelWidth), 0, 0]}>
          <Hinges name={`Hinge${label}Mid`} />
          <Panel name={`SolarPanel${label}B`} x={side * (hingeGap / 2 + panelWidth / 2)} />
        </group>
      </group>
    </Part>
  );
}

export default function SolarArrays() {
  return (
    <group name="SolarArrays">
      <Wing id="solar-array-left" side={-1} />
      <Wing id="solar-array-right" side={1} />
    </group>
  );
}
