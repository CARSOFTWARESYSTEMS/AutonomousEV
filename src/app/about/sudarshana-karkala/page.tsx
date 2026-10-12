import FounderContent from "./FounderContent";
import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { buildProfileGraph } from "@/lib/structured-data/profileGraph";
import { LAST_REVIEWED } from "./profile";

const PAGE_TITLE = "Sudarshana Karkala | Space Systems Engineering & Digital Twins | EV.ENGINEER™";
// Research and engineering focus, named as that: the description claims no flight, operational or certification experience.
const PAGE_DESCRIPTION =
  "Sudarshana Karkala is an engineering leader and technology consultant. Research and engineering focus: Space Systems Engineering, Digital Twins, spacecraft health management (IVHM/FDIR/PHM), avionics and telemetry, aerospace cybersecurity, AI/ML and EV Battery & Energy Intelligence.";
const PAGE_URL = "https://autonomous.ev.engineer/about/sudarshana-karkala";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "Sudarshana Karkala",
    "EV.ENGINEER",
    "Director of Engineering",
    "Space Systems Engineering",
    "Satellite Engineering",
    "Spacecraft Digital Twin",
    "Digital Twin Engineering",
    "Spacecraft Health Management",
    "IVHM",
    "FDIR",
    "PHM",
    "Avionics",
    "Telemetry",
    "Aerospace Cybersecurity",
    "AI/ML Engineering",
    "CubeSat",
    "Model Rocketry",
    "EV Battery Intelligence",
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
    dateModified: LAST_REVIEWED.iso,
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
