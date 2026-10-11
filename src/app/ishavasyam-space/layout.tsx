import type { Metadata } from "next";
import {
  SITE_ORIGIN,
  ORG_NAME,
  SEO_TITLE as TITLE,
  SEO_DESCRIPTION as DESCRIPTION,
  SEO_CANONICAL as CANONICAL,
  OG_ALT,
  OG_IMAGE_URL,
  OG_IMAGE_SIZE,
} from "./seo";

// One image for Open Graph and Twitter, named explicitly: see ./og-image.png/route.tsx.
const SOCIAL_IMAGE = { url: OG_IMAGE_URL, ...OG_IMAGE_SIZE, type: "image/png", alt: OG_ALT };

// Served for aerospace.ishavasyam.org/space via a host-matched rewrite in
// next.config.ts. Every field the root and /space layouts would otherwise
// supply (metadataBase, authors, keywords, site name) is set explicitly here.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "autonomous spacecraft health management",
    "spacecraft fault detection isolation and recovery",
    "spacecraft FDIR",
    "spacecraft digital twin",
    "spacecraft telemetry simulator",
    "CubeSat health monitoring",
    "spacecraft prognostics",
    "verified safe recovery",
    "space research organisation",
  ],
  authors: [{ name: ORG_NAME }],
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

export default function IshavasyamSpaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
