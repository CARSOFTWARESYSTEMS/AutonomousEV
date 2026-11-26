// Physically based materials, generated textures and colour scales. Textures
// are drawn on a canvas at start-up: nothing is downloaded.
import { CanvasTexture, Color, DoubleSide, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, type Texture } from "three";

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, srgb = true): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d")!);
  const t = new CanvasTexture(canvas);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Deterministic value noise, so textures are identical on every load. */
function hash(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Concrete; `polished` gives the shelter slab: lighter, finer and calmer. */
export function concreteTexture(polished = false): Texture {
  const t = canvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = polished ? "#8d9196" : "#5a5e63";
    ctx.fillRect(0, 0, 512, 512);
    // Soft cloudy variation, then fine aggregate.
    if (polished)
      for (let i = 0; i < 60; i++) {
        const g = ctx.createRadialGradient(hash(i) * 512, hash(i + 40) * 512, 0, hash(i) * 512, hash(i + 40) * 512, 40 + hash(i + 80) * 90);
        const v = 120 + hash(i + 120) * 30;
        g.addColorStop(0, `rgba(${v},${v + 2},${v + 4},0.18)`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 512);
      }
    for (let i = 0; i < (polished ? 4000 : 9000); i++) {
      const v = (polished ? 110 : 70) + hash(i) * 40;
      ctx.fillStyle = `rgba(${v},${v + 2},${v + 5},${(polished ? 0.06 : 0.12) + hash(i + 7) * (polished ? 0.08 : 0.18)})`;
      ctx.fillRect(hash(i + 1) * 512, hash(i + 2) * 512, 1 + hash(i + 3) * (polished ? 1.5 : 3), 1 + hash(i + 4) * (polished ? 1.5 : 3));
    }
    ctx.strokeStyle = "rgba(30,32,36,0.35)";
    ctx.lineWidth = 2;
    for (let k = 0; k <= 512; k += 256) {
      ctx.beginPath();
      ctx.moveTo(k, 0);
      ctx.lineTo(k, 512);
      ctx.moveTo(0, k);
      ctx.lineTo(512, k);
      ctx.stroke();
    }
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

export function asphaltTexture(): Texture {
  const t = canvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = "#26282c";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 14000; i++) {
      const v = 30 + hash(i + 99) * 45;
      ctx.fillStyle = `rgba(${v},${v},${v + 3},${0.25 + hash(i + 5) * 0.3})`;
      ctx.fillRect(hash(i + 11) * 512, hash(i + 12) * 512, 1 + hash(i + 13) * 2, 1 + hash(i + 14) * 2);
    }
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** Lit office windows for the skyline (emissive map). */
export function windowTexture(): Texture {
  const t = canvasTexture(256, 512, (ctx) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 256, 512);
    for (let y = 6; y < 512; y += 14) {
      for (let x = 6; x < 256; x += 12) {
        const h = hash(x * 31 + y * 7);
        if (h > 0.55) {
          const warm = h > 0.85;
          ctx.fillStyle = warm ? `rgba(255,214,160,${0.5 + h * 0.5})` : `rgba(190,215,255,${0.35 + h * 0.4})`;
          ctx.fillRect(x, y, 7, 8);
        }
      }
    }
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** Photovoltaic cell grid. */
export function solarTexture(): Texture {
  const t = canvasTexture(512, 256, (ctx) => {
    ctx.fillStyle = "#0b1626";
    ctx.fillRect(0, 0, 512, 256);
    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 512; x += 32) {
        const g = ctx.createLinearGradient(x, y, x + 30, y + 30);
        g.addColorStop(0, "#15284a");
        g.addColorStop(1, "#0d1b33");
        ctx.fillStyle = g;
        ctx.fillRect(x + 1, y + 1, 30, 30);
        ctx.strokeStyle = "rgba(170,190,220,0.25)";
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 1);
        ctx.lineTo(x + 10, y + 31);
        ctx.moveTo(x + 21, y + 1);
        ctx.lineTo(x + 21, y + 31);
        ctx.stroke();
      }
    }
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** Mown grass with clover patches and a little soil (tiles every 10 m on verges, larger on lawns). */
export function grassTexture(): Texture {
  const t = canvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = "#5f7a3c";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 60; i++) {
      const g = ctx.createRadialGradient(hash(i + 900) * 512, hash(i + 950) * 512, 0, hash(i + 900) * 512, hash(i + 950) * 512, 30 + hash(i + 990) * 80);
      const warm = hash(i + 1200) > 0.6;
      g.addColorStop(0, warm ? "rgba(128,128,70,0.22)" : "rgba(70,100,45,0.25)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 512);
    }
    for (let i = 0; i < 26000; i++) {
      const g = 92 + hash(i + 31) * 70;
      ctx.fillStyle = `rgba(${Math.round(g * 0.66)},${Math.round(g)},${Math.round(g * 0.42)},${0.18 + hash(i + 17) * 0.3})`;
      ctx.fillRect(hash(i + 3) * 512, hash(i + 5) * 512, 1, 2 + hash(i + 9) * 4);
    }
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** Overhead lane sign: plain text and an arrow, no branding. */
export function laneSignTexture(): Texture {
  return canvasTexture(1024, 256, (ctx) => {
    ctx.fillStyle = "#0f4a8a";
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = "#e9eef3";
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, 1000, 232);
    ctx.fillStyle = "#e9eef3";
    ctx.font = "700 64px system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText("ELECTRIFIED LANE", 60, 100);
    ctx.font = "500 40px system-ui, sans-serif";
    ctx.fillText("Wireless charging in motion", 60, 178);
    ctx.beginPath();
    ctx.moveTo(900, 70);
    ctx.lineTo(950, 140);
    ctx.lineTo(920, 140);
    ctx.lineTo(920, 200);
    ctx.lineTo(880, 200);
    ctx.lineTo(880, 140);
    ctx.lineTo(850, 140);
    ctx.closePath();
    ctx.fill();
  });
}

/** One PV module seen from above: 6 × 10 monocrystalline cells, busbars, silver frame. */
export function moduleTexture(): Texture {
  return canvasTexture(256, 384, (ctx) => {
    ctx.fillStyle = "#c9ced4";
    ctx.fillRect(0, 0, 256, 384);
    ctx.fillStyle = "#e9ecef";
    ctx.fillRect(6, 6, 244, 372);
    const cw = 244 / 6;
    const ch = 372 / 10;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 6; c++) {
        const x = 6 + c * cw;
        const y = 6 + r * ch;
        const g = ctx.createLinearGradient(x, y, x + cw, y + ch);
        g.addColorStop(0, "#132339");
        g.addColorStop(1, "#0b1628");
        ctx.fillStyle = g;
        ctx.fillRect(x + 1.2, y + 1.2, cw - 2.4, ch - 2.4);
        ctx.fillStyle = "rgba(180,195,215,0.35)";
        for (const f of [0.33, 0.66]) ctx.fillRect(x + cw * f, y + 1.2, 1, ch - 2.4);
      }
    }
  });
}

/** A printed circuit board with traces and pads. */
export function pcbTexture(): Texture {
  return canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = "#0f3d2a";
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "rgba(205,170,90,0.8)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      const x = hash(i) * 256;
      const y = hash(i + 50) * 256;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (hash(i + 3) - 0.5) * 120, y);
      ctx.lineTo(x + (hash(i + 3) - 0.5) * 120, y + (hash(i + 9) - 0.5) * 120);
      ctx.stroke();
    }
    ctx.fillStyle = "#c9a85a";
    for (let i = 0; i < 80; i++) ctx.fillRect(hash(i + 200) * 250, hash(i + 300) * 250, 4, 4);
  });
}

/** Lane markings: dashed centre line on a transparent strip. */
export function laneTexture(): Texture {
  const t = canvasTexture(64, 512, (ctx) => {
    ctx.clearRect(0, 0, 64, 512);
    ctx.fillStyle = "rgba(235,235,225,0.9)";
    ctx.fillRect(22, 0, 20, 300);
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

export const MATERIALS = () => ({
  paint: new MeshPhysicalMaterial({ color: "#dfe5ec", metalness: 0.45, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.2 }),
  paintDark: new MeshPhysicalMaterial({ color: "#2c3138", metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 }),
  glass: new MeshPhysicalMaterial({ color: "#0c1218", metalness: 0.3, roughness: 0.04, clearcoat: 1, transparent: true, opacity: 0.88, envMapIntensity: 1.6 }),
  trim: new MeshStandardMaterial({ color: "#121417", metalness: 0.4, roughness: 0.55 }),
  tyre: new MeshStandardMaterial({ color: "#141518", metalness: 0, roughness: 0.86 }),
  rim: new MeshStandardMaterial({ color: "#b9bfc7", metalness: 1, roughness: 0.28 }),
  copper: new MeshStandardMaterial({ color: "#c77b4a", metalness: 1, roughness: 0.32, emissive: new Color("#ff8a3d"), emissiveIntensity: 0 }),
  ferrite: new MeshStandardMaterial({ color: "#2b2c30", metalness: 0.15, roughness: 0.62 }),
  aluminium: new MeshStandardMaterial({ color: "#c7cbd1", metalness: 1, roughness: 0.34 }),
  housing: new MeshPhysicalMaterial({ color: "#1d2127", metalness: 0.1, roughness: 0.45, clearcoat: 0.4, transparent: true, opacity: 1 }),
  housingRim: new MeshStandardMaterial({ color: "#3a4048", metalness: 0.6, roughness: 0.35 }),
  cabinet: new MeshStandardMaterial({ color: "#d3d7dc", metalness: 0.55, roughness: 0.42, transparent: true, opacity: 1 }),
  heatsink: new MeshStandardMaterial({ color: "#aeb3ba", metalness: 1, roughness: 0.4 }),
  capacitor: new MeshStandardMaterial({ color: "#2a4b78", metalness: 0.3, roughness: 0.5 }),
  module: new MeshStandardMaterial({ color: "#3b3f46", metalness: 0.5, roughness: 0.5 }),
  cell: new MeshStandardMaterial({ color: "#5b6470", metalness: 0.7, roughness: 0.35 }),
  hvCable: new MeshStandardMaterial({ color: "#f07c22", metalness: 0.1, roughness: 0.55 }),
  steel: new MeshStandardMaterial({ color: "#6d737b", metalness: 0.85, roughness: 0.45 }),
  concreteLight: new MeshStandardMaterial({ color: "#9aa0a6", metalness: 0, roughness: 0.9 }),
  emissiveWhite: new MeshStandardMaterial({ color: "#ffffff", emissive: new Color("#e8f3ff"), emissiveIntensity: 3 }),
  emissiveRed: new MeshStandardMaterial({ color: "#550000", emissive: new Color("#ff2030"), emissiveIntensity: 2.6 }),
  emissiveGreen: new MeshStandardMaterial({ color: "#0c2a10", emissive: new Color("#4ca930"), emissiveIntensity: 2.2 }),
});

export type Materials = ReturnType<typeof MATERIALS>;

/** Materials of one vehicle's body, in the order of the body geometry's groups (paint, glass, trim, front lamp, rear lamp, seam), plus detail parts. */
export function bodyMaterials(paint: string) {
  const c = new Color(paint);
  // Light solid paints carry little metal flake; darker colours read as metallic.
  const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  const metal = lum > 0.5 ? 0.12 : 0.55;
  return {
    paint: new MeshPhysicalMaterial({ color: paint, metalness: metal, roughness: lum > 0.5 ? 0.4 : 0.33, clearcoat: 1, clearcoatRoughness: 0.035, envMapIntensity: 1.1 }),
    glass: new MeshPhysicalMaterial({ color: "#020304", metalness: 0, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.01, transparent: true, opacity: 0.965, envMapIntensity: 1.05, specularIntensity: 1 }),
    trim: new MeshPhysicalMaterial({ color: "#060708", metalness: 0.05, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.2 }),
    lampFront: new MeshStandardMaterial({ color: "#f4f8ff", emissive: new Color("#eef6ff"), emissiveIntensity: 1.7, roughness: 0.2 }),
    lampRear: new MeshStandardMaterial({ color: "#3a0002", emissive: new Color("#ff0a12"), emissiveIntensity: 3.2, roughness: 0.25 }),
    seam: new MeshStandardMaterial({ color: "#050505", roughness: 0.9 }),
    cladding: new MeshStandardMaterial({ color: "#111214", roughness: 0.72, metalness: 0.05, side: DoubleSide }),
    liner: new MeshStandardMaterial({ color: "#060607", roughness: 0.95, side: DoubleSide }),
    interior: new MeshStandardMaterial({ color: "#2a2b2e", roughness: 0.78, metalness: 0.05 }),
    display: new MeshStandardMaterial({ color: "#05080c", emissive: new Color("#1d4a66"), emissiveIntensity: 0.9, roughness: 0.2 }),
    lens: new MeshPhysicalMaterial({ color: "#0b0d10", metalness: 0.4, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6 }),
    satin: new MeshStandardMaterial({ color: "#101113", metalness: 0.1, roughness: 0.55 }),
    plate: new MeshStandardMaterial({ color: "#eef0f2", metalness: 0, roughness: 0.35 }),
  };
}
export type BodyMaterials = ReturnType<typeof bodyMaterials>;

/** Wheel, brake and chassis materials (shared by every vehicle). */
export function wheelMaterials(tread: Texture) {
  return {
    tyre: new MeshStandardMaterial({ color: "#151619", roughness: 0.88, metalness: 0, bumpMap: tread, bumpScale: 2.2 }),
    rimFace: new MeshStandardMaterial({ color: "#c3c8cf", metalness: 0.95, roughness: 0.22 }),
    rimBarrel: new MeshStandardMaterial({ color: "#5d636b", metalness: 0.9, roughness: 0.4 }),
    disc: new MeshStandardMaterial({ color: "#8a8d91", metalness: 0.85, roughness: 0.55 }),
    caliper: new MeshStandardMaterial({ color: "#2a2e34", metalness: 0.4, roughness: 0.45 }),
  };
}

export const CHASSIS_MATERIALS = () => ({
  lid: new MeshStandardMaterial({ color: "#9ea4ab", metalness: 0.7, roughness: 0.5 }),
  aluminium: new MeshStandardMaterial({ color: "#a3a9b0", metalness: 0.8, roughness: 0.48 }),
  castAluminium: new MeshStandardMaterial({ color: "#9aa0a8", metalness: 0.75, roughness: 0.55 }),
  steel: new MeshStandardMaterial({ color: "#7c828a", metalness: 0.9, roughness: 0.35 }),
  darkSteel: new MeshStandardMaterial({ color: "#2e3238", metalness: 0.7, roughness: 0.5 }),
  rubber: new MeshStandardMaterial({ color: "#121315", roughness: 0.92 }),
  module: new MeshStandardMaterial({ color: "#3a4049", metalness: 0.5, roughness: 0.45 }),
  copper: new MeshStandardMaterial({ color: "#c27a4a", metalness: 1, roughness: 0.28 }),
  pcb: new MeshStandardMaterial({ color: "#0f3d2a", metalness: 0.2, roughness: 0.6 }),
  hvCable: new MeshStandardMaterial({ color: "#f07c22", metalness: 0.05, roughness: 0.5 }),
  coolant: new MeshStandardMaterial({ color: "#1d2a36", metalness: 0.3, roughness: 0.5 }),
  radiator: new MeshStandardMaterial({ color: "#3d434b", metalness: 0.8, roughness: 0.5 }),
});
export type ChassisMaterials = ReturnType<typeof CHASSIS_MATERIALS>;

/** The faint, depth-sorted material that unrelated parts take when a component is isolated. */
export const ghostMaterial = () => new MeshBasicMaterial({ color: "#8ea6bf", transparent: true, opacity: 0.07, depthWrite: false });
/** Highlight overlay colour for the selected component (restrained cyan, not a glow). */
export const HIGHLIGHT = "#5ad1ff";

/** Radial gradient for soft contact shadows under vehicles and objects. */
export function contactShadowTexture(): Texture {
  return canvasTexture(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, "rgba(0,0,0,0.85)");
    g.addColorStop(0.45, "rgba(0,0,0,0.5)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }, false);
}

/** Perceptual heat scale for temperatures (blue → teal → amber → red). */
export function thermalColor(t01: number, out = new Color()): Color {
  const stops = ["#1d4ed8", "#0ea5a4", "#84cc16", "#f59e0b", "#dc2626"];
  const x = Math.min(0.9999, Math.max(0, t01)) * (stops.length - 1);
  const i = Math.floor(x);
  return out.set(stops[i]).lerp(new Color(stops[i + 1]), x - i);
}

export { fieldColor } from "./fieldScale";

const NOISE_GLSL = /* glsl */ `
float tileHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float tileNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(tileHash(i), tileHash(i + vec2(1.0, 0.0)), u.x), mix(tileHash(i + vec2(0.0, 1.0)), tileHash(i + vec2(1.0, 1.0)), u.x), u.y);
}
`;

/**
 * Breaks visible texture tiling on large natural surfaces: the map is sampled
 * at two scales and blended by noise, and a low-frequency tint adds lush and
 * dry patches. Texture coordinates are continuous across tiles, so the
 * variation never repeats with the texture.
 */
export function antiTile<T extends MeshStandardMaterial>(m: T, tint: [number, number, number] = [1.08, 1.02, 0.84], lush: [number, number, number] = [0.8, 0.96, 0.76]): T {
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>\n${NOISE_GLSL}`).replace(
      "#include <map_fragment>",
      `#ifdef USE_MAP
  vec2 tuv = vMapUv;
  float n = tileNoise(tuv * 0.11) * 0.6 + tileNoise(tuv * 0.37) * 0.4;
  vec4 ta = texture2D(map, tuv);
  vec4 tb = texture2D(map, tuv * 0.31 + vec2(0.17, 0.53));
  vec4 sampledDiffuseColor = mix(ta, tb, smoothstep(0.32, 0.68, n));
  float macro = tileNoise(tuv * 0.045) * 0.7 + tileNoise(tuv * 0.013) * 0.3;
  sampledDiffuseColor.rgb *= mix(vec3(${tint.join(", ")}), vec3(${lush.join(", ")}), smoothstep(0.25, 0.75, macro));
  diffuseColor *= sampledDiffuseColor;
#endif`,
    );
  };
  m.customProgramCacheKey = () => `anti-tile-${tint.join()}-${lush.join()}`;
  return m;
}
