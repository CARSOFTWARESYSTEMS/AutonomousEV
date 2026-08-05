import type { ReactNode } from "react";
import shared from "./shared.module.css";
import styles from "./TrustSection.module.css";
import TrustSourceBadge from "./TrustSourceBadge";
import EmptySectionPlaceholder from "./EmptySectionPlaceholder";

export type TrustSectionDisplayMode = "hidden" | "placeholder" | "content";

interface TrustSectionProps {
  id: string;
  heading: string;
  description?: string;
  badgeLabel?: string;
  isEmpty: boolean;
  displayMode: TrustSectionDisplayMode;
  hideEmptySections: boolean;
  placeholderTitle?: string;
  placeholderMessage?: string;
  children: ReactNode;
}

export default function TrustSection({
  id,
  heading,
  description,
  badgeLabel,
  isEmpty,
  displayMode,
  hideEmptySections,
  placeholderTitle,
  placeholderMessage,
  children,
}: TrustSectionProps) {
  if (displayMode === "hidden") return null;
  if (isEmpty && displayMode !== "placeholder" && hideEmptySections) return null;

  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-heading`}>
      <div className="container">
        <header className={shared.sectionHeader}>
          {badgeLabel && (
            <div className={shared.sectionEyebrow}>
              <TrustSourceBadge label={badgeLabel} />
            </div>
          )}
          <h2 id={`${id}-heading`} className={styles.heading}>
            {heading}
          </h2>
          {description && <p className={shared.sectionDescription}>{description}</p>}
        </header>
        {isEmpty ? (
          <EmptySectionPlaceholder title={placeholderTitle} message={placeholderMessage} />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
