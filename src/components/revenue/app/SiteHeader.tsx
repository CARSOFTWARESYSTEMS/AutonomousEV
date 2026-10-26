"use client";
// One header for every page of the platform, after itelematics.com: the
// brand on the left, a short row of destinations, one tinted action on the
// right. The overview's destinations are its sections; inside the framework
// they are Today, Journey, Accounts, Pipeline and More. Below 1024px the
// overview's links move into a menu and the framework's into the bottom bar.
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { APP_NAV, FRAMEWORK, PUBLIC_NAV, ROUTES, TOTAL_DAYS, phaseOf } from "../data/framework";
import { useRevenue } from "../state/store";
import css from "../site.module.css";

export type AppSection = "today" | "journey" | "accounts" | "pipeline" | "more";

function Brand({ href }: { href: string }) {
  const inner = (
    <>
      <span className={css.brandMark} aria-hidden="true" />
      <span className={css.brandText}>
        <span className={css.brandName}>EV.ENGINEER™</span>
        <span className={css.brandSub}>{FRAMEWORK.name}</span>
      </span>
    </>
  );
  return href.startsWith("#") ? (
    <a href={href} className={css.brand} aria-label={`EV.ENGINEER — ${FRAMEWORK.name}. Back to the top.`}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={css.brand} aria-label={`EV.ENGINEER — ${FRAMEWORK.name}. Overview.`}>
      {inner}
    </Link>
  );
}

/** The overview's header. */
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    button.current?.focus({ preventScroll: true });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") close();
  };

  return (
    <header className={css.header}>
      <div className={css.headerInner}>
        <Brand href="#top" />
        <nav aria-label="Overview" className={css.headerNav}>
          <ul>
            {PUBLIC_NAV.map((item) => (
              <li key={item.label}>
                {item.href.startsWith("#") ? (
                  <a href={item.href} className={css.headerLink}>
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} className={css.headerLink}>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <Link href={ROUTES.today} className={css.headerCta} data-track-event="revenue_framework_start" data-track-source="header">
          Start Framework
        </Link>
        <button ref={button} type="button" className={css.menuButton} aria-expanded={open} aria-controls="rv-menu" onClick={() => setOpen(!open)}>
          <span className={css.menuIcon} data-open={open ? "" : undefined} aria-hidden="true" />
          <span className={css.srOnly}>{open ? "Close menu" : "Menu"}</span>
        </button>
      </div>
      {open ? (
        <div id="rv-menu" ref={panel} className={css.menu} onKeyDown={onKeyDown}>
          <nav aria-label="Menu">
            <ul>
              {PUBLIC_NAV.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith("#") ? (
                    <a href={item.href} className={css.menuLink} onClick={() => setOpen(false)}>
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className={css.menuLink} onClick={() => setOpen(false)}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <Link href={ROUTES.today} className={css.primaryCta} onClick={() => setOpen(false)}>
            Start Framework
          </Link>
        </div>
      ) : null}
    </header>
  );
}

/** The framework's header: the same brand, its four destinations and More, and today's day. */
export function AppHeader({ active, onMore, moreOpen, moreButton }: { active: AppSection; onMore: () => void; moreOpen: boolean; moreButton: (node: HTMLButtonElement | null) => void }) {
  const day = useRevenue((state) => state.day);
  const journeyHref = ROUTES[phaseOf(day).route];
  return (
    <header className={css.header}>
      <div className={css.headerInner}>
        <Brand href={ROUTES.overview} />
        <nav aria-label="Framework" className={css.headerNav}>
          <ul>
            {APP_NAV.map((item) => (
              <li key={item.id}>
                <Link href={item.id === "journey" ? journeyHref : item.href} className={css.headerLink} aria-current={active === item.id ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button ref={moreButton} type="button" className={css.headerLink} aria-haspopup="dialog" aria-expanded={moreOpen} aria-current={active === "more" ? "page" : undefined} onClick={onMore}>
                More
              </button>
            </li>
          </ul>
        </nav>
        <Link href={ROUTES.today} className={css.headerCta} aria-label={`Today's mission: Day ${day} of ${TOTAL_DAYS}`}>
          Day {day}
          <span className={css.headerCtaOf}> / {TOTAL_DAYS}</span>
        </Link>
      </div>
    </header>
  );
}
