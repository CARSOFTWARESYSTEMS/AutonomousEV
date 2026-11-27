"use client";
// Entry and exit gates: barrier housing with its local controller, the boom
// (its angle is the barrier controller's, from the simulation), the
// recognition camera on its pole, the RFID/QR pedestal at the driver's
// window, the clear-zone beam posts after the barrier, and the entry
// guidance sign drawn from the allocation engine's counts.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, Color, type Group, MeshStandardMaterial, SRGBColorSpace } from "three";
import type { Layout } from "@/lib/wireless-charging/smart-parking/layout";
import { facilityIfBuilt } from "../../state/runtime";
import { setAnchor } from "../labels";
import { markUpdated, setEmissive, setRotation } from "../mutate";
import { pick } from "../pick";
import { drawSign, stripeTexture } from "./textures";

const BOOM = 5.1;
const PIVOT_Y = -3.05;

function useDispose(items: { dispose(): void }[]) {
  useEffect(() => () => items.forEach((x) => x.dispose()), [items]);
}

function Gate({ id, layout, m }: { id: "entry" | "exit"; layout: Layout; m: ReturnType<typeof materials> }) {
  const g = id === "entry" ? layout.entry : layout.exit;
  const boom = useRef<Group>(null);
  const lamp = useMemo(() => new MeshStandardMaterial({ color: "#111", emissive: new Color("#e5534b"), emissiveIntensity: 1.6 }), []);
  useDispose(useMemo(() => [lamp], [lamp]));
  useFrame(() => {
    const sim = facilityIfBuilt();
    if (!sim) return;
    const b = sim.gates[id].barrier;
    setRotation(boom.current, "x", (b.angle * Math.PI) / 180);
    setEmissive(lamp, b.angle >= 85 ? "#3fb950" : b.angle > 1 ? "#d9a441" : "#e5534b", 1.8);
    setAnchor(`gate-${id}`, g.barrierX, 1.9, -PIVOT_Y);
    setAnchor(`anpr-${id}`, g.barrierX + 1.0, 1.75, 2.55);
  });
  return (
    <group>
      {/* Barrier housing (drive, controller and position sensor inside) and its status lamp. */}
      <group position={[g.barrierX, 0.15, -PIVOT_Y]} {...pick("sp-barrier-motor")}>
        <mesh material={m.housing} position={[0, 0.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 1.1, 0.38]} />
        </mesh>
        <mesh material={m.stripe} position={[0, 0.25, 0.192]}>
          <planeGeometry args={[0.42, 0.08]} />
        </mesh>
        <mesh material={lamp} position={[0, 1.13, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.05, 16]} />
        </mesh>
      </group>
      {/* The boom: closed along the lane's width (toward −z), opening upward about the x axis. */}
      <group ref={boom} position={[g.barrierX, 1.02, -PIVOT_Y]}>
        <mesh material={m.boom} position={[0, 0, -BOOM / 2]} castShadow {...pick("sp-barrier-arm")}>
          <boxGeometry args={[0.07, 0.1, BOOM]} />
        </mesh>
        <mesh material={m.rubber} position={[0, -0.06, -BOOM / 2]}>
          <boxGeometry args={[0.05, 0.03, BOOM - 0.2]} />
        </mesh>
      </group>
      {/* Clear-zone beam posts after the barrier. */}
      {[-2.05, 2.05].map((y) => (
        <group key={y} position={[g.beamX, 0.15, -y]} {...pick("sp-presence-sensor")}>
          <mesh material={m.post} position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.09, 0.8, 0.09]} />
          </mesh>
          <mesh material={m.lens} position={[0, 0.55, y > 0 ? 0.05 : -0.05]}>
            <boxGeometry args={[0.06, 0.06, 0.02]} />
          </mesh>
        </group>
      ))}
      {/* Recognition camera on its pole just past the barrier, looking back at the front plate of the vehicle at the stop line. */}
      <group position={[g.barrierX + 1.0, 0.15, 2.55]} {...pick("sp-anpr-camera")}>
        <mesh material={m.post} position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 1.4, 12]} />
        </mesh>
        <group position={[0, 1.45, 0]} rotation={[0, Math.PI - 0.55, -0.22]}>
          <mesh material={m.housing} castShadow>
            <boxGeometry args={[0.34, 0.13, 0.15]} />
          </mesh>
          <mesh material={m.ir} position={[0.18, 0, 0]}>
            <boxGeometry args={[0.02, 0.1, 0.12]} />
          </mesh>
        </group>
      </group>
      {/* RFID / QR pedestal at the driver's window (right-hand drive: the vehicle's right side). */}
      <group position={[g.stopX - 2.0, 0.15, 2.4]} rotation={[0, Math.PI, 0]}>
        <mesh material={m.housing} position={[0, 0.55, 0]} castShadow {...pick("sp-rfid")}>
          <boxGeometry args={[0.28, 1.1, 0.22]} />
        </mesh>
        <mesh material={m.screen} position={[0, 0.95, 0.112]} {...pick("sp-qr")}>
          <planeGeometry args={[0.2, 0.14]} />
        </mesh>
        <mesh material={m.ir} position={[0, 0.72, 0.112]}>
          <planeGeometry args={[0.16, 0.1]} />
        </mesh>
      </group>
    </group>
  );
}

function materials(stripes: CanvasTexture) {
  return {
    housing: new MeshStandardMaterial({ color: "#2a3038", metalness: 0.55, roughness: 0.38 }),
    boom: new MeshStandardMaterial({ map: stripes, roughness: 0.45, metalness: 0.1 }),
    rubber: new MeshStandardMaterial({ color: "#111214", roughness: 0.9 }),
    stripe: new MeshStandardMaterial({ color: "#d7a92a", roughness: 0.6 }),
    post: new MeshStandardMaterial({ color: "#6d737b", metalness: 0.8, roughness: 0.4 }),
    lens: new MeshStandardMaterial({ color: "#1b0606", emissive: new Color("#ff3030"), emissiveIntensity: 0.9 }),
    ir: new MeshStandardMaterial({ color: "#0d0f12", emissive: new Color("#4a1515"), emissiveIntensity: 0.5, roughness: 0.2 }),
    screen: new MeshStandardMaterial({ color: "#05080c", emissive: new Color("#2d7fbf"), emissiveIntensity: 0.9, roughness: 0.2 }),
  };
}

/** The entry guidance sign, redrawn twice a second from the counts and the last allocation. */
function GuidanceSign({ layout, m }: { layout: Layout; m: ReturnType<typeof materials> }) {
  const { tex, ctx } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 768;
    c.height = 256;
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    return { tex: t, ctx: c.getContext("2d")! };
  }, []);
  const face = useMemo(() => new MeshStandardMaterial({ color: "#000000", map: tex, emissiveMap: tex, emissive: new Color("#ffffff"), emissiveIntensity: 1.25, roughness: 0.35 }), [tex]);
  useDispose(useMemo(() => [tex, face], [tex, face]));
  const next = useRef(0);
  useFrame(({ clock }) => {
    const sim = facilityIfBuilt();
    if (!sim || clock.elapsedTime < next.current) return;
    next.current = clock.elapsedTime + 0.5;
    const free = sim.bays.filter((b) => b.status === "available").length;
    const wireless = sim.bays.filter((b) => b.status === "available" && b.bay.type === "wireless").length;
    const current = sim.gates.entry.current ? sim.sessions.get(sim.gates.entry.current) : null;
    const closed = sim.env.alarm !== "none" ? `${sim.env.alarm === "smoke" ? "Smoke" : "Gas"} alarm (simulated)` : !sim.gatewayUp ? "Gateway unavailable — exits open" : null;
    drawSign(ctx, 768, 256, { free, total: sim.bays.length, wireless, bay: current?.bayId ?? null, closed, region: sim.inputs.region === "IN" ? "INDIA · POC" : sim.inputs.region === "US" ? "USA" : "CHINA" });
    markUpdated(tex);
  });
  const x = layout.entry.barrierX - 7.4;
  return (
    <group position={[x, 0.15, 4.1]} {...pick("sp-led-display")}>
      {[-0.7, 0.7].map((dz) => (
        <mesh key={dz} material={m.post} position={[0, 1.25, dz]} castShadow>
          <boxGeometry args={[0.08, 2.5, 0.08]} />
        </mesh>
      ))}
      <mesh material={m.housing} position={[0, 2.25, 0]} castShadow>
        <boxGeometry args={[0.12, 0.62, 1.8]} />
      </mesh>
      {/* The face looks west, toward approaching drivers. */}
      <mesh material={face} position={[-0.065, 2.25, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.74, 0.58]} />
      </mesh>
    </group>
  );
}

export function Gates({ layout }: { layout: Layout }) {
  const stripes = useMemo(() => {
    const t = stripeTexture();
    t.repeat.set(1, 1);
    return t;
  }, []);
  const m = useMemo(() => materials(stripes), [stripes]);
  useDispose(useMemo(() => [stripes, ...Object.values(m)], [stripes, m]));
  return (
    <group>
      <Gate id="entry" layout={layout} m={m} />
      <Gate id="exit" layout={layout} m={m} />
      <GuidanceSign layout={layout} m={m} />
    </group>
  );
}
