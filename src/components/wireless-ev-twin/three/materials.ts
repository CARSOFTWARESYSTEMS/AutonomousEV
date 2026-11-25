// Physically based materials, generated textures and colour scales. Textures
// are drawn on a canvas at start-up: nothing is downloaded.
import { CanvasTexture, Color, MeshPhysicalMaterial, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, type Texture } from "three";

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

export function concreteTexture(): Texture {
  const t = canvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = "#5a5e63";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) {
      const v = 70 + hash(i) * 40;
      ctx.fillStyle = `rgba(${v},${v + 2},${v + 5},${0.12 + hash(i + 7) * 0.18})`;
      ctx.fillRect(hash(i + 1) * 512, hash(i + 2) * 512, 1 + hash(i + 3) * 3, 1 + hash(i + 4) * 3);
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

/** Perceptual heat scale for temperatures (blue → teal → amber → red). */
export function thermalColor(t01: number, out = new Color()): Color {
  const stops = ["#1d4ed8", "#0ea5a4", "#84cc16", "#f59e0b", "#dc2626"];
  const x = Math.min(0.9999, Math.max(0, t01)) * (stops.length - 1);
  const i = Math.floor(x);
  return out.set(stops[i]).lerp(new Color(stops[i + 1]), x - i);
}

/** Field magnitude scale (dark → violet → cyan → white), for the flux-density map. */
export function fieldColor(t01: number): [number, number, number] {
  const stops: [number, number, number][] = [
    [0.02, 0.03, 0.08],
    [0.24, 0.12, 0.5],
    [0.1, 0.55, 0.85],
    [0.55, 0.92, 0.95],
    [1, 1, 0.92],
  ];
  const x = Math.min(0.9999, Math.max(0, t01)) * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  return [0, 1, 2].map((k) => stops[i][k] + (stops[i + 1][k] - stops[i][k]) * f) as [number, number, number];
}
