import type { Metadata } from "next";
import {
  SITE_ORIGIN,
  ORG_NAME,
  SEO_TITLE as TITLE,
  SEO_DESCRIPTION as DESCRIPTION,
  SEO_CANONICAL as CANONICAL,
  SEO_KEYWORDS,
  OG_ALT,
  OG_IMAGE_URL,
  OG_IMAGE_SIZE,
} from "./seo";

// One image for Open Graph and Twitter, named explicitly: see ./og-image.png/route.tsx.
const SOCIAL_IMAGE = { url: OG_IMAGE_URL, ...OG_IMAGE_SIZE, type: "image/png", alt: OG_ALT };

// The metadata of aerospace.stellrspace.com/space (served from ./pages.tsx).
// Every field the root layout would otherwise supply (metadataBase, authors,
// keywords, site name) is set explicitly, so nothing from EV.ENGINEER or
// ISHAVASYAM.ORG reaches this host's head. A page's metadata, not a layout's:
// the host's other pages must not inherit /space's canonical address.
export const SPACE_METADATA: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: TITLE,
  description: DESCRIPTION,
  keywords: SEO_KEYWORDS,
  applicationName: ORG_NAME,
  authors: [{ name: ORG_NAME, url: CANONICAL }],
  creator: ORG_NAME,
  publisher: ORG_NAME,
  alternates: {
    canonical: CANONICAL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "website",
    locale: "en_US",
    siteName: ORG_NAME,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
};
