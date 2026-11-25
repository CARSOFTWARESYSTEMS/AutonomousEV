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
import { fieldColor } from "./materials";
import { ROAD_Z } from "./world";
import { view } from "./viewState";
import { setAnchor } from "./labels";
import { fieldScale } from "./fieldScale";
import { addUniform, markUpdated, setOpacity, setUniform } from "./mutate";

/** Height of the transmitter winding plane above the ground, m. */
export const TX_WINDING_Y = 0.036;

export { fieldScale };

/** Shared state for the field legend (read by the DOM). */
export const fieldInfo = { centre: 0, max: 0, live: false, lines: 0 };

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
    paintField(tex.image.data as Uint8Array, values);
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

/** Writes RMS flux density values into RGBA texels on the log colour scale (transparent where invalid). */
function paintField(data: Uint8Array, values: Float32Array) {
  const lo = Math.log10(fieldScale.min);
  const span = Math.log10(fieldScale.max) - lo;
  for (let k = 0; k < values.length; k++) {
    const v = values[k];
    const o = k * 4;
    if (!Number.isFinite(v) || v <= 0) {
      data[o + 3] = 0;
      continue;
    }
    const [r, g, b] = fieldColor((Math.log10(v) - lo) / span);
    data[o] = r * 255;
    data[o + 1] = g * 255;
    data[o + 2] = b * 255;
    data[o + 3] = 215;
  }
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

export const FLOW_COLORS = { ac: "#f5b041", hf: "#b388ff", magnetic: "#5ee7ff", dc: "#4ca930" } as const;

function tube(points: [number, number, number][], radius: number) {
  return new TubeGeometry(new CatmullRomCurve3(points.map((p) => new Vector3(...p))), 64, radius, 10, false);
}

export function EnergyFlow() {
  const grid = useMemo(() => tube([[9, 0.25, 7], [7.5, 0.06, 5.6], [4.2, 0.06, 2.2], [3.3, 0.25, 1.0]], 0.05), []);
  const hf = useMemo(() => tube([[3.3, 0.1, 1.0], [2.4, 0.04, 0.8], [1.0, 0.04, 0.3], [0.25, 0.04, 0.05]], 0.04), []);
  // Vehicle side, in the vehicle's frame: receiver → rectifier → DC–DC → battery.
  const dc = useMemo(() => tube([[0.6, 0.3, 0], [0.95, 0.4, 0.2], [1.05, 0.42, -0.2], [0.4, 0.3, -0.1], [-0.1, 0.26, 0]], 0.035), []);
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
    if (car.current) car.current.position.set(v.x, 0, -v.y);
    const inp = useTwin.getState().station;
    if (link.current) {
      link.current.position.set(inp.longitudinal / 2, TX_WINDING_Y + inp.airGap / 2 + 0.02, -inp.lateral / 2);
      link.current.scale.set(1, inp.airGap, 1);
    }
    setAnchor("flow-grid", 8.2, 0.9, 6.2);
    setAnchor("flow-hf", 2.0, 0.5, 0.8);
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
const NODES: Record<string, () => Vector3> = {
  BMS: () => new Vector3(runtime.station.state.vehicle.x + 1.3, 0.35, -runtime.station.state.vehicle.y),
  VCU: () => new Vector3(runtime.station.state.vehicle.x + 0.4, 1.0, -runtime.station.state.vehicle.y),
  Station: () => new Vector3(3.3, 1.5, 1.0),
  Gateway: () => new Vector3(3.3, 1.75, 1.0),
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

const HUB: [number, number, number] = [1.5, 0.4, -2];
const DISTRICT = {
  grid: { from: [9, 1.8, 7] as [number, number, number], color: FLOW_COLORS.ac },
  pv: { from: [-0.5, 3.3, -4] as [number, number, number], color: "#ffd166" },
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
    setAnchor("d-pv", -0.5, 5.2, -4);
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
