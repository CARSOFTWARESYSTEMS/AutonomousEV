import Footer from "@/components/Footer";
import { AQIP } from "./data/overview";
import { CHAPTERS, EXECUTIVE_SECTIONS, chapterIsExecutive } from "./data/reference";
import AqipHeader from "./interactive/AqipHeader";
import Chapter from "./interactive/Chapter";
import ChapterNav from "./interactive/ChapterNav";
import Runtime from "./interactive/Runtime";
import ViewControls from "./interactive/ViewControls";
import { BusinessGroup, GoToMarketGroup } from "./sections/Business";
import { InvestorGroup, LeadershipGroup } from "./sections/Company";
import { CustomersGroup, ValidationGroup } from "./sections/Customers";
import { Execution90Day, ExecutionGroup, MetricsGroup, RisksGroup } from "./sections/Execution";
import { AQIPHero } from "./sections/Hero";
import { ExecutiveSummary, IndiaOpportunity, ProblemsGroup } from "./sections/Overview";
import { ProductGroup, QualityGraphGroup } from "./sections/Product";
import { Closing, ReferenceGroup } from "./sections/Reference";
import { RoadmapGroup } from "./sections/Roadmap";
import css from "./aqip.module.css";

const [STRATEGY, PRODUCT, ROADMAP, CUSTOMER, BUSINESS, LEADERSHIP, REFERENCE] = CHAPTERS;

/**
 * The AQIP page: its own header, the hero, the view controls, the sticky
 * chapter bar, seven chapters holding the manual's seventeen sections, the
 * closing statement, and the site footer in AQIP's colours.
 *
 * The site's shared navbar and footer are not drawn on this route (see
 * ChromeGate), so the page supplies both. The footer is the shared component,
 * restyled here through the custom properties it already reads.
 *
 * `data-track-manual` tells the site-wide click listener that the page reports
 * its own interactions (see ./analytics), so a button here is not also counted
 * as a generic `cta_click`. Links carrying `data-track-event` are unaffected.
 */
export default function AqipPage() {
  return (
    <div id={AQIP.rootId} className={css.page} data-mode="full" data-track-manual="">
      {/* Without scripts nothing can open a chapter, so none is closed. */}
      <noscript>
        <style>{"[data-aqip-chapter-body]{display:block!important}"}</style>
      </noscript>
      <Runtime rootId={AQIP.rootId} />
      <AqipHeader />
      <main>
        <AQIPHero />
        <ViewControls sections={EXECUTIVE_SECTIONS} />
        <ChapterNav trailingId="closing" />
        <Chapter chapter={STRATEGY} executive={chapterIsExecutive(STRATEGY)}>
          <ExecutiveSummary />
          <IndiaOpportunity />
          <ProblemsGroup />
        </Chapter>
        <Chapter chapter={PRODUCT} executive={chapterIsExecutive(PRODUCT)}>
          <ProductGroup />
          <QualityGraphGroup />
        </Chapter>
        <Chapter chapter={ROADMAP} executive={chapterIsExecutive(ROADMAP)}>
          <RoadmapGroup />
        </Chapter>
        <Chapter chapter={CUSTOMER} executive={chapterIsExecutive(CUSTOMER)}>
          <CustomersGroup />
          <ValidationGroup />
          <GoToMarketGroup />
        </Chapter>
        <Chapter chapter={BUSINESS} executive={chapterIsExecutive(BUSINESS)}>
          <BusinessGroup />
          <InvestorGroup />
        </Chapter>
        <Chapter chapter={LEADERSHIP} executive={chapterIsExecutive(LEADERSHIP)}>
          <LeadershipGroup />
          <ExecutionGroup />
          <MetricsGroup />
          <RisksGroup />
          <Execution90Day />
        </Chapter>
        <Chapter chapter={REFERENCE} executive={chapterIsExecutive(REFERENCE)}>
          <ReferenceGroup />
        </Chapter>
        <Closing />
      </main>
      <div className={css.footerTheme}>
        <Footer />
      </div>
    </div>
  );
}
