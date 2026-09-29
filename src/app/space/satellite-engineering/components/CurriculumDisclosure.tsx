"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "../satellite.module.css";

// Only open/closed state lives on the client. Week content is passed in as
// server-rendered children and is always present in the HTML (hidden with
// the `hidden` attribute when collapsed), so crawlers, answer engines and
// find-in-page tooling all see the full curriculum.

type CurriculumState = {
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  allOpen: boolean;
  setAll: (open: boolean) => void;
};

const CurriculumContext = createContext<CurriculumState | null>(null);

function useCurriculum() {
  const ctx = useContext(CurriculumContext);
  if (!ctx) throw new Error("CurriculumDisclosure components must be rendered inside <CurriculumProvider>.");
  return ctx;
}

export function CurriculumProvider({
  ids,
  defaultOpen = [],
  children,
}: {
  ids: string[];
  defaultOpen?: string[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpen));

  const toggle = useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setAll = useCallback((value: boolean) => setOpen(value ? new Set(ids) : new Set()), [ids]);

  const value = useMemo<CurriculumState>(
    () => ({
      isOpen: (id) => open.has(id),
      toggle,
      allOpen: ids.every((id) => open.has(id)),
      setAll,
    }),
    [open, ids, toggle, setAll],
  );

  return <CurriculumContext.Provider value={value}>{children}</CurriculumContext.Provider>;
}

export function ExpandAllButton({ total }: { total: number }) {
  const { allOpen, setAll } = useCurriculum();
  return (
    <button type="button" className={styles.expandAll} onClick={() => setAll(!allOpen)}>
      {allOpen ? "Collapse all weeks" : `Expand all ${total} weeks`}
      <ChevronDown size={16} aria-hidden="true" className={allOpen ? styles.chevronOpen : undefined} />
    </button>
  );
}

export function WeekDisclosure({
  id,
  header,
  children,
}: {
  id: string;
  /** Rendered inside the toggle button — phrasing content only. */
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isOpen, toggle } = useCurriculum();
  const open = isOpen(id);
  const buttonId = `${id}-toggle`;
  const panelId = `${id}-panel`;

  return (
    <div className={styles.week} data-open={open || undefined} id={id}>
      <h4 className={styles.weekHeading}>
        <button
          type="button"
          id={buttonId}
          className={styles.weekToggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => toggle(id)}
        >
          {header}
          <span className={styles.weekChevron} aria-hidden="true">
            <ChevronDown size={18} />
          </span>
        </button>
      </h4>
      <div id={panelId} role="region" aria-labelledby={buttonId} className={styles.weekPanel} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
