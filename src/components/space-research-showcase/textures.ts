"use client";
// Surface textures for the spacecraft, drawn once on a canvas in the browser:
// nothing to download. Seeded, so the spacecraft looks the same on every
// visit. Solar cells (triple-junction style, cropped corners, gridlines),
// crinkled gold multi-layer insulation, and a radiator of mirrored tiles.
import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace, type Texture } from "three";

function surface(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return { canvas, g: canvas.getContext("2d")! };
}

function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function texture(canvas: HTMLCanvasElement, anisotropy: number, srgb: boolean) {
  const t = new CanvasTexture(canvas);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.anisotropy = anisotropy;
  return t;
}

/** A solar panel face: 4 × 4 cells with cropped corners, fine gridlines and a busbar, on a dark substrate. */
function solarCells(anisotropy: number) {
  const W = 512;
  const H = 880;
  const color = surface(W, H);
  const rough = surface(W, H);
  const rnd = random(7);
  color.g.fillStyle = "#0a0d14";
  color.g.fillRect(0, 0, W, H);
  rough.g.fillStyle = "#d8d8d8";
  rough.g.fillRect(0, 0, W, H);
  const cols = 4;
  const rows = 4;
  const cw = W / cols;
  const ch = H / rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * cw + 5;
      const y = j * ch + 5;
      const w = cw - 10;
      const h = ch - 10;
      const cut = 16;
      const path = new Path2D();
      path.moveTo(x + cut, y);
      path.lineTo(x + w - cut, y);
      path.lineTo(x + w, y + cut);
      path.lineTo(x + w, y + h);
      path.lineTo(x, y + h);
      path.lineTo(x, y + cut);
      path.closePath();
      const grad = color.g.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, `hsl(${224 + rnd() * 6}, 64%, ${22 + rnd() * 4}%)`);
      grad.addColorStop(1, `hsl(${230 + rnd() * 6}, 72%, ${12 + rnd() * 3}%)`);
      color.g.fillStyle = grad;
      color.g.fill(path);
      color.g.save();
      color.g.clip(path);
      // Gridlines (the front metallisation) and the busbar along the top edge.
      color.g.fillStyle = "rgba(165, 185, 230, 0.16)";
      for (let gy = y + 12; gy < y + h; gy += 7) color.g.fillRect(x, gy, w, 1);
      color.g.fillStyle = "rgba(205, 214, 228, 0.7)";
      color.g.fillRect(x + cut, y + 3, w - 2 * cut, 4);
      color.g.restore();
      rough.g.fillStyle = "#3a3a3a";
      rough.g.fill(path);
    }
  }
  // Silver interconnects between rows.
  color.g.fillStyle = "rgba(196, 204, 216, 0.85)";
  for (let i = 0; i < cols; i++) for (let j = 1; j < rows; j++) for (const dx of [0.3, 0.7]) color.g.fillRect(i * cw + cw * dx - 5, j * ch - 4, 10, 8);
  return { map: texture(color.canvas, anisotropy, true), roughnessMap: texture(rough.canvas, anisotropy, false) };
}

/** Crinkled gold multi-layer insulation: soft facets catch the light at different angles; taped edges and a seam. */
function goldFoil(anisotropy: number) {
  const SW = 256;
  const SH = 416;
  const small = surface(SW, SH);
  const smallBump = surface(SW, SH);
  const rnd = random(11);
  const nx = 18;
  const ny = 30;
  const pts: [number, number][][] = [];
  for (let i = 0; i <= nx; i++) {
    pts.push([]);
    for (let j = 0; j <= ny; j++) {
      const edge = i === 0 || j === 0 || i === nx || j === ny;
      pts[i].push([(i / nx) * SW + (edge ? 0 : (rnd() - 0.5) * (SW / nx) * 0.9), (j / ny) * SH + (edge ? 0 : (rnd() - 0.5) * (SH / ny) * 0.9)]);
    }
  }
  const tri = (a: [number, number], b: [number, number], c: [number, number]) => {
    const shade = rnd();
    const r = Math.round(184 + shade * 62);
    const gch = Math.round(136 + shade * 70);
    const bch = Math.round(52 + shade * 56);
    for (const [g, fill] of [
      [small.g, `rgb(${r}, ${gch}, ${bch})`],
      [smallBump.g, `rgb(${Math.round(70 + shade * 120)}, ${Math.round(70 + shade * 120)}, ${Math.round(70 + shade * 120)})`],
    ] as const) {
      g.fillStyle = fill;
      g.beginPath();
      g.moveTo(...a);
      g.lineTo(...b);
      g.lineTo(...c);
      g.closePath();
      g.fill();
      g.strokeStyle = fill;
      g.lineWidth = 0.6;
      g.stroke();
    }
  };
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const flip = rnd() > 0.5;
      const [a, b, c, d] = [pts[i][j], pts[i + 1][j], pts[i + 1][j + 1], pts[i][j + 1]];
      if (flip) {
        tri(a, b, c);
        tri(a, c, d);
      } else {
        tri(a, b, d);
        tri(b, c, d);
      }
    }
  }
  // Upscale with smoothing, so the facets read as soft crinkles rather than polygons.
  const W = 512;
  const H = 832;
  const color = surface(W, H);
  const bump = surface(W, H);
  for (const [dst, src] of [
    [color.g, small.canvas],
    [bump.g, smallBump.canvas],
  ] as const) {
    dst.imageSmoothingEnabled = true;
    dst.imageSmoothingQuality = "high";
    dst.drawImage(src, 0, 0, W, H);
  }
  // Taped edges and a stitched seam.
  color.g.strokeStyle = "rgba(120, 82, 22, 0.9)";
  color.g.lineWidth = 14;
  color.g.strokeRect(7, 7, W - 14, H - 14);
  color.g.fillStyle = "rgba(110, 76, 20, 0.85)";
  color.g.fillRect(W * 0.62, 0, 5, H);
  color.g.fillStyle = "rgba(235, 205, 130, 0.9)";
  for (let y = 10; y < H; y += 18) color.g.fillRect(W * 0.62 - 3, y, 11, 2);
  bump.g.fillStyle = "#202020";
  bump.g.fillRect(W * 0.62, 0, 5, H);
  return { map: texture(color.canvas, anisotropy, true), bumpMap: texture(bump.canvas, anisotropy, false) };
}

/** A radiator of small mirrored tiles (optical solar reflectors) with dark gaps. */
function radiatorTiles(anisotropy: number) {
  const W = 128;
  const H = 480;
  const color = surface(W, H);
  const rough = surface(W, H);
  const rnd = random(5);
  color.g.fillStyle = "#2c3038";
  color.g.fillRect(0, 0, W, H);
  rough.g.fillStyle = "#c8c8c8";
  rough.g.fillRect(0, 0, W, H);
  const cols = 4;
  const rows = 15;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const v = Math.round(214 + rnd() * 30);
      color.g.fillStyle = `rgb(${v}, ${v + 3}, ${Math.min(255, v + 8)})`;
      color.g.fillRect((i * W) / cols + 2, (j * H) / rows + 2, W / cols - 4, H / rows - 4);
      rough.g.fillStyle = "#1c1c1c";
      rough.g.fillRect((i * W) / cols + 2, (j * H) / rows + 2, W / cols - 4, H / rows - 4);
    }
  }
  return { map: texture(color.canvas, anisotropy, true), roughnessMap: texture(rough.canvas, anisotropy, false) };
}

export interface SpacecraftTextures {
  cells: { map: Texture; roughnessMap: Texture };
  foil: { map: Texture; bumpMap: Texture };
  radiator: { map: Texture; roughnessMap: Texture };
}

export function useSpacecraftTextures(): SpacecraftTextures {
  const gl = useThree((s) => s.gl);
  const textures = useMemo(() => {
    const a = Math.min(8, gl.capabilities.getMaxAnisotropy());
    return { cells: solarCells(a), foil: goldFoil(a), radiator: radiatorTiles(a) };
  }, [gl]);
  useEffect(
    () => () => {
      for (const set of Object.values(textures)) for (const t of Object.values(set)) (t as Texture).dispose();
    },
    [textures],
  );
  return textures;
}
