# Space initiative: ownership moved from EV Society to ISHAVASYAM.ORG

12 October 2026. Scope: every route under `/space`, the shared Space header and footer, metadata, social cards, JSON-LD, `llms.txt` and the two documentation tables that describe Space.

**Status: done, committed by the site owner as `73fad51` and deployed. Verified on production the same day.** This report and `space-ishavasyam-migration-review/rendered-routes-production.json` were written after that commit and are the only files it does not contain.

The Space initiative is now presented everywhere as:

- **Space · An ISHAVASYAM.ORG Initiative**
- Space is an ISHAVASYAM.ORG education, research and engineering initiative.

Nothing was moved: every route still answers at `https://autonomous.ev.engineer/space/...` (and `aerospace.ev.engineer`, `aerospace.ishavasyam.org/space`) exactly as before. No redirect was added. No simulator, physics model, 3D scene, chart or control was touched.

## 1. What was audited first

- Repository: branch `main`, with the previous task's work uncommitted at the time; nothing was reset or discarded.
- Route tree: found from the source (`src/app/space/**`, `src/app/ishavasyam-space`), not from the links on `/space`. Eleven routes, listed in section 3.
- Search: 232 occurrences of "EV Society" in any form, in 69 source and public files, each read in context. One was broken across two lines of source and was missed by the line-by-line search; the rendered-page check found it (the Model Rocketry competitions disclaimer). The guard test now ignores line breaks so that cannot recur.
- Existing ISHAVASYAM.ORG material: `/space/space-station` and the `aerospace.ishavasyam.org` host already named the organisation, and gave the established URL, `https://ishavasyam.org/`. That URL is the one used throughout. None was invented.

## 2. Decisions

| Question | Decision | Why |
| --- | --- | --- |
| The "EV Society" button in the Space header | Replaced by **ISHAVASYAM.ORG**, linking to `https://ishavasyam.org/` | It sits with UFlight and EV.ENGINEER as the initiative's attribution set, and the Space Station page already replaced the same set with its own attribution. It was the owner badge, not a general link. It still fits on one line at 1340 px, the narrowest width the full header is used at. |
| The EV Society link in the Space footer's link list | Replaced by ISHAVASYAM.ORG | Same reasoning. The footer was not otherwise changed. |
| "Join Community" in the `/space` hero, which goes to `evsociety.org/join` | **Kept** | It is a link to EV Society's own community, which is a role of its own and not a claim of ownership. See open item 1. |
| EV Society in the Ecosystem section | Named once, in its own role: "Community membership is offered through EV Society, a separate community initiative." | The brief asks that a legitimate separate role be kept and that Space is not described as EV Society's. This sentence does both, and matches what the Join Community button does. |
| "Prepared by the EV Society technical team" on `/space` | Now "Prepared by the ISHAVASYAM.ORG technical team" | It describes who prepares the current page, not a past event. See open item 2. |
| The three FAQ answers that named EV Society | Now name ISHAVASYAM.ORG. Every disclaimer about ISRO, IN-SPACe, NSIL and the Department of Space is word for word as before | Two of them concern intellectual property and commercial responsibility. They say what does **not** happen (no automatic transfer of IP; commerce is not handled by the initiative), so naming the initiative's present owner keeps their meaning. See open item 3. |
| The 2026 rocketry workshop guide, `/space/2026-INSPACe-ROCKETRY-059` | **Not changed** | It records who prepared that guide for a 2026 workshop: "Prepared by the EV Society / EV.ENGINEER technical team". That is historical attribution, not ownership of the initiative. See open item 4. |
| The two rocket-engine Digital Twin pages | **Not changed** | Neither names EV Society anywhere. They credit EV.ENGINEER as author and iTelematics Software Private Limited as publisher. See open item 5. |
| Space Station, which wrote the name as "Ishavasyam.org" | Now "ISHAVASYAM.ORG" | The branding standard. Its descriptor, "Space Research Organisation", and its content are unchanged. |
| Trademark sign | None on ISHAVASYAM.ORG. EV.ENGINEER™ and UFlight™ keep theirs where they had them | As specified. |
| Site name in Open Graph (`og:site_name`: EV.ENGINEER) | Kept | It names the site the pages are on, which has not changed. |

## 3. Route inventory

Every route of the Space experience, as found in the source.

| Route | Page | EV Society reference before | Type | Changed |
| --- | --- | --- | --- | --- |
| `/space` | Space home | Hero badge; "Prepared by"; 3 FAQ answers; Ecosystem paragraph; header link; footer line, link and copyright; title; description; author, creator, publisher; social card and its alt text; JSON-LD parent organisation and publisher | Initiative branding | Yes |
| `/ishavasyam-space` (served at `aerospace.ishavasyam.org/space`) | The same page on the ISHAVASYAM.ORG host | Metadata already ISHAVASYAM.ORG; the visible page is shared with `/space` | Initiative branding | Visible text yes, by inheritance. Metadata no |
| `/space/cubesat` | CubeTwin | Print cover; overview; "Project Ownership & Responsibilities" heading and card; FAQ "Who is responsible for CubeTwin?"; author, creator, publisher; social card and alt text; JSON-LD publisher and creator (3) | Ownership | Yes |
| `/space/everyday-applications` | Space Applications for Everyday India | Closing note; sources disclaimer; title; author, creator, publisher; social card and alt text; JSON-LD publisher | Ownership | Yes |
| `/space/model-rocketry` | Model Rocketry (interactive learning) | Closing note; competitions disclaimer; author, creator, publisher; social card and alt text; JSON-LD publisher | Ownership | Yes |
| `/space/2026-INSPACe-ROCKETRY-059` | Model Rocketry Workshop Learning Guide 2026 | "Prepared by EV Society / EV.ENGINEER" (4); title; author, creator, publisher; social card | Historical attribution | **No, preserved** |
| `/space/satellite-engineering` | Satellite Engineering course | Provider note; publisher; JSON-LD publisher | Ownership | Yes |
| `/space/satellite-engineering/interactive-3d` | Satellite Explorer 3D | Author, creator, publisher; JSON-LD publisher and creator (2); shared header and footer on phones | Ownership | Yes |
| `/space/space-station` | Space Station research and simulator | None. Name written "Ishavasyam.org" | Brand spelling | Yes |
| `/space/rocket-engine-digital-twin` | Rocket Engine Digital Twin | None | – | No |
| `/space/rocket-engine-digital-twin-advanced` | Advanced Rocket Propulsion Digital Twin | None | – | No |

The sitemap lists these routes and carries no ownership text; it is unchanged.

## 4. Every "EV Society" occurrence, classified

232 at the start; 198 now. The total fell by less than the number changed because the tests that now assert EV Society's absence name it too.

| Class | Where | Count now | Action |
| --- | --- | --- | --- |
| 1. Current Space initiative branding | Space pages, shared header and footer, metadata, social cards, JSON-LD, CubeTwin content, `llms.txt` Space lines | 0 | **Changed**: 75 occurrences removed from 27 source files, and 5 from `llms.txt` |
| 2. Historical attribution | The 2026 workshop guide (11); workshop gallery data and page (21) | 32 | Preserved |
| 3. Legal or contractual wording | Two FAQ answers on `/space` (IP; commercial responsibility) | 0 | Changed to name ISHAVASYAM.ORG; flagged for confirmation, open item 3 |
| 4. Navigation or ecosystem | `/space` Join Community link and the one community sentence | 3 (one file) | Preserved, in a community role only |
| 5. Unrelated EV Society content | Trust Center (27); internships, AQIP and AegisCAN (19); `/aerospace` page (7); founder page and engagement models (4); the EV Society entity itself in the registry and node builders (12); `llms.txt` entity and AQIP lines (4) | 73 | Preserved |
| Tests | Assertions, most of them that EV Society is **absent** | 89 | Updated where they asserted the old ownership |

One comment in `src/app/ishavasyam-space/seo.ts` also contains the words, stating that the host must never name EV Society.

Two statements outside the Space section claimed that EV Society stewards Space, and were corrected: the EV Society entry of the entity registry (`src/data/public-entities.ts`) and the opening summary of `llms.txt`.

## 5. SEO, structured data and AI search

| Item | Before | After |
| --- | --- | --- |
| `/space` title | Spacecraft Health Management Mission 2040 \| EV Society | Spacecraft Health Management Mission 2040 \| ISHAVASYAM.ORG |
| `/space` description | Explore EV Society's Mission 2040 … | Explore ISHAVASYAM.ORG's Mission 2040 … |
| Everyday Applications title | … \| EV Society, UFlight & EV.ENGINEER | … \| ISHAVASYAM.ORG, UFlight & EV.ENGINEER |
| `author`, `creator`, `publisher` on six Space routes | EV Society | ISHAVASYAM.ORG |
| Social cards (Space, CubeTwin, Everyday Applications, Model Rocketry) | "An EV Society Initiative on EV.ENGINEER"; "EV SOCIETY™ · SPACE LEARNING LAB" | "An ISHAVASYAM.ORG Initiative on EV.ENGINEER"; "ISHAVASYAM.ORG · SPACE LEARNING LAB"; alt text to match |
| JSON-LD organisation | `Organization` "EV Society", `https://www.evsociety.org/#organization` | `Organization` "ISHAVASYAM.ORG", `https://ishavasyam.org/#organization`, the same `@id` Space Station already used |
| JSON-LD relations | `ResearchProject.parentOrganization`, `WebPage.publisher`, `creator` → EV Society | → ISHAVASYAM.ORG. No Space graph contains an EV Society node any more |
| Other JSON-LD (Course provider EV.ENGINEER, authors, FAQPage, BreadcrumbList, canonical URLs) | – | Unchanged |
| `llms.txt` | "EV Society's aerospace and space-engineering education initiative"; CubeTwin and Satellite Engineering described as EV Society's | Space, CubeTwin and Satellite Engineering described as ISHAVASYAM.ORG's; ISHAVASYAM.ORG added to the entity list; URLs unchanged |

Validation: every route's JSON-LD parses; every organisation, brand and website a Space graph points to is defined in that graph; no migrated route has "EV Society" in its `<head>` or JSON-LD. One thing was found and left alone because it predates this work and is not about ownership: the Everyday Applications and Model Rocketry graphs point at the site's Person node without repeating it.

## 6. One source for the wording

`src/data/space-initiative.ts` holds the brand, the URL, "An ISHAVASYAM.ORG Initiative", "Space · An ISHAVASYAM.ORG Initiative" and the long sentence. The name and URL come from a new `ISHAVASYAM` entry in the entity registry, `src/data/public-entities.ts`, and `ishavasyamOrgNode()` in `src/lib/structured-data/entities.ts` builds its JSON-LD node. Pages import these instead of typing the name. Social-card `alt` exports stay literal strings, as the framework's file convention shows them, and a test holds them to the same name.

## 7. Files changed (commit `73fad51`)

| Group | Files |
| --- | --- |
| New | `src/data/space-initiative.ts`, `src/app/space/initiative.test.ts` |
| Registry and structured data | `src/data/public-entities.ts`, `src/lib/structured-data/entities.ts`, `spaceGraph.ts` |
| `/space` | `SpaceLanding.tsx`, `spaceData.ts`, `layout.tsx`, `seo.ts`, `opengraph-image.tsx`, `components/SpaceHeader.tsx`, `components/SpaceFooter.tsx` |
| CubeTwin | `cubesat/page.tsx`, `cubesat/seo.ts`, `cubesat/opengraph-image.tsx`, `src/lib/cubetwin/content.ts` |
| Satellite Engineering | `satellite-engineering/page.tsx`, `seo.ts`, `interactive-3d/seo.ts` |
| Everyday Applications | `EverydayApplicationsContent.tsx`, `components/SpaceSystemsSources.tsx`, `seo.ts`, `opengraph-image.tsx` |
| Model Rocketry | `ModelRocketryContent.tsx`, `components/CompetitionExplorer.tsx`, `seo.ts`, `opengraph-image.tsx` |
| Space Station | `space-station/data/organisations.ts` |
| AI search and documents | `public/llms.txt`, `docs/ai-discoverability.md`, `docs/query-to-page-matrix.md` |
| Tests updated | `layout.test.ts`, `page.test.tsx`, `components/SpaceHeader.test.tsx`, `satellite-engineering/page.test.tsx` and `seo.test.tsx`, `space-station/page.test.tsx` and `seo.test.tsx`, `structured-data/entities.test.ts` and `spaceGraph.test.ts` |

The only change that is not wording: the shield icon in the `/space` hero badge no longer shrinks when the longer text wraps on a phone (`flexShrink: 0`).

## 8. Verification

| Check | Result |
| --- | --- |
| `npm test` | 1,651 passed, 1 failed. The failure is `satellite-explorer/ui/ui.test.tsx` › "offers EXPLODE…", which fails on every commit back to before this work and is unrelated |
| New guard, `src/app/space/initiative.test.ts`, 24 tests | Pass. It fails if any Space source file outside the 2026 guide names EV Society (other than the community link), if the brand is spelled any other way, if any Space route's publisher is not ISHAVASYAM.ORG, or if `llms.txt` reverts |
| Type-check; lint on changed files | Clean; one warning that was already there (`<img>` in `SpaceLanding.tsx`) |
| Production build | Succeeds |
| Rendered check, local build: 11 routes; 6 pages × 9 widths from 320 to 1920 px | All pass: status 200, JSON-LD parses, no ownership phrase, no page overflow, hero badge inside the viewport, header on one row with nothing outside it, no clipped footer text |
| The same check **against production**, after deployment | All pass. `space-ishavasyam-migration-review/rendered-routes-production.json` |
| Existing browser tests: CubeTwin (15), Satellite Explorer (21), Rocket Engine twin (16), Advanced twin server and integration (8) | All pass |

Visible "EV Society" on production now: 0 on every migrated route, 1 on `/space` (the community sentence), 5 on the 2026 workshop guide (preserved).

Screenshots: `space-ishavasyam-migration-review/` (`space-hero-320.png`, `space-hero-1340.png`, `space-footer-390.png`, `space-footer-1440.png`, `cubetwin-ownership-390.png`, `cubetwin-ownership-1440.png`).

## 9. Open items for the owner

These were decided one way so the work could be finished, and each is a one-line change if the decision should go the other way.

1. **Join Community** on `/space` still goes to `https://www.evsociety.org/join`, and the Ecosystem section says community membership is offered through EV Society. If the Space community is to have an ISHAVASYAM.ORG address, it needs that address; none exists in the repository.
2. **"Prepared by the ISHAVASYAM.ORG technical team"** on `/space`. Confirm that this is how the team should be named.
3. **Two FAQ answers with legal weight** now name ISHAVASYAM.ORG: who owns student and startup IP, and where commercial work belongs. The meaning is unchanged, but the named party in such a sentence is worth a second pair of eyes.
4. **The 2026 workshop guide** still says it was prepared by EV Society / EV.ENGINEER, and its title and social card say the same. Left as history. If that guide is to be presented as part of the ISHAVASYAM.ORG initiative, its title, metadata and four sentences change.
5. **The two rocket-engine Digital Twin pages** name no initiative owner at all. Adding "An ISHAVASYAM.ORG Initiative" to them would be a new statement, not a migration, so it was not added. Update, same day: the release gate for the advanced page asked for the hierarchy to be stated there, and one sentence was added to that page's attribution note (see `advanced-propulsion-twin-audit-report.md`, "Branding" and "Final step"; the page's structured data now names ISHAVASYAM.ORG as well). The Fundamentals page is unchanged.
6. **`/aerospace`** (not under `/space`) carries the badge "EV Society · Aerospace Research Platform" and EV Society links. It is a different page and was not in scope. The Space footer links to it.
7. **`aerospace.ishavasyam.org/space`** identifies the organisation in JSON-LD as `https://aerospace.ishavasyam.org/#organization`; the rest of the site now uses `https://ishavasyam.org/#organization`. Two ids for one organisation. Unchanged, because that host's metadata was already correct and was not part of this request.
8. **Search engines and link previews** will show the old title and description until they re-crawl. LinkedIn in particular caches the preview: re-scrape `/space` and `/space/cubesat` in its Post Inspector.
9. ISHAVASYAM.ORG's **legal form** is not recorded anywhere, because it is not published on the site. The registry says so.
