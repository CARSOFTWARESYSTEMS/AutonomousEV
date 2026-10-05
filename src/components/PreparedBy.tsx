import ResearcherCard, { type ResearcherCardProps } from "./ResearcherCard";
import styles from "./PreparedBy.module.css";

interface PreparedByProps extends ResearcherCardProps {
  /** Attribution lines shown under the profile card, one paragraph each. */
  notes: readonly string[];
  /** ISO date the information was last reviewed, and how it is written out. */
  reviewed: string;
  reviewedLabel: string;
  /** What was reviewed, e.g. "Experience information". */
  reviewedSubject?: string;
}

/**
 * The "Designed by" block: the shared profile card, the page's attribution
 * and the date it was last reviewed. Same card, typography and spacing as on
 * the Satellite Engineering page.
 */
export default function PreparedBy({ notes, reviewed, reviewedLabel, reviewedSubject = "Experience information", imageAlt, profileLinkProps }: PreparedByProps) {
  return (
    <section className={styles.section} aria-label="Designed by">
      <ResearcherCard imageAlt={imageAlt} profileLinkProps={profileLinkProps} />
      {notes.map((note) => (
        <p key={note} className={styles.note}>
          {note}
        </p>
      ))}
      <p className={styles.reviewed}>
        {reviewedSubject} last reviewed: <time dateTime={reviewed}>{reviewedLabel}</time>.
      </p>
    </section>
  );
}
