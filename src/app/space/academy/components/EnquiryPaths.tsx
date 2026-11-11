"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { ExternalLink, GraduationCap, School, UserRound } from "lucide-react";
import { EOI_FORM_URL } from "@/lib/eoi";
import { academyEvent } from "@/components/space-academy/analytics";
import { ENQUIRY_PATHS, type EnquiryRole } from "../data/programme";
import styles from "../academy.module.css";

const ICONS: Record<EnquiryRole, typeof UserRound> = { student: GraduationCap, parent: UserRound, school: School };
const ORDER: EnquiryRole[] = ["student", "parent", "school"];

/**
 * Three ways to enquire. Nothing is collected on this site: every path ends
 * at the approved Expression of Interest destination (the iTelematics contact
 * page) or this site's contact page. A student's path asks for a parent or
 * guardian's agreement before it shows the link.
 */
export default function EnquiryPaths() {
  const [role, setRole] = useState<EnquiryRole | null>(null);
  const [consent, setConsent] = useState(false);
  const consentId = useId();
  const path = role ? ENQUIRY_PATHS[role] : null;
  const canEnquire = role !== null && (role !== "student" || consent);

  return (
    <div className={styles.enquiry}>
      <div className={styles.roleGrid} role="group" aria-label="Who is enquiring?">
        {ORDER.map((r) => {
          const Icon = ICONS[r];
          return (
            <button
              key={r}
              type="button"
              className={styles.roleButton}
              aria-pressed={role === r}
              aria-controls="academy-enquiry-panel"
              onClick={() => {
                setRole(r);
                setConsent(false);
                academyEvent("academy_enquiry_path", { role: r });
              }}
            >
              <Icon size={20} aria-hidden />
              {ENQUIRY_PATHS[r].label}
            </button>
          );
        })}
      </div>

      <div id="academy-enquiry-panel" className={styles.enquiryPanel} aria-live="polite">
        {!path ? (
          <p className={styles.muted}>Choose who you are to see how to enquire.</p>
        ) : (
          <>
            <p>{path.intro}</p>
            <h3 className={styles.h4}>Have this ready</h3>
            <ul className={styles.checkList}>
              {path.include.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            {path.consent && (
              <label htmlFor={consentId} className={styles.consent}>
                <input id={consentId} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>{path.consent}</span>
              </label>
            )}
            <div className={styles.ctaRow}>
              {canEnquire ? (
                <a
                  href={EOI_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnPrimary}
                  aria-label="Express Interest in Space Academy (opens the iTelematics contact page in a new tab)"
                  data-track-event="academy_enquiry_form_click"
                  data-track-role={role ?? ""}
                >
                  Express Interest <ExternalLink size={16} aria-hidden />
                </a>
              ) : (
                <p className={styles.consentNote}>Tick the box above once your parent or guardian has agreed. Then the link to the contact page appears.</p>
              )}
              {role !== "student" && (
                <Link href="/contact" className={styles.btnGhost} data-track-event="academy_enquiry_contact_click" data-track-role={role ?? ""}>
                  Contact page
                </Link>
              )}
            </div>
            <p className={styles.small}>
              Express Interest opens the iTelematics contact page. Choose &ldquo;Other&rdquo; as the enquiry type and mention Space Academy in your message. The page opens an email draft for you to
              send; it records interest only and does not confirm a place, selection, dates or fees. That site&apos;s own privacy policy and terms apply to what you send.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
