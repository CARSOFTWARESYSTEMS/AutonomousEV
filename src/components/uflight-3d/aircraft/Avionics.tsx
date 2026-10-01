// Avionics: the equipment bay behind the cabin, the two network switches, the
// flight displays and the data harness that joins the forward and rear bays.
import { useMemo } from "react";
import { CABIN, EQUIPMENT } from "./layout";
import { FLOW_ROUTES } from "./routes";
import { Box, Cable } from "./materials";
import { Part } from "./Part";
import { EquipmentBox } from "./Equipment";

/** Two shelves on four uprights, behind the cabin bulkhead. */
function Rack() {
  const [x, , z] = EQUIPMENT["avionics-rack"];
  const shelves = [0.935, 1.2];
  return (
    <Part id="avionics-rack">
      <group name="EquipmentBay">
        {shelves.map((y) => (
          <Box key={y} size={[0.62, 0.012, 1.16]} mat="aluminium" position={[x - 0.06, y, z]} radius={0.004} />
        ))}
        {[-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) => <Box key={`${sx}${sz}`} size={[0.02, 0.62, 0.02]} mat="aluminium" position={[x - 0.06 + sx * 0.3, 1.02, sz * 0.57]} radius={0.004} />),
        )}
        {/* Lower shelf for the gateways and radios in the narrowing tail. */}
        <Box size={[0.3, 0.012, 0.78]} mat="aluminium" position={[-2.2, 1.075, 0]} radius={0.004} />
        <Box size={[0.3, 0.012, 0.6]} mat="aluminium" position={[-2.2, 1.37, 0]} radius={0.004} />
      </group>
    </Part>
  );
}

export default function Avionics() {
  const harness = useMemo(() => FLOW_ROUTES.filter((r) => r.group === "network" && (r.id === "network-a" || r.id === "network-b")), []);
  const [px, py] = EQUIPMENT["flight-displays"];
  return (
    <group name="Avionics">
      <Rack />
      <EquipmentBox id="network-switch-a" mat="enclosureLight" />
      <EquipmentBox id="network-switch-b" mat="enclosureLight" />
      <Part id="flight-displays">
        <group name="FlightDisplays">
          {[-0.3, 0.3].map((z) => (
            <group key={z} position={[px - 0.005, py + 0.03, z]}>
              <Box size={[0.022, 0.2, 0.5]} mat="plastic" radius={0.008} />
              <Box size={[0.006, 0.17, 0.46]} mat="screen" position={[-0.012, 0, 0]} radius={0.002} />
            </group>
          ))}
          {/* Standby display between them. */}
          <Box size={[0.02, 0.09, 0.09]} mat="screen" position={[CABIN.panelX - 0.006, py - 0.12, 0]} radius={0.004} />
        </group>
      </Part>
      <Part id="data-harness">
        <group name="DataHarness">
          {harness.map((route) => (
            <Cable key={route.id} points={route.points} radius={0.007} mat="cableData" cornerRadius={0.06} />
          ))}
        </group>
      </Part>
    </group>
  );
}
