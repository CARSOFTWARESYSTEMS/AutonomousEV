import { renderSpaceOgImage } from "./ogCard";

export const alt =
  "Autonomous Spacecraft Health Mission 2040 — Health Management, FDIR, Digital Twin, Safe Recovery — an ISHAVASYAM.ORG Initiative on EV.ENGINEER";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return renderSpaceOgImage("An ISHAVASYAM.ORG Initiative on EV.ENGINEER");
}
