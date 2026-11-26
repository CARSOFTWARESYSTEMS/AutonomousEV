# Visual acceptance report

Reviewed by screenshots of the production build at 1440 × 900, 834 × 1194 and 390 × 844, plus WebKit. Before: [`screenshots/before/`](screenshots/before/). After: [`screenshots/after/`](screenshots/after/). This is the implementing team's own review; the EV.ENGINEER™ team's acceptance is still needed.

## Criteria

| Criterion (brief §32) | Verdict | Evidence |
|---|---|---|
| Realistic vehicle appearance | **Improved, acceptable for a representative car** | `desktop-03-approach.jpg`, `desktop-hero.jpg`: shoulder, glasshouse, pillars, seams, mirrors, light bars, multi-spoke wheels, interior through the glass. Still procedural: no panel-gap detail on the bonnet, simple bumpers. |
| Realistic charging-pad geometry | **Met** | `desktop-02-ground-pad-exploded.jpg`: eight layers in engineering order, winding from the model. |
| Detailed engineering components | **Met for the station** | cabinet internals (`desktop-08-resonance.jpg`), battery modules and busbars (`desktop-10-battery.jpg`), suspension and drive unit. |
| Correct component placement | **Met** | receiver 0.6 m ahead of centre at the true air gap; cabinet at the bay head with the cable trench to the pad's terminal box. |
| Natural vehicle motion | **Met** | arrival decelerates to a stop; wheels roll by distance; steering from the model in the autonomous scene. |
| Smooth camera transitions | **Met** | eased, distance-timed moves; hand-over to the visitor on first touch. |
| High-quality exploded assemblies | **Met (pads), partial (vehicle)** | pads clean; the vehicle assembly separates body, units and wheels but its layout is busy. |
| Clear scientific overlays | **Met** | field map with legend and units (`desktop-07-field.jpg`), alignment dimensions with k and M (`desktop-engineer-mode.jpg`), labelled energy flow. |
| Meaningful lighting | **Met** | studio-sky reflections, cool key, warm fill, canopy downlights; inspection views close into a dark studio. |
| Material quality | **Good** | clear-coat paint, glass, copper, ferrite, aluminium; asphalt and concrete are procedural. |
| Minimal visual clutter | **Met in Explore** | stage card, four instruments, caption, timeline. |
| Responsive viewport | **Met** | 79 % of the desktop, 85 % full screen; phone and tablet layouts reviewed. |
| Premium visual hierarchy | **Met** | the scene dominates; panels appear when asked for. |

## Problems found during review and fixed

| Problem | Fix |
|---|---|
| Close-up views framed a tyre instead of the pads (the old field and exploded shots) | Shots composed per view; the field shot picks the side whose line of sight clears the wheels (tested) |
| The canopy blocked close shots from above | The roof fades when it stands between a close camera and its subject |
| The receiver stage looked at the city through the slab | Low shot between the wheels; inspection studio backdrop |
| The foreign object was hidden by the receiver pad | Safety shot at eye level with the air gap (`desktop-11-safety.jpg` shows the can on the pad) |
| Instruments overlapped and wrapped labels | Fixed-width instrument cells, wrapping strip, room reserved for the stage card; moved below when the inputs drawer is open |
| Selecting a hidden part framed the outside of the car | Selection switches to a view where the part is visible |
| The vehicle exploded view and the X-ray energy view are busy | Accepted for now; candidates for refinement |

## Remaining visual work

- Bumper, bonnet and door detail; tyre sidewall text-free detail; a second body style for neighbouring cars.
- Photographic-quality asphalt and concrete (normal and roughness maps).
- The autonomous and infrastructure scenes still use their previous layouts with the new vehicle and lighting (Phases 5, 6).
- Human review on a range of real displays, including a phone held in the hand.

## Dynamic road (Phase 3)

| Criterion | Verdict | Evidence |
|---|---|---|
| Realistic road environment | **Met** | `road-01-roadside.jpg`: four lanes, New-Jersey median, guardrails, lamp posts, gantry, verge, trees |
| Vehicle motion from the model | **Met** | the road moves by the simulated distance; wheels roll by it |
| Embedded pads and their construction | **Met** | `road-02-cutaway.jpg`: modules, windings, feeders, duct bank, layer walls |
| Segment states visible and true to the controller | **Met** | `road-03-segments.jpg`: active pad under the receiver, interlock band, request window |
| Coupling made visible | **Met** | `road-04-coupling.jpg`: M and received power behind, coupling profile ahead |
| Three energy outcomes | **Met** | `road-06-gain.jpg`, `road-07-neutral.jpg`, `road-08-lose.jpg` |
| Failure shown | **Met** | `road-09-failed-segment.jpg`: missing peak in the coupling ahead |

Weaknesses still open on the road: the roadside camera's composition is plain, the trees are simple cones, the skyline repeats, and there is no field map on the road.
