// The profile of Sudarshana Karkala, in the visual language of /space and
// lighter than it. Rendered on the server: who he is, his roles, his focus,
// the initiatives and the work are all text in the HTML. There are two small
// scripts: ProfileAnalytics, which only reports what was shown and used, and
// JumpLink, which scrolls to the contact section.
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SUDARSHANA_KARKALA } from "@/data/public-entities";
import { inter, manrope } from "@/app/space/fonts";
import theme from "@/app/space/spaceTheme.module.css";
import JumpLink from "./JumpLink";
import ProfileAnalytics from "./ProfileAnalytics";
import { profileTracking } from "./analytics";
import { ABOUT, BACKGROUND, CONTACT, EDUCATION, EV_ENGINEER_URL, FOCUS_AREAS, HERO, INITIATIVES, LAST_REVIEWED, PRIMARY_INITIATIVE, SCOPE_NOTE, SELECTED_WORK } from "./profile";
import styles from "./page.module.css";

/** The element the profile's analytics listens on. `data-track-manual` on it tells the site-wide click listener to leave these links to it. */
const ROOT_ID = "profile";
const NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;
const TELEPHONE = SUDARSHANA_KARKALA.publicTelephone ?? "";

/** What follows the words of a link that leaves the site: the arrow for the eye, the sentence for a screen reader. */
function Leaves() {
  return (
    <>
      <ArrowUpRight size={15} aria-hidden="true" />
      <span className={styles.srOnly}> (opens in a new tab)</span>
    </>
  );
}

/** A line of items with a dot between them. It wraps between items and never inside one, and a dot never starts a line. */
function Dotted({ items }: { items: readonly string[] }) {
  return (
    <>
      {items.map((item, index) => (
        <span key={item}>
          <span className={styles.unbroken}>{index < items.length - 1 ? `${item} ·` : item}</span>
          {index < items.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

function Role({ role, className }: { role: { title: string; organisation: string }; className: string }) {
  return (
    <p className={className}>
      {role.title} — <strong>{role.organisation}</strong>
    </p>
  );
}

/** A section of the page: its small label beside it on a wide screen, above it on a narrow one. */
function Section({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={styles.sectionInner}>
        <h2 id={`${id}-title`} className={styles.label}>
          {label}
        </h2>
        <div className={styles.body}>{children}</div>
      </div>
    </section>
  );
}

export default function ProfileContent() {
  return (
    <div id={ROOT_ID} className={`${styles.page} ${theme.theme} ${manrope.variable} ${inter.variable}`} data-track-manual="">
      <ProfileAnalytics rootId={ROOT_ID} />
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>

      <header className={styles.bar}>
        <a href={EV_ENGINEER_URL} className={styles.brand}>
          EV.ENGINEER™
        </a>
        <nav aria-label="Profile" className={styles.barNav}>
          <Link href="/space" className={styles.barLink}>
            Space
          </Link>
          {/* One name at every width. On a phone only its first word shows, and the name still begins with what is shown. */}
          <JumpLink targetId={CONTACT.id} className={styles.barButton} aria-label={CONTACT.heading}>
            Contact<span className={styles.barRest}>/ Consultation</span>
          </JumpLink>
        </nav>
      </header>

      <main id="main-content">
        {/* ── Who ── */}
        <section className={styles.hero} aria-labelledby="profile-name">
          <div className={styles.heroInner}>
            <Image src="/SudarshanaKarkala.jpg" alt={`Portrait of ${HERO.name}`} width={120} height={120} sizes="120px" className={styles.photo} priority />
            <div className={styles.heroText}>
              <h1 id="profile-name" className={styles.name}>
                {HERO.name}
              </h1>
              <p className={styles.identity}>{HERO.identity}</p>
              <Role role={HERO.primaryRole} className={styles.rolePrimary} />
              <Role role={HERO.secondaryRole} className={styles.roleSecondary} />
              <p className={styles.focusLine}>
                <Dotted items={HERO.focus} />
              </p>
            </div>
          </div>
        </section>

        <Section id="about" label="About">
          <p className={styles.lead}>{ABOUT[0]}</p>
          <p className={styles.text}>{ABOUT[1]}</p>
        </Section>

        {/* ── The primary initiative: the one card on the page that is allowed to stand out ── */}
        <section id={PRIMARY_INITIATIVE.id} className={styles.section} aria-labelledby="ishavasyam-title">
          <div className={styles.sectionInner}>
            <p className={styles.label}>{PRIMARY_INITIATIVE.eyebrow}</p>
            <div className={`${styles.body} ${styles.primary}`}>
              <h2 id="ishavasyam-title" className={styles.primaryName}>
                {PRIMARY_INITIATIVE.name}
              </h2>
              <p className={styles.primarySubtitle}>
                <Dotted items={PRIMARY_INITIATIVE.subtitle} />
              </p>
              <p className={styles.primaryCopy}>{PRIMARY_INITIATIVE.copy}</p>
              <div className={styles.links}>
                {PRIMARY_INITIATIVE.links.map((link) =>
                  link.external ? (
                    <a key={link.href} href={link.href} {...NEW_TAB} className={styles.textLink} {...profileTracking("profile_initiative_click", { initiative_name: PRIMARY_INITIATIVE.id, destination: link.destination })}>
                      {link.label}
                      <Leaves />
                    </a>
                  ) : (
                    <Link key={link.href} href={link.href} className={styles.textLink} {...profileTracking("profile_initiative_click", { initiative_name: PRIMARY_INITIATIVE.id, destination: link.destination })}>
                      {link.label}
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <Section id="initiatives" label="Initiatives">
          <div className={styles.initiatives}>
            {INITIATIVES.map((initiative) => (
              <article key={initiative.id} className={styles.initiative}>
                <h3 className={styles.initiativeName}>{initiative.name}</h3>
                <p className={styles.initiativeLine}>{initiative.line}</p>
                {initiative.note ? <p className={styles.initiativeNote}>{initiative.note}</p> : null}
                <a href={initiative.link.href} {...NEW_TAB} className={`${styles.textLink} ${styles.initiativeLink}`} {...profileTracking("profile_initiative_click", { initiative_name: initiative.id, destination: initiative.link.destination })}>
                  {initiative.link.label}
                  <Leaves />
                </a>
              </article>
            ))}
          </div>
        </Section>

        <Section id="research" label="Research & Engineering">
          <div className={styles.focus}>
            {FOCUS_AREAS.map((area) => (
              <div key={area.title} className={styles.focusArea}>
                <h3 className={styles.focusTitle}>{area.title}</h3>
                <ul className={styles.focusList} role="list">
                  {area.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className={styles.scope}>{SCOPE_NOTE}</p>
        </Section>

        <Section id="work" label="Selected Work">
          <ul className={styles.work} role="list">
            {SELECTED_WORK.map((project) => (
              <li key={project.id}>
                <Link href={project.href} className={styles.workLink} {...profileTracking("profile_project_click", { project_name: project.id, destination: project.href, section: "selected_work" })}>
                  <span className={styles.workTitle}>{project.title}</span>{" "}
                  <span className={styles.workKind}>{project.kind}</span>
                  <ArrowRight size={16} aria-hidden="true" className={styles.workArrow} />
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="background" label="Professional Background">
          <ul className={styles.roles} role="list">
            {BACKGROUND.roles.map((role) => (
              <li key={role.organisation}>
                <strong>{role.title}</strong> — {role.organisation}
              </li>
            ))}
          </ul>
          <p className={styles.text}>{BACKGROUND.experience}</p>
        </Section>

        <Section id="education" label="Education & Professional Development">
          <ul className={styles.education} role="list">
            {EDUCATION.map((entry) => (
              <li key={entry.institution}>
                <span className={styles.eduInstitution}>{entry.institution}</span>{" "}
                <span className={styles.eduProgramme}>{entry.programme}</span>{" "}
                <span className={styles.eduMeta} data-status={entry.status}>
                  {entry.meta}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── Where the "Contact / Consultation" link of the Space and Digital Twin pages lands ── */}
        <Section id={CONTACT.id} label={CONTACT.heading}>
          <p className={`${styles.lead} ${styles.topics}`}>
            <Dotted items={CONTACT.topics} />
          </p>
          <div className={styles.actions}>
            {CONTACT.actions.map((action) =>
              action.destinationType === "internal" ? (
                <Link key={action.type} href={action.href} className={styles.button} {...profileTracking("profile_contact_click", { contact_type: action.type, destination_type: action.destinationType })}>
                  {action.label}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ) : (
                <a key={action.type} href={action.href} {...NEW_TAB} className={styles.button} aria-label={action.ariaLabel ?? undefined} {...profileTracking("profile_contact_click", { contact_type: action.type, destination_type: action.destinationType })}>
                  {action.label}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              ),
            )}
            <a href={`tel:${TELEPHONE.replace(/\s/g, "")}`} className={styles.phone} {...profileTracking("profile_contact_click", { contact_type: "phone", destination_type: "telephone" })}>
              {TELEPHONE}
            </a>
          </div>
        </Section>
      </main>

      <footer className={styles.foot}>
        <p className={styles.footText}>
          Independent public profile page. Last reviewed: <time dateTime={LAST_REVIEWED.iso}>{LAST_REVIEWED.shown}</time>. Verified feedback and recognition are on the{" "}
          <Link href="/trust-center">Trust Center</Link>. For general enquiries, or to report a correction, use the{" "}
          <Link href="/contact" {...profileTracking("profile_contact_click", { contact_type: "contact_page", destination_type: "internal" })}>
            EV.ENGINEER contact page
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
