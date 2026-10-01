// STUDIO: a dark engineering hangar floor for inspection, X-ray, exploded
// views and architecture. Nothing but the floor, the aircraft's shadow on it
// and a few datum marks — the aircraft is the subject.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, CanvasTexture, Float32BufferAttribute, type LineBasicMaterial, type MeshStandardMaterial } from "three";
import { frame } from "./frameState";

/** Datum lines on the floor: centreline, wing axis, a reference circle and metre ticks. */
function datumGeometry(): BufferGeometry {
  const points: number[] = [];
  const line = (x0: number, z0: number, x1: number, z1: number) => points.push(x0, 0.004, z0, x1, 0.004, z1);
  line(-13, 0, 11, 0);
  line(0, -11, 0, 11);
  for (let x = -12; x <= 10; x++) line(x, -0.12, x, 0.12);
  for (let z = -10; z <= 10; z++) line(-0.12, z, 0.12, z);
  const radius = 11.5;
  const segments = 96;
  for (let i = 0; i < segments; i++) {
    // Broken circle: every third segment is left out.
    if (i % 3 === 2) continue;
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    line(Math.cos(a0) * radius - 1, Math.sin(a0) * radius, Math.cos(a1) * radius - 1, Math.sin(a1) * radius);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return geometry;
}

/** The floor is lit only around the aircraft: its edge falls away into the dark. */
function falloffTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.22, "#e8e8e8");
  gradient.addColorStop(0.5, "#5a5a5a");
  gradient.addColorStop(0.8, "#101010");
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

const FLOOR_RADIUS = 46;

export default function StudioEnvironment() {
  const floor = useRef<MeshStandardMaterial>(null);
  const marks = useRef<LineBasicMaterial>(null);
  const datum = useMemo(() => datumGeometry(), []);
  const falloff = useMemo(() => falloffTexture(), []);
  useEffect(() => () => falloff.dispose(), [falloff]);

  useFrame(() => {
    const w = frame.environment.studio;
    if (floor.current) {
      floor.current.opacity = w;
      floor.current.visible = w > 0.01;
    }
    // The marks appear with the rest of the interface, once the aircraft is powered on.
    if (marks.current) marks.current.opacity = 0.16 * w * frame.power;
  });

  return (
    <group name="StudioEnvironment">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, 0, 0]} receiveShadow>
        <circleGeometry args={[FLOOR_RADIUS, 72]} />
        <meshStandardMaterial ref={floor} color="#15171b" roughness={0.72} metalness={0.1} alphaMap={falloff} transparent depthWrite={false} />
      </mesh>
      <lineSegments geometry={datum}>
        <lineBasicMaterial ref={marks} color="#9aa6ba" transparent opacity={0} depthWrite={false} />
      </lineSegments>
    </group>
  );
}
