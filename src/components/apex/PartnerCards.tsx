"use client";

import { ArrowRight } from "lucide-react";
import { relationshipsForPartner } from "@/data/apex/partner-capabilities";
import { PARTNERS, PARTNER_STATUS_LABEL } from "@/data/apex/partners";
import { usePanel } from "./panelContext";
import styles from "./apex.module.css";
import sections from "./sections.module.css";

/** One card per organisation; each opens the partner panel with every capability it holds. */
export function PartnerCards() {
  const { open } = usePanel();
  return (
    <ul className={sections.partnerGrid} aria-label="Ecosystem organisations">
      {PARTNERS.map((p) => {
        const count = relationshipsForPartner(p.id).length;
        return (
          <li key={p.id} style={{ display: "contents" }}>
            <button
              type="button"
              className={sections.partnerCard}
              data-core={p.id === "apex" ? "" : undefined}
              data-open={p.relationshipStatus === "TO_BE_IDENTIFIED" ? "" : undefined}
              aria-haspopup="dialog"
              onClick={(event) => open({ kind: "partner", id: p.id }, event.currentTarget)}
            >
              <span className={sections.partnerCardHead}>
                <span className={styles.badge} data-status={p.id === "apex" ? "BUILT" : p.relationshipStatus === "TO_BE_IDENTIFIED" ? "PARTNER_REQUIRED" : "CONCEPT"}>
                  <span className={styles.badgeMark} aria-hidden="true" />
                  {PARTNER_STATUS_LABEL[p.relationshipStatus]}
                </span>
                <ArrowRight size={18} aria-hidden="true" style={{ color: "var(--apex-text-3)", flexShrink: 0 }} />
              </span>
              <span className={styles.h3}>{p.name}</span>
              <span className={sections.partnerFocus}>{p.focus}</span>
              <span className={styles.small} style={{ color: "var(--apex-text-2)" }}>
                {p.role}
              </span>
              <span className={sections.partnerMeta}>
                <span>
                  {count} {count === 1 ? "capability" : "capabilities"}
                </span>
                {p.location && <span>{p.location}</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
