import type { Metadata } from "next";
import { SEO_TITLE as TITLE, SEO_DESCRIPTION as DESCRIPTION, SEO_CANONICAL as CANONICAL } from "./seo";

export const metadata: Metadata = {
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
  ],
  authors: [{ name: "EV Society" }],
  creator: "EV Society",
  publisher: "EV Society",
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
    siteName: "EV.ENGINEER",
    // og:image, og:image:alt, og:image:width/height are generated automatically
    // from ./opengraph-image.tsx (Next.js file-based metadata convention).
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    // twitter:image / twitter:image:alt are generated automatically from the
    // same ./opengraph-image.tsx, shared across Open Graph and Twitter Card.
  },
};

export default function SpaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
