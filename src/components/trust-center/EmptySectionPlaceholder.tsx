import styles from "./shared.module.css";

export default function EmptySectionPlaceholder({
  title = "Coming soon",
  message = "Content is being curated.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateTitle}>{title}</div>
      <p>{message}</p>
    </div>
  );
}
