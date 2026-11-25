"use client";
// The hero assemblies: the vehicle (body, glass, wheels, lights, battery,
// power electronics and receiver pad) and the charging pads (housing, Litz
// winding, ferrite, aluminium shield). Every selectable mesh carries a
// component id from the registry. Geometry follows the simulated pad turns.
import { useMemo, useRef } from "react";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { BoxGeometry, type Color, CylinderGeometry, type Group } from "three";
import { DEFAULT_RX_PAD, DEFAULT_TX_PAD } from "@/lib/wireless-charging/coils";
import { useTwin } from "../state/store";
import { ferriteBars, padHousing, rimGeometry, spiralCoil, tyreGeometry, vehicleGeometry, WHEEL_RADIUS, WHEEL_X } from "./geometry";
import { MATERIALS, type Materials } from "./materials";
import { setClearcoat, setEmissive, setOpacity } from "./mutate";
import { view } from "./viewState";

let carGeometry: (ReturnType<typeof vehicleGeometry> & { tyre: ReturnType<typeof tyreGeometry>; rim: ReturnType<typeof rimGeometry> }) | null = null;
/** Body, glass, tyre and rim geometry, built once and shared by every vehicle. */
const sharedVehicleGeometry = () => (carGeometry ??= { ...vehicleGeometry(), tyre: tyreGeometry(), rim: rimGeometry() });

let bank: Materials | null = null;
/** Shared materials, created once on first use (module scope, so render stays pure). */
export const mats = (): Materials => (bank ??= MATERIALS());

/** Pointer handlers that select and hover a registry component. */
export function pick(id: string) {
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.delta > 5) return;
      useTwin.getState().select(id);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      useTwin.setState({ hovered: id });
    },
    onPointerOut: () => {
      if (useTwin.getState().hovered === id) useTwin.setState({ hovered: null });
    },
    userData: { component: id },
  };
}

const damp = (a: number, b: number, rate: number, dt: number) => a + (b - a) * (1 - Math.exp(-rate * dt));

// ── Pads ───────────────────────────────────────────────────────────────────

interface PadProps {
  turns: number;
  inner: number;
  outer: number;
  /** "ground": winding above ferrite, cover on top. "vehicle": mirrored. */
  side: "ground" | "vehicle";
  /** 0–1 coil glow (current). */
  glow?: () => number;
  /** Tint for the thermal view, or null. */
  heat?: () => Color | null;
}

/** A pad assembly built from its real layers. Exploded view separates them. */
export function Pad({ turns, inner, outer, side, glow, heat }: PadProps) {
  const m = mats();
  const s = side === "ground" ? 1 : -1;
  const radius = outer + 0.045;
  const coil = useMemo(() => spiralCoil(inner, outer, turns, 0.0062), [inner, outer, turns]);
  const bars = useMemo(() => ferriteBars(inner, outer + 0.01, 12, 0.012, 0.05, 0), [inner, outer]);
  const housing = useMemo(() => padHousing(radius, 0.06), [radius]);
  const copper = useMemo(() => m.copper.clone(), [m]);
  const cover = useMemo(() => m.housing.clone(), [m]);
  const layers = useRef<(Group | null)[]>([]);
  useFrame((_, dt) => {
    const ex = view.exploded;
    const offsets = [0.26, 0.13, 0.05, -0.03];
    layers.current.forEach((g, i) => {
      if (g) g.position.y = damp(g.position.y, s * (ex * offsets[i]), 6, dt);
    });
    const g = glow ? glow() : 0;
    const h = heat?.() ?? null;
    setEmissive(copper, h ?? "#ff8a3d", h ? 0.9 : 0.15 + 1.6 * g);
    setOpacity(cover, damp(cover.opacity, view.reveal > 0.5 ? 0.14 : 1, 6, dt));
  });
  // Registry ids: the vehicle pad's ferrite and shield are one component.
  const ids = side === "ground" ? { cover: "tx-shield", coil: "tx-coil", ferrite: "tx-ferrite", plate: "tx-shield" } : { cover: "rx-ferrite", coil: "rx-coil", ferrite: "rx-ferrite", plate: "rx-ferrite" };
  return (
    <group scale={[1, s, 1]}>
      {/* Cover (top for the ground pad). */}
      <group ref={(g) => { layers.current[0] = g; }}>
        <mesh geometry={housing} material={cover} castShadow receiveShadow {...pick(ids.cover)} />
      </group>
      {/* Litz winding. */}
      <group ref={(g) => { layers.current[1] = g; }}>
        <mesh geometry={coil} material={copper} position={[0, 0.034, 0]} castShadow {...pick(ids.coil)} />
      </group>
      {/* Ferrite bars. */}
      <group ref={(g) => { layers.current[2] = g; }}>
        <mesh geometry={bars} material={m.ferrite} position={[0, 0.022, 0]} {...pick(ids.ferrite)} />
      </group>
      {/* Aluminium back plate. */}
      <group ref={(g) => { layers.current[3] = g; }}>
        <mesh material={m.aluminium} position={[0, 0.008, 0]} {...pick(ids.plate)}>
          <cylinderGeometry args={[radius - 0.01, radius - 0.01, 0.006, 72]} />
        </mesh>
      </group>
    </group>
  );
}

// ── Vehicle ────────────────────────────────────────────────────────────────

export interface Pose {
  x: number;
  z: number;
  heading: number;
  /** Wheel rotation, rad. */
  spin: number;
}

interface VehicleProps {
  pose: () => Pose;
  paint?: string;
  /** Internals (battery, electronics, receiver pad) for the hero vehicle. */
  detailed?: boolean;
  rxTurns?: number;
  /** Air gap between windings, m: places the receiver pad. */
  airGap?: () => number;
  rxGlow?: () => number;
  rxHeat?: () => Color | null;
  batteryHeat?: () => Color | null;
}

export function Vehicle({ pose, paint, detailed = false, rxTurns = DEFAULT_RX_PAD.turns, airGap, rxGlow, rxHeat, batteryHeat }: VehicleProps) {
  const m = mats();
  const { lower, glass, tyre, rim } = sharedVehicleGeometry();
  const body = useMemo(() => {
    const p = m.paint.clone();
    if (paint) p.color.set(paint);
    return p;
  }, [m, paint]);
  const glassMat = useMemo(() => m.glass.clone(), [m]);
  const battery = useMemo(() => m.module.clone(), [m]);
  const root = useRef<Group>(null);
  const wheels = useRef<(Group | null)[]>([]);
  const rxPad = useRef<Group>(null);
  const modules = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) out.push([-1.25 + i * 0.5, (j - 0.5) * 0.66]);
    return out;
  }, []);
  useFrame((_, dt) => {
    const p = pose();
    const g = root.current;
    if (g) {
      g.position.set(p.x, 0, p.z);
      g.rotation.y = p.heading;
    }
    wheels.current.forEach((w, i) => {
      if (w) w.rotation.y = (i % 2 === 0 ? 1 : -1) * p.spin;
    });
    const xr = detailed ? view.xray : 0;
    setOpacity(body, damp(body.opacity, 1 - 0.88 * xr, 6, dt), 0.6);
    setClearcoat(body, body.opacity);
    setOpacity(glassMat, damp(glassMat.opacity, 0.88 - 0.8 * xr, 6, dt), 2);
    if (rxPad.current && airGap) rxPad.current.position.y = 0.03 + airGap() + 0.03;
    const h = batteryHeat?.() ?? null;
    setEmissive(battery, h ?? "#000000", h ? 0.8 : 0);
  });
  return (
    <group ref={root}>
      <mesh geometry={lower} material={body} castShadow receiveShadow {...(detailed ? pick("vcu") : {})} />
      <mesh geometry={glass} material={glassMat} castShadow {...(detailed ? pick("vcu") : {})} />
      {/* Side skirts (the underside stays open so the receiver pad can be seen). */}
      {[1, -1].map((side) => (
        <mesh key={`sk${side}`} material={m.trim} position={[0, 0.26, side * 0.9]}>
          <boxGeometry args={[2.1, 0.08, 0.06]} />
        </mesh>
      ))}
      {/* Full-width light signatures, lower intake and rear diffuser. */}
      <mesh material={m.emissiveWhite} position={[2.405, 0.6, 0]}>
        <boxGeometry args={[0.03, 0.018, 1.46]} />
      </mesh>
      {[1, -1].map((side) => (
        <mesh key={`hl${side}`} material={m.emissiveWhite} position={[2.37, 0.625, side * 0.66]} rotation={[0, side * 0.35, 0]}>
          <boxGeometry args={[0.05, 0.035, 0.3]} />
        </mesh>
      ))}
      <mesh material={m.trim} position={[2.42, 0.34, 0]}>
        <boxGeometry args={[0.04, 0.09, 1.25]} />
      </mesh>
      <mesh material={m.emissiveRed} position={[-2.405, 0.8, 0]}>
        <boxGeometry args={[0.03, 0.03, 1.62]} />
      </mesh>
      <mesh material={m.trim} position={[-2.37, 0.3, 0]}>
        <boxGeometry args={[0.06, 0.12, 1.5]} />
      </mesh>
      {[1, -1].map((side) => (
        <mesh key={side} material={m.trim} position={[0.72, 0.97, side * 0.98]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.2, 0.08, 0.14]} />
        </mesh>
      ))}
      {/* Wheels. */}
      {[
        [WHEEL_X, 1],
        [WHEEL_X, -1],
        [-WHEEL_X, 1],
        [-WHEEL_X, -1],
      ].map(([x, side], i) => (
        <group key={i} position={[x, WHEEL_RADIUS, side * 0.82]} rotation={[side > 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0]}>
          <group ref={(g) => { wheels.current[i] = g; }}>
            <mesh geometry={tyre} material={m.tyre} castShadow />
            <mesh geometry={rim} material={m.rim} />
          </group>
        </group>
      ))}
      {detailed && (
        <>
          {/* Battery pack: twelve modules in a tray, visible in X-ray. */}
          <group position={[-0.1, 0.24, 0]} {...pick("battery-pack")}>
            <mesh material={m.trim} position={[0, -0.04, 0]}>
              <boxGeometry args={[3.2, 0.03, 1.5]} />
            </mesh>
            {modules.map(([x, z], i) => (
              <mesh key={i} material={battery} position={[x, 0.05, z]}>
                <boxGeometry args={[0.46, 0.12, 0.62]} />
              </mesh>
            ))}
            <mesh material={m.emissiveGreen} position={[1.42, 0.08, 0]} {...pick("bms")}>
              <boxGeometry args={[0.16, 0.06, 0.3]} />
            </mesh>
          </group>
          {/* Front electronics: rectifier, DC–DC, junction box, compensation, traction drive. */}
          <mesh material={m.heatsink} position={[1.05, 0.42, 0.25]} {...pick("rectifier")}>
            <boxGeometry args={[0.28, 0.12, 0.26]} />
          </mesh>
          <mesh material={m.cabinet} position={[1.05, 0.42, -0.2]} {...pick("dcdc")}>
            <boxGeometry args={[0.3, 0.14, 0.32]} />
          </mesh>
          <mesh material={m.capacitor} position={[0.72, 0.36, 0]} {...pick("rx-compensation")}>
            <boxGeometry args={[0.18, 0.08, 0.36]} />
          </mesh>
          <mesh material={m.module} position={[1.75, 0.5, 0]} {...pick("traction")}>
            <cylinderGeometry args={[0.16, 0.16, 0.5, 24]} />
          </mesh>
          <mesh material={m.hvCable} position={[0.35, 0.33, 0.3]} rotation={[0, 0, Math.PI / 2]} {...pick("hv-junction")}>
            <cylinderGeometry args={[0.018, 0.018, 1.2, 8]} />
          </mesh>
          {/* Receiver pad under the floor, 0.6 m ahead of the vehicle centre. */}
          <group ref={rxPad} position={[0.6, 0.2, 0]}>
            <Pad side="vehicle" turns={rxTurns} inner={DEFAULT_RX_PAD.innerRadius} outer={DEFAULT_RX_PAD.outerRadius} glow={rxGlow} heat={rxHeat} />
          </group>
        </>
      )}
    </group>
  );
}

/** A ground pad assembly at the origin of its group. */
export function GroundPad({ turns, glow, heat }: { turns: number; glow?: () => number; heat?: () => Color | null }) {
  return (
    <group position={[0, 0.002, 0]}>
      <Pad side="ground" turns={turns} inner={DEFAULT_TX_PAD.innerRadius} outer={DEFAULT_TX_PAD.outerRadius} glow={glow} heat={heat} />
    </group>
  );
}

/** The roadside or wall-mounted power-electronics cabinet, with its internals visible when opened. */
export function Cabinet({ heat }: { heat?: () => Color | null }) {
  const m = mats();
  const shell = useMemo(() => m.cabinet.clone(), [m]);
  const sink = useMemo(() => m.heatsink.clone(), [m]);
  const fins = useMemo(() => {
    const g = new BoxGeometry(0.012, 0.3, 0.22);
    return g;
  }, []);
  const cap = useMemo(() => new CylinderGeometry(0.035, 0.035, 0.12, 16), []);
  useFrame((_, dt) => {
    setOpacity(shell, damp(shell.opacity, view.reveal > 0.5 || view.xray > 0.5 ? 0.18 : 1, 6, dt));
    const h = heat?.() ?? null;
    setEmissive(sink, h ?? "#000000", h ? 0.8 : 0);
  });
  return (
    <group>
      <mesh material={shell} position={[0, 0.85, 0]} castShadow receiveShadow {...pick("inverter")}>
        <boxGeometry args={[0.62, 1.5, 0.4]} />
      </mesh>
      {/* Plinth and status light. */}
      <mesh material={m.concreteLight} position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[0.8, 0.1, 0.55]} />
      </mesh>
      <mesh material={m.emissiveGreen} position={[-0.315, 1.45, 0]}>
        <boxGeometry args={[0.01, 0.04, 0.2]} />
      </mesh>
      {/* Internals: PFC board, DC-link capacitors, inverter on its heatsink, controller and gateway. */}
      <group position={[0, 0.85, 0]}>
        <mesh position={[0.02, 0.4, 0]} {...pick("pfc")}>
          <boxGeometry args={[0.04, 0.32, 0.32]} />
          <meshStandardMaterial color="#0f3d2a" roughness={0.6} />
        </mesh>
        {[-0.1, 0, 0.1].map((z) => (
          <mesh key={z} geometry={cap} material={m.capacitor} position={[0.08, 0.12, z]} {...pick("dc-link")} />
        ))}
        <group position={[0, -0.18, 0]} {...pick("inverter")}>
          {Array.from({ length: 12 }, (_, i) => (
            <mesh key={i} geometry={fins} material={sink} position={[0.12 - i * 0.022, 0, 0]} />
          ))}
        </group>
        <mesh position={[0.05, -0.48, 0.08]} {...pick("station-controller")}>
          <boxGeometry args={[0.04, 0.16, 0.14]} />
          <meshStandardMaterial color="#123826" roughness={0.6} />
        </mesh>
        <mesh position={[0.05, -0.48, -0.1]} {...pick("iot-gateway")}>
          <boxGeometry args={[0.06, 0.1, 0.12]} />
          <meshStandardMaterial color="#1f2833" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
