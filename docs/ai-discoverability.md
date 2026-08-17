# AI Search, Entity Discoverability, AEO & GEO

Documentation for the site-wide AI-discoverability work package (August 2026), covering Google
Search, Google AI Overviews/AI Mode, Bing/Copilot, ChatGPT Search and other AI answer engines that
read public web content. This is discoverability infrastructure, not a ranking or citation
guarantee — see [Guarantees and limitations](#guarantees-and-limitations) at the end.

## What this covers

- A single source-of-truth entity registry (`src/data/public-entities.ts`).
- A shared JSON-LD node-builder module (`src/lib/structured-data/entities.ts`) reused by every
  page's structured-data graph, so the same entity always uses the same `@id`.
- Per-page JSON-LD graphs for the home page, `/internships`, `/about/sudarshana-karkala`,
  `/contact`, and gap-fixes to the existing `/space/2026-INSPACe-ROCKETRY-059` graph.
- Visible, direct-answer content sections on `/internships` and
  `/about/sudarshana-karkala`.
- `public/llms.txt`, an experimental discovery aid.
- Tests covering JSON-LD validity, entity-graph consistency, visible-content/structured-data
  parity, and privacy checks (no invented contact fields).

## Entity model

All verified facts about EV.ENGINEER, the legal companies behind it, EV Society, Sudarshana
Karkala, the internship programme and the public contact point live in
`src/data/public-entities.ts` — the single source of truth. JSON-LD node builders in
`src/lib/structured-data/entities.ts` turn those facts into reusable graph nodes with stable
`@id`s:

| Entity | `@id` | Type | Source of truth |
|---|---|---|---|
| EV.ENGINEER | `https://autonomous.ev.engineer/#brand` | `Brand` | Home page, `/space` nav, layout metadata |
| iTelematics Software Private Limited | `https://itelematics.com/#organization` | `Organization` | `/contact`, home page badge |
| EV Society | `https://www.evsociety.org/#organization` | `Organization` | `/space` footer/nav, rocketry page attribution |
| Thasmai Infotech Private Limited | `https://www.thasmaiinfotech.com/#organization` | `Organization` | `/about/sudarshana-karkala` |
| Sudarshana Karkala | `https://autonomous.ev.engineer/about/sudarshana-karkala#person` | `Person` | `/about/sudarshana-karkala`, reused author blocks |
| Internship programme | `https://autonomous.ev.engineer/internships#internship-program` | (CollectionPage) | `/internships` |
| Public contact point | `https://autonomous.ev.engineer/contact#contact` | (ContactPage/ContactPoint) | `/contact` |
| Website | `https://autonomous.ev.engineer/#website` | `WebSite` | Site-wide |

**These four are deliberately never merged**: EV.ENGINEER (brand/platform), iTelematics Software
Private Limited (legal operator of EV.ENGINEER, verified via `/contact`), EV Society (a separate
community initiative — not described as a registered Section 8 company anywhere on this site),
and Thasmai Infotech Private Limited (the separate legal company Sudarshana Karkala co-founded).
The repository does not establish that iTelematics and Thasmai Infotech are the same legal entity,
so they are kept distinct.

`/space/2026-INSPACe-ROCKETRY-059` (the rocketry learning guide) is modelled as an independent
`LearningResource`/`WebPage` with `isBasedOn` pointing at the official IN-SPACe workshop listing —
never as a `Course` claiming EV.ENGINEER is the workshop's official provider, and never with an
IN-SPACe/ISRO organisation node (no implied government endorsement).

### Known pre-existing entity-graph inconsistencies (not modified by this work package)

A repository search for `schema.org`/`application/ld+json` before this work package turned up
several **older, page-local** JSON-LD graphs that model EV.ENGINEER differently from the scheme
above:

- `src/app/trust-center/page.tsx` and `src/app/internships/battery-pack-design/page.tsx` model
  EV.ENGINEER as an `Organization` with `@id: "https://ev.engineer/#organization"`.
- `src/app/design-development/passenger-taxi/battery-cybersecurity/page.tsx` models
  `https://autonomous.ev.engineer` itself as an `Organization` with a `founder` pointing at
  Sudarshana Karkala.
- `src/app/internships/battery-pack-design/page.tsx` uses a LinkedIn-URL-based `@id` for the
  Person node instead of the canonical profile URL.

These pages are outside this work package's target-page list (§2 of the spec: home, `/internships`,
`/space`, the rocketry page, `/about/sudarshana-karkala`, `/contact`) and were left untouched to
avoid an unscoped rewrite. **They are a documented, pre-existing inconsistency**, not something
introduced or worsened by this work. If/when those pages are next touched, align them to the
`@id`s in `src/lib/structured-data/entities.ts` instead of re-inventing new ones.

## Adding or changing an entity fact

1. Edit the single relevant record in `src/data/public-entities.ts`. Never hardcode a name, legal
   name, phone number or URL directly inside a page component.
2. If the fact needs a new JSON-LD node shape, add or edit a builder function in
   `src/lib/structured-data/entities.ts`.
3. Import the builder (not the raw literal) from any page's graph file
   (`src/lib/structured-data/{home,profile,internships,contact}Graph.ts`, or `spaceGraph.ts`).
4. Run `npx vitest run src/data/public-entities.test.ts src/lib/structured-data` — these tests
   assert every `@id` is unique, every builder's own `@id` matches its exported constant, no
   private email exists for Sudarshana Karkala, and EV Society/EV.ENGINEER are never
   over-claimed (no Section 8/CIN language, no `Organization` type for the brand).

## Privacy rules enforced

- No email address is recorded for Sudarshana Karkala anywhere in the registry, the graphs, or the
  rendered profile page — none is published elsewhere in the repository, so none is added here.
- The only phone number ever placed on Sudarshana Karkala's Person JSON-LD (`+91 9845561518`) is
  the exact number already published on his behalf across at least four other existing pages in
  this repo, and it is now also visibly printed on his own profile page.
- The `/contact` page's `ContactPoint` JSON-LD uses only the email/phone/address already printed
  in that page's own visible HTML (`info@iTelematics.com`, `+91 91082 06147`) — Sudarshana
  Karkala's personal number is never used as the general business contact point.
- `public/llms.txt` contains no email address and no phone number.

## `robots.txt` and crawler policy

`src/app/robots.ts` already had, before this work package, explicit `allow: "/"` rules for
`Googlebot`, `Bingbot`, `OAI-SearchBot` and `PerplexityBot`, plus a wildcard `*: allow "/"` rule
whose comment states it is preserved as-is and covers every other crawler — including `GPTBot` —
unchanged. This was verified against the live file and its existing test suite
(`src/app/robots.test.ts`) before any other changes were made, and **no changes to `robots.ts` were
needed or made**.

- **GPTBot** (OpenAI's model-training crawler): no explicit rule exists. It falls under the
  wildcard `*: allow "/"`. This is a **pre-existing, deliberate policy** (per the file's own
  comment) and was left untouched, per this work package's explicit instruction not to silently
  opt the site into or out of AI-training crawling.
- **OAI-SearchBot** (ChatGPT Search discoverability, distinct from GPTBot's training use): already
  explicitly allowed.
- **ChatGPT-User** (used when a ChatGPT user's live browsing plugin fetches a page): no explicit
  rule exists either, but — like GPTBot — it is already covered by the wildcard `allow "/"` rule.
  No explicit rule was added for it, to avoid touching the wildcard's documented "preserved as-is"
  policy without being asked to.
- The sitemap (`https://autonomous.ev.engineer/sitemap.xml`) is declared in `robots.txt`.

If the site owner later wants an explicit GPTBot (training) policy instead of the current
wildcard-inherited allow, that is a deliberate policy decision for them to make — it was not made
here.

## Sitemap

`src/app/sitemap.ts` already listed every page this work package's target routes touch (`/`,
`/internships`, `/about/sudarshana-karkala`, `/contact`, `/trust-center`, `/space`,
`/space/2026-INSPACe-ROCKETRY-059`, `/about`) before this work began. No sitemap changes were
required. `/aerospace` is intentionally absent from the sitemap because it carries an explicit
`robots: { index: false, follow: false }` in `src/app/aerospace/layout.tsx` — this was verified as
a deliberate, pre-existing noindex, not a bug.

## `llms.txt`

`public/llms.txt` is new. It is a short, plain-text (Markdown-formatted) description of
EV.ENGINEER, its canonical entity pages, and the explicit entity distinctions above, served
statically at `/llms.txt`. It contains no private data. A test
(`src/lib/llms-txt.test.ts`) asserts that every `autonomous.ev.engineer` URL referenced in the
file resolves to a URL already present in `sitemap.ts`.

`llms.txt` is an **experimental, unofficial convention** with no confirmed support from Google,
Bing, or any major AI answer engine as of this writing. Treat it as a discovery aid layered on top
of — never a substitute for — crawlable HTML, JSON-LD, and the XML sitemap.

## Guarantees and limitations

This work improves crawlability, entity clarity, and direct-answer visibility. It does **not**,
and cannot, guarantee:

- Inclusion in Google/Bing search results or any ranking position.
- Inclusion in Google AI Overviews, AI Mode, Bing Copilot answers, or ChatGPT Search results.
- A Google Knowledge Panel for Sudarshana Karkala, EV.ENGINEER, or any other entity.
- Any specific AI system citing this site as a source.
- Any rich-result eligibility in Google Search (schema.org validity is necessary but not
  sufficient for a rich result).

See `docs/post-deployment-checklist.md` for the manual steps still required after deployment, and
`docs/query-to-page-matrix.md` for the query-to-page coverage matrix.
