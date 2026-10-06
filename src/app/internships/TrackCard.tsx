import Link from "next/link";
import styles from "./TrackCard.module.css";

export interface TrackLink {
  label: string;
  href: string;
}

interface TrackCardProps {
  eyebrow: string;
  title: string;
  /** A short identity shown under the title, e.g. "AQIP". */
  badge?: string;
  desc: string;
  tags: readonly string[];
  /** The primary action's label, without its arrow. */
  cta: string;
  href: string;
  /** Supporting links, shown smaller than the primary action. */
  links?: readonly TrackLink[];
  trackProps?: Record<`data-${string}`, string>;
}

/** How many tags a phone shows before the rest fold into "+N". */
const VISIBLE_TAGS = 4;

const isExternal = (href: string) => href.startsWith("http");

/**
 * A programme card with one primary action. The whole card is the target for
 * that action; supporting links sit above it and stay separately clickable.
 * Used for the Space & Aerospace Engineering tracks on /internships.
 */
export default function TrackCard({ eyebrow, title, badge, desc, tags, cta, href, links, trackProps }: TrackCardProps) {
  const extra = tags.length - VISIBLE_TAGS;
  return (
    <article className={`glass-panel ${styles.card}`}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h3 className={styles.title}>{title}</h3>
      {badge ? <p className={styles.badge}>{badge}</p> : null}
      <p className={styles.desc}>{desc}</p>
      <ul className={styles.tags} aria-label="Topics">
        {tags.map((tag, i) => (
          <li key={tag} data-extra={i >= VISIBLE_TAGS ? "" : undefined}>
            {tag}
          </li>
        ))}
        {extra > 0 ? (
          <li className={styles.more} aria-label={`and ${extra} more`}>
            +{extra}
          </li>
        ) : null}
      </ul>
      <div className={styles.actions}>
        <Link href={href} className={styles.cta} data-track-event="internship_card_click" data-track-title={title} {...trackProps}>
          {cta}
          <span aria-hidden="true" className={styles.arrow}>
            →
          </span>
        </Link>
        {links ? (
          <ul className={styles.links} aria-label={`More for ${title}`}>
            {links.map((link) => (
              <li key={link.href}>
                {isExternal(link.href) ? (
                  <a href={link.href} target="_blank" rel="noopener noreferrer" data-track-event="internship_secondary_click" data-track-title={title}>
                    {link.label}{" "}
                    <span aria-hidden="true">↗</span>
                    <span className={styles.srOnly}>(opens in a new tab)</span>
                  </a>
                ) : (
                  <a href={link.href} data-track-event="internship_secondary_click" data-track-title={title}>
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
