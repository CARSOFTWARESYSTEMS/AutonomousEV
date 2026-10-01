// Cabin: one pilot and five passengers in three rows of two. Light, minimal
// and weight-conscious — slim seats on floor rails, nothing that is not
// needed. The pilot's seat (front, port) is the one a future autonomous
// configuration would hand back to a passenger.
import { CABIN } from "./layout";
import { Box, Cyl } from "./materials";
import { Part } from "./Part";

const RECLINE = 0.2;

function Seat({ x, z, pilot = false }: { x: number; z: number; pilot?: boolean }) {
  const y = CABIN.seatBaseY;
  return (
    <group position={[x, y, z]}>
      {/* Two legs onto the seat rails. */}
      <Box size={[0.36, 0.2, 0.03]} mat="aluminium" position={[0.02, 0.1, -0.17]} radius={0.008} />
      <Box size={[0.36, 0.2, 0.03]} mat="aluminium" position={[0.02, 0.1, 0.17]} radius={0.008} />
      {/* Pan and cushion. */}
      <Box size={[0.46, 0.05, 0.46]} mat="seatShell" position={[0.02, 0.225, 0]} radius={0.02} />
      <Box size={[0.42, 0.06, 0.4]} mat="seatFabric" position={[0.03, 0.275, 0]} radius={0.026} />
      {/* Back: a slim shell, a cushion and a headrest, reclined a little. */}
      <group position={[-0.2, 0.26, 0]} rotation={[0, 0, RECLINE]}>
        <Box size={[0.05, 0.62, 0.44]} mat="seatShell" position={[-0.012, 0.31, 0]} radius={0.02} />
        <Box size={[0.05, 0.5, 0.36]} mat="seatFabric" position={[0.03, 0.29, 0]} radius={0.022} />
        <Box size={[0.07, 0.15, 0.24]} mat={pilot ? "seatTrim" : "seatFabric"} position={[0.022, 0.67, 0]} radius={0.03} />
      </group>
    </group>
  );
}

export default function Cabin() {
  const [front, middle, rear] = CABIN.rowX;
  const z = CABIN.seatZ;
  return (
    <group name="Cabin">
      <Part id="cabin-seats">
        <group name="Seats">
          <Seat x={front} z={-z} pilot />
          <Seat x={front} z={z} />
          <Seat x={middle} z={-z} />
          <Seat x={middle} z={z} />
          <Seat x={rear} z={-z} />
          <Seat x={rear} z={z} />
        </group>
      </Part>
      <Part id="pilot-controls">
        {/* Side inceptors either side of the pilot's seat, on short pedestals. */}
        {[-0.68, -0.1].map((side) => (
          <group key={side} position={[front + 0.3, CABIN.seatBaseY, side]}>
            <Box size={[0.2, 0.3, 0.09]} mat="seatTrim" position={[0, 0.15, 0]} radius={0.02} />
            <Cyl r={0.016} h={0.1} mat="darkSteel" position={[0.02, 0.35, 0]} segments={10} />
            <Box size={[0.04, 0.09, 0.04]} mat="plastic" position={[0.024, 0.43, 0]} radius={0.016} />
          </group>
        ))}
      </Part>
    </group>
  );
}
