import FounderContent from "./FounderContent";
import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { buildProfileGraph } from "@/lib/structured-data/profileGraph";

const PAGE_TITLE = "Sudarshana Karkala | Space Systems, Avionics & EV Battery | EV.ENGINEER™";
const PAGE_DESCRIPTION =
  "Sudarshana Karkala is an engineering leader and technology consultant focused on Space Systems & Applications, Avionics & Telemetry, EV Battery & Energy Intelligence, AI and Cybersecurity.";
const PAGE_URL = "https://autonomous.ev.engineer/about/sudarshana-karkala";
const LAST_REVIEWED = "2026-09-23";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "Sudarshana Karkala",
    "EV.ENGINEER",
    "Director of Engineering",
    "Space Systems",
    "Space Applications",
    "Avionics",
    "Telemetry",
    "EV Battery Technology",
    "Energy Intelligence",
    "CanSat Model Rocketry",
    "Aerospace Cybersecurity",
    "Digital Twin",
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
