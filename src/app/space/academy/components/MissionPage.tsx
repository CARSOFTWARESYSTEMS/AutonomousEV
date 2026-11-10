import Link from "next/link";
import AcademyFrame from "./AcademyFrame";
import LevelSwitch from "./LevelSwitch";
import Notices from "./Notices";
import { trackBySlug } from "../data/curriculum";
import { missionBySlug } from "../data/missions";
import { missionGraph } from "../seo";
import styles from "../academy.module.css";

/**
 * The page around a mission. Each route passes its own mission component as
 * children, so a page's bundle carries only its own mission.
 */
export default function MissionPage({ slug, children }: { slug: string; children: React.ReactNode }) {
  const mission = missionBySlug(slug);
  if (!mission) throw new Error(`Unknown mission: ${slug}`);
  const track = trackBySlug(mission.track);
  return (
    <AcademyFrame
      crumbs={[{ label: "Space", href: "/space" }, { label: "Space Academy", href: "/space/academy" }, { label: "Missions", href: "/space/academy#missions" }, { label: mission.title }]}
      graph={missionGraph(mission)}
    >
      <header className={styles.missionHero}>
        <span className={styles.eyebrow}>
          Mission {mission.number}
          {track ? ` · ${track.title}` : ""}
        </span>
        <div className={styles.missionHeroRow}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }}>
            <h1 className={styles.h1} style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>
              {mission.title}
            </h1>
            <p className={styles.sectionLede}>{mission.summary}</p>
          </div>
          <LevelSwitch placement={`mission_${mission.slug}`} />
        </div>
      </header>

      {children}

      <div className={styles.missionAbout}>
        <section className={styles.aboutCard} aria-labelledby="mission-concepts">
          <h2 id="mission-concepts" className={styles.h3}>
            Concepts in this mission
          </h2>
          <ul className={styles.checkList}>
            {mission.concepts.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          {track && (
            <p>
              Part of the{" "}
              <Link href={`/space/academy/${track.slug}`} className={styles.inlineLink}>
                {track.title} track
              </Link>
              , with its full curriculum for both age levels.
            </p>
          )}
        </section>
        <section className={styles.aboutCard} aria-labelledby="mission-model">
          <h2 id="mission-model" className={styles.h3}>
            About the model
          </h2>
          <p>
            The physics is real but simplified, and the numbers are illustrative values chosen for learning. Each step says what it leaves out. It is not a design tool for real flight hardware.
          </p>
          <p>Your progress is saved only in this browser. Nothing you choose here is sent to us, apart from anonymous counts of which steps are completed.</p>
        </section>
      </div>

      <div className={styles.section}>
        <Notices compact />
      </div>
    </AcademyFrame>
  );
}
