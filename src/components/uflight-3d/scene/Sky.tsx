// The backdrop shared by all four environments: a gradient dome that follows
// the camera, and distance fog in the colour of its horizon. Each environment
// contributes by its weight, so changing environment is a fade, not a cut.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, Color, type Fog, type Mesh, ShaderMaterial } from "three";
import type { EnvironmentId } from "../types";
import { frame } from "./frameState";

interface Backdrop {
  zenith: string;
  horizon: string;
  below: string;
  fogNear: number;
  fogFar: number;
}

const BACKDROPS: Record<EnvironmentId, Backdrop> = {
  // Engineering studio: almost black, a faintly lighter horizon so the floor has an edge.
  studio: { zenith: "#030405", horizon: "#0b0d11", below: "#040506", fogNear: 26, fogFar: 96 },
  // Vertiport at dusk: calm, no skyline.
  vertiport: { zenith: "#0a1220", horizon: "#3a4458", below: "#12151b", fogNear: 70, fogFar: 520 },
  flight: { zenith: "#24528f", horizon: "#a9c5e3", below: "#8097ae", fogNear: 320, fogFar: 3800 },
  // Digital twin space: dark and quiet, an engineering workspace rather than a spectacle.
  twin: { zenith: "#03060a", horizon: "#0b1622", below: "#04070b", fogNear: 34, fogFar: 130 },
};

const ENVIRONMENTS = Object.keys(BACKDROPS) as EnvironmentId[];

const vertexShader = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uBelow;
  uniform float uSun;
  varying vec3 vDirection;
  void main() {
    float y = normalize(vDirection).y;
    vec3 above = mix(uHorizon, uZenith, pow(smoothstep(0.0, 0.6, y), 0.62));
    vec3 colour = mix(above, uBelow, smoothstep(0.0, -0.22, y));
    // A soft sun, present only in the flight environment.
    float glow = pow(max(dot(normalize(vDirection), normalize(vec3(0.5, 0.74, 0.44))), 0.0), 220.0);
    colour += vec3(1.0, 0.94, 0.82) * glow * 1.4 * uSun;
    gl_FragColor = vec4(colour, 1.0);
  }
`;

const tmp = new Color();

export default function Sky() {
  const mesh = useRef<Mesh>(null);
  const fog = useRef<Fog>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uZenith: { value: new Color() }, uHorizon: { value: new Color() }, uBelow: { value: new Color() }, uSun: { value: 0 } },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ camera }) => {
    const dome = mesh.current;
    if (!dome) return;
    const { uniforms } = dome.material as ShaderMaterial;
    const zenith = (uniforms.uZenith.value as Color).setRGB(0, 0, 0);
    const horizon = (uniforms.uHorizon.value as Color).setRGB(0, 0, 0);
    const below = (uniforms.uBelow.value as Color).setRGB(0, 0, 0);
    let near = 0;
    let far = 0;
    for (const id of ENVIRONMENTS) {
      const w = frame.environment[id];
      if (w <= 0) continue;
      const b = BACKDROPS[id];
      zenith.add(tmp.set(b.zenith).multiplyScalar(w));
      horizon.add(tmp.set(b.horizon).multiplyScalar(w));
      below.add(tmp.set(b.below).multiplyScalar(w));
      near += b.fogNear * w;
      far += b.fogFar * w;
    }
    // Before power-on the room is darker still.
    const dim = 0.35 + 0.65 * frame.power;
    zenith.multiplyScalar(dim);
    horizon.multiplyScalar(dim);
    below.multiplyScalar(dim);
    uniforms.uSun.value = frame.environment.flight;
    if (fog.current) {
      fog.current.color.copy(horizon);
      fog.current.near = near;
      fog.current.far = far;
    }
    dome.position.copy(camera.position);
  });

  return (
    <>
      <fog ref={fog} attach="fog" args={["#050608", 26, 96]} />
      <mesh ref={mesh} material={material} renderOrder={-10} frustumCulled={false}>
        <sphereGeometry args={[4200, 32, 20]} />
      </mesh>
    </>
  );
}
