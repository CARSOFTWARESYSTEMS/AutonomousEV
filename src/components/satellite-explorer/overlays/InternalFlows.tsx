// Power, data and RF moving inside the bus: a faint line for each active
// route with a few pulses travelling along it. Lives in the body frame (it is a
// child of the spacecraft). An engineering visualisation, not visible physics.
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei/core/Line";
import { Color, type InstancedMesh, Object3D, type Vector3 } from "three";
import { FLOW_COLOR } from "../data/satelliteReference";
import { frame } from "../scene/frameState";
import { FLOW_ROUTES } from "../spacecraft/flowRoutes";
import { curveThrough } from "../spacecraft/primitives";

const SAMPLES = 44;
/** Pulse travel speed along a route, units per second. */
const SPEED = 1.5;
const PULSE_RADIUS = 0.036;
/** Brightness above 1 so the restrained bloom picks the pulses out. */
const GLOW = 2.4;

type LineObject = React.ComponentRef<typeof Line>;

const dummy = new Object3D();
const color = new Color();

export default function InternalFlows() {
  const routes = useMemo(
    () =>
      FLOW_ROUTES.map((route) => {
        const curve = curveThrough(route.points, 0.05);
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
    routes.forEach((route, i) => {
      const activation = frame.flows[route.id];
      const strength = Math.abs(activation);
      const active = strength > 0.02;
      const line = lines.current[i];
      if (line) {
        line.visible = active;
        line.material.opacity = 0.14 + 0.36 * strength;
      }
      for (let j = 0; j < route.pulses; j++) {
        if (!active) {
          dummy.scale.setScalar(0);
        } else {
          let u = ((frame.now * SPEED) / route.length + j / route.pulses) % 1;
          if (activation < 0) u = 1 - u;
          const f = u * SAMPLES;
          const index = Math.min(SAMPLES - 1, Math.floor(f));
          const a: Vector3 = route.samples[index];
          const b: Vector3 = route.samples[index + 1];
          dummy.position.lerpVectors(a, b, f - index);
          // Fade in and out at the ends so pulses do not pop.
          dummy.scale.setScalar(PULSE_RADIUS * (0.55 + 0.45 * strength) * Math.pow(Math.sin(Math.PI * u), 0.4));
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(k++, dummy.matrix);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="InternalFlows">
      {routes.map((route, i) => (
        <Line
          key={route.id}
          ref={(node) => {
            lines.current[i] = node;
          }}
          points={route.samples}
          color={FLOW_COLOR[route.kind]}
          lineWidth={1.4}
          transparent
          opacity={0.3}
          depthWrite={false}
          toneMapped={false}
          visible={false}
        />
      ))}
      <instancedMesh ref={pulses} args={[undefined, undefined, total]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
