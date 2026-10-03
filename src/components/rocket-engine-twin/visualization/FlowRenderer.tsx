// Propellant, coolant, hot gas and data moving through the engine. Every flow
// runs along the pipe it belongs to: the same path the pipe itself is built
// from, drawn just outside its wall. Nothing is laid beside the engine.
// Speeds are scaled for the eye. This shows where things go, not how fast.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { BufferGeometry, Mesh, ShaderMaterial } from "three";
import { CONTROLLER_PORT, PIPES, type PipeId, REGEN_END_Y, SENSOR_AT, harnessPath, wallRadius } from "../engine/layout";
import { type V3, curve, pipe } from "../engine/geometry";
import { frame } from "../scene/frameState";
import { useRocketTwinStore } from "../state/twinStore";
import type { FlowId, SensorId } from "../types";
import { FLOW_COLOR, flowMaterial } from "./shaders";

interface Segment {
  flow: FlowId;
  points: readonly V3[];
  radius: number;
  color: string;
  /** Pressure at each end, as a fraction of the highest in the reference model. */
  pressure: readonly [number, number];
  /** The sensor a data lead belongs to, so a trace can pick it out. */
  sensor?: SensorId;
}

const onPipe = (flow: FlowId, id: PipeId, color: string, pressure: readonly [number, number]): Segment => ({ flow, points: PIPES[id].points, radius: PIPES[id].radius * 1.24, color, pressure });

/** Points around a manifold ring. */
const loop = (radius: number, y: number): V3[] => Array.from({ length: 13 }, (_, i) => [Math.cos((i / 12) * Math.PI * 2) * radius, y, Math.sin((i / 12) * Math.PI * 2) * radius] as V3);

const SEGMENTS: readonly Segment[] = [
  // Oxidiser and fuel stay separate, and are coloured apart, all the way to combustion.
  onPipe("propellant", "feed_oxidiser", FLOW_COLOR.oxidiser, [0.06, 0.06]),
  onPipe("propellant", "line_oxidiser_discharge", FLOW_COLOR.oxidiser, [0.8, 0.74]),
  onPipe("propellant", "line_oxidiser_preburner", FLOW_COLOR.oxidiser, [0.78, 0.74]),
  onPipe("propellant", "feed_fuel", FLOW_COLOR.fuel, [0.05, 0.05]),
  onPipe("propellant", "line_fuel_discharge", FLOW_COLOR.fuel, [1, 0.96]),
  onPipe("propellant", "line_fuel_preburner", FLOW_COLOR.fuel, [0.72, 0.7]),
  // Coolant is the fuel, on its way round the wall.
  onPipe("cooling", "line_fuel_discharge", FLOW_COLOR.coolant, [1, 0.96]),
  { flow: "cooling", points: loop(wallRadius(REGEN_END_Y) + 0.03, REGEN_END_Y), radius: 0.062, color: FLOW_COLOR.coolant, pressure: [0.96, 0.95] },
  { flow: "cooling", points: loop(wallRadius(0.72) + 0.02, 0.72), radius: 0.046, color: FLOW_COLOR.coolant, pressure: [0.74, 0.73] },
  onPipe("cooling", "line_fuel_preburner", FLOW_COLOR.coolant, [0.72, 0.7]),
  onPipe("hot_gas", "hot_gas_fuel", FLOW_COLOR.hot, [0.66, 0.64]),
  onPipe("hot_gas", "hot_gas_oxidiser", FLOW_COLOR.hot, [0.66, 0.64]),
  onPipe("hot_gas", "exhaust_fuel", FLOW_COLOR.hot, [0.52, 0.5]),
  onPipe("hot_gas", "exhaust_oxidiser", FLOW_COLOR.hot, [0.52, 0.5]),
  ...(Object.keys(SENSOR_AT) as SensorId[]).map((sensor): Segment => ({ flow: "data", points: harnessPath(sensor), radius: 0.016, color: FLOW_COLOR.data, pressure: [0, 0], sensor })),
  // Commands, back out from the controller to the valves.
  ...([[-0.36, 1.24, 0.4], [0.57, 0.36, -0.5], [0.3, 1.11, -0.62]] as V3[]).map((to): Segment => ({ flow: "data", points: [CONTROLLER_PORT, [(CONTROLLER_PORT[0] + to[0]) / 2, Math.max(CONTROLLER_PORT[1], to[1]) + 0.12, (CONTROLLER_PORT[2] + to[2]) / 2], to], radius: 0.014, color: FLOW_COLOR.data, pressure: [0, 0] })),
];

/** Pulses per unit of pipe length, so every flow reads at the same grain. */
const GRAIN = 2.6;

export default function FlowRenderer() {
  const built = useMemo(
    () =>
      SEGMENTS.map((segment) => {
        const length = curve(segment.points).getLength();
        const material = flowMaterial(segment.color, Math.max(1.5, length * GRAIN), segment.flow === "data" ? 0.9 : 0.55);
        material.uniforms.uP0.value = segment.pressure[0];
        material.uniforms.uP1.value = segment.pressure[1];
        return { segment, geometry: pipe(segment.points, segment.radius, { radial: 10 }) as BufferGeometry, material };
      }),
    [],
  );
  const meshes = useRef<Mesh[]>([]);

  useEffect(
    () => () => {
      built.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
    },
    [built],
  );

  useFrame(() => {
    const { sensor, tracing } = useRocketTwinStore.getState();
    built.forEach(({ segment }, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      let strength = frame.flow[segment.flow];
      // A trace follows one lead; the others stay only as a hint of the network.
      if (segment.flow === "data" && tracing && sensor) strength *= segment.sensor === sensor ? 1 : 0.1;
      const uniforms = (mesh.material as ShaderMaterial).uniforms;
      uniforms.uTime.value = frame.now;
      uniforms.uStrength.value = strength * 0.62;
      uniforms.uPressure.value = segment.flow === "data" || segment.flow === "hot_gas" ? 0 : frame.pressure;
      mesh.visible = strength > 0.01;
    });
  });

  return (
    <group name="Flows">
      {built.map(({ geometry, material }, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={material}
          visible={false}
          renderOrder={4}
          ref={(node) => {
            if (node) meshes.current[i] = node;
          }}
        />
      ))}
    </group>
  );
}
