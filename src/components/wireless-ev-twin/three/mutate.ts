// Frame-loop writes to three.js objects. Materials, textures and the scene
// are mutable GPU-side state by design; these helpers make each write
// explicit and keep component bodies free of direct property assignment
// (which the React Compiler's immutability rule rejects for hook-held values).
import type { Color, Fog, Material, MeshPhysicalMaterial, MeshStandardMaterial, Scene, ShaderMaterial, Texture } from "three";

/** Opacity with the transparency and depth-write flags that should follow it. */
export function setOpacity(m: Material, opacity: number, depthAbove = 0.5) {
  m.opacity = opacity;
  const transparent = opacity < 0.999;
  // Switching between opaque and transparent changes the shader program and blending: recompile.
  if (m.transparent !== transparent) {
    m.transparent = transparent;
    m.needsUpdate = true;
  }
  m.depthWrite = opacity > depthAbove;
}

/** Clearcoat fades with opacity, so a see-through body does not keep a mirror-like coat. */
export function setClearcoat(m: MeshPhysicalMaterial, value: number) {
  m.clearcoat = value;
}

export function setEmissive(m: MeshStandardMaterial, color: Color | string, intensity: number) {
  m.emissive.set(color);
  m.emissiveIntensity = intensity;
}

export function setUniform(m: ShaderMaterial, name: string, value: number) {
  m.uniforms[name].value = value;
}

export function addUniform(m: ShaderMaterial, name: string, delta: number) {
  m.uniforms[name].value += delta;
}

export function setOffset(t: Texture, x: number, y: number) {
  t.offset.set(x, y);
}

export function markUpdated(t: Texture) {
  t.needsUpdate = true;
}

export function setEnvironment(scene: Scene, environment: Texture | null, intensity: number, fog: Fog | null) {
  scene.environment = environment;
  scene.environmentIntensity = intensity;
  scene.fog = fog;
}
