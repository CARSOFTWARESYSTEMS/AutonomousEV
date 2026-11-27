"use client";
// Vehicles of the facility, drawn from the simulation every frame: position,
// heading, steering and wheel rotation come from the motion model (nothing
// moves on its own). A fixed pool of the shared vehicle model is assigned to
// live vehicles; the tour's focus vehicle gets the detailed model with its
// receiver pad. Beyond the pool (large layouts) vehicles are drawn as
// instanced low-detail bodies — the level of detail never changes a result.
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, CanvasTexture, Color, type Group, type InstancedMesh, Matrix4, MeshStandardMaterial, Quaternion, SRGBColorSpace, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { CLASSES } from "@/lib/wireless-charging/smart-parking/vehicles";
import type { SimVehicle } from "@/lib/wireless-charging/smart-parking/facility";
import { facilityIfBuilt } from "../../state/runtime";
import { useTwin } from "../../state/store";
import { setVisible } from "../mutate";
import { Vehicle, type VehiclePose } from "../vehicle/Vehicle";
import { BODY_FRONT as PLATE_X } from "../vehicle/body";

const POOL = 22;

interface SlotInfo {
  id: string;
  paint: string;
  scale: number;
}

const live = (v: SimVehicle) => v.spawned && !v.gone;

/** World pose of a simulated vehicle (its centre is half a wheelbase ahead of the rear axle). */
export function worldPose(v: SimVehicle, out: VehiclePose = { x: 0, z: 0, heading: 0, spin: 0 }): VehiclePose {
  const c = Math.cos(v.pose.heading);
  const s = Math.sin(v.pose.heading);
  out.x = v.pose.x + c * (v.fp.wheelbase / 2);
  out.z = -(v.pose.y + s * (v.fp.wheelbase / 2));
  out.heading = v.pose.heading;
  out.spin = v.spin;
  out.steer = v.steer;
  out.lift = 0;
  return out;
}

/** Mud and grime over most of a front plate (the tour vehicle's obstructed plate), on its own posed group. */
function PlateGrime({ id }: { id: string }) {
  const group = useRef<Group>(null);
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 256, 64);
    for (let i = 0; i < 160; i++) {
      const x = 30 + Math.abs(Math.sin(i * 12.9898) * 43758.5453 % 1) * 226;
      const y = Math.abs(Math.sin(i * 78.233) * 12345.678 % 1) * 64;
      ctx.fillStyle = `rgba(${70 + (i % 5) * 6},${52 + (i % 7) * 4},${34 + (i % 3) * 5},${0.55 + (i % 4) * 0.1})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 10 + (i % 6) * 3, 6 + (i % 4) * 3, i, 0, Math.PI * 2);
      ctx.fill();
    }
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, []);
  const mat = useMemo(() => new MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }), [tex]);
  useEffect(() => () => {
    tex.dispose();
    mat.dispose();
  }, [tex, mat]);
  useFrame(() => {
    const v = facilityIfBuilt()?.vehicles.find((x) => x.profile.id === id);
    const g = group.current;
    if (!g || !v) return;
    const p = worldPose(v);
    const k = CLASSES[v.profile.cls].scale;
    g.position.set(p.x, 0, p.z);
    g.rotation.y = p.heading;
    g.scale.setScalar(k);
  });
  return (
    <group ref={group}>
      <mesh material={mat} position={[PLATE_X + 0.006, 0.465, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.52, 0.112]} />
      </mesh>
    </group>
  );
}

function Slot({ index, info }: { index: number; info: SlotInfo }) {
  const group = useRef<Group>(null);
  const pose = useMemo(() => {
    const p: VehiclePose = { x: 0, z: -400, heading: 0, spin: 0 };
    return () => {
      const v = facilityIfBuilt()?.vehicles.find((x) => x.profile.id === info.id);
      return v ? worldPose(v, p) : p;
    };
  }, [info.id]);
  const rxGlow = useMemo(
    () => () => {
      const sim = facilityIfBuilt();
      if (!sim) return 0;
      for (const ch of sim.chargers.values()) if (ch.session?.vehicleId === info.id) {
        const ss = ch.sim.state.point.ss;
        return ss ? Math.min(1, Math.hypot(ss.i2.re, ss.i2.im) / 40) : 0;
      }
      return 0;
    },
    [info.id],
  );
  useFrame(() => {
    const v = facilityIfBuilt()?.vehicles.find((x) => x.profile.id === info.id);
    setVisible(group.current, !!v && live(v));
  });
  const covered = facilityIfBuilt()?.vehicles.find((x) => x.profile.id === info.id)?.profile.plateCovered;
  return (
    <group ref={group}>
      <Vehicle pose={pose} paint={info.paint} scale={info.scale} detailed={index === 0} bodyId={`sp-veh:${info.id}`} rxGlow={index === 0 ? rxGlow : undefined} />
      {covered && <PlateGrime id={info.id} />}
    </group>
  );
}

/** Instanced low-detail bodies for vehicles beyond the pool. */
function Massing() {
  const mesh = useRef<InstancedMesh>(null);
  const geo = useMemo(() => mergeGeometries([new BoxGeometry(4.6, 0.75, 1.8).toNonIndexed().translate(0, 0.55, 0), new BoxGeometry(2.4, 0.55, 1.55).toNonIndexed().translate(-0.25, 1.15, 0)])!, []);
  const mat = useMemo(() => new MeshStandardMaterial({ color: "#9aa3ad", metalness: 0.4, roughness: 0.45 }), []);
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  const tmp = useMemo(() => ({ m: new Matrix4(), q: new Quaternion(), p: new Vector3(), s: new Vector3(), up: new Vector3(0, 1, 0), c: new Color() }), []);
  useFrame(() => {
    const sim = facilityIfBuilt();
    const m = mesh.current;
    if (!m) return;
    if (!sim) {
      m.count = 0;
      return;
    }
    const pooled = new Set(assigned);
    let n = 0;
    const pose: VehiclePose = { x: 0, z: 0, heading: 0, spin: 0 };
    for (const v of sim.vehicles) {
      if (!live(v) || pooled.has(v.profile.id) || n >= 600) continue;
      worldPose(v, pose);
      const k = CLASSES[v.profile.cls].scale;
      tmp.q.setFromAxisAngle(tmp.up, pose.heading);
      tmp.m.compose(tmp.p.set(pose.x, 0, pose.z), tmp.q, tmp.s.set(k, k, k));
      m.setMatrixAt(n, tmp.m);
      m.setColorAt(n, tmp.c.set(v.profile.paint));
      n += 1;
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geo, mat, 600]} castShadow frustumCulled={false} />;
}

/** Ids currently drawn by the pool (read by the massing layer). */
let assigned: string[] = [];

export function ParkingVehicles() {
  const [slots, setSlots] = useState<(SlotInfo | null)[]>(() => Array.from({ length: POOL }, () => null));
  const current = useRef(slots);
  const next = useRef(0);
  useFrame(({ clock }) => {
    if (clock.elapsedTime < next.current) return;
    next.current = clock.elapsedTime + 0.25;
    const sim = facilityIfBuilt();
    if (!sim || useTwin.getState().environment !== "parking") return;
    const alive = new Map(sim.vehicles.filter(live).map((v) => [v.profile.id, v]));
    const prev = current.current;
    const out = prev.map((s) => (s && alive.has(s.id) ? s : null));
    // Slot 0 (the detailed model) belongs to the focus vehicle.
    if (sim.focus && alive.has(sim.focus) && out[0]?.id !== sim.focus) {
      for (let i = 1; i < out.length; i++) if (out[i]?.id === sim.focus) out[i] = null;
      const v = alive.get(sim.focus)!;
      out[0] = { id: v.profile.id, paint: v.profile.paint, scale: CLASSES[v.profile.cls].scale };
    } else if (out[0] && out[0].id !== sim.focus) out[0] = null;
    const used = new Set(out.filter(Boolean).map((s) => s!.id));
    for (const v of alive.values()) {
      if (used.has(v.profile.id)) continue;
      const k = out.findIndex((s, i) => i > 0 && s === null);
      if (k < 0) break;
      out[k] = { id: v.profile.id, paint: v.profile.paint, scale: CLASSES[v.profile.cls].scale };
      used.add(v.profile.id);
    }
    assigned = out.filter(Boolean).map((s) => s!.id);
    if (out.some((s, i) => s?.id !== prev[i]?.id)) {
      current.current = out;
      setSlots(out);
    }
  });
  return (
    <group>
      {slots.map((info, i) => (info ? <Slot key={`${i}-${info.id}`} index={i} info={info} /> : null))}
      <Massing />
    </group>
  );
}
