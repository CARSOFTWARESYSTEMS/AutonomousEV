import { ImageResponse } from "next/og";

// Shared 1200x630 card for /space's Open Graph / Twitter image. The footer line
// is a parameter so each host's route can attribute the page to its own brand.
export const OG_SIZE = { width: 1200, height: 630 };

export function renderSpaceOgImage(footer: string) {
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
          background: "linear-gradient(135deg, #0A0C1C 0%, #0F1230 55%, #090B1D 100%)",
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
            background: "radial-gradient(circle, rgba(124,58,237,0.55) 0%, rgba(124,58,237,0) 70%)",
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
            background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(6,182,212,0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 44 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 9999,
                border: "3px solid #fff",
                display: "flex",
              }}
            />
          </div>
          <span style={{ fontSize: 30, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
            Space
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            maxWidth: 920,
          }}
        >
          Autonomous Spacecraft Health Mission 2040
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 28,
            fontWeight: 600,
            color: "#93C5FD",
          }}
        >
          Health Management · FDIR · Digital Twin · Safe Recovery
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 22,
            fontWeight: 500,
            color: "#8B8FA3",
          }}
        >
          {footer}
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
