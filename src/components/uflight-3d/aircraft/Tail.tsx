// Tail: a fin on the end of each boom, joined at the top by the horizontal
// tail, which sits high and clear of the wing and rotor wake. Rudders and the
// elevator are separate, hinged surfaces with their actuators.
import { useMemo } from "react";
import type { Vec3 } from "../types";
import { frame } from "../scene/frameState";
import { BOOM, TAIL } from "./layout";
import { type AirfoilSection, airfoilLoft, cached } from "./geometry";
import { Cyl, Geo } from "./materials";
import { Part } from "./Part";
import { Hinge } from "./Wing";

const { fin, horizontal, elevator, rudder } = TAIL;
const GAP = 0.02;

const finU = (y: number) => (y - fin.rootY) / (fin.tipY - fin.rootY);
const finLe = (y: number) => fin.rootLeX + (fin.tipLeX - fin.rootLeX) * finU(y);
const finChord = (y: number) => fin.rootChord + (fin.tipChord - fin.rootChord) * finU(y);

const finSection = (y: number, z: number): AirfoilSection => ({
  le: [finLe(y), y, z],
  chord: finChord(y),
  thickness: fin.thickness,
  chordDir: [-1, 0, 0],
  thickDir: [0, 0, 1],
});

/** The tailplane narrows a little toward its tips, outboard of the fins. */
const tailChord = (z: number) => horizontal.chord * (Math.abs(z) > BOOM.z ? 1 - 0.22 * ((Math.abs(z) - BOOM.z) / (horizontal.halfSpan - BOOM.z)) : 1);
const tailSection = (z: number): AirfoilSection => ({
  le: [horizontal.leX - (horizontal.chord - tailChord(z)) * 0.3, horizontal.y, z],
  chord: tailChord(z),
  thickness: horizontal.thickness,
  chordDir: [-1, 0, 0],
  thickDir: [0, 1, 0],
});

const finHinge = (y: number, z: number): Vec3 => [finLe(y) - finChord(y) * rudder.hingeFraction, y, z];
const tailHinge = (z: number): Vec3 => [tailSection(z).le[0] - tailChord(z) * elevator.hingeFraction, horizontal.y, z];

function Fin({ side }: { side: "left" | "right" }) {
  const z = (side === "left" ? -1 : 1) * BOOM.z;
  const { box, lower, upper, surface } = useMemo(() => {
    const ys = [fin.rootY, rudder.fromY, rudder.toY, fin.tipY];
    return {
      box: cached(`fin-${side}`, () => airfoilLoft(ys.map((y) => finSection(y, z)), { to: rudder.hingeFraction, capEnd: true, chordPoints: 10 })),
      lower: cached(`fin-lower-${side}`, () => airfoilLoft([finSection(fin.rootY, z), finSection(rudder.fromY - GAP, z)], { from: rudder.hingeFraction, capEnd: true, chordPoints: 5 })),
      upper: cached(`fin-upper-${side}`, () => airfoilLoft([finSection(rudder.toY + GAP, z), finSection(fin.tipY, z)], { from: rudder.hingeFraction, capStart: true, capEnd: true, chordPoints: 5 })),
      surface: cached(`rudder-${side}`, () => airfoilLoft([finSection(rudder.fromY, z), finSection(rudder.toY, z)], { from: rudder.hingeFraction + 0.015, capStart: true, capEnd: true, chordPoints: 6 })),
    };
  }, [side, z]);
  const hingeFrom = useMemo(() => finHinge(rudder.fromY, z), [z]);
  const hingeTo = useMemo(() => finHinge(rudder.toY, z), [z]);
  return (
    <>
      <Part id={`vertical-tail-${side}`}>
        <Geo geometry={box} mat="paint" doubleSide />
        <Geo geometry={lower} mat="paint" doubleSide />
        <Geo geometry={upper} mat="paint" doubleSide />
      </Part>
      <Part id={`rudder-${side}`}>
        <Hinge from={hingeFrom} to={hingeTo} angle={() => frame.surfaces.rudder}>
          <Geo geometry={surface} mat="paint" doubleSide />
        </Hinge>
      </Part>
    </>
  );
}

function HorizontalTail() {
  const { box, tips, surface } = useMemo(() => {
    const all = [-horizontal.halfSpan, -BOOM.z, 0, BOOM.z, horizontal.halfSpan];
    return {
      box: cached("tailplane", () => airfoilLoft(all.map(tailSection), { to: elevator.hingeFraction, capStart: true, capEnd: true, chordPoints: 10 })),
      tips: [-1, 1].map((sign) =>
        cached(`tailplane-tip-${sign}`, () =>
          airfoilLoft([tailSection(sign * (elevator.halfSpan + GAP)), tailSection(sign * horizontal.halfSpan)], { from: elevator.hingeFraction, capStart: true, capEnd: true, chordPoints: 5 }),
        ),
      ),
      surface: cached("elevator", () => airfoilLoft([-elevator.halfSpan, 0, elevator.halfSpan].map(tailSection), { from: elevator.hingeFraction + 0.015, capStart: true, capEnd: true, chordPoints: 6 })),
    };
  }, []);
  const hingeFrom = useMemo(() => tailHinge(-elevator.halfSpan), []);
  const hingeTo = useMemo(() => tailHinge(elevator.halfSpan), []);
  return (
    <>
      <Part id="horizontal-tail">
        <Geo geometry={box} mat="paint" doubleSide />
        {tips.map((geometry, i) => (
          <Geo key={i} geometry={geometry} mat="paint" doubleSide />
        ))}
      </Part>
      <Part id="elevator">
        <Hinge from={hingeFrom} to={hingeTo} angle={() => frame.surfaces.elevator}>
          <Geo geometry={surface} mat="paint" doubleSide />
        </Hinge>
      </Part>
    </>
  );
}

/** One actuator for each rudder and two for the elevator, at the hinge lines. */
function TailActuators() {
  const elevatorHinge = tailHinge(0);
  return (
    <Part id="tail-actuators">
      {[-0.7, 0.7].map((z) => (
        <Cyl key={z} r={0.028} h={0.15} axis="x" mat="darkSteel" position={[elevatorHinge[0] + 0.1, horizontal.y - 0.005, z]} segments={14} />
      ))}
      {[-BOOM.z, BOOM.z].map((z) => {
        const hinge = finHinge((rudder.fromY + rudder.toY) / 2, z);
        return <Cyl key={z} r={0.026} h={0.15} axis="x" mat="darkSteel" position={[hinge[0] + 0.1, hinge[1], z]} segments={14} />;
      })}
    </Part>
  );
}

export default function Tail() {
  return (
    <group name="Tail">
      <group name="VerticalTailLeft">
        <Fin side="left" />
      </group>
      <group name="VerticalTailRight">
        <Fin side="right" />
      </group>
      <group name="HorizontalTail">
        <HorizontalTail />
      </group>
      <TailActuators />
    </group>
  );
}
