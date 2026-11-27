// Frame-loop writes to three.js objects. Materials, textures and the scene
// are mutable GPU-side state by design; these helpers make each write
// explicit and keep component bodies free of direct property assignment
// (which the React Compiler's immutability rule rejects for hook-held values).
import type { Color, Fog, Material, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, Scene, ShaderMaterial, Texture, WebGLRenderer } from "three";

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

/** Section cuts use per-material clipping planes, which the renderer must allow. */
export function enableLocalClipping(gl: WebGLRenderer) {
  gl.localClippingEnabled = true;
}

/** Shows or hides an object (frame-loop visibility toggles). */
export function setVisible(o: Object3D | null | undefined, visible: boolean) {
  if (o && o.visible !== visible) o.visible = visible;
}

/** Swaps the material a mesh draws with (selection highlight and isolation). */
export function setMeshMaterial(mesh: Mesh, material: Material | Material[]) {
  mesh.material = material;
}

/** Fog colour and range (the studio backdrop closes it in around the subject). */
export function setFog(fog: Fog, color: Color, near: number, far: number) {
  fog.color.copy(color);
  fog.near = near;
  fog.far = far;
}

export function setEnvironment(scene: Scene, environment: Texture | null, intensity: number, fog: Fog | null) {
  scene.environment = environment;
  scene.environmentIntensity = intensity;
  scene.fog = fog;
}

/** Material colour (frame-loop state colours). */
export function setColor(m: { color: Color }, c: Color) {
  if (!m.color.equals(c)) m.color.copy(c);
}

/** Swaps a material's colour map (and, for a lit face, its emissive map): bay indicators change face with their state. */
export function setMap(m: MeshStandardMaterial | MeshBasicMaterial, map: Texture | null, emissive = false) {
  if (m.map === map) return;
  m.map = map;
  if (emissive && "emissiveMap" in m) m.emissiveMap = map;
  m.needsUpdate = true;
}

/** Rotation of an object about one axis (frame-loop animation of fans and barrier booms). */
export function setRotation(o: Object3D | null | undefined, axis: "x" | "y" | "z", value: number) {
  if (o) o.rotation[axis] = value;
}
