import { DISPLAY_STATUS_LABEL, DISPLAY_STATUS_MEANING, type DisplayStatus } from "@/data/apex/evidence";
import { CAPABILITY_STATUS_LABEL, type CapabilityStatus } from "@/data/apex/partner-capabilities";
import styles from "./apex.module.css";

/** A maturity label. The shape and the words carry the status; colour only reinforces it. */
export function EvidenceBadge({ status, label, className }: { status: DisplayStatus; label?: string; className?: string }) {
  return (
    <span className={`${styles.badge} ${className ?? ""}`} data-status={status} title={DISPLAY_STATUS_MEANING[status]}>
      <span className={styles.badgeMark} aria-hidden="true" />
      {label ?? DISPLAY_STATUS_LABEL[status]}
    </span>
  );
}

/** How a capability is covered: APEX core, the Gamyaa AeroSystems engineering collaboration, partner proposed, or partner required. */
export function CapabilityBadge({ status }: { status: CapabilityStatus }) {
  return (
    <span className={styles.badge} data-status={status}>
      <span className={styles.badgeMark} aria-hidden="true" />
      {CAPABILITY_STATUS_LABEL[status]}
    </span>
  );
}
