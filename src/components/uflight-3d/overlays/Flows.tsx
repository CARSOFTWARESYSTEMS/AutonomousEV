// Power, data, commands, health data and coolant moving through the
// aircraft: a faint line for each active route, with a few small pulses
// travelling along it. No arrows, no glow on the airframe. Which routes are
// active is decided by the view (state/selectors.ts); this only draws.
// An engineering visualisation, not visible physics.
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei/core/Line";
import { Color, type InstancedMesh, Object3D, type Vector3 } from "three";
import { FLOW_COLOR } from "../data/uflightReferenceAircraft";
import { FLOW_ROUTES } from "../aircraft/routes";
import { curveThrough } from "../aircraft/materials";
import { frame } from "../scene/frameState";

const SAMPLES = 48;
/** Pulse travel speed along a route, metres per second. */
const SPEED = 2.1;
const PULSE_RADIUS = 0.034;
/** Brightness above 1 so the restrained bloom picks the pulses out. */
const GLOW = 2.2;

type LineObject = React.ComponentRef<typeof Line>;

const dummy = new Object3D();
const color = new Color();

export default function Flows() {
  const routes = useMemo(
    () =>
      FLOW_ROUTES.map((route) => {
        const curve = curveThrough(route.points, 0.08);
        return { ...route, samples: curve.getSpacedPoints(SAMPLES), length: curve.getLength() };
      }),
    [],
  );
  const total = useMemo(() => routes.reduce((n, r) => n + r.pulses, 0), [routes]);
  const lines = useRef<(LineObject | null)[]>([]);
  const pulses = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = pulses.current;
    if (!mesh) return;
    let k = 0;
    routes.forEach((route) => {
      color.set(FLOW_COLOR[route.kind]).multiplyScalar(GLOW);
      for (let j = 0; j < route.pulses; j++) mesh.setColorAt(k++, color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [routes]);

  useFrame(() => {
    const mesh = pulses.current;
    if (!mesh) return;
    let k = 0;
    let any = false;
    routes.forEach((route, i) => {
      const strength = frame.flows[route.id] ?? 0;
      const active = strength > 0.02;
      any ||= active;
      const line = lines.current[i];
      if (line) {
        line.visible = active;
        line.material.opacity = 0.22 + 0.46 * strength;
      }
      for (let j = 0; j < route.pulses; j++) {
        if (!active) {
          dummy.scale.setScalar(0);
        } else {
          const u = ((frame.now * SPEED) / route.length + j / route.pulses) % 1;
          const f = u * SAMPLES;
          const index = Math.min(SAMPLES - 1, Math.floor(f));
          const a: Vector3 = route.samples[index];
          const b: Vector3 = route.samples[index + 1];
          dummy.position.lerpVectors(a, b, f - index);
          // Fade in and out at the ends so pulses do not pop.
          dummy.scale.setScalar(PULSE_RADIUS * (0.5 + 0.5 * strength) * Math.pow(Math.sin(Math.PI * u), 0.4));
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(k++, dummy.matrix);
      }
    });
    mesh.visible = any;
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="Flows">
      {routes.map((route, i) => (
        <Line
          key={route.id}
          ref={(node) => {
            lines.current[i] = node;
          }}
          points={route.samples}
          color={FLOW_COLOR[route.kind]}
          lineWidth={1.7}
          transparent
          opacity={0.3}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
          visible={false}
          renderOrder={5}
        />
      ))}
      <instancedMesh ref={pulses} args={[undefined, undefined, total]} frustumCulled={false} renderOrder={6}>
        <sphereGeometry args={[1, 7, 5]} />
        <meshBasicMaterial toneMapped={false} depthTest={false} transparent />
      </instancedMesh>
    </group>
  );
}
