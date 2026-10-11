import { renderSpaceOgImage } from "../../space/ogCard";
import { OG_FOOTER } from "../seo";

// The social card for aerospace.ishavasyam.org/space, as a plain PNG at a fixed
// URL that ends in .png. It is a route handler rather than the opengraph-image
// file convention because that convention publishes the image at an
// extensionless URL with a hash-only query string (…/opengraph-image?68bb…),
// which some link-preview crawlers, LinkedIn's among them, handle less reliably
// than an ordinary image file. Rendered once at build, then served as a static
// file with a Content-Length.
export const dynamic = "force-static";

export function GET() {
  return renderSpaceOgImage(OG_FOOTER);
}
