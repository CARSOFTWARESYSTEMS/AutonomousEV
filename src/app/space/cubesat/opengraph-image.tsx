import { ImageResponse } from "next/og";
export const alt =
  "CubeTwin · CubeSat energy and mission simulation · An EV Society initiative";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 760,
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#67E8F9",
            fontSize: 20,
            letterSpacing: 3,
          }}
        >
          EV SOCIETY™ · SPACE LEARNING LAB
        </div>
        <div style={{ display: "flex", fontSize: 64, marginTop: 40 }}>
          CubeTwin
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 35,
            fontWeight: 600,
            letterSpacing: -1,
            lineHeight: 1.1,
            marginTop: 20,
          }}
        >
          CubeSat Energy, Mission and Reliability Analysis
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 23,
            color: "#B5B8C9",
            marginTop: 28,
          }}
        >
          Initial Draft · v0.01 · 12-Week Student R&D Project
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 17,
            color: "#F59E0B",
            marginTop: 40,
          }}
        >
          Educational R&D prototype · Simulated data · Not flight software
        </div>
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: 40,
          top: 145,
          width: 330,
          height: 330,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 25% 25%, #386478, #0c283d 60%, #070e19)",
          border: "2px solid #255063",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: 70,
          top: 148,
          transform: "rotate(-20deg)",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 70,
            height: 37,
            background: "#194467",
            border: "2px solid #638ea3",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 37,
            height: 85,
            background: "#b6a47f",
            border: "3px solid #e0cba3",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 70,
            height: 37,
            background: "#194467",
            border: "2px solid #638ea3",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: 65,
          bottom: 80,
          fontSize: 16,
          color: "#67E8F9",
        }}
      >
        aerospace.ev.engineer/space/cubesat
      </div>
    </div>,
    size,
  );
}
