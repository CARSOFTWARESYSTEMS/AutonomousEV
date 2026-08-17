import { ImageResponse } from "next/og";

export const alt =
  "Model Rocketry Learning Guide 2026 — Aerodynamics, Avionics, Propulsion, Recovery, Telemetry, Safety — an EV Society educational companion on EV.ENGINEER";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          padding: "80px 96px",
          background: "linear-gradient(135deg, #04140E 0%, #062A1C 55%, #04140E 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(76,169,48,0.45) 0%, rgba(76,169,48,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -100,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(0,245,160,0.25) 0%, rgba(0,245,160,0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 44 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #4CA930, #3D8C26)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderBottom: "26px solid #fff",
                display: "flex",
              }}
            />
          </div>
          <span style={{ fontSize: 30, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
            Space · Model Rocketry
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            maxWidth: 960,
          }}
        >
          A Beginner&apos;s Seven-Day Guide to Model Rocketry
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 26,
            fontWeight: 600,
            color: "#93E6A8",
          }}
        >
          Aerodynamics · Avionics · Propulsion · Recovery · Telemetry · Safety
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 22,
            fontWeight: 500,
            color: "#8FA69B",
          }}
        >
          An EV Society Educational Companion on EV.ENGINEER
        </div>
      </div>
    ),
    { ...size }
  );
}
