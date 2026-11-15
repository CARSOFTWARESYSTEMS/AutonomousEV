import { SITEMAP_XML } from "../host-files";

// aerospace.stellrspace.com/sitemap.xml (see ../host-files.ts).
export const dynamic = "force-static";

export function GET() {
  return new Response(SITEMAP_XML, { headers: { "Content-Type": "application/xml" } });
}
