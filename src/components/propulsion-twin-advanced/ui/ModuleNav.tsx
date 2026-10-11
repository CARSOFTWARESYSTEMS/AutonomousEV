"use client";
// The tutorial's navigation: twelve modules in one bar that scrolls sideways on
// a narrow screen and never wraps, and the Learn / Engineer / Architect switch.
// The module shown is also the page's address fragment, so every module can be
// linked to, and plain `#module` links elsewhere on the page work as buttons.
import { type KeyboardEvent, useEffect, useRef } from "react";
import { Compass } from "lucide-react";
import { trackAdvancedTwinOnce } from "../analytics";
import { LEVELS, MODULES, PRODUCT } from "../data/product";
import { isModuleId, useLabStore } from "../state/labStore";
import css from "../advancedTwin.module.css";

/** Id of the element that carries the reading depth, as `data-level`. */
export const ROOT_ID = "advanced-propulsion-twin";
const CTO_FRAGMENT = "cto";

export default function ModuleNav() {
  const active = useLabStore((s) => s.module);
  const level = useLabStore((s) => s.level);
  const setModule = useLabStore((s) => s.setModule);
  const setLevel = useLabStore((s) => s.setLevel);
  const openCto = useLabStore((s) => s.openCto);
  const list = useRef<HTMLDivElement>(null);

  // The address decides the opening module, and keeps deciding it: a `#module` link anywhere on the page switches to it.
  useEffect(() => {
    trackAdvancedTwinOnce("advanced_twin_page_view");
    const follow = (scroll: boolean) => {
      const fragment = window.location.hash.slice(1);
      if (fragment === CTO_FRAGMENT) useLabStore.getState().openCto();
      else if (isModuleId(fragment)) useLabStore.getState().setModule(fragment, { scroll });
    };
    follow(window.location.hash.length > 1);
    const onHashChange = () => follow(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Reading depth is applied by the stylesheet, so switching it re-renders nothing.
  useEffect(() => {
    document.getElementById(ROOT_ID)?.setAttribute("data-level", level);
  }, [level]);

  // Keep the selected tab in view where the bar scrolls.
  useEffect(() => {
    const tab = list.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    const bar = list.current;
    if (!tab || !bar) return;
    const left = tab.offsetLeft - bar.clientWidth / 2 + tab.clientWidth / 2;
    bar.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [active]);

  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = MODULES.findIndex((m) => m.id === active);
    const next = event.key === "ArrowRight" ? index + 1 : event.key === "ArrowLeft" ? index - 1 : event.key === "Home" ? 0 : event.key === "End" ? MODULES.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    const target = MODULES[(next + MODULES.length) % MODULES.length];
    setModule(target.id, { scroll: false });
    document.getElementById(`tab-${target.id}`)?.focus();
  };

  return (
    <div className={css.nav}>
      <div ref={list} className={css.navTabs} role="tablist" aria-label="Tutorial modules">
        {MODULES.map((m) => (
          <button key={m.id} id={`tab-${m.id}`} type="button" role="tab" className={css.navTab} aria-selected={active === m.id} aria-controls={m.id} tabIndex={active === m.id ? 0 : -1} onClick={() => setModule(m.id)} onKeyDown={onKey}>
            {m.label}
          </button>
        ))}
      </div>
      <div className={css.navTools}>
        <div className={css.levels} role="group" aria-label="Reading depth">
          {LEVELS.map((l) => (
            <button key={l.id} type="button" className={css.level} aria-pressed={level === l.id} aria-label={l.ariaLabel} onClick={() => setLevel(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
        <button type="button" className={css.ctoButton} onClick={openCto} aria-label={PRODUCT.ctoLabel}>
          <Compass size={14} aria-hidden="true" />
          <span className={css.ctoLong}>{PRODUCT.ctoLabel}</span>
          <span className={css.ctoShort}>CTO View</span>
        </button>
      </div>
    </div>
  );
}
