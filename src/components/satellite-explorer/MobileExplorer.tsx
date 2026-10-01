import Image from "next/image";
import Link from "next/link";
import { Aperture, ArrowDown, ArrowRight, Compass, Cpu, Monitor, Radio, Sun, Thermometer } from "lucide-react";
import SpaceHeader from "@/app/space/components/SpaceHeader";
import SpaceFooter from "@/app/space/components/SpaceFooter";
import PreparedBy from "@/components/PreparedBy";
import type { SubsystemId } from "./types";
import { PREPARED_BY, PRODUCT, SATELLITE_REFERENCE, SUBSYSTEMS } from "./data/satelliteReference";
import { DESKTOP_RECOMMENDATION, MISSION_FLOW, OVERVIEW_CARDS } from "./data/missionSequence";
import styles from "./mobile.module.css";

const ICONS: Partial<Record<SubsystemId, typeof Sun>> = {
  power: Sun,
  avionics: Cpu,
  adcs: Compass,
  payload: Aperture,
  communications: Radio,
  thermal: Thermometer,
};

export const POSTER_SRC = "/space/satellite-explorer/poster.jpg";
export const POSTER_ALT = "A 6U Earth-observation satellite with deployed solar arrays in orbit above Earth";
export const WEBGL_UNAVAILABLE = "Interactive 3D rendering is unavailable on this browser or device.";

/**
 * Lightweight learning page. `mobile` is the intended small-screen product;
 * `fallback` is shown on a large viewport that cannot run WebGL.
 */
export default function MobileExplorer({ variant = "mobile" }: { variant?: "mobile" | "fallback" }) {
  const fallback = variant === "fallback";
  return (
    <div className={styles.page} data-experience={variant}>
      <SpaceHeader basePath="/space" />
      <main id="main-content" className={styles.main}>
        <section className={styles.hero} aria-labelledby="explorer-title">
          <div className={styles.poster}>
            {/* Until the viewport is known this page is also in the desktop HTML, hidden: there the
                smallest candidate is requested instead of the full poster. */}
            <Image src={POSTER_SRC} alt={POSTER_ALT} width={1600} height={1200} sizes={fallback ? "(min-width: 1024px) 560px, 100vw" : "(min-width: 1024px) 1px, 100vw"} loading="eager" fetchPriority="high" />
          </div>
          <div className={styles.heroCopy}>
            <h1 id="explorer-title" className={styles.title}>
              {PRODUCT.name}
            </h1>
            <p className={styles.subtitle}>{PRODUCT.subtitle}</p>
            <p className={styles.missionLine}>{SATELLITE_REFERENCE.missionLine}</p>

            <aside className={styles.recommend} aria-labelledby="recommend-title">
              {fallback ? (
                <>
                  <span className={styles.badge}>
                    <Monitor size={13} aria-hidden="true" /> Subsystem overview
                  </span>
                  <p id="recommend-title" className={styles.recommendTitle}>
                    {WEBGL_UNAVAILABLE}
                  </p>
                  <p>The subsystem overview below remains available. For the full 3D experience, open this page in a current desktop browser with hardware acceleration enabled.</p>
                </>
              ) : (
                <>
                  <span className={styles.badge}>
                    <Monitor size={13} aria-hidden="true" /> {DESKTOP_RECOMMENDATION.badge}
                  </span>
                  <p id="recommend-title" className={styles.recommendTitle}>
                    {DESKTOP_RECOMMENDATION.headline}
                  </p>
                  <p>{DESKTOP_RECOMMENDATION.body}</p>
                </>
              )}
            </aside>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="how-title">
          <p className={styles.sectionLabel}>Subsystem overview</p>
          <h2 id="how-title" className={styles.sectionTitle}>
            How a satellite works
          </h2>
          <ul className={styles.cards}>
            {OVERVIEW_CARDS.map((card) => {
              const Icon = ICONS[card.id] ?? Cpu;
              return (
                <li key={card.id} className={styles.card} style={{ "--card-accent": SUBSYSTEMS[card.id].accent } as React.CSSProperties}>
                  <Icon size={20} className={styles.cardIcon} aria-hidden="true" />
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardFlow}>{card.flow}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="flow-title">
          <p className={styles.sectionLabel}>End-to-end mission</p>
          <h2 id="flow-title" className={styles.sectionTitle}>
            From command to data
          </h2>
          <ol className={styles.flow} aria-label="Mission flow: ground, uplink, satellite, payload, downlink, ground">
            {MISSION_FLOW.map((node, i) => (
              <li key={`${node}-${i}`}>
                <span className={styles.flowNode}>{node}</span>
                {i < MISSION_FLOW.length - 1 && <ArrowDown size={14} className={styles.flowArrow} aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="next-title">
          <p className={styles.sectionLabel}>Keep learning</p>
          <h2 id="next-title" className={styles.sectionTitle}>
            Go deeper
          </h2>
          <div className={styles.actions}>
            <Link href={PRODUCT.satelliteEngineeringRoute} className={`${styles.action} ${styles.actionPrimary}`}>
              Satellite Engineering <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href={PRODUCT.cubeTwinRoute} className={styles.action} data-track-event="cubesat_crosslink" data-track-source="explorer_overview">
              CubeTwin <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <p className={styles.note}>{SATELLITE_REFERENCE.disclaimer} Earth imagery: NASA Visible Earth.</p>
        </section>

        <div className={styles.prepared}>
          <PreparedBy notes={PREPARED_BY.notes} reviewed={PREPARED_BY.reviewed} reviewedLabel={PREPARED_BY.reviewedLabel} />
        </div>
      </main>
      <SpaceFooter basePath="/space" />
    </div>
  );
}
