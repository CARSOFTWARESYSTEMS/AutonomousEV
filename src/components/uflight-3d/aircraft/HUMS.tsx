// Health and usage monitoring hardware: four acquisition nodes close to the
// sensors (each wing, the fuselage, the tail), the sensor gateway, the edge
// processor, the health computer and the maintenance gateway.
import { EquipmentBox } from "./Equipment";

export default function HUMS() {
  return (
    <group name="HUMS">
      <group name="AcquisitionNodes">
        <EquipmentBox id="acquisition-node-wing-left" mat="enclosureLight" />
        <EquipmentBox id="acquisition-node-wing-right" mat="enclosureLight" />
        <EquipmentBox id="acquisition-node-fuselage" mat="enclosureLight" />
        <EquipmentBox id="acquisition-node-tail" mat="enclosureLight" />
      </group>
      <EquipmentBox id="sensor-gateway" />
      <EquipmentBox id="edge-processor" fins />
      <EquipmentBox id="hums-computer" fins />
      <EquipmentBox id="maintenance-gateway" />
    </group>
  );
}
