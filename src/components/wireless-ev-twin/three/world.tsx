"use client";
// The world the four environments share: a dusk sky, the parking site with
// its solar canopy, cabinet, transformer and storage, a city skyline, and the
// electrified highway with a cutaway that travels with the vehicle.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, BoxGeometry, BufferGeometry, Color, CylinderGeometry, type Group, type InstancedMesh, Matrix4, type Mesh, MeshStandardMaterial, Object3D, ShaderMaterial, type Texture } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createParking } from "@/lib/wireless-charging/autonomous";
import { roadPad } from "@/lib/wireless-charging/dynamic";
import { runtime } from "../state/runtime";
import { useTwin } from "../state/store";
import { asphaltTexture, concreteTexture, laneTexture, solarTexture, windowTexture } from "./materials";
import { Cabinet, GroundPad, mats, pick, Vehicle } from "./parts";
import { spiralCoil } from "./geometry";
import { setEmissive, setOffset, setOpacity } from "./mutate";
import { view } from "./viewState";

export const ROAD_Z = 26;
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
        uniforms: { top: { value: new Color("#060b1a") }, mid: { value: new Color("#1b2a4a") }, horizon: { value: new Color("#c8774a") } },
        vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; varying vec3 vP; void main(){ float h = clamp(vP.y, -0.2, 1.0); vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.75, h)); c = mix(vec3(0.05,0.05,0.07), c, smoothstep(-0.2, 0.0, h)); gl_FragColor = vec4(c, 1.0); }",
      }),
    [],
  );
  useDispose([material]);
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
  useFrame(() => {
    setOpacity(material, 1 - 0.55 * view.reveal * (useTwin.getState().environment === "station" ? 1 : 0), 0.9);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={material}>
      <planeGeometry args={[320, 320]} />
    </mesh>
  );
}

/** One merged geometry for the skyline, windows scaled to each building. */
export function City() {
  const { geometry, material } = useMemo(() => {
    const parts: BufferGeometry[] = [];
    for (let i = 0; i < 260; i++) {
      const x = (hash(i) - 0.5) * 300;
      const z = (hash(i + 500) - 0.5) * 300;
      const nearSite = Math.abs(x) < 30 && z > -34 && z < 16;
      const nearRoad = z > ROAD_Z - 10 && z < ROAD_Z + 26;
      if (nearSite || nearRoad || Math.hypot(x, z) < 34) continue;
      const w = 8 + hash(i + 900) * 14;
      const d = 8 + hash(i + 1300) * 14;
      const far = Math.hypot(x, z) / 150;
      const h = 10 + hash(i + 1700) ** 2 * (40 + 50 * far);
      const g = new BoxGeometry(w, h, d).toNonIndexed();
      const uv = g.attributes.uv;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * (w / 7), uv.getY(k) * (h / 10));
      g.translate(x, h / 2, z);
      parts.push(g);
    }
    const geometry = mergeGeometries(parts)!;
    const windows = windowTexture();
    const material = new MeshStandardMaterial({ color: "#20262f", roughness: 0.75, metalness: 0.25, emissive: new Color("#ffffff"), emissiveMap: windows, emissiveIntensity: 1.25 });
    return { geometry, material };
  }, []);
  useDispose<BufferGeometry | MeshStandardMaterial>([geometry, material]);
  return <mesh geometry={geometry} material={material} receiveShadow />;
}

const BAY_PITCH = 2.7;

/** Static neighbours: parked cars on their own pads under the canopy. */
const NEIGHBOURS = [
  { z: -BAY_PITCH, paint: "#2f3843" },
  { z: -BAY_PITCH * 2, paint: "#8c1d24" },
  { z: -BAY_PITCH * 3, paint: "#b9c3cc" },
  { z: BAY_PITCH, paint: "#1c3f5c" },
];

/** The parking site: bays, solar canopy, cabinet, transformer, storage and cables. */
export function Site() {
  const m = mats();
  const pv = useMemo(() => {
    const t = solarTexture();
    t.repeat.set(4, 6);
    return t;
  }, []);
  const pvMat = useMemo(() => new MeshStandardMaterial({ map: pv, metalness: 0.6, roughness: 0.22, color: "#ffffff" }), [pv]);
  const lineMat = useMemo(() => new MeshStandardMaterial({ color: "#d8dde2", roughness: 0.6, emissive: new Color("#9aa3ad"), emissiveIntensity: 0.12 }), []);
  const lightMat = useMemo(() => new MeshStandardMaterial({ color: "#fff", emissive: new Color("#fff1dc"), emissiveIntensity: 2.4 }), []);
  useDispose<Texture | MeshStandardMaterial>([pv, pvMat, lineMat, lightMat]);
  const turns = useTwin((s) => s.station.txTurns);
  const pose = (z: number) => () => ({ x: -0.6, z, heading: 0, spin: 0 });
  const neighbours = useRef<Group>(null);
  useFrame(() => {
    if (neighbours.current) neighbours.current.visible = view.reveal < 0.5 || useTwin.getState().environment !== "station";
  });
  return (
    <group>
      {/* Bay markings. */}
      {[-4, -3, -2, -1, 0, 1, 2].map((k) => (
        <mesh key={k} material={lineMat} position={[-0.4, 0.004, (k - 0.5) * BAY_PITCH]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.4, 0.1]} />
        </mesh>
      ))}
      {/* Wheel stops on the neighbouring bays; the charging bay relies on positioning guidance instead. */}
      {[-3, -2, -1, 1].map((k) => (
        <mesh key={k} material={m.concreteLight} position={[2.35, 0.06, k * BAY_PITCH]} castShadow>
          <boxGeometry args={[0.18, 0.12, 1.6]} />
        </mesh>
      ))}
      {/* Neighbouring bays with parked vehicles on their own pads; set aside in close-up views. */}
      <group ref={neighbours}>
        {NEIGHBOURS.map((n) => (
          <group key={n.z}>
            <group position={[0, 0, n.z]}>
              <GroundPad turns={turns} />
            </group>
            <Vehicle pose={pose(n.z)} paint={n.paint} />
          </group>
        ))}
      </group>
      <group>
        <GroundPad turns={turns} glow={() => Math.min(1, (runtime.station.state.point.ss ? Math.hypot(runtime.station.state.point.ss.i1.re, runtime.station.state.point.ss.i1.im) : 0) / 40)} heat={() => heatOf(runtime.station.state.temperatures.txCoil, 25, 110)} />
      </group>
      {/* Solar carport canopy. */}
      <group position={[-0.5, 0, -BAY_PITCH * 1.5]}>
        {[-6.2, -2.1, 2.1, 6.2].map((z) => (
          <group key={z}>
            <mesh material={m.steel} position={[-3.05, 1.55, z]} castShadow {...pick("solar")}>
              <cylinderGeometry args={[0.1, 0.13, 3.1, 14]} />
            </mesh>
            {/* Cantilever arm. */}
            <mesh material={m.steel} position={[-0.3, 3.0, z]} rotation={[0, 0, -0.05]} castShadow>
              <boxGeometry args={[5.8, 0.16, 0.12]} />
            </mesh>
          </group>
        ))}
        <mesh material={m.steel} position={[0, 3.12, 0]} castShadow>
          <boxGeometry args={[6.3, 0.14, 13.4]} />
        </mesh>
        <mesh material={pvMat} position={[0, 3.24, 0]} rotation={[0, 0, 0.08]} castShadow {...pick("solar")}>
          <boxGeometry args={[6.6, 0.06, 13.6]} />
        </mesh>
        {[-4.5, -1.5, 1.5, 4.5].map((z) => (
          <mesh key={z} material={lightMat} position={[0, 3.04, z]}>
            <boxGeometry args={[1.4, 0.02, 0.18]} />
          </mesh>
        ))}
      </group>
      {/* Power electronics cabinet at the head of the bay. */}
      <group position={[3.3, 0, 1.0]} rotation={[0, -Math.PI / 2, 0]}>
        <Cabinet heat={() => heatOf(runtime.station.state.temperatures.inverter, 25, 90)} />
      </group>
      {/* Pad-mounted transformer and battery storage container. */}
      <group position={[9, 0, 7]} {...pick("transformer")}>
        <mesh material={m.paintDark} position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 1.6, 1.6]} />
        </mesh>
        {[-0.6, 0, 0.6].map((x) => (
          <mesh key={x} material={m.steel} position={[x, 1.75, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.3, 12]} />
          </mesh>
        ))}
      </group>
      <group position={[-9, 0, 9]} {...pick("bess")}>
        <mesh material={m.cabinet} position={[0, 1.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 2.6, 2.4]} />
        </mesh>
        <mesh material={m.emissiveGreen} position={[3.01, 2.2, 0]}>
          <boxGeometry args={[0.02, 0.08, 1.6]} />
        </mesh>
      </group>
      {/* Grid feeder and the cable to the pad (shown on the surface as a trench cover). */}
      <mesh material={m.trim} position={[6.1, 0.012, 4]} rotation={[-Math.PI / 2, 0, -0.75]} {...pick("grid")}>
        <planeGeometry args={[8.2, 0.3]} />
      </mesh>
      <mesh material={m.trim} position={[1.7, 0.012, 0.5]} rotation={[-Math.PI / 2, 0, -0.3]} {...pick("tx-compensation")}>
        <planeGeometry args={[3.4, 0.22]} />
      </mesh>
    </group>
  );
}

/** Thermal-view tint for a temperature on a scale, or null outside the thermal view. */
export function heatOf(T: number, lo: number, hi: number): Color | null {
  if (view.thermal < 0.5) return null;
  return thermalScale((T - lo) / (hi - lo));
}
const tmp = new Color();
const stops = ["#1d4ed8", "#0ea5a4", "#84cc16", "#f59e0b", "#dc2626"].map((c) => new Color(c));
function thermalScale(t: number): Color {
  const x = Math.min(0.9999, Math.max(0, t)) * (stops.length - 1);
  const i = Math.floor(x);
  return tmp.copy(stops[i]).lerp(stops[i + 1], x - i);
}

/** The hero vehicle in the station or parking scene. */
export function HeroVehicle() {
  const env = useTwin((s) => s.environment);
  const rxTurns = useTwin((s) => s.station.rxTurns);
  const spin = useRef(0);
  const last = useRef({ x: 0, z: 0 });
  const pose = () => {
    const e = useTwin.getState().environment;
    let x: number;
    let z: number;
    let heading = 0;
    if (e === "autonomous") {
      const t = runtime.parking.state.truth;
      x = t.x + 1.45 * Math.cos(t.heading);
      const y = t.y + 1.45 * Math.sin(t.heading);
      z = -y;
      heading = t.heading;
    } else {
      const v = runtime.station.state.vehicle;
      x = v.present ? v.x : -40;
      z = -v.y;
    }
    spin.current += Math.hypot(x - last.current.x, z - last.current.z) / 0.355;
    last.current = { x, z };
    return { x, z, heading, spin: spin.current };
  };
  if (env !== "station" && env !== "autonomous") return null;
  return (
    <Vehicle
      pose={pose}
      detailed
      rxTurns={rxTurns}
      airGap={() => useTwin.getState().station.airGap}
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
const LANE_Z = (lane: number) => ROAD_Z + lane * 3.6;
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
    if (s.playing || s.intro.active) clock.current += Math.min(dt, 0.1);
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

const SEG_WINDOW = 60;

/** The highway, its layers, the embedded pads and the vehicle, in the vehicle's frame of reference. */
export function Highway() {
  const m = mats();
  const asphalt = useMemo(() => {
    const t = asphaltTexture();
    t.repeat.set(40, 4);
    return t;
  }, []);
  const lanes = useMemo(() => {
    const t = laneTexture();
    t.repeat.set(1, 40);
    return t;
  }, []);
  const road = useMemo(() => new MeshStandardMaterial({ map: asphalt, color: "#5d6167", roughness: 0.88, metalness: 0.02, transparent: true, opacity: 1 }), [asphalt]);
  const laneMat = useMemo(() => new MeshStandardMaterial({ map: lanes, transparent: true, roughness: 0.6, emissive: new Color("#ffffff"), emissiveMap: lanes, emissiveIntensity: 0.15, depthWrite: false }), [lanes]);
  const layerMats = useMemo(
    () => [
      new MeshStandardMaterial({ color: "#2a2c30", roughness: 0.9 }),
      new MeshStandardMaterial({ color: "#4a4b4f", roughness: 0.9 }),
      new MeshStandardMaterial({ color: "#7b7e83", roughness: 0.95 }),
      new MeshStandardMaterial({ color: "#6b5a46", roughness: 1 }),
    ],
    [],
  );
  const segD = useTwin((s) => s.road.segmentDiameter);
  const segTurns = useTwin((s) => s.road.segmentTurns);
  const rxTurns = useTwin((s) => s.station.rxTurns);
  const coilGeom = useMemo(() => {
    const pad = roadPad(segD, segTurns);
    return spiralCoil(pad.innerRadius, pad.outerRadius, segTurns, 0.0062);
  }, [segD, segTurns]);
  const moduleGeom = useMemo(() => new CylinderGeometry(segD / 2 + 0.05, segD / 2 + 0.05, 0.08, 48), [segD]);
  const coilMats = useMemo(() => Array.from({ length: SEG_WINDOW }, () => m.copper.clone()), [m]);
  useDispose<Texture | MeshStandardMaterial | BufferGeometry>([asphalt, lanes, road, laneMat, ...layerMats, moduleGeom, coilGeom, ...coilMats]);
  const segGroups = useRef<(Group | null)[]>([]);
  const layers = useRef<(Mesh | null)[]>([]);
  const cabinets = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const matrix = useMemo(() => new Matrix4(), []);
  useFrame(() => {
    const s = runtime.road.state;
    const x0 = s.x;
    setOffset(asphalt, (x0 / 8) % 1, 0);
    setOffset(lanes, 0, (-x0 / 8) % 1);
    setOpacity(road, 1 - 0.75 * view.reveal, 0.9);
    // Cutaway: lift the wearing and binder courses off the vehicle's lane to show the pads embedded below.
    layers.current.forEach((m, i) => {
      if (m) m.visible = !(i < 2 && view.reveal > 0.5);
    });
    // Segments near the vehicle, in its frame.
    const near = s.segments.filter((g) => g.x - x0 > -18 && g.x - x0 < 42).slice(0, SEG_WINDOW);
    segGroups.current.forEach((g, i) => {
      if (!g) return;
      const sg = near[i];
      g.visible = Boolean(sg);
      if (!sg) return;
      g.position.x = sg.x - x0;
      setEmissive(coilMats[i], sg.state === "blocked" ? "#ff3344" : sg.state === "failed" ? "#7a7a7a" : "#ff8a3d", sg.state === "blocked" ? 1.2 : 0.1 + 2.6 * sg.level);
    });
    if (cabinets.current) {
      for (let i = 0; i < 6; i++) {
        const cx = Math.floor(x0 / 50) * 50 + i * 50 - 50 - x0;
        dummy.position.set(cx, 0.7, ROAD_Z - 4);
        dummy.updateMatrix();
        matrix.copy(dummy.matrix);
        cabinets.current.setMatrixAt(i, matrix);
      }
      cabinets.current.instanceMatrix.needsUpdate = true;
    }
  });
  const env = useTwin((s) => s.environment);
  const roadPose = () => {
    const s = runtime.road.state;
    return { x: 0, z: ROAD_Z + useTwin.getState().road.lateral * -1, heading: 0, spin: s.x / 0.355 };
  };
  return (
    <group>
      {/* Wearing course with lane markings. */}
      <mesh material={road} position={[0, 0.005, ROAD_Z + 5.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow {...pick("road-layers")}>
        <planeGeometry args={[320, 14.4]} />
      </mesh>
      {[1.8, 5.4, 9].map((z) => (
        <mesh key={z} material={laneMat} position={[0, 0.012, ROAD_Z + z]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[0.16, 320]} />
        </mesh>
      ))}
      {/* Construction layers under the vehicle's lane (visible when the surface is cut away). */}
      {[0.06, 0.12, 0.3, 0.5].map((h, i, arr) => {
        const top = arr.slice(0, i).reduce((a, b) => a + b, 0);
        return (
          <mesh key={h} ref={(m) => { layers.current[i] = m; }} material={layerMats[i]} position={[0, -top - h / 2, ROAD_Z]} receiveShadow {...pick("road-layers")}>
            <boxGeometry args={[320, h, 3.4]} />
          </mesh>
        );
      })}
      {/* Embedded pads, energised by the segment controller. */}
      {Array.from({ length: SEG_WINDOW }, (_, i) => (
        <group key={i} ref={(g) => { segGroups.current[i] = g; }} position={[0, -0.09, ROAD_Z]} visible={false} {...pick("road-coil")}>
          <mesh geometry={moduleGeom} material={m.ferrite} position={[0, -0.03, 0]} />
          <mesh geometry={coilGeom} material={coilMats[i]} position={[0, 0.02, 0]} />
        </group>
      ))}
      {/* Roadside segment cabinets every 50 m. */}
      <instancedMesh ref={cabinets} args={[undefined, undefined, 6]} material={m.cabinet} castShadow {...pick("segment-controller")}>
        <boxGeometry args={[0.6, 1.4, 0.45]} />
      </instancedMesh>
      {/* The road pads sit 0.13 m lower than a ground pad's winding: place the receiver at the road gap above them. */}
      {env === "dynamic" && <Vehicle pose={roadPose} detailed rxTurns={rxTurns} airGap={() => useTwin.getState().road.airGap - 0.13} rxGlow={() => Math.min(1, runtime.road.state.i2 / 40)} />}
    </group>
  );
}

