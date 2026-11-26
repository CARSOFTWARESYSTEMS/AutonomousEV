"use client";
// Position-dependent coupling, drawn as a chart standing beside the lane and
// moving with the vehicle. Behind the receiver: the total mutual inductance it
// actually saw and the power it actually received, from the simulation's
// samples. Ahead of it: the mutual inductance the road would offer at each
// position if the pad there energises on time — the road's coupling profile,
// from the same tabulated filament model. Failed pads offer nothing.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, Color, DoubleSide, type Group, MeshBasicMaterial } from "three";
import { segmentM } from "@/lib/wireless-charging/dynamic";
import { DEFAULT_VEHICLE } from "@/lib/wireless-charging/vehicle";
import { runtime } from "../../state/runtime";
import { useTwin } from "../../state/store";
import { setAnchor } from "../labels";
import { setOpacity, setVisible } from "../mutate";
import { view } from "../viewState";
import { LANE_WIDTH, ROAD_Z } from "./layout";

/** Chart extent along the road, relative to the vehicle centre, m; height of the plot area, m. */
export const CHART = { x0: -8, x1: 12, y0: 0.12, h: 0.9, z: ROAD_Z + LANE_WIDTH / 2 + 0.05 };
const N = 160;
const RX = DEFAULT_VEHICLE.receiverOffset;
/** Scratch arrays for the chart's points (there is one chart). */
const buf = { x: new Float32Array(N), y: new Float32Array(N) };

/** A ribbon (triangle strip as triangles) through up to N points, `w` thick. */
function ribbon(): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(N * 2 * 3), 3));
  const idx: number[] = [];
  for (let i = 0; i < N - 1; i++) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  g.setIndex(idx);
  return g;
}

/** Writes the points into the ribbon; unused points collapse onto the last one. */
function fill(g: BufferGeometry, xs: Float32Array, ys: Float32Array, n: number, w: number) {
  const p = g.getAttribute("position") as BufferAttribute;
  for (let i = 0; i < N; i++) {
    const k = Math.min(i, Math.max(0, n - 1));
    const x = n ? xs[k] : 0;
    const y = n ? ys[k] : -10;
    p.setXYZ(2 * i, x, y - w / 2, 0);
    p.setXYZ(2 * i + 1, x, y + w / 2, 0);
  }
  p.needsUpdate = true;
  g.computeBoundingSphere();
}

export function CouplingChart() {
  const geo = useMemo(() => ({ ahead: ribbon(), behind: ribbon(), power: ribbon() }), []);
  const m = useMemo(
    () => ({
      panel: new MeshBasicMaterial({ color: "#05080d", transparent: true, opacity: 0.55, depthWrite: false, side: DoubleSide }),
      axis: new MeshBasicMaterial({ color: "#8d97a4", transparent: true, opacity: 0.8, depthWrite: false }),
      ahead: new MeshBasicMaterial({ color: new Color("#5ad1ff"), transparent: true, opacity: 0.45, depthWrite: false, side: DoubleSide }),
      behind: new MeshBasicMaterial({ color: new Color("#7fe7ff"), transparent: true, opacity: 0.95, depthWrite: false, side: DoubleSide }),
      power: new MeshBasicMaterial({ color: new Color("#f5b041"), transparent: true, opacity: 0.95, depthWrite: false, side: DoubleSide }),
      marker: new MeshBasicMaterial({ color: "#e9eef3", transparent: true, opacity: 0.9, depthWrite: false }),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(m).forEach((x) => x.dispose());
    },
    [geo, m],
  );
  const root = useRef<Group>(null);

  useFrame(() => {
    const s = useTwin.getState();
    const on = s.environment === "dynamic" && view.coupling > 0.02;
    setVisible(root.current, on);
    if (!on) return;
    const a = view.coupling;
    for (const mat of [m.panel, m.axis, m.ahead, m.behind, m.power, m.marker]) setOpacity(mat, (mat === m.panel ? 0.55 : mat === m.ahead ? 0.45 : 0.95) * a, 2);
    const sim = runtime.road;
    const st = sim.state;
    const lateral = s.road.lateral;
    const mPeak = Math.max(1e-9, segmentM(sim, Math.abs(lateral)));
    const pScale = Math.max(5000, s.road.receiverRating);
    const yOf = (v: number, max: number) => CHART.y0 + CHART.h * Math.min(1.05, Math.max(0, v / max));
    // Ahead: the coupling profile the receiver will meet, if each pad energises when it is under it.
    let n = 0;
    for (let i = 0; i < N; i++) {
      const xr = RX + ((CHART.x1 - RX) * i) / (N - 1);
      const xw = st.x + xr;
      let mm = 0;
      for (const seg of st.segments) {
        if (Math.abs(seg.x - xw) > 1.6 || seg.index === s.road.failedSegment) continue;
        mm += segmentM(sim, Math.hypot(xw - seg.x, lateral));
      }
      buf.x[n] = xr;
      buf.y[n] = yOf(mm, mPeak);
      n++;
    }
    fill(geo.ahead, buf.x, buf.y, n, 0.025);
    // Behind: what the simulation recorded as the vehicle passed (newest first, back to the chart's edge).
    const samples = st.samples;
    const stride = Math.max(1, Math.ceil(((CHART.x0 - RX) * -1) / Math.max(0.5, st.v) / 0.01 / N));
    const pts: { x: number; m: number; p: number }[] = [];
    for (let i = samples.length - 1; i >= 0 && pts.length < N; i -= stride) {
      let dx = samples[i].x - st.x;
      if (dx > 500) dx -= 1000;
      if (dx < -500) dx += 1000;
      const xr = dx + RX;
      if (xr < CHART.x0) break;
      pts.push({ x: xr, m: samples[i].mTotal, p: samples[i].pReceived });
    }
    pts.reverse();
    pts.forEach((q, i) => {
      buf.x[i] = q.x;
      buf.y[i] = yOf(q.m, mPeak);
    });
    fill(geo.behind, buf.x, buf.y, pts.length, 0.035);
    pts.forEach((q, i) => {
      buf.y[i] = yOf(q.p, pScale);
    });
    fill(geo.power, buf.x, buf.y, pts.length, 0.03);
    setAnchor("chart-m", RX - 3.2, CHART.y0 + CHART.h + 0.5, CHART.z);
    setAnchor("chart-p", RX - 3.2, CHART.y0 + CHART.h + 0.2, CHART.z);
    setAnchor("chart-ahead", RX + 5, CHART.y0 + CHART.h + 0.35, CHART.z);
    setAnchor("chart-rx", RX, CHART.y0 - 0.02, CHART.z);
  });

  const w = CHART.x1 - CHART.x0;
  return (
    <group ref={root} visible={false}>
      <group position={[0, 0, CHART.z]}>
        <mesh material={m.panel} position={[(CHART.x0 + CHART.x1) / 2, CHART.y0 + CHART.h / 2 + 0.03, -0.01]} renderOrder={6}>
          <planeGeometry args={[w + 0.3, CHART.h + 0.28]} />
        </mesh>
        <mesh material={m.axis} position={[(CHART.x0 + CHART.x1) / 2, CHART.y0, 0]} renderOrder={7}>
          <planeGeometry args={[w, 0.012]} />
        </mesh>
        <mesh material={m.marker} position={[RX, CHART.y0 + CHART.h / 2, 0.002]} renderOrder={8}>
          <planeGeometry args={[0.02, CHART.h + 0.1]} />
        </mesh>
        <mesh geometry={geo.ahead} material={m.ahead} renderOrder={8} />
        <mesh geometry={geo.behind} material={m.behind} renderOrder={9} />
        <mesh geometry={geo.power} material={m.power} renderOrder={9} />
      </group>
    </group>
  );
}
