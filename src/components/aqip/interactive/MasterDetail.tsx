"use client";

import { Fragment, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { trackAqip, type AqipSelectEvent } from "../analytics";
import css from "../interactive.module.css";

export interface MasterDetailItem {
  id: string;
  label: string;
  /** A short code shown before the label, e.g. "P1". */
  code?: string;
  /** A chip or note shown after the label. */
  meta?: ReactNode;
}

interface MasterDetailProps {
  /** What the list is, for assistive technology. */
  label: string;
  items: readonly MasterDetailItem[];
  /** One panel per item, in the same order. All of them are rendered; only one is shown. */
  panels: readonly ReactNode[];
  /** The event to report when an item is opened. */
  event?: AqipSelectEvent;
}

const WIDE = "(min-width: 900px)";

/**
 * One list, two layouts. On wide screens the items sit in a column with the
 * open item's panel beside them; on phones each panel opens under its own item,
 * as an accordion. Every panel stays in the document, so the content is in the
 * server HTML and in print.
 */
export default function MasterDetail({ label, items, panels, event }: MasterDetailProps) {
  const uid = useId();
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  const select = (index: number) => {
    const wide = typeof window !== "undefined" && window.matchMedia(WIDE).matches;
    // On a phone the open item can be closed again; the wide layout always shows one.
    const next = index === active && !wide ? -1 : index;
    setActive(next);
    if (next < 0) return;
    if (event) trackAqip(event, { item: items[index].id });
    if (wide) return;
    // The panel that was open above has just collapsed: keep the tapped item on screen.
    requestAnimationFrame(() => {
      const tab = root.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
      if (tab && tab.getBoundingClientRect().top < 0) tab.scrollIntoView({ block: "start" });
    });
  };

  return (
    <div ref={root} className={css.md} role="group" aria-label={label} style={{ "--rows": items.length } as CSSProperties}>
      {items.map((item, i) => {
        const open = i === active;
        const tabId = `${uid}-tab-${item.id}`;
        const panelId = `${uid}-panel-${item.id}`;
        return (
          <Fragment key={item.id}>
            <button
              type="button"
              id={tabId}
              className={css.mdTab}
              data-index={i}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => select(i)}
              style={{ "--row": i + 1 } as CSSProperties}
            >
              {item.code ? <span className={css.mdCode}>{item.code}</span> : null}
              <span className={css.mdLabel}>{item.label}</span>
              {item.meta ? <span className={css.mdMeta}>{item.meta}</span> : null}
              <span className={css.mdChevron} aria-hidden="true" />
            </button>
            <div id={panelId} className={css.mdPanel} role="region" aria-labelledby={tabId} hidden={!open}>
              {panels[i]}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
