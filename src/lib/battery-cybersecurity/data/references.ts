import type { ReferenceItem } from "../types";

// Only independently verified, resolvable, authoritative sources are listed here.
// Several candidate government/standards-body deep links (FAA, RTCA, ISO catalogue
// pages) could not be independently confirmed reachable in this environment and
// are therefore referenced by name only in the Standards section, not linked here,
// per the rule against invented or unverified citations.
export const REFERENCES: ReferenceItem[] = [
  {
    id: "nist-csf",
    title: "NIST Cybersecurity Framework (CSF) 2.0",
    publisher: "National Institute of Standards and Technology (NIST)",
    url: "https://www.nist.gov/cyberframework",
    note: "General-purpose risk-management framework referenced for the layered detection/assurance structure used on this page.",
  },
  {
    id: "nist-pqc",
    title: "Post-Quantum Cryptography Project",
    publisher: "NIST Computer Security Resource Center",
    url: "https://csrc.nist.gov/projects/post-quantum-cryptography",
    note: "Source for the post-quantum migration-readiness direction described in the roadmap; not a current production requirement.",
  },
  {
    id: "easa-cybersecurity",
    title: "Cybersecurity Domain — Regulations, AMC & GM",
    publisher: "European Union Aviation Safety Agency (EASA)",
    url: "https://www.easa.europa.eu/en/domains/cybersecurity",
    note: "Regulatory context for aviation information-security requirements (Part-IS) referenced in the Standards & Assurance Positioning section.",
  },
];
