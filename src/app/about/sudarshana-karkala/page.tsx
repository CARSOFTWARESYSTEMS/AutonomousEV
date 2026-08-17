import FounderContent from "./FounderContent";
import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { buildProfileGraph } from "@/lib/structured-data/profileGraph";

const PAGE_TITLE = "Sudarshana Karkala | Profile, Projects and Contact | EV.ENGINEER™";
const PAGE_DESCRIPTION =
  "Public professional profile of Sudarshana Karkala: verified role, focus areas, initiatives and contact channels. Founder of EV.ENGINEER, Co-Founder of Thasmai Infotech Private Limited.";
const PAGE_URL = "https://autonomous.ev.engineer/about/sudarshana-karkala";
const LAST_REVIEWED = "2026-08-17";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
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
    card: "summary",
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
