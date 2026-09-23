import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Sudarshana Karkala | EV.ENGINEER™";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#4CA930";
const BG_DARK = "#04140E";
const BG_DEEP = "#052016";
const TEXT_PRIMARY = "#EAF7F1";
const TEXT_SECONDARY = "rgba(234, 247, 241, 0.72)";

export default async function OpengraphImage() {
  const photoData = await readFile(join(process.cwd(), "public", "SudarshanaKarkala.jpg"), "base64");
  const photoSrc = `data:image/jpeg;base64,${photoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 96px",
          background: `radial-gradient(circle at 22% 25%, ${BG_DEEP} 0%, ${BG_DARK} 65%)`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -140,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(76,169,48,0.3) 0%, rgba(76,169,48,0) 70%)",
            display: "flex",
          }}
        />

        <img
          src={photoSrc}
          alt=""
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            objectFit: "cover",
            border: "4px solid rgba(76,169,48,0.55)",
            marginRight: 56,
            flexShrink: 0,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: ACCENT, marginBottom: 10, letterSpacing: 1 }}>
            EV.ENGINEER™
          </div>
          <div style={{ display: "flex", fontSize: 66, fontWeight: 800, color: "#fff", letterSpacing: -1 }}>
            Sudarshana Karkala
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: TEXT_PRIMARY, marginTop: 24, maxWidth: 720 }}>
            EV &amp; Battery Intelligence · Cybersecurity
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: TEXT_PRIMARY, marginTop: 8, maxWidth: 720 }}>
            Space Research · CanSat Model Rocketry
          </div>
          <div style={{ display: "flex", fontSize: 24, color: TEXT_SECONDARY, marginTop: 32 }}>
            autonomous.ev.engineer
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
