"use client";
// One header for every page, after itelematics.com: the brand on the left,
// five destinations, one action on the right. Below 1024px the destinations
// move to the bottom bar (AppShell) and the header keeps the brand and the
// action. The action is Start Today, or the day to continue once begun.
import Link from "next/link";
import { FRAMEWORK, HEADER_NAV, ROUTES, TOTAL_DAYS, type RouteId } from "../data/framework";
import { useRevenue } from "../state/store";
import css from "../site.module.css";

export default function SiteHeader({ page }: { page: RouteId }) {
  const day = useRevenue((state) => state.day);
  const started = useRevenue((state) => Object.keys(state.completed).length > 0 || Object.keys(state.stages).length > 0);
  const onToday = page === "today";

  return (
    <header className={css.header}>
      <div className={css.headerInner}>
        <Link href={ROUTES.overview} className={css.brand} aria-label={`EV.ENGINEER — ${FRAMEWORK.name}. Overview.`}>
          <span className={css.brandMark} aria-hidden="true" />
          <span className={css.brandText}>
            <span className={css.brandName}>EV.ENGINEER™</span>
            <span className={css.brandSub}>{FRAMEWORK.name}</span>
          </span>
        </Link>
        <nav aria-label="Main" className={css.headerNav}>
          <ul>
            {HEADER_NAV.map((item) => (
              <li key={item.page}>
                <Link href={ROUTES[item.page]} className={css.headerLink} aria-current={page === item.page ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {onToday || started ? (
          <Link href={ROUTES.today} className={css.headerCta} aria-current={onToday ? "page" : undefined} aria-label={`Today: Day ${day} of ${TOTAL_DAYS}`} data-track-event="revenue_framework_start" data-track-source="header">
            Day {day}
            <span className={css.headerCtaOf}> / {TOTAL_DAYS}</span>
          </Link>
        ) : (
          <Link href={ROUTES.today} className={css.headerCta} data-track-event="revenue_framework_start" data-track-source="header">
            Start Today
          </Link>
        )}
      </div>
    </header>
  );
}
