import type { ResearchLibraryCategory, ResearchLibraryEntry } from "../types";

// Only the 3 independently-verified references from the References section are
// listed here (reused, not duplicated data — see references.ts). Categories
// without a verified entry are shown honestly as empty, not hidden or faked.
export const RESEARCH_LIBRARY_ENTRIES: ResearchLibraryEntry[] = [
  {
    id: "nist-csf",
    category: "whitepapers",
    title: "NIST Cybersecurity Framework (CSF) 2.0",
    publisher: "National Institute of Standards and Technology (NIST)",
    url: "https://www.nist.gov/cyberframework",
  },
  {
    id: "nist-pqc",
    category: "whitepapers",
    title: "Post-Quantum Cryptography Project",
    publisher: "NIST Computer Security Resource Center",
    url: "https://csrc.nist.gov/projects/post-quantum-cryptography",
  },
  {
    id: "easa-cybersecurity",
    category: "whitepapers",
    title: "Cybersecurity Domain — Regulations, AMC & GM",
    publisher: "European Union Aviation Safety Agency (EASA)",
    url: "https://www.easa.europa.eu/en/domains/cybersecurity",
  },
];

export const RESEARCH_LIBRARY_CATEGORIES: Array<{ id: ResearchLibraryCategory; label: string }> = [
  { id: "whitepapers", label: "Whitepapers & Standards" },
  { id: "papers", label: "Peer-Reviewed Papers" },
  { id: "patents", label: "Patents" },
  { id: "talks", label: "Talks" },
  { id: "videos", label: "Videos" },
];
