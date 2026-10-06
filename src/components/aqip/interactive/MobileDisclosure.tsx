"use client";

import { useId, useState, type ReactNode } from "react";
import css from "../interactive.module.css";

interface MobileDisclosureProps {
  title: string;
  children: ReactNode;
  /** Open on phones when the page loads. */
  defaultOpen?: boolean;
  /** The named grid area the panel takes in a wide layout. */
  area?: string;
}

/**
 * A titled panel that is always open on wide screens and expandable on phones.
 * The title is rendered twice, as plain text and as a button, and the
 * stylesheet shows the one that suits the layout, so each layout exposes the
 * right control to assistive technology. The body is always in the document.
 */
export default function MobileDisclosure({ title, children, defaultOpen = false, area }: MobileDisclosureProps) {
  const uid = useId();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={css.mobileDisclosure} style={area ? { gridArea: area } : undefined}>
      <h4 className={css.mobileDisclosureTitle}>
        <span className={css.wideOnly}>{title}</span>
        <button type="button" className={css.narrowOnly} aria-expanded={open} aria-controls={`${uid}-body`} onClick={() => setOpen(!open)}>
          <span>{title}</span>
          <span className={css.mdChevron} aria-hidden="true" />
        </button>
      </h4>
      <div id={`${uid}-body`} className={css.mobileDisclosureBody} data-open={open ? "" : undefined}>
        {children}
      </div>
    </div>
  );
}
