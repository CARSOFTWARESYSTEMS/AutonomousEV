import ProfileContent from "./ProfileContent";
import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { buildProfileGraph } from "@/lib/structured-data/profileGraph";
import { LAST_REVIEWED } from "./profile";

// The title names the person, then what he works on, then the engineering identity, as the site's titles do.
const PAGE_TITLE = "Sudarshana Karkala | Space, Digital Twins & Cybersecurity | EV.ENGINEER™";
// One sentence, saying what the page says: the identity, the initiative he founded, the leadership and consulting, and what he works on.
// "Consultant" is what he does, not a title at any one organisation.
const PAGE_DESCRIPTION =
  "Sudarshana Karkala — EV.ENGINEER™, Founder of ISHAVASYAM.ORG, engineering leader and consultant across Space research, Digital Twins, Cybersecurity, EV and energy systems.";
// One address for the profile on every host that serves it. Deliberately unchanged by the redesign.
const PAGE_URL = "https://autonomous.ev.engineer/about/sudarshana-karkala";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "Sudarshana Karkala",
    "EV.ENGINEER",
    "ISHAVASYAM.ORG",
    "Engineering Leadership",
    "Systems Architecture",
    "Space Station Research",
    "Satellite Engineering",
    "Spacecraft Digital Twin",
    "Aerospace Cybersecurity",
    "EV Battery Intelligence",
    "GenAI for Engineering",
    "Engineering Consulting",
    "EV Society",
    "NITK Surathkal Alumni Association",
    "Student Mentorship",
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
    firstName: "Sudarshana",
    lastName: "Karkala",
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

export default function ProfilePage() {
  return (
    <>
      <JsonLd data={profileGraph} />
      <ProfileContent />
    </>
  );
}
