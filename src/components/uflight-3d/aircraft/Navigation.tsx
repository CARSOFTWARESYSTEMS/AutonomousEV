// Navigation and communications: the sources the position solution is built
// from (GNSS, two inertial units, magnetometer, radar altimeter, air data,
// vision), the processor that fuses them, and the radios, gateway and
// antennas that link the aircraft to the ground.
import { EQUIPMENT, fuselagePoint } from "./layout";
import { boxLoft, cached } from "./geometry";
import { Box, Cyl, Geo, Mat } from "./materials";
import { Part } from "./Part";
import { EquipmentBox } from "./Equipment";

/** A swept blade antenna standing on the fuselage crown. */
const bladeAntenna = (x: number, y: number, height: number) =>
  cached(`blade-antenna-${x}`, () =>
    boxLoft([
      { centre: [x, y, 0], right: [0, 0, 0.012], up: [0.07, 0, 0] },
      { centre: [x - height * 0.5, y + height, 0], right: [0, 0, 0.005], up: [0.03, 0, 0] },
    ]),
  );

export function Communications() {
  const [ax, ay] = EQUIPMENT.antennas;
  return (
    <group name="Communications">
      <EquipmentBox id="ground-link" mat="enclosureLight" />
      <EquipmentBox id="maintenance-link" mat="enclosureLight" />
      <EquipmentBox id="secure-gateway" />
      <Part id="antennas">
        <group name="Antennas">
          <Geo geometry={bladeAntenna(ax, ay - 0.04, 0.2)} mat="paint" />
          <Geo geometry={bladeAntenna(ax + 0.42, ay - 0.04, 0.15)} mat="paint" />
          {/* Belly antenna for the ground link near the pad. */}
          <Cyl r={0.05} h={0.016} mat="graphite" position={[-0.3, 0.412, 0]} segments={20} />
        </group>
      </Part>
    </group>
  );
}

export default function Navigation() {
  const gnss = EQUIPMENT.gnss;
  const magnetometer = EQUIPMENT.magnetometer;
  const altimeter = EQUIPMENT["radar-altimeter"];
  const airData = EQUIPMENT["air-data"];
  const vision = EQUIPMENT["vision-sensors"];
  return (
    <group name="Navigation">
      <Part id="gnss">
        <group position={gnss as unknown as [number, number, number]} name="GNSS">
          <Cyl r={0.07} h={0.022} mat="paint" segments={24} />
          <Cyl r={0.045} h={0.03} mat="graphite" segments={20} />
        </group>
      </Part>
      <EquipmentBox id="imu-a" mat="enclosureLight" connectors="none" />
      <EquipmentBox id="imu-b" mat="enclosureLight" connectors="none" />
      <EquipmentBox id="nav-processor" />
      <Part id="magnetometer">
        <group position={magnetometer as unknown as [number, number, number]} name="Magnetometer">
          <Box size={[0.07, 0.04, 0.07]} mat="plastic" radius={0.008} />
          <Box size={[0.09, 0.006, 0.09]} mat="aluminium" position={[0, -0.022, 0]} radius={0.002} />
        </group>
      </Part>
      <Part id="radar-altimeter">
        <group position={altimeter as unknown as [number, number, number]} name="RadarAltimeter">
          <Box size={[0.14, 0.05, 0.1]} mat="enclosure" radius={0.008} />
          {/* Two flush patch antennas, looking down. */}
          {[-0.14, 0.14].map((dx) => (
            <Box key={dx} size={[0.08, 0.008, 0.08]} mat="graphite" position={[dx, -0.03, 0]} radius={0.003} />
          ))}
        </group>
      </Part>
      <Part id="air-data">
        <group name="AirData">
          {[-1, 1].map((sign) => {
            const skin = fuselagePoint(airData[0], (sign * 92 * Math.PI) / 180);
            return (
              <group key={sign} position={[skin[0], skin[1], skin[2] + sign * 0.035]}>
                <Box size={[0.07, 0.022, 0.07]} mat="aluminium" position={[-0.02, 0, -sign * 0.02]} radius={0.006} />
                <Cyl r={0.008} h={0.2} axis="x" mat="steel" position={[0.07, 0, sign * 0.012]} segments={10} />
              </group>
            );
          })}
        </group>
      </Part>
      <Part id="vision-sensors">
        <group name="VisionSensors">
          {/* Forward camera behind a small window in the nose, and a downward camera under it. */}
          <mesh position={[vision[0] + 0.1, vision[1] + 0.02, 0]}>
            <sphereGeometry args={[0.05, 18, 12]} />
            <Mat k="glass" />
          </mesh>
          <Cyl r={0.03} h={0.06} axis="x" mat="plastic" position={[vision[0] + 0.05, vision[1] + 0.02, 0]} segments={14} />
          <Cyl r={0.032} h={0.03} mat="plastic" position={[vision[0] - 0.12, 0.775, 0]} segments={14} />
          <Box size={[0.1, 0.07, 0.12]} mat="enclosure" position={[vision[0] - 0.14, 0.93, 0]} radius={0.01} />
        </group>
      </Part>
    </group>
  );
}
