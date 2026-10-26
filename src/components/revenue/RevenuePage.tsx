import { FRAMEWORK } from "./data/framework";
import { Internship, Philosophy } from "./sections/Closing";
import { RevenueFooter, RevenueHeader } from "./sections/Chrome";
import Hero from "./sections/Hero";
import css from "./revenue.module.css";
import Workspace from "./workspace/Workspace";

/**
 * The B2B Revenue Engineering platform: its own header, the hero, the daily
 * workspace, the philosophy, the internship, and its own footer — in a theme
 * scoped to this page ("Aerospace Revenue Mission Control").
 *
 * `data-track-manual` tells the site-wide click listener that the page
 * reports its own interactions (see ./analytics), so a button here is not
 * also counted as a generic `cta_click`. Links with `data-track-event` are
 * still reported by that listener.
 */
export default function RevenuePage() {
  return (
    <div id={FRAMEWORK.rootId} className={css.root} data-track-manual="">
      <span id="top" />
      <RevenueHeader />
      <main>
        <Hero />
        <Workspace />
        <Philosophy />
        <Internship />
      </main>
      <RevenueFooter />
    </div>
  );
}
