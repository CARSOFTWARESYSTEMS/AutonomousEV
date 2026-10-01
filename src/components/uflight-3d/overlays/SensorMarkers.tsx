// The sensor network, one category at a time. Each sensor is a small marker
// at its mounting point; selecting one opens it and lets its signal be traced.
// Only the category the view asks for is shown, so the aircraft is never
// covered in lights.
import { useMemo, useRef } from "react";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { Color, type Mesh, MeshBasicMaterial } from "three";
import SceneLabel from "../../satellite-explorer/overlays/SceneLabel";
import { SENSORS, getSensor, sensorPosition } from "../data/sensorDefinitions";
import { FLOW_COLOR } from "../data/uflightReferenceAircraft";
import { frame } from "../scene/frameState";
import { useUFlightStore } from "../state/uflightStore";
import ui from "../uflight.module.css";

const RADIUS = 0.032;

export default function SensorMarkers() {
  const meshes = useRef<(Mesh | null)[]>([]);
  // Two shared materials: at rest and active. Above 1 so the restrained bloom picks them out.
  const materials = useMemo(
    () => ({
      rest: new MeshBasicMaterial({ color: new Color(FLOW_COLOR.data).multiplyScalar(1.5), toneMapped: false, depthTest: false, transparent: true, opacity: 0.92 }),
      active: new MeshBasicMaterial({ color: new Color("#ffffff").multiplyScalar(2.4), toneMapped: false, depthTest: false, transparent: true }),
    }),
    [],
  );

  useFrame(() => {
    const { category, ids } = frame.sensors;
    const state = useUFlightStore.getState();
    SENSORS.forEach((sensor, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const shown = state.started && (sensor.category === category || ids.includes(sensor.id));
      mesh.visible = shown;
      if (!shown) return;
      const p = sensorPosition(sensor, frame.tiltDeg);
      mesh.position.set(p[0], p[1], p[2]);
      const active = state.selectedSensor === sensor.id || state.hoveredSensor === sensor.id || state.trace?.sensorId === sensor.id;
      mesh.material = active ? materials.active : materials.rest;
      mesh.scale.setScalar(active ? 1.8 : 1);
    });
  });

  const handlers = (id: string, index: number) => ({
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      if (!meshes.current[index]?.visible) return;
      event.stopPropagation();
      useUFlightStore.getState().setHoveredSensor(id);
    },
    onPointerOut: () => {
      const state = useUFlightStore.getState();
      if (state.hoveredSensor === id) state.setHoveredSensor(null);
    },
    onClick: (event: ThreeEvent<MouseEvent>) => {
      if (!meshes.current[index]?.visible || event.delta > 5) return;
      event.stopPropagation();
      useUFlightStore.getState().selectSensor(id);
    },
  });

  return (
    <group name="Sensors">
      {SENSORS.map((sensor, i) => (
        <mesh
          key={sensor.id}
          ref={(mesh) => {
            meshes.current[i] = mesh;
          }}
          name={sensor.id}
          visible={false}
          renderOrder={8}
          material={materials.rest}
          {...handlers(sensor.id, i)}
        >
          <sphereGeometry args={[RADIUS, 12, 10]} />
        </mesh>
      ))}
      <SensorLabel />
    </group>
  );
}

/** The tag of the sensor under the pointer, or of the selected one. */
function SensorLabel() {
  const id = useUFlightStore((s) => s.hoveredSensor ?? s.selectedSensor);
  const flightConfig = useUFlightStore((s) => s.flightConfig);
  const sensor = id ? getSensor(id) : undefined;
  if (!sensor) return null;
  const tilt = flightConfig === "cruise" ? 0 : flightConfig === "transition" ? 42 : 90;
  const position = sensorPosition(sensor, tilt);
  return (
    <SceneLabel position={[position[0], position[1], position[2]]}>
      <span className={`${ui.marker} ${ui.markerPassive} ${ui.mono}`}>{sensor.id}</span>
    </SceneLabel>
  );
}
