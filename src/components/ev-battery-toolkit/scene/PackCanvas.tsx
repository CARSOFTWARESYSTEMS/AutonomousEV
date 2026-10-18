"use client";
// The 3D Battery Explorer's scene: the pack on its own or inside the generic
// scooter. A separate chunk, loaded only on a desktop-sized viewport with
// WebGL. Frames are drawn on demand, so an idle scene costs nothing.
import { memo, Suspense, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ARCHITECTURES } from "@/data/ev-battery-toolkit/architectures";
import { layoutPack } from "@/lib/ev-battery-toolkit/pack";
import type { ComponentId } from "@/lib/ev-battery-toolkit/types";
import { useSimulation, useToolkit } from "../state/store";
import CameraRig, { ExplodeDriver } from "./CameraRig";
import GltfAsset from "./GltfAsset";
import { MODEL_REGISTRY, packAssetFor } from "./modelRegistry";
import PackModel from "./PackModel";
import ScooterModel, { BATTERY_MOUNT } from "./ScooterModel";
import { COLOR } from "./palette";
import css from "../workspace.module.css";

type Vec3 = [number, number, number];

export interface PackCanvasProps {
  label: string;
  describedBy: string;
  showScooter: boolean;
  reducedMotion: boolean;
  onSelect: (id: ComponentId, group?: number) => void;
  onLost: () => void;
}

function PackCanvas({ label, describedBy, showScooter, reducedMotion, onSelect, onLost }: PackCanvasProps) {
  const { pack, fault, result } = useSimulation();
  const layout = useMemo(() => layoutPack(pack), [pack]);
  const view = useToolkit((s) => s.view);
  const xray = useToolkit((s) => s.xray);
  const exploded = useToolkit((s) => s.exploded);
  const selected = useToolkit((s) => s.selected);
  const highlightGroup = useToolkit((s) => s.highlightGroup);
  const faultMode = useToolkit((s) => s.faultMode);
  const revealed = useToolkit((s) => s.revealed);
  const explode = useRef(0);
  const architecture = ARCHITECTURES[pack.config.architecture];
  const asset = MODEL_REGISTRY[packAssetFor(architecture.id)];

  // A fault's location is only drawn when the fault is known; an unknown fault must be found from evidence.
  const faultComponents = fault && (faultMode === "known" || revealed) ? (fault.effects.components ?? []) : [];

  const [ex, ey, ez] = layout.enclosure;
  const mount: Vec3 = showScooter ? BATTERY_MOUNT[architecture.location] : [0, 0, 0];
  const camera = useMemo(() => {
    if (showScooter) return { home: { position: [12, 9.5, 15] as Vec3, target: [0, 4, 0] as Vec3 }, min: 4, max: 40 };
    const d = Math.max(ex, ez, ey * 1.6) * 1.35 + 2.4;
    return { home: { position: [d * 0.72, d * 0.62, d * 0.95] as Vec3, target: [0, 0, 0] as Vec3 }, min: 1.6, max: d * 3 };
  }, [showScooter, ex, ey, ez]);

  const press = useRef({ x: 0, y: 0 });

  return (
    <div
      className={css.canvas}
      role="img"
      aria-label={label}
      aria-describedby={describedBy}
      onPointerDown={(e) => {
        press.current = { x: e.clientX, y: e.clientY };
      }}
    >
      <Canvas
        frameloop="demand"
        dpr={[1, 1.75]}
        camera={{ fov: 35, near: 0.05, far: 300, position: camera.home.position }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(COLOR.background, 1);
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onLost();
          });
        }}
        onPointerMissed={(event) => {
          if (Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 5) return;
          useToolkit.getState().select(null);
          useToolkit.getState().setHighlightGroup(null);
        }}
      >
        <ambientLight intensity={0.85} />
        <hemisphereLight args={["#dbe4ff", "#1a2240", 0.7]} />
        <directionalLight position={[6, 12, 8]} intensity={1.6} />
        <directionalLight position={[10, 4, 14]} intensity={0.55} />
        <directionalLight position={[-8, 5, -6]} intensity={0.35} color="#93c5fd" />
        <gridHelper args={[showScooter ? 40 : 16, showScooter ? 40 : 32, "#1c2540", "#121a30"]} position={[0, showScooter ? 0 : -ey / 2 - 0.35, 0]} />
        {showScooter ? <ScooterModel xray edges /> : null}
        <group position={mount} rotation={[0, architecture.orientation, 0]}>
          {asset.kind === "gltf" ? (
            <Suspense fallback={null}>
              <GltfAsset url={asset.url} nodes={asset.nodes} onSelect={onSelect} />
            </Suspense>
          ) : (
            <PackModel
              pack={pack}
              layout={layout}
              sim={result}
              architecture={architecture}
              view={view}
              xray={xray || showScooter}
              explode={explode}
              exploded={exploded}
              selected={selected}
              highlightGroup={highlightGroup}
              faultComponents={faultComponents}
              swelling={fault?.id === "swelling"}
              reducedMotion={reducedMotion}
              onSelect={onSelect}
            />
          )}
        </group>
        <OrbitControls makeDefault enableDamping={!reducedMotion} minDistance={camera.min} maxDistance={camera.max} target={camera.home.target} />
        <CameraRig channel="workspace" home={camera.home} homeKey={showScooter ? "scooter" : "pack"} minDistance={camera.min} maxDistance={camera.max} reducedMotion={reducedMotion} />
        <ExplodeDriver amountRef={explode} target={exploded ? 1 : 0} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}

/** Memoised: the workspace re-renders on every control; the scene reads the store itself. */
export default memo(PackCanvas);
