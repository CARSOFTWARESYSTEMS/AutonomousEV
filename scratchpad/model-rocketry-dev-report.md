# Model Rocketry Learning Experience — Development Report

**Route:** `/space/model-rocketry`
**Session date:** 2026-09-14
**Repo:** AutonomousEV · `main`

Phases B/C delivered on top of the previously shipped Phase A core page — Presentation Mode, Cost Anatomy, Enterprise/Startup Map, and a live-researched Competitions Explorer — plus a dedicated mobile-UI audit and fix pass across the full page.

| Check | Result |
|---|---|
| Lint | Clean |
| Tests | 402 / 402 passing |
| Build | Turbopack build OK (50/50 routes) |
| Mobile audit | 7 widths, all clean |

---

## 1. Scope of this round

Four features that were explicitly deferred out of the original Phase A build — because they either needed live research or were large enough to warrant their own review — were completed in this session, plus a requested mobile-responsiveness pass over the entire page.

### Presentation Mode *(new)*
A 16-slide, fullscreen workshop viewer reachable from a "Start Workshop" button in the hero. Keyboard (arrow keys, space, escape), touch swipe, a speaker-notes toggle, and a progress-dot rail.

### Cost Anatomy *(new)*
Four-tier cost breakdown (Fundamentals → Instrumented → Competition → Research) as a tab switcher. Deliberately carries no rupee figures — cost depends on scope, not a fixed number — with an explicit note explaining why.

### Enterprise / Startup Map *(new)*
A 9-stage maturity pathway (Learn → Startup) plus 13 clickable opportunity categories, each expanding into a problem / customer / prototype idea / validation-needed breakdown.

### Competitions Explorer *(new)*
7 real student competitions (India + international), each live-researched, sourced to an official listing, and dated. Paired with a Rocketry-vs-CanSat comparison card.

---

## 2. Mobile UI audit & fixes

Per the instruction to verify mobile UI properly, the full page was driven headlessly across seven viewport widths and checked for console errors, page errors, and horizontal overflow. Two real layout defects surfaced and were fixed; a third was a UI redundancy caught by a new test rather than the visual sweep.

| Issue found | Where | Fix applied |
|---|---|---|
| Level switcher clipped label text | 320–430px, hero | Flex children couldn't shrink below their text width. Switched `.levelSwitcher` to horizontal-scroll with `flex: 0 0 auto` tabs — matches the existing phase-rail pattern elsewhere on the page, so labels are always shown in full. |
| Rocket diagram oversized on tablet/desktop | 768–1400px, Rocket Explorer | Portrait SVG (400×800 viewBox) scaled unbounded, pushing fins/motor off-screen. Capped it at 300px via a new `.rocketDiagramSvg` class, centered the frame, and reordered the explorer's grid columns so the fixed-size diagram sits first. |
| Duplicate slide counter in Presentation Mode | All widths, presentation view | A new test asserting unique `"01 / 16"` text caught two renders of it — the top-bar counter and a redundant per-slide kicker. Removed the per-slide kicker and its unused CSS rule. |
| ResearcherCard left large empty space on wide screens | Desktop, 4 pages sharing the card | Flagged via a screenshot shared mid-session. Redesigned to a `space-between` layout: avatar + identity block on the left, a right-aligned pill "View full profile" button — degrades to a stacked, full-width card under 640px. |

Widths swept with a headless Playwright pass (console + pageerror listeners, `scrollWidth > innerWidth` overflow check):

`320px` · `360px` · `375px` · `390px` · `430px` · `768px` · `1400px`

---

## 3. Verification

| Check | Result |
|---|---|
| ESLint — session-touched files | 0 errors |
| Vitest — full suite | 402 / 402 pass |
| Vitest — test files | 48 / 48 pass |
| `next build` (Turbopack) | 50 / 50 routes generated |
| Console / page errors, all widths | 0 found |
| Horizontal overflow, all widths | 0 found |

---

## 4. Competitions data — sourcing

Each entry in the Competitions Explorer was researched live rather than drawn from training data, and carries its own official source link plus a `verifiedOn` date rendered on the page. Every card also states plainly that no affiliation, endorsement, or partnership with the listed organizers is claimed.

| Competition | Status as verified | Source |
|---|---|---|
| IN-SPACe Model Rocketry (India) | Upcoming — 2nd edition, finals Oct–Nov 2026, Kushinagar | inspace.gov.in |
| IN-SPACe CanSat (India) | Upcoming — 3rd edition, same cycle | inspace.gov.in |
| EuRoC | Upcoming — 7th edition, 15–21 Oct 2026, Portugal | euroc.pt |
| IREC | Completed — 2026 edition, mid-June, Spaceport Midland | esrarocket.org |
| AAS CanSat | Announced — 2027 edition, 10–13 June, Virginia | astronautical.org |
| German CanSat | Open — 13th edition, applications due 4 Oct 2026 | cansat.de |
| Korea CanSat | Next edition not yet verified | cansat.kaist.ac.kr |

`VERIFIED_ON = "2026-09-14"` in `competitionsData.ts` — re-check before relying on any date or status past this session.

---

## 5. File manifest

**New files**
- `components/CostAnatomy.tsx`
- `components/EnterpriseMap.tsx`
- `components/CompetitionExplorer.tsx`
- `components/RocketryVsCansat.tsx`
- `components/PresentationMode.tsx`
- `components/PresentationSlide.tsx`
- `components/ExperienceModeSwitcher.tsx`
- `competitionsData.ts`
- `presentationData.ts`

**Modified files**
- `ModelRocketryContent.tsx`
- `ModelRocketryContent.test.tsx`
- `components/AnchorNav.tsx`
- `components/RocketDiagram.tsx`
- `components/LaunchSequenceHero.tsx`
- `components/MissionWorkflow.tsx`
- `model-rocketry.module.css`
- `rocketData.ts`
- `src/components/ResearcherCard.tsx`
- `src/components/ResearcherCard.module.css`

*(all paths relative to `src/app/space/model-rocketry/` unless otherwise noted)*

---

## 6. Out of scope / known non-issues

- **Pre-existing lint errors** — `SyllabusSection.tsx` and `PrerequisitesSection.tsx` carry unrelated `no-explicit-any`/unused-import issues. Neither file was touched this session; left alone rather than fixed opportunistically.
- **Build-time notice** — Turbopack prints `z-index is currently not supported` twice during static generation. It's a lightningcss/Turbopack advisory, not a build failure — all 50 routes still generated correctly.

---

## 7. Status

All four deferred phases are shipped, tested, and mobile-verified. The dev server is left running at `localhost:3000` per the request to run locally. Nothing is committed — `git status` shows the new/modified files above as uncommitted working-tree changes, awaiting review before a commit.
