import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, Monitor, PlayCircle } from "lucide-react";
import AcademyFrame from "../components/AcademyFrame";
import LevelSwitch from "../components/LevelSwitch";
import LevelContent from "../components/LevelContent";
import Notices from "../components/Notices";
import TrackIcon from "../components/TrackIcon";
import TrackToc from "../components/TrackToc";
import PartIndex from "../components/PartIndex";
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

/** The page's three parts, kept apart: what the course is, how it is taught, and where. */
const PARTS = [
  { id: "course", label: "Course" },
  { id: "lesson-plan", label: "Lesson plan" },
  { id: "formats", label: "Classes & workshops" },
  { id: "tutorials", label: "Tutorials" },
];

/** Each level renders its own copy of a section id, suffixed, so both copies can sit in the HTML. */
const sidFor = (level: Level) => (id: string) => (level === "foundation" ? id : `${id}-advanced`);

/** Course description for one level: who it is for, what it achieves. */
function CourseView({ plan, level }: { plan: LevelPlan; level: Level }) {
  const sid = sidFor(level);
  return (
    <div className={styles.courseGrid}>
      <section id={sid("prerequisites")} className={styles.courseCard} aria-labelledby={`${sid("prerequisites")}-h`}>
        <h3 id={`${sid("prerequisites")}-h`} className={styles.h4}>
          Before you start
        </h3>
        <ul className={styles.plainList}>
          {plan.prerequisites.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>
      <section id={sid("objectives")} className={styles.courseCard} aria-labelledby={`${sid("objectives")}-h`}>
        <h3 id={`${sid("objectives")}-h`} className={styles.h4}>
          Learning objectives
        </h3>
        <ul className={styles.checkList}>
          {plan.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>
      <section id={sid("outcomes")} className={styles.courseCard} aria-labelledby={`${sid("outcomes")}-h`}>
        <h3 id={`${sid("outcomes")}-h`} className={styles.h4}>
          By the end you can
        </h3>
        <ul className={styles.checkList}>
          {plan.outcomes.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** Lesson plan for one level: the lessons in order, what learners do, the challenge, and the maths on request. */
function LessonPlanView({ plan, level, track }: { plan: LevelPlan; level: Level; track: Track }) {
  const sid = sidFor(level);
  return (
    <>
      <section id={sid("topics")} className={styles.block} aria-labelledby={`${sid("topics")}-h`}>
        <h3 id={`${sid("topics")}-h`} className={styles.h3}>
          Lessons · {LEVELS[level].label}
        </h3>
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
      <section id={sid("activities")} className={styles.block} aria-labelledby={`${sid("activities")}-h`}>
        <h3 id={`${sid("activities")}-h`} className={styles.h3}>
          Hands-on activities
        </h3>
        <ul className={styles.plainList}>
          {plan.activities.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>
      <section id={sid("challenge")} className={styles.block} aria-labelledby={`${sid("challenge")}-h`}>
        <h3 id={`${sid("challenge")}-h`} className={styles.h3}>
          Challenge: {plan.challenge.title}
        </h3>
        <div className={styles.challenge}>
          <p>{plan.challenge.design}</p>
          <h4 className={styles.h4}>Pass criteria</h4>
          <ul className={styles.checkList}>
            {plan.challenge.pass.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>
      <section id={sid("physics")} className={styles.block} aria-labelledby={`${sid("physics")}-h`}>
        <h3 id={`${sid("physics")}-h`} className={styles.h3}>
          Physics and mathematics
        </h3>
        {/* Optional at 14–16, central at 17–18: open by default for the Advanced level. */}
        <details className={styles.more} open={level === "advanced"}>
          <summary data-track-event="academy_panel_toggle" data-track-panel={`${track.slug}_physics_${level}`}>
            {plan.physics.length === 1 ? "Show the equation" : `Show the ${plan.physics.length} equations`}
          </summary>
          <div className={styles.eqGrid}>
            {plan.physics.map((e) => (
              <div key={e.name} className={styles.aboutCard}>
                <span className={styles.badge} data-kind="mission" style={{ alignSelf: "flex-start" }}>
                  {e.name}
                </span>
                <p className={styles.eqLine}>{e.expression}</p>
                <p className={styles.small}>{e.units}</p>
                <p>{e.explain}</p>
              </div>
            ))}
          </div>
        </details>
      </section>
      <section id={sid("models")} className={styles.block} aria-labelledby={`${sid("models")}-h`}>
        <h3 id={`${sid("models")}-h`} className={styles.h3}>
          3D models
        </h3>
        <ul className={styles.plainList}>
          {plan.models3d.map((m) => (
            <li key={m}>{m}</li>
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
  const blocks = (View: (props: { plan: LevelPlan; level: Level; track: Track }) => React.ReactNode) =>
    Object.fromEntries(LEVEL_ORDER.map((l) => [l, <View key={l} plan={track.levels[l]} level={l} track={track} />])) as Record<Level, React.ReactNode>;

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
        <p className={styles.lede}>{track.tagline}.</p>
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

      <TrackToc sections={PARTS} />

      {/* ── 1. Course description ── */}
      <section id="course" className={styles.part} aria-labelledby="course-title">
        <div className={styles.partHead}>
          <span className={styles.partNumber}>1</span>
          <h2 id="course-title" className={styles.h2}>
            Course
          </h2>
        </div>
        <p className={styles.partLede}>{track.summary}</p>
        <PartIndex
          label="Course sections"
          sections={[
            { id: "prerequisites", label: "Prerequisites" },
            { id: "objectives", label: "Objectives" },
            { id: "outcomes", label: "Outcomes" },
          ]}
        />
        <LevelContent blocks={blocks(CourseView)} />
      </section>

      {/* ── 2. Lesson plan ── */}
      <section id="lesson-plan" className={styles.part} aria-labelledby="lesson-plan-title">
        <div className={styles.partHead}>
          <span className={styles.partNumber}>2</span>
          <h2 id="lesson-plan-title" className={styles.h2}>
            Lesson plan
          </h2>
        </div>
        <PartIndex
          label="Lesson plan sections"
          sections={[
            { id: "topics", label: "Lessons" },
            { id: "activities", label: "Activities" },
            { id: "challenge", label: "Challenge" },
            { id: "physics", label: "Physics & maths" },
            { id: "models", label: "3D models" },
          ]}
        />
        <LevelContent blocks={blocks(LessonPlanView)} />
      </section>

      {/* ── 3. Classes and workshops ── */}
      <section id="formats" className={styles.part} aria-labelledby="formats-title">
        <div className={styles.partHead}>
          <span className={styles.partNumber}>3</span>
          <h2 id="formats-title" className={styles.h2}>
            Classes and workshops
          </h2>
        </div>
        <div className={styles.formatCols}>
          <section className={styles.formatCol} aria-labelledby="track-online">
            <h3 id="track-online" className={styles.h3}>
              <Monitor size={18} aria-hidden /> Online
            </h3>
            <p>{track.formats.online}</p>
          </section>
          <section className={styles.formatCol} aria-labelledby="track-offline">
            <h3 id="track-offline" className={styles.h3}>
              <MapPin size={18} aria-hidden /> In person
            </h3>
            <p>{track.formats.offline ?? "No offline workshop is planned for this track yet; its activities can be done at home or in a school lab."}</p>
          </section>
        </div>
        <div className={styles.ctaRow}>
          <Link href="/space/academy#enquire" className={styles.btnSecondary}>
            Enquire about classes and workshops
          </Link>
        </div>
      </section>

      {/* ── Existing tutorials ── */}
      <section id="tutorials" className={styles.part} aria-labelledby="tutorials-title">
        <h2 id="tutorials-title" className={styles.h3}>
          Existing tutorials for this track
        </h2>
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

      <div className={styles.section}>
        <Notices compact />
      </div>
    </AcademyFrame>
  );
}
