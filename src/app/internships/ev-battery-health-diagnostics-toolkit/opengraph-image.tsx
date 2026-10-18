import { ImageResponse } from "next/og";
import { FLOW, TOOLKIT } from "@/data/ev-battery-toolkit/content";
import { OG_ALT } from "./seo";

export const alt = OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Typeset from the page's own words: the name, the subtitle and the diagnostic flow.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "60px 72px", background: "linear-gradient(135deg, #0c1430 0%, #070a17 65%)", color: "#ffffff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 20, fontWeight: 700, letterSpacing: 6, color: "#93c5fd" }}>EV.ENGINEER™ · BATTERY DIAGNOSTICS</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 66, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>{TOOLKIT.shortName}</div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 34, fontWeight: 600, color: "#93c5fd" }}>{TOOLKIT.subtitle}</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", fontSize: 19, color: "#c4c9db" }}>
          {FLOW.map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
              <span style={{ display: "flex", padding: "7px 14px", border: "1px solid rgba(147,197,253,0.45)", borderRadius: 999 }}>{step.toUpperCase()}</span>
              {i < FLOW.length - 1 ? <span style={{ display: "flex", margin: "0 8px", color: "#60a5fa" }}>→</span> : null}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
