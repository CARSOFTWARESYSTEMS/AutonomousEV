import type { Metadata, Viewport } from "next";
import { FAQ } from "./data/faq";
import { LAST_REVIEWED } from "./data/sources";
import { PERSON_ID, ITELEMATICS_ID, itelematicsOrgNode } from "@/lib/structured-data/entities";
import { SUDARSHANA_KARKALA } from "@/data/public-entities";
import { ISHAVASYAM, ORGANISATION_LINE } from "./data/organisations";

export const CANONICAL = "https://aerospace.ev.engineer/space/space-station";
export const TITLE = "Space Station Research & Engineering Simulator | Space Systems";
export const DESCRIPTION =
  "Explore an interactive space-station engineering and research simulator covering Bharatiya Antariksh Station, ISS, Gateway, microgravity science, life support, power, docking, robotics and future orbital laboratories.";
export const DATE_PUBLISHED = "2026-09-25";
const OG_IMAGE = `${CANONICAL}/opengraph-image`;
const OG_ALT = "Space Station Research & Engineering Simulator — generic modular research station orbiting Earth";

// Every authorship/branding field inherited from the /space layout is
// overridden here so this page carries only the attribution it states itself.
// viewport-fit=cover lets env(safe-area-inset-*) keep overlays and the bottom
// navigation clear of the iPhone home indicator and rounded corners.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  metadataBase: new URL("https://aerospace.ev.engineer"),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Bharatiya Antariksh Station",
    "BAS-01",
    "Indian space station",
    "ISRO space station",
    "space station engineering",
    "space station research",
    "microgravity research",
    "ISS research",
    "Gateway lunar station",
    "ECLSS life support",
    "space station docking",
    "space robotics",
    "orbital laboratory",
    "postdoctoral space research",
  ],
  authors: [{ name: "Sudarshana Karkala", url: "https://autonomous.ev.engineer/about/sudarshana-karkala" }],
  creator: "Sudarshana Karkala",
  publisher: ISHAVASYAM.name,
  alternates: { canonical: CANONICAL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "website",
    locale: "en_US",
    siteName: ORGANISATION_LINE,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, alt: OG_ALT }],
  },
};

const ISRO_ORG = { "@type": "Organization", "@id": "https://www.isro.gov.in/#organization", name: "Indian Space Research Organisation", alternateName: "ISRO", url: "https://www.isro.gov.in/" };
const ISHAVASYAM_ORG = { "@type": "Organization", "@id": `${ISHAVASYAM.url}#organization`, name: ISHAVASYAM.name, description: ISHAVASYAM.descriptor, url: ISHAVASYAM.url };
// Person node limited to name, profile URL and verified profiles for this page.
const PERSON_NODE = { "@type": "Person", "@id": PERSON_ID, name: SUDARSHANA_KARKALA.name, url: SUDARSHANA_KARKALA.canonicalUrl, sameAs: SUDARSHANA_KARKALA.sameAs };
const NASA_ORG = { "@type": "Organization", "@id": "https://www.nasa.gov/#organization", name: "National Aeronautics and Space Administration", alternateName: "NASA", url: "https://www.nasa.gov/" };

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    ISHAVASYAM_ORG,
    itelematicsOrgNode(),
    PERSON_NODE,
    ISRO_ORG,
    NASA_ORG,
    {
      "@type": "WebPage",
      "@id": `${CANONICAL}#webpage`,
      url: CANONICAL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en",
      datePublished: DATE_PUBLISHED,
      dateModified: LAST_REVIEWED,
      author: { "@id": PERSON_ID },
      publisher: { "@id": ISHAVASYAM_ORG["@id"] },
      breadcrumb: { "@id": `${CANONICAL}#breadcrumb` },
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE, caption: OG_ALT },
      about: [
        { "@type": "Thing", name: "Space station" },
        { "@type": "Thing", name: "Bharatiya Antariksh Station" },
        { "@type": "Thing", name: "International Space Station" },
        { "@type": "Thing", name: "Microgravity research" },
      ],
      mentions: [{ "@id": ISRO_ORG["@id"] }, { "@id": NASA_ORG["@id"] }, { "@id": ITELEMATICS_ID }],
      mainEntity: { "@id": `${CANONICAL}#learning` },
    },
    {
      "@type": "LearningResource",
      "@id": `${CANONICAL}#learning`,
      name: "Space Station Research & Engineering Simulator",
      url: CANONICAL,
      description:
        "Interactive educational simulators and research guides on space-station architecture, power, orbit, docking, life support, thermal control, digital twins and microgravity research. Educational models — not mission design data.",
      learningResourceType: ["Simulation", "Interactive resource", "Reference"],
      educationalLevel: ["Beginner", "Undergraduate", "Graduate", "Postdoctoral"],
      audience: { "@type": "EducationalAudience", educationalRole: ["student", "teacher", "researcher"] },
      teaches: [
        "Space station subsystems and architecture",
        "Orbital mechanics of low Earth orbit",
        "Spacecraft electrical power and battery state of charge",
        "Environmental control and life support (ECLSS)",
        "Spacecraft thermal control and radiators",
        "Rendezvous and docking",
        "Microgravity experiment design",
      ],
      inLanguage: "en",
      isAccessibleForFree: true,
      author: { "@id": PERSON_ID },
      isPartOf: { "@id": `${CANONICAL}#webpage` },
      dateModified: LAST_REVIEWED,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Space", item: "https://aerospace.ev.engineer/space" },
        { "@type": "ListItem", position: 2, name: "Simulations & R&D Projects", item: "https://aerospace.ev.engineer/space#simulations" },
        { "@type": "ListItem", position: 3, name: "Space Station", item: CANONICAL },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${CANONICAL}#faq`,
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};
