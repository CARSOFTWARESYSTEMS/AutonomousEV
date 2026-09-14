import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SUDARSHANA_KARKALA } from "@/data/public-entities";
import styles from "./ResearcherCard.module.css";

export default function ResearcherCard() {
  return (
    <aside className={styles.card} aria-label="About the researcher">
      <div className={styles.identity}>
        <Image
          src="/SudarshanaKarkala.jpg"
          alt=""
          width={56}
          height={56}
          className={styles.avatar}
        />
        <div className={styles.text}>
          <p className={styles.eyebrow}>Prepared by</p>
          <h3 className={styles.name}>{SUDARSHANA_KARKALA.name}</h3>
          <p className={styles.role}>
            Founder, EV.ENGINEER · Co-Founder, Principal Architect, Thasmai Infotech Private Limited
          </p>
        </div>
      </div>
      <Link href="/about/sudarshana-karkala" className={styles.cta}>
        View full profile <ArrowRight size={16} />
      </Link>
    </aside>
  );
}
