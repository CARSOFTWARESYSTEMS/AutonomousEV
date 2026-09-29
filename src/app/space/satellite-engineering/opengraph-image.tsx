import { ImageResponse } from "next/og";
export const alt =
  "Satellite Engineering — From First Principles to Spacecraft Systems Architect · Architecture & Leadership Track · EV.ENGINEER";
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
          background: "linear-gradient(135deg, #0A0C1C 0%, #0F1230 55%, #090B1D 100%)",
          color: "#FFFFFF",
          padding: 72,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -160,
            right: -140,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(124,58,237,0.45) 0%, rgba(124,58,237,0) 70%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", width: 780, zIndex: 2 }}>
          <div style={{ display: "flex", color: "#B39DDB", fontSize: 20, letterSpacing: 3 }}>
            FLAGSHIP · ARCHITECTURE &amp; LEADERSHIP TRACK
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, marginTop: 36, letterSpacing: -2 }}>Satellite Engineering</div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: "#93C5FD", lineHeight: 1.25, marginTop: 18 }}>
            From First Principles to Spacecraft Systems Architect
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#B5B8C9", marginTop: 34 }}>
            12 weeks · Digital twin · CubeSat flatsat · SRR · PDR · CDR
          </div>
        </div>

        {/* Abstract orbit + 6U spacecraft */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 70,
            top: 170,
            width: 300,
            height: 300,
            borderRadius: 9999,
            border: "2px dashed rgba(179,157,219,0.55)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 120,
            top: 220,
            width: 200,
            height: 200,
            borderRadius: 9999,
            background: "radial-gradient(circle at 35% 30%, #1E2A5A 0%, #0B1030 70%)",
            border: "2px solid rgba(59,130,246,0.6)",
          }}
        />
        <div style={{ display: "flex", position: "absolute", right: 70, top: 170, alignItems: "center" }}>
          <div style={{ display: "flex", width: 54, height: 22, background: "#1B2150", border: "2px solid #93C5FD" }} />
          <div style={{ display: "flex", width: 30, height: 44, background: "#2A1F5E", border: "2px solid #B39DDB", borderRadius: 4 }} />
          <div style={{ display: "flex", width: 54, height: 22, background: "#1B2150", border: "2px solid #93C5FD" }} />
        </div>

        <div style={{ display: "flex", position: "absolute", left: 72, bottom: 56, fontSize: 18, color: "#67E8F9" }}>
          aerospace.ev.engineer/space/satellite-engineering
        </div>
      </div>
    ),
    size,
  );
}
