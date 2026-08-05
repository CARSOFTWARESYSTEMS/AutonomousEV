"use client";

import { useRef } from "react";
import styles from "./TrustSourceNav.module.css";

export interface TrustFilter {
  id: string;
  label: string;
}

interface TrustSourceNavProps {
  filters: TrustFilter[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function TrustSourceNav({ filters, activeId, onSelect }: TrustSourceNavProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % filters.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + filters.length) % filters.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = filters.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      tabRefs.current[nextIndex]?.focus();
      onSelect(filters[nextIndex].id);
    }
  };

  return (
    <nav className={styles.nav} aria-label="Trust Center source filters">
      <div className="container">
        <div className={styles.scroller} role="tablist" aria-label="Filter Trust Center content by source">
          {filters.map((filter, index) => {
            const isActive = filter.id === activeId;
            return (
              <button
                key={filter.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`trust-tab-${filter.id}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className={isActive ? styles.tabActive : styles.tab}
                onClick={() => onSelect(filter.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                data-track-event="trust_source_filter_selected"
                data-track-filter={filter.id}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
