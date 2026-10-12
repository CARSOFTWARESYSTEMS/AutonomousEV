import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { HERO, roleLine } from "./profile";

export const alt = "Sudarshana Karkala — EV.ENGINEER™, Founder of ISHAVASYAM.ORG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The colours of the profile page, which are the colours of /space.
const BACKGROUND = "#090B1D";
const BLUE = "#93C5FD";
const TEXT = "#FFFFFF";
const SOFT = "#D5D8E6";
const MUTED = "#B5B8C9";

const NO_BREAK_SPACE = String.fromCharCode(160);
/** One line of the card: it may wrap between its parts and never inside one, and a separator never starts a line. */
const line = (parts: readonly string[], separator: string) =>
  parts.map((part) => part.replace(/ /g, NO_BREAK_SPACE)).join(`${NO_BREAK_SPACE}${separator} `);

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
          background: `radial-gradient(circle at 50% -20%, rgba(59,130,246,0.28) 0%, ${BACKGROUND} 62%)`,
        }}
      >
        <img
          src={photoSrc}
          alt=""
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid rgba(255,255,255,0.18)",
            marginRight: 56,
            flexShrink: 0,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: TEXT, letterSpacing: -2 }}>{HERO.name}</div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: BLUE, marginTop: 6 }}>{HERO.identity}</div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: TEXT, marginTop: 34 }}>{roleLine(HERO.primaryRole)}</div>
          <div style={{ display: "flex", fontSize: 23, color: MUTED, marginTop: 10 }}>{roleLine(HERO.secondaryRole)}</div>
          <div style={{ display: "flex", fontSize: 22, color: SOFT, marginTop: 34, maxWidth: 740 }}>{line(HERO.focus, "·")}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
