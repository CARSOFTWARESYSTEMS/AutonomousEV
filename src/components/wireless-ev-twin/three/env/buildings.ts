// Distant city and landscape, built once and merged: towers with setbacks and
// crowns, slab blocks and mid-rise blocks, each with a curtain-wall or a
// punched-window concrete façade (canvas textures mapped in metres, so floors
// and bays keep their real size) and a per-building tint; and a low ring of
// hills that the haze turns into atmospheric depth. Context only.
import { BufferGeometry, CanvasTexture, Color, Float32BufferAttribute, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { rng } from "./foliage";

/** Façade texture tile: 6 bays × 4 floors, 3.0 m × 3.6 m each. */
const BAY = 3.0;
const FLOOR = 3.6;
const TILE_U = 6 * BAY;
const TILE_V = 4 * FLOOR;

function canvas(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  draw(el.getContext("2d")!);
  const t = new CanvasTexture(el);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Curtain wall: glass panels that vary slightly, slim mullions, a dark spandrel at every floor. */
export function glassFacade(): CanvasTexture {
  const r = rng(9);
  return canvas(384, 256, (c) => {
    const bw = 384 / 6;
    const fh = 256 / 4;
    for (let f = 0; f < 4; f++) {
      for (let b = 0; b < 6; b++) {
        const v = 98 + r() * 26;
        const g = c.createLinearGradient(0, f * fh, 0, (f + 1) * fh);
        g.addColorStop(0, `rgb(${v - 10},${v + 8},${v + 26})`);
        g.addColorStop(1, `rgb(${v - 30},${v - 12},${v + 4})`);
        c.fillStyle = g;
        c.fillRect(b * bw, f * fh, bw, fh);
      }
      c.fillStyle = "rgb(52,60,70)";
      c.fillRect(0, f * fh + fh - 10, 384, 10);
    }
    c.fillStyle = "rgba(205,212,220,0.85)";
    for (let b = 0; b <= 6; b++) c.fillRect(b * bw - 1.5, 0, 3, 256);
    for (let f = 0; f <= 4; f++) c.fillRect(0, f * fh - 1, 384, 2);
  });
}

/** Concrete façade with punched windows and a light reveal. */
export function concreteFacade(): CanvasTexture {
  const r = rng(17);
  return canvas(384, 256, (c) => {
    c.fillStyle = "rgb(198,194,186)";
    c.fillRect(0, 0, 384, 256);
    for (let i = 0; i < 2500; i++) {
      const v = 175 + r() * 40;
      c.fillStyle = `rgba(${v},${v - 3},${v - 8},0.25)`;
      c.fillRect(r() * 384, r() * 256, 2, 2);
    }
    const bw = 384 / 6;
    const fh = 256 / 4;
    for (let f = 0; f < 4; f++) {
      for (let b = 0; b < 6; b++) {
        const x = b * bw + bw * 0.16;
        const y = f * fh + fh * 0.2;
        c.fillStyle = "rgb(140,137,130)";
        c.fillRect(x - 2, y - 2, bw * 0.68 + 4, fh * 0.58 + 4);
        const v = 46 + r() * 30;
        c.fillStyle = `rgb(${v},${v + 8},${v + 18})`;
        c.fillRect(x, y, bw * 0.68, fh * 0.58);
      }
    }
  });
}

interface Builder {
  pos: number[];
  nrm: number[];
  uv: number[];
  col: number[];
}

/** A box with per-face UVs in metres (floors and bays keep their size), tinted by vertex colour; the roof samples a spandrel. */
function facadeBox(b: Builder, w: number, h: number, d: number, x: number, y0: number, z: number, tint: Color) {
  const x0 = x - w / 2;
  const x1 = x + w / 2;
  const z0 = z - d / 2;
  const z1 = z + d / 2;
  const y1 = y0 + h;
  const quad = (p: number[][], n: number[], u: number[][], shade = 1) => {
    for (const k of [0, 1, 2, 0, 2, 3]) {
      b.pos.push(...p[k]);
      b.nrm.push(...n);
      b.uv.push(...u[k]);
      b.col.push(tint.r * shade, tint.g * shade, tint.b * shade);
    }
  };
  const fu = (m: number) => m / TILE_U;
  const fv0 = y0 / TILE_V;
  const fv1 = y1 / TILE_V;
  quad([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], [[0, fv0], [fu(w), fv0], [fu(w), fv1], [0, fv1]]);
  quad([[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], [0, 0, -1], [[0, fv0], [fu(w), fv0], [fu(w), fv1], [0, fv1]]);
  quad([[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], [1, 0, 0], [[0, fv0], [fu(d), fv0], [fu(d), fv1], [0, fv1]], 0.94);
  quad([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], [[0, fv0], [fu(d), fv0], [fu(d), fv1], [0, fv1]], 0.94);
  // Roof: a dark spandrel strip of the texture.
  const ru = 0.5;
  const rv = 0.02;
  quad([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], [0, 1, 0], [[ru, rv], [ru + 0.01, rv], [ru + 0.01, rv], [ru, rv]], 0.7);
}

const geometryOf = (b: Builder) => {
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(b.pos, 3));
  g.setAttribute("normal", new Float32BufferAttribute(b.nrm, 3));
  g.setAttribute("uv", new Float32BufferAttribute(b.uv, 2));
  g.setAttribute("color", new Float32BufferAttribute(b.col, 3));
  return g;
};

export interface Lot {
  x: number;
  z: number;
  /** Footprint scale (1 ≈ 24 m) and height scale. */
  size: number;
  height: number;
  seed: number;
}

const GLASS_TINTS = ["#9fb3c8", "#8ea5b8", "#b7c4cf", "#7f97ad", "#a9b8c4"];
const CONCRETE_TINTS = ["#e8e2d6", "#d9d6d0", "#cfc8bc", "#efe9df", "#c8ccd0", "#e2d5c3"];

/** Buildings on the given lots, as two merged geometries (glass, concrete). */
export function buildCity(lots: readonly Lot[]): { glass: BufferGeometry; concrete: BufferGeometry } {
  const glass: Builder = { pos: [], nrm: [], uv: [], col: [] };
  const concrete: Builder = { pos: [], nrm: [], uv: [], col: [] };
  for (const lot of lots) {
    const r = rng(lot.seed * 977 + 3);
    const kind = lot.height > 0.62 ? "tower" : r() < 0.5 ? "slab" : "midrise";
    const isGlass = kind === "tower" ? r() < 0.8 : r() < 0.3;
    const b = isGlass ? glass : concrete;
    const tint = new Color(isGlass ? GLASS_TINTS[Math.floor(r() * GLASS_TINTS.length)] : CONCRETE_TINTS[Math.floor(r() * CONCRETE_TINTS.length)]);
    const s = lot.size;
    // Heights snap to whole floors, so the façade's floors close at the roof.
    const floors = (h: number) => Math.max(2, Math.round(h / FLOOR)) * FLOOR;
    if (kind === "tower") {
      const w = (16 + r() * 14) * s;
      const d = (16 + r() * 12) * s;
      const h = floors(50 + lot.height * 110);
      // Podium, shaft, one or two setbacks, mechanical crown.
      facadeBox(concrete, w * 1.5, floors(10), d * 1.4, lot.x, 0, lot.z, new Color(CONCRETE_TINTS[Math.floor(r() * 6)]));
      facadeBox(b, w, h * 0.7, d, lot.x, floors(10), lot.z, tint);
      const y2 = floors(10) + h * 0.7;
      facadeBox(b, w * 0.78, floors(h * 0.22), d * 0.8, lot.x + (r() - 0.5) * w * 0.15, y2, lot.z, tint);
      facadeBox(concrete, w * 0.4, floors(6), d * 0.4, lot.x, y2 + floors(h * 0.22), lot.z, new Color("#b9bcc0"));
    } else if (kind === "slab") {
      const w = (40 + r() * 30) * s;
      const d = (12 + r() * 6) * s;
      const h = floors(18 + lot.height * 50);
      const rot = r() < 0.5;
      facadeBox(b, rot ? d : w, h, rot ? w : d, lot.x, 0, lot.z, tint);
      facadeBox(concrete, (rot ? d : w) * 0.2, floors(4), (rot ? w : d) * 0.3, lot.x, h, lot.z, new Color("#aeb2b6"));
    } else {
      const w = (22 + r() * 18) * s;
      const d = (18 + r() * 14) * s;
      const h = floors(12 + lot.height * 30);
      facadeBox(b, w, h, d, lot.x, 0, lot.z, tint);
      facadeBox(b, w * 0.6, floors(7), d * 0.55, lot.x + w * 0.15, h, lot.z - d * 0.1, tint);
    }
  }
  return { glass: geometryOf(glass), concrete: geometryOf(concrete) };
}

export function cityMaterials(glassTex: CanvasTexture, concreteTex: CanvasTexture) {
  return {
    glass: new MeshStandardMaterial({ map: glassTex, vertexColors: true, metalness: 0.55, roughness: 0.16, envMapIntensity: 1.25 }),
    concrete: new MeshStandardMaterial({ map: concreteTex, vertexColors: true, metalness: 0, roughness: 0.86 }),
  };
}

/** A ring of low hills between `inner` and `outer` metres, open in the middle; heights from layered sines. */
export function hillRing(inner: number, outer: number, seed = 3): BufferGeometry {
  const seg = 160;
  const r = rng(seed);
  const ph = [r() * 6, r() * 6, r() * 6];
  const height = (a: number) => 10 + 14 * (0.5 + 0.5 * Math.sin(3 * a + ph[0])) + 9 * (0.5 + 0.5 * Math.sin(7 * a + ph[1])) + 4 * Math.sin(17 * a + ph[2]);
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const h = height(a);
    pos.push(c * inner, -0.5, s * inner, c * (inner + outer) * 0.5, h, s * (inner + outer) * 0.5, c * outer, h * 0.6, s * outer);
    col.push(0.36, 0.42, 0.3, 0.42, 0.47, 0.36, 0.45, 0.5, 0.42);
  }
  for (let i = 0; i < seg; i++) {
    const o = i * 3;
    const n = o + 3;
    idx.push(o, n, o + 1, o + 1, n, n + 1, o + 1, n + 1, o + 2, o + 2, n + 1, n + 2);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return mergeGeometries([g])!;
}
