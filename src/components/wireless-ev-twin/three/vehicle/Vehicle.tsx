"use client";
// The vehicle: lofted body, wheels that roll by distance and steer by the
// kinematic model, and — for the hero vehicle — the chassis, battery,
// powertrain, receiver electronics and receiver pad. The body rides at the
// height that gives the simulated air gap; the wheels stay on the ground.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type BufferGeometry, type Color, type Group, type Material, MeshBasicMaterial, type MeshStandardMaterial, SphereGeometry } from "three";
import { DEFAULT_RX_PAD } from "@/lib/wireless-charging/coils";
import { contactShadowTexture, CHASSIS_MATERIALS, type ChassisMaterials, bodyMaterials, wheelMaterials } from "../materials";
import { setClearcoat, setEmissive, setOpacity } from "../mutate";
import { pick } from "../pick";
import { Pad } from "../station/Pad";
import { view, vehicleLayers } from "../viewState";
import { buildBody, buildInterior, surfaceZ, TRACK, WHEEL_RADIUS, WHEEL_X } from "./body";
import { buildChassis, type ChassisPart } from "./chassis";
import { brakeDiscGeometry, caliperGeometry, rimBarrelGeometry, rimFaceGeometry, treadTexture, tyreGeometry } from "./wheel";

/** Winding plane of the receiver pad in the vehicle frame at nominal ride height (0.15 m above the ground pad's winding). */
export const RX_MOUNT_Y = 0.036 + 0.15 + 0.034;
export const RX_X = 0.6;
/** Nominal air gap the body is modelled at; the ride height moves the body by (gap − nominal). */
export const NOMINAL_GAP = 0.15;

let shared: {
  body: ReturnType<typeof buildBody>;
  interior: ReturnType<typeof buildInterior>;
  tyre: BufferGeometry;
  rimFace: BufferGeometry;
  rimBarrel: BufferGeometry;
  disc: BufferGeometry;
  caliper: BufferGeometry;
  chassis: ChassisPart[];
  wheelMats: ReturnType<typeof wheelMaterials>;
  shadow: ReturnType<typeof contactShadowTexture>;
  mirror: BufferGeometry;
} | null = null;

/** Geometry and wheel materials built once and shared by every vehicle in the scene. */
function assets() {
  if (!shared) {
    const body = buildBody();
    shared = {
      body,
      interior: buildInterior(),
      tyre: tyreGeometry(),
      rimFace: rimFaceGeometry(),
      rimBarrel: rimBarrelGeometry(),
      disc: brakeDiscGeometry(),
      caliper: caliperGeometry(),
      chassis: buildChassis(),
      wheelMats: wheelMaterials(treadTexture()),
      shadow: contactShadowTexture(),
      mirror: mirrorGeometry(),
    };
  }
  return shared;
}

function mirrorGeometry(): BufferGeometry {
  // A rounded housing: a squashed sphere.
  const g = new SphereGeometry(0.1, 20, 12);
  g.scale(0.95, 0.55, 1.25);
  return g;
}

export interface VehiclePose {
  x: number;
  z: number;
  heading: number;
  /** Wheel rotation from distance travelled, rad. */
  spin: number;
  /** Front-wheel steering angle (positive turns left), rad. */
  steer?: number;
  /** Body height above nominal ride height, m (from the air gap). */
  lift?: number;
}

interface VehicleProps {
  pose: () => VehiclePose;
  paint?: string;
  /** Chassis, battery, powertrain and receiver: the hero vehicle only. */
  detailed?: boolean;
  rxTurns?: number;
  rxGlow?: () => number;
  rxHeat?: () => Color | null;
  batteryHeat?: () => Color | null;
  /** Registry id the body selects (the hero vehicle). */
  bodyId?: string;
}

const WHEELS = [
  { x: WHEEL_X, side: 1, front: true },
  { x: WHEEL_X, side: -1, front: true },
  { x: -WHEEL_X, side: 1, front: false },
  { x: -WHEEL_X, side: -1, front: false },
];

const damp = (a: number, b: number, rate: number, dt: number) => a + (b - a) * (1 - Math.exp(-rate * dt));

export function Vehicle({ pose, paint = "#d7dce2", detailed = false, rxTurns = DEFAULT_RX_PAD.turns, rxGlow, rxHeat, batteryHeat, bodyId }: VehicleProps) {
  const a = assets();
  const bm = useMemo(() => bodyMaterials(paint), [paint]);
  const bodyMats = useMemo(() => [bm.paint, bm.glass, bm.trim, bm.lampFront, bm.lampRear, bm.seam], [bm]);
  // Each layer gets its own copies, so the X-ray and isolation views can fade layers independently.
  const layerMats = useMemo(() => (detailed ? { chassis: CHASSIS_MATERIALS(), battery: CHASSIS_MATERIALS(), power: CHASSIS_MATERIALS() } : null), [detailed]);
  const shadowMat = useMemo(() => new MeshBasicMaterial({ map: a.shadow, transparent: true, depthWrite: false, opacity: 0.85, color: "#000000" }), [a.shadow]);
  const root = useRef<Group>(null);
  const bodyGroup = useRef<Group>(null);
  const wheels = useRef<({ steer: Group | null; spin: Group | null; place: Group | null })[]>(WHEELS.map(() => ({ steer: null, spin: null, place: null })));
  const parts = useRef<(Group | null)[]>([]);
  const rx = useRef<Group>(null);
  const mirrorZ = useMemo(() => surfaceZ(0.9, 1.0) + 0.06, []);

  useFrame((_, dt) => {
    const p = pose();
    const lift = p.lift ?? 0;
    const g = root.current;
    if (g) {
      g.position.set(p.x, lift, p.z);
      g.rotation.y = p.heading;
    }
    const e = detailed ? view.assembly : 0;
    WHEELS.forEach((w, i) => {
      const r = wheels.current[i];
      if (r.place) {
        r.place.position.set(w.x, WHEEL_RADIUS - lift, w.side * (TRACK / 2 + 0.35 * e));
      }
      if (r.steer) r.steer.rotation.y = w.front ? (p.steer ?? 0) : 0;
      if (r.spin) r.spin.rotation.z = -p.spin * w.side;
    });
    if (!detailed) return;
    const L = vehicleLayers();
    if (bodyGroup.current) {
      bodyGroup.current.position.y = 1.25 * e;
      bodyGroup.current.visible = L.body > 0.01;
    }
    setOpacity(bm.paint, damp(bm.paint.opacity, L.body, 8, dt), 0.6);
    setClearcoat(bm.paint, bm.paint.opacity);
    for (const m of [bm.trim, bm.lampFront, bm.lampRear, bm.seam, bm.cladding, bm.liner, bm.interior, bm.display]) setOpacity(m, bm.paint.opacity, 0.6);
    setOpacity(bm.glass, damp(bm.glass.opacity, L.glass, 8, dt), 2);
    if (layerMats) {
      for (const [layer, mats] of Object.entries(layerMats) as [keyof typeof layerMats, ChassisMaterials][]) {
        const o = L[layer];
        for (const m of Object.values(mats)) setOpacity(m as Material, o, 0.5);
      }
      // Battery isolation: the lid lifts and turns translucent over the modules.
      setOpacity(layerMats.battery.lid, L.battery * (1 - 0.82 * view.battery), 0.5);
      const h = batteryHeat?.() ?? null;
      setEmissive(layerMats.battery.module, h ?? "#000000", h ? 0.8 : 0);
    }
    a.chassis.forEach((part, i) => {
      const grp = parts.current[i];
      if (!grp) return;
      const [dx, dy, dz] = part.explode;
      // Battery isolation lifts the lid clear of the modules.
      const lid = part.key === "lid" ? 0.3 * view.battery : 0;
      grp.position.set(dx * e, dy * e + lid, dz * e);
    });
    if (rx.current) rx.current.visible = true;
  });

  const body = a.body;
  return (
    <group ref={root}>
      {/* Soft contact shadow, on the ground under the body. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} material={shadowMat} renderOrder={1}>
        <planeGeometry args={[5.3, 2.4]} />
      </mesh>
      <group ref={bodyGroup}>
        <mesh geometry={body.geometry} material={bodyMats} castShadow receiveShadow {...(bodyId ? pick(bodyId) : {})} />
        <mesh geometry={body.arches} material={bm.cladding} castShadow />
        <mesh geometry={body.liners} material={bm.liner} />
        <mesh geometry={a.interior.cabin} material={bm.interior} />
        <mesh geometry={a.interior.display} material={bm.display} />
        {/* Mirrors on short stalks at the A-pillar base, and flush door handles. */}
        {[1, -1].map((s) => (
          <group key={s} position={[0.86, 1.02, s * mirrorZ]}>
            <mesh geometry={a.mirror} material={bm.paint} castShadow />
            <mesh material={bm.trim} position={[0.05, -0.02, -s * 0.07]}>
              <boxGeometry args={[0.07, 0.03, 0.07]} />
            </mesh>
          </group>
        ))}
        {[0.42, -0.72].flatMap((x) =>
          [1, -1].map((s) => (
            <mesh key={`${x}${s}`} material={bm.trim} position={[x, 0.93, s * (surfaceZ(x, 0.93) + 0.002)]}>
              <boxGeometry args={[0.2, 0.022, 0.008]} />
            </mesh>
          )),
        )}
      </group>
      {WHEELS.map((w, i) => (
        <group
          key={i}
          ref={(el) => {
            wheels.current[i].place = el;
          }}
          position={[w.x, WHEEL_RADIUS, (w.side * TRACK) / 2]}
        >
          <group
            ref={(el) => {
              wheels.current[i].steer = el;
            }}
          >
            {/* Facing outward: the left wheels as built, the right wheels turned about the vertical. */}
            <group rotation={[0, w.side > 0 ? 0 : Math.PI, 0]}>
              <group
                ref={(el) => {
                  wheels.current[i].spin = el;
                }}
              >
                <mesh geometry={a.tyre} material={a.wheelMats.tyre} castShadow />
                <mesh geometry={a.rimBarrel} material={a.wheelMats.rimBarrel} />
                <mesh geometry={a.rimFace} material={a.wheelMats.rimFace} castShadow />
                <mesh geometry={a.disc} material={a.wheelMats.disc} position={[0, 0, -0.02]} />
              </group>
              <mesh geometry={a.caliper} material={a.wheelMats.caliper} position={[0, 0, -0.02]} />
            </group>
          </group>
        </group>
      ))}
      {detailed && layerMats && (
        <>
          {a.chassis.map((part, i) => (
            <group
              key={part.key}
              ref={(el) => {
                parts.current[i] = el;
              }}
            >
              <mesh geometry={part.geometry} material={layerMats[part.layer][part.material] as MeshStandardMaterial} castShadow={part.layer !== "battery"} {...(part.component ? pick(part.component) : {})} />
            </group>
          ))}
          {/* Receiver pad under the battery, 0.6 m ahead of the vehicle centre. */}
          <group ref={rx} position={[RX_X, RX_MOUNT_Y, 0]}>
            <Pad side="vehicle" turns={rxTurns} inner={DEFAULT_RX_PAD.innerRadius} outer={DEFAULT_RX_PAD.outerRadius} glow={rxGlow} heat={rxHeat} />
          </group>
        </>
      )}
    </group>
  );
}
