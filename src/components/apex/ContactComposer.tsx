"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { COLLABORATION_CATEGORIES } from "@/data/apex/business";
import { APEX_CONTACT_PARTS } from "@/data/apex/founders";
import { APEX_OFFICIAL_SITE_URL } from "@/data/apex/site";
import { ProtectedEmail } from "./ProtectedEmail";
import { apexTrack, trackApex } from "./analytics";
import styles from "./apex.module.css";
import company from "./company.module.css";

/** Topics arriving from "Where can we contribute?" map onto the published categories. */
const TOPIC_TO_CATEGORY: Record<string, string> = {
  gnc: "engineering",
  rf: "engineering",
  software: "engineering",
  "digital-twin": "engineering",
  cybersecurity: "engineering",
  ai: "engineering",
  quality: "engineering",
  "test-infrastructure": "testing",
  materials: "manufacturing",
  academia: "research",
  workforce: "talent",
};

const LIMITS = { name: 80, organisation: 120, role: 80, message: 1500 } as const;

/** Removes control characters (keeping line breaks in the message), trims, and caps the length. */
export function sanitise(value: FormDataEntryValue | null, max: number, multiline = false): string {
  const text = typeof value === "string" ? value : "";
  const cleaned = multiline
    ? text.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").replace(/[^\S\n]+/g, " ").replace(/ *\n */g, "\n")
    : text.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ");
  return cleaned.trim().slice(0, max);
}

export function composeMailto(fields: { category: string; name: string; organisation: string; role: string; message: string }, address: string): string {
  const categoryLabel = COLLABORATION_CATEGORIES.find((item) => item.id === fields.category)?.label ?? "Collaboration";
  const subject = `APEX collaboration — ${categoryLabel}${fields.organisation ? ` — ${fields.organisation}` : ""}`;
  const body = [
    `Area: ${categoryLabel}`,
    `Name: ${fields.name}`,
    fields.organisation ? `Organisation: ${fields.organisation}` : "",
    fields.role ? `Role: ${fields.role}` : "",
    "",
    fields.message,
  ]
    .filter((line, i) => line !== "" || i === 4)
    .join("\n");
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * BUILD WITH APEX. The form composes an email in the visitor's own mail app;
 * nothing is sent to or stored by this site, and analytics records only the
 * chosen category.
 */
export function ContactComposer() {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const topic = new URLSearchParams(window.location.search).get("topic");
    if (!topic || !selectRef.current) return;
    const category = COLLABORATION_CATEGORIES.some((item) => item.id === topic) ? topic : TOPIC_TO_CATEGORY[topic];
    if (category) selectRef.current.value = category;
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields = {
      category: sanitise(data.get("category"), 40),
      name: sanitise(data.get("name"), LIMITS.name),
      organisation: sanitise(data.get("organisation"), LIMITS.organisation),
      role: sanitise(data.get("role"), LIMITS.role),
      message: sanitise(data.get("message"), LIMITS.message, true),
    };
    if (!fields.name || !fields.message) return;
    const address = `${APEX_CONTACT_PARTS.user}@${APEX_CONTACT_PARTS.domain}.${APEX_CONTACT_PARTS.tld}`;
    trackApex("apex_collaboration_click", { topic: COLLABORATION_CATEGORIES.some((item) => item.id === fields.category) ? fields.category : "other", placement: "composer" });
    setOpened(true);
    window.location.href = composeMailto(fields, address);
  };

  return (
    <div className={company.contact}>
      <form className={company.form} onSubmit={onSubmit} aria-describedby="composer-note">
        <div className={company.field}>
          <label htmlFor="apex-category">Area of collaboration</label>
          <select id="apex-category" name="category" ref={selectRef} defaultValue="engineering" required>
            {COLLABORATION_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className={company.fieldRow}>
          <div className={company.field}>
            <label htmlFor="apex-name">Name</label>
            <input id="apex-name" name="name" type="text" required maxLength={LIMITS.name} autoComplete="name" />
          </div>
          <div className={company.field}>
            <label htmlFor="apex-organisation">
              Organisation <span className={company.optional}>optional</span>
            </label>
            <input id="apex-organisation" name="organisation" type="text" maxLength={LIMITS.organisation} autoComplete="organization" />
          </div>
        </div>
        <div className={company.field}>
          <label htmlFor="apex-role">
            Role <span className={company.optional}>optional</span>
          </label>
          <input id="apex-role" name="role" type="text" maxLength={LIMITS.role} autoComplete="organization-title" />
        </div>
        <div className={company.field}>
          <label htmlFor="apex-message">What would you like to discuss?</label>
          <textarea id="apex-message" name="message" rows={6} required maxLength={LIMITS.message} />
        </div>
        <div className={styles.actions}>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
            <Mail size={16} aria-hidden="true" /> Discuss collaboration
          </button>
          <a
            href={APEX_OFFICIAL_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btn} ${styles.btnSecondary}`}
            {...apexTrack("apex_official_site_click", { placement: "contact" })}
          >
            Official APEX website <ArrowUpRight size={16} aria-hidden="true" />
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </a>
        </div>
        <p id="composer-note" className={styles.small}>
          This opens a message in your own email app, addressed to APEX. Nothing is sent to or stored by this site.
        </p>
        {opened && (
          <p className={styles.small} role="status">
            Your email app should now be open. If it did not open, write to <ProtectedEmail placement="composer_fallback" className={styles.textLink} />.
          </p>
        )}
      </form>
    </div>
  );
}
