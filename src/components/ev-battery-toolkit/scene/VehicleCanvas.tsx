"use client";
// The Vehicle Battery Locator's scene: the generic scooter with a battery block
// where the chosen architecture puts it. Locating turns the body to x-ray,
// lights the battery and moves the camera to it.
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ARCHITECTURES } from "@/data/ev-battery-toolkit/architectures";
import type { ArchitectureId } from "@/lib/ev-battery-toolkit/types";
import CameraRig from "./CameraRig";
import ScooterModel, { BATTERY_MOUNT, LocatorBattery } from "./ScooterModel";
import { COLOR } from "./palette";
import css from "../workspace.module.css";

type Vec3 = [number, number, number];

export interface VehicleCanvasProps {
  label: string;
  describedBy: string;
  architecture: ArchitectureId | null;
  located: boolean;
  xray: boolean;
  isolate: boolean;
  reducedMotion: boolean;
  onLost: () => void;
}

const HOME = { position: [13, 9, 16] as Vec3, target: [0, 4.2, 0] as Vec3 };

export default function VehicleCanvas({ label, describedBy, architecture, located, xray, isolate, reducedMotion, onLost }: VehicleCanvasProps) {
  const arch = architecture ? ARCHITECTURES[architecture] : null;
  const mount = arch ? BATTERY_MOUNT[arch.location] : null;
  const focus = useMemo(() => (mount ? { position: [mount[0] + 6, mount[1] + 4.5, mount[2] + 8] as Vec3, target: mount } : undefined), [mount]);
  return (
    <div className={css.canvas} role="img" aria-label={label} aria-describedby={describedBy}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.75]}
        camera={{ fov: 35, near: 0.1, far: 300, position: HOME.position }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(COLOR.background, 1);
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onLost();
          });
        }}
      >
        <ambientLight intensity={0.85} />
        <hemisphereLight args={["#dbe4ff", "#1a2240", 0.7]} />
        <directionalLight position={[8, 14, 10]} intensity={1.6} />
        <directionalLight position={[10, 4, 16]} intensity={0.55} />
        <directionalLight position={[-10, 6, -8]} intensity={0.35} color="#93c5fd" />
        <gridHelper args={[40, 40, "#1c2540", "#121a30"]} />
        {!isolate ? <ScooterModel xray={xray || located} edges={xray || located} /> : null}
        {arch && mount ? <LocatorBattery size={arch.dimensions} position={mount} located={located} /> : null}
        <OrbitControls makeDefault enableDamping={!reducedMotion} minDistance={4} maxDistance={40} target={HOME.target} />
        <CameraRig channel="locator" home={HOME} focus={focus} minDistance={4} maxDistance={40} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
