import { ImageResponse } from "next/og";
import { CASE_STUDY, FRAMEWORK } from "@/components/revenue/data/framework";
import { CUSTOMER_TO_REVENUE } from "@/components/revenue/data/steps";
import { OG_ALT } from "./seo";

export const alt = OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Typeset from the page's own positioning: the name, the headline, the case study and the customer-to-revenue flow.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "60px 72px", background: "linear-gradient(140deg, #121b29 0%, #06090f 62%)", color: "#f3f0e9", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 20, fontWeight: 700, letterSpacing: 6, color: "#38bdf8" }}>EV.ENGINEER™ · MARKETING &amp; SALES</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 58, fontWeight: 800, letterSpacing: -2, lineHeight: 1.04 }}>
            {FRAMEWORK.headlineLines.map((line) => (
              <span key={line} style={{ display: "flex" }}>
                {line}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 30, fontWeight: 600, color: "#93d7ee" }}>Live case study: {CASE_STUDY.title}</div>
          <div style={{ display: "flex", marginTop: 10, fontSize: 24, color: "#b6bfcb" }}>Bengaluru Aerospace &amp; Defence MSMEs · 10 steps from customer to revenue</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: "#b6bfcb" }}>
          {CUSTOMER_TO_REVENUE.map(({ name }, i) => (
            <div key={name} style={{ display: "flex", alignItems: "center" }}>
              <span style={{ display: "flex", padding: "8px 14px", border: `1px solid ${i === CUSTOMER_TO_REVENUE.length - 1 ? "rgba(56,189,248,0.8)" : "rgba(147,215,238,0.4)"}`, borderRadius: 999 }}>{name}</span>
              {i < CUSTOMER_TO_REVENUE.length - 1 ? <span style={{ display: "flex", margin: "0 8px", color: "#38bdf8" }}>→</span> : null}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
