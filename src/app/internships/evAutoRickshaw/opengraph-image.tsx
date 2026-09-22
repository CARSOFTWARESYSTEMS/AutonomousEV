import { ImageResponse } from "next/og";

export const alt = "EV Auto Rickshaw — D+6 Electric Three-Wheeler Design Simulator | EV.ENGINEER™";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#4CA930";
const BG_DARK = "#04140E";
const BG_DEEP = "#052016";
const TEXT_PRIMARY = "#EAF7F1";
const TEXT_SECONDARY = "rgba(234, 247, 241, 0.72)";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "88px 96px",
          background: `radial-gradient(circle at 30% 20%, ${BG_DEEP} 0%, ${BG_DARK} 65%)`,
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
            background: `radial-gradient(circle, rgba(76,169,48,0.35) 0%, rgba(76,169,48,0) 70%)`,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 26,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            marginBottom: 36,
          }}
        >
          EV.ENGINEER™
        </div>

        <div style={{ display: "flex", fontSize: 84, fontWeight: 800, color: "#fff", letterSpacing: -2 }}>
          EV Auto Rickshaw
        </div>

        <div style={{ display: "flex", fontSize: 36, fontWeight: 600, color: ACCENT, marginTop: 18 }}>
          D+6 Electric Three-Wheeler Design Simulator
        </div>

        <div style={{ display: "flex", fontSize: 26, color: TEXT_SECONDARY, marginTop: 14 }}>
          Battery · BMS · Motor · Charging · Cost · TCO · Business Plan
        </div>

        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            marginTop: 48,
            fontSize: 22,
            fontWeight: 600,
            color: TEXT_PRIMARY,
            border: `1px solid rgba(76,169,48,0.4)`,
            background: "rgba(76,169,48,0.1)",
            borderRadius: 999,
            padding: "10px 24px",
          }}
        >
          Concept Engineering R&D Simulator
        </div>
      </div>
    ),
    { ...size },
  );
}
