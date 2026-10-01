// Vibration made visible at motor 04: thin rings spreading from the front
// bearing, in the plane of the rotor. Barely there while the unit is healthy,
// larger and amber once the anomaly has been detected. An illustration of the
// signal's growth, not of physical displacement.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { STATE_COLOR } from "../data/uflightReferenceAircraft";
import { UNIT_STATIONS, unitMount, unitPoint } from "../aircraft/layout";
import { DEG } from "../lib/math";
import { frame } from "../scene/frameState";
import { ANOMALY_SEVERITY } from "../simulation/mission";

const RINGS = 3;
const mount = unitMount("04");
const HEALTHY = new Color("#dfeef4");
const ANOMALY = new Color(STATE_COLOR.DEGRADED).multiplyScalar(1.6);

export default function VibrationOverlay() {
  const root = useRef<Group>(null);
  const rings = useRef<(Mesh | null)[]>([]);
  const strength = useRef(0);

  useFrame((_, delta) => {
    const group = root.current;
    if (!group) return;
    const running = frame.rpm[3] > 40;
    const target = frame.flags.vibration && running ? 1 : 0;
    strength.current += (target - strength.current) * (1 - Math.exp(-5 * Math.min(delta, 0.1)));
    group.visible = strength.current > 0.02;
    if (!group.visible) return;

    const p = unitPoint(mount, [UNIT_STATIONS.tilt.bearingFront, 0, 0], frame.tiltDeg);
    group.position.set(p[0], p[1], p[2]);
    group.rotation.z = frame.tiltDeg * DEG;

    const severity = frame.severity;
    const detected = severity > ANOMALY_SEVERITY;
    // The rings reach further and pulse faster as the fault grows.
    const reach = 0.26 + 0.5 * severity;
    const rate = 0.5 + 1.1 * severity;
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const u = (frame.now * rate + i / RINGS) % 1;
      const radius = 0.14 + reach * u;
      ring.scale.setScalar(radius);
      const material = ring.material as MeshBasicMaterial;
      material.color.copy(detected ? ANOMALY : HEALTHY);
      material.opacity = (detected ? 0.85 : 0.26 + 0.5 * (severity / ANOMALY_SEVERITY)) * (1 - u) * strength.current;
    });
  });

  return (
    <group ref={root} name="Vibration" visible={false}>
      {Array.from({ length: RINGS }, (_, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            rings.current[i] = mesh;
          }}
          rotation={[0, Math.PI / 2, 0]}
          renderOrder={7}
        >
          <torusGeometry args={[1, 0.012, 6, 64]} />
          <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
