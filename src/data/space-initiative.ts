/**
 * Who the Space initiative belongs to, said one way everywhere: the /space
 * pages, their shared header and footer, metadata, social cards and JSON-LD.
 *
 * Space is an ISHAVASYAM.ORG initiative. It is hosted within the EV.ENGINEER
 * engineering ecosystem; commercial engineering, where applicable, is handled
 * separately by iTelematics Software Private Limited under explicit
 * agreements. The organisation's name and URL come from the entity registry.
 */
import { ISHAVASYAM } from "./public-entities";

export const SPACE_INITIATIVE = {
  /** Always written exactly so. No trademark sign. */
  brand: ISHAVASYAM.name,
  url: ISHAVASYAM.canonicalUrl,
  label: `An ${ISHAVASYAM.name} Initiative`,
  line: `Space · An ${ISHAVASYAM.name} Initiative`,
  sentence: `Space is an ${ISHAVASYAM.name} education, research and engineering initiative.`,
  descriptor: `An ${ISHAVASYAM.name} education, research and engineering initiative.`,
} as const;
