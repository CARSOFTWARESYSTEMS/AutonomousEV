import { renderSpaceOgImage } from "../../space/ogCard";
import { OG_BRAND, OG_FOOTER } from "../seo";

// The social card for aerospace.stellrspace.com/space, as a plain PNG at a
// fixed URL that ends in .png (see ../../ishavasyam-space/og-image.png/route.tsx
// for why this is a route handler rather than the opengraph-image convention).
// Rendered once at build, then served as a static file.
export const dynamic = "force-static";

export function GET() {
  return renderSpaceOgImage(OG_FOOTER, undefined, undefined, OG_BRAND);
}
