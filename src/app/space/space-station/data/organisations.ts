import { SPACE_INITIATIVE } from "@/data/space-initiative";
// Organisations named on /space/space-station (header, footer, schema and the
// closing "Research & Project Direction" section). Single source of truth.

export const ISHAVASYAM = {
  name: SPACE_INITIATIVE.brand,
  descriptor: "Space Research Organisation",
  url: SPACE_INITIATIVE.url,
};

export const ITELEMATICS_ORG = {
  name: "iTelematics Software Private Limited",
  shortName: "iTelematics",
  url: "https://itelematics.com/",
};

export const BRAND_LINKS = [
  { label: ISHAVASYAM.name, href: ISHAVASYAM.url },
  { label: ITELEMATICS_ORG.shortName, href: ITELEMATICS_ORG.url },
];

export const ORGANISATION_LINE = `${ISHAVASYAM.name} · ${ISHAVASYAM.descriptor}`;
