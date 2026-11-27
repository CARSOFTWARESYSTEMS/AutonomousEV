// Generated textures for the Smart Parking facility: bay number stencils,
// bay-state glyphs (symbol and colour, never colour alone), the entry
// guidance sign, barrier boom stripes and pavement symbols. Drawn on a canvas
// at start-up; nothing is downloaded.
import { CanvasTexture, LinearFilter, RepeatWrapping, SRGBColorSpace } from "three";
import type { BayStatus } from "@/lib/wireless-charging/smart-parking/types";

function canvas(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, srgb = true): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new CanvasTexture(c);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Bay states as the indicators show them: a symbol, a colour and a word. */
export const STATUS_LOOK: Record<BayStatus, { color: string; glyph: string; word: string }> = {
  available: { color: "#3fb950", glyph: "ring", word: "FREE" },
  reserved: { color: "#d9a441", glyph: "R", word: "RESERVED" },
  occupied: { color: "#e5534b", glyph: "square", word: "OCCUPIED" },
  charging: { color: "#39c5cf", glyph: "bolt", word: "CHARGING" },
  "charging-complete": { color: "#8ddb8c", glyph: "bolt-ring", word: "CHARGED" },
  blocked: { color: "#8b949e", glyph: "cross", word: "BLOCKED" },
  maintenance: { color: "#8b949e", glyph: "wrench", word: "SERVICE" },
  unknown: { color: "#f0b72f", glyph: "?", word: "UNKNOWN" },
};

function bolt(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(cx + 0.12 * s, cy - 0.5 * s);
  ctx.lineTo(cx - 0.28 * s, cy + 0.06 * s);
  ctx.lineTo(cx - 0.02 * s, cy + 0.06 * s);
  ctx.lineTo(cx - 0.12 * s, cy + 0.5 * s);
  ctx.lineTo(cx + 0.28 * s, cy - 0.08 * s);
  ctx.lineTo(cx + 0.02 * s, cy - 0.08 * s);
  ctx.closePath();
  ctx.fill();
}

/** The indicator face for a state: dark glass, a symbol and a word. */
export function statusTexture(status: BayStatus): CanvasTexture {
  const look = STATUS_LOOK[status];
  return canvas(256, 160, (ctx) => {
    ctx.fillStyle = "#06090d";
    ctx.fillRect(0, 0, 256, 160);
    ctx.fillStyle = look.color;
    ctx.strokeStyle = look.color;
    ctx.lineWidth = 12;
    const cx = 72;
    const cy = 80;
    const s = 92;
    if (look.glyph === "ring") {
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.36, 0, Math.PI * 2);
      ctx.stroke();
    } else if (look.glyph === "square") ctx.fillRect(cx - s * 0.32, cy - s * 0.32, s * 0.64, s * 0.64);
    else if (look.glyph === "bolt") bolt(ctx, cx, cy, s);
    else if (look.glyph === "bolt-ring") {
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.42, 0, Math.PI * 2);
      ctx.lineWidth = 7;
      ctx.stroke();
      bolt(ctx, cx, cy, s * 0.75);
    } else if (look.glyph === "cross" || look.glyph === "wrench") {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.3, cy - s * 0.3);
      ctx.lineTo(cx + s * 0.3, cy + s * 0.3);
      ctx.moveTo(cx + s * 0.3, cy - s * 0.3);
      ctx.lineTo(cx - s * 0.3, cy + s * 0.3);
      ctx.stroke();
    } else {
      ctx.font = "800 96px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(look.glyph, cx, cy + 4);
    }
    ctx.font = "700 26px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(look.word, 132, 80);
  });
}

/** Bay number stencil painted at the bay entrance. */
export function stencilTexture(text: string, color = "#e9ecef"): CanvasTexture {
  const t = canvas(256, 128, (ctx) => {
    ctx.clearRect(0, 0, 256, 128);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.86;
    ctx.font = "700 92px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 70);
  });
  t.minFilter = LinearFilter;
  return t;
}

/** International accessibility symbol, painted. */
export function accessibleTexture(): CanvasTexture {
  return canvas(256, 256, (ctx) => {
    ctx.clearRect(0, 0, 256, 256);
    ctx.fillStyle = "#e9ecef";
    ctx.beginPath();
    ctx.arc(128, 54, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e9ecef";
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(122, 88);
    ctx.lineTo(118, 150);
    ctx.lineTo(170, 150);
    ctx.lineTo(186, 204);
    ctx.moveTo(118, 112);
    ctx.lineTo(168, 112);
    ctx.stroke();
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(116, 176, 46, Math.PI * 0.62, Math.PI * 1.75);
    ctx.stroke();
  });
}

/** Wireless-bay pavement symbol: a coil and a bolt. */
export function wirelessMarkTexture(): CanvasTexture {
  return canvas(256, 256, (ctx) => {
    ctx.clearRect(0, 0, 256, 256);
    ctx.strokeStyle = "rgba(170,225,230,0.9)";
    ctx.lineWidth = 8;
    for (const r of [96, 74, 52]) {
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(170,225,230,0.95)";
    bolt(ctx, 128, 128, 70);
  });
}

/** Red and white boom stripes. */
export function stripeTexture(): CanvasTexture {
  const t = canvas(256, 16, (ctx) => {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? "#f2f2ee" : "#c8202a";
      ctx.fillRect(i * 32, 0, 32, 16);
    }
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** Pavement arrow (one-way aisle), white on transparent. */
export function arrowTexture(): CanvasTexture {
  return canvas(256, 128, (ctx) => {
    ctx.clearRect(0, 0, 256, 128);
    ctx.fillStyle = "rgba(235,238,240,0.85)";
    ctx.beginPath();
    ctx.moveTo(20, 50);
    ctx.lineTo(160, 50);
    ctx.lineTo(160, 20);
    ctx.lineTo(236, 64);
    ctx.lineTo(160, 108);
    ctx.lineTo(160, 78);
    ctx.lineTo(20, 78);
    ctx.closePath();
    ctx.fill();
  });
}

/** Word painted in a lane ("IN", "OUT", "STOP"). */
export function wordTexture(word: string): CanvasTexture {
  return canvas(256, 128, (ctx) => {
    ctx.clearRect(0, 0, 256, 128);
    ctx.fillStyle = "rgba(235,238,240,0.88)";
    ctx.font = "800 84px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(word, 128, 68);
  });
}

/** The entry guidance sign, redrawn from the allocation engine's counts. */
export function drawSign(ctx: CanvasRenderingContext2D, w: number, h: number, data: { free: number; total: number; wireless: number; bay: string | null; closed: string | null; region: string }) {
  ctx.fillStyle = "#05080c";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#2a3441";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);
  ctx.fillStyle = "#c9d4e0";
  ctx.font = "600 34px Inter, system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("SMART PARKING", 28, 44);
  ctx.fillStyle = "#7d8a99";
  ctx.font = "500 24px Inter, system-ui, sans-serif";
  ctx.fillText(data.region, w - 28 - ctx.measureText(data.region).width, 44);
  if (data.closed) {
    ctx.fillStyle = "#f0b72f";
    ctx.font = "800 54px Inter, system-ui, sans-serif";
    ctx.fillText("ENTRY CLOSED", 28, 130);
    ctx.font = "500 26px Inter, system-ui, sans-serif";
    ctx.fillText(data.closed, 28, 190);
    return;
  }
  ctx.fillStyle = data.free > 0 ? "#3fb950" : "#e5534b";
  ctx.font = "800 88px Inter, system-ui, sans-serif";
  ctx.fillText(String(data.free), 28, 136);
  ctx.fillStyle = "#c9d4e0";
  ctx.font = "600 30px Inter, system-ui, sans-serif";
  ctx.fillText(data.free > 0 ? `FREE OF ${data.total}` : "FULL", 140, 122);
  ctx.fillStyle = "#39c5cf";
  bolt(ctx, 158, 170, 44);
  ctx.fillText(`${data.wireless} CHARGING BAYS FREE`, 186, 172);
  if (data.bay) {
    ctx.fillStyle = "#e9ecef";
    ctx.font = "800 46px Inter, system-ui, sans-serif";
    const t = `→ ${data.bay}`;
    ctx.fillText(t, w - 28 - ctx.measureText(t).width, 128);
  }
}
