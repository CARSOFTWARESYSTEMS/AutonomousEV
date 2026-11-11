import Link from "next/link";
import { ArrowRight, LifeBuoy, MapPin, Monitor, Package, PlayCircle, Rocket, Satellite } from "lucide-react";
import AcademyFrame from "./components/AcademyFrame";
import LearnerPathways from "./components/LearnerPathways";
import EnquiryPaths from "./components/EnquiryPaths";
import Notices from "./components/Notices";
import TrackIcon from "./components/TrackIcon";
import { TRACKS, type TutorialRef } from "./data/curriculum";
import { MISSIONS, missionHref } from "./data/missions";
import { FORMATS, type Format } from "./data/programme";
import { academyGraph, academyMetadata } from "./seo";
import styles from "./academy.module.css";

export const metadata = academyMetadata;

/** Every existing tutorial the tracks reference, once each, in first-mention order. */
const TUTORIALS: TutorialRef[] = TRACKS.flatMap((t) => t.tutorials).filter((ref, i, all) => all.findIndex((r) => r.href === ref.href) === i);

const FIRST = MISSIONS[0];

/** The four ways in beside the first mission: three playable missions and one course whose workshop is planned. */
const OPTIONS = [
  { label: "Explore Satellites", sub: "Take a CubeSat apart in 3D", href: `${missionHref("build-your-first-cubesat")}#explore`, Icon: Satellite, color: "#3B82F6", tint: "#93C5FD", kind: "3D mission", event: "academy_mission_open", id: "build-your-first-cubesat" },
  { label: "Design Rockets", sub: "Make a model rocket fly straight", href: missionHref("stable-model-rocket"), Icon: Rocket, color: "#F59E0B", tint: "#FCD34D", kind: "3D mission", event: "academy_mission_open", id: "stable-model-rocket" },
  { label: "Build a CanSat", sub: "A satellite the size of a drink can", href: "/space/academy/cansat", Icon: Package, color: "#10B981", tint: "#6EE7B7", kind: "Course", event: "academy_track_open", id: "cansat" },
  { label: "Save a Mission", sub: "Beat the eclipse, fix a fault", href: missionHref("survive-the-eclipse"), Icon: LifeBuoy, color: "#7C3AED", tint: "#C4B5FD", kind: "3D mission", event: "academy_mission_open", id: "survive-the-eclipse" },
] as const;

function FormatItem({ f }: { f: Format }) {
  return (
    <li className={styles.formatItem}>
      <div className={styles.formatTop}>
        <h4 className={styles.h4}>{f.title}</h4>
        <span className={styles.badge} data-kind={f.status === "Available" ? "available" : "planned"}>
          {f.status}
        </span>
      </div>
      <p>{f.description}</p>
      <p className={styles.small}>{f.details.join(" · ")}</p>
    </li>
  );
}

export default function SpaceAcademyPage() {
  const online = FORMATS.filter((f) => f.mode === "Online");
  const offline = FORMATS.filter((f) => f.mode === "Offline");
  return (
    <AcademyFrame crumbs={[{ label: "Space", href: "/space" }, { label: "Space Academy" }]} graph={academyGraph()}>
      {/* ── Hero: one statement, one primary action, four ways in ── */}
      <section className={styles.hero} aria-labelledby="academy-title">
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Space Academy · Ages 14–18</span>
          <h1 id="academy-title" className={styles.h1}>
            Your Mission <span className={styles.gradient}>Starts Here.</span>
          </h1>
          <p className={styles.lede}>Build a satellite, fly a rocket and save a mission in interactive 3D, then go deeper with seven learning tracks.</p>
          <div className={styles.ctaRow}>
            <Link href={missionHref(FIRST.slug)} className={styles.btnHero} data-track-event="academy_mission_open" data-track-mission={FIRST.slug} data-track-placement="hero">
              <PlayCircle size={20} aria-hidden /> Explore Your First Mission
            </Link>
          </div>
          <p className={styles.heroNote}>
            Mission {FIRST.number}: {FIRST.title} · no account needed · works on phones
          </p>
          <p className={styles.heroLinks}>
            <a href="#tracks">Browse the seven courses</a>
            <a href="#enquire">Classes and workshops: enquire</a>
          </p>
        </div>

        <nav id="missions" className={styles.options} aria-labelledby="missions-title">
          <h2 id="missions-title" className={styles.optionsTitle}>
            Or choose a mission
          </h2>
          <ul>
            {OPTIONS.map((o) => (
              <li key={o.label}>
                <Link
                  href={o.href}
                  className={styles.option}
                  style={{ ["--accent" as string]: o.color, ["--accent-text" as string]: o.tint }}
                  data-track-event={o.event}
                  {...(o.event === "academy_mission_open" ? { "data-track-mission": o.id } : { "data-track-track": o.id })}
                  data-track-placement="hero_options"
                >
                  <span className={styles.optionIcon}>
                    <o.Icon size={22} aria-hidden />
                  </span>
                  <span className={styles.optionText}>
                    <span className={styles.optionLabel}>{o.label}</span>
                    <span className={styles.optionSub}>{o.sub}</span>
                  </span>
                  <span className={styles.optionKind}>{o.kind}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      {/* ── Two learner pathways ── */}
      <section id="levels" className={`${styles.section} ${styles.band}`} aria-labelledby="levels-title">
        <div className={styles.head}>
          <span className={styles.eyebrow}>Two pathways</span>
          <h2 id="levels-title" className={styles.h2}>The same missions, pitched for your age</h2>
          <p className={styles.sectionLede}>Pick one; every track and mission follows it. You can switch at any time.</p>
        </div>
        <LearnerPathways />
      </section>

      {/* ── Seven tracks ── */}
      <section id="tracks" className={styles.section} aria-labelledby="tracks-title">
        <div className={styles.head}>
          <span className={styles.eyebrow}>Seven tracks</span>
          <h2 id="tracks-title" className={styles.h2}>Courses for going deeper</h2>
          <p className={styles.sectionLede}>Each track has its own course description, a lesson plan for each age level, and its online and workshop options.</p>
        </div>
        <ol className={styles.trackList}>
          {TRACKS.map((t, i) => (
            <li key={t.slug}>
              <Link
                href={`/space/academy/${t.slug}`}
                className={styles.trackRow}
                style={{ ["--accent" as string]: t.color }}
                aria-label={`Track ${i + 1}: ${t.title}`}
                aria-describedby={`track-${t.slug}-sub`}
                data-track-event="academy_track_open"
                data-track-track={t.slug}
                data-track-placement="track_list"
              >
                <span className={styles.trackRowIcon}>
                  <TrackIcon name={t.icon} size={20} />
                </span>
                <span className={styles.trackRowText}>
                  <span className={styles.trackRowTitle}>{t.title}</span>
                  <span id={`track-${t.slug}-sub`} className={styles.trackRowTagline}>
                    {t.tagline}
                  </span>
                </span>
                <span className={styles.trackRowBadges}>
                  {t.missions.length > 0 && (
                    <span className={styles.badge} data-kind="mission">
                      3D mission
                    </span>
                  )}
                  {t.formats.offline && (
                    <span className={styles.badge} data-kind="planned">
                      Workshop planned
                    </span>
                  )}
                </span>
                <ArrowRight size={18} aria-hidden className={styles.trackRowArrow} />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Online and offline ── */}
      <section id="formats" className={`${styles.section} ${styles.band}`} aria-labelledby="formats-title">
        <div className={styles.head}>
          <span className={styles.eyebrow}>Online and offline</span>
          <h2 id="formats-title" className={styles.h2}>How you will learn</h2>
          <p className={styles.sectionLede}>Available means you can use it today. Planned means it is not running yet; dates, fees and eligibility will be published first.</p>
        </div>
        <div className={styles.formatCols}>
          <section className={styles.formatCol} aria-labelledby="formats-online">
            <h3 id="formats-online" className={styles.h3}>
              <Monitor size={18} aria-hidden /> Online
            </h3>
            <ul>
              {online.map((f) => (
                <FormatItem key={f.title} f={f} />
              ))}
            </ul>
          </section>
          <section className={styles.formatCol} aria-labelledby="formats-offline">
            <h3 id="formats-offline" className={styles.h3}>
              <MapPin size={18} aria-hidden /> In person
            </h3>
            <ul>
              {offline.map((f) => (
                <FormatItem key={f.title} f={f} />
              ))}
            </ul>
          </section>
        </div>
      </section>

      {/* ── Existing tutorials ── */}
      <section id="resources" className={styles.section} aria-labelledby="resources-title">
        <div className={styles.head}>
          <span className={styles.eyebrow}>Go deeper</span>
          <h2 id="resources-title" className={styles.h2}>Tutorials already on this site</h2>
          <p className={styles.sectionLede}>The tracks build on these. Some are advanced; each track page says which ones fit it.</p>
        </div>
        <details className={styles.more}>
          <summary data-track-event="academy_panel_toggle" data-track-panel="tutorials">
            Show all {TUTORIALS.length} tutorials
          </summary>
          <ul className={styles.refGrid}>
            {TUTORIALS.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className={styles.refLink}>
                  <span className={styles.refLabel}>{t.label}</span>
                  <span className={styles.refNote}>{t.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </section>

      {/* ── Enquire ── */}
      <section id="enquire" className={`${styles.section} ${styles.band}`} aria-labelledby="enquire-title">
        <div className={styles.head}>
          <span className={styles.eyebrow}>Students, parents and schools</span>
          <h2 id="enquire-title" className={styles.h2}>Enquire about classes and workshops</h2>
          <p className={styles.sectionLede}>We will contact you when a cohort or workshop opens. Under-18s enquire with a parent or guardian.</p>
        </div>
        <EnquiryPaths />
      </section>

      <div className={styles.section}>
        <Notices />
      </div>
    </AcademyFrame>
  );
}
