import { ImageResponse } from "next/og";

export const alt = "Space Station Research & Engineering Simulator — generic modular research station orbiting Earth";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#090B1D", color: "#FFFFFF", padding: 70, position: "relative", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", width: 700, zIndex: 2 }}>
        <div style={{ display: "flex", color: "#93C5FD", fontSize: 22, letterSpacing: 3 }}>INTERACTIVE RESEARCH PLATFORM · SPACE SYSTEMS</div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, marginTop: 40, letterSpacing: -2 }}>SPACE STATION</div>
        <div style={{ display: "flex", fontSize: 36, fontWeight: 600, marginTop: 14 }}>Research &amp; Engineering Simulator</div>
        <div style={{ display: "flex", fontSize: 24, color: "#B5B8C9", marginTop: 30, lineHeight: 1.4 }}>
          Bharatiya Antariksh Station · ISS · Gateway · microgravity science · life support · power · docking
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#F59E0B", marginTop: "auto" }}>Educational models — not mission design data</div>
      </div>
      <div style={{ display: "flex", position: "absolute", right: 90, top: 150, width: 330, height: 330, borderRadius: 330, backgroundImage: "radial-gradient(circle at 70% 40%, #1f6fa8, #0d3b66 55%, #061a33)" }} />
      <div style={{ display: "flex", position: "absolute", right: 40, top: 260, width: 430, height: 110, borderRadius: 430, border: "2px solid rgba(59,130,246,0.6)" }} />
      <div style={{ display: "flex", position: "absolute", right: 60, top: 272, width: 60, height: 18, background: "#E2E8F0", borderRadius: 6 }} />
      <div style={{ display: "flex", position: "absolute", right: 122, top: 256, width: 22, height: 50, background: "#3B82F6" }} />
      <div style={{ display: "flex", position: "absolute", right: 36, top: 256, width: 22, height: 50, background: "#3B82F6" }} />
    </div>,
    size,
  );
}
