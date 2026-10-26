# Known test failures

Failures in `npm test` that are not caused by recent work. Fix or remove an
entry when its test is fixed.

## Satellite Explorer: `offers EXPLODE, a 0–100 scrubber and X-RAY`

`src/components/satellite-explorer/ui/ui.test.tsx` → *explore controls*.

Fails on a clean checkout of `e290798` (25 Oct 2026) as well as later commits:
the test expects the EXPLODE control to carry
`data-track-event="exploded_view_open"`, and the rendered control does not.
Either the attribute was dropped from the component or the test is stale —
not investigated. Unrelated to sign-in.

## Load-sensitive timeouts (pass when run alone)

These finish just under or over Vitest's 5-second default when the whole
suite runs in parallel on a busy machine, and pass when their files run alone
(checked 25 Oct 2026, also on `e290798`):

- `src/app/internships/ev-battery-health-diagnostics-toolkit/page.test.tsx` →
  *Real Vehicle Diagnosis › starts empty, gates on the safety screen, and keeps job-card data out of analytics*
- `src/app/internships/ev-battery-health-diagnostics-toolkit/release.test.tsx` →
  *analytics privacy with the site-wide click listener › never sends registration numbers, …*
- `src/app/space/space-station/page.test.tsx` →
  *renders one H1 with the hero copy and both CTAs* (occasionally)

A longer per-test timeout on these files would make them dependable.
