// Lighting. One key light with soft shadows, a quiet fill and rim, and an
// image-based environment so metal and glass have something to reflect.
// The opening is deliberately dark: a single light from above reveals part of
// the aircraft, and the rest comes up when the aircraft is powered on.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, type DirectionalLight, type HemisphereLight, PMREMGenerator, type Scene, type Texture, Vector3 } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { EnvironmentId } from "../types";
import { AIRCRAFT_CENTRE } from "../aircraft/layout";
import { lerp } from "../lib/math";
import { useUFlightStore } from "../state/uflightStore";
import { frame } from "./frameState";

interface Look {
  key: number;
  keyColor: string;
  /** Direction the key light comes from. */
  keyFrom: readonly [number, number, number];
  fill: number;
  rim: number;
  sky: string;
  ground: string;
  hemisphere: number;
  environment: number;
}

const LOOKS: Record<EnvironmentId, Look> = {
  studio: { key: 2.3, keyColor: "#fff3e4", keyFrom: [0.5, 0.74, 0.46], fill: 0.2, rim: 0.7, sky: "#aab4c4", ground: "#0c0d10", hemisphere: 0.1, environment: 0.3 },
  vertiport: { key: 2.0, keyColor: "#ffd9b0", keyFrom: [0.62, 0.42, 0.66], fill: 0.3, rim: 0.6, sky: "#6f86a8", ground: "#1b1d22", hemisphere: 0.36, environment: 0.3 },
  flight: { key: 2.7, keyColor: "#fff1dc", keyFrom: [0.5, 0.74, 0.44], fill: 0.3, rim: 0.3, sky: "#9fc0ea", ground: "#55606b", hemisphere: 0.6, environment: 0.42 },
  twin: { key: 1.4, keyColor: "#dbe8f5", keyFrom: [0.3, 0.86, 0.4], fill: 0.2, rim: 0.6, sky: "#5d7ea3", ground: "#05070a", hemisphere: 0.2, environment: 0.24 },
};

/** Before power-on: one light from above and to the side, and almost nothing else. */
const OPENING: Look = { key: 1.9, keyColor: "#fff2e0", keyFrom: [-0.18, 0.95, 0.26], fill: 0, rim: 0.34, sky: "#6a7688", ground: "#000000", hemisphere: 0.02, environment: 0.07 };

const ENVIRONMENTS = Object.keys(LOOKS) as EnvironmentId[];
const KEY_DISTANCE = 26;
const from = new Vector3();
const color = new Color();
const mixed = new Color();

export default function Lighting() {
  const key = useRef<DirectionalLight>(null);
  const fill = useRef<DirectionalLight>(null);
  const rim = useRef<DirectionalLight>(null);
  const hemisphere = useRef<HemisphereLight>(null);
  const quality = useUFlightStore((s) => s.quality);
  const gl = useThree((state) => state.gl);
  const reflections = useRef<Texture | null>(null);
  const lit = useRef<Scene | null>(null);

  // A neutral prefiltered room for reflections; its strength is what changes between environments.
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    reflections.current = target.texture;
    return () => {
      reflections.current = null;
      if (lit.current) lit.current.environment = null;
      target.dispose();
      room.traverse((o) => {
        const mesh = o as { geometry?: { dispose(): void }; material?: { dispose(): void } };
        mesh.geometry?.dispose();
        mesh.material?.dispose();
      });
      pmrem.dispose();
    };
  }, [gl]);

  useFrame(({ scene }) => {
    const power = frame.power;
    lit.current = scene;
    if (scene.environment !== reflections.current) scene.environment = reflections.current;
    // Blend the look across environments, then between the dark opening and the powered-on aircraft.
    let k = 0;
    let f = 0;
    let r = 0;
    let h = 0;
    let e = 0;
    from.set(0, 0, 0);
    mixed.setRGB(0, 0, 0);
    const sky = hemisphere.current?.color.setRGB(0, 0, 0);
    const ground = hemisphere.current?.groundColor.setRGB(0, 0, 0);
    for (const id of ENVIRONMENTS) {
      const w = frame.environment[id];
      if (w <= 0) continue;
      const look = LOOKS[id];
      k += look.key * w;
      f += look.fill * w;
      r += look.rim * w;
      h += look.hemisphere * w;
      e += look.environment * w;
      from.x += look.keyFrom[0] * w;
      from.y += look.keyFrom[1] * w;
      from.z += look.keyFrom[2] * w;
      mixed.add(color.set(look.keyColor).multiplyScalar(w));
      sky?.add(color.set(look.sky).multiplyScalar(w));
      ground?.add(color.set(look.ground).multiplyScalar(w));
    }
    from.set(lerp(OPENING.keyFrom[0], from.x, power), lerp(OPENING.keyFrom[1], from.y, power), lerp(OPENING.keyFrom[2], from.z, power)).normalize();

    const centreX = frame.position.x + AIRCRAFT_CENTRE[0];
    const centreY = frame.position.y + frame.lift + AIRCRAFT_CENTRE[1];
    if (key.current) {
      key.current.intensity = lerp(OPENING.key, k, power);
      key.current.color.copy(mixed).lerp(color.set(OPENING.keyColor), 1 - power);
      key.current.position.set(centreX + from.x * KEY_DISTANCE, centreY + from.y * KEY_DISTANCE, from.z * KEY_DISTANCE);
      key.current.target.position.set(centreX, centreY, 0);
      key.current.target.updateMatrixWorld();
    }
    if (fill.current) {
      fill.current.intensity = lerp(OPENING.fill, f, power);
      fill.current.position.set(centreX + 14, centreY + 3, -16);
      fill.current.target.position.set(centreX, centreY, 0);
      fill.current.target.updateMatrixWorld();
    }
    if (rim.current) {
      rim.current.intensity = lerp(OPENING.rim, r, power);
      rim.current.position.set(centreX - 16, centreY + 9, -9);
      rim.current.target.position.set(centreX, centreY, 0);
      rim.current.target.updateMatrixWorld();
    }
    if (hemisphere.current) hemisphere.current.intensity = lerp(OPENING.hemisphere, h, power);
    scene.environmentIntensity = lerp(OPENING.environment, e, power);
  });

  return (
    <>
      <directionalLight
        ref={key}
        castShadow={quality.shadows}
        shadow-mapSize={[quality.shadowMapSize, quality.shadowMapSize]}
        shadow-camera-left={-10.5}
        shadow-camera-right={10.5}
        shadow-camera-top={10.5}
        shadow-camera-bottom={-10.5}
        shadow-camera-near={4}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.035}
        shadow-radius={5}
      />
      <directionalLight ref={fill} color="#bcd0ea" />
      <directionalLight ref={rim} color="#dfe8f6" />
      <hemisphereLight ref={hemisphere} />
    </>
  );
}
