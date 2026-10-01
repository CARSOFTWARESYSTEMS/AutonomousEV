// Thermal control hardware: MLI blankets, the radiator on the cold face, and
// heater zones with their temperature sensors.
import { BUS, HALF, LAYOUT, SUB_EXPLODE } from "./layout";
import { Box, Cyl, Mat } from "./primitives";
import { Offset, Part } from "./Part";

const BLANKET_LENGTH = BUS.length - 0.2;

/** Quilt tile of the blanket's normal map, in scene units (10 cm). */
const QUILT_TILE = 1;

/** One blanket. `face` is the size of its visible face, so the quilting keeps its scale on every side. */
function Blanket({ size, face, position }: { size: [number, number, number]; face: [number, number]; position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <Mat k="mli" repeat={[face[0] / QUILT_TILE, face[1] / QUILT_TILE]} />
    </mesh>
  );
}

function MliBlanket() {
  return (
    <Part id="mli-blanket">
      <group name="MLIBlanket">
        <Offset explode={SUB_EXPLODE.mliSun}>
          <Blanket size={[BUS.width - 0.2, BLANKET_LENGTH, 0.012]} face={[BUS.width - 0.2, BLANKET_LENGTH]} position={[0, 0, HALF.z + 0.022]} />
          {/* Kapton tape at the blanket seams. */}
          {[-1.1, 0, 1.1].map((y) => (
            <Box key={y} size={[BUS.width - 0.24, 0.05, 0.004]} position={[0, y, HALF.z + 0.03]} mat="kapton" radius={0.001} />
          ))}
        </Offset>
        <Offset explode={SUB_EXPLODE.mliLeft}>
          <Blanket size={[0.012, BLANKET_LENGTH, BUS.depth - 0.2]} face={[BUS.depth - 0.2, BLANKET_LENGTH]} position={[-HALF.x - 0.022, 0, 0]} />
        </Offset>
        <Offset explode={SUB_EXPLODE.mliRight}>
          <Blanket size={[0.012, BLANKET_LENGTH, BUS.depth - 0.2]} face={[BUS.depth - 0.2, BLANKET_LENGTH]} position={[HALF.x + 0.022, 0, 0]} />
        </Offset>
      </group>
    </Part>
  );
}

function Radiator() {
  return (
    <Part id="radiator">
      <group name="Radiator" position={[0.12, -0.35, -HALF.z - 0.024]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.86, 2.6, 0.014]} />
          <Mat k="radiator" />
        </mesh>
        <Box size={[1.9, 2.64, 0.008]} position={[0, 0, 0.008]} mat="frame" radius={0.003} />
      </group>
    </Part>
  );
}

function HeaterPatch({ size }: { size: [number, number] }) {
  return (
    <group>
      <Box size={[size[0], size[1], 0.008]} mat="kapton" radius={0.003} />
      {/* Serpentine heater trace. */}
      {[-0.3, -0.1, 0.1, 0.3].map((f) => (
        <Box key={f} size={[size[0] * 0.82, 0.014, 0.003]} position={[0, f * size[1], -0.005]} mat="copper" radius={0.001} />
      ))}
      {/* Thermistor. */}
      <Cyl r={0.022} h={0.012} axis="z" position={[size[0] * 0.36, size[1] * 0.38, -0.008]} mat="white" segments={12} />
    </group>
  );
}

function Heaters() {
  return (
    <Part id="heaters">
      <group name="HeaterZones">
        <Offset explode={LAYOUT.battery.explode}>
          <group position={[BUS.columnX, 1.1, -0.345]}>
            <HeaterPatch size={[0.62, 0.5]} />
          </group>
        </Offset>
        <Offset explode={LAYOUT["optical-payload"].explode}>
          <group position={[-BUS.columnX, -0.75, -0.448]}>
            <HeaterPatch size={[0.42, 0.5]} />
          </group>
        </Offset>
      </group>
    </Part>
  );
}

export default function Thermal() {
  return (
    <group name="Thermal">
      <MliBlanket />
      <Radiator />
      <Heaters />
    </group>
  );
}
