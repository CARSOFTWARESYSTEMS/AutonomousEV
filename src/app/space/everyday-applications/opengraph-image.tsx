import { renderEverydayApplicationsCard } from "./og-card";
export const alt = "Space Applications for Everyday India · ISHAVASYAM.ORG, UFlight & EV.ENGINEER";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return renderEverydayApplicationsCard("ISHAVASYAM.ORG · SPACE LEARNING LAB");
}
