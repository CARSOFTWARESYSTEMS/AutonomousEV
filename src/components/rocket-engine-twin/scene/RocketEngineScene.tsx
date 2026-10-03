// The WebGL scene. The simulation runs first each frame, then the camera, then
// everything that draws. Mounted only on a desktop-sized viewport with WebGL.
import { memo, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import type { QualitySettings } from "../../satellite-explorer/lib/capabilities";
import EngineModel from "../engine/EngineModel";
import { useRocketTwinStore } from "../state/twinStore";
import ArchitectureOverlay from "../visualization/ArchitectureOverlay";
import Combustion from "../visualization/Combustion";
import FlowRenderer from "../visualization/FlowRenderer";
import SensorRenderer from "../visualization/SensorRenderer";
import TwinGhost from "../visualization/TwinGhost";
import CameraDirector from "./CameraDirector";
import SimulationDriver from "./SimulationDriver";
import Stage from "./Stage";
import ui from "../twin3d.module.css";

/** Marks the scene ready once a few frames have been drawn: geometry built, shaders compiled. */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 4) useRocketTwinStore.getState().setSceneReady(true);
  });
  return null;
}

/** Memoised: the scene's elements never change, so interface state must not reconcile it. */
function RocketEngineScene({ quality, label, describedBy }: { quality: QualitySettings; label: string; describedBy: string }) {
  const press = useRef({ x: 0, y: 0 });
  useEffect(() => () => useRocketTwinStore.getState().setSceneReady(false), []);

  return (
    <div
      className={ui.canvas}
      role="img"
      aria-label={label}
      aria-describedby={describedBy}
      onPointerDown={(event) => {
        press.current = { x: event.clientX, y: event.clientY };
      }}
    >
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
        onPointerMissed={(event) => {
          // A click on empty space clears the selection; the end of a camera drag does not.
          if (Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 5) return;
          const state = useRocketTwinStore.getState();
          if (state.sensor) state.selectSensor(null);
          else if (state.component) state.selectComponent(null);
        }}
      >
        <SimulationDriver />
        <CameraDirector />
        <Stage shadows={quality.shadows} shadowMapSize={quality.shadowMapSize} />
        <EngineModel />
        <FlowRenderer />
        <Combustion />
        <SensorRenderer />
        <TwinGhost />
        <ArchitectureOverlay />
        <ReadySignal />
      </Canvas>
    </div>
  );
}

export default memo(RocketEngineScene);
