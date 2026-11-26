"use client";
// The WebGL scene: light and reflections, the shared world, the charging
// site, the overlays, the camera rig and the selection highlight. Loaded as
// its own chunk, never on the server. Rendering quality (pixel ratio, shadows,
// post-processing) changes how the scene is drawn, never what is computed.
import { memo, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { AgXToneMapping, NoToneMapping, SRGBColorSpace, Vector3, type WebGLRenderer } from "three";
import { runtime } from "../state/runtime";
import { useTwin } from "../state/store";
import { CameraRig } from "./camera";
import { Highlighter } from "./highlight";
import { projectLabels } from "./labels";
import { AlignmentOverlay, DistrictFlows, EnergyFlow, FieldOverlay, IotLayer } from "./overlays";
import { Lighting } from "./stage";
import { Site } from "./station/Site";
import { easeView } from "./viewState";
import { City, Ground, HeroVehicle, Highway, ParkingPath, Sky, Traffic } from "./world";

export interface RenderSettings {
  /** Largest pixel ratio to render at. */
  dpr: number;
  shadows: boolean;
  shadowMapSize: number;
  postprocessing: boolean;
  /** Lower the pixel ratio when the frame rate drops (Auto quality). */
  adaptive: boolean;
}

/** Eases the view channels and projects the DOM labels, once a frame. */
const scratch = new Vector3();

function ViewDriver() {
  const size = useThree((s) => s.size);
  useFrame(({ camera }, dt) => {
    const s = useTwin.getState();
    const v = runtime.station.state.vehicle;
    const occupied = s.environment === "station" && v.present && Math.abs(v.x + 0.6 - s.station.longitudinal) < 1.2;
    easeView(s.view, Math.min(dt, 0.1), s.environment, occupied, s.reducedMotion);
    projectLabels(camera, size.width, size.height, scratch);
  });
  return null;
}

function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 4) useTwin.setState({ sceneReady: true });
  });
  return null;
}

/** Tone mapping lives in the post-processing chain when there is one, in the renderer otherwise. */
function ToneMapper({ post }: { post: boolean }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => setToneMapping(gl, post), [gl, post]);
  return null;
}
function setToneMapping(gl: WebGLRenderer, post: boolean) {
  gl.toneMapping = post ? NoToneMapping : AgXToneMapping;
  gl.toneMappingExposure = post ? 1 : 1.05;
}

function Effects() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.2} intensity={0.38} radius={0.55} />
      <Vignette eskil={false} offset={0.3} darkness={0.38} />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  );
}

/** Context loss: wait briefly for the browser to restore it, then fall back to the 2D view. Ignores R3F's own loss on unmount. */
function ContextGuard() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    let mounted = true;
    let timer = 0;
    const lost = (e: Event) => {
      e.preventDefault();
      if (!mounted) return;
      timer = window.setTimeout(() => {
        if (mounted) useTwin.setState({ contextLost: true });
      }, 2500);
    };
    const restored = () => window.clearTimeout(timer);
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => {
      mounted = false;
      window.clearTimeout(timer);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, [gl]);
  return null;
}

function TwinScene({ settings, label, active }: { settings: RenderSettings; label: string; active: boolean }) {
  const press = useRef({ x: 0, y: 0 });
  const [dpr, setDpr] = useState(settings.dpr);
  const [ceiling, setCeiling] = useState(settings.dpr);
  // A new quality choice resets the adaptive pixel ratio to that choice's ceiling.
  if (ceiling !== settings.dpr) {
    setCeiling(settings.dpr);
    setDpr(settings.dpr);
  }
  useEffect(() => () => useTwin.setState({ sceneReady: false }), []);
  return (
    <div
      role="img"
      aria-label={label}
      style={{ position: "absolute", inset: 0 }}
      onPointerDown={(e) => {
        press.current = { x: e.clientX, y: e.clientY };
      }}
    >
      <Canvas
        dpr={dpr}
        frameloop={active ? "always" : "never"}
        shadows={settings.shadows ? "percentage" : false}
        gl={{ antialias: !settings.postprocessing, alpha: false, powerPreference: "high-performance", stencil: false }}
        camera={{ fov: 34, near: 0.03, far: 900, position: [9, 4, 12] }}
        onCreated={({ gl, scene }) => {
          // Development only: the scene graph for inspection scripts.
          if (process.env.NODE_ENV !== "production") (window as unknown as { __wevctScene?: unknown }).__wevctScene = scene;
          gl.setClearColor("#05070c", 1);
          gl.outputColorSpace = SRGBColorSpace;
          setToneMapping(gl, settings.postprocessing);
        }}
        onPointerMissed={(e) => {
          if (Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 5) return;
          if (!useTwin.getState().demo.active) useTwin.getState().select(null);
        }}
      >
        {settings.adaptive && <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, +(d * 0.8).toFixed(2)))} onIncline={() => setDpr((d) => Math.min(settings.dpr, +(d * 1.12).toFixed(2)))} />}
        <Lighting shadows={settings.shadows} mapSize={settings.shadowMapSize} />
        <Sky />
        <Ground />
        <City />
        <Site />
        <HeroVehicle />
        <ParkingPath />
        <Highway />
        <Traffic />
        <FieldOverlay />
        <EnergyFlow />
        <IotLayer />
        <AlignmentOverlay />
        <DistrictFlows />
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} enablePan screenSpacePanning />
        <CameraRig />
        <Highlighter />
        <ViewDriver />
        <ToneMapper post={settings.postprocessing} />
        <ContextGuard />
        {settings.postprocessing && <Effects />}
        <ReadySignal />
      </Canvas>
    </div>
  );
}

export default memo(TwinScene);
