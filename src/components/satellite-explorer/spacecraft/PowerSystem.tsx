// Battery pack, PCDU and the power harness.
import type { Vec3 } from "../types";
import { BUS } from "./layout";
import { FLOW_ROUTE_BY_ID, type FlowId } from "./flowRoutes";
import { Board, Box, Cable, Cyl } from "./primitives";
import { Part } from "./Part";

const X = BUS.columnX;
const CELL_X = [-0.3, -0.1, 0.1, 0.3];
/** Two rows of four cells: each row is one parallel group, the two in series (2S4P). */
const CELL_ROWS = [
  { z: -0.15, polarity: 1 },
  { z: 0.15, polarity: -1 },
] as const;
const CELL_RADIUS = 0.09;
const CELL_LENGTH = 0.65;
const CELL_END = CELL_LENGTH / 2;

/** One 18650 cell: steel can, printed sleeve, insulator ring and button terminal. */
function Cell({ position, polarity }: { position: [number, number, number]; polarity: 1 | -1 }) {
  return (
    <group position={position} rotation={polarity === 1 ? [0, 0, 0] : [Math.PI, 0, 0]}>
      <Cyl r={CELL_RADIUS - 0.004} h={CELL_LENGTH} mat="machined" segments={24} />
      <Cyl r={CELL_RADIUS} h={CELL_LENGTH - 0.03} mat="batteryCell" segments={28} />
      <Cyl r={CELL_RADIUS - 0.012} h={0.008} position={[0, CELL_END + 0.003, 0]} mat="white" segments={24} />
      <Cyl r={0.046} h={0.02} position={[0, CELL_END + 0.012, 0]} mat="nickel" segments={18} />
    </group>
  );
}

/** Nickel strip spot-welded across a row of cell ends. */
function Strip({ y, z, depth = 0.07 }: { y: number; z: number; depth?: number }) {
  return (
    <group position={[0, y, z]}>
      <Box size={[0.72, 0.008, depth]} mat="nickel" radius={0.002} />
      {CELL_X.map((cx) => (
        <Cyl key={cx} r={0.014} h={0.005} position={[cx, Math.sign(y) * 0.006, 0]} mat="shield" segments={10} />
      ))}
    </group>
  );
}

const STRIP_Y = CELL_END + 0.028;
const BMS_Y = 0.46;

/** Leads from the pack to its protection board: main positive and negative, and the mid-point sense wire. */
const LEADS = [
  { mat: "cablePower", radius: 0.014, points: [[-0.3, STRIP_Y, -0.15], [-0.39, STRIP_Y + 0.02, -0.15], [-0.39, BMS_Y - 0.02, -0.2], [-0.3, BMS_Y, -0.24]] },
  { mat: "cableGround", radius: 0.014, points: [[-0.3, STRIP_Y, 0.15], [-0.39, STRIP_Y + 0.02, 0.15], [-0.39, BMS_Y - 0.02, 0.2], [-0.3, BMS_Y, 0.24]] },
  { mat: "connector", radius: 0.007, points: [[0.3, -STRIP_Y, 0], [0.4, -STRIP_Y, 0.02], [0.405, 0, 0.3], [0.4, BMS_Y - 0.03, 0.3], [0.3, BMS_Y, 0.26]] },
] as const satisfies readonly { mat: "cablePower" | "cableGround" | "connector"; radius: number; points: readonly Vec3[] }[];

function Battery() {
  const y = 1.1;
  return (
    <Part id="battery">
      <group name="BatteryPack" position={[X, y, 0]}>
        {CELL_ROWS.flatMap(({ z, polarity }) => CELL_X.map((cx) => <Cell key={`${cx}-${z}`} position={[cx, 0, z]} polarity={polarity} />))}

        {/* Moulded holders seat both ends of every cell. */}
        {[-1, 1].map((s) => (
          <Box key={s} size={[0.84, 0.1, 0.56]} position={[0, s * 0.215, 0]} mat="plastic" radius={0.02} />
        ))}
        {/* Polyimide tape binds the pack; a thermistor is taped to the middle cells. */}
        <Box size={[0.8, 0.2, 0.5]} position={[0, 0, 0]} mat="kapton" radius={0.085} />
        <Box size={[0.07, 0.05, 0.02]} position={[0.1, 0.02, 0.255]} mat="chip" radius={0.006} />

        {/* Top: one strip per parallel group, the pack's two terminals. Bottom: a plate joins the groups in series. */}
        {CELL_ROWS.map(({ z }) => (
          <Strip key={z} y={STRIP_Y} z={z} />
        ))}
        <Strip y={-STRIP_Y} z={0} depth={0.37} />

        {/* Side brackets tie the pack to the stack rods. */}
        {[-1, 1].map((s) => (
          <Box key={s} size={[0.026, 0.84, 0.8]} position={[s * 0.435, 0.02, 0]} mat="rail" />
        ))}

        {/* Protection and balancing board above the cells. */}
        <Board
          position={[0, BMS_Y, 0]}
          size={[0.88, 0.8]}
          chips={[
            { at: [-0.12, 0.08], size: [0.16, 0.03, 0.16] },
            { at: [0.1, 0.1], size: [0.09, 0.025, 0.12] },
            { at: [-0.24, -0.16], size: [0.13, 0.045, 0.09], mat: "shield" },
            { at: [-0.06, -0.16], size: [0.13, 0.045, 0.09], mat: "shield" },
            { at: [0.16, -0.2], size: [0.22, 0.05, 0.12], mat: "connector" },
          ]}
        />
        {LEADS.map((lead, i) => (
          <Cable key={i} points={lead.points} radius={lead.radius} mat={lead.mat} />
        ))}
      </group>
    </Part>
  );
}

function Pcdu() {
  return (
    <Part id="pcdu">
      <Board
        position={[X, 0.47, 0]}
        chips={[
          { at: [-0.2, -0.18], size: [0.34, 0.07, 0.3], mat: "shield" },
          { at: [-0.24, 0.2], size: [0.14, 0.1, 0.14], mat: "enclosure" },
          { at: [-0.04, 0.2], size: [0.14, 0.1, 0.14], mat: "enclosure" },
          { at: [0.16, 0.2], size: [0.14, 0.1, 0.14], mat: "enclosure" },
          { at: [0.14, -0.2], size: [0.2, 0.03, 0.2] },
          { at: [-0.1, -0.385], size: [0.5, 0.07, 0.07], mat: "connector" },
        ]}
      >
        {/* Bulk capacitors. */}
        {[-0.3, -0.18].map((cx) => (
          <Cyl key={cx} r={0.045} h={0.11} position={[cx, 0.067, 0.02]} mat="shield" segments={14} />
        ))}
      </Board>
    </Part>
  );
}

const POWER_ROUTES: FlowId[] = ["array-left", "array-right", "battery", "load-obc", "load-adcs", "load-comms", "load-payload", "load-heaters"];

function PowerHarness() {
  return (
    <Part id="power-harness">
      <group name="PowerBus">
        {POWER_ROUTES.map((id) => (
          <Cable key={id} points={FLOW_ROUTE_BY_ID[id].points} radius={id.startsWith("array") || id === "battery" ? 0.016 : 0.011} mat="cablePower" />
        ))}
      </group>
    </Part>
  );
}

export default function PowerSystem() {
  return (
    <group name="Power">
      <Battery />
      <Pcdu />
      <PowerHarness />
    </group>
  );
}
