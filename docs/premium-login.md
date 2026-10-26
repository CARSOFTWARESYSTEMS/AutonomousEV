# Premium login on the public sites

How this site asks visitors to sign in, what that does and does not protect,
and how to deploy and check it. Sign-in itself is Intern2026's
(`docs/auth/multi-domain-sso.md` in that repository); this site only starts it
and reads the result from `/api/auth/session`.

## 1. A login gate, not access control

> **Every page on this site is public.** A required-login page decides what the
> browser *shows*; its HTML, React Server Component payload and JavaScript can
> still be fetched without signing in, and any Google account can sign in.
> Use required-login only for content that may be public in principle —
> premium, not confidential.

Anything **genuinely protected** — confidential content, customer or programme
data, admin functions — must be authorized **on the server before the page or
data is delivered**, never by the route table. A server route or proxy calls
`https://<login host>/api/auth/app/<site host>/session` with the visitor's
`Cookie` header and serves only when all four hold:

| Check | From the session answer |
|---|---|
| authenticated | `authenticated === true` |
| active membership | `roles` is not empty |
| correct domain/partner | `domain` equals this site's hostname |
| required role/permission | `roles` contains a role this route allows |

**Authentication alone is never authorization.** A visitor who signed in with
no membership (`roles: []`, shown to Admins as *Authenticated · No
Membership*) may see premium pages and must get no protected functionality.
This site has no such server routes today.

## 2. Which pages ask for a sign-in

One table: [`src/config/premiumAuthRoutes.ts`](../src/config/premiumAuthRoutes.ts).

| `access` | Behaviour |
|---|---|
| `public` | Browse freely; the sign-in prompt never opens. |
| `optional-login` (every page not listed) | Browse freely; after five anonymous minutes the optional prompt offers **Login** or **Continue Browsing**, at most once a day. |
| `required-login` | The full page is for signed-in visitors; signed-out visitors get a login card (Login only) immediately. Login returns to the exact URL, query and `#hash` included. |

Paths match exactly. An address that serves the same page through a rewrite
must be listed too: `/workshop` is `/internships` (`next.config.ts`), so both
are listed — otherwise the second address would be a way round.

## 3. Search engines: public previews

A required-login page with `publicPreview: true` stays indexable. Signed-out
visitors and the server render that crawlers read get the page's **preview**
in place of the full experience:

- the page's own SEO title as its `<h1>` and its meta description,
- its JSON-LD, unchanged, plus the topics that JSON-LD `teaches`,
- for `/internships`, every programme track with its link
  (`PROGRAMME_TRACKS`, the same list its JSON-LD carries),
- the section header and breadcrumb, so navigation and internal links remain,
- the login card.

The page wraps its full experience in `<PremiumContent preview={<PremiumPreview …/>}>`;
a test fails if a route claims a preview its page does not render. All eleven
required-login routes have previews. A future page that must stay entirely
non-public can leave `publicPreview` off: the root layout's gate then replaces
the whole page with the login card (nothing indexable).

To add a premium page: list it in the table with `publicPreview: true`, then
in its `page.tsx` rename the default export to an inner component and export a
new default that wraps it — copy any of the eleven existing pages.

## 4. Analytics (Google Analytics)

Events carry `site`, `hostname`, `page_path`, `page_label` and `trigger` —
never a name, email, role, token or session id.

| Event | When | Replaces |
|---|---|---|
| `premium_login_prompt_shown` | Optional prompt opened | `login_prompt_shown` |
| `premium_login_prompt_login` | Login in the optional prompt | `login_prompt_login_click` |
| `premium_login_prompt_continue` | Prompt dismissed; `method` = `continue`, `close`, `escape` or `backdrop` | `login_prompt_dismissed` |
| `premium_route_gate_shown` | Login card shown on a required-login page | — |
| `premium_route_login_started` | Login on a required-login page | — |
| `premium_route_login_success` | Back from that sign-in, signed in | — |
| `login_header_click`, `login_success_return`, `workspace_open` | Unchanged | — |

`trigger` values changed from `header` / `prompt` / `timer` to
`header_login` / `five_minute_prompt` / `premium_route_required`. GA reports,
explorations, audiences or conversions built on the old names or values must
be updated in GA itself (nothing in this repository references them). The new
names went live with commit `ef2bbec`.

## 5. Before and after deployment

Order: **Firestore rules → Intern2026 → verify → this site.** Intern2026's
checklist (its `docs/auth/multi-domain-sso.md`) covers the first three; then:

- [ ] **Exact return:** in a private window, open
      `https://autonomous.ev.engineer/space/cubesat?mode=advanced#energy`, Login,
      sign in: you land on exactly that URL and the page scrolls to `#energy`.
      Repeat on `aerospace.ev.engineer`, `aerospace.gamyaa.in` (signs in at
      `login.gamyaa.in`) and `cybersecurity.uflight.in` (at `login.uflight.in`).
- [ ] **Previews:** signed out, each required-login page shows its title,
      description, topics and Login only (no Continue Browsing). View source
      contains the `<h1>`, description and `application/ld+json`.
- [ ] **`/internships` and `/workshop`:** both show the preview with every
      programme track; signed in, both show the full page.
- [ ] **Optional prompt:** on an ordinary page (e.g. `/space`), stay signed out
      for five minutes: the prompt opens once with Login and Continue Browsing;
      Continue Browsing keeps it away for a day.
- [ ] **No membership:** sign in with a Google account that has no membership:
      premium pages open, `/api/auth/session` shows `roles: []`, and the
      dashboard's Users page lists the account as *Authenticated · No Membership*.
- [ ] **Phones:** repeat the exact-return and prompt checks on iOS Safari and
      Android Chrome (bottom-sheet prompt, Login returning to the page).
- [ ] **Search Console:** URL Inspection → *Test live URL* on `/internships`
      and two Space pages: the rendered HTML shows the preview; request indexing.

## 6. Code

| File | Role |
|---|---|
| `src/config/premiumAuthRoutes.ts` | The route table and the security-boundary note |
| `src/components/auth/PremiumContent.tsx` | A page's boundary: preview while locked, full page once signed in |
| `src/components/auth/PremiumPreview.tsx` | The server-rendered public preview |
| `src/components/auth/PremiumLoginCard.tsx` | The login card in every session state |
| `src/components/auth/PremiumRouteGate.tsx` | Root-layout fallback gate; the shared lock hook |
| `src/components/auth/LoginPrompt.tsx` | The optional five-minute prompt |
| `src/lib/auth/sites.ts`, `loginContext.ts` | Login host per site; trigger and page label sent with Login |
