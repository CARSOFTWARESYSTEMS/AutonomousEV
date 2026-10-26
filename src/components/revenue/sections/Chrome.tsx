// The page's own header and footer. This route does not draw the site's
// shared navbar and footer (see ChromeGate), so it supplies both.
import Link from "next/link";
import { LINK_EVENTS } from "../analytics";
import { CASE_STUDY, FRAMEWORK, INTERNSHIP } from "../data/framework";
import { SOURCES } from "../data/market";
import css from "../revenue.module.css";

export function RevenueHeader() {
  return (
    <header className={css.header}>
      <div className={css.headerInner}>
        <a href="#top" className={css.brand} aria-label={`${FRAMEWORK.name}. Back to the top.`}>
          <span className={css.brandMark} aria-hidden="true">
            RE
          </span>
          <span className={css.brandText}>
            <span className={css.brandName}>{FRAMEWORK.name}</span>
            <span className={css.brandSub}>EV.ENGINEER™ · Marketing &amp; Sales</span>
          </span>
        </a>
        <nav aria-label="Revenue Engineering" className={css.headerNav}>
          <ul>
            <li>
              <a href={CASE_STUDY.productUrl} target="_blank" rel="noopener noreferrer" className={css.headerLink} data-track-event={LINK_EVENTS.product} data-track-source="header">
                FAI Product<span className={css.srOnly}> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <Link href={CASE_STUDY.contextUrl} className={css.headerLink} data-track-event={LINK_EVENTS.aqip} data-track-source="header">
                AQIP
              </Link>
            </li>
            <li>
              <Link href="/internships" className={css.headerLink}>
                Internships
              </Link>
            </li>
          </ul>
        </nav>
        <a href="#rv-apply" className={css.headerCta}>
          Apply
        </a>
      </div>
    </header>
  );
}

export function RevenueFooter() {
  return (
    <footer className={css.footer}>
      <div className={css.footerInner}>
        <div>
          <p className={css.footerBrand}>{FRAMEWORK.name}</p>
          <p className={css.footerText}>{FRAMEWORK.descriptor}</p>
          <p className={css.footerText}>
            A framework by EV.ENGINEER™, operated by iTelematics Software Private Limited. Not affiliated with SAE International, any OEM or any government agency.
          </p>
        </div>
        <div>
          <p className={css.footerHead}>Sources</p>
          <ul className={css.footerList}>
            {Object.values(SOURCES).map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.label}
                  <span className={css.srOnly}> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className={css.footerHead}>Explore</p>
          <ul className={css.footerList}>
            <li>
              <Link href="/internships">All internships</Link>
            </li>
            <li>
              <Link href={CASE_STUDY.contextUrl}>AQIP — Aerospace Quality Intelligence Platform</Link>
            </li>
            <li>
              <Link href="/internships/battery-circular-economy">BMC — Battery Circular Economy</Link>
            </li>
            <li>
              <a href={INTERNSHIP.apply.url} target="_blank" rel="noopener noreferrer" data-track-event={LINK_EVENTS.apply} data-track-source="footer">
                {INTERNSHIP.apply.label}
                <span className={css.srOnly}> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className={css.footerFine}>Last reviewed {FRAMEWORK.reviewedLabel}. Synthetic demonstration data on this page is fictional. Estimates are not guaranteed outcomes.</p>
    </footer>
  );
}
