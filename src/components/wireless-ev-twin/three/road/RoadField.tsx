"use client";
// The road's magnetic field, computed by WPT-EM-005 from the road
// simulation's own state every frame: a vertical section through the
// receiver centre that either follows the receiver or stays fixed at one
// road segment, coloured by RMS flux density; field lines of the in-plane
// field at the chosen phase of the 85 kHz cycle; optional vector arrows and
// decade contours. De-energised and failed segments contribute nothing, so
// the field appears and disappears with the segments. The per-ampere basis
// is built a few rows per frame, so the render loop never stalls.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferGeometry, Color, ConeGeometry, DataTexture, DoubleSide, Float32BufferAttribute, type Group, type InstancedMesh, Line, LinearFilter, Matrix4, type Mesh, MeshBasicMaterial, Quaternion, RGBAFormat, ShaderMaterial, UnsignedByteType, Vector3 } from "three";
import { type FieldKernel, fieldKernelStep, instantaneous, fieldAt, roadExcitation, roadFieldConfig, roadFieldLines, roadFieldSection, type RoadFieldSection, type SectionSpec } from "@/lib/wireless-charging/roadField";
import { runtime } from "../../state/runtime";
import { useTwin } from "../../state/store";
import { niceCeil, paintFieldTexels } from "../fieldScale";
import { addUniform, markUpdated, setOpacity, setUniform } from "../mutate";
import { view } from "../viewState";
import { roadFieldInfo } from "./fieldInfo";
import { ROAD_WINDING_Y, ROAD_Z } from "./layout";

const NX = 120;
const NZ = 40;
const HALF = 1.5;


const lineShader = () =>
  new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { time: { value: 0 }, color: { value: new Color("#e9f6ff") }, opacity: { value: 0 } },
    vertexShader: "attribute float along; varying float vA; void main(){ vA = along; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform float time; uniform vec3 color; uniform float opacity; varying float vA; void main(){ float d = fract(vA * 16.0 - time); float a = smoothstep(0.0, 0.25, d) * (1.0 - smoothstep(0.55, 0.9, d)); gl_FragColor = vec4(color, opacity * (0.22 + 0.78 * a)); }",
  });

const ARROWS = { nx: 18, nz: 6 };
const m4 = new Matrix4();
const q4 = new Quaternion();
const v3 = new Vector3();
const up = new Vector3(0, 1, 0);
const sc = new Vector3();

export function RoadField() {
  const tex = useMemo(() => {
    const t = new DataTexture(new Uint8Array(NX * NZ * 4), NX, NZ, RGBAFormat, UnsignedByteType);
    t.magFilter = LinearFilter;
    t.minFilter = LinearFilter;
    return t;
  }, []);
  const planeMat = useMemo(() => new MeshBasicMaterial({ map: tex, transparent: true, side: DoubleSide, depthWrite: false, opacity: 0, toneMapped: false }), [tex]);
  const lineMat = useMemo(() => lineShader(), []);
  const arrowGeo = useMemo(() => new ConeGeometry(0.011, 0.045, 8).translate(0, 0.0225, 0), []);
  const arrowMat = useMemo(() => new MeshBasicMaterial({ color: "#f8fafc", transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false }), []);
  useEffect(
    () => () => {
      tex.dispose();
      planeMat.dispose();
      lineMat.dispose();
      arrowGeo.dispose();
      arrowMat.dispose();
    },
    [tex, planeMat, lineMat, arrowGeo, arrowMat],
  );
  const plane = useRef<Mesh>(null);
  const lines = useRef<Group>(null);
  const arrows = useRef<InstancedMesh>(null);
  const work = useRef<{ kernel: FieldKernel | null; key: string; section: RoadFieldSection | null; lastLines: number; theta: number }>({ kernel: null, key: "", section: null, lastLines: 0, theta: 0 });

  useFrame((_, dt) => {
    const show = view.roadField > 0.02 && useTwin.getState().environment === "dynamic";
    if (plane.current) plane.current.visible = show;
    if (lines.current) lines.current.visible = show;
    if (arrows.current) arrows.current.visible = false;
    if (!show) return;
    const w = work.current;
    const sim = runtime.road;
    const fd = useTwin.getState().fieldDisplay;
    // The basis for this geometry (segment pad, receiver pad, air gap): reuse, or build a little more of it.
    const config = roadFieldConfig(sim);
    const key = `${sim.key}|${config.airGap}`;
    if (key !== w.key) {
      w.key = key;
      w.kernel = null;
    }
    if (!w.kernel) w.kernel = fieldKernelStep(config, 5);
    roadFieldInfo.ready = Boolean(w.kernel);
    if (!w.kernel) return;
    const k = w.kernel;
    const ex = roadExcitation(sim);
    // Section: through the receiver centre (lateral offset), following it or fixed at a segment.
    let centre = ex.receiver.x;
    let segIndex = -1;
    if (fd.section === "segment") {
      const segs = sim.state.segments;
      const chosen = fd.segment !== null ? segs[fd.segment] : segs.find((s) => s.x > ex.receiver.x - 0.2);
      if (chosen) {
        centre = chosen.x;
        segIndex = chosen.index;
      }
    }
    const spec: SectionSpec = { x0: centre - HALF, x1: centre + HALF, y: ex.receiver.y, nx: NX, nz: NZ };
    if (fd.sweep) w.theta = (w.theta + dt * Math.PI) % (Math.PI * 2);
    else w.theta = useTwin.getState().fieldPhase;
    w.section = roadFieldSection(k, ex, spec, w.theta, w.section ?? undefined);
    const sec = w.section;
    const full = niceCeil(Math.max(sec.max, 1e-7));
    paintFieldTexels(tex.image.data as Uint8Array, sec.brms, fd.scale, full, fd.contours, 220);
    markUpdated(tex);
    Object.assign(roadFieldInfo, { atReceiver: sec.atReceiver, max: sec.max, full, active: ex.sources.filter((s) => s.coil === "tx").length, segment: segIndex, theta: w.theta });
    setOpacity(planeMat, 0.92 * view.roadField, 2);
    // Place the section in the vehicle frame: road x − vehicle x; lateral y → z = ROAD_Z − y; road winding plane at ROAD_WINDING_Y.
    const x0 = sim.state.x;
    if (plane.current) {
      plane.current.position.set(centre - x0, ROAD_WINDING_Y + (sec.z0 + sec.z1) / 2, ROAD_Z - spec.y);
      plane.current.scale.set(spec.x1 - spec.x0, sec.z1 - sec.z0, 1);
    }
    // Field lines: retraced a few times a second (they follow the phase and the moving sources).
    const now = performance.now();
    if (lines.current) {
      lines.current.visible = fd.lines;
      if (fd.lines && now - w.lastLines > (fd.sweep ? 90 : 260)) {
        w.lastLines = now;
        rebuild(lines.current, roadFieldLines(k, ex, spec, w.theta, 20), spec.y, x0, lineMat);
      } else if (fd.lines) shift(lines.current, x0);
      addUniform(lineMat, "time", dt * 0.5);
      setUniform(lineMat, "opacity", 0.85 * view.roadField);
    }
    // Vector arrows of the in-plane instantaneous field.
    const a = arrows.current;
    if (a && fd.vectors) {
      a.visible = true;
      let n = 0;
      const b = { re: [0, 0, 0] as [number, number, number], im: [0, 0, 0] as [number, number, number] };
      for (let iz = 0; iz < ARROWS.nz; iz++) {
        const z = sec.z0 + ((sec.z1 - sec.z0) * (iz + 0.5)) / ARROWS.nz;
        for (let ix = 0; ix < ARROWS.nx; ix++) {
          const x = spec.x0 + ((spec.x1 - spec.x0) * (ix + 0.5)) / ARROWS.nx;
          fieldAt(k, ex.sources, x, spec.y, z, b);
          const f = instantaneous(b, w.theta);
          const mag = Math.hypot(f[0], f[2]);
          const s = mag > 0 ? Math.min(1.4, Math.max(0, 0.35 + 0.22 * Math.log10(mag / 1e-6))) : 0;
          v3.set(f[0], f[2], 0).normalize();
          q4.setFromUnitVectors(up, mag > 0 ? v3 : up);
          sc.setScalar(s);
          m4.compose(v3.set(x - x0, ROAD_WINDING_Y + z, ROAD_Z - spec.y + 0.002), q4, sc);
          a.setMatrixAt(n++, m4);
        }
      }
      a.count = n;
      a.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh ref={plane} material={planeMat} visible={false} renderOrder={5}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <group ref={lines} visible={false} renderOrder={6} />
      <instancedMesh ref={arrows} args={[arrowGeo, arrowMat, ARROWS.nx * ARROWS.nz]} visible={false} frustumCulled={false} renderOrder={7} />
    </group>
  );
}

/** Replaces the field lines (road-frame x stored, so they can be shifted with the vehicle between retraces). */
function rebuild(g: Group, traced: number[][], y: number, x0: number, mat: ShaderMaterial) {
  for (const child of [...g.children]) {
    (child as Mesh).geometry?.dispose();
    g.remove(child);
  }
  for (const pts of traced) {
    const positions: number[] = [];
    const along: number[] = [];
    let s = 0;
    for (let i = 0; i < pts.length; i += 2) {
      if (i > 0) s += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
      positions.push(pts[i], ROAD_WINDING_Y + pts[i + 1], ROAD_Z - y + 0.003);
      along.push(s);
    }
    const geom = new BufferGeometry();
    geom.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geom.setAttribute("along", new Float32BufferAttribute(along, 1));
    g.add(new Line(geom, mat));
  }
  shift(g, x0);
}

function shift(g: Group, x0: number) {
  g.position.x = -x0;
}
