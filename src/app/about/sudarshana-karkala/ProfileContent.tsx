// The profile of Sudarshana Karkala, in the visual language of /space and
// lighter than it. Rendered on the server: who he is, his career, his
// consulting and academic engagement, his focus, the initiatives and the work
// are all text in the HTML. There are two small
// scripts: ProfileAnalytics, which only reports what was shown and used, and
// JumpLink, which scrolls to the contact section.
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SUDARSHANA_KARKALA } from "@/data/public-entities";
import { inter, manrope } from "@/app/space/fonts";
import theme from "@/app/space/spaceTheme.module.css";
import JumpLink from "./JumpLink";
import ProfileAnalytics from "./ProfileAnalytics";
import { profileTracking } from "./analytics";
import { ABOUT, ACADEMIC, BACKGROUND, CONSULTING, CONTACT, EV_ENGINEER_URL, FOCUS_AREAS, HERO, INITIATIVES, LAST_REVIEWED, PRIMARY_INITIATIVE, SCOPE_NOTE, SELECTED_WORK, WORKSHOPS, shownDate } from "./profile";
import type { Organisation, TrackedOrganisation } from "./profile";
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

/**
 * A line of items with a dot between them. It wraps between items and never inside one, and a dot never starts a line.
 * A single item has no dot to keep with it, so it wraps like any other text.
 */
function Dotted({ items }: { items: readonly string[] }) {
  if (items.length === 1) return items[0];
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

/**
 * Text with a bracketed code in it, such as "(NW-ASHM 2026)", or a name joined by an en dash, such as
 * "CSIR–National". Each of those stays in one piece when the line wraps; the rest wraps as usual.
 */
function Bracketed({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\([^)]*\)|\S+–\S+)/).map((part, index) =>
        part.startsWith("(") || part.includes("–") ? (
          <span key={index} className={styles.unbroken}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

type NameLinkSection = "hero" | "background" | "consulting";

/**
 * An organisation's name that is also the way to its own site. A plain link: the name itself, underlined quietly.
 * Without `tracked` it is an ordinary link out that reports nothing, as a former employer's is.
 */
function NameLink({ href, tracked, section, children }: { href: string; tracked?: { id: TrackedOrganisation; destination: string }; section: NameLinkSection; children: string }) {
  return (
    <a
      href={href}
      {...NEW_TAB}
      className={styles.nameLink}
      aria-label={`${children} (opens in a new tab)`}
      {...(tracked ? profileTracking("profile_initiative_click", { initiative_name: tracked.id, destination: tracked.destination, section }) : {})}
    >
      {children}
    </a>
  );
}

/** From one date to another, or to the present: the dates as the page writes them, and as the owner gave them in the markup. */
function When({ from, to }: { from: string; to?: string }) {
  return (
    <>
      <time dateTime={from}>{shownDate(from)}</time> — {to ? <time dateTime={to}>{shownDate(to)}</time> : "Present"}
    </>
  );
}

/** The names of a row's organisations, each a link to its own site where one is on record. */
function Organisations({ organisations, section }: { organisations: readonly Organisation[]; section: NameLinkSection }) {
  return (
    <>
      {organisations.map((organisation, index) => {
        const last = index === organisations.length - 1;
        const name = organisation.href ? (
          <NameLink href={organisation.href} tracked={organisation.tracked} section={section}>
            {organisation.name}
          </NameLink>
        ) : (
          organisation.name
        );
        // A single name wraps as it needs to. Several on one line break between names, and a dot never starts a line.
        return organisations.length === 1 ? (
          <span key={organisation.name}>{name}</span>
        ) : (
          <span key={organisation.name}>
            <span className={styles.unbroken}>
              {name}
              {last ? null : " ·"}
            </span>
            {last ? null : " "}
          </span>
        );
      })}
    </>
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
              {/* The identity and the primary initiative, side by side. On a narrow screen the line breaks after the "@", never before it. */}
              <p className={styles.identity}>
                <span className={styles.unbroken}>
                  <NameLink href={HERO.identityLink.href} tracked={HERO.identityLink} section="hero">
                    {HERO.identity}
                  </NameLink>{" "}
                  <span className={styles.identitySeparator} aria-hidden="true">
                    @
                  </span>
                </span>{" "}
                <strong>
                  <NameLink href={HERO.primaryRole.link.href} tracked={HERO.primaryRole.link} section="hero">
                    {HERO.primaryRole.organisation}
                  </NameLink>
                </strong>
              </p>
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

        {/* ── The career, the consulting and the academic engagement: three kinds of relationship, in three sections, before the work ── */}
        <Section id="background" label="Professional Background">
          <p className={styles.eyebrow}>{BACKGROUND.eyebrow}</p>
          <p className={styles.sectionIntro}>{BACKGROUND.intro}</p>
          {/* One entry for each place, on a quiet rail: the date, then the organisation, then the role, then a few words of domain. */}
          <ol className={styles.timeline} role="list">
            {BACKGROUND.career.map((entry) => (
              <li key={entry.organisations[0].name} data-kind={entry.current ? "current" : "previous"}>
                <span className={styles.when}>
                  <When from={entry.from} to={entry.to} />
                </span>{" "}
                <span className={styles.entry}>
                  <span className={styles.entryName}>
                    <Organisations organisations={entry.organisations} section="background" />
                  </span>
                  {entry.role ? (
                    <>
                      {" "}
                      <span className={styles.entryRole}>{entry.role}</span>
                    </>
                  ) : null}
                  {entry.context ? (
                    <>
                      {" "}
                      <span className={styles.entryContext}>{typeof entry.context === "string" ? entry.context : <Dotted items={entry.context} />}</span>
                    </>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
          {/* What the years are made of, and apart from it what the work has moved into: never one line. */}
          <div className={styles.experience}>
            {[BACKGROUND.established, BACKGROUND.emerging].map((group, index) => (
              <div key={group.heading} className={styles.experienceGroup} data-kind={index === 0 ? "established" : "emerging"}>
                <h3 className={styles.focusTitle}>{group.heading}</h3>
                <p className={styles.experienceItems}>
                  <Dotted items={group.items} />
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section id={CONSULTING.id} label={CONSULTING.heading}>
          <p className={styles.eyebrow}>
            <When from={CONSULTING.from} to={CONSULTING.to} />
          </p>
          <p className={styles.sectionIntro}>{CONSULTING.intro}</p>
          <ul className={styles.engagements} role="list">
            {CONSULTING.engagements.map((engagement) => (
              <li key={engagement.organisation.name}>
                <span className={styles.engagementName}>
                  <Organisations organisations={[engagement.organisation]} section="consulting" />
                </span>{" "}
                <span className={styles.engagementRole}>{engagement.role}</span>{" "}
                <span className={styles.engagementAreas}>
                  <Dotted items={engagement.areas} />
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id={ACADEMIC.id} label={ACADEMIC.heading}>
          <p className={styles.eyebrow}>
            <When from={ACADEMIC.since} />
          </p>
          <p className={styles.sectionIntro}>{ACADEMIC.intro}</p>
          <h3 className={styles.subTitle}>{ACADEMIC.institutionsHeading}</h3>
          {/* In columns, read down: the order on screen is the order in the markup. */}
          <ul className={styles.institutions} role="list" style={{ "--institution-rows": Math.ceil(ACADEMIC.institutions.length / 2) } as CSSProperties}>
            {ACADEMIC.institutions.map((institution) => (
              <li key={institution.name}>
                <span className={styles.institutionName}>{institution.name}</span>
                {institution.place ? <span className={styles.institutionPlace}>, {institution.place}</span> : null}
              </li>
            ))}
          </ul>
          <div className={styles.callout}>
            <p className={styles.calloutEyebrow}>{ACADEMIC.initiative.eyebrow}</p>
            <h3 className={styles.calloutName}>{ACADEMIC.initiative.name}</h3>
            <p className={styles.calloutCopy}>{ACADEMIC.initiative.copy}</p>
          </div>
          <h3 className={styles.subTitle}>{ACADEMIC.areasHeading}</h3>
          <p className={styles.experienceItems}>
            <Dotted items={ACADEMIC.areas} />
          </p>
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
                    <a key={link.href} href={link.href} {...NEW_TAB} className={styles.textLink} {...profileTracking("profile_initiative_click", { initiative_name: PRIMARY_INITIATIVE.id, destination: link.destination, section: "primary_initiative" })}>
                      {link.label}
                      <Leaves />
                    </a>
                  ) : (
                    <Link key={link.href} href={link.href} className={styles.textLink} {...profileTracking("profile_initiative_click", { initiative_name: PRIMARY_INITIATIVE.id, destination: link.destination, section: "primary_initiative" })}>
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
                <div className={styles.initiativeLinks}>
                  {initiative.links.map((link) =>
                    link.external ? (
                      <a key={link.href} href={link.href} {...NEW_TAB} className={styles.textLink} {...profileTracking("profile_initiative_click", { initiative_name: initiative.id, destination: link.destination, section: "initiatives" })}>
                        {link.label}
                        <Leaves />
                      </a>
                    ) : (
                      <Link key={link.href} href={link.href} className={styles.textLink} {...profileTracking("profile_initiative_click", { initiative_name: initiative.id, destination: link.destination, section: "initiatives" })}>
                        {link.label}
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    ),
                  )}
                </div>
              </article>
            ))}
          </div>
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

        <Section id={WORKSHOPS.id} label={WORKSHOPS.heading}>
          <ul className={styles.education} role="list">
            {WORKSHOPS.entries.map((entry) => (
              <li key={entry.institution}>
                <span className={styles.eduInstitution}>
                  <Bracketed text={entry.institution} />
                </span>{" "}
                <span className={styles.eduProgramme}>{entry.areas ? <Dotted items={entry.areas} /> : <Bracketed text={entry.programme ?? ""} />}</span>
                {entry.meta ? (
                  <>
                    {" "}
                    <span className={styles.eduMeta} data-status={entry.status}>
                      {entry.meta}
                    </span>
                  </>
                ) : null}
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
