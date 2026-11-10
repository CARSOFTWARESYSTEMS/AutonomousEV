import { Info, Lock, ShieldCheck, Users } from "lucide-react";
import { DISCLAIMERS, SAFETY_PRINCIPLES } from "../data/programme";
import styles from "../academy.module.css";

/** Eligibility, independence, simulation, safety and privacy notices. Shown on every Academy page. */
export default function Notices({ id = "notices", compact = false }: { id?: string; compact?: boolean }) {
  return (
    <section id={id} className={styles.notices} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={compact ? styles.h3 : styles.h2}>
        Eligibility, independence and privacy
      </h2>
      <ul className={styles.noticeList}>
        <li>
          <ShieldCheck size={18} aria-hidden />
          <span>
            <strong>Independent initiative.</strong> {DISCLAIMERS.independence}
          </span>
        </li>
        <li>
          <Info size={18} aria-hidden />
          <span>
            <strong>No competition eligibility.</strong> {DISCLAIMERS.eligibility}
          </span>
        </li>
        <li>
          <Info size={18} aria-hidden />
          <span>
            <strong>Simulated and illustrative.</strong> {DISCLAIMERS.simulated}
          </span>
        </li>
        <li>
          <Users size={18} aria-hidden />
          <span>
            <strong>Ages.</strong> {DISCLAIMERS.ages}
          </span>
        </li>
        <li>
          <Lock size={18} aria-hidden />
          <span>
            <strong>Privacy.</strong> {DISCLAIMERS.privacy} {DISCLAIMERS.signIn}
          </span>
        </li>
      </ul>
      {!compact && (
        <div className={styles.safety}>
          <h3 className={styles.h3}>Safety principles for rocketry and CanSat content</h3>
          <ul>
            {SAFETY_PRINCIPLES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
