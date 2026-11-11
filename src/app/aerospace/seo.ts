import type { Metadata } from "next";

// Search and social metadata for the Aerospace page. Server-rendered from the
// route's layout (never set on the client), with absolute URLs throughout so
// share crawlers on LinkedIn, WhatsApp, X, Facebook, Teams and Slack resolve
// every tag without guessing a host.
//
// Canonical strategy: one public address per branded variant.
// - The EV.ENGINEER page is canonical at aerospace.ev.engineer/aerospace,
//   whichever host serves it (autonomous.ev.engineer/aerospace,
//   cybersecurity.uflight.in → /aerospace, aerospace.ev.engineer/ → /aerospace).
// - The Gamyaa.in variant (aerospace.gamyaa.in/aerospace, served from
//   /gamyaa-aerospace) keeps its own address, so its shares open on its own host.
// Both use the same image, served from the canonical host as a plain .jpg.

export const ORIGIN = "https://aerospace.ev.engineer";
export const CANONICAL = `${ORIGIN}/aerospace`;
export const GAMYAA_CANONICAL = "https://aerospace.gamyaa.in/aerospace";

export const TITLE = "Aerospace Cybersecurity";
export const DESCRIPTION =
  "Learn aerospace cybersecurity for aircraft, drones, satellites and mission-critical systems: avionics and satellite security, threat modelling and hands-on labs.";
export const SUBTITLE = "Protecting Aircraft, Satellites and Mission-Critical Systems";

/** Served by ./og-image.jpg/route.tsx: 1200 × 630, absolute, no query string, ends in .jpg. */
export const OG_IMAGE = `${CANONICAL}/og-image.jpg`;
export const OG_ALT = "Aerospace Cybersecurity: protecting aircraft, satellites and mission-critical systems. A satellite in orbit above Earth inside a cyan security ring.";

export const KEYWORDS = [
  "aerospace cybersecurity",
  "aircraft cybersecurity",
  "aviation cybersecurity",
  "avionics security",
  "satellite security",
  "space cybersecurity",
  "drone security",
  "UAV security",
  "ADS-B security",
  "GNSS spoofing detection",
  "ARINC protocol security",
  "embedded systems security",
  "secure OTA updates",
  "threat modeling",
  "mission-critical systems security",
];

export function aerospaceMetadata(url: string): Metadata {
  return {
    metadataBase: new URL(ORIGIN),
    title: TITLE,
    description: DESCRIPTION,
    keywords: KEYWORDS,
    authors: [{ name: "EV.ENGINEER" }],
    creator: "EV.ENGINEER",
    alternates: { canonical: url },
    // Unchanged: the Aerospace page is still kept out of search indexes (social previews do not depend on this).
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      url,
      siteName: "EV.ENGINEER",
      locale: "en_US",
      title: TITLE,
      description: DESCRIPTION,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT, type: "image/jpeg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT, type: "image/jpeg" }],
    },
  };
}
