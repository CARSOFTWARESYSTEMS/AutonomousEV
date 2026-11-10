import Link from "next/link";
import { ArrowRight, Box, CheckCircle2, MapPin, Monitor, PlayCircle } from "lucide-react";
import AcademyFrame from "./components/AcademyFrame";
import HeroOrbit from "./components/HeroOrbit";
import LevelSwitch from "./components/LevelSwitch";
import LevelContent from "./components/LevelContent";
import EnquiryPaths from "./components/EnquiryPaths";
import Notices from "./components/Notices";
import TrackIcon from "./components/TrackIcon";
import { LEVELS, LEVEL_ORDER, TRACKS, type TutorialRef } from "./data/curriculum";
import { MISSIONS, missionHref } from "./data/missions";
import { FORMATS } from "./data/programme";
import { academyGraph, academyMetadata } from "./seo";
import styles from "./academy.module.css";

export const metadata = academyMetadata;

/** Every existing tutorial the tracks reference, once each, in first-mention order. */
const TUTORIALS: TutorialRef[] = TRACKS.flatMap((t) => t.tutorials).filter((ref, i, all) => all.findIndex((r) => r.href === ref.href) === i);

export default function SpaceAcademyPage() {
  return (
    <AcademyFrame crumbs={[{ label: "Space", href: "/space" }, { label: "Space Academy" }]} graph={academyGraph()}>
      {/* ── Hero ── */}
      <section className={styles.hero} aria-labelledby="academy-title">
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Space Academy · Ages 14–18</span>
          <h1 id="academy-title" className={styles.h1}>
            Learn space engineering <span className={styles.gradient}>by building it.</span>
          </h1>
          <p className={styles.lede}>
            Seven tracks, from how orbits work to CanSat and model rocketry, each written for two age levels. Start now with interactive 3D missions in your browser; online classes and hands-on workshops are planned.
          </p>
          <LevelSwitch placement="hero" />
          <div className={styles.ctaRow}>
            <Link href={missionHref(MISSIONS[0].slug)} className={styles.btnPrimary} data-track-event="academy_mission_open" data-track-mission={MISSIONS[0].slug} data-track-placement="hero">
              <PlayCircle size={18} aria-hidden /> Play Mission 1: {MISSIONS[0].title}
            </Link>
            <a href="#tracks" className={styles.btnSecondary}>
              Browse the tracks
            </a>
            <a href="#enquire" className={styles.btnGhost}>
              Enquire
            </a>
          </div>
          <ul className={styles.statusRow} aria-label="What is available">
            <li data-status="available">
              <CheckCircle2 size={15} aria-hidden /> {MISSIONS.length} interactive 3D missions: available
            </li>
            <li data-status="planned">Online classes: planned</li>
            <li data-status="planned">CanSat and rocketry workshops: planned</li>
          </ul>
        </div>
        <HeroOrbit />
      </section>

      {/* ── Learning modes ── */}
      <section id="levels" className={styles.section} aria-labelledby="levels-title">
        <div className={styles.head}>
          <span className={styles.eyebrow}>Two learning modes</span>
          <h2 id="levels-title" className={styles.h2}>The same topics, pitched for your age</h2>
          <p className={styles.sectionLede}>Pick your level once; every track and mission follows it. You can switch at any time.</p>
        </div>
        <div className={styles.levelGrid}>
          {LEVEL_ORDER.map((l) => (
            <article key={l} className={styles.levelCard} data-level={l}>
              <span className={styles.levelCardAges}>{LEVELS[l].label}</span>
              <h3 className={styles.h3}>{LEVELS[l].name}</h3>
              <p>{LEVELS[l].summary}</p>
              <ul className={styles.checkList}>
                {l === "foundation" ? (
                  <>
                    <li>Plain-language explanations and worked numbers</li>
                    <li>Arithmetic, ratios and simple formulas</li>
                    <li>Challenges that check you understand the idea</li>
                  </>
                ) : (
                  <>
                    <li>Derivations and standard engineering equations</li>
                    <li>Margins, trade studies and worst cases</li>
                    <li>Stricter pass criteria in every mission</li>
                  </>
                )}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ── Tracks ── */}
      <section id="tracks" className={`${styles.section} ${styles.band}`} aria-labelledby="tracks-title">
        <div className={styles.head}>
          <span className={styles.eyebrow}>Seven tracks</span>
          <h2 id="tracks-title" className={styles.h2}>Choose where to start</h2>
          <p className={styles.sectionLede}>Each track has its own course page and topic map: prerequisites, objectives, modules, physics, activities, a challenge and its pass criteria.</p>
        </div>
        <ul className={styles.trackGrid}>
          {TRACKS.map((t) => (
            <li key={t.slug} className={styles.trackCard} style={{ ["--accent" as string]: t.color }}>
              <div className={styles.trackTop}>
                <span className={styles.trackIcon}>
                  <TrackIcon name={t.icon} size={22} />
                </span>
                <div className={styles.trackBadges}>
                  {t.missions.length > 0 && (
                    <span className={styles.badge} data-kind="mission">
                      <Box size={12} aria-hidden /> 3D mission
                    </span>
                  )}
                  {t.formats.offline && (
                    <span className={styles.badge} data-kind="planned">
                      Workshop planned
                    </span>
                  )}
                </div>
              </div>
              <h3 className={styles.trackTitle}>{t.title}</h3>
              <p className={styles.trackTagline}>{t.tagline}</p>
              <LevelContent
                blocks={Object.fromEntries(
                  LEVEL_ORDER.map((l) => [
                    l,
                    <ul key={l} className={styles.trackObjectives} aria-label={`${LEVELS[l].label}: you will`}>
                      {t.levels[l].objectives.slice(0, 2).map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>,
                  ]),
                ) as Record<"foundation" | "advanced", React.ReactNode>}
              />
              <Link href={`/space/academy/${t.slug}`} className={styles.trackLink} data-track-event="academy_track_open" data-track-track={t.slug} data-track-placement="track_grid">
                Open the {t.title} track <ArrowRight size={16} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Missions ── */}
      <section id="missions" className={styles.section} aria-labelledby="missions-title">
        <div className={styles.head}>
          <span className={styles.eyebrow}>Interactive 3D missions</span>
          <h2 id="missions-title" className={styles.h2}>Learn by doing, in your browser</h2>
          <p className={styles.sectionLede}>Guided steps, hints, challenges and a completion badge. They work on phones, have a 2D view for devices without 3D graphics, and need no account.</p>
        </div>
        <ol className={styles.missionGrid}>
          {MISSIONS.map((m) => (
            <li key={m.slug} className={styles.missionCard} style={{ ["--accent" as string]: m.color }}>
              <div className={styles.missionTop}>
                <span className={styles.missionNumber}>Mission {m.number}</span>
                <span className={styles.badge} data-kind="available">
                  Playable now
                </span>
              </div>
              <h3 className={styles.missionTitle}>{m.title}</h3>
              <p>{m.summary}</p>
              <ul className={styles.checkList}>
                {m.youWill.map((y) => (
                  <li key={y}>{y}</li>
                ))}
              </ul>
              <Link href={missionHref(m.slug)} className={styles.btnPrimary} data-track-event="academy_mission_open" data-track-mission={m.slug} data-track-placement="mission_grid">
                <PlayCircle size={18} aria-hidden /> Play {m.title}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Formats ── */}
      <section id="formats" className={`${styles.section} ${styles.band}`} aria-labelledby="formats-title">
        <div className={styles.head}>
          <span className={styles.eyebrow}>Online and offline</span>
          <h2 id="formats-title" className={styles.h2}>How you will learn</h2>
          <p className={styles.sectionLede}>What is marked Available you can use today. Everything marked Planned is not running yet; its dates, fees and eligibility will be published first.</p>
        </div>
        <ul className={styles.formatGrid}>
          {FORMATS.map((f) => (
            <li key={f.title} className={styles.formatCard}>
              <div className={styles.formatTop}>
                <span className={styles.formatMode}>
                  {f.mode === "Online" ? <Monitor size={15} aria-hidden /> : <MapPin size={15} aria-hidden />} {f.mode}
                </span>
                <span className={styles.badge} data-kind={f.status === "Available" ? "available" : "planned"}>
                  {f.status}
                </span>
              </div>
              <h3 className={styles.h3}>{f.title}</h3>
              <p>{f.description}</p>
              <ul className={styles.checkList}>
                {f.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Existing tutorials ── */}
      <section id="resources" className={styles.section} aria-labelledby="resources-title">
        <div className={styles.head}>
          <span className={styles.eyebrow}>Go deeper</span>
          <h2 id="resources-title" className={styles.h2}>Tutorials already on this site</h2>
          <p className={styles.sectionLede}>The tracks build on these. Some are advanced; each track page says which ones fit it.</p>
        </div>
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
      </section>

      {/* ── Enquire ── */}
      <section id="enquire" className={`${styles.section} ${styles.band}`} aria-labelledby="enquire-title">
        <div className={styles.head}>
          <span className={styles.eyebrow}>Students, parents and schools</span>
          <h2 id="enquire-title" className={styles.h2}>Enquire about classes and workshops</h2>
          <p className={styles.sectionLede}>Tell us you are interested and we will contact you when a cohort or workshop opens. Under-18s enquire with a parent or guardian.</p>
        </div>
        <EnquiryPaths />
      </section>

      <div className={styles.section}>
        <Notices />
      </div>
    </AcademyFrame>
  );
}
