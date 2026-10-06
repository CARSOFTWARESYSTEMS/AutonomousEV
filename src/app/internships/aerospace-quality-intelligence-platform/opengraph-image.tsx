import { ImageResponse } from "next/og";
import { AQIP, DIGITAL_THREAD } from "@/components/aqip/data/overview";
import { OG_ALT } from "./seo";

export const alt = OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Typeset from the page's own positioning: the name, the tagline and the digital thread.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "64px 76px", background: "linear-gradient(135deg, #0b1233 0%, #070a1a 60%)", color: "#ffffff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 20, fontWeight: 700, letterSpacing: 6, color: "#93c5fd" }}>EV.ENGINEER™ · AEROSPACE QUALITY INTELLIGENCE</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>{AQIP.short}</div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 44, fontWeight: 600, color: "#93c5fd" }}>{AQIP.name}</div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 30, fontWeight: 600, color: "#e5e9f5" }}>{AQIP.tagline}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 21, color: "#c4c9db" }}>
          {DIGITAL_THREAD.map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center" }}>
              <span style={{ display: "flex", padding: "8px 16px", border: "1px solid rgba(147,197,253,0.45)", borderRadius: 999 }}>{step}</span>
              {i < DIGITAL_THREAD.length - 1 ? <span style={{ display: "flex", margin: "0 10px", color: "#60a5fa" }}>→</span> : null}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
