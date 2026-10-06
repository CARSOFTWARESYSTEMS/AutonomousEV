import { AQIP } from "./data/overview";
import { NAV } from "./data/reference";
import StrategyNav from "./interactive/StrategyNav";
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

/**
 * The AQIP strategy page: the hero, the sticky strategy index and its
 * seventeen groups, then the closing statement and attribution.
 *
 * `data-track-manual` tells the site-wide click listener that the page reports
 * its own interactions (see ./analytics), so a button here is not also counted
 * as a generic `cta_click`. Links carrying `data-track-event` are unaffected.
 */
export default function AqipPage() {
  return (
    <div id={AQIP.rootId} className={css.page} data-mode="full" data-track-manual="">
      <AQIPHero />
      <StrategyNav items={NAV} trailingId="closing" />
      <ExecutiveSummary />
      <IndiaOpportunity />
      <ProblemsGroup />
      <ProductGroup />
      <QualityGraphGroup />
      <RoadmapGroup />
      <CustomersGroup />
      <ValidationGroup />
      <BusinessGroup />
      <GoToMarketGroup />
      <LeadershipGroup />
      <InvestorGroup />
      <ExecutionGroup />
      <MetricsGroup />
      <RisksGroup />
      <Execution90Day />
      <ReferenceGroup />
      <Closing />
    </div>
  );
}
