"use client";
// The WebGL stage every Academy mission shares. Lives in the missions' lazy
// 3D chunk only, so three.js never loads for a visitor who stays in 2D.
//
// GPU use is kept low on purpose: the frame loop runs on demand (a frame is
// drawn only when the camera moves or a part animates), the pixel ratio is
// capped, there are no shadows or post-processing, and geometry is procedural
// and low-poly.
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { SRGBColorSpace, Spherical, Vector3, MathUtils, type Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { SceneState, StageQuality } from "./controller";
import { LabelContext, LabelOverlay, LabelProjector, useLabelRegistry } from "./labels";
import vstyles from "./viewer.module.css";

/** Set by the viewer: the quality the learner chose (or Auto resolved). Read here so mission scenes need not pass it. */
export const StageQualityContext = createContext<StageQuality>("high");

interface StageProps extends Pick<SceneState, "controller" | "reducedMotion" | "compact" | "onContextLost"> {
  children: React.ReactNode;
  cameraPosition: [number, number, number];
  target?: [number, number, number];
  minDistance: number;
  maxDistance: number;
  fov?: number;
  /** Labels to draw over the canvas; each id matches an anchor registered by a part. */
  labels?: { id: string; text: string; active?: boolean }[];
  /** Position of the key light (the Sun, where a scene shows one). */
  keyLight?: [number, number, number];
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function CameraBridge({ controller, home, target, minDistance, maxDistance, reducedMotion }: { controller: SceneState["controller"]; home: Vector3; target: Vector3; minDistance: number; maxDistance: number; reducedMotion: boolean }) {
  const { camera, controls, invalidate } = useThree();
  // A guided camera move in progress: eased over ~0.9 s, cancelled as soon as the learner drags.
  const tween = useRef<{ fromPos: Vector3; toPos: Vector3; fromTarget: Vector3; toTarget: Vector3; t: number } | null>(null);
  useFrame((_, delta) => {
    const tw = tween.current;
    const orbit = controls as unknown as OrbitControlsImpl | null;
    if (!tw || !orbit) return;
    tw.t = Math.min(1, tw.t + Math.min(delta, 0.05) / 0.9);
    const e = easeInOut(tw.t);
    camera.position.lerpVectors(tw.fromPos, tw.toPos, e);
    orbit.target.lerpVectors(tw.fromTarget, tw.toTarget, e);
    orbit.update();
    if (tw.t >= 1) tween.current = null;
    else invalidate();
  });
  useEffect(() => {
    const orbit = controls as unknown as OrbitControlsImpl | null;
    const cancel = () => {
      tween.current = null;
    };
    orbit?.addEventListener("start", cancel);
    const unregister = controller.register({
      focus(point, distance, direction) {
        if (!orbit) return;
        const toTarget = new Vector3(...point);
        const dir = direction ? new Vector3(...direction).normalize() : camera.position.clone().sub(orbit.target).normalize();
        const length = MathUtils.clamp(distance ?? camera.position.distanceTo(orbit.target), minDistance, maxDistance);
        const toPos = toTarget.clone().add(dir.multiplyScalar(length));
        if (reducedMotion) {
          tween.current = null;
          orbit.target.copy(toTarget);
          camera.position.copy(toPos);
          orbit.update();
          invalidate();
          return;
        }
        tween.current = { fromPos: camera.position.clone(), toPos, fromTarget: orbit.target.clone(), toTarget, t: 0 };
        invalidate();
      },
      zoom(factor) {
        if (!orbit) return;
        const offset = camera.position.clone().sub(orbit.target);
        const length = MathUtils.clamp(offset.length() / factor, minDistance, maxDistance);
        camera.position.copy(orbit.target).add(offset.setLength(length));
        orbit.update();
        invalidate();
      },
      rotate(degrees) {
        if (!orbit) return;
        const offset = camera.position.clone().sub(orbit.target);
        const s = new Spherical().setFromVector3(offset);
        s.theta += MathUtils.degToRad(degrees);
        camera.position.copy(orbit.target).add(new Vector3().setFromSpherical(s));
        orbit.update();
        invalidate();
      },
      reset() {
        if (!orbit) return;
        if (!reducedMotion) {
          tween.current = { fromPos: camera.position.clone(), toPos: home.clone(), fromTarget: orbit.target.clone(), toTarget: target.clone(), t: 0 };
          invalidate();
          return;
        }
        orbit.target.copy(target);
        camera.position.copy(home);
        orbit.update();
        invalidate();
      },
    });
    return () => {
      orbit?.removeEventListener("start", cancel);
      unregister();
    };
  }, [camera, controls, controller, home, target, invalidate, minDistance, maxDistance, reducedMotion]);
  return null;
}

/**
 * Eases a group toward a position; requests frames only while it is moving.
 * Starts at `from` when given (a part flying into place), otherwise at the goal.
 * Never pass the same group a JSX `position`, or each render would reset it.
 */
export function useEasedPosition(ref: React.RefObject<Group | null>, to: [number, number, number], reducedMotion: boolean, from?: [number, number, number], speed = 7) {
  const goal = useRef(new Vector3(...to));
  const started = useRef(false);
  const { invalidate } = useThree();
  const key = to.join(",");
  useEffect(() => {
    const [x, y, z] = key.split(",").map(Number);
    goal.current.set(x, y, z);
    invalidate();
  }, [key, invalidate]);
  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    if (!started.current) {
      started.current = true;
      g.position.copy(from && !reducedMotion ? new Vector3(...from) : goal.current);
      state.invalidate();
      return;
    }
    const d = g.position.distanceTo(goal.current);
    if (d < 0.001) return;
    if (reducedMotion) g.position.copy(goal.current);
    else g.position.lerp(goal.current, 1 - Math.exp(-speed * Math.min(delta, 0.05)));
    state.invalidate();
  });
}

export default function Stage3D({ children, controller, reducedMotion, compact, onContextLost, cameraPosition, target = [0, 0, 0], minDistance, maxDistance, fov = 40, labels = [], keyLight = [30, 40, 25] }: StageProps) {
  const quality = useContext(StageQualityContext);
  // Fixed for the stage's lifetime: the view Reset returns to.
  const [home] = useState(() => new Vector3(...cameraPosition));
  const [look] = useState(() => new Vector3(...target));
  const registry = useLabelRegistry();
  // The renderer releases its context on purpose when the stage unmounts (switching to 2D);
  // only a loss while the stage is still mounted is a real failure.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return (
    <LabelContext.Provider value={registry}>
      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas
          frameloop="demand"
          dpr={quality === "low" ? 1 : [1, compact ? 1.5 : 1.75]}
          gl={{ antialias: true, alpha: false, powerPreference: "default", stencil: false }}
          camera={{ position: cameraPosition, fov, near: 0.5, far: 2000 }}
          onCreated={({ gl }) => {
            gl.setClearColor("#070917", 1);
            gl.outputColorSpace = SRGBColorSpace;
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              if (!mounted.current) return;
              e.preventDefault();
              onContextLost();
            });
            // For measuring time to the first meaningful interaction.
            performance.mark?.("space-academy:viewer-3d-ready");
          }}
        >
          <hemisphereLight args={["#dbe4ff", "#141833", 1.1]} />
          <directionalLight position={keyLight} intensity={2.4} />
          <directionalLight position={[-25, -10, -30]} intensity={0.6} color="#67e8f9" />
          <OrbitControls
            makeDefault
            target={target}
            enablePan={false}
            enableDamping={!reducedMotion}
            dampingFactor={0.12}
            minDistance={minDistance}
            maxDistance={maxDistance}
            rotateSpeed={0.8}
          />
          <CameraBridge controller={controller} home={home} target={look} minDistance={minDistance} maxDistance={maxDistance} reducedMotion={reducedMotion} />
          <LabelProjector />
          {children}
        </Canvas>
        <LabelOverlay labels={labels} className={vstyles.label3d} activeClassName={vstyles.label3dActive} />
      </div>
    </LabelContext.Provider>
  );
}
