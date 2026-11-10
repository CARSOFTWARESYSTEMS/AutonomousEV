import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, Monitor, PlayCircle } from "lucide-react";
import AcademyFrame from "../components/AcademyFrame";
import LevelSwitch from "../components/LevelSwitch";
import LevelContent from "../components/LevelContent";
import Notices from "../components/Notices";
import TrackIcon from "../components/TrackIcon";
import TrackToc from "../components/TrackToc";
import { LEVELS, LEVEL_ORDER, TRACKS, trackBySlug, type Level, type LevelPlan, type Track } from "../data/curriculum";
import { missionBySlug, missionHref } from "../data/missions";
import { trackGraph, trackMetadata } from "../seo";
import styles from "../academy.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRACKS.map((t) => ({ track: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  const t = trackBySlug(track);
  return t ? trackMetadata(t) : {};
}

const SECTIONS = [
  { id: "topics", label: "Topic map" },
  { id: "prerequisites", label: "Prerequisites" },
  { id: "objectives", label: "Objectives" },
  { id: "physics", label: "Physics & maths" },
  { id: "models", label: "3D models" },
  { id: "activities", label: "Activities" },
  { id: "challenge", label: "Challenge" },
  { id: "outcomes", label: "Outcomes" },
  { id: "tutorials", label: "Tutorials" },
  { id: "formats", label: "Classes & workshops" },
];
/** Sections that exist once per level. */
const LEVEL_SECTIONS = SECTIONS.slice(0, 8).map((s) => s.id);

function LevelPlanView({ plan, level, track }: { plan: LevelPlan; level: Level; track: Track }) {
  // Each level renders its own copy of the section ids, prefixed, so both copies can sit in the HTML.
  const sid = (id: string) => (level === "foundation" ? id : `${id}-advanced`);
  return (
    <>
      <section id={sid("topics")} className={styles.block} aria-labelledby={`${sid("topics")}-h`}>
        <h2 id={`${sid("topics")}-h`} className={styles.h3}>
          Topic map · {LEVELS[level].label}
        </h2>
        <ol className={styles.topicMap} style={{ ["--accent" as string]: track.color }}>
          {plan.modules.map((m) => (
            <li key={m.title} className={styles.topicModule}>
              <h4>{m.title}</h4>
              <ul>
                {m.topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
      <section id={sid("prerequisites")} className={styles.block}>
        <h2 className={styles.h3}>Prerequisites</h2>
        <ul className={styles.plainList}>
          {plan.prerequisites.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>
      <section id={sid("objectives")} className={styles.block}>
        <h2 className={styles.h3}>Learning objectives</h2>
        <ul className={styles.checkList}>
          {plan.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>
      <section id={sid("physics")} className={styles.block}>
        <h2 className={styles.h3}>Physics and mathematics</h2>
        <div className={styles.eqGrid}>
          {plan.physics.map((e) => (
            <div key={e.name} className={styles.aboutCard}>
              <span className={styles.badge} data-kind="mission" style={{ alignSelf: "flex-start" }}>
                {e.name}
              </span>
              <p style={{ fontFamily: '"Cambria Math", "STIX Two Math", Georgia, serif', fontSize: 19, color: "#fff" }}>{e.expression}</p>
              <p className={styles.small}>{e.units}</p>
              <p>{e.explain}</p>
            </div>
          ))}
        </div>
      </section>
      <section id={sid("models")} className={styles.block}>
        <h2 className={styles.h3}>3D models</h2>
        <ul className={styles.plainList}>
          {plan.models3d.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>
      <section id={sid("activities")} className={styles.block}>
        <h2 className={styles.h3}>Hands-on activities</h2>
        <ul className={styles.plainList}>
          {plan.activities.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>
      <section id={sid("challenge")} className={styles.block}>
        <h2 className={styles.h3}>Challenge: {plan.challenge.title}</h2>
        <div className={styles.challenge}>
          <p>{plan.challenge.design}</p>
          <h3 className={styles.h4}>Pass criteria</h3>
          <ul className={styles.checkList}>
            {plan.challenge.pass.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>
      <section id={sid("outcomes")} className={styles.block}>
        <h2 className={styles.h3}>Expected learning outcomes</h2>
        <ul className={styles.checkList}>
          {plan.outcomes.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track: slug } = await params;
  const track = trackBySlug(slug);
  if (!track) notFound();
  const index = TRACKS.indexOf(track);
  const prev = TRACKS[index - 1];
  const next = TRACKS[index + 1];
  const missions = track.missions.map(missionBySlug).filter((m) => m !== undefined);

  return (
    <AcademyFrame crumbs={[{ label: "Space", href: "/space" }, { label: "Space Academy", href: "/space/academy" }, { label: track.title }]} graph={trackGraph(track)}>
      <header className={styles.trackHero} style={{ ["--accent" as string]: track.color }}>
        <div className={styles.trackHeroTop}>
          <span className={styles.trackHeroIcon}>
            <TrackIcon name={track.icon} size={26} />
          </span>
          <span className={styles.eyebrow}>
            Track {index + 1} of {TRACKS.length} · Ages 14–18
          </span>
        </div>
        <h1 className={styles.h1} style={{ fontSize: "clamp(32px, 4.4vw, 48px)" }}>
          {track.title}
        </h1>
        <p className={styles.lede}>
          <strong style={{ color: "#fff" }}>{track.tagline}.</strong> {track.summary}
        </p>
        <LevelSwitch placement={`track_${track.slug}`} />
        {missions.length > 0 && (
          <div className={styles.ctaRow}>
            {missions.map((m) => (
              <Link key={m.slug} href={missionHref(m.slug)} className={styles.btnPrimary} data-track-event="academy_mission_open" data-track-mission={m.slug} data-track-placement={`track_${track.slug}`}>
                <PlayCircle size={18} aria-hidden /> Play Mission {m.number}: {m.title}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className={styles.trackLayout}>
        <TrackToc sections={SECTIONS} levelSections={LEVEL_SECTIONS} />

        <div>
          <LevelContent
            blocks={Object.fromEntries(LEVEL_ORDER.map((l) => [l, <LevelPlanView key={l} plan={track.levels[l]} level={l} track={track} />])) as Record<Level, React.ReactNode>}
          />

          <section id="tutorials" className={styles.block}>
            <h2 className={styles.h3}>Existing tutorials for this track</h2>
            <ul className={styles.refGrid}>
              {track.tutorials.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className={styles.refLink}>
                    <span className={styles.refLabel}>{t.label}</span>
                    <span className={styles.refNote}>{t.note}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section id="formats" className={styles.block}>
            <h2 className={styles.h3}>Classes and workshops</h2>
            <ul className={styles.noticeList}>
              <li>
                <Monitor size={18} aria-hidden />
                <span>
                  <strong>Online.</strong> {track.formats.online}
                </span>
              </li>
              <li>
                <MapPin size={18} aria-hidden />
                <span>
                  <strong>Offline.</strong> {track.formats.offline ?? "No offline workshop is planned for this track yet; its activities can be done at home or in a school lab."}
                </span>
              </li>
            </ul>
            <div className={styles.ctaRow}>
              <Link href="/space/academy#enquire" className={styles.btnSecondary}>
                Enquire about classes and workshops
              </Link>
            </div>
          </section>

          <nav className={styles.trackNav} aria-label="Other tracks">
            {prev ? (
              <Link href={`/space/academy/${prev.slug}`} className={styles.btnGhost}>
                <ArrowLeft size={16} aria-hidden /> {prev.title}
              </Link>
            ) : (
              <Link href="/space/academy#tracks" className={styles.btnGhost}>
                <ArrowLeft size={16} aria-hidden /> All tracks
              </Link>
            )}
            {next ? (
              <Link href={`/space/academy/${next.slug}`} className={styles.btnGhost}>
                {next.title} <ArrowRight size={16} aria-hidden />
              </Link>
            ) : (
              <Link href="/space/academy#tracks" className={styles.btnGhost}>
                All tracks <ArrowRight size={16} aria-hidden />
              </Link>
            )}
          </nav>
        </div>
      </div>

      <div className={styles.section}>
        <Notices compact />
      </div>
    </AcademyFrame>
  );
}
