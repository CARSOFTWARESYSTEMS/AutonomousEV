import { Clock } from "lucide-react";
import styles from "./shared.module.css";
import { formatDate } from "@/lib/trust-center/format";

export default function LastUpdated({ date }: { date: string }) {
  const formatted = formatDate(date);
  if (!formatted) return null;
  return (
    <p className={styles.lastUpdated}>
      <Clock className={styles.badgeIcon} aria-hidden="true" />
      Trust Center content last updated {formatted}
    </p>
  );
}
