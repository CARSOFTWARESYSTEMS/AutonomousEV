# Query-to-Page Verification Matrix

Internal reference mapping representative search/AI-answer queries to their intended canonical
page, the direct visible answer on that page, supporting internal links, the structured-data
entity involved, and whether each claim is verified. See `docs/ai-discoverability.md` for the
entity model these pages' JSON-LD graphs draw from.

This matrix does not claim any query will actually surface this site in search or AI answers —
see the "Guarantees and limitations" section of `docs/ai-discoverability.md`.

| Query | Canonical page | Direct visible answer present? | Supporting internal links | Structured-data entity | Verified? | Notes / gaps |
|---|---|---|---|---|---|---|
| EV internships in Bangalore | `/internships` | Partial — address/location is on `/contact`, not repeated on `/internships` itself | `/internships` → `/contact` | `CollectionPage` (`internships#internship-program`) | Location verified only via `/contact`'s printed address | No explicit "Bangalore" claim added to `/internships` — would need a verified statement that internships are Bangalore-based, which is not printed there |
| EV battery internship Bangalore | `/internships/battery-cybersecurity`, `/internships/battery-pack-design` | Yes — programme content | `/internships` → programme cards | `CollectionPage` ItemList entries | Yes | — |
| Battery Management System internship India | `/internships` (Answer block: "What will I learn?") | Yes | `/internships` → `/internships/battery-pack-design` | `CollectionPage` ItemList | Yes | — |
| BMS cybersecurity internship | `/internships/battery-cybersecurity` | Yes | `/internships` card → page | `CollectionPage` ItemList entry | Yes | — |
| automotive cybersecurity internship India | `/internships/battery-cybersecurity`, `/design-development/passenger-taxi/battery-cybersecurity` | Yes | `/internships` → both cards | `CollectionPage` ItemList | Yes | Two distinct pages exist (EV battery vs eVTOL); both are legitimate, not duplicates (different platforms) |
| aerospace engineering internship India | `/space`, `/internships` (Space & Aerospace Engineering section) | Yes | `/internships` → `/space/2026-INSPACe-ROCKETRY-059` | `CollectionPage` ItemList + `/space`'s own `ResearchProject`/`WebPage` graph | Yes | `/space` itself carries "Planned"/"Proposed" status honestly — not all aerospace content is presented as active/hiring |
| space engineering internship India | `/space`, `/space/2026-INSPACe-ROCKETRY-059` | Yes | `/internships` → `/space/2026-INSPACe-ROCKETRY-059` | `LearningResource`/`WebPage` (rocketry), `ResearchProject` (`/space`) | Yes | — |
| model rocketry student project India | `/space/2026-INSPACe-ROCKETRY-059` | Yes | `/internships` → page; page → `/internships`, `/space` | `LearningResource`/`WebPage`, `BreadcrumbList` | Yes | — |
| model rocketry workshop guide | `/space/2026-INSPACe-ROCKETRY-059` | Yes — full seven-day guide | Source section → official IN-SPACe listing | `isBasedOn` → official workshop URL | Yes | Explicitly NOT an official IN-SPACe/ISRO publication — disclaimer is visible and in JSON-LD comments |
| EV.ENGINEER internships | `/internships` | Yes | Nav → `/internships`; Home → `/internships` | `CollectionPage` | Yes | — |
| how to apply for EV.ENGINEER internship | `/internships` (Answer block: "How do I apply?") | Yes | Apply button (Google Form), Submit Resume (mailto) | — (not modelled as `JobPosting` — no active job-like vacancy) | Yes | Deliberately no `JobPosting` schema, per spec §9 |
| who is Sudarshana Karkala | `/about/sudarshana-karkala` | Yes | Nav/Footer → profile; Home → profile | `Person` (`#person`), `ProfilePage` | Yes | — |
| Sudarshana Karkala EV.ENGINEER | `/about/sudarshana-karkala` | Yes | Profile → `/internships`, `/space`, `/si-ems` | `Person.affiliation` → EV.ENGINEER `Brand` node | Yes | — |
| contact EV.ENGINEER | `/contact` | Yes | Nav/Footer → `/contact`; Profile → `/contact` | `ContactPage`/`ContactPoint` | Yes | Only the exact email/phone printed on `/contact` are in JSON-LD |
| EV Society space initiative | `/space` | Yes | `/space` nav → evsociety.org (external); rocketry page attribution | `Organization` (`evsociety.org/#organization`) | Yes | EV Society kept as a plain `Organization`, no Section 8/CIN claim |

## How to keep this matrix current

When a new canonical page is added or an existing one's structured data changes materially, add or
update the relevant row here. This is a documentation artifact, not generated code — there is no
automated sync between this table and the JSON-LD graphs, so treat drift as a known risk and check
this file during future discoverability work.
