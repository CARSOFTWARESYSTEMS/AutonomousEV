import FounderContent from "./FounderContent";
import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { buildProfileGraph } from "@/lib/structured-data/profileGraph";

const PAGE_TITLE = "Sudarshana Karkala | EV.ENGINEER™ | EV, Battery & Space Research";
const PAGE_DESCRIPTION =
  "Sudarshana Karkala, EV.ENGINEER™, works across EV engineering, battery intelligence, cybersecurity, space research and CanSat model rocketry.";
const PAGE_URL = "https://autonomous.ev.engineer/about/sudarshana-karkala";
const LAST_REVIEWED = "2026-09-23";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "Sudarshana Karkala",
    "EV.ENGINEER",
    "EV battery intelligence",
    "electric vehicle engineering",
    "automotive cybersecurity",
    "space research",
    "CanSat model rocketry",
    "National Institute of Technology Karnataka",
    "IIT Madras",
    "IN-SPACe",
  ],
  alternates: {
    canonical: PAGE_URL,
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
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    type: "profile",
    siteName: "EV.ENGINEER",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const profileGraph = {
  "@context": "https://schema.org",
  "@graph": buildProfileGraph({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    dateModified: LAST_REVIEWED,
  }),
};

export default function FounderPage() {
  return (
    <>
      <JsonLd data={profileGraph} />
      <FounderContent />
    </>
  );
}
