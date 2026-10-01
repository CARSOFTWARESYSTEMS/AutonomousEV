// A line-replaceable unit: a dark metallic enclosure with a connector face,
// drawn at its position in the equipment layout. Used for flight computers,
// network, navigation, communication, health and power electronics.
import type { ComponentId } from "../types";
import { COMPONENTS } from "../data/componentDefinitions";
import { EQUIPMENT, EQUIPMENT_SIZE, type BoxedEquipment } from "./layout";
import { Box, type MaterialKey } from "./materials";
import { Part } from "./Part";

interface EquipmentBoxProps {
  id: BoxedEquipment & ComponentId;
  mat?: MaterialKey;
  /** Cooling fins on the top face. */
  fins?: boolean;
  /** Which face carries the connectors. */
  connectors?: "aft" | "forward" | "none";
  /** Detail on the unit itself, in the unit's own frame. */
  children?: React.ReactNode;
  /** Wiring that belongs to the unit but runs through the aircraft, in aircraft coordinates. */
  harness?: React.ReactNode;
}

export function EquipmentBox({ id, mat = "enclosure", fins = false, connectors = "aft", children, harness }: EquipmentBoxProps) {
  const [w, h, d] = EQUIPMENT_SIZE[id];
  const face = connectors === "forward" ? 1 : -1;
  const connectorCount = d > 0.2 ? 3 : 2;
  return (
    <Part id={id}>
      <group position={EQUIPMENT[id] as unknown as [number, number, number]} name={COMPONENTS[id].meshNames[0].split("/").pop()}>
        <Box size={[w, h, d]} mat={mat} radius={0.012} />
        {/* Mounting flanges. */}
        <Box size={[w * 0.9, 0.008, d + 0.03]} mat="aluminium" position={[0, -h / 2 + 0.004, 0]} radius={0.003} />
        {fins &&
          Array.from({ length: 5 }, (_, i) => <Box key={i} size={[w * 0.86, 0.016, 0.008]} mat="enclosureLight" position={[0, h / 2 + 0.008, (i - 2) * d * 0.17]} radius={0.002} />)}
        {connectors !== "none" &&
          Array.from({ length: connectorCount }, (_, i) => (
            <Box key={i} size={[0.02, h * 0.3, d * 0.16]} mat="connector" position={[face * (w / 2 + 0.008), 0, (i - (connectorCount - 1) / 2) * d * 0.27]} radius={0.004} />
          ))}
        {children}
      </group>
      {harness}
    </Part>
  );
}
