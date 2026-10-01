// Flight controls: three flight-compute channels in separate locations —
// FCC-A in the forward bay, FCC-B and FCC-C either side of the rear bay — and
// the actuator controllers that turn the agreed command into surface motion.
// The surfaces and their actuators are drawn with the wing and tail; the
// propulsion control units are drawn with each propulsion unit.
import { EquipmentBox } from "./Equipment";

export default function FlightControls() {
  return (
    <group name="FlightControls">
      <EquipmentBox id="fcc-a" fins />
      <EquipmentBox id="fcc-b" fins />
      <EquipmentBox id="fcc-c" fins />
      <EquipmentBox id="actuator-controllers" mat="enclosureLight" fins />
    </group>
  );
}
