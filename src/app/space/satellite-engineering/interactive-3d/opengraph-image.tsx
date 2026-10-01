import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PRODUCT, SATELLITE_REFERENCE } from "@/components/satellite-explorer/data/satelliteReference";
import { OG_ALT } from "./seo";

export const alt = OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The background is a still rendered from the explorer's own scene.
export default async function Image() {
  const background = await readFile(join(process.cwd(), "public/space/satellite-explorer/og-background.jpg"));
  const src = `data:image/jpeg;base64,${background.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", background: "#04050a", color: "#ffffff", fontFamily: "sans-serif" }}>
        <img src={src} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0 }} />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            background: "linear-gradient(90deg, rgba(4,5,10,0.9) 0%, rgba(4,5,10,0.62) 36%, rgba(4,5,10,0) 58%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "absolute", left: 72, bottom: 72, width: 600 }}>
          <div style={{ display: "flex", fontSize: 15, letterSpacing: 3, color: "#9aa0ad" }}>INTERACTIVE ENGINEERING LEARNING EXPERIENCE</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 24, fontSize: 70, fontWeight: 800, letterSpacing: 2, lineHeight: 1.04 }}>
            <span>SATELLITE</span>
            <span>EXPLORER 3D</span>
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 28, color: "#eef0f4" }}>{PRODUCT.subtitle}</div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 16, letterSpacing: 3, color: "#9aa0ad" }}>{SATELLITE_REFERENCE.missionLine.toUpperCase()}</div>
        </div>
        <div style={{ display: "flex", position: "absolute", left: 72, top: 60, fontSize: 18, letterSpacing: 2, color: "#c9cdd6" }}>aerospace.ev.engineer</div>
      </div>
    ),
    size,
  );
}
