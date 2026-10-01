// The WebGL scene. Simulation runs first each frame, then the camera, then
// everything that draws. Only mounted on desktop-sized viewports with WebGL.
import { memo, useCallback, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ACESFilmicToneMapping, NoToneMapping, SRGBColorSpace } from "three";
import { useExplorerStore } from "../state/explorerStore";
import { ReferenceVectors } from "../overlays/ADCSVectors";
import { LabelProjector } from "../overlays/SceneLabel";
import SatelliteModel from "../spacecraft/SatelliteModel";
import CameraRig from "./CameraRig";
import Effects from "./Effects";
import SimulationDriver from "./SimulationDriver";
import SpaceEnvironment from "./SpaceEnvironment";
import ui from "../explorer.module.css";

/** Marks the scene ready once imagery has settled and a few frames have been drawn. */
function ReadySignal({ loaded }: { loaded: React.RefObject<boolean> }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current || !loaded.current) return;
    frames.current += 1;
    if (frames.current >= 3) {
      done.current = true;
      useExplorerStore.getState().setSceneReady(true);
    }
  });
  return null;
}

/**
 * Memoised: the scene's elements never change, so interface state that
 * re-renders the shell (hover, selection, mission stage) must not reconcile it.
 */
function ExplorerCanvas({ onProgress, label, describedBy }: { onProgress: (fraction: number) => void; label: string; describedBy: string }) {
  const quality = useExplorerStore((s) => s.quality);
  const loaded = useRef(false);
  const press = useRef({ x: 0, y: 0 });

  const handleEarthProgress = useCallback(
    (fraction: number) => {
      onProgress(fraction);
      if (fraction >= 1) loaded.current = true;
    },
    [onProgress],
  );

  useEffect(() => () => useExplorerStore.getState().setSceneReady(false), []);

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
        camera={{ fov: 38, near: 0.1, far: 90000, position: [0, 2180, 30] }}
        onCreated={({ gl }) => {
          gl.setClearColor("#020308", 1);
          gl.outputColorSpace = SRGBColorSpace;
          // With post-processing the composer tone-maps; without it the renderer does.
          gl.toneMapping = quality.postprocessing ? NoToneMapping : ACESFilmicToneMapping;
          gl.toneMappingExposure = 1;
        }}
        onPointerMissed={(event) => {
          // A click on empty space clears the selection; the end of a camera drag does not.
          if (Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 5) return;
          const state = useExplorerStore.getState();
          if (state.selectedComponent && !state.isolatedComponent) state.selectComponent(null);
        }}
      >
        <SimulationDriver />
        <CameraRig />
        <SpaceEnvironment onEarthProgress={handleEarthProgress} />
        <SatelliteModel />
        <ReferenceVectors />
        <Effects />
        <LabelProjector />
        <ReadySignal loaded={loaded} />
      </Canvas>
    </div>
  );
}

export default memo(ExplorerCanvas);
