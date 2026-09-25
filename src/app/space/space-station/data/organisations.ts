// Organisations named on /space/space-station (header, footer, schema and the
// closing "Research & Project Direction" section). Single source of truth.

export const ISHAVASYAM = {
  name: "Ishavasyam.org",
  descriptor: "Space Research Organisation",
  url: "https://ishavasyam.org/",
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
