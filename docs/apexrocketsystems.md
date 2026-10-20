# APEX Rocket Systems microsite

A standalone concept site for APEX Rocket Systems — from its engineering collaboration with Gamyaa AeroSystems — served at
`https://aerospace.gamyaa.in/space/partners/apexrocketsystems` and built to move to APEX's own host with configuration alone.

## Where things are

| Path | What it holds |
|---|---|
| `src/app/space/partners/apexrocketsystems/` | Route files only: `layout.tsx` (shell, metadata, viewport), one `page.tsx` per route, `icon.png`, `apple-icon.png`. |
| `src/components/apex/` | Everything the pages render. `pages/*.tsx` are the page bodies; the rest are sections, diagrams, the header, footer, detail panel, theme and analytics helpers. |
| `src/data/apex/` | All content and facts, as data. Nothing about APEX is written only in JSX. |
| `public/apexrocketsystems/original/` | The photographs and logos exactly as supplied. Never edited. |
| `public/apexrocketsystems/{hardware,brand,hero}/` | Optimised AVIF/WebP/JPEG and logo files made by `node scripts/apex-images.mjs` (`… brand` skips the slow photo step). |
| `src/app/space/components/PartnersEcosystem.tsx` | The APEX card in the /space "Learn by building mission-ready thinking" grid and the Partners & Engineering Ecosystem section. Shown on /space only, not on the aerospace.ishavasyam.org route. |

Routes: `/`, `/company`, `/engine`, `/system`, `/build-validate`, `/digital-twin`, `/ecosystem`, `/roadmap` (all under the base path).

The homepage is an executive narrative in seven sections (`HomeNarrative.tsx`, `HomeSystem.tsx`, `HomeEcosystem.tsx`): hero, Built at APEX, the hardware, an engine is the beginning (six domains), build/model/test/correlate, the ecosystem, and the final call to action. Depth lives on the other pages: the eighteen domains in six groups and the interface matrix on System; the thirteen-step lifecycle and the closed loop on Build & Validate; the predicted-vs-measured chart on Digital Twin; the timeline, investor view and business model canvas on Roadmap; the capability finder, equation and all forty capabilities on Ecosystem; partnership contacts, founders and the collaboration form on Company.

The masthead is one band: the full logo (never reduced on laptops), Company first among six links, Roadmap under "More", and the official site. The links show inline from 1360px; narrower screens use the menu.

## Data files

| File | Change it when |
|---|---|
| `site.ts` | The host, base path, official site or parent portal changes. |
| `evidence.ts` | APEX publishes or confirms a claim. Only `approvedWording` reaches the page, and only when `publish` is true. |
| `partners.ts`, `capabilities.ts`, `partner-capabilities.ts` | A partner or capability is added, or a relationship changes. Partners are linked to capabilities only in `partner-capabilities.ts`; a capability's status is derived, never typed. Gamyaa AeroSystems is `ENGINEERING_COLLABORATION` (partner) and `COLLABORATION` (capabilities); every other partner is proposed. Set `relationshipStatus: "CONFIRMED"` only when an agreement exists. |
| `roadmap.ts` | APEX confirms a date: set `dateOrPeriod` (`"2027"` or `"2027 Q2"`) and `ownerConfirmed: true`. |
| `founders.ts` | APEX supplies titles, portraits or profiles. |
| `contacts.ts` | A contact changes. Holds APEX's contact and that of Gamyaa AeroSystems, APEX's engineering-collaboration partner. Every email link is addressed to both, in To (`mailto()`); addresses and the telephone number are stored in parts and joined in the browser. |
| `images.ts` | A photograph is added or its caption confirmed. Add the original to `original/`, list its widths, run the image script. |
| `system.ts`, `lifecycle.ts`, `validation.ts`, `business.ts` | System domains, lifecycle stages, test strategy, investor and business content. |
| `analytics.ts` | A new event is reported. Every `apex_*` event must be declared here (a test checks). |

## Moving to APEX's own server

1. Copy `src/components/apex/`, `src/data/apex/`, `public/apexrocketsystems/` and `scripts/apex-images.mjs`.
2. Put the route files at the new app's root: `layout.tsx`, `page.tsx`, the seven route folders, `icon.png`, `apple-icon.png`.
3. Build with:

   ```
   NEXT_PUBLIC_APEX_BASE_PATH=/
   NEXT_PUBLIC_APEX_SITE_URL=https://www.apexrocketsystems.com
   NEXT_PUBLIC_APEX_ASSET_PATH=/apexrocketsystems
   NEXT_PUBLIC_APEX_PARENT_PORTAL=none
   ```

   Links, canonical URLs, Open Graph, breadcrumbs, the sitemap entries and the JSON-LD all follow. A test checks that no file other than `site.ts` writes the base path.
4. The pages need a root layout providing `<html lang>`, `<body>` and, for analytics, the site's `GoogleAnalytics` component (or another `window.gtag`). Events carry `site_namespace: "apex"`, so they can be split out of a shared property or moved to APEX's own.
5. Update `APEX_CONCEPT_HOST` in `site.ts` (the Gamyaa AeroSystems link in the collaboration statement, and the JSON-LD publisher) if someone other than Gamyaa AeroSystems then publishes the site.

## Collaboration wording

APEX Rocket Systems and Gamyaa AeroSystems are in an engineering collaboration. The full statement (`APEX_SITE.collaborationStatement` in `site.ts`, rendered by `CollaborationStatement.tsx`) sits in the footer and at the foot of the Company page, with links to both organisations; the homepage hero carries only the short form (`APEX_SITE.collaboration`). Never describe the APEX–Gamyaa relationship as merely proposed, and never as a joint venture, alliance, acquisition or exclusive partnership unless that is confirmed. Every other organisation stays a proposed capability partner until confirmed. A test scans the APEX sources for the old wording.

## Theme

Dark is the default. A small switch in the footer and the phone menu, labelled with the theme it switches to ("Light theme" / "Dark theme"), changes between dark and the light (paper) theme; the choice is kept in `localStorage` (`apex-theme`) and applied before first paint. Colours are tokens in `apex.module.css` (`--apex-bg`, `--apex-surface`, `--apex-text*`, `--apex-accent`, `--apex-gap`, `--apex-mark`, chart colours). The masthead, footer, home hero and photo viewer keep dark tokens in both themes (`.forceDark`).

## Checks

- `npx vitest run src/data/apex src/components/apex src/app/space src/app/ishavasyam-space` — data integrity, partner rules (iTelematics only Cybersecurity and AI; Gamyaa never those), claim safety on every rendered page, image files, portability, analytics declarations, the contact composer.
- `npx next build && npx next start -p 3100`, then `node scripts/test-apex.cjs` (or `APEX_ENGINES=webkit …`) — Chromium, WebKit and Firefox at 320–1920 px in both themes: overflow, clipped text, WCAG contrast, console errors, panels, gallery, menu, keyboard, reduced motion, analytics events, email protection.

## Waiting on APEX

- Whether each photograph shows the 5 kN-class demonstrator, and each caption (`images.ts`). A higher-resolution original of `8.png`.
- The basis of the specific impulse and restart capability listed on APEX's Hardware page — measured or design target. Held back until confirmed (`evidence.ts`).
- Engine test evidence of any kind (cold-flow, hot-fire, durations) — none is shown.
- Founders' titles, portraits and, for Arcchit Gopaal, a profile link.
- Roadmap dates and the next evidence milestone.
- Which of the other proposed partner relationships (iFab, iTelematics, EV Society), if any, are agreed.
- Digital Twin maturity level and any review gates completed.
