// Primary structure of the reference 6U bus: rails, ribs, end plates,
// close-out panels, the payload and avionics decks and the deployer interface.
import { useMemo } from "react";
import { type ExtrudeGeometryOptions, Path, Shape } from "three";
import { BUS, HALF, SUB_EXPLODE } from "./layout";
import { Box, Cyl, Mat } from "./primitives";
import { Offset, Part } from "./Part";

const RAIL = BUS.rail;
const RAIL_X = HALF.x - RAIL / 2;
const RAIL_Z = HALF.z - RAIL / 2;
/** Rib stations: the two ends and the two unit boundaries. */
const RIB_Y = [-HALF.y + 0.03, -BUS.length / 6, BUS.length / 6, HALF.y - 0.03];
const CORNERS: readonly (readonly [number, number])[] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

function PrimaryFrame() {
  return (
    <Part id="primary-frame">
      {CORNERS.map(([sx, sz]) => (
        <Box key={`rail-${sx}-${sz}`} size={[RAIL, BUS.length, RAIL]} position={[sx * RAIL_X, 0, sz * RAIL_Z]} mat="rail" radius={0.012} />
      ))}
      {RIB_Y.map((y) => (
        <group key={`rib-${y}`} position={[0, y, 0]}>
          {[-1, 1].map((sz) => (
            <Box key={`x-${sz}`} size={[BUS.width - RAIL * 2, 0.06, 0.045]} position={[0, 0, sz * (HALF.z - 0.03)]} mat="frame" />
          ))}
          {[-1, 0, 1].map((sx) => (
            <Box key={`z-${sx}`} size={[0.045, 0.06, BUS.depth - RAIL * 2]} position={[sx * (HALF.x - 0.03), 0, 0]} mat="frame" />
          ))}
        </group>
      ))}
      {/* Centre spine between the payload and avionics columns. */}
      {[-1, 1].map((sz) => (
        <Box key={`spine-${sz}`} size={[0.04, BUS.length - 0.12, 0.04]} position={[0, 0, sz * (HALF.z - 0.03)]} mat="frame" />
      ))}
    </Part>
  );
}

function NadirPlate() {
  const args = useMemo(() => {
    const s = new Shape();
    const w = HALF.x;
    const d = HALF.z;
    s.moveTo(-w, -d);
    s.lineTo(w, -d);
    s.lineTo(w, d);
    s.lineTo(-w, d);
    s.closePath();
    const aperture = new Path();
    aperture.absarc(-BUS.columnX, 0, 0.455, 0, Math.PI * 2, true);
    s.holes.push(aperture);
    // One stable tuple: a new `args` identity would make the geometry be rebuilt.
    return [s, { depth: 0.035, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 40 }] as [Shape, ExtrudeGeometryOptions];
  }, []);
  return (
    <group position={[0, -HALF.y - 0.035, 0]}>
      {/* Shape lies in XY; rotating about X lays it in the XZ plane with the extrusion along +Y. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry args={args} />
        <Mat k="panel" />
      </mesh>
      <mesh position={[-BUS.columnX, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.462, 0.022, 10, 48]} />
        <Mat k="machined" />
      </mesh>
    </group>
  );
}

function EndPlates() {
  return (
    <Part id="end-plates">
      <Offset explode={SUB_EXPLODE.zenithPlate}>
        <Box size={[BUS.width, 0.035, BUS.depth]} position={[0, HALF.y + 0.0175, 0]} mat="panel" radius={0.01} />
      </Offset>
      <Offset explode={SUB_EXPLODE.nadirPlate}>
        <NadirPlate />
      </Offset>
    </Part>
  );
}

function SidePanels() {
  const panelLength = BUS.length - 0.1;
  return (
    <Part id="side-panels">
      <Offset explode={SUB_EXPLODE.panelSun}>
        <Box size={[BUS.width - RAIL * 2 + 0.02, panelLength, 0.018]} position={[0, 0, HALF.z + 0.004]} mat="panel" radius={0.006} />
      </Offset>
      <Offset explode={SUB_EXPLODE.panelCold}>
        <Box size={[BUS.width - RAIL * 2 + 0.02, panelLength, 0.018]} position={[0, 0, -HALF.z - 0.004]} mat="panel" radius={0.006} />
      </Offset>
      <Offset explode={SUB_EXPLODE.panelLeft}>
        <Box size={[0.018, panelLength, BUS.depth - RAIL * 2 + 0.02]} position={[-HALF.x - 0.004, 0, 0]} mat="panel" radius={0.006} />
      </Offset>
      <Offset explode={SUB_EXPLODE.panelRight}>
        <Box size={[0.018, panelLength, BUS.depth - RAIL * 2 + 0.02]} position={[HALF.x + 0.004, 0, 0]} mat="panel" radius={0.006} />
      </Offset>
    </Part>
  );
}

function PayloadDeck() {
  const x = -BUS.columnX;
  return (
    <Part id="payload-deck">
      <Box size={[0.96, 2.3, 0.03]} position={[x, -0.7, -0.462]} mat="frame" />
      {/* Cradles that carry the telescope's mounting rings. */}
      {[-1.35, -0.1].map((y) => (
        <group key={y} position={[x, y, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <torusGeometry args={[0.468, 0.03, 8, 28, Math.PI]} />
            <Mat k="frame" />
          </mesh>
          <Box size={[0.3, 0.1, 0.06]} position={[0, 0, -0.44]} mat="frame" />
        </group>
      ))}
    </Part>
  );
}

function AvionicsDeck() {
  const x = BUS.columnX;
  return (
    <Part id="avionics-deck">
      {CORNERS.map(([sx, sz]) => (
        <Cyl key={`rod-${sx}-${sz}`} r={0.02} h={BUS.length - 0.2} position={[x + sx * 0.39, 0, sz * 0.37]} mat="machined" segments={10} />
      ))}
      {[-1.42, -1.08, -0.08, 0.16, 0.4, 0.64, 1.56].map((y) => (
        <group key={y} position={[x, y, 0]}>
          {CORNERS.map(([sx, sz]) => (
            <Cyl key={`spacer-${sx}-${sz}`} r={0.034} h={0.05} position={[sx * 0.39, 0, sz * 0.37]} mat="frame" segments={10} />
          ))}
        </group>
      ))}
    </Part>
  );
}

function DeployerInterface() {
  return (
    <Part id="deployer-interface">
      {CORNERS.flatMap(([sx, sz]) =>
        [-1, 1].map((sy) => (
          <Box key={`foot-${sx}-${sz}-${sy}`} size={[RAIL, 0.07, RAIL]} position={[sx * RAIL_X, sy * (HALF.y + 0.07), sz * RAIL_Z]} mat="machined" radius={0.012} />
        )),
      )}
      {/* Deployment switches: held in by the deployer, they keep the bus unpowered until release. */}
      {[-1, 1].map((sx) => (
        <group key={`switch-${sx}`} position={[sx * RAIL_X, -HALF.y - 0.105, RAIL_Z]}>
          <Cyl r={0.02} h={0.06} position={[0, -0.03, 0]} mat="gold" segments={12} />
        </group>
      ))}
      {/* Separation springs on the opposite rail pair. */}
      {[-1, 1].map((sx) => (
        <group key={`spring-${sx}`} position={[sx * RAIL_X, -HALF.y - 0.105, -RAIL_Z]}>
          <Cyl r={0.026} h={0.08} position={[0, -0.04, 0]} mat="shield" segments={12} />
        </group>
      ))}
    </Part>
  );
}

export default function Structure() {
  return (
    <group name="Structure">
      <PrimaryFrame />
      <EndPlates />
      <SidePanels />
      <PayloadDeck />
      <AvionicsDeck />
      <DeployerInterface />
    </group>
  );
}
