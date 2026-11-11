import { renderAerospaceCard } from "../ogCard";

// The social card for /aerospace as an ordinary image file at a fixed URL that
// ends in .jpg (see ../seo.ts). A route handler rather than the opengraph-image
// file convention, which publishes an extensionless URL with a hash-only query
// string that some link-preview crawlers, LinkedIn's among them, handle less
// reliably (the same choice as /ishavasyam-space/og-image.png). JPEG, because
// the card carries a photographic render: about a fifth of the PNG's size,
// comfortably inside the limits WhatsApp and others apply to preview images.
// Rendered once at build, then served as a static file.
export const dynamic = "force-static";

export async function GET() {
  const png = Buffer.from(await (await renderAerospaceCard()).arrayBuffer());
  try {
    // sharp ships with Next.js for image optimisation.
    const { default: sharp } = await import("sharp");
    const jpeg = await sharp(png).jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
    return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": "image/jpeg" } });
  } catch {
    return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
  }
}
