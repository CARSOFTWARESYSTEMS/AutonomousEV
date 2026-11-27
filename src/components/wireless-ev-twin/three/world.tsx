"use client";
// The world the environments share: a blue-hour sky, the ground, a quiet
// skyline, the hero vehicle (station and autonomous), highway traffic and the
// electrified highway with a cutaway that travels with the vehicle. The
// charging site itself is ./station/Site.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, BufferGeometry, Color, DoubleSide, type Group, MeshStandardMaterial, type Texture } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createParking } from "@/lib/wireless-charging/autonomous";
import { runtime } from "../state/runtime";
import { useTwin } from "../state/store";
import { antiTile, concreteTexture, grassTexture } from "./materials";
import { buildCity, cityMaterials, concreteFacade, glassFacade, hillRing, type Lot } from "./env/buildings";
import { rng } from "./env/foliage";
import { skyMaterial } from "./sky";
import { heatOf } from "./station/Site";
import { NOMINAL_GAP, Vehicle } from "./vehicle/Vehicle";
import { setColor, setOpacity, setUniform, setVisible } from "./mutate";
import { view } from "./viewState";

import { CouplingChart } from "./road/CouplingChart";
import { Corridor } from "./road/Corridor";
import { Cutaway } from "./road/Cutaway";
import { laneZ, ROAD_WINDING_Y, ROAD_Z } from "./road/layout";
import { RoadPads } from "./road/RoadPads";
import { RoadField } from "./road/RoadField";
import { RoadEnergy } from "./road/RoadEnergy";

export { ROAD_Z };

function useDispose<T extends { dispose(): void }>(items: T[]) {
  useEffect(() => () => items.forEach((x) => x.dispose()), [items]);
}

export function Sky() {
  const material = useMemo(() => skyMaterial(), []);
  useDispose([material]);
  useFrame(() => setUniform(material, "studio", view.studio));
  return (
    <mesh material={material} renderOrder={1000} frustumCulled={false}>
      <sphereGeometry args={[420, 48, 24]} />
    </mesh>
  );
}

const PLAZA = new Color("#b4b6b6");
const LAWN = new Color("#eef2e2");
const FLOOR = new Color("#1a1f26");
const studioFloor = new Color();
const studioGrass = new Color();

export function Ground() {
  const tex = useMemo(() => {
    const concrete = concreteTexture();
    concrete.repeat.set(16, 14);
    const grass = grassTexture();
    grass.repeat.set(90, 90);
    return { concrete, grass };
  }, []);
  const m = useMemo(
    () => ({
      plaza: antiTile(new MeshStandardMaterial({ map: tex.concrete, color: "#b4b6b6", roughness: 0.9, metalness: 0, transparent: true, opacity: 1 }), [1.04, 1.03, 1.0], [0.9, 0.91, 0.92]),
      grass: antiTile(new MeshStandardMaterial({ map: tex.grass, color: "#eef2e2", roughness: 0.96, metalness: 0 })),
    }),
    [tex],
  );
  useDispose<Texture | MeshStandardMaterial>([tex.concrete, tex.grass, m.plaza, m.grass]);
  const group = useRef<Group>(null);
  useFrame(() => {
    const env = useTwin.getState().environment;
    setOpacity(m.plaza, 1 - 0.55 * view.reveal * (env === "station" ? 1 : 0), 0.9);
    // The inspection studio: the ground falls to a dark floor around the subject.
    setColor(m.plaza, studioFloor.copy(PLAZA).lerp(FLOOR, view.studio));
    setColor(m.grass, studioGrass.copy(LAWN).lerp(FLOOR, view.studio));
    // On the road the verges replace the site's ground.
    setVisible(group.current, env !== "dynamic");
  });
  return (
    <group ref={group}>
      {/* The paved site (slab, apron and plaza), then lawns and fields to the horizon. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, -0.012, -2]} receiveShadow material={m.plaza}>
        <planeGeometry args={[64, 56]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow material={m.grass}>
        <planeGeometry args={[900, 900]} />
      </mesh>
    </group>
  );
}

/** City lots around the site: a downtown cluster beyond the shelter, mid-rise blocks elsewhere, none on the site or the highway. */
const CITY_LOTS: Lot[] = (() => {
  const lots: Lot[] = [];
  const r = rng(2024);
  for (let i = 0; lots.length < 64 && i < 600; i++) {
    const downtown = i % 3 === 0;
    const a = downtown ? -0.75 + (r() - 0.5) * 0.9 : r() * Math.PI * 2;
    const d = downtown ? 190 + r() * 120 : 150 + r() * 200;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (z > ROAD_Z - 34 && z < ROAD_Z + 48) continue;
    if (lots.some((l) => Math.hypot(l.x - x, l.z - z) < 42)) continue;
    lots.push({ x, z, size: 0.8 + r() * 0.5, height: downtown ? 0.45 + r() * 0.55 : r() * 0.6, seed: i });
  }
  return lots;
})();

/** The neighbourhood the district dispatch supplies ("Buildings" in the energy view): low and mid-rise blocks south-west of the site. */
const NEIGHBOURHOOD: Lot[] = [
  { x: -34, z: -46, size: 0.62, height: 0.28, seed: 501 },
  { x: -60, z: -40, size: 0.7, height: 0.18, seed: 502 },
  { x: -44, z: -74, size: 0.66, height: 0.36, seed: 503 },
  { x: -72, z: -70, size: 0.6, height: 0.22, seed: 504 },
  { x: -16, z: -72, size: 0.55, height: 0.14, seed: 505 },
  { x: -88, z: -44, size: 0.62, height: 0.3, seed: 506 },
];

/** The skyline and the hills: merged, built once, faded by the haze. */
export function City() {
  const assets = useMemo(() => {
    const geo = buildCity([...CITY_LOTS, ...NEIGHBOURHOOD]);
    const glassTex = glassFacade();
    const concreteTex = concreteFacade();
    const mats = cityMaterials(glassTex, concreteTex);
    const hills = hillRing(360, 430);
    const hillMat = new MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, side: DoubleSide });
    return { geo, glassTex, concreteTex, mats, hills, hillMat };
  }, []);
  useDispose<{ dispose(): void }>([assets.geo.glass, assets.geo.concrete, assets.glassTex, assets.concreteTex, assets.mats.glass, assets.mats.concrete, assets.hills, assets.hillMat]);
  const group = useRef<Group>(null);
  useFrame(() => setVisible(group.current, view.studio < 0.97 && useTwin.getState().environment !== "dynamic"));
  return (
    <group ref={group}>
      <mesh geometry={assets.geo.glass} material={assets.mats.glass} receiveShadow />
      <mesh geometry={assets.geo.concrete} material={assets.mats.concrete} receiveShadow />
      <mesh geometry={assets.hills} material={assets.hillMat} />
    </group>
  );
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
      <RoadField />
      <RoadEnergy />
      {env === "dynamic" && <Vehicle pose={roadPose} detailed bodyId="vehicle" rxTurns={rxTurns} rxGlow={() => Math.min(1, runtime.road.state.i2 / 40)} hideWheels={() => view.roadField > 0.5} />}
    </group>
  );
}
