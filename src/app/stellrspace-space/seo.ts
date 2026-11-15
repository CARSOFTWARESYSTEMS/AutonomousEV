// Single source of truth for the aerospace.stellrspace.com/space SEO copy,
// shared by space-metadata.ts (metadata), og-image.png/route.tsx and pages.tsx
// (JSON-LD). This host is presented as STELLR SPACE only: none of it may name
// ISHAVASYAM.ORG or EV Society (see seo.test.ts).
import { STELLR_SPACE } from "@/data/space-host-brands";

export const SITE_ORIGIN = STELLR_SPACE.origin;
export const ORG_NAME = STELLR_SPACE.name;
export const ORG_DESCRIPTOR = STELLR_SPACE.descriptor;

export const SEO_TITLE = `Spacecraft Health Management Mission 2040 | ${ORG_NAME}`;
export const SEO_DESCRIPTION = `Explore ${ORG_NAME}'s Mission 2040 for autonomous spacecraft health management, telemetry, digital twins, FDIR, prognostics and verified safe recovery.`;
export const SEO_CANONICAL = `${SITE_ORIGIN}/space`;
export const SEO_KEYWORDS = [
  ORG_NAME,
  "autonomous spacecraft health management",
  "spacecraft fault detection isolation and recovery",
  "spacecraft FDIR",
  "spacecraft digital twin",
  "spacecraft telemetry simulator",
  "CubeSat health monitoring",
  "spacecraft prognostics",
  "verified safe recovery",
  "space education",
];
export const OG_ALT = `Autonomous Spacecraft Health Mission 2040 — Health Management, FDIR, Digital Twin, Safe Recovery — ${ORG_NAME}`;
/** The social card's own lines: the brand beside the orbit badge, and the host's address beneath. */
export const OG_BRAND = ORG_NAME;
export const OG_FOOTER = "aerospace.stellrspace.com/space";
// Served by ./og-image.png/route.tsx. Absolute, no query string, ends in .png.
export const OG_IMAGE_URL = `${SITE_ORIGIN}/stellrspace-space/og-image.png`;
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const DATE_PUBLISHED = "2026-08-14";
export const DATE_MODIFIED = "2026-11-15";
