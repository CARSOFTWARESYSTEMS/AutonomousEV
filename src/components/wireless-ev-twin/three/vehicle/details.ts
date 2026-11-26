// Exterior detail that the lofted body cannot carry: wrap-around headlamp
// blades and rear lamp corners that follow the body surface, a grille insert
// in the lower nose, a rear diffuser, blank number plates (no lettering),
// a roof antenna fin, windscreen wipers and mirror housings. Panel shut lines
// are drawn on the paint by a shader (see `panelGaps`), so they cost no
// geometry and stay crisp at any distance. Representative, unbranded.
import { BoxGeometry, type BufferGeometry, CylinderGeometry, Float32BufferAttribute, BufferGeometry as Geometry, type MeshPhysicalMaterial, SphereGeometry, type WebGLProgramParametersWithUniforms } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { BODY_FRONT, BODY_REAR, HALF_WIDTH, surfaceZ, topLine } from "./body";

/** A ribbon that follows the body surface along a path of (x, y) points, `h` tall, standing `lift` proud. Both sides of the car. */
function surfaceRibbon(path: [number, number][], h: number, lift: number, steps = 24): BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  for (const side of [1, -1]) {
    const start = pos.length / 3;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const f = t * (path.length - 1);
      const k = Math.min(path.length - 2, Math.floor(f));
      const u = f - k;
      const x = path[k][0] + (path[k + 1][0] - path[k][0]) * u;
      const y = path[k][1] + (path[k + 1][1] - path[k][1]) * u;
      for (const dy of [-h / 2, h / 2]) {
        const z = surfaceZ(x, y + dy) + lift;
        pos.push(x, y + dy, side * z);
      }
    }
    for (let i = 0; i < steps; i++) {
      const o = start + i * 2;
      if (side > 0) idx.push(o, o + 2, o + 1, o + 1, o + 2, o + 3);
      else idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
    }
  }
  const g = new Geometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g.toNonIndexed();
}

export interface Details {
  /** Gloss-black lamp housings (front blades, rear corners). */
  lampLens: BufferGeometry;
  /** Emissive daytime-running strips inside the front blades. */
  drl: BufferGeometry;
  /** Rear reflectors low on the bumper. */
  tail: BufferGeometry;
  /** Satin-black parts: grille insert, diffuser, wiper arms, mirror bases, antenna fin. */
  satin: BufferGeometry;
  /** Blank number plates. */
  plates: BufferGeometry;
  /** Gloss-black mirror caps. */
  mirrors: BufferGeometry;
}

export function buildDetails(): Details {
  // Front lamp blades: from the light bar's ends, round the corner and back along the wing.
  const front: [number, number][] = [
    [2.27, 0.575],
    [2.22, 0.62],
    [2.12, 0.675],
    [1.98, 0.715],
  ];
  const lampLens = surfaceRibbon(front, 0.062, 0.003);
  const drl = surfaceRibbon(
    front.map(([x, y]) => [x, y + 0.012]),
    0.012,
    0.005,
  );
  // Reverse lamps: two small white lenses low on the rear bumper.
  const tail = mergeGeometries([new BoxGeometry(0.006, 0.03, 0.16).toNonIndexed().translate(BODY_REAR - 0.002, 0.43, 0.5), new BoxGeometry(0.006, 0.03, 0.16).toNonIndexed().translate(BODY_REAR - 0.002, 0.43, -0.5)])!;
  const satin: BufferGeometry[] = [];
  // Grille insert in the lower nose (proud of the valance by a few millimetres).
  satin.push(new BoxGeometry(0.012, 0.085, 0.78).toNonIndexed().translate(BODY_FRONT - 0.006, 0.455, 0));
  // Rear diffuser under the bumper, with four vertical fins.
  satin.push(new BoxGeometry(0.34, 0.012, 1.18).toNonIndexed().rotateZ(-0.16).translate(BODY_REAR + 0.2, 0.33, 0));
  for (const z of [-0.42, -0.14, 0.14, 0.42]) satin.push(new BoxGeometry(0.3, 0.07, 0.012).toNonIndexed().rotateZ(-0.16).translate(BODY_REAR + 0.2, 0.3, z));
  // Wiper arms resting at the base of the windscreen.
  for (const [z, len] of [
    [-0.12, 0.72],
    [0.36, 0.62],
  ] as const) {
    const arm = new CylinderGeometry(0.008, 0.008, len, 6).toNonIndexed();
    arm.rotateX(Math.PI / 2);
    arm.rotateY(0.18);
    arm.translate(0.9, topLine(0.9) + 0.012, z);
    satin.push(arm);
  }
  // Roof antenna fin near the rear of the glass roof.
  const fin = new SphereGeometry(0.06, 12, 8).toNonIndexed();
  fin.scale(2.0, 0.75, 0.42);
  fin.translate(-1.55, topLine(-1.55) + 0.004, 0);
  satin.push(fin);
  // Mirror stalks on the doors, below the A-pillar.
  const mirrorParts: BufferGeometry[] = [];
  for (const side of [1, -1]) {
    const zs = surfaceZ(0.78, 1.0);
    satin.push(new BoxGeometry(0.08, 0.03, 0.07).toNonIndexed().translate(0.8, 0.99, side * (zs + 0.03)));
    const housing = new SphereGeometry(0.1, 24, 14).toNonIndexed();
    housing.scale(0.62, 0.46, 1.0);
    housing.translate(0.8, 1.025, side * (zs + 0.115));
    mirrorParts.push(housing);
  }
  const plate = (x: number, y: number) => new BoxGeometry(0.006, 0.112, 0.52).toNonIndexed().translate(x, y, 0);
  return {
    lampLens,
    drl,
    tail,
    satin: mergeGeometries(satin)!,
    plates: mergeGeometries([plate(BODY_FRONT + 0.004, 0.465), plate(BODY_REAR - 0.006, 0.6)])!,
    mirrors: mergeGeometries(mirrorParts)!,
  };
}

/** Shut lines of the bonnet, doors, boot lid and charge-port door, drawn on the paint in the vehicle frame. */
const GAP_GLSL = /* glsl */ `
varying vec3 vBodyPos;
float bodyHalfWidth(float x) {
  float xc = ${((BODY_FRONT + BODY_REAR) / 2).toFixed(4)};
  float halfLen = ${((BODY_FRONT - BODY_REAR) / 2).toFixed(4)};
  float u = min(1.0, abs((x - xc) / halfLen));
  float p = x > xc ? 5.4 : 7.5;
  float w = ${HALF_WIDTH.toFixed(3)} * pow(max(0.0, 1.0 - pow(u, p)), 1.0 / p);
  return w * (1.0 - 0.025 * smoothstep(0.0, ${BODY_FRONT.toFixed(3)}, x));
}
float gapLine(float d, float w) { return 1.0 - smoothstep(w * 0.35, w, abs(d)); }
float panelGap(vec3 p) {
  float g = 0.0;
  float side = abs(p.z);
  float hw = bodyHalfWidth(p.x);
  if (side > 0.62 && p.y > 0.33 && p.y < 0.99) {
    g = max(g, gapLine(p.x - 0.90, 0.0045));
    g = max(g, gapLine(p.x + 0.17, 0.0045));
    g = max(g, gapLine(p.x + 1.30, 0.0045));
    if (p.x < 0.9 && p.x > -1.3) g = max(g, gapLine(p.y - 0.352, 0.0045));
  }
  if (p.x > 0.97 && p.y > 0.64) {
    float inner = 0.8 * hw;
    g = max(g, gapLine(side - inner, 0.005) * step(p.x, 2.12));
    g = max(g, gapLine(p.x - 0.985, 0.005) * step(side, inner));
    g = max(g, gapLine(p.x - 2.12, 0.005) * step(side, inner));
  }
  if (p.x < -1.84 && p.y > 0.74) {
    float inner = 0.82 * hw;
    g = max(g, gapLine(side - inner, 0.005) * step(0.86, p.y));
    g = max(g, gapLine(p.x + 1.86, 0.005) * step(side, inner));
    g = max(g, gapLine(p.y - 0.80, 0.005) * step(p.x, -2.2) * step(side, inner));
  }
  if (p.z > 0.6) {
    vec2 q = vec2(p.x - 1.62, p.y - 0.84);
    vec2 d = abs(q) - vec2(0.065, 0.05);
    float r = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 0.014;
    g = max(g, gapLine(r, 0.004));
  }
  return g;
}
`;

/** Adds the shut lines to a body paint material (darker, rougher and without clear coat inside a gap). */
export function panelGaps(m: MeshPhysicalMaterial): MeshPhysicalMaterial {
  m.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vBodyPos;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvBodyPos = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${GAP_GLSL}`)
      .replace("#include <color_fragment>", "#include <color_fragment>\nfloat panelGapMask = panelGap(vBodyPos);\ndiffuseColor.rgb *= 1.0 - 0.92 * panelGapMask;")
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.9, panelGapMask);")
      .replace("#include <lights_physical_fragment>", "#include <lights_physical_fragment>\n#ifdef USE_CLEARCOAT\nmaterial.clearcoat *= 1.0 - panelGapMask;\n#endif");
  };
  m.customProgramCacheKey = () => "wevct-panel-gaps";
  return m;
}
