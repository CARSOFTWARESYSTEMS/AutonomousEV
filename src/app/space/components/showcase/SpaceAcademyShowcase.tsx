// "Your mission starts in Space Academy": one full-width feature in the
// showcase's layout. Left: the Academy's three learning artefacts, a CubeSat,
// a model rocket and a CanSat, at true relative scale on separate plinths.
// Right: the introduction, the two age groups, the three playable missions
// and the way in. Below: the planned Space Health Explorers programme.
import Link from "next/link";
import { ArrowRight, Moon, Rocket, Satellite } from "lucide-react";
import { MISSIONS, missionHref } from "../../academy/data/missions";
import { educationAreas } from "../../spaceData";
import ShowcaseVisual from "./ShowcaseVisual";
import { AcademyPoster } from "./posters";
import styles from "./showcase.module.css";

const ACADEMY_HREF = "/space/academy";

const MISSION_ICON: Record<string, typeof Satellite> = { "build-your-first-cubesat": Satellite, "survive-the-eclipse": Moon, "stable-model-rocket": Rocket };
const MISSION_TINT: Record<string, string> = { "#3B82F6": "#93C5FD", "#7C3AED": "#C4B5FD", "#F59E0B": "#FCD34D" };

export default function SpaceAcademyShowcase({ pill }: { pill: React.ReactNode }) {
  return (
    <div className={styles.academy}>
      <article className={styles.card} style={{ ["--accent" as string]: "#8B5CF6", ["--accent-text" as string]: "#C4B5FD" }} aria-labelledby="education-title">
        <ShowcaseVisual
          topic="academy"
          name="Academy exhibits"
          label="Three exhibits on separate plinths, at true relative scale: a 10 cm CubeSat with an orbit path drawn round it, a 50 cm model rocket, and a drink-can-sized CanSat under its parachute."
          caption="A CubeSat (10 cm), a model rocket (50 cm) and a CanSat (a drink can), side by side at the same scale. Separate exhibits, not one scene."
          poster={<AcademyPoster />}
        />
        <div className={styles.content}>
          <span className={styles.label}>Ages 14–18 · Space Academy</span>
          <h2 id="education-title" className={styles.titleLarge}>
            Your mission starts in Space Academy
          </h2>
          <p className={styles.lead}>Learn space technology through interactive 3D missions, guided experiments, CanSat exploration and model rocketry.</p>
          <p className={styles.status}>Seven learning tracks for ages 14&ndash;16 and 17&ndash;18, and interactive 3D missions you can play in your browser. Online classes and CanSat and Model Rocketry workshops are planned.</p>
          <ul className={styles.ages} aria-label="Two age groups">
            <li>
              <strong>Ages 14&ndash;16</strong> Foundation: basic to intermediate
            </li>
            <li>
              <strong>Ages 17&ndash;18</strong> Advanced
            </li>
          </ul>
          <ol className={styles.missions} aria-label="Interactive 3D missions">
            {MISSIONS.map((m) => {
              const Icon = MISSION_ICON[m.slug] ?? Satellite;
              return (
                <li key={m.slug}>
                  <Link
                    href={missionHref(m.slug)}
                    className={styles.mission}
                    style={{ ["--m" as string]: m.color, ["--m-text" as string]: MISSION_TINT[m.color] ?? "#C4B5FD" }}
                    data-track-event="space_academy_entry_click"
                    data-track-placement="education_mission"
                    data-track-mission={m.slug}
                  >
                    <span className={styles.missionIcon}>
                      <Icon size={20} aria-hidden />
                    </span>
                    <span className={styles.missionText}>
                      <span className={styles.missionKicker}>Mission {m.number} · playable now</span>
                      <span className={styles.missionTitle}>{m.title}</span>
                    </span>
                    <ArrowRight size={16} aria-hidden className={styles.missionArrow} />
                  </Link>
                </li>
              );
            })}
          </ol>
          <div className={styles.actions}>
            <Link href={ACADEMY_HREF} className={`${styles.cta} ${styles.ctaPrimary}`} data-track-event="space_academy_entry_click" data-track-placement="education">
              Explore Space Academy <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </article>

      <details className={styles.explorers}>
        <summary data-track-event="space_panel_toggle" data-track-panel="space_health_explorers">
          <span className={styles.explorersTitle}>Space Health Explorers</span>
          {pill}
        </summary>
        <div className={styles.explorersBody}>
          <p>
            <strong>How does a spacecraft know whether it is healthy?</strong> Space Health Explorers is a planned programme for students aged 14&ndash;18 exploring spacecraft health from first principles.
          </p>
          <ul className={styles.explorersTags} aria-label="Planned learning areas">
            {educationAreas.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}
