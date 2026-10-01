// Distributed electric propulsion: eight independent units. Four tilt on
// pylons ahead of the wing (lift in hover, thrust in cruise); four are fixed
// on the booms (lift only, stopped and aligned with the boom in cruise).
// Every unit can be opened down to its bearings, motor, inverter, controller,
// cooling interface and sensors.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, DoubleSide, type Group, type Mesh, type MeshBasicMaterial, SphereGeometry, type Texture } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { ComponentId, PropulsionPart, Vec3 } from "../types";
import { DEG } from "../lib/math";
import { frame } from "../scene/frameState";
import { ROTOR, UNIT_MOUNTS, UNIT_STATIONS, unitIndex, type UnitMount, type UnitStations } from "./layout";
import { bladeGeometry, cached, revolveX, smoothProfile } from "./geometry";
import { Box, Cable, Cyl, Geo, Mat, Ring } from "./materials";
import { Assembly, Deep, Part } from "./Part";

const id = (mount: UnitMount, part: PropulsionPart) => `pu${mount.no}-${part}` as ComponentId;

// ── Housings ──

const TILT_NACELLE = smoothProfile(
  [
    [-0.6, 0.015],
    [-0.5, 0.085],
    [-0.28, 0.172],
    [0.08, 0.218],
    [0.5, 0.215],
    [0.76, 0.188],
    [0.86, 0.172],
  ],
  26,
);
const TILT_SPINNER = smoothProfile(
  [
    [0.862, 0.17],
    [0.98, 0.15],
    [1.08, 0.095],
    [1.15, 0.03],
    [1.165, 0.0],
  ],
  12,
);
/** Lift-unit fairing: a low dome on top of the boom, around a pancake motor. */
const LIFT_FAIRING = smoothProfile(
  [
    [-0.02, 0.2],
    [0.1, 0.225],
    [0.26, 0.225],
    [0.36, 0.19],
    [0.4, 0.15],
  ],
  14,
);
const LIFT_CAP = smoothProfile(
  [
    [0.402, 0.148],
    [0.47, 0.13],
    [0.52, 0.07],
    [0.535, 0.0],
  ],
  12,
);

function Nacelle({ mount }: { mount: UnitMount }) {
  const tilt = mount.kind === "tilt";
  const shell = useMemo(() => cached(`nacelle-${mount.kind}`, () => revolveX(tilt ? TILT_NACELLE : LIFT_FAIRING, 28)), [mount.kind, tilt]);
  return (
    <Part id={id(mount, "nacelle")} nested>
      <Geo geometry={shell} mat="paint" doubleSide />
      {tilt && (
        <>
          {/* Cooling-air inlet under the nacelle, feeding the unit's own heat exchanger. */}
          <Box size={[0.3, 0.05, 0.16]} mat="graphite" position={[0.28, -0.222, 0]} radius={0.02} />
          {/* Trunnion bosses where the pylon arms carry the unit. */}
          {[-1, 1].map((sign) => (
            <Cyl key={sign} r={0.06} h={0.05} axis="z" mat="aluminium" position={[0, 0, sign * 0.225]} segments={18} />
          ))}
        </>
      )}
    </Part>
  );
}

// ── Rotor ──

let discTexture: Texture | null = null;

/** Soft-edged disc standing in for blade blur: strongest at mid-radius, gone at the hub and the tips. */
function getDiscTexture(): Texture {
  if (discTexture) return discTexture;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "#000000");
  gradient.addColorStop(0.16, "#000000");
  gradient.addColorStop(0.45, "#9a9a9a");
  gradient.addColorStop(0.8, "#ffffff");
  gradient.addColorStop(0.97, "#3a3a3a");
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  discTexture = new CanvasTexture(canvas);
  return discTexture;
}

export function disposeRotorTextures() {
  discTexture?.dispose();
  discTexture = null;
}

function Rotor({ mount, s }: { mount: UnitMount; s: UnitStations }) {
  const tilt = mount.kind === "tilt";
  const index = unitIndex(mount.no);
  const spin = useRef<Group>(null);
  const disc = useRef<Mesh>(null);
  const blade = useMemo(() => (tilt ? bladeGeometry(ROTOR.tiltRadius, 0.13, 0.22, 0.11, 46, 17) : bladeGeometry(ROTOR.liftRadius, 0.1, 0.18, 0.09, 21, 7)), [tilt]);
  const cap = useMemo(() => cached(`spinner-${mount.kind}`, () => revolveX(tilt ? TILT_SPINNER : LIFT_CAP, 22)), [mount.kind, tilt]);
  const count = tilt ? ROTOR.tiltBlades : ROTOR.liftBlades;
  const rotorId = id(mount, "rotor");

  useFrame(() => {
    if (spin.current) spin.current.rotation.x = frame.rotorAngle[index];
    const mesh = disc.current;
    if (!mesh) return;
    // A faint disc stands in for the blades' motion blur; it follows the part's own fade.
    const speed = Math.min(1, Math.abs(frame.rpm[index]) / 900);
    const opacity = 0.06 * speed * (frame.opacity.get(rotorId) ?? 1);
    mesh.visible = opacity > 0.004;
    (mesh.material as MeshBasicMaterial).opacity = opacity;
  });

  return (
    <Part id={rotorId} nested>
      <group ref={spin} name="Rotor">
        <group name="Hub">
          <Geo geometry={cap} mat="graphite" />
          <Cyl r={tilt ? 0.13 : 0.1} h={0.1} axis="x" mat="darkSteel" position={[s.hub, 0, 0]} segments={20} />
        </group>
        <group name="Blades" position={[s.hub, 0, 0]} scale={[1, 1, mount.spin]}>
          {Array.from({ length: count }, (_, i) => (
            <mesh key={i} geometry={blade} rotation={[(i * 2 * Math.PI) / count, 0, 0]} castShadow>
              <Mat k="carbon" repeat={[2, 14]} side={DoubleSide} />
            </mesh>
          ))}
        </group>
      </group>
      <mesh ref={disc} position={[s.hub + 0.01, 0, 0]} rotation={[0, Math.PI / 2, 0]} visible={false} renderOrder={3}>
        <circleGeometry args={[tilt ? ROTOR.tiltRadius : ROTOR.liftRadius, 56]} />
        <meshBasicMaterial color="#dfe6ee" alphaMap={getDiscTexture()} transparent opacity={0} side={DoubleSide} depthWrite={false} />
      </mesh>
    </Part>
  );
}

// ── Drive line ──

/** Nine rolling elements as one mesh. */
const ballsGeometry = (pitchRadius: number, ballRadius: number) =>
  cached(`balls-${pitchRadius}-${ballRadius}`, () =>
    mergeGeometries(
      Array.from({ length: 9 }, (_, i) => {
        const angle = (i / 9) * Math.PI * 2;
        return new SphereGeometry(ballRadius, 6, 4).translate(0, pitchRadius * Math.cos(angle), pitchRadius * Math.sin(angle));
      }),
    ),
  );

function Bearing({ mount, part, x }: { mount: UnitMount; part: "bearing-front" | "bearing-rear"; x: number }) {
  const partId = id(mount, part);
  const balls = ballsGeometry(0.056, 0.0125);
  return (
    <Part id={partId} nested>
      <group position={[x, 0, 0]} name={part === "bearing-front" ? "BearingFront" : "BearingRear"}>
        {/* Housing, outer race, rolling elements with their cage, inner race: they separate at component level. */}
        <Deep of={partId} explode={[-0.07, 0, 0]}>
          <Ring r={0.086} tube={0.011} mat="aluminium" />
        </Deep>
        <Ring r={0.07} tube={0.0105} mat="steel" />
        <Deep of={partId} explode={[0.07, 0, 0]}>
          <Geo geometry={balls} mat="steel" />
          <Ring r={0.056} tube={0.0045} mat="connector" segments={18} />
        </Deep>
        <Deep of={partId} explode={[0.14, 0, 0]}>
          <Ring r={0.042} tube={0.0105} mat="steel" />
        </Deep>
      </group>
    </Part>
  );
}

/** A hollow cylinder about X: stator iron, cooling jacket. */
const sleeve = (inner: number, outer: number, length: number) =>
  cached(`sleeve-${inner}-${outer}-${length}`, () =>
    revolveX(
      [
        [-length / 2, inner],
        [-length / 2, outer],
        [length / 2, outer],
        [length / 2, inner],
        [-length / 2, inner],
      ],
      28,
    ),
  );

function Motor({ mount, s }: { mount: UnitMount; s: UnitStations }) {
  const partId = id(mount, "motor");
  const r = s.motorRadius;
  const stator = sleeve(r * 0.78, r, s.motorLength);
  return (
    <Part id={partId} nested>
      <group position={[s.motor, 0, 0]} name="ElectricMotor">
        <group name="Stator">
          <Geo geometry={stator} mat="darkSteel" />
        </group>
        {/* End windings either side of the stator. */}
        <group name="Windings">
          <Deep of={partId} explode={[-0.12, 0, 0]}>
            <Ring r={r * 0.86} tube={r * 0.12} mat="copper" position={[-s.motorLength / 2 - 0.012, 0, 0]} />
          </Deep>
          <Deep of={partId} explode={[0.12, 0, 0]}>
            <Ring r={r * 0.86} tube={r * 0.12} mat="copper" position={[s.motorLength / 2 + 0.012, 0, 0]} />
          </Deep>
        </group>
        {/* Rotor: a magnet drum between two end plates, on the shaft. */}
        <group name="Rotor">
          <Deep of={partId} explode={[s.motorLength + 0.3, 0, 0]}>
            <Cyl r={r * 0.74} h={s.motorLength * 0.86} axis="x" mat="magnet" segments={32} />
            <Cyl r={r * 0.66} h={s.motorLength * 0.96} axis="x" mat="machined" segments={28} />
          </Deep>
        </group>
      </group>
    </Part>
  );
}

function Inverter({ mount, s }: { mount: UnitMount; s: UnitStations }) {
  const partId = id(mount, "inverter");
  const [w, h, d] = s.inverterSize;
  const tilt = mount.kind === "tilt";
  // Three phase leads from the inverter to the motor terminals.
  const phases = useMemo(
    () =>
      [-1, 0, 1].map((k): Vec3[] => {
        const from: Vec3 = tilt ? [s.inverter[0] + w / 2, s.inverter[1] + 0.02, k * 0.06] : [s.inverter[0] + 0.02, s.inverter[1] - h / 2, k * 0.05];
        const to: Vec3 = [s.motor - s.motorLength / 2 - 0.02, tilt ? s.motorRadius * 0.55 : s.motorRadius * 0.5, k * 0.07];
        return tilt ? [from, [from[0] + 0.06, from[1], from[2]], to] : [from, [from[0], from[1] - 0.08, from[2]], [to[0] - 0.06, to[1], to[2]], to];
      }),
    [s, w, h, tilt],
  );
  return (
    <Part id={partId} nested>
      <group position={s.inverter as [number, number, number]} name="Inverter">
        <Box size={[w, h * 0.8, d]} mat="enclosure" radius={0.016} />
        {/* Lid with cooling fins; lifts to show the power module at component level. */}
        <Deep of={partId} explode={[0, tilt ? 0.16 : 0, tilt ? 0 : 0.16]}>
          <Box size={[w * 0.96, h * 0.1, d * 0.96]} mat="enclosureLight" position={[0, h * 0.45, 0]} radius={0.006} />
          {[-0.3, -0.1, 0.1, 0.3].map((f) => (
            <Box key={f} size={[w * 0.9, h * 0.12, 0.012]} mat="radiator" position={[0, h * 0.54, f * d]} radius={0.003} />
          ))}
        </Deep>
        <Cyl r={h * 0.2} h={d * 0.5} axis="z" mat="plastic" position={[-w * 0.3, 0, 0]} segments={16} />
        <Box size={[0.03, h * 0.3, d * 0.5]} mat="connector" position={[-w / 2 - 0.012, 0, 0]} radius={0.006} />
      </group>
      {phases.map((points, i) => (
        <Cable key={i} points={points} radius={0.011} mat="cableHv" cornerRadius={0.04} />
      ))}
    </Part>
  );
}

function MotorController({ mount, s }: { mount: UnitMount; s: UnitStations }) {
  const [w, h, d] = s.controllerSize;
  return (
    <Part id={id(mount, "motor-controller")} nested>
      <group position={s.controller as [number, number, number]} name="MotorController">
        <Box size={[w, h, d]} mat="enclosureLight" radius={0.014} />
        <Box size={[w * 0.5, 0.012, d * 0.7]} mat="plastic" position={[0, h / 2 + 0.004, 0]} radius={0.004} />
        <Box size={[0.026, h * 0.34, d * 0.4]} mat="connector" position={[w / 2 + 0.01, 0, 0]} radius={0.005} />
      </group>
    </Part>
  );
}

function CoolingInterface({ mount, s }: { mount: UnitMount; s: UnitStations }) {
  const tilt = mount.kind === "tilt";
  const r = s.motorRadius;
  const jacket = sleeve(r + 0.004, r + 0.016, s.motorLength * 0.9);
  const { exchanger, hose } = useMemo(() => {
    const at: Vec3 = tilt ? [s.motor - 0.22, -r - 0.045, 0] : [s.motor - 0.06, r * 0.2, r + 0.03];
    const route: Vec3[] = [[s.motor, -r - 0.012, 0.03], [s.motor - 0.08, -r - 0.03, 0.03], at];
    return { exchanger: at, hose: route };
  }, [s, r, tilt]);
  return (
    <Part id={id(mount, "cooling-interface")} nested>
      <group name="CoolingInterface">
        {/* Jacket around the stator, a small heat exchanger in the inlet duct, and the hose between them. */}
        <Geo geometry={jacket} mat="coolantLine" position={[s.motor, 0, 0]} />
        {tilt && <Cable points={hose} radius={0.012} mat="coolantLine" cornerRadius={0.03} />}
        <group position={exchanger as [number, number, number]}>
          <Box size={tilt ? [0.2, 0.04, 0.15] : [0.12, 0.12, 0.03]} mat="radiator" radius={0.004} />
          {[-0.36, -0.12, 0.12, 0.36].map((f) => (
            <Box key={f} size={tilt ? [0.004, 0.05, 0.15] : [0.004, 0.13, 0.036]} mat="aluminium" position={[f * (tilt ? 0.2 : 0.12), 0, 0]} radius={0.001} />
          ))}
        </group>
      </group>
    </Part>
  );
}

function SensorSet({ mount, s }: { mount: UnitMount; s: UnitStations }) {
  const r = s.shellRadius - 0.09;
  // The devices themselves: two accelerometers on the bearing housings, three temperature probes, a current sensor.
  return (
    <Part id={id(mount, "sensors")} nested>
      <group name="Sensors">
        {[s.bearingFront, s.bearingRear].map((x) => (
          <group key={x} position={[x, r, 0]}>
            <Box size={[0.034, 0.03, 0.034]} mat="sensor" radius={0.006} />
            <Cyl r={0.007} h={0.03} mat="connector" position={[0, 0.03, 0]} segments={8} />
          </group>
        ))}
        <Cyl r={0.009} h={0.04} mat="sensor" position={[s.motor, s.motorRadius * 0.86, s.motorRadius * 0.5]} segments={8} />
        <Cyl r={0.009} h={0.036} mat="sensor" position={[s.bearingFront, 0.07, -0.07]} segments={8} />
        <Cyl r={0.009} h={0.03} mat="sensor" position={[s.inverter[0], s.inverter[1] + s.inverterSize[1] / 2 + 0.01, s.inverter[2] + 0.06]} segments={8} />
        <Ring r={0.022} tube={0.008} mat="sensor" position={[(s.inverter[0] + s.bearingRear) / 2, (s.inverter[1] + 0.02) / 2, 0.07]} segments={16} />
      </group>
    </Part>
  );
}

function TiltActuator({ mount }: { mount: UnitMount }) {
  // Fixed to the pylon: a rotary actuator on the inboard trunnion, the pivot shaft and the position sensor.
  const inboard = -mount.side;
  return (
    <Part id={id(mount, "tilt-actuator")} nested>
      <group position={mount.pivot as [number, number, number]} name="TiltActuator">
        <Cyl r={0.026} h={0.66} axis="z" mat="steel" segments={14} />
        <Cyl r={0.072} h={0.11} axis="z" mat="darkSteel" position={[0, 0, inboard * 0.355]} segments={24} />
        <Cyl r={0.05} h={0.05} axis="z" mat="machined" position={[0, 0, inboard * 0.43]} segments={20} />
        <group name="TiltPositionSensor">
          <Box size={[0.05, 0.04, 0.03]} mat="sensor" position={[0, 0.02, -inboard * 0.345]} radius={0.006} />
        </group>
      </group>
    </Part>
  );
}

function PropulsionUnit({ mount }: { mount: UnitMount }) {
  const tilt = mount.kind === "tilt";
  const s = UNIT_STATIONS[mount.kind];
  const frameGroup = useRef<Group>(null);

  useFrame(() => {
    // A tilt unit turns about its pivot; a lift unit's axis is fixed upright.
    if (frameGroup.current) frameGroup.current.rotation.z = (tilt ? frame.tiltDeg : 90) * DEG;
  });

  return (
    <Assembly id={mount.id} name={`PropulsionUnit${mount.no}`}>
      {tilt && <TiltActuator mount={mount} />}
      <group ref={frameGroup} position={mount.pivot as [number, number, number]} rotation={[0, 0, 90 * DEG]}>
        <Nacelle mount={mount} />
        <Rotor mount={mount} s={s} />
        <Part id={id(mount, "shaft")} nested>
          <group name="Shaft">
            <Cyl r={0.03} h={s.hub - s.resolver} axis="x" mat="steel" position={[(s.hub + s.resolver) / 2, 0, 0]} segments={16} />
          </group>
        </Part>
        <Bearing mount={mount} part="bearing-front" x={s.bearingFront} />
        <Bearing mount={mount} part="bearing-rear" x={s.bearingRear} />
        <Motor mount={mount} s={s} />
        <Part id={id(mount, "resolver")} nested>
          <group position={[s.resolver, 0, 0]} name="ResolverOrPositionSensor">
            <Cyl r={0.058} h={0.03} axis="x" mat="enclosureLight" segments={22} />
            <Box size={[0.03, 0.03, 0.022]} mat="connector" position={[0, 0.062, 0]} radius={0.005} />
          </group>
        </Part>
        <Inverter mount={mount} s={s} />
        <MotorController mount={mount} s={s} />
        <CoolingInterface mount={mount} s={s} />
        <SensorSet mount={mount} s={s} />
      </group>
    </Assembly>
  );
}

export default function Propulsion() {
  return (
    <group name="Propulsion">
      {UNIT_MOUNTS.map((mount) => (
        <PropulsionUnit key={mount.no} mount={mount} />
      ))}
    </group>
  );
}
