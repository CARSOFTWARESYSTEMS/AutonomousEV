import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { partner, PARTNER_STATUS_LABEL } from "@/data/apex/partners";
import { APEX_OFFICIAL_SITE_URL, apexHref } from "@/data/apex/site";
import { FONT_MANROPE } from "../fonts";
import styles from "../space.module.css";
import theme from "../spaceTheme.module.css";
import partners from "./partners.module.css";

/** The APEX entry into its microsite. Relative while it lives on this host, absolute once it moves. */
export const APEX_ENTRY_HREF = apexHref("/");

/**
 * The APEX card in the "Learn by building mission-ready thinking" grid.
 * Its pill and note say what it is: an engineering collaboration with Gamyaa AeroSystems, not a programme
 * of this site, and not a claim about APEX beyond its own published words.
 */
export function ApexProjectCard({ pill }: { pill: React.ReactNode }) {
  return (
    <div className={`${styles.cardHover} ${theme.card} ${styles.projectCard}`}>
      {pill}
      <h3 className={styles.projectTitle}>APEX Rocket Systems</h3>
      <p className={styles.projectDesc}>Rocket Propulsion · Integrated Launch Systems</p>
      <p className={styles.projectDesc}>
        See the 5 kN-class liquid-engine demonstrator APEX has built, and the engineering path from propulsion hardware to a validated rocket system.
      </p>
      <Link
        href={APEX_ENTRY_HREF}
        className={`${theme.secondaryButton} ${styles.projectCta}`}
        data-track-event="space_project_card_click"
        data-track-project="apex_rocket_systems"
        data-track-placement="simulation_projects"
      >
        Explore APEX Collaboration Concept <ArrowRight size={16} />
      </Link>
      <p className={styles.projectNote}>
        Engineering collaboration with Gamyaa AeroSystems ·{" "}
        <a
          href={APEX_OFFICIAL_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={partners.noteLink}
          data-track-event="space_partner_official_site_click"
          data-track-partner="apex_rocket_systems"
          data-track-placement="simulation_projects"
        >
          Official website<span className={styles.srOnly}> (opens in a new tab)</span>
        </a>
      </p>
    </div>
  );
}

const OTHER_PARTNERS = ["gamyaa", "ifab", "itelematics", "evsociety"] as const;

/** Partners & Engineering Ecosystem: APEX first, then Gamyaa AeroSystems (engineering collaboration) and the proposed capability partners. */
export function PartnersEcosystem({ label, pill, h2Style, descStyle }: { label: React.ReactNode; pill: (text: string, color: string) => React.ReactNode; h2Style: React.CSSProperties; descStyle: React.CSSProperties }) {
  const apex = partner("apex");
  return (
    <section id="partners" className={styles.section} style={{ maxWidth: 1280, margin: "0 auto" }} aria-labelledby="partners-title">
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        {label}
        <h2 id="partners-title" style={h2Style}>
          Partners &amp; Engineering Ecosystem
        </h2>
        <p style={descStyle}>
          APEX Rocket Systems and Gamyaa AeroSystems are working together in an engineering collaboration. The other organisations shown are proposed
          capability partners unless otherwise confirmed.
        </p>
      </div>

      <div className={`${styles.cardHover} ${theme.card} ${partners.featured}`}>
        <div>
          {pill("Engineering Collaboration", "#06B6D4")}
          <h3 className={partners.featuredTitle} style={{ fontFamily: FONT_MANROPE }}>
            {apex.name}
          </h3>
          <p className={`${partners.partnerFocus} ${partners.featuredFocus}`}>{apex.focus}</p>
          <p className={styles.projectDesc}>Developing liquid-propulsion capability as a foundation for progressively integrated rocket systems.</p>
          {/* One button, then the official site as a quieter link, like each partner's "Website" below. */}
          <div className={partners.featuredActions}>
            <Link
              href={APEX_ENTRY_HREF}
              className={`${theme.secondaryButton} ${partners.featuredPrimary}`}
              data-track-event="space_partner_card_click"
              data-track-partner="apex_rocket_systems"
              data-track-placement="partners_ecosystem"
            >
              Explore APEX Collaboration Concept <ArrowRight size={16} />
            </Link>
            <a
              href={APEX_OFFICIAL_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={partners.featuredLink}
              data-track-event="space_partner_official_site_click"
              data-track-partner="apex_rocket_systems"
              data-track-placement="partners_ecosystem"
            >
              Official Website <ArrowUpRight size={15} />
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <dl className={partners.facts}>
          <div>
            <dt>Role</dt>
            <dd>{apex.role}</dd>
          </div>
          <div>
            <dt>Hardware built</dt>
            <dd>5 kN-class liquid-engine demonstrator</dd>
          </div>
          <div>
            <dt>Engine cycle</dt>
            <dd>Gas-generator</dd>
          </div>
          <div>
            <dt>Collaboration</dt>
            <dd>With Gamyaa AeroSystems</dd>
          </div>
        </dl>
      </div>

      <div className={partners.grid}>
        {OTHER_PARTNERS.map((id) => {
          const p = partner(id);
          return (
            <div key={p.id} className={`${theme.card} ${partners.partner}`}>
              {/* Gamyaa AeroSystems shares the APEX card's cyan: the two are in an engineering collaboration; the others are proposed. */}
              {pill(PARTNER_STATUS_LABEL[p.relationshipStatus], p.relationshipStatus === "ENGINEERING_COLLABORATION" ? "#06B6D4" : "#93C5FD")}
              <h3 className={partners.partnerName} style={{ fontFamily: FONT_MANROPE }}>
                {p.name}
              </h3>
              {/* The capability line is the card's description; the role ("Embedded Systems & Firmware") would only repeat it. */}
              <p className={partners.partnerFocus}>{p.focus}</p>
              {p.website && (
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={partners.partnerLink}
                  data-track-event="space_partner_site_click"
                  data-track-partner={p.id}
                  data-track-placement="partners_ecosystem"
                >
                  Website <ArrowUpRight size={14} />
                  <span className={styles.srOnly}> of {p.name} (opens in a new tab)</span>
                </a>
              )}
            </div>
          );
        })}
      </div>
      <p className={partners.disclaimer}>More specialist partners are welcome across avionics, sensors, GNC, manufacturing, test infrastructure and research.</p>
    </section>
  );
}
