// Structured-data entity graph for the home page (/). Anchors the site's
// entity graph: WebSite, the EV.ENGINEER brand, its verified operator
// (iTelematics Software Private Limited) and a WebPage node for the home
// page itself, all built from the shared node builders in ./entities so
// every page referencing these entities points at the same `@id`s.

import { SITE_URL } from "@/data/public-entities";
import {
  WEBSITE_ID,
  EV_ENGINEER_BRAND_ID,
  ITELEMATICS_ID,
  websiteNode,
  evEngineerBrandNode,
  itelematicsOrgNode,
} from "./entities";

const HOME_URL = `${SITE_URL}/`;
const WEBPAGE_ID = `${HOME_URL}#webpage`;

export interface HomeGraphOptions {
  title: string;
  description: string;
}

export function buildHomeGraph({ title, description }: HomeGraphOptions): object[] {
  return [
    websiteNode(),
    evEngineerBrandNode(),
    itelematicsOrgNode(),
    {
      "@type": "WebPage",
      "@id": WEBPAGE_ID,
      url: HOME_URL,
      name: title,
      description,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": EV_ENGINEER_BRAND_ID },
      publisher: { "@id": ITELEMATICS_ID },
      inLanguage: "en",
    },
  ];
}
