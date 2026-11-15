// robots.txt and sitemap.xml for aerospace.stellrspace.com, served there by
// host-matched rewrites in next.config.ts (./robots.txt/route.ts and
// ./sitemap.xml/route.ts). Same crawler rules as the site's own robots.txt
// (../robots.ts), but the sitemap is this host's and lists the pages it
// presents as STELLR SPACE's: every Space page it serves from its own copy.
import { STELLR_SPACE } from "@/data/space-host-brands";
import { SITE_ORIGIN, DATE_MODIFIED } from "./seo";

/** The host's own Space pages, as the sitemap lists them. */
export const SITEMAP_PATHS = STELLR_SPACE.paths;

export const ROBOTS_TXT = [
  "User-Agent: *",
  "Allow: /",
  "",
  ...["Googlebot", "Bingbot", "OAI-SearchBot", "PerplexityBot"].flatMap((agent) => [`User-Agent: ${agent}`, "Allow: /", ""]),
  `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
  "",
].join("\n");

export const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAP_PATHS.map(
  (path) => `<url>
<loc>${SITE_ORIGIN}${path}</loc>
<lastmod>${DATE_MODIFIED}</lastmod>
<changefreq>monthly</changefreq>
<priority>${path === "/space" ? "1" : "0.8"}</priority>
</url>`,
).join("\n")}
</urlset>
`;
