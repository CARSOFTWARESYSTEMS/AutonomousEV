import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SUDARSHANA_KARKALA } from "@/data/public-entities";
import styles from "./ResearcherCard.module.css";

export interface ResearcherCardProps {
  /** Alt text for the portrait, where a page specifies its own. */
  imageAlt?: string;
  /** The line under the name. EV.ENGINEER™, his engineering identity, unless a page credits him in a role. */
  role?: string;
  /** `data-*` attributes for the profile link, e.g. a page's `data-track-event`. */
  profileLinkProps?: Record<`data-${string}`, string>;
  /** Where the profile link goes, when a page names another copy of the profile. */
  href?: string;
}

export default function ResearcherCard({ imageAlt = `Portrait of ${SUDARSHANA_KARKALA.name}`, role = "EV.ENGINEER™", profileLinkProps, href = "/about/sudarshana-karkala" }: ResearcherCardProps = {}) {
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
          <p className={styles.role}>{role}</p>
        </div>
      </div>
      <Link href={href} className={styles.cta} {...profileLinkProps}>
        View full profile <ArrowRight size={16} />
      </Link>
    </aside>
  );
}
