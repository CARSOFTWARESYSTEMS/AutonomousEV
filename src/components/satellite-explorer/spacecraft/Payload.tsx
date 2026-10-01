// Optical payload: a reflecting telescope looking out of the Earth-facing end,
// its focal-plane electronics and the onboard payload processor.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type MeshPhysicalMaterial } from "three";
import { frame } from "../scene/frameState";
import { BUS, HALF } from "./layout";
import { Board, Box, Cyl, Mat } from "./primitives";
import { Part } from "./Part";

const X = -BUS.columnX;
const TUBE_RADIUS = 0.44;
const APERTURE_Y = -HALF.y + 0.03;
const TUBE_END_Y = 0.35;
const TUBE_LENGTH = TUBE_END_Y - APERTURE_Y;
const TUBE_CENTER_Y = (TUBE_END_Y + APERTURE_Y) / 2;

/** Entrance window: brightens briefly while the detector is exposing. */
function EntranceWindow() {
  const material = useRef<MeshPhysicalMaterial>(null);
  useFrame(() => {
    if (material.current) material.current.emissiveIntensity = 1.6 * frame.capture.exposure;
  });
  return (
    <mesh name="PayloadAperture" position={[0, APERTURE_Y + 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <circleGeometry args={[TUBE_RADIUS - 0.025, 48]} />
      <meshPhysicalMaterial
        ref={material}
        color="#0a1220"
        metalness={0}
        roughness={0.03}
        clearcoat={1}
        clearcoatRoughness={0.02}
        transparent
        opacity={0.3}
        emissive="#9fe6ff"
        emissiveIntensity={0}
        side={DoubleSide}
        userData={{ live: true }}
      />
    </mesh>
  );
}

function OpticalPayload() {
  return (
    <Part id="optical-payload">
      <group name="OpticalPayload" position={[X, 0, 0]}>
        {/* Outer tube and blackened inner baffle. */}
        <Cyl r={TUBE_RADIUS} h={TUBE_LENGTH} position={[0, TUBE_CENTER_Y, 0]} mat="enclosure" open segments={48} />
        <Cyl r={TUBE_RADIUS - 0.018} h={TUBE_LENGTH} position={[0, TUBE_CENTER_Y, 0]} mat="black" open doubleSide segments={48} />
        <mesh position={[0, APERTURE_Y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[TUBE_RADIUS - 0.006, 0.02, 10, 48]} />
          <Mat k="machined" />
        </mesh>
        {/* Mounting rings that sit in the payload-deck cradles. */}
        {[-1.35, -0.1].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[TUBE_RADIUS + 0.004, 0.022, 8, 48]} />
            <Mat k="machined" />
          </mesh>
        ))}
        {/* Baffle vanes. */}
        {[APERTURE_Y + 0.28, APERTURE_Y + 0.56].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[TUBE_RADIUS - 0.09, TUBE_RADIUS - 0.018, 48]} />
            <Mat k="black" side={DoubleSide} />
          </mesh>
        ))}
        <EntranceWindow />
        {/* Primary mirror at the back of the tube, facing the aperture. */}
        <mesh position={[0, TUBE_END_Y - 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, TUBE_RADIUS - 0.03, 48]} />
          <Mat k="mirror" side={DoubleSide} />
        </mesh>
        {/* Secondary mirror on a three-vane spider. */}
        <group position={[0, APERTURE_Y + 0.42, 0]}>
          <Cyl r={0.11} h={0.035} mat="enclosure" segments={24} />
          <mesh position={[0, 0.019, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.1, 24]} />
            <Mat k="mirror" />
          </mesh>
          {[0, 120, 240].map((deg) => (
            <group key={deg} rotation={[0, (deg * Math.PI) / 180, 0]}>
              <Box size={[TUBE_RADIUS - 0.12, 0.05, 0.008]} position={[(TUBE_RADIUS + 0.09) / 2, 0, 0]} mat="black" radius={0.002} />
            </group>
          ))}
        </group>
        {/* Focal-plane housing closing the rear of the tube. */}
        <Cyl r={TUBE_RADIUS} h={0.03} position={[0, TUBE_END_Y, 0]} mat="enclosure" segments={48} />
        <Box size={[0.5, 0.08, 0.5]} position={[0, TUBE_END_Y + 0.05, 0]} mat="shield" />
      </group>
    </Part>
  );
}

function PayloadElectronics() {
  return (
    <Part id="payload-electronics">
      <group name="PayloadElectronics">
        <Board
          position={[X, 0.56, 0]}
          chips={[
            { at: [-0.1, -0.06], size: [0.28, 0.03, 0.28] },
            { at: [0.2, 0.22], size: [0.14, 0.03, 0.2] },
            { at: [-0.28, 0.26], size: [0.16, 0.05, 0.12], mat: "shield" },
            { at: [-0.05, -0.385], size: [0.44, 0.06, 0.07], mat: "connector" },
          ]}
        />
      </group>
    </Part>
  );
}

function PayloadProcessor() {
  return (
    <Part id="payload-processor">
      <group name="PayloadProcessor">
        <Board position={[X, 0.97, 0]} chips={[{ at: [-0.08, 0.0], size: [0.5, 0.05, 0.5], mat: "shield" }]}>
          {[-0.2, -0.1, 0.0, 0.1, 0.2].map((fz) => (
            <Box key={fz} size={[0.46, 0.05, 0.02]} position={[-0.08, 0.087, fz]} mat="shield" radius={0.004} />
          ))}
        </Board>
      </group>
    </Part>
  );
}

export default function Payload() {
  return (
    <group name="Payload">
      <OpticalPayload />
      <PayloadElectronics />
      <PayloadProcessor />
    </group>
  );
}
