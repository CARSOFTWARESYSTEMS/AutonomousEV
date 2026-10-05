import Image from "next/image";
import Link from "next/link";
import { Activity, ArrowDown, ArrowLeft, BatteryCharging, Cpu, Fan, Monitor, Move3d, Triangle } from "lucide-react";
import DesignInspirationCredit from "@/components/DesignInspirationCredit";
import PreparedBy from "@/components/PreparedBy";
import type { SystemId } from "./types";
import { AIRCRAFT, DESKTOP_RECOMMENDATION, DISCLAIMER, FALLBACK_MESSAGE, OVERVIEW_CARDS, OVERVIEW_FLOW, POSTER, PREPARED_BY, PRODUCT, PROVENANCE } from "./data/uflightReferenceAircraft";
import styles from "./mobile.module.css";

const ICONS: Partial<Record<SystemId, typeof Fan>> = {
  propulsion: Fan,
  energy: BatteryCharging,
  avionics: Cpu,
  flightControl: Move3d,
  structures: Triangle,
  hums: Activity,
};

/**
 * Lightweight overview page. `mobile` is the intended small-screen product;
 * `fallback` is shown on a large viewport that cannot run WebGL. Neither loads
 * the 3D application, and neither is presented as an error.
 */
export default function MobileUFlight({ variant = "mobile" }: { variant?: "mobile" | "fallback" }) {
  const fallback = variant === "fallback";
  const message = fallback ? FALLBACK_MESSAGE : DESKTOP_RECOMMENDATION;
  return (
    <div className={styles.page} data-experience={variant}>
      <header className={styles.header}>
        <Link href={PRODUCT.homeRoute} className={styles.back} aria-label={`Back to ${PRODUCT.homeLabel}`}>
          <ArrowLeft size={15} aria-hidden="true" />
          <span>{PRODUCT.homeLabel}</span>
        </Link>
        <span className={styles.brand} aria-hidden="true">
          {PRODUCT.wordmark}
        </span>
      </header>

      <main id="main-content" className={styles.main}>
        <section className={styles.hero} aria-labelledby="uflight-title">
          <div className={styles.poster}>
            {/* Until the viewport is known this page is also in the desktop HTML, hidden: there the
                smallest candidate is requested instead of the full poster. */}
            <Image src={POSTER.src} alt={POSTER.alt} width={POSTER.width} height={POSTER.height} sizes={fallback ? "(min-width: 1024px) 560px, 100vw" : "(min-width: 1024px) 1px, 100vw"} loading="eager" fetchPriority="high" />
          </div>
          <div className={styles.heroCopy}>
            <h1 id="uflight-title" className={styles.title}>
              {PRODUCT.name}
            </h1>
            <p className={styles.headline}>
              {PRODUCT.headlineLines[0]}
              <br />
              {PRODUCT.headlineLines[1]}
            </p>
            <p className={styles.platform}>{PRODUCT.platform}</p>

            <aside className={styles.recommend} aria-labelledby="recommend-title">
              <p id="recommend-title" className={styles.badge}>
                <Monitor size={13} aria-hidden="true" /> {message.badge}
              </p>
              <p>{message.body}</p>
            </aside>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="monitors-title">
          <p className={styles.sectionLabel}>{AIRCRAFT.name}</p>
          <h2 id="monitors-title" className={styles.sectionTitle}>
            What the aircraft monitors
          </h2>
          <ul className={styles.cards}>
            {OVERVIEW_CARDS.map((card) => {
              const Icon = ICONS[card.id] ?? Cpu;
              return (
                <li key={card.id} className={styles.card}>
                  <Icon size={20} className={styles.cardIcon} aria-hidden="true" />
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardText}>{card.text}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="flow-title">
          <p className={styles.sectionLabel}>Health monitoring</p>
          <h2 id="flow-title" className={styles.sectionTitle}>
            From aircraft to maintenance
          </h2>
          <ol className={styles.flow} aria-label="Health monitoring flow: aircraft, sensors, health monitoring, diagnosis, prognosis, maintenance">
            {OVERVIEW_FLOW.map((node, i) => (
              <li key={node}>
                <span className={styles.flowNode}>{node}</span>
                {i < OVERVIEW_FLOW.length - 1 && <ArrowDown size={14} className={styles.flowArrow} aria-hidden="true" />}
              </li>
            ))}
          </ol>
          <p className={styles.note}>
            {PROVENANCE.platform}. {DISCLAIMER}
          </p>
        </section>

        <div className={styles.prepared}>
          <PreparedBy notes={PREPARED_BY.notes} reviewed={PREPARED_BY.reviewed} reviewedLabel={PREPARED_BY.reviewedLabel} />
          <DesignInspirationCredit />
        </div>
      </main>

      <footer className={styles.footer}>
        <Link href={PRODUCT.homeRoute} className={styles.footerLink}>
          <ArrowLeft size={14} aria-hidden="true" /> {PRODUCT.homeLabel}
        </Link>
        <span>{PRODUCT.name} · EV.ENGINEER™</span>
      </footer>
    </div>
  );
}
