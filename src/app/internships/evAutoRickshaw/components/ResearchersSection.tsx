import { SHILAJIT_DAS, SUDARSHANA_KARKALA } from "@/data/public-entities";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import styles from "../page.module.css";

interface Researcher {
  name: string;
  primaryArea: string;
  affiliation: string;
  focusAreas: string[];
  profileHref?: string;
  profileLabel?: string;
  linkedinHref: string;
}

const RESEARCHERS: Researcher[] = [
  {
    name: SHILAJIT_DAS.name,
    primaryArea: "Degradation of Lithium-ion Battery",
    affiliation: "National Institute of Technology Karnataka, Surathkal",
    focusAreas: ["Lithium-ion battery degradation", "Battery ageing", "Battery health", "Battery life and reliability", "Battery research"],
    linkedinHref: SHILAJIT_DAS.sameAs![0],
  },
  {
    name: SUDARSHANA_KARKALA.name,
    primaryArea: "EV.ENGINEER™",
    affiliation: "National Institute of Technology Karnataka, Surathkal — Alumni",
    focusAreas: [
      "EV engineering",
      "Battery intelligence",
      "Battery Management Systems",
      "Energy intelligence",
      "Connected EV systems",
      "EV cybersecurity",
      "Electric mobility",
    ],
    profileHref: "https://aerospace.ev.engineer/about/sudarshana-karkala",
    profileLabel: "View Profile",
    linkedinHref: "https://www.linkedin.com/in/sudarshanakarkala/",
  },
];

export function ResearchersSection() {
  return (
    <section aria-labelledby="about-researchers-heading">
      <p className={styles.bodyTextCenter} style={{ marginBottom: "2.5rem" }}>
        A cross-disciplinary research team bringing together battery degradation research, engineering, energy
        intelligence, and electric vehicle technologies to support the development of affordable and reliable
        electric mobility systems.
      </p>

      <div className={styles.cardGrid2}>
        {RESEARCHERS.map((r) => (
          <article className={styles.card} key={r.name} aria-labelledby={`researcher-${slug(r.name)}`}>
            <h3 id={`researcher-${slug(r.name)}`} className={styles.cardTitle}>
              {r.name}
            </h3>
            <p className={styles.cardEyebrow} style={{ marginBottom: "0.15rem" }}>
              {r.primaryArea}
            </p>
            <p className={styles.fieldHint} style={{ marginBottom: "1rem" }}>
              {r.affiliation}
            </p>

            <p className={styles.diagramCaption} style={{ marginBottom: "0.5rem" }}>
              Research Areas
            </p>
            <div className={styles.pillGrid} style={{ marginBottom: "1.25rem" }}>
              {r.focusAreas.map((area) => (
                <span className={styles.rolePill} key={area}>
                  {area}
                </span>
              ))}
            </div>

            <div className={styles.utilityRow}>
              {r.profileHref ? (
                <Link href={r.profileHref} className={styles.linkButton}>
                  {r.profileLabel} <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ) : null}
              <a
                href={r.linkedinHref}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkButton}
                aria-label={`${r.name} on LinkedIn (opens in a new tab)`}
              >
                LinkedIn <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>

      <p className={styles.fieldHint} style={{ marginTop: "1.5rem", textAlign: "center" }}>
        Research areas describe each researcher&apos;s domain expertise and contribution context — they do not
        imply personal validation, certification or approval of this concept-stage simulator&apos;s specific
        engineering assumptions.
      </p>
    </section>
  );
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
