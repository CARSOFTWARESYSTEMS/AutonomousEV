"use client";
// Light and reflections. Daylight: the same sky the visitor sees (./sky.ts) is
// prefiltered into the reflection map together with a ground plane and two
// soft architectural strips, so paint carries a true horizon line, glass
// reflects the sky and metal reads as metal; nothing is downloaded. The sun is
// a warm key light with soft shadows whose box follows the active
// environment; the sky fills the shadows; haze fades distance into the
// horizon. Inspection views cross-fade into a controlled studio: the sun
// dims and a camera-relative key, fill and rim take over.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BoxGeometry, Color, type DirectionalLight, Fog, type HemisphereLight, Mesh, MeshBasicMaterial, type Object3D, PlaneGeometry, PMREMGenerator, Scene, SphereGeometry, Vector3 } from "three";
import { useTwin } from "../state/store";
import { setEnvironment, setFog } from "./mutate";
import { GROUND_COLOR, HAZE, SKY_COLOR, skyMaterial, SUN_COLOR, SUN_DIR } from "./sky";
import { view } from "./viewState";
import { SHADOW_PROXY_LAYER } from "./env/foliage";
import { ROAD_Z } from "./road/layout";

/** The reflection environment: daylight sky, ground and soft architectural strips, in linear HDR. */
function reflectionScene(): Scene {
  const scene = new Scene();
  const sky = new Mesh(new SphereGeometry(100, 64, 32), skyMaterial({ sunScale: 0.5, clouds: 0.8 }));
  // The environment is rendered without tone mapping; keep the sky's chunks inert.
  sky.material.toneMapped = false;
  scene.add(sky);
  const ground = new Mesh(new PlaneGeometry(400, 400), new MeshBasicMaterial({ color: new Color("#5d5953").multiplyScalar(0.55) }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.2;
  scene.add(ground);
  const strip = (w: number, h: number, intensity: number, tint: string, place: (o: Object3D) => void) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color(tint).multiplyScalar(intensity), side: 2 }));
    place(m);
    scene.add(m);
  };
  // A long overhead soft strip (the highlight that runs along roofs and bonnets) and a low side strip.
  strip(120, 14, 1.4, "#f4f7ff", (o) => {
    o.position.set(0, 60, -10);
    o.rotation.x = Math.PI / 2;
  });
  strip(70, 6, 0.9, "#fff4e8", (o) => {
    o.position.set(-60, 9, -40);
    o.lookAt(0, 4, 0);
  });
  // Dark architectural masses near the horizon: reflections need contrast, not only sky.
  const block = new MeshBasicMaterial({ color: new Color("#2a2f36").multiplyScalar(0.5) });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const b = new Mesh(new BoxGeometry(14 + (i % 3) * 8, 6 + ((i * 7) % 5) * 3, 10), block);
    b.position.set(Math.cos(a) * 75, 2 + ((i * 7) % 5) * 1.5, Math.sin(a) * 75);
    b.lookAt(0, b.position.y, 0);
    scene.add(b);
  }
  return scene;
}

const FOG_STUDIO = new Color("#05080c");
const fogColor = new Color();
const SKY_STUDIO = new Color("#1a2330");
const GROUND_STUDIO = new Color("#07090c");
const hemiSky = new Color();
const hemiGround = new Color();

/** Shadow-camera centre for each environment. */
const FOCUS: Record<string, [number, number, number]> = {
  parking: [-2, 0, 0],
  station: [0.3, 0, -1.2],
  dynamic: [2, 0, ROAD_Z],
  autonomous: [-5, 0, -3],
  infrastructure: [0, 0, 4],
};

const camRight = new Vector3();
const camUp = new Vector3();
const camFwd = new Vector3();
const focusV = new Vector3();

export function Lighting({ shadows, mapSize }: { shadows: boolean; mapSize: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const sun = useRef<DirectionalLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const key = useRef<DirectionalLight>(null);
  const fill = useRef<DirectionalLight>(null);
  const rim = useRef<DirectionalLight>(null);
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = reflectionScene();
    const rt = pmrem.fromScene(env, 0.02, 0.1, 400);
    setEnvironment(scene, rt.texture, 0.95, new Fog(HAZE.clone(), 90, 620));
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
  useFrame(({ scene: sc, camera, controls }) => {
    const st = view.studio;
    // Inspection views close the haze in to a dark studio around the subject.
    const fog = sc.fog as Fog | null;
    if (fog) setFog(fog, fogColor.copy(HAZE).lerp(FOG_STUDIO, st), 90 - 80 * st, 620 - 590 * st);
    const env = useTwin.getState().environment;
    const f = FOCUS[env] ?? FOCUS.station;
    const s = sun.current;
    if (s) {
      placeSun(s, f, env === "infrastructure" ? 60 : env === "parking" ? 30 : 14);
      s.intensity = 3.1 * (1 - 0.75 * st);
    }
    if (hemi.current) {
      hemi.current.color.copy(hemiSky.copy(SKY_COLOR).lerp(SKY_STUDIO, st));
      hemi.current.groundColor.copy(hemiGround.copy(GROUND_COLOR).lerp(GROUND_STUDIO, st));
      hemi.current.intensity = 0.55 - 0.25 * st;
    }
    // Studio rig, relative to the camera: key above-left, fill right, rim behind the subject.
    const target = (controls as unknown as { target?: Vector3 } | null)?.target ?? focusV.set(...f);
    camera.matrixWorld.extractBasis(camRight, camUp, camFwd);
    const rig = [
      [key.current, -0.8, 0.9, 0.8, 2.6],
      [fill.current, 1.0, 0.25, 0.6, 0.8],
      [rim.current, 0.2, 0.7, -1.2, 2.2],
    ] as const;
    for (const [light, r, u, b, intensity] of rig) {
      if (!light) continue;
      // Always present (zero intensity outside the studio): toggling visibility would change the light count and recompile every material.
      light.intensity = intensity * st;
      light.position.copy(target).addScaledVector(camRight, r * 10).addScaledVector(camUp, u * 10).addScaledVector(camFwd, b * 10);
      light.target.position.copy(target);
      light.target.updateMatrixWorld();
    }
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={[SKY_COLOR, GROUND_COLOR, 0.55]} />
      <directionalLight
        ref={sun}
        intensity={3.1}
        color={SUN_COLOR}
        castShadow={shadows}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0003}
        shadow-normalBias={0.03}
        shadow-radius={4}
      />
      <directionalLight ref={key} intensity={0} color="#f2f5ff" />
      <directionalLight ref={fill} intensity={0} color="#cfe0ff" />
      <directionalLight ref={rim} intensity={0} color="#ffffff" />
      {/* Shelter downlights over the charging bay and its neighbour (dim in daylight). */}
      <pointLight position={[0.2, 2.75, 0]} intensity={2.2} distance={7} decay={2} color="#ffe9d0" />
      <pointLight position={[0.2, 2.75, -4.2]} intensity={1.6} distance={7} decay={2} color="#ffe9d0" />
    </>
  );
}

/** The sun's direction is fixed (it matches the sky); its shadow box follows the environment in view. */
function placeSun(k: DirectionalLight, f: [number, number, number], half: number) {
  // The sun's shadow camera also sees the trees' shadow stand-ins (which the view camera does not).
  if (!k.shadow.camera.layers.isEnabled(SHADOW_PROXY_LAYER)) k.shadow.camera.layers.enable(SHADOW_PROXY_LAYER);
  k.position.set(f[0] + SUN_DIR.x * 40, f[1] + SUN_DIR.y * 40, f[2] + SUN_DIR.z * 40);
  k.target.position.set(f[0], f[1], f[2]);
  k.target.updateMatrixWorld();
  const cam = k.shadow.camera;
  if (cam.right !== half) {
    cam.left = -half;
    cam.right = half;
    cam.top = half;
    cam.bottom = -half;
    cam.updateProjectionMatrix();
  }
}
