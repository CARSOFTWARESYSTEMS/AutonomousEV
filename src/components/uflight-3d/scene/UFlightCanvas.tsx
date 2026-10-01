// The WebGL scene. Simulation runs first each frame, then the camera, then
// everything that draws. Only mounted on desktop-sized viewports with WebGL.
import { memo, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ACESFilmicToneMapping, NoToneMapping, SRGBColorSpace } from "three";
import { LabelProjector } from "../../satellite-explorer/overlays/SceneLabel";
import UFlightAircraft from "../aircraft/UFlightAircraft";
import Flows from "../overlays/Flows";
import SensorMarkers from "../overlays/SensorMarkers";
import StructuralLoadOverlay from "../overlays/StructuralLoadOverlay";
import TraceOverlay from "../overlays/TraceOverlay";
import TwinGhost from "../overlays/TwinGhost";
import VibrationOverlay from "../overlays/VibrationOverlay";
import ViewLabels from "../overlays/ViewLabels";
import { useUFlightStore } from "../state/uflightStore";
import CameraRig from "./CameraRig";
import Effects from "./Effects";
import FlightEnvironment from "./FlightEnvironment";
import Lighting from "./Lighting";
import SimulationDriver from "./SimulationDriver";
import Sky from "./Sky";
import StudioEnvironment from "./StudioEnvironment";
import TwinEnvironment from "./TwinEnvironment";
import VertiportEnvironment from "./VertiportEnvironment";
import ui from "../uflight.module.css";

/** Marks the scene ready once a few frames have been drawn (geometry built, shaders compiled). */
function ReadySignal() {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    frames.current += 1;
    if (frames.current >= 4) {
      done.current = true;
      useUFlightStore.getState().setSceneReady(true);
    }
  });
  return null;
}

/**
 * Memoised: the scene's elements never change, so interface state that
 * re-renders the shell (hover, selection, mission stage) must not reconcile it.
 */
function UFlightCanvas({ label, describedBy }: { label: string; describedBy: string }) {
  const quality = useUFlightStore((s) => s.quality);
  const press = useRef({ x: 0, y: 0 });

  useEffect(() => () => useUFlightStore.getState().setSceneReady(false), []);

  return (
    <div
      className={ui.canvas}
      role="img"
      aria-label={label}
      aria-describedby={describedBy}
      onPointerDown={(e) => {
        press.current = { x: e.clientX, y: e.clientY };
      }}
    >
      <Canvas
        dpr={quality.dpr}
        shadows={quality.shadows ? "percentage" : false}
        gl={{ antialias: !quality.postprocessing, alpha: false, stencil: false, powerPreference: "high-performance" }}
        camera={{ fov: 34, near: 0.1, far: 9000, position: [16, 4, 14] }}
        onCreated={({ gl }) => {
          gl.setClearColor("#030405", 1);
          gl.outputColorSpace = SRGBColorSpace;
          // With post-processing the composer tone-maps; without it the renderer does.
          gl.toneMapping = quality.postprocessing ? NoToneMapping : ACESFilmicToneMapping;
          gl.toneMappingExposure = 1;
        }}
        onPointerMissed={(event) => {
          // A click on empty space clears the selection; the end of a camera drag does not.
          if (Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 5) return;
          const state = useUFlightStore.getState();
          if (state.isolatedComponent) return;
          if (state.selectedSensor) state.selectSensor(null);
          else if (state.selectedComponent) state.selectComponent(null);
        }}
      >
        <SimulationDriver />
        <CameraRig />
        <Sky />
        <Lighting />
        <StudioEnvironment />
        <FlightEnvironment />
        <VertiportEnvironment />
        <TwinEnvironment />
        <UFlightAircraft>
          <Flows />
          <StructuralLoadOverlay />
          <VibrationOverlay />
          <SensorMarkers />
          <TraceOverlay />
          <ViewLabels />
        </UFlightAircraft>
        <TwinGhost />
        <Effects />
        <LabelProjector declutter />
        <ReadySignal />
      </Canvas>
    </div>
  );
}

export default memo(UFlightCanvas);
