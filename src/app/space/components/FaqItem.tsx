"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "../portal.module.css";

/** One FAQ answer: in the server-rendered HTML behind a real aria-controls id, hidden until expanded. */
export default function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${q.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  return (
    <div className={styles.faqItem} data-open={open}>
      <button type="button" className={styles.faqButton} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={panelId}>
        <span>{q}</span>
        {open ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
      </button>
      <p id={panelId} hidden={!open} className={styles.faqAnswer}>
        {a}
      </p>
    </div>
  );
}
