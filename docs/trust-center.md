# Trust Center

A JSON-configurable page at `/trust-center` that aggregates verified feedback, professional
recognition, mentoring feedback, workplace feedback, community/engineering impact, media, and a
local source-grounded search — without altering the existing portal theme.

- Route: `src/app/trust-center/page.tsx` → `src/components/trust-center/TrustCenterContent.tsx`
- Navigation: About ▸ Trust Center (desktop dropdown + mobile menu)
- Config: `src/data/trust-center/config.json`
- Content: `src/data/trust-center/*.json` (one file per source/category)
- Shared model + logic: `src/lib/trust-center/*`

## How to add content

All content lives in `src/data/trust-center/*.json`. Every entry follows the `TrustContentItem`
shape in `src/lib/trust-center/types.ts`. Invalid entries are dropped individually at load time
(`src/lib/trust-center/validate.ts`) with a console warning in development — they never crash the
page. Restart `next dev` (or rebuild) to pick up JSON changes; nothing else needs to change in code
for a new item of an existing type.

Required fields on every item: `id` (unique), `title`, `type`, `source`, `sourceLabel`,
`verificationStatus`, `enabled`, `tags`/`audiences`/`products`/`domains` (arrays, may be empty).

| To add a... | File | Notes |
|---|---|---|
| Google review | `google.json` | `type: "review"`, `source: "google"`. Only add a `rating` if it is a real, attributable figure — otherwise omit it entirely; the summary card will say no rating is configured yet. |
| Topmate mentoring feedback | `topmate.json` | `type: "review"`, `source: "topmate"`. Include `author.name`/`role` only with the reviewer's consent to publish; set `author.isAnonymous: true` to withhold identity. |
| LinkedIn post | `linkedin.json` | `type: "social-post"`, `source: "linkedin"`. `embedUrl` must be an `https://www.linkedin.com/embed/...` URL (anything else is rejected at load time — see Security below). Set `media.height` to the post's natural embed height; width is fixed at 504px by the component. If you only have a normal post URL (not an official embed URL), omit `embedUrl` and set `sourceUrl` — the card renders as a direct-link fallback instead of an iframe (see the Kiran Kumar entry for the pattern). |
| Glassdoor summary | `glassdoor.json` (items) + `config.json` `sources.glassdoor.summary` (aggregate rating/count) | Never scrape or embed Glassdoor. Only set `summary.rating`/`reviewCount` when you have a manually verified figure, plus `summary.retrievedAt`. Set `sources.glassdoor.staleAfterDays` to control when the "may be outdated" badge appears. |
| EV Society candidate | `ev-society.json` | `type: "candidate-profile"`. Leave `summary` blank until an approved achievement summary exists — the card shows "Content is being curated." rather than inferring anything from the profile URL. |
| EV Society community post (e.g. Facebook) | `ev-society.json` | `type: "social-post"`, `source: "ev-society"`, `sourceLabel` = the actual platform (e.g. `"Facebook"`). No `embedUrl` (Facebook is not in the iframe allowlist) — renders as a direct-link card. |
| YouTube video | `youtube.json` | `type: "video"`, `source: "youtube"`, set `videoId` (not a full URL). Videos never autoplay and only load after the viewer clicks play. |
| Customer/partner testimonial | `testimonials.json` | `type: "testimonial"`, `source: "manual"`. |
| Success story | `success-stories.json` | `type: "case-study"`, `source: "case-study"`. |
| Award | `awards.json` | `type: "award"`, `source: "award"`. |
| Partner | `partners.json` | `type: "partner"`, `source: "partner"`. |
| FAQ | `faqs.json` | `type: "faq"`; `title` is the question, `summary` is the answer. |

Section visibility (`src/components/trust-center/TrustCenterContent.tsx` + `TrustSection.tsx`):
a section with zero items is **hidden** by default (`settings.hideEmptySections: true` in
`config.json`). Google/Topmate/Glassdoor/LinkedIn/EV Society/YouTube always render their summary
card since it's not data-dependent, even with zero review items. Google/Topmate/Glassdoor/LinkedIn/EV
Society/YouTube headings, descriptions and links live in `config.json` under `sources.*`.

## Content governance

Recommended lifecycle per item, tracked outside the repo (e.g. a spreadsheet or ticket) until
volume justifies a CMS: **Draft → Source verified → Permission checked → Approved → Published →
Periodic review → Archived**. Track per item: owner, source, publication approval, verification
status, consent status, retrieved date, review/expiry date, applicable business entity (EV.ENGINEER™
vs iTelematics Software vs EV Society™), applicable product, public/private status. Do not publish
personally sensitive information beyond what the subject has already made public and consented to.

## Security

- **Iframe allowlist** (`src/lib/trust-center/iframe-safety.ts`): only `https://www.linkedin.com`,
  `https://www.youtube.com`, `https://www.youtube-nocookie.com` may be used as `embedUrl`. Anything
  else (including `javascript:`/`data:`) is stripped at JSON load time, before it ever reaches a
  component.
- **CSP**: if/when a Content-Security-Policy is added to this project (`next.config.ts` `headers()`
  or middleware), it must include:
  `frame-src https://www.linkedin.com https://www.youtube.com https://www.youtube-nocookie.com;`
  Do not use a wildcard `frame-src`.
- **No `dangerouslySetInnerHTML`** is used anywhere in the Trust Center. All JSON-sourced text is
  rendered as plain React children; `stripUnsafe()` strips control characters before render.
- External links always use `target="_blank" rel="noopener noreferrer"`.
- No API keys are used or required in Phase 1 (see `providers/reviewProvider.ts`).

## Trust Center Search (Phase 1)

`src/lib/trust-center/search.ts` is a dependency-free, field-weighted keyword search (title > tags
> audiences/products/domains > summary/excerpt > source label > body) over items where
`enabled && verificationStatus !== "placeholder" && search.indexable !== false`.
`src/lib/trust-center/answerEngine.ts` (`DeterministicTrustAnswerEngine`) composes a templated
summary from the top matches, or returns a fixed "does not currently contain enough verified
information" message when there's no strong match — it never calls a language model and the UI
always labels it "Trust Center Search", never "AI-generated".

### Phase 2 (not implemented)

`TrustContentRepository` and `TrustAnswerEngine` (`src/lib/trust-center/types.ts`) are the seams for
a future retrieval-augmented pipeline:

```
Approved sources → ingestion → normalisation → verification/moderation → trust-content JSON
  → chunking → local embeddings/index → retrieval → grounded response generator → answer + citations
```

Rules that must hold for any future engine behind `TrustAnswerEngine`: every claim cites retrieved
evidence; never answer beyond indexed content; state insufficient evidence explicitly rather than
guessing; never generate ratings or testimonials; never merge ratings across platforms; keep
EV.ENGINEER™, iTelematics Software and EV Society™ distinct; keep employer feedback (Glassdoor)
separate from customer/mentee feedback. No embedding model, vector DB, or local/cloud LLM has been
added — Phase 1 is deterministic and inexpensive by design.

## Review provider abstraction

`src/lib/trust-center/providers/reviewProvider.ts` defines `ReviewProvider` with two
implementations: `StaticJsonReviewProvider` (used today, reads the JSON files) and
`GoogleBusinessProfileReviewProvider` (typed stub that throws `Not implemented` — wiring it up
later means implementing its two methods against the Business Profile API and swapping the
provider instance; no component changes needed since both satisfy the same interface).

## Architecture decisions

- **Data split by source** (`src/data/trust-center/*.json`), matching the existing
  `src/data/ev-companies/*.json` convention, instead of one large file.
- **Hand-rolled validation**, not Zod — the repo has no schema-validation dependency and the
  dataset is small; `validate.ts` is ~150 lines and covers every required/typed field, rating
  ranges, embed host allowlisting, and anonymous-author stripping.
- **No new runtime search dependency** (no Fuse.js) — a field-weighted substring search is
  sufficient for this corpus size and keeps the bundle and audit surface small.
- **Filter tabs act as anchor/scroll navigation, not show/hide.** `TrustSourceNav` scrolls to and
  highlights a section and updates `?source=` for deep linking, but never unmounts other sections —
  so search engines and users without JS always see the full page content on first load, and there is
  no filter-driven content-hiding to reconcile with SEO.
- **LinkedIn iframe failure detection is a timeout heuristic** (8s): browsers don't reliably fire an
  `onerror` event for an iframe blocked by the remote site, so "did it load" is inferred from
  whether `onLoad` fired before the timeout. This is a known, accepted limitation of iframe embeds
  in general, not specific to this implementation.
- **Mobile media-query state** uses `useSyncExternalStore` (not `useEffect` + `setState`) to avoid
  an extra render and to work cleanly with `eslint-plugin-react-hooks`'s `set-state-in-effect` rule.
- **Navbar**: only the About dropdown gained click/keyboard control (disclosure pattern: trigger
  button with `aria-expanded`/`aria-haspopup`, Escape closes and refocuses the trigger, outside click
  closes); the existing hover-only CSS is left intact and layered underneath, and the Engineering
  dropdown is untouched, minimizing blast radius on existing navigation.
- **Vitest + React Testing Library** added as devDependencies (no test framework existed in the
  repo before this feature); `npm run test` runs the suite.

## Known limitations / deferred Phase 2 items

- Google, Topmate and Glassdoor currently ship with **no review items and no aggregate
  rating/count** — only attributed link-out cards — because no real, verifiable figures were
  available at implementation time. Add them via the tables above whenever approved data exists.
- YouTube ships with a channel link only; no videos are configured yet (`youtube.json` is empty).
- Customer testimonials, success stories, awards, partners, media coverage, certifications,
  academic/industry partnerships, global community and training outcomes are all empty and hidden
  by default, per the "no fabricated placeholders" constraint.
- `GoogleBusinessProfileReviewProvider` is a typed stub only (throws if called) — no live Google
  Business Profile integration exists.
- No e2e (Playwright/Cypress) suite — Vitest + RTL cover unit/component level only. End-to-end
  verification for this change was instead done by driving the running dev server with Playwright
  directly (see Verification below).
- No CSP is currently configured anywhere in this project; the `frame-src` requirement above is
  documented for whenever one is added.

## Verification

- **Typecheck**: `npx tsc --noEmit` — clean.
- **Lint**: `npm run lint` — zero errors/warnings in every file this feature touched or added; all
  remaining lint output is pre-existing and unrelated to this change.
- **Tests**: `npm run test` (Vitest + RTL) — 45/45 passing across 7 files: `validate.test.ts`,
  `iframe-safety.test.ts`, `search.test.ts` (incl. `answerEngine`), `TrustSourceNav.test.tsx`,
  `LinkedInPostCard.test.tsx`, `TrustSection.test.tsx`, `Navbar.test.tsx`.
- **Build**: `npm run build` — succeeds; `/trust-center`, `/sitemap.xml` and `/robots.txt` all
  statically generate alongside every pre-existing route, none of which changed.
- **Manual browser verification** (headless Chromium via Playwright, driving the real dev server):
  hero, sticky filter tabs, disclaimer, all six source sections, EV Society (including the Facebook
  fallback card), Trust Center Search, FAQ accordion and "last updated" line all render; the 7 real
  LinkedIn iframes load live posts in the two-column layout; the About dropdown shows "Trust
  Center" third, opens on click, closes and returns focus to the trigger on Escape; the mobile menu
  (375px) lists Trust Center under About with zero horizontal overflow (`scrollWidth === innerWidth`);
  zero console/page errors throughout.

## RGIS verification matrix

| ID | Requirement | Implementation | Test | Result |
|----|---|---|---|---|
| R1 | Google = business reviews, Topmate = mentoring, LinkedIn = professional recognition, Glassdoor = workplace, EV Society = community/engineering impact, YouTube = media | `config.json` `sources.*.heading/description`; distinct components per source | Manual review of rendered headings | Pass |
| R2 | No section silently omitted | All 17 IA sections present in `TrustCenterContent.tsx` (hero, filters, disclaimer, 6 sources, success stories, testimonials, awards, partners, featured, search, FAQ, last-updated) | Manual code review + screenshot | Pass |
| G1 | Source attribution shown | `TrustSourceBadge`/`sourceLabel` on every card | `TrustSourceNav`/card tests + screenshots | Pass |
| G2 | No fabricated ratings/quotes/counts | Google/Topmate/Glassdoor ship with zero review items and no `summary.rating` | Code review of `google.json`/`topmate.json`/`glassdoor.json`/`config.json` | Pass |
| G3 | No scraping | No fetch/scrape code anywhere in `src/lib/trust-center` | Code review | Pass |
| G4 | Employer feedback not mislabeled as customer feedback | `WorkplaceReviewSummary` renders `classificationNote="Employer / workplace feedback — not customer feedback."` | Screenshot `06-ev-society.png`-adjacent Glassdoor section | Pass |
| I1 | JSON-configurable | All content/config in `src/data/trust-center/*.json` | `repository.ts` imports; docs table above | Pass |
| I2 | Lazy loading | `IntersectionObserver` in `LinkedInPostCard`; click-to-play in `VideoPreviewCard`; first 2 LinkedIn posts eager, rest lazy | `LinkedInPostCard.test.tsx` (`eager` prop) + manual load | Pass |
| I3 | Fallback on embed failure | 8s timeout → `ExternalPostFallback` in `LinkedInPostCard` | Code review (timing not unit-tested; would need fake timers) | Pass |
| I4 | Security allowlist enforced | `isAllowedEmbedUrl` used in both `validate.ts` (load time) and `LinkedInEmbed.tsx` (render time) | `iframe-safety.test.ts`, `validate.test.ts` | Pass |
| I5 | Accessible nav | About dropdown: `aria-expanded`/`aria-haspopup`, Escape, outside click, focus return | `Navbar.test.tsx` | Pass |
| I6 | Search grounded with citations | `TrustSearchResult` renders `TrustCitation` (source, verification badge, link) for every result | `search.test.ts` | Pass |
| S1 | Reject `javascript:`/`data:` URLs | `isAllowedEmbedUrl`/`isAllowedExternalUrl` check protocol | `iframe-safety.test.ts` | Pass |
| S2 | Reject unknown iframe hosts | Same allowlist | `iframe-safety.test.ts`, `validate.test.ts` | Pass |
| S3 | Sanitize configuration text | `stripUnsafe()` strips control chars; no `dangerouslySetInnerHTML` in this feature | `validate.test.ts` | Pass |
| S4 | Missing/invalid data doesn't crash | Invalid items dropped individually, page renders regardless | `validate.test.ts` ("skips only the invalid item") | Pass |
| S5 | No secrets exposed | No API keys/credentials anywhere in this feature | Code review | Pass |

## Files created

See the tables above for the JSON content files. Code: `src/app/trust-center/page.tsx`,
`src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/trust-center/*` (types, validate, search,
answerEngine, repository, format, iframe-safety, providers/reviewProvider), all 33 components under
`src/components/trust-center/` (plus their `*.module.css` and `*.test.tsx` files), `vitest.config.mts`,
`vitest.setup.ts`, `docs/trust-center.md` (this file).

## Files modified

`src/components/Navbar.tsx`, `src/components/Navbar.module.css` (Trust Center link + accessible
About dropdown), `package.json` (test tooling + `test` script).
