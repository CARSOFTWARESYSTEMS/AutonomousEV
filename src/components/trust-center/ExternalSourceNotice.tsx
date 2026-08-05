import { Info } from "lucide-react";
import styles from "./shared.module.css";

export default function ExternalSourceNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.notice} role="note">
      <Info className={styles.noticeIcon} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
