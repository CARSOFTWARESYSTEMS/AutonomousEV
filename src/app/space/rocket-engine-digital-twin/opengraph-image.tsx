import { ImageResponse } from "next/og";
import EngineSchematic, { DEFAULT_VIEW } from "@/components/rocket-engine-twin/EngineSchematic";
import { PRODUCT } from "@/components/rocket-engine-twin/data/engineReference";
import { OG_ALT } from "./seo";

export const alt = OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The engine on the left is the page's own schematic, with the combustion
// chamber open and the regenerative cooling flow shown.
export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "radial-gradient(circle at 22% 40%, #171d29 0%, #0a0d13 42%, #05070b 78%)", color: "#ffffff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 520, height: 630 }}>
          <EngineSchematic view={{ ...DEFAULT_VIEW, cutaway: "combustion", flow: "cooling" }} labels={false} idPrefix="og" width={470} height={597} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 680, height: 630, padding: "0 72px 0 28px" }}>
          <div style={{ display: "flex", fontSize: 17, fontWeight: 700, letterSpacing: 4, color: "#9ec8ff" }}>{PRODUCT.tagline.toUpperCase()}</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 62, fontWeight: 800, letterSpacing: -1, lineHeight: 1.08 }}>
            <span>Next-Generation</span>
            <span>Rocket Engine</span>
            <span>Digital Twin</span>
          </div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 22, color: "#c5cad3" }}>{PRODUCT.platform}</div>
          <div style={{ display: "flex", marginTop: 44, fontSize: 20, fontWeight: 700, letterSpacing: 5, color: "#ffffff" }}>EV.ENGINEER™</div>
        </div>
      </div>
    ),
    size,
  );
}
