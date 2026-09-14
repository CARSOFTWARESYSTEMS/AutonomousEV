import { ImageResponse } from "next/og";
export const alt = "Model Rocketry · Interactive aerospace learning experience · EV Society & EV.ENGINEER";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#090B1D",
          color: "#FFFFFF",
          padding: 70,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 760, zIndex: 2 }}>
          <div style={{ display: "flex", color: "#67E8F9", fontSize: 20, letterSpacing: 3 }}>
            EV SOCIETY™ · SPACE LEARNING LAB
          </div>
          <div style={{ display: "flex", fontSize: 64, marginTop: 40 }}>Model Rocketry</div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 600, letterSpacing: -1, lineHeight: 1.2, marginTop: 20 }}>
            Beginner to Advanced Aerospace Learning
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#B5B8C9", marginTop: 28 }}>
            Mission design · Aerodynamics · Avionics · Recovery · FMEA
          </div>
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 140,
            top: 90,
            width: 90,
            height: 440,
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", width: 0, height: 0, borderLeft: "45px solid transparent", borderRight: "45px solid transparent", borderBottom: "70px solid #67E8F9" }} />
          <div style={{ display: "flex", width: 90, height: 260, background: "#151A38", border: "3px solid #3B82F6" }} />
          <div style={{ display: "flex", width: 140, height: 60 }}>
            <div style={{ display: "flex", width: 0, height: 0, borderTop: "60px solid transparent", borderRight: "50px solid #F59E0B" }} />
            <div style={{ display: "flex", width: 40 }} />
            <div style={{ display: "flex", width: 0, height: 0, borderTop: "60px solid transparent", borderLeft: "50px solid #F59E0B" }} />
          </div>
        </div>
        <div style={{ display: "flex", position: "absolute", right: 65, bottom: 60, fontSize: 16, color: "#67E8F9" }}>
          aerospace.ev.engineer/space/model-rocketry
        </div>
      </div>
    ),
    size,
  );
}
