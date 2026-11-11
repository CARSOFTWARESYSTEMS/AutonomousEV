"use client";
// The Space Research showcase's 3D scene: the 6U spacecraft in orbit, Earth's
// limb below, a navy sky with a faint purple glow. The story clock drives the
// camera, the cutaway, the safe-mode slew and the energy flow; the visitor can
// take the camera at any time (drag, pinch or scroll) and give it back with
// Reset. Loaded lazily, in the browser only, when the section nears the screen.
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  QuadraticBezierCurve3,
  Quaternion,
  Scene,
  ShaderMaterial,
  Spherical,
  SRGBColorSpace,
  Vector3,
  type Group,
  type MeshStandardMaterial,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import RealEarth from "@/components/space-3d/RealEarth";
import { LabelContext, LabelOverlay, LabelProjector, useLabelRegistry } from "@/components/space-academy/viewer/labels";
import { SpacecraftModel } from "./SpacecraftModel";
import { FOCUS, HOME, SUN, SUN_UNIT, cameraAt, cutawayAt, fitDistance, slewAt, subsystem, type StoryClock, type SubsystemId, type Tone, type View } from "./story";
import styles from "./spaceResearch.module.css";

const DEG = Math.PI / 180;
const BAY = 5.65;

function viewPosition(view: View, distance: number) {
  return new Vector3(Math.cos(view.el * DEG) * Math.sin(view.az * DEG), Math.sin(view.el * DEG), Math.cos(view.el * DEG) * Math.cos(view.az * DEG))
    .multiplyScalar(distance * view.dist)
    .add(new Vector3(...view.target));
}

// Earth: large and far (not to scale), placed so its limb crosses the lower part of the resting view.
const EARTH_RADIUS = 1300;
const EARTH_POSITION = (() => {
  const camera = viewPosition(HOME, 170);
  const forward = new Vector3(...HOME.target).sub(camera).normalize();
  const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();
  const up = new Vector3().crossVectors(right, forward);
  const toEarth = forward.applyAxisAngle(right, -40 * DEG).applyAxisAngle(up, -8 * DEG);
  return camera.add(toEarth.multiplyScalar(3000)).toArray() as [number, number, number];
})();

/** The sky: near-black navy, a faint purple glow high behind the spacecraft, a hint of blue towards Earth. */
function Sky() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        side: BackSide,
        depthWrite: false,
        vertexShader: /* glsl */ `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vec3 d = normalize(vDir);
            vec3 col = vec3(0.0035, 0.0045, 0.014);
            float p = pow(max(dot(d, normalize(vec3(0.6, 0.55, -0.58))), 0.0), 6.0);
            col += vec3(0.11, 0.045, 0.22) * p * 0.4;
            float b = pow(max(dot(d, normalize(vec3(-0.2, -0.45, -0.87))), 0.0), 8.0);
            col += vec3(0.015, 0.04, 0.12) * b * 0.2;
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[9500, 32, 16]} />
    </mesh>
  );
}

/** Fixed stars as soft points of a constant pixel size (no twinkling, no drift). */
function StarField({ count }: { count: number }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const geometry = useMemo(() => {
    let seed = 42;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const positions: number[] = [];
    const sizes: number[] = [];
    const colors: number[] = [];
    for (let i = 0; i < count; i++) {
      const z = rnd() * 2 - 1;
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(1 - z * z);
      positions.push(8000 * r * Math.cos(a), 8000 * z, 8000 * r * Math.sin(a));
      sizes.push(0.9 + Math.pow(rnd(), 7) * 2.6);
      const b = 0.35 + 0.65 * rnd() * rnd();
      const tint = rnd();
      colors.push(b * (0.86 + 0.14 * tint), b * (0.9 + 0.08 * tint), b);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(positions, 3));
    g.setAttribute("aSize", new Float32BufferAttribute(sizes, 1));
    g.setAttribute("aColor", new Float32BufferAttribute(colors, 3));
    return g;
  }, [count]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uPx: { value: dpr } },
        vertexShader: /* glsl */ `
          attribute float aSize; attribute vec3 aColor; uniform float uPx; varying vec3 vColor;
          void main() { vColor = aColor; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uPx; }`,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.1, d); gl_FragColor = vec4(vColor * a, a); }`,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [dpr],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return <points geometry={geometry} material={material} />;
}

/** Reflections for the metal, the cells and the gold: a few soft light panels, prefiltered once. */
function Reflections() {
  const gl = useThree((s) => s.gl);
  const target = useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const scene = new Scene();
    scene.background = new Color(0.006, 0.007, 0.02);
    const plane = new PlaneGeometry(1, 1);
    const materials: MeshBasicMaterial[] = [];
    const panel = (rgb: [number, number, number], at: [number, number, number], w: number, h: number) => {
      const material = new MeshBasicMaterial({ color: new Color(...rgb), side: DoubleSide });
      materials.push(material);
      const mesh = new Mesh(plane, material);
      mesh.position.set(...at);
      mesh.scale.set(w, h, 1);
      mesh.lookAt(0, 0, 0);
      scene.add(mesh);
    };
    panel([9, 8, 6.6], [SUN_UNIT[0] * 10, SUN_UNIT[1] * 10, SUN_UNIT[2] * 10], 5, 5); // the Sun
    panel([1.2, 0.5, 2.4], [9, 5, -9], 12, 9); // purple, behind
    panel([0.16, 0.36, 0.9], [2, -11, -3], 26, 10); // earthshine, below
    panel([0.22, 0.8, 0.95], [-11, 1, 6], 1, 12); // a cyan strip
    panel([0.3, 0.32, 0.46], [0, 11, 2], 14, 10); // soft top light
    const rt = pmrem.fromScene(scene, 0.03);
    materials.forEach((m) => m.dispose());
    plane.dispose();
    pmrem.dispose();
    return rt;
  }, [gl]);
  useEffect(() => () => target.dispose(), [target]);
  return <primitive object={target.texture} attach="environment" />;
}

/** Advances the story while playing. */
function Director({ clock, playing }: { clock: StoryClock; playing: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => clock.setFrameRequester(invalidate), [clock, invalidate]);
  useFrame((_, delta) => {
    if (playing) clock.advance(Math.min(delta, 0.1));
  });
  return null;
}

/** The spacecraft's attitude (nominal, or arrays square to the Sun in safe mode) and the cutaway. */
function Craft({ clock, selected, reducedMotion, foilMaterialRef, children }: { clock: StoryClock; selected: SubsystemId | null; reducedMotion: boolean; foilMaterialRef: { current: MeshStandardMaterial | null }; children: React.ReactNode }) {
  const group = useRef<Group>(null);
  const eased = useRef({ cut: 0, slew: 0 });
  const sunward = useMemo(() => new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(...SUN_UNIT)), []);
  const nominal = useMemo(() => new Quaternion(), []);
  useFrame((state, delta) => {
    const t = clock.time;
    const wantCut = selected ? (subsystem(selected).internal ? 1 : 0) : cutawayAt(t);
    const wantSlew = selected ? 0 : slewAt(t);
    const k = reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 5);
    const e = eased.current;
    e.cut += (wantCut - e.cut) * k;
    e.slew += (wantSlew - e.slew) * k;
    group.current?.quaternion.slerpQuaternions(nominal, sunward, e.slew);
    const foil = foilMaterialRef.current;
    if (foil) {
      foil.opacity = 1 - 0.9 * e.cut;
      foil.depthWrite = foil.opacity > 0.98;
    }
    if (Math.abs(wantCut - e.cut) > 0.002 || Math.abs(wantSlew - e.slew) > 0.002) state.invalidate();
  });
  return (
    <group ref={group}>
      {/* A soft lamp inside the body, so the modules read when the side is see-through. */}
      <pointLight position={[0, 3, 2]} intensity={40} distance={26} decay={2} color="#dbeafe" />
      {children}
    </group>
  );
}

/** Energy from the arrays, through the wing roots, into the power board and the battery. */
function EnergyFlow({ playing }: { playing: boolean }) {
  const dots = useRef<(Mesh | null)[]>([]);
  const time = useRef(0);
  const routes = useMemo(() => {
    const v = (x: number, y: number, z: number) => new Vector3(x, y, z);
    const intoBattery = new QuadraticBezierCurve3(v(BAY, 8.6, 1.5), v(BAY + 2, 7.2, 3), v(BAY, 5.4, 3));
    return [1, -1].flatMap((s) => {
      const root = v(s * 12.5, 8.6, 5.9);
      const intoBoard = new QuadraticBezierCurve3(root, v(s * 8, 9.6, 4.2), v(BAY, 8.6, 1.5));
      return [
        [new QuadraticBezierCurve3(v(s * 44, 10, 6.2), v(s * 28, 13, 6.5), root), intoBoard, intoBattery],
        [new QuadraticBezierCurve3(v(s * 26, -9, 6.2), v(s * 19, 4, 6.5), root), intoBoard, intoBattery],
      ];
    });
  }, []);
  const point = useMemo(() => new Vector3(), []);
  const N = 16;
  useFrame((_, delta) => {
    if (playing) time.current += Math.min(delta, 0.05) * 0.38;
    for (let i = 0; i < N; i++) {
      const m = dots.current[i];
      if (!m) continue;
      const route = routes[i % routes.length];
      const p = (time.current + i / N) % 1;
      if (p < 0.55) route[0].getPoint(p / 0.55, point);
      else if (p < 0.8) route[1].getPoint((p - 0.55) / 0.25, point);
      else route[2].getPoint((p - 0.8) / 0.2, point);
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
          <sphereGeometry args={[0.42, 10, 8]} />
          <meshBasicMaterial color="#67e8f9" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
/** One calm amber ring at the battery while the (simulated) anomaly is active. */
function AnomalyMarker({ reducedMotion }: { reducedMotion: boolean }) {
  const ring = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const p = (Math.sin(clock.elapsedTime * 3.9) + 1) / 2;
    ring.current?.scale.setScalar(1 + 0.22 * p);
    if (material.current) material.current.opacity = 0.55 + 0.35 * (1 - p);
  });
  return (
    <mesh ref={ring} position={[BAY, 4.45, 5.9]}>
      <torusGeometry args={[3, 0.14, 10, 48]} />
      <meshBasicMaterial ref={material} color="#fbbf24" transparent opacity={0.85} toneMapped={false} />
    </mesh>
  );
}

export interface ViewHandle {
  /** Back to the starting view, and give the camera back to the story. */
  reset: () => void;
  /** Give the camera back to the story (a stage or a subsystem was picked). */
  release: () => void;
}

function Controls({ controlsRef, userRef, viewRef }: { controlsRef: { current: OrbitControlsImpl | null }; userRef: { current: boolean }; viewRef: { current: ViewHandle | null } }) {
  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    // One finger scrolls the page up and down; a sideways drag turns the view; two fingers zoom.
    if (c.domElement) c.domElement.style.touchAction = "pan-y";
    const start = () => {
      userRef.current = true;
    };
    c.addEventListener("start", start);
    // A plain mouse wheel scrolls the page; Ctrl or ⌘ + wheel (and a trackpad pinch, which sends Ctrl) zooms.
    const el = c.domElement;
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) e.stopImmediatePropagation();
    };
    el?.addEventListener("wheel", wheel, { capture: true });
    viewRef.current = {
      reset: () => {
        userRef.current = false;
        c.reset();
      },
      release: () => {
        userRef.current = false;
      },
    };
    return () => {
      c.removeEventListener("start", start);
      el?.removeEventListener("wheel", wheel, { capture: true });
    };
  }, [controlsRef, userRef, viewRef]);
  return <OrbitControls ref={controlsRef} makeDefault enablePan={false} minDistance={55} maxDistance={420} rotateSpeed={0.6} zoomSpeed={0.6} enableDamping dampingFactor={0.1} />;
}

/** Flies the camera along the story's path, or to a picked subsystem, until the visitor takes it. */
function CameraRig({ clock, selected, reducedMotion, controlsRef, userRef }: { clock: StoryClock; selected: SubsystemId | null; reducedMotion: boolean; controlsRef: { current: OrbitControlsImpl | null }; userRef: { current: boolean } }) {
  const placed = useRef(false);
  const tmp = useMemo(() => ({ target: new Vector3(), offset: new Vector3(), now: new Spherical() }), []);
  useFrame((state, delta) => {
    const c = controlsRef.current;
    if (!c) return;
    const camera = state.camera;
    const fit = fitDistance(state.size.width / Math.max(1, state.size.height));
    if (!placed.current) {
      placed.current = true;
      c.target.set(...HOME.target);
      camera.position.copy(viewPosition(HOME, fit));
      c.update();
      c.saveState();
      if (!reducedMotion) {
        camera.position.copy(viewPosition(cameraAt(clock.time), fit));
        c.update();
      }
      return;
    }
    if (userRef.current || reducedMotion) return;
    const view = selected ? FOCUS[selected] : cameraAt(clock.time);
    const k = 1 - Math.exp(-Math.min(delta, 0.05) * 2.4);
    tmp.target.set(...view.target);
    const targetGap = c.target.distanceTo(tmp.target);
    c.target.lerp(tmp.target, k);
    tmp.offset.copy(camera.position).sub(c.target);
    tmp.now.setFromVector3(tmp.offset);
    let dTheta = view.az * DEG - tmp.now.theta;
    dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
    const dPhi = (90 - view.el) * DEG - tmp.now.phi;
    const dRadius = fit * view.dist - tmp.now.radius;
    tmp.now.set(tmp.now.radius + dRadius * k, tmp.now.phi + dPhi * k, tmp.now.theta + dTheta * k);
    camera.position.setFromSpherical(tmp.now).add(c.target);
    c.update();
    if (Math.abs(dTheta) + Math.abs(dPhi) > 1e-4 || Math.abs(dRadius) > 0.02 || targetGap > 0.02) state.invalidate();
  });
  return null;
}

/** If the first seconds run slowly, drop to 1× pixel ratio. */
function AdaptiveDpr() {
  const setDpr = useThree((s) => s.setDpr);
  const stats = useRef({ frames: 0, time: 0, done: false });
  useFrame((_, delta) => {
    const s = stats.current;
    if (s.done) return;
    s.frames += 1;
    if (s.frames <= 20) return; // shader compilation
    s.time += delta;
    if (s.frames >= 110) {
      s.done = true;
      if (s.time / 90 > 1 / 38) setDpr(1);
    }
  });
  return null;
}

interface Props {
  clock: StoryClock;
  tones: Partial<Record<SubsystemId, Tone>>;
  chips: { id: SubsystemId; text: string; alert?: boolean }[];
  flow: boolean;
  anomaly: boolean;
  playing: boolean;
  reducedMotion: boolean;
  quality: "high" | "low";
  compact: boolean;
  selected: SubsystemId | null;
  onSelect: (id: SubsystemId) => void;
  viewRef: { current: ViewHandle | null };
  onReady: () => void;
}

export default function SpacecraftScene({ clock, tones, chips, flow, anomaly, playing, reducedMotion, quality, compact, selected, onSelect, viewRef, onReady }: Props) {
  const registry = useLabelRegistry();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const userRef = useRef(false);
  const foilMaterialRef = useRef<MeshStandardMaterial>(null);
  return (
    <LabelContext.Provider value={registry}>
      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas
          frameloop={playing ? "always" : "demand"}
          dpr={quality === "low" ? 1 : [1, compact ? 1.5 : 1.75]}
          gl={{ antialias: true, alpha: false, powerPreference: "default", stencil: false }}
          camera={{ fov: 34, near: 1, far: 12000, position: [60, 30, 220] }}
          onCreated={({ gl }) => {
            gl.setClearColor("#03040c", 1);
            gl.outputColorSpace = SRGBColorSpace;
            onReady();
          }}
          aria-hidden="true"
        >
          <Sky />
          <StarField count={quality === "low" ? 900 : 1800} />
          <RealEarth radius={EARTH_RADIUS} position={EARTH_POSITION} sun={SUN} playing={playing} detail="2k" exposure={0.62} />
          <Reflections />
          <hemisphereLight args={["#8b7cf6", "#0b1430", 0.35]} />
          <directionalLight position={SUN} intensity={3.1} color="#fff2df" />
          <directionalLight position={[70, 30, -90]} intensity={1.8} color="#a78bfa" />
          <directionalLight position={[10, -90, 40]} intensity={0.55} color="#60a5fa" />
          <Controls controlsRef={controlsRef} userRef={userRef} viewRef={viewRef} />
          <CameraRig clock={clock} selected={selected} reducedMotion={reducedMotion} controlsRef={controlsRef} userRef={userRef} />
          <Director clock={clock} playing={playing} />
          {quality === "high" && <AdaptiveDpr />}
          <LabelProjector />
          <Craft clock={clock} selected={selected} reducedMotion={reducedMotion} foilMaterialRef={foilMaterialRef}>
            <SpacecraftModel tones={tones} onSelect={onSelect} foilMaterialRef={foilMaterialRef} />
            {flow && <EnergyFlow playing={playing} />}
            {anomaly && <AnomalyMarker reducedMotion={reducedMotion} />}
          </Craft>
        </Canvas>
        <LabelOverlay labels={chips.map((c) => ({ id: c.id, text: c.text, active: c.alert }))} className={styles.chip} activeClassName={styles.chipAlert} />
      </div>
    </LabelContext.Provider>
  );
}
