// S-band TT&C transceiver and patches, X-band payload transmitter and patch
// array, and the coaxial RF harness.
import type { Vec3 } from "../types";
import { BUS, MOUNT, SUB_EXPLODE } from "./layout";
import { FLOW_ROUTE_BY_ID, type FlowId } from "./flowRoutes";
import { Board, Box, Cable, Cyl } from "./primitives";
import { Offset, Part } from "./Part";

const X = BUS.columnX;

function SbandRadio() {
  return (
    <Part id="sband-radio">
      <group name="SBandTransceiver">
        <Board position={[X, -1.31, 0]} chips={[{ at: [-0.08, 0.0], size: [0.62, 0.11, 0.6], mat: "shield" }]}>
          {/* RF connectors on the cold-wall side. */}
          {[-0.2, 0.05].map((cx) => (
            <Cyl key={cx} r={0.028} h={0.08} axis="z" position={[cx, 0.07, -0.4]} mat="gold" segments={12} />
          ))}
        </Board>
      </group>
    </Part>
  );
}

function XbandTransmitter() {
  return (
    <Part id="xband-transmitter">
      <group name="XBandTransmitter">
        <Board position={[X, -1.68, 0]} chips={[{ at: [-0.08, 0.0], size: [0.62, 0.09, 0.6], mat: "enclosure" }]}>
          {/* Finned heat spreader over the power amplifier. */}
          {[-0.24, -0.14, -0.04, 0.06, 0.16].map((fz) => (
            <Box key={fz} size={[0.56, 0.05, 0.022]} position={[-0.08, 0.128, fz]} mat="shield" radius={0.004} />
          ))}
        </Board>
      </group>
    </Part>
  );
}

function Patch({ size = 0.22, facing }: { size?: number; facing: 1 | -1 }) {
  return (
    <group>
      <Box size={[size, 0.03, size]} mat="ceramic" radius={0.008} />
      <Box size={[size * 0.62, 0.008, size * 0.62]} position={[0, facing * 0.019, 0]} mat="gold" radius={0.003} />
    </group>
  );
}

function SbandAntenna() {
  return (
    <Part id="sband-antenna">
      <group name="SBandAntenna">
        <Offset explode={[0, SUB_EXPLODE.zenithPlate[1] + 0.5, 0]}>
          <group position={MOUNT.sbandZenith as [number, number, number]}>
            <Patch facing={1} />
          </group>
        </Offset>
        <Offset explode={[0, SUB_EXPLODE.nadirPlate[1] - 0.5, 0]}>
          <group position={[MOUNT.sbandNadir[0], MOUNT.sbandNadir[1] - 0.025, MOUNT.sbandNadir[2]]}>
            <Patch facing={-1} />
          </group>
        </Offset>
      </group>
    </Part>
  );
}

const ARRAY_ELEMENTS: readonly Vec3[] = [
  [-0.12, 0, -0.12],
  [0.12, 0, -0.12],
  [-0.12, 0, 0.12],
  [0.12, 0, 0.12],
];

function XbandAntenna() {
  const [x, y, z] = MOUNT.xbandArray;
  return (
    <Part id="xband-antenna">
      <group name="XBandAntenna" position={[x, y - 0.025, z]}>
        <Box size={[0.52, 0.03, 0.5]} mat="ceramic" radius={0.008} />
        {ARRAY_ELEMENTS.map((p, i) => (
          <Box key={i} size={[0.16, 0.008, 0.16]} position={[p[0], -0.019, p[2]]} mat="gold" radius={0.003} />
        ))}
      </group>
    </Part>
  );
}

const RF_ROUTES: FlowId[] = ["rf-sband-nadir", "rf-sband-zenith", "rf-xband"];

function RfHarness() {
  return (
    <Part id="rf-harness">
      <group name="RFBus">
        {RF_ROUTES.map((id) => (
          <Cable key={id} points={FLOW_ROUTE_BY_ID[id].points} radius={0.014} mat="copper" />
        ))}
      </group>
    </Part>
  );
}

export default function Communications() {
  return (
    <group name="Communications">
      <SbandRadio />
      <SbandAntenna />
      <XbandTransmitter />
      <XbandAntenna />
      <RfHarness />
    </group>
  );
}
