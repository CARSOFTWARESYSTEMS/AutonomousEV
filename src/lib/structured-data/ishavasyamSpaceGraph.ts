// Structured-data graph for aerospace.ishavasyam.org/space. Unlike
// ./spaceGraph.ts (the EV.ENGINEER-hosted copy of the same page) this graph is
// self-contained: ISHAVASYAM.ORG is the only organisation, and no other
// organisation or brand node is referenced.

export interface IshavasyamSpaceGraphOptions {
  origin: string;
  orgName: string;
  orgDescriptor: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  ogImageUrl: string;
  diagramImageUrl: string;
  citationUrls: string[];
}

export function buildIshavasyamSpaceGraph({
  origin,
  orgName,
  orgDescriptor,
  title,
  description,
  datePublished,
  dateModified,
  ogImageUrl,
  diagramImageUrl,
  citationUrls,
}: IshavasyamSpaceGraphOptions): object[] {
  const spaceUrl = `${origin}/space`;
  const orgId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;
  const missionId = `${spaceUrl}#mission`;
  const webpageId = `${spaceUrl}#webpage`;

  return [
    {
      "@type": "Organization",
      "@id": orgId,
      name: orgName,
      description: orgDescriptor,
      url: `${origin}/`,
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: orgName,
      url: `${origin}/`,
      publisher: { "@id": orgId },
    },
    {
      "@type": "ResearchProject",
      "@id": missionId,
      name: "Autonomous Spacecraft Health Mission 2040",
      url: spaceUrl,
      description,
      keywords: [
        "autonomous spacecraft health management",
        "spacecraft fault detection isolation and recovery",
        "spacecraft FDIR",
        "spacecraft digital twin",
        "spacecraft telemetry simulator",
        "CubeSat health monitoring",
        "spacecraft prognostics",
        "verified safe recovery",
      ],
      creativeWorkStatus: "Planned",
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: spaceUrl,
      name: title,
      description,
      isPartOf: { "@id": websiteId },
      about: { "@id": missionId },
      publisher: { "@id": orgId },
      inLanguage: "en",
      datePublished,
      dateModified,
      citation: citationUrls,
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: ogImageUrl,
        width: 1200,
        height: 630,
      },
      image: [
        { "@type": "ImageObject", url: ogImageUrl, width: 1200, height: 630 },
        {
          "@type": "ImageObject",
          url: diagramImageUrl,
          width: 1200,
          height: 320,
          caption:
            "Autonomous spacecraft health-management loop from telemetry monitoring through verified safe recovery.",
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
        { "@type": "ListItem", position: 2, name: "Space", item: spaceUrl },
      ],
    },
  ];
}
