import { ImageResponse } from "next/og";
import { CASE_STUDY, FRAMEWORK, JOURNEY } from "@/components/revenue/data/framework";
import { OG_ALT } from "./seo";

export const alt = OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Typeset from the page's own positioning: the name, the headline, the case study and the journey.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "60px 72px", background: "linear-gradient(140deg, #121b29 0%, #06090f 62%)", color: "#f3f0e9", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 20, fontWeight: 700, letterSpacing: 6, color: "#6fd09a" }}>EV.ENGINEER™ · B2B REVENUE ENGINEERING</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.04 }}>{FRAMEWORK.headline}</div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 30, fontWeight: 600, color: "#93d7ee" }}>Live case study: {CASE_STUDY.title}</div>
          <div style={{ display: "flex", marginTop: 10, fontSize: 24, color: "#b6bfcb" }}>Bengaluru Aerospace &amp; Defence MSMEs · 12 weeks · Marketing &amp; Sales</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: "#b6bfcb" }}>
          {JOURNEY.map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center" }}>
              <span style={{ display: "flex", padding: "8px 14px", border: `1px solid ${i === JOURNEY.length - 1 ? "rgba(111,208,154,0.7)" : "rgba(147,215,238,0.4)"}`, borderRadius: 999 }}>{step}</span>
              {i < JOURNEY.length - 1 ? <span style={{ display: "flex", margin: "0 8px", color: "#6fd09a" }}>→</span> : null}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
