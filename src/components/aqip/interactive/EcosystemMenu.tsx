"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { LINK_EVENTS, trackAqip } from "../analytics";
import { ECOSYSTEM, type EcosystemEntity } from "../data/reference";
import css from "../chrome.module.css";

/** One ecosystem destination: its name, what it is for, and whether it leaves this site. */
export function EcosystemLink({ entity, placement, onNavigate }: { entity: EcosystemEntity; placement: "header" | "menu"; onNavigate?: () => void }) {
  const tracking = { "data-track-event": LINK_EVENTS.ecosystem, "data-track-destination": entity.id, "data-track-placement": placement };
  const body = (
    <>
      <span className={css.ecoName}>{entity.name}</span>
      <span className={css.ecoPurpose}>{entity.purpose}</span>
      <span className={css.ecoOpen}>
        Open
        {entity.external ? <ArrowUpRight size={14} aria-hidden="true" /> : <ArrowRight size={14} aria-hidden="true" />}
        {entity.external ? <span className={css.srOnly}> (opens in a new tab)</span> : null}
      </span>
    </>
  );
  return entity.external ? (
    <a href={entity.href} target="_blank" rel="noopener noreferrer" className={css.ecoLink} onClick={onNavigate} {...tracking}>
      {body}
    </a>
  ) : (
    <Link href={entity.href} className={css.ecoLink} onClick={onNavigate} {...tracking}>
      {body}
    </Link>
  );
}

/**
 * The header's Ecosystem menu: the four names AQIP sits among. It opens on
 * click, so it never depends on hover, and closes on Escape, on a press
 * outside, and when focus leaves it. Escape returns focus to the button.
 */
export default function EcosystemMenu() {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className={css.eco}
      onBlur={(event) => {
        // Tabbing past the last link closes the menu.
        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        className={css.headerLink}
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        onClick={() => {
          if (!open) trackAqip("aqip_ecosystem_menu_open");
          setOpen(!open);
        }}
      >
        Ecosystem
        <span className={css.chevron} aria-hidden="true" />
      </button>
      <div id={`${uid}-panel`} className={css.ecoPanel} hidden={!open}>
        <p className={css.ecoHeading}>Ecosystem</p>
        <p className={css.ecoIntro}>AQIP belongs to a wider engineering, research and commercial ecosystem. These are separate names with different roles.</p>
        <ul className={css.ecoList}>
          {ECOSYSTEM.map((entity) => (
            <li key={entity.id}>
              <EcosystemLink entity={entity} placement="header" onNavigate={() => setOpen(false)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
