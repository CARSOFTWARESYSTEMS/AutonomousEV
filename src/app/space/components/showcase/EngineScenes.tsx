"use client";
// The tutorial showcase's two engine scenes: the Rocket Engine Digital Twin's
// own reference engine, cut away; the advanced view adds that tutorial's
// pressure sensors and harness. A separate chunk from the other scenes.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, TubeGeometry, Vector3, type Group } from "three";
import EngineModel from "@/components/rocket-engine-twin/engine/EngineModel";
import { SENSOR_AT, harnessPath, CONTROLLER_AT } from "@/components/rocket-engine-twin/engine/layout";
import { useRocketTwinStore } from "@/components/rocket-engine-twin/state/twinStore";

// ── 6 and 7. The reference engine, cut away; with its pressure sensors ──
// Both rows share the twin's store, so the cutaway is counted and undone when
// the last one leaves: the Rocket Engine Digital Twin page then starts as usual.
let cutawayUsers = 0;
function useCutaway() {
  useEffect(() => {
    cutawayUsers += 1;
    useRocketTwinStore.setState({ cutaway: "all" });
    return () => {
      cutawayUsers -= 1;
      if (cutawayUsers === 0) useRocketTwinStore.setState({ cutaway: null });
    };
  }, []);
}

export function EngineScene() {
  useCutaway();
  return (
    <group position={[0, 0.05, 0]}>
      <EngineModel />
    </group>
  );
}

const PRESSURE_SENSORS = ["chamber_pressure", "pump_discharge_pressure"] as const;

function Harness({ id }: { id: (typeof PRESSURE_SENSORS)[number] }) {
  const geometry = useMemo(() => {
    const pts = harnessPath(id).map(([x, y, z]) => new Vector3(x, y, z));
    return new TubeGeometry(new CatmullRomCurve3(pts), 48, 0.012, 6, false);
  }, [id]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color="#67e8f9" />
    </mesh>
  );
}

function SensorMarker({ at, playing }: { at: [number, number, number]; playing: boolean }) {
  const ring = useRef<Group>(null);
  const t = useRef(0);
  useFrame((_, delta) => {
    if (!ring.current) return;
    if (playing) t.current += Math.min(delta, 0.05);
    const s = 1 + 0.35 * Math.abs(Math.sin(t.current * 2));
    ring.current.scale.setScalar(s);
  });
  return (
    <group position={at}>
      <mesh>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshBasicMaterial color="#fcd34d" />
      </mesh>
      <group ref={ring}>
        <mesh>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

export function PropulsionScene({ playing }: { playing: boolean }) {
  useCutaway();
  return (
    <group position={[0, 0.05, 0]}>
      <EngineModel />
      {PRESSURE_SENSORS.map((id) => (
        <group key={id}>
          <SensorMarker at={SENSOR_AT[id].at as [number, number, number]} playing={playing} />
          <Harness id={id} />
        </group>
      ))}
      <mesh position={CONTROLLER_AT as [number, number, number]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshBasicMaterial color="#67e8f9" />
      </mesh>
    </group>
  );
}

