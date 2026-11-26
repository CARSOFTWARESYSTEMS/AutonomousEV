"use client";
// Charging in motion, made visible — every quantity from the road simulation
// (WPT-SIM-002) at the present step:
//  • each pad near the vehicle glows through the surface with its controller
//    energisation level (soft start and stop), so handover reads at a glance;
//  • a flux column between the road and the receiver, as bright as the power
//    the receiver takes (the magnetic link);
//  • inside the vehicle, the DC path receiver → compensation → rectifier →
//    DC–DC → junction box, splitting to the battery (flowing in when the
//    battery charges, out when it discharges) and to the drive motor
//    (traction power).
// Glow and flow are visual cues for calculated quantities, not emitted light.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, CanvasTexture, CatmullRomCurve3, Color, type Group, type Mesh, MeshBasicMaterial, ShaderMaterial, TubeGeometry, Vector3 } from "three";
import { runtime } from "../../state/runtime";
import { useTwin } from "../../state/store";
import { addUniform, setColor, setOpacity, setUniform, setVisible } from "../mutate";
import { POWER_POINTS } from "../vehicle/chassis";
import { NOMINAL_GAP } from "../vehicle/Vehicle";
import { view } from "../viewState";
import { ROAD_WINDING_Y, ROAD_Z } from "./layout";

const POOL = 8;
const RX_WINDING_NOMINAL = 0.036 + NOMINAL_GAP;

const flow = (color: string) =>
  new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { time: { value: 0 }, color: { value: new Color(color) }, level: { value: 0 }, repeat: { value: 9 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform float time; uniform vec3 color; uniform float level; uniform float repeat; varying vec2 vUv; void main(){ float d = fract(vUv.x * repeat - time); float dash = smoothstep(0.0, 0.18, d) * (1.0 - smoothstep(0.45, 0.72, d)); gl_FragColor = vec4(color * (0.7 + 1.8 * dash), level * (0.16 + 0.84 * dash)); }",
  });

/** The flux column: rings rising from the road to the receiver. */
const column = () =>
  new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: 2,
    uniforms: { time: { value: 0 }, color: { value: new Color("#67e8f9") }, level: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform float time; uniform vec3 color; uniform float level; varying vec2 vUv; void main(){ float rings = 0.5 + 0.5 * sin((vUv.y * 9.0 - time) * 6.2831); float edge = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y); gl_FragColor = vec4(color * (0.6 + 1.4 * rings), level * edge * (0.12 + 0.5 * rings)); }",
  });

function glowTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,0.85)");
  r.addColorStop(0.55, "rgba(255,255,255,0.45)");
  r.addColorStop(0.8, "rgba(255,255,255,0.9)");
  r.addColorStop(0.86, "rgba(255,255,255,0.15)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

const tube = (pts: [number, number, number][], r: number) => new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), 64, r, 8, false);

const ACTIVE = new Color("#22d3ee");
const SOFT = new Color("#fbbf24");

export function RoadEnergy() {
  const glowTex = useMemo(() => glowTexture(), []);
  const glowMats = useMemo(() => Array.from({ length: POOL }, () => new MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0, toneMapped: false, color: ACTIVE.clone() })), [glowTex]);
  const mats = useMemo(() => ({ rx: flow("#67e8f9"), dc: flow("#34d399"), battery: flow("#34d399"), motor: flow("#fbbf24"), column: column() }), []);
  const geo = useMemo(() => {
    const P = POWER_POINTS;
    return {
      rx: tube([P.receiver, P.compensation, [1.3, 0.36, 0.2], P.rectifier, P.dcdc, [1.3, 0.42, -0.3], P.junction], 0.03),
      battery: tube([P.junction, [0.6, P.junction[1] - 0.01, -0.2], P.battery], 0.03),
      motor: tube([P.junction, [0.4, 0.4, -0.42], [-0.6, 0.38, -0.36], P.motor], 0.028),
    };
  }, []);
  useEffect(
    () => () => {
      glowTex.dispose();
      glowMats.forEach((m) => m.dispose());
      Object.values(mats).forEach((m) => m.dispose());
      Object.values(geo).forEach((g) => g.dispose());
    },
    [glowTex, glowMats, mats, geo],
  );
  const glows = useRef<(Mesh | null)[]>([]);
  const car = useRef<Group>(null);
  const col = useRef<Mesh>(null);

  useFrame((_, dt) => {
    const s = useTwin.getState();
    const on = s.environment === "dynamic";
    const strength = on ? Math.max(view.energy, 0.55 * (1 - view.studio) * (1 - view.roadField)) : 0;
    const sim = runtime.road;
    const st = sim.state;
    const r = s.road;
    const rating = Math.max(5000, r.receiverRating);
    // Pads near the vehicle: glow with their energisation level.
    let k = 0;
    if (on) {
      for (const seg of st.segments) {
        const x = seg.x - st.x;
        if (x < -6 || x > 8 || k >= POOL) continue;
        const m = glows.current[k];
        const mat = glowMats[k];
        k++;
        if (!m) continue;
        setVisible(m, seg.level > 0.01 || seg.state === "blocked");
        m.position.set(x, 0.008, ROAD_Z);
        m.scale.setScalar(r.segmentDiameter * 1.18);
        setColor(mat, seg.state === "blocked" ? SOFT : ACTIVE);
        setOpacity(mat, strength * (seg.state === "blocked" ? 0.35 : 0.85 * seg.level), 2);
      }
    }
    for (; k < POOL; k++) setVisible(glows.current[k], false);
    // The magnetic link and the vehicle's DC path.
    const pr = Math.max(0, st.pReceived);
    const level = (p: number) => (p > 50 ? 0.3 + 0.7 * Math.min(1, p / rating) : 0);
    const lift = r.airGap - (RX_WINDING_NOMINAL - ROAD_WINDING_Y);
    if (col.current) {
      setVisible(col.current, on && pr > 50);
      const top = ROAD_WINDING_Y + r.airGap;
      col.current.position.set(POWER_POINTS.receiver[0], (ROAD_WINDING_Y + top) / 2 + 0.01, ROAD_Z - r.lateral);
      col.current.scale.set(1, Math.max(0.02, top - ROAD_WINDING_Y), 1);
    }
    addUniform(mats.column, "time", dt * (0.6 + 2 * Math.min(1, pr / rating)));
    setUniform(mats.column, "level", strength * level(pr) * 1.4);
    const inner = on ? Math.max(view.energy, 0.0) : 0;
    if (car.current) {
      setVisible(car.current, inner > 0.02);
      car.current.position.set(0, lift, ROAD_Z - r.lateral);
    }
    const drive = (m: ShaderMaterial, p: number, dir = 1) => {
      addUniform(m, "time", dir * dt * (0.5 + 2.2 * Math.min(1, Math.abs(p) / rating)));
      setUniform(m, "level", inner * level(Math.abs(p)));
    };
    drive(mats.rx, pr);
    drive(mats.battery, st.pBattery, st.pBattery >= 0 ? 1 : -1);
    drive(mats.motor, Math.max(0, st.pTraction));
  });

  return (
    <group>
      {Array.from({ length: POOL }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            glows.current[i] = el;
          }}
          material={glowMats[i]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
          renderOrder={3}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
      <mesh ref={col} material={mats.column} visible={false} renderOrder={4}>
        <cylinderGeometry args={[0.24, 0.24, 1, 40, 1, true]} />
      </mesh>
      <group ref={car} visible={false}>
        <mesh geometry={geo.rx} material={mats.rx} renderOrder={4} />
        <mesh geometry={geo.battery} material={mats.battery} renderOrder={4} />
        <mesh geometry={geo.motor} material={mats.motor} renderOrder={4} />
      </group>
    </group>
  );
}
