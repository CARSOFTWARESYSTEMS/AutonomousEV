import type { Metadata } from "next";
import RocketryContent from "./RocketryContent";
import { SEO_TITLE, SEO_DESCRIPTION, SEO_CANONICAL } from "./seo";

export const metadata: Metadata = {
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: [
    "model rocketry",
    "IN-SPACe model rocketry workshop",
    "model rocket avionics",
    "model rocket aerodynamics",
    "model rocket recovery systems",
    "rocket telemetry",
    "rocket simulation RASAero",
    "CAN-7USAT India Student Competition",
    "model rocket launch checklist",
    "EV.ENGINEER",
    "EV Society",
  ],
  authors: [{ name: "EV Society" }],
  creator: "EV Society",
  publisher: "EV Society",
  alternates: {
    canonical: SEO_CANONICAL,
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
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    url: SEO_CANONICAL,
    type: "article",
    locale: "en_US",
    siteName: "EV.ENGINEER",
    // og:image, og:image:alt, og:image:width/height are generated automatically
    // from ./opengraph-image.tsx (Next.js file-based metadata convention).
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    // twitter:image / twitter:image:alt are generated automatically from the
    // same ./opengraph-image.tsx, shared across Open Graph and Twitter Card.
  },
};

export default function ModelRocketryPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <RocketryContent />
    </div>
  );
}
