// Sensor markers on the engine. They appear only in the views that are about
// measurement, and only for the kind of sensor asked for: there is never a
// cloud of dots. A marker can be picked; the one that is selected is held.
import { useRef } from "react";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { SENSORS } from "../data/engineReference";
import { SENSOR_AT } from "../engine/layout";
import { damp, frame } from "../scene/frameState";
import { type TwinState, useRocketTwinStore } from "../state/twinStore";
import type { SensorId } from "../types";

const COLOR = "#a9cdf7";
const ALERT = "#f5b041";
/** The sensors that watch the bearing: they carry the fault's colour while it is active. */
const BEARING_SENSORS: readonly SensorId[] = ["pump_vibration", "bearing_temperature"];

/** Whether a sensor's marker belongs in the current view. */
export function sensorVisible(s: TwinState, id: SensorId): boolean {
  const sensor = SENSORS.find((x) => x.id === id);
  if (!sensor || !s.entered || s.explodedAmount > 0.04) return false;
  if (s.sensor === id) return true;
  switch (s.mode) {
    case "control":
      return s.sensorFilter === null || sensor.type === s.sensorFilter;
    case "health":
      // A filter shows one kind of sensor; a system shows its own; a fault shows the sensors that watch it.
      if (s.sensorFilter !== null) return sensor.type === s.sensorFilter && (s.healthSystem === null || sensor.system === s.healthSystem);
      if (s.healthSystem !== null) return sensor.system === s.healthSystem;
      return s.bearing !== null && BEARING_SENSORS.includes(id);
    case "flow":
      return s.flow === "data";
    case "architecture":
      return true;
    case "twin":
      return s.bearing !== null && BEARING_SENSORS.includes(id);
    case "engine":
      return s.component === "bearing_region" && BEARING_SENSORS.includes(id);
    default:
      return false;
  }
}

function Marker({ id }: { id: SensorId }) {
  const mesh = useRef<Mesh>(null);
  const live = useRef(0);
  const { at, out } = SENSOR_AT[id];
  const length = Math.hypot(out[0], out[1], out[2]);
  const position: [number, number, number] = [at[0] + (out[0] / length) * 0.1, at[1] + (out[1] / length) * 0.1, at[2] + (out[2] / length) * 0.1];

  useFrame((_, delta) => {
    const node = mesh.current;
    if (!node) return;
    const s = useRocketTwinStore.getState();
    const selected = s.sensor === id;
    live.current = damp(live.current, sensorVisible(s, id) ? 1 : 0, 9, Math.min(delta, 0.1));
    node.visible = live.current > 0.02;
    const pulse = selected ? 1.35 + 0.18 * Math.sin(frame.now * 4) : 1;
    node.scale.setScalar(live.current * pulse);
    const alert = s.bearing !== null && s.bearing !== "healthy" && BEARING_SENSORS.includes(id);
    (node.material as unknown as { color: { set(c: string): void } }).color.set(alert ? ALERT : COLOR);
  });

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 5) return;
    event.stopPropagation();
    useRocketTwinStore.getState().selectSensor(id);
  };

  return (
    <mesh ref={mesh} position={position} visible={false} onClick={onClick} renderOrder={8}>
      <sphereGeometry args={[0.017, 14, 10]} />
      <meshBasicMaterial color={COLOR} toneMapped={false} depthTest={false} transparent opacity={0.95} />
    </mesh>
  );
}

export default function SensorRenderer() {
  return (
    <group name="Sensors">
      {SENSORS.map((sensor) => (
        <Marker key={sensor.id} id={sensor.id} />
      ))}
    </group>
  );
}
