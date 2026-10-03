import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PRODUCT } from "@/components/rocket-engine-twin/data/engineReference";
import { OG_ALT } from "./seo";

export const alt = OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The background is a still rendered from the experience's own opening scene: the engine, to the right of the title.
export default async function Image() {
  const background = await readFile(join(process.cwd(), "public/space/rocket-engine-twin/og-background.jpg"));
  const src = `data:image/jpeg;base64,${background.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", background: "#04050a", color: "#ffffff", fontFamily: "sans-serif" }}>
        <img src={src} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0 }} />
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 1200, height: 630, background: "linear-gradient(90deg, rgba(4,5,10,0.9) 0%, rgba(4,5,10,0.55) 42%, rgba(4,5,10,0) 66%)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", position: "absolute", left: 76, top: 0, width: 640, height: 630 }}>
          <div style={{ display: "flex", fontSize: 19, fontWeight: 700, letterSpacing: 6, color: "#c5cad3" }}>EV.ENGINEER™</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 30, fontSize: 56, fontWeight: 800, letterSpacing: 1, lineHeight: 1.1 }}>
            <span>NEXT-GENERATION</span>
            <span>ROCKET ENGINE</span>
            <span>DIGITAL TWIN</span>
          </div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 21, fontWeight: 700, letterSpacing: 4, color: "#ffffff" }}>{PRODUCT.tagline.toUpperCase()}</div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 19, letterSpacing: 2, color: "#98a0ad" }}>{PRODUCT.platform.toUpperCase()}</div>
        </div>
      </div>
    ),
    size,
  );
}
