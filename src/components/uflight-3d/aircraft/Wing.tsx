// Wing: skins and propulsion pylons, the structure inside (main spar, rear
// spar, ribs), the flaperons with their actuators, and the two booms that
// hang beneath the wing box and carry the lift units and the tail.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group, Quaternion, Vector3 } from "three";
import type { Vec3 } from "../types";
import { frame } from "../scene/frameState";
import { BOOM, TILT_Z, UNIT_MOUNTS, WING, wingChord, wingLeadingEdge, wingPoint, wingThickness, wingY } from "./layout";
import { type AirfoilSection, airfoilLoft, boxLoft, cached, revolveX, smoothProfile, strut } from "./geometry";
import { Cyl, Geo } from "./materials";
import { PYLON_ARM } from "./routes";
import { Part } from "./Part";

const CAMBER = 0.02;

const section = (z: number, thicknessScale = 1): AirfoilSection => ({
  le: [wingLeadingEdge(z), wingY(z), z],
  chord: wingChord(z),
  thickness: wingThickness(z) * thicknessScale,
  camber: CAMBER,
  chordDir: [-1, 0, 0],
  thickDir: [0, 1, 0],
});

const stations = (sign: number, list: readonly number[]) => list.map((z) => section(sign * z));

/** Small gap either side of a control surface, so it reads as a separate, moving part. */
const GAP = 0.025;
const HINGE = WING.hingeFraction;

/** A group that turns its children about the line from `from` to `to`. */
export function Hinge({ from, to, angle, children }: { from: Vec3; to: Vec3; angle: () => number; children: React.ReactNode }) {
  const pivot = useRef<Group>(null);
  const { orientation, inverse, back } = useMemo(() => {
    const origin = new Vector3(...from);
    const axis = new Vector3(...to).sub(origin).normalize();
    const q = new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), axis);
    const qInverse = q.clone().invert();
    return { orientation: q, inverse: qInverse, back: origin.clone().negate().applyQuaternion(qInverse) };
  }, [from, to]);
  useFrame(() => {
    if (pivot.current) pivot.current.rotation.x = angle();
  });
  return (
    <group position={from as [number, number, number]} quaternion={orientation}>
      <group ref={pivot}>
        <group quaternion={inverse} position={back}>
          {children}
        </group>
      </group>
    </group>
  );
}

function WingSkin({ side }: { side: "left" | "right" }) {
  const sign = side === "left" ? -1 : 1;
  const { box, inboardEdge, tipEdge, pylons } = useMemo(
    () => ({
      box: cached(`wing-box-${side}`, () => airfoilLoft(stations(sign, [0, WING.rootZ, BOOM.z, TILT_Z.inboard, TILT_Z.outboard, WING.semiSpan]), { to: HINGE, capEnd: true, chordPoints: 16 })),
      inboardEdge: cached(`wing-te-in-${side}`, () => airfoilLoft(stations(sign, [0, WING.rootZ, BOOM.z, WING.flaperon.from - GAP]), { from: HINGE, capEnd: true, chordPoints: 6 })),
      tipEdge: cached(`wing-te-tip-${side}`, () => airfoilLoft(stations(sign, [WING.flaperon.to + GAP, WING.semiSpan]), { from: HINGE, capStart: true, capEnd: true, chordPoints: 6 })),
      // Each tilt unit is carried between two arms that reach forward from the spar to the pivot.
      pylons: UNIT_MOUNTS.filter((m) => m.kind === "tilt" && m.side === sign).flatMap((mount) =>
        [-1, 1].map((arm) => {
          const z = mount.pivot[2] + arm * PYLON_ARM;
          const root: Vec3 = [wingLeadingEdge(z) - 0.34, wingY(z) - 0.01, z];
          return cached(`pylon-${mount.no}-${arm}`, () =>
            boxLoft([
              { centre: root, right: [0, 0, 0.03], up: [0, 0.085, 0] },
              { centre: [wingLeadingEdge(z) + 0.1, mount.pivot[1], z], right: [0, 0, 0.03], up: [0, 0.075, 0] },
              { centre: [mount.pivot[0] + 0.07, mount.pivot[1], z], right: [0, 0, 0.026], up: [0, 0.055, 0] },
            ]),
          );
        }),
      ),
    }),
    [side, sign],
  );
  return (
    <Part id={`wing-skin-${side}`}>
      <Geo geometry={box} mat="paint" doubleSide />
      <Geo geometry={inboardEdge} mat="paint" doubleSide />
      <Geo geometry={tipEdge} mat="paint" doubleSide />
      {pylons.map((geometry, i) => (
        <Geo key={i} geometry={geometry} mat="paint" />
      ))}
    </Part>
  );
}

const RIB_STATIONS = [0.9, BOOM.z, 3.3, TILT_Z.inboard, 5.5, TILT_Z.outboard] as const;
const SPAR_STATIONS = [0, WING.rootZ, BOOM.z, TILT_Z.inboard, TILT_Z.outboard, WING.semiSpan - 0.12] as const;

function WingStructure({ side }: { side: "left" | "right" }) {
  const sign = side === "left" ? -1 : 1;
  const { main, rear, ribs } = useMemo(() => {
    // Spar depth follows the section: about 85% of the local thickness at each spar's chord station.
    const spar = (fraction: number, depth: number, width: number) =>
      boxLoft(
        SPAR_STATIONS.map((z) => {
          const zs = sign * z;
          const c = wingChord(zs);
          const p = wingPoint(zs, fraction);
          return { centre: [p[0], p[1] + CAMBER * c * 0.8, zs] as Vec3, right: [width * c, 0, 0] as Vec3, up: [0, depth * wingThickness(zs) * c, 0] as Vec3 };
        }),
      );
    return {
      main: cached(`spar-main-${side}`, () => spar(WING.mainSparFraction, 0.42, 0.034)),
      rear: cached(`spar-rear-${side}`, () => spar(WING.rearSparFraction, 0.26, 0.02)),
      ribs: RIB_STATIONS.map((z) =>
        cached(`rib-${side}-${z}`, () => airfoilLoft([section(sign * (z - 0.012), 0.86), section(sign * (z + 0.012), 0.86)], { from: 0.03, to: HINGE - 0.02, capStart: true, capEnd: true, chordPoints: 10 })),
      ),
    };
  }, [side, sign]);
  return (
    <Part id={`wing-structure-${side}`}>
      <group name={side === "left" ? "LeftMainSpar" : "RightMainSpar"}>
        <Geo geometry={main} mat="carbon" repeat={[40, 1]} />
      </group>
      <group name={side === "left" ? "LeftRearSpar" : "RightRearSpar"}>
        <Geo geometry={rear} mat="carbon" repeat={[40, 1]} />
      </group>
      {ribs.map((geometry, i) => (
        <Geo key={i} geometry={geometry} mat="aluminium" />
      ))}
    </Part>
  );
}

const hingePoint = (z: number): Vec3 => wingPoint(z, HINGE);

function Flaperon({ side }: { side: "left" | "right" }) {
  const sign = side === "left" ? -1 : 1;
  const from = sign * WING.flaperon.from;
  const to = sign * WING.flaperon.to;
  const geometry = useMemo(() => cached(`flaperon-${side}`, () => airfoilLoft([section(from), section(sign * TILT_Z.inboard), section(to)], { from: HINGE + 0.012, capStart: true, capEnd: true, chordPoints: 8 })), [side, sign, from, to]);
  const hingeFrom = useMemo(() => hingePoint(from), [from]);
  const hingeTo = useMemo(() => hingePoint(to), [to]);
  return (
    <Part id={`flaperon-${side}`}>
      <Hinge from={hingeFrom} to={hingeTo} angle={() => (side === "left" ? frame.surfaces.flaperonLeft : -frame.surfaces.flaperonRight)}>
        <Geo geometry={geometry} mat="paint" doubleSide />
      </Hinge>
    </Part>
  );
}

/** Two electromechanical actuators per flaperon, on the rear spar. */
function WingActuators() {
  const mounts = useMemo(
    () =>
      [-5.8, -3.4, 3.4, 5.8].map((z) => {
        const spar = wingPoint(z, WING.rearSparFraction);
        const hinge = hingePoint(z);
        return { z, spar, hinge, rod: cached(`actuator-rod-${z}`, () => strut([spar[0] - 0.08, spar[1] - 0.02, z], [hinge[0] - 0.05, hinge[1] - 0.03, z], 0.016, 0.016)) };
      }),
    [],
  );
  return (
    <Part id="wing-actuators">
      {mounts.map(({ z, spar, rod }) => (
        <group key={z}>
          <Cyl r={0.032} h={0.17} axis="x" mat="darkSteel" position={[spar[0] - 0.02, spar[1] - 0.02, z]} segments={16} />
          <Cyl r={0.022} h={0.05} axis="x" mat="machined" position={[spar[0] + 0.09, spar[1] - 0.02, z]} segments={14} />
          <Geo geometry={rod} mat="steel" />
        </group>
      ))}
    </Part>
  );
}

const BOOM_PROFILE = smoothProfile(
  [
    [BOOM.tailX, 0.035],
    [BOOM.tailX + 0.5, 0.1],
    [-4.4, 0.135],
    [-2.8, BOOM.radius],
    [0, BOOM.radius + 0.01],
    [2.7, BOOM.radius],
    [3.12, 0.11],
    [BOOM.noseX, 0.0],
  ],
  64,
);

function Boom({ side }: { side: "left" | "right" }) {
  const sign = side === "left" ? -1 : 1;
  const geometry = useMemo(() => cached("boom", () => revolveX(BOOM_PROFILE, 28)), []);
  // A short fairing blends each boom into the underside of the wing box.
  const fairing = useMemo(
    () =>
      cached(`boom-fairing-${side}`, () => {
        const z = sign * BOOM.z;
        const le = wingLeadingEdge(z);
        const c = wingChord(z);
        return boxLoft([
          { centre: [le + 0.12, BOOM.y + 0.1, z], right: [0, 0, 0.05], up: [0, 0.03, 0] },
          { centre: [le - 0.25 * c, BOOM.y + 0.11, z], right: [0, 0, 0.1], up: [0, 0.07, 0] },
          { centre: [le - 0.75 * c, BOOM.y + 0.1, z], right: [0, 0, 0.09], up: [0, 0.05, 0] },
          { centre: [le - c - 0.18, BOOM.y + 0.08, z], right: [0, 0, 0.04], up: [0, 0.02, 0] },
        ]);
      }),
    [side, sign],
  );
  return (
    <Part id={`boom-${side}`}>
      <Geo geometry={geometry} mat="paint" position={[0, BOOM.y, sign * BOOM.z]} doubleSide />
      <Geo geometry={fairing} mat="paint" />
    </Part>
  );
}

export function Booms() {
  return (
    <group name="Booms">
      <Boom side="left" />
      <Boom side="right" />
    </group>
  );
}

export default function Wing() {
  return (
    <group name="Wing">
      <group name="LeftWing">
        <WingSkin side="left" />
        <WingStructure side="left" />
        <Flaperon side="left" />
      </group>
      <group name="RightWing">
        <WingSkin side="right" />
        <WingStructure side="right" />
        <Flaperon side="right" />
      </group>
      <WingActuators />
    </group>
  );
}
