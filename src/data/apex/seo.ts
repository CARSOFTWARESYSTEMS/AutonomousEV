/**
 * Metadata and structured data for every APEX page, from one table.
 *
 * Every field the /space layout sets (title, authors, creator, publisher,
 * keywords, Open Graph, Twitter, canonical) is set again here, because
 * metadata merges shallowly and anything left unset would be inherited.
 */
import type { Metadata } from "next";
import { APEX_CONCEPT_HOST, APEX_OFFICIAL_SITE_URL, APEX_PARENT_PORTAL, APEX_SITE, APEX_SITE_URL, apexUrl } from "./site";
import { APEX_LOGO } from "./images";
import { FOUNDERS } from "./founders";
import { evidence } from "./evidence";

export type ApexPageId = "home" | "engine" | "system" | "build-validate" | "digital-twin" | "roadmap" | "ecosystem" | "company";

type PageSeo = {
  path: string;
  /** Breadcrumb name. */
  name: string;
  title: string;
  description: string;
  schemaType: "WebPage" | "TechArticle" | "AboutPage" | "CollectionPage";
  keywords: string[];
};

export const APEX_PUBLISHED = "2026-10-19";
export const APEX_MODIFIED = "2026-10-19";

export const APEX_PAGES: Record<ApexPageId, PageSeo> = {
  home: {
    path: "/",
    name: "APEX Rocket Systems",
    title: "APEX Rocket Systems — From Propulsion Hardware Toward Validated Rocket Systems",
    description:
      "APEX Rocket Systems has built a 5 kN-class gas-generator-cycle liquid-engine demonstrator. A concept experience from the engineering collaboration between APEX Rocket Systems and Gamyaa AeroSystems, on progressing from propulsion hardware toward a validated, integrated launch system.",
    schemaType: "WebPage",
    keywords: ["APEX Rocket Systems", "liquid rocket engine demonstrator", "5 kN-class engine", "gas-generator cycle", "launch vehicle development", "rocket system validation"],
  },
  engine: {
    path: "/engine",
    name: "Engine",
    title: "5 kN-Class Liquid Engine Demonstrator | APEX Rocket Systems",
    description:
      "The APEX 5 kN-class gas-generator-cycle liquid-engine demonstrator: its published architecture, APEX's manufacturing-led approach, and the engineering path from requirement to verified engine.",
    schemaType: "TechArticle",
    keywords: ["5 kN-class liquid engine", "gas-generator cycle engine", "regenerative cooling", "engine functional architecture", "APEX engine demonstrator"],
  },
  system: {
    path: "/system",
    name: "System",
    title: "The Rocket as a System of Systems | APEX Rocket Systems",
    description:
      "Eighteen domains of an integrated rocket system — propulsion, structures, avionics, embedded systems, GNC, software, quality, cybersecurity, digital engineering and testing — their interfaces, evidence and where APEX holds authority.",
    schemaType: "TechArticle",
    keywords: ["rocket system architecture", "system of systems", "interface matrix", "review gates", "launch vehicle subsystems"],
  },
  "build-validate": {
    path: "/build-validate",
    name: "Build & Validate",
    title: "From Mission to Flight: Build & Validate | APEX Rocket Systems",
    description:
      "One continuous lifecycle from mission need to flight and back: engineer, build, prove and improve — with progressive testing, hardware-in-the-loop and a digital quality thread.",
    schemaType: "TechArticle",
    keywords: ["rocket development lifecycle", "test confidence ladder", "hardware-in-the-loop", "digital quality thread", "verification and validation"],
  },
  "digital-twin": {
    path: "/digital-twin",
    name: "Digital Twin",
    title: "Digital Twin + Physical Testing | APEX Rocket Systems",
    description:
      "How a configuration-aware Digital Twin increases the value of physical testing: prediction, instrumentation, predicted-versus-measured correlation and model updates — never a replacement for testing.",
    schemaType: "TechArticle",
    keywords: ["rocket engine digital twin", "predicted vs measured", "model correlation", "instrumentation", "engineering test data"],
  },
  roadmap: {
    path: "/roadmap",
    name: "Roadmap",
    title: "Roadmap & Investor View | APEX Rocket Systems",
    description:
      "What APEX has built, what is active, what is planned and what is proposed — with an investor view of evidence maturity, capability gaps, partner coverage and capital-intensive areas.",
    schemaType: "WebPage",
    keywords: ["APEX roadmap", "rocket startup investor view", "evidence maturity", "capability gaps"],
  },
  ecosystem: {
    path: "/ecosystem",
    name: "Ecosystem",
    title: "Engineering Ecosystem — No Rocket Company Builds Everything Alone | APEX Rocket Systems",
    description:
      "A many-to-many map of the specialist capabilities an integrated rocket program needs, who contributes to each, and the open capabilities where new partners can contribute.",
    schemaType: "CollectionPage",
    keywords: ["aerospace partner ecosystem", "rocket supply chain", "embedded systems partner", "test laboratory partner", "aerospace capability map"],
  },
  company: {
    path: "/company",
    name: "Company",
    title: "Company, Founders & Collaboration | APEX Rocket Systems",
    description:
      "APEX Rocket Systems — founders Vibbhav Gopaal and Arcchit Gopaal — and how to discuss engineering collaboration, manufacturing, testing, research, investment or talent.",
    schemaType: "AboutPage",
    keywords: ["APEX Rocket Systems founders", "Vibbhav Gopaal", "Arcchit Gopaal", "rocket startup collaboration"],
  },
};

const SOCIAL_IMAGE_ALT = "APEX Rocket Systems — Engineered to ascend. APEX propulsion development hardware.";

export function apexMetadata(page: ApexPageId): Metadata {
  const seo = APEX_PAGES[page];
  const url = apexUrl(seo.path);
  const image = { url: APEX_LOGO.socialCard.url, width: APEX_LOGO.socialCard.width, height: APEX_LOGO.socialCard.height, alt: SOCIAL_IMAGE_ALT };
  return {
    metadataBase: new URL(APEX_SITE_URL),
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords,
    applicationName: APEX_SITE.name,
    authors: [{ name: APEX_CONCEPT_HOST.name, url: APEX_CONCEPT_HOST.url }],
    creator: APEX_CONCEPT_HOST.name,
    publisher: APEX_CONCEPT_HOST.name,
    category: "Aerospace engineering",
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: {
      type: seo.schemaType === "TechArticle" ? "article" : "website",
      url,
      title: seo.title,
      description: seo.description,
      siteName: APEX_SITE.name,
      locale: "en_IN",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [image],
    },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

const ORG_ID = `${APEX_OFFICIAL_SITE_URL}#organization`;
const WEBSITE_ID = `${apexUrl("/")}#website`;

function absolute(path: string): string {
  return path.startsWith("http") ? path : `${APEX_SITE_URL}${path}`;
}

export function apexJsonLd(page: ApexPageId): object {
  const seo = APEX_PAGES[page];
  const url = apexUrl(seo.path);

  const founders = FOUNDERS.map((founder) => ({
    "@type": "Person",
    "@id": `${apexUrl("/company")}#${founder.id}`,
    name: founder.name,
    jobTitle: founder.title,
    worksFor: { "@id": ORG_ID },
    ...(founder.linkedin ? { sameAs: [founder.linkedin] } : {}),
  }));

  const organization = {
    "@type": "Organization",
    "@id": ORG_ID,
    name: APEX_SITE.name,
    url: APEX_OFFICIAL_SITE_URL,
    logo: absolute(APEX_LOGO.black.png),
    description: evidence("company-focus").approvedWording,
    founder: founders.map((founder) => ({ "@id": founder["@id"] })),
    sameAs: [APEX_OFFICIAL_SITE_URL],
    knowsAbout: ["Liquid rocket propulsion", "Launch vehicle development", "Gas-generator-cycle engines", "Manufacturing-led hardware development"],
  };

  const host = { "@type": "Organization", name: APEX_CONCEPT_HOST.name, url: APEX_CONCEPT_HOST.url };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "APEX Rocket Systems — Engineering & Validation Ecosystem",
    url: apexUrl("/"),
    about: { "@id": ORG_ID },
    publisher: host,
    inLanguage: "en",
  };

  const crumbs = [
    ...(APEX_PARENT_PORTAL ? [{ name: APEX_PARENT_PORTAL.name, url: APEX_PARENT_PORTAL.url }] : []),
    { name: APEX_PAGES.home.name, url: apexUrl("/") },
    ...(page === "home" ? [] : [{ name: seo.name, url }]),
  ];

  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: crumb.url })),
  };

  const image = absolute(APEX_LOGO.socialCard.url);
  const pageNode = {
    "@type": seo.schemaType,
    "@id": `${url}#webpage`,
    url,
    name: seo.title,
    ...(seo.schemaType === "TechArticle" ? { headline: seo.title, author: host, publisher: host, datePublished: APEX_PUBLISHED, dateModified: APEX_MODIFIED } : {}),
    description: seo.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    primaryImageOfPage: { "@type": "ImageObject", url: image, width: APEX_LOGO.socialCard.width, height: APEX_LOGO.socialCard.height },
    inLanguage: "en",
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, ...founders, website, pageNode, breadcrumb],
  };
}
