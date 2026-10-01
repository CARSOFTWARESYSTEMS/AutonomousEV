// Attitude determination and control hardware: four reaction wheels (three
// orthogonal plus a skewed spare), magnetorquers and the attitude sensors.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Group, Quaternion, Vector3 } from "three";
import type { ComponentId, Vec3 } from "../types";
import { REDUNDANT_WHEEL_AXIS } from "../simulation/adcs";
import { frame } from "../scene/frameState";
import { BUS, HALF, LAYOUT, MOUNT, SUB_EXPLODE } from "./layout";
import { Board, Box, Cyl, Mat } from "./primitives";
import { Offset, Part } from "./Part";

const X = BUS.columnX;
const UP = new Vector3(0, 1, 0);

/** Rotation taking the wheel's local spin axis (+Y) onto a body axis. */
const axisQuaternion = (axis: Vec3) => new Quaternion().setFromUnitVectors(UP, new Vector3(axis[0], axis[1], axis[2]).normalize());

function ReactionWheel({ id, index, axis }: { id: ComponentId; index: 0 | 1 | 2 | 3; axis: Vec3 }) {
  const rotor = useRef<Group>(null);
  const orientation = useMemo(() => axisQuaternion(axis), [axis]);
  useFrame(() => {
    if (rotor.current) rotor.current.rotation.y = frame.wheelAngle[index];
  });
  return (
    <Part id={id}>
      <group position={LAYOUT[id].anchor as [number, number, number]} quaternion={orientation}>
        {/* Housing: open cup so the flywheel is visible. */}
        <Cyl r={0.21} h={0.15} mat="machined" open doubleSide segments={36} />
        <Cyl r={0.215} h={0.022} position={[0, -0.075, 0]} mat="machined" segments={36} />
        <mesh position={[0, 0.076, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <ringGeometry args={[0.165, 0.212, 36]} />
          <Mat k="machined" side={DoubleSide} />
        </mesh>
        {[45, 135, 225, 315].map((deg) => {
          const a = (deg * Math.PI) / 180;
          return <Box key={deg} size={[0.07, 0.03, 0.07]} position={[Math.cos(a) * 0.24, -0.07, Math.sin(a) * 0.24]} mat="shield" radius={0.008} />;
        })}
        {/* Flywheel: the asymmetric markings make its spin readable. */}
        <group ref={rotor}>
          <Cyl r={0.17} h={0.085} mat="shield" segments={36} />
          <Cyl r={0.045} h={0.11} mat="enclosure" segments={16} />
          <Box size={[0.2, 0.012, 0.03]} position={[0.07, 0.046, 0]} mat="gold" radius={0.004} />
          <Box size={[0.03, 0.012, 0.11]} position={[-0.08, 0.046, 0.05]} mat="enclosure" radius={0.004} />
          <Box size={[0.03, 0.012, 0.11]} position={[-0.08, 0.046, -0.05]} mat="enclosure" radius={0.004} />
        </group>
      </group>
    </Part>
  );
}

function TorqueRod({ position, axis }: { position: Vec3; axis: "x" | "z" }) {
  return (
    <group position={position as [number, number, number]}>
      <Cyl r={0.034} h={0.66} axis={axis} mat="copper" segments={14} />
      {[-1, 1].map((s) => (
        <Cyl key={s} r={0.042} h={0.07} axis={axis} position={axis === "x" ? [s * 0.36, 0, 0] : [0, 0, s * 0.36]} mat="enclosure" segments={14} />
      ))}
    </group>
  );
}

function Magnetorquers() {
  return (
    <Part id="magnetorquers">
      <group name="MagnetorquerX">
        <TorqueRod position={[X, -0.16, -0.37]} axis="x" />
      </group>
      <group name="MagnetorquerZ">
        <TorqueRod position={[0.15, -0.14, 0]} axis="z" />
      </group>
      {/* Air-core coil around the column: its dipole lies along the long (Y) axis. */}
      <group name="MagnetorquerY" position={[X, -0.2, 0]}>
        {[-1, 1].map((s) => (
          <Box key={`x-${s}`} size={[0.94, 0.05, 0.03]} position={[0, 0, s * 0.43]} mat="copper" radius={0.01} />
        ))}
        {[-1, 1].map((s) => (
          <Box key={`z-${s}`} size={[0.03, 0.05, 0.89]} position={[s * 0.455, 0, 0]} mat="copper" radius={0.01} />
        ))}
      </group>
    </Part>
  );
}

function Magnetometer() {
  const [x, y, z] = MOUNT.magnetometer;
  return (
    <Part id="magnetometer">
      <Cyl r={0.018} h={0.13} position={[x, y - 0.09, z]} mat="machined" segments={10} />
      <Box size={[0.17, 0.07, 0.17]} position={[x, y, z]} mat="enclosure" />
      <Box size={[0.09, 0.012, 0.09]} position={[x, y + 0.04, z]} mat="white" radius={0.004} />
    </Part>
  );
}

function SunSensorHead() {
  return (
    <group>
      <Box size={[0.2, 0.05, 0.2]} mat="enclosure" />
      <Box size={[0.11, 0.012, 0.11]} position={[0, 0.03, 0]} mat="lens" radius={0.004} />
    </group>
  );
}

function SunSensors() {
  return (
    <Part id="sun-sensors">
      <Offset explode={[0, 0, 0]}>
        <group name="SunSensor1" position={MOUNT.sunSensorZenith as [number, number, number]}>
          <SunSensorHead />
        </group>
      </Offset>
      {/* Second head on the Sun face, so the Sun is seen from either hemisphere. */}
      <Offset explode={[0, -2.3, SUB_EXPLODE.mliSun[2] + 0.5]}>
        <group name="SunSensor2" position={MOUNT.sunSensorFace as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <SunSensorHead />
        </group>
      </Offset>
    </Part>
  );
}

function StarTracker() {
  const [x, y] = MOUNT.starTrackerBaffle;
  return (
    <Part id="star-tracker">
      <Box size={[0.52, 0.44, 0.42]} position={[x, y, 0.02]} mat="enclosure" />
      {/* Baffle looks out of the cold face, away from the Sun. */}
      <Cyl r={0.2} rTop={0.13} h={0.42} axis="z" position={[x, y, -HALF.z + 0.06]} mat="black" open doubleSide segments={28} />
      <Cyl r={0.125} h={0.02} axis="z" position={[x, y, -0.21]} mat="lens" segments={24} />
      <mesh position={[x, y, -HALF.z - 0.15]} castShadow>
        <torusGeometry args={[0.2, 0.012, 8, 32]} />
        <Mat k="machined" />
      </mesh>
    </Part>
  );
}

function GnssReceiver() {
  const [x, y, z] = MOUNT.gnssPatch;
  return (
    <Part id="gnss-receiver">
      <Board
        position={[X, 1.6, 0]}
        chips={[
          { at: [-0.1, 0.0], size: [0.34, 0.04, 0.3], mat: "shield" },
          { at: [0.2, -0.26], size: [0.12, 0.03, 0.12] },
        ]}
      />
      <Offset explode={[0, SUB_EXPLODE.zenithPlate[1] + 0.5 - 1.64 * 0.62, -1.75]}>
        <group position={[x, y, z]}>
          <Box size={[0.32, 0.03, 0.32]} mat="ceramic" radius={0.008} />
          <Box size={[0.2, 0.008, 0.2]} position={[0, 0.019, 0]} mat="gold" radius={0.003} />
        </group>
      </Offset>
    </Part>
  );
}

export default function ADCS() {
  return (
    <group name="ADCS">
      <ReactionWheel id="reaction-wheel-x" index={0} axis={[1, 0, 0]} />
      <ReactionWheel id="reaction-wheel-y" index={1} axis={[0, 1, 0]} />
      <ReactionWheel id="reaction-wheel-z" index={2} axis={[0, 0, 1]} />
      <ReactionWheel id="reaction-wheel-r" index={3} axis={REDUNDANT_WHEEL_AXIS} />
      <Magnetorquers />
      <Magnetometer />
      <SunSensors />
      <StarTracker />
      <GnssReceiver />
    </group>
  );
}
