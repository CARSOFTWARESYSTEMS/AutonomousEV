import styles from "./shared.module.css";
import type { TrustSource } from "@/lib/trust-center/types";

export default function TrustSourceBadge({ label }: { label: string; source?: TrustSource }) {
  return <span className={styles.sourceBadge}>{label}</span>;
}
