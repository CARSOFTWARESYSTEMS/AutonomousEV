import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OG_ALT } from "./seo";

export const alt = OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CHAIN = ["PHYSICAL ENGINE", "PHYSICS", "TELEMETRY", "AI/ML", "DIGITAL TWIN", "PROGNOSTICS"];

// The background is the still of the reference engine used by the fundamentals page: the same engine, taken further.
export default async function Image() {
  const background = await readFile(join(process.cwd(), "public/space/rocket-engine-twin/og-background.jpg"));
  const src = `data:image/jpeg;base64,${background.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", background: "#04050a", color: "#ffffff", fontFamily: "sans-serif" }}>
        <img src={src} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0 }} />
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 1200, height: 630, background: "linear-gradient(90deg, rgba(4,5,10,0.94) 0%, rgba(4,5,10,0.7) 46%, rgba(4,5,10,0.05) 72%)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", position: "absolute", left: 76, top: 0, width: 700, height: 630 }}>
          <div style={{ display: "flex", fontSize: 19, fontWeight: 700, letterSpacing: 6, color: "#c5cad3" }}>EV.ENGINEER™</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 52, fontWeight: 800, letterSpacing: 1, lineHeight: 1.1 }}>
            <span>ADVANCED ROCKET</span>
            <span>PROPULSION SYSTEM</span>
            <span>DIGITAL TWIN</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", marginTop: 30, width: 640, fontSize: 17, fontWeight: 700, letterSpacing: 2.5, color: "#9ec8ff" }}>
            {CHAIN.map((step, i) => (
              <div key={step} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <span>{step}</span>
                {i < CHAIN.length - 1 && <span style={{ margin: "0 12px", color: "#98a0ad" }}>→</span>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 18, letterSpacing: 2, color: "#98a0ad" }}>PRESSURE MONITORING · FAULT DETECTION · DIAGNOSIS</div>
        </div>
      </div>
    ),
    size,
  );
}
