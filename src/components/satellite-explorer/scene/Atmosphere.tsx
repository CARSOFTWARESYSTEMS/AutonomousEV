// Limb glow: a thin back-faced shell, about 115 km thick at Earth scale,
// brightest at the surface limb and fading outward. Deliberately restrained.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BackSide, type Mesh, type ShaderMaterial, Vector3 } from "three";
import { EARTH_RADIUS_UNITS } from "./cameraPresets";
import { frame } from "./frameState";

const SHELL = 1.018;
/** |N·V| at the surface limb for a shell of this thickness. */
const LIMB_DOT = Math.sqrt(1 - 1 / (SHELL * SHELL));

const VERTEX = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vPosW = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const FRAGMENT = /* glsl */ `
uniform vec3 uSunDir;
uniform float uFade;
uniform float uLimbDot;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  // Back faces: N·V runs from 0 at the outer edge to -uLimbDot at the surface limb.
  float depth = clamp(-dot(N, V) / uLimbDot, 0.0, 1.0);
  float glow = pow(depth, 1.6);
  float sun = smoothstep(-0.28, 0.32, dot(N, uSunDir));
  vec3 color = mix(vec3(0.95, 0.42, 0.16), vec3(0.3, 0.56, 1.0), smoothstep(0.0, 0.5, sun));
  gl_FragColor = vec4(color * glow * (0.03 + sun) * 0.85 * uFade, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export default function Atmosphere() {
  const material = useRef<ShaderMaterial>(null);
  const mesh = useRef<Mesh>(null);
  const uniforms = useMemo(() => ({ uSunDir: { value: new Vector3(1, 0, 0) }, uFade: { value: 1 }, uLimbDot: { value: LIMB_DOT } }), []);
  useFrame(() => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uSunDir.value.copy(frame.sunDir);
    u.uFade.value = 1 - frame.studio;
    if (mesh.current) mesh.current.visible = frame.studio < 0.985;
  });
  return (
    <mesh ref={mesh} name="Atmosphere" renderOrder={1}>
      <sphereGeometry args={[EARTH_RADIUS_UNITS * SHELL, 128, 64]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={VERTEX} fragmentShader={FRAGMENT} side={BackSide} blending={AdditiveBlending} transparent depthWrite={false} />
    </mesh>
  );
}
