// TRACE: one sensor's signal followed through the health pipeline. A single
// pulse leaves the sensor, reaches its acquisition node, crosses the gateway
// to the edge processor, moves to the health computer and ends at the
// maintenance gateway — in step with the stages listed in the sensor panel.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei/core/Line";
import { type Mesh, Vector3 } from "three";
import type { Vec3 } from "../types";
import { TRACE_STEPS, TRACE_STEP_S } from "../data/healthDefinitions";
import { type SensorDefinition, getSensor, sensorPosition } from "../data/sensorDefinitions";
import { FLOW_COLOR } from "../data/uflightReferenceAircraft";
import { EQUIPMENT } from "../aircraft/layout";
import { ease } from "../lib/math";
import { frame } from "../scene/frameState";
import { useUFlightStore } from "../state/uflightStore";

/** Fraction of each step spent travelling; the rest is spent at the stop. */
const TRAVEL = 0.55;

/** For each step, the points the pulse passes on its way to that step's stop. */
function legs(sensor: SensorDefinition, tiltDeg: number): Vec3[][] {
  const start = sensorPosition(sensor, tiltDeg);
  const node = EQUIPMENT[sensor.node];
  const gateway = EQUIPMENT["sensor-gateway"];
  const edge = EQUIPMENT["edge-processor"];
  const computer = EQUIPMENT["hums-computer"];
  const maintenance = EQUIPMENT["maintenance-gateway"];
  return [[start], [start, node], [node, gateway, edge], [edge], [edge, computer], [computer], [computer], [computer, maintenance]];
}

const a = new Vector3();
const b = new Vector3();

function Trace({ sensor, startedAt }: { sensor: SensorDefinition; startedAt: number }) {
  const pulse = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const tilt = useUFlightStore.getState().telemetry.flight.tiltDeg;
  const path = useMemo(() => legs(sensor, tilt), [sensor, tilt]);
  const outline = useMemo(() => path.flat().filter((p, i, all) => i === 0 || p !== all[i - 1]), [path]);

  useFrame(() => {
    const mesh = pulse.current;
    if (!mesh) return;
    const elapsed = Math.max(0, frame.now - startedAt);
    const step = Math.min(TRACE_STEPS.length - 1, Math.floor(elapsed / TRACE_STEP_S));
    const u = step === TRACE_STEPS.length - 1 && elapsed > TRACE_STEPS.length * TRACE_STEP_S ? 1 : (elapsed / TRACE_STEP_S) % 1;
    const leg = path[step];
    // Along the leg's polyline, by segment.
    const along = ease(Math.min(1, u / TRAVEL)) * (leg.length - 1);
    const index = Math.min(leg.length - 2, Math.floor(along));
    if (leg.length === 1) mesh.position.set(leg[0][0], leg[0][1], leg[0][2]);
    else mesh.position.lerpVectors(a.set(...(leg[index] as [number, number, number])), b.set(...(leg[index + 1] as [number, number, number])), along - index);
    // At a stop, the pulse breathes: the step is being processed there.
    const dwell = u > TRAVEL || leg.length === 1;
    mesh.scale.setScalar(dwell ? 1 + 0.35 * Math.sin(frame.now * 6) : 1);
    if (halo.current) {
      halo.current.position.copy(mesh.position);
      halo.current.scale.setScalar(dwell ? 1.6 + 0.8 * ((frame.now * 0.9) % 1) : 0.001);
    }
  });

  return (
    <group name="Trace">
      <Line points={outline} color={FLOW_COLOR.health} lineWidth={1.4} transparent opacity={0.4} depthTest={false} depthWrite={false} toneMapped={false} renderOrder={7} />
      <mesh ref={pulse} renderOrder={9}>
        <sphereGeometry args={[0.055, 14, 10]} />
        <meshBasicMaterial color={[2.6, 2.6, 2.6]} toneMapped={false} depthTest={false} transparent />
      </mesh>
      <mesh ref={halo} renderOrder={8}>
        <sphereGeometry args={[0.055, 14, 10]} />
        <meshBasicMaterial color={FLOW_COLOR.health} transparent opacity={0.22} depthTest={false} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function TraceOverlay() {
  const trace = useUFlightStore((s) => s.trace);
  const sensor = trace ? getSensor(trace.sensorId) : undefined;
  if (!trace || !sensor) return null;
  return <Trace key={`${trace.sensorId}-${trace.startedAt}`} sensor={sensor} startedAt={trace.startedAt} />;
}
