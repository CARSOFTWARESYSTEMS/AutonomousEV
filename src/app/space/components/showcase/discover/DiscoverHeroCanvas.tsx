"use client";
// The Discover hero's 3D scene: the Space Academy's 1U CubeSat (Mission 1's
// own model) large in the frame, Earth small and softly lit behind it, under
// a quiet navy sky. The timeline drives four stages; the learner can orbit,
// zoom within limits, and select parts at any time. Loaded lazily.
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { Stars } from "@react-three/drei/core/Stars";
import { QuadraticBezierCurve3, SRGBColorSpace, Vector3, type Group, type Mesh } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CubeSatModel } from "@/components/space-academy/missions/cubesat/CubeSatScene";
import type { PartId } from "@/components/space-academy/missions/cubesat/model";
import { LabelContext, LabelOverlay, LabelProjector, useLabelRegistry } from "@/components/space-academy/viewer/labels";
import vstyles from "@/components/space-academy/viewer/viewer.module.css";
import { Nebula } from "../SpaceBackdrop";
import RealEarth from "@/components/space-3d/RealEarth";
import { STAGE_SECONDS, type StageId, type Timeline } from "./timeline";

const SUN: [number, number, number] = [-140, 70, 90];

export interface ViewHandle {
  reset: () => void;
}

/** Advances the timeline; gently turns and "approaches" the satellite in stage 1 (and backs off at the loop's end, so it loops smoothly). */
function Director({ timeline, playing, reducedMotion, draggingRef, children }: { timeline: Timeline; playing: boolean; reducedMotion: boolean; draggingRef: { current: boolean }; children: React.ReactNode }) {
  const group = useRef<Group>(null);
  const { invalidate } = useThree();
  useEffect(() => timeline.setFrameRequester(invalidate), [timeline, invalidate]);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (playing) timeline.advance(dt);
    const g = group.current;
    if (!g) return;
    if (playing && !draggingRef.current && !reducedMotion) g.rotation.y += 0.16 * dt;
    // Stage 1: approach from 82% to full size; last second of stage 4: ease back, ready to loop.
    let scale = 1;
    if (!reducedMotion) {
      const i = timeline.index;
      const t = timeline.local;
      if (i === 0) scale = 0.82 + 0.18 * (1 - Math.pow(1 - Math.min(1, t / 3), 3));
      else if (i === 3 && t > STAGE_SECONDS - 1) scale = 1 - 0.18 * Math.min(1, t - (STAGE_SECONDS - 1));
    }
    g.scale.setScalar(scale);
  });
  return <group ref={group}>{children}</group>;
}

/** Stage 3: energy from the solar wings, through the power board, into the battery (the direction of energy flow in sunlight). */
function EnergyFlow({ playing }: { playing: boolean }) {
  const dots = useRef<(Mesh | null)[]>([]);
  const t = useRef(0);
  // Exploded positions (see the CubeSat layout): wings out at ±16.6 x, 9.65 z; power board (EPS) at y −2.4; battery at y −6.4.
  const paths = useMemo(
    () =>
      [1, -1].flatMap((side) => [
        new QuadraticBezierCurve3(new Vector3(side * 16.6, 0, 9.65), new Vector3(side * 7, 3, 7), new Vector3(0, -2.4, 0)),
        new QuadraticBezierCurve3(new Vector3(side * 12, 2, 9.65), new Vector3(side * 5, 4, 5), new Vector3(0, -2.4, 0)),
      ]),
    [],
  );
  const toBattery = useMemo(() => new QuadraticBezierCurve3(new Vector3(0, -2.4, 0), new Vector3(0.8, -4.4, 1.2), new Vector3(0, -6.4, 0)), []);
  const N = 18;
  const point = useMemo(() => new Vector3(), []);
  useFrame((_, delta) => {
    if (playing) t.current += Math.min(delta, 0.05) * 0.45;
    for (let i = 0; i < N; i++) {
      const m = dots.current[i];
      if (!m) continue;
      const phase = (t.current + i / N) % 1;
      // First 70% of the trip: wing to power board; the rest: power board to battery.
      if (phase < 0.7) paths[i % paths.length].getPoint(phase / 0.7, point);
      else toBattery.getPoint((phase - 0.7) / 0.3, point);
      m.position.copy(point);
    }
  });
  return (
    <group>
      {Array.from({ length: N }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            dots.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.32, 10, 8]} />
          <meshBasicMaterial color="#fcd34d" transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Controls({ viewRef, draggingRef }: { viewRef: { current: ViewHandle | null }; draggingRef: { current: boolean } }) {
  const ref = useRef<OrbitControlsImpl>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.saveState();
    viewRef.current = { reset: () => c.reset() };
    const start = () => {
      draggingRef.current = true;
    };
    const end = () => {
      draggingRef.current = false;
    };
    c.addEventListener("start", start);
    c.addEventListener("end", end);
    return () => {
      c.removeEventListener("start", start);
      c.removeEventListener("end", end);
    };
  }, [viewRef, draggingRef]);
  return <OrbitControls ref={ref} makeDefault enablePan={false} minDistance={24} maxDistance={70} rotateSpeed={0.7} zoomSpeed={0.6} enableDamping dampingFactor={0.12} />;
}

const LABELS: { id: PartId; text: string }[] = [
  { id: "panels", text: "Solar panels" },
  { id: "battery", text: "Battery" },
  { id: "obc", text: "Flight computer" },
  { id: "adcs", text: "Sensors" },
  { id: "antenna", text: "Antenna" },
];

interface Props {
  timeline: Timeline;
  stage: StageId;
  playing: boolean;
  reducedMotion: boolean;
  quality: "high" | "low";
  compact: boolean;
  exploded: boolean;
  selected: PartId | null;
  onSelect: (id: PartId) => void;
  viewRef: { current: ViewHandle | null };
  onReady: () => void;
}

export default function DiscoverHeroCanvas({ timeline, stage, playing, reducedMotion, quality, compact, exploded, selected, onSelect, viewRef, onReady }: Props) {
  const registry = useLabelRegistry();
  const draggingRef = useRef(false);
  const highlighted: PartId[] = stage === "experiment" ? ["eps", "battery"] : stage === "mission" ? ["obc", "radio", "antenna"] : [];
  // Labels in Explore, or the one part the learner picked; on a phone only the picked one, so labels never cover the model.
  const labels = selected ? [{ id: selected, text: LABELS.find((l) => l.id === selected)?.text ?? "", active: true }] : stage === "explore" && !compact ? LABELS.map((l) => ({ ...l, active: false })) : [];
  return (
    <LabelContext.Provider value={registry}>
      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas
          frameloop={playing ? "always" : "demand"}
          dpr={quality === "low" ? 1 : [1, compact ? 1.5 : 1.75]}
          gl={{ antialias: true, alpha: false, powerPreference: "low-power", stencil: false }}
          camera={{ position: compact ? [24, 11, 44] : [21, 10, 36], fov: 38, near: 0.5, far: 800 }}
          onCreated={({ gl }) => {
            gl.setClearColor("#02040b", 1);
            gl.outputColorSpace = SRGBColorSpace;
            onReady();
          }}
          aria-hidden="true"
        >
          <hemisphereLight args={["#c7d2fe", "#0b1026", 0.55]} />
          <directionalLight position={SUN} intensity={3} color="#fff4e0" />
          <directionalLight position={[30, -10, 40]} intensity={0.9} color="#93c5fd" />
          <directionalLight position={[-20, 20, -40]} intensity={0.7} color="#a78bfa" />
          <Nebula />
          <Stars radius={260} depth={50} count={1800} factor={3.2} saturation={0} fade speed={playing ? 0.3 : 0} />
          <RealEarth radius={22} position={[-6, -65, -141]} sun={SUN} playing={playing} />
          <Controls viewRef={viewRef} draggingRef={draggingRef} />
          <LabelProjector />
          <Director timeline={timeline} playing={playing} reducedMotion={reducedMotion} draggingRef={draggingRef}>
            <CubeSatModel exploded={exploded} reducedMotion={reducedMotion} solar="wings" selected={selected} highlighted={highlighted} onSelect={onSelect} />
            {stage === "experiment" && exploded && <EnergyFlow playing={playing} />}
          </Director>
        </Canvas>
        <LabelOverlay labels={labels} className={vstyles.label3d} activeClassName={vstyles.label3dActive} />
      </div>
    </LabelContext.Provider>
  );
}
