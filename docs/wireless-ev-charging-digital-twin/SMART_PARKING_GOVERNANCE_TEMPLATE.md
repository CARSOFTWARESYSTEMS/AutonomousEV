# Smart Parking — research governance and IP record (template)

**This is a blank template (SP-S06).** It holds no names, contact details, agreements, funding figures or confidential decisions, and the public application does not read it.

Keep the completed record **outside this repository**, in the EV.ENGINEER™ team's access-controlled document store, and restrict it to the people the agreements name. Replace each `<…>` there, never here.

## 1. Programme record

| Field | Entry |
|---|---|
| Programme reference | `<internal reference>` |
| Governing agreement(s) | `<agreement titles and dates — kept in the private store>` |
| Parties and roles | `<party> — <role>` (one row per party) |
| Programme owner | `<role, not a personal contact in any public file>` |
| Approved budget ceilings | `<POC ceiling>`; `<pilot ceiling, if approved>` |
| Approval references | `<decision record ids>` |
| Start date and duration | `<date>`; `<months>` |

## 2. Decision log

| Date | Decision | Made by (role) | Basis | Record id |
|---|---|---|---|---|
| `<yyyy-mm-dd>` | `<decision>` | `<role>` | `<document or meeting reference>` | `<id>` |

Decisions that must be logged here:

- procurement above any line of the POC BOM;
- any spend beyond the approved ceiling;
- energising any physical test;
- connecting hardware to the twin (enabling a LIVE mode);
- publishing results;
- filing or disclosing any invention.

## 3. Intellectual property register

| Item | Type (software, design, data, know-how, invention) | Created by (role) | Date | Background or foreground | Ownership and licence under the agreements | Disclosure status |
|---|---|---|---|---|---|---|
| `<item>` | `<type>` | `<role>` | `<date>` | `<background / foreground>` | `<per agreement clause>` | `<not disclosed / disclosed on date / filed>` |

Rules:

- Record every new item before any publication, presentation or open-source release.
- Third-party components keep their own licences, recorded in ASSET_LICENSES.md (public) and in this register.
- Potential inventions are assessed under the applicable agreements before disclosure. The public application and documents never describe an unfiled invention.

## 4. Publications and disclosures

| Planned output | Venue type | Content summary | IP review date | Approval record | Status |
|---|---|---|---|---|---|
| `<output>` | `<journal / conference / report>` | `<summary>` | `<date>` | `<id>` | `<planned / submitted / accepted / declined>` |

Publication acceptance is never assumed in any plan.

## 5. Data governance

| Dataset | Contents | Personal data? | Legal basis or consent record | Storage location | Retention | Access list (roles) |
|---|---|---|---|---|---|---|
| `<dataset>` | `<description>` | `<yes / no>` | `<reference>` | `<store>` | `<period>` | `<roles>` |

## 6. Risk register (governance)

| Risk | Likelihood | Impact | Owner (role) | Mitigation | Status |
|---|---|---|---|---|---|
| Budget exceeds the approved ceiling | `<L/M/H>` | `<L/M/H>` | `<role>` | Quotations before purchase; contingency; approval gate | `<open / closed>` |
| Premature disclosure of an invention | | | | IP review before every publication | |
| Personal data collected unintentionally | | | | Synthetic plates only; no image retention; review of every dataset | |
| A safety incident during physical tests | | | | Hazard review; named responsible person; emergency stop | |

## 7. Reviews

| Review | Interval | Participants (roles) | Last held | Next |
|---|---|---|---|---|
| Programme progress against the 24-month plan | Monthly | `<roles>` | `<date>` | `<date>` |
| IP and publication review | Before each disclosure | `<roles>` | | |
| Data-protection review | Quarterly | `<roles>` | | |
| Safety review | Before each physical test phase | `<roles>` | | |
