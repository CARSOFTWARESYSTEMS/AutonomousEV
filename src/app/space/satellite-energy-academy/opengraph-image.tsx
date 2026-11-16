import { ImageResponse } from "next/og";
export const alt = "Satellite Energy Academy — Play with Physics. Discover Mathematics. Power a Satellite.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", background: "#090b1d", color: "#fff", padding: 80 }}>
    <div style={{ display: "flex", color: "#93c5fd", fontSize: 24, marginBottom: 32 }}>EV.ENGINEER · INTERACTIVE PHYSICS & MATHEMATICS</div>
    <div style={{ display: "flex", fontSize: 72, fontWeight: 800, lineHeight: 1.1, marginBottom: 32 }}>Satellite Energy Academy</div>
    <div style={{ display: "flex", color: "#67e8f9", fontSize: 32 }}>Play with Physics. Discover Mathematics.</div>
    <div style={{ display: "flex", color: "#b5b8c9", fontSize: 28, marginTop: 18 }}>Power a Satellite. Start with Capture the Sun.</div>
  </div>, size);
}
