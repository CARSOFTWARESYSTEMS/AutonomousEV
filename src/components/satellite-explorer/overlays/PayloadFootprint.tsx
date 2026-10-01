// The payload's field of view: a transparent cone from the aperture to the
// ground and the footprint it images. Deliberately soft — a volume of view,
// not a laser beam.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Group, type InstancedMesh, type MeshBasicMaterial, Object3D, Vector3 } from "three";
import { swathKm } from "../simulation/payload";
import { UNITS_PER_KM, frame } from "../scene/frameState";
import { MOUNT } from "../spacecraft/layout";

const FOOTPRINT_RADIUS = (swathKm() / 2) * UNITS_PER_KM;
const LIGHT_PULSES = 6;
const UP = new Vector3(0, 1, 0);
const aperture = new Vector3();
const axis = new Vector3();
const normal = new Vector3();
const dummy = new Object3D();

export default function PayloadFootprint() {
  const cone = useRef<Group>(null);
  const coneMaterial = useRef<MeshBasicMaterial>(null);
  const footprint = useRef<Group>(null);
  const ringMaterial = useRef<MeshBasicMaterial>(null);
  const fillMaterial = useRef<MeshBasicMaterial>(null);
  const light = useRef<InstancedMesh>(null);
  const shown = useRef(0);

  useFrame((_, delta) => {
    const { capture } = frame;
    const wanted = frame.footprintValid && frame.studio < 0.5 ? Math.max(capture.footprint, frame.flags.footprint ? 0.5 : 0) : 0;
    shown.current += (wanted - shown.current) * (1 - Math.exp(-5 * Math.min(delta, 0.1)));
    const v = shown.current;
    const visible = v > 0.01;
    if (cone.current) cone.current.visible = visible;
    if (footprint.current) footprint.current.visible = visible;
    if (light.current) light.current.visible = visible && capture.exposure > 0.01;
    if (!visible) return;

    aperture.set(MOUNT.aperture[0], MOUNT.aperture[1], MOUNT.aperture[2]).multiplyScalar(frame.satScale).applyQuaternion(frame.attitude).add(frame.satPos);
    axis.subVectors(aperture, frame.footprintPos);
    const length = axis.length();
    axis.divideScalar(length);

    if (cone.current) {
      cone.current.position.copy(frame.footprintPos).addScaledVector(axis, length / 2);
      cone.current.quaternion.setFromUnitVectors(UP, axis);
      cone.current.scale.set(FOOTPRINT_RADIUS, length, FOOTPRINT_RADIUS);
    }
    if (coneMaterial.current) coneMaterial.current.opacity = v * (0.05 + 0.05 * capture.exposure);

    if (footprint.current) {
      normal.copy(frame.footprintPos).normalize();
      footprint.current.position.copy(frame.footprintPos).addScaledVector(normal, 2.2);
      footprint.current.quaternion.setFromUnitVectors(UP, normal);
    }
    if (ringMaterial.current) ringMaterial.current.opacity = v * 0.85;
    if (fillMaterial.current) fillMaterial.current.opacity = v * (0.07 + 0.3 * capture.exposure);

    // Light travelling up the cone into the aperture while the detector is exposing.
    const mesh = light.current;
    if (mesh && mesh.visible) {
      for (let i = 0; i < LIGHT_PULSES; i++) {
        const u = (frame.now * 0.9 + i / LIGHT_PULSES) % 1;
        dummy.position.copy(frame.footprintPos).addScaledVector(axis, length * u);
        dummy.scale.setScalar(FOOTPRINT_RADIUS * 0.035 * (1 - u * 0.6) * capture.exposure);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group name="PayloadFootprint">
      {/* Unit cone: narrow at the aperture (+Y), footprint-wide at the ground (−Y). */}
      <group ref={cone} visible={false}>
        <mesh>
          <cylinderGeometry args={[0.04, 1, 1, 48, 1, true]} />
          <meshBasicMaterial ref={coneMaterial} color="#dff3ff" transparent opacity={0} side={DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <group ref={footprint} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[FOOTPRINT_RADIUS * 0.94, FOOTPRINT_RADIUS, 64]} />
          <meshBasicMaterial ref={ringMaterial} color="#e8f8ff" transparent opacity={0} side={DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[FOOTPRINT_RADIUS * 0.94, 64]} />
          <meshBasicMaterial ref={fillMaterial} color="#cfeeff" transparent opacity={0} side={DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <instancedMesh ref={light} args={[undefined, undefined, LIGHT_PULSES]} frustumCulled={false} visible={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color={[2.2, 2.4, 2.6]} transparent opacity={0.9} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
