"use client";

import Link from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";
import { LINK_EVENTS } from "../analytics";
import { ECOSYSTEM, HEADER_NAV, MENU_CONTACT } from "../data/reference";
import { EcosystemLink } from "./EcosystemMenu";
import css from "../chrome.module.css";

interface MobileMenuProps {
  id: string;
  /** The current header entry, so the menu can mark it. */
  current: string;
  onClose: () => void;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, item: (typeof HEADER_NAV)[number]) => void;
}

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * The menu behind the header's button on phones and tablets: AQIP's sections,
 * the ecosystem and the contact actions, in one scrolling sheet that fits the
 * visible viewport. While it is open the page behind does not scroll, focus
 * stays inside it, and Escape closes it. The header returns focus to its button.
 */
export default function MobileMenu({ id, current, onClose, onNavigate }: MobileMenuProps) {
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const previous = { html: html.style.overflow, body: document.body.style.overflow };
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    sheet.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !sheet.current) return;
      // Keep Tab inside the sheet and the button that opened it.
      const items = [document.getElementById(`${id}-button`), ...sheet.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el): el is HTMLElement => el !== null);
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = previous.html;
      document.body.style.overflow = previous.body;
    };
  }, [id, onClose]);

  return (
    <div ref={sheet} id={id} className={css.sheet} role="dialog" aria-modal="true" aria-label="AQIP menu">
      <nav aria-label="AQIP sections">
        <p className={css.sheetHeading}>AQIP</p>
        <ul className={css.sheetList}>
          {HEADER_NAV.map((item) => (
            <li key={item.id}>
              <a href={`#${item.target}`} className={css.sheetLink} aria-current={item.id === current ? "location" : undefined} onClick={(event) => onNavigate(event, item)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <p className={css.sheetHeading}>Ecosystem</p>
        <ul className={css.sheetList}>
          {ECOSYSTEM.map((entity) => (
            <li key={entity.id}>
              <EcosystemLink entity={entity} placement="menu" onNavigate={onClose} />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className={css.sheetHeading}>Contact</p>
        <ul className={css.sheetList}>
          {MENU_CONTACT.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className={css.sheetLink} onClick={onClose} data-track-event={LINK_EVENTS.cta} data-track-cta={item.id}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
