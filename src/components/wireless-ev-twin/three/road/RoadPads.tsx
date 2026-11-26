"use client";
// The embedded road pads near the vehicle, drawn from the road simulation's
// segment list. Each pad is a precast module (polymer-concrete body, resin
// cover, ferrite, Litz winding) set into the wearing course, with a feeder
// cable to the duct bank. Its saw-cut outline shows on the asphalt. The
// outline and a ring on the module show the segment's state — off,
// energising, active, de-energising, blocked by the interlock, or failed —
// read from the segment controller, never animated on its own.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, type BufferGeometry, CatmullRomCurve3, Color, type Group, type Mesh, MeshStandardMaterial, RingGeometry, TubeGeometry, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { roadPad } from "@/lib/wireless-charging/dynamic";
import { DEFAULT_VEHICLE } from "@/lib/wireless-charging/vehicle";
import { runtime } from "../../state/runtime";
import { useTwin } from "../../state/store";
import { spiralCoil } from "../geometry";
import { setAnchor } from "../labels";
import { setEmissive, setOpacity, setVisible } from "../mutate";
import { pick } from "../pick";
import { view } from "../viewState";
import { CUT, ROAD_WINDING_Y, ROAD_Z } from "./layout";
import { LOOK_COLORS, segmentLook } from "./segmentLook";

const SEG_WINDOW = 48;
const NEAR = -18;
const FAR = 42;

function moduleGeometry(diameter: number, turns: number) {
  const pad = roadPad(diameter, turns);
  const side = diameter + 0.1;
  const outline = mergeGeometries(
    [
      new BoxGeometry(side, 0.001, 0.04).translate(0, 0, side / 2),
      new BoxGeometry(side, 0.001, 0.04).translate(0, 0, -side / 2),
      new BoxGeometry(0.04, 0.001, side).translate(side / 2, 0, 0),
      new BoxGeometry(0.04, 0.001, side).translate(-side / 2, 0, 0),
    ].map((g) => g.toNonIndexed()),
  )!;
  const body = new BoxGeometry(side, 0.05, side).translate(0, -0.075, 0);
  const resin = new BoxGeometry(side - 0.004, 0.038, side - 0.004).translate(0, -0.031, 0);
  const coil = spiralCoil(pad.innerRadius, pad.outerRadius, turns, 0.0062, ROAD_WINDING_Y);
  const bars: BufferGeometry[] = [];
  const len = pad.outerRadius + 0.01 - pad.innerRadius * 0.45;
  for (let i = 0; i < 16; i++) {
    const g = new BoxGeometry(0.04, 0.012, len).toNonIndexed();
    g.translate(0, ROAD_WINDING_Y - 0.014, pad.innerRadius * 0.45 + len / 2);
    g.rotateY((i / 16) * Math.PI * 2);
    bars.push(g);
  }
  const ferrite = mergeGeometries(bars)!;
  const ring = new RingGeometry(pad.outerRadius + 0.005, pad.outerRadius + 0.025, 48).rotateX(-Math.PI / 2).translate(0, -0.0115, 0);
  // Feeder from the module's near edge to the duct bank in the shoulder trench, kept under the asphalt.
  const feeder = new TubeGeometry(
    new CatmullRomCurve3([new Vector3(0.15, -0.035, -side / 2), new Vector3(0.18, -0.035, -side / 2 - 0.4), new Vector3(0.21, -0.035, CUT.laneZ0 - ROAD_Z + 0.3), new Vector3(0.22, -0.05, CUT.laneZ0 - ROAD_Z + 0.02), new Vector3(0.23, -0.14, CUT.laneZ0 - ROAD_Z - 0.12), new Vector3(0.24, -0.3, CUT.laneZ0 - ROAD_Z - 0.25)]),
    32,
    0.012,
    6,
    false,
  );
  const fp = feeder.getAttribute("position");
  for (let i = 0; i < fp.count; i++) fp.setY(i, Math.min(fp.getY(i), -0.016));
  // A translucent fill over the pad, carrying its state in the engineering views.
  const fill = new BoxGeometry(side - 0.06, 0.001, side - 0.06);
  return { outline, body, resin, coil, ferrite, ring, feeder, fill };
}

export function RoadPads() {
  const d = useTwin((s) => s.road.segmentDiameter);
  const turns = useTwin((s) => s.road.segmentTurns);
  const geo = useMemo(() => moduleGeometry(d, turns), [d, turns]);
  const shared = useMemo(
    () => ({
      body: new MeshStandardMaterial({ color: "#6f7275", roughness: 0.85 }),
      resin: new MeshStandardMaterial({ color: "#8c7b5a", roughness: 0.3, transparent: true, opacity: 0.38, depthWrite: false }),
      ferrite: new MeshStandardMaterial({ color: "#26272b", roughness: 0.6, metalness: 0.15 }),
      feeder: new MeshStandardMaterial({ color: "#f07c22", roughness: 0.5 }),
      band: new MeshStandardMaterial({ color: "#000000", emissive: new Color("#4ca930"), emissiveIntensity: 0.9, transparent: true, opacity: 0.22, depthWrite: false }),
      window: new MeshStandardMaterial({ color: "#000000", emissive: new Color("#5ad1ff"), emissiveIntensity: 1.4, transparent: true, opacity: 0.85, depthWrite: false }),
    }),
    [],
  );
  // One outline/ring material and one copper material per slot, so each pad can show its own state.
  const slots = useMemo(
    () =>
      Array.from({ length: SEG_WINDOW }, () => ({
        state: new MeshStandardMaterial({ color: "#000000", emissive: new Color(LOOK_COLORS.off), emissiveIntensity: 0, transparent: true, opacity: 0.85, depthWrite: false }),
        fill: new MeshStandardMaterial({ color: "#000000", emissive: new Color(LOOK_COLORS.off), emissiveIntensity: 0, transparent: true, opacity: 0, depthWrite: false }),
        copper: new MeshStandardMaterial({ color: "#c77b4a", metalness: 1, roughness: 0.3, emissive: new Color("#ff8a3d"), emissiveIntensity: 0 }),
      })),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
    },
    [geo],
  );
  useEffect(
    () => () => {
      Object.values(shared).forEach((m) => m.dispose());
      slots.forEach((s) => {
        s.state.dispose();
        s.fill.dispose();
        s.copper.dispose();
      });
    },
    [shared, slots],
  );
  const groups = useRef<(Group | null)[]>([]);
  const band = useRef<Mesh>(null);
  const brackets = useRef<Group>(null);
  const root = useRef<Group>(null);

  useFrame(() => {
    const s = useTwin.getState();
    const dyn = s.environment === "dynamic";
    setVisible(root.current, dyn);
    if (!dyn) return;
    const st = runtime.road.state;
    const x0 = st.x;
    const coloured = view.segments > 0.5 || view.cut > 0.5;
    let k = 0;
    for (const seg of st.segments) {
      const rel = seg.x - x0;
      if (rel < NEAR || rel > FAR) continue;
      const g = groups.current[k];
      if (!g) break;
      setVisible(g, true);
      g.position.x = rel;
      const look = segmentLook(seg);
      const slot = slots[k];
      // Outline: a dark saw-cut joint in the exterior view; the controller's state in the engineering views.
      setEmissive(slot.state, coloured ? LOOK_COLORS[look] : "#000000", coloured ? (look === "active" ? 0.8 + 1.4 * seg.level : look === "off" ? 0.7 : 1.4) : 0);
      setOpacity(slot.state, coloured ? 0.95 : 0.55, 2);
      setEmissive(slot.fill, LOOK_COLORS[look], 1);
      setOpacity(slot.fill, view.segments > 0.5 && look !== "off" ? (look === "active" ? 0.18 + 0.2 * seg.level : 0.3) : 0, 2);
      setEmissive(slot.copper, look === "failed" ? "#000000" : "#ff8a3d", look === "failed" ? 0 : 0.05 + 2.2 * seg.level);
      k++;
      if (k >= SEG_WINDOW) break;
    }
    for (let i = k; i < SEG_WINDOW; i++) setVisible(groups.current[i], false);
    // Engineering overlays: where the interlock lets pads energise, and the controller's request window.
    const r = s.road;
    const half = r.segmentDiameter / 2;
    const cover = DEFAULT_VEHICLE.length / 2 - half - 0.1;
    const show = view.segments > 0.02;
    setVisible(band.current, show);
    setVisible(brackets.current, show);
    setOpacity(shared.band, 0.22 * view.segments, 2);
    if (band.current) band.current.scale.set(2 * cover + 2 * half, 1, 1);
    const win = half + (r.handover === "make-before-break" ? 0.25 : 0.05);
    if (brackets.current) {
      brackets.current.position.x = DEFAULT_VEHICLE.receiverOffset;
      brackets.current.scale.set(win, 1, 1);
    }
    if (show) {
      setAnchor("seg-band", -cover - half, 0.05, ROAD_Z - 1.0);
      setAnchor("seg-window", DEFAULT_VEHICLE.receiverOffset, 0.05, ROAD_Z + 1.0);
    }
  });

  return (
    <group ref={root} visible={false}>
      {Array.from({ length: SEG_WINDOW }, (_, i) => (
        <group key={i} ref={(el) => { groups.current[i] = el; }} position={[0, 0, ROAD_Z]} visible={false} {...pick("road-coil")}>
          <mesh geometry={geo.outline} material={slots[i].state} position={[0, 0.0045, 0]} renderOrder={3} />
          <mesh geometry={geo.fill} material={slots[i].fill} position={[0, 0.004, 0]} renderOrder={3} />
          <mesh geometry={geo.body} material={shared.body} />
          <mesh geometry={geo.resin} material={shared.resin} renderOrder={2} />
          <mesh geometry={geo.ferrite} material={shared.ferrite} />
          <mesh geometry={geo.coil} material={slots[i].copper} />
          <mesh geometry={geo.ring} material={slots[i].state} renderOrder={3} />
          <mesh geometry={geo.feeder} material={shared.feeder} />
        </group>
      ))}
      {/* The interlock's zone: pads whose centres lie under the vehicle body. */}
      <mesh ref={band} material={shared.band} position={[0, 0.006, ROAD_Z]} rotation={[-Math.PI / 2, 0, 0]} visible={false} renderOrder={4}>
        <planeGeometry args={[1, 1.1]} />
      </mesh>
      {/* The request window around the receiver: two brackets at ± the window. */}
      <group ref={brackets} position={[0, 0.008, ROAD_Z]} visible={false}>
        {[-1, 1].map((sgn) => (
          <mesh key={sgn} material={shared.window} position={[sgn, 0, 0]} renderOrder={5}>
            <boxGeometry args={[0.06, 0.004, 1.6]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
