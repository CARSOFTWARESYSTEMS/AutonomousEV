import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BHAVYA_KSHATRI, SITE_URL } from "@/data/public-entities";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { BHAVYA_KSHATRI_ID, EV_ENGINEER_BRAND_ID, WEBSITE_ID, bhavyaKshatriPersonNode, evEngineerBrandNode, itelematicsOrgNode, websiteNode } from "@/lib/structured-data/entities";
// The page shares the Battery Cybersecurity theme: its hero, sections, grids and cards.
import theme from "../battery-cybersecurity/page.module.css";
import styles from "./page.module.css";

const PAGE_PATH = "/internships/cybersecurity-engineers";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PAGE_TITLE = "Cybersecurity Engineers | EV.ENGINEER";
const PAGE_DESCRIPTION = "Meet engineers contributing to EV battery cybersecurity, connected systems, digital engineering and aerospace security research at EV.ENGINEER.";
const SUBTITLE = "Engineering Security for EV, Battery, Aerospace and Connected Systems";
const INTRO = "Meet engineers and researchers contributing to cybersecurity, battery safety, connected systems and emerging aerospace security initiatives across EV.ENGINEER and associated research programs.";

const BHAVYA_PORTFOLIO = "https://bhavyacyber.github.io/";
const BHAVYA_IMAGE = "/team/bhavyaparvathi.png";

interface ProfileLink {
  label: string;
  href: string;
  /** Reported as `link_type` with the click. */
  type: string;
}

interface Engineer {
  id: string;
  name: string;
  /** Short name reported with link clicks. */
  trackName: string;
  /** The role already published for this person on the AegisCAN page. */
  role: string;
  summary: string;
  focus: readonly string[];
  image: string;
  imageAlt: string;
  links: readonly ProfileLink[];
}

/**
 * Names, roles, summaries and focus areas restate what the entity registry and
 * the AegisCAN page already publish. Bhavya's EV Society profile is not linked
 * yet: add it to her `links` as `{ label: "EV Society Profile", href, type: "ev_society" }`.
 */
const ENGINEERS: readonly Engineer[] = [
  {
    id: "bhavya-parvathi",
    name: BHAVYA_KSHATRI.name,
    trackName: "Bhavya Parvathi",
    role: "Cybersecurity Researcher · EV.ENGINEER™",
    summary: "Contributes to the AegisCAN cybersecurity research track on EV.ENGINEER: threat analysis, security monitoring and anomaly investigation for CAN-based systems.",
    focus: ["Cybersecurity", "Threat Detection & Alert Investigation", "AI SOC Analysis"],
    image: BHAVYA_IMAGE,
    imageAlt: `${BHAVYA_KSHATRI.name} — Cybersecurity Researcher`,
    links: [
      { label: "Portfolio", href: BHAVYA_PORTFOLIO, type: "portfolio" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/bhavya-naga-sai-parvathi-kshatri", type: "linkedin" },
      { label: "AegisCAN Research", href: "/internships/AegisCAN", type: "research_project" },
    ],
  },
];

const PROGRAMS = [
  {
    title: "EV Battery Cybersecurity Internship",
    href: "/internships/battery-cybersecurity",
    text: "A 12-month EV battery cybersecurity engineering and research internship: battery intrusion detection, secure telemetry, BMS threat models and secure OTA updates.",
  },
  {
    title: "AegisCAN",
    href: "/internships/AegisCAN",
    text: "A 12-week educational R&D mini-project on Battery, BMS, BESS and CAN communication, validation, fault injection and CAN cybersecurity.",
  },
  {
    title: "All Internships",
    href: "/internships",
    text: "EV, battery, cybersecurity, autonomous-systems, aerospace and space internships and student projects.",
  },
] as const;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "Cybersecurity Engineers",
    "EV Cybersecurity",
    "Battery Cybersecurity",
    "Automotive Cybersecurity",
    "BMS Security",
    "Aerospace Cybersecurity",
    "Connected Vehicle Security",
    "CAN Security",
    "Digital Twin Cybersecurity",
    "EV.ENGINEER",
  ],
  alternates: { canonical: PAGE_URL },
  robots: { index: true, follow: true },
  // No image: a portrait would make the page look like it is about one person.
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_URL, type: "website", siteName: "EV.ENGINEER" },
  twitter: { card: "summary", title: PAGE_TITLE, description: PAGE_DESCRIPTION },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    websiteNode(),
    evEngineerBrandNode(),
    itelematicsOrgNode(),
    { ...bhavyaKshatriPersonNode(), image: `${SITE_URL}${BHAVYA_IMAGE}`, sameAs: [...(BHAVYA_KSHATRI.sameAs ?? []), BHAVYA_PORTFOLIO] },
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      inLanguage: "en-US",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": EV_ENGINEER_BRAND_ID },
      mainEntity: { "@id": `${PAGE_URL}#engineers` },
      breadcrumb: {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Internships", item: `${SITE_URL}/internships` },
          { "@type": "ListItem", position: 3, name: "Cybersecurity Engineers", item: PAGE_URL },
        ],
      },
    },
    {
      "@type": "ItemList",
      "@id": `${PAGE_URL}#engineers`,
      name: "Cybersecurity Engineers",
      itemListElement: [{ "@type": "ListItem", position: 1, item: { "@id": BHAVYA_KSHATRI_ID } }],
    },
  ],
};

function ProfileCard({ engineer }: { engineer: Engineer }) {
  const titleId = `${engineer.id}-name`;
  return (
    <article className={`${theme.card} ${styles.profile}`} aria-labelledby={titleId}>
      <div className={styles.identity}>
        <div className={styles.portrait}>
          <Image src={engineer.image} alt={engineer.imageAlt} fill sizes="120px" />
        </div>
        <div className={styles.who}>
          <h2 id={titleId} className={styles.name}>
            {engineer.name}
          </h2>
          <p className={styles.role}>{engineer.role}</p>
        </div>
      </div>
      <p className={theme.cardDesc}>{engineer.summary}</p>
      <p className={styles.label}>Focus areas</p>
      <ul className={styles.focus}>
        {engineer.focus.map((area) => (
          <li key={area}>{area}</li>
        ))}
      </ul>
      <ul className={styles.links} aria-label={`Profiles and work: ${engineer.name}`}>
        {engineer.links.map((link) => {
          const tracking = {
            "data-track-event": "cybersecurity_engineer_profile_click",
            "data-track-engineer": engineer.trackName,
            "data-track-link_type": link.type,
            "data-track-destination": link.href,
          };
          return (
            <li key={link.href}>
              {link.href.startsWith("http") ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={styles.link} {...tracking}>
                  {link.label} <span className={styles.srOnly}>of {engineer.name} (opens in a new tab)</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              ) : (
                <Link href={link.href} className={styles.link} {...tracking}>
                  {link.label}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export default function CybersecurityEngineersPage() {
  return (
    <div className={styles.page}>
      <JsonLd data={structuredData} />

      <section className={`${theme.hero} ${styles.hero}`}>
        <div className={theme.heroGlow} />
        <div className={theme.heroInner}>
          <div className={theme.heroPill}>
            <span>Cybersecurity Research</span>
          </div>
          <h1 className={theme.heroTitle}>
            Cybersecurity <span className="glowing-text">Engineers</span>
          </h1>
          <p className={theme.heroSubtitle}>{SUBTITLE}</p>
          <p className={`${theme.heroDesc} ${styles.intro}`}>{INTRO}</p>
        </div>
      </section>

      <section className={`${theme.pageSection} ${styles.engineers}`} aria-label="Engineers">
        <div className="container">
          <div className={theme.grid2}>
            {ENGINEERS.map((engineer) => (
              <ProfileCard key={engineer.id} engineer={engineer} />
            ))}
          </div>
        </div>
      </section>

      <section className={theme.pageSectionAlt} aria-labelledby="programs-title">
        <div className="container">
          <div className={`${theme.sectionHeader} ${styles.programsHeader}`}>
            <h2 id="programs-title" className={theme.sectionTitle}>
              Cybersecurity Research &amp; Programs
            </h2>
            <p className={theme.sectionSubtitle}>
              {ENGINEERS[0].name} contributes to cybersecurity research at EV.ENGINEER, including the AegisCAN research track. The professional profiles are linked from the card above; the related programs are below.
            </p>
          </div>
          <ul className={`${theme.grid3} ${styles.programs}`}>
            {PROGRAMS.map((program) => (
              <li key={program.href}>
                <Link href={program.href} className={`${theme.card} ${styles.program}`} data-track-event="cybersecurity_engineers_program_click" data-track-destination={program.href}>
                  <h3 className={theme.cardTitle}>
                    {program.title} <ArrowRight size={16} aria-hidden="true" />
                  </h3>
                  <p className={theme.cardDesc}>{program.text}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
