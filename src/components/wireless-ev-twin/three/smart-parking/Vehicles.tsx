"use client";
// Vehicles of the facility, drawn from the simulation every frame: position,
// heading, steering and wheel rotation come from the motion model (nothing
// moves on its own). A fixed pool of the shared vehicle model is assigned to
// live vehicles; the tour's focus vehicle gets the detailed model with its
// receiver pad.
//
// Level of detail (profiled, 27 Nov 2026): at 48 bays the pooled models were
// 52 % of the visible meshes and 73 % of the triangles, about 34 draw calls
// and 160 k triangles a car (85 % of them in the rim faces), and the frame's
// main-thread time was spent submitting them. A pooled vehicle farther than
// FAR_ENTER from the camera is therefore drawn by one shared instanced set
// instead (the same lofted body, its own paint, simple wheels: eight draw
// calls for every far vehicle together), and returns to the full model inside
// FAR_LEAVE (hysteresis, so it never flickers). Vehicles beyond the pool use
// the same instanced set. The tour's focus vehicle is always the full model.
// The level of detail never changes a result: poses come from the simulation
// either way.
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, Color, CylinderGeometry, type Group, type InstancedMesh, type Material, Matrix4, MeshStandardMaterial, Quaternion, SRGBColorSpace, Vector3 } from "three";
import { CLASSES } from "@/lib/wireless-charging/smart-parking/vehicles";
import type { SimVehicle } from "@/lib/wireless-charging/smart-parking/facility";
import { facilityIfBuilt } from "../../state/runtime";
import { useTwin } from "../../state/store";
import { setVisible } from "../mutate";
import { bodyMaterials } from "../materials";
import { pick } from "../pick";
import { sharedBodyGeometry, Vehicle, type VehiclePose, WHEEL_CENTRES } from "../vehicle/Vehicle";
import { BODY_FRONT as PLATE_X, WHEEL_RADIUS } from "../vehicle/body";
import { panelGaps } from "../vehicle/details";

const POOL = 22;
/** Camera distance beyond which a pooled vehicle is drawn by the far set, m; and within which it returns to the full model. */
export const FAR_ENTER = 48;
export const FAR_LEAVE = 42;
/** Most vehicles the far set draws (the interface allows 48 bays). */
const FAR_MAX = 160;

/** Pooled vehicles currently drawn by the far set. */
const far = new Set<string>();

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
  const here = useMemo(() => ({ pose: { x: 0, z: 0, heading: 0, spin: 0 } as VehiclePose }), []);
  useFrame(({ camera }) => {
    const v = facilityIfBuilt()?.vehicles.find((x) => x.profile.id === info.id);
    if (!v || !live(v)) {
      far.delete(info.id);
      setVisible(group.current, false);
      return;
    }
    let isFar = false;
    if (index !== 0) {
      const p = worldPose(v, here.pose);
      const d = Math.hypot(camera.position.x - p.x, camera.position.y, camera.position.z - p.z);
      isFar = far.has(info.id) ? d > FAR_LEAVE : d > FAR_ENTER;
    }
    if (isFar) far.add(info.id);
    else far.delete(info.id);
    setVisible(group.current, !isFar);
  });
  useEffect(() => () => void far.delete(info.id), [info.id]);
  const covered = facilityIfBuilt()?.vehicles.find((x) => x.profile.id === info.id)?.profile.plateCovered;
  return (
    <group ref={group}>
      <Vehicle pose={pose} paint={info.paint} scale={info.scale} detailed={index === 0} bodyId={`sp-veh:${info.id}`} rxGlow={index === 0 ? rxGlow : undefined} />
      {covered && <PlateGrime id={info.id} />}
    </group>
  );
}

/**
 * The far level of detail: every pooled vehicle beyond FAR_ENTER and every
 * vehicle beyond the pool, drawn from the shared lofted body with its own paint
 * (instance colour), the shared glass, trim and lamp materials, and simple
 * wheels. A click selects the vehicle it hit, as on the full model.
 */
function FarVehicles() {
  const paint = useRef<InstancedMesh>(null);
  const rest = useRef<InstancedMesh>(null);
  const wheels = useRef<InstancedMesh>(null);
  const ids = useRef<string[]>([]);
  const res = useMemo(() => {
    const geometry = sharedBodyGeometry();
    const m = bodyMaterials("#ffffff");
    panelGaps(m.paint);
    const hidden = new MeshStandardMaterial({ visible: false });
    // The body's six groups: paint, glass, trim, front lamps, rear lamps, seams. Only the paint takes the instance colour.
    const paintMats: Material[] = [m.paint, hidden, hidden, hidden, hidden, hidden];
    const restMats: Material[] = [hidden, m.glass, m.trim, m.lampFront, m.lampRear, m.seam];
    const wheel = new CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, 0.24, 20).rotateX(Math.PI / 2);
    const tyre = new MeshStandardMaterial({ color: "#16181b", roughness: 0.9, metalness: 0 });
    return { geometry, paintMats, restMats, wheel, tyre, owned: [hidden, tyre, ...Object.values(m)] as Material[] };
  }, []);
  useEffect(
    () => () => {
      res.wheel.dispose();
      for (const mat of new Set(res.owned)) mat.dispose();
    },
    [res],
  );
  const tmp = useMemo(() => ({ m: new Matrix4(), w: new Matrix4(), q: new Quaternion(), p: new Vector3(), s: new Vector3(), up: new Vector3(0, 1, 0), c: new Color(), pose: { x: 0, z: 0, heading: 0, spin: 0 } as VehiclePose }), []);
  useFrame(() => {
    const sim = facilityIfBuilt();
    const meshes = [paint.current, rest.current, wheels.current];
    if (meshes.some((m) => !m)) return;
    const [pm, rm, wm] = meshes as InstancedMesh[];
    let n = 0;
    ids.current.length = 0;
    if (sim) {
      const pooled = new Set(assigned);
      for (const v of sim.vehicles) {
        if (n >= FAR_MAX) break;
        if (!live(v) || (pooled.has(v.profile.id) && !far.has(v.profile.id))) continue;
        worldPose(v, tmp.pose);
        const k = CLASSES[v.profile.cls].scale;
        tmp.q.setFromAxisAngle(tmp.up, tmp.pose.heading);
        tmp.m.compose(tmp.p.set(tmp.pose.x, 0, tmp.pose.z), tmp.q, tmp.s.set(k, k, k));
        pm.setMatrixAt(n, tmp.m);
        rm.setMatrixAt(n, tmp.m);
        pm.setColorAt(n, tmp.c.set(v.profile.paint));
        WHEEL_CENTRES.forEach(([x, y, z], w) => wm.setMatrixAt(n * 4 + w, tmp.w.makeTranslation(x, y, z).premultiply(tmp.m)));
        ids.current.push(v.profile.id);
        n += 1;
      }
    }
    pm.count = n;
    rm.count = n;
    wm.count = n * 4;
    for (const m of [pm, rm, wm]) m.instanceMatrix.needsUpdate = true;
    if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
  });
  const handlers = useMemo(
    () => ({
      onClick: (e: { instanceId?: number; delta: number; stopPropagation: () => void }) => {
        const id = e.instanceId !== undefined ? ids.current[e.instanceId] : undefined;
        if (id) pick(`sp-veh:${id}`).onClick(e as never);
      },
    }),
    [],
  );
  return (
    <group>
      <instancedMesh ref={paint} args={[res.geometry, res.paintMats, FAR_MAX]} castShadow receiveShadow frustumCulled={false} {...handlers} />
      <instancedMesh ref={rest} args={[res.geometry, res.restMats, FAR_MAX]} frustumCulled={false} />
      <instancedMesh ref={wheels} args={[res.wheel, res.tyre, FAR_MAX * 4]} frustumCulled={false} />
    </group>
  );
}

/** Ids currently drawn by the pool (read by the far set). */
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
      <FarVehicles />
    </group>
  );
}
