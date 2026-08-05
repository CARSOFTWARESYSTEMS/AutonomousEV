"use client";

import Link from "next/link";
import styles from "./TrustHero.module.css";
import type { TrustHeroConfig, TrustSource } from "@/lib/trust-center/types";

interface TrustHeroProps {
  hero: TrustHeroConfig;
  onSelectSourceChip: (source: TrustSource) => void;
}

export default function TrustHero({ hero, onSelectSourceChip }: TrustHeroProps) {
  return (
    <section className={styles.hero}>
      <div className="container">
        <span className={styles.eyebrow}>{hero.eyebrow}</span>
        <h1 className={styles.title}>{hero.title}</h1>
        <p className={styles.description}>{hero.description}</p>

        <div className={styles.actions}>
          <Link href={hero.primaryAction.target} className="btn btn-primary" data-track-event="trust_center_view">
            {hero.primaryAction.label}
          </Link>
          <Link href={hero.secondaryAction.target} className="btn btn-secondary">
            {hero.secondaryAction.label}
          </Link>
        </div>

        {hero.sourceChips && hero.sourceChips.length > 0 && (
          <div className={styles.chips} role="group" aria-label="Jump to a trust source">
            {hero.sourceChips.map((chip) => (
              <button
                key={chip.source}
                type="button"
                className={styles.chip}
                onClick={() => onSelectSourceChip(chip.source)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
