"use client";
// Light and reflections. A studio sky generated in the browser (a blue-hour
// gradient and three soft boxes) is prefiltered into the reflection map, so
// paint, glass and metal carry controlled highlights; nothing is downloaded.
// One cool key light with soft shadows follows the active environment, a warm
// fill holds the shadows, and the canopy's downlights warm the charging bay.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BackSide, Color, type DirectionalLight, Fog, Mesh, MeshBasicMaterial, type Object3D, PlaneGeometry, PMREMGenerator, Scene, ShaderMaterial, SphereGeometry } from "three";
import { useTwin } from "../state/store";
import { setEnvironment, setFog } from "./mutate";
import { view } from "./viewState";
import { ROAD_Z } from "./road/layout";

/** The reflection environment: gradient sky and soft boxes, in linear HDR. */
function studioSky(): Scene {
  const scene = new Scene();
  const sky = new Mesh(
    new SphereGeometry(100, 48, 24),
    new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      uniforms: { top: { value: new Color("#243656").multiplyScalar(1.1) }, horizon: { value: new Color("#b59a8a").multiplyScalar(1.25) }, ground: { value: new Color("#2a2826") } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "uniform vec3 top; uniform vec3 horizon; uniform vec3 ground; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(horizon, top, smoothstep(0.0, 0.55, h)) : mix(horizon * 0.6, ground, smoothstep(0.0, 0.25, -h)); gl_FragColor = vec4(c, 1.0); }",
    }),
  );
  scene.add(sky);
  const box = (w: number, h: number, intensity: number, tint: string, place: (o: Object3D) => void) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color(tint).multiplyScalar(intensity), side: 2 }));
    place(m);
    scene.add(m);
  };
  // Overhead soft box (the long highlight along roofs and hoods).
  box(90, 26, 1.7, "#f4f7ff", (o) => {
    o.position.set(0, 70, 0);
    o.rotation.x = Math.PI / 2;
  });
  // Key-side strip and a warm rim strip.
  box(26, 50, 1.7, "#eef3ff", (o) => {
    o.position.set(-85, 20, 30);
    o.lookAt(0, 10, 0);
  });
  box(8, 44, 1.2, "#ffd9b8", (o) => {
    o.position.set(70, 18, -50);
    o.lookAt(0, 10, 0);
  });
  return scene;
}

const FOG_DAY = new Color("#2e3442");
const FOG_STUDIO = new Color("#05070b");
const fogColor = new Color();

/** Shadow-camera centre for each environment. */
const FOCUS: Record<string, [number, number, number]> = {
  station: [0.3, 0, -1.2],
  dynamic: [2, 0, ROAD_Z],
  autonomous: [-5, 0, -3],
  infrastructure: [0, 0, 4],
};

export function Lighting({ shadows, mapSize }: { shadows: boolean; mapSize: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const key = useRef<DirectionalLight>(null);
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = studioSky();
    const rt = pmrem.fromScene(env, 0.035);
    setEnvironment(scene, rt.texture, 0.62, new Fog(new Color("#2e3442"), 70, 360));
    return () => {
      setEnvironment(scene, null, 1, null);
      rt.dispose();
      pmrem.dispose();
      env.traverse((o) => {
        const m = o as Mesh;
        m.geometry?.dispose();
        (m.material as MeshBasicMaterial | undefined)?.dispose?.();
      });
    };
  }, [gl, scene]);
  useFrame(({ scene: sc }) => {
    // Inspection views close the fog in to a dark studio around the subject.
    const fog = sc.fog as Fog | null;
    if (fog) setFog(fog, fogColor.copy(FOG_DAY).lerp(FOG_STUDIO, view.studio), 70 - 62 * view.studio, 360 - 330 * view.studio);
    const k = key.current;
    if (!k) return;
    const env = useTwin.getState().environment;
    const f = FOCUS[env] ?? FOCUS.station;
    const wide = env === "infrastructure";
    placeKey(k, f, wide);
  });
  return (
    <>
      <hemisphereLight args={["#a9bde0", "#2d2620", 0.42]} />
      <directionalLight
        ref={key}
        intensity={2.2}
        color="#e6ecff"
        castShadow={shadows}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.00035}
        shadow-normalBias={0.025}
        shadow-radius={5}
      />
      <directionalLight position={[22, 9, -16]} intensity={0.5} color="#ffd2a8" />
      {/* Canopy downlights over the charging bay and its neighbour. */}
      <pointLight position={[0.2, 2.75, 0]} intensity={7} distance={8} decay={2} color="#ffe9d0" />
      <pointLight position={[0.2, 2.75, -4.2]} intensity={5} distance={8} decay={2} color="#ffe9d0" />
    </>
  );
}

/** Keeps the key light's direction fixed and its shadow box over the environment in view. */
function placeKey(k: DirectionalLight, f: [number, number, number], wide: boolean) {
  k.position.set(f[0] - 16, 22, f[2] + 12);
  k.target.position.set(f[0], f[1], f[2]);
  k.target.updateMatrixWorld();
  const half = wide ? 60 : 12;
  const cam = k.shadow.camera;
  if (cam.right !== half) {
    cam.left = -half;
    cam.right = half;
    cam.top = half;
    cam.bottom = -half;
    cam.updateProjectionMatrix();
  }
}
