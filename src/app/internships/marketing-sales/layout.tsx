import type { Viewport } from "next";
import type { ReactNode } from "react";
import { FRAMEWORK } from "@/components/revenue/data/framework";
import css from "@/components/revenue/site.module.css";

export const viewport: Viewport = {
  themeColor: "#050a10",
};

/**
 * Every page of B2B Revenue Engineering shares one scoped theme. The site's
 * navbar and footer are not drawn here (see ChromeGate): the overview has its
 * public header, the framework's pages their app navigation.
 *
 * `data-track-manual` tells the site-wide click listener that these pages
 * report their own interactions, so a button is not also counted as a
 * generic `cta_click`. Links with `data-track-event` are still reported.
 */
export default function RevenueLayout({ children }: { children: ReactNode }) {
  return (
    <div id={FRAMEWORK.rootId} className={css.root} data-track-manual="">
      {children}
    </div>
  );
}
