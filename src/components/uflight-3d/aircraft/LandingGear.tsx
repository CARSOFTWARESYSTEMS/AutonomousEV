// Landing gear: a fixed tricycle arrangement. The nose gear has a telescopic
// strut into the forward keel frame; each main gear is a composite leaf leg
// into the rear keel frame. Simple, light and easy to maintain.
import { useMemo } from "react";
import type { Vec3 } from "../types";
import { GEAR } from "./layout";
import { boxLoft, cached, strut } from "./geometry";
import { Cyl, Geo, Mat } from "./materials";
import { Part } from "./Part";

function Wheel({ position, radius, width = 0.12 }: { position: Vec3; radius: number; width?: number }) {
  const tube = width / 2;
  return (
    <group position={position as [number, number, number]}>
      <mesh castShadow receiveShadow>
        <torusGeometry args={[radius - tube, tube, 10, 28]} />
        <Mat k="rubber" />
      </mesh>
      <Cyl r={radius - tube * 1.15} h={width * 0.78} axis="z" mat="aluminium" segments={24} />
      <Cyl r={radius * 0.22} h={width * 1.02} axis="z" mat="darkSteel" segments={16} />
    </group>
  );
}

function NoseGear() {
  const { mount, axle, wheelRadius } = GEAR.nose;
  const fork = useMemo(
    () =>
      [-1, 1].map((sign) =>
        cached(`nose-fork-${sign}`, () => strut([axle[0] - 0.04, axle[1] + wheelRadius + 0.05, sign * 0.08], [axle[0], axle[1], sign * 0.08], 0.03, 0.022, [0, 0, 1])),
      ),
    [axle, wheelRadius],
  );
  const top = axle[1] + wheelRadius + 0.05;
  return (
    <Part id="nose-gear">
      {/* Outer cylinder and the sliding strut. */}
      <Cyl r={0.038} h={mount[1] - top + 0.16} mat="aluminium" position={[mount[0], (mount[1] + top) / 2 + 0.08, 0]} segments={18} />
      <Cyl r={0.026} h={0.14} mat="steel" position={[mount[0] + 0.03, top + 0.03, 0]} segments={16} />
      <Cyl r={0.022} h={0.2} axis="z" mat="darkSteel" position={[axle[0] - 0.04, top, 0]} segments={12} />
      {fork.map((geometry, i) => (
        <Geo key={i} geometry={geometry} mat="aluminium" />
      ))}
      <Cyl r={0.014} h={0.2} axis="z" mat="steel" position={axle} segments={10} />
      <Wheel position={axle} radius={wheelRadius} width={0.11} />
    </Part>
  );
}

function MainGear({ side }: { side: "left" | "right" }) {
  const sign = side === "left" ? -1 : 1;
  const { mountX, mountY, mountZ, axleX, axleY, axleZ, wheelRadius } = GEAR.main;
  // A leaf leg: wide and thin, sweeping out and down from the fuselage side to the axle.
  const leg = useMemo(
    () =>
      cached(`main-leg-${side}`, () => {
        const points: Vec3[] = [
          [mountX, mountY, sign * (mountZ - 0.22)],
          [mountX - 0.02, mountY - 0.03, sign * mountZ],
          [(mountX + axleX) / 2, (mountY + axleY) / 2 + 0.03, sign * (mountZ + (axleZ - mountZ) * 0.6)],
          [axleX, axleY + 0.02, sign * (axleZ - 0.09)],
        ];
        return boxLoft(points.map((centre, i) => ({ centre, right: [0.085 - i * 0.012, 0, 0] as Vec3, up: [0, 0.02 - i * 0.002, 0] as Vec3 })));
      }),
    [side, sign, mountX, mountY, mountZ, axleX, axleY, axleZ],
  );
  const axle: Vec3 = [axleX, axleY, sign * axleZ];
  return (
    <Part id={`main-gear-${side}`}>
      <Geo geometry={leg} mat="carbon" repeat={[10, 1]} />
      <Cyl r={0.016} h={0.2} axis="z" mat="steel" position={[axleX, axleY, sign * (axleZ - 0.04)]} segments={10} />
      {/* Brake disc inboard of the wheel. */}
      <Cyl r={wheelRadius * 0.55} h={0.012} axis="z" mat="darkSteel" position={[axleX, axleY, sign * (axleZ - 0.085)]} segments={24} />
      <Wheel position={axle} radius={wheelRadius} width={0.13} />
    </Part>
  );
}

export default function LandingGear() {
  return (
    <group name="LandingGear">
      <group name="NoseGear">
        <NoseGear />
      </group>
      <group name="LeftMainGear">
        <MainGear side="left" />
      </group>
      <group name="RightMainGear">
        <MainGear side="right" />
      </group>
    </group>
  );
}
