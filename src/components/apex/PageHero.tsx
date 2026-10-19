import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { APEX_NAV, apexHref } from "@/data/apex/site";
import { Eyebrow } from "./SectionHead";
import { apexTrack } from "./analytics";
import styles from "./apex.module.css";

/** The opening of an inner page: label, title, lead, and an optional figure or panel. */
export function PageHero({ eyebrow, index, title, lead, children, aside }: { eyebrow: string; index?: string; title: ReactNode; lead?: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <section className={styles.pageHero} aria-labelledby="page-title">
      <div className={styles.container}>
        <div className={styles.pageHeroGrid}>
          <div className={styles.pageHeroCopy}>
            <Eyebrow index={index}>{eyebrow}</Eyebrow>
            <h1 id="page-title" className={styles.pageTitle}>
              {title}
            </h1>
            {lead && <p className={styles.lead}>{lead}</p>}
            {children}
          </div>
          {aside && <div className={styles.pageHeroMedia}>{aside}</div>}
        </div>
      </div>
    </section>
  );
}

/** The way on to the next part of the story, at the foot of each page. */
export function NextPage({ current }: { current: string }) {
  const index = APEX_NAV.findIndex((item) => item.id === current);
  const next = APEX_NAV[(index + 1) % APEX_NAV.length];
  return (
    <section className={`${styles.section} ${styles.sectionTight}`} aria-label="Next">
      <div className={styles.container}>
        <Link
          href={apexHref(next.path)}
          style={{ display: "grid", gap: 10 }}
          {...apexTrack("apex_nav_click", { item: next.id, placement: "next_page" })}
        >
          <span className={styles.eyebrow}>Next</span>
          <span className={styles.h2} style={{ display: "inline-flex", alignItems: "center", gap: 18 }}>
            {next.id === "home" ? "APEX overview" : next.label} <ArrowRight size={40} aria-hidden="true" style={{ color: "var(--apex-accent)", flexShrink: 0 }} />
          </span>
        </Link>
      </div>
    </section>
  );
}
