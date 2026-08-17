# Post-Deployment Search & AI-Discoverability Checklist

Manual steps to run after deploying the changes from this AI-discoverability work package (or any
future materially-changed page). None of these were run as part of this work package — they
require access to Google Search Console, Bing Webmaster Tools, and other external consoles this
environment does not have credentials for.

## 1. IndexNow

**Status: not implemented in this work package.** This repository is deployed as a standard
Next.js app; no IndexNow key file or submission script currently exists. If the site owner wants
IndexNow support:

1. Generate a key at https://www.bing.com/indexnow (or any participating provider).
2. Host the key as a static text file at `https://autonomous.ev.engineer/<key>.txt` (e.g. via
   `public/<key>.txt`) containing only the key itself — this is how IndexNow verifies domain
   ownership.
3. Write a small script (Node, run manually or via CI on deploy) that `POST`s
   `https://api.indexnow.org/indexnow` with `{ host, key, keyLocation, urlList }`, where
   `urlList` is only the specific canonical URLs that changed in that deploy — not the whole site,
   and not on every deploy.
4. Do not automate this to fire on every commit; reserve it for deploys that materially change a
   canonical public page.

IndexNow only notifies participating search engines that a URL changed. It does not guarantee
crawling, indexing, or ranking.

## 2. Google Search Console

- [ ] Open Search Console for `autonomous.ev.engineer`.
- [ ] Use URL Inspection on each materially-changed canonical URL: `/`, `/internships`,
      `/about/sudarshana-karkala`, `/contact`, `/space/2026-INSPACe-ROCKETRY-059`.
- [ ] For each, request indexing if Search Console shows it as not-yet-crawled with the new
      content.
- [ ] Re-submit `https://autonomous.ev.engineer/sitemap.xml` under Sitemaps (even though its URL
      list did not change in this work package, the `lastModified` values did).
- [ ] Check the Enhancements / Structured Data reports over the following days for any errors on
      the new JSON-LD (Person, ProfilePage, CollectionPage, ContactPage).

## 3. Bing Webmaster Tools

- [ ] Run URL Inspection for the same set of pages.
- [ ] Re-submit the sitemap under Bing Webmaster Tools' Sitemaps section.
- [ ] If IndexNow is configured (see §1), confirm Bing shows recent IndexNow submissions under
      Bing's IndexNow report.

## 4. Structured-data validation

- [ ] Run each changed page's rendered HTML through the
      [Schema.org validator](https://validator.schema.org/) and confirm no parse errors.
- [ ] Run `/internships`, `/about/sudarshana-karkala`, `/contact`, `/`, and
      `/space/2026-INSPACe-ROCKETRY-059` through
      [Google's Rich Results Test](https://search.google.com/test/rich-results). Note: a valid
      graph does not guarantee a rich result — Google decides eligibility independently.
- [ ] Spot-check that no field in any graph is empty, a placeholder, or contradicts the visible
      page (the automated tests in `src/lib/structured-data/*.test.ts` check this at the data
      layer, but a live-page check catches anything the build pipeline changed).

## 5. Social-sharing preview validation

- [ ] Check Open Graph rendering for `/`, `/internships`, `/about/sudarshana-karkala`, `/contact`
      via a preview tool (e.g. a private/incognito share-link preview, or a debugger such as
      Meta's Sharing Debugger / LinkedIn Post Inspector) — these require the pages to be publicly
      reachable post-deploy.
- [ ] Confirm the Twitter Card renders correctly for the same pages.

## 6. Search-engine cache and canonical verification

- [ ] `site:autonomous.ev.engineer/about/sudarshana-karkala` (and similarly for other changed
      pages) on Google to confirm the currently-indexed version is not stale/conflicting.
- [ ] Confirm each page's rendered `<link rel="canonical">` matches its sitemap URL exactly
      (no trailing-slash or protocol mismatch) — automated in `sitemap.test.ts` for the sitemap
      side, but the live `<head>` should be spot-checked post-deploy.

## 7. AI referral measurement (ongoing, monthly)

No new analytics service was added in this work package (Google Analytics via
`src/components/GoogleAnalytics.tsx` was already present and is unchanged). To review AI-driven
traffic using the existing GA property:

- [ ] In GA, filter session source/medium for `chatgpt.com`, `perplexity.ai`,
      `copilot.microsoft.com`, `bing.com`, `google.com` (note OpenAI may attach
      `utm_source=chatgpt.com` to ChatGPT Search referrals — check both referrer and UTM source).
- [ ] Do not add prompt content, query strings containing user input, or any fingerprinting
      signal to analytics — only aggregate session/page metrics.

### Suggested monthly report contents

- Organic search visits (vs. total).
- AI-referred visits (from the sources above).
- Visits to `/internships`, `/about/sudarshana-karkala`.
- Clicks on `data-track-event="internships_submit_resume_click"`,
  `"internships_register_now_click"`, `"sudarshana_profile_click"`, `"linkedin_profile_click"`
  (existing tracked events — see `src/components/GoogleAnalytics.tsx`'s delegated click listener).
- Top landing pages.
- Google Search Console index-coverage status.
- Any new crawl errors.
- Any new structured-data errors.

No baseline traffic numbers are fabricated here — the site owner should pull the actual current
GA figures to establish a baseline before comparing future months.
