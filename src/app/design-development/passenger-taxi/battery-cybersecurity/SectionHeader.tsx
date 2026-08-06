import styles from "./page.module.css";

export function SectionHeader({
  label,
  title,
  headingId,
  children,
}: {
  label: string;
  title: string;
  headingId: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.sectionIntro}>
      <span className={styles.sectionLabel}>{label}</span>
      <h2 id={headingId}>{title}</h2>
      {children}
    </div>
  );
}
