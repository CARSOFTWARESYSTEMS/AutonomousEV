// The platform's footer, on every page of the framework. Short on purpose:
// the main places, a few outside links and the sources — everything else is
// under More.
import Link from "next/link";
import { LINK_EVENTS } from "../analytics";
import { CASE_STUDY, FRAMEWORK, HEADER_NAV, INTERNSHIP, ROUTES } from "../data/framework";
import { SOURCES } from "../data/market";
import css from "../site.module.css";

export default function Footer() {
  return (
    <footer className={css.footer}>
      <div className={css.footerInner}>
        <div>
          <p className={css.footerBrand}>{FRAMEWORK.name}</p>
          <p className={css.footerText}>{FRAMEWORK.descriptor}</p>
        </div>
        <nav aria-label="Footer">
          <ul className={css.footerRow}>
            {HEADER_NAV.map((item) => (
              <li key={item.page}>
                <Link href={ROUTES[item.page]}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href={ROUTES.today}>Today</Link>
            </li>
            <li>
              <a href={CASE_STUDY.productUrl} target="_blank" rel="noopener noreferrer" data-track-event={LINK_EVENTS.product} data-track-source="footer">
                FAI Engineer ↗<span className={css.srOnly}> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <Link href={INTERNSHIP.apply.url} data-track-event={LINK_EVENTS.apply} data-track-source="footer">
                {INTERNSHIP.apply.label}
              </Link>
            </li>
          </ul>
        </nav>
        <p className={css.footerSources}>
          <span>Sources:</span>
          {Object.values(SOURCES).map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
              {source.label}
              <span className={css.srOnly}> (opens in a new tab)</span>
            </a>
          ))}
        </p>
        <p className={css.footerText}>
          By EV.ENGINEER™, operated by iTelematics Software Private Limited. Not affiliated with SAE International, any OEM or any government agency. Last reviewed {FRAMEWORK.reviewedLabel}. Customer problems
          are hypotheses until customers confirm them; estimates are not guaranteed outcomes.
        </p>
      </div>
    </footer>
  );
}
