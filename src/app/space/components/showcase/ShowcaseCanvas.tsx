"use client";
// The tutorial showcase's 3D scenes, one per topic. Loaded as its own chunk,
// only when a row comes near the screen, on a device that can draw WebGL.
//
// Scientific choices, so no scene misleads:
//  - Earth: orbit radii are to scale with Earth (6,371 km). A sun-synchronous
//    Earth-observation orbit at 700 km (98° inclination) and a navigation
//    orbit at 20,200 km (55°); satellites are enlarged to be visible. Speeds
//    keep the real ratios: ~99 min, 12 h and Earth's 24 h turn.
//  - CubeSat, CubeTwin: the Academy's own 1U model (Mission 1).
//  - Model rocket: the Academy's parametric rocket (Mission 3) in its default
//    design; the flight profile behind it is schematic, not to scale.
//  - Station: a generic modular station (modules, truss, arrays, radiators),
//    not a model of any real one.
//  - Engines: the Rocket Engine Digital Twin's own reference engine, cut away;
//    the advanced view adds that tutorial's pressure sensors and harness.
import { Suspense, lazy, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { DoubleSide, ExtrudeGeometry, LatheGeometry, Quaternion, Shape, SRGBColorSpace, Vector2, Vector3, type Group } from "three";
import { CubeSatModel } from "@/components/space-academy/missions/cubesat/CubeSatScene";
import { DEFAULT_ROCKET, DIAMETER_MM, MOTOR_LENGTH_MM, finRootLeadingEdgeMm, totalLengthMm } from "@/components/space-academy/missions/rocket/model";
import { finOutline, noseProfile } from "@/components/space-academy/missions/rocket/geometry";
import type { Spin, ShowcaseTopic } from "./spin";
import Turntable from "./Turntable";
import { Starfield } from "./SpaceBackdrop";

// The engine scenes carry the Rocket Engine Digital Twin's model: a separate chunk, loaded only for those two rows.
const EngineScene = lazy(() => import("./EngineScenes").then((m) => ({ default: m.EngineScene })));
const PropulsionScene = lazy(() => import("./EngineScenes").then((m) => ({ default: m.PropulsionScene })));

interface Props {
  topic: ShowcaseTopic;
  /** Animate (only while on screen, not paused and motion allowed). */
  playing: boolean;
  reducedMotion: boolean;
  quality: "high" | "low";
  spin: Spin;
  /** Called once the renderer exists, so the poster can step aside. */
  onReady: () => void;
}

// ── 1. Space applications: Earth and two orbits ──
const EARTH_R = 4;
const KM = EARTH_R / 6371;
const LEO_R = (6371 + 700) * KM;
const GNSS_R = (6371 + 20200) * KM;
const LEO_RATE = 0.35; // rad/s on screen; the real ratios follow.
const GNSS_RATE = LEO_RATE * (99 / 718);
const EARTH_RATE = LEO_RATE * (99 / 1436);

function Satellite({ scale = 1, color = "#e5e7eb" }: { scale?: number; color?: string }) {
  return (
    <group scale={scale}>
      <mesh>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.48, 0, 0]}>
          <boxGeometry args={[0.6, 0.02, 0.26]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#1d4ed8" emissiveIntensity={0.35} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Orbit({ radius, inclination, color, rate, playing, phase = 0, cone = false, satScale = 1 }: { radius: number; inclination: number; color: string; rate: number; playing: boolean; phase?: number; cone?: boolean; satScale?: number }) {
  const sat = useRef<Group>(null);
  const angle = useRef(phase);
  const tangent = Math.sqrt(radius * radius - EARTH_R * EARTH_R);
  const half = Math.asin(EARTH_R / radius);
  useFrame((_, delta) => {
    if (playing) angle.current += rate * Math.min(delta, 0.05);
    sat.current?.rotation.set(0, angle.current, 0);
  });
  return (
    <group rotation={[0, 0, (inclination * Math.PI) / 180]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, radius < 6 ? 0.06 : 0.04, 6, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.75} />
      </mesh>
      <group ref={sat}>
        <group position={[radius, 0, 0]}>
          <Satellite scale={satScale} />
          {cone && (
            // What the satellite can see: a cone from it to Earth's limb.
            <mesh position={[-(tangent * Math.cos(half)) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <coneGeometry args={[tangent * Math.sin(half), tangent * Math.cos(half), 48, 1, true]} />
              <meshBasicMaterial color={color} transparent opacity={0.1} side={DoubleSide} depthWrite={false} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}

function EarthScene({ playing }: { playing: boolean }) {
  const earth = useRef<Group>(null);
  useFrame((_, delta) => {
    if (playing && earth.current) earth.current.rotation.y += EARTH_RATE * Math.min(delta, 0.05);
  });
  return (
    <group rotation={[0.2, 0, 0]}>
      <group ref={earth} rotation={[0, 0, (23.4 * Math.PI) / 180]}>
        <mesh>
          <sphereGeometry args={[EARTH_R, 64, 48]} />
          <meshStandardMaterial color="#1d4ed8" emissive="#0b1d4d" emissiveIntensity={0.5} roughness={0.75} metalness={0.05} />
        </mesh>
        <mesh>
          <sphereGeometry args={[EARTH_R * 1.004, 24, 16]} />
          <meshBasicMaterial color="#67e8f9" wireframe transparent opacity={0.18} />
        </mesh>
      </group>
      <mesh>
        <sphereGeometry args={[EARTH_R * 1.06, 48, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.08} depthWrite={false} side={DoubleSide} />
      </mesh>
      <Orbit radius={LEO_R} inclination={98} color="#fcd34d" rate={LEO_RATE} playing={playing} phase={0.6} satScale={0.9} />
      <Orbit radius={GNSS_R} inclination={55} color="#67e8f9" rate={GNSS_RATE} playing={playing} phase={2.2} cone satScale={1.6} />
      <Orbit radius={GNSS_R} inclination={55} color="#67e8f9" rate={GNSS_RATE} playing={playing} phase={4.3} satScale={1.6} />
    </group>
  );
}

// ── 3. Model rocket and its flight profile ──
const S = 0.1;
const ROCKET_R = (DIAMETER_MM / 2) * S;

function RocketModel() {
  const d = DEFAULT_ROCKET;
  const L = totalLengthMm(d);
  const nose = useMemo(() => new LatheGeometry(noseProfile(d.noseShape, d.noseLengthMm).map(([x, r]) => new Vector2(r * S, x * S)), 40), [d]);
  const fin = useMemo(() => {
    const g = new ExtrudeGeometry(new Shape(finOutline(d).map(([x, y]) => new Vector2(x * S, y * S))), { depth: 0.3, bevelEnabled: false });
    g.translate(0, 0, -0.15);
    return g;
  }, [d]);
  useEffect(() => () => nose.dispose(), [nose]);
  useEffect(() => () => fin.dispose(), [fin]);
  const finAngles = Array.from({ length: d.finCount }, (_, i) => (i * 2 * Math.PI) / d.finCount);
  // Built along +x with the tip at x = 0 (as in the mission), then turned so +x points down: nose up, centred.
  return (
    <group position={[0, (L * S) / 2, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <mesh geometry={nose} rotation={[0, 0, -Math.PI / 2]}>
        <meshStandardMaterial color="#e5e7eb" roughness={0.45} metalness={0.05} side={DoubleSide} />
      </mesh>
      <mesh position={[(d.noseLengthMm + d.bodyLengthMm / 2) * S, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[ROCKET_R, ROCKET_R, d.bodyLengthMm * S, 40]} />
        <meshStandardMaterial color="#3b5bdb" roughness={0.5} metalness={0.1} />
      </mesh>
      <group position={[finRootLeadingEdgeMm(d) * S, 0, 0]}>
        {finAngles.map((a) => (
          <group key={a} rotation={[a, 0, 0]}>
            <mesh geometry={fin} position={[0, ROCKET_R, 0]}>
              <meshStandardMaterial color="#f59e0b" roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>
      {/* The motor's nozzle end, just showing at the tail. */}
      <mesh position={[(L - MOTOR_LENGTH_MM * 0.05) * S, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.9, 0.9, MOTOR_LENGTH_MM * 0.1 * S, 24]} />
        <meshStandardMaterial color="#78716c" roughness={0.7} />
      </mesh>
    </group>
  );
}

/** Boost, coast to apogee, descent under a parachute: a schematic, not to scale. */
function FlightProfile() {
  const points = useMemo(() => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push(new Vector3(-26 + t * 30, -22 + 46 * Math.sin((t * Math.PI) / 2), -18));
    }
    for (let i = 1; i <= 16; i++) pts.push(new Vector3(4 + i * 0.9, 24 - i * 2.9, -18));
    return pts;
  }, []);
  return (
    <group>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[i <= 40 ? 0.32 : 0.26, 8, 6]} />
          <meshBasicMaterial color={i <= 40 ? "#fcd34d" : "#f87171"} transparent opacity={0.85} />
        </mesh>
      ))}
      {/* Apogee */}
      <mesh position={[4, 24, -18]}>
        <torusGeometry args={[1.1, 0.12, 8, 32]} />
        <meshBasicMaterial color="#fcd34d" />
      </mesh>
      {/* Parachute near the end of the descent */}
      <mesh position={[18.4, -18 + 4.2, -18]}>
        <sphereGeometry args={[2.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ef4444" side={DoubleSide} roughness={0.8} />
      </mesh>
      {/* Ground */}
      <mesh position={[-2, -22.4, -18]}>
        <boxGeometry args={[60, 0.15, 0.15]} />
        <meshBasicMaterial color="#475569" />
      </mesh>
    </group>
  );
}

// ── 5. A generic modular station ──
function StationScene() {
  const pressurised = (x: number, z: number, length: number, r: number, color = "#e2e8f0") => (
    <mesh key={`${x},${z}`} position={[x, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[r, r, length, 28]} />
      <meshStandardMaterial color={color} metalness={0.35} roughness={0.5} />
    </mesh>
  );
  const array = (x: number, side: number) => (
    <group key={`${x},${side}`} position={[x, 0, side * 9]}>
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 2.1, 0, 0]}>
          <boxGeometry args={[3.6, 0.08, 13]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#1d4ed8" emissiveIntensity={0.3} metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
      <mesh>
        <boxGeometry args={[0.3, 0.3, 13]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
  return (
    <group rotation={[0.35, 0, 0]}>
      {/* Truss */}
      <mesh>
        <boxGeometry args={[34, 0.9, 0.9]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.4} />
      </mesh>
      {array(-15, 1)}
      {array(-15, -1)}
      {array(15, 1)}
      {array(15, -1)}
      {/* Radiators */}
      {[-6, 6].map((x) => (
        <mesh key={x} position={[x, -3.2, 0]}>
          <boxGeometry args={[4.2, 5.5, 0.1]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
      ))}
      {/* Pressurised modules along the other axis, a node, and a docked crew vehicle */}
      {pressurised(0, 3.4, 5.5, 1.7)}
      {pressurised(0, -3.4, 5.5, 1.7)}
      {pressurised(0, 9.4, 5.6, 1.6, "#f1f5f9")}
      <mesh position={[0, 0, -7.6]}>
        <sphereGeometry args={[1.9, 24, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.35} roughness={0.5} />
      </mesh>
      <group position={[0, 0, -11.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[1.1, 1.6, 2.6, 24]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.4} roughness={0.45} />
        </mesh>
        <mesh position={[0, -2.2, 0]}>
          <cylinderGeometry args={[1.6, 1.6, 1.8, 24]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

// ── Pathways and Academy ──

/** A radio pulse from a point: a ring that grows and fades, every 2.4 s, only while playing. */
function Beacon({ at, playing, color = "#67e8f9", size = 1 }: { at: [number, number, number]; playing: boolean; color?: string; size?: number }) {
  const ring = useRef<Group>(null);
  const t = useRef(0.6);
  useFrame((_, delta) => {
    const g = ring.current;
    if (!g) return;
    if (playing) t.current = (t.current + Math.min(delta, 0.05) / 2.4) % 1;
    g.scale.setScalar(size * (0.4 + t.current * 2.4));
    const m = (g.children[0] as unknown as { material: { opacity: number } } | undefined)?.material;
    if (m) m.opacity = 0.55 * (1 - t.current);
  });
  return (
    <group ref={ring} position={at}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.06, 6, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Engineer: the subsystems separated over a drawing grid. */
function EngineerScene({ spin, playing, reducedMotion }: { spin: Spin; playing: boolean; reducedMotion: boolean }) {
  return (
    <>
      <gridHelper args={[90, 18, "#3b82f6", "#1e293b"]} position={[0, -15, 0]} />
      <Turntable spin={spin} playing={playing} reducedMotion={reducedMotion} rate={0.1}>
        <CubeSatModel exploded reducedMotion={reducedMotion} solar="body" highlighted={["eps", "obc", "radio"]} />
      </Turntable>
    </>
  );
}

function Pedestal({ x, y, r = 8 }: { x: number; y: number; r?: number }) {
  return (
    <mesh position={[x, y, 0]}>
      <cylinderGeometry args={[r, r * 1.08, 1, 48]} />
      <meshStandardMaterial color="#1e2448" metalness={0.4} roughness={0.5} />
    </mesh>
  );
}

/** Venture: one satellite at three levels of integration, left to right. An illustration, not a product. */
function VentureScene({ spin, playing, reducedMotion }: { spin: Spin; playing: boolean; reducedMotion: boolean }) {
  const stages: { x: number; installed: Parameters<typeof CubeSatModel>[0]["installed"] }[] = [
    { x: -24, installed: ["eps"] },
    { x: 0, installed: ["payload", "battery", "eps", "obc", "radio", "adcs"] },
    { x: 24, installed: undefined },
  ];
  return (
    <>
      {stages.map((st) => (
        <group key={st.x} position={[st.x, 0, 0]}>
          <Pedestal x={0} y={-8.5} r={8.5} />
          <Turntable spin={spin} playing={playing} reducedMotion={reducedMotion} rate={0.12}>
            <CubeSatModel installed={st.installed} exploded={false} reducedMotion={reducedMotion} solar="body" />
          </Turntable>
        </group>
      ))}
      {[-12, 12].map((x) => (
        <mesh key={x} position={[x, -2, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[1.4, 3, 3]} />
          <meshBasicMaterial color="#fcd34d" />
        </mesh>
      ))}
    </>
  );
}

/** A CanSat (about 66 mm × 115 mm, a drink can) under its parachute, in centimetres. */
function CanSat() {
  const lines = Array.from({ length: 8 }, (_, i) => (i * Math.PI * 2) / 8);
  const chuteY = 26;
  const chuteR = 11;
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[3.3, 3.3, 11.5, 32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 3.32]}>
        <boxGeometry args={[3.2, 6, 0.1]} />
        <meshStandardMaterial color="#17603f" />
      </mesh>
      <mesh position={[0, 7.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 4, 6]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0, chuteY, 0]}>
        <sphereGeometry args={[chuteR, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
        <meshStandardMaterial color="#ef4444" side={DoubleSide} roughness={0.8} />
      </mesh>
      {lines.map((a) => {
        const top = new Vector3(Math.cos(a) * chuteR * 0.82, chuteY + 3.2, Math.sin(a) * chuteR * 0.82);
        const bottom = new Vector3(0, 5.8, 0);
        const mid = top.clone().add(bottom).multiplyScalar(0.5);
        const len = top.distanceTo(bottom);
        const dir = top.clone().sub(bottom).normalize();
        return (
          <mesh key={a} position={mid} quaternion={new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir)}>
            <cylinderGeometry args={[0.05, 0.05, len, 4]} />
            <meshBasicMaterial color="#e5e7eb" transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Academy: three exhibits at true relative scale, in centimetres: a 1U
 * CubeSat (10 cm) with an orbit path drawn round it, a model rocket (50 cm)
 * and a CanSat under its parachute. Each sits on its own plinth: separate
 * exhibits, not one physical scene.
 */
function AcademyScene({ spin, playing, reducedMotion }: { spin: Spin; playing: boolean; reducedMotion: boolean }) {
  const base = -26;
  return (
    <>
      <Starfield count={900} />
      <group position={[-24, 0, 0]}>
        <Pedestal x={0} y={base} r={8} />
        <group position={[0, base + 5.5, 0]}>
          <mesh rotation={[Math.PI / 2 - 0.35, 0, 0.2]}>
            <torusGeometry args={[10, 0.08, 6, 120]} />
            <meshBasicMaterial color="#c4b5fd" transparent opacity={0.6} />
          </mesh>
          <Turntable spin={spin} playing={playing} reducedMotion={reducedMotion} rate={0.18}>
            <CubeSatModel exploded={false} reducedMotion={reducedMotion} solar="body" />
            <Beacon at={[0, 5.4, 0]} playing={playing} size={2} />
          </Turntable>
        </group>
      </group>
      <group position={[0, 0, 0]}>
        <Pedestal x={0} y={base} r={7} />
        <group position={[0, base + 25.5, 0]}>
          <Turntable spin={spin} playing={playing} reducedMotion={reducedMotion} rate={0.12}>
            <RocketModel />
          </Turntable>
        </group>
      </group>
      <group position={[23, 0, 0]}>
        <Pedestal x={0} y={base} r={7.5} />
        <group position={[0, base + 6.25, 0]}>
          <Turntable spin={spin} playing={playing} reducedMotion={reducedMotion} rate={0.14}>
            <CanSat />
            <Beacon at={[0, 9.6, 0]} playing={playing} color="#fcd34d" size={1.4} />
          </Turntable>
        </group>
      </group>
    </>
  );
}

/** The Sun 30° off the panels' normal: cos 30° ≈ 0.87 of full power. */
const EPS_SUN_ANGLE = 30;

/** Camera and spin for each topic. Distances are in each model's own units. */
const STAGE: Record<ShowcaseTopic, { camera: [number, number, number]; target?: [number, number, number]; fov: number; rate: number }> = {
  earth: { camera: [0, 8, 38], fov: 42, rate: 0 },
  cubesat: { camera: [34, 20, 40], fov: 38, rate: 0.14 },
  rocket: { camera: [8, 4, 70], target: [-2, 0, -6], fov: 42, rate: 0 },
  eps: { camera: [30, 30, 52], target: [4, 0, 8], fov: 40, rate: 0 },
  station: { camera: [22, 18, 38], fov: 40, rate: 0.08 },
  engine: { camera: [3.4, 1.2, 4.6], target: [0, 0, 0], fov: 38, rate: 0.12 },
  propulsion: { camera: [3.2, 1.6, 4.4], target: [0, 0.3, 0], fov: 38, rate: 0.1 },
  engineer: { camera: [36, 26, 48], target: [0, -1, 0], fov: 38, rate: 0 },
  venture: { camera: [0, 18, 86], target: [0, -2, 0], fov: 38, rate: 0 },
  academy: { camera: [0, 6, 118], target: [0, -3, 0], fov: 40, rate: 0 },
};

function Look({ target }: { target: [number, number, number] }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(...target);
  }, [camera, target]);
  return null;
}

export default function ShowcaseCanvas({ topic, playing, reducedMotion, quality, spin, onReady }: Props) {
  const stage = STAGE[topic];
  const animate = playing && !reducedMotion;
  return (
    <Canvas
      frameloop={animate ? "always" : "demand"}
      dpr={quality === "low" ? 1 : [1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power", stencil: false }}
      camera={{ position: stage.camera, fov: stage.fov, near: 0.05, far: 500 }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace;
        onReady();
      }}
      style={{ touchAction: "pan-y" }}
      aria-hidden="true"
    >
      <Look target={stage.target ?? [0, 0, 0]} />
      <hemisphereLight args={["#dbe4ff", "#141833", 1.05]} />
      <directionalLight position={[30, 40, 25]} intensity={2.3} />
      <directionalLight position={[-25, -10, -30]} intensity={0.5} color="#67e8f9" />
      {topic === "rocket" && (
        <group position={[-18, -0.8, 4]}>
          <Turntable spin={spin} playing={animate} reducedMotion={reducedMotion} rate={stage.rate}>
            <RocketModel />
          </Turntable>
        </group>
      )}
      {topic === "engineer" && <EngineerScene spin={spin} playing={animate} reducedMotion={reducedMotion} />}
      {topic === "venture" && <VentureScene spin={spin} playing={animate} reducedMotion={reducedMotion} />}
      {topic === "academy" && <AcademyScene spin={spin} playing={animate} reducedMotion={reducedMotion} />}
      <Turntable spin={spin} playing={animate && topic !== "rocket"} reducedMotion={reducedMotion} rate={stage.rate}>
        {topic === "earth" && <EarthScene playing={animate} />}
        {topic === "cubesat" && <CubeSatModel exploded reducedMotion={reducedMotion} solar="body" />}
        {topic === "eps" && <CubeSatModel exploded={false} reducedMotion={reducedMotion} solar="wings" sunAngle={EPS_SUN_ANGLE} />}
        {topic === "station" && <StationScene />}
        <Suspense fallback={null}>
          {topic === "engine" && <EngineScene />}
          {topic === "propulsion" && <PropulsionScene playing={animate} />}
        </Suspense>
      </Turntable>
      {topic === "rocket" && <FlightProfile />}
    </Canvas>
  );
}
