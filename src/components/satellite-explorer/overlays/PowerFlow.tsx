// Sunlight arriving at the solar arrays: a few faint rays with pulses moving
// toward the cells. The first link in Sun → Array → PCDU → Battery / Loads.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Color, Float32BufferAttribute, type InstancedMesh, type LineBasicMaterial, Object3D, Quaternion, Vector3 } from "three";
import { ACCENT } from "../data/satelliteReference";
import { STUDIO_KEY_DIRECTION, frame } from "../scene/frameState";
import { ARRAY, HALF } from "../spacecraft/layout";

/** Where rays land on the cells, body coordinates. */
const X_A = HALF.x + ARRAY.hingeGap + ARRAY.panelWidth / 2;
const X_B = X_A + ARRAY.panelWidth + ARRAY.hingeGap;
const LANDING: readonly [number, number, number][] = [
  [-X_B, 0.95, HALF.z],
  [-X_A, -0.95, HALF.z],
  [-X_B, -0.2, HALF.z],
  [X_B, 0.95, HALF.z],
  [X_A, -0.95, HALF.z],
  [X_B, -0.2, HALF.z],
];
const RAY_LENGTH = 5.5;
const PULSES_PER_RAY = 3;

const sunBody = new Vector3();
const inverse = new Quaternion();
const dummy = new Object3D();
const pulseColor = new Color(ACCENT.power).multiplyScalar(2.2);

export default function PowerFlow() {
  const material = useRef<LineBasicMaterial>(null);
  const pulses = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(new Float32Array(LANDING.length * 6), 3));
    return g;
  }, []);

  useFrame(() => {
    const strength = frame.sunRays;
    const visible = strength > 0.02;
    if (material.current) material.current.opacity = 0.3 * strength;
    const mesh = pulses.current;
    if (!mesh) return;
    mesh.visible = visible;
    if (!visible) return;

    sunBody.copy(frame.sunDir).applyQuaternion(inverse.copy(frame.attitude).invert()).lerp(STUDIO_KEY_DIRECTION, frame.studio).normalize();
    // Rays only make sense when the Sun is in front of the cells.
    if (sunBody.z < 0.05) sunBody.set(sunBody.x, sunBody.y, 0.05).normalize();

    const position = geometry.getAttribute("position") as Float32BufferAttribute;
    let k = 0;
    LANDING.forEach((landing, i) => {
      position.setXYZ(i * 2, landing[0] + sunBody.x * RAY_LENGTH, landing[1] + sunBody.y * RAY_LENGTH, landing[2] + sunBody.z * RAY_LENGTH);
      position.setXYZ(i * 2 + 1, landing[0], landing[1], landing[2]);
      for (let j = 0; j < PULSES_PER_RAY; j++) {
        const u = (frame.now * 0.42 + j / PULSES_PER_RAY + i * 0.17) % 1;
        const d = RAY_LENGTH * (1 - u);
        dummy.position.set(landing[0] + sunBody.x * d, landing[1] + sunBody.y * d, landing[2] + sunBody.z * d);
        dummy.scale.setScalar(0.04 * strength * Math.pow(Math.sin(Math.PI * u), 0.5));
        dummy.updateMatrix();
        mesh.setMatrixAt(k++, dummy.matrix);
      }
    });
    position.needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="PowerFlow">
      <lineSegments geometry={geometry} frustumCulled={false}>
        <lineBasicMaterial ref={material} color={ACCENT.power} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </lineSegments>
      <instancedMesh ref={pulses} args={[undefined, undefined, LANDING.length * PULSES_PER_RAY]} frustumCulled={false} visible={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color={pulseColor} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
