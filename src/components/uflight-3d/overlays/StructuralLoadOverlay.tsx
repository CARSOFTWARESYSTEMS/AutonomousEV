// Where the loads go. Lines follow the load paths — rotor mounts, booms,
// spars, the wing frames, the keel and the landing gear — and brighten with
// the load each is carrying; arrows show the forces applied to the airframe.
// ENGINEERING VISUALIZATION: relative intensities, not stress analysis.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei/core/Line";
import { type Group, type MeshBasicMaterial } from "three";
import type { Vec3 } from "../types";
import { BATTERY, BOOM, FRAME_STATIONS, FUSELAGE, GEAR, TILT_Z, UNIT_MOUNTS, UNIT_STATIONS, WING, fuselagePoint, unitIndex, unitPoint, wingPoint, wingY } from "../aircraft/layout";
import { frame } from "../scene/frameState";
import type { LoadPathId } from "../simulation/structures";

type LineObject = React.ComponentRef<typeof Line>;

interface Path {
  id: LoadPathId;
  points: Vec3[];
}

const spar = (z: number): Vec3 => wingPoint(z, WING.mainSparFraction);
const frameArc = (x: number, sign: number): Vec3[] => [20, 60, 100, 128, 160, 180].map((deg) => fuselagePoint(x, (sign * deg * Math.PI) / 180, 0.06));

function loadPaths(): Path[] {
  const paths: Path[] = [];
  for (const sign of [-1, 1]) {
    paths.push({ id: "main-spar", points: [spar(sign * (WING.semiSpan - 0.2)), spar(sign * TILT_Z.outboard), spar(sign * TILT_Z.inboard), spar(sign * BOOM.z), spar(sign * WING.rootZ)] });
    paths.push({ id: "wing-root", points: [spar(sign * WING.rootZ), [WING.sparX, FUSELAGE.topY - 0.09, sign * 0.5], [WING.sparX, FUSELAGE.topY - 0.09, 0]] });
    for (const x of [FRAME_STATIONS[2], FRAME_STATIONS[3]]) paths.push({ id: "fuselage-frame", points: frameArc(x, sign) });
    paths.push({ id: "boom", points: [[2.7, BOOM.y, sign * BOOM.z], [WING.sparX, BOOM.y, sign * BOOM.z], [WING.sparX, wingY(BOOM.z) - 0.04, sign * BOOM.z]] });
    paths.push({ id: "boom", points: [[-2.8, BOOM.y, sign * BOOM.z], [WING.sparX, BOOM.y, sign * BOOM.z]] });
    const { mountX, mountY, mountZ, axleX, axleY, axleZ } = GEAR.main;
    paths.push({ id: "landing-gear", points: [[axleX, axleY, sign * axleZ], [mountX, mountY, sign * mountZ], fuselagePoint(FRAME_STATIONS[3], (sign * 150 * Math.PI) / 180, 0.06), [FRAME_STATIONS[3], FUSELAGE.bellyY + 0.08, 0]] });
    paths.push({ id: "battery-enclosure", points: [[BATTERY.toX, BATTERY.bottomY, sign * BATTERY.packZ], [BATTERY.fromX, BATTERY.bottomY, sign * BATTERY.packZ]] });
  }
  for (const mount of UNIT_MOUNTS) {
    if (mount.kind === "tilt") paths.push({ id: "rotor-mount-tilt", points: [mount.pivot, [wingPoint(mount.pivot[2], 0)[0], mount.pivot[1], mount.pivot[2]], spar(mount.pivot[2])] });
    else paths.push({ id: "rotor-mount-lift", points: [unitPoint(mount, [UNIT_STATIONS.lift.hub, 0, 0]), mount.pivot] });
  }
  paths.push({ id: "landing-gear", points: [GEAR.nose.axle, GEAR.nose.mount, [FRAME_STATIONS[0], FUSELAGE.bellyY + 0.12, 0]] });
  paths.push({ id: "keel", points: [[FRAME_STATIONS[0], FUSELAGE.bellyY + 0.1, 0], [FRAME_STATIONS[2], FUSELAGE.bellyY + 0.06, 0], [FRAME_STATIONS[5], 0.7, 0]] });
  return paths;
}

interface Force {
  /** Where the force is applied. */
  at: Vec3;
  /** +1 up, −1 down. */
  direction: 1 | -1;
  magnitude: () => number;
}

/** Applied forces: thrust at each rotor, lift along the wing, ground reaction at the gear, weight at the centre. */
function forces(): Force[] {
  const list: Force[] = UNIT_MOUNTS.map((mount) => ({
    at: unitPoint(mount, [UNIT_STATIONS[mount.kind].hub + 0.25, 0, 0]),
    direction: 1,
    // A tilt unit's thrust lifts only while it is tilted up.
    magnitude: () => (frame.rpm[unitIndex(mount.no)] / 1250) * (mount.kind === "tilt" ? Math.sin((frame.tiltDeg * Math.PI) / 180) : 1) * (frame.flight.onGround ? 0.3 : 1),
  }));
  for (const z of [-5.6, -3.4, -1.4, 1.4, 3.4, 5.6]) list.push({ at: [wingPoint(z, 0.3)[0], wingY(z) + 0.14, z], direction: 1, magnitude: () => frame.flight.wingLiftShare * 0.8 });
  const ground = () => frame.loads["landing-gear"] ?? 0;
  list.push({ at: [GEAR.nose.axle[0], 0.02, 0], direction: 1, magnitude: () => ground() * 0.5 });
  for (const sign of [-1, 1]) list.push({ at: [GEAR.main.axleX, 0.02, sign * GEAR.main.axleZ], direction: 1, magnitude: () => ground() * 0.8 });
  list.push({ at: [0.2, 1.3, 0], direction: -1, magnitude: () => 1 });
  return list;
}

const ARROW_LENGTH = 1.5;

export default function StructuralLoadOverlay() {
  const root = useRef<Group>(null);
  const paths = useMemo(() => loadPaths(), []);
  const applied = useMemo(() => forces(), []);
  const lines = useRef<(LineObject | null)[]>([]);
  const arrows = useRef<(Group | null)[]>([]);
  const strength = useRef(0);

  useFrame((_, delta) => {
    const group = root.current;
    if (!group) return;
    const target = frame.flags.loads ? 1 : 0;
    strength.current += (target - strength.current) * (1 - Math.exp(-6 * Math.min(delta, 0.1)));
    const visible = strength.current > 0.02;
    group.visible = visible;
    if (!visible) return;
    paths.forEach((path, i) => {
      const line = lines.current[i];
      if (!line) return;
      const load = frame.loads[path.id] ?? 0;
      line.material.opacity = (0.08 + 0.82 * load) * strength.current;
      line.material.linewidth = 1 + 2.4 * load;
    });
    applied.forEach((force, i) => {
      const arrow = arrows.current[i];
      if (!arrow) return;
      const magnitude = Math.max(0, force.magnitude());
      arrow.visible = magnitude > 0.04;
      arrow.scale.set(1, magnitude * ARROW_LENGTH * force.direction, 1);
      arrow.traverse((object) => {
        const material = (object as { material?: MeshBasicMaterial }).material;
        if (material) material.opacity = 0.7 * strength.current;
      });
    });
  });

  return (
    <group ref={root} name="StructuralLoads" visible={false}>
      {paths.map((path, i) => (
        <Line
          key={i}
          ref={(node) => {
            lines.current[i] = node;
          }}
          points={path.points}
          color="#f4f6fa"
          lineWidth={2}
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
          renderOrder={5}
        />
      ))}
      {applied.map((force, i) => (
        <group
          key={i}
          ref={(node) => {
            arrows.current[i] = node;
          }}
          position={force.at as unknown as [number, number, number]}
        >
          {/* Unit arrow along +Y; the group's scale gives it its length and sense. */}
          <mesh position={[0, 0.4, 0]} renderOrder={6}>
            <cylinderGeometry args={[0.012, 0.012, 0.8, 8]} />
            <meshBasicMaterial color="#cfe0f5" transparent opacity={0} depthTest={false} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.9, 0]} renderOrder={6}>
            <coneGeometry args={[0.05, 0.2, 12]} />
            <meshBasicMaterial color="#cfe0f5" transparent opacity={0} depthTest={false} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
