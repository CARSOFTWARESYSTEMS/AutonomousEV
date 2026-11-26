"use client";
// The world the environments share: a blue-hour sky, the ground, a quiet
// skyline, the hero vehicle (station and autonomous), highway traffic and the
// electrified highway with a cutaway that travels with the vehicle. The
// charging site itself is ./station/Site.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, BoxGeometry, BufferGeometry, Color, type Mesh, MeshStandardMaterial, ShaderMaterial, type Texture } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createParking } from "@/lib/wireless-charging/autonomous";
import { runtime } from "../state/runtime";
import { useTwin } from "../state/store";
import { concreteTexture, windowTexture } from "./materials";
import { heatOf } from "./station/Site";
import { NOMINAL_GAP, Vehicle } from "./vehicle/Vehicle";
import { setEmissive, setOpacity, setUniform, setVisible } from "./mutate";
import { view } from "./viewState";

import { CouplingChart } from "./road/CouplingChart";
import { Corridor } from "./road/Corridor";
import { Cutaway } from "./road/Cutaway";
import { laneZ, ROAD_WINDING_Y, ROAD_Z } from "./road/layout";
import { RoadPads } from "./road/RoadPads";

export { ROAD_Z };
const hash = (i: number) => {
  const x = Math.sin(i * 91.345 + 7.1) * 24634.6345;
  return x - Math.floor(x);
};

function useDispose<T extends { dispose(): void }>(items: T[]) {
  useEffect(() => () => items.forEach((x) => x.dispose()), [items]);
}

export function Sky() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        side: BackSide,
        depthWrite: false,
        uniforms: { top: { value: new Color("#070c18") }, mid: { value: new Color("#1d2b45") }, horizon: { value: new Color("#9c7a6a") }, dim: { value: 0 } },
        vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; uniform float dim; varying vec3 vP; void main(){ float h = clamp(vP.y, -0.2, 1.0); vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.75, h)); c = mix(vec3(0.05,0.05,0.07), c, smoothstep(-0.2, 0.0, h)); c = mix(c, vec3(0.018, 0.022, 0.032) + 0.03 * smoothstep(-0.1, 0.4, h), dim); gl_FragColor = vec4(c, 1.0); }",
      }),
    [],
  );
  useDispose([material]);
  useFrame(() => setUniform(material, "dim", view.studio));
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[420, 32, 16]} />
    </mesh>
  );
}

export function Ground() {
  const tex = useMemo(() => {
    const t = concreteTexture();
    t.repeat.set(60, 60);
    return t;
  }, []);
  const material = useMemo(() => new MeshStandardMaterial({ map: tex, color: "#8d9298", roughness: 0.92, metalness: 0, transparent: true, opacity: 1 }), [tex]);
  useDispose<Texture | MeshStandardMaterial>([tex, material]);
  const mesh = useRef<Mesh>(null);
  useFrame(() => {
    const env = useTwin.getState().environment;
    setOpacity(material, 1 - 0.55 * view.reveal * (env === "station" ? 1 : 0), 0.9);
    // On the road the verges replace the site's ground.
    setVisible(mesh.current, env !== "dynamic");
  });
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]} receiveShadow material={material}>
      <planeGeometry args={[320, 320]} />
    </mesh>
  );
}

/** One merged geometry for the skyline, windows scaled to each building. */
export function City() {
  const { geometry, material } = useMemo(() => {
    const parts: BufferGeometry[] = [];
    for (let i = 0; i < 200; i++) {
      const x = (hash(i) - 0.5) * 300;
      const z = (hash(i + 500) - 0.5) * 300;
      const nearSite = Math.abs(x) < 38 && z > -44 && z < 18;
      const nearRoad = z > ROAD_Z - 10 && z < ROAD_Z + 26;
      if (nearSite || nearRoad || Math.hypot(x, z) < 34) continue;
      const w = 8 + hash(i + 900) * 14;
      const d = 8 + hash(i + 1300) * 14;
      const far = Math.hypot(x, z) / 150;
      const h = 10 + hash(i + 1700) ** 2 * (40 + 50 * far);
      const g = new BoxGeometry(w, h, d).toNonIndexed();
      const uv = g.attributes.uv;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * (w / 14), uv.getY(k) * (h / 20));
      g.translate(x, h / 2, z);
      parts.push(g);
    }
    const geometry = mergeGeometries(parts)!;
    const windows = windowTexture();
    const material = new MeshStandardMaterial({ color: "#1b2029", roughness: 0.7, metalness: 0.3, emissive: new Color("#ffffff"), emissiveMap: windows, emissiveIntensity: 0.55 });
    return { geometry, material };
  }, []);
  useDispose<BufferGeometry | MeshStandardMaterial>([geometry, material]);
  const mesh = useRef<Mesh>(null);
  useFrame(() => {
    setEmissive(material, "#ffffff", 0.55 * (1 - view.studio));
    setVisible(mesh.current, view.studio < 0.97 && useTwin.getState().environment !== "dynamic");
  });
  return <mesh ref={mesh} geometry={geometry} material={material} receiveShadow />;
}

/** The hero vehicle in the station or parking scene: position, steering and ride height from the simulations. */
export function HeroVehicle() {
  const env = useTwin((s) => s.environment);
  const rxTurns = useTwin((s) => s.station.rxTurns);
  const spin = useRef(0);
  const last = useRef({ x: 0, z: 0 });
  const pose = () => {
    const s = useTwin.getState();
    let x: number;
    let z: number;
    let heading = 0;
    let steer = 0;
    if (s.environment === "autonomous") {
      const t = runtime.parking.state.truth;
      x = t.x + 1.45 * Math.cos(t.heading);
      const y = t.y + 1.45 * Math.sin(t.heading);
      z = -y;
      heading = t.heading;
      steer = t.steer;
    } else {
      const v = runtime.station.state.vehicle;
      x = v.present ? v.x : -40;
      z = -v.y;
    }
    // Wheels roll by the distance actually travelled.
    const d = Math.hypot(x - last.current.x, z - last.current.z);
    if (d < 5) spin.current += d / 0.355;
    last.current = { x, z };
    return { x, z, heading, spin: spin.current, steer, lift: s.station.airGap - NOMINAL_GAP };
  };
  if (env !== "station" && env !== "autonomous") return null;
  return (
    <Vehicle
      pose={pose}
      detailed
      bodyId="vehicle"
      rxTurns={rxTurns}
      rxGlow={() => Math.min(1, (runtime.station.state.point.ss ? Math.hypot(runtime.station.state.point.ss.i2.re, runtime.station.state.point.ss.i2.im) : 0) / 40)}
      rxHeat={() => heatOf(runtime.station.state.temperatures.rxCoil, 25, 110)}
      batteryHeat={() => heatOf(runtime.station.state.battery.temperature, 15, 55)}
    />
  );
}

/** The planned parking path, drawn on the ground in the autonomous scene. */
export function ParkingPath() {
  const env = useTwin((s) => s.environment);
  const revision = useTwin((s) => s.revision);
  const parking = useTwin((s) => s.parking);
  const geometry = useMemo(() => {
    void revision;
    const sim = createParking(parking);
    const parts: BufferGeometry[] = [];
    sim.state.path.forEach((p, i) => {
      if (i % 6 || i > sim.state.goalIndex) return;
      const g = new BoxGeometry(0.16, 0.01, 0.05).toNonIndexed();
      g.rotateY(p.heading);
      // Rear-axle path: draw the vehicle-centre track so it lines up with the car.
      g.translate(p.x + 1.45 * Math.cos(p.heading), 0.01, -(p.y + 1.45 * Math.sin(p.heading)));
      parts.push(g);
    });
    return mergeGeometries(parts)!;
  }, [parking, revision]);
  const material = useMemo(() => new MeshStandardMaterial({ color: "#4ca930", emissive: new Color("#4ca930"), emissiveIntensity: 1.4, transparent: true, opacity: 0.85 }), []);
  useDispose<BufferGeometry | MeshStandardMaterial>([geometry, material]);
  if (env !== "autonomous") return null;
  return <mesh geometry={geometry} material={material} />;
}

// ── Traffic ───────────────────────────────────────────────────────────────

/** EVs driving on the highway: lane, direction, speed (m/s), start position and paint. */
// One speed per lane, so cars never pass through each other; lane 0 belongs to the hero vehicle.
const TRAFFIC = [
  { lane: 1, dir: 1, v: 25, x0: -60, paint: "#1c3f5c" },
  { lane: 1, dir: 1, v: 25, x0: 40, paint: "#d9dee4" },
  { lane: 1, dir: 1, v: 25, x0: 130, paint: "#8c1d24" },
  { lane: 2, dir: -1, v: 24, x0: 10, paint: "#2f3843" },
  { lane: 2, dir: -1, v: 24, x0: -90, paint: "#b9c3cc" },
  { lane: 3, dir: -1, v: 28, x0: 110, paint: "#4c6b3a" },
  { lane: 3, dir: -1, v: 28, x0: -30, paint: "#e8edf2" },
];
const LANE_Z = laneZ;
const SPAN = 300;

/**
 * EVs driving along the highway so the city is alive. In the Dynamic
 * environment the world is drawn in the hero vehicle's frame, so traffic moves
 * at its speed relative to the hero; elsewhere at its own speed.
 */
export function Traffic() {
  const clock = useRef(0);
  const poses = (i: number) => () => {
    const car = TRAFFIC[i];
    const s = useTwin.getState();
    const ego = s.environment === "dynamic" ? runtime.road.state.x : 0;
    const raw = car.x0 + car.dir * car.v * clock.current - ego;
    const x = ((((raw + SPAN / 2) % SPAN) + SPAN) % SPAN) - SPAN / 2;
    return { x, z: LANE_Z(car.lane), heading: car.dir > 0 ? 0 : Math.PI, spin: (car.v * clock.current) / 0.355 };
  };
  useFrame((_, dt) => {
    const s = useTwin.getState();
    if (s.playing) clock.current += Math.min(dt, 0.1);
  });
  return (
    <group>
      {TRAFFIC.map((car, i) => (
        <Vehicle key={i} pose={poses(i)} paint={car.paint} />
      ))}
    </group>
  );
}

// ── Electrified highway ────────────────────────────────────────────────────

/** Receiver winding height at nominal ride height (ground pad winding + nominal gap). */
const RX_WINDING_NOMINAL = 0.036 + NOMINAL_GAP;
export { ROAD_WINDING_Y };

/**
 * The highway in the hero vehicle's frame: the corridor, the embedded pads
 * (from the road simulation's segments), the section cut, the coupling chart
 * and — in the Dynamic environment — the vehicle, riding at the height the
 * simulated air gap requires above windings 30 mm under the surface.
 */
export function Highway() {
  const env = useTwin((s) => s.environment);
  const rxTurns = useTwin((s) => s.station.rxTurns);
  const roadPose = () => {
    const s = runtime.road.state;
    const r = useTwin.getState().road;
    return { x: 0, z: ROAD_Z - r.lateral, heading: 0, spin: s.x / 0.355, lift: r.airGap - (RX_WINDING_NOMINAL - ROAD_WINDING_Y) };
  };
  return (
    <group>
      <Corridor />
      <RoadPads />
      <Cutaway />
      <CouplingChart />
      {env === "dynamic" && <Vehicle pose={roadPose} detailed bodyId="vehicle" rxTurns={rxTurns} rxGlow={() => Math.min(1, runtime.road.state.i2 / 40)} />}
    </group>
  );
}
