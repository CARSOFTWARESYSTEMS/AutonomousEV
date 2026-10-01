// Onboard computer, mass memory and the main data bus.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MeshStandardMaterial } from "three";
import { frame } from "../scene/frameState";
import { BUS } from "./layout";
import { FLOW_ROUTE_BY_ID, type FlowId } from "./flowRoutes";
import { Board, Box, Cable } from "./primitives";
import { Part } from "./Part";

const X = BUS.columnX;

/** Flight-software status light: dark until the computer has booted, then a slow heartbeat. */
function FlightSoftwareIndicator() {
  const material = useRef<MeshStandardMaterial>(null);
  useFrame(() => {
    if (!material.current) return;
    const heartbeat = 0.72 + 0.28 * Math.sin(frame.now * 3.2);
    material.current.emissiveIntensity = 2.6 * frame.bootProgress * heartbeat;
  });
  return (
    <mesh name="FlightSoftwareIndicator" position={[-0.33, 0.03, 0.33]}>
      <boxGeometry args={[0.05, 0.03, 0.05]} />
      <meshStandardMaterial ref={material} color="#0d2a1c" emissive="#58f0a6" emissiveIntensity={0} toneMapped={false} userData={{ live: true }} />
    </mesh>
  );
}

function Obc() {
  return (
    <Part id="obc">
      <Board
        position={[X, 0.0, 0]}
        chips={[
          { at: [-0.08, -0.05], size: [0.3, 0.022, 0.3], mat: "shield" },
          { at: [-0.3, 0.16], size: [0.14, 0.03, 0.2] },
          { at: [0.14, 0.27], size: [0.2, 0.03, 0.12] },
          { at: [0.14, -0.3], size: [0.16, 0.03, 0.12] },
          { at: [-0.3, -0.3], size: [0.1, 0.045, 0.1], mat: "shield" },
          { at: [-0.05, -0.385], size: [0.4, 0.06, 0.07], mat: "connector" },
        ]}
      >
        <FlightSoftwareIndicator />
      </Board>
    </Part>
  );
}

function DataStorage() {
  return (
    <Part id="data-storage">
      <Board
        position={[X, 0.24, 0]}
        chips={[
          { at: [-0.22, -0.2], size: [0.2, 0.028, 0.26] },
          { at: [0.02, -0.2], size: [0.2, 0.028, 0.26] },
          { at: [-0.22, 0.16], size: [0.2, 0.028, 0.26] },
          { at: [0.02, 0.16], size: [0.2, 0.028, 0.26] },
          { at: [0.22, 0.0], size: [0.1, 0.03, 0.1], mat: "shield" },
        ]}
      />
    </Part>
  );
}

const DATA_ROUTES: FlowId[] = ["sense-startracker", "sense-mag", "cmd-payload", "payload-store"];

function DataBus() {
  return (
    <Part id="data-bus">
      <group name="MainDataBus">
        {/* Stack connector column running the length of the avionics stack. */}
        <Box size={[0.06, BUS.length - 0.36, 0.1]} position={[1.05, 0, 0.37]} mat="cableData" radius={0.01} />
        {DATA_ROUTES.map((id) => (
          <Cable key={id} points={FLOW_ROUTE_BY_ID[id].points} radius={0.009} mat="cableData" />
        ))}
      </group>
    </Part>
  );
}

export default function Avionics() {
  return (
    <group name="Avionics">
      <Obc />
      <DataStorage />
      <DataBus />
    </group>
  );
}
