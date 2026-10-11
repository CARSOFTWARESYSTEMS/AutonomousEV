// Single source of truth for the aerospace.ishavasyam.org SEO copy, shared by
// layout.tsx (metadata), opengraph-image.tsx and page.tsx (JSON-LD). This host
// is presented as ISHAVASYAM.ORG only — none of it may name EV Society (see
// seo.test.ts).

export const SITE_ORIGIN = "https://aerospace.ishavasyam.org";
export const ORG_NAME = "ISHAVASYAM.ORG";
export const ORG_DESCRIPTOR = "Space Research Organisation";

export const SEO_TITLE = `${ORG_NAME} · ${ORG_DESCRIPTOR}`;
export const SEO_DESCRIPTION =
  "ISHAVASYAM.ORG Space Research Organisation — Mission 2040 for autonomous spacecraft health management, telemetry, digital twins, FDIR, prognostics and verified safe recovery.";
export const SEO_CANONICAL = `${SITE_ORIGIN}/space`;
export const OG_ALT =
  "Autonomous Spacecraft Health Mission 2040 — Health Management, FDIR, Digital Twin, Safe Recovery — ISHAVASYAM.ORG · Space Research Organisation";
export const OG_FOOTER = SEO_TITLE;
// Served by ./og-image.png/route.tsx. Absolute, no query string, ends in .png.
export const OG_IMAGE_URL = `${SITE_ORIGIN}/ishavasyam-space/og-image.png`;
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
