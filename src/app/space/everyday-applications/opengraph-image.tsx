import { ImageResponse } from "next/og";
export const alt = "Space Applications for Everyday India · EV Society, UFlight & EV.ENGINEER";
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
        <div style={{ display: "flex", flexDirection: "column", width: 820, zIndex: 2 }}>
          <div style={{ display: "flex", color: "#67E8F9", fontSize: 20, letterSpacing: 3 }}>
            EV SOCIETY™ · SPACE LEARNING LAB
          </div>
          <div style={{ display: "flex", fontSize: 56, marginTop: 40, lineHeight: 1.1 }}>
            Space Applications for Everyday India
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1.3, marginTop: 24 }}>
            You may never see a satellite, but it already helps you every day.
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "#B5B8C9", marginTop: 28 }}>
            Weather · Navigation · Agriculture · Disaster Safety · Connectivity
          </div>
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 100,
            top: 130,
            width: 160,
            height: 160,
            borderRadius: "50%",
            border: "3px solid #7C3AED",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", width: 60, height: 60, borderRadius: "50%", background: "#06B6D4" }} />
        </div>
        <div style={{ display: "flex", position: "absolute", right: 65, bottom: 60, fontSize: 16, color: "#67E8F9" }}>
          aerospace.ev.engineer/space/everyday-applications
        </div>
      </div>
    ),
    size,
  );
}
