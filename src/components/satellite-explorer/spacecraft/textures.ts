// Procedural surface detail for the reference spacecraft, drawn once onto
// canvases: solar-cell strings, battery sleeves, PCB traces, quilted MLI and
// radiator tiles.
// Deterministic (seeded) so the model looks the same on every load.
import { CanvasTexture, LinearSRGBColorSpace, RepeatWrapping, SRGBColorSpace, type Texture } from "three";
import { mulberry32 } from "../lib/math";

export interface SpacecraftTextures {
  solarCells: Texture;
  /** Roughness (green) and metalness (blue) of the solar panel face. */
  solarSurface: Texture;
  batteryWrap: Texture;
  pcb: Texture;
  mliNormal: Texture;
  radiator: Texture;
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext("2d")! };
}

/** Surface-property texel: green carries roughness and blue metalness, as three.js reads them. */
const surface = (roughness: number, metalness: number) => `rgb(0, ${Math.round(roughness * 255)}, ${Math.round(metalness * 255)})`;

/**
 * One 1U × 3U panel: seven triple-junction cells on a dark substrate, each with
 * cropped corners, a bypass diode, fine grid fingers, a busbar and welded
 * interconnects. Drawn twice: once as colour, once as roughness / metalness,
 * so the silver contacts read as metal and the cells as coated glass.
 */
function drawSolarPanel() {
  const W = 512;
  const H = 1760;
  const color = makeCanvas(W, H);
  const props = makeCanvas(W, H);
  const c = color.ctx;
  const m = props.ctx;
  const random = mulberry32(11);

  // Substrate: carbon-fibre facesheet with a faint weave.
  c.fillStyle = "#0b0c0f";
  c.fillRect(0, 0, W, H);
  c.strokeStyle = "rgba(255, 255, 255, 0.028)";
  c.lineWidth = 1;
  for (let d = -H; d < W; d += 7) {
    c.beginPath();
    c.moveTo(d, 0);
    c.lineTo(d + H, H);
    c.moveTo(d + H, 0);
    c.lineTo(d, H);
    c.stroke();
  }
  m.fillStyle = surface(0.62, 0.15);
  m.fillRect(0, 0, W, H);

  const cells = 7;
  const marginX = 24;
  const marginY = 30;
  const gap = 16;
  const cellW = W - marginX * 2;
  const cellH = (H - marginY * 2 - gap * (cells - 1)) / cells;
  const crop = 36;
  const SILVER = "#c9ced8";

  const outline = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.moveTo(x + crop, y);
    ctx.lineTo(x + cellW - crop, y);
    ctx.lineTo(x + cellW, y + crop);
    ctx.lineTo(x + cellW, y + cellH);
    ctx.lineTo(x, y + cellH);
    ctx.lineTo(x, y + crop);
    ctx.closePath();
  };

  // String wiring down one edge of the panel, under the cells.
  c.fillStyle = "#7a4f24";
  c.fillRect(W - 15, marginY, 5, H - marginY * 2);
  m.fillStyle = surface(0.4, 1);
  m.fillRect(W - 15, marginY, 5, H - marginY * 2);

  for (let i = 0; i < cells; i++) {
    const x = marginX;
    const y = marginY + i * (cellH + gap);

    // Cell: deep blue-violet, never quite the same shade twice.
    const tint = random() * 0.14;
    const gradient = c.createLinearGradient(x, y, x + cellW, y + cellH);
    gradient.addColorStop(0, `rgb(${Math.round(11 + tint * 30)}, ${Math.round(17 + tint * 34)}, ${Math.round(58 + tint * 60)})`);
    gradient.addColorStop(0.55, `rgb(${Math.round(20 + tint * 30)}, ${Math.round(30 + tint * 40)}, ${Math.round(98 + tint * 70)})`);
    gradient.addColorStop(1, `rgb(${Math.round(9 + tint * 24)}, ${Math.round(13 + tint * 30)}, ${Math.round(48 + tint * 50)})`);
    outline(c, x, y);
    c.fillStyle = gradient;
    c.fill();
    outline(m, x, y);
    m.fillStyle = surface(0.14, 0.6);
    m.fill();

    c.save();
    outline(c, x, y);
    c.clip();
    // Grid fingers run across the short side of the cell.
    c.strokeStyle = "rgba(176, 190, 236, 0.2)";
    c.lineWidth = 1;
    for (let fx = x + 6; fx < x + cellW - 3; fx += 6) {
      c.beginPath();
      c.moveTo(fx + 0.5, y + 12);
      c.lineTo(fx + 0.5, y + cellH - 3);
      c.stroke();
    }
    c.restore();
    c.strokeStyle = "rgba(128, 146, 214, 0.38)";
    c.lineWidth = 1.5;
    outline(c, x, y);
    c.stroke();

    // Busbar along the top edge, with three contact pads.
    for (const [ctx, fill] of [
      [c, SILVER],
      [m, surface(0.34, 1)],
    ] as const) {
      ctx.fillStyle = fill;
      ctx.fillRect(x + crop + 4, y + 4, cellW - crop * 2 - 8, 6);
      for (const f of [0.2, 0.5, 0.8]) {
        const px = x + cellW * f;
        ctx.fillRect(px - 15, y + 3, 30, 12);
        // Welded interconnect up to the cell above.
        if (i > 0) ctx.fillRect(px - 11, y - gap - 5, 22, gap + 9);
      }
    }
    if (i > 0) {
      // Stress-relief loop in each interconnect.
      c.strokeStyle = "rgba(70, 76, 90, 0.75)";
      c.lineWidth = 1.2;
      for (const f of [0.2, 0.5, 0.8]) {
        const px = x + cellW * f;
        c.beginPath();
        c.moveTo(px - 11, y - gap / 2);
        c.lineTo(px + 11, y - gap / 2);
        c.stroke();
      }
    }

    // Bypass diode in the cropped corner.
    for (const [ctx, body, tab] of [
      [c, "#1b1d24", SILVER],
      [m, surface(0.5, 0.2), surface(0.34, 1)],
    ] as const) {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(x + cellW - crop + 7, y);
      ctx.lineTo(x + cellW, y);
      ctx.lineTo(x + cellW, y + crop - 7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = tab;
      ctx.fillRect(x + cellW - 12, y + 3, 9, 4);
    }
  }

  const colorTexture = new CanvasTexture(color.canvas);
  colorTexture.colorSpace = SRGBColorSpace;
  colorTexture.anisotropy = 16;
  const surfaceTexture = new CanvasTexture(props.canvas);
  surfaceTexture.colorSpace = LinearSRGBColorSpace;
  surfaceTexture.anisotropy = 16;
  return { color: colorTexture, surface: surfaceTexture };
}

/** Shrink-wrap of one cylindrical lithium-ion cell: u runs around the cell, v along it. */
function drawBatteryWrap() {
  const W = 256;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);
  const body = ctx.createLinearGradient(0, 0, 0, H);
  body.addColorStop(0, "#2f7f9c");
  body.addColorStop(0.5, "#236a86");
  body.addColorStop(1, "#1c5870");
  ctx.fillStyle = body;
  ctx.fillRect(0, 0, W, H);
  // Positive-end band and the seam of the sleeve.
  ctx.fillStyle = "#e7edf0";
  ctx.fillRect(0, 26, W, 10);
  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.fillRect(W - 5, 0, 5, H);

  // Printing runs along the cell, as on a real sleeve.
  ctx.save();
  ctx.translate(W * 0.34, H * 0.56);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(240, 247, 250, 0.94)";
  ctx.font = "700 40px Arial, Helvetica, sans-serif";
  ctx.fillText("Li-ion", 0, 0);
  ctx.font = "600 21px Arial, Helvetica, sans-serif";
  ctx.fillStyle = "rgba(226, 238, 243, 0.82)";
  ctx.fillText("18650  RECHARGEABLE CELL", 0, 34);
  ctx.restore();
  ctx.fillStyle = "rgba(240, 247, 250, 0.94)";
  ctx.font = "700 40px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("+", W * 0.72, 92);
  ctx.fillRect(W * 0.72 - 13, H - 62, 26, 6);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function drawPcb() {
  const S = 256;
  const { canvas, ctx } = makeCanvas(S, S);
  const random = mulberry32(7);
  ctx.fillStyle = "#0e3a26";
  ctx.fillRect(0, 0, S, S);

  // Routed traces: orthogonal runs with 45° jogs.
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 70; i++) {
    let x = Math.round(random() * S);
    let y = Math.round(random() * S);
    ctx.strokeStyle = random() > 0.5 ? "rgba(46, 122, 82, 0.9)" : "rgba(9, 44, 28, 0.9)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segments = 2 + Math.floor(random() * 4);
    for (let s = 0; s < segments; s++) {
      const run = 10 + random() * 46;
      const dir = Math.floor(random() * 4);
      if (dir === 0) x += run;
      else if (dir === 1) y += run;
      else if (dir === 2) {
        x += run * 0.5;
        y += run * 0.5;
      } else {
        x -= run * 0.5;
        y += run * 0.5;
      }
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // Vias and pads.
  for (let i = 0; i < 90; i++) {
    const x = random() * S;
    const y = random() * S;
    ctx.fillStyle = "rgba(196, 164, 88, 0.85)";
    ctx.beginPath();
    ctx.arc(x, y, 1.1 + random() * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Normal map for a quilted multi-layer insulation blanket. One tile is two by
 * two quilt squares: each square billows between its stitched seams, and the
 * foil is creased at three scales. The creases come from cellular noise —
 * flat facets meeting at sharp folds — which is how crumpled film catches light.
 */
function drawMliNormal() {
  const S = 512;
  const QUILT = S / 2;
  const random = mulberry32(21);
  const height = new Float32Array(S * S);

  for (const [cellsPerTile, weight] of [
    [7, 1],
    [17, 0.55],
    [41, 0.3],
  ] as const) {
    const n = cellsPerTile;
    const size = S / n;
    const px = new Float32Array(n * n);
    const py = new Float32Array(n * n);
    for (let i = 0; i < n * n; i++) {
      px[i] = random();
      py[i] = random();
    }
    for (let y = 0; y < S; y++) {
      const gy = y / size;
      const cy = Math.floor(gy);
      for (let x = 0; x < S; x++) {
        const gx = x / size;
        const cx = Math.floor(gx);
        let nearest = 9;
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            // Wrap the lattice so the tile repeats without a seam.
            const index = ((cy + oy + n) % n) * n + ((cx + ox + n) % n);
            const dx = cx + ox + px[index] - gx;
            const dy = cy + oy + py[index] - gy;
            const d = dx * dx + dy * dy;
            if (d < nearest) nearest = d;
          }
        }
        // In pixels, so every scale folds at a similar angle.
        height[y * S + x] += Math.sqrt(nearest) * size * weight;
      }
    }
  }

  for (let y = 0; y < S; y++) {
    const v = (y % QUILT) / QUILT;
    const seamV = Math.min(v, 1 - v) * QUILT;
    for (let x = 0; x < S; x++) {
      const u = (x % QUILT) / QUILT;
      const seamU = Math.min(u, 1 - u) * QUILT;
      const puff = Math.sqrt(Math.sin(Math.PI * u) * Math.sin(Math.PI * v));
      const seam = Math.exp(-(seamU * seamU) / 18) + Math.exp(-(seamV * seamV) / 18);
      height[y * S + x] += puff * 26 - seam * 7;
    }
  }

  const { canvas, ctx } = makeCanvas(S, S);
  const image = ctx.createImageData(S, S);
  const strength = 0.42;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const l = height[y * S + ((x - 1 + S) % S)];
      const r = height[y * S + ((x + 1) % S)];
      const u = height[((y - 1 + S) % S) * S + x];
      const d = height[((y + 1) % S) * S + x];
      const nx = (l - r) * strength;
      const ny = (u - d) * strength;
      const inv = 1 / Math.hypot(nx, ny, 1);
      const i = (y * S + x) * 4;
      image.data[i] = (nx * inv * 0.5 + 0.5) * 255;
      image.data[i + 1] = (ny * inv * 0.5 + 0.5) * 255;
      image.data[i + 2] = (inv * 0.5 + 0.5) * 255;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = LinearSRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

/** Radiator face: mirror tiles with thin gaps. */
function drawRadiator() {
  const S = 256;
  const { canvas, ctx } = makeCanvas(S, S);
  const random = mulberry32(3);
  ctx.fillStyle = "#6f7680";
  ctx.fillRect(0, 0, S, S);
  const tiles = 4;
  const size = S / tiles;
  for (let ty = 0; ty < tiles; ty++) {
    for (let tx = 0; tx < tiles; tx++) {
      const shade = 226 + Math.floor(random() * 22);
      ctx.fillStyle = `rgb(${shade}, ${shade + 3}, ${Math.min(255, shade + 8)})`;
      ctx.fillRect(tx * size + 2, ty * size + 2, size - 4, size - 4);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

let cache: SpacecraftTextures | null = null;

export function getSpacecraftTextures(): SpacecraftTextures {
  if (!cache) {
    const solar = drawSolarPanel();
    cache = { solarCells: solar.color, solarSurface: solar.surface, batteryWrap: drawBatteryWrap(), pcb: drawPcb(), mliNormal: drawMliNormal(), radiator: drawRadiator() };
  }
  return cache;
}

export function disposeSpacecraftTextures() {
  if (!cache) return;
  Object.values(cache).forEach((t) => t.dispose());
  cache = null;
}
