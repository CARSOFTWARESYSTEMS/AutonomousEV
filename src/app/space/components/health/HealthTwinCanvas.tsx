"use client";
// The mission-health twin's 3D scene: the Space Academy's 1U CubeSat, opened
// up with its solar wings deployed, slowly turning. The subsystems a stage
// involves glow, and their simulated telemetry rides on labels anchored to
// the parts. Loaded lazily, in the browser only.
import { Canvas } from "@react-three/fiber";
import { SRGBColorSpace } from "three";
import { CubeSatModel } from "@/components/space-academy/missions/cubesat/CubeSatScene";
import { LabelContext, LabelOverlay, LabelProjector, useLabelRegistry } from "@/components/space-academy/viewer/labels";
import Turntable from "../showcase/Turntable";
import type { Spin } from "../showcase/spin";
import type { PartId } from "./scenario";
import styles from "./health.module.css";

interface Props {
  highlighted: PartId[];
  chips: { part: PartId; text: string }[];
  playing: boolean;
  reducedMotion: boolean;
  quality: "high" | "low";
  spin: Spin;
  onReady: () => void;
}

export default function HealthTwinCanvas({ highlighted, chips, playing, reducedMotion, quality, spin, onReady }: Props) {
  const registry = useLabelRegistry();
  return (
    <LabelContext.Provider value={registry}>
      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas
          frameloop={playing ? "always" : "demand"}
          dpr={quality === "low" ? 1 : [1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power", stencil: false }}
          camera={{ position: [36, 20, 44], fov: 38, near: 0.5, far: 400 }}
          onCreated={({ gl, camera }) => {
            gl.outputColorSpace = SRGBColorSpace;
            camera.lookAt(0, 1, 0);
            onReady();
          }}
          style={{ touchAction: "pan-y" }}
          aria-hidden="true"
        >
          <hemisphereLight args={["#dbe4ff", "#141833", 1.05]} />
          <directionalLight position={[30, 40, 25]} intensity={2.3} />
          <directionalLight position={[-25, -10, -30]} intensity={0.5} color="#67e8f9" />
          <LabelProjector />
          <Turntable spin={spin} playing={playing} reducedMotion={reducedMotion} rate={0.1}>
            <CubeSatModel exploded reducedMotion={reducedMotion} solar="wings" highlighted={highlighted} />
          </Turntable>
        </Canvas>
        <LabelOverlay labels={chips.map((c) => ({ id: c.part, text: c.text, active: true }))} className={styles.chip} activeClassName={styles.chipActive} />
      </div>
    </LabelContext.Provider>
  );
}
