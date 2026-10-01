// Illustrative ground segment, placed in the Earth-fixed frame: a tracking
// dish with its visibility cone, the observation target and their labels.
// Sizes are exaggerated (a real dish would be far below one pixel).
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, type Camera, DoubleSide, Float32BufferAttribute, type Group, type Material, Matrix4, type Mesh, Quaternion, Vector3 } from "three";
import { DEG } from "../lib/math";
import { ACCENT } from "../data/satelliteReference";
import { LINK_STATE_LABEL } from "../simulation/communications";
import { EARTH_RADIUS_KM, GROUND_STATION, OBSERVATION_TARGET, ORBIT_REFERENCE, geoToUnit } from "../simulation/orbit";
import SceneLabel from "../overlays/SceneLabel";
import { useExplorerStore } from "../state/explorerStore";
import { EARTH_RADIUS_UNITS } from "./cameraPresets";
import { UNITS_PER_KM, frame } from "./frameState";
import ui from "../explorer.module.css";

const UP = new Vector3(0, 1, 0);
const world = new Vector3();
const toCamera = new Vector3();
const localSat = new Vector3();
const inverse = new Matrix4();

function surfacePlacement(point: { latDeg: number; lonDeg: number }) {
  const unit = geoToUnit(point);
  const normal = new Vector3(unit[0], unit[1], unit[2]);
  return { position: normal.clone().multiplyScalar(EARTH_RADIUS_UNITS), quaternion: new Quaternion().setFromUnitVectors(UP, normal) };
}

// Visibility circle: where the orbit shell meets the station's elevation mask.
const ORBIT_RADIUS = (EARTH_RADIUS_KM + ORBIT_REFERENCE.altitudeKm) * UNITS_PER_KM;
const MASK = ORBIT_REFERENCE.elevationMaskDeg * DEG;
const CENTRAL_ANGLE = Math.acos((EARTH_RADIUS_UNITS / ORBIT_RADIUS) * Math.cos(MASK)) - MASK;
const CIRCLE_RADIUS = ORBIT_RADIUS * Math.sin(CENTRAL_ANGLE);
const CIRCLE_HEIGHT = ORBIT_RADIUS * Math.cos(CENTRAL_ANGLE) - EARTH_RADIUS_UNITS;

/** Fade a group's materials together. */
function setOpacity(root: Group | null, factor: number) {
  if (!root) return;
  root.visible = factor > 0.01;
  root.traverse((o) => {
    const material = (o as Mesh).material as (Material & { userData: { base?: number } }) | undefined;
    if (!material || Array.isArray(material)) return;
    material.userData.base ??= material.opacity;
    material.opacity = material.userData.base * factor;
  });
}

/** A site's label shows only while the site is on the camera's side of the horizon. */
const aboveHorizon = (site: Vector3, camera: Camera) => toCamera.copy(camera.position).sub(site).normalize().dot(world.copy(site).normalize()) > 0.06;

/** Label above a surface site. It follows the visibility of the marker it belongs to. */
function SurfaceLabel({ children, lift = 14 }: { children: React.ReactNode; lift?: number }) {
  return (
    <SceneLabel position={[0, lift, 0]} center className={ui.surfaceLabel} visible={aboveHorizon}>
      {children}
    </SceneLabel>
  );
}

/** Link state under the station's name. Rendered in the label layer. */
function StationLink() {
  const link = useExplorerStore((s) => s.telemetry.link);
  return (
    <span className={ui.surfaceLabelState} data-link={link}>
      {LINK_STATE_LABEL[link]}
    </span>
  );
}

function StationLabel() {
  return (
    <SurfaceLabel lift={14}>
      <span className={ui.surfaceLabelName}>{GROUND_STATION.label}</span>
      <StationLink />
    </SurfaceLabel>
  );
}

export default function GroundStation() {
  const station = useMemo(() => surfacePlacement(GROUND_STATION), []);
  const target = useMemo(() => surfacePlacement(OBSERVATION_TARGET), []);
  const root = useRef<Group>(null);
  const model = useRef<Group>(null);
  const dish = useRef<Group>(null);
  const cone = useRef<Group>(null);
  const targetGroup = useRef<Group>(null);
  const targetRing = useRef<Group>(null);
  const fade = useRef(0);

  const circle = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      points.push(Math.cos(a) * CIRCLE_RADIUS, CIRCLE_HEIGHT, Math.sin(a) * CIRCLE_RADIUS);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(points, 3));
    return g;
  }, []);

  useFrame((state, delta) => {
    const show = frame.flags.groundSegment && frame.studio < 0.5;
    fade.current += ((show ? 1 : 0) - fade.current) * (1 - Math.exp(-4 * Math.min(delta, 0.1)));
    const f = fade.current;
    if (root.current) root.current.visible = f > 0.01;
    if (targetGroup.current) targetGroup.current.visible = (frame.flags.groundTrack || frame.flags.footprint || frame.flags.groundSegment) && frame.studio < 0.5;
    if (!root.current || f <= 0.01) return;

    // Keep the dish legible from orbit: grow it with camera distance, within limits.
    root.current.getWorldPosition(world);
    const distance = state.camera.position.distanceTo(world);
    const scale = Math.min(12, Math.max(1, distance / 190));
    model.current?.scale.setScalar(scale);
    targetRing.current?.scale.setScalar(Math.min(10, Math.max(1, distance / 420)));

    // Point the dish at the spacecraft while it is above the horizon.
    if (dish.current && model.current) {
      inverse.copy(model.current.matrixWorld).invert();
      localSat.copy(frame.satPos).applyMatrix4(inverse);
      if (localSat.y > 0) dish.current.lookAt(frame.satPos);
    }
    setOpacity(cone.current, f * (frame.link.visible ? 1 : 0.55));
  });

  return (
    <>
      <group ref={root} position={station.position} quaternion={station.quaternion} name="GroundStation">
        <group ref={model}>
          <group scale={0.55}>
          {/* Site pad and building. */}
          <mesh position={[0, 0.15, 0]} receiveShadow>
            <cylinderGeometry args={[11, 11, 0.3, 40]} />
            <meshStandardMaterial color="#3a3f47" roughness={0.9} metalness={0} />
          </mesh>
          <mesh position={[6, 1.4, -4]}>
            <boxGeometry args={[4.5, 2.4, 3.2]} />
            <meshStandardMaterial color="#c9cdd3" roughness={0.7} metalness={0.1} />
          </mesh>
          {/* Pedestal. */}
          <mesh position={[0, 2.8, 0]}>
            <cylinderGeometry args={[0.9, 1.5, 5.2, 20]} />
            <meshStandardMaterial color="#d9dce0" roughness={0.55} metalness={0.2} />
          </mesh>
          {/* Dish: looks along its local +Z. */}
          <group ref={dish} position={[0, 6.2, 0]}>
            {/* A spherical cap whose pole is behind the dish, so its concave side faces +Z. */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 5.2]}>
              <sphereGeometry args={[6.2, 40, 16, 0, Math.PI * 2, 0, 0.82]} />
              <meshStandardMaterial color="#eef0f2" roughness={0.5} metalness={0.15} side={DoubleSide} />
            </mesh>
            <mesh position={[0, 0, 4.4]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.42, 0.9, 12]} />
              <meshStandardMaterial color="#8a9099" roughness={0.4} metalness={0.7} />
            </mesh>
            {[0, 120, 240].map((deg) => {
              const a = (deg * Math.PI) / 180;
              return (
                <mesh key={deg} position={[Math.cos(a) * 2.3, Math.sin(a) * 2.3, 2.5]} rotation={[0, 0, a]}>
                  <boxGeometry args={[0.12, 0.12, 4.6]} />
                  <meshStandardMaterial color="#8a9099" roughness={0.4} metalness={0.7} />
                </mesh>
              );
            })}
          </group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.35, 0]}>
            <ringGeometry args={[13.5, 14.2, 64]} />
            <meshBasicMaterial color={ACCENT.rf} transparent opacity={0.8} side={DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
          </group>
        </group>

        {/* Visibility cone: the spacecraft can be reached while it is inside it. */}
        <group ref={cone}>
          <mesh position={[0, CIRCLE_HEIGHT / 2, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[CIRCLE_RADIUS, CIRCLE_HEIGHT, 72, 1, true]} />
            <meshBasicMaterial color={ACCENT.rf} transparent opacity={0.045} side={DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
          <lineLoop geometry={circle}>
            <lineBasicMaterial color={ACCENT.rf} transparent opacity={0.5} depthWrite={false} toneMapped={false} />
          </lineLoop>
        </group>
        <StationLabel />
      </group>

      <group ref={targetGroup} position={target.position} quaternion={target.quaternion} name="ObservationTarget">
        <group ref={targetRing}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2.5, 0]}>
            <ringGeometry args={[9, 9.8, 48]} />
            <meshBasicMaterial color={ACCENT.payload} transparent opacity={0.9} side={DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2.5, 0]}>
            <ringGeometry args={[0, 1.4, 20]} />
            <meshBasicMaterial color={ACCENT.payload} transparent opacity={0.9} side={DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
        <SurfaceLabel lift={16}>
          <span className={ui.surfaceLabelName}>{OBSERVATION_TARGET.label}</span>
        </SurfaceLabel>
      </group>
    </>
  );
}
