// Energy: two battery packs in structural trays under the cabin floor, either
// side of the keel; primary and secondary battery management; the HV
// contactor assembly; HV distribution to all eight propulsion units; and the
// DC/DC converter and LV bus that feed the electronics.
// Representative modules and cell groups only — individual cells are not drawn.
import { useMemo } from "react";
import type { ComponentId, ModuleNo, Vec3 } from "../types";
import { BATTERY, EQUIPMENT, MODULE_NUMBERS, MODULE_SIZE, fuselagePoint, moduleCentre } from "./layout";
import { FLOW_ROUTES } from "./routes";
import { Box, Cable, Cyl } from "./materials";
import { Deep, Part } from "./Part";
import { EquipmentBox } from "./Equipment";

const PACK_LENGTH = BATTERY.toX - BATTERY.fromX;
const PACK_HEIGHT = BATTERY.topY - BATTERY.bottomY;
const PACK_X = (BATTERY.toX + BATTERY.fromX) / 2;

/** An open structural tray: the cabin floor above closes the bay. */
function Pack({ side }: { side: "left" | "right" }) {
  const z = (side === "left" ? -1 : 1) * BATTERY.packZ;
  const wall = 0.014;
  const w = BATTERY.packWidth;
  return (
    <Part id={`battery-pack-${side}`}>
      <group position={[PACK_X, BATTERY.bottomY, z]} name={side === "left" ? "BatteryPackLeft" : "BatteryPackRight"}>
        <Box size={[PACK_LENGTH, wall, w]} mat="batteryCase" position={[0, wall / 2, 0]} radius={0.004} />
        {[-1, 1].map((sign) => (
          <Box key={`side-${sign}`} size={[PACK_LENGTH, PACK_HEIGHT * 0.62, wall]} mat="batteryCase" position={[0, PACK_HEIGHT * 0.31, sign * (w / 2 - wall / 2)]} radius={0.004} />
        ))}
        {[-1, 1].map((sign) => (
          <Box key={`end-${sign}`} size={[wall, PACK_HEIGHT * 0.62, w]} mat="batteryCase" position={[sign * (PACK_LENGTH / 2 - wall / 2), PACK_HEIGHT * 0.31, 0]} radius={0.004} />
        ))}
        {/* Cross-members between modules: part of the load path, and a barrier between modules. */}
        {[-1, 0, 1].map((k) => (
          <Box key={`cross-${k}`} size={[0.018, PACK_HEIGHT * 0.86, w - wall * 2]} mat="titanium" position={[(k * PACK_LENGTH) / BATTERY.modulesPerPack, PACK_HEIGHT * 0.43, 0]} radius={0.003} />
        ))}
      </group>
    </Part>
  );
}

const GROUPS: readonly (readonly [number, number])[] = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [0, 1],
  [1, 1],
];

function Module({ no }: { no: ModuleNo }) {
  const id: ComponentId = `battery-module-${no}`;
  const [l, h, w] = MODULE_SIZE;
  const base = h * 0.42;
  return (
    <Part id={id}>
      <group position={moduleCentre(no) as unknown as [number, number, number]} name={`Module${no}`}>
        <Box size={[l, base, w]} mat="batteryCase" position={[0, -h / 2 + base / 2, 0]} radius={0.01} />
        {/* Six representative cell groups, joined by busbars; they lift clear at component level. */}
        <Deep of={id} explode={[0, 0.16, 0]}>
          {GROUPS.map(([gx, gz], i) => (
            <Box key={i} size={[l * 0.29, h - base - 0.012, w * 0.44]} mat="cell" position={[gx * l * 0.315, -h / 2 + base + (h - base - 0.012) / 2, gz * w * 0.235]} radius={0.008} />
          ))}
        </Deep>
        <Deep of={id} explode={[0, 0.26, 0]}>
          {[-1, 1].map((gz) => (
            <Box key={gz} size={[l * 0.86, 0.006, 0.03]} mat="copper" position={[0, h / 2 - 0.004, gz * w * 0.235]} radius={0.002} />
          ))}
          <Box size={[0.07, 0.012, w * 0.3]} mat="plastic" position={[l * 0.36, h / 2 + 0.002, 0]} radius={0.003} />
        </Deep>
      </group>
    </Part>
  );
}

function HvBus() {
  const routes = useMemo(() => FLOW_ROUTES.filter((r) => r.group === "hv-unit" || r.id === "hv-riser"), []);
  return (
    <Part id="hvdc-bus">
      <group name="HVDCBus">
        {routes.map((route) => (
          <Cable key={route.id} points={route.points} radius={0.014} mat="cableHv" cornerRadius={0.1} />
        ))}
      </group>
    </Part>
  );
}

function ChargingInterface() {
  const at = EQUIPMENT["charging-interface"];
  const skin = fuselagePoint(at[0], (-100 * Math.PI) / 180);
  const position: Vec3 = [skin[0], skin[1], skin[2] + 0.012];
  return (
    <Part id="charging-interface">
      <group position={position as unknown as [number, number, number]} name="ChargingInterface">
        <Cyl r={0.075} h={0.04} axis="z" mat="darkSteel" segments={24} />
        <Cyl r={0.05} h={0.05} axis="z" mat="plastic" position={[0, 0, -0.004]} segments={20} />
        {[-0.02, 0.02].map((dx) => (
          <Cyl key={dx} r={0.011} h={0.056} axis="z" mat="copper" position={[dx, 0.005, -0.006]} segments={10} />
        ))}
        <Cyl r={0.008} h={0.056} axis="z" mat="copper" position={[0, -0.022, -0.006]} segments={10} />
      </group>
    </Part>
  );
}

export default function EnergySystem() {
  const lvRoutes = useMemo(() => FLOW_ROUTES.filter((r) => r.group === "lv"), []);
  const packLeads = useMemo(() => FLOW_ROUTES.filter((r) => r.id === "hv-pack-left" || r.id === "hv-pack-right").map((r) => r.points.slice(1)), []);
  return (
    <group name="Energy">
      <Pack side="left" />
      <Pack side="right" />
      <group name="BatteryModuleGroups">
        {MODULE_NUMBERS.map((no) => (
          <Module key={no} no={no} />
        ))}
      </group>
      <EquipmentBox id="bms-primary" mat="enclosureLight" connectors="forward" />
      <EquipmentBox id="bms-secondary" mat="enclosureLight" connectors="forward" />
      <EquipmentBox
        id="hv-contactors"
        connectors="none"
        harness={packLeads.map((points, i) => (
          <Cable key={i} points={points} radius={0.016} mat="cableHv" cornerRadius={0.05} />
        ))}
      >
        {/* Bus terminals and the pack leads from each side. */}
        {[-0.09, 0.09].map((z) => (
          <Cyl key={z} r={0.018} h={0.03} mat="copper" position={[-0.05, 0.09, z]} segments={12} />
        ))}
        <Box size={[0.08, 0.02, 0.2]} mat="cableHv" position={[0.06, 0.09, 0]} radius={0.006} />
      </EquipmentBox>
      <HvBus />
      <EquipmentBox id="dcdc-converter" fins />
      <EquipmentBox
        id="lvdc-bus"
        mat="enclosureLight"
        harness={
          <group name="LVDCBusHarness">
            {lvRoutes.map((route) => (
              <Cable key={route.id} points={route.points} radius={0.008} mat="cableData" cornerRadius={0.06} />
            ))}
          </group>
        }
      />
      <ChargingInterface />
    </group>
  );
}
