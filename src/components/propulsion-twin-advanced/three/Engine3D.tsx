"use client";
// Advanced 3D Engineering Mode: the reference engine of the fundamentals page,
// reused, with this tutorial's pressure sensors placed on it. Selecting a
// sensor follows its signal from the transducer to a statement about health.
//
// Loaded as its own chunk, and only on a desktop-sized viewport with WebGL.
// The engine geometry, lighting, camera and flow rendering all come from the
// existing rocket-engine-twin scene; this file adds the sensors, the fault
// marker and the controls, and drives that scene's state directly.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { ACESFilmicToneMapping, type Group, type Mesh, SRGBColorSpace } from "three";
import { REDUCED_MOTION_QUERY, getWebGLSupport, readDeviceCapabilities, selectQuality } from "../../satellite-explorer/lib/capabilities";
import EngineModel from "../../rocket-engine-twin/engine/EngineModel";
import { CONTROLLER_AT, PIPES, SENSOR_AT, pumpPoint, wallRadius } from "../../rocket-engine-twin/engine/layout";
import type { V3 } from "../../rocket-engine-twin/engine/geometry";
import CameraDirector from "../../rocket-engine-twin/scene/CameraDirector";
import SimulationDriver from "../../rocket-engine-twin/scene/SimulationDriver";
import Stage from "../../rocket-engine-twin/scene/Stage";
import { resetRocketTwinStore, useRocketTwinStore } from "../../rocket-engine-twin/state/twinStore";
import FlowRenderer from "../../rocket-engine-twin/visualization/FlowRenderer";
import { PRESSURE_SENSORS, SENSOR_BY_ID } from "../data/pressure";
import { DESKTOP_3D } from "../data/system";
import type { ChannelId } from "../simulation/channels";
import { DIAGNOSIS_BY_ID, type FaultId } from "../simulation/isolation";
import { useLabStore } from "../state/labStore";
import { useTwin } from "../state/useTwin";
import { SCHEMATIC_ALT } from "../ui/PropulsionSchematic";
import { SensorDetail } from "../widgets/PressureMap";
import css from "../advancedTwin.module.css";

type View = "assembled" | "exploded" | "cutaway";
type Overlay = "none" | "pressure" | "signal";

const chamberWall = wallRadius(0.56);
const mid = (a: V3, b: V3): V3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];

/** Where each pressure sensor sits on the 3D engine. Positions follow the engine's own layout, so they move with it. */
const SENSOR_3D: Record<string, V3> = {
  pTankOx: PIPES.feed_oxidiser.points[0],
  pTankFu: PIPES.feed_fuel.points[0],
  pInOx: PIPES.feed_oxidiser.points[2],
  pInFu: PIPES.feed_fuel.points[2],
  pOutOx: PIPES.line_oxidiser_discharge.points[1],
  pOutFu: SENSOR_AT.pump_discharge_pressure.at,
  pCoolIn: PIPES.line_fuel_discharge.points[5],
  pCoolOut: SENSOR_AT.coolant_outlet_temperature.at,
  pInjFu: PIPES.line_fuel_preburner.points[0],
  pInjOx: PIPES.line_oxidiser_discharge.points[4],
  pcA: [0, 0.56, chamberWall],
  pcB: [-chamberWall * 0.8, 0.5, chamberWall * 0.6],
  pPb: [0, 1.27, -0.58],
  pTi: PIPES.hot_gas_fuel.points[2],
  pTo: mid(PIPES.exhaust_fuel.points[1], PIPES.exhaust_fuel.points[2]),
};

/** Where a fault is shown on the engine. */
const FAULT_3D: Record<FaultId, V3> = {
  pump_degradation: pumpPoint("oxidiser", [0, 0.66, 0]),
  valve_restriction: [0.52, 0.36, -0.44],
  cooling_restriction: [wallRadius(-0.2) * 0.7, -0.2, wallRadius(-0.2) * 0.7],
  feed_pressure_reduction: PIPES.feed_oxidiser.points[0],
  injector_restriction: [0, 0.84, 0],
  combustion_loss: [0, 0.5, 0],
  pc_sensor_drift: SENSOR_3D.pcA,
  sensor_noise: SENSOR_3D.pOutOx,
  packet_delay: CONTROLLER_AT,
  timestamp_error: CONTROLLER_AT,
  telemetry_replay: CONTROLLER_AT,
};

const COLOR = { normal: "#a9cdf7", selected: "#ffffff", alert: "#f5b041" } as const;

function Marker({ id, visible, alert, onHover }: { id: ChannelId; visible: boolean; alert: boolean; onHover: (id: ChannelId | null) => void }) {
  const mesh = useRef<Mesh>(null);
  const selected = useLabStore((s) => s.sensor === id);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.scale.setScalar(selected ? 1.5 + 0.2 * Math.sin(clock.elapsedTime * 4) : 1);
    // A sensor in alarm turns, so it reads as different even without its colour.
    if (alert) mesh.current.rotation.y = clock.elapsedTime * 2;
  });
  const onClick = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 5) return;
    event.stopPropagation();
    useLabStore.getState().selectSensor(id);
  };
  return (
    <mesh
      ref={mesh}
      position={SENSOR_3D[id] as [number, number, number]}
      visible={visible}
      renderOrder={9}
      onClick={onClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(id);
      }}
      onPointerOut={() => onHover(null)}
    >
      {alert ? <octahedronGeometry args={[0.042, 0]} /> : <sphereGeometry args={[0.03, 16, 12]} />}
      <meshBasicMaterial color={selected ? COLOR.selected : alert ? COLOR.alert : COLOR.normal} toneMapped={false} depthTest={false} transparent opacity={0.96} />
    </mesh>
  );
}

function FaultMarker({ fault }: { fault: FaultId }) {
  const ring = useRef<Mesh>(null);
  useFrame(({ clock, camera }) => {
    if (!ring.current) return;
    ring.current.quaternion.copy(camera.quaternion);
    ring.current.scale.setScalar(1 + 0.22 * Math.sin(clock.elapsedTime * 3));
  });
  return (
    <mesh ref={ring} position={FAULT_3D[fault] as [number, number, number]} renderOrder={10}>
      <ringGeometry args={[0.1, 0.122, 40]} />
      <meshBasicMaterial color={COLOR.alert} toneMapped={false} depthTest={false} transparent opacity={0.95} />
    </mesh>
  );
}

/** The engine's own parts are for looking at here, not for picking: only sensors respond to the pointer. */
function Engine() {
  const group = useRef<Group>(null);
  useEffect(() => {
    group.current?.traverse((object) => {
      object.raycast = () => {};
    });
  });
  return (
    <group ref={group}>
      <EngineModel />
    </group>
  );
}

function Ready({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 4) onReady();
  });
  return null;
}

export default function Engine3D({ onClose }: { onClose: () => void }) {
  const { snapshot, engine } = useTwin();
  const selected = useLabStore((s) => s.sensor);
  const selectSensor = useLabStore((s) => s.selectSensor);
  const [view, setView] = useState<View>("assembled");
  const [overlay, setOverlay] = useState<Overlay>("pressure");
  const [sensors, setSensors] = useState(true);
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState<ChannelId | null>(null);
  const label = useRef<HTMLParagraphElement>(null);
  const quality = useMemo(() => selectQuality(readDeviceCapabilities(getWebGLSupport())), []);

  // The scene reads the fundamentals page's store. It is set directly, without that page's actions, so none of its events are reported.
  useEffect(() => {
    resetRocketTwinStore();
    useRocketTwinStore.setState({ entered: true, reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches });
    return resetRocketTwinStore;
  }, []);

  useEffect(() => {
    const s = useRocketTwinStore.getState();
    useRocketTwinStore.setState({
      mode: overlay === "none" ? "engine" : "flow",
      flow: overlay === "pressure" ? "propellant" : overlay === "signal" ? "data" : null,
      pressure: overlay === "pressure",
      explodedAmount: view === "exploded" ? 0.5 : 0,
      cutaway: view === "cutaway" ? "all" : null,
      cameraPreset: view === "exploded" ? "open_engine" : view === "cutaway" ? "chamber" : "engine_overview",
      cameraNonce: s.cameraNonce + 1,
    });
  }, [view, overlay]);

  const alerts = snapshot ? PRESSURE_SENSORS.filter((s) => Math.abs(snapshot.channels[s.id].z) >= 4).map((s) => s.id) : [];
  const fault = snapshot?.faults[0]?.id ?? null;
  const markers = sensors && view !== "exploded";
  const detail = selected ? SENSOR_BY_ID[selected] : undefined;

  return (
    <div
      className={css.three}
      data-ready={ready}
      data-hover={hover !== null || undefined}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        label.current?.style.setProperty("transform", `translate(${event.clientX - rect.left + 14}px, ${event.clientY - rect.top + 12}px)`);
      }}
    >
      <div className={css.threeCanvas} role="img" aria-label={`Interactive 3D model with ${PRESSURE_SENSORS.length} pressure sensors marked. ${SCHEMATIC_ALT}`}>
        <Canvas
          dpr={quality.dpr}
          shadows={quality.shadows ? "percentage" : false}
          gl={{ antialias: true, alpha: false, stencil: false, powerPreference: "high-performance" }}
          camera={{ fov: 30, near: 0.1, far: 140, position: [6, 2, 8] }}
          onCreated={({ gl }) => {
            gl.setClearColor("#04050a", 1);
            gl.outputColorSpace = SRGBColorSpace;
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <SimulationDriver />
          <CameraDirector />
          <Stage shadows={quality.shadows} shadowMapSize={quality.shadowMapSize} />
          <Engine />
          <FlowRenderer />
          {PRESSURE_SENSORS.map((s) => (
            <Marker key={s.id} id={s.id} visible={markers} alert={alerts.includes(s.id)} onHover={setHover} />
          ))}
          {fault && view !== "exploded" && <FaultMarker fault={fault} />}
          <Ready onReady={() => setReady(true)} />
        </Canvas>
      </div>

      <div className={css.threeBar} role="toolbar" aria-label="3D view controls">
        <span className={css.segment} role="group" aria-label="Assembly view">
          {(["assembled", "exploded", "cutaway"] as const).map((v, i) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
              {DESKTOP_3D.views[i]}
            </button>
          ))}
        </span>
        <span className={css.segment} role="group" aria-label="Overlay">
          <button type="button" aria-pressed={sensors} onClick={() => setSensors((v) => !v)}>
            Pressure sensors
          </button>
          <button type="button" aria-pressed={overlay === "pressure"} onClick={() => setOverlay(overlay === "pressure" ? "none" : "pressure")}>
            Pressure pathways
          </button>
          <button type="button" aria-pressed={overlay === "signal"} onClick={() => setOverlay(overlay === "signal" ? "none" : "signal")}>
            Signal pathways
          </button>
        </span>
        <label className={css.threeSelect}>
          <span className={css.srOnly}>Select a pressure sensor</span>
          <select className={css.select} value={selected ?? ""} onChange={(e) => selectSensor((e.target.value || null) as ChannelId | null)}>
            <option value="">Select a sensor…</option>
            {PRESSURE_SENSORS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.tag} · {s.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={css.ghost} onClick={onClose}>
          Close 3D
        </button>
      </div>

      <p className={css.threeStatus} role="status">
        {fault ? `Fault highlight: ${DIAGNOSIS_BY_ID[fault].name}, at ${DIAGNOSIS_BY_ID[fault].location.toLowerCase()}. ` : ""}
        {view === "exploded" ? "Sensors are shown on the assembled engine." : alerts.length ? `${alerts.length} ${alerts.length === 1 ? "sensor is" : "sensors are"} outside expectation.` : "Drag to turn, scroll to zoom, select a sensor."}
      </p>

      {detail && (
        <div className={css.threePanel}>
          <SensorDetail sensor={detail} snapshot={snapshot} engine={engine} onClose={() => selectSensor(null)} />
        </div>
      )}

      <p ref={label} className={css.threeHover} data-visible={hover !== null} aria-hidden="true">
        {hover ? `${SENSOR_BY_ID[hover]?.tag} · ${SENSOR_BY_ID[hover]?.name}` : ""}
      </p>
      <div className={css.threeLoading} data-hidden={ready} aria-hidden={ready || undefined}>
        <p role="status">INITIALISING 3D ENGINEERING MODE</p>
      </div>
    </div>
  );
}
