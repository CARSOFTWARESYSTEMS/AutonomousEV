import { renderSpaceOgImage } from "../ogCard";

export const alt = "Space Academy for ages 14–18: seven tracks and interactive 3D missions. An ISHAVASYAM.ORG Initiative on EV.ENGINEER";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return renderSpaceOgImage("An ISHAVASYAM.ORG Initiative on EV.ENGINEER", "Space Academy · Ages 14–18", "Seven tracks · Interactive 3D missions · CanSat · Model Rocketry");
}
