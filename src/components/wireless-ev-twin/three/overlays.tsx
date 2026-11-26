"use client";
// Overlays that show the invisible, each drawn from the simulation:
//  • Field: RMS flux density in the vertical section through both pads (the
//    analytical field model, log scale) and instantaneous field lines.
//  • Energy flow: dashes whose speed and brightness follow each stage's power.
//  • IoT: a pulse for every message the simulated bus actually delivered.
//  • District: flows sized by the dispatch model's powers at the shown hour.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferGeometry, CatmullRomCurve3, Color, DataTexture, DoubleSide, Float32BufferAttribute, type Group, Line, LinearFilter, Mesh, MeshBasicMaterial, QuadraticBezierCurve3, RGBAFormat, ShaderMaterial, SphereGeometry, TubeGeometry, UnsignedByteType, Vector3 } from "three";
import { cabs } from "@/lib/wireless-charging/math";
import { type CouplerConfig, DEFAULT_RX_PAD, DEFAULT_TX_PAD, type FieldBasis, fieldBasis, fieldFromBasis, traceFieldLines } from "@/lib/wireless-charging/coils";
import { runtime } from "../state/runtime";
import { useTwin } from "../state/store";
import { ROAD_Z } from "./road/layout";
import { CABINET } from "./station/Site";
import { POWER_POINTS } from "./vehicle/chassis";
import { NOMINAL_GAP } from "./vehicle/Vehicle";
import { view } from "./viewState";
import { setAnchor } from "./labels";
import { fieldScale, niceCeil, paintFieldTexels } from "./fieldScale";
import { stationFieldInfo } from "./road/fieldInfo";
import { addUniform, markUpdated, setOpacity, setUniform } from "./mutate";

/** Height of the transmitter winding plane above the ground, m. */
export const TX_WINDING_Y = 0.036;

export { fieldScale };

/** Shared state for the field legend (read by the DOM). */
export const fieldInfo = stationFieldInfo;

function sectionFrame(config: CouplerConfig) {
  const dx = config.longitudinal;
  const dz = -config.lateral;
  const len = Math.hypot(dx, dz);
  const phi = len > 1e-6 ? Math.atan2(dz, dx) : 0;
  return { dir: new Vector3(Math.cos(phi), 0, Math.sin(phi)), phi };
}

const lineShader = () =>
  new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { time: { value: 0 }, color: { value: new Color("#7fe7ff") }, opacity: { value: 0 } },
    vertexShader: "attribute float along; varying float vA; void main(){ vA = along; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform float time; uniform vec3 color; uniform float opacity; varying float vA; void main(){ float d = fract(vA * 18.0 - time); float a = smoothstep(0.0, 0.25, d) * (1.0 - smoothstep(0.55, 0.9, d)); gl_FragColor = vec4(color, opacity * (0.25 + 0.75 * a)); }",
  });

export function FieldOverlay() {
  const station = useTwin((s) => s.station);
  const phase = useTwin((s) => s.fieldPhase);
  const config = useMemo<CouplerConfig>(
    () => ({ tx: { ...DEFAULT_TX_PAD, turns: station.txTurns }, rx: { ...DEFAULT_RX_PAD, turns: station.rxTurns }, airGap: station.airGap, lateral: station.lateral, longitudinal: station.longitudinal }),
    [station.txTurns, station.rxTurns, station.airGap, station.lateral, station.longitudinal],
  );
  const basis = useRef<FieldBasis | null>(null);
  const plane = useRef<Mesh>(null);
  const linesGroup = useRef<Group>(null);
  const tex = useMemo(() => {
    const t = new DataTexture(new Uint8Array(64 * 32 * 4), 64, 32, RGBAFormat, UnsignedByteType);
    t.magFilter = LinearFilter;
    t.minFilter = LinearFilter;
    return t;
  }, []);
  const planeMat = useMemo(() => new MeshBasicMaterial({ map: tex, transparent: true, side: DoubleSide, depthWrite: false, opacity: 0 }), [tex]);
  const lineMat = useMemo(() => lineShader(), []);
  const values = useMemo(() => new Float32Array(64 * 32), []);
  const lastRatio = useRef({ ratio: -1, phase: -99, key: "" });
  useEffect(() => () => {
    tex.dispose();
    planeMat.dispose();
    lineMat.dispose();
  }, [tex, planeMat, lineMat]);

  // The per-ampere basis is the slow part: computed after the geometry settles, off the frame.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      basis.current = fieldBasis(config, { nx: 64, nz: 32 });
      lastRatio.current.key = "";
    }, 120);
    return () => window.clearTimeout(timer);
  }, [config]);

  const rebuildLines = (i1: { re: number; im: number }, i2: { re: number; im: number }, theta: number) => {
    const g = linesGroup.current;
    if (!g) return;
    for (const child of [...g.children]) {
      (child as Mesh).geometry?.dispose();
      g.remove(child);
    }
    const lines = traceFieldLines(config, { i1, i2 }, theta, { seeds: 16 });
    const { dir } = sectionFrame(config);
    for (const pts of lines) {
      const positions: number[] = [];
      const along: number[] = [];
      let s = 0;
      for (let k = 0; k < pts.length; k += 2) {
        if (k > 0) s += Math.hypot(pts[k] - pts[k - 2], pts[k + 1] - pts[k - 1]);
        positions.push(dir.x * pts[k], TX_WINDING_Y + pts[k + 1], dir.z * pts[k]);
        along.push(s);
      }
      const geom = new BufferGeometry();
      geom.setAttribute("position", new Float32BufferAttribute(positions, 3));
      geom.setAttribute("along", new Float32BufferAttribute(along, 1));
      g.add(new Line(geom, lineMat));
    }
    fieldInfo.lines = lines.length;
  };

  useFrame((_, dt) => {
    const visible = view.field > 0.02 && useTwin.getState().environment === "station";
    if (plane.current) plane.current.visible = visible;
    if (linesGroup.current) linesGroup.current.visible = visible;
    if (!visible) return;
    addUniform(lineMat, "time", dt * 0.6);
    setUniform(lineMat, "opacity", 0.9 * view.field);
    setOpacity(planeMat, 0.9 * view.field, 2);
    const b = basis.current;
    const ss = runtime.station.state.point.ss;
    fieldInfo.live = Boolean(ss);
    if (!b) return;
    const i1 = ss ? ss.i1 : { re: 0, im: 0 };
    const i2 = ss ? ss.i2 : { re: 0, im: 0 };
    const max = fieldFromBasis(b, { i1, i2 }, values);
    fieldInfo.max = max;
    fieldInfo.centre = runtime.station.state.fieldCentre;
    const fd = useTwin.getState().fieldDisplay;
    paintFieldTexels(tex.image.data as Uint8Array, values, fd.scale, niceCeil(max), fd.contours);
    fieldInfo.full = niceCeil(max);
    markUpdated(tex);
    // Place the section plane.
    const { phi } = sectionFrame(config);
    if (plane.current) {
      const cx = (b.x0 + b.x1) / 2;
      plane.current.position.set(Math.cos(phi) * cx, TX_WINDING_Y + (b.z0 + b.z1) / 2, Math.sin(phi) * cx);
      plane.current.rotation.set(0, -phi, 0);
      plane.current.scale.set(b.x1 - b.x0, b.z1 - b.z0, 1);
    }
    // Field lines depend on the current ratio and phase: retrace only when they change.
    const ratio = cabs(i1) > 1e-6 ? cabs(i2) / cabs(i1) : 0;
    const key = `${ratio.toFixed(2)}|${phase.toFixed(2)}`;
    const last = lastRatio.current;
    if (ss && (last.key !== key)) {
      last.key = key;
      rebuildLines(i1, i2, phase);
    }
    if (!ss && linesGroup.current && linesGroup.current.children.length) rebuildLines({ re: 0, im: 0 }, { re: 0, im: 0 }, 0);
  });

  return (
    <group>
      <mesh ref={plane} material={planeMat} visible={false} renderOrder={5}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <group ref={linesGroup} visible={false} renderOrder={6} />
    </group>
  );
}

// ── Energy flow ────────────────────────────────────────────────────────────

const flowShader = (color: string) =>
  new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { time: { value: 0 }, color: { value: new Color(color) }, level: { value: 0 }, repeat: { value: 10 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform float time; uniform vec3 color; uniform float level; uniform float repeat; varying vec2 vUv; void main(){ float d = fract(vUv.x * repeat - time); float dash = smoothstep(0.0, 0.2, d) * (1.0 - smoothstep(0.5, 0.75, d)); gl_FragColor = vec4(color * (0.6 + 1.6 * dash), level * (0.18 + 0.82 * dash)); }",
  });

import { FLOW_COLORS } from "./flowColors";

export { FLOW_COLORS };

function tube(points: [number, number, number][], radius: number) {
  return new TubeGeometry(new CatmullRomCurve3(points.map((p) => new Vector3(...p))), 64, radius, 10, false);
}

export function EnergyFlow() {
  // Ground side: transformer → cabinet along the feeder trench, cabinet → pad along the pad trench.
  const grid = useMemo(() => tube([[8.6, 0.3, 6.4], [7.2, 0.05, 5.0], [4.6, 0.05, 2.4], [CABINET.x + 0.1, 0.3, CABINET.z]], 0.05), []);
  const hf = useMemo(() => tube([[CABINET.x - 0.2, 0.12, CABINET.z - 0.15], [2.4, 0.04, 0.7], [1.2, 0.04, 0.32], [0.42, 0.04, 0.04]], 0.04), []);
  // Vehicle side, in the vehicle's frame: receiver → compensation → rectifier → DC–DC → junction box → battery.
  const dc = useMemo(() => {
    const P = POWER_POINTS;
    return tube([P.receiver, P.compensation, [1.3, 0.36, 0.2], P.rectifier, P.dcdc, [1.3, 0.42, -0.3], P.junction, P.battery], 0.032);
  }, []);
  const mats = useMemo(() => ({ grid: flowShader(FLOW_COLORS.ac), hf: flowShader(FLOW_COLORS.hf), mag: flowShader(FLOW_COLORS.magnetic), dc: flowShader(FLOW_COLORS.dc) }), []);
  const link = useRef<Mesh>(null);
  const car = useRef<Group>(null);
  useEffect(() => () => {
    [grid, hf, dc].forEach((g) => g.dispose());
    Object.values(mats).forEach((m) => m.dispose());
  }, [grid, hf, dc, mats]);
  useFrame((_, dt) => {
    const on = view.energy > 0.02 && useTwin.getState().environment === "station";
    for (const o of [link.current, car.current]) if (o) o.visible = on;
    const st = runtime.station.state;
    const scale = (p: number) => Math.min(1, p / 11000);
    const pts = st.point;
    const set = (m: ShaderMaterial, p: number) => {
      addUniform(m, "time", dt * (0.4 + 2.2 * scale(p)));
      setUniform(m, "level", on ? view.energy * (p > 1 ? 0.35 + 0.65 * scale(p) : 0) : 0);
    };
    set(mats.grid, pts.pGrid);
    set(mats.hf, pts.pCoilIn);
    set(mats.mag, pts.pRectifierIn);
    set(mats.dc, pts.pBattery);
    const v = st.vehicle;
    const inp = useTwin.getState().station;
    if (car.current) car.current.position.set(v.x, inp.airGap - NOMINAL_GAP, -v.y);
    if (link.current) {
      link.current.position.set(inp.longitudinal / 2, TX_WINDING_Y + inp.airGap / 2 + 0.02, -inp.lateral / 2);
      link.current.scale.set(1, inp.airGap, 1);
    }
    setAnchor("flow-grid", 7.6, 1.0, 5.4);
    setAnchor("flow-hf", 2.1, 0.45, 0.75);
    setAnchor("flow-gap", inp.longitudinal / 2 + 0.55, 0.35, -inp.lateral / 2);
    setAnchor("flow-dc", v.x + 0.2, 0.9, -v.y - 1.2);
  });
  return (
    <group>
      <mesh geometry={grid} material={mats.grid} renderOrder={4} />
      <mesh geometry={hf} material={mats.hf} renderOrder={4} />
      <mesh ref={link} material={mats.mag} renderOrder={4} visible={false}>
        <cylinderGeometry args={[0.2, 0.2, 1, 40, 1, true]} />
      </mesh>
      <group ref={car} visible={false}>
        <mesh geometry={dc} material={mats.dc} renderOrder={4} />
      </group>
    </group>
  );
}

// ── IoT messages ───────────────────────────────────────────────────────────

const LINK_COLORS: Record<string, string> = { can: "#ffd166", vehicle: "#5ee7ff", backend: "#b388ff", cloud: "#4ca930", road: "#f5b041" };
const vehicleAt = (p: readonly [number, number, number]) => {
  const v = runtime.station.state.vehicle;
  return new Vector3(v.x + p[0], p[1] + useTwin.getState().station.airGap - NOMINAL_GAP, -v.y + p[2]);
};
const NODES: Record<string, () => Vector3> = {
  BMS: () => vehicleAt(POWER_POINTS.bms),
  VCU: () => vehicleAt(POWER_POINTS.vcu),
  Station: () => new Vector3(CABINET.x, 0.5, CABINET.z),
  Gateway: () => new Vector3(CABINET.x, 1.9, CABINET.z - 0.25),
  Backend: () => new Vector3(7.5, 6.5, -5),
  Cloud: () => new Vector3(-1.5, 8, -7),
};

interface Pulse {
  mesh: Mesh;
  from: string;
  to: string;
  t: number;
  active: boolean;
}

export function IotLayer() {
  const group = useRef<Group>(null);
  const pool = useRef<Pulse[]>([]);
  const lastId = useRef(0);
  const nodes = useRef<Mesh[]>([]);
  const mats = useMemo(() => Object.fromEntries(Object.entries(LINK_COLORS).map(([k, c]) => [k, new MeshBasicMaterial({ color: c, transparent: true, blending: AdditiveBlending, depthWrite: false })])), []);
  const nodeMat = useMemo(() => new MeshBasicMaterial({ color: "#e8f3ff", transparent: true, opacity: 0.85 }), []);
  useEffect(() => () => {
    Object.values(mats).forEach((m) => m.dispose());
    nodeMat.dispose();
  }, [mats, nodeMat]);
  useFrame((_, dt) => {
    const on = view.iot > 0.02 && useTwin.getState().environment === "station";
    if (group.current) group.current.visible = on;
    if (!on) return;
    const names = Object.keys(NODES);
    nodes.current.forEach((n, i) => n && n.position.copy(NODES[names[i]]()));
    for (const name of names) {
      const p = NODES[name]();
      setAnchor(`node-${name}`, p.x, p.y + 0.35, p.z);
    }
    // New deliveries become pulses (animation slowed for visibility; the log gives real latencies).
    const log = runtime.station.bus.log;
    const fresh = log.filter((m) => m.id > lastId.current).slice(-6);
    if (log.length) lastId.current = log[log.length - 1].id;
    for (const m of fresh) {
      const from = m.src === "Backend" ? "Backend" : m.src;
      const to = m.dst === "Station" && m.link === "backend" ? "Station" : m.dst;
      if (!NODES[from] || !NODES[to]) continue;
      let p = pool.current.find((x) => !x.active);
      if (!p && group.current && pool.current.length < 40) {
        const mesh = new Mesh(sphere, mats[m.link] ?? nodeMat);
        group.current.add(mesh);
        p = { mesh, from, to, t: 0, active: false };
        pool.current.push(p);
      }
      if (!p) continue;
      p.from = from;
      p.to = to;
      p.t = 0;
      p.active = true;
      p.mesh.material = mats[m.link] ?? nodeMat;
      p.mesh.visible = true;
    }
    for (const p of pool.current) {
      if (!p.active) continue;
      p.t += dt / 0.7;
      if (p.t >= 1) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }
      const a = NODES[p.from]();
      const b = NODES[p.to]();
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y += 0.4 + a.distanceTo(b) * 0.25;
      p.mesh.position.copy(new QuadraticBezierCurve3(a, mid, b).getPoint(p.t));
    }
  });
  return (
    <group ref={group} visible={false}>
      {Object.keys(NODES).map((name, i) => (
        <mesh key={name} ref={(m) => { if (m) nodes.current[i] = m; }} material={nodeMat}>
          <octahedronGeometry args={[0.09, 0]} />
        </mesh>
      ))}
    </group>
  );
}
const sphere = new SphereGeometry(0.06, 12, 8);

// ── District flows ─────────────────────────────────────────────────────────

const HUB: [number, number, number] = [CABINET.x, 1.0, CABINET.z];
const DISTRICT = {
  grid: { from: [9, 1.8, 7] as [number, number, number], color: FLOW_COLORS.ac },
  pv: { from: [0.3, 3.4, -1.4] as [number, number, number], color: "#ffd166" },
  bess: { from: [-9, 2.6, 9] as [number, number, number], color: FLOW_COLORS.dc },
  road: { to: [0, 0.3, ROAD_Z] as [number, number, number], color: FLOW_COLORS.hf },
  city: { to: [-36, 0.3, -46] as [number, number, number], color: "#9aa3ad" },
};

export function DistrictFlows() {
  const geoms = useMemo(() => {
    const arc = (a: [number, number, number], b: [number, number, number], lift: number) => {
      const mid: [number, number, number] = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + lift, (a[2] + b[2]) / 2];
      return tube([a, mid, b], 0.12);
    };
    return {
      grid: arc(DISTRICT.grid.from, HUB, 3),
      pv: arc(DISTRICT.pv.from, HUB, 2),
      bess: arc(DISTRICT.bess.from, HUB, 3),
      road: arc(HUB, DISTRICT.road.to, 4),
      city: arc(HUB, DISTRICT.city.to, 10),
    };
  }, []);
  const mats = useMemo(() => Object.fromEntries(Object.entries(DISTRICT).map(([k, v]) => [k, flowShader(v.color)])) as Record<keyof typeof DISTRICT, ShaderMaterial>, []);
  const group = useRef<Group>(null);
  useEffect(() => () => {
    Object.values(geoms).forEach((g) => g.dispose());
    Object.values(mats).forEach((m) => m.dispose());
  }, [geoms, mats]);
  useFrame((_, dt) => {
    const s = useTwin.getState();
    const on = s.environment === "infrastructure";
    if (group.current) group.current.visible = on;
    if (!on) return;
    const steps = runtime.grid.steps;
    const step = steps[Math.min(steps.length - 1, Math.floor((s.gridHour / 24) * steps.length))];
    if (!step) return;
    const vals: Record<keyof typeof DISTRICT, number> = { grid: step.gridImport, pv: step.pvUsed, bess: step.bessDischarge - step.bessCharge, road: step.roadServed, city: step.baseLoad };
    for (const key of Object.keys(vals) as (keyof typeof DISTRICT)[]) {
      const p = Math.abs(vals[key]);
      const m = mats[key];
      setUniform(m, "level", p > 0.5 ? 0.3 + 0.7 * Math.min(1, p / 200) : 0);
      // Storage charging runs the flow backwards.
      addUniform(m, "time", (key === "bess" && vals.bess < 0 ? -1 : 1) * dt * (0.3 + Math.min(1.5, p / 120)));
    }
    setAnchor("d-grid", 9, 4.5, 7);
    setAnchor("d-pv", 0.3, 5.2, -1.4);
    setAnchor("d-bess", -9, 4.6, 9);
    setAnchor("d-road", 0, 3.2, ROAD_Z);
    setAnchor("d-city", -36, 6, -46);
  });
  return (
    <group ref={group} visible={false}>
      {(Object.keys(geoms) as (keyof typeof DISTRICT)[]).map((k) => (
        <mesh key={k} geometry={geoms[k]} material={mats[k]} renderOrder={4} />
      ))}
    </group>
  );
}

// ── Alignment ──────────────────────────────────────────────────────────────

/**
 * Dimension lines for the alignment stage: the pad centre and the receiver
 * centre projected on the slab, the lateral and longitudinal offsets between
 * them, and the winding-to-winding air gap as a vertical dimension. The
 * values are the station's inputs; k and M beside them are calculated.
 */
export function AlignmentOverlay() {
  const group = useRef<Group>(null);
  const parts = useRef<{ lat: Mesh | null; long: Mesh | null; gap: Mesh | null; rx: Mesh | null }>({ lat: null, long: null, gap: null, rx: null });
  const mat = useMemo(() => new MeshBasicMaterial({ color: "#7fd8ff", transparent: true, opacity: 0, depthWrite: false, depthTest: false }), []);
  const padMat = useMemo(() => new MeshBasicMaterial({ color: "#e8f3ff", transparent: true, opacity: 0, depthWrite: false, depthTest: false }), []);
  useEffect(() => () => {
    mat.dispose();
    padMat.dispose();
  }, [mat, padMat]);
  useFrame(() => {
    const s = useTwin.getState();
    const on = view.alignment > 0.02 && s.environment === "station" && runtime.station.state.vehicle.present;
    if (group.current) group.current.visible = on;
    if (!on) return;
    setOpacity(mat, 0.9 * view.alignment, 2);
    setOpacity(padMat, 0.75 * view.alignment, 2);
    const { lateral, longitudinal, airGap } = s.station;
    const x = longitudinal;
    const z = -lateral;
    const y = 0.075;
    const p = parts.current;
    if (p.long) {
      p.long.position.set(x / 2, y, 0);
      p.long.scale.set(Math.max(0.002, Math.abs(x)), 1, 1);
    }
    if (p.lat) {
      p.lat.position.set(x, y, z / 2);
      p.lat.scale.set(1, 1, Math.max(0.002, Math.abs(z)));
    }
    if (p.rx) p.rx.position.set(x, y, z);
    if (p.gap) {
      p.gap.position.set(x + 0.36, TX_WINDING_Y + airGap / 2, z);
      p.gap.scale.set(1, airGap, 1);
    }
    setAnchor("align-long", x / 2, y + 0.05, 0.12);
    setAnchor("align-lat", x + 0.12, y + 0.05, z / 2);
    setAnchor("align-gap", x + 0.42, TX_WINDING_Y + airGap / 2 + 0.03, z);
    setAnchor("align-k", x, TX_WINDING_Y + airGap + 0.28, z);
  });
  return (
    <group ref={group} visible={false} renderOrder={8}>
      {/* Pad centre and receiver centre marks. */}
      <mesh material={padMat} position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.028, 0.036, 32]} />
      </mesh>
      <mesh ref={(m) => { parts.current.rx = m; }} material={mat} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.028, 0.036, 32]} />
      </mesh>
      <mesh ref={(m) => { parts.current.long = m; }} material={mat}>
        <boxGeometry args={[1, 0.004, 0.006]} />
      </mesh>
      <mesh ref={(m) => { parts.current.lat = m; }} material={mat}>
        <boxGeometry args={[0.006, 0.004, 1]} />
      </mesh>
      <mesh ref={(m) => { parts.current.gap = m; }} material={mat}>
        <boxGeometry args={[0.006, 1, 0.006]} />
      </mesh>
    </group>
  );
}
