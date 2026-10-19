import type { ReactNode } from "react";
import styles from "./apex.module.css";

/** "02 — WHAT APEX HAS BUILT": the numbered label of a section. */
export function Eyebrow({ index, children, as: Tag = "p" }: { index?: string; children: ReactNode; as?: "p" | "span" | "div" }) {
  return (
    <Tag className={styles.eyebrow}>
      {index && <span className={styles.eyebrowIndex}>{index}</span>}
      {index && <span className={styles.eyebrowRule} aria-hidden="true" />}
      <span>{children}</span>
    </Tag>
  );
}

export function SectionHead({
  index,
  eyebrow,
  title,
  lead,
  id,
  centered,
  small,
  aside,
  level = 2,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Id of the heading, for aria-labelledby on the section. */
  id?: string;
  centered?: boolean;
  small?: boolean;
  /** Content for the right-hand column on wide screens. */
  aside?: ReactNode;
  level?: 2 | 3;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  const head = (
    <>
      <Eyebrow index={index}>{eyebrow}</Eyebrow>
      <Heading id={id} className={`${styles.h2} ${small ? styles.h2Small : ""}`}>
        {title}
      </Heading>
    </>
  );
  if (aside) {
    return (
      <div className={`${styles.sectionHead} ${styles.sectionHeadSplit}`}>
        <div style={{ display: "grid", gap: 18 }}>
          {head}
          {lead && <p className={styles.lead}>{lead}</p>}
        </div>
        <div>{aside}</div>
      </div>
    );
  }
  return (
    <div className={`${styles.sectionHead} ${centered ? styles.sectionHeadCentered : ""}`}>
      {head}
      {lead && <p className={styles.lead}>{lead}</p>}
    </div>
  );
}
