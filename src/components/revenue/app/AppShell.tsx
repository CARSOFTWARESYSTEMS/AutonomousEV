"use client";
// Every page's frame: the header, the page, the footer, and below 1024px a
// bottom bar — Today, Journey, Customer, Sales, More — so each screen has the
// same few places to go. Saved progress is read from this browser once, after
// mount.
import { Ellipsis, Handshake, Route, Target, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { BAR_NAV, BAR_OF, type RouteId } from "../data/framework";
import { useHydrateRevenue } from "../state/store";
import css from "../app.module.css";
import Footer from "./Footer";
import MoreSheet from "./MoreSheet";
import SiteHeader from "./SiteHeader";

const ICONS: Record<(typeof BAR_NAV)[number]["id"], LucideIcon> = { today: Target, journey: Route, customer: Users, sales: Handshake };

export default function AppShell({ page, children }: { page: RouteId; children: ReactNode }) {
  useHydrateRevenue();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);
  const current = BAR_OF[page];

  return (
    <div className={css.app} data-page={page}>
      <SiteHeader page={page} />
      <main className={css.content}>{children}</main>
      <Footer />

      <nav className={css.bar} aria-label="Essentials">
        <ul>
          {BAR_NAV.map((item) => {
            const Icon = ICONS[item.id];
            return (
              <li key={item.id}>
                <Link href={item.href} className={css.barLink} aria-current={current === item.id ? "page" : undefined}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button ref={moreButton} type="button" className={css.barLink} aria-haspopup="dialog" aria-expanded={moreOpen} aria-current={current === "more" ? "page" : undefined} onClick={() => setMoreOpen(true)}>
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
            moreButton.current?.focus({ preventScroll: true });
          }}
        />
      ) : null}
    </div>
  );
}
