import { renderSpaceOgImage } from "../space/ogCard";
import { OG_ALT, OG_FOOTER } from "./seo";

export const alt = OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return renderSpaceOgImage(OG_FOOTER);
}
