import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PRODUCT } from "@/components/uflight-3d/data/uflightReferenceAircraft";
import { OG_ALT } from "./seo";

export const alt = OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The background is a still rendered from the experience's own opening scene.
export default async function Image() {
  const background = await readFile(join(process.cwd(), "public/aerospace/uflight-3d/og-background.jpg"));
  const src = `data:image/jpeg;base64,${background.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", background: "#030405", color: "#ffffff", fontFamily: "sans-serif" }}>
        <img src={src} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0 }} />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            background: "linear-gradient(90deg, rgba(3,4,5,0.92) 0%, rgba(3,4,5,0.6) 40%, rgba(3,4,5,0) 64%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "absolute", left: 72, bottom: 72, width: 620 }}>
          <div style={{ display: "flex", fontSize: 20, fontWeight: 700, letterSpacing: 7, color: "#c8ccd4" }}>{PRODUCT.wordmark}</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 50, fontWeight: 800, letterSpacing: 0.5, lineHeight: 1.06 }}>
            <span>THE AIRCRAFT KNOWS</span>
            <span>MORE THAN YOU CAN SEE.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 25, color: "#eef0f3", lineHeight: 1.3 }}>
            <span>{PRODUCT.headlineLines[0]}</span>
            <span>{PRODUCT.headlineLines[1]}</span>
          </div>
          <div style={{ display: "flex", marginTop: 16, fontSize: 16, letterSpacing: 3, color: "#99a0ac" }}>{PRODUCT.platform.toUpperCase()}</div>
        </div>
        <div style={{ display: "flex", position: "absolute", left: 72, top: 60, fontSize: 18, letterSpacing: 2, color: "#c8ccd4" }}>aerospace.ev.engineer</div>
      </div>
    ),
    size,
  );
}
