import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SUBTITLE, TITLE } from "./seo";

// The share card for /aerospace, 1200 × 630. Drawn here, published by
// ./og-image.jpg/route.tsx. The spacecraft is a still rendered from the site's
// own 3D scene (public/aerospace/space-research/spacecraft.jpg); the security
// layer (rings, lock, network nodes, grid) is drawn as SVG; the type is Manrope.

export const CARD_SIZE = { width: 1200, height: 630 };

/** Where the satellite sits once the still is placed on the right of the card. */
const SAT = { x: 840, y: 268 };

function securityLayer(): string {
  const ring = (rx: number, ry: number, rotate: number, stroke: string, dash: string, width: number) =>
    `<ellipse cx="${SAT.x}" cy="${SAT.y}" rx="${rx}" ry="${ry}" transform="rotate(${rotate} ${SAT.x} ${SAT.y})" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-dasharray="${dash}"/>`;
  const nodes = [
    [SAT.x - 300, SAT.y + 96],
    [SAT.x + 318, SAT.y - 70],
    [SAT.x + 140, SAT.y + 172],
    [SAT.x - 190, SAT.y - 150],
  ];
  const lock = { x: SAT.x + 6, y: SAT.y - 186 };
  // A faint hexagonal grid behind the type: engineering, not decoration.
  const hex: string[] = [];
  const r = 26;
  const w = Math.sqrt(3) * r;
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 14; col++) {
      const cx = col * w + (row % 2 ? w / 2 : 0);
      const cy = row * r * 1.5;
      const points = Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k + Math.PI / 6;
        return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
      }).join(" ");
      hex.push(`<polygon points="${points}"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#ffffff" stop-opacity="1"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <mask id="left"><rect width="620" height="630" fill="url(#fade)"/></mask>
    </defs>
    <g mask="url(#left)" fill="none" stroke="#93c5fd" stroke-opacity="0.07" stroke-width="1">${hex.join("")}</g>
    ${ring(338, 150, -8, "#67e8f9", "5 9", 1.6)}
    ${ring(372, 176, -8, "#a78bfa", "2 12", 1.2)}
    ${ring(300, 128, -8, "#67e8f9", "120 26", 0.8)}
    ${nodes
      .map(
        ([x, y]) =>
          `<line x1="${x}" y1="${y}" x2="${lock.x}" y2="${lock.y + 16}" stroke="#67e8f9" stroke-opacity="0.18" stroke-width="1"/><circle cx="${x}" cy="${y}" r="4.5" fill="#67e8f9"/><circle cx="${x}" cy="${y}" r="11" fill="none" stroke="#67e8f9" stroke-opacity="0.35"/>`,
      )
      .join("")}
    <circle cx="${lock.x}" cy="${lock.y}" r="34" fill="#060a1e" fill-opacity="0.9" stroke="#67e8f9" stroke-width="1.6"/>
    <circle cx="${lock.x}" cy="${lock.y}" r="44" fill="none" stroke="#a78bfa" stroke-opacity="0.45" stroke-width="1"/>
    <path d="M ${lock.x - 9} ${lock.y - 3} v -7 a 9 9 0 0 1 18 0 v 7" fill="none" stroke="#a5f3fc" stroke-width="3" stroke-linecap="round"/>
    <rect x="${lock.x - 14}" y="${lock.y - 4}" width="28" height="21" rx="4" fill="#a5f3fc"/>
    <circle cx="${lock.x}" cy="${lock.y + 5}" r="3" fill="#060a1e"/>
    <rect x="${lock.x - 1.5}" y="${lock.y + 6}" width="3" height="6" fill="#060a1e"/>
  </svg>`;
}

export async function renderAerospaceCard(): Promise<ImageResponse> {
  const [still, extraBold, medium] = await Promise.all([
    readFile(join(process.cwd(), "public/aerospace/space-research/spacecraft.jpg")),
    readFile(join(process.cwd(), "src/assets/fonts/Manrope-800.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/Manrope-500.ttf")),
  ]);
  const spacecraft = `data:image/jpeg;base64,${still.toString("base64")}`;
  const layer = `data:image/svg+xml;base64,${Buffer.from(securityLayer()).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: "#050716", color: "#ffffff", fontFamily: "Manrope" }}>
        {/* The satellite above Earth, on the right; 1404 × 1122 scaled to the card's height. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og draws plain <img> elements */}
        <img src={spacecraft} alt="" width={788} height={630} style={{ position: "absolute", top: 0, left: 440 }} />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            background: "linear-gradient(90deg, #050716 0%, #050716 34%, rgba(5,7,22,0.55) 50%, rgba(5,7,22,0) 66%)",
          }}
        />
        {/* Blue, cyan and purple light. */}
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 1200, height: 630, background: "radial-gradient(circle at 8% 0%, rgba(124,58,237,0.42), rgba(124,58,237,0) 44%)" }} />
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 1200, height: 630, background: "radial-gradient(circle at 18% 100%, rgba(34,211,238,0.16), rgba(34,211,238,0) 40%)" }} />
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 1200, height: 630, background: "radial-gradient(circle at 68% 40%, rgba(59,130,246,0.16), rgba(59,130,246,0) 36%)" }} />
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og draws plain <img> elements */}
        <img src={layer} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0 }} />

        <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 72, top: 92, width: 520 }}>
          <div style={{ display: "flex", fontSize: 17, fontWeight: 800, letterSpacing: 6, color: "#93c5fd" }}>AEROSPACE · EV.ENGINEER</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 74, fontWeight: 800, lineHeight: 1.02, letterSpacing: -1.5 }}>
            <span>{TITLE.split(" ")[0]}</span>
            <span style={{ color: "#67e8f9" }}>{TITLE.split(" ").slice(1).join(" ")}</span>
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 28, fontWeight: 500, lineHeight: 1.32, color: "#dbe2f0" }}>{SUBTITLE}</div>
          <div style={{ display: "flex", marginTop: 34, width: 64, height: 3, background: "linear-gradient(90deg, #67e8f9, #a78bfa)" }} />
          <div style={{ display: "flex", marginTop: 20, width: 620, fontSize: 18, fontWeight: 500, color: "#9aa3b8", letterSpacing: 0.3 }}>Avionics · Satellite links · Embedded systems · Threat modelling</div>
        </div>
        <div style={{ display: "flex", position: "absolute", left: 72, bottom: 48, fontSize: 18, fontWeight: 500, letterSpacing: 2, color: "#7f88a0" }}>aerospace.ev.engineer</div>
      </div>
    ),
    {
      ...CARD_SIZE,
      fonts: [
        { name: "Manrope", data: extraBold, weight: 800, style: "normal" },
        { name: "Manrope", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
