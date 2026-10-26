"use client";
// The workspace: navigation on the left, the open view in the centre, status
// and evidence on the right. Below 1200px the navigation moves behind a menu
// button; below 900px the status rail follows the content (on Today only);
// below 768px a bottom bar holds the five field-sales essentials.
import { BookOpen, Building2, Ellipsis, Menu, Route, SquareKanban, Target, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { trackRevenue } from "../analytics";
import { NAV_GROUPS, VIEW_LABEL, mobileTabFor, MOBILE_NAV } from "../data/framework";
import { clampDay } from "../logic/missions";
import { useHydrateRevenue, useRevenue } from "../state/store";
import type { ViewId } from "../types";
import css from "../workspace.module.css";
import { GO_EVENT, NavContext, hashFor, parseHash, type Go } from "./nav";
import NavSheet from "./NavSheet";
import StatusRail from "./StatusRail";
import ViewSwitch from "./ViewSwitch";

export const WORKSPACE_ID = "rv-workspace";

const TAB_ICONS: Record<string, LucideIcon> = { today: Target, journey: Route, accounts: Building2, pipeline: SquareKanban, learn: BookOpen };

export default function Workspace() {
  const hydrated = useHydrateRevenue();
  const setDay = useRevenue((state) => state.setDay);
  const [view, setView] = useState<ViewId>("today");
  const [sheetOpen, setSheetOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const sheetButton = useRef<HTMLButtonElement>(null);

  /** Brings the workspace into view and moves focus to the view's heading. */
  const reveal = useCallback(() => {
    const main = mainRef.current;
    if (!main) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    main.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    requestAnimationFrame(() => main.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true }));
  }, []);

  const go: Go = useCallback(
    (next, options) => {
      const destination = { view: next, day: options?.day };
      if (destination.day) setDay(clampDay(destination.day));
      setView(next);
      setSheetOpen(false);
      const hash = hashFor(destination);
      if (window.location.hash !== hash) window.history.pushState(null, "", hash);
      trackRevenue("revenue_view_open", { view: next });
      reveal();
    },
    [reveal, setDay],
  );

  // Follow the address: on arrival, and when Back / Forward or an in-page link changes the hash.
  useEffect(() => {
    if (!hydrated) return;
    const follow = (initial: boolean) => {
      const destination = parseHash(window.location.hash);
      if (!destination) return;
      if (destination.day) setDay(destination.day);
      setView(destination.view);
      if (!initial || window.location.hash) reveal();
    };
    follow(true);
    const onHash = () => follow(false);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
    };
  }, [hydrated, reveal, setDay]);

  // The hero's buttons sit outside this component; they ask for a view with an event.
  useEffect(() => {
    const onRequest = (event: Event) => {
      const detail = (event as CustomEvent<{ view: ViewId; day?: number }>).detail;
      if (detail?.view) go(detail.view, { day: detail.day });
    };
    window.addEventListener(GO_EVENT, onRequest);
    return () => window.removeEventListener(GO_EVENT, onRequest);
  }, [go]);

  const activeTab = mobileTabFor(view);

  return (
    <NavContext.Provider value={go}>
      <section id={WORKSPACE_ID} className={css.workspace} aria-labelledby="rv-workspace-title" data-hydrated={hydrated ? "" : undefined}>
        <h2 id="rv-workspace-title" className={css.srOnly}>
          Revenue Engineering workspace
        </h2>

        <div className={css.toolbar}>
          <p className={css.toolbarCurrent}>
            <span className={css.toolbarLabel}>Workspace</span>
            <span>{VIEW_LABEL[view]}</span>
          </p>
          <button ref={sheetButton} type="button" className={css.toolbarButton} aria-haspopup="dialog" aria-expanded={sheetOpen} onClick={() => setSheetOpen(true)}>
            <Menu size={18} aria-hidden="true" />
            All tools
          </button>
        </div>

        <div className={css.grid}>
          <nav className={css.sidebar} aria-label="Workspace">
            {NAV_GROUPS.map((group) => (
              <div key={group.id} className={css.navGroup}>
                <p className={css.navGroupLabel} id={`rv-nav-${group.id}`}>
                  {group.label}
                </p>
                <ul aria-labelledby={`rv-nav-${group.id}`}>
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={hashFor({ view: item.id })}
                        className={css.navLink}
                        aria-current={item.id === view ? "page" : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          go(item.id);
                        }}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div ref={mainRef} className={css.main} data-view={view}>
            <ViewSwitch view={view} />
          </div>

          <aside className={css.rail} data-view={view} aria-label="Status and evidence">
            <StatusRail />
          </aside>
        </div>

        <nav className={css.bottomNav} aria-label="Workspace essentials">
          <ul>
            {MOBILE_NAV.map((tab) => (
              <li key={tab.id}>
                <a
                  href={hashFor({ view: tab.view })}
                  className={css.bottomLink}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    go(tab.view);
                  }}
                >
                  <Icon icon={TAB_ICONS[tab.id]} />
                  {tab.label}
                </a>
              </li>
            ))}
            <li>
              <button type="button" className={css.bottomLink} aria-haspopup="dialog" aria-expanded={sheetOpen} onClick={() => setSheetOpen(true)}>
                <Icon icon={Ellipsis} />
                More
              </button>
            </li>
          </ul>
        </nav>

        {sheetOpen ? (
          <NavSheet
            current={view}
            onClose={() => {
              setSheetOpen(false);
              sheetButton.current?.focus({ preventScroll: true });
            }}
            onNavigate={go}
          />
        ) : null}
      </section>
    </NavContext.Provider>
  );
}

function Icon({ icon: Glyph }: { icon: LucideIcon }) {
  return <Glyph className={css.bottomIcon} size={20} strokeWidth={1.75} aria-hidden="true" />;
}
