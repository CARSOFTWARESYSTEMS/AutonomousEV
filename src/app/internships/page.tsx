import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { buildInternshipsGraph } from "@/lib/structured-data/internshipsGraph";

const PAGE_TITLE = "Engineering Internships & R&D — EV, AI, Aerospace & Space | EV.ENGINEER™";
const PAGE_DESCRIPTION =
  "Hands-on engineering internships and R&D projects across EV batteries, autonomous systems, AI, aerospace, space systems, cybersecurity, model rocketry and advanced manufacturing.";
const PAGE_URL = "https://autonomous.ev.engineer/internships";
const LAST_REVIEWED = "2026-10-06";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'EV Internships', 'AV Internships', 'Autonomous Vehicles Internship',
    'Electric Vehicle Research', 'Battery Diagnostics Internship',
    'Air Taxi (eVTOL) Internships', 'Super-Intelligent AI EMS',
    'EV Engineering Internships', 'EV Repair Workshop Internships',
    'AICTE Internships', 'VTU Internships in EV',
    'IN-SPACe Model Rocketry', 'Aerospace Engineering Internship',
    'Rocket Telemetry', 'Rocket Avionics', 'Student Rocket Competition',
    'Model Rocketry India', 'Flight Software Engineering', 'Aerospace Systems Engineering'
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
    type: "website",
    siteName: "EV.ENGINEER",
  },
  twitter: {
    card: "summary",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const internshipsGraph = {
  "@context": "https://schema.org",
  "@graph": buildInternshipsGraph({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    dateModified: LAST_REVIEWED,
  }),
};

import InternshipsClient from "./InternshipsClient";

export default function InternshipsPage() {
  return (
    <>
      <JsonLd data={internshipsGraph} />
      <InternshipsClient />
    </>
  );
}
