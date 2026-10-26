"use client";
// The framework's app mode: the shared header with Today, Journey, Accounts,
// Pipeline and More from 1024px; below that the same five in a bottom bar.
// Saved progress is read from this browser once, after mount.
import { Building2, Ellipsis, Route, SquareKanban, Target, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { APP_NAV, ROUTES, phaseOf } from "../data/framework";
import { useHydrateRevenue, useRevenue } from "../state/store";
import css from "../app.module.css";
import Footer from "./Footer";
import MoreSheet from "./MoreSheet";
import { AppHeader, type AppSection } from "./SiteHeader";

export type { AppSection };

const ICONS: Record<(typeof APP_NAV)[number]["id"], LucideIcon> = { today: Target, journey: Route, accounts: Building2, pipeline: SquareKanban };

export default function AppShell({ active, children }: { active: AppSection; children: ReactNode }) {
  useHydrateRevenue();
  const day = useRevenue((state) => state.day);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const journeyHref = ROUTES[phaseOf(day).route];

  return (
    <div className={css.app}>
      <AppHeader
        active={active}
        moreOpen={moreOpen}
        onMore={() => setMoreOpen(true)}
        moreButton={(node) => {
          moreButtons.current[0] = node;
        }}
      />

      <div className={css.content}>
        {children}
        <Footer />
      </div>

      <nav className={css.bar} aria-label="Framework essentials">
        <ul>
          {APP_NAV.map((item) => {
            const Icon = ICONS[item.id];
            return (
              <li key={item.id}>
                <Link href={item.id === "journey" ? journeyHref : item.href} className={css.barLink} aria-current={active === item.id ? "page" : undefined}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              ref={(node) => {
                moreButtons.current[1] = node;
              }}
              type="button"
              className={css.barLink}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              aria-current={active === "more" ? "page" : undefined}
              onClick={() => setMoreOpen(true)}
            >
              <Ellipsis size={20} strokeWidth={1.75} aria-hidden="true" />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen ? (
        <MoreSheet
          onClose={() => {
            setMoreOpen(false);
            const visible = moreButtons.current.find((button) => button && button.offsetParent !== null);
            visible?.focus({ preventScroll: true });
          }}
        />
      ) : null}
    </div>
  );
}
