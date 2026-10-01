// A sparse star field. Positions come from a seeded generator so the sky is
// identical on every load; this is the only place randomness is used.
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, type ShaderMaterial } from "three";
import { mulberry32 } from "../lib/math";
import { useExplorerStore } from "../state/explorerStore";
import { frame } from "./frameState";

const RADIUS = 60000;

const VERTEX = /* glsl */ `
attribute float aSize;
attribute float aBrightness;
uniform float uPixelRatio;
varying float vBrightness;
void main() {
  vBrightness = aBrightness;
  gl_PointSize = aSize * uPixelRatio;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAGMENT = /* glsl */ `
uniform float uFade;
varying float vBrightness;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.08, d);
  gl_FragColor = vec4(vec3(0.92, 0.95, 1.0) * vBrightness * alpha * uFade, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export default function StarField() {
  const count = useExplorerStore((s) => s.quality.starCount);
  const pixelRatio = useThree((state) => state.viewport.dpr);
  const material = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const random = mulberry32(1987);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const brightness = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const z = random() * 2 - 1;
      const phi = random() * Math.PI * 2;
      const r = Math.sqrt(1 - z * z);
      positions.set([r * Math.cos(phi) * RADIUS, z * RADIUS, r * Math.sin(phi) * RADIUS], i * 3);
      // Most stars are faint; a few are bright.
      const magnitude = Math.pow(random(), 5);
      sizes[i] = 1.1 + magnitude * 2.1;
      brightness[i] = 0.16 + magnitude * 0.9;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("aSize", new BufferAttribute(sizes, 1));
    g.setAttribute("aBrightness", new BufferAttribute(brightness, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(() => ({ uPixelRatio: { value: 1 }, uFade: { value: 1 } }), []);

  useFrame(() => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uPixelRatio.value = pixelRatio;
    u.uFade.value = 1 - frame.studio;
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={-10}>
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={VERTEX} fragmentShader={FRAGMENT} blending={AdditiveBlending} transparent depthWrite={false} />
    </points>
  );
}
