import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SUDARSHANA_KARKALA } from "@/data/public-entities";
import styles from "./ResearcherCard.module.css";

export interface ResearcherCardProps {
  /** Alt text for the portrait, where a page specifies its own. */
  imageAlt?: string;
  /** `data-*` attributes for the profile link, e.g. a page's `data-track-event`. */
  profileLinkProps?: Record<`data-${string}`, string>;
}

export default function ResearcherCard({ imageAlt = `Portrait of ${SUDARSHANA_KARKALA.name}`, profileLinkProps }: ResearcherCardProps = {}) {
  return (
    <aside className={styles.card} aria-label="About the researcher">
      <div className={styles.identity}>
        <Image
          src="/SudarshanaKarkala.jpg"
          alt={imageAlt}
          width={56}
          height={56}
          className={styles.avatar}
        />
        <div className={styles.text}>
          <p className={styles.eyebrow}>Designed by</p>
          <h3 className={styles.name}>{SUDARSHANA_KARKALA.name}</h3>
          <p className={styles.role}>EV.ENGINEER™</p>
        </div>
      </div>
      <Link href="/about/sudarshana-karkala" className={styles.cta} {...profileLinkProps}>
        View full profile <ArrowRight size={16} />
      </Link>
    </aside>
  );
}
