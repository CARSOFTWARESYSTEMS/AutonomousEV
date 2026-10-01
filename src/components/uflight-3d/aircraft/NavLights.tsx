// Position and navigation lights: red on the port wing tip, green on the
// starboard, white at the tail, and a slow beacon. They come on when the
// aircraft is powered — small, and never a glow on the airframe.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type MeshBasicMaterial } from "three";
import type { Vec3 } from "../types";
import { frame } from "../scene/frameState";
import { FUSELAGE, TAIL, WING, wingPoint } from "./layout";

interface Light {
  position: Vec3;
  color: string;
  /** Beacon lights pulse slowly; position lights are steady. */
  beacon?: boolean;
}

const tip = (sign: number): Vec3 => {
  const p = wingPoint(sign * WING.semiSpan, 0.2);
  return [p[0], p[1], p[2] + sign * 0.02];
};

const LIGHTS: readonly Light[] = [
  { position: tip(-1), color: "#ff3a2f" },
  { position: tip(1), color: "#2bff86" },
  { position: [TAIL.horizontal.leX - TAIL.horizontal.chord - 0.01, TAIL.horizontal.y, 0], color: "#ffffff" },
  { position: [-0.2, FUSELAGE.bellyY - 0.03, 0], color: "#ff3a2f", beacon: true },
];

const OFF = new Color("#16181c");
const on = new Color();

export default function NavLights() {
  const materials = useRef<(MeshBasicMaterial | null)[]>([]);
  useFrame(() => {
    LIGHTS.forEach((light, i) => {
      const material = materials.current[i];
      if (!material) return;
      const pulse = light.beacon ? Math.pow(Math.max(0, Math.sin(frame.now * 3.1)), 12) : 1;
      // Above 1 so the restrained bloom picks the lights out against the dark.
      material.color.copy(OFF).lerp(on.set(light.color).multiplyScalar(2.6), frame.power * pulse);
    });
  });
  return (
    <group name="NavLights">
      {LIGHTS.map((light, i) => (
        <mesh key={i} position={light.position as unknown as [number, number, number]}>
          <sphereGeometry args={[0.035, 12, 8]} />
          <meshBasicMaterial
            ref={(m) => {
              materials.current[i] = m;
            }}
            color="#16181c"
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
