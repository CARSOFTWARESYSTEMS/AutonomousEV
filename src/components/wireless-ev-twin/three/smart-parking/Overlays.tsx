"use client";
// Scientific overlays of the Smart Parking views. Each one draws a quantity
// the simulation computed — never a decoration:
//  · Route: the vehicle's own remaining planned path to its bay.
//  · Occupancy: each bay's fused state (colour and the indicator's symbol,
//    with the posterior as a label).
//  · IoT: links from every device to the edge gateway; a pulse per message
//    the gateway actually received (slowed so it can be seen).
//  · Energy: flows sized and paced by the dispatch model's powers.
//  · Environment: the shelter air node tinted by its temperature; a haze whose
//    density is the simulated smoke concentration.
//  · Recognition: the camera's field of view while it is reading a plate.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BoxGeometry, BufferGeometry, CatmullRomCurve3, Color, ConeGeometry, DoubleSide, Float32BufferAttribute, type Group, type InstancedMesh, LineBasicMaterial, Matrix4, type Mesh, MeshBasicMaterial, Quaternion, SphereGeometry, TubeGeometry, Vector3 } from "three";
import type { Layout } from "@/lib/wireless-charging/smart-parking/layout";
import { chargerView } from "@/lib/wireless-charging/smart-parking/charging";
import { facilityIfBuilt } from "../../state/runtime";
import { useTwin } from "../../state/store";
import { setAnchor } from "../labels";
import { setOpacity, setVisible } from "../mutate";
import { view } from "../viewState";
import { yard } from "./Equipment";
import { roofHeight, SENSOR_HEIGHT } from "./Shelter";
import { STATUS_LOOK } from "./textures";

function useDispose(items: { dispose(): void }[]) {
  useEffect(() => () => items.forEach((x) => x.dispose()), [items]);
}

const tmpM = new Matrix4();
const tmpQ = new Quaternion();
const tmpP = new Vector3();
const tmpS = new Vector3();
const tmpC = new Color();

/** The remaining planned path of every vehicle on its way to a bay (the focus vehicle's brightest). */
function Routes() {
  const mesh = useRef<InstancedMesh>(null);
  const geo = useMemo(() => new BoxGeometry(0.34, 0.012, 0.07), []);
  const mat = useMemo(() => new MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.85, depthWrite: false }), []);
  useDispose(useMemo(() => [geo, mat], [geo, mat]));
  const next = useRef(0);
  useFrame(({ clock }) => {
    const m = mesh.current;
    const sim = facilityIfBuilt();
    if (!m) return;
    const v = useTwin.getState().view;
    if (!sim || (v !== "cinematic" && v !== "top" && v !== "occupancy") || clock.elapsedTime < next.current) {
      if (!sim || (v !== "cinematic" && v !== "top" && v !== "occupancy")) m.count = 0;
      return;
    }
    next.current = clock.elapsedTime + 0.2;
    let n = 0;
    for (const veh of sim.vehicles) {
      if (!veh.spawned || veh.gone || !veh.path || veh.arrived) continue;
      const s = sim.sessions.get(veh.sessionId);
      if (!s || !["navigating", "parking", "barrier-closing", "entering"].includes(s.lc.state)) continue;
      const focus = veh.profile.id === sim.focus;
      for (let k = Math.ceil(veh.s / 0.8) * 8; k < veh.path.samples.length && n < 400; k += 8) {
        const p = veh.path.samples[k];
        if (p.s < veh.s + 2.5) continue;
        const c = Math.cos(p.heading) * (veh.fp.wheelbase / 2);
        const d = Math.sin(p.heading) * (veh.fp.wheelbase / 2);
        tmpQ.setFromAxisAngle(tmpP.set(0, 1, 0), p.heading);
        tmpM.compose(tmpP.set(p.x + c, 0.03, -(p.y + d)), tmpQ, tmpS.set(1, 1, 1));
        m.setMatrixAt(n, tmpM);
        m.setColorAt(n, tmpC.set(focus ? "#3fb950" : "#8bb8c9"));
        n += 1;
      }
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geo, mat, 400]} frustumCulled={false} renderOrder={2} />;
}

/** Each bay's fused occupancy as a translucent plate in its state colour (the Occupancy view). */
function OccupancyPlates({ layout }: { layout: Layout }) {
  const mesh = useRef<InstancedMesh>(null);
  const geo = useMemo(() => new BoxGeometry(1, 0.01, 1), []);
  const mat = useMemo(() => new MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.34, depthWrite: false }), []);
  useDispose(useMemo(() => [geo, mat], [geo, mat]));
  useFrame(() => {
    const m = mesh.current;
    const sim = facilityIfBuilt();
    if (!m || !sim) return;
    const on = view.shelter < 0.5 && (useTwin.getState().view === "occupancy" || useTwin.getState().view === "top");
    setVisible(m, on);
    if (!on) return;
    sim.bays.forEach((b, i) => {
      tmpM.compose(tmpP.set(b.bay.x, 0.035, -b.bay.y), tmpQ.identity(), tmpS.set(b.bay.width - 0.25, 1, b.bay.depth - 0.3));
      m.setMatrixAt(i, tmpM);
      m.setColorAt(i, tmpC.set(STATUS_LOOK[b.status].color));
      setAnchor(`occ-${b.bay.id}`, b.bay.x, 0.4, -b.bay.y);
    });
    m.count = sim.bays.length;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geo, mat, Math.max(1, layout.bays.length)]} frustumCulled={false} renderOrder={3} />;
}

/** Device positions in the world, for the IoT links. */
function devicePositions(layout: Layout): Map<string, Vector3> {
  const out = new Map<string, Vector3>();
  const half = layout.aisle.half;
  for (const b of layout.bays) {
    out.set(`US-${b.id}`, new Vector3(b.x, SENSOR_HEIGHT, -b.y));
    const sign = b.row === "N" ? 1 : -1;
    out.set(`IR-${b.id}`, new Vector3(b.x + 0.95, 0.56, -sign * (half + layout.inputs.bayDepth)));
    if (b.pad) out.set(`WPT-${b.id}`, new Vector3(b.pad.x, 0.1, -b.pad.y));
  }
  out.set("CAM-N", new Vector3(0, 3.3, -(layout.canopy.yInner + 0.25)));
  out.set("CAM-S", new Vector3(0, 3.3, layout.canopy.yInner + 0.25));
  out.set("ANPR-IN", new Vector3(layout.entry.barrierX + 1.0, 1.6, 2.55));
  out.set("ANPR-OUT", new Vector3(layout.exit.barrierX + 1.0, 1.6, 2.55));
  out.set("READER-IN", new Vector3(layout.entry.stopX - 2, 1.1, 2.4));
  out.set("GATE-IN", new Vector3(layout.entry.barrierX, 1.2, 3.05));
  out.set("GATE-OUT", new Vector3(layout.exit.barrierX, 1.2, 3.05));
  out.set("LED-ENTRY", new Vector3(layout.entry.barrierX - 7.4, 2.4, 4.1));
  const y = yard(layout);
  const cx = (y.x0 + y.x1) / 2;
  for (const id of ["ENV-N", "FAN-CTL", "LIGHT-CTL"]) out.set(id, new Vector3(layout.x0 + 2.7, 2.3, -(half + layout.inputs.bayDepth + 0.15)));
  out.set("ENV-S", new Vector3(layout.x0 + 2.7, 2.3, half + layout.inputs.bayDepth + 0.15));
  for (const id of ["METER-MAIN", "PV-INV", "BESS-01"]) out.set(id, new Vector3(cx, 1.6, -(y.y1 - 0.45)));
  out.set("EDGE-01", new Vector3(y.x0 + (y.x1 - y.x0) * 0.14, 1.8, -(y.y1 - 0.45)));
  return out;
}

/** Links to the gateway and one pulse per received message (the IoT view). */
function IotFlows({ layout }: { layout: Layout }) {
  const positions = useMemo(() => devicePositions(layout), [layout]);
  const gw = positions.get("EDGE-01")!;
  const lines = useMemo(() => {
    const g = new BufferGeometry();
    const pts: number[] = [];
    for (const [id, p] of positions) {
      if (id === "EDGE-01") continue;
      pts.push(p.x, p.y, p.z, gw.x, gw.y + 0.4, gw.z);
    }
    g.setAttribute("position", new Float32BufferAttribute(pts, 3));
    return g;
  }, [positions, gw]);
  const lineMat = useMemo(() => new LineBasicMaterial({ color: "#5ad1ff", transparent: true, opacity: 0.22, depthWrite: false }), []);
  const dot = useMemo(() => new SphereGeometry(0.07, 10, 8), []);
  const dotMat = useMemo(() => new MeshBasicMaterial({ color: "#7fe7ff", transparent: true, opacity: 0.95, blending: AdditiveBlending, depthWrite: false }), []);
  useDispose(useMemo(() => [lines, lineMat, dot, dotMat], [lines, lineMat, dot, dotMat]));
  const group = useRef<Group>(null);
  const mesh = useRef<InstancedMesh>(null);
  const pulses = useRef<{ from: Vector3; born: number; bad: boolean }[]>([]);
  const seen = useRef(0);
  useFrame(({ clock }) => {
    const sim = facilityIfBuilt();
    const on = useTwin.getState().view === "iot";
    setVisible(group.current, on);
    const m = mesh.current;
    if (!sim || !on || !m) return;
    const now = clock.elapsedTime;
    for (const r of sim.recent) {
      if (r.n <= seen.current) continue;
      seen.current = r.n;
      const from = positions.get(r.device);
      if (from && pulses.current.length < 60) pulses.current.push({ from, born: now, bad: r.verdict !== "accepted" });
    }
    pulses.current = pulses.current.filter((p) => now - p.born < 0.9);
    pulses.current.forEach((p, i) => {
      const k = (now - p.born) / 0.9;
      tmpP.copy(p.from).lerp(tmpS.set(gw.x, gw.y + 0.4, gw.z), k);
      tmpM.compose(tmpP, tmpQ.identity(), tmpS.set(1, 1, 1));
      m.setMatrixAt(i, tmpM);
      m.setColorAt(i, tmpC.set(p.bad ? "#f0b72f" : "#7fe7ff"));
    });
    m.count = pulses.current.length;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    for (const id of ["EDGE-01", "ANPR-IN", "CAM-N", "ENV-N", "US-N03"]) {
      const p = positions.get(id)!;
      setAnchor(`iot-${id}`, p.x, p.y + 0.35, p.z);
    }
  });
  return (
    <group ref={group} visible={false}>
      <lineSegments geometry={lines} material={lineMat} />
      <instancedMesh ref={mesh} args={[dot, dotMat, 60]} frustumCulled={false} />
    </group>
  );
}

interface Flow {
  id: "pv" | "grid" | "bess" | "chargers" | "loads";
  curve: CatmullRomCurve3;
}

/** Energy flows (the Energy view): brightness and pace follow the dispatch model's power. */
function EnergyFlows({ layout }: { layout: Layout }) {
  const y = yard(layout);
  const hub = useMemo(() => new Vector3(y.x0 + (y.x1 - y.x0) * 0.38, 1.4, -(y.y1 - 0.75)), [y.x0, y.x1, y.y1]);
  const flows = useMemo<Flow[]>(() => {
    const roof = roofHeight(layout, layout.canopy.yInner + 3);
    const v = (x: number, h: number, z: number) => new Vector3(x, h, z);
    const wireless = layout.bays.filter((b) => b.pad);
    const charge = wireless.length ? wireless[0] : layout.bays[layout.bays.length - 1];
    return [
      { id: "pv", curve: new CatmullRomCurve3([v(layout.canopy.x0 + (layout.canopy.x1 - layout.canopy.x0) * 0.3, roof + 0.4, -(layout.canopy.yInner + 3)), v(layout.canopy.x1 - 1, roof + 0.2, -(layout.canopy.yInner + 3.5)), hub.clone().setY(2.6), hub]) },
      { id: "grid", curve: new CatmullRomCurve3([v(layout.exit.despawnX, 0.25, -12), v(layout.aisle.xEast + 4, 0.25, -11), hub.clone().setY(0.3), hub]) },
      { id: "bess", curve: new CatmullRomCurve3([v(y.x0 + (y.x1 - y.x0) * 0.64, 1.4, -(y.y1 - 0.75)), v(y.x0 + (y.x1 - y.x0) * 0.5, 1.6, -(y.y1 - 0.9)), hub]) },
      { id: "chargers", curve: new CatmullRomCurve3([hub, v(hub.x - 1.5, 0.1, hub.z + 1), v(charge.pad ? charge.pad.x : charge.x, 0.08, -(charge.pad ? charge.pad.y : charge.y))]) },
      { id: "loads", curve: new CatmullRomCurve3([hub, hub.clone().setY(2.9), v(layout.canopy.x0 + (layout.canopy.x1 - layout.canopy.x0) * 0.75, roofHeight(layout, layout.aisle.half + 1.3) - 0.2, -(layout.aisle.half + 1.3))]) },
    ];
  }, [layout, hub, y.x0, y.x1, y.y1]);
  const geos = useMemo(() => flows.map((f) => new TubeGeometry(f.curve, 48, 0.05, 8, false)), [flows]);
  const COLORS: Record<Flow["id"], string> = { pv: "#f5b041", grid: "#c9d4e0", bess: "#39c5cf", chargers: "#5ad1ff", loads: "#e9ecef" };
  const mats = useMemo(() => flows.map((f) => new MeshBasicMaterial({ color: COLORS[f.id], transparent: true, opacity: 0.6, depthWrite: false })), [flows]); // eslint-disable-line react-hooks/exhaustive-deps
  const bead = useMemo(() => new SphereGeometry(0.11, 12, 10), []);
  const beadMat = useMemo(() => new MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.9, depthWrite: false, blending: AdditiveBlending }), []);
  useDispose(useMemo(() => [...geos, ...mats, bead, beadMat], [geos, mats, bead, beadMat]));
  const group = useRef<Group>(null);
  const beads = useRef<InstancedMesh>(null);
  const phase = useRef(flows.map(() => 0));
  useFrame((_, dt) => {
    const sim = facilityIfBuilt();
    const on = view.energy > 0.02 && useTwin.getState().environment === "parking";
    setVisible(group.current, on);
    if (!sim || !on || !sim.lastEnergy) return;
    const e = sim.lastEnergy;
    const power: Record<Flow["id"], number> = { pv: e.pvUsed, grid: e.grid, bess: Math.abs(e.bessDischarge - e.bessCharge), chargers: e.served.charging, loads: e.served.essential + e.served.comfort };
    const b = beads.current;
    let n = 0;
    flows.forEach((f, i) => {
      const p = power[f.id];
      // Brightness and pace follow power (kW scale); nothing is drawn for zero power.
      setOpacity(mats[i], p > 50 ? Math.min(0.85, 0.18 + p / 30000) : 0.04, 2);
      phase.current[i] = (phase.current[i] + dt * Math.min(1.2, 0.08 + p / 25000)) % 1;
      const reverse = f.id === "bess" && e.bessCharge > e.bessDischarge;
      if (b && p > 50)
        for (let k = 0; k < 4; k++) {
          let u = (phase.current[i] + k / 4) % 1;
          if (reverse) u = 1 - u;
          f.curve.getPointAt(u, tmpP);
          tmpM.compose(tmpP, tmpQ.identity(), tmpS.setScalar(0.6 + Math.min(1, p / 20000)));
          b.setMatrixAt(n, tmpM);
          b.setColorAt(n, tmpC.set(COLORS[f.id]));
          n += 1;
        }
      // Labels at each flow's own end (or near the hub for the grid), so they never stack.
      const at = { pv: 0, grid: 0.78, bess: 0, chargers: 1, loads: 1 }[f.id];
      const mid = f.curve.getPointAt(at, tmpP);
      setAnchor(`flow-${f.id}`, mid.x, mid.y + ({ pv: 0.6, grid: 1.6, bess: 1.3, chargers: 0.9, loads: 0.45 } as const)[f.id], mid.z);
    });
    if (b) {
      b.count = n;
      b.instanceMatrix.needsUpdate = true;
      if (b.instanceColor) b.instanceColor.needsUpdate = true;
    }
  });
  return (
    <group ref={group} visible={false}>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} material={mats[i]} />
      ))}
      <instancedMesh ref={beads} args={[bead, beadMat, 24]} frustumCulled={false} />
    </group>
  );
}

/** The shelter air as one thermal node, and the simulated smoke as a haze of matching density (the Environment view). */
function AirNode({ layout }: { layout: Layout }) {
  const mats = useMemo(() => ({ smoke: new MeshBasicMaterial({ color: "#9aa0a6", transparent: true, opacity: 0, depthWrite: false, side: DoubleSide }) }), []);
  useDispose(useMemo(() => [mats.smoke], [mats]));
  const group = useRef<Group>(null);
  const smoke = useRef<Mesh>(null);
  const { x0, x1, yOuter } = layout.canopy;
  useFrame(() => {
    const sim = facilityIfBuilt();
    const on = useTwin.getState().view === "environment" && useTwin.getState().environment === "parking";
    setVisible(group.current, on);
    if (!sim || !on) return;
    setOpacity(mats.smoke, Math.min(0.5, sim.env.smoke / 30), 2);
    setVisible(smoke.current, sim.env.smoke > 0.2);
    setAnchor("env-north", layout.x0 + 2.7, 2.85, -(layout.aisle.half + layout.inputs.bayDepth));
    setAnchor("env-south", layout.x0 + 2.7, 2.85, layout.aisle.half + layout.inputs.bayDepth);
    setAnchor("env-fan", 0, roofHeight(layout, layout.aisle.half + 2.6) - 0.2, layout.aisle.half + 2.6);
  });
  return (
    <group ref={group} visible={false}>
      <mesh ref={smoke} material={mats.smoke} position={[(x0 + x1) / 2, 2.2, 0]}>
        <boxGeometry args={[x1 - x0, 1.9, 2 * yOuter]} />
      </mesh>
    </group>
  );
}

/** The recognition camera's field of view while it is reading a plate. */
function RecognitionCone({ layout }: { layout: Layout }) {
  const geo = useMemo(() => {
    const g = new ConeGeometry(0.7, 2.9, 24, 1, true);
    g.translate(0, -1.45, 0);
    return g;
  }, []);
  const mat = useMemo(() => new MeshBasicMaterial({ color: "#5ad1ff", transparent: true, opacity: 0.1, depthWrite: false, side: DoubleSide, blending: AdditiveBlending }), []);
  useDispose(useMemo(() => [geo, mat], [geo, mat]));
  const cone = useRef<Mesh>(null);
  const from = useMemo(() => new Vector3(layout.entry.barrierX + 1.0, 1.6, 2.55), [layout]);
  const to = useMemo(() => new Vector3(layout.entry.stopX - 0.2, 0.5, 0), [layout]);
  const dir = useMemo(() => to.clone().sub(from).normalize(), [from, to]);
  const q = useMemo(() => new Quaternion().setFromUnitVectors(new Vector3(0, -1, 0), dir), [dir]);
  useFrame(() => {
    const sim = facilityIfBuilt();
    const reading = !!sim && [...sim.sessions.values()].some((x) => x.lc.state === "identifying");
    setVisible(cone.current, reading && useTwin.getState().view === "cinematic");
    // The focus vehicle's front plate, for the label that shows what the (simulated) OCR returned.
    const v = sim?.focus ? sim.vehicles.find((x) => x.profile.id === sim.focus) : undefined;
    if (v && v.spawned && !v.gone) {
      const c = Math.cos(v.pose.heading);
      const s = Math.sin(v.pose.heading);
      const reach = v.fp.wheelbase / 2 + v.fp.length / 2 + 0.05;
      setAnchor("plate-read", v.pose.x + c * reach, 0.55, -(v.pose.y + s * reach));
    }
  });
  return <mesh ref={cone} geometry={geo} material={mat} position={from} quaternion={q} visible={false} renderOrder={4} />;
}

/** Labels for chargers in every view where a vehicle charges (energy, xray). */
function ChargerAnchors() {
  useFrame(() => {
    const sim = facilityIfBuilt();
    if (!sim) return;
    for (const ch of sim.chargers.values()) {
      const b = sim.bays.find((x) => x.bay.id === ch.bayId);
      if (b?.bay.pad) setAnchor(`wpt-${ch.bayId}`, b.bay.pad.x, 0.7, -b.bay.pad.y);
      void chargerView;
    }
  });
  return null;
}

export function ParkingOverlays({ layout }: { layout: Layout }) {
  return (
    <group>
      <Routes />
      <OccupancyPlates layout={layout} />
      <IotFlows layout={layout} />
      <EnergyFlows layout={layout} />
      <AirNode layout={layout} />
      <RecognitionCone layout={layout} />
      <ChargerAnchors />
    </group>
  );
}
