import { ChevronDown } from "lucide-react";
import styles from "./TrustFAQ.module.css";
import type { TrustContentItem } from "@/lib/trust-center/types";

export default function TrustFAQ({ items }: { items: TrustContentItem[] }) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <details key={item.id} className={styles.item}>
          <summary className={styles.summary}>
            {item.title}
            <ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
          </summary>
          <div className={styles.answer}>{item.summary}</div>
        </details>
      ))}
    </div>
  );
}
