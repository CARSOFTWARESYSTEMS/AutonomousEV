// Fuselage: composite shell with graphite lower surface, panoramic glazing,
// two cabin doors, and the primary structure inside — ring frames, keel and
// the structural floor that separates the cabin from the battery bay.
import { useMemo } from "react";
import { CatmullRomCurve3, DoubleSide, TubeGeometry, Vector3 } from "three";
import { BATTERY, CABIN, FRAME_STATIONS, FUSELAGE, OPENINGS, WING, fuselageHalfWidthAt, fuselagePoint, fuselageSection } from "./layout";
import { boxLoft, cached, frameGeometry, fuselageGeometries, strut } from "./geometry";
import { Box, Cyl, Geo, Mat } from "./materials";
import { Part } from "./Part";

function Frames() {
  const frames = useMemo(
    () =>
      FRAME_STATIONS.map((x, i) => {
        // The two wing frames are deeper: they carry the spar loads into the fuselage.
        const wingFrame = i === 2 || i === 3;
        // The forward frame stops at the windscreen sill: nothing crosses the glazing.
        const [from, to] = i === 0 ? [OPENINGS.windscreen.angle[1] + 4, 360 - OPENINGS.windscreen.angle[1] - 4] : [-180, 180];
        return cached(`frame-${x}`, () => frameGeometry(x, 0.018, wingFrame ? 0.15 : 0.1, wingFrame ? 0.05 : 0.035, from, to));
      }),
    [],
  );
  const keel = useMemo(
    () =>
      cached("keel", () =>
        boxLoft(
          [2.3, 1.45, 0.0, -1.05, -1.9].map((x) => {
            const bottom = fuselageSection(x).bottom;
            const height = Math.max(0.06, FUSELAGE.floorY - bottom - 0.05);
            return { centre: [x, bottom + 0.03 + height / 2, 0] as const, right: [0, 0, 0.035] as const, up: [0, height / 2, 0] as const };
          }),
        ),
      ),
    [],
  );
  // Carry-through for each spar across the crown, between the frame tops.
  const carryThrough = useMemo(
    () => [WING.sparX, FRAME_STATIONS[3]].map((x) => cached(`carry-${x}`, () => strut([x, FUSELAGE.topY - 0.09, -0.62], [x, FUSELAGE.topY - 0.09, 0.62], 0.09, 0.13, [0, 1, 0]))),
    [],
  );
  const longerons = useMemo(
    () =>
      [-1, 1].map((side) =>
        cached(`longeron-${side}`, () =>
          boxLoft(
            [2.3, 1.45, 0.0, -0.65, -1.05, -1.9].map((x) => {
              const p = fuselagePoint(x, (side * 96 * Math.PI) / 180, 0.05);
              return { centre: p, right: [0, 0, 0.022] as const, up: [0, 0.03, 0] as const };
            }),
          ),
        ),
      ),
    [],
  );

  return (
    <Part id="fuselage-frames">
      <group name="Frames">
        {frames.map((geometry, i) => (
          <Geo key={i} geometry={geometry} mat="carbon" repeat={[12, 1]} doubleSide />
        ))}
        {carryThrough.map((geometry, i) => (
          <Geo key={i} geometry={geometry} mat="carbon" repeat={[8, 1]} />
        ))}
        {longerons.map((geometry, i) => (
          <Geo key={i} geometry={geometry} mat="carbon" repeat={[20, 1]} />
        ))}
      </group>
      <group name="Keel">
        <Geo geometry={keel} mat="carbon" repeat={[16, 1]} />
      </group>
    </Part>
  );
}

function Floor() {
  // The floor follows the fuselage width, front of the flight deck to the rear bulkhead.
  const panel = useMemo(
    () =>
      cached("floor", () =>
        boxLoft(
          [2.42, 2.0, 1.45, 0.0, FUSELAGE.bulkheadX].map((x) => {
            const half = fuselageHalfWidthAt(x, FUSELAGE.floorY - 0.02);
            return { centre: [x, FUSELAGE.floorY - 0.018, 0] as const, right: [0, 0, half] as const, up: [0, 0.018, 0] as const };
          }),
        ),
      ),
    [],
  );
  const railLength = CABIN.rowX[0] - CABIN.rowX[2] + 0.9;
  const railX = (CABIN.rowX[0] + CABIN.rowX[2]) / 2 + 0.05;
  return (
    <Part id="floor-structure">
      <Geo geometry={panel} mat="floor" />
      {/* Seat rails: the seats attach here, not to the battery enclosure below. */}
      {[-0.56, -0.22, 0.22, 0.56].map((z) => (
        <Box key={z} size={[railLength, 0.014, 0.03]} mat="aluminium" position={[railX, FUSELAGE.floorY + 0.006, z]} radius={0.004} />
      ))}
      {/* Floor beams across the keel, over the battery bay. */}
      {[1.72, 1.06, 0.4, -0.26, -0.92].map((x) => (
        <Box key={x} size={[0.04, 0.035, 1.56]} mat="aluminium" position={[x, FUSELAGE.floorY - 0.052, 0]} radius={0.004} />
      ))}
      {/* Firewall strip at the rear of the battery bay. */}
      <Box size={[0.02, FUSELAGE.floorY - BATTERY.bottomY, 1.36]} mat="titanium" position={[BATTERY.fromX - 0.05, (FUSELAGE.floorY + BATTERY.bottomY) / 2 - 0.02, 0]} radius={0.004} />
    </Part>
  );
}

/** The outline of a door opening, just proud of the skin, as a closed loop. */
function doorOutline(sign: number) {
  const [x0, x1] = OPENINGS.door.x;
  const [a0, a1] = OPENINGS.door.angle;
  const rad = (deg: number) => (sign * deg * Math.PI) / 180;
  const steps = 22;
  const points: Vector3[] = [];
  const push = (x: number, deg: number) => points.push(new Vector3(...fuselagePoint(x, rad(deg), -0.003)));
  for (let i = 0; i <= steps; i++) push(x1, a0 + ((a1 - a0) * i) / steps);
  for (let i = 1; i <= 6; i++) push(x1 + ((x0 - x1) * i) / 6, a1);
  for (let i = 1; i <= steps; i++) push(x0, a1 + ((a0 - a1) * i) / steps);
  for (let i = 1; i < 6; i++) push(x0 + ((x1 - x0) * i) / 6, a0);
  return new CatmullRomCurve3(points, true, "catmullrom", 0.1);
}

function Door({ side }: { side: "left" | "right" }) {
  const geometries = fuselageGeometries();
  const sign = side === "left" ? -1 : 1;
  const handle = fuselagePoint(OPENINGS.door.x[0] + 0.12, (sign * 94 * Math.PI) / 180);
  const seal = useMemo(() => cached(`door-seal-${side}`, () => new TubeGeometry(doorOutline(sign), 72, 0.0035, 4, true)), [side, sign]);
  return (
    <Part id={`door-${side}`}>
      <Geo geometry={geometries[`door-${side}`]} mat="paint" doubleSide />
      <Geo geometry={geometries[`door-${side}-belly`]} mat="graphite" doubleSide />
      <Geo geometry={geometries[`door-${side}-glass`]} mat="glass" doubleSide castShadow={false} renderOrder={2} />
      {/* The seal makes the door read as a door when it is closed. */}
      <Geo geometry={seal} mat="darkSteel" castShadow={false} />
      <Box size={[0.16, 0.035, 0.016]} mat="darkSteel" position={[handle[0], handle[1], handle[2] + sign * 0.006]} radius={0.006} />
    </Part>
  );
}

export default function Fuselage() {
  const geometries = fuselageGeometries();
  return (
    <group name="Fuselage">
      <Part id="fuselage-shell">
        <group name="CabinShell">
          <Geo geometry={geometries.shell} mat="paint" doubleSide />
          <Geo geometry={geometries.belly} mat="graphite" doubleSide />
        </group>
      </Part>
      <Part id="glazing">
        <mesh geometry={geometries.glass} renderOrder={2}>
          <Mat k="glass" side={DoubleSide} />
        </mesh>
      </Part>
      <group name="Doors">
        <Door side="left" />
        <Door side="right" />
      </group>
      <Frames />
      <Floor />
      <Part id="cabin-interior">
        {/* Rear cabin bulkhead: the cabin ends here; the equipment bay is behind it. */}
        <Cyl r={0.74} h={0.02} axis="x" mat="interior" position={[FUSELAGE.bulkheadX + 0.03, 1.32, 0]} segments={40} />
        {/* Instrument panel and glareshield. */}
        <Box size={[0.07, 0.27, 1.16]} mat="seatTrim" position={[CABIN.panelX + 0.05, 1.3, 0]} radius={0.03} />
        <Box size={[0.2, 0.022, 1.2]} mat="interior" position={[CABIN.panelX + 0.1, 1.45, 0]} radius={0.01} />
        <Box size={[0.5, 0.2, 0.3]} mat="interior" position={[CABIN.panelX - 0.2, 1.0, 0]} radius={0.04} />
      </Part>
    </group>
  );
}
