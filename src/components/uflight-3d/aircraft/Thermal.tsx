// Thermal: one liquid loop for the battery and the equipment bay. Coolant
// leaves the belly heat exchanger, passes the pumps and the manifold, runs
// through the cold plates under both packs and under the equipment rack, and
// returns to the exchanger, where ram air (or a fan, in hover and on the
// ground) carries the heat away. Each propulsion unit cools itself.
import { useMemo } from "react";
import { BATTERY, EQUIPMENT } from "./layout";
import { FLOW_ROUTES } from "./routes";
import { Box, Cable, Cyl } from "./materials";
import { Part } from "./Part";

const PACK_LENGTH = BATTERY.toX - BATTERY.fromX;
const PACK_X = (BATTERY.toX + BATTERY.fromX) / 2;

export default function Thermal() {
  const lines = useMemo(() => FLOW_ROUTES.filter((r) => r.group === "coolant" && r.id !== "ram-air"), []);
  const exchanger = EQUIPMENT["heat-exchanger"];
  const pumps = EQUIPMENT["coolant-pumps"];
  const manifold = EQUIPMENT["cooling-manifold"];
  const plate = EQUIPMENT["avionics-cooling"];
  return (
    <group name="Thermal">
      <Part id="battery-cooling">
        <group name="BatteryCooling">
          {[-1, 1].map((sign) => (
            <group key={sign} position={[PACK_X, BATTERY.bottomY - 0.008, sign * BATTERY.packZ]}>
              <Box size={[PACK_LENGTH - 0.04, 0.012, BATTERY.packWidth - 0.1]} mat="aluminium" radius={0.004} />
              {/* Coolant channels along the plate. */}
              {[-0.15, -0.05, 0.05, 0.15].map((z) => (
                <Box key={z} size={[PACK_LENGTH - 0.14, 0.006, 0.03]} mat="coolantLine" position={[0, -0.008, z]} radius={0.003} />
              ))}
            </group>
          ))}
        </group>
        {lines
          .filter((r) => r.id.startsWith("coolant-battery"))
          .map((route) => (
            <Cable key={route.id} points={route.points} radius={0.013} mat="coolantLine" cornerRadius={0.06} />
          ))}
      </Part>

      <Part id="heat-exchanger">
        <group position={exchanger as unknown as [number, number, number]} name="HeatExchanger">
          <Box size={[0.16, 0.2, 0.52]} mat="radiator" radius={0.006} />
          {Array.from({ length: 9 }, (_, i) => (
            <Box key={i} size={[0.168, 0.2, 0.004]} mat="aluminium" position={[0, 0, (i - 4) * 0.058]} radius={0.001} />
          ))}
          {/* Fan behind the core, for hover and ground operation. */}
          <Cyl r={0.1} h={0.05} axis="x" mat="plastic" position={[-0.12, 0, 0]} segments={24} />
          <Cyl r={0.03} h={0.06} axis="x" mat="darkSteel" position={[-0.12, 0, 0]} segments={14} />
          {/* Inlet scoop on the belly. */}
          <Box size={[0.42, 0.05, 0.44]} mat="graphite" position={[0.26, -0.115, 0]} radius={0.02} />
        </group>
      </Part>

      <Part id="coolant-pumps">
        <group position={pumps as unknown as [number, number, number]} name="Pumps">
          {[-0.07, 0.07].map((z) => (
            <group key={z} position={[0, 0, z]}>
              <Cyl r={0.045} h={0.12} axis="x" mat="enclosureLight" segments={18} />
              <Cyl r={0.05} h={0.04} axis="x" mat="darkSteel" position={[0.07, 0, 0]} segments={18} />
            </group>
          ))}
        </group>
        <Cable points={lines.find((r) => r.id === "coolant-supply")!.points} radius={0.013} mat="coolantLine" cornerRadius={0.05} />
      </Part>

      <Part id="cooling-manifold">
        <group position={manifold as unknown as [number, number, number]} name="CoolingManifold">
          <Box size={[0.22, 0.07, 0.09]} mat="machined" radius={0.012} />
          {[-0.07, 0, 0.07].map((x) => (
            <Cyl key={x} r={0.018} h={0.04} mat="aluminium" position={[x, 0.05, 0]} segments={12} />
          ))}
        </group>
      </Part>

      <Part id="avionics-cooling">
        <group position={plate as unknown as [number, number, number]} name="AvionicsCooling">
          <Box size={[0.58, 0.016, 1.0]} mat="aluminium" position={[0, 0.095, 0]} radius={0.004} />
          {[-0.3, -0.1, 0.1, 0.3].map((z) => (
            <Box key={z} size={[0.5, 0.008, 0.03]} mat="coolantLine" position={[0, 0.083, z]} radius={0.003} />
          ))}
        </group>
        <Cable points={lines.find((r) => r.id === "coolant-avionics")!.points} radius={0.011} mat="coolantLine" cornerRadius={0.05} />
      </Part>
    </group>
  );
}
