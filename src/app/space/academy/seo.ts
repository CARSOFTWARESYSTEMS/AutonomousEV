// Metadata and structured data for /space/academy and its pages. One place,
// so titles, canonicals and the JSON-LD graph never drift apart.
//
// Course nodes describe what the track teaches. They carry no
// hasCourseInstance or offers: classes and workshops are planned, and nothing
// here may imply that a dated, priced course exists.
import type { Metadata } from "next";
import {
  WEBSITE_ID,
  ISHAVASYAM_ID,
  EV_ENGINEER_BRAND_ID,
  websiteNode,
  ishavasyamOrgNode,
  evEngineerBrandNode,
  itelematicsOrgNode,
} from "@/lib/structured-data/entities";
import { SPACE_INITIATIVE } from "@/data/space-initiative";
import { LEVELS, TRACKS, type Track } from "./data/curriculum";
import { MISSIONS, missionHref, type MissionMeta } from "./data/missions";

export const ORIGIN = "https://aerospace.ev.engineer";
export const ACADEMY_PATH = "/space/academy";
export const ACADEMY_URL = `${ORIGIN}${ACADEMY_PATH}`;
export const ACADEMY_TITLE = "Space Academy for Ages 14–18 | Interactive Space Education | ISHAVASYAM.ORG";
export const ACADEMY_DESCRIPTION =
  "Space education for ages 14–18: seven tracks from spacecraft systems to CanSat and model rocketry, interactive 3D missions, and planned online classes and workshops.";
export const LAST_REVIEWED = "2026-11-10";

const robots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
};

function pageMetadata({ title, description, path, keywords }: { title: string; description: string; path: string; keywords: string[] }): Metadata {
  const url = `${ORIGIN}${path}`;
  return {
    metadataBase: new URL(ORIGIN),
    title,
    description,
    keywords,
    authors: [{ name: SPACE_INITIATIVE.brand }],
    creator: SPACE_INITIATIVE.brand,
    publisher: SPACE_INITIATIVE.brand,
    alternates: { canonical: url },
    robots,
    openGraph: { title, description, url, type: "website", locale: "en_US", siteName: "EV.ENGINEER", images: [{ url: `${ACADEMY_URL}/opengraph-image`, width: 1200, height: 630, alt: "Space Academy · Ages 14–18 · an ISHAVASYAM.ORG initiative" }] },
    twitter: { card: "summary_large_image", title, description, images: [`${ACADEMY_URL}/opengraph-image`] },
  };
}

export const academyMetadata: Metadata = pageMetadata({
  title: ACADEMY_TITLE,
  description: ACADEMY_DESCRIPTION,
  path: ACADEMY_PATH,
  keywords: ["space education for students", "space academy ages 14-18", "CubeSat for students", "CanSat workshop", "model rocketry workshop", "satellite engineering for school students", "interactive 3D space lessons"],
});

export const trackTitle = (t: Track) => `${t.title} Track · Space Academy (Ages 14–18) | ISHAVASYAM.ORG`;
export const trackDescription = (t: Track) => `${t.summary} Curriculum for ages 14–16 and 17–18: objectives, modules, physics, activities and challenges.`.slice(0, 300);

export function trackMetadata(t: Track): Metadata {
  return pageMetadata({ title: trackTitle(t), description: trackDescription(t), path: `${ACADEMY_PATH}/${t.slug}`, keywords: [t.title.toLowerCase(), `${t.title.toLowerCase()} for students`, "space academy", "ages 14-18"] });
}

export const missionTitle = (m: MissionMeta) => `${m.title}: Interactive 3D Mission · Space Academy | ISHAVASYAM.ORG`;

export function missionMetadata(m: MissionMeta): Metadata {
  return pageMetadata({ title: missionTitle(m), description: m.summary, path: missionHref(m.slug), keywords: [m.title.toLowerCase(), ...m.concepts.map((c) => c.toLowerCase()), "interactive 3D lesson"] });
}

const baseNodes = () => [websiteNode(), evEngineerBrandNode(), itelematicsOrgNode(), ishavasyamOrgNode()];

const audience = { "@type": "EducationalAudience", educationalRole: "student", audienceType: "Students aged 14–18" };

function breadcrumb(id: string, items: { name: string; url: string }[]) {
  return { "@type": "BreadcrumbList", "@id": id, itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })) };
}

function courseNode(t: Track) {
  const url = `${ACADEMY_URL}/${t.slug}`;
  return {
    "@type": "Course",
    "@id": `${url}#course`,
    name: `${t.title} (Space Academy)`,
    description: t.summary,
    url,
    provider: { "@id": ISHAVASYAM_ID },
    inLanguage: "en",
    audience,
    educationalLevel: Object.values(LEVELS).map((l) => `${l.name} (ages ${l.ages})`),
    teaches: t.levels.foundation.objectives,
    coursePrerequisites: t.levels.foundation.prerequisites,
  };
}

export function academyGraph() {
  const pageId = `${ACADEMY_URL}#webpage`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...baseNodes(),
      {
        "@type": "CollectionPage",
        "@id": pageId,
        url: ACADEMY_URL,
        name: ACADEMY_TITLE,
        description: ACADEMY_DESCRIPTION,
        inLanguage: "en",
        dateModified: LAST_REVIEWED,
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ISHAVASYAM_ID },
        mentions: [{ "@id": EV_ENGINEER_BRAND_ID }],
        audience,
        breadcrumb: { "@id": `${ACADEMY_URL}#breadcrumb` },
        hasPart: [...TRACKS.map((t) => ({ "@id": `${ACADEMY_URL}/${t.slug}#course` })), ...MISSIONS.map((m) => ({ "@id": `${ORIGIN}${missionHref(m.slug)}#learning` }))],
      },
      ...TRACKS.map(courseNode),
      ...MISSIONS.map(missionLearningNode),
      breadcrumb(`${ACADEMY_URL}#breadcrumb`, [
        { name: "Space", url: `${ORIGIN}/space` },
        { name: "Space Academy", url: ACADEMY_URL },
      ]),
    ],
  };
}

export function trackGraph(t: Track) {
  const url = `${ACADEMY_URL}/${t.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...baseNodes(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: trackTitle(t),
        description: trackDescription(t),
        inLanguage: "en",
        dateModified: LAST_REVIEWED,
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ISHAVASYAM_ID },
        mainEntity: { "@id": `${url}#course` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      courseNode(t),
      breadcrumb(`${url}#breadcrumb`, [
        { name: "Space", url: `${ORIGIN}/space` },
        { name: "Space Academy", url: ACADEMY_URL },
        { name: t.title, url },
      ]),
    ],
  };
}

function missionLearningNode(m: MissionMeta) {
  const url = `${ORIGIN}${missionHref(m.slug)}`;
  return {
    "@type": "LearningResource",
    "@id": `${url}#learning`,
    name: m.title,
    description: m.summary,
    url,
    learningResourceType: ["Interactive simulation", "3D model"],
    interactivityType: "active",
    educationalLevel: "Ages 14–18",
    inLanguage: "en",
    teaches: m.concepts,
    isAccessibleForFree: true,
    audience,
    creator: { "@id": ISHAVASYAM_ID },
  };
}

export function missionGraph(m: MissionMeta) {
  const url = `${ORIGIN}${missionHref(m.slug)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...baseNodes(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: missionTitle(m),
        description: m.summary,
        inLanguage: "en",
        dateModified: LAST_REVIEWED,
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ISHAVASYAM_ID },
        mainEntity: { "@id": `${url}#learning` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      missionLearningNode(m),
      breadcrumb(`${url}#breadcrumb`, [
        { name: "Space", url: `${ORIGIN}/space` },
        { name: "Space Academy", url: ACADEMY_URL },
        { name: m.title, url },
      ]),
    ],
  };
}
