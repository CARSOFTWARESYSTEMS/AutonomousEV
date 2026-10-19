"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { trackApex } from "./analytics";
import { PanelContext, type PanelTarget } from "./panelContext";
import { CapabilityDetail, DomainDetail, EngineBlockDetail, PartnerDetail, panelHeading } from "./PanelContent";
import styles from "./apex.module.css";
import panel from "./panel.module.css";

const OPEN_EVENT = {
  capability: "apex_capability_open",
  partner: "apex_partner_open",
  domain: "apex_system_domain_open",
  "engine-block": "apex_engine_block_open",
} as const;

const PARAM = {
  capability: "capability_id",
  partner: "partner_id",
  domain: "domain_id",
  "engine-block": "block_id",
} as const;

export function PanelProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<PanelTarget | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | SVGElement | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const open = useCallback((target: PanelTarget, trigger?: HTMLElement | SVGElement | null) => {
    // The element focus returns to is the one that first opened the panel, not a link followed inside it.
    // Safari does not focus a clicked button, so it is focused here to make it the one focus returns to.
    if (trigger && !dialogRef.current?.open) {
      trigger.focus({ preventScroll: true });
      triggerRef.current = trigger;
    }
    setCurrent(target);
    trackApex(OPEN_EVENT[target.kind], { [PARAM[target.kind]]: target.id });
  }, []);

  const close = useCallback(() => setCurrent(null), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (current && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    }
    if (!current && dialog.open) {
      dialog.close();
    }
    // New content starts at the top.
    bodyRef.current?.scrollTo({ top: 0 });
  }, [current]);

  // Leaving the page closes the panel; unmounting must not leave the page unable to scroll.
  const pathname = usePathname();
  const [panelPath, setPanelPath] = useState(pathname);
  if (panelPath !== pathname) {
    setPanelPath(pathname);
    setCurrent(null);
  }
  useEffect(() => () => {
    document.documentElement.style.overflow = "";
  }, []);

  const onClosed = () => {
    document.documentElement.style.overflow = "";
    setCurrent(null);
    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger && document.contains(trigger)) requestAnimationFrame(() => trigger.focus({ preventScroll: true }));
  };

  const api = useMemo(() => ({ open, close, current }), [open, close, current]);
  const heading = current ? panelHeading(current) : null;

  return (
    <PanelContext.Provider value={api}>
      {children}
      <dialog
        ref={dialogRef}
        className={panel.panel}
        aria-labelledby="apex-panel-title"
        onClose={onClosed}
        onClick={(event) => {
          // A click on the backdrop lands on the dialog element itself.
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className={panel.panelInner}>
          <span className={panel.panelHandle} aria-hidden="true" />
          <div className={panel.panelTop}>
            <div className={panel.panelTitles}>
              {heading && <p className={styles.eyebrow}>{heading.eyebrow}</p>}
              <h2 id="apex-panel-title" className={panel.panelTitle}>
                {heading?.title ?? ""}
              </h2>
            </div>
            <button type="button" className={panel.closeButton} onClick={close} aria-label="Close panel">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div ref={bodyRef} className={panel.panelBody}>
            {current?.kind === "capability" && <CapabilityDetail id={current.id} />}
            {current?.kind === "partner" && <PartnerDetail id={current.id} />}
            {current?.kind === "domain" && <DomainDetail id={current.id} />}
            {current?.kind === "engine-block" && <EngineBlockDetail id={current.id} />}
          </div>
        </div>
      </dialog>
    </PanelContext.Provider>
  );
}
