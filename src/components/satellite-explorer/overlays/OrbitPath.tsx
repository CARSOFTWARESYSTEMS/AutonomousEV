// Orbit geometry: the inertial orbit ring (sunlit and eclipsed arcs drawn
// differently), the ground track in the Earth-fixed frame, the sub-satellite
// point, the Sun direction and Earth's shadow.
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei/core/Line";
import { type Camera, DoubleSide, type Group, type Mesh, Quaternion, Vector3 } from "three";
import { ACCENT } from "../data/satelliteReference";
import { EARTH_RADIUS_KM, ORBIT_PERIOD_S, ORBIT_REFERENCE, groundTrack, orbitRing } from "../simulation/orbit";
import { useExplorerStore } from "../state/explorerStore";
import { viewFlags } from "../state/selectors";
import { EARTH_RADIUS_UNITS } from "../scene/cameraPresets";
import { UNITS_PER_KM, frame } from "../scene/frameState";
import SceneLabel from "./SceneLabel";
import ui from "../explorer.module.css";

const ORBIT_RADIUS = (EARTH_RADIUS_KM + ORBIT_REFERENCE.altitudeKm) * UNITS_PER_KM;
const SUNLIT: [number, number, number] = [0.95, 0.9, 0.72];
const ECLIPSED: [number, number, number] = [0.3, 0.38, 0.55];
const UP = new Vector3(0, 1, 0);
const orientation = new Quaternion();

/** Inertial orbit ring. Dim arc = Earth's shadow. */
export function OrbitRing() {
  const show = useExplorerStore((s) => viewFlags(s).orbitPath);
  const { points, colors } = useMemo(() => {
    const ring = orbitRing(240);
    return {
      points: ring.points.map((p) => [p[0] * ORBIT_RADIUS, p[1] * ORBIT_RADIUS, p[2] * ORBIT_RADIUS] as [number, number, number]),
      colors: ring.sunlit.map((lit) => (lit ? SUNLIT : ECLIPSED)),
    };
  }, []);
  if (!show) return null;
  return <Line points={points} vertexColors={colors} lineWidth={1.3} transparent opacity={0.7} depthWrite={false} toneMapped={false} />;
}

/** Ground track over one revolution either side of now. Place inside the rotating Earth group. */
export function GroundTrack() {
  const show = useExplorerStore((s) => viewFlags(s).groundTrack);
  const [center, setCenter] = useState(0);
  useFrame(() => {
    // Rebuild only when the spacecraft has moved well away from the drawn window.
    if (Math.abs(frame.orbitTimeS - center) > ORBIT_PERIOD_S * 0.45) setCenter(Math.round(frame.orbitTimeS / 600) * 600);
  });
  const points = useMemo(() => {
    const radius = EARTH_RADIUS_UNITS + 3;
    return groundTrack(center - ORBIT_PERIOD_S, center + ORBIT_PERIOD_S, 360).map((p) => [p[0] * radius, p[1] * radius, p[2] * radius] as [number, number, number]);
  }, [center]);
  if (!show) return null;
  return <Line points={points} color="#ffffff" lineWidth={1.1} dashed dashSize={14} gapSize={10} transparent opacity={0.42} depthWrite={false} toneMapped={false} />;
}

/** Marker on the surface directly beneath the spacecraft. */
export function SubSatellitePoint() {
  const ring = useRef<Mesh>(null);
  useFrame((state) => {
    const mesh = ring.current;
    if (!mesh) return;
    const visible = frame.flags.groundTrack && frame.studio < 0.5;
    mesh.visible = visible;
    if (!visible) return;
    mesh.position.copy(frame.zenith).multiplyScalar(EARTH_RADIUS_UNITS + 2.5);
    mesh.quaternion.setFromUnitVectors(UP, frame.zenith);
    mesh.scale.setScalar(Math.min(12, Math.max(1, state.camera.position.distanceTo(mesh.position) / 380)));
  });
  return (
    <mesh ref={ring} visible={false}>
      <cylinderGeometry args={[5.2, 5.2, 0.05, 40, 1, true]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.9} side={DoubleSide} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

const labelWorld = new Vector3();
const toLabel = new Vector3();

/** True when the solid Earth lies between the camera and a point. */
function behindEarth(camera: Vector3, point: Vector3): boolean {
  toLabel.subVectors(point, camera);
  const length = toLabel.length();
  toLabel.divideScalar(length);
  const along = -camera.dot(toLabel);
  if (along <= 0 || along >= length) return false;
  return camera.lengthSq() - along * along < EARTH_RADIUS_UNITS * EARTH_RADIUS_UNITS;
}

const clearOfEarth = (world: Vector3, camera: Camera) => !behindEarth(camera.position, world);

/** A label that disappears while Earth hides its anchor. */
function SpaceLabel({ position, children }: { position: [number, number, number]; children: React.ReactNode }) {
  return (
    <SceneLabel position={position} center className={ui.vectorLabel} visible={clearOfEarth}>
      {children}
    </SceneLabel>
  );
}

/** Sun direction and Earth's shadow, shown in Orbit Mode. */
export function SunGeometry() {
  const show = useExplorerStore((s) => s.mode === "orbit");
  const group = useRef<Group>(null);
  const shadowLabel = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    // The group's +Y axis points at the Sun.
    group.current.quaternion.copy(orientation.setFromUnitVectors(UP, frame.sunDir));
    // Keep the shadow's label on the side of the cylinder that faces the camera.
    if (shadowLabel.current) {
      const along = state.camera.position.dot(frame.sunDir);
      toLabel.copy(state.camera.position).addScaledVector(frame.sunDir, -along).normalize();
      labelWorld.copy(frame.sunDir).multiplyScalar(-EARTH_RADIUS_UNITS * 1.75).addScaledVector(toLabel, EARTH_RADIUS_UNITS * 1.08);
      // Expressed in the group's frame, whose +Y is the Sun direction.
      shadowLabel.current.position.copy(labelWorld.applyQuaternion(orientation.invert()));
    }
  });
  if (!show) return null;
  const R = EARTH_RADIUS_UNITS;
  return (
    <group ref={group} name="SunGeometry">
      <Line
        points={[
          [0, R * 1.35, 0],
          [0, R * 2.3, 0],
        ]}
        color={ACCENT.power}
        lineWidth={1.4}
        transparent
        opacity={0.75}
        depthWrite={false}
        toneMapped={false}
      />
      <mesh position={[0, R * 1.35, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[R * 0.03, R * 0.1, 16]} />
        <meshBasicMaterial color={ACCENT.power} toneMapped={false} />
      </mesh>
      <SpaceLabel position={[0, R * 2.36, 0]}>SUNLIGHT</SpaceLabel>
      {/* Earth's shadow: a cylinder on the night side. */}
      <mesh position={[0, -R * 1.6, 0]}>
        <cylinderGeometry args={[R, R, R * 3.2, 64, 1, true]} />
        <meshBasicMaterial color="#5a7bc0" transparent opacity={0.022} side={DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={shadowLabel}>
        <SpaceLabel position={[0, 0, 0]}>EARTH&apos;S SHADOW</SpaceLabel>
      </group>
    </group>
  );
}
