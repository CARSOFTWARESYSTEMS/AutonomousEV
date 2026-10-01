// Attitude vectors. Body axes turn with the spacecraft; the reference vectors
// (Sun, nadir, velocity) stay fixed in space, so a slew is visible as the body
// triad moving against them. The optional magnetorquer demonstration shows a
// commanded dipole, Earth's field and the torque they produce (τ = m × B).
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group, Quaternion, Vector3 } from "three";
import { ACCENT } from "../data/satelliteReference";
import { useExplorerStore } from "../state/explorerStore";
import { viewFlags } from "../state/selectors";
import { frame } from "../scene/frameState";
import SceneLabel from "./SceneLabel";
import ui from "../explorer.module.css";

const UP = new Vector3(0, 1, 0);
const direction = new Vector3();
const field = new Vector3();
const dipole = new Vector3();
const torque = new Vector3();
const orientation = new Quaternion();
/** Earth's dipole axis, taken along the rotation axis for this illustration. */
const DIPOLE_AXIS = new Vector3(0, -1, 0);

function Arrow({ length, color, label, dashed = false }: { length: number; color: string; label: string; dashed?: boolean }) {
  const head = 0.34;
  return (
    <group>
      <mesh position={[0, (length - head) / 2, 0]} renderOrder={20}>
        <cylinderGeometry args={[dashed ? 0.014 : 0.022, dashed ? 0.014 : 0.022, length - head, 8]} />
        <meshBasicMaterial color={color} transparent opacity={dashed ? 0.7 : 0.95} depthTest={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, length - head / 2, 0]} renderOrder={20}>
        <coneGeometry args={[0.085, head, 14]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} depthTest={false} toneMapped={false} />
      </mesh>
      <SceneLabel position={[0, length + 0.3, 0]} center className={ui.vectorLabel}>
        {label}
      </SceneLabel>
    </group>
  );
}

/** Body axes: render as a child of the spacecraft so they rotate with it. */
export function BodyAxes() {
  const show = useExplorerStore((s) => viewFlags(s).bodyAxes);
  if (!show) return null;
  return (
    <group name="BodyAxes">
      <group rotation={[0, 0, -Math.PI / 2]}>
        <Arrow length={4.3} color={ACCENT.adcs} label="BODY X" />
      </group>
      <Arrow length={3.2} color={ACCENT.adcs} label="BODY Y" />
      <group rotation={[Math.PI / 2, 0, 0]}>
        <Arrow length={2.6} color={ACCENT.adcs} label="BODY Z" />
      </group>
    </group>
  );
}

/** Reference vectors anchored at the spacecraft but fixed in space. */
export function ReferenceVectors() {
  const show = useExplorerStore((s) => viewFlags(s).bodyAxes);
  const magnetorquer = useExplorerStore((s) => s.showMagnetorquer && s.mode === "systems" && s.subsystem === "adcs");
  const root = useRef<Group>(null);
  const sun = useRef<Group>(null);
  const nadir = useRef<Group>(null);
  const velocity = useRef<Group>(null);
  const fieldArrow = useRef<Group>(null);
  const dipoleArrow = useRef<Group>(null);
  const torqueArrow = useRef<Group>(null);

  useFrame(() => {
    if (!root.current) return;
    root.current.position.copy(frame.satPos);
    root.current.scale.setScalar(frame.satScale);
    sun.current?.quaternion.setFromUnitVectors(UP, frame.sunDir);
    nadir.current?.quaternion.setFromUnitVectors(UP, direction.copy(frame.zenith).negate());
    velocity.current?.quaternion.setFromUnitVectors(UP, frame.velocityDir);

    if (fieldArrow.current && dipoleArrow.current && torqueArrow.current) {
      // Dipole field direction at the spacecraft: B ∝ 3(m·r̂)r̂ − m.
      field.copy(frame.zenith).multiplyScalar(3 * DIPOLE_AXIS.dot(frame.zenith)).sub(DIPOLE_AXIS).normalize();
      // Commanded dipole along the body X torque rod.
      dipole.set(1, 0, 0).applyQuaternion(frame.attitude);
      torque.crossVectors(dipole, field);
      const magnitude = torque.length();
      fieldArrow.current.quaternion.copy(orientation.setFromUnitVectors(UP, field));
      dipoleArrow.current.quaternion.copy(orientation.setFromUnitVectors(UP, dipole));
      torqueArrow.current.visible = magnitude > 0.05;
      if (magnitude > 0.05) torqueArrow.current.quaternion.copy(orientation.setFromUnitVectors(UP, torque.divideScalar(magnitude)));
    }
  });

  if (!show) return null;
  return (
    <group ref={root} name="ReferenceVectors">
      <group ref={sun}>
        <Arrow length={5.2} color={ACCENT.power} label="SUN" dashed />
      </group>
      <group ref={nadir}>
        <Arrow length={4.6} color="#dfe6f2" label="NADIR" dashed />
      </group>
      <group ref={velocity}>
        <Arrow length={4.6} color="#8f98a8" label="VELOCITY" dashed />
      </group>
      {magnetorquer && (
        <>
          <group ref={fieldArrow}>
            <Arrow length={3.6} color={ACCENT.rf} label="B · EARTH FIELD" />
          </group>
          <group ref={dipoleArrow}>
            <Arrow length={2.9} color={ACCENT.power} label="m · DIPOLE" />
          </group>
          <group ref={torqueArrow}>
            <Arrow length={3.2} color="#ffffff" label="τ = m × B" />
          </group>
        </>
      )}
    </group>
  );
}
