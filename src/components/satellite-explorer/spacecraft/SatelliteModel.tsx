// Root of the reference spacecraft. Position, attitude and visual scale come
// from the simulation; the subsystem components below register their parts
// under semantic ids. To swap in an authored GLB, render it here in place of
// the procedural subsystems and bind its nodes with `bindModel`.
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { frame } from "../scene/frameState";
import { BodyAxes } from "../overlays/ADCSVectors";
import InternalFlows from "../overlays/InternalFlows";
import PartLabels from "../overlays/PartLabels";
import PowerFlow from "../overlays/PowerFlow";
import ADCS from "./ADCS";
import Avionics from "./Avionics";
import Communications from "./Communications";
import Payload from "./Payload";
import PowerSystem from "./PowerSystem";
import SolarArrays from "./SolarArrays";
import Structure from "./Structure";
import Thermal from "./Thermal";
import { disposeSpacecraftTextures } from "./textures";

export default function SatelliteModel() {
  const root = useRef<Group>(null);

  useEffect(() => disposeSpacecraftTextures, []);

  useFrame(() => {
    const group = root.current;
    if (!group) return;
    group.position.copy(frame.satPos);
    group.quaternion.copy(frame.attitude);
    group.scale.setScalar(frame.satScale);
  });

  return (
    <group ref={root} name="SatelliteRoot">
      <Structure />
      <SolarArrays />
      <PowerSystem />
      <Avionics />
      <ADCS />
      <Communications />
      <Payload />
      <Thermal />
      <InternalFlows />
      <PowerFlow />
      <BodyAxes />
      <PartLabels />
    </group>
  );
}
