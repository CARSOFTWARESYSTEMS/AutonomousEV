"use client";
// The WebGL scene: dusk light, reflections, the shared world, the overlays,
// and a camera director that eases between presets (and flies the intro).
// Loaded as its own chunk; never on the server.
import { memo, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { ACESFilmicToneMapping, Color, Fog, NoToneMapping, PMREMGenerator, SRGBColorSpace, type Texture, Vector3 } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { QualitySettings } from "../../satellite-explorer/lib/capabilities";
import { useTwin } from "../state/store";
import { introClock } from "../intro/introClock";
import { projectLabels } from "./labels";
import { setEnvironment } from "./mutate";
import { DistrictFlows, EnergyFlow, FieldOverlay, IotLayer } from "./overlays";
import { easeView } from "./viewState";
import { City, Ground, HeroVehicle, Highway, ParkingPath, ROAD_Z, Site, Sky, Traffic } from "./world";

type V3 = [number, number, number];
interface Shot {
  pos: V3;
  target: V3;
}

/**
 * The station close-up: square to the field section (which runs through both
 * pad centres along the receiver's offset), so the flux map faces the viewer.
 */
export function padCloseUp(lateral: number, longitudinal: number): Shot {
  const dx = longitudinal;
  const dz = -lateral;
  const phi = Math.hypot(dx, dz) > 1e-3 ? Math.atan2(dz, dx) : -Math.PI / 2;
  // Normal to the section, on the side facing the open end of the bay (+x).
  let nx = -Math.sin(phi);
  let nz = Math.cos(phi);
  if (nx < 0) {
    nx = -nx;
    nz = -nz;
  }
  // Lean toward the open end of the bay so the line of sight passes inside the front wheel track.
  const bx = nx + 0.9;
  const len = Math.hypot(bx, nz);
  const cx = longitudinal / 2;
  const cz = -lateral / 2;
  // Creeper height: between the ground pad (top 0.06 m) and the battery tray (0.19 m), so nothing hides the gap.
  return { pos: [cx + (bx / len) * 3.4, 0.165, cz + (nz / len) * 3.4], target: [cx, 0.115, cz] };
}

/** Camera presets for each environment and close-up view. */
export function presetFor(env: string, view: string, lateral = 0, longitudinal = 0): Shot {
  const close = view === "field" || view === "exploded" || view === "cutaway" || view === "thermal";
  if (env === "station") return close ? padCloseUp(lateral, longitudinal) : view === "energy" || view === "iot" ? { pos: [8.5, 5.2, 9.5], target: [2, 0.6, 0.5] } : { pos: [6.4, 2.6, 7.2], target: [0, 0.6, -0.4] };
  if (env === "dynamic") return close ? { pos: [-7.5, 0.7, ROAD_Z + 6.5], target: [0.6, -0.08, ROAD_Z] } : { pos: [-9, 3.4, ROAD_Z + 9], target: [1.5, 0.4, ROAD_Z] };
  // Low enough to see under the canopy roof into the bay, wide enough for the aisle and the turn.
  if (env === "autonomous") return { pos: [-15.5, 6.2, 9.5], target: [-4.6, 0.4, -4.2] };
  return { pos: [-58, 64, 78], target: [-2, 0, 6] };
}

/** Intro shots: from → to over each scene. */
const INTRO_SHOTS: { from: Shot; to: Shot }[] = [
  // Over the highway corridor (no buildings there) toward the charging site.
  { from: { pos: [-70, 120, 95], target: [0, 0, 2] }, to: { pos: [-24, 30, 42], target: [0, 1, 2] } },
  { from: { pos: [9, 3.6, 7], target: [-1, 0.6, 0] }, to: padCloseUp(0.04, -0.03) },
  { from: { pos: [-22, 7, ROAD_Z + 14], target: [3, 0.4, ROAD_Z] }, to: { pos: [-7.5, 0.7, ROAD_Z + 6.5], target: [0.6, -0.08, ROAD_Z] } },
  { from: { pos: [-20, 10, 12], target: [-8, 0, -8] }, to: { pos: [-15.5, 6.2, 9.5], target: [-4.6, 0.4, -4.2] } },
  { from: { pos: [-14, 14, 20], target: [0, 0, 4] }, to: { pos: [-70, 80, 92], target: [-2, 0, 6] } },
  { from: { pos: [7.5, 2.8, 8], target: [0, 0.6, -0.4] }, to: { pos: [5.2, 2.2, 7.6], target: [0, 0.6, -0.4] } },
];

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp3 = (a: V3, b: V3, t: number, out: Vector3) => out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);

function Director() {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const size = useThree((s) => s.size);
  const goal = useRef<Shot | null>(null);
  const key = useRef("");
  const moving = useRef(false);
  const p = useMemo(() => new Vector3(), []);
  const t = useMemo(() => new Vector3(), []);
  useEffect(() => {
    if (!controls) return;
    const stop = () => {
      moving.current = false;
    };
    controls.addEventListener("start", stop);
    return () => controls.removeEventListener("start", stop);
  }, [controls]);
  useFrame((_, dt) => {
    const s = useTwin.getState();
    easeView(s.view, dt, s.environment);
    if (s.intro.active) {
      const shot = INTRO_SHOTS[Math.min(INTRO_SHOTS.length - 1, s.intro.scene)];
      const k = s.reducedMotion ? 1 : ease(Math.min(1, introClock.progress));
      lerp3(shot.from.pos, shot.to.pos, k, p);
      lerp3(shot.from.target, shot.to.target, k, t);
      camera.position.copy(p);
      if (controls) {
        controls.target.copy(t);
        controls.update();
      } else camera.lookAt(t);
      key.current = "";
    } else {
      const k = `${s.environment}|${s.view}|${s.revision}`;
      if (k !== key.current) {
        key.current = k;
        goal.current = presetFor(s.environment, s.view, s.station.lateral, s.station.longitudinal);
        moving.current = true;
      }
      if (moving.current && goal.current && controls) {
        const r = 1 - Math.exp(-3.2 * dt);
        camera.position.lerp(p.set(...goal.current.pos), r);
        controls.target.lerp(t.set(...goal.current.target), r);
        controls.update();
        if (camera.position.distanceTo(p) < 0.01 && controls.target.distanceTo(t) < 0.01) moving.current = false;
      }
    }
    projectLabels(camera, size.width, size.height);
  });
  return null;
}

function Lighting({ shadows, mapSize }: { shadows: boolean; mapSize: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const env = useRef<Texture | null>(null);
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const rt = pmrem.fromScene(new RoomEnvironment(), 0.04);
    env.current = rt.texture;
    setEnvironment(scene, rt.texture, 0.55, new Fog(new Color("#3a3240"), 60, 330));
    return () => {
      setEnvironment(scene, null, 1, null);
      rt.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return (
    <>
      <hemisphereLight args={["#9db8ff", "#3a2a20", 0.55]} />
      <directionalLight
        position={[-24, 14, 18]}
        intensity={2.1}
        color="#ffc896"
        castShadow={shadows}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[16, 10, -12]} intensity={0.55} color="#a8c4ff" />
      {/* Canopy down-lights over the bays. */}
      <pointLight position={[-0.5, 2.9, 0]} intensity={9} distance={9} decay={2} color="#fff0dc" />
      <pointLight position={[-0.5, 2.9, -5.4]} intensity={7} distance={9} decay={2} color="#fff0dc" />
    </>
  );
}

function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 4) useTwin.setState({ sceneReady: true });
  });
  return null;
}

function Effects({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.25} intensity={0.75} radius={0.65} />
      <Vignette eskil={false} offset={0.22} darkness={0.55} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

function TwinScene({ quality, label }: { quality: QualitySettings; label: string }) {
  const press = useRef({ x: 0, y: 0 });
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
        dpr={quality.dpr}
        shadows={quality.shadows ? "percentage" : false}
        gl={{ antialias: !quality.postprocessing, alpha: false, powerPreference: "high-performance", stencil: false }}
        camera={{ fov: 36, near: 0.05, far: 900, position: [6.4, 2.6, 7.2] }}
        onCreated={({ gl }) => {
          gl.setClearColor("#05070c", 1);
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = quality.postprocessing ? NoToneMapping : ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        onPointerMissed={(e) => {
          if (Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 5) return;
          if (!useTwin.getState().intro.active) useTwin.getState().select(null);
        }}
      >
        <Lighting shadows={quality.shadows} mapSize={quality.shadowMapSize} />
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
        <DistrictFlows />
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={0.6} maxDistance={260} maxPolarAngle={Math.PI * 0.495} enablePan />
        <Director />
        <Effects enabled={quality.postprocessing} />
        <ReadySignal />
      </Canvas>
    </div>
  );
}

export default memo(TwinScene);
